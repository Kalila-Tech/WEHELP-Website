/* WE HELP — js/enquiry.js
   Enquiry form: validates the input, loads the response rules with AJAX
   (data/enquiry.json), optionally posts the enquiry to the form's action URL
   with fetch(), and shows a response about cost and availability without
   reloading the page. */
(function () {
    'use strict';

    var form = document.getElementById('enquiry-form');
    var V = window.WEHELP;
    if (!form || !V) { return; }

    var el = function (id) { return document.getElementById(id); };
    var status = el('enquiry-status');
    var panel = el('enquiry-response');
    var submit = el('e-submit');
    var typeSel = el('e-type');
    var dateInput = el('e-date');
    var conditionals = Array.prototype.slice.call(form.querySelectorAll('.conditional'));
    var endpointReady = !/YOUR_FORM_ID/.test(form.getAttribute('action'));   // false until a real form endpoint is added
    var recipient = form.getAttribute('data-recipient');

    // Used only if data/enquiry.json cannot be loaded (for example, opened from disk).
    var FALLBACK = {
        _fallback: true,
        title: 'Your enquiry',
        cost: 'Contacting WE HELP does not require a diagnosis, and no problem is too small.',
        availability: 'Our text line and hotline are available 24 hours a day, 7 days a week.',
        steps: ['A member of our team will contact you on your preferred date.', 'If you need help right now, call 072 055 37 17 or 112.']
    };

    V.attach(form);
    V.counter(el('e-message'), el('e-message-count'));

    // The date picker only offers today and the next 90 days.
    dateInput.min = V.dates.iso(V.dates.today());
    dateInput.max = V.dates.iso(V.dates.plusDays(90));

    // Show the extra field that matches the enquiry type.
    function syncConditionals() {
        conditionals.forEach(function (box) {
            var on = box.getAttribute('data-for') === typeSel.value;
            box.hidden = !on;
            var input = box.querySelector('input');
            input.required = on;
            if (!on) { input.value = ''; V.showError(input, ''); }
        });
    }
    typeSel.addEventListener('change', syncConditionals);
    syncConditionals();

    /* ---------- helpers ---------- */
    function fill(text, vars) {
        return text.replace(/\{\{(\w+)\}\}/g, function (_, k) { return vars[k] !== undefined ? vars[k] : ''; });
    }
    function rand(n) { return Math.floor(Math.random() * n); }
    function reference() {
        return 'WH-' + V.dates.iso(new Date()).replace(/-/g, '') + '-' + String(1000 + rand(9000));
    }
    function longDate(d) {
        return d.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
    function nextSession(daysAway) {                // the first Saturday at least `daysAway` days from today
        var d = V.dates.plusDays(daysAway);
        while (d.getDay() !== 6) { d.setDate(d.getDate() + 1); }
        return d;
    }
    function oneLine(s) { return String(s).replace(/[\r\n]+/g, ' ').trim(); }   // no line breaks in the subject (header injection)
    var typeLabels = { volunteer: 'Volunteering', sponsor: 'Sponsorship', therapy: 'Therapy referral', info: 'Text line and hotline' };

    /* Compiles the enquiry into an email the visitor can send from their own email app. */
    function mailtoFor(data) {
        var lines = ['Hello WE HELP team,', '', data.message, '', '—',
            'Reference: ' + data.ref, 'Enquiry type: ' + typeLabels[data.type],
            'Name: ' + oneLine(data.name), 'Email: ' + oneLine(data.email), 'Phone: ' + data.phone];
        if (data.type === 'volunteer') { lines.push('Hours a week: ' + data.hours); }
        if (data.type === 'sponsor') { lines.push('Monthly pledge: R' + data.amount); }
        lines.push('Preferred contact: ' + data.date + ', ' + oneLine(data.time));
        return 'mailto:' + recipient + '?subject=' + encodeURIComponent('[Enquiry ' + data.ref + '] ' + typeLabels[data.type] + ' from ' + oneLine(data.name)) +
               '&body=' + encodeURIComponent(lines.join('\n'));
    }

    function node(tag, text, cls) {
        var n = document.createElement(tag);
        if (text !== undefined) { n.textContent = text; }
        if (cls) { n.className = cls; }
        return n;
    }

    /* ---------- build the response from the rules ---------- */
    function buildResponse(rules, data) {
        var info = rules[data.type] || FALLBACK;
        var vars = {};
        var extras = [];

        if (data.type === 'volunteer' && !info._fallback) {
            vars.nextSession = longDate(nextSession(14));
            var perMonth = Math.max(1, Math.floor(data.hours * 52 / 12 / info.shiftHours));
            extras.push(['Your time', data.hours + (data.hours === 1 ? ' hour' : ' hours') + ' a week is about ' + perMonth + ' shift' +
                         (perMonth === 1 ? '' : 's') + ' of ' + info.shiftHours + ' hours a month.']);
        }
        if (data.type === 'sponsor' && !info._fallback) {
            vars.amount = data.amount.toLocaleString('en-ZA');
            vars.yearly = (data.amount * 12).toLocaleString('en-ZA');
            var tier = info.tiers.filter(function (t) { return data.amount >= t.min; }).pop();
            if (tier) { extras.push(['Your level', tier.name + ': ' + tier.text]); }
        }

        panel.textContent = '';
        panel.appendChild(node('h2', 'Thank you, ' + data.name.split(' ')[0] + '.'));
        panel.appendChild(node('p', 'Reference ' + data.ref + ' · ' + info.title, 'ref'));

        var dl = node('dl');
        [['Cost', fill(info.cost, vars)], ['Availability', fill(info.availability, vars)]].concat(extras).forEach(function (row) {
            dl.appendChild(node('dt', row[0]));
            dl.appendChild(node('dd', row[1]));
        });
        dl.appendChild(node('dt', 'When we will contact you'));
        dl.appendChild(node('dd', longDate(new Date(data.date + 'T00:00:00')) + ', ' + data.time + ', on ' + data.phone + '.'));
        panel.appendChild(dl);

        panel.appendChild(node('p', 'What happens next', 'ref'));
        var ol = document.createElement('ol');
        info.steps.forEach(function (s) { ol.appendChild(node('li', s)); });
        panel.appendChild(ol);

        if (!endpointReady) {
            // No form service is connected, so the visitor sends the compiled enquiry by email.
            panel.appendChild(node('p', 'Your enquiry has not been sent to the WE HELP team yet. Choose “Email this enquiry” to send it from your email app.', 'demo-note'));
            var mail = node('a', 'Email this enquiry', 'btn');
            mail.href = mailtoFor(data);
            panel.appendChild(mail);
            panel.appendChild(document.createTextNode(' '));
        }

        var again = node('button', 'Make another enquiry', 'btn btn--ghost');
        again.type = 'button';
        again.addEventListener('click', function () {
            panel.hidden = true;
            form.reset();
            syncConditionals();
            status.textContent = '';
            V.counter(el('e-message'), el('e-message-count'));
            typeSel.focus();
        });
        panel.appendChild(again);
        panel.hidden = false;
        panel.focus();
        panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    function showFailure() {
        panel.textContent = '';
        panel.appendChild(node('h2', 'We could not send your enquiry'));
        panel.appendChild(node('p', 'Something went wrong on our side or your connection. Please try again, or call 072 055 37 17 or email support@wehelp.org.', 'error-note'));
        panel.hidden = false;
        panel.focus();
    }

    /* ---------- submit ---------- */
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (form.elements.website.value) { return; }              // honeypot
        var res = V.validateForm(form);
        if (!res.valid) {
            status.textContent = 'Please fix the ' + res.count + ' highlighted field' + (res.count > 1 ? 's' : '') + ' and try again.';
            status.classList.add('error');
            res.first.focus();
            return;
        }
        status.classList.remove('error');
        status.textContent = 'Sending your enquiry…';
        submit.disabled = true;
        panel.hidden = true;

        var f = form.elements;
        var data = {
            name: f.name.value.trim(), email: f.email.value.trim(), phone: V.cleanPhone(f.phone.value),
            type: f.type.value, hours: Number(f.hours.value), amount: Number(f.amount.value),
            date: f.date.value, time: f.time.value, message: f.message.value.trim(), ref: reference()
        };

        // 1. AJAX: load the response rules.
        var rulesReq = fetch('data/enquiry.json').then(function (r) {
            if (!r.ok) { throw new Error('rules'); }
            return r.json();
        }).catch(function () { return {}; });                      // falls back to generic wording

        // 2. AJAX: send the enquiry to the form's action URL (only when an endpoint has been set up).
        var sendReq = endpointReady
            ? fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
                .then(function (r) { if (!r.ok) { throw new Error('send'); } })
            : Promise.resolve();

        Promise.all([rulesReq, sendReq]).then(function (out) {
            status.textContent = 'Enquiry received.';
            buildResponse(out[0], data);
        }).catch(function () {
            status.textContent = '';
            showFailure();
        }).then(function () {
            submit.disabled = false;
        });
    });
})();
