const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const content = fs.readFileSync(path.join(ROOT, 'api', 'backup.php'), 'utf8');
console.log(content);
