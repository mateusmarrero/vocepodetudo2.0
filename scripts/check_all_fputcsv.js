const fs = require('fs');

const files = [
  'api/admin_students.php',
  'api/resumes.php',
  'api/newsletter.php',
  'api/audit_logs.php',
  'api/blog.php',
  'api/analytics.php'
];

for (const file of files) {
  const full = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/' + file;
  if (fs.existsSync(full)) {
    const content = fs.readFileSync(full, 'utf8');
    const lines = content.split('\n');
    console.log('=== ' + file + ' ===');
    lines.forEach((l, i) => {
      if (l.includes('fputcsv')) {
        console.log((i+1) + ': ' + l.trim());
      }
    });
  }
}
