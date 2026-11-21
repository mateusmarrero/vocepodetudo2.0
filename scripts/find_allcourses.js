const fs = require('fs');

const appJs = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/src/app.js', 'utf8');
const lines = appJs.split('\n');
lines.forEach((l, i) => {
  if (l.includes('allCourses')) {
    console.log((i+1) + ': ' + l.trim());
  }
});
