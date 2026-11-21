const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const landingPages = [
  'cursos-gratis-excel.html',
  'cursos-gratis-informatica.html',
  'cursos-gratis-programacao.html',
  'cursos-gratis-ia.html',
  'cursos-gratis-administracao.html',
  'cursos-gratis-ingles.html',
  'vagas-jovem-aprendiz-2026.html'
];

const adBlockHtml = `
  <!-- Bloco Oficial AdSense Rodapé -->
  <div class="max-w-6xl mx-auto px-4 my-8 text-center">
    <div class="p-2 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center overflow-hidden">
      <span class="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Publicidade</span>
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="ca-pub-9421145457118515"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
      <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
    </div>
  </div>
`;

landingPages.forEach(fileName => {
  const filePath = path.join(root, fileName);
  if (!fs.existsSync(filePath)) {
    console.log('Nao existe:', fileName);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Inserir bloco AdSense antes do footer caso ainda não tenha
  if (!content.includes('class="adsbygoogle"')) {
    if (content.includes('<footer')) {
      content = content.replace('<footer', adBlockHtml + '\n  <footer');
    }
  }

  // 2. Adicionar links de Privacidade e Termos no footer se ainda não tiver
  if (!content.includes('politica-privacidade.html')) {
    const targetLink = '<a href="curriculo.html" class="hover:text-slate-300 transition-colors">Currículo</a>';
    const replacementLink = '<a href="curriculo.html" class="hover:text-slate-300 transition-colors">Currículo</a>\n          <a href="politica-privacidade.html" class="hover:text-slate-300 transition-colors">Privacidade</a>\n          <a href="termos-de-uso.html" class="hover:text-slate-300 transition-colors">Termos</a>';
    if (content.includes(targetLink)) {
      content = content.replace(targetLink, replacementLink);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Atualizado com sucesso:', fileName);
});
