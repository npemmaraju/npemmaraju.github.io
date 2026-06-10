// ============================================================
// Sketch Aesthetic JS
// 1. Dark mode — respects system preference
// 2. Scroll-in animations — sections sketch in as you scroll
// ============================================================

(function () {
  'use strict';

  // ── Dark mode ─────────────────────────────────────────────
  function applyDarkMode() {
    var prefersDark = window.matchMedia &&
                      window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  applyDarkMode();

  // Listen for system preference changes (e.g., user switches OS theme)
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', applyDarkMode);
  }

  // ── Scroll-in animations ──────────────────────────────────
  // Elements with class .sketch-fade fade + rise into view
  // when they enter the viewport (simulates being "sketched in").
  function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: just make everything visible immediately
      var els = document.querySelectorAll('.sketch-fade');
      for (var i = 0; i < els.length; i++) {
        els[i].classList.add('visible');
      }
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Stagger siblings slightly for a natural sketching-in effect
          var siblings = entry.target.parentElement
            ? entry.target.parentElement.querySelectorAll('.sketch-fade')
            : [];
          var idx = Array.prototype.indexOf.call(siblings, entry.target);
          var delay = Math.min(idx * 60, 300); // max 300ms stagger
          setTimeout(function () {
            entry.target.classList.add('visible');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    var targets = document.querySelectorAll('.sketch-fade');
    for (var j = 0; j < targets.length; j++) {
      observer.observe(targets[j]);
    }
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimations);
  } else {
    initScrollAnimations();
  }

})();
