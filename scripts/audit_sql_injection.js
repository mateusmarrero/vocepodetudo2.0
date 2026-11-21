const fs = require('fs');
const path = require('path');

const apiDir = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api';
const phpFiles = fs.readdirSync(apiDir).filter(f => f.endsWith('.php'));

console.log('=== AUDITORIA DE SQL INJECTION EM API/*.PHP ===');
const suspiciousPatterns = [
  /\$pdo->query\s*\(\s*["'].*?\$(?:_GET|_POST|_REQUEST|input|id|name|email|slug|title)/i,
  /\$pdo->exec\s*\(\s*["'].*?\$(?:_GET|_POST|_REQUEST|input|id|name|email|slug|title)/i,
  /\$pdo->prepare\s*\(\s*["'].*?\$(?:_GET|_POST|_REQUEST|input|id|name|email|slug|title)/i,
  /SELECT\s+.*?\s+FROM\s+.*?\s+WHERE\s+.*?\$[a-zA-Z0-9_]+/i,
  /INSERT\s+INTO\s+.*?\s+VALUES\s*\(.*?\$[a-zA-Z0-9_]+/i,
  /UPDATE\s+.*?\s+SET\s+.*?\$[a-zA-Z0-9_]+/i,
  /DELETE\s+FROM\s+.*?\s+WHERE\s+.*?\$[a-zA-Z0-9_]+/i
];

let totalIssues = 0;

for (const file of phpFiles) {
  const filePath = path.join(apiDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // ignore comments
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(line)) {
        // check if it's not a false positive with table name constants or prepared placeholder '?' or ':param'
        if (line.includes('?') && !line.includes('$_') && !line.includes('$input')) {
          continue;
        }
        console.log(`[ALERTA] ${file}:${idx + 1}: ${trimmed.slice(0, 120)}`);
        totalIssues++;
        break;
      }
    }
  });
}

console.log(`Auditoria concluída. Alertas identificados: ${totalIssues}`);
