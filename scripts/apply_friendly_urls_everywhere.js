const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

const mappings = [
  { oldHref: 'curriculo.html', newHref: 'curriculo' },
  { oldHref: 'vagas.html', newHref: 'vagas' },
  { oldHref: 'blog.html', newHref: 'blog' },
  { oldHref: 'calculadora-trabalhista.html', newHref: 'calculadora-trabalhista' },
  { oldHref: 'simulador-entrevista.html', newHref: 'simulador-entrevista' },
  { oldHref: 'teste-vocacional.html', newHref: 'teste-vocacional' },
  { oldHref: 'downloads.html', newHref: 'downloads' },
  { oldHref: 'materiais-gratuitos.html', newHref: 'downloads' },
  { oldHref: 'sobre.html', newHref: 'sobre' },
  { oldHref: 'contato.html', newHref: 'contato' },
  { oldHref: 'politica-privacidade.html', newHref: 'politica-privacidade' },
  { oldHref: 'termos-de-uso.html', newHref: 'termos-de-uso' },
  { oldHref: 'cursos-gratis-informatica.html', newHref: 'cursos-gratis-informatica' },
  { oldHref: 'cursos-gratis-excel.html', newHref: 'cursos-gratis-excel' },
  { oldHref: 'cursos-gratis-programacao.html', newHref: 'cursos-gratis-programacao' },
  { oldHref: 'cursos-gratis-ia.html', newHref: 'cursos-gratis-ia' },
  { oldHref: 'cursos-gratis-administracao.html', newHref: 'cursos-gratis-administracao' },
  { oldHref: 'cursos-gratis-ingles.html', newHref: 'cursos-gratis-ingles' },
  { oldHref: 'vagas-jovem-aprendiz-2026.html', newHref: 'vagas-jovem-aprendiz-2026' }
];

// 1. Atualizar todos os arquivos HTML
const htmlFiles = fs.readdirSync(projectRoot).filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
  const filePath = path.join(projectRoot, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Atualizar links href
  mappings.forEach(m => {
    // href="pagina.html"
    const regex1 = new RegExp(`href=["']\\.?/?${m.oldHref}(["'#?])`, 'g');
    if (regex1.test(content)) {
      content = content.replace(regex1, `href="${m.newHref}$1`);
      changed = true;
    }

    // Canonical link: <link rel="canonical" href="https://vocepodetudo.com/pagina.html">
    const canOld = `https://vocepodetudo.com/${m.oldHref}`;
    const canNew = `https://vocepodetudo.com/${m.newHref}`;
    if (content.includes(canOld)) {
      content = content.split(canOld).join(canNew);
      changed = true;
    }

    // og:url
    const ogOld = `https://vocepodetudo.com/${m.oldHref}`;
    const ogNew = `https://vocepodetudo.com/${m.newHref}`;
    if (content.includes(ogOld)) {
      content = content.split(ogOld).join(ogNew);
      changed = true;
    }
  });

  // Tratar index.html -> /
  const indexRegex = /href=["']\.?\/?index\.html(["'#?])/g;
  if (indexRegex.test(content)) {
    content = content.replace(indexRegex, 'href="/$1');
    changed = true;
  }
  if (content.includes('https://vocepodetudo.com/index.html')) {
    content = content.split('https://vocepodetudo.com/index.html').join('https://vocepodetudo.com/');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file}: links e metadados canônicos convertidos para URLs amigáveis.`);
  }
});

// 2. Atualizar arquivos JS em src/
const srcDir = path.join(projectRoot, 'src');
const jsFiles = ['app.js', 'vagas.js', 'curriculo.js'];

jsFiles.forEach(file => {
  const filePath = path.join(srcDir, file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  mappings.forEach(m => {
    // Subtituir 'pagina.html' por 'pagina' em links de botões dinâmicos
    const needle = `href="${m.oldHref}"`;
    const replacement = `href="${m.newHref}"`;
    if (content.includes(needle)) {
      content = content.split(needle).join(replacement);
      changed = true;
    }

    // Subtituir 'https://vocepodetudo.com/pagina.html'
    const fullNeedle = `https://vocepodetudo.com/${m.oldHref}`;
    const fullReplacement = `https://vocepodetudo.com/${m.newHref}`;
    if (content.includes(fullNeedle)) {
      content = content.split(fullNeedle).join(fullReplacement);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ src/${file}: links dinâmicos atualizados para URLs amigáveis.`);
  }
});
