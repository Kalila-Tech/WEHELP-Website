/* WE HELP — js/main.js
   Loaded on every page: header height, mobile menu, "Need help now?" dialog,
   back-to-top button, site-wide search, scroll animations and share links. */
(function () {
    'use strict';

    var $ = function (sel, root) { return (root || document).querySelector(sel); };
    var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Sticky header height ----------
       The menu bar sticks just below the header, so CSS needs the header's
       real height (it changes when the header wraps on small screens). */
    var header = $('header');

    function setHeaderHeight() {
        document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
    }

    window.addEventListener('resize', setHeaderHeight);
    setHeaderHeight();

    /* ---------- Mobile menu ---------- */
    var toggle = $('.nav-toggle');
    var navList = $('#main-nav');

    function setMenu(open) {
        navList.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        $('i', toggle).className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    }

    toggle.addEventListener('click', function () { setMenu(!navList.classList.contains('open')); });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navList.classList.contains('open')) { setMenu(false); toggle.focus(); }
    });

    /* ---------- "Need help now?" dialog ---------- */
    var helpDialog = $('#help-dialog');
    var lastFocus = null;

    function openDialog(dlg) {
        lastFocus = document.activeElement;
        if (typeof dlg.showModal === 'function') { dlg.showModal(); } else { dlg.setAttribute('open', ''); }
        document.body.classList.add('dialog-open');
    }

    function closeDialog(dlg) {
        if (typeof dlg.close === 'function') { dlg.close(); } else { dlg.removeAttribute('open'); }
    }

    if (helpDialog) {
        $$('[data-open-help]').forEach(function (btn) {
            btn.addEventListener('click', function () { openDialog(helpDialog); });
        });
        $$('[data-close-dialog]', helpDialog).forEach(function (btn) {
            btn.addEventListener('click', function () { closeDialog(helpDialog); });
        });
        // Clicking the dark backdrop (outside the card) closes the dialog
        helpDialog.addEventListener('click', function (e) { if (e.target === helpDialog) { closeDialog(helpDialog); } });
        helpDialog.addEventListener('close', function () {
            document.body.classList.remove('dialog-open');
            if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
        });
    }

    /* ---------- Back-to-top button ---------- */
    var backToTop = $('.back-to-top');
    var ticking = false;

    window.addEventListener('scroll', function () {
        if (ticking) { return; }
        ticking = true;
        window.requestAnimationFrame(function () {
            backToTop.classList.toggle('visible', window.scrollY > 400);
            ticking = false;
        });
    }, { passive: true });

    backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    /* ---------- Scroll animation ----------
       Cards and panels that start below the fold fade up when they scroll
       into view. Anything already visible is left alone, and nothing is hidden
       if JavaScript is off or the visitor prefers reduced motion. */
    if ('IntersectionObserver' in window && !reduceMotion) {
        var targets = $$('.card-grid > :not(.book-card), .provide-list li, .accordion details, .form-card, .contact-info, .map, figure')
            .filter(function (el) { return el.getBoundingClientRect().top > window.innerHeight; });
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
            });
        }, { rootMargin: '0px 0px -8% 0px' });
        targets.forEach(function (el, i) {
            el.classList.add('reveal');
            el.style.transitionDelay = (i % 3) * 90 + 'ms';
            io.observe(el);
        });
    }

    /* ---------- Share links ---------- */
    var pageUrl = encodeURIComponent(window.location.href.split('#')[0].split('?')[0]);
    var pageTitle = encodeURIComponent(document.title);
    var shareUrls = {
        whatsapp: 'https://wa.me/?text=' + pageTitle + '%20' + pageUrl,
        facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + pageUrl,
        twitter: 'https://twitter.com/intent/tweet?text=' + pageTitle + '&url=' + pageUrl,
        linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + pageUrl
    };
    if (window.location.protocol.indexOf('http') === 0) {
        $$('[data-share]').forEach(function (a) { a.href = shareUrls[a.getAttribute('data-share')]; });
    }

    /* ---------- Site-wide search ----------
       Looks through every page in the menu. Served over http(s) (GitHub Pages,
       a local server) the other pages are fetched and searched. Opened straight
       from disk (file://) browsers block that, so the search falls back to the
       current page plus each page's title and keywords. */
    var searchInput = $('#site-search');
    var results = $('#search-results');
    var pageLinks = $$('a', navList).map(function (a) {
        return { title: a.textContent.trim(), url: a.getAttribute('href') };
    });
    var keywords = {
        'index.html': 'home welcome mission breathe listen support text line hotline therapy peers community resources',
        'about.html': 'about us mission safe space judgment fear mental health concerns someone to talk to',
        'services.html': 'services text line hotline 24/7 therapy support confidential faq questions diagnosis',
        'gallery.html': 'gallery photos community conversation peer support circle volunteers event',
        'books.html': 'books reading recommended depression anxiety trauma grief self-compassion burns van der kolk haig hari devine brown',
        'enquiry.html': 'enquiry volunteer sponsor sponsorship donate therapy referral cost availability',
        'contact.html': 'contact phone call text email lifeline suicide crisis emergency police ambulance 112 10111 10177 map location form popia privacy'
    };
    var cache = {};

    function blocksFrom(doc) {
        return $$('main h1, main h2, main h3, main p, main li, main figcaption, main summary', doc)
            .filter(function (el) { return !el.querySelector('p, li, h2, h3'); })
            .map(function (el) { return el.textContent.replace(/\s+/g, ' ').trim(); })
            .filter(Boolean);
    }

    function loadPage(page) {
        var path = window.location.pathname.split('/').pop() || 'index.html';
        if (page.url === path) { return Promise.resolve(blocksFrom(document)); }
        if (cache[page.url]) { return Promise.resolve(cache[page.url]); }
        return fetch(page.url)
            .then(function (r) { if (!r.ok) { throw new Error(r.status); } return r.text(); })
            .then(function (html) {
                cache[page.url] = blocksFrom(new DOMParser().parseFromString(html, 'text/html'));
                return cache[page.url];
            })
            .catch(function () { return [page.title + '. ' + (keywords[page.url] || '')]; });
    }

    function snippet(text, q) {
        var i = Math.max(0, text.toLowerCase().indexOf(q));
        var start = Math.max(0, i - 40);
        var out = text.slice(start, start + 120);
        return (start > 0 ? '…' : '') + out + (start + 120 < text.length ? '…' : '');
    }

    function showResults(list, q) {
        results.textContent = '';
        if (!list.length) {
            var none = document.createElement('p');
            none.className = 'search-empty';
            none.textContent = 'No results for “' + q + '”.';
            results.appendChild(none);
        }
        list.forEach(function (hit) {
            var a = document.createElement('a');
            a.href = hit.url + '?find=' + encodeURIComponent(q);
            var title = document.createElement('strong');
            title.textContent = hit.title;
            var text = document.createElement('span');
            text.textContent = hit.text;
            a.appendChild(title);
            a.appendChild(text);
            results.appendChild(a);
        });
        results.hidden = false;
    }

    function runSearch() {
        var q = searchInput.value.trim().toLowerCase();
        if (q.length < 2) { results.hidden = true; return; }
        Promise.all(pageLinks.map(loadPage)).then(function (all) {
            var hits = [];
            all.forEach(function (blocks, i) {
                var match = blocks.filter(function (t) { return t.toLowerCase().indexOf(q) !== -1; })[0];
                if (match) { hits.push({ title: pageLinks[i].title, url: pageLinks[i].url, text: snippet(match, q) }); }
            });
            showResults(hits, searchInput.value.trim());
        });
    }

    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); runSearch(); }
        if (e.key === 'Escape') { results.hidden = true; }
    });
    searchInput.addEventListener('input', function () {
        if (searchInput.value.trim().length < 2) { results.hidden = true; }
    });
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.search-bar')) { results.hidden = true; }
    });

    // Arriving from a search result: scroll to and highlight the first match.
    var find = new URLSearchParams(window.location.search).get('find');
    if (find) {
        var q = find.toLowerCase();
        var target = $$('main h1, main h2, main h3, main p, main li, main figcaption, main summary')
            .filter(function (el) { return !el.querySelector('p, li, h2, h3') && el.textContent.toLowerCase().indexOf(q) !== -1; })[0];
        if (target) {
            var details = target.closest('details');
            if (details) { details.open = true; }
            target.classList.add('search-hit');
            window.addEventListener('load', function () {
                target.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
            });
            setTimeout(function () { target.classList.remove('search-hit'); }, 4000);
        }
    }
})();
