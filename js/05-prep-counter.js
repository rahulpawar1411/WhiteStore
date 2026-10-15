/* ==========================================================================
   05-prep-counter.js — prep-speed-counter
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
      const el = document.getElementById('prepSpeedCount');
      if (!el) return;

      const targetMin = Number(el.dataset.targetMin || 1);
      const targetSec = Number(el.dataset.targetSec || 38);
      const totalTarget = targetMin * 60 + targetSec; // 98 seconds
      let played = false;

      const format = (totalSec) => {
        const m = Math.floor(totalSec / 60);
        const s = Math.floor(totalSec % 60);
        return m + '.' + String(s).padStart(2, '0');
      };

      const run = () => {
        if (played) return;
        played = true;
        const duration = 1800;
        const start = performance.now();

        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          const current = totalTarget * eased;
          el.textContent = format(current);
          if (t < 1) requestAnimationFrame(tick);
          else el.textContent = format(totalTarget); // 1.38
        };
        requestAnimationFrame(tick);
      };

      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              run();
              io.disconnect();
            }
          });
        }, { threshold: 0.4 });
        io.observe(el);
      } else {
        run();
      }
    });
