const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const files = fs.readdirSync(root).filter(f => f.endsWith('.html') || f === 'ads.txt');

console.log('=== AUDITORIA COMPLETA DE ADSENSE ===');

files.forEach(f => {
  const filePath = path.join(root, f);
  const content = fs.readFileSync(filePath, 'utf8');
  if (f === 'ads.txt') {
    console.log('[ads.txt] Conteudo:\n' + content.trim());
    return;
  }
  const hasScript = content.includes('pagead2.googlesyndication.com') || content.includes('ca-pub-9421145457118515');
  const adBlockMatches = content.match(/class=["']adsbygoogle["']/g);
  const blockCount = adBlockMatches ? adBlockMatches.length : 0;
  
  // Verificar rotulagem incorreta ou correta
  const hasPublicidadeLabel = content.includes('Publicidade') || content.includes('publicidade');
  
  // Verificar se tem política de privacidade linkada
  const hasPrivacyLink = content.includes('privacidade') || content.includes('politica-de-privacidade');

  console.log(`${f.padEnd(35)} | Script: ${hasScript ? 'OK ' : 'FALTA'} | Blocos: ${blockCount} | Label Pub: ${hasPublicidadeLabel ? 'SIM' : 'NAO'} | Priv: ${hasPrivacyLink ? 'SIM' : 'NAO'}`);
});
