/* ==========================================================================
   03-members-marquee.js — members-marquee
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
      const root = document.getElementById('membersMarquee');
      const track = document.getElementById('membersTrack');
      const set = track && track.querySelector('[data-marquee-set]');
      if (!root || !track || !set) return;

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const fillTrack = () => {
        while (track.children.length > 1) track.removeChild(track.lastChild);
        const viewport = root.offsetWidth || window.innerWidth;
        const setWidth = set.offsetWidth;
        if (!setWidth) return 0;
        // Enough copies to cover viewport twice — no empty gap mid-loop
        const copies = Math.max(2, Math.ceil((viewport * 2) / setWidth) + 1);
        for (let i = 1; i < copies; i++) {
          const clone = set.cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          clone.querySelectorAll('[alt]').forEach((img) => img.setAttribute('alt', ''));
          track.appendChild(clone);
        }
        return set.offsetWidth;
      };

      let setWidth = fillTrack();
      if (reduceMotion || !setWidth) return;

      let offset = 0;
      const speed = 0.6; // px per frame ~36px/s
      let paused = false;
      let rafId = 0;

      root.addEventListener('mouseenter', () => { paused = true; });
      root.addEventListener('mouseleave', () => { paused = false; });

      const tick = () => {
        if (!paused) {
          offset -= speed;
          if (Math.abs(offset) >= setWidth) {
            offset += setWidth; // wrap seamlessly
          }
          track.style.transform = `translate3d(${offset}px,0,0)`;
        }
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);

      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          offset = 0;
          track.style.transform = 'translate3d(0,0,0)';
          setWidth = fillTrack();
        }, 150);
      });
    });
