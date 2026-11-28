const fs = require('fs');

const seedPath = 'api/seed_blog.json';
const cachePath = 'api/cache_blog.json';

const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
const art = seed.find(a => a.id === 175);

if (!art) {
  console.error('Artigo 175 não encontrado');
  process.exit(1);
}

const calloutLattes = `
<div class="my-8 p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-850 border-2 border-amber-300 dark:border-amber-700 shadow-sm space-y-3">
  <div class="flex items-center gap-2">
    <span class="p-2 rounded-xl bg-amber-500 text-white font-black"><i data-lucide="award" class="w-5 h-5"></i></span>
    <div>
      <span class="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-400">Ferramenta Gratuita do Você Pode Tudo</span>
      <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">Assistente de Preenchimento do Currículo Lattes</h3>
    </div>
  </div>
  <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
    Em vez de quebrar a cabeça tentando redigir o resumo padrão do CNPq ou descobrir onde colar cada informação, utilize o nosso <strong>Assistente de Currículo Lattes</strong>. Ele gera seu resumo biográfico em 3ª pessoa automaticamente e organiza seus dados por módulos para cópia em 1 clique.
  </p>
  <div class="pt-2 flex items-center gap-3 flex-wrap">
    <a href="/assistente-curriculo-lattes" class="px-4 py-2.5 rounded-xl text-xs font-black bg-amber-600 hover:bg-amber-700 text-white shadow-sm inline-flex items-center gap-2 transition-all">
      <i data-lucide="sparkles" class="w-4 h-4 text-[#ffdf00]"></i>
      <span>Abrir Assistente de Lattes Grátis</span>
    </a>
    <a href="/central-academica" class="px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-700 hover:bg-slate-50 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 inline-flex items-center gap-2 transition-all">
      <i data-lucide="graduation-cap" class="w-4 h-4 text-[#002776]"></i>
      <span>Ver Central Acadêmica</span>
    </a>
  </div>
</div>
`;

const calloutAbnt = `
<div class="my-8 p-6 rounded-3xl bg-blue-50 dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-800 shadow-sm space-y-3">
  <div class="flex items-center gap-2">
    <span class="p-2 rounded-xl bg-[#002776] text-white font-black"><i data-lucide="book-check" class="w-5 h-5"></i></span>
    <div>
      <span class="text-xs font-black uppercase tracking-wider text-[#002776] dark:text-blue-400">Normalização ABNT Automática</span>
      <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">Precisa formatar publicações e referências do seu TCC?</h3>
    </div>
  </div>
  <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
    Para registrar seus artigos, capítulos de livros ou monografias nas normas oficiais, utilize nosso <strong>Gerador de Referências ABNT NBR 6023</strong>. Formata obras completas com negrito para Word e Google Docs em poucos segundos.
  </p>
  <div class="pt-2">
    <a href="/gerador-referencias-abnt" class="px-4 py-2.5 rounded-xl text-xs font-black bg-[#002776] hover:bg-blue-900 text-white shadow-sm inline-flex items-center gap-2 transition-all">
      <i data-lucide="book-open" class="w-4 h-4 text-[#ffdf00]"></i>
      <span>Formatar Referências na NBR 6023</span>
    </a>
  </div>
</div>
`;

const targetHeading1 = '<h2 class="text-xl font-black text-slate-900 dark:text-white mt-8 mb-4">Como Criar um Currículo Lattes Passo a Passo</h2>';
const targetHeading2 = '<h2 class="text-xl font-black text-slate-900 dark:text-white mt-8 mb-4">Conclusão</h2>';

if (!art.content.includes('/assistente-curriculo-lattes')) {
  art.content = art.content.replace(targetHeading1, calloutLattes + '\n' + targetHeading1);
}
if (!art.content.includes('/gerador-referencias-abnt')) {
  art.content = art.content.replace(targetHeading2, calloutAbnt + '\n' + targetHeading2);
}

fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2), 'utf8');
fs.writeFileSync(cachePath, JSON.stringify(seed, null, 2), 'utf8');

console.log('Artigo 175 atualizado com sucesso em seed e cache!');
