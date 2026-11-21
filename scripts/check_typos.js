const fs = require('fs');
const cache = JSON.parse(fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/cache_blog.json', 'utf8'));

const ids = [16, 21, 31, 34, 37, 47, 62];

ids.forEach(id => {
  const p = cache.find(x => x.id === id);
  console.log(`[ID ${id}] Real Title in Cache/MySQL: "${p ? p.title : 'NOT FOUND'}" | Slug: "${p ? p.slug : ''}"`);
});
