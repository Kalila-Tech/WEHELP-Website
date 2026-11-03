/* WE HELP — js/lightbox.js (jQuery)
   Gallery lightbox. Every photo link opens the larger image in a modal
   <dialog> built here with DOM manipulation. Previous/next buttons, arrow keys,
   swipe, Escape and a click on the backdrop all work, and focus returns to the
   photo you opened. Without JavaScript the links simply open the image. */
(function ($) {
    'use strict';

    var $links = $('.lightbox-link');
    if (!$links.length) { return; }

    var items = $links.map(function () {
        return { href: this.getAttribute('href'), caption: this.getAttribute('data-caption'), alt: $(this).find('img').attr('alt') };
    }).get();

    var $img = $('<img alt="">');
    var $caption = $('<p class="lightbox-caption"></p>');
    var $count = $('<p class="lightbox-count" aria-live="polite"></p>');
    var $close = $('<button type="button" class="lightbox-btn lightbox-close" aria-label="Close photo viewer"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>');
    var $prev = $('<button type="button" class="lightbox-btn lightbox-prev" aria-label="Previous photo"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>');
    var $next = $('<button type="button" class="lightbox-btn lightbox-next" aria-label="Next photo"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>');
    var $card = $('<div class="lightbox-card"></div>').append($close, $prev, $next, $img, $caption, $count);
    var $dialog = $('<dialog class="lightbox" aria-label="Photo viewer"></dialog>').append($card).appendTo('body');
    var dialog = $dialog[0];
    var index = 0;
    var opener = null;
    var preloaded = {};

    function preload(i) {
        var item = items[(i + items.length) % items.length];
        if (!preloaded[item.href]) { preloaded[item.href] = new Image(); preloaded[item.href].src = item.href; }
    }

    function show(i) {
        index = (i + items.length) % items.length;
        var item = items[index];
        $img.stop(true, true).hide().attr({ src: item.href, alt: item.alt }).fadeIn(220);
        $caption.text(item.caption);
        $count.text('Photo ' + (index + 1) + ' of ' + items.length);
        preload(index + 1);
        preload(index - 1);
    }

    function openAt(i, trigger) {
        opener = trigger;
        show(i);
        if (typeof dialog.showModal === 'function') { dialog.showModal(); } else { dialog.setAttribute('open', ''); }
        $('body').addClass('dialog-open');
    }

    $links.on('click', function (e) {
        e.preventDefault();
        openAt($links.index(this), this);
    });

    $close.on('click', function () { dialog.close(); });
    $prev.on('click', function () { show(index - 1); });
    $next.on('click', function () { show(index + 1); });

    // Click on the dark backdrop closes
    $dialog.on('click', function (e) { if (e.target === dialog) { dialog.close(); } });

    $dialog.on('keydown', function (e) {
        if (e.key === 'ArrowLeft') { show(index - 1); }
        if (e.key === 'ArrowRight') { show(index + 1); }
    });

    // Swipe on touch screens
    var startX = null;
    $card.on('touchstart', function (e) { startX = e.originalEvent.touches[0].clientX; });
    $card.on('touchend', function (e) {
        if (startX === null) { return; }
        var dx = e.originalEvent.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) { show(index + (dx < 0 ? 1 : -1)); }
        startX = null;
    });

    $dialog.on('close', function () {
        $('body').removeClass('dialog-open');
        if (opener) { opener.focus(); }
    });
})(jQuery);
