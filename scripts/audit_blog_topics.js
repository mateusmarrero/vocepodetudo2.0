const fs = require('fs');
const path = require('path');

const seedFile = path.join(__dirname, '..', 'api', 'seed_blog.json');
const seed = JSON.parse(fs.readFileSync(seedFile, 'utf8'));

const proposed50 = [
  // 1. Primeiro emprego e mercado de trabalho
  { num: 1, cat: 'primeiro_emprego', title: 'Como conseguir o primeiro emprego sem ter experiência profissional?' },
  { num: 2, cat: 'primeiro_emprego', title: '10 erros que fazem um candidato perder uma oportunidade de emprego.' },
  { num: 3, cat: 'primeiro_emprego', title: 'Como procurar emprego pela internet sem cair em golpes?' },
  { num: 4, cat: 'entrevistas', title: 'O que escrever quando a empresa pergunta: por que devemos contratar você?' },
  { num: 5, cat: 'carreira', title: 'Como se comportar no primeiro dia de trabalho?' },
  { num: 6, cat: 'primeiro_emprego', title: 'Quais são as profissões mais acessíveis para quem está começando?' },
  { num: 7, cat: 'carreira', title: 'Como conseguir emprego depois dos 40 anos?' },
  { num: 8, cat: 'carreira', title: 'Como voltar ao mercado de trabalho depois de muitos anos parado?' },
  { num: 9, cat: 'primeiro_emprego', title: 'Como conseguir emprego mesmo sem indicação?' },
  { num: 10, cat: 'primeiro_emprego', title: 'Como montar um plano de 30 dias para conseguir seu primeiro emprego?' },

  // 2. Currículo e entrevistas
  { num: 11, cat: 'curriculo_linkedin', title: 'Como explicar períodos sem trabalhar no currículo?' },
  { num: 12, cat: 'curriculo_linkedin', title: 'Currículo com ou sem foto: qual é melhor?' },
  { num: 13, cat: 'curriculo_linkedin', title: 'Como colocar trabalhos informais no currículo?' },
  { num: 14, cat: 'curriculo_linkedin', title: 'Como montar um currículo para quem nunca trabalhou?' },
  { num: 15, cat: 'curriculo_linkedin', title: 'O que não colocar no currículo profissional?' },
  { num: 16, cat: 'entrevistas', title: 'Como responder à pergunta: qual é o seu maior defeito?' },
  { num: 17, cat: 'entrevistas', title: 'Como negociar salário durante uma entrevista?' },
  { num: 18, cat: 'entrevistas', title: 'Como se preparar para uma entrevista de emprego online?' },
  { num: 19, cat: 'entrevistas', title: 'Como responder perguntas difíceis em entrevistas?' },
  { num: 20, cat: 'curriculo_linkedin', title: 'Como utilizar inteligência artificial para melhorar seu currículo?' },

  // 3. Profissões e oportunidades
  { num: 21, cat: 'carreira', title: '15 profissões que permitem trabalhar de casa.' },
  { num: 22, cat: 'carreira', title: 'Profissões que não exigem faculdade para começar.' },
  { num: 23, cat: 'tecnologia', title: 'Quais profissões estão mudando com a inteligência artificial?' },
  { num: 24, cat: 'tecnologia', title: 'Profissões para quem gosta de trabalhar com tecnologia.' },
  { num: 25, cat: 'tecnologia', title: 'Como começar uma carreira na área de segurança da informação?' },
  { num: 26, cat: 'carreira', title: 'O que faz um assistente administrativo?' },
  { num: 27, cat: 'tecnologia', title: 'Como trabalhar com suporte técnico de informática?' },
  { num: 28, cat: 'carreira', title: 'Profissões para quem gosta de trabalhar com pessoas.' },
  { num: 29, cat: 'carreira', title: 'Áreas profissionais que oferecem oportunidades para pessoas com deficiência.' },
  { num: 30, cat: 'carreira', title: 'Como descobrir uma profissão que combina com você?' },

  // 4. Educação financeira e desenvolvimento pessoal
  { num: 31, cat: 'carreira', title: 'Como organizar seu dinheiro ganhando um salário mínimo?' },
  { num: 32, cat: 'estudos', title: 'Como estudar gratuitamente mesmo tendo pouco tempo?' },
  { num: 33, cat: 'estudos', title: 'Como criar uma rotina de estudos trabalhando o dia inteiro?' },
  { num: 34, cat: 'carreira', title: 'Como aprender uma nova profissão depois dos 40 anos?' },
  { num: 35, cat: 'carreira', title: '7 hábitos que ajudam no crescimento profissional.' },
  { num: 36, cat: 'carreira', title: 'Como vencer a insegurança ao procurar emprego?' },
  { num: 37, cat: 'estudos', title: 'Como estudar pelo celular e aproveitar melhor seu tempo?' },
  { num: 38, cat: 'carreira', title: 'Como montar um planejamento de carreira para os próximos 12 meses?' },
  { num: 39, cat: 'tecnologia', title: 'Por que aprender informática ainda é importante?' },
  { num: 40, cat: 'carreira', title: 'Como transformar conhecimentos gratuitos em oportunidades profissionais?' },

  // 5. Tecnologia e inteligência artificial
  { num: 41, cat: 'tecnologia', title: '10 ferramentas gratuitas de inteligência artificial para estudantes.' },
  { num: 42, cat: 'tecnologia', title: 'Como usar o ChatGPT para estudar e aprender mais rápido?' },
  { num: 43, cat: 'tecnologia', title: 'Como criar apresentações profissionais gratuitamente?' },
  { num: 44, cat: 'tecnologia', title: 'Como aprender Excel utilizando ferramentas gratuitas?' },
  { num: 45, cat: 'tecnologia', title: 'O que é inteligência artificial generativa e como ela pode ajudar na sua carreira?' },
  { num: 46, cat: 'tecnologia', title: 'Como proteger seus dados pessoais ao procurar emprego pela internet?' },
  { num: 47, cat: 'carreira', title: 'Como identificar vagas falsas divulgadas nas redes sociais?' },
  { num: 48, cat: 'carreira', title: 'Como criar um portfólio profissional mesmo sem experiência?' },
  { num: 49, cat: 'curriculo_linkedin', title: 'Como utilizar o LinkedIn para encontrar oportunidades?' },
  { num: 50, cat: 'tecnologia', title: 'Quais habilidades digitais serão importantes nos próximos anos?' }
];

console.log('Total propostas:', proposed50.length);
console.log('Total cadastradas existentes:', seed.length);

const overlaps = [];

proposed50.forEach(p => {
  const pNorm = p.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const pWords = pNorm.split(/\W+/).filter(w => w.length >= 4);

  seed.forEach(s => {
    const sNorm = s.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const sWords = sNorm.split(/\W+/).filter(w => w.length >= 4);
    const common = pWords.filter(w => sWords.includes(w));
    
    // Critério de similaridade forte
    if (common.length >= 3) {
      overlaps.push({
        proposedNum: p.num,
        proposedTitle: p.title,
        seedId: s.id,
        seedTitle: s.title,
        commonWords: common
      });
    }
  });
});

console.log('\n--- SOBREPOSIÇÕES ENCONTRADAS (' + overlaps.length + ') ---');
overlaps.forEach(o => {
  console.log(`\nProposta #${o.proposedNum}: "${o.proposedTitle}"`);
  console.log(`  -> Similar ao Artigo ID #${o.seedId}: "${o.seedTitle}"`);
  console.log(`  -> Palavras comuns: [${o.commonWords.join(', ')}]`);
});
