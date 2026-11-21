const fs = require('fs');

if (fs.existsSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/.gitignore')) {
  console.log(fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/.gitignore', 'utf8'));
} else {
  console.log('No .gitignore found');
}
