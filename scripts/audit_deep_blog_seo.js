const fs = require('fs');
const path = require('path');

const ROOT = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY';
const posts = JSON.parse(fs.readFileSync(path.join(ROOT, 'api/cache_blog.json'), 'utf8'));

console.log('===============================================================');
console.log('DIAGNÓSTICO PROFUNDO & AUDITORIA DE LINKS INTERNOS E CONTEÚDO');
console.log('===============================================================\n');

// 1. ANÁLISE DE LINKS INTERNOS NO CORPO EDITORIAL (CONTENT)
let withInternalLinks = 0;
let withoutInternalLinks = 0;
const articlesWithLinks = [];
const articlesWithoutLinks = [];

posts.forEach(p => {
  const content = p.content || '';
  // Procurar links internos explícitos no HTML do corpo editorial (excluindo templates)
  const matches = content.match(/href=["'](\/[^"']+|https?:\/\/(?:www\.)?vocepodetudo\.com[^"']*)/gi) || [];
  
  // Filtrar para garantir que são links internos de conteúdo (cursos, ferramentas, outros artigos)
  const internalHrefs = matches.map(m => m.replace(/href=["']/i, ''));
  
  if (internalHrefs.length > 0) {
    withInternalLinks++;
    articlesWithLinks.push({ id: p.id, title: p.title, count: internalHrefs.length, links: internalHrefs });
  } else {
    withoutInternalLinks++;
    articlesWithoutLinks.push({ id: p.id, title: p.title, slug: p.slug, category: p.category });
  }
});

console.log(`📊 TOTAL DE ARTIGOS ANALISADOS: ${posts.length}`);
console.log(`✅ Artigos com links contextuais no corpo editorial: ${withInternalLinks}`);
console.log(`⚠️ Artigos sem links contextuais no corpo editorial: ${withoutInternalLinks}`);

if (articlesWithLinks.length > 0) {
  console.log('\nExemplos de artigos que possuem links editoriais no corpo:');
  articlesWithLinks.slice(0, 5).forEach(a => {
    console.log(`  - [ID ${a.id}] ${a.title} (${a.count} links: ${a.links.slice(0, 2).join(', ')})`);
  });
}

// 2. MATRIZ DE SIMILARIDADE SEMÂNTICA ENTRE OS 144 ARTIGOS
// Cálculo de sobreposição de termos / palavras-chave para encontrar os pares de risco
function tokenize(text) {
  const stopwords = new Set([
    'como', 'para', 'com', 'sem', 'mais', 'guia', 'completo', 'dicas', 'passo', 'melhores',
    'sobre', 'qual', 'quando', 'onde', 'porque', 'fazer', 'voce', 'sua', 'seu', 'suas', 'seus',
    'pelo', 'pela', 'pelos', 'pelas', 'numa', 'num', 'este', 'esta', 'isto', 'isso', 'aquilo',
    'muito', 'muitos', 'todo', 'toda', 'todos', 'todas', 'outro', 'outra', 'outros', 'outras',
    'mesmo', 'mesma', 'mesmos', 'mesmas', 'serie', 'zero', 'mercado'
  ]);

  return text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.has(w));
}

const articlePairs = [];
for (let i = 0; i < posts.length; i++) {
  const pA = posts[i];
  const tokensA = new Set(tokenize(pA.title + ' ' + (pA.tags || '')));

  for (let j = i + 1; j < posts.length; j++) {
    const pB = posts[j];
    const tokensB = new Set(tokenize(pB.title + ' ' + (pB.tags || '')));

    let common = 0;
    tokensA.forEach(t => {
      if (tokensB.has(t)) common++;
    });

    const union = new Set([...tokensA, ...tokensB]).size;
    const similarity = union > 0 ? (common / union) : 0;

    // Se compartilham termos chave fortes
    if (common >= 2 && similarity >= 0.25) {
      articlePairs.push({
        postA: { id: pA.id, title: pA.title, slug: pA.slug, cat: pA.category, date: pA.created_at },
        postB: { id: pB.id, title: pB.title, slug: pB.slug, cat: pB.category, date: pB.created_at },
        commonTokens: Array.from(tokensA).filter(t => tokensB.has(t)),
        similarity: Number(similarity.toFixed(3)),
        commonCount: common
      });
    }
  }
}

articlePairs.sort((a, b) => b.similarity - a.similarity);

console.log(`\n🔍 TOTAL DE PARES COM POTENCIAL SOBREPOSIÇÃO DE TERMOS: ${articlePairs.length}`);
console.log('Top 10 Pares mais próximos lexicalmente:');
articlePairs.slice(0, 10).forEach((pair, idx) => {
  console.log(`\n[Par ${idx + 1}] Similaridade: ${(pair.similarity * 100).toFixed(1)}% | Termos em comum: [${pair.commonTokens.join(', ')}]`);
  console.log(`  Artigo A [ID ${pair.postA.id}]: "${pair.postA.title}" (${pair.postA.cat})`);
  console.log(`  Artigo B [ID ${pair.postB.id}]: "${pair.postB.title}" (${pair.postB.cat})`);
});

// Salvar resultados detalhados em JSON para fundamentar o relatório final
fs.writeFileSync(path.join(ROOT, 'scripts/deep_seo_audit_results.json'), JSON.stringify({
  summary: {
    totalArticles: posts.length,
    withInternalLinks,
    withoutInternalLinks,
    totalOverlappingPairs: articlePairs.length
  },
  articlesWithoutLinks: articlesWithoutLinks.map(a => ({ id: a.id, title: a.title, slug: a.slug, category: a.category })),
  overlappingPairs: articlePairs
}, null, 2), 'utf8');

console.log('\n✅ Resultados detalhados salvos em scripts/deep_seo_audit_results.json');
