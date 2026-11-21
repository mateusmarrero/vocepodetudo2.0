const fs = require('fs');

if (fs.existsSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/scripts/bump_all_cache_busting.js')) {
  console.log(fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/scripts/bump_all_cache_busting.js', 'utf8').slice(0, 2000));
}
