const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const appJs = fs.readFileSync(path.join(ROOT, 'src', 'app.js'), 'utf8');

const cardFnIdx = appJs.indexOf('createCourseCardHtml(course) {');
console.log(appJs.slice(cardFnIdx + 500, cardFnIdx + 2000));
