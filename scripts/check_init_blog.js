const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const appJs = fs.readFileSync(path.join(dir, 'src', 'app.js'), 'utf8');

const idx = appJs.indexOf('async function initBlogModule');
if (idx !== -1) {
  console.log(appJs.slice(idx, idx + 600));
}
