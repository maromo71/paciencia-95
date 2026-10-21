import Dialog from './Dialog.jsx';

export default function AboutDialog({ onClose }) {
  return (
    <Dialog
      title="Sobre o Paciência"
      width={410}
      onClose={onClose}
      buttons={
        <button type="button" className="win-button primary" onClick={onClose}>
          OK
        </button>
      }
    >
      <div className="dialog-with-icon">
        <div className="dialog-icon" aria-hidden="true">
          ♠
        </div>
        <div className="dialog-text">
          <h2 className="about-title">Paciência 95</h2>
          <p className="about-version">Versão 1.0 · Klondike clássico</p>
          <p>
            Uma recriação do jogo de cartas que acompanhou o Windows 95, com
            regras de Klondike, pontuação clássica, opções de compra e a
            animação de vitória.
          </p>
          <ul className="about-list">
            <li>Frontend: React + Vite</li>
            <li>Backend: Rust + Axum + SQLite</li>
            <li>Cartas e versos desenhados em SVG/CSS</li>
            <li>Placar e estatísticas salvos no backend</li>
          </ul>
          <p style={{ marginTop: 12 }}>
            Projeto independente, sem código ou imagens da Microsoft.
          </p>
        </div>
      </div>
    </Dialog>
  );
}
