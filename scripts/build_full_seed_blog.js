/**
 * scripts/build_full_seed_blog.js
 * Consolida os 7 artigos existentes com os 30 novos artigos agendados para Novembro/2026.
 */

const fs = require('fs');
const path = require('path');

const SEED_FILE = path.join(__dirname, '..', 'api', 'seed_blog.json');
const CACHE_FILE = path.join(__dirname, '..', 'api', 'cache_blog.json');

const batch1 = require('./blog_generator/batch1');
const batch2 = require('./blog_generator/batch2');
const batch3 = require('./blog_generator/batch3');

let originalSeed = [];
if (fs.existsSync(SEED_FILE)) {
  const content = fs.readFileSync(SEED_FILE, 'utf8');
  originalSeed = JSON.parse(content);
}

// Manter apenas os IDs 1 a 7 originais para no duplicar em reexecues
const baseArticles = originalSeed.filter(p => Number(p.id) >= 1 && Number(p.id) <= 7);

const newArticles = [...batch1, ...batch2, ...batch3];

const allArticles = [...baseArticles, ...newArticles];

// Validaes
const ids = new Set();
const slugs = new Set();
allArticles.forEach(a => {
  if (ids.has(a.id)) throw new Error(`ID duplicado: ${a.id}`);
  if (slugs.has(a.slug)) throw new Error(`Slug duplicado: ${a.slug}`);
  ids.add(a.id);
  slugs.add(a.slug);
});

// Ordenar por ID ascendente para organizao limpa
allArticles.sort((a, b) => Number(a.id) - Number(b.id));

const jsonOutput = JSON.stringify(allArticles, null, 2);

fs.writeFileSync(SEED_FILE, jsonOutput, 'utf8');
console.log(`Sucesso: ${allArticles.length} artigos gravados em ${SEED_FILE}`);

if (fs.existsSync(CACHE_FILE)) {
  fs.writeFileSync(CACHE_FILE, jsonOutput, 'utf8');
  console.log(`Cache atualizado em ${CACHE_FILE}`);
} else {
  fs.writeFileSync(CACHE_FILE, jsonOutput, 'utf8');
  console.log(`Cache criado em ${CACHE_FILE}`);
}
