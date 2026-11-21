/**
 * scripts/build_full_blog_137.js
 * Consolidação e validação de todos os 137 artigos editoriais do Você Pode Tudo
 * 
 * Cobertura de Agendamento Diário:
 * - 01/11/2026 até 10/03/2027 (mais de 4 meses ininterruptos!)
 */

const fs = require('fs');
const path = require('path');

const SEED_FILE = path.join(__dirname, '..', 'api', 'seed_blog.json');
const CACHE_FILE = path.join(__dirname, '..', 'api', 'cache_blog.json');

const batch1 = require('./blog_generator/batch1');
const batch2 = require('./blog_generator/batch2');
const batch3 = require('./blog_generator/batch3');
const batch4 = require('./blog_generator/batch4');
const batch5 = require('./blog_generator/batch5');
const batch6 = require('./blog_generator/batch6');
const batch7 = require('./blog_generator/batch7');
const batch8 = require('./blog_generator/batch8');
const batch9 = require('./blog_generator/batch9');
const batch10 = require('./blog_generator/batch10');
const batch11 = require('./blog_generator/batch11');
const batch12 = require('./blog_generator/batch12');
const batch13 = require('./blog_generator/batch13');

let originalSeed = [];
if (fs.existsSync(SEED_FILE)) {
  const content = fs.readFileSync(SEED_FILE, 'utf8');
  originalSeed = JSON.parse(content);
}

// Manter os 7 artigos originais (IDs 1 a 7)
const baseArticles = originalSeed.filter(p => Number(p.id) >= 1 && Number(p.id) <= 7);

const allArticles = [
  ...baseArticles,
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
  ...batch7,
  ...batch8,
  ...batch9,
  ...batch10,
  ...batch11,
  ...batch12,
  ...batch13
];

console.log(`Total combinado: ${allArticles.length} artigos.`);

// Validações rigorosas
const ids = new Set();
const slugs = new Set();

allArticles.forEach((a, idx) => {
  if (!a.id) throw new Error(`Artigo no índice ${idx} sem ID.`);
  if (ids.has(a.id)) throw new Error(`ID duplicado encontrado: ${a.id}`);
  ids.add(a.id);

  if (!a.slug) throw new Error(`Artigo ID ${a.id} sem slug.`);
  if (slugs.has(a.slug)) throw new Error(`Slug duplicado encontrado: ${a.slug}`);
  slugs.add(a.slug);

  if (!a.title || a.title.trim() === '') throw new Error(`Artigo ID ${a.id} sem título.`);
  if (!a.content || a.content.trim() === '') throw new Error(`Artigo ID ${a.id} sem conteúdo.`);
  if (!a.created_at) throw new Error(`Artigo ID ${a.id} sem created_at.`);
  if (!a.cover_image) throw new Error(`Artigo ID ${a.id} sem cover_image.`);
});

// Ordenar por ID crescente
allArticles.sort((a, b) => Number(a.id) - Number(b.id));

const jsonOutput = JSON.stringify(allArticles, null, 2);

fs.writeFileSync(SEED_FILE, jsonOutput, 'utf8');
console.log(`Gravação concluída em: ${SEED_FILE}`);

fs.writeFileSync(CACHE_FILE, jsonOutput, 'utf8');
console.log(`Gravação concluída em: ${CACHE_FILE}`);

console.log('\n--- RESUMO DE PUBLICAÇÃO CONSOLIDADA ---');
console.log(`Total de Artigos: ${allArticles.length}`);
console.log(`Artigo Inicial: ID ${allArticles[0].id} - ${allArticles[0].created_at} - "${allArticles[0].title}"`);
console.log(`Último Artigo: ID ${allArticles[allArticles.length - 1].id} - ${allArticles[allArticles.length - 1].created_at} - "${allArticles[allArticles.length - 1].title}"`);
