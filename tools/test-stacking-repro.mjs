import { chromium } from '../frontend/node_modules/playwright-core/index.mjs';
import { createServer } from '../frontend/node_modules/vite/dist/node/index.js';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const frontendRoot = path.join(root, 'frontend');

const server = await createServer({
  root: frontendRoot,
  server: { port: 5197 },
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

await page.goto('http://localhost:5197/', { waitUntil: 'networkidle' });

// Injetar um jogo onde na coluna 0 temos duas cartas abertas: 8 de Copas embaixo, e 7 de Espadas em cima
await page.evaluate(() => {
  const customSave = {
    version: 1,
    savedAt: Date.now(),
    state: {
      id: 'test-stacking',
      draw: 3,
      scoring: 'standard',
      timed: false,
      player: 'Tester',
      score: 0,
      moves: [],
      status: 'playing',
      deck: [],
      waste: [],
      foundations: [[], [], [], []],
      tableau: [
        [
          { suit: 'H', rank: 8, faceUp: true },
          { suit: 'S', rank: 7, faceUp: true }
        ],
        [],
        [],
        [],
        [],
        [],
        []
      ],
      elapsed: 0,
      startedAt: null,
      won: false,
      bonus: 0,
      notice: null,
      lastFlip: null
    }
  };
  localStorage.setItem('paciencia95.save.v1', JSON.stringify(customSave));
  window.location.reload();
});

await page.waitForSelector('.game-field', { timeout: 10000 });
await page.waitForTimeout(500);

await page.screenshot({ path: path.join(root, 'screenshots', 'repro-stacked-cards.png') });

// Agora vamos inspecionar o que está visível na coluna 0
const elementsAtPoint = await page.evaluate(() => {
  const col0 = document.querySelector('.tableau-pile');
  const cards = [...col0.querySelectorAll('.card')];
  
  // Pegar posição do canto inferior da primeira carta
  const card0BottomCorner = cards[0].querySelector('.card-corner-bottom');
  const rect = card0BottomCorner.getBoundingClientRect();
  const topElement = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);

  return {
    card0BottomCornerText: card0BottomCorner.innerText.replace(/\s+/g, ' '),
    topElementTag: topElement?.tagName,
    topElementClass: topElement?.className,
    topElementText: topElement?.innerText?.replace(/\s+/g, ' '),
    isCard0CornerOnTop: card0BottomCorner.contains(topElement) || topElement === card0BottomCorner
  };
});

console.log('Inspection:', JSON.stringify(elementsAtPoint, null, 2));

await browser.close();
await server.close();
