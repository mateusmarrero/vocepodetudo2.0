const fs = require('fs');

const auditPhp = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/audit_logs.php', 'utf8').split('\n');
console.log(auditPhp.slice(165, 195).join('\n'));
