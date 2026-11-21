const fs = require('fs');

function getCourseIcon(c) {
  const title = (c.title || '').toLowerCase();
  const desc = (c.description || '').toLowerCase();
  const cat = (c.category || '').toLowerCase();
  const tags = (c.tags || []).map(t => t.toLowerCase()).join(' ');
  const text = `${title} ${tags} ${desc}`;

  // 1. Cibersegurança & Redes de Segurança
  if (/ciberseguran|cyber|hackers do bem|segurança da informação|segurança digital|forense|pentest/.test(text)) {
    return 'shield-check';
  }

  // 2. Inteligência Artificial, Machine Learning e LLMs
  if (cat === 'ia' || /inteligência artificial|ia generativa|machine learning|deep learning|copilot|fluência|chatgpt|llm|robôs ats/.test(text)) {
    return 'brain-circuit';
  }

  // 3. Nuvem / Cloud Computing
  if (cat === 'nuvem' || /\b(cloud|aws|azure|oci|google cloud)\b/.test(text) || /computação em nuvem/.test(text)) {
    return 'cloud';
  }

  // 4. Power BI, Análise de Dados, Ciência de Dados, SQL
  if (/power bi|análise de dados|ciência de dados|data science|banco de dados|sql\b/.test(text)) {
    return 'bar-chart-3';
  }

  // 5. Excel e Planilhas
  if (/excel|planilha/.test(text)) {
    return 'table';
  }

  // 6. Programação, Algoritmos, Web, Mobile
  if (
    cat === 'tecnologia' && /programação|full stack|javascript|python|java\b|html5|css3|react|node|algoritmo|lógica|c\+\+|git\b|desenvolvedor|api\b|apis\b|front-end|back-end|web/.test(text) ||
    /python|javascript|programação|lógica de programação|java\b|html5|css3|react|node|algoritmo|git\b|github/.test(text)
  ) {
    return 'code-2';
  }

  // 7. Saúde, Medicina, Enfermagem, Cuidados, Bem-estar
  if (cat === 'saude' || /saúde|idoso|enfermagem|médic|farmácia|cuidador|primeiros socorros|lei lucas|burnout|dignidade menstrual|paciente|hospital|sus\b|fiocruz/.test(text)) {
    return 'heart-pulse';
  }

  // 8. Agronegócio, Meio Ambiente, Rural
  if (cat === 'agro' || /agronegócio|rural|agricultura|senar|irrigação/.test(text)) {
    return 'sprout';
  }

  // 9. Idiomas
  if (cat === 'idiomas' || /inglês|espanhol|francês|duolingo|língua adicional/.test(text)) {
    return 'languages';
  }

  // 10. Acessibilidade, Libras, Inclusão PCD
  if (cat === 'acessibilidade' || /libras|tecnologia assistiva|língua brasileira de sinais|audiodescrição|neurodiversidade/.test(text)) {
    return 'accessibility';
  }

  // 10.5 Business Model Canvas
  if (/business model canvas|canvas na prática/.test(text)) {
    return 'briefcase';
  }

  // 11. Design, Fotografia, Vídeo, Artes, Jogos
  if (cat === 'artes' || /design gráfico|design e criação|fotografia|vídeo|\bcanva\b|photoshop|figma|desenho|games|animação|multimídia/.test(text)) {
    return 'palette';
  }

  // 12. Marketing, Redes Sociais, Vendas, MEI, E-commerce
  if (cat === 'empreendedorismo' || cat === 'negocios' || /marketing|vendas|vender|comércio|sebrae|mei\b|dropshipping|customer success|social|redes sociais|atendimento ao cliente|startup/.test(text)) {
    return 'trending-up';
  }

  // 13. Finanças, Investimentos, Contabilidade
  if (cat === 'financas' || /finanças|financeir|contabilidade|investimento|ações e renda fixa|tesouro direto|gastos|fluxo de caixa/.test(text)) {
    return 'calculator';
  }

  // 14. Concursos, Direito, Legislação, Normas, Cidadania
  if (cat === 'concursos' || /concurso|direito|lgpd|lei\b|legislação|serviço público|decreto|relações internacionais|trabalhistas|normas regulamentadoras|nrs\b/.test(text)) {
    return 'landmark';
  }

  // 15. Gestão, Liderança, Projetos, Scrum
  if (cat === 'gestao' || /gestão|liderança|projetos|scrum|kanban|lean seis sigma|accountability|gestão do tempo/.test(text)) {
    return 'briefcase';
  }

  // 16. Redação, Comunicação Escrita, Textos
  if (/redação|escrita|produção de textos|comunicação|oratória|apresentação/.test(text)) {
    return 'file-text';
  }

  // 17. Infraestrutura de TI / Suporte / Hardware / Redes
  if (/suporte em ti|suporte de ti|hardware|roteamento|redes\b|windows/.test(text)) {
    return 'laptop';
  }

  // 18. Empregabilidade, Currículo, Carreira, Entrevistas
  if (/currículo|entrevista|primeiro emprego|carreira|linkedin|networking|feedback|processos seletivos/.test(text)) {
    return 'compass';
  }

  // 19. Default: Educação / Certificação
  return 'graduation-cap';
}

// 1. Atualizar api/cache_courses.json
if (fs.existsSync('api/cache_courses.json')) {
  const cacheData = JSON.parse(fs.readFileSync('api/cache_courses.json', 'utf8'));
  if (Array.isArray(cacheData)) {
    cacheData.forEach(c => {
      c.icon = getCourseIcon(c);
    });
    fs.writeFileSync('api/cache_courses.json', JSON.stringify(cacheData, null, 2), 'utf8');
    console.log('✅ api/cache_courses.json atualizado com ícones (' + cacheData.length + ' cursos).');
  }
}

// 2. Atualizar api/seed_courses.json
if (fs.existsSync('api/seed_courses.json')) {
  const seedData = JSON.parse(fs.readFileSync('api/seed_courses.json', 'utf8'));
  if (Array.isArray(seedData)) {
    seedData.forEach(c => {
      c.icon = getCourseIcon(c);
    });
    fs.writeFileSync('api/seed_courses.json', JSON.stringify(seedData, null, 2), 'utf8');
    console.log('✅ api/seed_courses.json atualizado com ícones (' + seedData.length + ' cursos).');
  }
}

// 3. Atualizar src/data/courses.js
const coursesJsPath = 'src/data/courses.js';
const jsContent = fs.readFileSync(coursesJsPath, 'utf8');

const sandbox = {};
new Function('sandbox', jsContent + '\nsandbox.courses = localCourses;')(sandbox);
const localCourses = sandbox.courses;

localCourses.forEach(c => {
  c.icon = getCourseIcon(c);
});

// Preservar a estrutura do arquivo src/data/courses.js
const headerComment = `// Catálogo Oficial de Cursos — Você Pode Tudo\n// Atualizado com ícones simples e temáticos em ${new Date().toISOString()}\nconst localCourses = ${JSON.stringify(localCourses, null, 2)};\n\n`;

// Obter o restante do arquivo (window.PORTAL_DATA, etc.)
const restIndex = jsContent.indexOf('// Objeto Mestre Global exposto');
let restOfFile = '';
if (restIndex !== -1) {
  restOfFile = jsContent.slice(restIndex);
} else {
  // Encontrar onde termina localCourses
  const endCourses = jsContent.indexOf('];\n');
  if (endCourses !== -1) {
    restOfFile = jsContent.slice(endCourses + 3);
  }
}

const updatedCoursesJs = headerComment + restOfFile;
fs.writeFileSync(coursesJsPath, updatedCoursesJs, 'utf8');
console.log('✅ src/data/courses.js atualizado com ícones (' + localCourses.length + ' cursos).');
