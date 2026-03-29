/* ==========================================================================
   WAGA WELLNESS — Program Page Scripts
   Scroll-scrubbed day transitions + left-edge progress rail.

   Mirrors the "Inside the Box" unbox section in main.js — each day panel
   slides up from below proportional to scroll position.
   ========================================================================== */

(function () {
  'use strict';

  var BREAKPOINT = 1024;

  var daysScroll  = document.getElementById('days-scroll');
  var dayPanels   = Array.prototype.slice.call(
    document.querySelectorAll('.days-sticky-frame .day-section')
  );
  var rail        = document.getElementById('progress-rail');
  var railFill    = document.getElementById('progress-rail-fill');
  var railLabel   = document.getElementById('progress-rail-label');

  if (!daysScroll || dayPanels.length === 0) return;

  var DAY_COUNT             = dayPanels.length;
  var activeContent         = -1;
  var railVisible           = false;
  var transformsInitialized = false;

  function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
  }

  /* Toggle .is-active on the correct panel — triggers content stagger via CSS */
  function setActiveContent(n) {
    if (n === activeContent) return;
    activeContent = n;
    dayPanels.forEach(function (panel, i) {
      panel.classList.toggle('is-active', i === n);
    });
    if (railLabel) {
      railLabel.textContent = 'Day ' + (n + 1);
    }
  }

  /* Apply z-index + initial transforms for the desktop sticky layout */
  function initTransforms() {
    if (transformsInitialized) return;
    transformsInitialized = true;
    // Higher index = higher z-index — each day slides over the previous
    dayPanels.forEach(function (panel, i) {
      panel.style.zIndex    = i + 1;
      panel.style.transform = i === 0 ? 'translateY(0)' : 'translateY(100%)';
    });
    setActiveContent(0);
  }

  /* Remove inline transforms/z-index when falling back to mobile flow */
  function clearTransforms() {
    if (!transformsInitialized) return;
    transformsInitialized = false;
    dayPanels.forEach(function (panel) {
      panel.style.transform = '';
      panel.style.zIndex    = '';
      panel.classList.remove('is-active');
      panel.classList.remove('is-settled');
    });
    activeContent = -1;
  }

  /* Progress rail update for mobile (days flow normally) */
  function updateRailMobile() {
    var rect   = daysScroll.getBoundingClientRect();
    var inZone = rect.top < window.innerHeight && rect.bottom > 0;

    if (inZone && !railVisible) {
      railVisible = true;
      if (rail) rail.classList.add('visible');
    } else if (!inZone && railVisible) {
      railVisible = false;
      if (rail) rail.classList.remove('visible');
    }

    if (inZone && railFill) {
      var scrollable = daysScroll.offsetHeight - window.innerHeight;
      if (scrollable > 0) {
        railFill.style.height = (clamp(-rect.top / scrollable, 0, 1) * 100) + '%';
      }
    }
  }

  /* ── Main update ── */
  function updateDays() {
    /* Mobile: days are in normal flow — no transforms needed */
    if (window.innerWidth < BREAKPOINT) {
      clearTransforms();
      updateRailMobile();
      return;
    }

    /* Desktop: scroll-scrubbed slide-up */
    initTransforms();

    var rect       = daysScroll.getBoundingClientRect();
    var scrolled   = -rect.top;
    var viewH      = window.innerHeight;
    var scrollable = daysScroll.offsetHeight - viewH;
    var inZone     = rect.top < viewH && rect.bottom > 0;

    if (inZone && !railVisible) {
      railVisible = true;
      if (rail) rail.classList.add('visible');
    } else if (!inZone && railVisible) {
      railVisible = false;
      if (rail) rail.classList.remove('visible');
    }

    /* Above the section — reset to initial positions */
    if (scrolled <= 0 || scrollable <= 0) {
      dayPanels.forEach(function (panel, i) {
        panel.style.transform = i === 0 ? 'translateY(0)' : 'translateY(100%)';
        panel.classList.remove('is-settled');
      });
      setActiveContent(0);
      if (railFill) railFill.style.height = '0%';
      return;
    }

    var progress = clamp(scrolled / scrollable, 0, 1);

    /* Fill rail proportionally */
    if (railFill) {
      railFill.style.height = (progress * 100) + '%';
    }

    /* Map progress to current transition.
       progress 0→1 spans DAY_COUNT-1 slide transitions (4 for 5 days). */
    var raw    = progress * (DAY_COUNT - 1);
    var scene  = Math.min(Math.floor(raw), DAY_COUNT - 1);
    var within = raw - scene; // 0→1: how far into this particular slide

    /* Drive panel positions — exact same logic as unbox in main.js */
    dayPanels.forEach(function (panel, i) {
      if (i <= scene) {
        // Already fully revealed — sits flush at the top
        panel.style.transform = 'translateY(0)';
      } else if (i === scene + 1) {
        // The next panel sliding up in real time
        panel.style.transform = 'translateY(' + ((1 - within) * 100) + '%)';
      } else {
        // Future panels — waiting below
        panel.style.transform = 'translateY(100%)';
      }
    });

    /* Switch content text when the incoming panel crosses the 50% mark */
    var contentIdx = (within >= 0.5 && scene < DAY_COUNT - 1) ? scene + 1 : scene;
    setActiveContent(contentIdx);

    /* Mark all fully-settled panels (behind the active one) so their content
       stays visible — prevents the CSS transition from fading them out */
    dayPanels.forEach(function (panel, i) {
      panel.classList.toggle('is-settled', i < contentIdx);
    });
  }

  /* ── Throttled scroll via rAF ── */
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateDays();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateDays, { passive: true });

  updateDays();

})();
