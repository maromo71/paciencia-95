// Captura o diálogo de opções para o README.
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
await page.goto('http://127.0.0.1:3001/', { waitUntil: 'networkidle' });
await page.waitForSelector('.game-field', { timeout: 10000 });
if (await page.locator('.dialog').count()) {
  const text = await page.locator('.dialog').textContent();
  if (text.includes('partida anterior')) {
    await page.getByRole('button', { name: 'Continuar' }).click();
  }
}
await page.getByRole('button', { name: 'Jogo' }).click();
await page.getByRole('menuitem', { name: 'Opções...' }).click();
await page.waitForSelector('.dialog');
await page.screenshot({ path: path.join(root, 'screenshots', 'options.png') });
await browser.close();
