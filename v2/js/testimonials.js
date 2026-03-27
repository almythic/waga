/* ==========================================================================
   WAGA WELLNESS — Testimonials Page Scripts

   Filter pills, video play toggle.
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

            // Update active pill
            filterPills.forEach(function (p) {
                p.classList.remove('active');
            });
            this.classList.add('active');

            // Filter cards
            masonryCards.forEach(function (card) {
                var type = card.getAttribute('data-type');

                if (filter === 'all' || type === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });


    /* -------------------------------------------------------------------
       2. VIDEO PLAY TOGGLE
       ------------------------------------------------------------------- */

    var videoThumbnails = document.querySelectorAll('.card-video-thumbnail, .featured-video-wrapper');

    videoThumbnails.forEach(function (thumbnail) {
        thumbnail.addEventListener('click', function () {
            var video = this.querySelector('video');
            var overlay = this.querySelector('.card-video-play');

            if (!video) return;

            if (video.paused) {
                // Pause all other videos first
                document.querySelectorAll('.card-video-thumbnail video, .featured-video-wrapper video').forEach(function (v) {
                    if (v !== video) {
                        v.pause();
                        var otherOverlay = v.closest('.card-video-thumbnail, .featured-video-wrapper').querySelector('.card-video-play');
                        if (otherOverlay) otherOverlay.style.opacity = '1';
                    }
                });

                video.play();
                if (overlay) overlay.style.opacity = '0';
            } else {
                video.pause();
                if (overlay) overlay.style.opacity = '1';
            }
        });

        // Show overlay again when video ends
        var video = thumbnail.querySelector('video');
        if (video) {
            video.addEventListener('ended', function () {
                var overlay = thumbnail.querySelector('.card-video-play');
                if (overlay) overlay.style.opacity = '1';
            });
        }
    });

})();
