/* ==========================================================================
   04-integration-rails.js — integ-connector-rails
   Clean fan: each platform → one point on the White Store OS circle
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
      const diagram = document.getElementById('integDiagram');
      const clients = document.getElementById('integClients');
      const rails = document.getElementById('integLeftRails');
      const svg = document.getElementById('integLeftSvg');
      const hub = document.getElementById('integHub');
      if (!diagram || !clients || !rails || !svg || !hub) return;

      const draw = () => {
        if (window.matchMedia('(max-width: 767px)').matches) {
          svg.innerHTML = '';
          return;
        }

        const hubGraph = hub.querySelector('.integ-hub-graph') || hub;
        const diagramRect = diagram.getBoundingClientRect();
        const hubRect = hubGraph.getBoundingClientRect();
        const clientRect = clients.getBoundingClientRect();

        // Keep spacer tall enough for layout balance
        rails.style.height = Math.round(clientRect.height) + 'px';

        const w = Math.max(1, Math.round(diagramRect.width));
        const h = Math.max(1, Math.round(diagramRect.height));
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        svg.setAttribute('width', String(w));
        svg.setAttribute('height', String(h));

        // Hub circle in diagram-local coords
        const hubCx = hubRect.left + hubRect.width / 2 - diagramRect.left;
        const hubCy = hubRect.top + hubRect.height / 2 - diagramRect.top;
        // Outer ring ≈ 82% of half-size; keep arrow slightly clear of the circle
        const hubR = hubRect.width * 0.41;
        const gap = 32;

        // All lines meet left of the circle (not touching the edge)
        const tipX = hubCx - hubR - gap;
        const tipY = hubCy;
        // Stroke ends just before chevron
        const endX = tipX - 1;

        const items = clients.querySelectorAll('.integ-platform');
        let paths = '';

        items.forEach((el) => {
          const r = el.getBoundingClientRect();
          const startX = r.right - diagramRect.left + 2;
          const startY = r.top + r.height / 2 - diagramRect.top;
          const span = endX - startX;

          // Horizontal run, then soft merge into the tip
          const c1x = startX + span * 0.55;
          const c1y = startY;
          const c2x = endX - Math.min(36, span * 0.22);
          const c2y = tipY;

          paths += `<path class="integ-dash integ-flow-line" d="M ${startX.toFixed(1)} ${startY.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${endX.toFixed(1)} ${tipY.toFixed(1)}" stroke="#94a3b8" stroke-width="1.6" stroke-linecap="round" fill="none"/>`;
        });

        // Chevron arrow on the circle
        paths += `<path d="M ${(tipX - 9).toFixed(1)} ${(tipY - 5.5).toFixed(1)} L ${tipX.toFixed(1)} ${tipY.toFixed(1)} L ${(tipX - 9).toFixed(1)} ${(tipY + 5.5).toFixed(1)}" stroke="#2C6B74" stroke-width="2.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

        svg.innerHTML = paths;
      };

      const schedule = () => requestAnimationFrame(() => requestAnimationFrame(draw));
      schedule();
      window.addEventListener('load', schedule);
      window.addEventListener('resize', schedule);
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(schedule);
        ro.observe(diagram);
        ro.observe(hub);
      }
      const mo = new MutationObserver(schedule);
      mo.observe(diagram, { attributes: true, attributeFilter: ['class'] });
      setTimeout(schedule, 300);
      setTimeout(schedule, 800);
    });
