const fs = require('fs');

console.log('🚀 Adicionando link do Mídia Kit em todas as páginas...');

// 1. Grupo A: Páginas com Coluna 4: Institucional
const groupA = [
  'blog.html',
  'calculadora-trabalhista.html',
  'contato.html',
  'curriculo.html',
  'downloads.html',
  'materiais-gratuitos.html',
  'sobre.html',
  'vagas.html'
];

groupA.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('href="midia-kit"')) {
    console.log(`- ${f}: já possui link para midia-kit`);
    return;
  }

  const target = '<span>Quem Somos</span>\n              </a>\n            </li>';
  if (content.includes(target)) {
    const replacement = target + `\n            <li>\n              <a href="midia-kit" class="hover:text-white transition-colors flex items-center gap-1.5 text-emerald-400 font-bold">\n                <i data-lucide="award" class="w-3.5 h-3.5 text-emerald-400"></i>\n                <span>Mídia Kit & Publicidade</span>\n              </a>\n            </li>`;
    content = content.replace(target, replacement);
    fs.writeFileSync(f, content, 'utf8');
    console.log(`✅ ${f}: link adicionado na Coluna 4 Institucional`);
  } else {
    console.warn(`⚠️ ${f}: target de Quem Somos não encontrado`);
  }
});

// 2. Grupo B: index.html
if (fs.existsSync('index.html')) {
  let indexContent = fs.readFileSync('index.html', 'utf8');
  if (!indexContent.includes('href="midia-kit"')) {
    const targetIndex = '<span>Criador de Currículos</span>\n          </a>';
    if (indexContent.includes(targetIndex)) {
      const replacementIndex = targetIndex + `\n          <span>•</span>\n          <a href="midia-kit" class="hover:underline flex items-center gap-1 text-[#009639] hover:text-[#00702a] font-bold" title="Dossiê Oficial de Audiência & Mídia Kit para Anunciantes">\n            <i data-lucide="award" class="w-3.5 h-3.5 text-[#009639]"></i>\n            <span>Mídia Kit & Publicidade</span>\n          </a>`;
      indexContent = indexContent.replace(targetIndex, replacementIndex);
      fs.writeFileSync('index.html', indexContent, 'utf8');
      console.log('✅ index.html: link adicionado no footer horizontal');
    }
  } else {
    console.log('- index.html: já possui link para midia-kit');
  }
}

// 3. Grupo C: simulador-entrevista.html e teste-vocacional.html
['simulador-entrevista.html', 'teste-vocacional.html'].forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('href="midia-kit"')) return;

  const target = '<a href="politica-privacidade"';
  if (content.includes(target)) {
    const replacement = `<a href="midia-kit" class="text-emerald-400 hover:text-white font-bold underline">Mídia Kit & Publicidade</a>\n          ` + target;
    content = content.replace(target, replacement);
    fs.writeFileSync(f, content, 'utf8');
    console.log(`✅ ${f}: link adicionado no footer`);
  }
});

// 4. Grupo D: Cursos Nichados e Vagas Jovem Aprendiz
const groupD = [
  'cursos-gratis-administracao.html',
  'cursos-gratis-excel.html',
  'cursos-gratis-ia.html',
  'cursos-gratis-informatica.html',
  'cursos-gratis-ingles.html',
  'cursos-gratis-programacao.html',
  'vagas-jovem-aprendiz-2026.html'
];

groupD.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('href="midia-kit"')) return;

  const target = '<a href="politica-privacidade" class="hover:text-slate-300 transition-colors">Privacidade</a>';
  if (content.includes(target)) {
    const replacement = `<a href="midia-kit" class="hover:text-emerald-400 font-bold transition-colors">Mídia Kit</a>\n        <span>•</span>\n        ` + target;
    content = content.replace(target, replacement);
    fs.writeFileSync(f, content, 'utf8');
    console.log(`✅ ${f}: link adicionado na barra inferior do footer`);
  }
});

// 5. Grupo E: Páginas Legais e 404
const groupE = [
  'politica-privacidade.html',
  'termos-de-uso.html',
  'exclusao-de-dados.html',
  '404.html'
];

groupE.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('href="midia-kit"')) return;

  const target = '<a href="termos-de-uso"';
  if (content.includes(target)) {
    const replacement = `<a href="midia-kit" class="hover:text-emerald-700 font-bold transition-colors">Mídia Kit</a>\n        <span>•</span>\n        ` + target;
    content = content.replace(target, replacement);
    fs.writeFileSync(f, content, 'utf8');
    console.log(`✅ ${f}: link adicionado no footer legal`);
  }
});

console.log('🎉 Finalizada a inclusão dos links de Mídia Kit!');
