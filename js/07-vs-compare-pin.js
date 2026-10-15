/* ==========================================================================
   07-vs-compare-pin.js — vs-compare-pin-scroll
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
      const track = document.getElementById('vsPinTrack');
      const white = document.getElementById('vsWhitePanel');
      if (!track || !white) return;

      const mq = window.matchMedia('(max-width: 767px)');
      let target = 0;
      let current = 0;
      let raf = 0;

      const readTarget = () => {
        if (!mq.matches) {
          target = 0;
          return false;
        }
        const total = track.offsetHeight - window.innerHeight;
        if (total <= 0) {
          target = 0;
          return false;
        }
        const top = track.getBoundingClientRect().top;
        target = Math.max(0, Math.min(1, -top / total));
        return true;
      };

      const paint = (p) => {
        white.style.transform = `translate3d(0, ${(1 - p) * 100}%, 0)`;
      };

      const tick = () => {
        if (!mq.matches) {
          current = 0;
          white.style.transform = '';
          raf = 0;
          return;
        }
        readTarget();
        // Light lerp = smooth, still locked to native scroll inertia
        current += (target - current) * 0.22;
        if (Math.abs(target - current) < 0.0006) current = target;
        paint(current);
        if (Math.abs(target - current) > 0.0006) {
          raf = requestAnimationFrame(tick);
        } else {
          raf = 0;
        }
      };

      const kick = () => {
        if (!raf) raf = requestAnimationFrame(tick);
      };

      const onScroll = () => kick();
      const onResize = () => {
        current = target;
        readTarget();
        current = target;
        paint(current);
      };

      readTarget();
      current = target;
      paint(current);
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);
      mq.addEventListener('change', onResize);
    });
