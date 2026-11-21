const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

// 1. Dicionário de correções ortográficas e de acentuação para textos em pt-BR
const DICTIONARY = [
  // Palavras sem acento que devem ser acentuadas
  { search: /\bvoce\b/gi, replace: 'você' },
  { search: /\bcurriculo\b/gi, replace: 'currículo' },
  { search: /\bcurriculos\b/gi, replace: 'currículos' },
  { search: /\bqualificacao\b/gi, replace: 'qualificação' },
  { search: /\bqualificacoes\b/gi, replace: 'qualificações' },
  { search: /\bprofissionalizacao\b/gi, replace: 'profissionalização' },
  { search: /\beducacao\b/gi, replace: 'educação' },
  { search: /\bpreparacao\b/gi, replace: 'preparação' },
  { search: /\bcomunicacao\b/gi, replace: 'comunicação' },
  { search: /\bprogramacao\b/gi, replace: 'programação' },
  { search: /\bformacao\b/gi, replace: 'formação' },
  { search: /\bformacoes\b/gi, replace: 'formações' },
  { search: /\bvalidacao\b/gi, replace: 'validação' },
  { search: /\bformalizacao\b/gi, replace: 'formalização' },
  { search: /\bredacao\b/gi, replace: 'redação' },
  { search: /\bapresentacao\b/gi, replace: 'apresentação' },
  { search: /\bapresentacoes\b/gi, replace: 'apresentações' },
  { search: /\bcomputacao\b/gi, replace: 'computação' },
  { search: /\bduracao\b/gi, replace: 'duração' },
  { search: /\binscricao\b/gi, replace: 'inscrição' },
  { search: /\binscricoes\b/gi, replace: 'inscrições' },
  { search: /\bfundacao\b/gi, replace: 'fundação' },
  { search: /\borganizacao\b/gi, replace: 'organização' },
  { search: /\borganizacoes\b/gi, replace: 'organizações' },
  { search: /\bvocacao\b/gi, replace: 'vocação' },
  { search: /\befetivacao\b/gi, replace: 'efetivação' },
  { search: /\bindicacao\b/gi, replace: 'indicação' },
  { search: /\bindicacoes\b/gi, replace: 'indicações' },
  { search: /\binformacao\b/gi, replace: 'informação' },
  { search: /\binformacoes\b/gi, replace: 'informações' },
  { search: /\bprocrastinacao\b/gi, replace: 'procrastinação' },
  { search: /\btransicao\b/gi, replace: 'transição' },
  { search: /\bselecao\b/gi, replace: 'seleção' },
  { search: /\borientacao\b/gi, replace: 'orientação' },
  { search: /\bDescricao\b/g, replace: 'Descrição' },
  { search: /\bdescricao\b/g, replace: 'descrição' },
  { search: /\btecnico\b/gi, replace: 'técnico' },
  { search: /\btecnicos\b/gi, replace: 'técnicos' },
  { search: /\btecnica\b/gi, replace: 'técnica' },
  { search: /\btecnicas\b/gi, replace: 'técnicas' }
];

// 2. Arquivos HTML para processar
const htmlFiles = fs.readdirSync(projectRoot).filter(f => f.endsWith('.html'));

let totalHtmlChanges = 0;
htmlFiles.forEach(file => {
  const filePath = path.join(projectRoot, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Substituir nos meta keywords e description
  content = content.replace(/(<meta\s+name="(?:keywords|description)"\s+content=")(.*?)(")/gis, (m, p1, p2, p3) => {
    let fixed = p2;
    DICTIONARY.forEach(d => {
      fixed = fixed.replace(d.search, (match) => {
        // Preservar maiúscula se original era maiúscula
        if (match[0] === match[0].toUpperCase()) {
          return d.replace[0].toUpperCase() + d.replace.slice(1);
        }
        return d.replace;
      });
    });
    return p1 + fixed + p3;
  });

  // Substituir em textos visíveis entre tags (>texto<)
  content = content.replace(/>([^<]+)</g, (m, text) => {
    // Não mexer em scripts inline ou tags de estilo
    if (!text.trim()) return m;
    let fixedText = text;
    DICTIONARY.forEach(d => {
      fixedText = fixedText.replace(d.search, (match) => {
        if (match[0] === match[0].toUpperCase()) {
          return d.replace[0].toUpperCase() + d.replace.slice(1);
        }
        return d.replace;
      });
    });
    return '>' + fixedText + '<';
  });

  // Substituir em atributos title e placeholder
  content = content.replace(/((?:title|placeholder|aria-label)=")(.*?)(")/gis, (m, p1, p2, p3) => {
    let fixed = p2;
    DICTIONARY.forEach(d => {
      fixed = fixed.replace(d.search, (match) => {
        if (match[0] === match[0].toUpperCase()) {
          return d.replace[0].toUpperCase() + d.replace.slice(1);
        }
        return d.replace;
      });
    });
    return p1 + fixed + p3;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalHtmlChanges++;
    console.log(`✅ ${file}: ortografia e acentuação corrigidas.`);
  }
});

// 3. Processar src/data/courses.js (tags e descrições)
const coursesJsPath = path.join(projectRoot, 'src', 'data', 'courses.js');
if (fs.existsSync(coursesJsPath)) {
  let content = fs.readFileSync(coursesJsPath, 'utf8');
  let original = content;

  // Substituir em strings literais de tags: 'palavra'
  DICTIONARY.forEach(d => {
    // Regex para pegar string entre aspas simples ou duplas
    content = content.replace(/(['"])(.*?)(['"])/g, (m, q1, val, q2) => {
      // Ignorar chaves técnicas, IDs ou URLs
      if (val.startsWith('http') || val.startsWith('/') || val.includes('.png') || val.includes('.jpg') || val.includes('_id')) {
        return m;
      }
      let fixed = val.replace(d.search, (match) => {
        if (match[0] === match[0].toUpperCase()) {
          return d.replace[0].toUpperCase() + d.replace.slice(1);
        }
        return d.replace;
      });
      return q1 + fixed + q2;
    });
  });

  if (content !== original) {
    fs.writeFileSync(coursesJsPath, content, 'utf8');
    console.log('✅ src/data/courses.js: tags e descrições acentuadas corretamente.');
  }
}

// 4. Processar api/seed_jobs.json e api/cache_jobs.json
['seed_jobs.json', 'cache_jobs.json'].forEach(jFile => {
  const jPath = path.join(projectRoot, 'api', jFile);
  if (fs.existsSync(jPath)) {
    let content = fs.readFileSync(jPath, 'utf8');
    let original = content;

    // Apenas substituir em campos de texto: "title", "description", "requirements", "area"
    DICTIONARY.forEach(d => {
      content = content.replace(/("(?:title|description|requirements|benefits)":\s*")(.*?)(")/gis, (m, p1, p2, p3) => {
        let fixed = p2.replace(d.search, (match) => {
          if (match[0] === match[0].toUpperCase()) {
            return d.replace[0].toUpperCase() + d.replace.slice(1);
          }
          return d.replace;
        });
        return p1 + fixed + p3;
      });
    });

    if (content !== original) {
      fs.writeFileSync(jPath, content, 'utf8');
      console.log(`✅ api/${jFile}: descrições de vagas acentuadas com sucesso.`);
    }
  }
});

// 5. Processar api/seed_blog.json e api/cache_blog.json
['seed_blog.json', 'cache_blog.json'].forEach(bFile => {
  const bPath = path.join(projectRoot, 'api', bFile);
  if (fs.existsSync(bPath)) {
    let content = fs.readFileSync(bPath, 'utf8');
    let original = content;

    DICTIONARY.forEach(d => {
      content = content.replace(/("(?:title|excerpt|content|meta_description)":\s*")(.*?)(")/gis, (m, p1, p2, p3) => {
        let fixed = p2.replace(d.search, (match) => {
          if (match[0] === match[0].toUpperCase()) {
            return d.replace[0].toUpperCase() + d.replace.slice(1);
          }
          return d.replace;
        });
        return p1 + fixed + p3;
      });
    });

    if (content !== original) {
      fs.writeFileSync(bPath, content, 'utf8');
      console.log(`✅ api/${bFile}: artigos do blog revisados e acentuados.`);
    }
  }
});

console.log('=== AUDITORIA E CORREÇÃO ORTOGRÁFICA COMPLETA FINALIZADA ===');
