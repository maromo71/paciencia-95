import { useState } from 'react';

const COURSES = {
  fatec: [
    {
      id: 'fatec-ads',
      name: 'Análise e Desenvolvimento de Sistemas (ADS)',
      level: 'Graduação Tecnológica Superior (100% Gratuito)',
      duration: '3 anos (6 semestres) · Matutino e Noturno',
      summary: 'Formação sólida em engenharia de software, arquitetura de sistemas, desenvolvimento full-stack, bancos de dados relacionais e NoSQL, computação em nuvem e cibersegurança.',
      skills: [
        'Linguagens: JavaScript, TypeScript, Python, Java, C#, SQL',
        'Frameworks Web e Mobile modernos (React, Node.js, Spring)',
        'Modelagem de dados e administração de banco de dados',
        'Metodologias ágeis (Scrum, Kanban) e boas práticas de DevOps',
      ],
      careers: 'Desenvolvedor Full-Stack, Engenheiro de Software, Arquiteto de Soluções, Analista de Dados, QA/Tester.',
      vestibular: 'Vestibular Fatec (semestral) · vestibularfatec.com.br',
    },
    {
      id: 'fatec-jogos',
      name: 'Jogos Digitais',
      level: 'Graduação Tecnológica Superior (100% Gratuito)',
      duration: '3 anos (6 semestres) · Noturno ou Vespertino',
      summary: 'Pioneiro na formação de game designers, programadores e artistas técnicos. Foco no ciclo completo de produção de jogos digitais para PC, mobile e consoles.',
      skills: [
        'Engines líderes de mercado: Unity e Unreal Engine',
        'Programação de inteligência artificial para jogos e gameplay (C# e C++)',
        'Modelagem 3D, animação, shaders e arte técnica',
        'Game design, roteirização, level design e sonoplastia',
      ],
      careers: 'Game Programmer, Level Designer, Technical Artist, Animador 3D, Desenvolvedor de Simuladores e RV/RA.',
      vestibular: 'Vestibular Fatec (semestral) · vestibularfatec.com.br',
    },
    {
      id: 'fatec-gestao',
      name: 'Gestão Empresarial',
      level: 'Graduação Tecnológica Superior (100% Gratuito)',
      duration: '3 anos (6 semestres) · Presencial ou EaD',
      summary: 'Capacita líderes para atuar no planejamento estratégico, finanças, marketing, recursos humanos e gestão da inovação em micro, médias e grandes corporações.',
      skills: [
        'Análise de viabilidade econômico-financeira e custos',
        'Planejamento de marketing e transformação digital',
        'Gestão de equipes, liderança e resolução de conflitos',
        'Logística integrada e cadeia de suprimentos',
      ],
      careers: 'Gerente Administrativo, Consultor de Negócios, Analista Financeiro, Empreendedor, Gerente de Projetos.',
      vestibular: 'Vestibular Fatec (semestral) · vestibularfatec.com.br',
    },
    {
      id: 'fatec-redes',
      name: 'Redes de Computadores e Cibersegurança',
      level: 'Graduação Tecnológica Superior (100% Gratuito)',
      duration: '3 anos (6 semestres) · Noturno',
      summary: 'Especialização em arquitetura de conectividade, servidores, infraestrutura em nuvem e proteção contra ameaças digitais em ambientes corporativos críticos.',
      skills: [
        'Roteamento, switching e protocolos TCP/IP avançados',
        'Segurança ofensiva e defensiva, firewalls e SIEM',
        'Administração de servidores Linux e Windows Server',
        'Virtualização e nuvem (AWS, Azure, Docker, Kubernetes)',
      ],
      careers: 'Administrador de Redes, Analista de Segurança da Informação, Engenheiro DevOps/SRE, Arquiteto Cloud.',
      vestibular: 'Vestibular Fatec (semestral) · vestibularfatec.com.br',
    },
  ],
  etec: [
    {
      id: 'etec-ds',
      name: 'Desenvolvimento de Sistemas',
      level: 'Ensino Técnico e Médio Integrado (M-Tec) · 100% Gratuito',
      duration: '3 semestres (Técnico) ou 3 anos (Integrado ao Médio)',
      summary: 'Porta de entrada no universo da programação. Ensina desde a lógica computacional básica até o desenvolvimento de sistemas completos para desktop, web e smartphones.',
      skills: [
        'Lógica de programação e algoritmos',
        'Criação de páginas web (HTML5, CSS3, JavaScript)',
        'Desenvolvimento back-end e banco de dados MySQL',
        'Aplicativos para dispositivos móveis Android',
      ],
      careers: 'Programador Júnior, Estagiário de TI, Desenvolvedor Web Front-end, Suporte Técnico a Sistemas.',
      vestibular: 'Vestibulinho Etec (semestral) · vestibulinhoetec.com.br',
    },
    {
      id: 'etec-mecatronica',
      name: 'Mecatrônica',
      level: 'Ensino Técnico · 100% Gratuito',
      duration: '3 semestres (1 ano e meio)',
      summary: 'Integração perfeita entre mecânica, eletrônica e informática. Habilita o profissional a operar, calibrar e programar sistemas robotizados e células de manufatura.',
      skills: [
        'Circuitos pneumáticos e eletropneumáticos',
        'Controladores Lógicos Programáveis (CLPs)',
        'Microcontroladores (Arduino, ESP32) e sensores industriais',
        'Desenho técnico mecânico assistido por computador (CAD)',
      ],
      careers: 'Técnico em Mecatrônica, Operador de Robótica, Técnico de Manutenção Industrial, Projetista Auxiliar.',
      vestibular: 'Vestibulinho Etec (semestral) · vestibulinhoetec.com.br',
    },
    {
      id: 'etec-adm',
      name: 'Administração',
      level: 'Ensino Técnico e Médio Integrado · 100% Gratuito',
      duration: '3 semestres (Técnico) ou 3 anos (Integrado)',
      summary: 'Formação versátil que prepara o estudante para operar processos em todos os setores de uma empresa: compras, vendas, recursos humanos e finanças.',
      skills: [
        'Técnicas de atendimento e negociação',
        'Contabilidade introdutória e fluxo de caixa',
        'Rotinas trabalhistas e departamento pessoal',
        'Legislação empresarial e ética profissional',
      ],
      careers: 'Assistente Administrativo, Auxiliar de Recursos Humanos, Auxiliar Financeiro, Assistente de Compras.',
      vestibular: 'Vestibulinho Etec (semestral) · vestibulinhoetec.com.br',
    },
    {
      id: 'etec-automacao',
      name: 'Automação Industrial',
      level: 'Ensino Técnico · 100% Gratuito',
      duration: '3 semestres (1 ano e meio)',
      summary: 'Foco na modernização de linhas industriais, parametrização de inversores de frequência e redes industriais de comunicação.',
      skills: [
        'Instalações elétricas industriais e painéis',
        'Sistemas supervisórios (SCADA)',
        'Instrumentação e controle de processos (vazão, nível, temperatura)',
        'Normas de segurança NR-10 e NR-12',
      ],
      careers: 'Técnico de Automação, Instrumentista Industrial, Eletrotécnico de Manutenção, Montador de Painéis.',
      vestibular: 'Vestibulinho Etec (semestral) · vestibulinhoetec.com.br',
    },
  ],
};

export default function WinHelpDialog({ onClose, defaultCourseId = null }) {
  const [activeTab, setActiveTab] = useState(defaultCourseId?.startsWith('etec') ? 'etec' : 'fatec');
  const [selectedCourse, setSelectedCourse] = useState(() => {
    if (defaultCourseId) {
      const all = [...COURSES.fatec, ...COURSES.etec];
      return all.find((c) => c.id === defaultCourseId) || COURSES.fatec[0];
    }
    return COURSES.fatec[0];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState([]);

  const selectCourse = (course) => {
    setHistory((prev) => [...prev, selectedCourse]);
    setSelectedCourse(course);
  };

  const goBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setSelectedCourse(prev);
    if (prev.id.startsWith('etec')) setActiveTab('etec');
    else setActiveTab('fatec');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'fatec') setSelectedCourse(COURSES.fatec[0]);
    if (tab === 'etec') setSelectedCourse(COURSES.etec[0]);
  };

  const courseList = COURSES[activeTab]?.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase()),
  ) || [];

  return (
    <div className="dialog-backdrop" onClick={onClose} role="presentation">
      <div
        className="winhelp-window"
        role="dialog"
        aria-modal="true"
        aria-label="Ajuda do Windows 95 - Guia de Cursos Etec e Fatec"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de Título Win95 */}
        <div className="winhelp-titlebar">
          <div className="winhelp-titlebar-icon">📖</div>
          <div className="winhelp-titlebar-text">
            Ajuda do Paciência - Guia de Cursos do Centro Paula Souza
          </div>
          <div className="winhelp-titlebar-buttons">
            <button
              type="button"
              className="title-button close"
              onClick={onClose}
              aria-label="Fechar Ajuda"
            >
              ×
            </button>
          </div>
        </div>

        {/* Menu do WinHelp */}
        <div className="winhelp-menubar">
          <span className="winhelp-menu-item"><u>A</u>rquivo</span>
          <span className="winhelp-menu-item"><u>E</u>ditar</span>
          <span className="winhelp-menu-item"><u>I</u>ndicador</span>
          <span className="winhelp-menu-item"><u>O</u>pções</span>
          <span className="winhelp-menu-item"><u>A</u>juda</span>
        </div>

        {/* Barra de Ferramentas com botões chanfrados Win95 */}
        <div className="winhelp-toolbar">
          <button
            type="button"
            className={`winhelp-btn ${activeTab === 'fatec' ? 'pressed' : ''}`}
            onClick={() => handleTabChange('fatec')}
          >
            <span className="btn-icon">🎓</span>
            <span className="btn-label">Fatec (Superior)</span>
          </button>
          <button
            type="button"
            className={`winhelp-btn ${activeTab === 'etec' ? 'pressed' : ''}`}
            onClick={() => handleTabChange('etec')}
          >
            <span className="btn-icon">⚙️</span>
            <span className="btn-label">Etec (Técnico)</span>
          </button>
          <button
            type="button"
            className={`winhelp-btn ${activeTab === 'vestibular' ? 'pressed' : ''}`}
            onClick={() => handleTabChange('vestibular')}
          >
            <span className="btn-icon">📝</span>
            <span className="btn-label">Vestibulares</span>
          </button>
          <div className="winhelp-toolbar-sep" />
          <button
            type="button"
            className="winhelp-btn"
            disabled={history.length === 0}
            onClick={goBack}
            title="Voltar ao tópico anterior"
          >
            <span className="btn-label">« Voltar</span>
          </button>
          <button
            type="button"
            className="winhelp-btn"
            onClick={() => window.print?.()}
            title="Imprimir tópico atual"
          >
            <span className="btn-label">Imprimir</span>
          </button>
        </div>

        {/* Corpo principal estilo WinHelp 95 */}
        <div className="winhelp-body">
          {activeTab === 'vestibular' ? (
            <div className="winhelp-content-full">
              <h1 className="winhelp-topic-title">
                Como Ingressar: Vestibular Fatec & Vestibulinho Etec
              </h1>
              <p className="winhelp-lead">
                O Centro Paula Souza administra as <strong>Escolas Técnicas (Etecs)</strong> e as{' '}
                <strong>Faculdades de Tecnologia (Fatecs)</strong> públicas do Estado de São Paulo.
                Todos os cursos são <strong>100% gratuitos</strong>, sem mensalidades ou taxas de matrícula!
              </p>

              <div className="winhelp-callout-grid">
                <div className="winhelp-callout-box">
                  <h2>🎓 Vestibular FATEC</h2>
                  <p>Para quem já concluiu ou está concluindo o Ensino Médio.</p>
                  <ul>
                    <li>Ingresso semestral (no meio e no fim do ano).</li>
                    <li>Cursos de Graduação Tecnológica de 3 anos com diploma superior reconhecido pelo MEC.</li>
                    <li>Sistema de Pontuação Acrescida para afrodescendentes e alunos de escola pública.</li>
                  </ul>
                  <a
                    href="https://www.vestibularfatec.com.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="winhelp-retro-link-btn"
                  >
                    Ir para www.vestibularfatec.com.br ↗
                  </a>
                </div>

                <div className="winhelp-callout-box">
                  <h2>⚙️ Vestibulinho ETEC</h2>
                  <p>Para quem busca formação técnica prática e qualificação rápida.</p>
                  <ul>
                    <li>Cursos Técnicos (1 ano e meio) para quem já faz ou terminou o Ensino Médio.</li>
                    <li>M-Tec: Ensino Médio com Habilitação Técnica Integrada em período integral.</li>
                    <li>Rede presente em mais de 300 municípios de São Paulo.</li>
                  </ul>
                  <a
                    href="https://www.vestibulinhoetec.com.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="winhelp-retro-link-btn"
                  >
                    Ir para www.vestibulinhoetec.com.br ↗
                  </a>
                </div>
              </div>

              <div className="winhelp-note-box">
                <strong>Dica Retrô:</strong> Os cursos de tecnologia do CPS têm índice de empregabilidade acima de 85%.
                Você pode conferir a lista completa de unidades e cursos diretamente pelos links oficiais acima.
              </div>
            </div>
          ) : (
            <div className="winhelp-split">
              {/* Painel Esquerdo: Lista de Tópicos */}
              <div className="winhelp-sidebar">
                <div className="winhelp-sidebar-search">
                  <label htmlFor="course-search" className="sr-only">Pesquisar curso</label>
                  <input
                    id="course-search"
                    type="text"
                    placeholder="Filtrar cursos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="winhelp-search-input"
                  />
                </div>
                <div className="winhelp-sidebar-list" role="listbox">
                  {courseList.map((course) => {
                    const isSelected = selectedCourse?.id === course.id;
                    return (
                      <button
                        type="button"
                        key={course.id}
                        className={`winhelp-sidebar-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => selectCourse(course)}
                      >
                        <span className="winhelp-folder-icon">{isSelected ? '📖' : '📄'}</span>
                        <span className="winhelp-item-text">{course.name}</span>
                      </button>
                    );
                  })}
                  {courseList.length === 0 && (
                    <div className="winhelp-no-results">Nenhum curso encontrado.</div>
                  )}
                </div>
              </div>

              {/* Painel Direito: Conteúdo do Tópico (Página do Curso) */}
              <div className="winhelp-content-pane">
                {selectedCourse ? (
                  <div className="winhelp-course-article">
                    <div className="winhelp-article-header">
                      <span className="winhelp-badge">{selectedCourse.level}</span>
                      <h1 className="winhelp-course-title">{selectedCourse.name}</h1>
                      <div className="winhelp-meta-row">
                        <strong>⏱ Duração e Período:</strong> {selectedCourse.duration}
                      </div>
                    </div>

                    <div className="winhelp-section">
                      <h2 className="winhelp-h2">Visão Geral</h2>
                      <p className="winhelp-text">{selectedCourse.summary}</p>
                    </div>

                    <div className="winhelp-section">
                      <h2 className="winhelp-h2">O que você aprende na prática:</h2>
                      <ul className="winhelp-bullets">
                        {selectedCourse.skills.map((skill, idx) => (
                          <li key={idx}>{skill}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="winhelp-section">
                      <h2 className="winhelp-h2">Áreas de Atuação no Mercado:</h2>
                      <p className="winhelp-text highlight-box">{selectedCourse.careers}</p>
                    </div>

                    <div className="winhelp-section winhelp-cta-section">
                      <h2 className="winhelp-h2">Inscrição e Processo Seletivo:</h2>
                      <p className="winhelp-text">
                        O ingresso é realizado através do <strong>{selectedCourse.vestibular}</strong>.
                      </p>
                      <a
                        href={
                          selectedCourse.id.startsWith('fatec')
                            ? 'https://www.vestibularfatec.com.br'
                            : 'https://www.vestibulinhoetec.com.br'
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="winhelp-retro-btn-cta"
                      >
                        Inscrever-se no Processo Seletivo Gratuito ↗
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="winhelp-empty">Selecione um curso na lista ao lado.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé da Janela WinHelp */}
        <div className="winhelp-statusbar">
          <span>Centro Paula Souza · Governo do Estado de São Paulo</span>
          <span>Cursos 100% Gratuitos</span>
        </div>
      </div>
    </div>
  );
}
