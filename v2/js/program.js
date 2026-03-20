/* ==========================================================================
   WAGA WELLNESS — Program Page Scripts

   Sticky day indicator + scroll indicator fade.
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
     2. STICKY DAY INDICATOR
     Shows "Day X of 5" when scrolling through day sections.
     ------------------------------------------------------------------- */

  var indicator = document.getElementById('day-indicator');
  var indicatorText = document.querySelector('.day-indicator-text');
  var indicatorFill = document.getElementById('day-indicator-fill');
  var daySections = document.querySelectorAll('.day-section');

  if (indicator && daySections.length > 0) {
    var currentDay = 0;
    var isInDayZone = false;

    // Track which day sections are visible
    var dayObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var day = parseInt(entry.target.getAttribute('data-day'), 10);
            if (day && day !== currentDay) {
              currentDay = day;
              indicatorText.textContent = 'Day ' + day + ' of 5';
              indicatorFill.style.width = (day * 20) + '%';
            }
          }
        });
      },
      {
        // Trigger when the top 40% of the viewport contains the section
        rootMargin: '-10% 0px -50% 0px',
        threshold: 0
      }
    );

    daySections.forEach(function (section) {
      dayObserver.observe(section);
    });

    // Show/hide indicator based on whether we're in the day zone
    var zoneObserver = new IntersectionObserver(
      function (entries) {
        var anyVisible = false;
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            anyVisible = true;
          }
        });

        // Check if any day section is currently in view
        if (anyVisible && !isInDayZone) {
          isInDayZone = true;
          indicator.classList.add('visible');
        }
      },
      {
        rootMargin: '0px',
        threshold: 0.05
      }
    );

    daySections.forEach(function (section) {
      zoneObserver.observe(section);
    });

    // Separate observer to detect when we've left ALL day sections
    var leaveObserver = new IntersectionObserver(
      function () {
        var anyInView = false;
        daySections.forEach(function (section) {
          var rect = section.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            anyInView = true;
          }
        });

        if (!anyInView && isInDayZone) {
          isInDayZone = false;
          indicator.classList.remove('visible');
        }
      },
      {
        rootMargin: '50px',
        threshold: 0
      }
    );

    // Observe sentinel elements around the day zone
    var firstDay = daySections[0];
    var lastDay = daySections[daySections.length - 1];
    leaveObserver.observe(firstDay);
    leaveObserver.observe(lastDay);

    // Also use scroll to check zone exit (more reliable)
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          if (isInDayZone) {
            var anyInView = false;
            daySections.forEach(function (section) {
              var rect = section.getBoundingClientRect();
              if (rect.top < window.innerHeight && rect.bottom > 0) {
                anyInView = true;
              }
            });
            if (!anyInView) {
              isInDayZone = false;
              indicator.classList.remove('visible');
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

})();
