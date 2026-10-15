/* ==========================================================================
   08-hero-cursor.js — hero-cursor-bubble
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
      const hero = document.getElementById('heroSection');
      const bubble = document.getElementById('heroCursorBubble');
      if (!hero || !bubble) return;
      if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

      let targetX = 0, targetY = 0, curX = 0, curY = 0;
      let velX = 0, velY = 0;
      let scale = 0, scaleVel = 0, opacity = 0;
      let active = false, raf = 0;
      const stiffness = 0.28;
      const damping = 0.62;
      // Softer spring for enter/leave size + fade
      const appearStiff = 0.14;
      const appearDamp = 0.72;

      const paint = () => {
        const dx = targetX - curX;
        const dy = targetY - curY;
        velX = (velX + dx * stiffness) * damping;
        velY = (velY + dy * stiffness) * damping;
        curX += velX;
        curY += velY;

        const targetScale = active ? 1 : 0;
        const targetOpacity = active ? 1 : 0;
        scaleVel = (scaleVel + (targetScale - scale) * appearStiff) * appearDamp;
        scale += scaleVel;
        opacity += (targetOpacity - opacity) * 0.12;

        if (scale < 0.001) scale = 0;
        if (opacity < 0.01 && !active) opacity = 0;

        bubble.style.transform = `translate3d(${curX}px, ${curY}px, 0) scale(${scale})`;
        bubble.style.opacity = String(opacity);

        if (!active && opacity <= 0.01 && scale <= 0.01) {
          hero.classList.remove('is-cursor-active');
        }

        const moving =
          active ||
          Math.abs(dx) > 0.2 || Math.abs(dy) > 0.2 ||
          Math.abs(velX) > 0.08 || Math.abs(velY) > 0.08 ||
          Math.abs(scaleVel) > 0.002 ||
          Math.abs(targetScale - scale) > 0.01 ||
          Math.abs(targetOpacity - opacity) > 0.01;

        if (moving) {
          raf = requestAnimationFrame(paint);
        } else {
          raf = 0;
        }
      };

      const kick = () => {
        if (!raf) raf = requestAnimationFrame(paint);
      };

      hero.addEventListener('pointerenter', (e) => {
        const rect = hero.getBoundingClientRect();
        targetX = curX = e.clientX - rect.left;
        targetY = curY = e.clientY - rect.top;
        velX = 0; velY = 0;
        active = true;
        hero.classList.add('is-cursor-active');
        kick();
      });

      hero.addEventListener('pointermove', (e) => {
        const rect = hero.getBoundingClientRect();
        targetX = e.clientX - rect.left;
        targetY = e.clientY - rect.top;
        if (!active) {
          active = true;
          hero.classList.add('is-cursor-active');
        }
        kick();
      });

      hero.addEventListener('pointerleave', () => {
        active = false;
        kick();
      });
    });
