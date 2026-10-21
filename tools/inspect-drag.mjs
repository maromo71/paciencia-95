import { chromium } from '../frontend/node_modules/playwright-core/index.mjs';
import { createServer } from '../frontend/node_modules/vite/dist/node/index.js';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const frontendRoot = path.join(root, 'frontend');

const server = await createServer({
  root: frontendRoot,
  server: { port: 5199 },
});
await server.listen();

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
});

const page = await browser.newPage({
  viewport: { width: 1024, height: 768 },
  deviceScaleFactor: 1,
});

await page.goto('http://localhost:5199/', { waitUntil: 'networkidle' });
await page.waitForSelector('.game-field', { timeout: 10000 });
await page.waitForTimeout(500);

const piles = await page.evaluate(() => {
  return [...document.querySelectorAll('.tableau-pile')].map((pile, col) => {
    const ups = [...pile.querySelectorAll('.card-up')];
    return ups.map((c, i) => ({
      col,
      index: i,
      label: c.getAttribute('aria-label'),
    }));
  });
});

console.log('Piles:', JSON.stringify(piles, null, 2));

// Pegar a primeira carta arrastável
const firstDraggable = page.locator('.tableau-pile .card-up[data-draggable="true"]').first();
const boxSource = await firstDraggable.boundingBox();
// Pegar a segunda coluna
const secondColCard = page.locator('.tableau-pile').nth(1).locator('.card').last();
const boxTarget = await secondColCard.boundingBox();

console.log('boxSource:', boxSource);
console.log('boxTarget:', boxTarget);

if (boxSource && boxTarget) {
  await page.mouse.move(boxSource.x + boxSource.width / 2, boxSource.y + boxSource.height / 2);
  await page.mouse.down();
  
  // Arrastar e parar sobre a carta alvo
  await page.mouse.move(boxTarget.x + boxTarget.width / 2, boxTarget.y + boxTarget.height / 2 + 15, { steps: 10 });
  await page.waitForTimeout(200);

  await page.screenshot({ path: path.join(root, 'screenshots', 'test-drag-over.png') });
  
  await page.mouse.up();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(root, 'screenshots', 'test-after-drop.png') });
}

await browser.close();
await server.close();
