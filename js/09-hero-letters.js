/* ==========================================================================
   09-hero-letters.js — digital-style letter rise on refresh
   Every line uses the same total animation window (parallel + synced).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nodes = document.querySelectorAll('[data-hero-letters]');
  if (!nodes.length) return;

  const wrapTextNode = (textNode) => {
    const text = textNode.textContent;
    if (text == null || text === '') return;
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
    textNode.parentNode.replaceChild(frag, textNode);
  };

  const wrapLetters = (el) => {
    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        wrapTextNode(node);
        return;
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'BR') return;
        [...node.childNodes].forEach(walk);
      }
    };
    walk(el);
  };

  /** Collect letter nodes per visual line (split on <br>) */
  const collectLines = (el) => {
    const lines = [[]];
    const visit = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'BR') {
          lines.push([]);
          return;
        }
        if (node.classList.contains('hero-letter')) {
          lines[lines.length - 1].push(node);
          return;
        }
        [...node.childNodes].forEach(visit);
      }
    };
    visit(el);
    return lines.filter((line) => line.length > 0);
  };

  /**
   * Same total time for every line:
   * progress 0→1 across letters, shared stagger window.
   */
  const indexLettersSynced = (el) => {
    const lines = collectLines(el);
    lines.forEach((letters) => {
      const n = letters.length;
      letters.forEach((letter, i) => {
        const progress = n <= 1 ? 0 : i / (n - 1);
        letter.style.setProperty('--i', String(i));
        letter.style.setProperty('--p', String(progress));
        letter.style.setProperty('--n', String(n));
      });
    });
  };

  // Start all hero letter blocks on the same frame
  const readyAll = () => {
    nodes.forEach((el) => el.classList.add('is-letters-ready'));
  };

  nodes.forEach((el) => {
    const plain = el.textContent;
    el.setAttribute('aria-label', plain.trim().replace(/\s+/g, ' '));
    wrapLetters(el);
    indexLettersSynced(el);
  });

  if (reduce) {
    readyAll();
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(readyAll);
  });
});
