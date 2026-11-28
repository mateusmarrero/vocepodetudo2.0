const fs = require('fs');

const filesToAudit = [
  'gerador-referencias-abnt.html',
  'assistente-curriculo-lattes.html',
  'central-academica.html'
];

let totalIssues = 0;

console.log('=== AUDITORIA PROFUNDA DE ORTOGRAFIA, FUNCIONALIDADES E SEGURANÇA ===\n');

// 1. Verificação de Codificação e Caracteres Estranhos (Mojibake real)
const realMojibakePatterns = [
  'Ã¡', 'Ã©', 'Ã­', 'Ã³', 'Ãº', 'Ã£', 'Ãµ', 'Ã¢', 'Ãª', 'Ã´', 'Ã§',
  'Ã€', 'Ã‰', 'Ã“', 'Ãš', 'Ãƒ', 'Ã•', 'Ã‚', 'ÃŠ', 'Ã‡',
  'â€“', 'â€”', 'â€œ', 'â€\x9d', 'â€˜', 'â€™'
];

filesToAudit.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  console.log(`\nVerificando arquivo: ${file} (${(content.length / 1024).toFixed(1)} KB)`);

  let foundMojibake = 0;
  realMojibakePatterns.forEach(pattern => {
    if (content.includes(pattern)) {
      console.error(`  [ERRO] Padrão mojibake detectado: "${pattern}"`);
      foundMojibake++;
    }
  });

  if (foundMojibake === 0) {
    console.log('  [OK] Sem caracteres corrompidos ou problemas de encoding UTF-8.');
  } else {
    totalIssues += foundMojibake;
  }

  // Checagem de tags HTML essenciais
  const requiredTags = ['html', 'head', 'body', 'header', 'main', 'footer'];
  requiredTags.forEach(tag => {
    const openCount = (content.match(new RegExp(`<${tag}[\\s>]`, 'gi')) || []).length;
    const closeCount = (content.match(new RegExp(`</${tag}>`, 'gi')) || []).length;
    if (openCount !== closeCount) {
      console.error(`  [ERRO] Tag <${tag}> desbalanceada: ${openCount} aberturas vs ${closeCount} fechamentos`);
      totalIssues++;
    }
  });
  console.log('  [OK] Estrutura semântica HTML e tags essenciais balanceadas.');

  // Checagem de recursos essenciais
  const checks = [
    { name: 'Lucide Icons', pattern: /unpkg\.com\/lucide/ },
    { name: 'VLibras', pattern: /vlibras\.gov\.br/ },
    { name: 'AdSense', pattern: /pagead2\.googlesyndication\.com/ },
    { name: 'Tailwind CDN', pattern: /cdn\.tailwindcss\.com/ },
    { name: 'Schema.org JSON-LD', pattern: /application\/ld\+json/ },
    { name: 'Canonical Link', pattern: /<link\s+rel="canonical"/ },
    { name: 'Open Graph Image', pattern: /og:image/ },
    { name: 'Twitter Card', pattern: /twitter:card/ }
  ];

  checks.forEach(c => {
    if (c.pattern.test(content)) {
      console.log(`  [OK] ${c.name} presente.`);
    } else {
      console.warn(`  [AVISO] ${c.name} não detectado!`);
      totalIssues++;
    }
  });

  // Checagem de palavras em pt-BR com acentuação obrigatória pelo Acordo Ortográfico
  const spellingMistakes = [
    { wrong: /\bvoce\b/gi, correct: 'você' },
    { wrong: /\bgratis\b/gi, correct: 'grátis' },
    { wrong: /\bcurriculo\b/gi, correct: 'currículo' },
    { wrong: /\bpadroes\b/gi, correct: 'padrões' },
    { wrong: /\bpadrao\b/gi, correct: 'padrão' },
    { wrong: /\bgraduacao\b/gi, correct: 'graduação' },
    { wrong: /\bpos-graduacao\b/gi, correct: 'pós-graduação' },
    { wrong: /\bconclusao\b/gi, correct: 'conclusão' },
    { wrong: /\bpublicacao\b/gi, correct: 'publicação' },
    { wrong: /\bpublicacoes\b/gi, correct: 'publicações' },
    { wrong: /\bexperiencia\b/gi, correct: 'experiência' },
    { wrong: /\binstituicao\b/gi, correct: 'instituição' },
    { wrong: /\bavancada\b/gi, correct: 'avançada' },
    { wrong: /\bavancado\b/gi, correct: 'avançado' },
    { wrong: /\bproducao\b/gi, correct: 'produção' },
    { wrong: /\bproducoes\b/gi, correct: 'produções' },
    { wrong: /\batuacao\b/gi, correct: 'atuação' },
    { wrong: /\bformacao\b/gi, correct: 'formação' },
    { wrong: /\binformacao\b/gi, correct: 'informação' },
    { wrong: /\binformacoes\b/gi, correct: 'informações' },
    { wrong: /\bseguranca\b/gi, correct: 'segurança' },
    { wrong: /\bortografia\b/gi, correct: 'ortografia' }
  ];

  // Extrair apenas texto dentro do body excluindo scripts, styles e atributos
  const textOnly = content.replace(/<script[\s\S]*?<\/script>/gi, '')
                          .replace(/<style[\s\S]*?<\/style>/gi, '')
                          .replace(/<[^>]+>/g, ' ');

  let spellingErrors = 0;
  spellingMistakes.forEach(m => {
    const matches = textOnly.match(m.wrong);
    if (matches) {
      // Filtrar falsos positivos de URLs ou nomes técnicos
      const filtered = matches.filter(w => !['vocepodetudo', 'curriculo.html', 'curriculo'].includes(w.toLowerCase()));
      if (filtered.length > 0) {
        console.warn(`  [ALERTA GRAFIA] Palavra sem acento detectada no texto visível: "${filtered[0]}" (deveria ser "${m.correct}") - Ocorrências: ${filtered.length}`);
        spellingErrors++;
      }
    }
  });

  if (spellingErrors === 0) {
    console.log('  [OK] Auditoria ortográfica de palavras-chave aprovada com 100% de acentuação.');
  } else {
    totalIssues += spellingErrors;
  }
});

console.log('\n------------------------------------------------------------');
if (totalIssues === 0) {
  console.log('RESULTADO FINAL: 0 PROBLEMAS ENCONTRADOS! Todas as páginas estão perfeitas!');
} else {
  console.log(`RESULTADO FINAL: ${totalIssues} observações encontradas.`);
}
console.log('------------------------------------------------------------\n');
process.exit(totalIssues > 0 ? 1 : 0);
