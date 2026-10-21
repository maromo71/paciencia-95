import { useEffect, useRef, useState } from 'react';

export default function MenuBar({
  onNewGame,
  onOptions,
  onStats,
  onAbout,
  onExit,
  disabled = false,
}) {
  const [open, setOpen] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(null);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(null);
    };

    window.addEventListener('pointerdown', closeOnOutside);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('pointerdown', closeOnOutside);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const menus = [
    {
      id: 'game',
      title: 'Jogo',
      items: [
        { label: 'Novo jogo', accel: 'F2', action: onNewGame },
        { label: 'Opções...', action: onOptions, disabled },
        { separator: true },
        { label: 'Estatísticas...', action: onStats },
        { separator: true },
        { label: 'Sair', action: onExit },
      ],
    },
    {
      id: 'help',
      title: 'Ajuda',
      items: [{ label: 'Sobre o Paciência...', action: onAbout }],
    },
  ];

  const run = (item) => {
    if (item.disabled) return;
    setOpen(null);
    item.action?.();
  };

  return (
    <div className="menubar" ref={rootRef} role="menubar">
      {menus.map((menu) => (
        <div
          className="menu-root"
          key={menu.id}
          onMouseEnter={() => {
            if (open) setOpen(menu.id);
          }}
        >
          <button
            type="button"
            className={`menu-title ${open === menu.id ? 'open' : ''}`}
            aria-haspopup="menu"
            aria-expanded={open === menu.id}
            onClick={() => setOpen(open === menu.id ? null : menu.id)}
          >
            {menu.title}
          </button>
          {open === menu.id && (
            <div className="menu-popup" role="menu">
              {menu.items.map((item, index) =>
                item.separator ? (
                  <div
                    className="menu-separator"
                    key={`separator-${menu.id}-${index}`}
                    role="separator"
                  />
                ) : (
                  <button
                    type="button"
                    key={item.label}
                    className="menu-item"
                    role="menuitem"
                    disabled={item.disabled}
                    onClick={() => run(item)}
                  >
                    <span className="label">{item.label}</span>
                    {item.accel && <span className="accel">{item.accel}</span>}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
