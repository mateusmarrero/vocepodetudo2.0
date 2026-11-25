const fs = require('fs');
const path = require('path');

const seedPath = path.resolve(__dirname, '../api/seed_courses.json');
const cachePath = path.resolve(__dirname, '../api/cache_courses.json');
const jsPath = path.resolve(__dirname, '../src/data/courses.js');

const courses = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

// Mapa específico para os 24 cursos com imagem 404 ou repetida
const specificReplacements = {
  // Empreendedorismo & Marketing
  'sebrae-mkt-digital-pequenos-negocios': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
  'marketing-digital': 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&w=600&q=80',
  'google-marketing-digital': 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80',
  'sebrae-marketing-primeiros-passos': 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=600&q=80',
  'orango-cresca-on-line': 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=600&q=80',
  'orango-vender-redes': 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=600&q=80',
  
  // Vendas, E-commerce & Dropshipping
  'sebrae-vender-online': 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=600&q=80',
  'sebrae-dropshipping': 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=600&q=80',
  'sebrae-preco-venda': 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80',
  'vendas-atendimento': 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&w=600&q=80',
  'sebrae-customer-success': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
  'sebrae-atendimento-inclusivo': 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80',

  // Negócios & MEI
  'sebrae-mei': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
  'formalizacao-mei': 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
  'gestao-pequenos-negocios': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
  'validacao-ideia': 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=600&q=80',
  'sebrae-startups': 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=600&q=80',

  // Finanças & Fluxo de Caixa
  'sebrae-fluxo-caixa': 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
  'sebrae-gestao-financeira': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
  'financas-empreendedor': 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=600&q=80',

  // Neuromarketing, Liderança & Gestão
  'sebrae-neuromarketing': 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=600&q=80',
  'lideranca-sebrae': 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80',
  'fgv-gestao-projetos': 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
  'etiqueta-corporativa': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'
};

let updatedCount = 0;
courses.forEach(c => {
  if (specificReplacements[c.id]) {
    c.imageUrl = specificReplacements[c.id];
    updatedCount++;
  }
});

console.log(`Substituídos ${updatedCount} cursos com imagens personalizadas e ativas.`);

// Salvar no seed_courses.json e cache_courses.json
fs.writeFileSync(seedPath, JSON.stringify(courses, null, 2), 'utf8');
console.log('Salvo em seed_courses.json');

if (fs.existsSync(cachePath)) {
  const cacheCourses = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  cacheCourses.forEach(c => {
    if (specificReplacements[c.id]) {
      c.imageUrl = specificReplacements[c.id];
    }
  });
  fs.writeFileSync(cachePath, JSON.stringify(cacheCourses, null, 2), 'utf8');
  console.log('Salvo em cache_courses.json');
}

// Atualizar src/data/courses.js
let jsContent = fs.readFileSync(jsPath, 'utf8');
for (const [id, newImg] of Object.entries(specificReplacements)) {
  // Substituir a imageUrl correspondente no objeto do curso
  const regex = new RegExp(`(id:\\s*['"]${id}['"][\\s\\S]*?imageUrl:\\s*['"])([^'"]+)(['"])`);
  if (regex.test(jsContent)) {
    jsContent = jsContent.replace(regex, `$1${newImg}$3`);
  }
}
fs.writeFileSync(jsPath, jsContent, 'utf8');
console.log('Salvo em src/data/courses.js');
