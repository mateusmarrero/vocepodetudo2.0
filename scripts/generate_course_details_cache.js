const fs = require('fs');
const path = require('path');
const cd = require('../src/data/course_details.js');

const coursesPath = path.resolve(__dirname, '../api/seed_courses.json');
const outputPath = path.resolve(__dirname, '../api/cache_course_details.json');

const courses = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));

// Mapa descritivo institucional dos principais provedores parceiros
const PROVIDER_INFO = {
  'sebrae': {
    name: 'Sebrae Nacional',
    description: 'O Serviço Brasileiro de Apoio às Micro e Pequenas Empresas (Sebrae) é uma entidade privada brasileira de interesse público que fomenta o empreendedorismo, a inovação e a capacitação empresarial em todo o Brasil desde 1972.',
    badge: 'Instituição Pública de Fomento',
    website: 'https://sebrae.com.br'
  },
  'bradesco': {
    name: 'Fundação Bradesco — Escola Virtual',
    description: 'Criada em 2001, a Escola Virtual da Fundação Bradesco é um dos maiores portais de e-learning social do Brasil, oferecendo cursos livres 100% gratuitos com certificação reconhecida pelo mercado de trabalho.',
    badge: 'Educação Social de Excelência',
    website: 'https://www.ev.org.br'
  },
  'usp': {
    name: 'Universidade de São Paulo (USP)',
    description: 'A USP é a maior universidade pública do Brasil e uma das mais prestigiadas da América Latina, reconhecida mundialmente pela liderança em pesquisa científica, tecnologia e ensino superior de ponta.',
    badge: 'Universidade Pública Nº 1 da América Latina',
    website: 'https://www.usp.br'
  },
  'ita': {
    name: 'Instituto Tecnológico de Aeronáutica (ITA)',
    description: 'O ITA é uma instituição de ensino superior pública federal ligada ao Comando da Aeronáutica, renomada internacionalmente pelo altíssimo rigor acadêmico em engenharia e ciências exatas.',
    badge: 'Referência Mundial em Engenharia',
    website: 'http://www.ita.br'
  },
  'fgv': {
    name: 'Fundação Getulio Vargas (FGV)',
    description: 'A FGV é pioneira no ensino de administração, economia e ciências sociais no Brasil, sendo a primeira instituição brasileira a integrar o Open Education Consortium.',
    badge: 'Líder em Gestão e Economia',
    website: 'https://www.fgv.br'
  },
  'microsoft': {
    name: 'Microsoft Learn Brasil',
    description: 'Plataforma oficial global da Microsoft para capacitação técnica gratuita em computação em nuvem (Azure), inteligência artificial, análise de dados e ferramentas de produtividade empresarial.',
    badge: 'Líder Global em Tecnologia',
    website: 'https://learn.microsoft.com'
  },
  'mec': {
    name: 'Ministério da Educação (Aprenda Mais / AVAMEC)',
    description: 'Iniciativa oficial do Governo Federal do Brasil em parceria com a Rede Federal de Educação Profissional, Científica e Tecnológica (Institutos Federais), promovendo cursos massivos abertos.',
    badge: 'Governo Federal do Brasil',
    website: 'https://aprendamais.mec.gov.br'
  },
  'coursera': {
    name: 'Coursera Global',
    description: 'Plataforma internacional de ensino superior que conecta estudantes às melhores universidades e indústrias do planeta, permitindo assistir aulas gratuitamente no Modo Ouvinte.',
    badge: 'Rede Universitária Global',
    website: 'https://www.coursera.org'
  },
  'fiap': {
    name: 'FIAP ON — Nano Courses',
    description: 'A FIAP (Faculdade de Informática e Administração Paulista) é um dos centros de excelência mais respeitados do Brasil em tecnologia, negócios e inovação, oferecendo sua trilha oficial de Nano Courses gratuitos online com certificação.',
    badge: 'Centro de Excelência em Tecnologia e Negócios',
    website: 'https://on.fiap.com.br/nano-courses/'
  }
};

function getProviderProfile(providerName) {
  const pLower = (providerName || '').toLowerCase();
  for (const [key, info] of Object.entries(PROVIDER_INFO)) {
    if (pLower.includes(key)) {
      return info;
    }
  }
  return {
    name: providerName,
    description: `${providerName} é uma instituição comprometida com a democratização do conhecimento e capacitação profissional gratuita de alta qualidade no Brasil.`,
    badge: 'Instituição Oficial Parceira',
    website: '#'
  };
}

function generateFaqs(course, details) {
  const isFreeCert = course.hasFreeCertificate;
  const prov = course.provider;
  const hours = course.workloadHours || 20;

  return [
    {
      q: `O curso "${course.title}" é realmente gratuito?`,
      a: `Sim! O acesso a todas as videoaulas, textos e materiais do curso ofertado por ${prov} é 100% gratuito. Não há cobrança de taxa de matrícula nem mensalidade.`
    },
    {
      q: `Como funciona o certificado deste curso?`,
      a: isFreeCert
        ? `Ao concluir todas as aulas e alcançar a nota mínima exigida (${details.methodology?.passingScore || '60%'} ou superior na avaliação online), você recebe o Certificado Digital Oficial em PDF emitido por ${prov}, com código de validação eletrônica e QR Code sem pagar nada.`
        : `O curso disponibiliza todas as aulas, exercícios e materiais de forma 100% gratuita no Modo Ouvinte oficial. Caso queira emitir a certificação impressa ou digital autenticada pela plataforma parceira, ela poderá ser solicitada opcionalmente.`
    },
    {
      q: `O certificado é válido para horas complementares na faculdade?`,
      a: `Sim! Os cursos livres estão amparados pela Lei de Diretrizes e Bases da Educação Nacional (Lei nº 9.394/96). As ${hours} horas comprovadas no certificado oficial podem ser apresentadas para cômputo de Atividades Complementares (AACCs) em faculdades, universidades e cursos técnicos em todo o Brasil.`
    },
    {
      q: `Preciso de computador ou posso estudar pelo celular?`,
      a: `Você pode estudar normalmente pelo seu smartphone (Android ou iPhone), tablet ou computador. A plataforma de aulas é responsiva e flexível para você estudar em qualquer lugar e no horário que preferir.`
    },
    {
      q: `Como faço para acessar as aulas e iniciar o curso?`,
      a: `Basta clicar no botão "Acessar Curso no Site Oficial" presente nesta página. Você será encaminhado com segurança para o ambiente oficial de ${prov}, onde poderá criar sua conta gratuita e começar imediatamente.`
    }
  ];
}

const detailedMap = {};

courses.forEach(course => {
  try {
    const details = cd.getCourseExpandedDetails(course);
    const provProfile = getProviderProfile(course.provider);
    const faqs = generateFaqs(course, details);

    detailedMap[course.id] = {
      syllabus: details.syllabus || [],
      learningOutcomes: details.learningOutcomes || [
        `Compreender os fundamentos essenciais de ${course.title}`,
        'Aplicar técnicas e ferramentas profissionais alinhadas ao mercado de trabalho',
        'Desenvolver autonomia prática na resolução de desafios da área',
        'Comprovar qualificação com certificação emitida por instituição oficial'
      ],
      passingScore: details.methodology?.passingScore || '60%',
      minEducation: details.prerequisites?.recommendedEducation || 'Ensino Fundamental II ou Médio em andamento',
      targetAudience: details.prerequisites?.targetAudience || 'Estudantes, profissionais em busca de qualificação e pessoas interessadas em adquirir novas competências.',
      methodology: details.methodology || {
        format: '100% Online (EAD)',
        evaluation: 'Questionário de Avaliação Online',
        passingScore: '60%'
      },
      certification: details.certification || {
        hasFreeCertificate: course.hasFreeCertificate,
        note: course.certificateNote || 'Certificado Oficial em PDF',
        legalBasis: 'Lei Federal nº 9.394/1996 (LDB) e Decreto nº 5.154/2004'
      },
      resumeTips: {
        formattedText: `• ${course.title} — ${course.provider} (${course.workloadHours || 20}h)`,
        atsKeywords: details.resumeTips?.atsKeywords || [course.title, course.provider, course.categoryName || course.category, `${course.workloadHours}h`],
        interviewTip: `Destaque a aplicação prática dos conceitos aprendidos em ${course.title} e como a metodologia de ${course.provider} auxiliou na organização do seu raciocínio profissional.`
      },
      providerProfile: provProfile,
      faqs: faqs
    };
  } catch (err) {
    console.error(`Erro ao gerar detalhes do curso ${course.id}:`, err);
  }
});

fs.writeFileSync(outputPath, JSON.stringify(detailedMap, null, 2), 'utf8');
console.log(`✅ Base de detalhes ricos gerada com sucesso para ${Object.keys(detailedMap).length} cursos em api/cache_course_details.json!`);
