import { canMove, topCard } from './rules.js';
import { cardName, isRed } from './cards.js';

/**
 * Verifica se mover uma carta para a fundação é "seguro"
 * (ou seja, não vai prender uma carta de cor oposta de valor inferior).
 * Ás e 2 são sempre seguros. Cartas maiores são seguras se as cartas
 * de cor oposta de rank - 1 já estiverem nas fundações.
 */
function isSafeToFoundation(card, foundations) {
  if (card.rank <= 2) return true;

  const targetRank = card.rank - 1;
  const oppRed = !isRed(card);

  // Checar se todas as fundações de cor oposta já alcançaram pelo menos targetRank
  for (const pile of foundations) {
    const top = topCard(pile);
    if (top && isRed(top) === oppRed) {
      if (top.rank < targetRank) return false;
    } else if (!top && targetRank > 0) {
      // Se alguma fundação de cor oposta está vazia, não é 100% seguro além do 2
      return false;
    }
  }
  return true;
}

export function findHint(state) {
  if (!state || state.status !== 'playing') return null;

  // 1. Prioridade 1: Tableau para Fundação (Seguro)
  for (let col = 0; col < state.tableau.length; col += 1) {
    const pile = state.tableau[col];
    const card = topCard(pile);
    if (!card || !card.faceUp) continue;

    for (let f = 0; f < state.foundations.length; f += 1) {
      const from = { pile: 'tableau', index: col };
      const to = { pile: 'foundation', index: f };
      if (canMove(state, from, to, pile.length - 1)) {
        if (isSafeToFoundation(card, state.foundations)) {
          return {
            type: 'move',
            from,
            to,
            cardIndex: pile.length - 1,
            card,
            priority: 1,
            message: `Mova o ${cardName(card)} para a fundação.`,
          };
        }
      }
    }
  }

  // 2. Prioridade 2: Descarte para Fundação (Seguro)
  const wasteCard = topCard(state.waste);
  if (wasteCard) {
    for (let f = 0; f < state.foundations.length; f += 1) {
      const from = { pile: 'waste', index: 0 };
      const to = { pile: 'foundation', index: f };
      if (canMove(state, from, to, 0)) {
        if (isSafeToFoundation(wasteCard, state.foundations)) {
          return {
            type: 'move',
            from,
            to,
            cardIndex: 0,
            card: wasteCard,
            priority: 2,
            message: `Mova o ${cardName(wasteCard)} do descarte para a fundação.`,
          };
        }
      }
    }
  }

  // 3. Prioridade 3: Mover no Tableau para DESVIRAR carta oculta
  for (let fromCol = 0; fromCol < state.tableau.length; fromCol += 1) {
    const fromPile = state.tableau[fromCol];
    const firstFaceUpIndex = fromPile.findIndex((c) => c.faceUp);
    if (firstFaceUpIndex > 0) {
      // Há cartas viradas para baixo abaixo desta pilha!
      const movingCard = fromPile[firstFaceUpIndex];
      for (let toCol = 0; toCol < state.tableau.length; toCol += 1) {
        if (toCol === fromCol) continue;
        const from = { pile: 'tableau', index: fromCol };
        const to = { pile: 'tableau', index: toCol };
        if (canMove(state, from, to, firstFaceUpIndex)) {
          return {
            type: 'move',
            from,
            to,
            cardIndex: firstFaceUpIndex,
            card: movingCard,
            priority: 3,
            message: `Mova o ${cardName(movingCard)} para a coluna ${toCol + 1} para revelar uma carta oculta!`,
          };
        }
      }
    }
  }

  // 4. Prioridade 4: Mover Rei para coluna vazia (se libertar cartas ou do descarte)
  const hasEmptyTableau = state.tableau.some((pile) => pile.length === 0);
  if (hasEmptyTableau) {
    const emptyColIndex = state.tableau.findIndex((pile) => pile.length === 0);
    const to = { pile: 'tableau', index: emptyColIndex };

    // Checar descarte
    if (wasteCard && wasteCard.rank === 13) {
      return {
        type: 'move',
        from: { pile: 'waste', index: 0 },
        to,
        cardIndex: 0,
        card: wasteCard,
        priority: 4,
        message: `Mova o Rei (${cardName(wasteCard)}) do descarte para a coluna vazia ${emptyColIndex + 1}.`,
      };
    }

    // Checar tableau (se tiver cartas ocultas abaixo do Rei)
    for (let fromCol = 0; fromCol < state.tableau.length; fromCol += 1) {
      const fromPile = state.tableau[fromCol];
      const kingIndex = fromPile.findIndex((c) => c.faceUp && c.rank === 13);
      if (kingIndex > 0) {
        return {
          type: 'move',
          from: { pile: 'tableau', index: fromCol },
          to,
          cardIndex: kingIndex,
          card: fromPile[kingIndex],
          priority: 4,
          message: `Mova o Rei (${cardName(fromPile[kingIndex])}) para a coluna vazia ${emptyColIndex + 1} e libere a carta oculta.`,
        };
      }
    }
  }

  // 5. Prioridade 5: Mover do descarte para o Tableau
  if (wasteCard) {
    for (let toCol = 0; toCol < state.tableau.length; toCol += 1) {
      const from = { pile: 'waste', index: 0 };
      const to = { pile: 'tableau', index: toCol };
      if (canMove(state, from, to, 0)) {
        return {
          type: 'move',
          from,
          to,
          cardIndex: 0,
          card: wasteCard,
          priority: 5,
          message: `Mova o ${cardName(wasteCard)} do descarte para a coluna ${toCol + 1}.`,
        };
      }
    }
  }

  // 6. Prioridade 6: Qualquer carta para a fundação (mesmo que não passe na checagem estrita de segurança)
  for (let col = 0; col < state.tableau.length; col += 1) {
    const pile = state.tableau[col];
    const card = topCard(pile);
    if (!card || !card.faceUp) continue;

    for (let f = 0; f < state.foundations.length; f += 1) {
      const from = { pile: 'tableau', index: col };
      const to = { pile: 'foundation', index: f };
      if (canMove(state, from, to, pile.length - 1)) {
        return {
          type: 'move',
          from,
          to,
          cardIndex: pile.length - 1,
          card,
          priority: 6,
          message: `Mova o ${cardName(card)} para a fundação.`,
        };
      }
    }
  }

  // 7. Prioridade 7: Reorganização interna no Tableau
  for (let fromCol = 0; fromCol < state.tableau.length; fromCol += 1) {
    const fromPile = state.tableau[fromCol];
    const firstFaceUpIndex = fromPile.findIndex((c) => c.faceUp);
    if (firstFaceUpIndex < 0) continue;

    for (let i = firstFaceUpIndex; i < fromPile.length; i += 1) {
      const movingCard = fromPile[i];
      for (let toCol = 0; toCol < state.tableau.length; toCol += 1) {
        if (toCol === fromCol) continue;
        const targetPile = state.tableau[toCol];
        if (targetPile.length === 0 && movingCard.rank === 13 && i === 0) {
          // Não mover um Rei já na base de uma coluna vazia para outra coluna vazia
          continue;
        }
        const from = { pile: 'tableau', index: fromCol };
        const to = { pile: 'tableau', index: toCol };
        if (canMove(state, from, to, i)) {
          return {
            type: 'move',
            from,
            to,
            cardIndex: i,
            card: movingCard,
            priority: 7,
            message: `Mova o ${cardName(movingCard)} da coluna ${fromCol + 1} para a coluna ${toCol + 1}.`,
          };
        }
      }
    }
  }

  // 8. Prioridade 8: Comprar do Monte
  if (state.stock.length > 0) {
    return {
      type: 'draw',
      priority: 8,
      message: 'Compre uma carta do monte de compra.',
    };
  }

  // 9. Prioridade 9: Reciclar Descarte
  if (state.waste.length > 0) {
    return {
      type: 'recycle',
      priority: 9,
      message: 'Clique no monte vazio para reciclar as cartas descartadas.',
    };
  }

  return {
    type: 'none',
    priority: 10,
    message: 'Nenhum movimento restante. Você pode reiniciar a partida.',
  };
}
