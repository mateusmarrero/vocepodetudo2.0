const fs = require('fs');

['cursos-gratis-administracao.html', 'cursos-gratis-ingles.html', 'termos-de-uso.html'].forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const footerMatch = content.match(/<footer[\s\S]*?<\/footer>/);
  if (footerMatch) {
    console.log(`\n=== FOOTER EM ${f} ===`);
    console.log(footerMatch[0].slice(-500));
  }
});
