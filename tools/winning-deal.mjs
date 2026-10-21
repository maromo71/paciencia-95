// Gera uma distribuição determinística e totalmente solucionável, usada para
// testar o fluxo de vitória de ponta a ponta.
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { deal } from '../frontend/src/game/cards.js';
import {
  applyMove,
  drawCards,
  findAutoMove,
  isWon,
  topCard,
} from '../frontend/src/game/rules.js';
import { scoreForMove } from '../frontend/src/game/scoring.js';

const SUIT_NAMES = { S: 'Espadas', H: 'Copas', D: 'Ouros', C: 'Paus' };
const RANK_NAMES = {
  1: 'A',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
};

const card = (suit, rank) => ({ suit, rank, faceUp: false });
const label = (suit, rank) => `${RANK_NAMES[rank]} de ${SUIT_NAMES[suit]}`;

// As 28 cartas do tableau. Cada coluna é uma sequência descendente de mesmo
// naipe, com a menor carta no topo. Assim, ao mover o topo para a fundação,
// a próxima carta é desvirada e pode seguir na sequência.
const columns = [
  [card('S', 13)],
  [card('S', 12), card('S', 11)],
  [card('S', 10), card('S', 9), card('S', 8)],
  [card('C', 4), card('C', 3), card('C', 2), card('C', 1)],
  [card('D', 5), card('D', 4), card('D', 3), card('D', 2), card('D', 1)],
  [card('H', 6), card('H', 5), card('H', 4), card('H', 3), card('H', 2), card('H', 1)],
  [card('S', 7), card('S', 6), card('S', 5), card('S', 4), card('S', 3), card('S', 2), card('S', 1)],
];

// O baralho é consumido linha a linha: primeiro as bases das colunas 0..6,
// depois as segundas cartas das colunas 1..6, e assim por diante.
const deck = [];
for (let row = 0; row < 7; row += 1) {
  for (let column = row; column < 7; column += 1) {
    deck.push(columns[column][row]);
  }
}

// Ordem em que as cartas restantes serão compradas e enviadas à fundação.
const stockPlayOrder = [
  ...[7, 8, 9, 10, 11, 12, 13].map((rank) => card('H', rank)),
  ...[6, 7, 8, 9, 10, 11, 12, 13].map((rank) => card('D', rank)),
  ...[5, 6, 7, 8, 9, 10, 11, 12, 13].map((rank) => card('C', rank)),
];

// O monte é uma pilha: a última carta é a primeira comprada.
deck.push(...stockPlayOrder.slice().reverse());

if (deck.length !== 52) throw new Error(`baralho com ${deck.length} cartas`);

const state = deal(deck);
const initial = {
  stock: state.stock.map((entry) => `${entry.suit}${entry.rank}`),
  tableau: state.tableau.map((pile) => pile.map((entry) => `${entry.suit}${entry.rank}`)),
};

let current = state;
let score = 0;
const sequence = [];
const backendMoves = [];

function moveTopToFoundation(cardLabel) {
  for (let column = 0; column < 7; column += 1) {
    const top = topCard(current.tableau[column]);
    if (top && label(top.suit, top.rank) === cardLabel) {
      const target = findAutoMove(
        current,
        { pile: 'tableau', index: column },
        current.tableau[column].length - 1,
      );
      if (!target) throw new Error(`sem destino para ${cardLabel}`);
      const result = applyMove(
        current,
        target.from,
        target.to,
        target.cardIndex,
      );
      if (!result.ok) throw new Error(result.reason);
      score += scoreForMove(
        'standard',
        1,
        target.from,
        target.to,
        result.flipped,
      );
      current = result.state;
      sequence.push({ kind: 'card', label: cardLabel });
      backendMoves.push({
        type: 'move',
        from: target.from,
        to: target.to,
        cardIndex: target.cardIndex,
      });
      return;
    }
  }
  throw new Error(`carta não encontrada no topo: ${cardLabel}`);
}

function drawAndMove(expected) {
  const next = drawCards(current, 1);
  if (!next) throw new Error('monte vazio');
  current = next;
  sequence.push({ kind: 'draw' });
  backendMoves.push({ type: 'draw' });
  const top = topCard(current.waste);
  if (!top || label(top.suit, top.rank) !== expected) {
    throw new Error(`esperava ${expected}, veio ${top && label(top.suit, top.rank)}`);
  }
  const target = findAutoMove(current, { pile: 'waste', index: 0 });
  if (!target) throw new Error(`sem destino para ${expected}`);
  const result = applyMove(current, target.from, target.to, 0);
  if (!result.ok) throw new Error(result.reason);
  score += scoreForMove('standard', 1, target.from, target.to, result.flipped);
  current = result.state;
  sequence.push({ kind: 'draw-card', label: expected });
  backendMoves.push({
    type: 'move',
    from: target.from,
    to: target.to,
    cardIndex: 0,
  });
}

// Tableau: espadas até 7, copas até 6, ouros até 5, paus até 4.
for (const [suit, max] of [
  ['S', 7],
  ['H', 6],
  ['D', 5],
  ['C', 4],
]) {
  for (let rank = 1; rank <= max; rank += 1) {
    moveTopToFoundation(label(suit, rank));
  }
}
// Cartas altas de espadas que ficaram nas colunas 2, 1 e 0.
for (const rank of [8, 9, 10, 11, 12, 13]) {
  moveTopToFoundation(label('S', rank));
}

// Monte: copas 7..13, ouros 6..13, paus 5..13.
for (const entry of stockPlayOrder) {
  drawAndMove(label(entry.suit, entry.rank));
}

const result = {
  deck,
  sequence,
  moves: backendMoves,
  expectedScore: score,
  won: isWon(current),
  initial,
};

console.log({
  won: result.won,
  score: result.expectedScore,
  moves: sequence.length,
  foundationCards: current.foundations.map((pile) => pile.length),
  stock: current.stock.length,
  waste: current.waste.length,
});

if (!result.won) throw new Error('a distribuição não terminou em vitória');
if (score !== 625) throw new Error(`pontuação inesperada: ${score}`);

writeFileSync(
  path.resolve(import.meta.dirname, '../shared/fixtures/winning-deal.json'),
  JSON.stringify(result, null, 2),
);
console.log('distribuição salva em shared/fixtures/winning-deal.json');
