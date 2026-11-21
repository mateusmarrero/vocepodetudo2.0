const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));

console.log('🚀 INICIANDO AUDITORIA AVANÇADA DE PERFORMANCE & GOOGLE ADSENSE...\n');

const report = {
  adsenseTagPages: [],
  adsenseRestrictedPages: [],
  brokenLinks: [],
  renderBlocking: [],
  perfTips: []
};

// Páginas proibidas de veicular anúncios segundo a política do Google AdSense
const RESTRICTED_LEGAL_PAGES = [
  'politica-privacidade.html',
  'termos-de-uso.html',
  '404.html'
];

for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
  
  // 1. Checagem de AdSense
  const hasAdScript = content.includes('pagead2.googlesyndication.com');
  const hasInsAd = content.includes('class="adsbygoogle"');
  
  if (hasAdScript || hasInsAd) {
    if (RESTRICTED_LEGAL_PAGES.includes(file)) {
      report.adsenseRestrictedPages.push({ file, hasAdScript, hasInsAd });
    } else {
      report.adsenseTagPages.push({ file, hasAdScript, hasInsAd });
    }
  }

  // 2. Checagem de Render-Blocking Scripts
  if (content.includes('<script src="https://unpkg.com/lucide@') && !content.includes('defer')) {
    report.renderBlocking.push({ file, script: 'Lucide Icons síncrono no <head>' });
  }

  // 3. Checagem de Links Internos Quebrados
  const linkMatches = content.match(/href="([^"':#]+(?:\.html)?[^"']*)"/g) || [];
  for (const m of linkMatches) {
    const rawHref = m.replace(/^href="/, '').replace(/"$/, '').split('?')[0].split('#')[0];
    if (rawHref && rawHref.endsWith('.html') && !rawHref.startsWith('http')) {
      const targetFile = path.join(ROOT_DIR, rawHref);
      if (!fs.existsSync(targetFile)) {
        report.brokenLinks.push({ from: file, to: rawHref });
      }
    }
  }
}

console.log('====================================================');
console.log('1. CONFORMIDADE GOOGLE ADSENSE:');
console.log('====================================================');
console.log(`- Páginas com AdSense devidamente configurado: ${report.adsenseTagPages.length}`);
report.adsenseTagPages.forEach(p => console.log(`   * ${p.file}: Script=${p.hasAdScript}, Blocos=${p.hasInsAd}`));

if (report.adsenseRestrictedPages.length === 0) {
  console.log('✅ ZERO anúncios em páginas jurídicas/restritas (100% conforme diretrizes do Google).');
} else {
  console.log('❌ ATENÇÃO: Anúncios encontrados em páginas restritas:');
  report.adsenseRestrictedPages.forEach(p => console.log(`   * ${p.file}`));
}

console.log('\n====================================================');
console.log('2. INTEGRIDADE DE LINKS (Sem 404 para o GoogleBot):');
console.log('====================================================');
if (report.brokenLinks.length === 0) {
  console.log('✅ ZERO links internos quebrados encontrados em todas as páginas HTML.');
} else {
  console.log('❌ Links quebrados detectados:');
  report.brokenLinks.forEach(b => console.log(`   * ${b.from} -> ${b.to}`));
}

console.log('\n====================================================');
console.log('3. PERFORMANCE E OTIMIZAÇÃO (Render-Blocking):');
console.log('====================================================');
console.log(`- Páginas com scripts render-blocking identificados: ${report.renderBlocking.length}`);
report.renderBlocking.slice(0, 5).forEach(r => console.log(`   * ${r.file}: ${r.script}`));
if (report.renderBlocking.length > 5) console.log(`   ... e mais ${report.renderBlocking.length - 5} páginas.`);

console.log('\n====================================================');
