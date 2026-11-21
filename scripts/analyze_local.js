const fs = require('fs');

console.log('=== ANALYZE CURRICULO ===');
const curr = fs.readFileSync('scratch/local_curriculo.html', 'utf8');
console.log('Length:', curr.length);

// Check if Tailwind style tag was injected by cdn.tailwindcss.com
const hasTailwindStyle = curr.includes('<style id="tailwindcss"');
console.log('Has injected tailwind style?', hasTailwindStyle || curr.includes('tailwind'));

// Check if Lucide icons rendered (svg inside data-lucide or replaced)
const svgCount = (curr.match(/<svg/g) || []).length;
console.log('SVG icon count in curriculo:', svgCount);

// Check form fields
console.log('Has #cv-nome-completo?', curr.includes('id="cv-nome-completo"'));
console.log('Has #cv-paper-preview?', curr.includes('id="cv-paper-preview"'));
console.log('Has #preview-column?', curr.includes('id="preview-column"'));

console.log('\n=== ANALYZE ADMIN ===');
const admin = fs.readFileSync('scratch/local_admin.html', 'utf8');
console.log('Length:', admin.length);
const adminSvgCount = (admin.match(/<svg/g) || []).length;
console.log('SVG icon count in admin:', adminSvgCount);

// Check if login view is shown or panel is shown
const authScreenHidden = admin.includes('id="auth-screen" class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-[#002776] to-slate-950 hidden');
console.log('Is auth-screen hidden?', authScreenHidden);
const adminPanelHidden = admin.includes('id="admin-panel" class="hidden min-h-screen flex-col"');
console.log('Is admin-panel hidden?', adminPanelHidden);
