/* ==========================================================================
   06-store-gallery.js — store-gallery-slider
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
      const stage = document.getElementById('storeStage');
      const dotsWrap = document.getElementById('storeDots');
      const nameEl = document.getElementById('storeStageName');
      if (!stage) return;

      const slides = Array.from(stage.querySelectorAll('.store-stage-img'));
      if (!slides.length) return;

      let index = Math.max(0, slides.findIndex((s) => s.classList.contains('is-active')));
      let timer = null;
      const INTERVAL = 4500;

      const paintDots = () => {
        if (!dotsWrap) return;
        dotsWrap.innerHTML = slides.map((_, i) =>
          `<button type="button" class="store-dot${i === index ? ' is-active' : ''}" aria-label="Store slide ${i + 1}"></button>`
        ).join('');
        dotsWrap.querySelectorAll('.store-dot').forEach((btn, i) => {
          btn.addEventListener('click', () => goTo(i, true));
        });
      };

      const goTo = (next, user) => {
        slides[index]?.classList.remove('is-active');
        index = (next + slides.length) % slides.length;
        slides[index].classList.add('is-active');
        if (nameEl) nameEl.textContent = slides[index].dataset.hub || 'White Store';
        paintDots();
        if (user) restart();
      };

      const restart = () => {
        clearInterval(timer);
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          timer = setInterval(() => goTo(index + 1, false), INTERVAL);
        }
      };

      goTo(index, false);
      restart();
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) clearInterval(timer);
        else restart();
      });
    });
