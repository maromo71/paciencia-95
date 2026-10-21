// Valida arrastar e soltar de verdade (pointer events), inclusive drop inválido.
import { chromium } from '../frontend/node_modules/playwright-core/index.mjs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));

await page.goto('http://127.0.0.1:3001/', { waitUntil: 'networkidle' });
await page.waitForSelector('.game-field', { timeout: 10000 });

async function dragTo(sourceSelector, targetSelector) {
  const source = await page.locator(sourceSelector).boundingBox();
  const target = await page.locator(targetSelector).boundingBox();
  if (!source || !target) throw new Error('elemento não encontrado');
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    target.x + target.width / 2,
    target.y + target.height / 2,
    { steps: 10 },
  );
  await page.waitForTimeout(80);
  await page.mouse.up();
  await page.waitForTimeout(250);
}

console.log(
  'topos',
  await page.evaluate(() =>
    [...document.querySelectorAll('.tableau-pile')].map((pile) => {
      const cards = pile.querySelectorAll('.card-up');
      return cards[cards.length - 1]?.getAttribute('aria-label');
    }),
  ),
);

// A♠ da coluna 7 para a primeira fundação.
await dragTo(
  '[data-drop="tableau-6"] .card-up[aria-label="A de Espadas"]',
  '[data-drop="foundation-0"]',
);
let state = await page.evaluate(() => ({
  foundation: document
    .querySelector('[data-drop="foundation-0"] .card-up')
    ?.getAttribute('aria-label'),
  score: document.querySelector('.status-pane.score')?.textContent.trim(),
  seven: document
    .querySelector('[data-drop="tableau-6"] .card-up')
    ?.getAttribute('aria-label'),
}));
console.log('após arrastar A♠', state);
if (state.foundation !== 'A de Espadas' || !state.score.includes('15')) {
  throw new Error('arrastar A♠ para a fundação falhou');
}

// 2♠ sobre o K♠ da coluna 1: jogada inválida, deve voltar.
await dragTo(
  '[data-drop="tableau-6"] .card-up[aria-label="2 de Espadas"]',
  '[data-drop="tableau-0"]',
);
state = await page.evaluate(() => ({
  score: document.querySelector('.status-pane.score')?.textContent.trim(),
  seven: [
    ...document.querySelectorAll('[data-drop="tableau-6"] .card-up'),
  ].map((card) => card.getAttribute('aria-label')),
}));
console.log('após drop inválido', state);
if (!state.seven.includes('2 de Espadas') || !state.score.includes('15')) {
  throw new Error('drop inválido alterou o estado');
}

await page.screenshot({ path: path.join(root, 'screenshots', '10-drag.png') });
console.log('erros', errors);
await browser.close();
