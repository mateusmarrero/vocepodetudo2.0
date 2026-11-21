const fs = require('fs');

const dump = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/scratch/live_mysql_dump.sql', 'utf8');
const insertStart = dump.indexOf('INSERT INTO `blog_posts`');
const insertEnd = dump.indexOf(';\n', insertStart);
const insertSql = dump.substring(insertStart, insertEnd + 1);
const valuesIdx = insertSql.indexOf('VALUES');
const dataStr = insertSql.substring(valuesIdx + 6);

const tuples = [];
let depth = 0;
let inString = false;
let escape = false;
let currentTuple = '';

for (let i = 0; i < dataStr.length; i++) {
  const c = dataStr[i];
  if (escape) { if (depth > 0) currentTuple += c; escape = false; continue; }
  if (c === '\\') { if (depth > 0) currentTuple += c; escape = true; continue; }
  if (c === "'") { inString = !inString; if (depth > 0) currentTuple += c; continue; }
  if (!inString) {
    if (c === '(') { depth++; if (depth === 1) { currentTuple = ''; continue; } }
    else if (c === ')') { depth--; if (depth === 0) { tuples.push(currentTuple); currentTuple = ''; continue; } }
  }
  if (depth > 0) currentTuple += c;
}

console.log('========================================================================');
console.log(' AUDITORIA PÓS-MIGRAÇÃO: BANCO DE DADOS MYSQL EM PRODUÇÃO (LIVE) ');
console.log('========================================================================');
console.log('Total de tuplas em blog_posts no MySQL:', tuples.length);

const records = [];
tuples.forEach(t => {
  const fields = [];
  let cur = '';
  let inStr = false;
  let esc = false;
  for (let j = 0; j < t.length; j++) {
    const ch = t[j];
    if (esc) { cur += ch; esc = false; continue; }
    if (ch === '\\') { cur += ch; esc = true; continue; }
    if (ch === "'") { inStr = !inStr; cur += ch; continue; }
    if (ch === ',' && !inStr) { fields.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur) fields.push(cur.trim());
  const id = parseInt(fields[0].replace(/[^0-9]/g, ''), 10);
  const slug = fields[1].replace(/^'|'$/g, '');
  const title = fields[2].replace(/^'|'$/g, '').replace(/\\'/g, "'");
  const is_published = fields[fields.length - 3].replace(/^'|'$/g, '');
  const created_at = fields[fields.length - 2].replace(/^'|'$/g, '');
  records.push({ id, slug, title, is_published, created_at });
});

records.sort((a,b) => a.created_at.localeCompare(b.created_at));

const publishedLive = records.filter(r => r.created_at < '2026-11-15 00:00:00');
const scheduledLive = records.filter(r => r.created_at >= '2026-11-15 00:00:00');

console.log('1. Artigos Publicados no MySQL (created_at < 15/11):', publishedLive.length);
console.log('2. Artigos Agendados no MySQL (created_at >= 15/11):', scheduledLive.length);

console.log('\n--- Primeiros 6 Artigos Agendados no MySQL ---');
scheduledLive.slice(0, 6).forEach((r, i) => {
  console.log(`${i+1}. ID: ${r.id.toString().padStart(3)} | Data: ${r.created_at} | Título: ${r.title.slice(0, 50)}`);
});

console.log('\n--- Últimos 4 Artigos Agendados no MySQL ---');
scheduledLive.slice(-4).forEach((r, i) => {
  console.log(`${i+1}. ID: ${r.id.toString().padStart(3)} | Data: ${r.created_at} | Título: ${r.title.slice(0, 50)}`);
});

// Checar distribuição por dia dos agendados
const dayCounts = {};
scheduledLive.forEach(r => {
  const day = r.created_at.slice(0, 10);
  dayCounts[day] = (dayCounts[day] || 0) + 1;
});

const invalidDays = Object.entries(dayCounts).filter(([d, c]) => c !== 2);
console.log('\nTotal de dias de publicação no MySQL:', Object.keys(dayCounts).length);
console.log('Dias com contagem DIFERENTE de 2 posts:', invalidDays.length);
if (invalidDays.length === 0) {
  console.log('🎉 SUCESSO ABSOLUTO: Todos os 73 dias no MySQL possuem exatamente 2 posts por dia!');
} else {
  console.log('Dias com problema:', invalidDays);
}
