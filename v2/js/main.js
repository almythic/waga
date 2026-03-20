/* ==========================================================================
   WAGA WELLNESS — Global Scripts

   Component loader, mobile menu, sticky header, scroll reveal, smooth scroll.
   ========================================================================== */

(function () {
  'use strict';

  /* -------------------------------------------------------------------
     0. COMPONENT LOADER
     Fetches header.html and footer.html from /components/ and injects
     them into placeholder elements, then initialises the rest of the UI.
     ------------------------------------------------------------------- */

  function loadComponent(el, url) {
    return fetch(url)
      .then(function (res) { return res.text(); })
      .then(function (html) {
        // Use DOMParser to safely handle Live Server's injected scripts
        // and any full-document wrapping it may add to fetched HTML files.
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        doc.querySelectorAll('script').forEach(function (s) { s.remove(); });

        // Replace the placeholder div with the actual parsed elements.
        // This avoids an extra wrapper <div> that can break layout
        // (e.g. footer grid expects <footer> as a direct body child).
        var frag = document.createDocumentFragment();
        while (doc.body.firstChild) {
          frag.appendChild(doc.body.firstChild);
        }
        el.parentNode.replaceChild(frag, el);
      });
  }

  var headerSlot = document.getElementById('site-header');
  var footerSlot = document.getElementById('site-footer');

  var loads = [];
  if (headerSlot) loads.push(loadComponent(headerSlot, 'components/header.html'));
  if (footerSlot) loads.push(loadComponent(footerSlot, 'components/footer.html'));

  Promise.all(loads).then(init);


  /* -------------------------------------------------------------------
     INIT — runs after header/footer are in the DOM
     ------------------------------------------------------------------- */

  function init() {

    /* -------------------------------------------------------------------
       1. REDUCED MOTION DETECTION
       ------------------------------------------------------------------- */

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function getReducedMotion() {
      return prefersReducedMotion.matches;
    }


    /* -------------------------------------------------------------------
       1b. LENIS SMOOTH SCROLL
       ------------------------------------------------------------------- */

    var lenis = null;

    if (typeof Lenis !== 'undefined' && !getReducedMotion()) {
      lenis = new Lenis({
        duration: 1.2,
        easing: function (t) {
          return Math.min(1, 1.001 - Math.pow(2, -10 * t));
        },
        smoothWheel: true
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    // Expose Lenis globally so hero.js can stop/start it
    window.__lenis = lenis;


    /* -------------------------------------------------------------------
       2. MOBILE MENU
       ------------------------------------------------------------------- */

    var navToggle = document.querySelector('.nav-toggle');
    var navMobile = document.querySelector('.nav-mobile');
    var mobileLinks = document.querySelectorAll('.nav-mobile-link');

    function openMenu() {
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Close menu');
      navMobile.classList.add('open');
      document.body.classList.add('menu-open');
    }

    function closeMenu() {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
      navMobile.classList.remove('open');
      document.body.classList.remove('menu-open');
    }

    function toggleMenu() {
      var isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    if (navToggle && navMobile) {
      navToggle.addEventListener('click', toggleMenu);

      mobileLinks.forEach(function (link) {
        link.addEventListener('click', closeMenu);
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
          closeMenu();
          navToggle.focus();
        }
      });
    }


    /* -------------------------------------------------------------------
       3. STICKY HEADER
       ------------------------------------------------------------------- */

    var header = document.querySelector('.site-header');

    if (header) {
      var sentinel = document.createElement('div');
      sentinel.setAttribute('aria-hidden', 'true');
      sentinel.style.position = 'absolute';
      sentinel.style.top = '0';
      sentinel.style.height = '1px';
      sentinel.style.width = '1px';
      document.body.prepend(sentinel);

      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            header.classList.toggle('scrolled', !entry.isIntersecting);
          });
        },
        { threshold: 0 }
      );

      observer.observe(sentinel);
    }


    /* -------------------------------------------------------------------
       4. SCROLL REVEAL
       ------------------------------------------------------------------- */

    if (!getReducedMotion()) {
      var reveals = document.querySelectorAll('.reveal');

      if (reveals.length > 0) {
        var revealObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
              }
            });
          },
          {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
          }
        );

        reveals.forEach(function (el) {
          revealObserver.observe(el);
        });
      }
    } else {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('revealed');
      });
    }


    /* -------------------------------------------------------------------
       5. SMOOTH SCROLL FOR ANCHOR LINKS
       ------------------------------------------------------------------- */

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;

        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          if (lenis) {
            lenis.scrollTo(target);
          } else {
            target.scrollIntoView({
              behavior: getReducedMotion() ? 'auto' : 'smooth',
              block: 'start'
            });
          }
        }
      });
    });


    /* -------------------------------------------------------------------
       6. ACTIVE NAV LINK (based on current page)
       ------------------------------------------------------------------- */

    var currentPage = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.nav-link').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === currentPage) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    document.querySelectorAll('.nav-mobile-link').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === currentPage) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    /* -------------------------------------------------------------------
       7. STAT COUNTER ANIMATION
       ------------------------------------------------------------------- */

    if (!getReducedMotion()) {
      var statEls = document.querySelectorAll('[data-count-to]');

      if (statEls.length > 0) {
        var countObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                var el = entry.target;
                var target = parseInt(el.getAttribute('data-count-to'), 10);
                var suffix = el.getAttribute('data-count-suffix') || '';
                var duration = 1200;
                var start = performance.now();

                function step(now) {
                  var progress = Math.min((now - start) / duration, 1);
                  var eased = 1 - Math.pow(1 - progress, 3);
                  var current = Math.round(eased * target);
                  el.textContent = (current >= 1000 ? current.toLocaleString() : current) + suffix;
                  if (progress < 1) {
                    requestAnimationFrame(step);
                  }
                }

                requestAnimationFrame(step);
                countObserver.unobserve(el);
              }
            });
          },
          { threshold: 0.5 }
        );

        statEls.forEach(function (el) {
          el.textContent = '0' + (el.getAttribute('data-count-suffix') || '');
          countObserver.observe(el);
        });
      }
    }


    /* -------------------------------------------------------------------
       8. PINNED SCROLL-SCRUBBED VIDEO (Heritage section)

       The section is made tall (scroll runway). A sticky inner wrapper
       pins the visible content to the viewport. Scroll progress through
       the runway maps 1:1 to video currentTime. Content fades in at ~30%.
       ------------------------------------------------------------------- */

    var scrubVideo = document.getElementById('aboutScrubVideo');
    var scrubSection = document.getElementById('homeAbout');
    var aboutContent = document.getElementById('aboutContent');

    if (scrubVideo && scrubSection) {
      var RUNWAY_MULTIPLIER = 5;

      function initScrub() {
        var duration = scrubVideo.duration;
        if (!duration || isNaN(duration)) return;

        scrubVideo.pause();

        var viewH = window.innerHeight;
        scrubSection.style.height = (viewH * RUNWAY_MULTIPLIER) + 'px';

        var contentShown = false;
        var targetTime = 0;
        var currentTime = 0;
        var isAnimating = false;

        function updateScrollTarget() {
          var rect = scrubSection.getBoundingClientRect();
          var scrolled = -rect.top;
          var scrollable = scrubSection.offsetHeight - viewH;
          if (scrollable <= 0) return;

          var progress = Math.min(Math.max(scrolled / scrollable, 0), 1);
          targetTime = progress * duration;

          if (progress > 0.3 && !contentShown) {
            contentShown = true;
            if (aboutContent) aboutContent.classList.add('is-visible');
          } else if (progress <= 0.25 && contentShown) {
            contentShown = false;
            if (aboutContent) aboutContent.classList.remove('is-visible');
          }

          if (!isAnimating) {
            isAnimating = true;
            requestAnimationFrame(lerpFrame);
          }
        }

        function lerpFrame() {
          var diff = targetTime - currentTime;
          currentTime += diff * 0.12;
          currentTime = Math.min(Math.max(currentTime, 0), duration);

          if (Math.abs(scrubVideo.currentTime - currentTime) > 0.015) {
            scrubVideo.currentTime = currentTime;
          }

          if (Math.abs(diff) > 0.01) {
            requestAnimationFrame(lerpFrame);
          } else {
            currentTime = targetTime;
            scrubVideo.currentTime = currentTime;
            isAnimating = false;
          }
        }

        window.addEventListener('scroll', updateScrollTarget, { passive: true });

        window.addEventListener('resize', function () {
          viewH = window.innerHeight;
          scrubSection.style.height = (viewH * RUNWAY_MULTIPLIER) + 'px';
        });

        updateScrollTarget();
      }

      if (scrubVideo.readyState >= 1) {
        initScrub();
      } else {
        scrubVideo.addEventListener('loadedmetadata', initScrub);
      }
    }

    /* -------------------------------------------------------------------
       9. UNBOX SCENE SCROLL (Home)
       ------------------------------------------------------------------- */

    var unboxSection = document.querySelector('.home-unbox-scenes');
    var unboxImgs    = document.querySelectorAll('.home-unbox-img');
    var unboxContent = document.querySelectorAll('.home-unbox-content');
    var unboxCounter = document.querySelector('.home-unbox-counter-current');

    if (unboxSection && unboxImgs.length > 0) {
      if (!getReducedMotion()) {
        var UNBOX_TOTAL = unboxImgs.length;

        // Stack images in order — each sits on top of the previous
        unboxImgs.forEach(function(img, i) { img.style.zIndex = i + 1; });

        var unboxActiveContent = -1;

        function setUnboxContent(n) {
          if (n === unboxActiveContent) return;
          unboxActiveContent = n;
          unboxContent.forEach(function(c, i) { 
            c.classList.toggle('is-active', i === n); 
          });
          if (unboxCounter) {
            unboxCounter.textContent = '0' + (n + 1);
          }
        }

        function updateUnbox() {
          var rect     = unboxSection.getBoundingClientRect();
          var scrolled = -rect.top;

          // Above the section — show first image, hide the rest
          if (scrolled <= 0) {
            unboxImgs.forEach(function(img, i) {
              img.style.transform = i === 0 ? 'translateY(0)' : 'translateY(100%)';
            });
            setUnboxContent(0);
            return;
          }

          var viewH = window.innerHeight;
          var scrollable = unboxSection.offsetHeight - viewH;
          if (scrollable <= 0) return;

          // progress 0→1 maps across TOTAL-1 transitions (5 for 6 images)
          var progress = Math.min(scrolled / scrollable, 1);
          var raw      = progress * (UNBOX_TOTAL - 1); // 0 to 5
          var scene    = Math.floor(raw);              // which image is fully visible
          var within   = raw - scene;                  // 0→1: how far into the next reveal

          unboxImgs.forEach(function(img, i) {
            if (i <= scene) {
              // Already revealed — sit at top, covered by images above
              img.style.transform = 'translateY(0)';
            } else if (i === scene + 1) {
              // The next image sliding up in real time
              img.style.transform = 'translateY(' + ((1 - within) * 100) + '%)';
            } else {
              // Future images — waiting below
              img.style.transform = 'translateY(100%)';
            }
          });

          // Switch content label when the incoming image is more than halfway up
          var contentIdx = (within >= 0.5 && scene < UNBOX_TOTAL - 1) ? scene + 1 : scene;
          setUnboxContent(contentIdx);
        }

        updateUnbox();
        window.addEventListener('scroll', updateUnbox, { passive: true });
        window.addEventListener('resize', updateUnbox, { passive: true });
      } else {
        // Reduced motion fallback fallback
        unboxImgs.forEach(function(img) { img.style.transform = 'translateY(0)'; });
        if (unboxContent[0]) unboxContent[0].classList.add('is-active');
      }
    }

    /* -------------------------------------------------------------------
       10. SCIENCE CELLULAR ATLAS SCROLL (Home)
       ------------------------------------------------------------------- */

    var scienceSection  = document.querySelector('.home-science-scroll-section');
    var scienceVisual   = document.querySelector('.home-science-visual');
    var scienceContents = document.querySelectorAll('.home-science-content');
    var scienceCounter  = document.querySelector('.home-science-counter-current');

    if (scienceSection && scienceContents.length > 0) {
      if (!getReducedMotion()) {
        var SCIENCE_TOTAL = scienceContents.length;
        var scienceActiveIdx = -1;

        function setScienceContent(n) {
          if (n === scienceActiveIdx) return;
          scienceActiveIdx = n;
          scienceContents.forEach(function(c, i) {
            c.classList.toggle('is-active', i === n);
          });
          if (scienceCounter) {
            scienceCounter.textContent = '0' + (n + 1);
          }
          if (scienceVisual) {
            scienceVisual.setAttribute('data-state', String(n));
          }
        }

        function updateScience() {
          var rect     = scienceSection.getBoundingClientRect();
          var scrolled = -rect.top;

          if (scrolled <= 0) {
            setScienceContent(0);
            return;
          }

          var viewH = window.innerHeight;
          var scrollable = scienceSection.offsetHeight - viewH;
          if (scrollable <= 0) return;

          var progress = Math.min(scrolled / scrollable, 1);
          var stage = Math.floor(progress * SCIENCE_TOTAL);
          stage = Math.min(stage, SCIENCE_TOTAL - 1);

          setScienceContent(stage);
        }

        updateScience();
        window.addEventListener('scroll', updateScience, { passive: true });
        window.addEventListener('resize', updateScience, { passive: true });
      } else {
        scienceContents.forEach(function(c) { c.classList.add('is-active'); });
        if (scienceCounter) scienceCounter.textContent = '04';
        if (scienceVisual) scienceVisual.setAttribute('data-state', '3');
      }
    }


    /* -------------------------------------------------------------------
       11. SCIENCE PARTICLE FIELD (Home)
       Canvas-driven particles in concentric zones around the SVG.
       Behavior shifts per data-state on .home-science-visual.
       ------------------------------------------------------------------- */

    var particleCanvas = document.querySelector('.home-science-particles');
    var particleVisual = document.querySelector('.home-science-visual');

    if (particleCanvas && particleVisual && !getReducedMotion()) {
      var ctx = particleCanvas.getContext('2d');
      var PARTICLE_COUNT = 80;
      var particles = [];
      var canvasW, canvasH, cx, cy;

      // State colors (rgb values to use with alpha)
      var stateColors = [
        [185, 148, 112],  // 0 Metabolism — camel
        [120, 61, 25],    // 1 Gut — russet
        [95, 111, 82],    // 2 Inflammation — olive
        [196, 102, 31]    // 3 Hormones — alloy
      ];

      function resizeCanvas() {
        var rect = particleCanvas.parentElement.getBoundingClientRect();
        var dpr = window.devicePixelRatio || 1;
        canvasW = rect.width;
        canvasH = rect.height;
        particleCanvas.width = canvasW * dpr;
        particleCanvas.height = canvasH * dpr;
        particleCanvas.style.width = canvasW + 'px';
        particleCanvas.style.height = canvasH + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cx = canvasW / 2;
        cy = canvasH / 2;
      }

      function createParticle(i) {
        // Place in concentric zones: inner (30%), mid (40%), outer (30%)
        var zone = Math.random();
        var minR, maxR;
        if (zone < 0.3) {
          minR = 80; maxR = 160;
        } else if (zone < 0.7) {
          minR = 160; maxR = 300;
        } else {
          minR = 300; maxR = Math.min(canvasW, canvasH) * 0.48;
        }

        var angle = Math.random() * Math.PI * 2;
        var dist = minR + Math.random() * (maxR - minR);

        return {
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          baseX: cx + Math.cos(angle) * dist,
          baseY: cy + Math.sin(angle) * dist,
          angle: angle,
          dist: dist,
          baseDist: dist,
          size: 1.5 + Math.random() * 2,
          baseAlpha: 0.15 + Math.random() * 0.35,
          alpha: 0,
          speed: 0.0003 + Math.random() * 0.0008,
          drift: 0.2 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2,
          zone: zone < 0.3 ? 0 : (zone < 0.7 ? 1 : 2)
        };
      }

      function initParticles() {
        particles = [];
        for (var i = 0; i < PARTICLE_COUNT; i++) {
          particles.push(createParticle(i));
        }
      }

      var currentState = 0;
      var lastTime = 0;

      function drawParticles(time) {
        if (!lastTime) lastTime = time;
        var dt = time - lastTime;
        lastTime = time;

        var state = parseInt(particleVisual.getAttribute('data-state') || '0', 10);
        currentState = state;
        var color = stateColors[state] || stateColors[0];

        ctx.clearRect(0, 0, canvasW, canvasH);

        for (var i = 0; i < particles.length; i++) {
          var p = particles[i];

          // Orbit slowly
          p.angle += p.speed * (dt / 16);

          // State-dependent radial behavior
          var targetDist = p.baseDist;
          var driftMult = 1;

          if (state === 0) {
            // Metabolism — radiate outward with pulse
            var pulse = Math.sin(time * 0.001 + p.phase) * 0.5 + 0.5;
            targetDist = p.baseDist + pulse * 30;
            driftMult = 1.2;
          } else if (state === 1) {
            // Gut — branch sideways, inner particles spread
            if (p.zone === 0) {
              targetDist = p.baseDist + 25;
            }
            driftMult = 1.5;
          } else if (state === 2) {
            // Inflammation — contract inward
            targetDist = p.baseDist * 0.82;
            driftMult = 0.6;
          } else if (state === 3) {
            // Hormones — expand, everything active
            targetDist = p.baseDist + 15;
            driftMult = 1.3;
          }

          // Smooth lerp toward target distance
          p.dist += (targetDist - p.dist) * 0.02;

          // Compute position with drift
          var driftX = Math.sin(time * 0.0005 + p.phase) * p.drift * driftMult;
          var driftY = Math.cos(time * 0.0007 + p.phase * 1.3) * p.drift * driftMult;
          p.x = cx + Math.cos(p.angle) * p.dist + driftX;
          p.y = cy + Math.sin(p.angle) * p.dist + driftY;

          // Alpha — twinkle effect
          var twinkle = Math.sin(time * 0.002 + p.phase) * 0.3 + 0.7;
          var targetAlpha = p.baseAlpha * twinkle;

          // Outer particles more transparent
          var edgeFade = 1 - Math.max(0, (p.dist - 250) / (Math.min(canvasW, canvasH) * 0.4));
          edgeFade = Math.max(0.1, Math.min(1, edgeFade));
          targetAlpha *= edgeFade;

          p.alpha += (targetAlpha - p.alpha) * 0.05;

          // Draw
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + p.alpha + ')';
          ctx.fill();
        }

        requestAnimationFrame(drawParticles);
      }

      resizeCanvas();
      initParticles();
      requestAnimationFrame(drawParticles);

      window.addEventListener('resize', function() {
        resizeCanvas();
        // Re-center particles
        for (var i = 0; i < particles.length; i++) {
          var p = particles[i];
          p.baseX = cx + Math.cos(p.angle) * p.baseDist;
          p.baseY = cy + Math.sin(p.angle) * p.baseDist;
        }
      });
    }


  } // end init

})();
