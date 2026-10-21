import { chromium } from '../frontend/node_modules/playwright-core/index.mjs';
import { createServer } from '../frontend/node_modules/vite/dist/node/index.js';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const frontendRoot = path.join(root, 'frontend');

const server = await createServer({
  root: frontendRoot,
  server: { port: 5200 },
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
    id: 'test-cps',
    draw: 3,
    scoring: 'standard',
    timed: false,
    player: 'Aluno CPS',
    score: 120,
    elapsed: 45,
    status: 'playing',
    moves: [{ type: 'dummy', from: { pile: 'stock' }, to: { pile: 'waste' }, cardIndex: 0 }],
    state: {
      stock: [{ suit: 'D', rank: 10, faceUp: false }],
      waste: [{ suit: 'S', rank: 13, faceUp: true }],
      foundations: [[], [], [], []],
      tableau: [
        [{ suit: 'H', rank: 1, faceUp: true }], // Ás de Copas pode subir imediatamente para fundação
        [{ suit: 'S', rank: 8, faceUp: false }, { suit: 'C', rank: 7, faceUp: true }],
        [{ suit: 'D', rank: 8, faceUp: true }],
        [],
        [],
        [],
        []
      ]
    }
  };
  localStorage.setItem('paciencia95.save.v1', JSON.stringify(customSave));
  localStorage.setItem('paciencia95.options.v1', JSON.stringify({
    draw: 3,
    scoring: 'standard',
    timed: false,
    cardBack: 'chipset',
    player: 'Aluno CPS'
  }));
});

await page.goto('http://localhost:5200/', { waitUntil: 'networkidle' });

try {
  const continueBtn = page.getByRole('button', { name: 'Continuar' });
  await continueBtn.waitFor({ timeout: 2000 });
  await continueBtn.click();
} catch {}

await page.waitForSelector('.game-field', { timeout: 10000 });
await page.waitForTimeout(600);

// 1. Screenshot Tabuleiro Inicial com Verso Chipset e Figuras Acadêmicas
await page.screenshot({ path: path.join(root, 'screenshots', 'cps-01-board-chipset.png') });
console.log('✓ Captura 1: Tabuleiro com verso Chipset FATEC e fundações temáticas.');

// 2. Testar e Capturar Dica (Hint)
const hintBtn = page.locator('.quick-hint-btn');
await hintBtn.click();
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(root, 'screenshots', 'cps-02-hint-active.png') });
console.log('✓ Captura 2: Dica ativa com destaque luminoso e instrução no rodapé.');

// 3. Abrir Guia de Cursos (WinHelp 95)
const coursesBtn = page.locator('.quick-courses-btn');
await coursesBtn.click();
await page.waitForSelector('.winhelp-window', { timeout: 5000 });
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(root, 'screenshots', 'cps-03-winhelp-fatec.png') });
console.log('✓ Captura 3: Janela WinHelp 95 aberta na aba Fatec.');

// Navegar para Etec no WinHelp
await page.getByRole('button', { name: 'Etec (Técnico)' }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(root, 'screenshots', 'cps-04-winhelp-etec.png') });
console.log('✓ Captura 4: WinHelp 95 navegando nos cursos técnicos da Etec.');

// Fechar WinHelp
await page.locator('.winhelp-window .title-button.close').click();
await page.waitForTimeout(400);

// 4. Abrir Opções e selecionar Verso Campus
const menuJogo = page.getByRole('button', { name: 'Jogo' });
await menuJogo.click();
await page.getByRole('menuitem', { name: 'Opções...' }).click();
await page.waitForSelector('.card-back-picker', { timeout: 5000 });

// Clicar no verso Campus Etec/Fatec
const campusChoice = page.getByRole('button', { name: 'Verso Campus Etec/Fatec' });
await campusChoice.click();
await page.getByRole('button', { name: 'OK' }).click();
await page.waitForTimeout(600);

await page.screenshot({ path: path.join(root, 'screenshots', 'cps-05-board-campus.png') });
console.log('✓ Captura 5: Tabuleiro com verso Campus Histórico Etec/Fatec.');

await browser.close();
await server.close();
console.log('Todos os testes visuais das funcionalidades CPS concluídos com sucesso!');
