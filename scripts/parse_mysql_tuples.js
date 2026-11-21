const fs = require('fs');

const dump = fs.readFileSync('C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY\\scratch\\live_mysql_dump.sql', 'utf8');

const insertStart = dump.indexOf('INSERT INTO `blog_posts`');
if (insertStart === -1) {
  console.log('INSERT INTO blog_posts not found');
  process.exit(1);
}

// O insert termina com ;\n
const insertEnd = dump.indexOf(';\n', insertStart);
const insertSql = dump.substring(insertStart, insertEnd + 1);

console.log('Comprimento do bloco INSERT de blog_posts:', insertSql.length);

// Regex para capturar linhas de dados: (id, 'slug', 'title', ...)
// Uma tupla começa com '(' e termina com ')'
// Mas como o conteúdo HTML tem parênteses, vamos iterar caractere a caractere ou capturar tuplas de forma robusta
const tuples = [];
let depth = 0;
let inString = false;
let escape = false;
let currentTuple = '';

// Pular até VALUES
const valuesIdx = insertSql.indexOf('VALUES');
const dataStr = insertSql.substring(valuesIdx + 6);

for (let i = 0; i < dataStr.length; i++) {
  const c = dataStr[i];
  if (escape) {
    if (depth > 0) currentTuple += c;
    escape = false;
    continue;
  }
  if (c === '\\') {
    if (depth > 0) currentTuple += c;
    escape = true;
    continue;
  }
  if (c === "'") {
    inString = !inString;
    if (depth > 0) currentTuple += c;
    continue;
  }
  if (!inString) {
    if (c === '(') {
      depth++;
      if (depth === 1) {
        currentTuple = '';
        continue;
      }
    } else if (c === ')') {
      depth--;
      if (depth === 0) {
        tuples.push(currentTuple);
        currentTuple = '';
        continue;
      }
    }
  }
  if (depth > 0) {
    currentTuple += c;
  }
}

console.log('Total de tuplas extraídas do INSERT MySQL:', tuples.length);

const records = [];
tuples.forEach(t => {
  // Parsear campos da tupla respeitando strings com aspas
  const fields = [];
  let cur = '';
  let inStr = false;
  let esc = false;
  for (let j = 0; j < t.length; j++) {
    const ch = t[j];
    if (esc) {
      cur += ch;
      esc = false;
      continue;
    }
    if (ch === '\\') {
      cur += ch;
      esc = true;
      continue;
    }
    if (ch === "'") {
      inStr = !inStr;
      cur += ch;
      continue;
    }
    if (ch === ',' && !inStr) {
      fields.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }
  if (cur) fields.push(cur.trim());

  const id = parseInt(fields[0].replace(/[^0-9]/g, ''), 10);
  const slug = fields[1].replace(/^'|'$/g, '');
  const title = fields[2].replace(/^'|'$/g, '').replace(/\\'/g, "'");
  const is_published = parseInt(fields[fields.length - 3], 10);
  const created_at = fields[fields.length - 2].replace(/^'|'$/g, '');
  records.push({ id, slug, title, is_published, created_at });
});

console.log('Total de registros parseados com sucesso:', records.length);

const nowBrasilia = '2026-11-14 23:17:00';
const published = records.filter(r => r.created_at <= nowBrasilia).sort((a,b) => b.created_at.localeCompare(a.created_at));
const scheduled = records.filter(r => r.created_at > nowBrasilia).sort((a,b) => a.created_at.localeCompare(b.created_at));

console.log('\n========================================================================');
console.log('1. OS 5 ARTIGOS PUBLICADOS MAIS RECENTES (DIRETAMENTE DO BANCO MYSQL REAL):');
console.log('========================================================================');
published.slice(0, 5).forEach((p, i) => {
  console.log(`${i + 1}. ID: ${p.id.toString().padStart(3, ' ')} | Data: ${p.created_at} | Título: ${p.title} | Slug: ${p.slug}`);
});

console.log('\n========================================================================');
console.log('2. OS 10 PRÓXIMOS ARTIGOS AGENDADOS (DIRETAMENTE DO BANCO MYSQL REAL):');
console.log('========================================================================');
scheduled.slice(0, 10).forEach((p, i) => {
  console.log(`${i + 1}. ID: ${p.id.toString().padStart(3, ' ')} | Data: ${p.created_at} | Título: ${p.title} | Slug: ${p.slug}`);
});

console.log('\n========================================================================');
console.log('3. AUDITORIA DE HORÁRIOS DOS 144 REGISTROS MYSQL:');
console.log('========================================================================');
const hourCount = {};
records.forEach(r => {
  const h = r.created_at.split(' ')[1].split(':')[0];
  hourCount[h] = (hourCount[h] || 0) + 1;
});
console.log('Distribuição das horas de created_at no MySQL:', hourCount);
console.log('Artigos agendados no MySQL gravados exatamente às 08:00:00:', scheduled.filter(s => s.created_at.includes('08:00:00')).length, 'de', scheduled.length);
