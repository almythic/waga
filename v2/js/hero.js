/* ==========================================================================
   WAGA WELLNESS — Hero Video
   - Autoplays the full-screen background video on load
   - Fades the scroll hint out as the user scrolls
   ========================================================================== */

(function () {
  'use strict';

  var videoEl    = document.getElementById('heroVideoEl');
  var scrollHint = document.getElementById('heroScrollHint');

  if (!videoEl) return;

  // Autoplay immediately (muted, so browsers allow it)
  videoEl.play().catch(function () {});

  // Fade scroll hint out as user scrolls down
  if (scrollHint) {
    window.addEventListener('scroll', function () {
      var opacity = Math.max(0, 1 - window.scrollY / 200);
      scrollHint.style.opacity = String(opacity);
    }, { passive: true });
  }

})();
