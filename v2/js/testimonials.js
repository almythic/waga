/* ==========================================================================
   WAGA WELLNESS — Testimonials Page Scripts

   Filter pills + video lightbox.
   ========================================================================== */

(function () {
    'use strict';

    /* -------------------------------------------------------------------
       1. FILTER PILLS
       ------------------------------------------------------------------- */

    var filterPills = document.querySelectorAll('.filter-pill');
    var masonryCards = document.querySelectorAll('.masonry-card');

    filterPills.forEach(function (pill) {
        pill.addEventListener('click', function () {
            var filter = this.getAttribute('data-filter');

            filterPills.forEach(function (p) { p.classList.remove('active'); });
            this.classList.add('active');

            masonryCards.forEach(function (card) {
                var type = card.getAttribute('data-type');
                card.classList.toggle('hidden', filter !== 'all' && type !== filter);
            });

            setTimeout(alignColumnTails, 50);
        });
    });


    /* -------------------------------------------------------------------
       1b. COLUMN TAIL ALIGNMENT
       Measures actual column bottoms and translateY the last card of
       shorter columns so all columns end at the same position.
       Uses transform (not margin) to avoid triggering column reflow.
       ------------------------------------------------------------------- */

    function alignColumnTails() {
        var grid = document.querySelector('.masonry-grid');
        var section = document.querySelector('.masonry-section');
        if (!grid || !section) return;

        // Reset all transforms and padding before re-measuring
        grid.querySelectorAll('.masonry-card').forEach(function (c) {
            c.style.transform = '';
        });
        section.style.paddingBottom = '';

        var colCount = parseInt(window.getComputedStyle(grid).columnCount);
        if (!colCount || colCount < 2) return;

        var cards = Array.from(grid.querySelectorAll('.masonry-card:not(.hidden)'));
        var gridRect = grid.getBoundingClientRect();
        var colWidth = gridRect.width / colCount;

        // Assign cards to columns by relative left position within the grid.
        // Using colWidth buckets avoids sub-pixel grouping errors that occur
        // when grouping by exact getBoundingClientRect().left values.
        var groups = {};
        cards.forEach(function (card) {
            var relLeft = card.getBoundingClientRect().left - gridRect.left;
            var colIndex = Math.min(colCount - 1, Math.max(0, Math.floor(relLeft / colWidth)));
            if (!groups[colIndex]) groups[colIndex] = [];
            groups[colIndex].push(card);
        });

        var columns = Object.values(groups);
        if (columns.length < 2) return;

        // Sort each column top-to-bottom so last card is truly the bottom one
        columns.forEach(function (col) {
            col.sort(function (a, b) {
                return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
            });
        });

        // Find the maximum bottom edge across all columns
        var maxBottom = 0;
        columns.forEach(function (col) {
            maxBottom = Math.max(maxBottom, col[col.length - 1].getBoundingClientRect().bottom);
        });

        // Shift each column's last card down to reach maxBottom
        var maxGap = 0;
        columns.forEach(function (col) {
            var last = col[col.length - 1];
            var gap = maxBottom - last.getBoundingClientRect().bottom;
            if (gap > 1) {
                last.style.transform = 'translateY(' + gap + 'px)';
                maxGap = Math.max(maxGap, gap);
            }
        });

        // Extend section padding-bottom to contain the translated cards.
        // translateY is visual-only and doesn't affect layout flow,
        // so without this the cards overflow into the next section.
        if (maxGap > 0) {
            var currentPb = parseFloat(window.getComputedStyle(section).paddingBottom) || 0;
            section.style.paddingBottom = (currentPb + maxGap) + 'px';
        }
    }

    window.addEventListener('load', function () { setTimeout(alignColumnTails, 100); });
    window.addEventListener('resize', alignColumnTails);


    /* -------------------------------------------------------------------
       2. VIDEO LIGHTBOX
       ------------------------------------------------------------------- */

    var lightbox = document.getElementById('video-lightbox');
    var lightboxVideo = document.getElementById('lightbox-video');
    var lightboxClose = document.querySelector('.video-lightbox-close');

    if (!lightbox || !lightboxVideo) return;

    function openLightbox(src, poster) {
        // Reset column transforms before dialog opens — layout shifts while
        // the dialog is in the top layer would make them stale anyway.
        var grid = document.querySelector('.masonry-grid');
        var section = document.querySelector('.masonry-section');
        if (grid) grid.querySelectorAll('.masonry-card').forEach(function (c) { c.style.transform = ''; });
        if (section) section.style.paddingBottom = '';

        lightboxVideo.src = src;
        lightboxVideo.poster = poster || '';
        lightbox.showModal();
        lightboxVideo.play().catch(function () {});
    }

    function closeLightbox() {
        lightboxVideo.pause();
        lightboxVideo.src = '';
        lightbox.close();
    }

    // All play trigger elements (thumbnails with data-video-src)
    document.querySelectorAll('[data-video-src]').forEach(function (el) {
        el.addEventListener('click', function () {
            openLightbox(this.dataset.videoSrc, this.dataset.videoPoster);
        });

        // Keyboard accessibility
        el.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(this.dataset.videoSrc, this.dataset.videoPoster);
            }
        });
    });

    // Close button
    lightboxClose.addEventListener('click', closeLightbox);

    // Click backdrop to close
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
    });

    // Escape key (dialog handles this natively, but we need to clear src)
    lightbox.addEventListener('close', function () {
        lightboxVideo.pause();
        lightboxVideo.src = '';
        // Do NOT re-run alignColumnTails here — post-dialog layout measurements
        // are unreliable (scrollbar/Lenis state still settling) and produce wrong
        // translateY values that create visible gaps. Transforms were already
        // cleared in openLightbox, so the masonry returns cleanly to natural
        // CSS column layout. Alignment re-runs on resize as normal.
    });

})();
