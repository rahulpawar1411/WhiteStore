/* ==========================================================================
   01-hub-map.js — hub-location-map
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
      const frame = document.getElementById('hub-map-frame');
      const label = document.getElementById('hub-map-label');
      const dirBtn = document.getElementById('start-directions-btn');
      const hint = document.getElementById('hub-directions-hint');
      const buttons = document.querySelectorAll('.hub-loc-btn');
      if (!frame || !buttons.length) return;

      // Keep India-wide zoom; only move the pin
      const INDIA_BBOX = '70.00%2C8.50%2C95.00%2C34.50';

      function selectHub(btn) {
        const lat = parseFloat(btn.dataset.lat);
        const lng = parseFloat(btn.dataset.lng);
        const name = btn.dataset.name || 'Hub';
        const dest = btn.dataset.dest || '';

        frame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${INDIA_BBOX}&layer=mapnik&marker=${lat.toFixed(4)}%2C${lng.toFixed(4)}`;

        if (label) label.textContent = name;
        if (dirBtn) {
          dirBtn.href = `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
        }
        if (hint) hint.textContent = `Opens Google Maps navigation to ${name} hub`;

        buttons.forEach((b) => {
          const active = b === btn;
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
          b.classList.toggle('bg-brand-cream', active);
          b.classList.toggle('border', active);
          b.classList.toggle('border-brand-coral/40', active);
          b.classList.toggle('hover:bg-brand-cream/80', !active);
        });
      }

      buttons.forEach((btn) => {
        btn.addEventListener('click', () => selectHub(btn));
      });
    });
