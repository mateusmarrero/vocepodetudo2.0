/**
 * fix_blog_encoding_pass2.js
 * Segunda passagem de correções adicionais não cobertas pela primeira.
 * USO: node scripts/fix_blog_encoding_pass2.js
 */

const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..');

// Correções adicionais (segunda passagem)
const EXTRA_CORRECTIONS = [
  // estão (not "esto" which is a valid Spanish word but not Portuguese)
  [/\besto\b/g, 'estão'],
  
  // lógicas (missed because pattern starts with capital)
  [/\blgicas\b/gi, 'lógicas'],
  
  // sequência
  [/\bsequncia\b/gi, 'sequência'],
  
  // instruções
  [/\binstrues\b/gi, 'instruções'],
  
  // máquina(s)
  [/\bmquina\b/gi, 'máquina'],
  [/\bmquinas\b/gi, 'máquinas'],
  
  // senão (seno can also be math term - but in context it's "senão")
  // Actually "seno" = sine in math, so this is risky. Skip for now.
  // [/\bseno\b/g, 'senão'],
  
  // condições
  [/\bcondies\b/gi, 'condições'],
  
  // execução
  [/\bexecuo\b/gi, 'execução'],
  
  // raciocínio
  [/\bracicnio\b/gi, 'raciocínio'],
  [/\braciocnio\b/gi, 'raciocínio'],
  
  // variáveis (variveis)
  [/\bvariveis\b/gi, 'variáveis'],
  [/\bvarivel\b/gi, 'variável'],
  
  // "é" como verbo de ligação perdido (padrão: "palavra  palavra" -> "é")
  // Pattern: space-space-article/adj/noun at start (too risky to automate broadly)
  // Target only very specific cases
  [/ nada mais  do que /g, ' nada mais é do que '],
  [/ é o primeiro/g, ' é o primeiro'],  // already correct
  [/ esto se movendo/g, ' estão se movendo'],  // catch with the estão fix
  
  // fluência
  [/\bfluncincia\b/gi, 'fluência'],
  [/\bfluncia\b/gi, 'fluência'],
  
  // dominando / domínio
  [/\bdminio\b/gi, 'domínio'],
  [/\bdominão\b/gi, 'dominam'],
  
  // população
  [/\bpopulao\b/gi, 'população'],
  
  // condições (additional patterns)
  [/\bcondies\b/gi, 'condições'],
  
  // instruções (additional)
  [/\binstrues\b/gi, 'instruções'],
  
  // algoritmos - correct
  
  // posições
  [/\bposies\b/gi, 'posições'],
  
  // anotações  
  [/\bnotaes\b/gi, 'notações'],
  [/\banotaes\b/gi, 'anotações'],
  
  // proteção
  [/\bproteo\b/gi, 'proteção'],
  
  // navegação  
  [/\bnavegao\b/gi, 'navegação'],
  
  // programação (more forms)
  [/\bprogramao\b/gi, 'programação'],
  
  // introdução
  [/\bintroduo\b/gi, 'introdução'],
  
  // aplicações
  [/\baplicaes\b/gi, 'aplicações'],
  [/\baplicao\b/gi, 'aplicação'],
  
  // integração
  [/\bintegrao\b/gi, 'integração'],
  
  // importação
  [/\bimportao\b/gi, 'importação'],
  
  // exportação
  [/\bexportao\b/gi, 'exportação'],
  
  // automação
  [/\bautomao\b/gi, 'automação'],
  
  // automações
  [/\bautomaes\b/gi, 'automações'],
  
  // construção
  [/\bconstruo\b/gi, 'construção'],
  
  // instrução
  [/\binstrao\b/gi, 'instrução'],
  
  // "não" written as "no" in certain patterns (risky but specific)
  // Skip - too many false positives
  
  // conexões (already covered)
  
  // gerações
  [/\bgeraes\b/gi, 'gerações'],
  [/\bgerao\b/gi, 'geração'],
  
  // ocupações
  [/\bocupaes\b/gi, 'ocupações'],
  
  // relações
  [/\brelaes\b/gi, 'relações'],
  [/\brelao\b/gi, 'relação'],
  
  // correções
  [/\bcorreo\b/gi, 'correção'],
  [/\bcorretes\b/gi, 'correções'],
  
  // obrigação
  [/\bobrigao\b/gi, 'obrigação'],
  
  // participação
  [/\bparticipao\b/gi, 'participação'],
  
  // situações
  [/\bsituaes\b/gi, 'situações'],
  
  // variações
  [/\bvariaes\b/gi, 'variações'],
  [/\bvariao\b/gi, 'variação'],
  
  // permissão
  [/\bpermisso\b/gi, 'permissão'],
  
  // missão
  [/\bmisso\b/gi, 'missão'],
  
  // emissão  
  [/\bemisso\b/gi, 'emissão'],
  
  // colisão
  [/\bcoliso\b/gi, 'colisão'],
  
  // precisão
  [/\bpreciso\b(?!\s+de)\b/g, null], // skip - "preciso" can be adjective (precise) or verb (I need)
  
  // atualizações
  [/\batualizaes\b/gi, 'atualizações'],
  
  // competições
  [/\bcompetaes\b/gi, 'competições'],
  
  // proporções
  [/\bproportions\b/gi, 'proporções'],
  
  // funcionalidades (correct)
  
  // algoritmo (correct)
  
  // computação já coberta
  
  // cálculo já coberto
  
  // especificações
  [/\bespecificaes\b/gi, 'especificações'],
  [/\bespecificao\b/gi, 'especificação'],
  
  // correção  
  [/\bcorreo\b/gi, 'correção'],
  
  // conexão já coberta
  
  // ação
  [/\bao de\b/g, null],  // too risky (could be "ação de" or "ao de")
  
  // prevenção
  [/\bpreveno\b/gi, 'prevenção'],
  
  // assimilação
  [/\bassimilao\b/gi, 'assimilação'],
  
  // fixação
  [/\bfixao\b/gi, 'fixação'],
  
  // consolidação
  [/\bconsolidao\b/gi, 'consolidação'],
  
  // aspiração
  [/\baspirao\b/gi, 'aspiração'],
  
  // aceleração
  [/\bacelerao\b/gi, 'aceleração'],
  
  // separação
  [/\bseparao\b/gi, 'separação'],
  
  // declaração
  [/\bdeclarao\b/gi, 'declaração'],
  
  // demonstração
  [/\bdemonstrao\b/gi, 'demonstração'],
  
  // exportações
  [/\bexportaes\b/gi, 'exportações'],
  
  // "é" verb with specific surrounding context
  [/\b(nada mais|mais)  (do que|que)\b/g, (_, pre, post) => `${pre} é ${post}`],
  
  // Words with ã without til
  [/\bquantos\b/gi, null],  // already correct
  [/\banto\b/g, null],  // could be "ânto" or other
  
  // Catch remaining -ão words
  [/\bconclusao\b/gi, 'conclusão'],
  [/\bformao\b/gi, 'formação'],
  [/\bdeclarao\b/gi, 'declaração'],
  
  // Correções específicas de frases no blog
  // " o primeiro" preceded by space-space (indicates missing "é")
  // Pattern: "X  o" -> "X é o" but only in prose, not in HTML
  
  // "mçoes" and similar
  [/\bcomemoraes\b/gi, 'comemorações'],
  
  // "não" written as "no" only in very specific patterns
  [/\bpara no perder\b/gi, 'para não perder'],
  [/\bpara no conseguir\b/gi, 'para não conseguir'],
  [/\bpara no ter\b/gi, 'para não ter'],
  
  // Verbo "é" perdido em padrões específicos
  [/\b  o portal\b/g, ' é o portal'],
  [/\b  pioneira\b/g, ' é pioneira'],
  [/\b  o maior\b/g, ' é o maior'],
  [/\b  a maior\b/g, ' é a maior'],
  [/\b  o melhor\b/g, ' é o melhor'],
  [/\b  a melhor\b/g, ' é a melhor'],
  [/\bnada mais  do que\b/g, 'nada mais é do que'],
  [/\b  o primeiro passo\b/g, ' é o primeiro passo'],
  [/\b  amplamente\b/g, ' é amplamente'],
];

// Filter out null replacements
const ACTIVE = EXTRA_CORRECTIONS.filter(([, rep]) => rep !== null);

function applyFixes(content) {
  let result = content;
  for (const [pattern, replacement] of ACTIVE) {
    if (typeof replacement === 'function') {
      result = result.replace(pattern, replacement);
    } else {
      result = result.replace(pattern, replacement);
    }
  }
  return result;
}

// Process seed_blog.json
const blogPath = path.join(BASE, 'api/seed_blog.json');
const blogOriginal = fs.readFileSync(blogPath, 'utf8');
const blogFixed = applyFixes(blogOriginal);

try {
  JSON.parse(blogFixed);
} catch (e) {
  console.error('❌ JSON inválido! Não aplicando correções.');
  console.error(e.message);
  process.exit(1);
}

if (blogFixed !== blogOriginal) {
  fs.writeFileSync(blogPath, blogFixed, 'utf8');
  console.log('✅ seed_blog.json: segunda passagem aplicada');
} else {
  console.log('ℹ seed_blog.json: sem alterações adicionais');
}

// Process seed_jobs.json  
const jobsPath = path.join(BASE, 'api/seed_jobs.json');
const jobsOriginal = fs.readFileSync(jobsPath, 'utf8');
let jobsData = JSON.parse(jobsOriginal);
const TEXT_FIELDS = ['title', 'description', 'requirements', 'benefits', 'salary', 'deadline', 'city'];

let changes = 0;
for (const job of jobsData) {
  for (const field of TEXT_FIELDS) {
    if (job[field]) {
      const fixed = applyFixes(job[field]);
      if (fixed !== job[field]) {
        job[field] = fixed;
        changes++;
      }
    }
  }
}

if (changes > 0) {
  fs.writeFileSync(jobsPath, JSON.stringify(jobsData, null, 2), 'utf8');
  console.log(`✅ seed_jobs.json: ${changes} campos (segunda passagem)`);
} else {
  console.log('ℹ seed_jobs.json: sem alterações adicionais');
}

// Apply to courses.js
const coursesPath = path.join(BASE, 'src/data/courses.js');
const coursesOriginal = fs.readFileSync(coursesPath, 'utf8');
const coursesFixed = applyFixes(coursesOriginal);
if (coursesFixed !== coursesOriginal) {
  fs.writeFileSync(coursesPath, coursesFixed, 'utf8');
  console.log('✅ src/data/courses.js: segunda passagem aplicada');
} else {
  console.log('ℹ src/data/courses.js: sem alterações adicionais');
}

console.log('\n=== SEGUNDA PASSAGEM CONCLUÍDA ===');
