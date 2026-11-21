const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

['downloads.html', 'materiais-gratuitos.html'].forEach(filename => {
  const filePath = path.join(baseDir, filename);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf-8');

  // 1. Limpar injeção indevida dentro da string do Word
  const corruptedWordStr = '<script src="./src/cookie-banner.js?v=4.44.0"></script>\n</body></html>';
  if (content.includes(corruptedWordStr)) {
    content = content.replace(corruptedWordStr, '</body></html>');
    console.log(`[OK] Removida injeção indevida dentro do template Word em ${filename}`);
  }

  // Também checar variações de espaço ou versão
  content = content.replace(
    /<\/ul>\s*<script src="[^"]*cookie-banner\.js[^"]*"><\/script>\s*<\/body><\/html>/g,
    '</ul>\n        </body></html>'
  );

  // 2. Garantir que o cookie-banner.js esteja fora da tag <script> e logo antes do </body> final
  // Primeiro remover ocorrências soltas de cookie-banner.js
  content = content.replace(/<script src="[^"]*cookie-banner\.js[^"]*"><\/script>/g, '');

  // Inserir antes do último </body>
  const lastBodyIndex = content.lastIndexOf('</body>');
  if (lastBodyIndex !== -1) {
    content = content.slice(0, lastBodyIndex) + 
      '  <script src="./src/cookie-banner.js?v=4.46.0"></script>\n' + 
      content.slice(lastBodyIndex);
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`[OK] ${filename} corrigido e higienizado com sucesso!`);
});
