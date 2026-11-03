/* WE HELP — js/books.js (jQuery)
   Books page: loads the book list with AJAX ($.getJSON) from data/books.json,
   builds the cards with DOM manipulation, and lets visitors search, filter by
   topic and sort. If the file cannot be loaded (for example when the page is
   opened from disk) it falls back to the cards already written in the HTML. */
(function ($) {
    'use strict';

    var $list = $('#book-list');
    var $tools = $('#book-tools');
    if (!$list.length) { return; }

    var $search = $('#book-search');
    var $topic = $('#book-topic');
    var $sort = $('#book-sort');
    var $count = $('#book-count');
    var books = [];
    var firstRender = true;

    // Fallback: read the books that are already in the page
    function fromPage() {
        return $list.children('.book-card').map(function () {
            var $c = $(this);
            return { title: $c.data('title'), author: $c.data('author'), topic: $c.data('topic'),
                     description: $c.children('p').not('.book-meta').first().text() };
        }).get();
    }

    function card(b) {
        return $('<div class="book-card"></div>')
            .attr({ 'data-title': b.title, 'data-author': b.author, 'data-topic': b.topic })
            .toggleClass('is-entering', !firstRender)
            .append(
                $('<i class="fa-solid fa-book-open" aria-hidden="true"></i>'),
                $('<p class="book-meta"></p>').text(b.author),
                $('<h2 class="card-title"></h2>').text(b.title),
                $('<p></p>').text(b.description)
            );
    }

    var sorters = {
        'title-asc':   function (a, b) { return a.title.localeCompare(b.title, 'en'); },
        'title-desc':  function (a, b) { return b.title.localeCompare(a.title, 'en'); },
        'author-asc':  function (a, b) { return a.author.localeCompare(b.author, 'en'); },
        'topic-asc':   function (a, b) { return a.topic.localeCompare(b.topic, 'en') || a.title.localeCompare(b.title, 'en'); }
    };

    function render() {
        var q = $.trim($search.val()).toLowerCase();
        var topic = $topic.val();
        var shown = books.filter(function (b) {
            var haystack = (b.title + ' ' + b.author + ' ' + b.topic + ' ' + b.description).toLowerCase();
            return (!topic || b.topic === topic) && (!q || haystack.indexOf(q) !== -1);
        }).sort(sorters[$sort.val()]);

        $list.empty();
        if (!shown.length) {
            $list.append($('<p class="no-results"></p>').text('No books match your search. Try a different word or choose “All topics”.'));
        } else {
            $list.append(shown.map(card));
        }
        $count.text('Showing ' + shown.length + ' of ' + books.length + ' book' + (books.length === 1 ? '' : 's') +
                    (q ? ' for “' + $.trim($search.val()) + '”' : '') + (topic ? ' in ' + topic : '') + '.');
        firstRender = false;
    }

    function start() {
        // Topic choices come from the data itself
        var topics = {};
        books.forEach(function (b) { topics[b.topic] = true; });
        $.each(Object.keys(topics).sort(), function (_, t) {
            if (!$topic.find('option').filter(function () { return this.value === t; }).length) {
                $('<option></option>').val(t).text(t).appendTo($topic);
            }
        });
        $tools.prop('hidden', false);
        render();

        var timer;
        $search.on('input', function () { clearTimeout(timer); timer = setTimeout(render, 150); });
        $topic.add($sort).on('change', render);
        $tools.on('reset', function () { setTimeout(render, 0); });
        $tools.on('submit', function (e) { e.preventDefault(); });
    }

    $.getJSON('data/books.json')
        .done(function (data) { books = data; })
        .fail(function () { books = fromPage(); })
        .always(start);
})(jQuery);
