const fs = require('fs');

const reconciled = JSON.parse(fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/scripts/reconciled_144_dataset.json', 'utf8'));
const invPath = 'C:/Users/usuario/.gemini/antigravity/brain/fb4d587b-7761-4998-b197-12547ebe42b0/inventario_editorial_blog_144_e_planejamento_estrategico.md';
const invText = fs.existsSync(invPath) ? fs.readFileSync(invPath, 'utf8') : '';

const divergences = [];

reconciled.forEach(r => {
  // Check if title has encoding/accent issues
  const hasTypo = /[ãõáéíóúâêîôûç]/i.test(r.title) === false && (
    r.title.includes('Fundao') ||
    r.title.includes('Recomear') ||
    r.title.includes('Organizao') ||
    r.title.includes('Inteligencia') ||
    r.title.includes('Curriculo')
  );

  // Check if title was truncated in invText
  // E.g. in invText: "Artigo X: ..."
  const regex = new RegExp(`Artigo\\s+${r.id}:\\s*([^\r\n]+)`, 'i');
  const match = invText.match(regex);
  if (match) {
    const textInReport = match[1].trim();
    if (textInReport !== r.title) {
      divergences.push({
        id: r.id,
        real_title: r.title,
        report_title: textInReport,
        type: 'Título truncado ou resumido em relatório anterior',
        slug: r.slug
      });
    }
  }
});

console.log('Total divergences found in invText citations:', divergences.length);
console.log(JSON.stringify(divergences.slice(0, 10), null, 2));

fs.writeFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/scripts/divergences_summary.json', JSON.stringify(divergences, null, 2), 'utf8');
