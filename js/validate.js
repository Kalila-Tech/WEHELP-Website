/* WE HELP — js/validate.js
   Shared client-side form validation for the contact and enquiry forms.
   Exposes window.WEHELP with: fieldMessage, showError, validateForm, attach, counter, dates. */
(function () {
    'use strict';

    var NS = window.WEHELP = window.WEHELP || {};

    var nameRe = /^\p{L}[\p{L}\p{M}'’ .-]{1,59}$/u;
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var phoneRe = /^(?:\+27|0027|0)[1-9]\d{8}$/;       // South African numbers
    var nouns = { name: 'full name', email: 'email address', phone: 'phone number', message: 'message',
                  hours: 'weekly hours', amount: 'monthly pledge', date: 'preferred date' };

    NS.cleanPhone = function (v) { return v.replace(/[\s()-]/g, ''); };

    NS.dates = {
        iso: function (d) {
            return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        },
        today: function () { var d = new Date(); d.setHours(0, 0, 0, 0); return d; },
        plusDays: function (n) { var d = NS.dates.today(); d.setDate(d.getDate() + n); return d; }
    };

    /* Returns an error message for one field, or '' when the value is fine. */
    NS.fieldMessage = function (field) {
        if (field.disabled || field.closest('[hidden]') || field.closest('.hp')) { return ''; }
        var name = field.name;
        var isCheck = field.type === 'checkbox';
        var v = isCheck ? '' : (field.value || '').trim();

        if (field.required && (isCheck ? !field.checked : !v)) {
            if (isCheck) { return 'Please tick the box to continue.'; }
            if (field.tagName === 'SELECT') { return 'Please choose an option.'; }
            return 'Please enter your ' + (nouns[name] || 'answer') + '.';
        }
        if (!v) { return ''; }

        if (name === 'name' && !nameRe.test(v)) {
            return 'Use 2 to 60 letters. Spaces, hyphens and apostrophes are allowed.';
        }
        if (name === 'email' && !emailRe.test(v)) {
            return 'Enter a valid email address, for example name@example.com.';
        }
        if (name === 'phone' && !phoneRe.test(NS.cleanPhone(v))) {
            return 'Enter a South African number, for example 072 055 3717 or +27 72 055 3717.';
        }
        if (field.tagName === 'TEXTAREA') {
            var min = parseInt(field.getAttribute('minlength'), 10) || 0;
            var max = parseInt(field.getAttribute('maxlength'), 10) || Infinity;
            if (v.length < min) { return 'Please write at least ' + min + ' characters (you have ' + v.length + ').'; }
            if (v.length > max) { return 'Please keep it under ' + max + ' characters.'; }
        }
        if (field.type === 'number') {
            var n = Number(v);
            var lo = Number(field.min), hi = Number(field.max);
            if (!Number.isInteger(n)) { return 'Enter a whole number.'; }
            if (n < lo || n > hi) { return 'Enter a number from ' + lo + ' to ' + hi + '.'; }
        }
        if (field.type === 'date') {
            var d = new Date(v + 'T00:00:00');
            if (isNaN(d.getTime())) { return 'Enter a valid date.'; }
            if (d < NS.dates.today()) { return 'Choose today or a future date.'; }
            if (d > NS.dates.plusDays(90)) { return 'Choose a date within the next 90 days.'; }
        }
        return '';
    };

    NS.showError = function (field, message) {
        var box = document.getElementById(field.id + '-error');
        if (box) { box.textContent = message; }
        if (message) { field.setAttribute('aria-invalid', 'true'); } else { field.removeAttribute('aria-invalid'); }
    };

    NS.fields = function (form) {
        return Array.prototype.slice.call(form.querySelectorAll('input, select, textarea'))
            .filter(function (f) { return f.type !== 'hidden' && f.type !== 'submit' && !f.closest('.hp') && f.id; });
    };

    /* Validates every visible field. Returns { valid, first, count }. */
    NS.validateForm = function (form) {
        var first = null, count = 0;
        NS.fields(form).forEach(function (f) {
            var msg = NS.fieldMessage(f);
            NS.showError(f, msg);
            if (msg) { count++; if (!first) { first = f; } }
        });
        return { valid: count === 0, first: first, count: count };
    };

    /* Checks a field when the user leaves it, then keeps re-checking as they fix it. */
    NS.attach = function (form) {
        NS.fields(form).forEach(function (f) {
            f.addEventListener('blur', function () { NS.showError(f, NS.fieldMessage(f)); });
            var live = function () { if (f.getAttribute('aria-invalid') === 'true') { NS.showError(f, NS.fieldMessage(f)); } };
            f.addEventListener('input', live);
            f.addEventListener('change', live);
        });
    };

    /* Live "123 / 500" character counter. */
    NS.counter = function (textarea, output) {
        var max = textarea.getAttribute('maxlength');
        var update = function () { output.textContent = textarea.value.length + ' / ' + max; };
        textarea.addEventListener('input', update);
        update();
    };
})();
