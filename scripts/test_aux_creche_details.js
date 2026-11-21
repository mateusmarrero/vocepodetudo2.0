const detailsModule = require('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/src/data/course_details.js');

const auxCourse = {
  id: 'curso-1793380965-213',
  title: 'Auxiliar de Creche',
  provider: 'Ginead',
  providerTag: 'Ginead',
  category: 'educacao',
  categoryName: 'educacao',
  description: 'O auxiliar de creche atua em creches e escolas infantis...',
  url: 'https://www.ginead.com.br/curso/curso-auxiliar-de-creche',
  workloadHours: 70,
  hasFreeCertificate: false,
  certificateNote: 'Modo Ouvinte Gratuito',
  level: 'Iniciante',
  tags: [ 'Oficial', 'Novo', 'Ginead' ],
  rating: 5
};

console.log('Testing getCourseExpandedDetailsHtml:');
try {
  const html = detailsModule.getCourseExpandedDetailsHtml(auxCourse);
  console.log('HTML produced successfully, length:', html.length);
  console.log(html.slice(0, 400));
} catch (e) {
  console.error('ERROR in getCourseExpandedDetailsHtml:', e);
}
