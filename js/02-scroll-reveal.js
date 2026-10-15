/* ==========================================================================
   02-scroll-reveal.js — scroll-animations
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
      const revealItems = document.querySelectorAll('.reveal-item');
      
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      });

      revealItems.forEach(el => observer.observe(el));
    });
