const fs = require('fs');

const pairs = JSON.parse(fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/scripts/top_54_canibalizacao_pairs.json', 'utf8'));
const reconciled = JSON.parse(fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/scripts/reconciled_144_dataset.json', 'utf8'));

// Mapa rápido por ID
const postMap = {};
reconciled.forEach(p => {
  postMap[p.id] = p;
});

const enrichedPairs = pairs.map((pair, idx) => {
  const pA = postMap[pair.postA.id] || pair.postA;
  const pB = postMap[pair.postB.id] || pair.postB;

  let riskType = 'Intenções de Busca Distintas (Fórmula de Título Compartilhada)';
  let recommendation = 'Manter ambos independentes; nenhuma ação necessária além da linkagem cruzada natural.';

  // Casos específicos de alto risco potencial
  if ((pA.id === 138 && pB.id === 94) || (pA.id === 94 && pB.id === 138)) {
    riskType = 'Risco Potencial de Sobreposição Semântica (Seguro-Desemprego)';
    recommendation = 'Diferenciação Editorial Rigorosa: Artigo 138 foca em regras de concessão, faixas de cálculo e tabela oficial 2026; Artigo 94 foca no passo a passo prático do app Gov.br / Carteira Digital e solução de pendências.';
  } else if ((pA.id === 143 && pB.id === 11) || (pA.id === 11 && pB.id === 143)) {
    riskType = 'Risco Potencial de Sobreposição Semântica (Primeiro Emprego sem Experiência)';
    recommendation = 'Diferenciação Editorial: Artigo 143 foca no guia completo de canais de entrada e estrutura de primeiro currículo; Artigo 11 foca em táticas de entrevista e projetos voluntários/extracurriculares como experiência.';
  } else if ((pA.id === 1 && pB.id === 42) || (pA.id === 42 && pB.id === 1)) {
    riskType = 'Risco Potencial de Sobreposição Semântica (Currículo ATS sem Experiência)';
    recommendation = 'Diferenciação Editorial: Artigo 1 foca no público jovem / recém-formado; Artigo 42 foca em profissionais em transição de carreira de outros setores.';
  } else if ((pA.id === 21 && pB.id === 73) || (pA.id === 73 && pB.id === 21)) {
    riskType = 'Risco Potencial de Sobreposição Semântica (Recolocação e Carreira 40+/50+)';
    recommendation = 'Diferenciação Editorial: Artigo 21 foca no combate ao etarismo e atualização para o regime CLT; Artigo 73 foca em consultoria autônoma, mentoria e abertura de MEI.';
  } else if (pA.category === pB.category && (pA.title.includes('Série') || pB.title.includes('Série') || pA.title.includes('Do Zero') || pB.title.includes('Do Zero'))) {
    riskType = 'Complementaridade Pedagógica (Série Temática Modular)';
    recommendation = 'Preservar ambos; implementar linkagem interna sequencial ("Artigo Anterior" e "Próximo Artigo da Série").';
  }

  return {
    pair_index: idx + 1,
    id_a: pA.id,
    title_a: pA.title,
    status_a: pA.status,
    date_a: pA.created_at,
    slug_a: pA.slug,
    id_b: pB.id,
    title_b: pB.title,
    status_b: pB.status,
    date_b: pB.created_at,
    slug_b: pB.slug,
    risk_type: riskType,
    recommendation: recommendation
  };
});

fs.writeFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/scripts/reconciled_54_pairs_matrix.json', JSON.stringify(enrichedPairs, null, 2), 'utf8');
console.log('54 pairs matrix enriched and reconciled successfully!');
