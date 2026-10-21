import { useEffect, useRef, useState } from 'react';
import { canMove, findAutoMove, getMovingCards } from '../game/rules.js';
import Card from './Card.jsx';
import WinAnimation from './WinAnimation.jsx';

const BOARD_WIDTH = 640;
const BOARD_HEIGHT = 480;
const CARD_WIDTH = 71;
const CARD_HEIGHT = 96;
const MARGIN = 20;
const GAP = 16;
const TOP = 20;
const TABLEAU_Y = 128;
const WASTE_X = 107;
const FAN = 18;

const tableauX = (index) => MARGIN + index * (CARD_WIDTH + GAP);
const foundationX = (index) =>
  BOARD_WIDTH - MARGIN - CARD_WIDTH - (3 - index) * (CARD_WIDTH + GAP);

function pileTops(pile) {
  const available = BOARD_HEIGHT - TABLEAU_Y - 6;
  const downCount = pile.filter((card) => !card.faceUp).length;
  const upCount = pile.length - downCount;
  const downOffset = 4;
  let upOffset = 18;

  const total =
    CARD_HEIGHT + downCount * downOffset + Math.max(0, upCount - 1) * upOffset;
  if (total > available && upCount > 1) {
    upOffset = Math.max(
      8,
      Math.floor((available - CARD_HEIGHT - downCount * downOffset) / (upCount - 1)),
    );
  }

  const tops = [];
  let cursor = 0;
  for (const card of pile) {
    tops.push(cursor);
    cursor += card.faceUp ? upOffset : downOffset;
  }
  return tops;
}

function wasteCardLeft(index) {
  return index * FAN;
}

const FOUNDATION_THEMES = [
  { suit: 'H', symbol: '♥', area: 'Gestão', fullArea: 'Gestão, Negócios e Pessoas' },
  { suit: 'S', symbol: '♠', area: 'TI/Software', fullArea: 'Tecnologia da Informação e Software' },
  { suit: 'C', symbol: '♣', area: 'Mecânica', fullArea: 'Mecânica, Indústria e Automação' },
  { suit: 'D', symbol: '♦', area: 'Eletrônica', fullArea: 'Eletrônica, Redes e Telecomunicações' },
];

export default function Board({
  game,
  cardBack,
  winAnimation,
  hint = null,
  onWinAnimationDone,
  onDraw,
  onRecycle,
  onMove,
}) {
  const boardRef = useRef(null);
  const dragRef = useRef(null);
  const gameRef = useRef(game);
  const moveRef = useRef(onMove);
  const [drag, setDrag] = useState(null);

  useEffect(() => {
    gameRef.current = game;
    moveRef.current = onMove;
  }, [game, onMove]);

  const dealing = game.moves.length === 0;

  useEffect(() => {
    const findTarget = (clientX, clientY) => {
      const element = document.elementFromPoint(clientX, clientY);
      const drop = element?.closest('[data-drop]');
      if (!drop) return null;
      const [kind, rawIndex] = drop.dataset.drop.split('-');
      const index = Number(rawIndex);
      if (!Number.isInteger(index)) return null;
      if (kind === 'tableau' || kind === 'foundation') {
        return { pile: kind, index };
      }
      return null;
    };

    const handlePointerMove = (event) => {
      const pending = dragRef.current;
      if (!pending) return;

      if (!pending.active) {
        const distance = Math.hypot(
          event.clientX - pending.startClientX,
          event.clientY - pending.startClientY,
        );
        if (distance < 5) return;
        pending.active = true;
        const rect = boardRef.current?.getBoundingClientRect();
        if (!rect) return;
        pending.rect = rect;
        pending.scale = rect.width / BOARD_WIDTH;
      }

      const localX = (event.clientX - pending.rect.left) / pending.scale;
      const localY = (event.clientY - pending.rect.top) / pending.scale;
      const candidate = findTarget(event.clientX, event.clientY);
      const target =
        candidate && canMove(gameRef.current, pending.from, candidate, pending.cardIndex)
          ? candidate
          : null;

      setDrag({
        from: pending.from,
        cardIndex: pending.cardIndex,
        cards: pending.cards,
        x: localX - pending.offsetX,
        y: localY - pending.offsetY,
        target,
        active: true,
      });
    };

    const handlePointerUp = (event) => {
      const pending = dragRef.current;
      if (!pending) return;
      dragRef.current = null;

      if (!pending.active) {
        setDrag(null);
        return;
      }

      const candidate = findTarget(event.clientX, event.clientY);
      setDrag(null);
      if (
        candidate &&
        canMove(gameRef.current, pending.from, candidate, pending.cardIndex)
      ) {
        moveRef.current(pending.from, candidate, pending.cardIndex);
      }
    };

    const handleCancel = () => {
      dragRef.current = null;
      setDrag(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handleCancel);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handleCancel);
    };
  }, []);

  function beginDrag(event, from, cardIndex = 0) {
    if (event.button !== 0 || game.status !== 'playing') return;
    const moving = getMovingCards(game, from, cardIndex);
    if (!moving || !moving.length) return;
    if (from.pile === 'tableau' && !moving[0].faceUp) return;

    event.stopPropagation();

    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scale = rect.width / BOARD_WIDTH;
    const localX = (event.clientX - rect.left) / scale;
    const localY = (event.clientY - rect.top) / scale;

    let cardLeft;
    let cardTop;
    if (from.pile === 'waste') {
      const visible = Math.min(game.draw, game.waste.length);
      cardLeft = WASTE_X + wasteCardLeft(Math.max(0, visible - 1));
      cardTop = TOP;
    } else if (from.pile === 'foundation') {
      cardLeft = foundationX(from.index);
      cardTop = TOP;
    } else {
      const tops = pileTops(game.tableau[from.index]);
      cardLeft = tableauX(from.index);
      cardTop = TABLEAU_Y + tops[cardIndex];
    }

    dragRef.current = {
      from,
      cardIndex,
      cards: moving,
      startClientX: event.clientX,
      startClientY: event.clientY,
      offsetX: localX - cardLeft,
      offsetY: localY - cardTop,
      rect,
      scale,
      active: false,
    };
  }

  function handleDoubleClick(event, from, cardIndex) {
    event.stopPropagation();
    if (game.status !== 'playing') return;
    const target = findAutoMove(game, from, cardIndex);
    if (target) onMove(target.from, target.to, target.cardIndex);
  }

  function handleStockClick() {
    if (game.status !== 'playing') return;
    if (game.stock.length > 0) onDraw();
    else if (game.waste.length > 0) onRecycle();
    else onDraw();
  }

  function isHidden(from, cardIndex) {
    if (!drag?.active) return false;
    if (drag.from.pile !== from.pile) return false;
    if (from.pile === 'waste') return cardIndex === game.waste.length - 1;
    if (from.pile === 'foundation') {
      return cardIndex === game.foundations[from.index].length - 1;
    }
    return from.index === drag.from.index && cardIndex >= drag.cardIndex;
  }

  function canDropHere(target) {
    if (!drag?.active) return false;
    return canMove(game, drag.from, target, drag.cardIndex);
  }

  const visibleWaste = game.waste.slice(-game.draw);
  const wasteTopIndex = visibleWaste.length - 1;

  const isHintSource = (ref, cardIdx) => {
    if (!hint || hint.type !== 'move') return false;
    if (hint.from.pile !== ref.pile) return false;
    if (ref.pile === 'waste' || ref.pile === 'foundation') return true;
    return hint.from.index === ref.index && hint.cardIndex === cardIdx;
  };

  const isHintTarget = (ref) => {
    if (!hint || hint.type !== 'move') return false;
    return hint.to.pile === ref.pile && hint.to.index === ref.index;
  };

  const isStockHint = hint && (hint.type === 'draw' || hint.type === 'recycle');

  return (
    <div
      className={`game-field ${drag?.active ? 'dragging' : ''}`}
      ref={boardRef}
      aria-label="Tabuleiro de paciência"
    >
      <div
        className={`stock-pile pile ${isStockHint ? 'hint-source' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Monte de compra"
        onClick={handleStockClick}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleStockClick();
          }
        }}
      >
        {game.stock.length > 0 ? (
          <>
            <div className="stock-stack-shadow" />
            <Card
              card={{ suit: 'S', rank: 1, faceUp: false }}
              faceDown
              className={`back-${cardBack}`}
              dealing={dealing}
              style={{ top: 0, left: 0 }}
            />
          </>
        ) : (
          <div className="card-slot stock-empty">
            {game.waste.length > 0 && (
              <div className="recycle-icon" aria-hidden="true">
                ↻
              </div>
            )}
          </div>
        )}
      </div>

      <div className="waste-pile pile" aria-label="Descarte">
        {visibleWaste.length === 0 ? (
          <div className="card-slot" />
        ) : (
          visibleWaste.map((card, index) => {
            const isTop = index === wasteTopIndex;
            const originalIndex = game.waste.length - visibleWaste.length + index;
            const isSourceHint = isTop && isHintSource({ pile: 'waste', index: 0 }, 0);
            return (
              <Card
                key={`${game.id}-${card.suit}${card.rank}`}
                card={card}
                className={`back-${cardBack} ${isSourceHint ? 'hint-source' : ''}`}
                dealing={dealing}
                hidden={isHidden({ pile: 'waste' }, originalIndex)}
                style={{ top: 0, left: wasteCardLeft(index), zIndex: index + 1 }}
                data-draggable={isTop ? 'true' : 'false'}
                onPointerDown={
                  isTop
                    ? (event) => beginDrag(event, { pile: 'waste', index: 0 }, 0)
                    : undefined
                }
                onDoubleClick={
                  isTop
                    ? (event) => handleDoubleClick(event, { pile: 'waste', index: 0 }, 0)
                    : undefined
                }
              />
            );
          })
        )}
      </div>

      {game.foundations.map((pile, index) => {
        const theme = FOUNDATION_THEMES[index] || FOUNDATION_THEMES[0];
        const target = { pile: 'foundation', index };
        const dropHover =
          drag?.target?.pile === 'foundation' && drag.target.index === index;
        const isTargetHint = isHintTarget(target);
        const top = pile[pile.length - 1];
        const isSourceHint = top && isHintSource(target, pile.length - 1);
        return (
          <div
            className={`foundation-pile pile ${
              canDropHere(target) ? 'can-drop' : ''
            } ${dropHover ? 'drop-hover' : ''} ${isTargetHint ? 'hint-target' : ''}`}
            key={`foundation-${index}`}
            data-drop={`foundation-${index}`}
            style={{ left: foundationX(index) }}
            aria-label={`Fundação ${index + 1}: ${theme.fullArea}`}
          >
            <div className="card-slot" title={`Fundação ${theme.symbol}: ${theme.fullArea}`}>
              <div className="foundation-placeholder" aria-hidden="true">
                <span className="foundation-suit-symbol">{theme.symbol}</span>
                <span className="foundation-area-tag">{theme.area}</span>
              </div>
            </div>
            {top && (
              <Card
                key={`${game.id}-${top.suit}${top.rank}`}
                card={top}
                className={`back-${cardBack} ${isSourceHint ? 'hint-source' : ''}`}
                dealing={dealing}
                hidden={isHidden(target, pile.length - 1)}
                style={{ top: 0, left: 0 }}
                data-draggable="true"
                onPointerDown={(event) => beginDrag(event, target, 0)}
                onDoubleClick={(event) => handleDoubleClick(event, target, 0)}
              />
            )}
          </div>
        );
      })}

      {game.tableau.map((pile, column) => {
        const target = { pile: 'tableau', index: column };
        const tops = pileTops(pile);
        const dropHover =
          drag?.target?.pile === 'tableau' && drag.target.index === column;
        const isTargetHint = isHintTarget(target);
        return (
          <div
            className={`tableau-pile pile ${
              canDropHere(target) ? 'can-drop' : ''
            } ${dropHover ? 'drop-hover' : ''} ${isTargetHint ? 'hint-target' : ''}`}
            key={`tableau-${column}`}
            data-drop={`tableau-${column}`}
            style={{ left: tableauX(column) }}
            aria-label={`Coluna ${column + 1}`}
          >
            {pile.length === 0 && <div className="card-slot" />}
            {pile.map((card, index) => {
              const isFlip =
                game.lastFlip?.pile === 'tableau' &&
                game.lastFlip.index === column &&
                game.lastFlip.cardIndex === index;
              const isSourceHint = isHintSource(target, index);
              return (
                <Card
                  key={`${game.id}-${card.suit}${card.rank}`}
                  card={card}
                  className={`back-${cardBack} ${isSourceHint ? 'hint-source' : ''}`}
                  dealing={dealing}
                  style={{
                    top: tops[index],
                    zIndex: index + 1,
                    animationDelay: dealing
                      ? `${Math.min(320, column * 18 + index * 9)}ms`
                      : undefined,
                  }}
                  hidden={isHidden(target, index)}
                  animateFlip={isFlip}
                  data-draggable={card.faceUp ? 'true' : 'false'}
                  onPointerDown={
                    card.faceUp
                      ? (event) => beginDrag(event, target, index)
                      : undefined
                  }
                  onDoubleClick={
                    card.faceUp
                      ? (event) => handleDoubleClick(event, target, index)
                      : undefined
                  }
                />
              );
            })}
          </div>
        );
      })}

      {drag?.active && (
        <div
          className="drag-layer"
          style={{ left: drag.x, top: drag.y }}
          aria-hidden="true"
        >
          {drag.cards.map((card, index) => (
            <Card
              key={`drag-${card.suit}${card.rank}`}
              card={card}
              className={`back-${cardBack}`}
              style={{ top: index * FAN, left: 0, zIndex: index + 1 }}
            />
          ))}
        </div>
      )}

      {winAnimation && (
        <WinAnimation
          active={winAnimation}
          foundations={game.foundations}
          onDone={onWinAnimationDone}
        />
      )}
    </div>
  );
}
