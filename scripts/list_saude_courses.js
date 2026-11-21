const fs = require('fs');
const path = require('path');

const coursesPath = path.join(__dirname, '..', 'src', 'data', 'courses.js');
let content = fs.readFileSync(coursesPath, 'utf8');

const startIdx = content.indexOf('const localCourses = [');
if (startIdx !== -1) {
  const jsonPart = content.slice(startIdx + 'const localCourses = '.length);
  const endIdx = jsonPart.lastIndexOf('];');
  const courses = eval(jsonPart.slice(0, endIdx + 2));
  const saude = courses.filter(c => c.category === 'saude');
  console.log(`Total de cursos no catálogo: ${courses.length}`);
  console.log(`Total na categoria saúde: ${saude.length}\n`);
  saude.forEach(c => {
    console.log(`- [${c.id}] ${c.title} (${c.provider} - ${c.workloadHours}h)`);
  });
}
