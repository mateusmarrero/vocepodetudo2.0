const fs = require('fs');
const content = fs.readFileSync('api/analytics.php', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(204, 328).join('\n'));
