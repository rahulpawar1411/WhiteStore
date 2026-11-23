/**
 * WhiteStores Shared Navigation Module
 * Unified mobile drawer, submenu expansion, scroll lock, keyboard support & accessibility.
 */
(function () {
  'use strict';

  function initNavigation() {
    var drawer = document.getElementById('ws-mobile-drawer');
    var openBtn = document.getElementById('ws-mobile-menu-btn') || document.querySelector('header button[aria-label*="menu" i], header button[id*="mobile" i]');
    var closeBtn = document.getElementById('ws-close-menu');
    var solToggle = document.getElementById('ws-solutions-toggle');
    var solSubmenu = document.getElementById('ws-solutions-submenu');

    var savedScrollY = 0;

    function openMenu() {
      if (!drawer || drawer.classList.contains('is-open')) return;
      savedScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');

      // Comprehensive cross-device scroll lock on underlying page
      document.documentElement.classList.add('ws-menu-locked');
      document.body.classList.add('ws-menu-locked');
      document.body.style.position = 'fixed';
      document.body.style.top = '-' + savedScrollY + 'px';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
      if (closeBtn) closeBtn.focus();
    }

    function restoreScrollY(y) {
      var html = document.documentElement;
      var prev = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';
      if (typeof window.scrollTo === 'function') {
        window.scrollTo({ top: y, left: 0, behavior: 'auto' });
      } else {
        window.scrollTo(0, y);
      }
      html.scrollTop = y;
      document.body.scrollTop = y;
      html.style.scrollBehavior = prev;
    }

    function closeMenu() {
      if (!drawer || !drawer.classList.contains('is-open')) return;

      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');

      // Restore normal page scrolling
      document.documentElement.classList.remove('ws-menu-locked');
      document.body.classList.remove('ws-menu-locked');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';

      // Instant restore — avoid smooth auto-scroll from html { scroll-behavior }
      restoreScrollY(savedScrollY);

      if (openBtn) {
        openBtn.setAttribute('aria-expanded', 'false');
      }
    }

    // Direct open button click
    if (openBtn) {
      openBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (drawer && drawer.classList.contains('is-open')) {
          closeMenu();
        } else {
          openMenu();
        }
      });
    }

    // Event delegation for any header button matching mobile trigger
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('header button[id*="mobile" i], header button[aria-label*="menu" i], header button[aria-label*="navigation" i]');
      if (trigger && trigger !== openBtn) {
        e.preventDefault();
        openMenu();
      }
    });

    // Close button
    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        closeMenu();
      });
    }

    // Backdrop click: close if user clicks directly on the drawer background
    if (drawer) {
      drawer.addEventListener('click', function (e) {
        if (e.target === drawer) {
          closeMenu();
        }
      });

      // Prevent background touch scrolling outside the white menu panel
      drawer.addEventListener('touchmove', function (e) {
        if (!e.target.closest('.ws-mobile-nav-scroll') && !e.target.closest('.ws-mobile-footer')) {
          e.preventDefault();
        }
      }, { passive: false });
    }

    // Solutions Submenu Toggle
    if (solToggle && solSubmenu) {
      solToggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var isOpen = solSubmenu.classList.toggle('is-open');
        solToggle.classList.toggle('is-active', isOpen);
        solToggle.setAttribute('aria-expanded', String(isOpen));
        var chevron = solToggle.querySelector('.ws-chevron-icon');
        if (chevron) {
          chevron.style.transform = isOpen ? 'rotate(180deg)' : '';
        }
      });
    }

    // Keyboard support: Escape key closes menu
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) {
        closeMenu();
        if (openBtn) {
          // preventFocusScroll: don't jump page when returning focus to hamburger
          try {
            openBtn.focus({ preventScroll: true });
          } catch (err) {
            openBtn.focus();
          }
        }
      }
    });

    // Close drawer when navigating via link (same-page #hash still needs close)
    if (drawer) {
      drawer.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          closeMenu();
        });
      });
    }

    // Close drawer if resized to desktop width (>= 1024px)
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024 && drawer && drawer.classList.contains('is-open')) {
        closeMenu();
      }
    });

    // Desktop Solutions Dropdown Click & Keyboard Accessibility
    var solBtn = document.querySelector('.ws-solutions-btn');
    var solWrapper = document.querySelector('.ws-dropdown-wrapper');
    var solChevron = document.querySelector('.ws-dropdown-chevron');

    if (solBtn && solWrapper) {
      solBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var isOpen = solWrapper.classList.toggle('is-open');
        solBtn.setAttribute('aria-expanded', String(isOpen));
        if (solChevron) {
          solChevron.style.transform = isOpen ? 'rotate(180deg)' : '';
        }
      });

      // Close when clicking outside
      document.addEventListener('click', function (e) {
        if (!solBtn.contains(e.target) && !solWrapper.contains(e.target)) {
          if (solWrapper.classList.contains('is-open')) {
            solWrapper.classList.remove('is-open');
            solBtn.setAttribute('aria-expanded', 'false');
            if (solChevron) {
              solChevron.style.transform = '';
            }
          }
        }
      });

      // Close on Escape key
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && solWrapper.classList.contains('is-open')) {
          solWrapper.classList.remove('is-open');
          solBtn.setAttribute('aria-expanded', 'false');
          if (solChevron) {
            solChevron.style.transform = '';
          }
          solBtn.focus();
        }
      });
    }

    // Dynamic Navbar Border & Shadow on Scroll
    var navbar = document.querySelector('.ws-navbar');
    if (navbar) {
      function updateNavScroll() {
        var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        if (scrollY > 10) {
          navbar.classList.add('ws-nav-scrolled');
        } else {
          navbar.classList.remove('ws-nav-scrolled');
        }
      }
      window.addEventListener('scroll', updateNavScroll, { passive: true });
      updateNavScroll();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
  } else {
    initNavigation();
  }
})();
