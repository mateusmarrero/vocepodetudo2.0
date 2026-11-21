const fs = require('fs');

['cursos-gratis-administracao.html', 'cursos-gratis-ingles.html'].forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  const target = '<a href="politica-privacidade" class="hover:text-emerald-400 transition-colors font-medium text-slate-300">Política de Privacidade</a>';
  if (content.includes(target)) {
    content = content.replace(target, `<a href="midia-kit" class="hover:text-emerald-400 transition-colors font-bold text-emerald-400">Mídia Kit</a>\n        <span>•</span>\n        ` + target);
    fs.writeFileSync(f, content, 'utf8');
    console.log(`✅ ${f}: link adicionado`);
  }
});

let tdu = fs.readFileSync('termos-de-uso.html', 'utf8');
const targetTdu = '<a href="politica-privacidade" class="hover:text-emerald-700 transition-colors">Privacidade & Cookies</a>';
if (tdu.includes(targetTdu)) {
  tdu = tdu.replace(targetTdu, `<a href="midia-kit" class="hover:text-emerald-700 transition-colors font-bold">Mídia Kit</a>\n        <span>•</span>\n        ` + targetTdu);
  fs.writeFileSync('termos-de-uso.html', tdu, 'utf8');
  console.log(`✅ termos-de-uso.html: link adicionado`);
}
