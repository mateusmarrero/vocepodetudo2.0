const fs = require('fs');

if (fs.existsSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/scripts/apply_compact_cards_and_fix_scripts.js')) {
  console.log(fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/scripts/apply_compact_cards_and_fix_scripts.js', 'utf8').slice(0, 2000));
} else {
  console.log('File does not exist');
}
