const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

const cards = [
  'curriculo-home-banner',
  'vagas-home-banner',
  'career-test-home-card',
  'blog-home-banner'
];

cards.forEach(id => {
  const exists = index.includes(`id="${id}"`);
  const pos = index.indexOf(`id="${id}"`);
  const slice = index.slice(Math.max(0, pos - 60), pos + 60);
  const isSquare = slice.includes('aspect-square');
  console.log(`${id} -> Presente: ${exists}, aspect-square: ${isSquare}`);
});
