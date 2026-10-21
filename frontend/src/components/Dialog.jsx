import { useEffect, useRef } from 'react';

export default function Dialog({
  title,
  children,
  buttons,
  onClose,
  width = 380,
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    const primary = rootRef.current?.querySelector('button.primary');
    const fallback = rootRef.current?.querySelector(
      'button.win-button, input, select',
    );
    (primary || fallback)?.focus();
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose?.();
    }
  };

  return (
    <div
      className="dialog-backdrop"
      onKeyDown={handleKeyDown}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        className="dialog"
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={rootRef}
      >
        <div className="dialog-titlebar">
          <span>{title}</span>
          <button
            type="button"
            className="title-button close"
            aria-label="Fechar"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="dialog-body">{children}</div>
        {buttons && <div className="dialog-buttons">{buttons}</div>}
      </div>
    </div>
  );
}
