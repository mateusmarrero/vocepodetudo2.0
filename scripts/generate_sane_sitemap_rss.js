const fs = require('fs');
const { execSync } = require('child_process');

// 1. Gerar sitemap.xml estático saneado a partir de sitemap.php
const sitemapXml = execSync('php "C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY\\sitemap.php"', { encoding: 'utf8' });
// Remover eventuais avisos de stderr/erro antes do xml
const xmlStart = sitemapXml.indexOf('<?xml');
if (xmlStart !== -1) {
  const cleanXml = sitemapXml.substring(xmlStart).trim();
  fs.writeFileSync('C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY\\sitemap.xml', cleanXml + '\n', 'utf8');
  console.log('sitemap.xml estático atualizado com sucesso!');
} else {
  console.error('Falha ao obter XML de sitemap.php');
}

// 2. Atualizar api/rss.php para usar URLs oficiais /artigo/{slug} e timezone correto
let rssPhp = fs.readFileSync('C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY\\api\\rss.php', 'utf8');
if (!rssPhp.includes('config.php')) {
  rssPhp = rssPhp.replace('declare(strict_types=1);', 'declare(strict_types=1);\n\nrequire_once __DIR__ . \'/config.php\';');
}
rssPhp = rssPhp.replace(
  /\$url = 'https:\/\/www\.vocepodetudo\.com\/blog\.html\?artigo=' \. urlencode\(\(string\)\$p\['slug'\]\);/g,
  "$url = 'https://vocepodetudo.com/artigo/' . urlencode((string)$p['slug']);"
);
rssPhp = rssPhp.replace(
  /<link>https:\/\/www\.vocepodetudo\.com\/blog\.html<\/link>/g,
  '<link>https://vocepodetudo.com/blog</link>'
);
fs.writeFileSync('C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY\\api\\rss.php', rssPhp, 'utf8');
console.log('api/rss.php atualizado com sucesso!');

// 3. Gerar rss.xml estático saneado
const rssXml = execSync('php "C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY\\api\\rss.php"', { encoding: 'utf8' });
const rssStart = rssXml.indexOf('<?xml');
if (rssStart !== -1) {
  const cleanRss = rssXml.substring(rssStart).trim();
  fs.writeFileSync('C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY\\rss.xml', cleanRss + '\n', 'utf8');
  console.log('rss.xml estático atualizado com sucesso!');
} else {
  console.error('Falha ao obter XML de api/rss.php');
}
