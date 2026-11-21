const fs = require('fs');
const path = require('path');

const blogJsPath = path.join(__dirname, '..', 'src', 'blog.js');
let js = fs.readFileSync(blogJsPath, 'utf8');

// 1. Atualizar URLs no openBlogReader
const targetUrls = `const directUrl = \`\${window.location.origin}/blog.html?artigo=\${encodeURIComponent(postSlugOrId)}\`;
    // artigo.php entrega tags Open Graph visuais em tempo real para WhatsApp, Facebook, LinkedIn e Telegram
    const shareUrl = \`\${window.location.origin}/artigo.php?p=\${encodeURIComponent(postSlugOrId)}\`;`;

const replacementUrls = `const directUrl = \`\${window.location.origin}/blog?artigo=\${encodeURIComponent(postSlugOrId)}\`;
    // Rota amigável que entrega tags Open Graph visuais em tempo real para WhatsApp, Facebook, LinkedIn e Telegram
    const shareUrl = \`\${window.location.origin}/artigo/\${encodeURIComponent(postSlugOrId)}\`;

    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', '/blog?artigo=' + encodeURIComponent(postSlugOrId));
    }`;

if (js.includes(targetUrls)) {
  js = js.replace(targetUrls, replacementUrls);
  console.log('✅ URLs amigáveis atualizadas em openBlogReader');
} else {
  console.log('targetUrls não encontrado exatamente');
}

// 2. Atualizar closeBlogModal
const targetClose = `function closeBlogModal() {
      stopSpeech();
      if (modal) modal.classList.add('hidden');
    }`;

const replacementClose = `function closeBlogModal() {
      stopSpeech();
      if (modal) modal.classList.add('hidden');
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', '/blog');
      }
    }`;

if (js.includes(targetClose)) {
  js = js.replace(targetClose, replacementClose);
  console.log('✅ Histórico limpo ao fechar modal em closeBlogModal');
}

// 3. Atualizar link de 'Ver no Blog' caso exista
js = js.replace(/blog\.html/g, 'blog');

fs.writeFileSync(blogJsPath, js, 'utf8');
console.log('✅ src/blog.js atualizado com sucesso.');
