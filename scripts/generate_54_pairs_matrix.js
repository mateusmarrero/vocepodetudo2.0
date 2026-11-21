const fs = require('fs');
const path = require('path');

const ROOT = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY';
const posts = JSON.parse(fs.readFileSync(path.join(ROOT, 'api/cache_blog.json'), 'utf8'));

function tokenize(text) {
  const stopwords = new Set([
    'como', 'para', 'com', 'sem', 'mais', 'guia', 'completo', 'dicas', 'passo', 'melhores',
    'sobre', 'qual', 'quando', 'onde', 'porque', 'fazer', 'voce', 'sua', 'seu', 'suas', 'seus',
    'pelo', 'pela', 'pelos', 'pelas', 'numa', 'num', 'este', 'esta', 'isto', 'isso', 'aquilo',
    'muito', 'muitos', 'todo', 'toda', 'todos', 'todas', 'outro', 'outra', 'outros', 'outras',
    'mesmo', 'mesma', 'mesmos', 'mesmas'
  ]);

  return text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.has(w));
}

// Calcular similaridade entre todos os pares
const allPairs = [];
for (let i = 0; i < posts.length; i++) {
  const pA = posts[i];
  const tokensA = new Set(tokenize(pA.title + ' ' + (pA.tags || '') + ' ' + (pA.excerpt || '')));
  const titleTokensA = new Set(tokenize(pA.title));

  for (let j = i + 1; j < posts.length; j++) {
    const pB = posts[j];
    const tokensB = new Set(tokenize(pB.title + ' ' + (pB.tags || '') + ' ' + (pB.excerpt || '')));
    const titleTokensB = new Set(tokenize(pB.title));

    // Termos em comum nos títulos
    const commonTitleTokens = Array.from(titleTokensA).filter(t => titleTokensB.has(t));
    
    // Termos em comum gerais
    let commonAll = 0;
    tokensA.forEach(t => {
      if (tokensB.has(t)) commonAll++;
    });
    const unionAll = new Set([...tokensA, ...tokensB]).size;
    const similarity = unionAll > 0 ? (commonAll / unionAll) : 0;

    // Pontuação combinada ponderada por sobreposição de título e categoria
    let score = similarity * 100;
    if (pA.category === pB.category) score += 15;
    if (commonTitleTokens.length >= 2) score += 20 * commonTitleTokens.length;

    allPairs.push({
      postA: { id: pA.id, title: pA.title, slug: pA.slug, cat: pA.category, date: pA.created_at },
      postB: { id: pB.id, title: pB.title, slug: pB.slug, cat: pB.category, date: pB.created_at },
      commonTitleTokens,
      score: Number(score.toFixed(1)),
      similarity: Number((similarity * 100).toFixed(1))
    });
  }
}

// Ordenar pelos 54 pares de maior proximidade
allPairs.sort((a, b) => b.score - a.score);
const top54Pairs = allPairs.slice(0, 54);

console.log(`Gerados exatamente ${top54Pairs.length} pares de maior sobreposição potencial.`);

fs.writeFileSync(path.join(ROOT, 'scripts/top_54_canibalizacao_pairs.json'), JSON.stringify(top54Pairs, null, 2), 'utf8');
console.log('Salvo em scripts/top_54_canibalizacao_pairs.json');
