/* ==========================================================================
   09-hero-letters.js — digital-style letter rise on refresh
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nodes = document.querySelectorAll('[data-hero-letters]');
  if (!nodes.length) return;

  const wrapLetters = (el) => {
    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (!text || !text.trim() && text.indexOf(' ') === -1) return;
        const frag = document.createDocumentFragment();
        [...text].forEach((ch) => {
          if (ch === '\n') return;
          const slot = document.createElement('span');
          slot.className = 'hero-letter-slot';
          slot.setAttribute('aria-hidden', 'true');
          const letter = document.createElement('span');
          letter.className = 'hero-letter';
          letter.textContent = ch === ' ' ? '\u00A0' : ch;
          slot.appendChild(letter);
          frag.appendChild(slot);
        });
        node.parentNode.replaceChild(frag, node);
        return;
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        // Skip script/style; walk children (copy list — live NodeList mutates)
        [...node.childNodes].forEach(walk);
      }
    };
    walk(el);
  };

  const indexLetters = (el) => {
    el.querySelectorAll('.hero-letter').forEach((letter, i) => {
      letter.style.setProperty('--i', String(i));
    });
  };

  nodes.forEach((el) => {
    const plain = el.textContent;
    el.setAttribute('aria-label', plain.trim().replace(/\s+/g, ' '));
    wrapLetters(el);
    indexLetters(el);
    if (reduce) {
      el.classList.add('is-letters-ready');
      return;
    }
    // Next frame so initial transform paints, then play
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.add('is-letters-ready');
      });
    });
  });
});
