const fs = require('fs');
const posts = JSON.parse(fs.readFileSync('C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY\\api\\cache_blog.json', 'utf8'));

const hours = {};
posts.forEach(p => {
  const d = p.created_at;
  const time = d.split(' ')[1] || 'none';
  const hour = time.split(':')[0] || 'none';
  hours[hour] = (hours[hour] || 0) + 1;
});
console.log('Distribution of hours in created_at across all 144 records:');
console.log(hours);

console.log('\n--- Primeiros 10 artigos publicados (IDs 1 a 10): ---');
posts.filter(p => p.id <= 10).sort((a,b) => a.id - b.id).forEach(p => {
  console.log(`ID ${p.id.toString().padStart(3, ' ')}: ${p.created_at} | ${p.title.substring(0, 50)}`);
});

console.log('\n--- Amostra de artigos agendados (IDs 22 a 32): ---');
posts.filter(p => p.id >= 22 && p.id <= 32).sort((a,b) => a.id - b.id).forEach(p => {
  console.log(`ID ${p.id.toString().padStart(3, ' ')}: ${p.created_at} | ${p.title.substring(0, 50)}`);
});

console.log('\n--- Amostra dos últimos artigos (IDs 135 a 144): ---');
posts.filter(p => p.id >= 135 && p.id <= 144).sort((a,b) => a.id - b.id).forEach(p => {
  console.log(`ID ${p.id.toString().padStart(3, ' ')}: ${p.created_at} | ${p.title.substring(0, 50)}`);
});
