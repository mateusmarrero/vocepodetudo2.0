const fs = require('fs');

console.log('=== VERIFY ADMIN.HTML ===');
const adminHtml = fs.readFileSync('scratch/verify_admin.html', 'utf8');

// Check what tabs exist and which section is visible
const visibleSections = adminHtml.match(/<section[^>]*id="([^"]*)"[^>]*class="([^"]*)"/g);
console.log('Admin sections:');
if (visibleSections) {
  visibleSections.forEach(s => console.log('  ', s));
}

// Check courses table tbody
const coursesTableMatch = adminHtml.match(/<tbody[^>]*id="([^"]*courses[^"]*)"[^>]*>/i);
console.log('Courses tbody match:', coursesTableMatch ? coursesTableMatch[0] : 'None');

console.log('\n=== VERIFY CURRICULO.HTML ===');
const currHtml = fs.readFileSync('scratch/verify_curriculo.html', 'utf8');

const formStepPos = currHtml.indexOf('id="form-step-container"');
if (formStepPos !== -1) {
  console.log('form-step-container preview:\n', currHtml.substr(formStepPos, 400));
}

const cvPaperPos = currHtml.indexOf('id="cv-paper-preview"');
if (cvPaperPos !== -1) {
  console.log('cv-paper-preview preview:\n', currHtml.substr(cvPaperPos, 600));
}
