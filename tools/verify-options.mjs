// Valida o diálogo de opções, reinício de partida e pontuação Vegas.
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
if (await page.locator('.dialog').count()) {
  const text = await page.locator('.dialog').textContent();
  if (text.includes('partida anterior')) {
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.waitForTimeout(200);
  }
}

async function openOptions() {
  await page.getByRole('button', { name: 'Jogo' }).click();
  await page.getByRole('menuitem', { name: 'Opções...' }).click();
  await page.waitForSelector('.dialog');
}

async function saveOptions() {
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await page.waitForTimeout(900);
  return page.evaluate(() => ({
    score: document.querySelector('.status-pane.score')?.textContent.trim(),
    message: document.querySelector('.status-pane.message')?.textContent.trim(),
  }));
}

await openOptions();
await page.getByLabel('Vegas').check();
await page.getByLabel('Uma carta').check();
const vegas = await saveOptions();
console.log('vegas', vegas);
if (!vegas.score.includes('-$52') || !vegas.message.includes('comprar uma')) {
  throw new Error('opções Vegas/comprar uma não aplicadas');
}
await page.screenshot({ path: path.join(root, 'screenshots', '11-vegas.png') });

await openOptions();
await page.getByLabel('Padrão').check();
await page.getByLabel('Jogo cronometrado').check();
const standard = await saveOptions();
console.log('padrão cronometrado', standard);
if (!standard.score.includes('Pontuação: 0') || !standard.message.includes('Padrão')) {
  throw new Error('opções padrão/cronometrado não aplicadas');
}

await openOptions();
await page.getByLabel('Três cartas').check();
await page.getByLabel('Jogo cronometrado').uncheck();
const three = await saveOptions();
console.log('três cartas', three);
if (!three.message.includes('comprar três')) {
  throw new Error('opção comprar três não aplicada');
}

console.log('erros', errors);
await browser.close();
