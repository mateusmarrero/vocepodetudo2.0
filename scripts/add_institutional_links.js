const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.html') && f !== 'admin.html');

files.forEach(file => {
  const filePath = path.join(baseDir, file);
  let html = fs.readFileSync(filePath, 'utf-8');

  let modified = false;

  // Inserir Quem Somos e Fale Conosco se ainda não estiver
  if (!html.includes('href="sobre.html"') && html.includes('href="curriculo.html"')) {
    html = html.replace(
      '<a href="curriculo.html"',
      '<a href="sobre.html" class="hover:text-emerald-400 transition-colors">Quem Somos</a>\n        <span>•</span>\n        <a href="contato.html" class="hover:text-emerald-400 transition-colors">Fale Conosco</a>\n        <span>•</span>\n        <a href="curriculo.html"'
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, html, 'utf-8');
    console.log(`[OK] Rodapé de ${file} atualizado com links para Sobre e Contato.`);
  }
});
