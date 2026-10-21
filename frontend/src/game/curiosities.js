export const CURIOSITIES = [
  'Dica CPS: Todos os cursos da Etec e da Fatec são 100% públicos e gratuitos.',
  'Fatec ADS: Análise e Desenvolvimento de Sistemas forma programadores de ponta com alta demanda no mercado.',
  'Mercado Etec: Mais de 80% dos técnicos formados pela Etec conseguem emprego na sua área de formação.',
  'Fatec Jogos: O curso de Jogos Digitais da Fatec é pioneiro na formação de game designers e desenvolvedores.',
  'Vestibulinho Etec: São mais de 220 escolas técnicas em todo o Estado de SP com cursos em tecnologia e gestão.',
  'Vestibular Fatec: Inscrições semestrais para graduações tecnológicas reconhecidas pelo MEC.',
  'Inovação CPS: Alunos participam de maratonas de programação, feiras tecnológicas e projetos de robótica.',
  'Intercâmbio: O Centro Paula Souza oferece bolsas de estudo no exterior para os melhores alunos de cada curso.',
  'Etec Mecatrônica: Aprenda eletrônica, automação, mecânica e programação de controladores industriais.',
  'Fatec Gestão: Graduação tecnológica com foco prático em liderança, processos, finanças e novos negócios.',
  'Tradição & Futuro: Mais de 50 anos formando profissionais que transformam a tecnologia de São Paulo.',
  'Prática desde o 1º dia: Aulas em laboratórios modernos com ferramentas e frameworks reais do mercado.',
];

export function getRandomCuriosity(excludeIndex = -1) {
  let index = Math.floor(Math.random() * CURIOSITIES.length);
  if (index === excludeIndex && CURIOSITIES.length > 1) {
    index = (index + 1) % CURIOSITIES.length;
  }
  return { index, text: CURIOSITIES[index] };
}
