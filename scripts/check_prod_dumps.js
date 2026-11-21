const fs = require('fs');

console.log('=== VERIFY ADMIN PROD DUMP ===');
const admin = fs.readFileSync('scratch/verify_admin_prod.html', 'utf8');
console.log('Admin length:', admin.length);
console.log('Has tailwind?', admin.includes('tailwindcss'));
console.log('Has style.css link?', admin.includes('src/style.css?v=4.9.7'));
console.log('Has tab-btn-resumes in DOM?', admin.includes('id="tab-btn-resumes"'));
console.log('Has section-resumes in DOM?', admin.includes('id="section-resumes"'));
console.log('Has lucide icons (svg)?', (admin.match(/<svg/g) || []).length);

console.log('\n=== VERIFY CURRICULO PROD DUMP ===');
const curr = fs.readFileSync('scratch/verify_curriculo_prod.html', 'utf8');
console.log('Curriculo length:', curr.length);
console.log('Has curriculo.css?', curr.includes('src/curriculo.css?v=4.9.7'));
console.log('Has cv-paper-preview?', curr.includes('id="cv-paper-preview"'));
console.log('Has editor-column?', curr.includes('id="editor-column"'));
console.log('Has form-step-container?', curr.includes('id="form-step-container"'));
console.log('Has lucide icons (svg)?', (curr.match(/<svg/g) || []).length);
