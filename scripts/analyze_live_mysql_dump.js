const fs = require('fs');

const dump = fs.readFileSync('C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY\\scratch\\live_mysql_dump.sql', 'utf8');

// Extrair seção da tabela blog_posts
const startIdx = dump.indexOf('-- Estrutura da tabela `blog_posts`');
const endIdx = dump.indexOf('-- -------------------------------------------------------------', startIdx + 50);
const blogSection = dump.substring(startIdx, endIdx !== -1 ? endIdx : undefined);

// Extrair os inserts
const lines = blogSection.split('\n');
const insertLines = lines.filter(l => l.startsWith('INSERT INTO `blog_posts`'));
console.log('Total de linhas de INSERT em blog_posts:', insertLines.length);

// Parsear os valores de cada insert
// INSERT INTO `blog_posts` (`id`, `slug`, `title`, `category`, `excerpt`, `content`, `author`, `read_time_minutes`, `cover_image`, `tags`, `views_count`, `is_published`, `created_at`, `updated_at`) VALUES (...);
const records = [];
insertLines.forEach(line => {
  // Regex para capturar os campos
  const m = line.match(/VALUES\s*\((.*)\);$/);
  if (m) {
    const rawValues = m[1];
    // Vamos fazer split considerando aspas
    // Como os campos finais são views_count, is_published, created_at, updated_at
    const parts = [];
    let cur = '';
    let inQuote = false;
    let escapeNext = false;
    for (let i = 0; i < rawValues.length; i++) {
      const c = rawValues[i];
      if (escapeNext) {
        cur += c;
        escapeNext = false;
        continue;
      }
      if (c === '\\') {
        cur += c;
        escapeNext = true;
        continue;
      }
      if (c === "'") {
        inQuote = !inQuote;
        cur += c;
        continue;
      }
      if (c === ',' && !inQuote) {
        parts.push(cur.trim());
        cur = '';
        continue;
      }
      cur += c;
    }
    if (cur) parts.push(cur.trim());

    // parts[0]: id, parts[1]: slug, parts[2]: title, parts[3]: category, ...
    // created_at é o penúltimo ou antepenúltimo campo
    const id = parseInt(parts[0], 10);
    const slug = parts[1].replace(/^'|'$/g, '');
    const title = parts[2].replace(/^'|'$/g, '').replace(/\\'/g, "'");
    const is_published = parseInt(parts[parts.length - 3], 10);
    const created_at = parts[parts.length - 2].replace(/^'|'$/g, '');
    
    records.push({ id, slug, title, is_published, created_at });
  }
});

console.log('Total de registros parseados diretamente do MySQL real:', records.length);

const nowBrasilia = '2026-11-14 23:16:00';
const published = records.filter(r => r.created_at <= nowBrasilia).sort((a,b) => b.created_at.localeCompare(a.created_at));
const scheduled = records.filter(r => r.created_at > nowBrasilia).sort((a,b) => a.created_at.localeCompare(b.created_at));

console.log('\n========================================================================');
console.log('1. OS 5 ARTIGOS PUBLICADOS MAIS RECENTES DIRETAMENTE DO BANCO MYSQL:');
console.log('========================================================================');
published.slice(0, 5).forEach((p, i) => {
  console.log(`${i + 1}. ID: ${p.id.toString().padStart(3, ' ')} | Data: ${p.created_at} | Título: ${p.title} | Slug: ${p.slug}`);
});

console.log('\n========================================================================');
console.log('2. OS 10 PRÓXIMOS ARTIGOS AGENDADOS DIRETAMENTE DO BANCO MYSQL:');
console.log('========================================================================');
scheduled.slice(0, 10).forEach((p, i) => {
  console.log(`${i + 1}. ID: ${p.id.toString().padStart(3, ' ')} | Data: ${p.created_at} | Título: ${p.title} | Slug: ${p.slug}`);
});

console.log('\n========================================================================');
console.log('3. AUDITORIA DE HORÁRIOS E FUSO HORÁRIO EM TODOS OS 144 REGISTROS MYSQL:');
console.log('========================================================================');
const hourCount = {};
records.forEach(r => {
  const h = r.created_at.split(' ')[1].split(':')[0];
  hourCount[h] = (hourCount[h] || 0) + 1;
});
console.log('Distribuição exata das horas de created_at no MySQL real:', hourCount);
console.log('Agendados gravados com hora 08:00:00:', scheduled.filter(s => s.created_at.includes('08:00:00')).length, 'de', scheduled.length);
