/* WE HELP — js/map.js
   Interactive map (Leaflet + OpenStreetMap) on the Contact page.
   Locations are loaded from data/locations.json. "Show my location" uses the
   browser's geolocation to place the visitor on the map and work out the
   distance to the nearest WE HELP location. The position stays in the browser. */
(function () {
    'use strict';

    var mapEl = document.getElementById('map');
    if (!mapEl || !window.L) { return; }

    var statusEl = document.getElementById('map-status');
    var locateBtn = document.getElementById('locate-btn');
    var FALLBACK = [{ name: 'WE HELP, Johannesburg', lat: -26.2041, lng: 28.0473,
                      description: 'Sample location (city centre pin). Replace with the real address before launch.', phone: '072 055 37 17' }];

    function popupFor(loc) {
        var box = document.createElement('div');
        var name = document.createElement('strong');
        name.textContent = loc.name;
        var desc = document.createElement('p');
        desc.textContent = loc.description;
        var tel = document.createElement('a');
        tel.href = 'tel:' + loc.phone.replace(/\s/g, '');
        tel.textContent = loc.phone;
        var dir = document.createElement('a');
        dir.href = 'https://www.openstreetmap.org/directions?to=' + loc.lat + '%2C' + loc.lng;
        dir.target = '_blank';
        dir.rel = 'noopener noreferrer';
        dir.textContent = 'Get directions';
        [name, desc, tel, document.createTextNode(' · '), dir].forEach(function (n) { box.appendChild(n); });
        return box;
    }

    function km(a, b) {                                   // great-circle distance (haversine)
        var rad = Math.PI / 180, R = 6371;
        var dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
        var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return 2 * R * Math.asin(Math.sqrt(h));
    }

    function init(locations) {
        var map = L.map(mapEl, { scrollWheelZoom: false }).setView([locations[0].lat, locations[0].lng], 12);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        locations.forEach(function (loc, i) {
            var marker = L.marker([loc.lat, loc.lng], { title: loc.name, alt: loc.name }).addTo(map).bindPopup(popupFor(loc));
            if (i === 0) { marker.openPopup(); }
        });
        if (locations.length > 1) {
            map.fitBounds(L.latLngBounds(locations.map(function (l) { return [l.lat, l.lng]; })), { padding: [40, 40] });
        }
        map.once('focus', function () { map.scrollWheelZoom.enable(); });   // wheel zoom only after the map is clicked

        var youMarker = null;
        locateBtn.addEventListener('click', function () {
            if (!navigator.geolocation) { statusEl.textContent = 'Your browser does not support location.'; return; }
            statusEl.textContent = 'Finding your location…';
            navigator.geolocation.getCurrentPosition(function (pos) {
                var me = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                var nearest = locations.map(function (l) { return { loc: l, d: km(me, l) }; }).sort(function (a, b) { return a.d - b.d; })[0];
                if (youMarker) { map.removeLayer(youMarker); }
                youMarker = L.circleMarker([me.lat, me.lng], { radius: 9, color: '#5B3E96', fillColor: '#E8927C', fillOpacity: 0.9 })
                    .addTo(map).bindPopup('You are here');
                map.fitBounds(L.latLngBounds([[me.lat, me.lng], [nearest.loc.lat, nearest.loc.lng]]), { padding: [50, 50], maxZoom: 14 });
                statusEl.textContent = 'You are about ' + Math.round(nearest.d) + ' km from ' + nearest.loc.name +
                    '. Your location stays in your browser and is not sent anywhere.';
            }, function (err) {
                statusEl.textContent = err.code === 1
                    ? 'Location permission was denied. You can still use the map above.'
                    : 'We could not find your location. Please try again.';
            }, { timeout: 10000, maximumAge: 60000 });
        });
    }

    fetch('data/locations.json')
        .then(function (r) { if (!r.ok) { throw new Error(r.status); } return r.json(); })
        .catch(function () { return FALLBACK; })
        .then(init);
})();
