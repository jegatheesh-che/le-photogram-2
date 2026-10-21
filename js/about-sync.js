/**
 * Synchronizes About page content with the PHP JSON catalog API.
 * Preserves the static HTML as a zero-layout-shift fallback.
 */
export async function initAboutSync() {
  const storySection = document.getElementById('about-story') || document.querySelector('.about-story-section');
  if (!storySection) return;

  try {
    let data = null;

    const isStaticHost =
      window.location.protocol === 'file:' ||
      window.location.hostname.includes('vercel.app') ||
      window.location.hostname.includes('github.io') ||
      window.location.hostname.includes('loca.lt') ||
      window.location.port === '5173' ||
      window.location.port === '4173';

    if (!isStaticHost) {
      try {
        const res = await fetch('api/about.php');
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const json = await res.json();
          if (json.success && json.data) {
            data = json.data;
          }
        }
      } catch (e) {
        // PHP API not present or returned non-JSON
      }
    }

    // Load static data/about.json for static hosting or as fallback
    if (!data) {
      try {
        const staticRes = await fetch('data/about.json');
        if (staticRes.ok) {
          const staticJson = await staticRes.json();
          if (staticJson && typeof staticJson === 'object') {
            data = staticJson;
          }
        }
      } catch (e) {
        // Static fetch fallback
      }
    }

    if (!data) return;

    // Update Hero elements if present
    const heroTitle = document.querySelector('.about-hero-title');
    if (heroTitle && data.hero_title) heroTitle.textContent = data.hero_title;

    const heroSubtitle = document.querySelector('.about-hero-subtitle');
    if (heroSubtitle && data.hero_subtitle) heroSubtitle.textContent = data.hero_subtitle;

    // Update Story Eyebrow & Manifesto
    const eyebrow = document.querySelector('.about-story-eyebrow');
    if (eyebrow && data.story_eyebrow) eyebrow.textContent = data.story_eyebrow;

    const manifesto = document.querySelector('.about-story-manifesto');
    if (manifesto && data.story_manifesto) manifesto.textContent = data.story_manifesto;

    // Update Story Body Paragraphs
    if (data.story_paragraphs && Array.isArray(data.story_paragraphs) && data.story_paragraphs.length > 0) {
      const textGrid = document.querySelector('.about-story-text-grid');
      if (textGrid) {
        const mid = Math.ceil(data.story_paragraphs.length / 2);
        const col1 = data.story_paragraphs.slice(0, mid);
        const col2 = data.story_paragraphs.slice(mid);

        textGrid.innerHTML = `
          <div class="about-story-col">
            ${col1.map((p) => `<p>${p}</p>`).join('')}
          </div>
          <div class="about-story-col">
            ${col2.map((p) => `<p>${p}</p>`).join('')}
          </div>
        `;
      }
    }

    // Update Pull-Quote Card
    const quoteText = document.querySelector('.about-pullquote-text');
    if (quoteText && data.pullquote_text) quoteText.textContent = data.pullquote_text;

    const quoteDesc = document.querySelector('.about-pullquote-desc');
    if (quoteDesc && data.pullquote_desc) quoteDesc.textContent = data.pullquote_desc;

    const quoteAuthor = document.querySelector('.about-pullquote-author');
    if (quoteAuthor && data.pullquote_author) quoteAuthor.textContent = data.pullquote_author;

  } catch (err) {
    console.debug('About sync fallback to static markup:', err);
  }
}
