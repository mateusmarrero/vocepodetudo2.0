const fs = require('fs');

if (fs.existsSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/scripts/test_single_card_pop.js')) {
  console.log(fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/scripts/test_single_card_pop.js', 'utf8').slice(1500, 3500));
}
