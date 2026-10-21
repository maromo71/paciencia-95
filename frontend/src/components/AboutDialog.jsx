import Dialog from './Dialog.jsx';

export default function AboutDialog({ onClose }) {
  return (
    <Dialog
      title="Sobre o Paciência Etec / Fatec"
      width={430}
      onClose={onClose}
      buttons={
        <button type="button" className="win-button primary" onClick={onClose}>
          OK
        </button>
      }
    >
      <div className="dialog-with-icon">
        <div className="dialog-icon" style={{ fontSize: 22 }} aria-hidden="true">
          🎓
        </div>
        <div className="dialog-text">
          <h2 className="about-title">Paciência 95 — Edição Etec & Fatec</h2>
          <p className="about-version">Versão 2.0 · Plataforma Educacional Retrô</p>
          <p>
            Uma recriação nostálgica do clássico Klondike do Windows 95,
            projetada para celebrar o ensino público profissional e tecnológico de excelência
            do <strong>Centro Paula Souza (CPS)</strong>.
          </p>
          <ul className="about-list">
            <li>Versos exclusivos: Chipset FATEC, Campus Histórico, ETEC Técnico e Terminal Retrô.</li>
            <li>Figuras acadêmicas: Estudante (J), Professora (Q), Patrono (K) e Brasão CPS (A).</li>
            <li>Fundações temáticas: Gestão, TI/Software, Mecânica e Eletrônica.</li>
            <li>Guia interativo estilo WinHelp 95 dos cursos e vestibulares.</li>
            <li>Algoritmo inteligente de dicas com auxílio pedagógico.</li>
          </ul>
          <p style={{ marginTop: 12, fontSize: 10, color: '#555' }}>
            Iniciativa educativa independente em homenagem aos alunos, professores e mestres da Etec e da Fatec.
          </p>
        </div>
      </div>
    </Dialog>
  );
}
