const fs = require('fs');
const path = require('path');

const courses = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../api/seed_courses.json'), 'utf8'));

// Mapa por URL original
const urlToCourseMap = {};
courses.forEach(c => {
  if (c.url) {
    urlToCourseMap[c.url.trim()] = c;
    const cleanUrl = c.url.split('?')[0].trim();
    urlToCourseMap[cleanUrl] = c;
  }
});

const files = [
  'cursos-gratis-excel.html',
  'cursos-gratis-ia.html',
  'cursos-gratis-informatica.html',
  'cursos-gratis-programacao.html',
  'cursos-gratis-administracao.html',
  'cursos-gratis-ingles.html'
];

let totalReplaced = 0;

files.forEach(fileName => {
  const filePath = path.resolve(__dirname, '..', fileName);
  if (!fs.existsSync(filePath)) return;

  let html = fs.readFileSync(filePath, 'utf8');

  // Procurar por artigos e substituir os botões de ação
  const articleRegex = /<article[\s\S]*?<\/article>/g;
  html = html.replace(articleRegex, (article) => {
    // Tenta encontrar a URL no href
    const hrefMatch = article.match(/href="([^"]+)"/);
    if (!hrefMatch) return article;

    const originalUrl = hrefMatch[1];
    if (originalUrl.startsWith('/') || originalUrl.startsWith('#') || originalUrl.includes('curriculo') || originalUrl.includes('vagas')) {
      return article;
    }

    // Tentar mapear para um curso
    let matchedCourse = urlToCourseMap[originalUrl] || urlToCourseMap[originalUrl.split('?')[0]];
    if (!matchedCourse) {
      // Tentar por título contido no article
      const titleMatch = article.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
      if (titleMatch) {
        const cleanTitle = titleMatch[1].replace(/<[^>]+>/g, '').trim().toLowerCase();
        matchedCourse = courses.find(c => {
          const cTitle = c.title.toLowerCase();
          return cleanTitle.includes(cTitle) || cTitle.includes(cleanTitle);
        });
      }
    }

    if (matchedCourse) {
      totalReplaced++;
      const coursePageUrl = `/curso/${matchedCourse.id}`;
      // Substituir o link
      let updatedArticle = article.replace(
        /href="[^"]*"/,
        `href="${coursePageUrl}"`
      );
      // Remover target="_blank"
      updatedArticle = updatedArticle.replace(/target="_blank"\s*/g, '');
      updatedArticle = updatedArticle.replace(/rel="noopener noreferrer"\s*/g, '');
      // Mudar texto de Acessar Curso Grátis para Ver Curso Completo
      updatedArticle = updatedArticle.replace('Acessar Curso Grátis', 'Ver Curso Completo');
      updatedArticle = updatedArticle.replace('external-link', 'arrow-right');
      return updatedArticle;
    }

    return article;
  });

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`✅ ${fileName} atualizado.`);
});

console.log(`Total de links de cursos redirecionados para as páginas internas: ${totalReplaced}`);
