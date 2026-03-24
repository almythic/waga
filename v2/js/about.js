/* ==========================================================================
   WAGA WELLNESS — About Page Scripts

   Handles:
   1. Hero parallax blobs + content fade on scroll
   2. Timeline scroll-driven center line + milestone activation
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */

  function getReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  function lerp(start, end, t) {
    return start + (end - start) * t;
  }


  /* ------------------------------------------------------------------
     1. HERO PARALLAX — Blobs move at different rates, content fades
     ------------------------------------------------------------------ */

  function initHeroParallax() {
    if (getReducedMotion()) return;

    var hero = document.querySelector('.about-hero');
    var content = document.querySelector('.about-hero-content');
    var blobs = document.querySelectorAll('.about-blob');

    if (!hero || !blobs.length) return;

    // Each blob has a different parallax rate
    var rates = [0.15, 0.08, 0.12, 0.06];
    var running = true;
    var currentScroll = 0;
    var smoothScroll = 0;

    function tick() {
      if (!running) return;

      smoothScroll = lerp(smoothScroll, currentScroll, 0.08);

      var heroBottom = hero.offsetTop + hero.offsetHeight;
      var progress = clamp(currentScroll / (heroBottom * 0.6), 0, 1);

      // Parallax blobs
      blobs.forEach(function (blob, i) {
        var rate = rates[i] || 0.1;
        var y = smoothScroll * rate;
        blob.style.transform = 'translateY(' + y + 'px)';
      });

      // Fade + push hero content
      if (content) {
        var contentY = smoothScroll * 0.3;
        var contentOpacity = 1 - progress;
        content.style.transform = 'translateY(' + contentY + 'px)';
        content.style.opacity = contentOpacity;
      }

      requestAnimationFrame(tick);
    }

    function onScroll() {
      currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    smoothScroll = currentScroll;
    requestAnimationFrame(tick);

    // Cleanup on page unload
    window.addEventListener('beforeunload', function () {
      running = false;
    });
  }


  /* ------------------------------------------------------------------
     2. TIMELINE — Scroll-driven center line + milestone activation
     ------------------------------------------------------------------ */

  function initTimeline() {
    var section = document.querySelector('.about-timeline-section');
    var lineEl = document.querySelector('.about-timeline-line line');
    var milestones = document.querySelectorAll('.about-milestone');
    var counterCurrent = document.querySelector('.about-timeline-counter-current');

    if (!section || !milestones.length) return;

    // For reduced motion, show all milestones statically
    if (getReducedMotion()) {
      milestones.forEach(function (m) {
        m.classList.add('is-active');
      });
      if (counterCurrent) counterCurrent.textContent = '04';
      return;
    }

    var totalMilestones = milestones.length;
    var currentActive = -1;

    // Line color per milestone
    var lineColors = {
      0: '#B99470', // camel
      1: '#783D19', // russet
      2: '#5F6F52', // olive
      3: '#C4661F'  // alloy
    };

    function updateTimeline() {
      var rect = section.getBoundingClientRect();
      var sectionHeight = section.offsetHeight;
      var viewHeight = window.innerHeight;

      // Progress: 0 when section top hits viewport top, 1 when section bottom hits viewport bottom
      var scrolled = -rect.top;
      var totalScrollable = sectionHeight - viewHeight;
      var progress = clamp(scrolled / totalScrollable, 0, 1);

      // Draw the line
      if (lineEl) {
        // Get the actual line length
        var lineLength = lineEl.getTotalLength ? lineEl.getTotalLength() : 1000;
        lineEl.style.strokeDasharray = lineLength;
        lineEl.style.strokeDashoffset = lineLength * (1 - progress);
      }

      // Determine active milestone
      var segmentSize = 1 / totalMilestones;
      var activeIndex = Math.min(Math.floor(progress / segmentSize), totalMilestones - 1);

      // At very start, don't show anything
      if (progress < 0.02) {
        activeIndex = -1;
      }

      if (activeIndex !== currentActive) {
        currentActive = activeIndex;

        milestones.forEach(function (m, i) {
          if (i === activeIndex) {
            m.classList.add('is-active');
          } else {
            m.classList.remove('is-active');
          }
        });

        // Update counter
        if (counterCurrent && activeIndex >= 0) {
          counterCurrent.textContent = String(activeIndex + 1).padStart(2, '0');
        }

        // Update line color
        if (lineEl && activeIndex >= 0 && lineColors[activeIndex]) {
          lineEl.style.stroke = lineColors[activeIndex];
        }
      }
    }

    window.addEventListener('scroll', updateTimeline, { passive: true });
    updateTimeline(); // Initial call
  }


  /* ------------------------------------------------------------------
     INIT
     ------------------------------------------------------------------ */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initHeroParallax();
      initTimeline();
    });
  } else {
    initHeroParallax();
    initTimeline();
  }

})();
