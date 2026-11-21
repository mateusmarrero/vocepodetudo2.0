const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const NEW_VER = '4.55.0';

// 1. Atualizar index.html
const indexPath = path.join(ROOT_DIR, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

const targetP = `<p class="max-w-3xl mx-auto text-sm sm:text-lg text-slate-700 font-medium mb-6 leading-relaxed">
        Somos exclusivamente um <strong class="text-[#002776] font-black underline decoration-emerald-400 decoration-2">hub de cursos grátis e curadoria independente</strong>: não vendemos cursos, não cobramos mensalidades e não emitimos certificados próprios. Nossa missão é reunir e direcionar você diretamente para os programas oficiais das maiores instituições do mundo — como <strong class="text-slate-950">Fundação Bradesco, Governo Federal (EV.G), Microsoft Learn, Cisco, Sebrae, Oracle e Hackers do Bem</strong>. Todos com acesso livre e certificado gratuito emitido diretamente pelas fontes oficiais.
      </p>`;

const shortP = `<p class="max-w-3xl mx-auto text-sm sm:text-base text-slate-700 font-medium mb-6 leading-relaxed">
        Reunimos os programas oficiais mais disputados: <strong class="text-slate-950">Hackers do Bem, Oracle Next Education, Microsoft Learn, Cisco NetAcad, Fundação Bradesco, EV.G (Gov.br) e AWS</strong>. Todos 100% gratuitos para transformar sua carreira.
      </p>`;

if (indexHtml.includes(targetP)) {
  indexHtml = indexHtml.replace(targetP, shortP);
  console.log('✅ Texto do hero encurtado com sucesso em index.html (LF)');
} else if (indexHtml.includes(targetP.replace(/\n/g, '\r\n'))) {
  indexHtml = indexHtml.replace(targetP.replace(/\n/g, '\r\n'), shortP.replace(/\n/g, '\r\n'));
  console.log('✅ Texto do hero encurtado com sucesso em index.html (CRLF)');
} else {
  // Regex de fallback segura
  const regex = /<p class="max-w-3xl mx-auto text-sm sm:text-lg text-slate-700 font-medium mb-6 leading-relaxed">[\s\S]*?<\/p>/;
  if (regex.test(indexHtml)) {
    indexHtml = indexHtml.replace(regex, shortP);
    console.log('✅ Texto do hero encurtado via regex em index.html');
  } else {
    console.warn('⚠️ Não foi possível localizar o parágrafo no index.html');
  }
}

// Atualizar versioning em index.html para 4.55.0
indexHtml = indexHtml.replace(/\?v=\d+\.\d+\.\d+/g, `?v=${NEW_VER}`);
fs.writeFileSync(indexPath, indexHtml, 'utf8');

// 2. Atualizar sw.js
const swPath = path.join(ROOT_DIR, 'sw.js');
if (fs.existsSync(swPath)) {
  let sw = fs.readFileSync(swPath, 'utf8');
  sw = sw.replace(/const CACHE_NAME = 'vocepodetudo-pwa-v\d+\.\d+\.\d+';/, `const CACHE_NAME = 'vocepodetudo-pwa-v${NEW_VER}';`);
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log(`✅ sw.js atualizado para v=${NEW_VER}`);
}

console.log('🚀 Alteração concluída!');
