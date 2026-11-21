const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

const pages = [
  'blog.html',
  'curriculo.html',
  'vagas.html',
  'vagas-jovem-aprendiz-2026.html',
  'cursos-gratis-informatica.html',
  'cursos-gratis-excel.html',
  'cursos-gratis-programacao.html',
  'cursos-gratis-ia.html',
  'cursos-gratis-administracao.html',
  'cursos-gratis-ingles.html'
];

const adsenseSnippet = `  <!-- Google AdSense Oficial -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9421145457118515"
     crossorigin="anonymous"></script>
</head>`;

let updatedCount = 0;

pages.forEach(file => {
  const filePath = path.join(projectRoot, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`Arquivo não encontrado: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('ca-pub-9421145457118515')) {
    console.log(`ℹ️ ${file} já possui a tag do AdSense.`);
    return;
  }

  if (content.includes('</head>')) {
    content = content.replace('</head>', adsenseSnippet);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ AdSense inserido com sucesso em: ${file}`);
    updatedCount++;
  } else {
    console.error(`❌ Não foi possível encontrar </head> em: ${file}`);
  }
});

console.log(`\nTotal de páginas atualizadas com AdSense: ${updatedCount}`);
