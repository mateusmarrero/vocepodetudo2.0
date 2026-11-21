const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const authPhp = fs.readFileSync(path.join(ROOT, 'api', 'auth.php'), 'utf8');
console.log('=== api/auth.php ===');
console.log(authPhp.slice(0, 1500));
