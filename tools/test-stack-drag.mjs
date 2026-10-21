import { chromium } from '../frontend/node_modules/playwright-core/index.mjs';
import { createServer } from '../frontend/node_modules/vite/dist/node/index.js';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const frontendRoot = path.join(root, 'frontend');

const server = await createServer({
  root: frontendRoot,
  server: { port: 5195 },
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

await page.addInitScript(() => {
  const customSave = {
    version: 1,
    id: 'test-stack-drag',
    draw: 3,
    scoring: 'standard',
    timed: false,
    player: 'Tester',
    score: 0,
    elapsed: 0,
    status: 'playing',
    moves: [{ type: 'dummy', from: { pile: 'stock' }, to: { pile: 'waste' }, cardIndex: 0 }],
    state: {
      stock: [],
      waste: [],
      foundations: [[], [], [], []],
      tableau: [
        [
          { suit: 'S', rank: 9, faceUp: true },
          { suit: 'H', rank: 8, faceUp: true },
          { suit: 'C', rank: 7, faceUp: true }
        ],
        [],
        [],
        [],
        [],
        [],
        []
      ]
    }
  };
  localStorage.setItem('paciencia95.save.v1', JSON.stringify(customSave));
});

await page.goto('http://localhost:5195/', { waitUntil: 'networkidle' });

try {
  const continueBtn = page.getByRole('button', { name: 'Continuar' });
  await continueBtn.waitFor({ timeout: 2000 });
  await continueBtn.click();
} catch {}

await page.waitForSelector('.game-field', { timeout: 10000 });
await page.waitForTimeout(500);

// Screenshot do tableau com 3 cartas empilhadas
await page.screenshot({ path: path.join(root, 'screenshots', '04-stack-of-three.png') });

// Arrastar as 2 cartas (8 e 7) para o meio do campo
const card8 = page.locator('.tableau-pile').first().locator('.card').nth(1);
const box = await card8.boundingBox();

await page.mouse.move(box.x + box.width / 2, box.y + 10);
await page.mouse.down();
await page.mouse.move(box.x + 200, box.y + 100, { steps: 10 });
await page.waitForTimeout(300);

// Screenshot durante arrasto das duas cartas juntas
await page.screenshot({ path: path.join(root, 'screenshots', '05-drag-stack.png') });

// Verificar se no drag layer a carta de cima cobre perfeitamente a de baixo
const dragStackCheck = await page.evaluate(() => {
  const dragLayer = document.querySelector('.drag-layer');
  if (!dragLayer) return { error: 'No drag layer' };

  const cards = [...dragLayer.querySelectorAll('.card')];
  const card8 = cards[0];
  const card7 = cards[1];

  const cornerBottom8 = card8.querySelector('.card-corner-bottom');
  const rect8 = cornerBottom8.getBoundingClientRect();
  const topEl = document.elementFromPoint(rect8.x + rect8.width / 2, rect8.y + rect8.height / 2);

  return {
    dragCardsCount: cards.length,
    topElTag: topEl?.tagName,
    topElClass: topEl?.className,
    isCard8CoveredByCard7: card7.contains(topEl) || topEl === card7,
  };
});

console.log('Drag stack result:', JSON.stringify(dragStackCheck, null, 2));

await page.mouse.up();
await browser.close();
await server.close();
