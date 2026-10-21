import { gsap } from 'gsap';

export function initNav() {
  const header = document.querySelector('.site-header');
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const drawer = document.querySelector('.mobile-nav-drawer');

  // Sticky nav header styling
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });

  // Sync active navigation link across desktop and mobile
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  let lastSegment = pathSegments.pop() || 'index.html';
  if (lastSegment === 'le-photogram' || lastSegment === 'le-photogram-2') {
    lastSegment = 'index.html';
  } else if (!lastSegment.includes('.')) {
    lastSegment = `${lastSegment}.html`;
  }
  const cleanPath = lastSegment.split('?')[0].split('#')[0];

  document.querySelectorAll('.nav-links .nav-link, .mobile-nav-links a, .mobile-sheet-menu .mobile-menu-item, .mobile-menu-signout').forEach((link) => {
    const rawHref = link.getAttribute('href');
    if (!rawHref) return;
    const linkPath = rawHref.split('?')[0].split('#')[0].split('/').filter(Boolean).pop();
    if (linkPath === cleanPath || (cleanPath === 'index.html' && (linkPath === 'index.html' || rawHref === './' || rawHref === '/' || rawHref === 'index.html'))) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  // Mobile menu toggle & bottom sheet modal handling
  if (toggleBtn && drawer) {
    const closeBtn = drawer.querySelector('.mobile-sheet-close-btn');
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const openMenu = () => {
      drawer.classList.add('active');
      toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';

      // Editorial Staggered Menu Entrance
      if (!prefersReduced) {
        const menuItems = drawer.querySelectorAll('.mobile-sheet-menu .mobile-menu-item, .mobile-menu-signout');
        if (menuItems.length) {
          gsap.fromTo(
            menuItems,
            { y: 14, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.35,
              stagger: 0.035,
              ease: 'power3.out',
              delay: 0.08,
              overwrite: 'auto',
            }
          );
        }
      }
    };

    const closeMenu = () => {
      drawer.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    toggleBtn.addEventListener('click', () => {
      const isOpen = drawer.classList.contains('active');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    closeBtn?.addEventListener('click', closeMenu);

    // Close when tapping outside the sheet on the darkened backdrop
    drawer.addEventListener('click', (e) => {
      if (e.target === drawer) {
        closeMenu();
      }
    });

    // Close on link click
    drawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('active')) {
        closeMenu();
      }
    });
  }

  // Smooth anchor scrolling
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href && href !== '#' && document.querySelector(href)) {
        e.preventDefault();
        const targetEl = document.querySelector(href);
        const top = targetEl.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}
