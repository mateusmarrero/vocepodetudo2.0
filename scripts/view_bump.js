const fs = require('fs');

if (fs.existsSync('scripts/bump_version_v479.js')) {
  console.log(fs.readFileSync('scripts/bump_version_v479.js', 'utf8'));
} else {
  console.log('Arquivo não existe');
}
