const fs = require('fs');
const path = require('path');

const projectDir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';

const allFiles = fs.readdirSync(projectDir);
const htmlFiles = allFiles.filter(f => f.endsWith('.html'));

console.log('=== 1. VERIFICANDO OCORRÊNCIAS DE www.vocepodetudo.com ===');
allFiles.forEach(f => {
  const fullPath = path.join(projectDir, f);
  if (fs.statSync(fullPath).isFile()) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const matches = content.match(/www\.vocepodetudo\.com/g);
    if (matches && matches.length > 0) {
      console.log(`[${f}] -> ${matches.length} ocorrências de 'www.vocepodetudo.com'`);
    }
  }
});

console.log('\n=== 2. VERIFICANDO TAGS CANONICAL EM TODOS OS HTML ===');
htmlFiles.forEach(f => {
  const content = fs.readFileSync(path.join(projectDir, f), 'utf8');
  const canonicalMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i) ||
                         content.match(/<link\s+href=["']([^"']+)["']\s+rel=["']canonical["']/i);
  if (canonicalMatch) {
    console.log(`${f} -> Canonical: ${canonicalMatch[1]}`);
  } else {
    console.log(`${f} -> ⚠️ SEM TAG CANONICAL!`);
  }
});

console.log('\n=== 3. VERIFICANDO META OG:URL E TWITTER:URL ===');
htmlFiles.forEach(f => {
  const content = fs.readFileSync(path.join(projectDir, f), 'utf8');
  const ogUrlMatch = content.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i);
  const twitterUrlMatch = content.match(/<meta\s+name=["']twitter:url["']\s+content=["']([^"']+)["']/i);
  if (ogUrlMatch && ogUrlMatch[1].includes('www.')) {
    console.log(`${f} -> OG:URL contém www: ${ogUrlMatch[1]}`);
  }
  if (twitterUrlMatch && twitterUrlMatch[1].includes('www.')) {
    console.log(`${f} -> Twitter:URL contém www: ${twitterUrlMatch[1]}`);
  }
});

console.log('\n=== 4. VERIFICANDO SITEMAP.XML ===');
if (fs.existsSync(path.join(projectDir, 'sitemap.xml'))) {
  const sitemap = fs.readFileSync(path.join(projectDir, 'sitemap.xml'), 'utf8');
  const locs = sitemap.match(/<loc>([^<]+)<\/loc>/g) || [];
  console.log(`Total de URLs no sitemap: ${locs.length}`);
  const wwwLocs = locs.filter(l => l.includes('www.'));
  console.log(`Total com www no sitemap: ${wwwLocs.length}`);
  if (wwwLocs.length > 0) {
    console.log('Exemplos com www:', wwwLocs.slice(0, 5));
  }
}
