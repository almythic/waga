/* ==========================================================================
   WAGA WELLNESS — Program Page Scripts
   Left-edge progress rail + scroll indicator fade.
   ========================================================================== */

(function () {
  'use strict';

  /* -------------------------------------------------------------------
     1. SCROLL INDICATOR — fade out after first scroll
     ------------------------------------------------------------------- */

  var scrollIndicator = document.getElementById('scroll-indicator');

  if (scrollIndicator) {
    var hasScrolled = false;

    function hideScrollIndicator() {
      if (!hasScrolled) {
        hasScrolled = true;
        scrollIndicator.classList.add('hidden');
        window.removeEventListener('scroll', hideScrollIndicator);
      }
    }

    window.addEventListener('scroll', hideScrollIndicator, { passive: true });
  }


  /* -------------------------------------------------------------------
     2. LEFT-EDGE PROGRESS RAIL
     Fills as you scroll through days 1–5.
     Shows / hides based on whether any day section is visible.
     ------------------------------------------------------------------- */

  var rail      = document.getElementById('progress-rail');
  var railFill  = document.getElementById('progress-rail-fill');
  var railLabel = document.getElementById('progress-rail-label');
  var daySections = Array.prototype.slice.call(document.querySelectorAll('.day-section'));

  if (!rail || daySections.length === 0) return;

  var isInDayZone = false;
  var currentDay  = 0;

  /* Helper: clamp a value between min and max */
  function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
  }

  /* Calculate and apply rail fill + label based on scroll position */
  function updateRail() {
    var firstDay = daySections[0];
    var lastDay  = daySections[daySections.length - 1];

    var zoneTop    = firstDay.getBoundingClientRect().top + window.scrollY;
    var zoneBottom = lastDay.getBoundingClientRect().bottom + window.scrollY;
    var zoneHeight = zoneBottom - zoneTop;

    /* Scroll position relative to the day zone */
    var scrolled = window.scrollY + window.innerHeight * 0.5 - zoneTop;
    var progress = clamp(scrolled / zoneHeight, 0, 1);

    railFill.style.height = (progress * 100) + '%';

    /* Determine active day for label */
    var dayInView = 1;
    daySections.forEach(function (section) {
      var rect = section.getBoundingClientRect();
      /* Section is "active" when its top half is in view */
      if (rect.top < window.innerHeight * 0.6) {
        var d = parseInt(section.getAttribute('data-day'), 10);
        if (d) dayInView = d;
      }
    });

    if (dayInView !== currentDay) {
      currentDay = dayInView;
      railLabel.textContent = 'Day ' + dayInView;
    }
  }

  /* Check if any day section is currently in the viewport */
  function checkZone() {
    var anyInView = daySections.some(function (section) {
      var rect = section.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    });

    if (anyInView && !isInDayZone) {
      isInDayZone = true;
      rail.classList.add('visible');
      updateRail();
    } else if (!anyInView && isInDayZone) {
      isInDayZone = false;
      rail.classList.remove('visible');
    }

    if (isInDayZone) {
      updateRail();
    }
  }

  /* Throttled scroll handler via rAF */
  var ticking = false;

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        checkZone();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  /* Run once on load in case page is already scrolled */
  checkZone();

})();
