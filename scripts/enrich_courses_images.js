const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const coursesJsPath = path.join(rootDir, 'src', 'data', 'courses.js');
const cacheCoursesPath = path.join(rootDir, 'api', 'cache_courses.json');
const seedCoursesPath = path.join(rootDir, 'api', 'seed_courses.json');

const newCourses = [
  {
    id: "ev-python-basico",
    title: "Linguagem de Programação Python - Básico",
    provider: "Fundação Bradesco",
    providerTag: "Bradesco",
    providerColor: "bg-red-50 text-red-700 border-red-200 font-black",
    category: "tecnologia",
    categoryName: "Tecnologia",
    description: "Lógica de programação e sintaxe da linguagem Python, cobrindo variáveis, estruturas condicionais e de repetição para ingressar no mercado de desenvolvimento.",
    url: "https://www.ev.org.br/cursos/linguagem-de-programacao-python-basico",
    workloadHours: 24,
    hasFreeCertificate: true,
    certificateNote: "Certificado 100% Gratuito Oficial",
    level: "Iniciante",
    tags: ["Python", "Programação", "Fundação Bradesco", "Lógica"],
    featured: true,
    rating: 4.9,
    reviewsCount: 1250,
    isActive: true,
    icon: "code-2",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "ev-comunicacao-escrita-redacao",
    title: "Comunicação Escrita e Redação Corporativa",
    provider: "Fundação Bradesco",
    providerTag: "Bradesco",
    providerColor: "bg-red-50 text-red-700 border-red-200 font-black",
    category: "profissionalizacao",
    categoryName: "Profissionalização",
    description: "Produção de correspondências corporativas, e-mails comerciais e relatórios, enfatizando clareza, coesão, objetividade e norma culta no ambiente de trabalho.",
    url: "https://www.ev.org.br/cursos/comunicacao-escrita",
    workloadHours: 40,
    hasFreeCertificate: true,
    certificateNote: "Certificado 100% Gratuito Oficial",
    level: "Iniciante",
    tags: ["Comunicação", "Redação", "Empresarial", "Escrita"],
    featured: false,
    rating: 4.8,
    reviewsCount: 940,
    isActive: true,
    icon: "file-text",
    imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "mte-microsoft-letramento-digital",
    title: "Letramento Digital e Produtividade com Microsoft 365",
    provider: "Escola do Trabalhador 4.0 / Microsoft",
    providerTag: "Microsoft",
    providerColor: "bg-blue-50 text-blue-700 border-blue-200 font-black",
    category: "tecnologia",
    categoryName: "Tecnologia",
    description: "Capacitação nacional desenvolvida pelo Ministério do Trabalho e Microsoft em ferramentas essenciais de escritório (Word, Excel, PowerPoint, Teams) e nuvem.",
    url: "https://escoladotrabalhador40.com.br/",
    workloadHours: 30,
    hasFreeCertificate: true,
    certificateNote: "Certificado Oficial Microsoft / MTE",
    level: "Iniciante",
    tags: ["Microsoft", "Office", "Trabalho", "Produtividade"],
    featured: true,
    rating: 5.0,
    reviewsCount: 2180,
    isActive: true,
    icon: "laptop",
    imageUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "mte-microsoft-azure-ia-900",
    title: "Fundamentos de Inteligência Artificial e Azure AI",
    provider: "Escola do Trabalhador 4.0 / Microsoft",
    providerTag: "Microsoft",
    providerColor: "bg-blue-50 text-blue-700 border-blue-200 font-black",
    category: "tecnologia",
    categoryName: "Tecnologia",
    description: "Introdução a conceitos essenciais de Inteligência Artificial, Machine Learning, Visão Computacional, Processamento de Linguagem Natural e IA Generativa na nuvem Azure.",
    url: "https://escoladotrabalhador40.com.br/",
    workloadHours: 25,
    hasFreeCertificate: true,
    certificateNote: "Certificado Oficial Microsoft / MTE",
    level: "Iniciante",
    tags: ["Inteligência Artificial", "Azure", "Microsoft", "IA"],
    featured: true,
    rating: 4.9,
    reviewsCount: 1840,
    isActive: true,
    icon: "brain-circuit",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "evg-gestao-agil-scrum",
    title: "Gestão Ágil de Projetos com Scrum",
    provider: "EV.G / ENAP",
    providerTag: "Gov.br",
    providerColor: "bg-emerald-50 text-emerald-800 border-emerald-300 font-black",
    category: "gestao",
    categoryName: "Gestão",
    description: "Metodologias ágeis na prática: papéis de Product Owner e Scrum Master, sprints, cerimônias e artefatos para entregas contínuas de valor em equipes.",
    url: "https://www.escolavirtual.gov.br/curso/338",
    workloadHours: 30,
    hasFreeCertificate: true,
    certificateNote: "Certificado Oficial EV.G / ENAP Gratuito",
    level: "Iniciante",
    tags: ["Scrum", "Ágil", "Projetos", "Gestão", "EV.G"],
    featured: true,
    rating: 4.9,
    reviewsCount: 1530,
    isActive: true,
    icon: "briefcase",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "evg-lgpd-privacidade-conformidade",
    title: "Introdução à Lei Geral de Proteção de Dados (LGPD)",
    provider: "EV.G / ENAP",
    providerTag: "Gov.br",
    providerColor: "bg-emerald-50 text-emerald-800 border-emerald-300 font-black",
    category: "concursos",
    categoryName: "Legislação & Conformidade",
    description: "Visão abrangente da Lei nº 13.709/2018: princípios de privacidade, direitos dos titulares de dados, segurança da informação e conformidade legal.",
    url: "https://www.escolavirtual.gov.br/curso/316",
    workloadHours: 20,
    hasFreeCertificate: true,
    certificateNote: "Certificado Oficial EV.G / ENAP Gratuito",
    level: "Iniciante",
    tags: ["LGPD", "Direito", "Privacidade", "Segurança", "Gov.br"],
    featured: false,
    rating: 4.8,
    reviewsCount: 1120,
    isActive: true,
    icon: "landmark",
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "sebrae-mkt-digital-pequenos-negocios",
    title: "Marketing Digital para Pequenos Negócios",
    provider: "Sebrae",
    providerTag: "Sebrae",
    providerColor: "bg-sky-50 text-sky-800 border-sky-300 font-black",
    category: "empreendedorismo",
    categoryName: "Empreendedorismo",
    description: "Estratégias digitais para MEI e microempresas: presença nas redes sociais, anúncios eficientes, relacionamento e conversão de seguidores em clientes.",
    url: "https://sebrae.com.br/sites/PortalSebrae/cursosonline/marketing-digital-para-o-empreendedor,b38d94619b710710VgnVCM100000d701210aRCRD",
    workloadHours: 15,
    hasFreeCertificate: true,
    certificateNote: "Certificado Oficial Sebrae Gratuito",
    level: "Iniciante",
    tags: ["Marketing Digital", "Sebrae", "Vendas", "MEI", "Redes Sociais"],
    featured: true,
    rating: 4.9,
    reviewsCount: 2410,
    isActive: true,
    icon: "trending-up",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "sebrae-gestao-financeira-caixa",
    title: "Gestão Financeira e Controle de Fluxo de Caixa",
    provider: "Sebrae",
    providerTag: "Sebrae",
    providerColor: "bg-sky-50 text-sky-800 border-sky-300 font-black",
    category: "financas",
    categoryName: "Finanças",
    description: "Controle diário de receitas e despesas, formação do preço de venda, ponto de equilíbrio financeiro e planejamento operacional para lucrar com segurança.",
    url: "https://sebrae.com.br/sites/PortalSebrae/cursosonline/gestao-financeira,f13880016b801710VgnVCM100000d701210aRCRD",
    workloadHours: 20,
    hasFreeCertificate: true,
    certificateNote: "Certificado Oficial Sebrae Gratuito",
    level: "Iniciante",
    tags: ["Finanças", "Fluxo de Caixa", "Sebrae", "Administração"],
    featured: false,
    rating: 4.8,
    reviewsCount: 1670,
    isActive: true,
    icon: "calculator",
    imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "fgv-ciencia-de-dados-fundamentos",
    title: "Introdução à Ciência de Dados",
    provider: "FGV",
    providerTag: "FGV",
    providerColor: "bg-blue-50 text-blue-900 border-blue-200 font-black",
    category: "tecnologia",
    categoryName: "Tecnologia",
    description: "Fundamentos de pensamento analítico, ciclo de exploração de dados, inferência estatística e principais técnicas de aprendizado de máquina para tomada de decisões.",
    url: "https://educacao-executiva.fgv.br/cursos/online/curta-media-duracao-online/introducao-ciencia-de-dados",
    workloadHours: 30,
    hasFreeCertificate: true,
    certificateNote: "Declaração de Participação FGV Gratuita",
    level: "Iniciante",
    tags: ["Ciência de Dados", "FGV", "Estatística", "Tecnologia"],
    featured: true,
    rating: 4.9,
    reviewsCount: 1390,
    isActive: true,
    icon: "bar-chart-3",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "fgv-relacoes-de-consumo-cdc",
    title: "Fundamentos das Relações de Consumo",
    provider: "FGV",
    providerTag: "FGV",
    providerColor: "bg-blue-50 text-blue-900 border-blue-200 font-black",
    category: "concursos",
    categoryName: "Direito & Atendimento",
    description: "Bases normativas do Código de Defesa do Consumidor (CDC), direitos essenciais do consumidor, deveres das empresas e boas práticas de atendimento ético.",
    url: "https://educacao-executiva.fgv.br/cursos/online/curta-media-duracao-online/fundamentos-das-relacoes-de-consumo",
    workloadHours: 10,
    hasFreeCertificate: true,
    certificateNote: "Declaração de Participação FGV Gratuita",
    level: "Iniciante",
    tags: ["Consumidor", "Direito", "FGV", "Atendimento"],
    featured: false,
    rating: 4.7,
    reviewsCount: 880,
    isActive: true,
    icon: "landmark",
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "usp-coursera-ciencia-computacao-python",
    title: "Introdução à Ciência da Computação com Python",
    provider: "USP / Coursera",
    providerTag: "USP",
    providerColor: "bg-amber-50 text-amber-900 border-amber-300 font-black",
    category: "tecnologia",
    categoryName: "Tecnologia",
    description: "Curso de renome da USP cobrindo lógica computacional, algoritmos e programação em Python. Acesso integral 100% gratuito a todas as videoaulas e materiais.",
    url: "https://www.coursera.org/learn/ciencia-computacao-python-conceitos",
    workloadHours: 32,
    hasFreeCertificate: false,
    certificateNote: "Aulas 100% Gratuitas (Modo Ouvinte) • Certificado Opcional",
    level: "Iniciante",
    tags: ["USP", "Python", "Ciência da Computação", "Coursera"],
    featured: true,
    rating: 5.0,
    reviewsCount: 3120,
    isActive: true,
    icon: "code-2",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "ita-coursera-desenvolvimento-agil-padroes",
    title: "Desenvolvimento Ágil com Padrões de Projeto",
    provider: "ITA / Coursera",
    providerTag: "ITA",
    providerColor: "bg-slate-100 text-slate-800 border-slate-300 font-black",
    category: "tecnologia",
    categoryName: "Tecnologia",
    description: "Engenharia de software com princípios SOLID, refatoração e implementação prática de Design Patterns ministrado por docentes do Instituto Tecnológico de Aeronáutica.",
    url: "https://www.coursera.org/learn/padroes-de-projeto",
    workloadHours: 28,
    hasFreeCertificate: false,
    certificateNote: "Aulas 100% Gratuitas (Modo Ouvinte) • Certificado Opcional",
    level: "Intermediário",
    tags: ["ITA", "Arquitetura", "Design Patterns", "Engenharia de Software"],
    featured: false,
    rating: 4.9,
    reviewsCount: 1450,
    isActive: true,
    icon: "code-2",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80"
  }
];

function assignSubjectImage(course) {
  if (course.imageUrl && typeof course.imageUrl === 'string' && course.imageUrl.startsWith('http')) {
    return course.imageUrl;
  }

  const title = (course.title || '').toLowerCase();
  const desc = (course.description || '').toLowerCase();
  const cat = (course.category || '').toLowerCase();
  const tags = (course.tags || []).map(t => t.toLowerCase()).join(' ');
  const text = `${title} ${tags} ${desc}`;

  if (/ciberseguran|cyber|hackers do bem|segurança da informação|segurança digital|forense|pentest/.test(text)) {
    return 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80';
  }
  if (cat === 'ia' || /inteligência artificial|ia generativa|machine learning|deep learning|copilot|fluência|chatgpt|llm/.test(text)) {
    return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80';
  }
  if (cat === 'nuvem' || /\b(cloud|aws|azure|oci|google cloud)\b/.test(text) || /computação em nuvem/.test(text)) {
    return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80';
  }
  if (/power bi|análise de dados|ciência de dados|data science|banco de dados|sql\b/.test(text)) {
    return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80';
  }
  if (/excel|planilha/.test(text)) {
    return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80';
  }
  if (cat === 'tecnologia' || /python|javascript|programação|lógica de programação|java\b|html5|css3|react|node|algoritmo|git\b|desenvolvedor/.test(text)) {
    return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80';
  }
  if (cat === 'saude' || /saúde|idoso|enfermagem|médic|farmácia|cuidador|primeiros socorros|lei lucas|hospital|sus\b|fiocruz/.test(text)) {
    return 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80';
  }
  if (cat === 'agro' || /agronegócio|rural|agricultura|senar|irrigação/.test(text)) {
    return 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80';
  }
  if (cat === 'idiomas' || /inglês|espanhol|francês|duolingo|idioma/.test(text)) {
    return 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80';
  }
  if (cat === 'acessibilidade' || /libras|tecnologia assistiva|sinais|inclusão/.test(text)) {
    return 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80';
  }
  if (cat === 'artes' || /design|fotografia|vídeo|canva|photoshop|figma|desenho|multimídia/.test(text)) {
    return 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80';
  }
  if (cat === 'empreendedorismo' || cat === 'negocios' || /marketing|vendas|vender|comércio|sebrae|mei\b|atendimento/.test(text)) {
    return 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=600&q=80';
  }
  if (cat === 'financas' || /finanças|financeir|contabilidade|investimento|fluxo de caixa/.test(text)) {
    return 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80';
  }
  if (cat === 'concursos' || /concurso|direito|lgpd|lei\b|legislação|serviço público|relações de consumo/.test(text)) {
    return 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80';
  }
  if (cat === 'gestao' || /gestão|liderança|projetos|scrum|kanban|tempo/.test(text)) {
    return 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80';
  }
  if (/redação|escrita|comunicação|oratória/.test(text)) {
    return 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80';
  }
  if (/suporte|hardware|redes\b|windows/.test(text)) {
    return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
  }
  if (/currículo|entrevista|primeiro emprego|carreira/.test(text)) {
    return 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80';
  }

  return 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80';
}

// 1. Atualizar api/cache_courses.json e api/seed_courses.json
let currentCourses = [];
if (fs.existsSync(cacheCoursesPath)) {
  currentCourses = JSON.parse(fs.readFileSync(cacheCoursesPath, 'utf8'));
} else if (fs.existsSync(seedCoursesPath)) {
  currentCourses = JSON.parse(fs.readFileSync(seedCoursesPath, 'utf8'));
}

const existingIds = new Set(currentCourses.map(c => c.id));
newCourses.forEach(nc => {
  if (!existingIds.has(nc.id)) {
    currentCourses.unshift(nc);
    existingIds.add(nc.id);
  }
});

// Atribuir imagens a todos os cursos
currentCourses.forEach(c => {
  c.imageUrl = assignSubjectImage(c);
});

fs.writeFileSync(cacheCoursesPath, JSON.stringify(currentCourses, null, 2), 'utf8');
fs.writeFileSync(seedCoursesPath, JSON.stringify(currentCourses, null, 2), 'utf8');
console.log(`✅ Salvo ${currentCourses.length} cursos em api/cache_courses.json e seed_courses.json`);

// 2. Atualizar src/data/courses.js
let coursesJsContent = fs.readFileSync(coursesJsPath, 'utf8');

// Atualizar o array localCourses
const localCoursesIdx = coursesJsContent.indexOf('const localCourses = [');
if (localCoursesIdx !== -1) {
  const exportIdx = coursesJsContent.indexOf('if (typeof window !==', localCoursesIdx);
  if (exportIdx !== -1) {
    const before = coursesJsContent.substring(0, localCoursesIdx);
    const after = coursesJsContent.substring(exportIdx);
    const updatedLocalCoursesString = `const localCourses = ${JSON.stringify(currentCourses, null, 2)};\n\n`;
    coursesJsContent = before + updatedLocalCoursesString + after;
    fs.writeFileSync(coursesJsPath, coursesJsContent, 'utf8');
    console.log(`✅ Salvo ${currentCourses.length} cursos em src/data/courses.js`);
  }
}
