/**
 * audit_spelling.js
 * Audita arquivos HTML e JS em busca de erros ortográficos e de acentuação comuns em pt-BR.
 * USO: node scripts/audit_spelling.js
 */

const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..');

// Arquivos a auditar
const HTML_FILES = [
  'index.html', 'curriculo.html', 'vagas.html', 'blog.html',
  'calculadora-trabalhista.html', 'downloads.html', 'sobre.html',
  'contato.html', 'politica-privacidade.html', 'termos-de-uso.html',
  'teste-vocacional.html', '404.html', 'vagas-jovem-aprendiz-2026.html',
  'cursos-gratis-administracao.html', 'cursos-gratis-excel.html',
  'cursos-gratis-ia.html', 'cursos-gratis-informatica.html',
  'cursos-gratis-ingles.html', 'cursos-gratis-programacao.html',
  'simulador-entrevista.html', 'materiais-gratuitos.html',
];

const JS_DATA_FILES = [
  'src/data/courses.js',
];

const JSON_FILES = [
  'api/seed_blog.json',
  'api/seed_jobs.json',
];

// Pares [regex, correção, descrição]
// IMPORTANTE: essas regexes buscam apenas em conteúdo textual visível.
// A substituição deve ser feita com cuidado para não alterar atributos técnicos.
const CORRECTIONS = [
  // Crases
  [/\ba prazo\b/g, 'a prazo', null],  // placeholder
  [/\bà disposição\b/gi, 'à disposição', 'acento grave em crase "a disposição"'],
  
  // Erros comuns de acentuação
  [/\bvoce\b(?!')/gi, 'você', 'falta acento em "você"'],
  [/\bpode\b/g, null, null],  // skip - correto
  [/\bcurriculo\b/gi, 'currículo', 'falta acento em "currículo"'],
  [/\bpratico\b/gi, 'prático', 'falta acento em "prático"'],
  [/\bpratica\b/gi, 'prática', 'falta acento em "prática"'],
  [/\bgratuito\b/gi, null, null],  // correto
  [/\bcertificado\b/gi, null, null],  // correto
  [/\bprofissional\b/gi, null, null],  // correto
  [/\bopção\b/gi, null, null],  // correto
  [/\bconclusão\b/gi, null, null],  // correto
  [/\binscriçao\b/gi, 'inscrição', 'falta cedilha/acento em "inscrição"'],
  [/\bopçao\b/gi, 'opção', 'falta acento em "opção"'],
  [/\bseleçao\b/gi, 'seleção', 'falta acento em "seleção"'],
  [/\bformação\b/gi, null, null],  // correto
  [/\bformação\b/gi, null, null],  // correto
  [/\bgestão\b/gi, null, null],  // correto
  [/\bgratúito\b/gi, 'gratuito', '"gratúito" - não tem acento'],
  [/\bcontéudo\b/gi, 'conteúdo', 'falta acento em "conteúdo"'],
  [/\bconteudo\b/gi, 'conteúdo', 'falta acento em "conteúdo"'],
  [/\bítem\b/gi, 'item', '"ítem" não tem acento no plural'],
  [/\bàqueles\b/gi, null, null],  // correto
  [/\bàquela\b/gi, null, null],  // correto
  [/\bpara a\b/g, null, null],  // pode ser crase, verificar contexto
  [/\bconcurso publico\b/gi, 'concurso público', 'falta acento em "público"'],
  [/\bpublico\b(?! de)/gi, null, null],  // pode ser correto dependendo do contexto
  [/\bdificil\b/gi, 'difícil', 'falta acento em "difícil"'],
  [/\bfacil\b/gi, 'fácil', 'falta acento em "fácil"'],
  [/\buteis\b/gi, 'úteis', 'falta acento em "úteis"'],
  [/\butil\b/gi, 'útil', 'falta acento em "útil"'],
  [/\bduvida\b/gi, 'dúvida', 'falta acento em "dúvida"'],
  [/\bduvidas\b/gi, 'dúvidas', 'falta acento em "dúvidas"'],
  [/\bnumero\b/gi, 'número', 'falta acento em "número"'],
  [/\bnumeros\b/gi, 'números', 'falta acento em "números"'],
  [/\bperiodo\b/gi, 'período', 'falta acento em "período"'],
  [/\bperiodos\b/gi, 'períodos', 'falta acento em "períodos"'],
  [/\bindice\b/gi, 'índice', 'falta acento em "índice"'],
  [/\bindices\b/gi, 'índices', 'falta acento em "índices"'],
  [/\bmodulo\b/gi, 'módulo', 'falta acento em "módulo"'],
  [/\bmodulos\b/gi, 'módulos', 'falta acento em "módulos"'],
  [/\borigem\b/gi, null, null],  // correto
  [/\bpagina\b/gi, 'página', 'falta acento em "página"'],
  [/\bpaginas\b/gi, 'páginas', 'falta acento em "páginas"'],
  [/\btecnica\b/gi, 'técnica', 'falta acento em "técnica"'],
  [/\btecnicas\b/gi, 'técnicas', 'falta acento em "técnicas"'],
  [/\btecnico\b/gi, 'técnico', 'falta acento em "técnico"'],
  [/\btecnicos\b/gi, 'técnicos', 'falta acento em "técnicos"'],
  [/\banalfabeto\b/gi, null, null],
  [/\bmatricula\b/gi, 'matrícula', 'falta acento em "matrícula"'],
  [/\bmatriculas\b/gi, 'matrículas', 'falta acento em "matrículas"'],
  [/\bregistro\b/gi, null, null],
  [/\boriginal\b/gi, null, null],
  [/\bhistorico\b/gi, 'histórico', 'falta acento em "histórico"'],
  [/\bhistorica\b/gi, 'histórica', 'falta acento em "histórica"'],
  [/\bdados nao\b/gi, 'dados não', 'falta til em "não"'],
  [/\bnao \b/g, null, null],  // skip - verificar individualmente
  [/\bcritico\b/gi, 'crítico', 'falta acento em "crítico"'],
  [/\bidentico\b/gi, 'idêntico', 'falta acento em "idêntico"'],
  [/\bgenero\b/gi, 'gênero', 'falta acento em "gênero"'],
  [/\bgeneros\b/gi, 'gêneros', 'falta acento em "gêneros"'],
  [/\bexercicio\b/gi, 'exercício', 'falta acento em "exercício"'],
  [/\bexercicios\b/gi, 'exercícios', 'falta acento em "exercícios"'],
  [/\bimóvel\b/gi, null, null],
  [/\bespecie\b/gi, 'espécie', 'falta acento em "espécie"'],
  [/\bEspecifico\b/gi, 'específico', 'falta acento em "específico"'],
  [/\bespecifico\b/gi, 'específico', 'falta acento em "específico"'],
  [/\bEspecifica\b/gi, 'específica', 'falta acento em "específica"'],
  [/\bespecifica\b/gi, 'específica', 'falta acento em "específica"'],
];

// Padrões específicos de erros comuns em pt-BR que queremos detectar
const DETECT_PATTERNS = [
  // Palavras sem acento que deveriam ter
  { pattern: /\b(curriculo|conteudo|pagina|tecnico|tecnica|numero|periodo|modulo|duvida|util|uteis|facil|dificil|historico|historica|historicos|historicas|matricula|matriculas|especifico|especifica|exercicio|exercicios|genero|generos|critico|criticos|identico|identicos|especie)\b/gi, desc: 'palavra sem acento' },
  // "não" escrito sem til
  { pattern: /\bnao\b(?![-\w])/g, desc: '"nao" sem til (deveria ser "não")' },
  // "voce" sem acento
  { pattern: /\bvoce\b(?!')/gi, desc: '"voce" sem acento (deveria ser "você")' },
  // "gratúito" com acento errado
  { pattern: /\bgratúito\b/gi, desc: '"gratúito" com acento errado (correto: "gratuito")' },
  // "à" usado incorretamente ou faltando
  { pattern: /\ba (disposição|vista|venda|espera|procura|medida|vontade|distância)\b/g, desc: 'possível crase faltando' },
  // Erros de cedilha
  { pattern: /\b\w*cao\b/gi, desc: 'possível falta de cedilha em "-ção"' },
  // "fee" / palavras estrangeiras sem nota
  { pattern: /\b(inscricao|formacao|selecao|situacao|habitacao|operacao|comunicacao|educacao|informacao|qualificacao|capacitacao)\b/gi, desc: 'palavra com "-cao" sem cedilha/acento' },
];

function extractTextContent(html) {
  // Remove scripts e styles
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
  
  // Remove atributos técnicos mas preserva conteúdo de alguns atributos de texto
  // Preservar: title, alt, placeholder, aria-label, content (meta description), value (se texto)
  // Para análise, extrair esses atributos separadamente
  
  return text;
}

function findIssues(content, filePath) {
  const issues = [];
  const lines = content.split('\n');
  
  // Para HTML, trabalhar linha por linha para localizar problemas
  lines.forEach((line, lineIdx) => {
    // Pular linhas que são claramente código técnico
    const trimmed = line.trim();
    if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('*') ||
      trimmed.match(/^\s*(var|let|const|function|if|for|while|return|import|export)\s/) ||
      trimmed.match(/^\s*\.([\w-]+)\s*[{(]/) ||
      trimmed.match(/^\s*#[\w-]+\s*[{]/)
    ) {
      return;
    }
    
    for (const { pattern, desc } of DETECT_PATTERNS) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(line)) !== null) {
        // Verificar se está dentro de atributo técnico (href, src, class, id, name, type, etc.)
        const before = line.substring(0, match.index);
        const techAttr = before.match(/(href|src|class|id|name|type|rel|data-[\w-]+|action|method|value|pattern)\s*=\s*["'][^"']*$/);
        
        if (!techAttr) {
          issues.push({
            file: filePath,
            line: lineIdx + 1,
            col: match.index + 1,
            found: match[0],
            desc,
          });
        }
      }
    }
  });
  
  return issues;
}

async function main() {
  const allIssues = [];
  
  const fileLists = [
    { files: HTML_FILES, dir: BASE },
    { files: JS_DATA_FILES, dir: BASE },
    { files: JSON_FILES, dir: BASE },
  ];
  
  for (const { files, dir } of fileLists) {
    for (const f of files) {
      const fpath = path.join(dir, f);
      if (!fs.existsSync(fpath)) {
        console.warn(`⚠ Arquivo não encontrado: ${fpath}`);
        continue;
      }
      
      const content = fs.readFileSync(fpath, 'utf8');
      const issues = findIssues(content, f);
      allIssues.push(...issues);
    }
  }
  
  // Relatório
  console.log('\n=== RELATÓRIO DE AUDITORIA ORTOGRÁFICA ===\n');
  
  if (allIssues.length === 0) {
    console.log('✅ Nenhum problema detectado!');
  } else {
    const byFile = {};
    for (const issue of allIssues) {
      if (!byFile[issue.file]) byFile[issue.file] = [];
      byFile[issue.file].push(issue);
    }
    
    for (const [file, issues] of Object.entries(byFile)) {
      console.log(`\n📄 ${file} (${issues.length} ocorrência(s)):`);
      for (const issue of issues) {
        console.log(`  Linha ${issue.line}, Col ${issue.col}: "${issue.found}" — ${issue.desc}`);
      }
    }
    
    console.log(`\nTotal: ${allIssues.length} ocorrência(s) em ${Object.keys(byFile).length} arquivo(s).`);
  }
  
  // Salvar relatório
  const reportPath = path.join(__dirname, 'spelling_audit_report.json');
  fs.writeFileSync(reportPath, JSON.stringify({ generated: new Date().toISOString(), issues: allIssues }, null, 2), 'utf8');
  console.log(`\nRelatório JSON salvo em: ${reportPath}`);
}

main().catch(console.error);
