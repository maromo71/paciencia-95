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

  // Renderiza a figura acadêmica (Estudante/J, Professora/Q, Patrono/K)
  const renderCharacter = () => (
    <g>
      {/* Corpo / Vestimenta acadêmica */}
      {card.rank === 11 && (
        // Valete: Estudante / Estagiário com jaleco e crachá
        <>
          <path d="M10 31 Q22 23 34 31 L33 37 L11 37 Z" fill="#2c5282" stroke="#1a202c" strokeWidth="0.7" />
          <path d="M15 31 L22 35 L29 31 L28 37 L16 37 Z" fill="#ffffff" />
          {/* Bolso do jaleco e caneta */}
          <rect x="25" y="32" width="5" height="4.5" fill="#ffffff" stroke="#2b6cb0" strokeWidth="0.4" />
          <line x1="27" y1="31" x2="27" y2="33.5" stroke="#e53e3e" strokeWidth="0.6" />
          {/* Crachá ETEC/FATEC pendurado */}
          <rect x="13" y="33" width="4.5" height="3" rx="0.4" fill="#ffffff" stroke="#333" strokeWidth="0.4" />
          <line x1="14" y1="34" x2="16.5" y2="34" stroke="#e53e3e" strokeWidth="0.4" />
        </>
      )}

      {card.rank === 12 && (
        // Dama: Professora / Cientista com jaleco e laptop/prancheta
        <>
          <path d="M10 31 Q22 22 34 31 L33 37 L11 37 Z" fill="#702459" stroke="#1a202c" strokeWidth="0.7" />
          <path d="M16 30 L22 35 L28 30 L27 37 L17 37 Z" fill="#fffdf4" />
          {/* Prancheta ou laptop de código */}
          <rect x="25" y="29" width="7" height="6.5" rx="0.5" fill="#2d3748" stroke="#1a202c" strokeWidth="0.5" />
          <rect x="26" y="30" width="5" height="4" fill="#00e5ff" opacity="0.85" />
          <line x1="27" y1="31.5" x2="29.5" y2="31.5" stroke="#000" strokeWidth="0.4" />
        </>
      )}

      {card.rank === 13 && (
        // Rei: Patrono / Diretor / Engenheiro com beca de formatura e diploma
        <>
          <path d="M10 31 Q22 22 34 31 L33 37 L11 37 Z" fill="#1a202c" stroke="#000" strokeWidth="0.8" />
          {/* Faixa / Estola acadêmica na cor oficial */}
          <path d="M16 29 L22 34 L28 29 L26 37 L18 37 Z" fill={primary} stroke={gold} strokeWidth="0.5" />
          {/* Diploma enrolado com fita vermelha na mão */}
          <rect x="26" y="30" width="6" height="3.5" rx="1" fill="#fffdf4" stroke="#4a5568" strokeWidth="0.5" transform="rotate(-15 28 31)" />
          <line x1="28.5" y1="29.5" x2="28.5" y2="33" stroke="#e53e3e" strokeWidth="0.7" />
        </>
      )}

      {/* Rosto */}
      <circle cx="22" cy="19.5" r="5" fill={skin} stroke="#222" strokeWidth="0.6" />
      <circle cx="20.2" cy="19" r="0.55" fill="#222" />
      <circle cx="23.8" cy="19" r="0.55" fill="#222" />
      <path d="M20.5 21.8 Q22 22.8 23.5 21.8" fill="none" stroke="#8c3b2e" strokeWidth="0.5" />

      {/* Cabelo e Acessórios por rank */}
      {card.rank === 11 && (
        // Estudante: cabelo jovem moderno + fone de ouvido
        <>
          <path d="M17 17 Q22 11 27 16 L25 13 L22 11 L19 13 Z" fill="#2b4c27" />
          {/* Fone ou headset */}
          <path d="M16.5 19.5 Q16.5 13 22 13 Q27.5 13 27.5 19.5" fill="none" stroke="#e53e3e" strokeWidth="0.8" />
          <circle cx="16.5" cy="19.5" r="1.2" fill="#e53e3e" />
          <circle cx="27.5" cy="19.5" r="1.2" fill="#e53e3e" />
        </>
      )}

      {card.rank === 12 && (
        // Professora: cabelo elegante + óculos
        <>
          <path d="M16 18 Q17 11 22 11 Q27 11 28 18 Q25 14 22 14 Q19 14 16 18 Z" fill="#4a2810" />
          {/* Óculos de grau */}
          <rect x="18.8" y="17.8" width="2.8" height="2.2" rx="0.5" fill="none" stroke="#d4af37" strokeWidth="0.5" />
          <rect x="22.4" y="17.8" width="2.8" height="2.2" rx="0.5" fill="none" stroke="#d4af37" strokeWidth="0.5" />
          <line x1="21.6" y1="18.8" x2="22.4" y2="18.8" stroke="#d4af37" strokeWidth="0.5" />
        </>
      )}

      {card.rank === 13 && (
        // Diretor: barba distinta + Capelo Acadêmico
        <>
          <path d="M18.5 23.5 Q22 27 25.5 23.5 Q24 25 22 25 Q20 25 18.5 23.5 Z" fill="#e2e8f0" stroke="#718096" strokeWidth="0.4" />
          {/* Capelo de formatura (losango preto com pingente dourado) */}
          <polygon points="22,6 30,10.5 22,14 14,10.5" fill="#1a202c" stroke="#2d3748" strokeWidth="0.5" />
          <rect x="18" y="12.5" width="8" height="2.5" fill="#1a202c" />
          {/* Pingente / Borla do capelo */}
          <line x1="22" y1="10" x2="28" y2="14" stroke={gold} strokeWidth="0.6" />
          <circle cx="28.5" cy="14.5" r="0.8" fill={gold} />
        </>
      )}

      {/* Coroa / Faixa acadêmica para o Valete e Dama */}
      {card.rank !== 13 && (
        <path
          d={
            card.rank === 12
              ? 'M16 13 L18 8 L20 11 L22 6 L24 11 L26 8 L28 13 Z'
              : 'M16 13 L18 9 L20 11 L22 8 L24 11 L26 9 L28 13 Z'
          }
          fill={gold}
          stroke="#5c4410"
          strokeWidth="0.5"
        />
      )}
    </g>
  );

  return (
    <div className="court-frame" aria-hidden="true">
      <svg viewBox="0 0 44 62" className="court-art">
        <rect x="0.8" y="0.8" width="42.4" height="60.4" fill="#fffdf4" stroke="#333" strokeWidth="0.9" />
        <rect x="3.2" y="3.2" width="37.6" height="55.6" fill="none" stroke={primary} strokeOpacity="0.45" strokeWidth="0.7" />

        {renderCharacter()}

        <g transform="rotate(180 22 31)">
          {renderCharacter()}
        </g>

        {/* Insígnia central com o naipe */}
        <rect x="13.5" y="26.5" width="17" height="9" rx="1" fill="#fffdf4" stroke={primary} strokeWidth="0.7" />
        <text x="22" y="33.4" textAnchor="middle" fontSize="7.6" fill={primary} fontFamily="Tahoma, sans-serif">
          {SUIT_SYMBOLS[card.suit]}
        </text>
      </svg>
    </div>
  );
}

function AceCenter({ card }) {
  const red = isRed(card);
  const color = red ? '#b00000' : '#111111';

  return (
    <div className="ace-center" aria-hidden="true">
      <svg viewBox="0 0 46 54" style={{ width: 44, height: 50, display: 'block' }}>
        {/* Louros dourados da excelência educacional */}
        <path
          d="M7,34 C4,24 10,12 18,8 M39,34 C42,24 36,12 28,8"
          fill="none"
          stroke="#d4af37"
          strokeWidth="1.1"
          strokeDasharray="2,1.5"
        />
        <circle cx="9" cy="24" r="1.3" fill="#d4af37" />
        <circle cx="12" cy="16" r="1.3" fill="#d4af37" />
        <circle cx="18" cy="10" r="1.3" fill="#d4af37" />
        <circle cx="37" cy="24" r="1.3" fill="#d4af37" />
        <circle cx="34" cy="16" r="1.3" fill="#d4af37" />
        <circle cx="28" cy="10" r="1.3" fill="#d4af37" />
        {/* Grande Naipe Central */}
        <text
          x="23"
          y="32"
          textAnchor="middle"
          fontSize="27"
          fill={color}
          fontFamily="Georgia, serif"
        >
          {SUIT_SYMBOLS[card.suit]}
        </text>
        {/* Selo Centro Paula Souza */}
        <text
          x="23"
          y="45"
          textAnchor="middle"
          fontSize="3.8"
          fontWeight="bold"
          fill="#78909c"
          fontFamily="Tahoma, sans-serif"
          letterSpacing="0.6"
        >
          CPS · EXCELÊNCIA
        </text>
      </svg>
    </div>
  );
}

function CardFace({ card }) {
  return (
    <div className="card-face-inner">
      <Corner card={card} />
      {card.rank === 1 && <AceCenter card={card} />}
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
