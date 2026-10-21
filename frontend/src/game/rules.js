import { isRed } from './cards.js';

export const TABLEAU_COUNT = 7;
export const FOUNDATION_COUNT = 4;

export function emptyState() {
  return {
    stock: [],
    waste: [],
    foundations: Array.from({ length: FOUNDATION_COUNT }, () => []),
    tableau: Array.from({ length: TABLEAU_COUNT }, () => []),
  };
}

export function cloneState(state) {
  return {
    stock: state.stock.slice(),
    waste: state.waste.slice(),
    foundations: state.foundations.map((pile) => pile.slice()),
    tableau: state.tableau.map((pile) => pile.slice()),
  };
}

export function getPile(state, ref) {
  if (!ref) return null;
  if (ref.pile === 'waste') return state.waste;
  if (ref.pile === 'foundation') {
    return state.foundations[ref.index] ?? null;
  }
  if (ref.pile === 'tableau') {
    return state.tableau[ref.index] ?? null;
  }
  return null;
}

export function isTableauSequence(cards) {
  if (!cards || cards.length === 0) return false;
  if (cards.some((card) => !card.faceUp)) return false;
  for (let index = 0; index < cards.length - 1; index += 1) {
    const current = cards[index];
    const next = cards[index + 1];
    if (current.rank !== next.rank + 1) return false;
    if (isRed(current) === isRed(next)) return false;
  }
  return true;
}

export function canPlaceOnTableau(card, pile) {
  if (!pile.length) return card.rank === 13;
  const top = pile[pile.length - 1];
  return (
    top.faceUp &&
    top.rank === card.rank + 1 &&
    isRed(top) !== isRed(card)
  );
}

export function canPlaceOnFoundation(card, pile) {
  if (!pile.length) return card.rank === 1;
  const top = pile[pile.length - 1];
  return top.suit === card.suit && top.rank + 1 === card.rank;
}

export function getMovingCards(state, from, cardIndex = 0) {
  if (!from) return null;
  if (from.pile === 'waste') {
    if (!state.waste.length) return null;
    return [state.waste[state.waste.length - 1]];
  }
  if (from.pile === 'foundation') {
    const pile = state.foundations[from.index];
    if (!pile || !pile.length) return null;
    return [pile[pile.length - 1]];
  }
  if (from.pile === 'tableau') {
    const pile = state.tableau[from.index];
    if (!pile || cardIndex < 0 || cardIndex >= pile.length) return null;
    const sequence = pile.slice(cardIndex);
    return isTableauSequence(sequence) ? sequence : null;
  }
  return null;
}

export function canMove(state, from, to, cardIndex = 0) {
  if (!from || !to) return false;
  if (from.pile === to.pile && from.index === to.index) return false;
  if (to.pile === 'waste') return false;

  const moving = getMovingCards(state, from, cardIndex);
  if (!moving) return false;

  if (to.pile === 'tableau') {
    const destination = state.tableau[to.index];
    if (!destination) return false;
    return canPlaceOnTableau(moving[0], destination);
  }
  if (to.pile === 'foundation') {
    const destination = state.foundations[to.index];
    if (!destination) return false;
    if (moving.length !== 1) return false;
    return canPlaceOnFoundation(moving[0], destination);
  }
  return false;
}

/**
 * Aplica uma jogada sem mutar o estado recebido.
 * Retorna `{ ok, state, flipped }` ou `{ ok: false, reason }`.
 */
export function applyMove(state, from, to, cardIndex = 0) {
  if (!from || !to) {
    return { ok: false, reason: 'Jogada inválida.' };
  }
  if (from.pile === to.pile && from.index === to.index) {
    return { ok: false, reason: 'Origem e destino são iguais.' };
  }
  if (to.pile === 'waste') {
    return { ok: false, reason: 'Não é possível mover para o descarte.' };
  }

  const moving = getMovingCards(state, from, cardIndex);
  if (!moving) {
    if (from.pile === 'tableau') {
      return { ok: false, reason: 'Essa sequência não pode ser movida.' };
    }
    return { ok: false, reason: 'Não há carta para mover.' };
  }

  if (to.pile === 'tableau') {
    const destination = state.tableau[to.index];
    if (!destination) return { ok: false, reason: 'Coluna inválida.' };
    if (!canPlaceOnTableau(moving[0], destination)) {
      return { ok: false, reason: 'Essa carta não pode ir para essa coluna.' };
    }
  } else if (to.pile === 'foundation') {
    const destination = state.foundations[to.index];
    if (!destination) return { ok: false, reason: 'Fundação inválida.' };
    if (moving.length !== 1) {
      return { ok: false, reason: 'Só é possível mover uma carta para a fundação.' };
    }
    if (!canPlaceOnFoundation(moving[0], destination)) {
      return { ok: false, reason: 'Essa carta não pode ir para essa fundação.' };
    }
  } else {
    return { ok: false, reason: 'Destino inválido.' };
  }

  const next = cloneState(state);
  let flipped = false;

  if (from.pile === 'waste') {
    next.waste.pop();
  } else if (from.pile === 'foundation') {
    next.foundations[from.index].pop();
  } else {
    next.tableau[from.index] = next.tableau[from.index].slice(0, cardIndex);
    const pile = next.tableau[from.index];
    const top = pile[pile.length - 1];
    if (top && !top.faceUp) {
      pile[pile.length - 1] = { ...top, faceUp: true };
      flipped = true;
    }
  }

  if (to.pile === 'tableau') {
    next.tableau[to.index].push(...moving);
  } else {
    next.foundations[to.index].push(moving[0]);
  }

  return { ok: true, state: next, flipped };
}

export function drawCards(state, count) {
  if (!state.stock.length) return null;
  const next = cloneState(state);
  for (let drawn = 0; drawn < count && next.stock.length > 0; drawn += 1) {
    const card = next.stock.pop();
    next.waste.push({ ...card, faceUp: true });
  }
  return next;
}

export function recycleCards(state) {
  if (!state.waste.length || state.stock.length) return null;
  const stock = state.waste
    .slice()
    .reverse()
    .map((card) => ({ ...card, faceUp: false }));
  return {
    ...cloneState(state),
    stock,
    waste: [],
  };
}

export function isWon(state) {
  return state.foundations.every((pile) => pile.length === 13);
}

export function findAutoMove(state, from, cardIndex = 0) {
  const moving = getMovingCards(state, from, cardIndex);
  if (!moving || moving.length !== 1) return null;
  const card = moving[0];
  for (let index = 0; index < FOUNDATION_COUNT; index += 1) {
    if (canPlaceOnFoundation(card, state.foundations[index])) {
      return {
        from,
        to: { pile: 'foundation', index },
        cardIndex,
      };
    }
  }
  return null;
}

export function topCard(pile) {
  return pile && pile.length ? pile[pile.length - 1] : null;
}
