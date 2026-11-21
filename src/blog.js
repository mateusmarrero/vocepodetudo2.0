/**
 * src/blog.js - Central Editorial & Blog de Carreira Independente
 * Você Pode Tudo — Empregabilidade & Qualificação Profissional
 */

(function () {
  'use strict';

  let blogData = [];
  let filteredBlogPosts = [];
  let currentBlogCategory = 'todos';
  let currentBlogSearch = '';

  const BLOG_CATEGORY_LABELS = {
    'todos': 'Todos os Artigos',
    'primeiro_emprego': 'Primeiro Emprego',
    'curriculo_linkedin': 'Currículo & LinkedIn',
    'entrevistas': 'Entrevistas de Emprego',
    'tecnologia': 'Carreira em TI',
    'carreira': 'Desenvolvimento Profissional',
    'estudos': 'Estudos & Certificações',
    'direitos': 'Direitos Trabalhistas',
    'cidadania_digital': 'Cidadania Digital',
    'produtividade': 'Produtividade',
    'acessibilidade': 'Acessibilidade & Inclusão',
    'empreendedorismo': 'Empreendedorismo'
  };

  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `fixed bottom-6 right-6 z-50 transform transition-all duration-300 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl text-xs font-black text-white ${
      type === 'success' ? 'bg-[#009639]' : type === 'error' ? 'bg-rose-600' : 'bg-[#002776]'
    }`;
    toast.classList.remove('translate-y-24', 'opacity-0');
    setTimeout(() => {
      toast.classList.add('translate-y-24', 'opacity-0');
    }, 3500);
  }

  function initDarkMode() {
    const toggleBtn = document.getElementById('btn-dark-mode-toggle');
    const icon = document.getElementById('dark-mode-icon');
    const isDark = localStorage.getItem('vpt_theme') === 'dark';

    if (isDark) {
      document.documentElement.classList.add('dark');
      if (icon) icon.setAttribute('data-lucide', 'sun');
    } else {
      document.documentElement.classList.remove('dark');
      if (icon) icon.setAttribute('data-lucide', 'moon');
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const currentlyDark = document.documentElement.classList.contains('dark');
        if (currentlyDark) {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('vpt_theme', 'light');
          if (icon) icon.setAttribute('data-lucide', 'moon');
        } else {
          document.documentElement.classList.add('dark');
          localStorage.setItem('vpt_theme', 'dark');
          if (icon) icon.setAttribute('data-lucide', 'sun');
        }
        if (window.lucide) window.lucide.createIcons();
      });
    }
  }

  function initMobileDrawer() {
    const toggleBtn = document.getElementById('btn-mobile-nav-toggle');
    const drawer = document.getElementById('mobile-nav-drawer');
    const closeBtn = document.getElementById('btn-close-mobile-drawer');

    if (toggleBtn && drawer) {
      toggleBtn.addEventListener('click', () => drawer.classList.toggle('hidden'));
    }
    if (closeBtn && drawer) {
      closeBtn.addEventListener('click', () => drawer.classList.add('hidden'));
    }
  }

  function renderBlogGrid() {
    const grid = document.getElementById('blog-grid');
    const emptyState = document.getElementById('blog-empty-state');
    const badge = document.getElementById('blog-posts-count-badge');
    if (!grid) return;

    if (badge) {
      badge.textContent = `${filteredBlogPosts.length} artigo${filteredBlogPosts.length === 1 ? '' : 's'} publicado${filteredBlogPosts.length === 1 ? '' : 's'}`;
    }

    if (filteredBlogPosts.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    grid.innerHTML = filteredBlogPosts.map(post => {
      const catLabel = BLOG_CATEGORY_LABELS[post.category] || 'Carreira';
      const readTime = post.read_time_minutes ? `${post.read_time_minutes} min de leitura` : '5 min de leitura';
      const coverHtml = post.cover_image 
        ? `<div class="h-48 w-full overflow-hidden bg-slate-100 relative">
             <img src="${escapeHTML(post.cover_image)}" alt="${escapeHTML(post.title)}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
             <div class="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"></div>
             <span class="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/95 text-slate-900 shadow-sm">
               ${catLabel}
             </span>
             <span class="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-950/85 text-purple-100 backdrop-blur-xs flex items-center gap-1 shadow-sm border border-purple-400/30">
               <i data-lucide="eye" class="w-3 h-3 text-purple-300"></i>
               ${Number(post.views_count || 0).toLocaleString('pt-BR')} cliques
             </span>
             <span class="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-md text-[10px] font-black bg-slate-900/80 text-white backdrop-blur-xs flex items-center gap-1">
               <i data-lucide="clock" class="w-3 h-3 text-[#ffdf00]"></i>
               ${readTime}
             </span>
           </div>`
        : `<div class="h-40 w-full bg-gradient-to-br from-[#005e24] via-[#00471b] to-[#002776] p-4 flex flex-col justify-between relative">
             <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#ffcc29] text-slate-950 self-start shadow-sm">
               ${catLabel}
             </span>
             <span class="text-[10px] font-black text-emerald-100 flex items-center gap-1 self-end">
               <i data-lucide="clock" class="w-3 h-3"></i>
               ${readTime}
             </span>
           </div>`;

      return `
        <article class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
          <div>
            ${coverHtml}
            <div class="p-5 sm:p-6">
              <h3 class="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#005e24] transition-colors leading-snug mb-2 line-clamp-2">
                ${escapeHTML(post.title)}
              </h3>
              <p class="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                ${escapeHTML(post.excerpt)}
              </p>
              <div class="flex items-center justify-between text-[11px] text-slate-400 font-semibold pt-3 border-t border-slate-100">
                <span class="flex items-center gap-1">
                  <i data-lucide="user" class="w-3 h-3 text-slate-400"></i>
                  ${escapeHTML(post.author || 'Equipe Você Pode Tudo')}
                </span>
                <span class="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 shadow-2xs" title="Total de cliques e leituras registradas">
                  <i data-lucide="eye" class="w-3 h-3 text-purple-600"></i>
                  ${Number(post.views_count || 0).toLocaleString('pt-BR')} cliques
                </span>
              </div>
            </div>
          </div>
          <div class="px-5 pb-5 flex gap-2">
            <a 
              href="/artigo/${encodeURIComponent(post.slug || post.id)}" 
              class="flex-1 py-2.5 rounded-xl text-xs font-black text-[#005e24] bg-emerald-50 hover:bg-[#005e24] hover:text-white transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-xs group-hover:bg-[#005e24] group-hover:text-white"
            >
              <span>Ler Artigo</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </a>
            <button 
              type="button" 
              class="read-post-btn px-3 py-2.5 rounded-xl text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              data-post-id="${post.id}"
              title="Pré-visualizar em modal rápido"
            >
              <i data-lucide="maximize-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </article>
      `;
    }).join('');

    grid.querySelectorAll('.read-post-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(e.currentTarget.dataset.postId);
        const post = blogData.find(p => Number(p.id) === id);
        if (post) openBlogReader(post);
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function applyBlogFilters() {
    filteredBlogPosts = blogData.filter(post => {
      if (currentBlogCategory !== 'todos' && post.category !== currentBlogCategory) return false;
      if (currentBlogSearch) {
        const q = currentBlogSearch.toLowerCase();
        const hay = `${post.title} ${post.excerpt} ${post.tags || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    renderBlogGrid();
  }

  let currentSpeechUtterance = null;
  let isSpeechSpeaking = false;
  let isSpeechPaused = false;

  function stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    isSpeechSpeaking = false;
    isSpeechPaused = false;
    currentSpeechUtterance = null;
    const playBtn = document.getElementById('blog-tts-play-btn');
    const stopBtn = document.getElementById('blog-tts-stop-btn');
    if (playBtn) {
      playBtn.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer';
      playBtn.innerHTML = '<i data-lucide="volume-2" class="w-3.5 h-3.5"></i><span id="blog-tts-label">Ouvir Artigo</span>';
    }
    if (stopBtn) stopBtn.classList.add('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  function toggleSpeech(title, content) {
    if (!('speechSynthesis' in window)) {
      showToast('Seu navegador não suporta leitura em voz alta.', 'warning');
      return;
    }

    const playBtn = document.getElementById('blog-tts-play-btn');
    const stopBtn = document.getElementById('blog-tts-stop-btn');

    if (isSpeechSpeaking) {
      if (isSpeechPaused) {
        window.speechSynthesis.resume();
        isSpeechPaused = false;
        if (playBtn) {
          playBtn.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer';
          playBtn.innerHTML = '<i data-lucide="pause" class="w-3.5 h-3.5"></i><span>Pausar</span>';
        }
      } else {
        window.speechSynthesis.pause();
        isSpeechPaused = true;
        if (playBtn) {
          playBtn.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer';
          playBtn.innerHTML = '<i data-lucide="play" class="w-3.5 h-3.5"></i><span>Continuar</span>';
        }
      }
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    // Iniciar nova leitura em português pt-BR
    window.speechSynthesis.cancel();
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = (content || '').replace(/\\r\\n|\\r|\\n/g, '\n');
    const cleanContent = tempDiv.innerText || tempDiv.textContent || '';
    const fullText = `${title}. ${cleanContent}`.slice(0, 30000);

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang === 'pt-BR' || v.lang === 'pt_BR' || v.lang.startsWith('pt'));
    if (ptVoice) utterance.voice = ptVoice;

    utterance.onstart = () => {
      isSpeechSpeaking = true;
      isSpeechPaused = false;
      if (playBtn) {
        playBtn.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer';
        playBtn.innerHTML = '<i data-lucide="pause" class="w-3.5 h-3.5"></i><span>Pausar</span>';
      }
      if (stopBtn) stopBtn.classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    };

    utterance.onend = () => {
      stopSpeech();
    };

    utterance.onerror = () => {
      stopSpeech();
    };

    currentSpeechUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function getSmartCTA(category, title) {
    const cat = category || '';
    const t = (title || '').toLowerCase();

    if (cat === 'curriculo_linkedin' || t.includes('currículo') || t.includes('curriculo') || t.includes('ats')) {
      return `
        <div class="p-5 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-[#002776] text-white shadow-lg border-2 border-[#ffcc29] flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div class="space-y-1 text-center sm:text-left">
            <span class="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#ffdf00]">
              <i data-lucide="file-check-2" class="w-3.5 h-3.5"></i>
              <span>Gerador de Currículos ATS</span>
            </span>
            <strong class="block text-sm sm:text-base font-black">Coloque as dicas deste artigo no seu currículo agora</strong>
            <p class="text-xs text-blue-100">Crie seu currículo profissional no formato padrão aceito pelos robôs de RH (ATS). 100% gratuito.</p>
          </div>
          <a href="curriculo.html" class="px-4 py-2.5 rounded-xl text-xs font-black bg-[#ffdf00] text-slate-950 hover:bg-amber-300 transition-all shadow-md flex items-center gap-1.5 flex-shrink-0 cursor-pointer">
            <i data-lucide="sparkles" class="w-3.5 h-3.5 text-slate-950"></i>
            <span>Criar Currículo Grátis</span>
          </a>
        </div>
      `;
    }

    if (cat === 'entrevistas' || t.includes('entrevista') || t.includes('pergunta')) {
      return `
        <div class="p-5 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white shadow-lg border-2 border-purple-400 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div class="space-y-1 text-center sm:text-left">
            <span class="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-purple-300">
              <i data-lucide="bot" class="w-3.5 h-3.5"></i>
              <span>Simulador com Inteligência Artificial</span>
            </span>
            <strong class="block text-sm sm:text-base font-black">Treine suas respostas de entrevista ao vivo com IA</strong>
            <p class="text-xs text-purple-100">Receba feedback instantâneo sobre clareza, confiança e pontos de melhoria para sua próxima entrevista.</p>
          </div>
          <a href="simulador-entrevista.html" class="px-4 py-2.5 rounded-xl text-xs font-black bg-purple-500 hover:bg-purple-600 text-white transition-all shadow-md flex items-center gap-1.5 flex-shrink-0 cursor-pointer">
            <i data-lucide="play-circle" class="w-3.5 h-3.5"></i>
            <span>Iniciar Simulação</span>
          </a>
        </div>
      `;
    }

    if (cat === 'primeiro_emprego' || t.includes('primeiro emprego') || t.includes('aprendiz') || t.includes('vaga')) {
      return `
        <div class="p-5 rounded-3xl bg-gradient-to-r from-[#005e24] via-[#00471b] to-emerald-950 text-white shadow-lg border-2 border-[#ffcc29] flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div class="space-y-1 text-center sm:text-left">
            <span class="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#ffdf00]">
              <i data-lucide="briefcase" class="w-3.5 h-3.5"></i>
              <span>Mural de Oportunidades</span>
            </span>
            <strong class="block text-sm sm:text-base font-black">Candidate-se a vagas abertas de Jovem Aprendiz e Estágio</strong>
            <p class="text-xs text-emerald-100">Vagas atualizadas diariamente sem exigência de experiência prévia para quem está começando.</p>
          </div>
          <a href="vagas.html" class="px-4 py-2.5 rounded-xl text-xs font-black bg-[#ffdf00] text-slate-950 hover:bg-amber-300 transition-all shadow-md flex items-center gap-1.5 flex-shrink-0 cursor-pointer">
            <i data-lucide="search" class="w-3.5 h-3.5 text-slate-950"></i>
            <span>Ver Vagas Abertas</span>
          </a>
        </div>
      `;
    }

    if (cat === 'tecnologia' || cat === 'estudos' || t.includes('curso') || t.includes('aprender') || t.includes('excel')) {
      return `
        <div class="p-5 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 text-white shadow-lg border-2 border-amber-400 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div class="space-y-1 text-center sm:text-left">
            <span class="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-300">
              <i data-lucide="award" class="w-3.5 h-3.5"></i>
              <span>85+ Cursos Gratuitos</span>
            </span>
            <strong class="block text-sm sm:text-base font-black">Qualifique-se com certificado gratuito oficial</strong>
            <p class="text-xs text-amber-100">Cursos de Informática, Excel, Inteligência Artificial, Programação e Administração 100% gratuitos.</p>
          </div>
          <a href="index.html#courses" class="px-4 py-2.5 rounded-xl text-xs font-black bg-[#ffcc29] text-slate-950 hover:bg-amber-300 transition-all shadow-md flex items-center gap-1.5 flex-shrink-0 cursor-pointer">
            <i data-lucide="book-open" class="w-3.5 h-3.5 text-slate-950"></i>
            <span>Explorar Cursos</span>
          </a>
        </div>
      `;
    }

    // Padrão Geral / Vocacional
    return `
      <div class="p-5 rounded-3xl bg-gradient-to-r from-[#002776] via-[#091a42] to-[#005e24] text-white shadow-lg border-2 border-[#ffcc29] flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <div class="space-y-1 text-center sm:text-left">
          <span class="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#ffdf00]">
            <i data-lucide="compass" class="w-3.5 h-3.5"></i>
            <span>Descubra sua Vocação</span>
          </span>
          <strong class="block text-sm sm:text-base font-black">Não sabe por onde começar sua carreira?</strong>
          <p class="text-xs text-slate-200">Faça nosso Teste Vocacional completo em 5 minutos e receba recomendações personalizadas de profissões.</p>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <a href="teste-vocacional.html" class="px-4 py-2.5 rounded-xl text-xs font-black bg-[#ffdf00] text-slate-950 hover:bg-amber-300 transition-all shadow-md flex items-center gap-1.5 cursor-pointer">
            <i data-lucide="target" class="w-3.5 h-3.5 text-slate-950"></i>
            <span>Fazer Teste Vocacional</span>
          </a>
        </div>
      </div>
    `;
  }

  function renderRelatedPosts(currentPost) {
    const grid = document.getElementById('blog-modal-related-grid');
    if (!grid) return;

    let related = blogData.filter(p => Number(p.id) !== Number(currentPost.id) && p.category === currentPost.category);
    if (related.length < 3) {
      const others = blogData.filter(p => Number(p.id) !== Number(currentPost.id) && !related.includes(p));
      related = [...related, ...others].slice(0, 3);
    } else {
      related = related.slice(0, 3);
    }

    if (related.length === 0) {
      grid.innerHTML = '<p class="text-xs text-slate-400 col-span-3">Nenhum artigo relacionado no momento.</p>';
      return;
    }

    grid.innerHTML = related.map(p => {
      const readTime = p.read_time_minutes ? `${p.read_time_minutes} min` : '5 min';
      const catLabel = BLOG_CATEGORY_LABELS[p.category] || 'Carreira';
      return `
        <div class="related-post-card p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between" data-post-id="${p.id}">
          <div>
            <span class="inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 mb-1.5">
              ${catLabel}
            </span>
            <h5 class="text-xs font-black text-slate-900 dark:text-white line-clamp-2 leading-snug hover:text-[#005e24] dark:hover:text-emerald-400 transition-colors">
              ${escapeHTML(p.title)}
            </h5>
          </div>
          <div class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 font-bold">
            <span class="flex items-center gap-1 font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200"><i data-lucide="eye" class="w-3 h-3 text-purple-600"></i>${Number(p.views_count || 0).toLocaleString('pt-BR')} cliques</span>
            <span class="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 font-black">Ler <i data-lucide="chevron-right" class="w-3 h-3"></i></span>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.related-post-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = Number(card.dataset.postId);
        const post = blogData.find(p => Number(p.id) === id);
        if (post) {
          stopSpeech();
          const scrollContainer = document.getElementById('blog-reader-scroll-container');
          if (scrollContainer) scrollContainer.scrollTop = 0;
          openBlogReader(post);
        }
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // ==========================================
  // ACESSIBILIDADE: CONTROLE DE ZOOM DE FONTE
  // ==========================================
  const FONT_CLASSES = ['reader-font-sm', 'reader-font-md', 'reader-font-lg', 'reader-font-xl'];
  let currentFontIdx = parseInt(localStorage.getItem('vpt_reader_font_size') || '1', 10);
  if (isNaN(currentFontIdx) || currentFontIdx < 0 || currentFontIdx >= FONT_CLASSES.length) {
    currentFontIdx = 1; // Padrão: reader-font-md
  }

  function applyReaderFontSize(idx) {
    currentFontIdx = Math.max(0, Math.min(FONT_CLASSES.length - 1, idx));
    const contentEl = document.getElementById('blog-modal-content');
    if (contentEl) {
      FONT_CLASSES.forEach(c => contentEl.classList.remove(c));
      contentEl.classList.add(FONT_CLASSES[currentFontIdx]);
    }
    localStorage.setItem('vpt_reader_font_size', String(currentFontIdx));
  }

  // ==========================================
  // SCHEMA.ORG ARTICLE EM JSON-LD DINÂMICO
  // ==========================================
  function updateArticleJsonLd(post) {
    let script = document.getElementById('article-jsonld');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'article-jsonld';
      document.head.appendChild(script);
    }
    const coverUrl = post.cover_image || 'https://vocepodetudo.com/assets/logo-icon.png';
    const canonicalUrl = `https://vocepodetudo.com/blog?artigo=${encodeURIComponent(post.slug || post.id)}`;

    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': post.title,
      'description': post.excerpt || '',
      'image': [coverUrl],
      'datePublished': post.created_at || new Date().toISOString(),
      'dateModified': post.created_at || new Date().toISOString(),
      'author': [{
        '@type': 'Organization',
        'name': post.author || 'Equipe Você Pode Tudo',
        'url': 'https://vocepodetudo.com'
      }],
      'publisher': {
        '@type': 'Organization',
        'name': 'Você Pode Tudo',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://vocepodetudo.com/assets/logo.png'
        }
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': canonicalUrl
      }
    });
  }

  // ==========================================
  // NAVEGAÇÃO CONTÍNUA: PRÓXIMO ARTIGO DA SÉRIE
  // ==========================================
  function renderNextArticleBox(currentPost) {
    const nextBox = document.getElementById('blog-modal-next-article');
    if (!nextBox) return;

    // Priorizar próximo artigo da mesma categoria ou outro artigo recente publicado
    const sameCategory = blogData.filter(p => Number(p.id) !== Number(currentPost.id) && p.category === currentPost.category);
    let nextPost = sameCategory[0];
    if (!nextPost) {
      const otherPosts = blogData.filter(p => Number(p.id) !== Number(currentPost.id));
      nextPost = otherPosts[0];
    }

    if (!nextPost) {
      nextBox.innerHTML = '';
      return;
    }

    const catLabel = BLOG_CATEGORY_LABELS[nextPost.category] || 'Carreira';
    const readTime = nextPost.read_time_minutes ? `${nextPost.read_time_minutes} min` : '5 min';

    nextBox.innerHTML = `
      <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              <i data-lucide="sparkles" class="w-3 h-3 text-amber-500"></i>
              Próxima Leitura Recomendada
            </span>
            <span class="text-xs text-slate-300 dark:text-slate-600">•</span>
            <span class="text-[10px] font-bold text-slate-400">${catLabel}</span>
          </div>
          <h4 class="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
            ${escapeHTML(nextPost.title)}
          </h4>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
            ${escapeHTML(nextPost.excerpt || '')}
          </p>
        </div>
        <button type="button" id="btn-read-next-article" class="px-4 py-2.5 rounded-xl bg-[#009639] hover:bg-[#007a2e] text-white font-black text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0 group">
          <span>Continuar Lendo</span>
          <i data-lucide="arrow-right" class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"></i>
        </button>
      </div>
    `;

    document.getElementById('btn-read-next-article')?.addEventListener('click', () => {
      stopSpeech();
      const scrollContainer = document.getElementById('blog-reader-scroll-container');
      if (scrollContainer) scrollContainer.scrollTop = 0;
      openBlogReader(nextPost);
    });
  }

  async function openBlogReader(post) {
    const modal = document.getElementById('blog-reader-modal');
    if (!modal) return;

    // Interromper qualquer reprodução de áudio anterior
    stopSpeech();

    // Resetar barra de progresso de leitura
    const progressBar = document.getElementById('blog-reader-progress-bar');
    if (progressBar) progressBar.style.width = '0%';
    const scrollContainer = document.getElementById('blog-reader-scroll-container');
    if (scrollContainer) scrollContainer.scrollTop = 0;

    const titleEl = document.getElementById('blog-modal-title');
    const catBadge = document.getElementById('blog-modal-category-badge');
    const timeEl = document.getElementById('blog-modal-read-time');
    const authorEl = document.getElementById('blog-modal-author');
    const dateEl = document.getElementById('blog-modal-date');
    const viewsEl = document.getElementById('blog-modal-views');
    const contentEl = document.getElementById('blog-modal-content');
    const coverContainer = document.getElementById('blog-modal-cover-container');
    const coverImg = document.getElementById('blog-modal-cover-img');

    // Botões de áudio e compartilhamento
    const ttsPlayBtn = document.getElementById('blog-tts-play-btn');
    const ttsStopBtn = document.getElementById('blog-tts-stop-btn');
    const shareWhatsApp = document.getElementById('blog-share-whatsapp-btn');
    const shareLinkedIn = document.getElementById('blog-share-linkedin-btn');
    const shareTelegram = document.getElementById('blog-share-telegram-btn');
    const shareCopy = document.getElementById('blog-share-copy-btn');
    const copyLinkBtn = document.getElementById('blog-copy-link-btn');
    const smartCtaContainer = document.getElementById('blog-modal-smart-cta');

    if (titleEl) titleEl.textContent = post.title;
    const standaloneUrl = '/artigo/' + encodeURIComponent(post.slug || post.id);
    const topStandaloneLink = document.getElementById('blog-modal-open-standalone-link');
    if (topStandaloneLink) topStandaloneLink.href = standaloneUrl;
    const footStandaloneLink = document.getElementById('blog-modal-footer-standalone-link');
    if (footStandaloneLink) footStandaloneLink.href = standaloneUrl;
    if (catBadge) catBadge.textContent = BLOG_CATEGORY_LABELS[post.category] || 'Carreira';
    if (timeEl) {
      timeEl.innerHTML = `<i data-lucide="clock" class="w-3.5 h-3.5"></i> <span>${post.read_time_minutes || 5} min de leitura</span>`;
    }
    if (authorEl) authorEl.textContent = post.author || 'Equipe Você Pode Tudo';
    if (dateEl) dateEl.textContent = post.created_at ? new Date(post.created_at.replace(/-/g, '/')).toLocaleDateString('pt-BR') : 'Publicado recentemente';
    if (viewsEl) {
      viewsEl.innerHTML = `<i data-lucide="eye" class="w-3.5 h-3.5 text-purple-600"></i> <span class="font-black text-purple-700">${Number(post.views_count || 0).toLocaleString('pt-BR')} cliques</span>`;
    }

    if (coverContainer && coverImg) {
      if (post.cover_image) {
        coverImg.src = post.cover_image;
        coverImg.alt = post.title;
        coverContainer.classList.remove('hidden');
      } else {
        coverContainer.classList.add('hidden');
      }
    }

    const postSlugOrId = post.slug || post.id;
    const directUrl = `${window.location.origin}/blog?artigo=${encodeURIComponent(postSlugOrId)}`;
    // Rota amigável que entrega tags Open Graph visuais em tempo real para WhatsApp, Facebook, LinkedIn e Telegram
    const shareUrl = `${window.location.origin}/artigo/${encodeURIComponent(postSlugOrId)}`;

    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', '/blog?artigo=' + encodeURIComponent(postSlugOrId));
    }

    // Configurar Áudio / Ouvir Artigo
    if (ttsPlayBtn) {
      ttsPlayBtn.onclick = () => {
        toggleSpeech(post.title, post.content || post.excerpt || '');
      };
    }
    if (ttsStopBtn) {
      ttsStopBtn.onclick = () => {
        stopSpeech();
      };
    }

    // Configurar Botões de Compartilhamento Social Otimizados com Preview Rico
    if (shareWhatsApp) {
      shareWhatsApp.onclick = () => {
        const text = `Confira este artigo excelente no Você Pode Tudo: "${post.title}" - ${shareUrl}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
      };
    }
    if (shareLinkedIn) {
      shareLinkedIn.onclick = () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
      };
    }
    if (shareTelegram) {
      shareTelegram.onclick = () => {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`, '_blank');
      };
    }
    const copyHandler = () => {
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('Link do artigo copiado com sucesso!', 'success');
      }).catch(() => {
        prompt('Copie o link do artigo abaixo:', shareUrl);
      });
    };
    if (shareCopy) shareCopy.onclick = copyHandler;
    if (copyLinkBtn) copyLinkBtn.onclick = copyHandler;

    if (contentEl) {
      if (post.content) {
        contentEl.innerHTML = post.content.replace(/\\r\\n|\\r|\\n/g, '\n');
      } else {
        contentEl.innerHTML = `<div class="py-8 text-center text-slate-400 font-bold"><i data-lucide="loader" class="w-6 h-6 animate-spin mx-auto mb-2 text-[#005e24]"></i><span>Carregando texto completo...</span></div>`;
      }
      applyReaderFontSize(currentFontIdx);
    }

    // Injetar Próximo Artigo da Série (Navegação Contínua)
    renderNextArticleBox(post);

    // Injetar CTA Contextual Inteligente
    if (smartCtaContainer) {
      smartCtaContainer.innerHTML = getSmartCTA(post.category, post.title);
    }

    // Atualizar Dados Estruturados Schema.org Article
    updateArticleJsonLd(post);

    // Renderizar Artigos Relacionados
    renderRelatedPosts(post);

    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();

    // Inicializar blocos AdSense dentro do modal assim que ele se torna visível
    setTimeout(() => {
      try {
        const ads = modal.querySelectorAll('ins.adsbygoogle');
        ads.forEach(ad => {
          if (!ad.getAttribute('data-adsbygoogle-status')) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          }
        });
      } catch (err) {
        console.debug('AdSense reader init:', err);
      }
    }, 250);

    try {
      const res = await fetch(`api/blog.php?action=get&id=${post.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.post) {
          post.content = data.post.content;
          post.views_count = data.post.views_count;
          if (contentEl) contentEl.innerHTML = data.post.content;
          if (viewsEl) viewsEl.innerHTML = `<i data-lucide="eye" class="w-3.5 h-3.5"></i> <span>${data.post.views_count} leituras</span>`;
          if (window.lucide) window.lucide.createIcons();
        }
      }
    } catch (e) {
      console.warn('Erro ao obter detalhes completos:', e);
    }
  }

  async function init() {
    initDarkMode();
    initMobileDrawer();

    const grid = document.getElementById('blog-grid');
    if (!grid) return;

    const modal = document.getElementById('blog-reader-modal');
    const closeBtn = document.getElementById('close-blog-modal-btn');
    const closeReaderBtn = document.getElementById('btn-close-blog-reader');
    const resetFiltersBtn = document.getElementById('blog-reset-filters-btn');
    const searchInput = document.getElementById('blog-search-input');
    const searchBtn = document.getElementById('blog-search-btn');

    function closeBlogModal() {
      stopSpeech();
      if (modal) modal.classList.add('hidden');
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', '/blog');
      }
    }

    // Configurar barra de progresso de leitura ao rolar o artigo
    const scrollContainer = document.getElementById('blog-reader-scroll-container');
    const progressBar = document.getElementById('blog-reader-progress-bar');
    if (scrollContainer && progressBar) {
      scrollContainer.addEventListener('scroll', () => {
        const scrollTop = scrollContainer.scrollTop;
        const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        if (scrollHeight > 0) {
          const progress = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
          progressBar.style.width = `${progress}%`;
        } else {
          progressBar.style.width = '0%';
        }
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeBlogModal);
    if (closeReaderBtn) closeReaderBtn.addEventListener('click', closeBlogModal);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeBlogModal();
      });
    }

    // Acessibilidade: Controles de Tamanho de Fonte
    document.getElementById('btn-font-dec')?.addEventListener('click', () => applyReaderFontSize(currentFontIdx - 1));
    document.getElementById('btn-font-reset')?.addEventListener('click', () => applyReaderFontSize(1));
    document.getElementById('btn-font-inc')?.addEventListener('click', () => applyReaderFontSize(currentFontIdx + 1));

    // Impressão / Salvar em PDF Limpo
    document.getElementById('btn-print-article')?.addEventListener('click', () => {
      window.print();
    });

    // PWA: Banner de Instalação no Celular
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const banner = document.getElementById('pwa-install-banner');
      const dismissed = sessionStorage.getItem('vpt_pwa_dismissed');
      if (banner && !dismissed) {
        banner.classList.remove('hidden');
        if (window.lucide) window.lucide.createIcons();
      }
    });

    document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
      const banner = document.getElementById('pwa-install-banner');
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          showToast('Aplicativo Você Pode Tudo instalado com sucesso!', 'success');
        }
        deferredPrompt = null;
      }
      if (banner) banner.classList.add('hidden');
    });

    document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
      const banner = document.getElementById('pwa-install-banner');
      if (banner) banner.classList.add('hidden');
      sessionStorage.setItem('vpt_pwa_dismissed', 'true');
    });

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        currentBlogSearch = searchInput.value.trim();
        applyBlogFilters();
      });
    }
    if (searchBtn && searchInput) {
      searchBtn.addEventListener('click', () => {
        currentBlogSearch = searchInput.value.trim();
        applyBlogFilters();
      });
    }

    document.querySelectorAll('.blog-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.blog-cat-btn').forEach(b => {
          b.classList.remove('bg-[#005e24]', 'text-white', 'shadow-2xs');
          b.classList.add('bg-white', 'text-slate-700');
        });
        btn.classList.add('bg-[#005e24]', 'text-white', 'shadow-2xs');
        btn.classList.remove('bg-white', 'text-slate-700');

        currentBlogCategory = btn.dataset.category || 'todos';
        applyBlogFilters();
      });
    });

    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        currentBlogCategory = 'todos';
        currentBlogSearch = '';
        if (searchInput) searchInput.value = '';
        document.querySelectorAll('.blog-cat-btn').forEach(b => {
          if (b.dataset.category === 'todos') {
            b.classList.add('bg-[#005e24]', 'text-white', 'shadow-2xs');
            b.classList.remove('bg-white', 'text-slate-700');
          } else {
            b.classList.remove('bg-[#005e24]', 'text-white', 'shadow-2xs');
            b.classList.add('bg-white', 'text-slate-700');
          }
        });
        applyBlogFilters();
      });
    }

    try {
      const res = await fetch('api/blog.php?action=list&limit=50');
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.posts)) {
          blogData = data.posts;
          filteredBlogPosts = [...blogData];
          renderBlogGrid();

          const params = new URLSearchParams(window.location.search);
          const artigoSlug = params.get('artigo');
          if (artigoSlug) {
            const found = blogData.find(p => p.slug === artigoSlug || String(p.id) === artigoSlug);
            if (found) {
              openBlogReader(found);
            }
          }
          return;
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar artigos:', e);
    }

    if (blogData.length === 0) {
      try {
        const seedRes = await fetch('api/seed_blog.json');
        if (seedRes.ok) {
          const rawSeed = await seedRes.json();
          const now = new Date();
          blogData = rawSeed.filter(p => {
            if (Number(p.is_published) !== 1) return false;
            if (p.created_at) {
              const postDate = new Date(p.created_at.replace(/-/g, '/'));
              if (postDate > now) return false;
            }
            return true;
          });
          filteredBlogPosts = [...blogData];
          renderBlogGrid();
        }
      } catch (err) {}
    }
  }

    function setupBlogNewsletter() {
    const form = document.getElementById('blog-newsletter-form');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('blog-newsletter-email');
      const submitBtn = document.getElementById('blog-newsletter-submit-btn');
      const feedback = document.getElementById('blog-newsletter-feedback');
      const email = emailInput ? emailInput.value.trim() : '';
      if (!email) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin text-slate-950"></i><span>Inscrevendo...</span>';
        if (window.lucide) window.lucide.createIcons();
      }

      try {
        const res = await fetch('api/newsletter.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, source: 'blog' })
        });
        const data = await res.json();
        if (feedback) {
          feedback.classList.remove('hidden');
          if (res.ok && data.success) {
            feedback.className = 'mt-3 text-xs font-bold p-2.5 rounded-xl bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 animate-fade-in';
            feedback.textContent = data.message || 'Inscrição realizada com sucesso! Fique de olho no seu e-mail.';
            form.reset();
          } else {
            feedback.className = 'mt-3 text-xs font-bold p-2.5 rounded-xl bg-rose-500/20 text-rose-200 border border-rose-400/40 animate-fade-in';
            feedback.textContent = data.error || 'Ocorreu um erro ao registrar seu e-mail.';
          }
        }
      } catch (err) {
        if (feedback) {
          feedback.classList.remove('hidden');
          feedback.className = 'mt-3 text-xs font-bold p-2.5 rounded-xl bg-rose-500/20 text-rose-200 border border-rose-400/40 animate-fade-in';
          feedback.textContent = 'Erro de conexão com o servidor.';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i data-lucide="send" class="w-4 h-4 text-slate-950"></i><span>Assinar Newsletter</span>';
          if (window.lucide) window.lucide.createIcons();
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    init();
    setupBlogNewsletter();
  });
})();
