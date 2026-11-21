const fs = require('fs');

['simulador-entrevista.html', 'cursos-gratis-ia.html', 'politica-privacidade.html'].forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const footerMatch = content.match(/<footer[\s\S]*?<\/footer>/);
  if (footerMatch) {
    console.log(`\n=== FOOTER EM ${f} ===`);
    console.log(footerMatch[0]);
  }
});
