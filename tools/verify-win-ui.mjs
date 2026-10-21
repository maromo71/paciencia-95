// Joga a distribuição solucionável pela interface real e valida animação,
// diálogo de vitória, pontuação e gravação no backend.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '../frontend/node_modules/playwright-core/index.mjs';

const root = path.resolve(import.meta.dirname, '..');
const deal = JSON.parse(
  readFileSync(path.join(root, 'shared', 'fixtures', 'winning-deal.json'), 'utf8'),
);
const id = process.argv[2];
if (!id) throw new Error('informe o id da partida de UI');

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
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`);
});

await page.goto('http://127.0.0.1:3001/', { waitUntil: 'networkidle' });
await page.waitForSelector('.game-field', { timeout: 10000 });

if (await page.locator('.dialog').count()) {
  const text = await page.locator('.dialog').textContent();
  if (text.includes('partida anterior')) {
    await page.getByRole('button', { name: 'Continuar' }).click();
    console.log('partida anterior continuada');
  }
}

console.log(
  'topos iniciais',
  await page.evaluate(() =>
    [...document.querySelectorAll('.tableau-pile')].map((pile) => {
      const cards = pile.querySelectorAll('.card-up');
      return cards[cards.length - 1]?.getAttribute('aria-label');
    }),
  ),
);

for (let index = 0; index < deal.sequence.length; index += 1) {
  const item = deal.sequence[index];
  if (item.kind === 'card') {
    const card = page.locator(
      `.tableau-pile .card-up[aria-label="${item.label}"]`,
    );
    await card.dblclick();
    await page.waitForTimeout(35);
  } else if (item.kind === 'draw') {
    await page.locator('.stock-pile').click();
    await page.waitForTimeout(35);
  } else if (item.kind === 'draw-card') {
    const card = page.locator(
      `.waste-pile .card-up[aria-label="${item.label}"]`,
    );
    await card.dblclick();
    await page.waitForTimeout(35);
  }
  if (index % 10 === 0) {
    const score = await page.locator('.status-pane.score').textContent();
    console.log(index, item.kind, item.label || '', score.trim());
  }
}

await page.waitForSelector('.win-canvas', { timeout: 8000 });
await page.waitForTimeout(900);
await page.screenshot({ path: path.join(root, 'screenshots', '08-win-animation.png') });

const scoreDuring = (await page.locator('.status-pane.score').textContent()).trim();
console.log('placar após vitória', scoreDuring);
if (!scoreDuring.includes('625')) {
  throw new Error(`pontuação inesperada na interface: ${scoreDuring}`);
}

await page.locator('.win-canvas').click();
await page.waitForSelector('.dialog');
await page.waitForTimeout(1200);
await page.screenshot({ path: path.join(root, 'screenshots', '09-win-dialog.png') });

const dialogText = await page.locator('.dialog').textContent();
console.log('diálogo', dialogText.replace(/\s+/g, ' ').slice(0, 180));
if (!dialogText.includes('Parabéns')) throw new Error('diálogo de vitória ausente');

const game = await fetch(`http://127.0.0.1:3001/api/games/${id}`).then((response) =>
  response.json(),
);
console.log('backend', {
  status: game.status,
  score: game.score,
  elapsed: game.elapsed,
  moves: game.moves.length,
});
if (game.status !== 'won' || game.score !== 625) {
  throw new Error('backend não registrou a vitória');
}

console.log('erros', errors);
await browser.close();
