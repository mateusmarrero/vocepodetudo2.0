const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function inspectFile(relPath, maxLines = 60) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`[NÃO EXISTE]: ${relPath}`);
    return;
  }
  const lines = fs.readFileSync(fullPath, 'utf8').split('\n').slice(0, maxLines);
  console.log(`=== ${relPath} (${lines.length} linhas lidas) ===`);
  console.log(lines.join('\n'));
}

inspectFile('api/contact.php');
inspectFile('api/backup.php');
inspectFile('api/ratings.php');
