const fs = require('fs');
const path = require('path');

function checkHtmlTags(fileName) {
  const filePath = path.resolve(__dirname, '..', fileName);
  const html = fs.readFileSync(filePath, 'utf8');
  console.log(`\n=== Checking tags in ${fileName} ===`);
  
  // Track open/close for common container tags
  const tags = ['div', 'section', 'main', 'form', 'table', 'tbody', 'thead', 'tr', 'nav', 'header', 'footer'];
  let hasMismatch = false;
  tags.forEach(tag => {
    const openRegex = new RegExp(`<${tag}(\\s[^>]*)?>`, 'gi');
    const closeRegex = new RegExp(`<\/${tag}>`, 'gi');
    const openCount = (html.match(openRegex) || []).length;
    const closeCount = (html.match(closeRegex) || []).length;
    if (openCount !== closeCount) {
      console.warn(`⚠️ Tag mismatch <${tag}>: ${openCount} open vs ${closeCount} close! Diff: ${openCount - closeCount}`);
      hasMismatch = true;
    }
  });
  if (!hasMismatch) {
    console.log(`✅ All container tags balanced for ${fileName}`);
  }
}

checkHtmlTags('index.html');
checkHtmlTags('admin.html');
checkHtmlTags('curriculo.html');
checkHtmlTags('vagas.html');
checkHtmlTags('blog.html');
checkHtmlTags('simulador-entrevista.html');
checkHtmlTags('teste-vocacional.html');
checkHtmlTags('cursos-gratis-informatica.html');
checkHtmlTags('cursos-gratis-excel.html');
checkHtmlTags('cursos-gratis-programacao.html');
checkHtmlTags('cursos-gratis-ia.html');
checkHtmlTags('vagas-jovem-aprendiz-2026.html');
checkHtmlTags('cursos-gratis-administracao.html');
checkHtmlTags('cursos-gratis-ingles.html');
