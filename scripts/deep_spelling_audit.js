const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

// Lista abrangente de palavras e termos com correções ortográficas em pt-BR
const DICTIONARY = {
  // -cao / -coes
  'educacao': 'educação',
  'educacoes': 'educações',
  'comunicacao': 'comunicação',
  'comunicacoes': 'comunicações',
  'programacao': 'programação',
  'programacoes': 'programações',
  'informacao': 'informação',
  'informacoes': 'informações',
  'formacao': 'formação',
  'formacoes': 'formações',
  'capacitacao': 'capacitação',
  'capacitacoes': 'capacitações',
  'qualificacao': 'qualificação',
  'qualificacoes': 'qualificações',
  'profissionalizacao': 'profissionalização',
  'administracao': 'administração',
  'administracoes': 'administrações',
  'organizacao': 'organização',
  'organizacoes': 'organizações',
  'inscricao': 'inscrição',
  'inscricoes': 'inscrições',
  'producao': 'produção',
  'producoes': 'produções',
  'criacao': 'criação',
  'criacoes': 'criações',
  'avaliacao': 'avaliação',
  'avaliacoes': 'avaliações',
  'publicacao': 'publicação',
  'publicacoes': 'publicações',
  'atualizacao': 'atualização',
  'atualizacoes': 'atualizações',
  'apresentacao': 'apresentação',
  'apresentacoes': 'apresentações',
  'duracao': 'duração',
  'duracoes': 'durações',
  'introducao': 'introdução',
  'introducoes': 'introduções',
  'conclusao': 'conclusão',
  'conclusoes': 'conclusões',
  'situacao': 'situação',
  'situacoes': 'situações',
  'atencao': 'atenção',
  'gestao': 'gestão',
  'gestoes': 'gestões',
  'operacao': 'operação',
  'operacoes': 'operações',
  'funcao': 'função',
  'funcoes': 'funções',
  'opcao': 'opção',
  'opcoes': 'opções',
  'solucao': 'solução',
  'solucoes': 'soluções',
  'orientacao': 'orientação',
  'orientacoes': 'orientações',
  'computacao': 'computação',
  'redacao': 'redação',
  'redacoes': 'redações',
  'validacao': 'validação',
  'validacoes': 'validações',
  'formalizacao': 'formalização',
  'fundacao': 'fundação',
  'vocacao': 'vocação',
  'efetivacao': 'efetivação',
  'indicacao': 'indicação',
  'indicacoes': 'indicações',
  'procrastinacao': 'procrastinação',
  'transicao': 'transição',
  'transicoes': 'transições',
  'selecao': 'seleção',
  'selecoes': 'seleções',
  'descricao': 'descrição',
  'descricoes': 'descrições',
  'simplificacao': 'simplificação',
  'automacao': 'automação',
  'certificacao': 'certificação',
  'certificacoes': 'certificações',
  'remuneracao': 'remuneração',
  'contratacao': 'contratação',
  'contratacoes': 'contratações',
  'localizacao': 'localização',
  'localizacoes': 'localizações',
  'solicitacao': 'solicitação',
  'solicitacoes': 'solicitações',
  'visualizacao': 'visualização',
  'visualizacoes': 'visualizações',
  'interacao': 'interação',
  'interacoes': 'interações',
  'inovacao': 'inovação',
  'inovacoes': 'inovações',
  'integracao': 'integração',
  'integracoes': 'integrações',
  'evolucao': 'evolução',
  'evolucoes': 'evoluções',
  'atuacao': 'atuação',
  'atuacoes': 'atuações',
  'gratificacao': 'gratificação',
  'participacao': 'participação',
  'recuperacao': 'recuperação',
  'preservacao': 'preservação',
  'seguranca': 'segurança',
  'segurancas': 'seguranças',
  'lideranca': 'liderança',
  'liderancas': 'lideranças',
  'diferenca': 'diferença',
  'diferencas': 'diferenças',
  'avancado': 'avançado',
  'avancada': 'avançada',
  'avancados': 'avançados',
  'avancadas': 'avançadas',
  'avancar': 'avançar',
  'comecar': 'começar',
  'recomecar': 'recomeçar',

  // Acentos agudos e circunflexos essenciais
  'voce': 'você',
  'voces': 'vocês',
  'curriculo': 'currículo',
  'curriculos': 'currículos',
  'conteudo': 'conteúdo',
  'conteudos': 'conteúdos',
  'modulo': 'módulo',
  'modulos': 'módulos',
  'periodo': 'período',
  'periodos': 'períodos',
  'numero': 'número',
  'numeros': 'números',
  'duvida': 'dúvida',
  'duvidas': 'dúvidas',
  'facil': 'fácil',
  'faceis': 'fáceis',
  'dificil': 'difícil',
  'dificeis': 'difíceis',
  'util': 'útil',
  'uteis': 'úteis',
  'pagina': 'página',
  'paginas': 'páginas',
  'tecnico': 'técnico',
  'tecnicos': 'técnicos',
  'tecnica': 'técnica',
  'tecnicas': 'técnicas',
  'matricula': 'matrícula',
  'matriculas': 'matrículas',
  'historico': 'histórico',
  'historicos': 'históricos',
  'historica': 'histórica',
  'historicas': 'históricas',
  'especifico': 'específico',
  'especificos': 'específicos',
  'especifica': 'específica',
  'especificas': 'específicas',
  'exercicio': 'exercício',
  'exercicios': 'exercícios',
  'genero': 'gênero',
  'generos': 'gêneros',
  'critico': 'crítico',
  'criticos': 'críticos',
  'critica': 'crítica',
  'criticas': 'críticas',
  'identico': 'idêntico',
  'identicos': 'idênticos',
  'especie': 'espécie',
  'especies': 'espécies',
  'indice': 'índice',
  'indices': 'índices',
  'inicio': 'início',
  'inicios': 'inícios',
  'publico': 'público',
  'publicos': 'públicos',
  'publica': 'pública',
  'publicas': 'públicas',
  'pratico': 'prático',
  'praticos': 'práticos',
  'pratica': 'prática',
  'praticas': 'práticas',
  'anuncio': 'anúncio',
  'anuncios': 'anúncios',
  'usuario': 'usuário',
  'usuarios': 'usuários',
  'usuaria': 'usuária',
  'usuarias': 'usuárias',
  'relatorio': 'relatório',
  'relatorios': 'relatórios',
  'horario': 'horário',
  'horarios': 'horários',
  'salario': 'salário',
  'salarios': 'salários',
  'beneficio': 'benefício',
  'beneficios': 'benefícios',
  'experiencia': 'experiência',
  'experiencias': 'experiências',
  'frequencia': 'frequência',
  'referencia': 'referência',
  'referencias': 'referências',
  'agencia': 'agência',
  'agencias': 'agências',
  'urgencia': 'urgência',
  'ciencia': 'ciência',
  'ciencias': 'ciências',
  'inteligencia': 'inteligência',
  'negocio': 'negócio',
  'negocios': 'negócios',
  'proprio': 'próprio',
  'proprios': 'próprios',
  'propria': 'própria',
  'proprias': 'próprias',
  'necessario': 'necessário',
  'necessarios': 'necessários',
  'necessaria': 'necessária',
  'necessarias': 'necessárias',
  'comentario': 'comentário',
  'comentarios': 'comentários',
  'termino': 'término',
  'proximo': 'próximo',
  'proximos': 'próximos',
  'proxima': 'próxima',
  'proximas': 'próximas',
  'area': 'área',
  'areas': 'áreas',
  'nivel': 'nível',
  'niveis': 'níveis',
  'disponivel': 'disponível',
  'disponiveis': 'disponíveis',
  'responsavel': 'responsável',
  'responsaveis': 'responsáveis',
  'sustentavel': 'sustentável',
  'acessivel': 'acessível',
  'acessiveis': 'acessíveis',
  'automatico': 'automático',
  'automatica': 'automática',
  'automaticos': 'automáticos',
  'automaticas': 'automáticas',
  'eletronico': 'eletrônico',
  'eletronica': 'eletrônica',
  'eletronicos': 'eletrônicos',
  'eletronicas': 'eletrônicas',
  'basico': 'básico',
  'basica': 'básica',
  'basicos': 'básicos',
  'basicas': 'básicas',
  'dinamico': 'dinâmico',
  'dinamica': 'dinâmica',
  'dinamicos': 'dinâmicos',
  'dinamicas': 'dinâmicas',
  'academico': 'acadêmico',
  'academica': 'acadêmica',
  'grafico': 'gráfico',
  'graficos': 'gráficos',
  'grafica': 'gráfica',
  'graficas': 'gráficas',
  'economico': 'econômico',
  'economica': 'econômica',
  'economicos': 'econômicos',
  'logistica': 'logística',
  'logistico': 'logístico',
  'pedagogico': 'pedagógico',
  'pedagogica': 'pedagógica',
  'estatistica': 'estatística',
  'estatistico': 'estatístico',
  'politica': 'política',
  'politico': 'político',
  'politicas': 'políticas',
  'politicos': 'políticos',
  'juridico': 'jurídico',
  'juridica': 'jurídica',
  'previdenciario': 'previdenciário',
  'previdenciaria': 'previdenciária',
  'bancario': 'bancário',
  'bancaria': 'bancária',
  'universitario': 'universitário',
  'universitaria': 'universitária',
  'tributario': 'tributário',
  'tributaria': 'tributária',
  'diario': 'diário',
  'diaria': 'diária',
  'diarios': 'diários',
  'diarias': 'diárias',
  'obrigatorio': 'obrigatório',
  'obrigatoria': 'obrigatória',
  'obrigatorios': 'obrigatórios',
  'obrigatorias': 'obrigatórias',
  'sanitario': 'sanitário',
  'sanitaria': 'sanitária',
  'voluntario': 'voluntário',
  'voluntaria': 'voluntária',
  'extraordinario': 'extraordinário',
  'intermediario': 'intermediário',
  'intermediaria': 'intermediária',
  'comunitario': 'comunitário',
  'comunitaria': 'comunitária',
  'prioritario': 'prioritário',
  'prioritaria': 'prioritária',
  'imobiliario': 'imobiliário',
  'imobiliaria': 'imobiliária',
  'saude': 'saúde',
  'ate': 'até',
  'tambem': 'também',
  'alem': 'além',
  'porem': 'porém',
  'atraves': 'através',
  'apos': 'após',
  'atras': 'atrás',
  'parabens': 'parabéns',
  'estao': 'estão',
  'serao': 'serão',
  'farao': 'farão',
  'contem': 'contém',
  'mantem': 'mantém',
  'obtem': 'obtém',
  'padrao': 'padrão',
  'padroes': 'padrões',
  'visao': 'visão',
  'visoes': 'visões',
  'versao': 'versão',
  'versoes': 'versões',
  'conexao': 'conexão',
  'conexoes': 'conexões',
  'licao': 'lição',
  'licoes': 'lições',

  // Typos frequentes e correções
  'gratúito': 'gratuito',
  'gratúitos': 'gratuitos',
  'gratúita': 'gratuita',
  'gratúitas': 'gratuitas',
  'ítem': 'item',
  'ítens': 'itens'
};

// Constrói regex para busca rápida de palavras inteiras isoladas
const words = Object.keys(DICTIONARY);
// Ordena por tamanho decrescente para casar palavras maiores primeiro
words.sort((a, b) => b.length - a.length);

const REGEX_MAP = words.map(w => {
  return {
    word: w,
    regex: new RegExp(`\\b${w}\\b`, 'gi'),
    replacement: DICTIONARY[w]
  };
});

function fixText(text) {
  if (!text || typeof text !== 'string') return text;
  let res = text;
  for (const item of REGEX_MAP) {
    res = res.replace(item.regex, (match) => {
      // Manter maiúsculas se aplicável
      if (match === match.toUpperCase() && match.length > 1) {
        return item.replacement.toUpperCase();
      }
      if (match[0] === match[0].toUpperCase()) {
        return item.replacement[0].toUpperCase() + item.replacement.slice(1);
      }
      return item.replacement;
    });
  }
  return res;
}

function auditText(text, filePath, contextName) {
  const issues = [];
  for (const item of REGEX_MAP) {
    let match;
    const rx = new RegExp(item.regex.source, 'gi');
    while ((match = rx.exec(text)) !== null) {
      // Pegar trecho ao redor
      const start = Math.max(0, match.index - 30);
      const end = Math.min(text.length, match.index + match[0].length + 30);
      const snippet = text.substring(start, end).replace(/\s+/g, ' ');
      issues.push({
        file: filePath,
        context: contextName,
        found: match[0],
        suggested: item.replacement,
        snippet: `...${snippet}...`
      });
    }
  }
  return issues;
}

// 1. Auditar HTMLs
const htmlFiles = fs.readdirSync(projectRoot).filter(f => f.endsWith('.html'));
let allIssues = [];

htmlFiles.forEach(file => {
  const p = path.join(projectRoot, file);
  const content = fs.readFileSync(p, 'utf8');

  // Ignorar script e style
  let stripped = content
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

  // Auditar textos visíveis entre tags
  const textMatches = stripped.match(/>([^<]+)</g) || [];
  textMatches.forEach(tm => {
    const text = tm.substring(1, tm.length - 1).trim();
    if (text.length > 1 && !text.startsWith('http') && !text.startsWith('data:')) {
      const found = auditText(text, file, 'HTML text node');
      allIssues = allIssues.concat(found);
    }
  });

  // Auditar atributos de conteúdo de texto
  const metaMatches = content.match(/<meta[^>]+(?:description|keywords|title)[^>]+content=["']([^"']+)["']/gi) || [];
  metaMatches.forEach(mm => {
    const cMatch = mm.match(/content=["']([^"']+)["']/i);
    if (cMatch && cMatch[1]) {
      const found = auditText(cMatch[1], file, 'meta content');
      allIssues = allIssues.concat(found);
    }
  });

  const placeholders = content.match(/placeholder=["']([^"']+)["']/gi) || [];
  placeholders.forEach(pm => {
    const val = pm.replace(/placeholder=["']/i, '').slice(0, -1);
    const found = auditText(val, file, 'placeholder');
    allIssues = allIssues.concat(found);
  });
});

// 2. Auditar src/data/courses.js
const coursesPath = path.join(projectRoot, 'src', 'data', 'courses.js');
if (fs.existsSync(coursesPath)) {
  const code = fs.readFileSync(coursesPath, 'utf8');
  // Extrair apenas campos title, categoryName, description, certificateNote, level, tags
  const fieldRegex = /"(title|categoryName|description|certificateNote|level)":\s*"([^"]+)"/g;
  let match;
  while ((match = fieldRegex.exec(code)) !== null) {
    const field = match[1];
    const val = match[2];
    const found = auditText(val, 'src/data/courses.js', `field: ${field}`);
    allIssues = allIssues.concat(found);
  }
}

// 3. Auditar JSONs
const jsonFiles = [
  'api/seed_blog.json',
  'api/cache_blog.json',
  'api/seed_jobs.json',
  'api/cache_jobs.json',
  'api/seed_courses.json',
  'api/cache_courses.json'
];

jsonFiles.forEach(relPath => {
  const p = path.join(projectRoot, relPath);
  if (!fs.existsSync(p)) return;
  try {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    const items = Array.isArray(data) ? data : (data.items || data.posts || data.jobs || data.courses || []);
    items.forEach((item, idx) => {
      ['title', 'description', 'excerpt', 'content', 'requirements', 'benefits', 'meta_description'].forEach(field => {
        if (item[field] && typeof item[field] === 'string') {
          const found = auditText(item[field], relPath, `item[${idx}].${field}`);
          allIssues = allIssues.concat(found);
        }
      });
    });
  } catch (err) {
    console.error(`Erro ao analisar ${relPath}: ${err.message}`);
  }
});

console.log(`\n=== RESULTADO DA AUDITORIA DE ERROS E ACENTUAÇÃO ===`);
console.log(`Total de ocorrências encontradas: ${allIssues.length}`);

// Agrupar por arquivo
const byFile = {};
allIssues.forEach(iss => {
  byFile[iss.file] = byFile[iss.file] || [];
  byFile[iss.file].push(iss);
});

Object.keys(byFile).forEach(f => {
  console.log(`\n📄 ${f} (${byFile[f].length} problemas):`);
  byFile[f].slice(0, 10).forEach(iss => {
    console.log(`  - [${iss.context}] "${iss.found}" -> "${iss.suggested}" | Snippet: ${iss.snippet}`);
  });
  if (byFile[f].length > 10) {
    console.log(`  ... e mais ${byFile[f].length - 10} ocorrências.`);
  }
});

// Salvar relatório detalhado
fs.writeFileSync(path.join(__dirname, 'deep_spelling_findings.json'), JSON.stringify(allIssues, null, 2), 'utf8');
console.log(`\nRelatório salvo em scripts/deep_spelling_findings.json`);
