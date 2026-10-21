import { isTauri } from '@tauri-apps/api/core';

export default function WindowShell({
  children,
  scale,
  onClose,
  onMinimize,
  onMaximize,
}) {
  const inTauri = isTauri();
  const width = 660;
  const height = 568;

  if (inTauri) {
    return <div className="desktop-native-shell">{children}</div>;
  }

  return (
    <div className="desktop">
      <div
        className="window-stage"
        style={{ width: width * scale, height: height * scale }}
      >
        <div className="window" style={{ transform: `scale(${scale})` }}>
          <div className="titlebar">
            <span className="titlebar-icon" aria-hidden="true">
              ♠
            </span>
            <span className="titlebar-text">Paciência</span>
            <div className="titlebar-buttons">
              <button
                type="button"
                className="title-button"
                aria-label="Minimizar"
                onClick={onMinimize}
              >
                _
              </button>
              <button
                type="button"
                className="title-button"
                aria-label="Maximizar"
                onClick={onMaximize}
              >
                □
              </button>
              <button
                type="button"
                className="title-button close"
                aria-label="Fechar"
                onClick={onClose}
              >
                ×
              </button>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
