const fs = require('fs');
const path = require('path');

const appJs = fs.readFileSync(path.join(__dirname, '..', 'src', 'app.js'), 'utf8');

// Extrair getCourseSubjectImage do app.js
const funcMatch = appJs.match(/function getCourseSubjectImage\(course\) \{[\s\S]*?\n  \}/);
if (!funcMatch) {
  console.error('getCourseSubjectImage not found in app.js!');
  process.exit(1);
}

const getCourseSubjectImage = new Function('course', funcMatch[0].replace('function getCourseSubjectImage(course) {', '').slice(0, -1));

const courses = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'api', 'cache_courses.json'), 'utf8'));

console.log('Total courses:', courses.length);
for (let i = 0; i < 5; i++) {
  const c = courses[i];
  console.log(`Course ${i}: "${c.title}" -> Image:`, getCourseSubjectImage(c));
}
