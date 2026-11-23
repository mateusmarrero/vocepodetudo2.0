const fs = require('fs');

const seedBlog = JSON.parse(fs.readFileSync('api/seed_blog.json', 'utf8'));
const cacheBlog = JSON.parse(fs.readFileSync('api/cache_blog.json', 'utf8'));

console.log('Seed blog total:', seedBlog.length);
console.log('Cache blog total:', cacheBlog.length);

// Verificar campos de imagem em seedBlog e cacheBlog
let missingSeed = 0;
seedBlog.forEach((post, i) => {
  if (!post.cover_image || post.cover_image.trim() === '') {
    console.log(`Seed post [${post.id}] "${post.title}" SEM cover_image!`);
    missingSeed++;
  }
});

let missingCache = 0;
cacheBlog.forEach((post, i) => {
  if (!post.cover_image || post.cover_image.trim() === '') {
    console.log(`Cache post [${post.id}] "${post.title}" SEM cover_image!`);
    missingCache++;
  }
});

console.log('Total sem cover_image em seed:', missingSeed);
console.log('Total sem cover_image em cache:', missingCache);

// Verificar se há imagens repetidas, quebradas ou inválidas
const imageCounts = {};
seedBlog.forEach(p => {
  if (p.cover_image) {
    imageCounts[p.cover_image] = (imageCounts[p.cover_image] || 0) + 1;
  }
});

console.log('Total de URLs de imagens únicas:', Object.keys(imageCounts).length);
console.log('\nImagens mais repetidas:');
Object.entries(imageCounts)
  .filter(([url, count]) => count > 3)
  .sort((a, b) => b[1] - a[1])
  .forEach(([url, count]) => {
    console.log(`  Count ${count}: ${url.substring(0, 70)}...`);
  });
