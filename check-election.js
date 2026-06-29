const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/teacher/class-1', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(800);
  await page.click('button:has-text("투표/선거")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'election-shot.png' });
  await browser.close();
  console.log('done');
})().catch(e => console.error(e.message));
