import {
  RANK_LABELS,
  SUIT_SYMBOLS,
  cardColor,
  cardName,
  isRed,
} from '../game/cards.js';
import CardBack from './CardBack.jsx';

const PIP_LAYOUTS = {
  2: [
    [50, 22],
    [50, 78],
  ],
  3: [
    [50, 20],
    [50, 50],
    [50, 80],
  ],
  4: [
    [31, 23],
    [69, 23],
    [31, 77],
    [69, 77],
  ],
  5: [
    [31, 23],
    [69, 23],
    [50, 50],
    [31, 77],
    [69, 77],
  ],
  6: [
    [31, 22],
    [69, 22],
    [31, 50],
    [69, 50],
    [31, 78],
    [69, 78],
  ],
  7: [
    [31, 20],
    [69, 20],
    [50, 35],
    [31, 56],
    [69, 56],
    [31, 80],
    [69, 80],
  ],
  8: [
    [31, 18],
    [69, 18],
    [50, 32],
    [31, 48],
    [69, 48],
    [50, 68],
    [31, 82],
    [69, 82],
  ],
  9: [
    [31, 17],
    [69, 17],
    [31, 40],
    [69, 40],
    [50, 50],
    [31, 60],
    [69, 60],
    [31, 83],
    [69, 83],
  ],
  10: [
    [31, 15],
    [69, 15],
    [50, 28],
    [31, 40],
    [69, 40],
    [31, 60],
    [69, 60],
    [50, 72],
    [31, 85],
    [69, 85],
  ],
};

function Corner({ card }) {
  return (
    <>
      <div className="card-corner card-corner-top">
        <span className="corner-rank">{RANK_LABELS[card.rank]}</span>
        <span className="corner-suit">{SUIT_SYMBOLS[card.suit]}</span>
      </div>
      <div className="card-corner card-corner-bottom">
        <span className="corner-rank">{RANK_LABELS[card.rank]}</span>
        <span className="corner-suit">{SUIT_SYMBOLS[card.suit]}</span>
      </div>
    </>
  );
}

function Pips({ card }) {
  const layout = PIP_LAYOUTS[card.rank] ?? [];
  return (
    <div className="card-pips" aria-hidden="true">
      {layout.map(([x, y], index) => (
        <span
          key={`${x}-${y}-${index}`}
          className="pip"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            transform: `translate(-50%, -50%) rotate(${y > 55 ? 180 : 0}deg)`,
          }}
        >
          {SUIT_SYMBOLS[card.suit]}
        </span>
      ))}
    </div>
  );
}

function CourtArt({ card }) {
  const red = isRed(card);
  const primary = red ? '#a81717' : '#17215e';
  const gold = '#d9ab45';
  const skin = '#f3d8bc';

  return (
    <div className="court-frame" aria-hidden="true">
      <svg viewBox="0 0 44 62" className="court-art">
        <rect x="0.8" y="0.8" width="42.4" height="60.4" fill="#fffdf4" stroke="#333" strokeWidth="0.9" />
        <rect x="3.2" y="3.2" width="37.6" height="55.6" fill="none" stroke={primary} strokeOpacity="0.45" strokeWidth="0.7" />

        <g>
          <path d="M10 31 Q22 22 34 31 L33 37 L11 37 Z" fill={primary} stroke="#222" strokeWidth="0.7" />
          <path d="M15 30 L22 34 L29 30 L28 36 L16 36 Z" fill="#fffdf4" opacity="0.9" />
          <circle cx="22" cy="20" r="5.2" fill={skin} stroke="#222" strokeWidth="0.7" />
          <circle cx="20.2" cy="19.4" r="0.55" fill="#222" />
          <circle cx="23.8" cy="19.4" r="0.55" fill="#222" />
          <path d="M20.3 22.3 Q22 23.4 23.7 22.3" fill="none" stroke="#8c3b2e" strokeWidth="0.55" />
          {card.rank === 12 && (
            <path d="M16 18 Q17 12 22 12 Q27 12 28 18 Q25 15 22 15 Q19 15 16 18 Z" fill="#5a321e" />
          )}
          {card.rank === 11 && (
            <path d="M17 16 Q22 10 27 16 L25 13 L22 12 L19 13 Z" fill="#2e3d2b" />
          )}
          {card.rank === 13 && (
            <path d="M18 24 Q19 28 22 28 Q25 28 26 24 Q24 26 22 26 Q20 26 18 24 Z" fill="#e9e6dc" stroke="#777" strokeWidth="0.4" />
          )}
          <path
            d={
              card.rank === 12
                ? 'M15 14 L17 7 L20 11 L22 5 L24 11 L27 7 L29 14 Z'
                : card.rank === 11
                  ? 'M15 14 L16 8 L19 11 L22 7 L25 11 L28 8 L29 14 Z'
                  : 'M14 14 L16 6 L20 10 L22 4 L24 10 L28 6 L30 14 Z'
            }
            fill={gold}
            stroke="#5c4410"
            strokeWidth="0.6"
          />
          <circle cx="22" cy="9.5" r="1" fill={primary} />
        </g>

        <g transform="rotate(180 22 31)">
          <path d="M10 31 Q22 22 34 31 L33 37 L11 37 Z" fill={primary} stroke="#222" strokeWidth="0.7" />
          <path d="M15 30 L22 34 L29 30 L28 36 L16 36 Z" fill="#fffdf4" opacity="0.9" />
          <circle cx="22" cy="20" r="5.2" fill={skin} stroke="#222" strokeWidth="0.7" />
          <circle cx="20.2" cy="19.4" r="0.55" fill="#222" />
          <circle cx="23.8" cy="19.4" r="0.55" fill="#222" />
          <path d="M20.3 22.3 Q22 23.4 23.7 22.3" fill="none" stroke="#8c3b2e" strokeWidth="0.55" />
          {card.rank === 12 && (
            <path d="M16 18 Q17 12 22 12 Q27 12 28 18 Q25 15 22 15 Q19 15 16 18 Z" fill="#5a321e" />
          )}
          {card.rank === 11 && (
            <path d="M17 16 Q22 10 27 16 L25 13 L22 12 L19 13 Z" fill="#2e3d2b" />
          )}
          {card.rank === 13 && (
            <path d="M18 24 Q19 28 22 28 Q25 28 26 24 Q24 26 22 26 Q20 26 18 24 Z" fill="#e9e6dc" stroke="#777" strokeWidth="0.4" />
          )}
          <path
            d={
              card.rank === 12
                ? 'M15 14 L17 7 L20 11 L22 5 L24 11 L27 7 L29 14 Z'
                : card.rank === 11
                  ? 'M15 14 L16 8 L19 11 L22 7 L25 11 L28 8 L29 14 Z'
                  : 'M14 14 L16 6 L20 10 L22 4 L24 10 L28 6 L30 14 Z'
            }
            fill={gold}
            stroke="#5c4410"
            strokeWidth="0.6"
          />
          <circle cx="22" cy="9.5" r="1" fill={primary} />
        </g>

        <rect x="13.5" y="26.5" width="17" height="9" rx="1" fill="#fffdf4" stroke={primary} strokeWidth="0.7" />
        <text x="22" y="33.4" textAnchor="middle" fontSize="7.6" fill={primary} fontFamily="Tahoma, sans-serif">
          {SUIT_SYMBOLS[card.suit]}
        </text>
      </svg>
    </div>
  );
}

function CardFace({ card }) {
  return (
    <div className="card-face-inner">
      <Corner card={card} />
      {card.rank === 1 && (
        <div className="ace-center" aria-hidden="true">
          {SUIT_SYMBOLS[card.suit]}
        </div>
      )}
      {card.rank >= 2 && card.rank <= 10 && <Pips card={card} />}
      {card.rank >= 11 && <CourtArt card={card} />}
    </div>
  );
}

export default function Card({
  card,
  cardBack,
  faceDown = false,
  hidden = false,
  animateFlip = false,
  dealing = false,
  className = '',
  style,
  ...rest
}) {
  const down = faceDown || !card?.faceUp;
  const backType =
    cardBack ||
    className.match(/back-([a-z0-9_-]+)/)?.[1] ||
    'blue';

  const classes = [
    'card',
    down ? 'card-down' : 'card-up',
    down ? `back-${backType}` : cardColor(card),
    hidden ? 'card-hidden' : '',
    animateFlip ? 'card-flipping' : '',
    dealing ? 'card-dealing' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      style={style}
      aria-label={down ? 'Carta virada para baixo' : cardName(card)}
      {...rest}
    >
      {down ? <CardBack type={backType} /> : <CardFace card={card} />}
    </div>
  );
}
