import { chromium } from '../frontend/node_modules/playwright-core/index.mjs';
import { createServer } from '../frontend/node_modules/vite/dist/node/index.js';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const frontendRoot = path.join(root, 'frontend');

const server = await createServer({
  root: frontendRoot,
  server: { port: 5196 },
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
    id: 'test-drop',
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
        [{ suit: 'H', rank: 8, faceUp: true }],
        [{ suit: 'C', rank: 7, faceUp: true }],
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

await page.goto('http://localhost:5196/', { waitUntil: 'networkidle' });

// Se o diálogo Continuar aparecer, clicar nele
try {
  const continueBtn = page.getByRole('button', { name: 'Continuar' });
  await continueBtn.waitFor({ timeout: 2000 });
  await continueBtn.click();
} catch {}

await page.waitForSelector('.game-field', { timeout: 10000 });
await page.waitForTimeout(500);

await page.screenshot({ path: path.join(root, 'screenshots', '01-before-drag.png') });

// Localizar o 7 de Paus (coluna 1) e o 8 de Copas (coluna 0)
const col1Card = page.locator('.tableau-pile').nth(1).locator('.card-up');
const col0Card = page.locator('.tableau-pile').nth(0).locator('.card-up');

const box7 = await col1Card.boundingBox();
const box8 = await col0Card.boundingBox();

console.log('box 7 de Paus (col 1):', box7);
console.log('box 8 de Copas (col 0):', box8);

// 1. Mover mouse até 7 de Paus, clicar e arrastar
await page.mouse.move(box7.x + box7.width / 2, box7.y + box7.height / 2);
await page.mouse.down();

// Arrastar para cima do 8 de Copas e parar no meio do caminho / sobre a carta
await page.mouse.move(box8.x + box8.width / 2, box8.y + box8.height / 2 + 15, { steps: 10 });
await page.waitForTimeout(300);

// Screenshot DURANTE o arrasto sobre a carta
await page.screenshot({ path: path.join(root, 'screenshots', '02-during-drag-over.png') });

// Soltar a carta sobre o 8 de Copas (soltar o mouse)
await page.mouse.up();
await page.waitForTimeout(500);

// Screenshot APÓS soltar a carta
await page.screenshot({ path: path.join(root, 'screenshots', '03-after-drop.png') });

// Verificar o que está na coluna 0 agora
const col0State = await page.evaluate(() => {
  const col0 = document.querySelectorAll('.tableau-pile')[0];
  const cards = [...col0.querySelectorAll('.card')].map((c) => ({
    label: c.getAttribute('aria-label'),
    style: c.getAttribute('style'),
    innerHTML: c.innerHTML.length
  }));
  
  // Inspecionar se o canto inferior da carta de baixo (8 de copas) está aparecendo por cima da carta de cima (7 de paus)
  const allCards = [...col0.querySelectorAll('.card')];
  if (allCards.length < 2) return { cards, error: 'Cards not dropped' };

  const card8 = allCards[0];
  const card7 = allCards[1];

  const cornerBottom8 = card8.querySelector('.card-corner-bottom');
  const rect8 = cornerBottom8.getBoundingClientRect();

  const elementOverCorner8 = document.elementFromPoint(rect8.x + rect8.width / 2, rect8.y + rect8.height / 2);

  return {
    cards,
    cornerBottom8Text: cornerBottom8.innerText.replace(/\s+/g, ' '),
    elementOverCorner8Tag: elementOverCorner8?.tagName,
    elementOverCorner8Class: elementOverCorner8?.className,
    elementOverCorner8Text: elementOverCorner8?.innerText?.replace(/\s+/g, ' '),
    isCard8CornerOnTop: cornerBottom8.contains(elementOverCorner8) || elementOverCorner8 === cornerBottom8,
    card8CornerZIndex: window.getComputedStyle(cornerBottom8).zIndex,
    card7ZIndex: window.getComputedStyle(card7).zIndex
  };
});

console.log('Result:', JSON.stringify(col0State, null, 2));

await browser.close();
await server.close();
