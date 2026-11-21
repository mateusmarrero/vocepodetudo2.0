const fs = require('fs');
const cache = JSON.parse(fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/cache_blog.json', 'utf8'));
const publishedIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 138, 139, 140, 141, 142, 143, 144];

const pubArticles = cache.filter(p => publishedIds.includes(p.id)).sort((a,b) => a.id - b.id);
console.log('Total published loaded:', pubArticles.length);

const results = pubArticles.map(p => {
  const text = p.content ? p.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    length: text.length,
    words: text.split(' ').length,
    first150: text.substring(0, 150),
    last150: text.substring(text.length - 150)
  };
});

fs.writeFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/scripts/published_analysis.json', JSON.stringify(results, null, 2), 'utf8');
console.log('Saved to scripts/published_analysis.json');
