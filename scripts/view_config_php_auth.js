const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const configPhp = fs.readFileSync(path.join(ROOT, 'api', 'config.php'), 'utf8');
console.log(configPhp.slice(1500, 4000));
