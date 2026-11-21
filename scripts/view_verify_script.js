const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const script = fs.readFileSync(path.join(dir, 'scripts', 'verify_all_pages_cdp.js'), 'utf8');
console.log(script);
