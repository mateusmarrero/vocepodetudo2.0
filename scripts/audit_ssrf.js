const fs = require('fs');
const path = require('path');

const apiDir = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api';
const phpFiles = fs.readdirSync(apiDir).filter(f => f.endsWith('.php'));

console.log('=== VERIFICAÇÃO DE SSRF E REQUISIÇÕES EXTERNAS EM API/*.PHP ===');
const ssrfPatterns = [
  /curl_init\s*\(/i,
  /file_get_contents\s*\(\s*\$/i,
  /get_headers\s*\(/i,
  /fsockopen\s*\(/i,
  /stream_context_create/i
];

for (const file of phpFiles) {
  const filePath = path.join(apiDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;

    for (const pattern of ssrfPatterns) {
      if (pattern.test(line)) {
        console.log(`[HTTP/REDE] ${file}:${idx + 1}: ${trimmed.slice(0, 120)}`);
        break;
      }
    }
  });
}
