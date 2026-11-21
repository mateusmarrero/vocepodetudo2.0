const fs = require('fs');
const path = require('path');

const seedFile = path.join(__dirname, '..', 'api', 'seed_blog.json');
const seed = JSON.parse(fs.readFileSync(seedFile, 'utf8'));

const pautas50 = [
  // 1. Direitos trabalhistas e cidadania
  { id: 1, cat: 'direitos', title: 'Quais são os direitos de quem trabalha aos domingos e feriados?' },
  { id: 2, cat: 'direitos', title: 'Banco de horas: como funciona e quais são os direitos do trabalhador?' },
  { id: 3, cat: 'direitos', title: 'Trabalho temporário, terceirizado e efetivo: entenda as diferenças.' },
  { id: 4, cat: 'direitos', title: 'O que acontece quando uma empresa não registra um funcionário?' },
  { id: 5, cat: 'direitos', title: 'Como funciona o aviso-prévio e quais são os direitos do trabalhador?' },
  { id: 6, cat: 'direitos', title: 'FGTS: como consultar o saldo e entender os depósitos?' },
  { id: 7, cat: 'direitos', title: 'Seguro-desemprego: quem tem direito e como solicitar?' },
  { id: 8, cat: 'direitos', title: 'O que é o Cadastro Único e quais benefícios ele oferece?' },
  { id: 9, cat: 'direitos', title: 'Carteira de Trabalho Digital: guia completo para utilizar o aplicativo.' },
  { id: 10, cat: 'direitos', title: 'Quais são os direitos trabalhistas das pessoas com deficiência?' },

  // 2. Educação digital e vida cotidiana
  { id: 11, cat: 'cidadania_digital', title: 'Como identificar notícias falsas e informações manipuladas na internet?' },
  { id: 12, cat: 'cidadania_digital', title: 'Como criar e proteger uma conta Gov.br?' },
  { id: 13, cat: 'cidadania_digital', title: 'Como utilizar a assinatura digital em documentos?' },
  { id: 14, cat: 'cidadania_digital', title: 'Como enviar documentos em PDF pelo celular?' },
  { id: 15, cat: 'cidadania_digital', title: 'Como digitalizar documentos utilizando apenas a câmera do celular?' },
  { id: 16, cat: 'cidadania_digital', title: 'Como organizar arquivos e documentos importantes na nuvem?' },
  { id: 17, cat: 'cidadania_digital', title: 'Como utilizar o Google Drive para organizar documentos pessoais?' },
  { id: 18, cat: 'cidadania_digital', title: 'Como fazer uma videoconferência pelo celular?' },
  { id: 19, cat: 'cidadania_digital', title: 'Como proteger crianças e adolescentes dos perigos da internet?' },
  { id: 20, cat: 'cidadania_digital', title: 'Como reconhecer mensagens falsas que utilizam o nome de bancos e instituições públicas?' },

  // 3. Organização e produtividade profissional
  { id: 21, cat: 'produtividade', title: 'Como organizar suas tarefas utilizando o método Kanban?' },
  { id: 22, cat: 'produtividade', title: 'Como funciona a técnica Pomodoro e quando utilizá-la?' },
  { id: 23, cat: 'produtividade', title: 'Como escrever e-mails profissionais de maneira correta?' },
  { id: 24, cat: 'produtividade', title: 'Como organizar reuniões produtivas no ambiente de trabalho?' },
  { id: 25, cat: 'produtividade', title: 'Como melhorar sua comunicação escrita no trabalho?' },
  { id: 26, cat: 'produtividade', title: 'Como lidar com conflitos entre colegas de trabalho?' },
  { id: 27, cat: 'produtividade', title: 'Como desenvolver inteligência emocional no ambiente profissional?' },
  { id: 28, cat: 'produtividade', title: 'Como organizar documentos e arquivos em um escritório?' },
  { id: 29, cat: 'produtividade', title: 'Como estabelecer limites saudáveis entre trabalho e vida pessoal?' },
  { id: 30, cat: 'produtividade', title: 'Como evitar a procrastinação nas atividades profissionais?' },

  // 4. Inclusão, diversidade e acessibilidade
  { id: 31, cat: 'acessibilidade', title: 'Como as empresas podem tornar seus ambientes acessíveis?' },
  { id: 32, cat: 'acessibilidade', title: 'Quais tecnologias assistivas ajudam pessoas com deficiência no trabalho?' },
  { id: 33, cat: 'acessibilidade', title: 'O que é acessibilidade digital e por que ela importa?' },
  { id: 34, cat: 'acessibilidade', title: 'Como funcionam as cotas para pessoas com deficiência nas empresas?' },
  { id: 35, cat: 'acessibilidade', title: 'Quais são as barreiras enfrentadas por profissionais com deficiência no mercado de trabalho?' },
  { id: 36, cat: 'acessibilidade', title: 'Como adaptar um ambiente de trabalho para pessoas com mobilidade reduzida?' },
  { id: 37, cat: 'acessibilidade', title: 'O que é desenho universal e como ele melhora a inclusão?' },
  { id: 38, cat: 'acessibilidade', title: 'Como combater o capacitismo no ambiente profissional?' },
  { id: 39, cat: 'acessibilidade', title: 'Quais recursos de acessibilidade existem nos celulares Android?' },
  { id: 40, cat: 'acessibilidade', title: 'Como a tecnologia pode ampliar a autonomia das pessoas com deficiência?' },

  // 5. Empreendedorismo e geração de renda
  { id: 41, cat: 'empreendedorismo', title: 'Como começar a vender pela internet sem ter uma loja física?' },
  { id: 42, cat: 'empreendedorismo', title: 'Como calcular o preço de venda de um produto artesanal?' },
  { id: 43, cat: 'empreendedorismo', title: 'Como divulgar pequenos negócios gratuitamente pela internet?' },
  { id: 44, cat: 'empreendedorismo', title: 'MEI: quais são as obrigações e responsabilidades do microempreendedor?' },
  { id: 45, cat: 'empreendedorismo', title: 'Como montar um pequeno negócio trabalhando de casa?' },
  { id: 46, cat: 'empreendedorismo', title: 'Como criar uma loja virtual gratuitamente?' },
  { id: 47, cat: 'empreendedorismo', title: 'Como utilizar o WhatsApp Business para pequenos negócios?' },
  { id: 48, cat: 'empreendedorismo', title: 'Como controlar entradas e saídas de dinheiro de um pequeno negócio?' },
  { id: 49, cat: 'empreendedorismo', title: 'Como transformar uma habilidade pessoal em uma fonte de renda?' },
  { id: 50, cat: 'empreendedorismo', title: 'Quais são os erros mais comuns de quem começa a empreender?' }
];

console.log('--- CONFRONTO COM O CATÁLOGO ATUAL ---');
const matches = [];

pautas50.forEach(p => {
  const pNorm = p.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const pWords = pNorm.split(/\W+/).filter(w => w.length >= 4);

  seed.forEach(s => {
    const sNorm = s.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const sWords = sNorm.split(/\W+/).filter(w => w.length >= 4);
    const common = pWords.filter(w => sWords.includes(w));

    if (common.length >= 3) {
      matches.push({
        pautaId: p.id,
        pautaTitle: p.title,
        seedId: s.id,
        seedTitle: s.title,
        common: common
      });
    }
  });
});

console.log(`Total de pautas analisadas: ${pautas50.length}`);
console.log(`Potenciais sobreposições encontradas: ${matches.length}`);
matches.forEach(m => {
  console.log(`[Pauta #${m.pautaId}] "${m.pautaTitle}" <---> [Artigo ID #${m.seedId}] "${m.seedTitle}" (Palavras: ${m.common.join(', ')})`);
});
