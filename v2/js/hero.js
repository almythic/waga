/* ==========================================================================
   WAGA WELLNESS — Hero Scroll-Expand Animation (smooth)

   - Video starts as a left-aligned rounded box behind the text content
   - Hero image visible as full background behind everything
   - On scroll: video plays + grows from left position to fill the viewport
   - Text elements get pushed off-screen via translateX
   - Background image fades out
   - Uses lerp-based easing for silky smooth animation
   - Once fully expanded, Lenis is re-enabled and normal scroll resumes
   ========================================================================== */

(function () {
  'use strict';

  var hero       = document.getElementById('homeHero');
  var heroBg     = document.getElementById('heroBg');
  var mediaBox   = document.getElementById('heroMedia');
  var mediaFrame = document.getElementById('heroMediaFrame');
  var videoEl    = document.getElementById('heroVideoEl');
  var scrollHint = document.getElementById('heroScrollHint');

  var overlay    = document.querySelector('.home-hero-overlay');
  var badge      = document.getElementById('heroBadge');
  var heading    = document.getElementById('heroHeading');
  var supporting = document.getElementById('heroSupporting');
  var ctas       = document.getElementById('heroCtas');
  var meta       = document.getElementById('heroMeta');

  if (!hero || !mediaBox || !mediaFrame || !videoEl) return;

  // After entrance animations finish, add js-ready so JS transforms work
  if (overlay) {
    setTimeout(function () {
      overlay.classList.add('js-ready');
    }, 2100); // longest delay (1.2s) + duration (0.8s) + buffer
  }

  var targetProgress  = 0;
  var currentProgress = 0;
  var mediaFullyExpanded = false;
  var touchStartY     = 0;
  var hasPlayed       = false;
  var rafId           = null;

  var LERP = 0.1;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    targetProgress = 1;
    currentProgress = 1;
    mediaFullyExpanded = true;
    videoEl.play();
    render(1);
    return;
  }

  /* -----------------------------------------------------------------
     Lenis control
     ----------------------------------------------------------------- */

  function stopLenis() {
    if (window.__lenis) window.__lenis.stop();
  }

  function startLenis() {
    if (window.__lenis) window.__lenis.start();
  }

  setTimeout(function () {
    if (!mediaFullyExpanded) stopLenis();
  }, 100);

  /* -----------------------------------------------------------------
     Helpers
     ----------------------------------------------------------------- */

  function isMobile() {
    return window.innerWidth < 768;
  }

  function isTablet() {
    return window.innerWidth >= 768 && window.innerWidth < 1024;
  }

  /* -----------------------------------------------------------------
     Layout: start rect (left-aligned behind text) and end rect (full)
     ----------------------------------------------------------------- */

  function getStartRect() {
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    if (isMobile()) {
      return {
        left: 12,
        top: vh * 0.15,
        width: vw - 24,
        height: vh * 0.55,
        radius: 12
      };
    }

    if (isTablet()) {
      return {
        left: 40,
        top: vh * 0.16,
        width: 400,
        height: vh * 0.68,
        radius: 12
      };
    }

    // Desktop
    return {
      left: 64,
      top: vh * 0.16,
      width: 517,
      height: 630,
      radius: 12
    };
  }

  function getEndRect() {
    return {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
      radius: 0
    };
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /* -----------------------------------------------------------------
     Render a single frame
     ----------------------------------------------------------------- */

  function render(p) {
    var s = getStartRect();
    var e = getEndRect();
    var mobile = isMobile();

    var l = lerp(s.left, e.left, p);
    var t = lerp(s.top, e.top, p);
    var w = lerp(s.width, e.width, p);
    var h = lerp(s.height, e.height, p);
    var r = lerp(s.radius, e.radius, p);

    mediaBox.style.left   = l + 'px';
    mediaBox.style.top    = t + 'px';
    mediaBox.style.width  = w + 'px';
    mediaBox.style.height = h + 'px';

    mediaFrame.style.width  = '100%';
    mediaFrame.style.height = '100%';
    mediaFrame.style.borderRadius = r + 'px';

    // Position overlay to match the video box (at start position)
    if (overlay) {
      overlay.style.left   = s.left + 'px';
      overlay.style.top    = s.top + 'px';
      overlay.style.width  = s.width + 'px';
      overlay.style.height = s.height + 'px';
    }

    // Shadow fades out
    var shadowOpacity = 0.3 * (1 - p);
    mediaFrame.style.boxShadow = '0 0 50px rgba(74, 61, 46, ' + shadowOpacity + ')';

    // Background image fades out
    if (heroBg) heroBg.style.opacity = String(1 - p);

    // Push text off-screen to the left
    var pushVw = p * (mobile ? 120 : 100);
    if (badge)      badge.style.transform      = 'translateX(-' + pushVw + 'vw)';
    if (heading)    heading.style.transform    = 'translateX(-' + pushVw + 'vw)';
    if (supporting) supporting.style.transform = 'translateX(-' + pushVw + 'vw)';
    if (ctas)       ctas.style.transform       = 'translateX(-' + pushVw + 'vw)';
    if (meta)       meta.style.transform       = 'translateX(-' + pushVw + 'vw)';

    // Scroll hint
    if (scrollHint) {
      scrollHint.style.opacity = String(Math.max(0, 1 - p * 4));
      scrollHint.style.transform = 'translateX(-50%) translateY(' + (p * 40) + 'px)';
    }
  }

  /* -----------------------------------------------------------------
     Animation loop — lerps currentProgress toward targetProgress
     ----------------------------------------------------------------- */

  function tick() {
    currentProgress += (targetProgress - currentProgress) * LERP;

    if (Math.abs(targetProgress - currentProgress) < 0.001) {
      currentProgress = targetProgress;
    }

    render(currentProgress);

    // Video play/pause
    if (currentProgress > 0.01 && !hasPlayed) {
      hasPlayed = true;
      videoEl.play();
    }
    if (currentProgress <= 0.005 && hasPlayed) {
      videoEl.pause();
      videoEl.currentTime = 0;
      hasPlayed = false;
    }

    // Expansion complete
    if (currentProgress >= 1 && !mediaFullyExpanded) {
      mediaFullyExpanded = true;
      startLenis();
    }

    if (Math.abs(targetProgress - currentProgress) > 0.0005) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  }

  function startLoop() {
    if (!rafId) {
      rafId = requestAnimationFrame(tick);
    }
  }

  /* -----------------------------------------------------------------
     Wheel handler
     ----------------------------------------------------------------- */

  function onWheel(e) {
    if (mediaFullyExpanded && e.deltaY > 0) return;

    if (mediaFullyExpanded && e.deltaY < 0 && window.scrollY <= 5) {
      e.preventDefault();
      mediaFullyExpanded = false;
      stopLenis();
      targetProgress = 0.99;
      startLoop();
      return;
    }

    if (!mediaFullyExpanded) {
      e.preventDefault();
      var delta = e.deltaY * 0.0009;
      targetProgress = Math.min(Math.max(targetProgress + delta, 0), 1);
      startLoop();
    }
  }

  window.addEventListener('wheel', onWheel, { passive: false, capture: true });

  /* -----------------------------------------------------------------
     Scroll lock
     ----------------------------------------------------------------- */

  window.addEventListener('scroll', function () {
    if (!mediaFullyExpanded) {
      window.scrollTo(0, 0);
    }
  });

  /* -----------------------------------------------------------------
     Touch handlers
     ----------------------------------------------------------------- */

  window.addEventListener('touchstart', function (e) {
    touchStartY = e.touches[0].clientY;
  }, { passive: false });

  window.addEventListener('touchmove', function (e) {
    if (!touchStartY) return;

    var touchY = e.touches[0].clientY;
    var deltaY = touchStartY - touchY;

    if (mediaFullyExpanded && deltaY < -20 && window.scrollY <= 5) {
      e.preventDefault();
      mediaFullyExpanded = false;
      stopLenis();
      targetProgress = 0.99;
      startLoop();
    } else if (!mediaFullyExpanded) {
      e.preventDefault();
      var factor = deltaY < 0 ? 0.008 : 0.005;
      targetProgress = Math.min(Math.max(targetProgress + deltaY * factor, 0), 1);
      touchStartY = touchY;
      startLoop();
    }
  }, { passive: false });

  window.addEventListener('touchend', function () {
    touchStartY = 0;
  });

  /* -----------------------------------------------------------------
     Resize
     ----------------------------------------------------------------- */

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      render(currentProgress);
    }, 100);
  });

  /* -----------------------------------------------------------------
     Initial render
     ----------------------------------------------------------------- */

  render(0);

})();
