import { initPortfolioFilter } from './portfolio-filter.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const CATEGORY_NAMES = {
  weddings: 'Weddings',
  portraits: 'Studio Portraits',
  events: 'Life Events',
  editorial: 'Editorial & Fine Art',
  'weddings portraits': 'Weddings & Portraits',
  'editorial portraits': 'Editorial & Fine Art',
  'portraits events': 'Studio Portraits',
  'weddings events': 'Weddings & Events',
  'events portraits': 'Life Events',
  'editorial events': 'Editorial & Fine Art',
  'portraits editorial': 'Editorial & Fine Art',
  'events weddings': 'Weddings & Events',
  'weddings editorial': 'Weddings',
};

/**
 * Synchronizes the public portfolio bento grid with the PHP JSON catalog API.
 * Preserves the initial static HTML as a zero-layout-shift fallback.
 */
export async function initGallerySync() {
  const bentoGrid = document.getElementById('portfolioBentoGrid');
  if (!bentoGrid) return;

  try {
    let items = null;

    const isStaticHost =
      window.location.protocol === 'file:' ||
      window.location.hostname.includes('vercel.app') ||
      window.location.hostname.includes('github.io') ||
      window.location.hostname.includes('loca.lt') ||
      window.location.port === '5173' ||
      window.location.port === '4173';

    if (!isStaticHost) {
      try {
        const res = await fetch('api/gallery.php');
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            items = json.data;
          }
        }
      } catch (e) {
        // PHP API not present or returned non-JSON
      }
    }

    // Load static data/gallery.json for static hosting or as fallback
    if (!items) {
      try {
        const staticRes = await fetch('data/gallery.json');
        if (staticRes.ok) {
          const staticJson = await staticRes.json();
          if (Array.isArray(staticJson) && staticJson.length > 0) {
            items = staticJson;
          }
        }
      } catch (e) {
        // Static fetch fallback
      }
    }

    if (!items || items.length === 0) return;

    // 1. Identify dynamic uploaded items (non-default or block >= 5)
    const dynamicItems = items.filter((item) => !item.is_default && (!item.id || !item.id.startsWith('seed-')));

    // 2. Update metadata on any default items that were edited in the admin dashboard
    items.forEach((item) => {
      if (item.is_default && item.layout_class) {
        const el = bentoGrid.querySelector(`.${item.layout_class}`);
        if (el) {
          if (item.category) el.setAttribute('data-category', item.category);
          const img = el.querySelector('img');
          if (img) {
            if (item.title) img.setAttribute('alt', item.alt || item.title);
            if (item.image_path) img.setAttribute('src', item.image_path);
          }
          const titleSpan = el.querySelector('.port-overlay-title');
          if (titleSpan && item.title) titleSpan.textContent = item.title;
          const catSpan = el.querySelector('.port-overlay-cat');
          if (catSpan && item.category) catSpan.textContent = CATEGORY_NAMES[item.category] || item.category;
        }
      }
    });

    // 3. Render newly uploaded items in an elegant dynamic bento extension block
    let dynamicBlock = document.getElementById('portfolioDynamicBlock');
    if (dynamicItems.length > 0) {
      if (!dynamicBlock) {
        dynamicBlock = document.createElement('div');
        dynamicBlock.className = 'port-block port-block-dynamic';
        dynamicBlock.id = 'portfolioDynamicBlock';
        bentoGrid.appendChild(dynamicBlock);
      }

      dynamicBlock.innerHTML = '';
      dynamicItems.forEach((item) => {
        const catLabel = CATEGORY_NAMES[item.category] || item.category || 'Portfolio';
        const card = document.createElement('div');
        card.className = `portfolio-grid-item ${item.layout_class || ''}`;
        card.setAttribute('data-category', item.category || 'weddings');
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Open ${item.title}`);
        card.innerHTML = `
          <div class="portfolio-img-box">
            <img src="${item.image_path}" alt="${item.alt || item.title}" loading="lazy">
            <div class="port-tile-overlay">
              <span class="port-overlay-cat">${catLabel}</span>
              <span class="port-overlay-title">${item.title}</span>
            </div>
          </div>
        `;
        dynamicBlock.appendChild(card);
      });
    } else if (dynamicBlock) {
      dynamicBlock.remove();
    }

    // 4. Re-bind portfolio filter & recalculate layout
    initPortfolioFilter();
    if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger.refresh) {
      ScrollTrigger.refresh();
    }
  } catch (err) {
    // Graceful fallback: If API is unreachable (e.g. static Vite server), static HTML remains 100% active
    console.debug('Gallery sync fallback to static markup:', err);
  }
}
