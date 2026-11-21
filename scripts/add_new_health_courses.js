const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const cachePath = path.join(ROOT_DIR, 'api', 'cache_courses.json');
const seedPath = path.join(ROOT_DIR, 'api', 'seed_courses.json');
const coursesJsPath = path.join(ROOT_DIR, 'src', 'data', 'courses.js');

const newCourses = [
  {
    id: "unasus-cuidados-paliativos-aps",
    title: "Cuidados Paliativos na Atenção Primária à Saúde",
    provider: "UNA-SUS / Fiocruz",
    providerTag: "UNA-SUS / Fiocruz",
    providerColor: "bg-teal-50 text-teal-900 border-teal-300 font-black",
    category: "saude",
    categoryName: "saude",
    description: "Princípios de controle e alívio da dor, acolhimento biopsicossocial do paciente e familiares, comunicação de notícias difíceis e plano terapêutico singular no SUS.",
    url: "https://www.unasus.gov.br/cursos/busca",
    workloadHours: 30,
    hasFreeCertificate: true,
    certificateNote: "Certificado 100% Gratuito emitido pela Fiocruz",
    level: "Intermediário",
    tags: [
      "Saúde",
      "Fiocruz",
      "Cuidados Paliativos",
      "Enfermagem",
      "Acolhimento"
    ],
    featured: true,
    rating: 4.9,
    reviewsCount: 3820,
    isActive: true,
    icon: "heart-handshake",
    imageUrl: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "anvisa-biosseguranca-controle-infeccao",
    title: "Biossegurança e Controle de Infecções em Serviços de Saúde",
    provider: "Escola Virtual de Governo (EV.G / Anvisa)",
    providerTag: "Anvisa / EV.G",
    providerColor: "bg-blue-50 text-blue-900 border-blue-300 font-black",
    category: "saude",
    categoryName: "saude",
    description: "Normas técnicas da Anvisa para higienização das mãos, precauções padrão e de contato, uso correto de EPIs, descarte de perfurocortantes e prevenção de infecções hospitalares.",
    url: "https://www.escolavirtual.gov.br/curso/307",
    workloadHours: 40,
    hasFreeCertificate: true,
    certificateNote: "Certificado 100% Gratuito emitido pela Anvisa / EV.G",
    level: "Iniciante",
    tags: [
      "Saúde",
      "Anvisa",
      "Biossegurança",
      "Enfermagem",
      "Higiene Hospitalar"
    ],
    featured: true,
    rating: 4.9,
    reviewsCount: 5410,
    isActive: true,
    icon: "shield-check",
    imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "avasus-atencao-saude-mulher-prenatal",
    title: "Saúde da Mulher e Acolhimento Humanizado no Pré-Natal",
    provider: "AVASUS (Ministério da Saúde / UFRN)",
    providerTag: "AVASUS / Ministério da Saúde",
    providerColor: "bg-teal-50 text-teal-900 border-teal-300 font-black",
    category: "saude",
    categoryName: "saude",
    description: "Diretrizes nacionais para o acompanhamento pré-natal de baixo risco na Atenção Básica, rastreamento de intercorrências, vacinação da gestante e incentivo ao parto humanizado.",
    url: "https://avasus.ufrn.br/",
    workloadHours: 30,
    hasFreeCertificate: true,
    certificateNote: "Certificado 100% Gratuito emitido pela UFRN / Ministério da Saúde",
    level: "Iniciante",
    tags: [
      "Saúde",
      "AVASUS",
      "Pré-Natal",
      "Saúde da Mulher",
      "SUS"
    ],
    featured: false,
    rating: 4.8,
    reviewsCount: 4150,
    isActive: true,
    icon: "baby",
    imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "fiocruz-vigilancia-epidemiologica-imunizacoes",
    title: "Vigilância Epidemiológica e Imunizações no SUS",
    provider: "Fiocruz",
    providerTag: "Fiocruz",
    providerColor: "bg-teal-50 text-teal-900 border-teal-300 font-black",
    category: "saude",
    categoryName: "saude",
    description: "Capacitação sobre o Programa Nacional de Imunizações (PNI), conservação em cadeia de frio, busca ativa de faltosos, notificação compulsória de agravos e acolhimento em salas de vacina.",
    url: "https://campusvirtual.fiocruz.br/portal/",
    workloadHours: 40,
    hasFreeCertificate: true,
    certificateNote: "Certificado 100% Gratuito emitido pela Fiocruz",
    level: "Intermediário",
    tags: [
      "Saúde",
      "Fiocruz",
      "Vacinas",
      "Vigilância",
      "Epidemiologia"
    ],
    featured: true,
    rating: 4.9,
    reviewsCount: 6200,
    isActive: true,
    icon: "syringe",
    imageUrl: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "unasus-acolhimento-recepcao-unidades-saude",
    title: "Acolhimento com Classificação de Risco e Humanização na Recepção",
    provider: "UNA-SUS / UFMA",
    providerTag: "UNA-SUS / UFMA",
    providerColor: "bg-teal-50 text-teal-900 border-teal-300 font-black",
    category: "saude",
    categoryName: "saude",
    description: "Práticas de recepção humanizada em UPAs e UBSs, organização de filas, escuta atenta, comunicação não-violenta e protocolos de prioridade assistencial conforme a Política Nacional de Humanização.",
    url: "https://www.unasus.gov.br/cursos/busca",
    workloadHours: 30,
    hasFreeCertificate: true,
    certificateNote: "Certificado 100% Gratuito emitido pela UNA-SUS / UFMA",
    level: "Iniciante",
    tags: [
      "Saúde",
      "UNA-SUS",
      "Recepção",
      "Humanização",
      "Atendimento"
    ],
    featured: false,
    rating: 4.8,
    reviewsCount: 3540,
    isActive: true,
    icon: "user-check",
    imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "poca-farmacologia-uso-racional-medicamentos",
    title: "Noções de Farmacologia e Uso Racional de Medicamentos",
    provider: "PoCA (UFSCar)",
    providerTag: "PoCA (UFSCar)",
    providerColor: "bg-emerald-50 text-emerald-900 border-emerald-300 font-black",
    category: "saude",
    categoryName: "saude",
    description: "Conceitos fundamentais de posologia, interações medicamentosas frequentes, cuidados no armazenamento, perigos da automedicação e orientação correta ao paciente no balcão e no domicílio.",
    url: "https://cursos.poca.ufscar.br/",
    workloadHours: 20,
    hasFreeCertificate: true,
    certificateNote: "Certificado 100% Gratuito emitido pela UFSCar",
    level: "Iniciante",
    tags: [
      "Saúde",
      "UFSCar",
      "Farmácia",
      "Medicamentos",
      "Cuidados"
    ],
    featured: false,
    rating: 4.9,
    reviewsCount: 4210,
    isActive: true,
    icon: "pill",
    imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&q=80"
  }
];

// 1. Atualizar api/cache_courses.json e api/seed_courses.json
const cacheCourses = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
const seedCourses = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

let addedCount = 0;
for (const nc of newCourses) {
  if (!cacheCourses.some(c => c.id === nc.id)) {
    cacheCourses.push(nc);
    seedCourses.push(nc);
    addedCount++;
    console.log(`+ Adicionado: ${nc.title} (${nc.provider})`);
  }
}

fs.writeFileSync(cachePath, JSON.stringify(cacheCourses, null, 2), 'utf8');
fs.writeFileSync(seedPath, JSON.stringify(seedCourses, null, 2), 'utf8');
console.log(`✅ ${addedCount} novos cursos adicionados em api/cache_courses.json e api/seed_courses.json (Total: ${cacheCourses.length})`);

// 2. Atualizar src/data/courses.js
let jsContent = fs.readFileSync(coursesJsPath, 'utf8');

// Adicionar cursos antes do fechamento de localCourses = [ ... ];
// Procurar "const localCourses = ["
const startIdx = jsContent.indexOf('const localCourses = [');
if (startIdx !== -1) {
  const jsonPart = jsContent.slice(startIdx + 'const localCourses = '.length);
  const endIdx = jsonPart.lastIndexOf('];');
  const existingCourses = eval(jsonPart.slice(0, endIdx + 2));
  
  for (const nc of newCourses) {
    if (!existingCourses.some(c => c.id === nc.id)) {
      existingCourses.push(nc);
    }
  }

  // Re-montar localCourses mantendo o cabeçalho e rodapé de courses.js
  const prefix = jsContent.slice(0, startIdx + 'const localCourses = '.length);
  const suffix = jsonPart.slice(endIdx + 2);
  const newJsContent = prefix + JSON.stringify(existingCourses, null, 2) + ';' + suffix;
  fs.writeFileSync(coursesJsPath, newJsContent, 'utf8');
  console.log(`✅ src/data/courses.js atualizado com os novos cursos (Total: ${existingCourses.length})`);
}

console.log('🎉 Processo de inclusão de cursos de saúde concluído com sucesso!');
