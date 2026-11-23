const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

console.log('=== 1. ATUALIZANDO IMAGENS DO BLOG (SEED E CACHE) ===\n');

const seedPath = path.join(projectRoot, 'api', 'seed_blog.json');
const cachePath = path.join(projectRoot, 'api', 'cache_blog.json');

const seedBlog = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
const cacheBlog = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

// Mapa específico de melhorias de imagem por ID de artigo
const IMAGE_UPDATES = {
  // Correção dos que davam 404
  48: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80', // Profissões acessíveis / início
  55: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=800&auto=format&fit=crop&q=80', // Maior defeito em entrevista
  84: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80', // Vagas falsas e golpes online
  106: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80', // Crianças e adolescentes na internet
  128: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=800&auto=format&fit=crop&q=80', // Vender pela internet / e-commerce
  173: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&h=630&auto=format&fit=crop&q=85', // Cronobiologia / horário de estudos

  // Diversificação dos artigos de ferramentas que compartilhavam a mesma imagem genérica
  145: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop&q=80', // Google Agenda / horários
  146: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80', // Scanner apps / celular
  147: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&auto=format&fit=crop&q=80', // Todoist / lista de tarefas
  148: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=80', // Notion / painel de estudos
  149: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80', // Microsoft To Do / rotina
  150: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&auto=format&fit=crop&q=80', // Google Tasks / Gmail
  151: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80', // Calendários compartilhados / grupo
  152: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop&q=80', // TickTick / Pomodoro
  153: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&auto=format&fit=crop&q=80', // Trello / Kanban
  154: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80', // Digitalizar apostilas / OCR
  155: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80', // Anki / Flashcards
  156: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&auto=format&fit=crop&q=80', // Método Cornell / Caderno
  157: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80', // Mapas Mentais
  158: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&auto=format&fit=crop&q=80', // Grifar PDFs
  159: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80', // Palácio da Memória
  160: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80', // Obsidian / Segundo Cérebro
  161: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80', // Flashcards Físicos vs Digitais
  162: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&auto=format&fit=crop&q=80', // Leitura Ativa em PDFs
  163: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80', // Sketchnoting / Resumos Visuais
  164: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&auto=format&fit=crop&q=80', // Técnica Feynman Visual
  16: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',  // Fundação Bradesco
  127: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&auto=format&fit=crop&q=80' // Acessibilidade & Tecnologia
};

function applyImageUpdates(blogArray) {
  let updatedCount = 0;
  blogArray.forEach(post => {
    if (IMAGE_UPDATES[post.id]) {
      post.cover_image = IMAGE_UPDATES[post.id];
      updatedCount++;
    }
  });
  return updatedCount;
}

const updatedSeed = applyImageUpdates(seedBlog);
const updatedCache = applyImageUpdates(cacheBlog);

fs.writeFileSync(seedPath, JSON.stringify(seedBlog, null, 2), 'utf8');
fs.writeFileSync(cachePath, JSON.stringify(cacheBlog, null, 2), 'utf8');
console.log(`✅ seed_blog.json: ${updatedSeed} capas de artigos atualizadas.`);
console.log(`✅ cache_blog.json: ${updatedCache} capas de artigos atualizadas.`);

// 2. Adicionar fallback onerror nas renderizações de imagem em src/blog.js e artigo.php
console.log('\n=== 2. ADICIONANDO FALLBACK RESILIENTE ONERROR EM BLOG.JS E ARTIGO.PHP ===\n');

const blogJsPath = path.join(projectRoot, 'src', 'blog.js');
let blogJs = fs.readFileSync(blogJsPath, 'utf8');

const targetImgTag = '<img src="${escapeHTML(post.cover_image)}" alt="${escapeHTML(post.title)}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">';
const replacementImgTag = '<img src="${escapeHTML(post.cover_image)}" alt="${escapeHTML(post.title)}" loading="lazy" onerror="this.onerror=null; this.src=\'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80\';" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">';

if (blogJs.includes(targetImgTag)) {
  blogJs = blogJs.replace(targetImgTag, replacementImgTag);
  fs.writeFileSync(blogJsPath, blogJs, 'utf8');
  console.log('✅ src/blog.js: fallback onerror implementado na grade de artigos.');
}

const artigoPhpPath = path.join(projectRoot, 'artigo.php');
let artigoPhp = fs.readFileSync(artigoPhpPath, 'utf8');
const targetArtigoImg = `src="<?= htmlspecialchars($coverImage, ENT_QUOTES, 'UTF-8') ?>" 
          alt="<?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?>" 
          loading="eager"
          class="w-full h-auto max-h-[460px] object-cover"`;
const repArtigoImg = `src="<?= htmlspecialchars($coverImage, ENT_QUOTES, 'UTF-8') ?>" 
          alt="<?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?>" 
          loading="eager"
          onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&auto=format&fit=crop&q=85';"
          class="w-full h-auto max-h-[460px] object-cover"`;

if (artigoPhp.includes(targetArtigoImg)) {
  artigoPhp = artigoPhp.replace(targetArtigoImg, repArtigoImg);
  fs.writeFileSync(artigoPhpPath, artigoPhp, 'utf8');
  console.log('✅ artigo.php: fallback onerror implementado na visualização do artigo.');
}

// 3. PADRONIZAR E-MAIL DE CONTATO: contato@vocepodetudo.com
console.log('\n=== 3. PADRONIZANDO E-MAIL DE CONTATO PARA contato@vocepodetudo.com ===\n');

const filesToUpdateEmail = [
  'central-de-ajuda.html',
  'index.html',
  'lgpd.html',
  'parcerias.html',
  'politica-de-cookies.html',
  'politica-editorial.html',
  'politica-privacidade.html',
  'termos-de-servico.html',
  'termos-de-uso.html'
];

filesToUpdateEmail.forEach(file => {
  const p = path.join(projectRoot, file);
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');
  const count = (content.match(/contato\.vocepodetudo@gmail\.com/g) || []).length;
  if (count > 0) {
    content = content.replace(/contato\.vocepodetudo@gmail\.com/g, 'contato@vocepodetudo.com');
    fs.writeFileSync(p, content, 'utf8');
    console.log(`✅ ${file}: ${count} ocorrência(s) atualizadas para contato@vocepodetudo.com`);
  }
});

console.log('\n=== OPERAÇÃO CONCLUÍDA COM SUCESSO ===');
