import { chromium } from '../frontend/node_modules/playwright-core/index.mjs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const shots = path.join(root, 'screenshots');
const chrome =
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const browser = await chromium.launch({
  executablePath: chrome,
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
await page.screenshot({ path: path.join(shots, '01-board.png') });

const initial = await page.evaluate(() => ({
  cards: document.querySelectorAll('.card').length,
  stock: document.querySelectorAll('.stock-pile .card').length,
  waste: document.querySelectorAll('.waste-pile .card').length,
  tableaus: document.querySelectorAll('.tableau-pile').length,
  foundations: document.querySelectorAll('.foundation-pile').length,
  score: document.querySelector('.status-pane.score')?.textContent,
}));
console.log('inicial', initial);

await page.locator('.stock-pile').click();
await page.waitForTimeout(1200);
const afterDraw = await page.evaluate(() => ({
  waste: document.querySelectorAll('.waste-pile .card').length,
  stock: document.querySelectorAll('.stock-pile .card').length,
  score: document.querySelector('.status-pane.score')?.textContent,
}));
console.log('após compra', afterDraw);
await page.screenshot({ path: path.join(shots, '02-draw.png') });

await page.getByRole('button', { name: 'Jogo' }).click();
await page.getByRole('menuitem', { name: 'Opções...' }).click();
await page.waitForSelector('.dialog');
await page.screenshot({ path: path.join(shots, '03-options.png') });
const optionsTitle = await page.locator('.dialog-titlebar').textContent();
console.log('opções', optionsTitle.trim());
await page.getByRole('button', { name: 'Cancelar' }).click();

await page.getByRole('button', { name: 'Ajuda' }).click();
await page.getByRole('menuitem', { name: 'Sobre o Paciência...' }).click();
await page.waitForSelector('.dialog');
await page.screenshot({ path: path.join(shots, '04-about.png') });
await page.getByRole('button', { name: 'OK' }).click();

await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(700);
const continueVisible = await page.locator('text=Há uma partida anterior salva').isVisible();
console.log('diálogo continuar', continueVisible);
if (continueVisible) {
  await page.screenshot({ path: path.join(shots, '05-continue.png') });
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.waitForTimeout(300);
  console.log(
    'restaurado',
    await page.evaluate(() => document.querySelectorAll('.waste-pile .card').length),
  );
}

await page.keyboard.press('F2');
await page.waitForTimeout(900);
const afterNew = await page.evaluate(() => ({
  waste: document.querySelectorAll('.waste-pile .card').length,
  stock: document.querySelectorAll('.stock-pile .card').length,
  score: document.querySelector('.status-pane.score')?.textContent,
}));
console.log('novo jogo', afterNew);
await page.screenshot({ path: path.join(shots, '06-new-game.png') });

await page.getByRole('button', { name: 'Jogo' }).click();
await page.getByRole('menuitem', { name: 'Estatísticas...' }).click();
await page.waitForSelector('.dialog');
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(shots, '07-stats.png') });
await page.getByRole('button', { name: 'OK' }).click();

console.log('erros', errors);
await browser.close();
