/* WE HELP — js/accordion.js (jQuery)
   Animated FAQ accordion built on native <details> elements, so the answers
   still work without JavaScript. Adds: smooth open/close, one-open-at-a-time,
   "Expand all" / "Collapse all", and deep links such as services.html#faq-2. */
(function ($) {
    'use strict';

    var $acc = $('#faq');
    if (!$acc.length) { return; }

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { $.fx.off = true; }

    var $items = $acc.children('details');
    var expandedAll = false;

    function open($d) {
        $d.prop('open', true);
        $d.children('.accordion-body').stop(true, true).hide().slideDown(250);
    }

    function close($d) {
        var $body = $d.children('.accordion-body');
        $body.stop(true, true).slideUp(200, function () {
            $d.prop('open', false);
            $body.css('display', '');
        });
    }

    // Click or keyboard (Enter/Space) on a question
    $acc.on('click', 'summary', function (e) {
        e.preventDefault();
        var $d = $(this).parent();
        if ($d.prop('open')) {
            close($d);
        } else {
            if (!expandedAll) { close($items.filter(function () { return this.open && this !== $d[0]; })); }
            open($d);
            if (window.history && history.replaceState) { history.replaceState(null, '', '#' + $d.attr('id')); }
        }
    });

    $('#faq-expand').prop('hidden', false).on('click', function () {
        expandedAll = true;
        $items.filter(function () { return !this.open; }).each(function () { open($(this)); });
    });

    $('#faq-collapse').prop('hidden', false).on('click', function () {
        expandedAll = false;
        $items.filter(function () { return this.open; }).each(function () { close($(this)); });
    });

    // Deep link: open the question named in the URL
    var hash = window.location.hash;
    if (/^#faq-\d+$/.test(hash)) {
        var $target = $(hash);
        if ($target.length) { $target.prop('open', true); }
    }
})(jQuery);
