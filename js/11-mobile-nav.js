/* ==========================================================================
   11-mobile-nav.js — hamburger menu (Partner With Us + section links)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('mobileMenu');
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  /* Sticky panes report a stuck offsetTop once you have scrolled past them.
     Walk earlier siblings so an upward jump still lands on the real page. */
  const pageTop = (el) => {
    const stack = el.closest('.cover-stack');
    if (!stack) return el.getBoundingClientRect().top + window.scrollY;
    let y = 0;
    let node = stack;
    while (node && node !== document.body && node !== document.documentElement) {
      y += node.offsetTop;
      node = node.offsetParent;
    }
    for (const child of stack.children) {
      if (child === el) break;
      y += child.offsetHeight;
    }
    return y;
  };

  const openPage = (href) => {
    const id = (href || '').replace(/^#/, '');
    const page = id ? document.getElementById(id) : null;
    setOpen(false);
    if (!page) return;
    const top = pageTop(page);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    history.pushState(null, '', '#' + id);
  };

  menu.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      openPage(link.getAttribute('href'));
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });

  document.addEventListener('click', (event) => {
    if (menu.hidden) return;
    if (event.target.closest('#siteNav')) return;
    setOpen(false);
  });
});
