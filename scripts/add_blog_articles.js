const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const cachePath = path.join(baseDir, 'api', 'cache_blog.json');
const seedPath = path.join(baseDir, 'api', 'seed_blog.json');

let blog = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
const nextId = Math.max(...blog.map(p => p.id)) + 1;

const newArticles = [
  {
    id: nextId,
    slug: 'seguro-desemprego-2026-regras-tabela-como-pedir',
    title: 'Seguro-Desemprego 2026: Quem Tem Direito, Tabela Oficial de Valores e Como Pedir pelo Celular',
    category: 'direitos',
    excerpt: 'Confira as faixas salariais, quantidade de parcelas (de 3 a 5), piso garantido de R$ 1.518,00 e o passo a passo para solicitar o benefício no Gov.br.',
    author: 'Equipe Editorial Você Pode Tudo',
    read_time_minutes: 6,
    cover_image: './assets/logo.png',
    tags: ['seguro desemprego 2026', 'direitos trabalhistas', 'clt', 'gov br', 'carteira digital'],
    views_count: 240,
    is_published: true,
    created_at: '2026-11-01 15:10:00',
    content: `
<h2>O que mudou no Seguro-Desemprego em 2026?</h2>
<p>O Seguro-Desemprego é um dos benefícios fundamentais da Seguridade Social brasileira, assegurado pela Constituição Federal e regulamentado pelas diretrizes do CODEFAT (Conselho Deliberativo do Fundo de Amparo ao Trabalhador). Em 2026, com o reajuste do salário mínimo nacional para <strong>R$ 1.518,00</strong>, nenhuma parcela pode ser paga abaixo desse piso.</p>

<h3>Tabela de Cálculo das Parcelas em 2026</h3>
<p>O cálculo baseia-se na média dos últimos três salários brutos anteriores à demissão sem justa causa:</p>
<ul>
  <li><strong>Salário médio de até R$ 2.074,67:</strong> Multiplica-se o salário médio por 0,80 (80%).</li>
  <li><strong>Salário médio de R$ 2.074,68 a R$ 3.458,15:</strong> Aplica-se a fórmula fixa de R$ 1.659,74 mais 50% do valor que ultrapassar R$ 2.074,67.</li>
  <li><strong>Salário médio acima de R$ 3.458,15:</strong> Recebe-se o teto máximo legal de <strong>R$ 2.351,48</strong> por parcela.</li>
</ul>

<h3>Quantas Parcelas Você Tem Direito?</h3>
<p>A quantidade varia entre 3, 4 ou 5 parcelas de acordo com a quantidade de solicitações prévias e os meses trabalhados:</p>
<ul>
  <li><strong>1ª Solicitação:</strong> Exige no mínimo 12 meses trabalhados nos últimos 36 meses (12 a 23 meses = 4 parcelas; 24 meses ou mais = 5 parcelas).</li>
  <li><strong>2ª Solicitação:</strong> Exige no mínimo 9 meses trabalhados (9 a 11 meses = 3 parcelas; 12 a 23 meses = 4 parcelas; 24 meses ou mais = 5 parcelas).</li>
  <li><strong>3ª Solicitação em diante:</strong> Exige no mínimo 6 meses trabalhados (6 a 11 meses = 3 parcelas; 12 a 23 meses = 4 parcelas; 24 meses ou mais = 5 parcelas).</li>
</ul>

<p>Para simular o valor exato que você receberá, utilize nossa <a href="calculadora-trabalhista.html" class="text-emerald-600 font-bold underline">Calculadora de Seguro-Desemprego Online Gratuita</a>.</p>
`
  },
  {
    id: nextId + 1,
    slug: 'carta-de-apresentacao-para-gupy-linkedin-modelos',
    title: 'Como Fazer uma Carta de Apresentação que Conquista Entrevistas na Gupy e LinkedIn (Com Modelos)',
    category: 'curriculo_linkedin',
    excerpt: 'Aprenda a preencher o campo de carta de apresentação em plataformas de vagas para destacar seu perfil logo na triagem inicial.',
    author: 'Especialistas em Carreira & RH',
    read_time_minutes: 5,
    cover_image: './assets/logo.png',
    tags: ['carta de apresentacao', 'gupy', 'linkedin', 'curriculo', 'entrevista'],
    views_count: 185,
    is_published: true,
    created_at: '2026-11-01 15:15:00',
    content: `
<h2>Por que a Carta de Apresentação Faz a Diferença?</h2>
<p>Em processos seletivos altamente concorridos em plataformas como Gupy, Vagas.com e LinkedIn, a grande maioria dos candidatos envia apenas o currículo padrão. Quando você preenche uma carta de apresentação objetiva e bem direcionada, você ganha pontos decisivos com o recrutador humano.</p>

<h3>A Estrutura dos 3 Parágrafos de Ouro</h3>
<ol>
  <li><strong>Parágrafo 1 (O Gancho):</strong> Declare a vaga desejada e por que a cultura da empresa chamou sua atenção.</li>
  <li><strong>Parágrafo 2 (A Prova de Valor):</strong> Apresente 1 ou 2 resultados ou qualificações técnicas que você possui e como elas resolvem as dores da empresa.</li>
  <li><strong>Parágrafo 3 (Chamada para Ação):</strong> Reforce sua disponibilidade para entrevista e agradeça cordialmente.</li>
</ol>

<p>Você pode baixar modelos prontos em Word na nossa <a href="downloads.html" class="text-blue-600 font-bold underline">Central de Downloads Gratuitos</a> ou criar seu currículo formatado no nosso <a href="curriculo.html" class="text-emerald-600 font-bold underline">Criador de Currículos PDF</a>.</p>
`
  },
  {
    id: nextId + 2,
    slug: 'concursos-publicos-2026-bancos-correios-como-estudar',
    title: 'Concursos Federais e Bancários 2026: Cronograma de Estudos para Passar na Caixa e Correios',
    category: 'estudos',
    excerpt: 'Estratégia completa de estudos por ciclos, disciplinas com maior peso e modelo de planilha de acompanhamento semanal de questões.',
    author: 'Prof. Carlos Mendes — Mentor de Concursos',
    read_time_minutes: 7,
    cover_image: './assets/logo.png',
    tags: ['concursos 2026', 'caixa economica', 'correios', 'ciclo de estudos', 'questoes'],
    views_count: 310,
    is_published: true,
    created_at: '2026-11-01 15:20:00',
    content: `
<h2>O Cenário dos Grandes Concursos em 2026</h2>
<p>O ano de 2026 consolida grandes oportunidades em carreiras bancárias (Caixa Econômica Federal e Banco do Brasil) e operacionais/administrativas (Correios e Ministérios Federais). A estabilidade, plano de carreira e benefícios como vale-alimentação e plano de saúde atraem milhares de candidatos.</p>

<h3>O Método do Ciclo de Estudos vs. Grade Horária Fixa</h3>
<p>A maior causa de desistência em concursos é a grade horária engessada. Ao adotar o <strong>Ciclo de Estudos</strong>, você gira as disciplinas por tempo (ex: 90 minutos de Português, 60 minutos de Raciocínio Lógico, 90 minutos de Conhecimentos Bancários). Se houver um imprevisto em um dia, você simplesmente retoma de onde parou, sem culpa nem atraso na matéria.</p>

<h3>Baixe a Planilha de Ciclos Pronta</h3>
<p>Disponibilizamos gratuitamente em nossa <a href="downloads.html" class="text-emerald-600 font-bold underline">Área de Downloads</a> uma planilha em formato Excel/CSV com controle diário de horas líquidas, percentual de acertos e controle de revisões de 24h e 7 dias.</p>
`
  }
];

// Inserir os 3 artigos no topo do array
blog = [...newArticles, ...blog];

fs.writeFileSync(cachePath, JSON.stringify(blog, null, 2), 'utf-8');
fs.writeFileSync(seedPath, JSON.stringify(blog, null, 2), 'utf-8');

console.log(`[OK] 3 novos artigos adicionados com sucesso! Total agora: ${blog.length} artigos.`);
