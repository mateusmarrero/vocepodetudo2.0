const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const appJs = fs.readFileSync(path.join(ROOT, 'src', 'app.js'), 'utf8');

const cardFnIdx = appJs.indexOf('directWhatsappUrl');
console.log(appJs.slice(cardFnIdx + 2000, cardFnIdx + 3200));
