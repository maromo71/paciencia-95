export default function CardBack({ type = 'blue' }) {
  switch (type) {
    case 'red':
      return (
        <div className="card-back-inner back-red" aria-hidden="true">
          <div className="card-back-pattern" />
          <div className="card-back-medallion">♥</div>
        </div>
      );

    case 'green':
      return (
        <div className="card-back-inner back-green" aria-hidden="true">
          <div className="card-back-pattern" />
          <div className="card-back-medallion">♣</div>
        </div>
      );

    case 'chipset':
      return (
        <div className="card-back-inner back-illustrated" aria-hidden="true">
          <svg viewBox="0 0 62 86" className="card-back-svg">
            <rect width="62" height="86" fill="#0d3b1e" />
            <path
              d="M6,10 L20,10 L24,14 L38,14 L42,10 L56,10 M6,22 L16,22 L20,26 L42,26 L46,22 L56,22 M6,64 L16,64 L20,60 L42,60 L46,64 L56,64 M6,76 L20,76 L24,72 L38,72 L42,76 L56,76 M14,6 L14,20 L10,24 L10,62 L14,66 L14,80 M48,6 L48,20 L52,24 L52,62 L48,66 L48,80"
              fill="none"
              stroke="#d4af37"
              strokeWidth="0.8"
              opacity="0.85"
            />
            <circle cx="20" cy="10" r="1.2" fill="#d4af37" />
            <circle cx="42" cy="10" r="1.2" fill="#d4af37" />
            <circle cx="20" cy="26" r="1.2" fill="#d4af37" />
            <circle cx="42" cy="26" r="1.2" fill="#d4af37" />
            <circle cx="20" cy="60" r="1.2" fill="#d4af37" />
            <circle cx="42" cy="60" r="1.2" fill="#d4af37" />
            <circle cx="20" cy="76" r="1.2" fill="#d4af37" />
            <circle cx="42" cy="76" r="1.2" fill="#d4af37" />
            <g transform="translate(15, 30)">
              <path
                d="M-3,5 L0,5 M-3,10 L0,10 M-3,15 L0,15 M-3,20 L0,20 M32,5 L35,5 M32,10 L35,10 M32,15 L35,15 M32,20 L35,20 M5,-3 L5,0 M10,-3 L10,0 M15,-3 L15,0 M20,-3 L20,0 M25,-3 L25,0 M5,26 L5,29 M10,26 L10,29 M15,26 L15,29 M20,26 L20,29 M25,26 L25,29"
                stroke="#e0e0e0"
                strokeWidth="0.9"
              />
              <rect width="32" height="26" rx="2" fill="#1c1c1c" stroke="#333" strokeWidth="0.8" />
              <circle cx="3" cy="3" r="1" fill="#444" />
              <text x="16" y="13" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#d4af37" fontFamily="Tahoma, monospace" letterSpacing="0.6">
                FATEC
              </text>
              <text x="16" y="20" textAnchor="middle" fontSize="3.8" fill="#aaa" fontFamily="monospace">
                CPS-95
              </text>
            </g>
            <circle cx="8" cy="8" r="2.2" fill="#ff2222" className="led-blinking" />
            <circle cx="8" cy="8" r="0.8" fill="#ffffff" />
            <text x="12" y="9.2" fontSize="3" fill="#66bb6a" fontFamily="monospace">D1</text>
          </svg>
        </div>
      );

    case 'campus':
      return (
        <div className="card-back-inner back-illustrated" aria-hidden="true">
          <svg viewBox="0 0 62 86" className="card-back-svg">
            <rect width="62" height="86" fill="#87ceeb" />
            <rect x="6" y="8" width="14" height="4" fill="#ffffff" rx="1" />
            <rect x="9" y="6" width="8" height="3" fill="#ffffff" rx="1" />
            <rect x="42" y="12" width="16" height="4" fill="#ffffff" rx="1" />
            <rect x="46" y="10" width="8" height="3" fill="#ffffff" rx="1" />
            <rect y="74" width="62" height="12" fill="#2e7d32" />
            <rect y="81" width="62" height="5" fill="#4e342e" />
            <rect x="4" y="38" width="54" height="38" fill="#b71c1c" stroke="#5f0909" strokeWidth="0.8" />
            <rect x="3" y="36" width="56" height="3" fill="#fffdf4" stroke="#d7ccc8" strokeWidth="0.5" />
            <rect x="23" y="18" width="16" height="40" fill="#a31515" stroke="#5f0909" strokeWidth="0.8" />
            <polygon points="21,18 31,8 41,18" fill="#37474f" />
            <line x1="31" y1="8" x2="31" y2="3" stroke="#222" strokeWidth="0.8" />
            <polygon points="31,3 36,4.5 31,6" fill="#d32f2f" />
            <circle cx="31" cy="24" r="3.5" fill="#ffffff" stroke="#333" strokeWidth="0.6" />
            <line x1="31" y1="24" x2="31" y2="22" stroke="#000" strokeWidth="0.6" />
            <line x1="31" y1="24" x2="32.5" y2="24" stroke="#000" strokeWidth="0.6" />
            <rect x="28" y="30" width="6" height="7" rx="3" fill="#ffecb3" stroke="#4e342e" strokeWidth="0.5" />
            <rect x="8" y="44" width="4" height="6" rx="2" fill="#ffecb3" />
            <rect x="15" y="44" width="4" height="6" rx="2" fill="#ffecb3" />
            <rect x="43" y="44" width="4" height="6" rx="2" fill="#ffecb3" />
            <rect x="50" y="44" width="4" height="6" rx="2" fill="#ffecb3" />
            <rect x="8" y="56" width="4" height="6" rx="2" fill="#ffecb3" />
            <rect x="15" y="56" width="4" height="6" rx="2" fill="#ffecb3" />
            <rect x="43" y="56" width="4" height="6" rx="2" fill="#ffecb3" />
            <rect x="50" y="56" width="4" height="6" rx="2" fill="#ffecb3" />
            <path d="M26,76 L26,62 Q31,58 36,62 L36,76 Z" fill="#263238" />
            <rect x="25" y="60" width="12" height="2" fill="#fffdf4" />
            <text x="31" y="54" textAnchor="middle" fontSize="3.8" fontWeight="bold" fill="#ffffff" fontFamily="Tahoma, sans-serif" letterSpacing="0.4">
              ETEC · FATEC
            </text>
          </svg>
        </div>
      );

    case 'etec':
      return (
        <div className="card-back-inner back-illustrated" aria-hidden="true">
          <svg viewBox="0 0 62 86" className="card-back-svg">
            <rect width="62" height="86" fill="#660000" />
            <rect x="3" y="3" width="56" height="80" fill="none" stroke="#d4af37" strokeWidth="1" strokeDasharray="3,1.5" />
            <rect x="5" y="5" width="52" height="76" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.4" />
            <g transform="translate(31, 38)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <rect
                  key={angle}
                  x="-3.5"
                  y="-21"
                  width="7"
                  height="6"
                  rx="0.5"
                  fill="#f5b041"
                  stroke="#b7791f"
                  strokeWidth="0.6"
                  transform={`rotate(${angle})`}
                />
              ))}
              <circle cx="0" cy="0" r="17" fill="#f5b041" stroke="#b7791f" strokeWidth="0.8" />
              <circle cx="0" cy="0" r="12" fill="#660000" stroke="#b7791f" strokeWidth="0.8" />
              <line x1="-12" y1="0" x2="12" y2="0" stroke="#f5b041" strokeWidth="2.5" />
              <line x1="0" y1="-12" x2="0" y2="12" stroke="#f5b041" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="4.5" fill="#f5b041" stroke="#b7791f" strokeWidth="0.8" />
            </g>
            <g transform="translate(31, 62)">
              <path d="M-18,6 Q-9,1 0,5 Q9,1 18,6 L18,16 Q9,11 0,15 Q-9,11 -18,16 Z" fill="#fffdf4" stroke="#444" strokeWidth="0.7" />
              <line x1="0" y1="5" x2="0" y2="15" stroke="#888" strokeWidth="0.8" />
              <line x1="-14" y1="9" x2="-3" y2="7.5" stroke="#660000" strokeWidth="0.6" />
              <line x1="-14" y1="12" x2="-3" y2="10.5" stroke="#660000" strokeWidth="0.6" />
              <line x1="3" y1="7.5" x2="14" y2="9" stroke="#660000" strokeWidth="0.6" />
              <line x1="3" y1="10.5" x2="14" y2="12" stroke="#660000" strokeWidth="0.6" />
            </g>
            <text x="31" y="16" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#fffdf4" fontFamily="Arial Black, Impact, sans-serif" letterSpacing="1">
              ETEC
            </text>
            <text x="31" y="21" textAnchor="middle" fontSize="3.2" fill="#d4af37" fontFamily="Tahoma, sans-serif">
              ENSINO TÉCNICO
            </text>
          </svg>
        </div>
      );

    case 'terminal':
      return (
        <div className="card-back-inner back-illustrated" aria-hidden="true">
          <svg viewBox="0 0 62 86" className="card-back-svg">
            <rect width="62" height="86" fill="#3a3a3a" />
            <rect x="2" y="2" width="58" height="82" rx="3" fill="#1e1e1e" />
            <rect x="4" y="5" width="54" height="74" rx="2" fill="#041206" stroke="#003311" strokeWidth="0.8" />
            {[12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72].map((y) => (
              <line key={y} x1="5" y1={y} x2="57" y2={y} stroke="#072b0c" strokeWidth="0.5" opacity="0.6" />
            ))}
            <g fill="#00ff66" fontFamily="Courier New, monospace" fontSize="3.6" fontWeight="bold">
              <text x="7" y="15">MS-DOS 6.22</text>
              <text x="7" y="22">(C)CPS 1995</text>
              <text x="7" y="32">C:\&gt;CD CPS</text>
              <text x="7" y="42">C:\CPS&gt;DIR</text>
              <text x="7" y="50" fontSize="3">ETEC  &lt;DIR&gt;</text>
              <text x="7" y="55" fontSize="3">FATEC &lt;DIR&gt;</text>
              <text x="7" y="65">C:\CPS&gt;VEST_</text>
              <rect x="35" y="61.5" width="2.4" height="4" fill="#00ff66" className="term-cursor" />
            </g>
            <circle cx="53" cy="81" r="1.2" fill="#00ff66" />
          </svg>
        </div>
      );

    case 'castle':
      return (
        <div className="card-back-inner back-illustrated" aria-hidden="true">
          <svg viewBox="0 0 62 86" className="card-back-svg">
            <rect width="62" height="86" fill="#0d1b2a" />
            {/* Montanhas distantes */}
            <polygon points="0,58 18,44 38,58" fill="#1b263b" />
            <polygon points="28,62 48,46 62,60" fill="#1b263b" />
            {/* Lua cheia dourada */}
            <circle cx="45" cy="22" r="11" fill="#ffe082" />
            <circle cx="43" cy="20" r="10" fill="#fff9c4" />
            {/* Castelo medieval e torres */}
            <rect x="14" y="46" width="34" height="40" fill="#243042" />
            {/* Ameias da muralha principal */}
            <rect x="14" y="42" width="5" height="4" fill="#243042" />
            <rect x="23" y="42" width="5" height="4" fill="#243042" />
            <rect x="32" y="42" width="5" height="4" fill="#243042" />
            <rect x="41" y="42" width="5" height="4" fill="#243042" />
            {/* Torre esquerda */}
            <rect x="8" y="36" width="10" height="50" fill="#1b2432" />
            <rect x="7" y="32" width="12" height="4" fill="#1b2432" />
            <polygon points="7,32 13,20 19,32" fill="#0f172a" />
            {/* Torre direita */}
            <rect x="44" y="36" width="10" height="50" fill="#1b2432" />
            <rect x="43" y="32" width="12" height="4" fill="#1b2432" />
            <polygon points="43,32 49,20 55,32" fill="#0f172a" />
            {/* Torre central alta */}
            <rect x="25" y="30" width="12" height="20" fill="#161f2c" />
            <polygon points="24,30 31,14 38,30" fill="#0b1118" />
            {/* Janelas iluminadas */}
            <rect x="12" y="42" width="3" height="6" rx="1.5" fill="#ffd54f" />
            <rect x="47" y="42" width="3" height="6" rx="1.5" fill="#ffd54f" />
            <rect x="29" y="35" width="4" height="7" rx="2" fill="#ffd54f" />
            {/* Portão com arco */}
            <path d="M27,86 L27,70 Q31,65 35,70 L35,86 Z" fill="#0b1118" />
            {/* Morcegos no céu */}
            <path
              d="M32,18 Q35,14 38,17 Q40,14 43,18 Q38,19 32,18 Z"
              fill="#000"
            />
            <path
              d="M17,25 Q19,22 22,24 Q24,22 26,25 Q22,26 17,25 Z"
              fill="#000"
            />
          </svg>
        </div>
      );

    case 'beach':
      return (
        <div className="card-back-inner back-illustrated" aria-hidden="true">
          <svg viewBox="0 0 62 86" className="card-back-svg">
            {/* Céu radiante */}
            <rect width="62" height="52" fill="#4ea8de" />
            {/* Sol sorridente com óculos escuros */}
            <circle cx="18" cy="18" r="11" fill="#fbc02d" />
            {/* Óculos escuros no sol */}
            <rect x="11" y="15" width="6" height="4" rx="1" fill="#212121" />
            <rect x="19" y="15" width="6" height="4" rx="1" fill="#212121" />
            <line x1="16" y1="16" x2="20" y2="16" stroke="#212121" strokeWidth="1" />
            <path d="M14,23 Q18,27 22,23" stroke="#b71c1c" strokeWidth="1.2" fill="none" />
            {/* Oceano azul profundo */}
            <rect y="50" width="62" height="36" fill="#0077b6" />
            {/* Ondas */}
            <path
              d="M0,53 Q15,49 30,53 T62,53"
              stroke="#caf0f8"
              strokeWidth="1.2"
              fill="none"
            />
            <path
              d="M0,60 Q15,56 30,60 T62,60"
              stroke="#90e0ef"
              strokeWidth="1"
              fill="none"
            />
            {/* Ilha de areia dourada */}
            <path d="M18,86 Q36,64 62,72 L62,86 Z" fill="#ffd166" />
            {/* Coqueiro */}
            <path
              d="M48,82 Q44,62 50,48"
              stroke="#795548"
              strokeWidth="3.2"
              fill="none"
              strokeLinecap="round"
            />
            {/* Folhas do coqueiro */}
            <path
              d="M50,48 Q34,44 30,52"
              stroke="#2d6a4f"
              strokeWidth="2.5"
              fill="none"
            />
            <path
              d="M50,48 Q40,36 43,28"
              stroke="#2d6a4f"
              strokeWidth="2.5"
              fill="none"
            />
            <path
              d="M50,48 Q60,36 64,42"
              stroke="#2d6a4f"
              strokeWidth="2.5"
              fill="none"
            />
            <path
              d="M50,48 Q62,50 60,60"
              stroke="#2d6a4f"
              strokeWidth="2.5"
              fill="none"
            />
          </svg>
        </div>
      );

    case 'robot':
      return (
        <div className="card-back-inner back-illustrated" aria-hidden="true">
          <svg viewBox="0 0 62 86" className="card-back-svg">
            {/* Chapa metálica escura com rebites */}
            <rect width="62" height="86" fill="#2b2d42" />
            <circle cx="4" cy="4" r="1.5" fill="#8d99ae" />
            <circle cx="58" cy="4" r="1.5" fill="#8d99ae" />
            <circle cx="4" cy="82" r="1.5" fill="#8d99ae" />
            <circle cx="58" cy="82" r="1.5" fill="#8d99ae" />
            {/* Antena */}
            <line x1="31" y1="16" x2="31" y2="8" stroke="#8d99ae" strokeWidth="2" />
            <circle cx="31" cy="7" r="3" fill="#e63946" />
            {/* Cabeça do robô */}
            <rect
              x="17"
              y="16"
              width="28"
              height="22"
              rx="3"
              fill="#6c757d"
              stroke="#343a40"
              strokeWidth="1.2"
            />
            {/* Olhos de LED azul-turquesa */}
            <rect x="21" y="22" width="7" height="5" fill="#00f5d4" />
            <rect x="34" y="22" width="7" height="5" fill="#00f5d4" />
            {/* Boca de grade do alto-falante */}
            <line
              x1="23"
              y1="32"
              x2="39"
              y2="32"
              stroke="#343a40"
              strokeWidth="2"
              strokeDasharray="2,2"
            />
            {/* Tronco do robô */}
            <rect
              x="13"
              y="42"
              width="36"
              height="40"
              rx="3"
              fill="#495057"
              stroke="#343a40"
              strokeWidth="1.2"
            />
            {/* Mostrador analógico redondo */}
            <circle cx="25" cy="56" r="7" fill="#fff" stroke="#333" strokeWidth="1" />
            <line x1="25" y1="56" x2="28" y2="52" stroke="#d90429" strokeWidth="1.2" />
            {/* Luzes e botões coloridos */}
            <circle cx="40" cy="52" r="2.5" fill="#e63946" />
            <circle cx="40" cy="59" r="2.5" fill="#ffd166" />
            <circle cx="40" cy="66" r="2.5" fill="#06d6a0" />
            {/* Grade inferior */}
            <rect x="18" y="72" width="26" height="5" fill="#212529" rx="1" />
          </svg>
        </div>
      );

    case 'hand':
      return (
        <div className="card-back-inner back-illustrated" aria-hidden="true">
          <svg viewBox="0 0 62 86" className="card-back-svg">
            {/* Feltro verde esmeralda com moldura dourada */}
            <rect width="62" height="86" fill="#1b4332" />
            <rect
              x="3"
              y="3"
              width="56"
              height="80"
              fill="none"
              stroke="#d4af37"
              strokeWidth="1"
              strokeDasharray="4,2"
            />
            {/* Manga do mágico/apostador com listras preto e cinza */}
            <polygon points="0,12 32,32 24,52 0,32" fill="#212529" />
            <line x1="0" y1="18" x2="28" y2="36" stroke="#495057" strokeWidth="1.5" />
            <line x1="0" y1="24" x2="24" y2="42" stroke="#495057" strokeWidth="1.5" />
            {/* Punho de camisa branca */}
            <polygon
              points="28,29 40,38 34,51 22,42"
              fill="#f8f9fa"
              stroke="#adb5bd"
              strokeWidth="0.8"
            />
            {/* Abotoadura dourada */}
            <circle cx="30" cy="40" r="1.8" fill="#d4af37" />
            {/* Carta extra saindo da manga (Ás de Espadas miniatura) */}
            <g transform="translate(32, 38) rotate(18)">
              <rect
                x="0"
                y="0"
                width="22"
                height="32"
                rx="2"
                fill="#fffdf4"
                stroke="#222"
                strokeWidth="0.9"
              />
              <text
                x="3"
                y="8"
                fontSize="6"
                fontWeight="bold"
                fill="#000"
                fontFamily="Tahoma, sans-serif"
              >
                A
              </text>
              <text
                x="11"
                y="20"
                fontSize="12"
                fill="#000"
                textAnchor="middle"
                fontFamily="Georgia, serif"
              >
                ♠
              </text>
            </g>
          </svg>
        </div>
      );

    case 'fish':
      return (
        <div className="card-back-inner back-illustrated" aria-hidden="true">
          <svg viewBox="0 0 62 86" className="card-back-svg">
            {/* Oceano azul profundo */}
            <rect width="62" height="86" fill="#03045e" />
            {/* Raios de luz penetrando a água */}
            <polygon points="8,0 20,0 34,86 16,86" fill="#0077b6" opacity="0.35" />
            <polygon points="26,0 38,0 52,86 36,86" fill="#0096c7" opacity="0.25" />
            {/* Bolhas */}
            <circle cx="46" cy="22" r="2.2" fill="none" stroke="#caf0f8" strokeWidth="0.8" />
            <circle cx="42" cy="12" r="1.4" fill="none" stroke="#caf0f8" strokeWidth="0.8" />
            <circle cx="48" cy="34" r="1.2" fill="none" stroke="#caf0f8" strokeWidth="0.8" />
            {/* Algas marinhas no fundo */}
            <path
              d="M6,86 Q14,64 6,46 Q14,60 10,86"
              fill="#2d6a4f"
            />
            <path
              d="M52,86 Q44,66 54,50 Q48,66 52,86"
              fill="#40916c"
            />
            {/* Peixe tropical colorido (estilo peixe-palhaço) */}
            <g transform="translate(18, 40)">
              {/* Cauda */}
              <polygon points="4,10 -4,2 -2,18" fill="#ff6700" stroke="#000" strokeWidth="0.6" />
              {/* Corpo */}
              <ellipse cx="14" cy="10" rx="14" ry="9" fill="#ff6700" stroke="#000" strokeWidth="0.6" />
              {/* Listras brancas */}
              <path
                d="M10,2 Q12,10 10,18 L13,18 Q15,10 13,2 Z"
                fill="#ffffff"
                stroke="#000"
                strokeWidth="0.5"
              />
              <path
                d="M20,4 Q21,10 20,16 L22,16 Q23,10 22,4 Z"
                fill="#ffffff"
                stroke="#000"
                strokeWidth="0.5"
              />
              {/* Olho */}
              <circle cx="23" cy="8" r="1.8" fill="#ffffff" />
              <circle cx="23.5" cy="8" r="0.9" fill="#000000" />
            </g>
          </svg>
        </div>
      );

    case 'blue':
    default:
      return (
        <div className="card-back-inner back-blue" aria-hidden="true">
          <div className="card-back-pattern" />
          <div className="card-back-medallion">♠</div>
        </div>
      );
  }
}
