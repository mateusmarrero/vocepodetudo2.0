const fs = require('fs');
const path = require('path');

const projectDir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const seedBlogPath = path.join(projectDir, 'api', 'seed_blog.json');
const cacheBlogPath = path.join(projectDir, 'api', 'cache_blog.json');

const posts = JSON.parse(fs.readFileSync(seedBlogPath, 'utf8'));

const maxId = posts.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0);
console.log('ID máximo atual:', maxId);

const newArticles = [
  {
    id: maxId + 1,
    slug: 'jovem-aprendiz-2026-regras-idade-salario-inscricao',
    title: 'Jovem Aprendiz 2026: Regras, Idade Máxima, Salário Oficial e Onde se Inscrever',
    category: 'primeiro_emprego',
    excerpt: 'Guia completo e atualizado para o programa Jovem Aprendiz 2026: quem pode participar, jornada de trabalho permitida por lei, cálculo do salário mínimo/hora, direitos trabalhistas e lista das principais empresas e órgãos que contratam.',
    author: 'Equipe Editorial Você Pode Tudo',
    read_time_minutes: 7,
    cover_image: 'assets/mascote.png',
    tags: 'jovem aprendiz 2026, regras jovem aprendiz, salario jovem aprendiz, idade jovem aprendiz, primeiro emprego, lei da aprendizagem, vagas jovem aprendiz',
    views_count: 0,
    is_published: 1,
    created_at: '2026-11-11 22:30:00',
    content: `<p class="lead text-lg font-medium text-slate-700 dark:text-slate-200 mb-6">O programa <strong>Jovem Aprendiz</strong> é hoje a porta de entrada mais segura e regulamentada para jovens entrarem no mercado de trabalho formal no Brasil. Respaldado pela Lei da Aprendizagem (Lei nº 10.097/2000), o programa combina capacitação teórica em sala de aula com prática remunerada em médias e grandes empresas.</p>

<p class="mb-4">Para quem está em busca da primeira oportunidade profissional em 2026, entender com clareza quais são as regras, a faixa etária permitida, a remuneração legal e os canais oficiais de inscrição evita fraudes e acelera a contratação.</p>

<h2 class="text-xl font-black text-slate-900 dark:text-white mt-8 mb-4">1. Quem Tem Direito a Ser Jovem Aprendiz em 2026?</h2>
<p class="mb-3">A legislação brasileira estabelece critérios claros de idade e escolaridade:</p>
<ul class="list-disc pl-6 space-y-1.5 mb-6 text-sm">
  <li><strong>Faixa Etária:</strong> Jovens entre <strong>14 e 24 anos incompletos</strong>. (A idade máxima não se aplica a pessoas com deficiência - PCD).</li>
  <li><strong>Escolaridade:</strong> Estar matriculado e frequentando a escola regular (Ensino Fundamental ou Médio) ou já ter concluído o Ensino Médio.</li>
  <li><strong>Prioridade Social:</strong> A prioridade legal de seleção é concedida a estudantes da rede pública de ensino ou bolsistas integrais em escolas particulares.</li>
</ul>

<h2 class="text-xl font-black text-slate-900 dark:text-white mt-8 mb-4">2. Jornada de Trabalho e Horários Permitidos</h2>
<p class="mb-3">A lei protege o aprendizado escolar do jovem. Por isso, a carga horária é rigorosamente restrita:</p>
<ul class="list-disc pl-6 space-y-1.5 mb-6 text-sm">
  <li><strong>Até 6 horas diárias (30h semanais):</strong> Para jovens que ainda não concluíram o Ensino Fundamental ou Médio.</li>
  <li><strong>Até 8 horas diárias (40h semanais):</strong> Permitido apenas para quem já concluiu o Ensino Médio, desde que parte dessa carga seja dedicada ao curso de formação teórica.</li>
  <li><strong>Proibição de Horas Extras e Trabalho Noturno:</strong> O menor de 18 anos não pode realizar hora extra nem trabalhar entre 22h e 5h.</li>
</ul>

<h2 class="text-xl font-black text-slate-900 dark:text-white mt-8 mb-4">3. Qual é o Salário do Jovem Aprendiz em 2026?</h2>
<p class="mb-3">O salário do Jovem Aprendiz é calculado com base no <strong>salário mínimo hora nacional</strong> ou piso regional do estado. Além do salário básico, o jovem tem direito a benefícios garantidos pela CLT:</p>
<ul class="list-disc pl-6 space-y-1.5 mb-6 text-sm">
  <li><strong>Registro em Carteira de Trabalho (CTPS Digital)</strong> com contrato de até 2 anos.</li>
  <li><strong>13º Salário proporcional e integral</strong>.</li>
  <li><strong>Férias remuneradas</strong> (obrigatoriamente coincidentes com o recesso escolar para menores de 18 anos).</li>
  <li><strong>Vale-Transporte</strong> para deslocamento casa-empresa-curso.</li>
  <li><strong>FGTS especial de 2%</strong> (em vez dos 8% da CLT convencional).</li>
  <li><strong>Contribuição para o INSS</strong> (já contando tempo para previdência social).</li>
</ul>

<h2 class="text-xl font-black text-slate-900 dark:text-white mt-8 mb-4">4. Onde Encontrar Vagas Oficiais de Jovem Aprendiz?</h2>
<p class="mb-3">Todas as empresas com mais de 7 empregados são obrigadas por lei a preencher de 5% a 15% de seus postos com aprendizes. Você pode encontrar vagas abertas diariamente:</p>
<ul class="list-disc pl-6 space-y-1.5 mb-6 text-sm">
  <li>No nosso <strong><a href="vagas.html" class="text-blue-600 font-bold hover:underline">Mural Oficial de Vagas do Você Pode Tudo</a></strong>, com triagem diária de oportunidades verificadas.</li>
  <li>Nas instituições formadoras: <strong>CIEE, Nube, Espro, CAMP e Rede Cidadã</strong>.</li>
  <li>No Sistema S: <strong>SENAI, SENAC, SESC e SENAR</strong>.</li>
  <li>Nos portais de bancos (Caixa, Banco do Brasil, Bradesco, Itaú) e grandes varejistas.</li>
</ul>

<div class="my-8 p-6 bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-500/30 rounded-2xl text-center">
  <h3 class="text-lg font-black text-slate-900 dark:text-white mb-2">Prepare seu Currículo para o Jovem Aprendiz</h3>
  <p class="text-sm text-slate-600 dark:text-slate-300 mb-4">Mesmo sem experiência anterior, você pode criar um currículo moderno otimizado para sistemas de triagem (ATS) em menos de 5 minutos.</p>
  <a href="curriculo.html" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#002776] hover:bg-blue-900 text-white font-black text-sm transition-all shadow-md">
    <span>Criar Currículo para Jovem Aprendiz Grátis</span>
    <i data-lucide="arrow-right" class="w-4 h-4"></i>
  </a>
</div>`
  },
  {
    id: maxId + 2,
    slug: 'como-conseguir-primeiro-emprego-sem-experiencia-guia-2026',
    title: 'Como Conseguir o Primeiro Emprego sem Experiência em 2026: O Guia Definitivo',
    category: 'curriculo_linkedin',
    excerpt: 'Descubra as estratégias comprovadas para superar o dilema de não ter experiência comprovada na carteira: como estruturar o currículo por competências, quais cursos gratuitos colocar em destaque e como se comportar na entrevista de emprego.',
    author: 'Equipe Editorial Você Pode Tudo',
    read_time_minutes: 8,
    cover_image: 'assets/mascote.png',
    tags: 'primeiro emprego 2026, sem experiencia o que colocar no curriculo, curriculo primeiro emprego, dicas para entrevista primeiro emprego, como conseguir vaga sem experiencia',
    views_count: 0,
    is_published: 1,
    created_at: '2026-11-11 22:31:00',
    content: `<p class="lead text-lg font-medium text-slate-700 dark:text-slate-200 mb-6">O maior obstáculo de quem está começando a carreira é o famoso ciclo vicioso: <em>"preciso de experiência para conseguir uma vaga, mas preciso de uma vaga para ter experiência"</em>. Em 2026, com o avanço da triagem automatizada e inteligência artificial nos setores de RH, a boa notícia é que as empresas valorizam cada vez mais o <strong>potencial de aprendizado, atitude e cursos práticos</strong> em vez de anos de carteira assinada.</p>

<p class="mb-4">Neste guia direto ao ponto, você aprenderá exatamente o que fazer para se destacar dos outros candidatos e conquistar sua primeira contratação.</p>

<h2 class="text-xl font-black text-slate-900 dark:text-white mt-8 mb-4">1. O que Colocar no Currículo Quando Não se Tem Experiência?</h2>
<p class="mb-3">Recrutadores entendem que um iniciante não tem um histórico longo de empresas. O segredo é substituir a ausência de cargos formais por <strong>experiências de aprendizado e projetos reais</strong>:</p>
<ul class="list-disc pl-6 space-y-1.5 mb-6 text-sm">
  <li><strong>Cursos Online Gratuitos com Certificado:</strong> Cursos da Fundação Bradesco, Governo Federal, Sebrae ou Microsoft contam muito. Liste a instituição, a carga horária e os tópicos aprendidos.</li>
  <li><strong>Trabalhos Informais e Voluntariado:</strong> Ajudou na loja da família, organizou evento na igreja ou prestou suporte de informática para vizinhos? Isso demonstra responsabilidade, iniciativa e atendimento ao cliente.</li>
  <li><strong>Projetos Escolares e Acadêmicos:</strong> Feiras de ciências, apresentações em grupo e trabalhos de conclusão comprovam habilidade de trabalhar em equipe e cumprir prazos.</li>
  <li><strong>Habilidades Digitais:</strong> Excel intermediário, ferramentas Google, boa digitação e noções de atendimento via WhatsApp Business são diferenciais imediatos.</li>
</ul>

<h2 class="text-xl font-black text-slate-900 dark:text-white mt-8 mb-4">2. O Objetivo Profissional Preciso e Realista</h2>
<p class="mb-3">Evite frases genéricas como <em>"busco qualquer oportunidade para crescer na empresa"</em>. O recrutador precisa saber em qual área você pretende atuar:</p>
<div class="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 text-xs font-mono">
  Exemplo Forte: "Estudante do Ensino Médio com formação complementar em Pacote Office e Atendimento ao Cliente, buscando primeira oportunidade como Jovem Aprendiz ou Auxiliar Administrativo para contribuir com organização e atendimento."
</div>

<h2 class="text-xl font-black text-slate-900 dark:text-white mt-8 mb-4">3. Como se Destacar na Entrevista de Emprego</h2>
<p class="mb-3">Para vagas de primeiro emprego, os recrutadores avaliam principalmente a <strong>comunicação, pontualidade e vontade de aprender</strong>:</p>
<ul class="list-disc pl-6 space-y-1.5 mb-6 text-sm">
  <li><strong>Pesquise a Empresa Antes:</strong> Saiba o que a empresa faz, quais produtos vende e quem são seus clientes. Dizer na entrevista que você pesquisou o site oficial causa excelente impressão.</li>
  <li><strong>Pontualidade Absoluta:</strong> Chegue com 15 minutos de antecedência (ou teste seu microfone e câmera com 20 minutos de antecedência se for entrevista online).</li>
  <li><strong>Sinceridade com Vontade:</strong> Se não souber responder algo técnico, não invente. Diga: <em>"Ainda não utilizei essa ferramenta específica, mas tenho facilidade de aprendizado e dedicação para dominar rapidamente"</em>.</li>
</ul>

<div class="my-8 p-6 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/30 rounded-2xl text-center">
  <h3 class="text-lg font-black text-slate-900 dark:text-white mb-2">Simule sua Entrevista Agora</h3>
  <p class="text-sm text-slate-600 dark:text-slate-300 mb-4">Treine as perguntas reais mais difíceis feitas por recrutadores em nosso Simulador Interativo gratuito.</p>
  <a href="simulador-entrevista.html" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#009639] hover:bg-emerald-800 text-white font-black text-sm transition-all shadow-md">
    <span>Treinar no Simulador de Entrevista Grátis</span>
    <i data-lucide="arrow-right" class="w-4 h-4"></i>
  </a>
</div>`
  },
  {
    id: maxId + 3,
    slug: 'cursos-gratuitos-senai-sesi-bradesco-certificado-valido',
    title: 'Cursos Gratuitos do SENAI, SESI e Fundação Bradesco com Certificado Reconhecido pelo MEC',
    category: 'estudos',
    excerpt: 'Conheça os melhores portais oficiais para fazer cursos 100% gratuitos online em 2026: como se matricular, como emitir o certificado de conclusão com código de autenticidade e como validar as horas complementares na faculdade.',
    author: 'Equipe Editorial Você Pode Tudo',
    read_time_minutes: 7,
    cover_image: 'assets/mascote.png',
    tags: 'cursos gratuitos senai, fundacao bradesco cursos gratis, sesi cursos online, certificado valido mec, horas complementares faculdade, cursos ead gratuitos',
    views_count: 0,
    is_published: 1,
    created_at: '2026-11-11 22:32:00',
    content: `<p class="lead text-lg font-medium text-slate-700 dark:text-slate-200 mb-6">Em tempos de transição para o mercado digital, a qualificação profissional contínua é a maior aliada de quem busca promoção, recolocação ou o primeiro emprego. Muitas pessoas ainda acreditam que cursos de excelência custam caro, mas grandes instituições brasileiras oferecem centenas de <strong>cursos online 100% gratuitos com emissão de certificado oficial</strong>.</p>

<p class="mb-4">Confira as plataformas mais respeitadas pelo mercado de trabalho, com certificados que possuem código de autenticidade e validade em todo o território nacional.</p>

<h2 class="text-xl font-black text-slate-900 dark:text-white mt-8 mb-4">1. Fundação Bradesco (Escola Virtual)</h2>
<p class="mb-3">A <strong>Escola Virtual da Fundação Bradesco</strong> é pioneira e referência nacional em cursos livres a distância. São mais de 90 cursos gratuitos divididos nas áreas mais exigidas:</p>
<ul class="list-disc pl-6 space-y-1.5 mb-6 text-sm">
  <li><strong>Principais Cursos:</strong> Microsoft Excel (Básico, Intermediário e Avançado), Comunicação Escrita, Contabilidade Empresarial, Fundamentos de TI e Inteligência Artificial.</li>
  <li><strong>Certificado:</strong> Emitido gratuitamente em PDF logo após atingir nota mínima de 70% na avaliação final, com código QR e hash para validação online.</li>
</ul>

<h2 class="text-xl font-black text-slate-900 dark:text-white mt-8 mb-4">2. SENAI e SESI (Mundo SENAI)</h2>
<p class="mb-3">O <strong>SENAI</strong> é a maior autoridade em formação técnica industrial do Brasil. Em sua plataforma digital, oferece cursos de iniciação profissional e aperfeiçoamento:</p>
<ul class="list-disc pl-6 space-y-1.5 mb-6 text-sm">
  <li><strong>Principais Cursos:</strong> Lógica de Programação, Metrologia, Segurança do Trabalho, Desenho Arquitetônico, Tecnologia da Informação e Noções de Mecânica Automotiva.</li>
  <li><strong>Destaque no Currículo:</strong> A marca SENAI possui altíssimo peso junto às indústrias, construtoras e empresas de logística.</li>
</ul>

<h2 class="text-xl font-black text-slate-900 dark:text-white mt-8 mb-4">3. Escola do Trabalhador 4.0 (Ministério do Trabalho & Microsoft)</h2>
<p class="mb-3">Iniciativa oficial do Governo Federal em parceria com a Microsoft para capacitação tecnológica em massa da população brasileira:</p>
<ul class="list-disc pl-6 space-y-1.5 mb-6 text-sm">
  <li><strong>Principais Cursos:</strong> Letramento Digital, Ferramentas de Produtividade, Inteligência Artificial Generativa, Segurança Cibernética e Nuvem Azure.</li>
  <li><strong>Certificação:</strong> Certificado assinado em conjunto pelo Ministério do Trabalho e Emprego e pela Microsoft.</li>
</ul>

<h2 class="text-xl font-black text-slate-900 dark:text-white mt-8 mb-4">4. Como Adicionar Esses Cursos no Currículo para Chamar a Atenção</h2>
<p class="mb-3">Ao adicionar cursos complementares em seu currículo, siga esta estrutura recomendada por especialistas em RH:</p>
<div class="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 text-xs font-mono">
  • Microsoft Excel Avançado (Dashboards e Fórmulas Procv/Procx) — Fundação Bradesco (40h) — Concluído em 2026<br>
  • Lógica de Programação e Algoritmos — SENAI EAD (14h) — Concluído em 2026
</div>

<div class="my-8 p-6 bg-yellow-50 dark:bg-amber-950/40 border-2 border-yellow-500/30 rounded-2xl text-center">
  <h3 class="text-lg font-black text-slate-900 dark:text-white mb-2">Explore Mais de 190 Cursos Gratuitos Verificados</h3>
  <p class="text-sm text-slate-600 dark:text-slate-300 mb-4">Reunimos em uma única plataforma todos os cursos oficiais com links diretos para matrícula gratuita sem intermediários.</p>
  <a href="/" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#002776] hover:bg-blue-900 text-white font-black text-sm transition-all shadow-md">
    <span>Explorar Catálogo Completo de Cursos</span>
    <i data-lucide="arrow-right" class="w-4 h-4"></i>
  </a>
</div>`
  }
];

// Inserir os artigos novos no início ou fim
newArticles.forEach(a => {
  const existing = posts.find(p => p.slug === a.slug);
  if (!existing) {
    posts.unshift(a);
    console.log(`✅ Artigo adicionado: ${a.title}`);
  }
});

fs.writeFileSync(seedBlogPath, JSON.stringify(posts, null, 2), 'utf8');
fs.writeFileSync(cacheBlogPath, JSON.stringify(posts, null, 2), 'utf8');
console.log(`🎉 seed_blog.json e cache_blog.json atualizados com ${posts.length} artigos!`);
