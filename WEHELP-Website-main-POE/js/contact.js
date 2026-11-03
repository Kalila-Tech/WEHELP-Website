/* WE HELP — js/contact.js
   Contact form: validates the message, then compiles it into an email addressed
   to the recipient stated in the form (data-recipient). The visitor reviews the
   email and sends it from their own email app. */
(function () {
    'use strict';

    var form = document.getElementById('contact-form');
    var V = window.WEHELP;
    if (!form || !V) { return; }

    var status = document.getElementById('contact-status');
    var preview = document.getElementById('email-preview');
    var recipient = form.getAttribute('data-recipient');
    var el = function (id) { return document.getElementById(id); };

    V.attach(form);
    V.counter(el('c-message'), el('c-message-count'));

    function oneLine(s) { return s.replace(/[\r\n]+/g, ' ').trim(); }   // no line breaks in the subject (header injection)

    function compose() {
        var f = form.elements;
        var name = oneLine(f.name.value);
        var phone = f.phone.value.trim() || 'not given';
        var when = new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
        return {
            to: recipient,
            subject: '[' + oneLine(f.type.value) + '] Message from ' + name,
            body: 'Hello WE HELP team,\n\n' + f.message.value.trim() + '\n\n—\n' +
                  'Name: ' + name + '\nEmail: ' + oneLine(f.email.value) + '\nPhone: ' + phone +
                  '\nMessage type: ' + oneLine(f.type.value) + '\nSent from the WE HELP website contact form on ' + when + '.'
        };
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (form.elements.website.value) { return; }              // honeypot: bots fill this in
        var res = V.validateForm(form);
        if (!res.valid) {
            status.textContent = 'Please fix the ' + res.count + ' highlighted field' + (res.count > 1 ? 's' : '') + ' and try again.';
            status.classList.add('error');
            res.first.focus();
            return;
        }
        var mail = compose();
        el('ep-to').textContent = mail.to;
        el('ep-subject').textContent = mail.subject;
        el('ep-body').value = mail.body;
        var href = 'mailto:' + mail.to + '?subject=' + encodeURIComponent(mail.subject) + '&body=' + encodeURIComponent(mail.body);
        el('ep-send').href = href;
        preview.hidden = false;
        status.classList.remove('error');
        status.textContent = href.length > 1900
            ? 'Your email is ready. It is long, so if your email app opens empty, use “Copy text” and paste it in.'
            : 'Your email is ready. Check it below, then choose “Send email”.';
        preview.querySelector('h3').setAttribute('tabindex', '-1');
        preview.querySelector('h3').focus();
        preview.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });

    el('ep-edit').addEventListener('click', function () {
        preview.hidden = true;
        status.textContent = '';
        el('c-message').focus();
    });

    el('ep-copy').addEventListener('click', function () {
        var text = 'To: ' + el('ep-to').textContent + '\nSubject: ' + el('ep-subject').textContent + '\n\n' + el('ep-body').value;
        var done = function () { status.classList.remove('error'); status.textContent = 'Copied. Paste it into a new email.'; };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done, function () { el('ep-body').select(); });
        } else {
            el('ep-body').select();
            try { if (document.execCommand('copy')) { done(); } } catch (err) { /* user can copy by hand */ }
        }
    });
})();
