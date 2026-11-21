const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const appJs = fs.readFileSync(path.join(ROOT, 'src', 'app.js'), 'utf8');

const cardFnIdx = appJs.indexOf('function createCourseCard(');
if (cardFnIdx !== -1) {
  console.log(appJs.slice(cardFnIdx, cardFnIdx + 1200));
} else {
  const cardFnIdx2 = appJs.indexOf('createCourseCard');
  console.log(cardFnIdx2 !== -1 ? appJs.slice(cardFnIdx2, cardFnIdx2 + 600) : 'não encontrado');
}
