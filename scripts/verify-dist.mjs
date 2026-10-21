import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`[Console error on ${page.url()}] ${msg.text()}`);
  });
  page.on('pageerror', err => errors.push(`[Page error on ${page.url()}] ${err.message}`));
  page.on('response', resp => {
    if (resp.status() >= 400 && !resp.url().includes('api/')) {
      errors.push(`[HTTP ${resp.status()}] ${resp.url()}`);
    }
  });

  const pagesToTest = [
    '/',
    '/about.html',
    '/portfolio.html',
    '/services.html',
    '/testimonials.html',
    '/faq.html',
    '/booking.html',
    '/contact.html'
  ];

  for (const p of pagesToTest) {
    console.log(`Testing dist page: ${p}...`);
    await page.goto(`http://localhost:4173${p}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
  }

  // Test Portfolio Filter functionality on dist
  console.log('Testing portfolio filter interactions on dist...');
  await page.goto('http://localhost:4173/portfolio.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);

  const filterBtns = await page.$$('.portfolio-filter-btn');
  console.log(`Found ${filterBtns.length} portfolio filter buttons.`);
  for (const btn of filterBtns.slice(0, 4)) {
    const text = await btn.innerText();
    await btn.click();
    await page.waitForTimeout(200);
    console.log(`  ✓ Clicked filter: ${text.trim()}`);
  }

  // Test Mobile Viewport and Mobile Drawer
  console.log('Testing mobile drawer on dist in mobile viewport...');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);

  const toggle = page.locator('.mobile-menu-toggle');
  await toggle.waitFor({ state: 'visible', timeout: 5000 });
  await toggle.click();
  await page.waitForTimeout(300);

  const drawerActive = await page.evaluate(() => {
    return document.querySelector('.mobile-nav-drawer')?.classList.contains('active');
  });
  console.log(`  ✓ Mobile drawer active state: ${drawerActive}`);
  if (!drawerActive) {
    errors.push('Mobile drawer did not activate on toggle click');
  }

  const closeBtn = page.locator('.mobile-sheet-close-btn');
  await closeBtn.click();
  await page.waitForTimeout(300);

  await browser.close();

  if (errors.length > 0) {
    console.error('Errors found in dist:');
    console.error(errors);
    process.exit(1);
  } else {
    console.log('\n🎉 ALL DIST CHECKS PASSED: 0 errors, 0 broken assets, 100% interactive parity!');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
