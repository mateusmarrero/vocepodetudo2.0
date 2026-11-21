const fs = require('fs');

if (fs.existsSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/scripts/make_compact_app.js')) {
  console.log('--- make_compact_app.js ---');
  console.log(fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/scripts/make_compact_app.js', 'utf8').slice(0, 1500));
}

if (fs.existsSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/scripts/make_compact_details.js')) {
  console.log('--- make_compact_details.js ---');
  console.log(fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/scripts/make_compact_details.js', 'utf8').slice(0, 1500));
}
