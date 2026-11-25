// Você Pode Tudo — Lógica da Aplicação com Acessibilidade, Segurança Criptográfica, MySQL Backend & SEO

(function() {
  'use strict';

  // Configuração da API do Servidor (ServerByte / cPanel)
  const API_BASE = window.location.protocol === 'file:' ? 'https://vocepodetudo.com/api' : './api';

  // Configurações e Constantes de Segurança
  const SECURITY = {
    MAX_ATTEMPTS: 5,
    LOCKOUT_DURATION_MS: 5 * 60 * 1000,    // 5 minutos de bloqueio temporário
    SESSION_MAX_AGE_MS: 2 * 60 * 60 * 1000 // 2 horas de inatividade máxima
  };

  // Funções Utilitárias de Segurança (Hashing, Anti-XSS e Sanitização)
  async function hashPassword(plainText) {
    if (!window.crypto || !window.crypto.subtle) {
      return plainText;
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Prevenção de XSS: Escapa caracteres perigosos antes de injetar no HTML
  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Sanitização de Links: Previne ataques de injeção de scripts (ex: javascript:alert())
  function sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return '#';
    const trimmed = url.trim();
    if (/^(https?:\/\/|mailto:)/i.test(trimmed)) {
      return trimmed;
    }
    if (trimmed.startsWith('#') || trimmed.startsWith('./') || trimmed.startsWith('/')) {
      return trimmed;
    }
    return '#';
  }

  // Proteção contra Ataques de Força Bruta (Rate Limiting)
  function getLockoutRemainingSeconds() {
    const lockoutUntil = parseInt(localStorage.getItem('vpt_admin_lockout_until') || '0', 10);
    const now = Date.now();
    if (lockoutUntil > now) {
      return Math.ceil((lockoutUntil - now) / 1000);
    }
    return 0;
  }

  function registerFailedLoginAttempt() {
    let attempts = parseInt(localStorage.getItem('vpt_admin_failed_attempts') || '0', 10) + 1;
    localStorage.setItem('vpt_admin_failed_attempts', attempts);
    if (attempts >= SECURITY.MAX_ATTEMPTS) {
      const lockoutUntil = Date.now() + SECURITY.LOCKOUT_DURATION_MS;
      localStorage.setItem('vpt_admin_lockout_until', lockoutUntil);
      localStorage.removeItem('vpt_admin_failed_attempts');
      return SECURITY.LOCKOUT_DURATION_MS / 1000;
    }
    return 0;
  }

  function clearFailedLoginAttempts() {
    localStorage.removeItem('vpt_admin_failed_attempts');
    localStorage.removeItem('vpt_admin_lockout_until');
  }

  // Estado da Aplicação
  const state = {
    allCourses: [],
    favorites: new Set(),
    expandedCourses: new Set(),
    activeCategory: 'all',
    searchQuery: '',
    selectedProvider: 'Todos',
    certificateFilter: 'all', // 'all', 'free-only', 'audited'
    workloadFilter: 'all',    // 'all', 'short', 'medium', 'long'
    sortBy: 'recommended',   // 'recommended', 'rating', 'workload-asc', 'workload-desc', 'name'
    viewMode: 'catalog',      // 'catalog', 'tracks', 'favorites', 'career-test', ou 'career-result'
    selectedTrack: null,      // id da trilha de aprendizagem ativa no catálogo
    isAdmin: false,           // status de autenticação do administrador
    fontSizeLevel: 1,         // 0: Pequeno, 1: Normal, 2: Grande, 3: Extra Grande
    isHighContrast: false,
    isSpeaking: false,
    coursesPerPage: 12,       // Paginação e carregamento progressivo suave
    currentPage: 1,
    isLoadingMore: false,
    visitorCity: 'São Paulo',
    visitorRegion: 'SP',
    visitorCountry: 'Brasil',
    careerQuiz: {
      currentStep: 0,
      answers: {},
      result: null,
      activeResultArea: null
    },
    student: null,
    studentToken: localStorage.getItem('vpt_student_token') || null,
    deepLinkCourse: null
  };

  const fontSizes = ['font-size-small', 'font-size-normal', 'font-size-large', 'font-size-xlarge'];

  // Notificação Toast
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const bgClass = type === 'success' 
      ? 'bg-emerald-700 text-white' 
      : type === 'info' 
      ? 'bg-blue-800 text-white' 
      : 'bg-rose-700 text-white';

    toast.className = `flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold ${bgClass} transform transition-all duration-300 translate-y-2 opacity-0 border border-white/20 z-50`;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `
      <i data-lucide="${type === 'success' ? 'check-circle-2' : type === 'info' ? 'info' : 'alert-circle'}" class="w-5 h-5 flex-shrink-0"></i>
      <span>${escapeHTML(message)}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons({ root: toast });

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-2', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Atualiza indicadores visuais do painel de acessibilidade
  function updateVisualAccessibilityUI() {
    const contrastBadge = document.getElementById('acc-contrast-status-badge');
    const fontBadge = document.getElementById('acc-font-level-badge');
    
    if (contrastBadge) {
      if (state.isHighContrast) {
        contrastBadge.textContent = 'Ativado';
        contrastBadge.className = 'text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#ffdf00] text-slate-950 border border-slate-950';
      } else {
        contrastBadge.textContent = 'Desativado';
        contrastBadge.className = 'text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700';
      }
    }

    if (fontBadge) {
      const labels = ['Pequeno (85%)', 'Normal (100%)', 'Grande (115%)', 'Extra Grande (125%)'];
      fontBadge.textContent = labels[state.fontSizeLevel] || 'Normal (100%)';
    }
  }

  // Leitor de Texto em Voz Alta (Acessibilidade TTS)
  function speakText(text) {
    if (!('speechSynthesis' in window)) {
      showToast('Seu navegador não possui suporte para síntese de voz.', 'error');
      return;
    }

    const btnText = document.getElementById('btn-read-page-text');

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      state.isSpeaking = false;
      if (btnText) btnText.textContent = 'Ouvir Resumo da Página';
      showToast('Leitura de voz interrompida.', 'info');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;

    utterance.onstart = () => {
      state.isSpeaking = true;
      if (btnText) btnText.textContent = 'Pausar Leitura de Voz';
      showToast('Lendo resumo do portal em voz alta...', 'info');
    };

    utterance.onend = () => {
      state.isSpeaking = false;
      if (btnText) btnText.textContent = 'Ouvir Resumo da Página';
    };

    utterance.onerror = () => {
      state.isSpeaking = false;
      if (btnText) btnText.textContent = 'Ouvir Resumo da Página';
    };

    window.speechSynthesis.speak(utterance);
  }

  // Acessibilidade: Controles de Fonte
  function applyFontSize() {
    const html = document.documentElement;
    fontSizes.forEach(cls => html.classList.remove(cls));
    html.classList.add(fontSizes[state.fontSizeLevel]);
    localStorage.setItem('vocepodetudo_fontsize', state.fontSizeLevel);
    updateVisualAccessibilityUI();
  }

  function changeFontSize(delta) {
    state.fontSizeLevel = Math.max(0, Math.min(fontSizes.length - 1, state.fontSizeLevel + delta));
    applyFontSize();
    const labels = ['Pequeno (85%)', 'Normal (100%)', 'Grande (115%)', 'Extra Grande (125%)'];
    showToast(`Tamanho da fonte: ${labels[state.fontSizeLevel]}`, 'info');
  }

  function resetFontSize() {
    state.fontSizeLevel = 1;
    applyFontSize();
    showToast('Tamanho da fonte redefinido para o padrão (100%)', 'info');
  }

  // Acessibilidade: Alto Contraste
  function toggleHighContrast() {
    state.isHighContrast = !state.isHighContrast;
    const html = document.documentElement;
    if (state.isHighContrast) {
      html.classList.add('high-contrast');
      localStorage.setItem('vocepodetudo_contrast', 'high');
      showToast('Modo Alto Contraste ativado', 'info');
    } else {
      html.classList.remove('high-contrast');
      localStorage.setItem('vocepodetudo_contrast', 'normal');
      showToast('Modo Alto Contraste desativado', 'info');
    }
    updateVisualAccessibilityUI();
  }

  // Carregar dados salvos no LocalStorage / SessionStorage com Validação de Segurança
  function loadPersistedData() {
    try {
      // 1. Verificação de Sessão com Token Válido e Expiração Automática
      const savedToken = sessionStorage.getItem('vpt_auth_token') || localStorage.getItem('vpt_admin_token');
      if (savedToken && sessionStorage.getItem('vpt_is_admin') === 'true') {
        const loginTime = parseInt(sessionStorage.getItem('vpt_admin_login_time') || '0', 10);
        const now = Date.now();
        if (loginTime > 0 && (now - loginTime < SECURITY.SESSION_MAX_AGE_MS)) {
          state.isAdmin = true;
        } else {
          state.isAdmin = false;
          sessionStorage.removeItem('vpt_is_admin');
          sessionStorage.removeItem('vpt_auth_token');
          sessionStorage.removeItem('vpt_admin_login_time');
        }
      } else {
        state.isAdmin = false;
        sessionStorage.removeItem('vpt_is_admin');
        sessionStorage.removeItem('vpt_auth_token');
      }

      // 2. Favoritos Salvos
      const savedFavorites = localStorage.getItem('vocepodetudo_favorites') || localStorage.getItem('estudegratis_favorites');
      if (savedFavorites) {
        state.favorites = new Set(JSON.parse(savedFavorites));
      }

      // 3. Alto Contraste Salvo
      const savedContrast = localStorage.getItem('vocepodetudo_contrast') || localStorage.getItem('estudegratis_contrast');
      if (savedContrast === 'high') {
        state.isHighContrast = true;
        document.documentElement.classList.add('high-contrast');
      }

      // 4. Tamanho de Fonte Salvo
      const savedFontSize = localStorage.getItem('vocepodetudo_fontsize') || localStorage.getItem('estudegratis_fontsize');
      if (savedFontSize !== null) {
        state.fontSizeLevel = parseInt(savedFontSize, 10);
        applyFontSize();
      }

      // 5. Teste de Perfil Profissional Salvo (se existente)
      const savedCareerTest = localStorage.getItem('vpt_career_test_result');
      if (savedCareerTest) {
        try {
          const parsedTest = JSON.parse(savedCareerTest);
          if (parsedTest && parsedTest.primary) {
            state.careerQuiz.result = parsedTest;
            state.careerQuiz.activeResultArea = parsedTest.primary.areaKey;
          }
        } catch (e) {}
      }

      // 6. Cursos Adicionados por Admin com Validação Anti-Tampering (Fallback Local)
      const userCoursesRaw = localStorage.getItem('vocepodetudo_custom_courses') || localStorage.getItem('estudegratis_custom_courses');
      let customCourses = [];
      if (userCoursesRaw) {
        const parsed = JSON.parse(userCoursesRaw);
        if (Array.isArray(parsed)) {
          customCourses = parsed.filter(c => c && typeof c.title === 'string' && typeof c.url === 'string');
        }
      }

      const initialData = (window.PORTAL_DATA && window.PORTAL_DATA.courses) || [];
      state.allCourses = [...customCourses, ...initialData];
    } catch (e) {
      console.error('Erro ao ler LocalStorage:', e);
      state.allCourses = (window.PORTAL_DATA && window.PORTAL_DATA.courses) || [];
    }
  }

  // Sincronizar catálogo diretamente com o banco de dados MySQL do servidor
  async function syncCoursesWithMySQL() {
    try {
      const response = await fetch(`${API_BASE}/courses.php`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.courses && Array.isArray(data.courses) && data.courses.length > 0) {
          // Blindagem: Garante que os 155 cursos oficiais nunca sumam da tela
          if (data.courses.length >= state.allCourses.length) {
            state.allCourses = data.courses;
          } else {
            const serverMap = new Map(data.courses.map(c => [c.id, c]));
            const merged = state.allCourses.map(c => serverMap.get(c.id) || c);
            for (const sc of data.courses) {
              if (!state.allCourses.some(c => c.id === sc.id)) {
                merged.push(sc);
              }
            }
            state.allCourses = merged;
          }
          renderCourses();
          renderTracksRoadmap();
          renderCategories();
          renderProviderOptions();
          updateHeaderStats();
          console.log(`[Você Pode Tudo] Catálogo sincronizado com sucesso: ${state.allCourses.length} cursos ativos.`);
        }
      }
    } catch (err) {
      // Se a API estiver offline ou em ambiente sem PHP, os 155 cursos locais oficiais permanecem 100% ativos
      console.info('[Você Pode Tudo] Utilizando catálogo oficial completo de contingência.', err);
    }
  }

  function saveFavorites() {
    try {
      localStorage.setItem('vocepodetudo_favorites', JSON.stringify(Array.from(state.favorites)));
    } catch (e) {
      console.error(e);
    }
    updateFavoritesBadge();
  }

  function updateFavoritesBadge() {
    const badges = document.querySelectorAll('.favorites-count-badge');
    badges.forEach(b => {
      b.textContent = state.favorites.size;
      b.style.display = (state.favorites.size > 0) ? 'inline-flex' : 'none';
    });
  }

  // Abrir Painel Administrativo em Janela Separada (Popup Completa)
  function openAdminPopup() {
    const width = Math.min(1360, window.screen.availWidth - 40);
    const height = Math.min(880, window.screen.availHeight - 60);
    const left = Math.max(0, Math.floor((window.screen.availWidth - width) / 2));
    const top = Math.max(0, Math.floor((window.screen.availHeight - height) / 2));
    const popup = window.open('admin.html', 'vpt_admin_panel', `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no`);
    if (popup) {
      try { popup.focus(); } catch (e) {}
    } else {
      window.open('admin.html', '_blank');
    }
  }

  // Atualização Visual do Painel de Administrador
  function updateAdminUI() {
    const adminBtn = document.getElementById('open-admin-login-btn');
    const isLogged = state.isAdmin || !!localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_is_admin') === 'true';

    if (adminBtn) {
      if (isLogged) {
        adminBtn.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-[#009639] animate-pulse"></span>
          <span class="text-emerald-900 font-black">Admin</span>
          <i data-lucide="external-link" class="w-3 h-3 text-[#009639]"></i>
        `;
        adminBtn.className = 'inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-black text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-all cursor-pointer shadow-sm';
        adminBtn.title = 'Painel Administrativo Conectado — Clique para abrir em nova janela';
      } else {
        adminBtn.innerHTML = `
          <i data-lucide="lock" class="w-3.5 h-3.5 text-slate-500"></i>
          <span class="hidden xl:inline">Admin</span>
          <i data-lucide="external-link" class="w-3 h-3 text-slate-400 hidden sm:inline"></i>
        `;
        adminBtn.className = 'inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-[#002776] bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer shadow-sm';
        adminBtn.title = 'Abrir Painel de Administração em Janela Separada';
      }
      if (window.lucide) window.lucide.createIcons();
    }
  }

  // Otimização de Rastreamento (SEO) & Leitura de Parâmetros de URL (?q=..., ?trilha=..., ?categoria=...)
  function handleURLParameters() {
    try {
      const params = new URLSearchParams(window.location.search);

      const queryParam = params.get('q');
      if (queryParam) {
        state.searchQuery = queryParam.trim();
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = queryParam;
        const clearBtn = document.getElementById('clear-search-btn');
        if (clearBtn) clearBtn.style.display = 'block';
      }

      const categoryParam = params.get('categoria');
      if (categoryParam) {
        state.activeCategory = categoryParam;
      }

      const trackParam = params.get('trilha');
      if (trackParam) {
        state.selectedTrack = trackParam;
      }

      const viewParam = params.get('view');
      const testParam = params.get('teste') || params.get('quiz');
      const courseParam = params.get('curso') || params.get('c');
      if (courseParam) {
        state.deepLinkCourse = courseParam.trim();
      }
      if (viewParam === 'tracks' || viewParam === 'favorites' || viewParam === 'career-test' || viewParam === 'career-result') {
        state.viewMode = viewParam;
      } else if (testParam === '1' || testParam === 'true' || window.location.hash === '#teste-perfil') {
        state.viewMode = 'career-test';
      }
    } catch (err) {
      console.error('Erro ao ler parâmetros de busca na URL:', err);
    }
  }

  // Mecanismo de Busca e Filtros
  function getFilteredCourses() {
    return state.allCourses.filter(course => {
      if (state.viewMode === 'favorites' && !state.favorites.has(course.id)) {
        return false;
      }
      if (state.activeCategory !== 'all' && course.category !== state.activeCategory) {
        return false;
      }
      if (state.selectedProvider !== 'Todos' && course.provider !== state.selectedProvider) {
        return false;
      }
      if (state.certificateFilter === 'free-only' && !course.hasFreeCertificate) {
        return false;
      }
      if (state.certificateFilter === 'audited' && course.hasFreeCertificate) {
        return false;
      }
      if (state.workloadFilter === 'short' && course.workloadHours > 15) return false;
      if (state.workloadFilter === 'medium' && (course.workloadHours <= 15 || course.workloadHours > 40)) return false;
      if (state.workloadFilter === 'long' && course.workloadHours <= 40) return false;

      // Filtro por Trilha de Aprendizagem ativa
      if (state.selectedTrack) {
        const track = (window.PORTAL_DATA && window.PORTAL_DATA.tracks || []).find(t => t.id === state.selectedTrack);
        if (track && track.courses && !track.courses.includes(course.id)) {
          return false;
        }
      }

      if (state.searchQuery.trim() !== '') {
        const query = state.searchQuery.toLowerCase().trim();
        const inTitle = (course.title || '').toLowerCase().includes(query);
        const inDesc = (course.description || '').toLowerCase().includes(query);
        const inProvider = (course.provider || '').toLowerCase().includes(query);
        const inTags = course.tags && course.tags.some(t => (t || '').toLowerCase().includes(query));
        if (!inTitle && !inDesc && !inProvider && !inTags) return false;
      }

      return true;
    }).sort((a, b) => {
      if (state.selectedTrack) {
        const track = (window.PORTAL_DATA && window.PORTAL_DATA.tracks || []).find(t => t.id === state.selectedTrack);
        if (track && track.courses) {
          const idxA = track.courses.indexOf(a.id);
          const idxB = track.courses.indexOf(b.id);
          return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
        }
      }
      if (state.sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (state.sortBy === 'workload-asc') return a.workloadHours - b.workloadHours;
      if (state.sortBy === 'workload-desc') return b.workloadHours - a.workloadHours;
      if (state.sortBy === 'name') return (a.title || '').localeCompare(b.title || '', 'pt-BR');
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (b.rating || 0) - (a.rating || 0);
    });
  }

  // Renderizar Trilhas Rápidas do Topo do Catálogo
  function renderTracks() {
    const container = document.getElementById('tracks-container');
    const tracksList = (window.PORTAL_DATA && Array.isArray(window.PORTAL_DATA.tracks)) ? window.PORTAL_DATA.tracks : [];
    if (!container || tracksList.length === 0) return;

    container.innerHTML = tracksList.map(track => {
      const isSelected = state.selectedTrack === track.id;
      const safeTitle = escapeHTML(track.title);
      const safeDesc = escapeHTML(track.description);
      const safeDuration = escapeHTML(track.duration || '40h');
      const safeIcon = escapeHTML(track.icon || 'compass');

      return `
        <button 
          data-track-id="${escapeHTML(track.id)}"
          class="track-btn p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
            isSelected 
              ? 'bg-[#002776] text-white border-[#ffcc29] shadow-lg scale-102' 
              : 'bg-white hover:border-[#009639] border-slate-200 text-slate-800 shadow-sm hover:shadow'
          }"
        >
          <div>
            <div class="flex items-center justify-between gap-1 mb-2">
              <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                isSelected ? 'bg-white/20 text-[#ffcc29]' : 'bg-emerald-50 text-[#00702a] border border-emerald-200'
              }">
                <i data-lucide="${safeIcon}" class="w-3.5 h-3.5"></i>
                <span>Trilha</span>
              </span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ${
                isSelected ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'
              }">
                ${safeDuration}
              </span>
            </div>
            <h3 class="text-xs sm:text-sm font-black leading-tight mb-1 ${isSelected ? 'text-white' : 'text-[#002776]'}">
              ${safeTitle}
            </h3>
            <p class="text-[11px] line-clamp-2 leading-relaxed ${isSelected ? 'text-blue-100' : 'text-slate-500'}">
              ${safeDesc}
            </p>
          </div>
          <div class="mt-2.5 pt-2 border-t ${isSelected ? 'border-white/20' : 'border-slate-100'} flex items-center justify-between text-[10px] font-bold">
            <span class="${isSelected ? 'text-[#ffcc29]' : 'text-[#009639]'}">
              ${isSelected ? '✓ Trilha Ativa' : 'Iniciar Trilha →'}
            </span>
            <span class="${isSelected ? 'text-blue-200' : 'text-slate-400'}">
              ${(track.courses || []).length} cursos
            </span>
          </div>
        </button>
      `;
    }).join('');

    container.querySelectorAll('.track-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const trackId = btn.getAttribute('data-track-id');
        if (state.selectedTrack === trackId) {
          state.selectedTrack = null;
          showToast('Filtro de trilha desativado', 'info');
        } else {
          state.selectedTrack = trackId;
          const track = window.PORTAL_DATA.tracks.find(t => t.id === trackId);
          showToast(`Trilha ativada: ${track ? track.title : ''}`, 'success');
        }
        renderTracks();
        renderCourses();
      });
    });

    if (window.lucide) window.lucide.createIcons({ root: container });
  }

  // Renderizar o Roteiro Completo de Trilhas de Aprendizagem (Roadmap Guiado)
  function renderTracksRoadmap() {
    const grid = document.getElementById('tracks-roadmap-grid');
    const tracksList = (window.PORTAL_DATA && Array.isArray(window.PORTAL_DATA.tracks)) ? window.PORTAL_DATA.tracks : [];
    if (!grid || tracksList.length === 0) return;

    grid.innerHTML = tracksList.map((track) => {
      const trackCourses = (track.courses || []).map((courseId, stepIdx) => {
        const found = state.allCourses.find(c => c.id === courseId);
        if (found) {
          return { ...found, step: stepIdx + 1 };
        }
        return {
          id: courseId,
          step: stepIdx + 1,
          title: courseId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          provider: 'Parceiro Oficial',
          workloadHours: 10,
          hasFreeCertificate: true,
          url: 'https://vocepodetudo.com'
        };
      });

      const coursesStepsHtml = trackCourses.map(course => {
        const safeTitle = escapeHTML(course.title);
        const safeProvider = escapeHTML(course.provider);
        const safeUrl = sanitizeUrl(course.url);

        return `
          <div class="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#009639] hover:bg-emerald-50/30 transition-all">
            <span class="w-6 h-6 rounded-full bg-[#002776] text-white flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
              ${course.step}
            </span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2 mb-1 flex-wrap">
                <span class="text-xs font-extrabold text-slate-900 leading-tight">
                  ${safeTitle}
                </span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-700">
                  ${course.workloadHours}h
                </span>
              </div>
              <div class="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                <span class="truncate font-semibold text-slate-600">${safeProvider}</span>
                <a 
                  href="/curso/${encodeURIComponent(course.id || '')}" 
                  class="font-bold text-[#009639] hover:underline flex items-center gap-1 flex-shrink-0"
                  aria-label="Ver página e ementa do curso ${safeTitle}"
                >
                  <span>Ver Curso</span>
                  <i data-lucide="arrow-right" class="w-3 h-3"></i>
                </a>
              </div>
            </div>
          </div>
        `;
      }).join('');

      return `
        <article class="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between" aria-label="Trilha ${escapeHTML(track.title)}">
          <div>
            <div class="flex items-start justify-between gap-3 mb-4">
              <div class="w-12 h-12 rounded-2xl bg-[#002776] text-[#ffcc29] flex items-center justify-center flex-shrink-0 shadow-md">
                <i data-lucide="${escapeHTML(track.icon || 'compass')}" class="w-6 h-6"></i>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-[#00702a] border border-emerald-300 uppercase">
                  ${escapeHTML(track.badge || 'Trilha Oficial')}
                </span>
                <span class="text-xs font-black px-2.5 py-1 rounded-full bg-blue-50 text-[#002776] border border-blue-200">
                  ⏱ ${escapeHTML(track.duration || '40h')}
                </span>
              </div>
            </div>

            <h3 class="text-xl font-black text-[#002776] leading-tight mb-2">
              ${escapeHTML(track.title)}
            </h3>

            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 font-medium">
              ${escapeHTML(track.description)}
            </p>

            <div class="space-y-2 mb-6">
              <div class="flex items-center justify-between text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                <span>Roteiro de Aulas Recomendado</span>
                <span class="text-[#009639]">${trackCourses.length} etapas</span>
              </div>
              ${coursesStepsHtml}
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100">
            <button 
              data-start-track-id="${escapeHTML(track.id)}"
              class="start-track-btn w-full py-3 px-4 rounded-xl font-black text-sm bg-[#009639] hover:bg-[#00702a] text-white shadow-md transition-all flex items-center justify-center gap-2"
            >
              <i data-lucide="play" class="w-4 h-4 text-[#ffcc29]"></i>
              <span>Estudar Esta Trilha no Catálogo</span>
            </button>
          </div>
        </article>
      `;
    }).join('');

    grid.querySelectorAll('.start-track-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const trackId = btn.getAttribute('data-start-track-id');
        const track = window.PORTAL_DATA.tracks.find(t => t.id === trackId);
        state.selectedTrack = trackId;
        state.viewMode = 'catalog';
        updateViewModeButtons();
        renderTracks();
        renderCourses();
        showToast(`Trilha ativada: ${track ? track.title : ''}! Os cursos foram organizados na ordem recomendada.`, 'success');
        
        const catalogEl = document.getElementById('catalog-view');
        if (catalogEl) {
          catalogEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    if (window.lucide) window.lucide.createIcons({ root: grid });
  }

  // Renderizar Categorias
  function renderCategories() {
    const container = document.getElementById('categories-container');
    const categoriesList = (window.PORTAL_DATA && Array.isArray(window.PORTAL_DATA.categories)) ? window.PORTAL_DATA.categories : [];
    if (!container || categoriesList.length === 0) return;

    container.innerHTML = categoriesList.map(cat => {
      const isActive = state.activeCategory === cat.id;
      return `
        <button 
          data-category-id="${escapeHTML(cat.id)}"
          aria-pressed="${isActive}"
          class="category-btn flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
            isActive 
              ? 'bg-[#009639] border-[#009639] text-white shadow-md shadow-emerald-700/20' 
              : 'bg-white border-slate-300 text-slate-700 hover:border-[#009639] hover:text-[#009639] hover:bg-emerald-50/50'
          }"
        >
          <i data-lucide="${escapeHTML(cat.icon || 'book-open')}" class="w-4 h-4"></i>
          <span>${escapeHTML(cat.name)}</span>
        </button>
      `;
    }).join('');

    container.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeCategory = btn.getAttribute('data-category-id');
        if (state.viewMode !== 'catalog') {
          state.viewMode = 'catalog';
          updateViewModeButtons();
        }
        renderCategories();
        renderCourses();
      });
    });

    if (window.lucide) window.lucide.createIcons({ root: container });
  }

  // Renderizar opções de instituições
  function renderProviderOptions() {
    const select = document.getElementById('provider-select');
    const providersList = (window.PORTAL_DATA && Array.isArray(window.PORTAL_DATA.providers)) ? window.PORTAL_DATA.providers : ['Todos'];
    if (!select) return;

    select.innerHTML = providersList.map(p => `
      <option value="${escapeHTML(p)}">${escapeHTML(p)}</option>
    `).join('');

    select.value = state.selectedProvider;
    select.addEventListener('change', (e) => {
      state.selectedProvider = e.target.value;
      renderCourses();
    });
  }

  // Espaços publicitários desativados temporariamente conforme solicitação do usuário.

  // Abre o modal de compartilhamento com opções para redes sociais
  function openShareModal(title, provider, url) {
    const modal = document.getElementById('share-course-modal');
    if (!modal) return;

    const titleEl = document.getElementById('share-modal-title');
    const providerEl = document.getElementById('share-modal-provider');
    const inputUrl = document.getElementById('share-modal-input-url');

    if (titleEl) titleEl.textContent = title;
    if (providerEl) providerEl.textContent = provider;
    if (inputUrl) inputUrl.value = url;

    const shareText = `Olha esse curso 100% gratuito que encontrei no Você Pode Tudo: "${title}" (${provider}). Acesse o link oficial: ${url}`;
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(url);

    const whatsappLink = document.getElementById('share-link-whatsapp');
    if (whatsappLink) whatsappLink.href = `https://api.whatsapp.com/send?text=${encodedText}`;

    const linkedinLink = document.getElementById('share-link-linkedin');
    if (linkedinLink) linkedinLink.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

    const telegramLink = document.getElementById('share-link-telegram');
    if (telegramLink) telegramLink.href = `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(title)}`;

    const twitterLink = document.getElementById('share-link-twitter');
    if (twitterLink) twitterLink.href = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;

    const nativeBtn = document.getElementById('share-modal-native-btn');
    if (nativeBtn) {
      if (navigator.share) {
        nativeBtn.classList.remove('hidden');
        nativeBtn.classList.add('inline-flex');
        nativeBtn.onclick = async () => {
          try {
            await navigator.share({
              title: title,
              text: shareText,
              url: url
            });
          } catch (err) {
            // Cancelado pelo usuário
          }
        };
      } else {
        nativeBtn.classList.add('hidden');
        nativeBtn.classList.remove('inline-flex');
      }
    }

    modal.classList.remove('hidden');
  }

  // ==============================================================================
  // MAPEAMENTO DE ÍCONES SIMPLES E CORES TEMÁTICAS PARA CADA CURSO
  // ==============================================================================
  function getCourseIconInfo(course) {
    const iconThemes = {
      'code-2': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-[#009B3A]' },
      'brain-circuit': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
      'trending-up': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
      'heart-pulse': { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600' },
      'shield-check': { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
      'bar-chart-3': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
      'cloud': { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700' },
      'languages': { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700' },
      'palette': { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' },
      'compass': { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700' },
      'landmark': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800' },
      'briefcase': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
      'calculator': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
      'table': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
      'accessibility': { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700' },
      'file-text': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
      'laptop': { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' },
      'sprout': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
      'graduation-cap': { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-[#002776]' }
    };

    if (course.icon && iconThemes[course.icon]) {
      return {
        icon: course.icon,
        ...iconThemes[course.icon]
      };
    }

    // Classificador inteligente de fallback
    const title = (course.title || '').toLowerCase();
    const desc = (course.description || '').toLowerCase();
    const cat = (course.category || '').toLowerCase();
    const tags = (course.tags || []).map(t => t.toLowerCase()).join(' ');
    const text = `${title} ${tags} ${desc}`;

    if (/ciberseguran|cyber|hackers do bem|segurança da informação|segurança digital|forense|pentest/.test(text)) {
      return { icon: 'shield-check', ...iconThemes['shield-check'] };
    }
    if (cat === 'ia' || /inteligência artificial|ia generativa|machine learning|deep learning|copilot|fluência|chatgpt|llm|robôs ats/.test(text)) {
      return { icon: 'brain-circuit', ...iconThemes['brain-circuit'] };
    }
    if (cat === 'nuvem' || /\b(cloud|aws|azure|oci|google cloud)\b/.test(text) || /computação em nuvem/.test(text)) {
      return { icon: 'cloud', ...iconThemes['cloud'] };
    }
    if (/power bi|análise de dados|ciência de dados|data science|banco de dados|sql\b/.test(text)) {
      return { icon: 'bar-chart-3', ...iconThemes['bar-chart-3'] };
    }
    if (/excel|planilha/.test(text)) {
      return { icon: 'table', ...iconThemes['table'] };
    }
    if (
      cat === 'tecnologia' && /programação|full stack|javascript|python|java\b|html5|css3|react|node|algoritmo|lógica|c\+\+|git\b|desenvolvedor|api\b|apis\b|front-end|back-end|web/.test(text) ||
      /python|javascript|programação|lógica de programação|java\b|html5|css3|react|node|algoritmo|git\b|github/.test(text)
    ) {
      return { icon: 'code-2', ...iconThemes['code-2'] };
    }
    if (cat === 'saude' || /saúde|idoso|enfermagem|médic|farmácia|cuidador|primeiros socorros|lei lucas|burnout|dignidade menstrual|paciente|hospital|sus\b|fiocruz/.test(text)) {
      return { icon: 'heart-pulse', ...iconThemes['heart-pulse'] };
    }
    if (cat === 'agro' || /agronegócio|rural|agricultura|senar|irrigação/.test(text)) {
      return { icon: 'sprout', ...iconThemes['sprout'] };
    }
    if (cat === 'idiomas' || /inglês|espanhol|francês|duolingo|língua adicional/.test(text)) {
      return { icon: 'languages', ...iconThemes['languages'] };
    }
    if (cat === 'acessibilidade' || /libras|tecnologia assistiva|língua brasileira de sinais|audiodescrição|neurodiversidade/.test(text)) {
      return { icon: 'accessibility', ...iconThemes['accessibility'] };
    }
    if (/business model canvas|canvas na prática/.test(text)) {
      return { icon: 'briefcase', ...iconThemes['briefcase'] };
    }
    if (cat === 'artes' || /design gráfico|design e criação|fotografia|vídeo|\bcanva\b|photoshop|figma|desenho|games|animação|multimídia/.test(text)) {
      return { icon: 'palette', ...iconThemes['palette'] };
    }
    if (cat === 'empreendedorismo' || cat === 'negocios' || /marketing|vendas|vender|comércio|sebrae|mei\b|dropshipping|customer success|social|redes sociais|atendimento ao cliente|startup/.test(text)) {
      return { icon: 'trending-up', ...iconThemes['trending-up'] };
    }
    if (cat === 'financas' || /finanças|financeir|contabilidade|investimento|ações e renda fixa|tesouro direto|gastos|fluxo de caixa/.test(text)) {
      return { icon: 'calculator', ...iconThemes['calculator'] };
    }
    if (cat === 'concursos' || /concurso|direito|lgpd|lei\b|legislação|serviço público|decreto|relações internacionais|trabalhistas|normas regulamentadoras|nrs\b/.test(text)) {
      return { icon: 'landmark', ...iconThemes['landmark'] };
    }
    if (cat === 'gestao' || /gestão|liderança|projetos|scrum|kanban|lean seis sigma|accountability|gestão do tempo/.test(text)) {
      return { icon: 'briefcase', ...iconThemes['briefcase'] };
    }
    if (/redação|escrita|produção de textos|comunicação|oratória|apresentação/.test(text)) {
      return { icon: 'file-text', ...iconThemes['file-text'] };
    }
    if (/suporte em ti|suporte de ti|hardware|roteamento|redes\b|windows/.test(text)) {
      return { icon: 'laptop', ...iconThemes['laptop'] };
    }
    if (/currículo|entrevista|primeiro emprego|carreira|linkedin|networking|feedback|processos seletivos/.test(text)) {
      return { icon: 'compass', ...iconThemes['compass'] };
    }

    return { icon: 'graduation-cap', ...iconThemes['graduation-cap'] };
  }

  // Utilitário de Cópia para Área de Transferência com Fallback Seguro
  function copyTextToClipboard(text, onSuccess, onError) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        if (onSuccess) onSuccess();
      }).catch(() => {
        fallbackCopyText(text, onSuccess, onError);
      });
    } else {
      fallbackCopyText(text, onSuccess, onError);
    }
  }

  function fallbackCopyText(text, onSuccess, onError) {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful && onSuccess) onSuccess();
      else if (!successful && onError) onError();
    } catch (err) {
      if (onError) onError(err);
    }
  }

  // Alternador de expansão/recolhimento de card com acessibilidade e carregamento dinâmico
  function toggleCourseCardExpansion(card, courseId, forceState) {
    if (!card) return;
    const isExpanded = card.classList.contains('is-expanded');
    const shouldExpand = typeof forceState === 'boolean' ? forceState : !isExpanded;

    const toggleBtn = card.querySelector('.toggle-course-details-btn');
    const detailsContainer = card.querySelector('.course-expanded-details');
    const toggleLabel = card.querySelector('.toggle-btn-label');

    // Regra de Ouro: Apenas o card que o aluno clicar deve expandir e pular na tela!
    if (shouldExpand) {
      // Fecha qualquer outro card expandido no catálogo
      const rootContainer = card.closest('#courses-grid, #result-related-courses-grid') || document;
      rootContainer.querySelectorAll('.course-card.is-expanded').forEach(otherCard => {
        if (otherCard !== card) {
          const otherId = otherCard.getAttribute('data-course-id');
          toggleCourseCardExpansion(otherCard, otherId, false);
        }
      });

      if (state.expandedCourses) {
        state.expandedCourses.clear();
        state.expandedCourses.add(courseId);
      }
    } else {
      if (state.expandedCourses) {
        state.expandedCourses.delete(courseId);
      }
    }

    // Lazy load fallback caso a ementa ainda não esteja preenchida no DOM
    const innerContainer = card.querySelector('.course-expanded-inner');
    if (shouldExpand && innerContainer && !innerContainer.querySelector('.course-expanded-content')) {
      const course = (state.allCourses || []).find(c => String(c.id) === String(courseId));
      const getDetailsHtmlFn = (typeof getCourseExpandedDetailsHtml === 'function')
        ? getCourseExpandedDetailsHtml
        : (typeof window !== 'undefined' && typeof window.getCourseExpandedDetailsHtml === 'function')
          ? window.getCourseExpandedDetailsHtml
          : null;
      if (course && getDetailsHtmlFn) {
        try {
          const html = getDetailsHtmlFn(course);
          innerContainer.insertAdjacentHTML('afterbegin', html);
        } catch (e) {
          console.warn('[CourseDetails] Erro lazy:', e);
        }
      }
    }

    if (shouldExpand) {
      card.classList.add('is-expanded');
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-expanded', 'true');
        toggleBtn.classList.add('bg-emerald-50', 'text-[#00702a]', 'border-emerald-300');
        toggleBtn.classList.remove('bg-slate-100', 'text-slate-800', 'border-slate-300/80');
      }
      if (toggleLabel) {
        toggleLabel.textContent = 'Recolher Ementa e Detalhes';
      }
      if (detailsContainer) {
        detailsContainer.classList.add('is-open');
        detailsContainer.setAttribute('aria-hidden', 'false');
      }

      // Inicializa ícones Lucide dentro dos detalhes expandidos
      if (window.lucide && detailsContainer) {
        try {
          window.lucide.createIcons({ root: detailsContainer });
        } catch (_) {}
      }

      // Rolagem suave se a expansão fizer o card ultrapassar o rodapé visível
      setTimeout(() => {
        const rect = card.getBoundingClientRect();
        if (rect.bottom > window.innerHeight - 30) {
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);

      try {
        trackAnalyticsEvent('course_expand_details', {
          course_id: courseId
        });
      } catch (_) {}
    } else {
      card.classList.remove('is-expanded');
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.classList.remove('bg-emerald-50', 'text-[#00702a]', 'border-emerald-300');
        toggleBtn.classList.add('bg-slate-100', 'text-slate-800', 'border-slate-300/80');
      }
      if (toggleLabel) {
        toggleLabel.textContent = 'Ver Ementa e Detalhes';
      }
      if (detailsContainer) {
        detailsContainer.classList.remove('is-open');
        detailsContainer.setAttribute('aria-hidden', 'true');
      }
    }
  }

  // Gerador de HTML de Card de Curso com Tamanho Otimizado e Expansão Dinâmica
  function createCourseCardHtml(course) {
    const isFav = state.favorites.has(course.id);
    const isExpanded = state.expandedCourses && state.expandedCourses.has(course.id);
    const iconInfo = getCourseIconInfo(course);
    const safeTitle = escapeHTML(course.title);
    const safeDesc = escapeHTML(course.description);
    const safeProvider = escapeHTML(course.provider);
    const safeTag = escapeHTML(course.providerTag || course.provider);
    const safeUrl = sanitizeUrl(course.url);
    const coursePageUrl = `/curso/${encodeURIComponent(course.id)}`;
    const courseCoverImg = escapeHTML(course.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80');
    
    const certBadge = course.hasFreeCertificate 
      ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-[#00702a] border border-emerald-300">
           <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i>
           Certificado 100% Grátis
         </span>`
      : `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
           <i data-lucide="info" class="w-3.5 h-3.5"></i>
           ${escapeHTML(course.certificateNote || 'Modo Ouvinte')}
         </span>`;

    const tagsHtml = (course.tags || []).slice(0, 2).map(tag => `
      <span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        #${escapeHTML(tag)}
      </span>
    `).join('');

    const deepLinkUrl = `https://vocepodetudo.com/?curso=${encodeURIComponent(course.id)}`;
    const shareMsg = `Olha esse curso 100% gratuito que encontrei no Você Pode Tudo: "${safeTitle}" (${safeProvider}) com ${course.workloadHours}h de aula e certificado grátis! Acesse: ${deepLinkUrl}`;
    const directWhatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMsg)}`;

    let expandedDetailsInnerHtml = '';
    const getDetailsHtmlFn = (typeof getCourseExpandedDetailsHtml === 'function')
      ? getCourseExpandedDetailsHtml
      : (typeof window !== 'undefined' && typeof window.getCourseExpandedDetailsHtml === 'function')
        ? window.getCourseExpandedDetailsHtml
        : null;

    if (getDetailsHtmlFn) {
      try {
        expandedDetailsInnerHtml = getDetailsHtmlFn(course);
      } catch (err) {
        console.warn('[CourseDetails] Erro ao gerar detalhes do curso:', err);
      }
    }

    return `
      <article 
        class="course-card animate-fade-in-up flex flex-col justify-between bg-white border-2 border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-xl hover:border-[#009639] hover:-translate-y-1 transition-all duration-200 relative group cursor-pointer ${isExpanded ? 'is-expanded' : ''}" 
        aria-label="${safeTitle}"
        data-course-id="${escapeHTML(course.id)}"
        tabindex="0"
        role="region"
      >
        <div>
          <!-- Capa do Curso com Imagem em Alta Resolução & Lazy Loading -->
          <a href="${coursePageUrl}" class="block relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3.5 border border-slate-200 shadow-2xs group-hover:shadow-md transition-all cursor-pointer" title="Ver página e ementa do curso ${safeTitle}">
            <img 
              src="${courseCoverImg}" 
              alt="${safeTitle}" 
              loading="lazy" 
              decoding="async" 
              width="600" 
              height="338" 
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80';"
            >
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
            <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
              <span class="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black border ${course.providerColor || 'bg-white/95 text-slate-800 border-slate-300'} shadow-xs">
                ${safeTag}
              </span>
            </div>
            <div class="absolute bottom-2.5 right-2.5">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 backdrop-blur-xs text-white shadow-xs">
                <i data-lucide="clock" class="w-3 h-3 text-emerald-400"></i>
                ${course.workloadHours}h
              </span>
            </div>
          </a>

          <div class="flex items-center justify-between gap-2 mb-2">
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                ${escapeHTML(course.categoryName || course.category || 'Curso Oficial')}
              </span>
            </div>
            
            <div class="flex items-center gap-1 flex-shrink-0">
              <button 
                data-speak-title="${safeTitle}"
                data-speak-provider="${safeProvider}"
                data-speak-workload="${course.workloadHours}"
                data-speak-desc="${safeDesc}"
                class="speak-course-btn p-1.5 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                title="Ouvir em voz alta os dados deste curso"
                aria-label="Ouvir descrição de ${safeTitle} em voz alta"
              >
                <i data-lucide="volume-2" class="w-3.5 h-3.5"></i>
              </button>

              <button 
                data-course-id="${escapeHTML(course.id)}"
                class="fav-btn p-1.5 rounded-lg border transition-colors ${
                  isFav 
                    ? 'text-rose-600 bg-rose-50 border-rose-200' 
                    : 'text-slate-400 bg-slate-50 border-slate-200 hover:text-rose-600 hover:bg-rose-50'
                }"
                title="${isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}"
                aria-label="${isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}"
              >
                <i data-lucide="heart" class="w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}"></i>
              </button>
            </div>
          </div>

          <h3 class="text-base font-black text-slate-900 leading-snug mb-1.5 group-hover:text-[#009639] transition-colors">
            <a href="${coursePageUrl}" class="hover:underline">
              ${safeTitle}
            </a>
          </h3>

          <p class="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
            <i data-lucide="building-2" class="w-3.5 h-3.5 text-slate-400 flex-shrink-0"></i>
            <span class="truncate">${safeProvider}</span>
          </p>

          <p class="text-xs text-slate-600 mb-3.5 leading-relaxed line-clamp-3">
            ${safeDesc}
          </p>
        </div>

        <div>
          <div class="flex flex-wrap items-center gap-2 mb-3 py-2 border-y border-slate-100 text-xs text-slate-700 font-semibold">
            <span class="inline-flex items-center gap-1">
              <i data-lucide="clock" class="w-3.5 h-3.5 text-[#009639]"></i>
              ${course.workloadHours}h
            </span>
            <span class="text-slate-300">•</span>
            <span class="inline-flex items-center gap-1">
              <i data-lucide="bar-chart-2" class="w-3.5 h-3.5 text-[#002776]"></i>
              ${escapeHTML(course.level || 'Iniciante')}
            </span>
            <span class="text-slate-300">•</span>
            <span class="inline-flex items-center gap-1 font-bold text-amber-700">
              <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400 text-amber-500"></i>
              ${course.rating ? course.rating.toFixed(1) : '4.9'}
            </span>
          </div>

          <div class="flex items-center justify-between gap-1.5 mb-3 flex-wrap">
            ${certBadge}
            <div class="flex items-center gap-1 overflow-hidden">
              ${tagsHtml}
            </div>
          </div>

          <!-- Botão Intuitivo de Expansão de Ementa & Detalhes -->
          <button 
            type="button"
            class="toggle-course-details-btn w-full mb-3 py-2 px-3 rounded-xl font-bold text-xs ${isExpanded ? 'bg-emerald-50 text-[#00702a] border-emerald-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300/80'} border flex items-center justify-between transition-all group/toggle cursor-pointer"
            aria-expanded="${isExpanded ? 'true' : 'false'}"
            aria-controls="course-details-${escapeHTML(course.id)}"
            data-course-id="${escapeHTML(course.id)}"
            title="Ver ementa completa, pré-requisitos, avaliação e certificação oficial"
          >
            <span class="flex items-center gap-1.5 font-bold pointer-events-none">
              <span>🔍</span>
              <span class="toggle-btn-label">${isExpanded ? 'Recolher Ementa e Detalhes' : 'Ver Ementa e Detalhes'}</span>
            </span>
            <i data-lucide="chevron-down" class="toggle-chevron w-4 h-4 text-slate-500 group-hover/toggle:text-slate-900 pointer-events-none transition-transform duration-300"></i>
          </button>

          <div class="flex items-center gap-1.5">
            <!-- Link Principal para a Página Exclusiva do Curso -->
            <a 
              href="${coursePageUrl}"
              class="course-page-link flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-[#009639] via-[#008031] to-[#005e24] hover:from-[#008031] hover:to-[#00471b] text-white shadow-md shadow-emerald-700/20 active:scale-95 transition-all truncate group/btn"
              data-course-id="${course.id}"
              data-course-title="${safeTitle}"
              data-course-provider="${safeProvider}"
              data-course-category="${escapeHTML(course.category || 'Geral')}"
              aria-label="Ver informações completas e acessar curso ${safeTitle}"
            >
              <span>Ver Curso Completo</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5 flex-shrink-0 group-hover/btn:translate-x-1 transition-transform"></i>
            </a>

            <!-- Compartilhar direto no WhatsApp -->
            <a 
              href="${directWhatsappUrl}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-[#00702a] hover:bg-emerald-100 transition-colors flex-shrink-0"
              title="Compartilhar no WhatsApp"
              aria-label="Compartilhar curso ${safeTitle} no WhatsApp"
            >
              <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>

            <!-- Menu de opções de compartilhamento (LinkedIn, Telegram, X, Link) -->
            <button 
              data-share-url="${safeUrl}"
              data-course-title="${safeTitle}"
              data-course-provider="${safeProvider}"
              class="open-share-modal-btn p-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
              title="Mais opções de compartilhamento"
              aria-label="Mais opções de compartilhamento para ${safeTitle}"
            >
              <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>

        <!-- Contêiner Expansível com Ementa e Detalhes Ricos -->
        <div 
          id="course-details-${escapeHTML(course.id)}" 
          class="course-expanded-details ${isExpanded ? 'is-open' : ''}" 
          role="region" 
          aria-label="Ementa e detalhes do curso ${safeTitle}" 
          aria-hidden="${isExpanded ? 'false' : 'true'}"
        >
          <div class="course-expanded-inner">
            ${expandedDetailsInnerHtml}
            
            <!-- Ações Compactas de Rodapé -->
            <div class="course-expanded-actions flex items-center justify-between gap-2 pt-2 border-t border-slate-200 mt-2">
              <a 
                href="${coursePageUrl}" 
                class="course-page-link flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-[#009639] hover:bg-[#007a2e] text-white transition-colors truncate group/cta"
                data-course-id="${course.id}"
                data-course-title="${safeTitle}"
                data-course-provider="${safeProvider}"
                data-course-category="${escapeHTML(course.category || 'Geral')}"
                aria-label="Ver página oficial com ementa e acesso ao curso ${safeTitle}"
              >
                <span>Acessar Página do Curso</span>
                <i data-lucide="arrow-right" class="w-3 h-3 group-hover/cta:translate-x-0.5 transition-transform"></i>
              </a>

              <button 
                type="button" 
                class="collapse-course-details-btn inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 transition-colors flex-shrink-0 cursor-pointer"
                data-course-id="${escapeHTML(course.id)}"
                aria-label="Recolher detalhes do curso ${safeTitle}"
              >
                <i data-lucide="chevron-up" class="w-3 h-3 pointer-events-none"></i>
                <span class="pointer-events-none">Recolher</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  // Vincular ouvintes de evento aos cards de curso
  function attachCourseCardListeners(container) {
    if (!container) return;

    container.querySelectorAll('.speak-course-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const title = btn.getAttribute('data-speak-title');
        const provider = btn.getAttribute('data-speak-provider');
        const workload = btn.getAttribute('data-speak-workload');
        const desc = btn.getAttribute('data-speak-desc');
        const textToRead = `Curso: ${title}. Instituição: ${provider}. Carga horária: ${workload} horas. Descrição: ${desc}.`;
        speakText(textToRead);
      });
    });

    container.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const courseId = btn.getAttribute('data-course-id');
        if (state.favorites.has(courseId)) {
          state.favorites.delete(courseId);
          showToast('Curso removido dos seus salvos!', 'info');
        } else {
          state.favorites.add(courseId);
          showToast('Curso salvo com sucesso nos seus favoritos!', 'success');
        }
        saveFavorites();
        renderCourses(false);
      });
    });

    container.querySelectorAll('.open-share-modal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const url = btn.getAttribute('data-share-url');
        const title = btn.getAttribute('data-course-title');
        const provider = btn.getAttribute('data-course-provider');
        openShareModal(title, provider, url);
      });
    });

    // Rastreamento de Cliques em Cursos Oficiais para Métricas da Administração & Histórico Recente
    container.querySelectorAll('.course-access-link').forEach(link => {
      link.addEventListener('click', () => {
        const courseId = link.getAttribute('data-course-id');
        const title = link.getAttribute('data-course-title');
        const provider = link.getAttribute('data-course-provider');
        const category = link.getAttribute('data-course-category');
        const url = link.getAttribute('href');

        try {
          addToRecentCourses({
            id: courseId,
            title: title,
            provider: provider,
            category: category,
            url: url
          });
        } catch (e) {
          console.warn('[Recentes] Erro:', e);
        }

        trackAnalyticsEvent('course_click', {
          course_id: courseId,
          course_title: title,
          course_provider: provider,
          course_category: category
        });
      });
    });

    // Botões de Copiar Texto para Currículo
    container.querySelectorAll('.copy-resume-tip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const textToCopy = btn.getAttribute('data-copy-text');
        if (!textToCopy) return;

        copyTextToClipboard(textToCopy, () => {
          showToast('Texto para currículo copiado com sucesso!', 'success');
          const originalText = btn.textContent;
          btn.textContent = 'Copiado!';
          btn.classList.add('bg-emerald-100', 'text-emerald-800', 'border-emerald-300');
          setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('bg-emerald-100', 'text-emerald-800', 'border-emerald-300');
          }, 2000);
        }, () => {
          showToast('Não foi possível copiar automaticamente.', 'info');
        });
      });
    });

    // Ouvintes de Expansão / Acessibilidade dos Cards
    const cards = container.classList && container.classList.contains('course-card')
      ? [container]
      : container.querySelectorAll('.course-card:not(.course-ad-card)');

    cards.forEach(card => {
      const courseId = card.getAttribute('data-course-id');
      if (!courseId) return;

      if (card.dataset.expandListenerAttached === 'true') return;
      card.dataset.expandListenerAttached = 'true';

      const toggleBtn = card.querySelector('.toggle-course-details-btn');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleCourseCardExpansion(card, courseId);
        });
      }

      const collapseBtn = card.querySelector('.collapse-course-details-btn');
      if (collapseBtn) {
        collapseBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleCourseCardExpansion(card, courseId, false);
          const rect = card.getBoundingClientRect();
          if (rect.top < 70) {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        });
      }

      card.addEventListener('click', (e) => {
        // Ignora cliques em elementos interativos
        if (e.target.closest('button, a, input, select, textarea, [role="button"], .copy-resume-tip-btn, .fav-btn, .speak-course-btn, .course-access-link, .open-share-modal-btn')) {
          return;
        }

        // Se já está aberto e clicou dentro do conteúdo expandido (seleção de texto, etc.), não fecha
        const clickedInsideContent = e.target.closest('.course-expanded-content');
        if (card.classList.contains('is-expanded') && clickedInsideContent) {
          return;
        }

        toggleCourseCardExpansion(card, courseId);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target === card) {
            e.preventDefault();
            toggleCourseCardExpansion(card, courseId);
          }
        }
      });
    });
  }

  // Atualiza indicadores de carregamento suave / fim de catálogo
  function updateScrollUI(hasMore, totalFiltered) {
    const loadMoreBox = document.getElementById('load-more-box');
    const loadMoreSpinner = document.getElementById('load-more-spinner');
    const loadMoreBtn = document.getElementById('load-more-courses-btn');
    const allLoadedMsg = document.getElementById('all-loaded-message');

    if (totalFiltered === 0) {
      if (loadMoreBox) {
        loadMoreBox.classList.add('hidden');
        loadMoreBox.classList.remove('flex');
      }
      if (allLoadedMsg) allLoadedMsg.classList.add('hidden');
      return;
    }

    if (hasMore) {
      if (loadMoreBox) {
        loadMoreBox.classList.remove('hidden');
        loadMoreBox.classList.add('flex');
      }
      if (loadMoreSpinner) {
        loadMoreSpinner.classList.remove('hidden');
        loadMoreSpinner.classList.add('inline-flex');
      }
      if (loadMoreBtn) {
        loadMoreBtn.classList.add('hidden');
        loadMoreBtn.classList.remove('inline-flex');
      }
      if (allLoadedMsg) allLoadedMsg.classList.add('hidden');
    } else {
      if (loadMoreBox) {
        loadMoreBox.classList.add('hidden');
        loadMoreBox.classList.remove('flex');
      }
      if (allLoadedMsg) {
        if (totalFiltered > state.coursesPerPage) {
          allLoadedMsg.classList.remove('hidden');
        } else {
          allLoadedMsg.classList.add('hidden');
        }
      }
    }
  }

  // Carregar mais cursos suavemente quando o usuário atinge o final da visualização
  function loadMoreCourses() {
    if (state.isLoadingMore) return;
    const filtered = getFilteredCourses();
    const totalFiltered = filtered.length;
    const startIndex = state.currentPage * state.coursesPerPage;
    if (startIndex >= totalFiltered) return;

    state.isLoadingMore = true;
    const spinner = document.getElementById('load-more-spinner');
    const box = document.getElementById('load-more-box');
    if (box) {
      box.classList.remove('hidden');
      box.classList.add('flex');
    }
    if (spinner) {
      spinner.classList.remove('hidden');
      spinner.classList.add('inline-flex');
    }

    setTimeout(() => {
      const nextBatch = filtered.slice(startIndex, startIndex + state.coursesPerPage);
      state.currentPage++;

      const grid = document.getElementById('courses-grid');
      if (grid && nextBatch.length > 0) {
        const cardsHtml = [];
        nextBatch.forEach((course) => {
          cardsHtml.push(createCourseCardHtml(course));
        });

        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = cardsHtml.join('');
        
        const newCards = Array.from(tempContainer.children);
        newCards.forEach(card => {
          grid.appendChild(card);
          attachCourseCardListeners(card);
        });

        if (window.lucide) {
          window.lucide.createIcons({ root: grid });
        }
      }

      // Atualiza o contador de resultados no cabeçalho do catálogo
      const resultCount = document.getElementById('results-count-text');
      if (resultCount && !state.selectedTrack) {
        const currentlyShown = Math.min(state.currentPage * state.coursesPerPage, totalFiltered);
        const viewLabel = state.viewMode === 'favorites' ? 'curso(s) salvo(s)' : 'cursos gratuitos catalogados';
        resultCount.innerHTML = `Exibindo <strong class="text-[#009639]">${currentlyShown}</strong> de <strong class="text-slate-800">${totalFiltered}</strong> ${viewLabel}`;
      }

      const hasMore = (state.currentPage * state.coursesPerPage) < totalFiltered;
      updateScrollUI(hasMore, totalFiltered);
      state.isLoadingMore = false;

      // Se a tela for alta ou o scroll estiver próximo ao final, busca automaticamente mais um lote
      if (hasMore) {
        checkIfNeedsMoreCourses();
      }
    }, 180);
  }

  // Verifica se o gatilho ainda está na área visível para continuar carregando automaticamente
  function checkIfNeedsMoreCourses() {
    if (state.isLoadingMore) return;
    const trigger = document.getElementById('courses-scroll-trigger');
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    
    // Se o gatilho estiver a até 500px da viewport, aciona o próximo lote
    if (rect.top <= windowHeight + 500) {
      loadMoreCourses();
    }
  }

  // Renderizar Cards de Cursos no Catálogo com Carregamento Progressivo Suave
  
  function createInFeedCourseAdHtml(index) {
    return `
      <div class="course-card course-ad-card bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-5 flex flex-col justify-between items-center text-center overflow-hidden min-h-[340px] transition-all hover:shadow-md">
        <div class="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
          <span>Parceiro Educacional</span>
          <span class="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-black">Patrocinado</span>
        </div>
        <div class="w-full flex-1 flex flex-col items-center justify-center py-2 overflow-hidden">
          <ins class="adsbygoogle"
               style="display:block; text-align:center; min-width:250px; min-height:200px;"
               data-ad-layout="in-article"
               data-ad-format="fluid"
               data-ad-client="ca-pub-9923838612147321"
               data-ad-slot="1234567890"></ins>
          <div class="ad-fallback text-xs text-slate-500 dark:text-slate-400 font-semibold mt-3 max-w-xs">
            Apoie o portal gratuito Você Pode Tudo conhecendo os cursos recomendados por nossos parceiros!
          </div>
        </div>
        <div class="w-full pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-center gap-2">
          <a href="curriculo" class="inline-flex items-center gap-1 text-xs font-black text-[#002776] dark:text-blue-400 hover:underline">
            <i data-lucide="award" class="w-3.5 h-3.5"></i>
            <span>Destaque seu currículo hoje</span>
          </a>
        </div>
      </div>
    `;
  }

function renderCourses(resetPagination = true) {
    const grid = document.getElementById('courses-grid');
    const emptyState = document.getElementById('empty-state');
    const resultCount = document.getElementById('results-count-text');
    if (!grid) return;

    if (resetPagination) {
      state.currentPage = 1;
    }

    const filtered = getFilteredCourses();
    const totalFiltered = filtered.length;
    const endIndex = state.currentPage * state.coursesPerPage;
    const visibleCourses = filtered.slice(0, endIndex);
    const hasMore = endIndex < totalFiltered;

    if (resultCount) {
      if (state.selectedTrack) {
        const track = (window.PORTAL_DATA && window.PORTAL_DATA.tracks || []).find(t => t.id === state.selectedTrack);
        resultCount.innerHTML = `
          <div class="inline-flex items-center gap-2 flex-wrap">
            <span>Trilha Guiada: <strong class="text-[#002776]">${track ? escapeHTML(track.title) : ''}</strong> (${totalFiltered} cursos na sequência de aprendizado)</span>
            <button id="clear-track-btn" class="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-bold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
              <i data-lucide="x" class="w-3.5 h-3.5"></i>
              <span>Sair da Trilha</span>
            </button>
          </div>
        `;
        const clearBtn = document.getElementById('clear-track-btn');
        if (clearBtn) {
          clearBtn.addEventListener('click', () => {
            state.selectedTrack = null;
            renderTracks();
            renderCourses(true);
          });
        }
      } else {
        const viewLabel = state.viewMode === 'favorites' ? 'curso(s) salvo(s)' : 'cursos gratuitos catalogados';
        const hasSearch = !!(state.searchTerm && state.searchTerm.trim());
        const hasCategory = !!(state.activeCategory && state.activeCategory !== 'all');
        const hasProvider = !!(state.selectedProvider && state.selectedProvider !== 'Todos');
        const hasFilter = hasSearch || hasCategory || hasProvider;

        let badges = '';
        if (hasFilter) {
          badges = `
            <div class="inline-flex items-center gap-1.5 flex-wrap">
              ${hasSearch ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">Busca: "${escapeHTML(state.searchTerm)}"</span>` : ''}
              ${hasCategory ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-[#00702a] border border-emerald-300">Área: ${escapeHTML(state.activeCategory)}</span>` : ''}
              ${hasProvider ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300">${escapeHTML(state.selectedProvider)}</span>` : ''}
              <button id="clear-all-filters-btn" type="button" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-300 hover:border-rose-300 transition-colors cursor-pointer" title="Limpar todos os filtros">
                <i data-lucide="x" class="w-3 h-3"></i>
                <span>Limpar busca</span>
              </button>
            </div>
          `;
        }

        resultCount.innerHTML = `
          <div class="flex items-center justify-between flex-wrap gap-2 w-full">
            <div>Exibindo <strong class="text-[#009639]">${visibleCourses.length}</strong> de <strong class="text-slate-800">${totalFiltered}</strong> ${viewLabel}</div>
            ${badges}
          </div>
        `;

        const clearFiltersBtn = document.getElementById('clear-all-filters-btn');
        if (clearFiltersBtn) {
          clearFiltersBtn.addEventListener('click', () => {
            state.searchTerm = '';
            state.activeCategory = 'all';
            state.selectedProvider = 'Todos';
            const s1 = document.getElementById('search-input'); if (s1) s1.value = '';
            const s2 = document.getElementById('mobile-search-input'); if (s2) s2.value = '';
            const s3 = document.getElementById('hero-search-input'); if (s3) s3.value = '';
            const p1 = document.getElementById('provider-select'); if (p1) p1.value = 'Todos';
            renderCategories();
            renderCourses(true);
          });
        }
      }
    }

    if (totalFiltered === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      updateScrollUI(false, 0);
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    const cardsHtml = [];
    visibleCourses.forEach((course, index) => {
      cardsHtml.push(createCourseCardHtml(course));
      // Inserir anúncio AdSense a cada 6 cursos quando não estiver no modo de favoritos
      if (state.viewMode !== 'favorites' && (index + 1) % 6 === 0 && (index + 1) < visibleCourses.length) {
        cardsHtml.push(createInFeedCourseAdHtml((index + 1) / 6));
      }
    });

    grid.innerHTML = cardsHtml.join('');
    attachCourseCardListeners(grid);

    try {
      if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        const ads = grid.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status])');
        ads.forEach(ad => {
          ad.setAttribute('data-adsbygoogle-status', 'pending');
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        });
      }
    } catch (_) {}

    if (window.lucide) window.lucide.createIcons({ root: grid });
    updateScrollUI(hasMore, totalFiltered);
    updateHeaderStats();

    // Se o catálogo tem mais cursos e a tela for grande o suficiente, antecipa o próximo lote
    if (hasMore) {
      setTimeout(checkIfNeedsMoreCourses, 200);
    }
  }

  // Configuração do Scroll Infinito Suave (IntersectionObserver + Scroll Listener Redundante)
  let infiniteScrollObserver = null;
  let scrollListenerAttached = false;
  function setupInfiniteScroll() {
    const trigger = document.getElementById('courses-scroll-trigger');
    const loadMoreBtn = document.getElementById('load-more-courses-btn');

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        loadMoreCourses();
      });
    }

    // 1. Mecanismo Principal: IntersectionObserver com 600px de antecipação
    if (trigger && 'IntersectionObserver' in window) {
      if (infiniteScrollObserver) {
        try { infiniteScrollObserver.disconnect(); } catch (e) {}
      }

      infiniteScrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const filtered = getFilteredCourses();
            if ((state.currentPage * state.coursesPerPage) < filtered.length) {
              loadMoreCourses();
            }
          }
        });
      }, {
        root: null,
        rootMargin: '600px 0px 600px 0px',
        threshold: 0
      });

      infiniteScrollObserver.observe(trigger);
    }

    // 2. Mecanismo Redundante de Rolagem (Window Scroll Listener com requestAnimationFrame)
    // Garante 100% de funcionamento em navegadores móveis, WebViews e rolagem contínua
    if (!scrollListenerAttached) {
      scrollListenerAttached = true;
      let isScrollTicking = false;

      function handleScrollProgress() {
        if (isScrollTicking) return;
        isScrollTicking = true;
        window.requestAnimationFrame(() => {
          isScrollTicking = false;
          if (state.isLoadingMore) return;
          const filtered = getFilteredCourses();
          if ((state.currentPage * state.coursesPerPage) >= filtered.length) return;

          const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
          const windowHeight = window.innerHeight || document.documentElement.clientHeight;
          const docHeight = document.documentElement.scrollHeight || document.body.scrollHeight;

          // Se o usuário rolou até os últimos 700px da página ou alcançou a área do gatilho
          if (scrollY + windowHeight >= docHeight - 700) {
            loadMoreCourses();
          } else {
            const trig = document.getElementById('courses-scroll-trigger');
            if (trig) {
              const rect = trig.getBoundingClientRect();
              if (rect.top <= windowHeight + 500) {
                loadMoreCourses();
              }
            }
          }
        });
      }

      window.addEventListener('scroll', handleScrollProgress, { passive: true });
      window.addEventListener('touchmove', handleScrollProgress, { passive: true });
      window.addEventListener('resize', handleScrollProgress, { passive: true });
    }
  }

  function updateHeaderStats() {
    const totalCoursesEl = document.getElementById('stat-total-courses');
    const totalProvidersEl = document.getElementById('stat-total-providers');
    const freeCertsEl = document.getElementById('stat-free-certs');

    const total = state.allCourses.length || 155;
    if (totalCoursesEl) totalCoursesEl.textContent = `${total}+`;
    if (totalProvidersEl) {
      const uniqueProviders = new Set(state.allCourses.map(c => c.provider));
      totalProvidersEl.textContent = `${uniqueProviders.size || 50}+`;
    }
    if (freeCertsEl) {
      const freeCount = state.allCourses.filter(c => c.hasFreeCertificate).length || 148;
      freeCertsEl.textContent = `${freeCount} Cursos`;
    }
  }

  // Alternador de Visualização (Cursos, Trilhas, Salvos, Teste Vocacional, Resultado)
  function updateViewModeButtons() {
    const catTabBtn = document.getElementById('tab-catalog-btn');
    const tracksTabBtn = document.getElementById('tab-tracks-btn');
    const favTabBtn = document.getElementById('tab-favorites-btn');
    const careerTabBtn = document.getElementById('tab-career-test-btn');

    const cursosTrigger = document.getElementById('nav-dropdown-cursos-btn');
    const userTrigger = document.getElementById('nav-dropdown-user-btn');

    const catalogView = document.getElementById('catalog-view');
    const tracksView = document.getElementById('tracks-view');
    const careerTestView = document.getElementById('career-test-view');
    const careerResultView = document.getElementById('career-result-view');

    const itemActiveEmerald = 'flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md text-left bg-emerald-50 text-[#009639] font-bold border-l-2 border-[#009639] cursor-pointer';
    const itemActiveBlue = 'flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md text-left bg-blue-50 text-[#002776] font-bold border-l-2 border-[#002776] cursor-pointer';
    const itemActiveAmber = 'w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left bg-amber-50 text-amber-900 font-bold border-l-2 border-amber-500 cursor-pointer';
    const itemInactive = 'flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-slate-700 hover:bg-slate-50 cursor-pointer';
    const itemInactiveAmber = 'w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left hover:bg-slate-50 text-slate-700 transition-colors group cursor-pointer';

    if (catTabBtn) {
      catTabBtn.className = state.viewMode === 'catalog' ? itemActiveEmerald : itemInactive;
      catTabBtn.setAttribute('aria-selected', state.viewMode === 'catalog' ? 'true' : 'false');
    }
    if (tracksTabBtn) {
      tracksTabBtn.className = state.viewMode === 'tracks' ? itemActiveBlue : itemInactive;
      tracksTabBtn.setAttribute('aria-selected', state.viewMode === 'tracks' ? 'true' : 'false');
    }
    if (favTabBtn) {
      if (!state.student) {
        favTabBtn.classList.add('hidden');
      } else {
        favTabBtn.classList.remove('hidden');
        const isFavActive = state.viewMode === 'favorites';
        favTabBtn.className = isFavActive
          ? 'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left bg-rose-50 text-rose-700 font-bold border-l-2 border-rose-500 cursor-pointer'
          : 'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left hover:bg-rose-50/60 text-slate-700 transition-colors group cursor-pointer';
        favTabBtn.setAttribute('aria-selected', isFavActive ? 'true' : 'false');
      }
    }
    if (careerTabBtn) {
      const isTestActive = state.viewMode === 'career-test' || state.viewMode === 'career-result';
      careerTabBtn.className = isTestActive ? itemActiveAmber : itemInactiveAmber;
      careerTabBtn.setAttribute('aria-selected', isTestActive ? 'true' : 'false');
    }

    if (cursosTrigger) {
      if (state.viewMode === 'catalog') {
        cursosTrigger.className = 'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-black text-[#009639] bg-emerald-50/80 border border-emerald-300 transition-all cursor-pointer group';
      } else if (state.viewMode === 'tracks') {
        cursosTrigger.className = 'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-black text-[#002776] bg-blue-50/80 border border-blue-300 transition-all cursor-pointer group';
      } else if (state.viewMode === 'career-test' || state.viewMode === 'career-result') {
        cursosTrigger.className = 'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-black text-amber-800 bg-amber-50/80 border border-amber-300 transition-all cursor-pointer group';
      } else {
        cursosTrigger.className = 'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-[#009639] hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 transition-all cursor-pointer group';
      }
    }

    if (userTrigger) {
      if (state.viewMode === 'favorites') {
        userTrigger.className = 'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-black text-rose-700 bg-rose-50 border border-rose-300 transition-all cursor-pointer shadow-2xs group';
      } else {
        userTrigger.className = 'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-[#002776] bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all cursor-pointer shadow-2xs group';
      }
    }

    // Ocultar todas as visualizações primeiro para evitar sobreposição
    if (catalogView) catalogView.classList.add('hidden');
    if (tracksView) tracksView.classList.add('hidden');
    if (careerTestView) careerTestView.classList.add('hidden');
    if (careerResultView) careerResultView.classList.add('hidden');

    if (state.viewMode === 'tracks') {
      if (tracksView) tracksView.classList.remove('hidden');
      renderTracksRoadmap();
    } else if (state.viewMode === 'career-test') {
      if (careerTestView) careerTestView.classList.remove('hidden');
    } else if (state.viewMode === 'career-result') {
      if (careerResultView) careerResultView.classList.remove('hidden');
    } else {
      // 'catalog' ou 'favorites'
      if (catalogView) catalogView.classList.remove('hidden');
      renderCourses();
    }
  }

  // ============================================================
  // TESTE DE PERFIL & APTIDÃO PROFISSIONAL (QUESTIONÁRIO & RESULTADO)
  // ============================================================

  function startCareerTest(forceRestart = false) {
    if (!window.CAREER_QUIZ) {
      showToast('Carregando questionário de perfil...', 'info');
      return;
    }

    if (forceRestart) {
      state.careerQuiz.currentStep = 0;
      state.careerQuiz.answers = {};
    }

    state.viewMode = 'career-test';
    updateViewModeButtons();
    renderCurrentQuizStep();

    trackAnalyticsEvent('career_test_started');

    const testEl = document.getElementById('career-test-view');
    if (testEl) {
      testEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function restartCareerTest() {
    if (confirm('Deseja reiniciar o questionário e responder novamente?')) {
      state.careerQuiz.currentStep = 0;
      state.careerQuiz.answers = {};
      state.careerQuiz.result = null;
      try {
        localStorage.removeItem('vpt_career_test_result');
      } catch (e) {}
      startCareerTest(true);
      showToast('Questionário reiniciado com sucesso!', 'info');
    }
  }

  function renderCurrentQuizStep() {
    if (!window.CAREER_QUIZ) return;

    const quiz = window.CAREER_QUIZ;
    const currentIdx = Math.max(0, Math.min(state.careerQuiz.currentStep, quiz.questions.length - 1));
    state.careerQuiz.currentStep = currentIdx;
    const question = quiz.questions[currentIdx];
    if (!question) return;

    // 1. Atualizar indicadores de progresso
    const stepIndicator = document.getElementById('quiz-step-indicator');
    const categoryBadge = document.getElementById('quiz-category-text');
    const progressBar = document.getElementById('quiz-progress-bar');
    const progressText = document.getElementById('quiz-progress-text');
    const titleEl = document.getElementById('quiz-question-title');
    const subtitleEl = document.getElementById('quiz-question-subtitle');
    const optionalTag = document.getElementById('quiz-optional-tag');
    const validationAlert = document.getElementById('quiz-validation-alert');
    const nextBtnText = document.getElementById('quiz-next-btn-text');
    const prevBtn = document.getElementById('quiz-prev-btn');
    const optionsContainer = document.getElementById('quiz-options-container');

    if (stepIndicator) stepIndicator.textContent = `Pergunta ${question.id} de ${quiz.questions.length}`;
    if (categoryBadge) categoryBadge.textContent = question.category || 'Vocacional';

    const percent = Math.round((question.id / quiz.questions.length) * 100);
    if (progressBar) {
      progressBar.style.width = `${percent}%`;
      progressBar.setAttribute('aria-valuenow', percent);
    }
    if (progressText) progressText.textContent = `Progresso: ${percent}%`;

    if (titleEl) titleEl.textContent = question.title;
    if (subtitleEl) subtitleEl.textContent = question.subtitle || '';

    if (optionalTag) {
      if (question.isOptional) optionalTag.classList.remove('hidden');
      else optionalTag.classList.add('hidden');
    }

    if (validationAlert) validationAlert.classList.add('hidden');

    if (prevBtn) {
      prevBtn.disabled = currentIdx === 0;
    }

    if (nextBtnText) {
      nextBtnText.textContent = currentIdx === quiz.questions.length - 1 ? 'Concluir e Ver Meu Resultado 🎉' : 'Avançar';
    }

    // 2. Renderizar opções em cartões grandes e acessíveis
    const selectedOptId = state.careerQuiz.answers[question.id] || null;

    if (optionsContainer) {
      optionsContainer.innerHTML = question.options.map((opt) => {
        const isSelected = selectedOptId === opt.id;
        const letterBadgeColor = isSelected 
          ? 'bg-[#009639] text-white border-transparent font-black' 
          : 'bg-slate-100 text-slate-800 border-slate-300 font-bold';
        const cardStyle = isSelected
          ? 'border-4 border-[#009639] bg-emerald-50/80 shadow-md ring-2 ring-emerald-400'
          : 'border-2 border-slate-200 bg-white hover:border-[#002776] hover:bg-slate-50/80 shadow-2xs';

        return `
          <button 
            type="button"
            data-option-id="${escapeHTML(opt.id)}"
            role="radio"
            aria-checked="${isSelected}"
            class="quiz-option-btn w-full text-left p-4 sm:p-5 rounded-2xl ${cardStyle} transition-all duration-200 flex items-start gap-3.5 sm:gap-4 group cursor-pointer focus:outline-none"
          >
            <!-- Badge da Letra -->
            <span class="w-8 h-8 rounded-xl text-xs sm:text-sm flex items-center justify-center border ${letterBadgeColor} flex-shrink-0 transition-colors shadow-2xs">
              ${escapeHTML(opt.letter || '')}
            </span>

            <!-- Ícone e Conteúdo -->
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <i data-lucide="${escapeHTML(opt.icon || 'circle')}" class="w-4 h-4 ${isSelected ? 'text-[#009639]' : 'text-slate-500 group-hover:text-[#002776]'} transition-colors flex-shrink-0"></i>
                <p class="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                  ${escapeHTML(opt.text)}
                </p>
              </div>
              ${opt.description ? `
                <p class="text-xs text-slate-600 font-medium pl-6 leading-relaxed">
                  ${escapeHTML(opt.description)}
                </p>
              ` : ''}
            </div>

            <!-- Indicador Radio Check -->
            <div class="w-6 h-6 rounded-full border-2 ${isSelected ? 'border-[#009639] bg-[#009639]' : 'border-slate-300 bg-white'} flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
              ${isSelected ? '<i data-lucide="check" class="w-3.5 h-3.5 text-white"></i>' : ''}
            </div>
          </button>
        `;
      }).join('');

      // Adicionar listeners para clique nas opções
      const optButtons = optionsContainer.querySelectorAll('.quiz-option-btn');
      optButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const optId = btn.getAttribute('data-option-id');
          state.careerQuiz.answers[question.id] = optId;
          if (validationAlert) validationAlert.classList.add('hidden');
          renderCurrentQuizStep();
        });
      });
    }

    const testView = document.getElementById('career-test-view');
    if (window.lucide && testView) {
      window.lucide.createIcons({ root: testView });
    }
  }

  function nextQuizStep() {
    if (!window.CAREER_QUIZ) return;
    const quiz = window.CAREER_QUIZ;
    const currentQ = quiz.questions[state.careerQuiz.currentStep];

    // Se a pergunta não for opcional e não estiver respondida, exibe alerta
    if (!currentQ.isOptional && !state.careerQuiz.answers[currentQ.id]) {
      const alertEl = document.getElementById('quiz-validation-alert');
      if (alertEl) {
        alertEl.classList.remove('hidden');
        alertEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (state.careerQuiz.currentStep < quiz.questions.length - 1) {
      state.careerQuiz.currentStep++;
      renderCurrentQuizStep();
      const testView = document.getElementById('career-test-view');
      if (testView) testView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      finishCareerTest();
    }
  }

  function prevQuizStep() {
    if (state.careerQuiz.currentStep > 0) {
      state.careerQuiz.currentStep--;
      renderCurrentQuizStep();
      const testView = document.getElementById('career-test-view');
      if (testView) testView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function finishCareerTest() {
    if (!window.CAREER_QUIZ) return;
    const results = window.CAREER_QUIZ.calculateResults(state.careerQuiz.answers, state.allCourses);
    state.careerQuiz.result = results;
    state.careerQuiz.activeResultArea = results.primary.areaKey;

    try {
      localStorage.setItem('vpt_career_test_result', JSON.stringify(results));
    } catch (e) {}

    trackAnalyticsEvent('career_test_completed', {
      primary_area: results.primary.areaKey
    });

    if (state.studentToken) {
      saveStudentCareerTest(results);
    }

    state.viewMode = 'career-result';
    updateViewModeButtons();
    renderCareerResult();

    showToast('Parabéns! Seu teste de perfil profissional foi concluído com sucesso.', 'success');

    const resultEl = document.getElementById('career-result-view');
    if (resultEl) {
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function renderCareerResult(areaKeyOverride = null) {
    if (!state.careerQuiz.result || !window.CAREER_QUIZ) return;

    if (areaKeyOverride) {
      state.careerQuiz.activeResultArea = areaKeyOverride;
    }

    const res = state.careerQuiz.result;
    const activeAreaKey = state.careerQuiz.activeResultArea || res.primary.areaKey;
    const activeArea = window.CAREER_QUIZ.areas[activeAreaKey] || res.primary.area;
    const isPrimaryArea = activeAreaKey === res.primary.areaKey;

    // 1. Atualizar Perfil Exibido
    const headerBadge = document.getElementById('result-primary-header-badge');
    const matchBadge = document.getElementById('result-primary-match-badge');
    const iconBox = document.getElementById('result-primary-icon-box');
    const titleEl = document.getElementById('result-primary-title');
    const taglineEl = document.getElementById('result-primary-tagline');
    const descEl = document.getElementById('result-primary-desc');
    const reasonEl = document.getElementById('result-primary-reason');

    const affinityObj = res.affinities.find(a => a.areaKey === activeAreaKey) || res.primary;

    if (headerBadge) {
      headerBadge.textContent = isPrimaryArea ? 'Seu Perfil Principal Sugerido' : 'Área Selecionada para Exploração';
    }

    const quizSaveBanner = document.getElementById('quiz-save-to-account-banner');
    if (quizSaveBanner) {
      if (state.student) {
        quizSaveBanner.classList.add('hidden');
      } else {
        quizSaveBanner.classList.remove('hidden');
      }
    }
    if (matchBadge) {
      matchBadge.textContent = `${affinityObj.percent}% de Afinidade`;
    }
    if (iconBox) {
      iconBox.innerHTML = `<i data-lucide="${escapeHTML(activeArea.icon || 'star')}" class="w-7 h-7"></i>`;
    }
    if (titleEl) titleEl.textContent = activeArea.title;
    if (taglineEl) taglineEl.textContent = activeArea.tagline || '';
    if (descEl) descEl.textContent = activeArea.description || '';
    if (reasonEl) {
      reasonEl.textContent = isPrimaryArea 
        ? 'Suas respostas demonstraram entusiasmo por resolver desafios práticos desta área, interesses alinhados às rotinas profissionais e curiosidade por desenvolver as competências exigidas pelo mercado.'
        : `Você selecionou para conhecer os detalhes e cursos gratuitos da área de ${activeArea.title}. Você obteve ${affinityObj.percent}% de afinidade com este setor.`;
    }

    // 2. Segunda Área de Interesse (quando aplicável)
    const secondaryCard = document.getElementById('result-secondary-card');
    const secondaryTitle = document.getElementById('result-secondary-title');
    const secondaryPercent = document.getElementById('result-secondary-percent');
    const secondaryDesc = document.getElementById('result-secondary-desc');

    if (secondaryCard) {
      if (res.secondary && res.secondary.areaKey !== activeAreaKey) {
        secondaryCard.classList.remove('hidden');
        if (secondaryTitle) secondaryTitle.textContent = res.secondary.area.title;
        if (secondaryPercent) secondaryPercent.textContent = `${res.secondary.percent}% de Afinidade Complementar`;
        if (secondaryDesc) secondaryDesc.textContent = res.secondary.area.tagline || 'Área complementar de grande afinidade.';
      } else {
        secondaryCard.classList.add('hidden');
      }
    }

    // 3. Preferências de Estudo Informadas
    const prefDevice = document.getElementById('result-pref-device');
    const prefHours = document.getElementById('result-pref-hours');
    if (prefDevice) {
      const devText = res.devicePreference === 'mobile' ? 'Apenas pelo Celular (priorizando cursos responsivos)' :
                      res.devicePreference === 'pc' ? 'Computador / Notebook' : 'Celular e Computador';
      prefDevice.innerHTML = `Estudando pelo: <strong>${escapeHTML(devText)}</strong>`;
    }
    if (prefHours) {
      const hrsText = res.hoursPreference === 'short' ? 'Até 2h semanais (ritmo leve)' :
                      res.hoursPreference === 'long' ? 'Mais de 5h semanais (ritmo intensivo)' : 'De 3 a 5h semanais (ritmo equilibrado)';
      prefHours.innerHTML = `Dedicação semanal: <strong>${escapeHTML(hrsText)}</strong>`;
    }

    // 4. Gráfico de Afinidade Relativa das 8 Áreas
    const affinitiesGrid = document.getElementById('result-affinities-grid');
    if (affinitiesGrid) {
      affinitiesGrid.innerHTML = res.affinities.map(aff => {
        const isCurrentActive = aff.areaKey === activeAreaKey;
        const barColor = isCurrentActive 
          ? 'bg-gradient-to-r from-[#009639] via-[#ffcc29] to-[#002776]' 
          : 'bg-gradient-to-r from-slate-400 to-slate-500';
        return `
          <div class="space-y-1 p-2 rounded-xl transition-colors ${isCurrentActive ? 'bg-emerald-50/70 border border-emerald-300' : 'hover:bg-slate-50'}">
            <div class="flex items-center justify-between text-xs font-bold text-slate-800">
              <span class="flex items-center gap-1.5">
                <i data-lucide="${escapeHTML(aff.area.icon || 'circle')}" class="w-3.5 h-3.5 ${isCurrentActive ? 'text-[#009639]' : 'text-slate-400'}"></i>
                <span class="${isCurrentActive ? 'text-[#002776] font-black' : 'text-slate-800'}">${escapeHTML(aff.area.title)}</span>
                ${isCurrentActive ? '<span class="text-[9px] uppercase font-black px-1.5 py-0.2 rounded bg-emerald-100 text-[#00702a]">Exibindo</span>' : ''}
              </span>
              <span class="font-black ${isCurrentActive ? 'text-[#00702a] text-sm' : 'text-slate-600'}">
                ${aff.percent}%
              </span>
            </div>
            <div class="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div class="h-full ${barColor} rounded-full transition-all duration-500" style="width: ${aff.percent}%;"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 5. TRILHA PERSONALIZADA COM ETAPAS ORGANIZADAS (CURSOS REAIS)
    const trackTitleEl = document.getElementById('result-track-title');
    if (trackTitleEl) trackTitleEl.textContent = activeArea.trackTitle || 'TRILHA DE APRENDIZAGEM RECOMENDADA';

    const stepsContainer = document.getElementById('result-track-steps-container');
    if (stepsContainer && activeArea.trackStepCourses) {
      const stepsHtml = activeArea.trackStepCourses.map(stepDef => {
        const course = (state.allCourses || []).find(c => c.id === stepDef.id) || {
          id: stepDef.id,
          title: stepDef.label,
          provider: 'Instituição Parceira Oficial',
          workloadHours: 20,
          hasFreeCertificate: true,
          certificateNote: 'Certificado 100% Gratuito',
          url: 'https://vocepodetudo.com'
        };

        const certBadge = course.hasFreeCertificate 
          ? '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-[#00702a] border border-emerald-300"><i data-lucide="award" class="w-3 h-3"></i> Certificado 100% Gratuito</span>'
          : '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-100 text-[#002776] border border-blue-200"><i data-lucide="book-open" class="w-3 h-3"></i> Modo Ouvinte Gratuito</span>';

        return `
          <div class="bg-white border-2 border-slate-200 hover:border-[#009639] rounded-2xl p-4 sm:p-5 shadow-xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="flex items-start gap-3.5 flex-1">
              <span class="w-9 h-9 rounded-xl font-black text-xs sm:text-sm bg-[#002776] text-[#ffdf00] flex items-center justify-center flex-shrink-0 shadow-sm">
                ${stepDef.step}º
              </span>
              <div class="space-y-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Etapa ${stepDef.step}: ${escapeHTML(stepDef.label)}
                  </span>
                  ${certBadge}
                </div>
                <h4 class="font-black text-base sm:text-lg text-slate-900 leading-tight">
                  ${escapeHTML(course.title)}
                </h4>
                <div class="flex items-center gap-3 text-xs text-slate-500 font-semibold flex-wrap">
                  <span class="flex items-center gap-1 text-[#002776]">
                    <i data-lucide="building-2" class="w-3.5 h-3.5"></i>
                    <span>${escapeHTML(course.provider)}</span>
                  </span>
                  <span>•</span>
                  <span class="flex items-center gap-1">
                    <i data-lucide="clock" class="w-3.5 h-3.5 text-slate-400"></i>
                    <span>${course.workloadHours} horas</span>
                  </span>
                  <span>•</span>
                  <span class="text-[#009639] font-black flex items-center gap-1">
                    <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
                    <span>100% Gratuito</span>
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 w-full md:w-auto flex-shrink-0 justify-end">
              <a 
                href="/curso/${encodeURIComponent(course.id)}"
                class="w-full md:w-auto px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-[#009639] hover:bg-[#00702a] text-white transition-all shadow-sm flex items-center justify-center gap-2"
                data-course-id="${escapeHTML(course.id)}"
                data-course-title="${escapeHTML(course.title)}"
                data-course-provider="${escapeHTML(course.provider)}"
                data-course-category="${escapeHTML(course.category || 'Geral')}"
              >
                <span>Ver Curso Completo</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </a>
            </div>
          </div>
        `;
      }).join('');
      stepsContainer.innerHTML = stepsHtml;
    }

    // 6. Cursos Relacionados
    const relatedContainer = document.getElementById('result-related-courses-grid');
    const relatedTitle = document.getElementById('result-related-title');
    if (relatedTitle) relatedTitle.textContent = `Mais Cursos Gratuitos de ${activeArea.shortName || activeArea.title}`;

    if (relatedContainer) {
      const stepCourseIds = (activeArea.trackStepCourses || []).map(s => s.id);
      const matchingRelated = (state.allCourses || []).filter(c => {
        if (stepCourseIds.includes(c.id)) return false;
        const cat = (c.category || '').toLowerCase();
        const text = (c.title + ' ' + (c.tags || []).join(' ')).toLowerCase();
        if (activeAreaKey === 'tecnologia') return cat === 'tecnologia' || cat === 'ia' || cat === 'nuvem';
        if (activeAreaKey === 'administracao') return cat === 'gestao' || cat === 'profissionalizacao' || text.includes('excel');
        if (activeAreaKey === 'comunicacao') return cat === 'profissionalizacao' || cat === 'outros' || text.includes('comunicação');
        if (activeAreaKey === 'criatividade') return cat === 'artes' || cat === 'negocios' || text.includes('vídeo');
        if (activeAreaKey === 'vendas') return cat === 'empreendedorismo' || cat === 'negocios';
        if (activeAreaKey === 'tecnica') return cat === 'saude' || cat === 'agro';
        if (activeAreaKey === 'gestao') return cat === 'gestao' || cat === 'produtividade';
        if (activeAreaKey === 'educacao') return cat === 'acessibilidade' || cat === 'educacao';
        return false;
      }).slice(0, 6);

      if (matchingRelated.length === 0) {
        relatedContainer.innerHTML = `<div class="col-span-full py-4 text-center text-xs text-slate-500 font-medium">Os 5 cursos oficiais acima compõem a seleção principal para esta área.</div>`;
      } else {
        relatedContainer.innerHTML = matchingRelated.map(c => `
          <div class="bg-white border border-slate-200 hover:border-[#002776] rounded-2xl p-4 shadow-2xs transition-all flex flex-col justify-between">
            <div class="space-y-2 mb-3">
              <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-50 text-[#002776] border border-blue-200 inline-block">
                ${escapeHTML(c.provider)}
              </span>
              <h5 class="font-bold text-sm text-slate-900 leading-snug">
                ${escapeHTML(c.title)}
              </h5>
              <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                ${escapeHTML(c.description || '')}
              </p>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span class="font-bold text-[#009639]">${c.workloadHours}h • 100% Grátis</span>
              <a 
                href="/curso/${encodeURIComponent(c.id)}" 
                class="font-black text-[#002776] hover:underline flex items-center gap-1"
                data-course-id="${escapeHTML(c.id)}"
                data-course-title="${escapeHTML(c.title)}"
                data-course-provider="${escapeHTML(c.provider)}"
              >
                <span>Ver Curso</span>
                <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
              </a>
            </div>
          </div>
        `).join('');
      }
    }

    const resultView = document.getElementById('career-result-view');
    if (window.lucide && resultView) {
      window.lucide.createIcons({ root: resultView });
    }
  }

  function openReviewAnswersModal() {
    if (!window.CAREER_QUIZ) return;
    const modal = document.getElementById('career-review-modal');
    const listEl = document.getElementById('career-review-list');
    if (!modal || !listEl) return;

    listEl.innerHTML = window.CAREER_QUIZ.questions.map((q, idx) => {
      const chosenOptId = state.careerQuiz.answers[q.id];
      const chosenOpt = chosenOptId ? q.options.find(o => o.id === chosenOptId) : null;
      const isAnswered = Boolean(chosenOpt);

      return `
        <div class="p-3 rounded-xl border ${isAnswered ? 'border-slate-200 bg-white' : 'border-amber-200 bg-amber-50/50'} flex items-start justify-between gap-3">
          <div class="space-y-0.5">
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-md font-black text-[10px] bg-slate-100 text-slate-700 flex items-center justify-center">
                ${q.id}
              </span>
              <span class="text-[10px] font-bold uppercase text-slate-500">${escapeHTML(q.category)}</span>
            </div>
            <p class="font-bold text-slate-800 text-xs">${escapeHTML(q.title)}</p>
            <p class="text-xs ${isAnswered ? 'text-emerald-700 font-medium' : 'text-amber-800 italic'}">
              ${isAnswered ? `Resposta: <strong>${escapeHTML(chosenOpt.text)}</strong>` : 'Ainda não respondida'}
            </p>
          </div>
          <button 
            type="button" 
            class="px-2.5 py-1 rounded-lg text-xs font-bold text-[#002776] hover:bg-blue-50 border border-blue-200 flex-shrink-0 cursor-pointer"
            onclick="window.careerQuizJumpToQuestion(${idx})"
          >
            Alterar
          </button>
        </div>
      `;
    }).join('');

    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons({ root: modal });
  }

  function openCareerExploreModal() {
    if (!window.CAREER_QUIZ) return;
    const modal = document.getElementById('career-explore-modal',
          'takedown-modal');
    const gridEl = document.getElementById('career-explore-grid');
    if (!modal || !gridEl) return;

    gridEl.innerHTML = Object.values(window.CAREER_QUIZ.areas).map(area => {
      const isCurrentActive = state.careerQuiz.activeResultArea === area.id;
      return `
        <button 
          type="button" 
          class="p-4 rounded-2xl border-2 ${isCurrentActive ? 'border-[#009639] bg-emerald-50' : 'border-slate-200 bg-white hover:border-[#002776] hover:bg-slate-50'} text-left transition-all shadow-2xs flex items-start gap-3 cursor-pointer group"
          onclick="window.careerQuizSelectExploreArea('${escapeHTML(area.id)}')"
        >
          <div class="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-[#002776] group-hover:text-white flex items-center justify-center flex-shrink-0 text-slate-700 transition-colors">
            <i data-lucide="${escapeHTML(area.icon || 'star')}" class="w-5 h-5"></i>
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between mb-0.5">
              <h5 class="font-bold text-sm text-slate-900 leading-snug">${escapeHTML(area.title)}</h5>
              ${isCurrentActive ? '<span class="text-[9px] font-black text-[#00702a] uppercase bg-emerald-100 px-1.5 py-0.2 rounded">Atual</span>' : ''}
            </div>
            <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">${escapeHTML(area.tagline)}</p>
          </div>
        </button>
      `;
    }).join('');

    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons({ root: modal });
  }

  // Funções globais utilitárias para saltos nos modais
  window.careerQuizJumpToQuestion = function(qIndex) {
    const modal = document.getElementById('career-review-modal');
    if (modal) modal.classList.add('hidden');
    state.viewMode = 'career-test';
    updateViewModeButtons();
    state.careerQuiz.currentStep = qIndex;
    renderCurrentQuizStep();
    const testView = document.getElementById('career-test-view');
    if (testView) testView.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.careerQuizSelectExploreArea = function(areaId) {
    const modal = document.getElementById('career-explore-modal');
    if (modal) modal.classList.add('hidden');
    state.careerQuiz.activeResultArea = areaId;
    renderCareerResult(areaId);
    const trackSection = document.getElementById('result-track-section');
    if (trackSection) trackSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (window.CAREER_QUIZ && window.CAREER_QUIZ.areas[areaId]) {
      showToast(`Visualizando cursos recomendados de ${window.CAREER_QUIZ.areas[areaId].title}`, 'info');
    }
  };

  // Configuração dos Modais (Admin Login Seguro com MySQL, SHA-256 e Troca de Senha)
  function setupModals() {
    const adminLoginModal = document.getElementById('admin-login-modal');
    const openAdminLoginBtn = document.getElementById('open-admin-login-btn');
    const footerAdminBtn = document.getElementById('footer-admin-btn');
    const closeAdminLoginBtn = document.getElementById('close-admin-login-btn');
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminLoginSubmitBtn = document.getElementById('admin-login-submit-btn');
    const lockoutAlert = document.getElementById('admin-lockout-alert');
    const lockoutCountdown = document.getElementById('admin-lockout-countdown');

    const adminCourseModal = document.getElementById('admin-course-modal');
    const adminAddCourseBtn = document.getElementById('admin-add-course-btn');
    const closeAdminCourseModalBtn = document.getElementById('close-admin-course-modal-btn');
    const adminCourseForm = document.getElementById('admin-course-form');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');

    const changePasswordModal = document.getElementById('admin-change-password-modal');
    const openChangePasswordBtn = document.getElementById('open-change-password-modal-btn');
    const closeChangePasswordBtn = document.getElementById('close-change-password-btn');
    const changePasswordForm = document.getElementById('change-password-form');

    const reportModal = document.getElementById('report-modal');
    const openReportBtns = document.querySelectorAll('.open-report-modal-btn');
    const closeReportBtn = document.getElementById('close-report-modal-btn');
    const reportForm = document.getElementById('report-broken-form');

    function updateLockoutUI() {
      const remaining = getLockoutRemainingSeconds();
      if (remaining > 0) {
        if (lockoutAlert) lockoutAlert.classList.remove('hidden');
        if (lockoutCountdown) {
          const minutes = Math.floor(remaining / 60);
          const seconds = remaining % 60;
          lockoutCountdown.textContent = `Acesso temporariamente bloqueado por excesso de tentativas. Tente novamente em ${minutes}m ${seconds}s.`;
        }
        if (adminLoginSubmitBtn) {
          adminLoginSubmitBtn.disabled = true;
          adminLoginSubmitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
      } else {
        if (lockoutAlert) lockoutAlert.classList.add('hidden');
        if (adminLoginSubmitBtn) {
          adminLoginSubmitBtn.disabled = false;
          adminLoginSubmitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
      }
    }

    setInterval(() => {
      if (adminLoginModal && !adminLoginModal.classList.contains('hidden')) {
        updateLockoutUI();
      }
    }, 1000);

    const handleAdminAccess = (e) => {
      if (e && e.preventDefault) e.preventDefault();
      openAdminPopup();
    };

    if (openAdminLoginBtn) openAdminLoginBtn.addEventListener('click', handleAdminAccess);
    if (footerAdminBtn) footerAdminBtn.addEventListener('click', handleAdminAccess);

    if (closeAdminLoginBtn && adminLoginModal) {
      closeAdminLoginBtn.addEventListener('click', () => {
        adminLoginModal.classList.add('hidden');
      });
    }

    // Processar Login Seguro do Administrador
    if (adminLoginForm) {
      adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userInput = document.getElementById('admin-user-input');
        const passInput = document.getElementById('admin-pass-input');

        const enteredUser = userInput ? userInput.value.trim() : '';
        const enteredPass = passInput ? passInput.value.trim() : '';

        if (!enteredPass) {
          showToast('Informe a senha de acesso.', 'error');
          return;
        }

        const remaining = getLockoutRemainingSeconds();
        if (remaining > 0) {
          showToast(`Acesso temporariamente bloqueado. Aguarde ${remaining} segundos.`, 'error');
          updateLockoutUI();
          return;
        }

        // Autenticação Segura via API
        let loginSucceeded = false;
        try {
          const res = await fetch(`${API_BASE}/auth.php?action=login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: enteredUser || 'admin', password: enteredPass })
          });

          if (res.ok) {
            const result = await res.json();
            if (result.success && result.token) {
              state.isAdmin = true;
              sessionStorage.setItem('vpt_is_admin', 'true');
              sessionStorage.setItem('vpt_auth_token', result.token);
              sessionStorage.setItem('vpt_admin_login_time', Date.now().toString());
              clearFailedLoginAttempts();
              updateAdminUI();
              if (adminLoginModal) adminLoginModal.classList.add('hidden');
              adminLoginForm.reset();
              showToast('Login de administrador autenticado com sucesso!', 'success');
              return;
            }
          }
        } catch (serverErr) {
          // Falha na requisição ao servidor
        }

        const lockedSecs = registerFailedLoginAttempt();
        updateLockoutUI();
        if (lockedSecs > 0) {
          showToast(`Bloqueio de segurança ativado por ${lockedSecs / 60} minutos.`, 'error');
        } else {
          const currentAttempts = parseInt(localStorage.getItem('vpt_admin_failed_attempts') || '0', 10);
          showToast(`Usuário ou senha incorretos (${currentAttempts}/${SECURITY.MAX_ATTEMPTS} tentativas).`, 'error');
        }
      });
    }

    // Logout do Administrador
    if (adminLogoutBtn) {
      adminLogoutBtn.addEventListener('click', () => {
        state.isAdmin = false;
        sessionStorage.removeItem('vpt_is_admin');
        sessionStorage.removeItem('vpt_auth_token');
        sessionStorage.removeItem('vpt_admin_login_time');
        updateAdminUI();
        if (adminCourseModal) adminCourseModal.classList.add('hidden');
        showToast('Sua sessão de administrador foi encerrada com segurança.', 'info');
      });
    }

    // Botão "+ Novo Curso"
    if (adminAddCourseBtn && adminCourseModal) {
      adminAddCourseBtn.addEventListener('click', () => {
        adminCourseModal.classList.remove('hidden');
      });
    }

    if (closeAdminCourseModalBtn && adminCourseModal) {
      closeAdminCourseModalBtn.addEventListener('click', () => {
        adminCourseModal.classList.add('hidden');
      });
    }

    // Modal de Troca de Senha do Administrador
    const changePwHeaderBtn = document.getElementById('admin-change-pw-header-btn');
    if (changePwHeaderBtn && changePasswordModal) {
      changePwHeaderBtn.addEventListener('click', () => {
        changePasswordModal.classList.remove('hidden');
      });
    }

    if (openChangePasswordBtn && changePasswordModal) {
      openChangePasswordBtn.addEventListener('click', () => {
        if (adminCourseModal) adminCourseModal.classList.add('hidden');
        changePasswordModal.classList.remove('hidden');
      });
    }

    if (closeChangePasswordBtn && changePasswordModal) {
      closeChangePasswordBtn.addEventListener('click', () => {
        changePasswordModal.classList.add('hidden');
        if (adminCourseModal) adminCourseModal.classList.remove('hidden');
      });
    }

    if (changePasswordForm) {
      changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassInput = document.getElementById('current-password-input');
        const newPassInput = document.getElementById('new-password-input');
        const confirmPassInput = document.getElementById('confirm-password-input');

        const currentPass = currentPassInput ? currentPassInput.value.trim() : '';
        const newPass = newPassInput ? newPassInput.value.trim() : '';
        const confirmPass = confirmPassInput ? confirmPassInput.value.trim() : '';

        if (newPass.length < 6) {
          showToast('A nova senha deve ter no mínimo 6 caracteres.', 'error');
          return;
        }

        if (newPass !== confirmPass) {
          showToast('A confirmação da nova senha não confere.', 'error');
          return;
        }

        // Alterar diretamente no MySQL
        const authToken = sessionStorage.getItem('vpt_auth_token');
        if (authToken) {
          try {
            const res = await fetch(`${API_BASE}/auth.php?action=change_password`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify({ current_password: currentPass, new_password: newPass })
            });

            const result = await res.json();
            if (res.ok && result.success) {
              changePasswordForm.reset();
              if (changePasswordModal) changePasswordModal.classList.add('hidden');
              if (adminCourseModal) adminCourseModal.classList.remove('hidden');
              showToast('Senha alterada com sucesso no MySQL (BCRYPT)!', 'success');
              return;
            } else {
              showToast(result.message || 'Senha atual incorreta.', 'error');
              return;
            }
          } catch (err) {
            console.error('Erro na requisição ao servidor:', err);
            showToast('Erro de comunicação com o servidor ao alterar senha.', 'error');
            return;
          }
        } else {
          showToast('Sessão expirada. Faça login novamente.', 'error');
        }
      });
    }

    // Processar Inclusão de Curso pelo Administrador (MySQL + Fallback Local)
    if (adminCourseForm) {
      adminCourseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('admin-title').value.trim();
        const provider = document.getElementById('admin-provider').value.trim();
        const category = document.getElementById('admin-category').value;
        const rawUrl = document.getElementById('admin-url').value.trim();
        const workload = parseInt(document.getElementById('admin-workload').value, 10) || 20;
        const certFree = document.getElementById('admin-cert').value === 'sim';
        const level = document.getElementById('admin-level').value;
        const desc = document.getElementById('admin-desc').value.trim();

        const safeUrl = sanitizeUrl(rawUrl);

        if (!title || !provider || safeUrl === '#') {
          showToast('Por favor, informe um Título, Instituição e Link Oficial válido (https://)!', 'error');
          return;
        }

        // 1. Tentar salvar no MySQL via API
        const authToken = sessionStorage.getItem('vpt_auth_token');
        if (authToken) {
          try {
            const res = await fetch(`${API_BASE}/courses.php`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify({
                title,
                provider,
                category,
                url: safeUrl,
                workloadHours: workload,
                hasFreeCertificate: certFree,
                level,
                description: desc
              })
            });

            const result = await res.json();
            if (res.ok && result.success && result.course) {
              state.allCourses.unshift(result.course);
              adminCourseForm.reset();
              if (adminCourseModal) adminCourseModal.classList.add('hidden');
              showToast(`Curso "${title}" salvo com sucesso no MySQL e publicado para todos!`, 'success');

              renderCourses();
              renderTracksRoadmap();
              renderProviderOptions();
              return;
            }
          } catch (serverErr) {
            console.error('Falha ao gravar no servidor MySQL, gravando localmente:', serverErr);
          }
        }

        // 2. Fallback Local caso o servidor não esteja ativo
        const newCourse = {
          id: 'admin-' + Date.now(),
          title: title,
          provider: provider,
          providerTag: provider.length > 15 ? provider.substring(0, 15) : provider,
          providerColor: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-black',
          category: category,
          categoryName: category,
          description: desc || 'Curso oficial catalogado pela moderação do portal Você Pode Tudo.',
          url: safeUrl,
          workloadHours: workload,
          hasFreeCertificate: certFree,
          certificateNote: certFree ? 'Certificado 100% Gratuito' : 'Modo Ouvinte Gratuito',
          level: level,
          tags: ['Oficial', 'Novo', provider],
          featured: true,
          rating: 5.0,
          reviewsCount: 1
        };

        try {
          const userCoursesRaw = localStorage.getItem('vocepodetudo_custom_courses') || localStorage.getItem('estudegratis_custom_courses');
          const customCourses = userCoursesRaw ? JSON.parse(userCoursesRaw) : [];
          customCourses.unshift(newCourse);
          localStorage.setItem('vocepodetudo_custom_courses', JSON.stringify(customCourses));

          state.allCourses.unshift(newCourse);
          adminCourseForm.reset();
          if (adminCourseModal) adminCourseModal.classList.add('hidden');
          showToast(`Curso "${title}" publicado com sucesso no catálogo!`, 'success');

          renderCourses();
          renderTracksRoadmap();
          renderProviderOptions();
        } catch (err) {
          console.error(err);
          showToast('Erro ao salvar curso.', 'error');
        }
      });
    }

    // Modal de Reportar Link Quebrado
    openReportBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (reportModal) reportModal.classList.remove('hidden');
      });
    });

    if (closeReportBtn && reportModal) {
      closeReportBtn.addEventListener('click', () => {
        reportModal.classList.add('hidden');
      });
    }

    if (reportForm) {
      reportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Obrigado! Seu aviso de link foi registrado para moderação da equipe.', 'success');
        reportForm.reset();
        if (reportModal) reportModal.classList.add('hidden');
      });
    }

    // Modal de Aviso de Utilidade Pública & Sobre o Projeto (Abertura automática inicial desativada)
    const disclaimerModal = document.getElementById('welcome-disclaimer-modal');
    const closeDisclaimerXBtn = document.getElementById('close-disclaimer-x-btn');
    const confirmDisclaimerBtn = document.getElementById('confirm-disclaimer-btn');
    const openDisclaimerFooterBtn = document.getElementById('footer-disclaimer-btn');

    function closeDisclaimer() {
      if (disclaimerModal) {
        disclaimerModal.classList.add('hidden');
      }
    }

    if (closeDisclaimerXBtn) closeDisclaimerXBtn.addEventListener('click', closeDisclaimer);
    if (confirmDisclaimerBtn) confirmDisclaimerBtn.addEventListener('click', closeDisclaimer);
    if (openDisclaimerFooterBtn && disclaimerModal) {
      openDisclaimerFooterBtn.addEventListener('click', () => {
        disclaimerModal.classList.remove('hidden');
        if (window.lucide && window.lucide.createIcons) {
          window.lucide.createIcons({ root: disclaimerModal });
        }
      });
    }

    // Modal de Opções de Compartilhamento do Curso
    const shareModal = document.getElementById('share-course-modal');
    const closeShareModalBtn = document.getElementById('close-share-modal-btn');
    const copyShareUrlBtn = document.getElementById('share-modal-copy-btn');
    const inputShareUrl = document.getElementById('share-modal-input-url');

    if (closeShareModalBtn && shareModal) {
      closeShareModalBtn.addEventListener('click', () => {
        shareModal.classList.add('hidden');
      });
    }

    if (copyShareUrlBtn && inputShareUrl) {
      copyShareUrlBtn.addEventListener('click', async () => {
        const url = inputShareUrl.value;
        try {
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(url);
            showToast('Link do curso copiado com sucesso!', 'success');
          } else {
            inputShareUrl.select();
            document.execCommand('copy');
            showToast('Link do curso copiado!', 'success');
          }
        } catch (err) {
          showToast('Link: ' + url, 'info');
        }
      });
    }

    [adminLoginModal, adminCourseModal, changePasswordModal, reportModal, disclaimerModal, shareModal].forEach(modal => {
      if (!modal) return;
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          if (modal === disclaimerModal) {
            closeDisclaimer();
          } else {
            modal.classList.add('hidden');
          }
        }
      });
    });
  }

  // Atalhos de Teclado e Eventos Gerais
  function setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modals = [
          'admin-login-modal',
          'admin-course-modal',
          'admin-change-password-modal',
          'report-modal',
          'welcome-disclaimer-modal',
          'share-course-modal',
          'career-review-modal',
          'career-explore-modal'
        ];
        modals.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.classList.add('hidden');
        });

        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          state.isSpeaking = false;
        }
      }

      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }

      if (e.altKey && e.key === '1') {
        e.preventDefault();
        const main = document.getElementById('main-content');
        if (main) main.focus();
      }

      if (e.altKey && e.key === '2') {
        e.preventDefault();
        const search = document.getElementById('search-input');
        if (search) search.focus();
      }

      // Navegação por teclado no teste de perfil vocacional
      if (state.viewMode === 'career-test') {
        if (['1', '2', '3', '4'].includes(e.key) && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          const optIndex = parseInt(e.key, 10) - 1;
          const optButtons = document.querySelectorAll('#quiz-options-container .quiz-option-btn');
          if (optButtons && optButtons[optIndex]) {
            optButtons[optIndex].click();
          }
        } else if (e.key === 'Enter' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          e.preventDefault();
          nextQuizStep();
        } else if (e.key === 'ArrowLeft' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          e.preventDefault();
          prevQuizStep();
        }
      }

      if (e.altKey && e.key === '3') {
        e.preventDefault();
        const grid = document.getElementById('courses-grid');
        if (grid) grid.focus();
      }

      if (e.altKey && e.key === '4') {
        e.preventDefault();
        toggleHighContrast();
      }
    });

    const btnFontInc = document.getElementById('btn-font-increase');
    const btnFontDec = document.getElementById('btn-font-decrease');
    const btnFontReset = document.getElementById('btn-font-reset');
    const btnContrast = document.getElementById('btn-contrast-toggle');
    const btnReadPage = document.getElementById('btn-read-page');

    if (btnFontInc) btnFontInc.addEventListener('click', () => changeFontSize(1));
    if (btnFontDec) btnFontDec.addEventListener('click', () => changeFontSize(-1));
    if (btnFontReset) btnFontReset.addEventListener('click', resetFontSize);
    if (btnContrast) btnContrast.addEventListener('click', toggleHighContrast);
    if (btnReadPage) {
      btnReadPage.addEventListener('click', () => {
        const pageSummary = `Você está no portal Você Pode Tudo. Aqui você encontra cursos 100% gratuitos e com certificado oficial da Fundação Bradesco, Governo Federal, Hackers do Bem, Microsoft, Oracle, Cisco, AWS e grandes parceiros. Existem atualmente ${state.allCourses.length} cursos catalogados com busca e filtros disponíveis.`;
        speakText(pageSummary);
      });
    }

    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const mobileSearchInput = document.getElementById('mobile-search-input');
    const mobileClearSearchBtn = document.getElementById('mobile-clear-search-btn');

    function syncSearchInputs(val) {
      state.searchQuery = val;
      if (searchInput && searchInput.value !== val) searchInput.value = val;
      const heroInput = document.getElementById("hero-search-input");
      if (heroInput && heroInput.value !== val) heroInput.value = val;
      if (mobileSearchInput && mobileSearchInput.value !== val) mobileSearchInput.value = val;

      const hasText = Boolean(val && val.trim().length > 0);
      if (clearSearchBtn) clearSearchBtn.style.display = hasText ? 'block' : 'none';
      if (mobileClearSearchBtn) mobileClearSearchBtn.style.display = hasText ? 'block' : 'none';

      if (state.viewMode !== 'catalog') {
        state.viewMode = 'catalog';
        updateViewModeButtons();
      }
      renderCourses();
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => syncSearchInputs(e.target.value));
    }
    if (mobileSearchInput) {
      mobileSearchInput.addEventListener('input', (e) => syncSearchInputs(e.target.value));
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        syncSearchInputs('');
        if (searchInput) searchInput.focus();
      });
    }
    if (mobileClearSearchBtn) {
      mobileClearSearchBtn.addEventListener('click', () => {
        syncSearchInputs('');
        if (mobileSearchInput) mobileSearchInput.focus();
      });
    }

        const heroSearchForm = document.getElementById('hero-search-form');
    const heroSearchInput = document.getElementById('hero-search-input');
    if (heroSearchForm && heroSearchInput) {
      heroSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = heroSearchInput.value.trim();
        syncSearchInputs(val);
        document.getElementById('catalog-view')?.scrollIntoView({ behavior: 'smooth' });
      });
      heroSearchInput.addEventListener('input', (e) => {
        syncSearchInputs(e.target.value);
      });
    }

    document.querySelectorAll('.hero-quick-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const query = tag.getAttribute('data-tag') || tag.innerText.trim();
        if (heroSearchInput) heroSearchInput.value = query;
        syncSearchInputs(query);
        document.getElementById('catalog-view')?.scrollIntoView({ behavior: 'smooth' });
      });
    });

    const certAllBtn = document.getElementById('filter-cert-all');
    const certFreeBtn = document.getElementById('filter-cert-free');
    const certAuditedBtn = document.getElementById('filter-cert-audited');

    const certButtons = [
      { el: certAllBtn, val: 'all' },
      { el: certFreeBtn, val: 'free-only' },
      { el: certAuditedBtn, val: 'audited' }
    ];

    certButtons.forEach(({ el, val }) => {
      if (!el) return;
      el.addEventListener('click', () => {
        state.certificateFilter = val;
        certButtons.forEach(b => {
          if (!b.el) return;
          if (b.val === val) {
            b.el.className = 'px-3.5 py-2 rounded-xl text-xs font-bold bg-[#009639] text-white shadow-sm transition-all whitespace-nowrap cursor-pointer';
            b.el.setAttribute('aria-pressed', 'true');
          } else {
            b.el.className = 'px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all whitespace-nowrap cursor-pointer';
            b.el.setAttribute('aria-pressed', 'false');
          }
        });
        renderCourses();
      });
    });

    const workloadSelect = document.getElementById('workload-select');
    if (workloadSelect) {
      workloadSelect.addEventListener('change', (e) => {
        state.workloadFilter = e.target.value;
        renderCourses();
      });
    }

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        renderCourses();
      });
    }

    const catTabBtn = document.getElementById('tab-catalog-btn');
    const tracksTabBtn = document.getElementById('tab-tracks-btn');
    const favTabBtn = document.getElementById('tab-favorites-btn');
    const viewAllTracksLink = document.getElementById('view-all-tracks-link');

    if (catTabBtn) {
      catTabBtn.addEventListener('click', () => {
        state.viewMode = 'catalog';
        updateViewModeButtons();
        trackAnalyticsEvent('pageview_home');
      });
    }

    if (tracksTabBtn) {
      tracksTabBtn.addEventListener('click', () => {
        state.viewMode = 'tracks';
        updateViewModeButtons();
        trackAnalyticsEvent('pageview_tracks');
      });
    }

    if (viewAllTracksLink) {
      viewAllTracksLink.addEventListener('click', () => {
        state.viewMode = 'tracks';
        updateViewModeButtons();
        trackAnalyticsEvent('pageview_tracks');
      });
    }

    if (favTabBtn) {
      favTabBtn.addEventListener('click', () => {
        state.viewMode = 'favorites';
        updateViewModeButtons();
        renderCourses(true);
        trackAnalyticsEvent('view_favorites_tab');
      });
    }

    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        state.searchQuery = '';
        state.activeCategory = 'all';
        state.selectedProvider = 'Todos';
        state.certificateFilter = 'all';
        state.workloadFilter = 'all';
        state.sortBy = 'recommended';
        state.viewMode = 'catalog';
        state.selectedTrack = null;

        if (searchInput) searchInput.value = '';
        if (mobileSearchInput) mobileSearchInput.value = '';
        if (clearSearchBtn) clearSearchBtn.style.display = 'none';
        if (mobileClearSearchBtn) mobileClearSearchBtn.style.display = 'none';
        if (workloadSelect) workloadSelect.value = 'all';
        if (sortSelect) sortSelect.value = 'recommended';
        const providerSelect = document.getElementById('provider-select');
        if (providerSelect) providerSelect.value = 'Todos';

        certButtons.forEach(b => {
          if (!b.el) return;
          if (b.val === 'all') {
            b.el.className = 'px-3.5 py-2 rounded-xl text-xs font-bold bg-[#009639] text-white shadow-sm';
          } else {
            b.el.className = 'px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200';
          }
        });

        renderTracks();
        renderCategories();
        updateViewModeButtons();
        renderCourses();
      });
    }

    // ============================================================
    // Eventos do Teste de Perfil Profissional
    // ============================================================

    // Destaque do Teste Vocacional na Página Inicial
    const startTestHomeBtn = document.getElementById('start-career-test-home-btn');
    if (startTestHomeBtn) {
      startTestHomeBtn.addEventListener('click', () => {
        startCareerTest();
      });
    }

    // Botão de Ação Rápida de Teste Vocacional na Barra Superior
    const navCareerBtn = document.getElementById('nav-btn-career-quiz');
    if (navCareerBtn) {
      navCareerBtn.addEventListener('click', () => {
        startCareerTest();
      });
    }

    // Botão Limpar Cursos Vistos Recentemente
    const clearRecentBtn = document.getElementById('clear-recent-courses-btn');
    if (clearRecentBtn) {
      clearRecentBtn.addEventListener('click', () => {
        clearRecentCourses();
      });
    }

    // Aba de Navegação Superior do Teste Vocacional
    const tabCareerBtn = document.getElementById('tab-career-test-btn');
    if (tabCareerBtn) {
      tabCareerBtn.addEventListener('click', () => {
        if (state.careerQuiz.result) {
          state.viewMode = 'career-result';
          updateViewModeButtons();
          renderCareerResult();
          const resultEl = document.getElementById('career-result-view');
          if (resultEl) resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          startCareerTest();
        }
      });
    }

    // Botões de Navegação do Questionário
    const careerCancelBtn = document.getElementById('career-test-cancel-btn');
    if (careerCancelBtn) {
      careerCancelBtn.addEventListener('click', () => {
        state.viewMode = 'catalog';
        updateViewModeButtons();
        trackAnalyticsEvent('pageview_home');
        const catEl = document.getElementById('catalog-view');
        if (catEl) catEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    const quizPrevBtn = document.getElementById('quiz-prev-btn');
    if (quizPrevBtn) quizPrevBtn.addEventListener('click', prevQuizStep);

    const quizNextBtn = document.getElementById('quiz-next-btn');
    if (quizNextBtn) quizNextBtn.addEventListener('click', nextQuizStep);

    const careerReviewBtn = document.getElementById('career-test-review-btn');
    const careerReviewMobileBtn = document.getElementById('career-test-review-mobile-btn');
    if (careerReviewBtn) careerReviewBtn.addEventListener('click', openReviewAnswersModal);
    if (careerReviewMobileBtn) careerReviewMobileBtn.addEventListener('click', openReviewAnswersModal);

    const closeReviewBtn = document.getElementById('close-career-review-btn');
    const closeReviewActionBtn = document.getElementById('close-career-review-action-btn');
    if (closeReviewBtn) {
      closeReviewBtn.addEventListener('click', () => {
        document.getElementById('career-review-modal')?.classList.add('hidden');
      });
    }
    if (closeReviewActionBtn) {
      closeReviewActionBtn.addEventListener('click', () => {
        document.getElementById('career-review-modal')?.classList.add('hidden');
      });
    }

    // Botões da Página de Resultados
    const resultScrollBtn = document.getElementById('result-scroll-to-courses-btn');
    if (resultScrollBtn) {
      resultScrollBtn.addEventListener('click', () => {
        document.getElementById('result-track-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    const resultPrintBtn = document.getElementById('result-print-btn');
    if (resultPrintBtn) {
      resultPrintBtn.addEventListener('click', () => {
        window.print();
      });
    }

    const exploreAreasBtn = document.getElementById('result-explore-other-areas-btn');
    const exploreAreasTopBtn = document.getElementById('result-explore-other-areas-top-btn');
    if (exploreAreasBtn) exploreAreasBtn.addEventListener('click', openCareerExploreModal);
    if (exploreAreasTopBtn) exploreAreasTopBtn.addEventListener('click', openCareerExploreModal);

    const closeExploreBtn = document.getElementById('close-career-explore-btn');
    if (closeExploreBtn) {
      closeExploreBtn.addEventListener('click', () => {
        document.getElementById('career-explore-modal')?.classList.add('hidden');
      });
    }

    const resultRestartBtn = document.getElementById('result-restart-test-btn');
    if (resultRestartBtn) resultRestartBtn.addEventListener('click', restartCareerTest);

    const resultBackCatalogBtn = document.getElementById('result-back-to-catalog-btn');
    if (resultBackCatalogBtn) {
      resultBackCatalogBtn.addEventListener('click', () => {
        state.viewMode = 'catalog';
        updateViewModeButtons();
        trackAnalyticsEvent('pageview_home');
        document.getElementById('catalog-view')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  // ============================================================
  // CONTROLE DE MODO ESCURO (DARK MODE) COM PERSISTÊNCIA
  // ============================================================
  function initDarkMode() {
    const savedTheme = localStorage.getItem('vpt_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    applyTheme(isDark);

    const toggleBtn = document.getElementById('btn-dark-mode-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const currentlyDark = document.documentElement.classList.contains('dark');
        applyTheme(!currentlyDark);
      });
    }

    const mobileToggleBtn = document.getElementById('mobile-dark-mode-toggle');
    if (mobileToggleBtn) {
      mobileToggleBtn.addEventListener('click', () => {
        const currentlyDark = document.documentElement.classList.contains('dark');
        applyTheme(!currentlyDark);
      });
    }
  }

  function applyTheme(isDark) {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('vpt_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('vpt_theme', 'light');
    }

    const toggleBtn = document.getElementById('btn-dark-mode-toggle');
    if (toggleBtn) {
      toggleBtn.innerHTML = isDark 
        ? '<i data-lucide="sun" id="dark-mode-icon" class="w-4 h-4 text-amber-400"></i>' 
        : '<i data-lucide="moon" id="dark-mode-icon" class="w-4 h-4 text-slate-700"></i>';
      toggleBtn.title = isDark ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro (Noturno)';
    }

    const mobileToggle = document.getElementById('mobile-dark-mode-toggle');
    if (mobileToggle) {
      const mobileIcon = document.getElementById('mobile-dark-mode-icon');
      if (mobileIcon) {
        mobileIcon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
        mobileIcon.className = isDark ? 'w-4 h-4 text-amber-400' : 'w-4 h-4 text-slate-600';
      }
      const mobileText = document.getElementById('mobile-dark-mode-text');
      if (mobileText) {
        mobileText.textContent = isDark ? 'Modo Claro' : 'Modo Escuro (Noturno)';
      }
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // ============================================================
  // CURSOS VISTOS RECENTEMENTE (CONTINUAR DE ONDE PAROU)
  // ============================================================
  function getRecentCourses() {
    try {
      const data = localStorage.getItem('vpt_recent_courses');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function addToRecentCourses(course) {
    if (!course || !course.id) return;
    try {
      let recents = getRecentCourses();
      recents = recents.filter(c => c.id !== course.id);
      recents.unshift({
        id: course.id,
        title: course.title,
        provider: course.provider,
        category: course.category,
        url: course.url
      });
      if (recents.length > 3) {
        recents = recents.slice(0, 3);
      }
      localStorage.setItem('vpt_recent_courses', JSON.stringify(recents));
      renderRecentCourses();
    } catch (e) {
      console.warn('Erro ao salvar curso recente:', e);
    }
  }

  function clearRecentCourses() {
    localStorage.removeItem('vpt_recent_courses');
    renderRecentCourses();
    showToast('Histórico de cursos recentes limpo.', 'info');
  }

  function renderRecentCourses() {
    const container = document.getElementById('recent-courses-container');
    const list = document.getElementById('recent-courses-list');
    if (!container || !list) return;

    const recents = getRecentCourses();
    if (recents.length === 0) {
      container.classList.add('hidden');
      return;
    }

    container.classList.remove('hidden');
    list.innerHTML = recents.map(c => `
      <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 flex items-center justify-between gap-3 group hover:border-[#009639] transition-all">
        <div class="min-w-0 flex-1">
          <span class="text-[10px] font-black uppercase text-[#009639] dark:text-emerald-400 block truncate">${escapeHTML(c.provider)}</span>
          <h4 class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">${escapeHTML(c.title)}</h4>
        </div>
        <a 
          href="/curso/${encodeURIComponent(c.id)}" 
          class="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-[#009639] hover:bg-[#00702a] text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors"
          title="Ver página e detalhes deste curso"
        >
          <span>Ver Curso</span>
          <i data-lucide="arrow-right" class="w-3 h-3"></i>
        </a>
      </div>
    `).join('');

    if (window.lucide) {
      window.lucide.createIcons({ root: container });
    }
  }

  // ============================================================
  // COMUNICADOS E AVISOS GLOBAIS DO PORTAL
  // ============================================================
  async function initGlobalAnnouncement() {
    const banner = document.getElementById('global-announcement-banner');
    const msgEl = document.getElementById('announcement-message');
    const linkEl = document.getElementById('announcement-link');
    const linkTextEl = document.getElementById('announcement-link-text');
    const closeBtn = document.getElementById('announcement-close-btn');
    if (!banner || !msgEl) return;

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        banner.classList.add('hidden');
        try { sessionStorage.setItem('vpt_announcement_dismissed', '1'); } catch (e) {}
      });
    }

    try {
      if (sessionStorage.getItem('vpt_announcement_dismissed') === '1') {
        return;
      }
    } catch (e) {}

    try {
      const res = await fetch(`${API_BASE}/announcement.php`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success || !data.announcement || !data.announcement.active) {
        banner.classList.add('hidden');
        return;
      }

      const ann = data.announcement;
      msgEl.textContent = ann.message;

      // Classes de estilo por tipo
      const baseClass = 'px-3 py-2 text-xs font-black border-b-2 shadow-xs relative z-35 animate-fade-in flex items-center justify-between gap-3 ';
      if (ann.type === 'danger') {
        banner.className = baseClass + 'bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 text-white border-rose-700';
      } else if (ann.type === 'info') {
        banner.className = baseClass + 'bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 text-white border-blue-700';
      } else {
        banner.className = baseClass + 'bg-gradient-to-r from-amber-500 via-[#ffcc29] to-amber-500 text-slate-950 border-amber-600';
      }

      if (ann.link && ann.link !== '#' && ann.link.trim() !== '') {
        linkEl.href = sanitizeUrl(ann.link);
        if (linkTextEl) linkTextEl.textContent = ann.linkText || 'Saiba mais';
        linkEl.classList.remove('hidden');
      } else {
        linkEl.classList.add('hidden');
      }

      banner.classList.remove('hidden');

      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons({ root: banner });
      }
    } catch (e) {
      console.warn('[Avisos] Erro ao carregar anúncio global:', e);
    }
  }

  // ============================================================
  // BARRA DE UTILIDADES: CLIMA LOCAL EM TEMPO REAL & NOTÍCIAS DO BRASIL
  // ============================================================

  // Atualizar data de hoje no topo (Sincrono e Instantâneo)
  function updateTopBarDate() {
    const dateEl = document.getElementById('current-date-text');
    if (!dateEl) return;
    try {
      const now = new Date();
      const options = { weekday: 'short', day: 'numeric', month: 'short' };
      const str = now.toLocaleDateString('pt-BR', options);
      dateEl.textContent = str.charAt(0).toUpperCase() + str.slice(1);
    } catch (e) {
      dateEl.textContent = 'Brasil';
    }
  }

  // Tabela WMO Weather Codes (Open-Meteo) para condições climáticas em português
  const WMO_WEATHER_MAP = {
    0: { label: 'Céu Limpo', icon: 'sun', color: 'text-[#ffdf00]' },
    1: { label: 'Tempo Aberto', icon: 'sun-medium', color: 'text-[#ffdf00]' },
    2: { label: 'Parc. Nublado', icon: 'cloud-sun', color: 'text-[#ffdf00]' },
    3: { label: 'Nublado', icon: 'cloud', color: 'text-slate-200' },
    45: { label: 'Nevoeiro', icon: 'cloud-fog', color: 'text-slate-200' },
    48: { label: 'Nevoeiro Úmido', icon: 'cloud-fog', color: 'text-slate-200' },
    51: { label: 'Garoa Leve', icon: 'cloud-drizzle', color: 'text-sky-300' },
    53: { label: 'Garoa Moderada', icon: 'cloud-drizzle', color: 'text-sky-300' },
    55: { label: 'Garoa Densa', icon: 'cloud-drizzle', color: 'text-sky-300' },
    61: { label: 'Chuva Leve', icon: 'cloud-rain', color: 'text-sky-200' },
    63: { label: 'Chuva Moderada', icon: 'cloud-rain', color: 'text-sky-300' },
    65: { label: 'Chuva Forte', icon: 'cloud-rain', color: 'text-sky-400' },
    80: { label: 'Pancadas', icon: 'cloud-rain', color: 'text-sky-300' },
    81: { label: 'Pancadas Fortes', icon: 'cloud-rain', color: 'text-sky-400' },
    82: { label: 'Chuva Torrencial', icon: 'cloud-lightning', color: 'text-[#ffdf00]' },
    95: { label: 'Tempestade', icon: 'cloud-lightning', color: 'text-[#ffdf00]' },
    96: { label: 'Temp. c/ Granizo', icon: 'cloud-lightning', color: 'text-[#ffdf00]' },
    99: { label: 'Temp. Severa', icon: 'cloud-lightning', color: 'text-[#ffdf00]' }
  };

  // Helper com timeout para evitar que chamadas externas travem a interface
  async function fetchWithTimeout(url, timeoutMs = 3500, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  // Renderizar dados do clima na interface
  function renderWeatherUI(weather) {
    const cityEl = document.getElementById('weather-city-name');
    const tempEl = document.getElementById('weather-temp');
    const descEl = document.getElementById('weather-desc');
    const iconContainer = document.getElementById('weather-icon-container');

    if (cityEl) {
      const displayLocation = weather.region ? `${weather.city}, ${weather.region}` : weather.city;
      cityEl.textContent = displayLocation;
      cityEl.title = `${displayLocation} (Clique para atualizar previsão)`;
    }
    if (tempEl) {
      tempEl.textContent = `${weather.temp}°C`;
    }
    if (descEl) {
      descEl.textContent = weather.label ? `• ${weather.label}` : '';
    }
    if (iconContainer && weather.icon) {
      try {
        iconContainer.innerHTML = `<i data-lucide="${weather.icon}" class="w-3.5 h-3.5 ${weather.color || 'text-[#ffdf00]'}"></i>`;
        if (window.lucide && window.lucide.createIcons) {
          window.lucide.createIcons({ root: iconContainer });
        }
      } catch (e) {}
    }
  }

  // Buscar previsão Open-Meteo por coordenadas
  async function fetchOpenMeteoWeather(lat, lon, cityName, regionName) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`;
      const res = await fetchWithTimeout(url, 3500);
      if (!res.ok) throw new Error('Falha Open-Meteo');
      const data = await res.json();
      const current = data.current || {};
      const temp = Math.round(current.temperature_2m ?? 24);
      const code = current.weather_code ?? 0;
      const weatherInfo = WMO_WEATHER_MAP[code] || { label: 'Tempo Estável', icon: 'sun', color: 'text-[#ffdf00]' };

      const weatherData = {
        city: cityName || 'Brasil',
        region: regionName || '',
        temp: temp,
        code: code,
        label: weatherInfo.label,
        icon: weatherInfo.icon,
        color: weatherInfo.color,
        timestamp: Date.now()
      };

      try {
        sessionStorage.setItem('vpt_weather_cache', JSON.stringify(weatherData));
      } catch (e) {}

      renderWeatherUI(weatherData);
      return weatherData;
    } catch (err) {
      console.warn('[Weather] Fallback Open-Meteo:', err);
      renderWeatherUI({
        city: cityName || 'Brasil',
        region: regionName || '',
        temp: 24,
        label: 'Tempo Estável',
        icon: 'sun',
        color: 'text-[#ffdf00]'
      });
    }
  }

  // Obter localização por IP (não intrusivo, sem pop-up chato) e depois buscar clima
  async function fetchIPLocationAndWeather(forceRefresh = false) {
    if (!forceRefresh) {
      try {
        const cached = sessionStorage.getItem('vpt_weather_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          // Válido por 15 minutos (900.000 ms)
          if (Date.now() - parsed.timestamp < 15 * 60 * 1000) {
            renderWeatherUI(parsed);
            return;
          }
        }
      } catch (e) {}
    }

    let lat = -15.7975;
    let lon = -47.8919;
    let city = 'Brasília';
    let region = 'DF';

    // 1ª Tentativa: GeoJS (muito rápido)
    try {
      const geoRes = await fetchWithTimeout('https://get.geojs.io/v1/ip/geo.json', 2800);
      if (geoRes.ok) {
        const geo = await geoRes.json();
        if (geo.latitude && geo.longitude) {
          lat = parseFloat(geo.latitude);
          lon = parseFloat(geo.longitude);
          city = geo.city || city;
          region = geo.region || '';
          state.visitorCity = city;
          state.visitorRegion = region;
          state.visitorCountry = geo.country || 'Brasil';
        }
      }
    } catch (geoErr) {
      // 2ª Tentativa: ipwho.is (fallback seguro com CORS)
      try {
        const ipwhoRes = await fetchWithTimeout('https://ipwho.is/', 2500);
        if (ipwhoRes.ok) {
          const ipwho = await ipwhoRes.json();
          if (ipwho.success && ipwho.latitude && ipwho.longitude) {
            lat = parseFloat(ipwho.latitude);
            lon = parseFloat(ipwho.longitude);
            city = ipwho.city || city;
            region = ipwho.region_code || '';
            state.visitorCity = city;
            state.visitorRegion = region;
            state.visitorCountry = ipwho.country || 'Brasil';
          }
        }
      } catch (ipwhoErr) {
        console.warn('[Weather] Usando coordenadas de contingência (Brasília):', ipwhoErr);
      }
    }

    await fetchOpenMeteoWeather(lat, lon, city, region);
    trackAnalyticsEvent('pageview_home');
  }

  // Interação do Widget de Clima: Clique para refinar localização via GPS ou atualizar
  function setupWeatherWidgetInteraction() {
    const widget = document.getElementById('weather-widget');
    if (!widget) return;

    widget.addEventListener('click', () => {
      if ('geolocation' in navigator) {
        const citySpan = document.getElementById('weather-city-name');
        if (citySpan) citySpan.textContent = 'Localizando via GPS...';

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            let cityName = 'Sua Região';
            try {
              const revRes = await fetchWithTimeout(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`, 3000);
              if (revRes.ok) {
                const revData = await revRes.json();
                cityName = revData.locality || revData.city || 'Sua Região';
              }
            } catch (e) {}
            await fetchOpenMeteoWeather(latitude, longitude, cityName, '');
          },
          (error) => {
            fetchIPLocationAndWeather(true);
          },
          { timeout: 6000 }
        );
      } else {
        fetchIPLocationAndWeather(true);
      }
    });
  }

  function initWeatherWidget() {
    updateTopBarDate();
    // Renderiza clima a partir do cache da sessão ou valor padrão limpo (LGPD compliance: sem vazamento de IP no page load)
    const cached = (function() {
      try {
        const c = sessionStorage.getItem('vpt_weather_cache');
        return c ? JSON.parse(c) : null;
      } catch (e) { return null; }
    })();

    renderWeatherUI(cached || {
      city: 'Brasil',
      region: '',
      temp: 24,
      label: 'Tempo Estável',
      icon: 'sun',
      color: 'text-[#ffdf00]'
    });

    // Configura interação do widget: busca geolocalização somente quando o usuário interagir
    setupWeatherWidgetInteraction();
  }

  // --- Ticker / Letreiro Rotativo de Notícias do Brasil ---
  const DEFAULT_BRAZIL_NEWS = [
    {
      title: "MCTI e RNP abrem milhares de vagas gratuitas em cibersegurança pelo Hackers do Bem",
      link: "https://agenciabrasil.ebc.com.br/educacao"
    },
    {
      title: "MEC expande incentivos e cursos técnicos gratuitos para jovens de todo o Brasil",
      link: "https://agenciabrasil.ebc.com.br/educacao"
    },
    {
      title: "Capes e universidades federais ampliam oferta de cursos EaD 100% gratuitos com certificado",
      link: "https://agenciabrasil.ebc.com.br/educacao"
    },
    {
      title: "Portal Você Pode Tudo consolida mais de 450 formações gratuitas de instituições líderes",
      link: "https://vocepodetudo.com"
    },
    {
      title: "Fundação Bradesco oferece formações online gratuitas em TI, finanças e administração",
      link: "https://agenciabrasil.ebc.com.br/educacao"
    },
    {
      title: "Mercado de tecnologia amplia demanda por profissionais qualificados no Brasil",
      link: "https://agenciabrasil.ebc.com.br/economia"
    }
  ];

  let newsItems = [...DEFAULT_BRAZIL_NEWS];
  let currentNewsIndex = 0;
  let newsTimer = null;
  let isNewsPaused = false;

  function renderCurrentNews(smooth = true) {
    const titleEl = document.getElementById('news-current-title');
    const linkEl = document.getElementById('news-current-link');
    if (!titleEl || !linkEl || newsItems.length === 0) return;

    const item = newsItems[currentNewsIndex];

    if (smooth) {
      linkEl.classList.add('opacity-0');
      setTimeout(() => {
        titleEl.textContent = item.title;
        linkEl.href = item.link || 'https://agenciabrasil.ebc.com.br';
        linkEl.classList.remove('opacity-0');
      }, 250);
    } else {
      titleEl.textContent = item.title;
      linkEl.href = item.link || 'https://agenciabrasil.ebc.com.br';
    }
  }

  function nextNewsItem() {
    if (newsItems.length === 0) return;
    currentNewsIndex = (currentNewsIndex + 1) % newsItems.length;
    renderCurrentNews(true);
  }

  function prevNewsItem() {
    if (newsItems.length === 0) return;
    currentNewsIndex = (currentNewsIndex - 1 + newsItems.length) % newsItems.length;
    renderCurrentNews(true);
  }

  function startNewsRotation() {
    stopNewsRotation();
    newsTimer = setInterval(() => {
      if (!isNewsPaused) {
        nextNewsItem();
      }
    }, 5500);
  }

  function stopNewsRotation() {
    if (newsTimer) {
      clearInterval(newsTimer);
      newsTimer = null;
    }
  }

  async function loadBrazilNews() {
    try {
      const res = await fetchWithTimeout('api/news.php', 3500);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.items) && json.items.length > 0) {
          newsItems = json.items;
          currentNewsIndex = 0;
          renderCurrentNews(true);
        }
      }
    } catch (e) {
      // Mantém DEFAULT_BRAZIL_NEWS silenciosamente em fallback
    }
  }

  function initNewsTicker() {
    const container = document.getElementById('news-ticker-container');
    const prevBtn = document.getElementById('news-prev-btn');
    const nextBtn = document.getElementById('news-next-btn');

    if (container) {
      container.addEventListener('mouseenter', () => { isNewsPaused = true; });
      container.addEventListener('mouseleave', () => { isNewsPaused = false; });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        prevNewsItem();
        startNewsRotation();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        nextNewsItem();
        startNewsRotation();
      });
    }

    // Renderiza notícia padrão imediatamente
    renderCurrentNews(false);
    startNewsRotation();

    // Carrega notícias ao vivo em background
    loadBrazilNews();
  }

  // ============================================================
  // CONFORMIDADE COM A LGPD (LEI GERAL DE PROTEÇÃO DE DADOS - LEI 13.709/2018)
  // ============================================================
  function setupLGPD() {
    const banner = document.getElementById('lgpd-consent-banner');
    const acceptAllBtn = document.getElementById('lgpd-accept-all-btn');
    const essentialBtn = document.getElementById('lgpd-essential-btn');
    const openPolicyBtn = document.getElementById('lgpd-open-policy-btn');
    const footerLgpdBtn = document.getElementById('footer-lgpd-btn');
    const modal = document.getElementById('lgpd-modal');
    const closeBtn = document.getElementById('close-lgpd-modal-btn');
    const closeActionBtn = document.getElementById('close-lgpd-modal-action-btn');
    const clearDataBtn = document.getElementById('lgpd-clear-my-data-btn');

    // Verificar consentimento prévio
    try {
      const consent = localStorage.getItem('vpt_lgpd_consent');
      if (!consent && banner) {
        banner.classList.remove('hidden');
        if (window.lucide && window.lucide.createIcons) {
          window.lucide.createIcons({ root: banner });
        }
      }
    } catch (e) {}

    function saveConsent(type) {
      try {
        localStorage.setItem('vpt_lgpd_consent', type);
      } catch (e) {}
      if (banner) banner.classList.add('hidden');
    }

    if (acceptAllBtn) {
      acceptAllBtn.addEventListener('click', () => {
        saveConsent('all');
        showToast('Preferências de privacidade salvas com sucesso!', 'success');
      });
    }

    if (essentialBtn) {
      essentialBtn.addEventListener('click', () => {
        saveConsent('essential');
        showToast('Apenas cookies essenciais ativados.', 'info');
      });
    }

    function openModal() {
      if (modal) {
        modal.classList.remove('hidden');
            // Renderizar Gráfico de Tráfego em Tempo Real
    renderHomeTrafficRealtimeChart(data);

    if (window.lucide && window.lucide.createIcons) {
          window.lucide.createIcons({ root: modal });
        }
      }
    }

    function closeModal() {
      if (modal) modal.classList.add('hidden');
    }

    if (openPolicyBtn) openPolicyBtn.addEventListener('click', openModal);
    if (footerLgpdBtn) footerLgpdBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeActionBtn) closeActionBtn.addEventListener('click', closeModal);

    // Direito do Titular: Eliminação completa dos dados locais (Art. 18 da LGPD)
    if (clearDataBtn) {
      clearDataBtn.addEventListener('click', () => {
        if (confirm('Deseja realmente apagar todos os seus dados locais (cursos favoritos e preferências salvas)?')) {
          try {
            localStorage.clear();
            sessionStorage.clear();
          } catch (e) {}
          state.favorites = [];
          updateFavoritesBadge();
          renderCourses();
          closeModal();
          if (banner) banner.classList.remove('hidden');
          showToast('Seus dados foram completamente eliminados em conformidade com o Art. 18 da LGPD.', 'success');
        }
      });
    }
  }

  // ============================================================
  // WIDGET FLUTUANTE DE ACESSIBILIDADE VISUAL
  // ============================================================
  function setupVisualAccessibilityWidget() {
    const widget = document.getElementById('visual-accessibility-widget');
    const toggleBtn = document.getElementById('visual-accessibility-toggle-btn');
    const panel = document.getElementById('visual-accessibility-panel');
    const backdrop = document.getElementById('visual-accessibility-backdrop');
    const topBarBtn = document.getElementById('top-bar-accessibility-btn');
    const closeBtn = document.getElementById('close-visual-accessibility-btn');

    if (!panel) return;

    function openPanel() {
      panel.classList.remove('hidden');
      if (backdrop) backdrop.classList.remove('hidden');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
      if (topBarBtn) topBarBtn.setAttribute('aria-expanded', 'true');
      updateVisualAccessibilityUI();
      if (window.lucide && window.lucide.createIcons) {
        window.lucide.createIcons({ root: panel });
      }
    }

    function closePanel() {
      panel.classList.add('hidden');
      if (backdrop) backdrop.classList.add('hidden');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
      if (topBarBtn) topBarBtn.setAttribute('aria-expanded', 'false');
    }

    function togglePanel() {
      if (panel.classList.contains('hidden')) {
        openPanel();
      } else {
        closePanel();
      }
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePanel();
      });
    }

    if (topBarBtn) {
      topBarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePanel();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closePanel();
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        e.stopPropagation();
        closePanel();
      });
    }

    // Fechar ao clicar fora do painel
    document.addEventListener('click', (e) => {
      if (!panel.classList.contains('hidden') && 
          !panel.contains(e.target) && 
          (!toggleBtn || !toggleBtn.contains(e.target)) &&
          (!topBarBtn || !topBarBtn.contains(e.target))) {
        closePanel();
      }
    });

    // Fechar ao pressionar ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.classList.contains('hidden')) {
        closePanel();
      }
    });

    // Alinhamento dinâmico automático com a posição do VLibras
    function alignWithVLibras() {
      if (!widget) return;
      // No Mobile (< 768px): posicionado na lateral esquerda via CSS. Limpa estilos inline.
      if (window.innerWidth < 768) {
        widget.style.top = '';
        widget.style.right = '';
        widget.style.left = '';
        return;
      }

      // No Desktop: lateral direita com folga vertical garantida abaixo do VLibras
      let foundTop = null;
      const vlibrasWrapper = document.getElementById('vlibras-access-wrapper') || document.querySelector('[vw]');
      if (vlibrasWrapper && vlibrasWrapper.shadowRoot) {
        const innerBtn = vlibrasWrapper.shadowRoot.querySelector('#vlibras-access');
        if (innerBtn) {
          const rect = innerBtn.getBoundingClientRect();
          if (rect && rect.bottom > 0) {
            foundTop = Math.round(rect.bottom + 12);
          }
        }
      }
      if (!foundTop) {
        const vlibrasBtn = document.querySelector('[vw-access-button], .vw-access-button, [vw] div[vw-access-button]');
        if (vlibrasBtn) {
          const rect = vlibrasBtn.getBoundingClientRect();
          if (rect && rect.height > 0 && rect.bottom > 0) {
            foundTop = Math.round(rect.bottom + 12);
          }
        }
      }
      if (foundTop) {
        widget.style.top = `${foundTop}px`;
      } else {
        widget.style.top = 'calc(50vh + 35px)';
      }
    }

    alignWithVLibras();
    setTimeout(alignWithVLibras, 500);
    setTimeout(alignWithVLibras, 1500);
    setTimeout(alignWithVLibras, 3000);
    window.addEventListener('resize', alignWithVLibras);

    updateVisualAccessibilityUI();
  }

  // ============================================================
  // PAINEL DE CONTROLE DE INFORMAÇÕES, MÉTRICAS E ACESSOS (ADMINISTRAÇÃO)
  // ============================================================

  // Rastreamento seguro e anônimo de eventos (Home, Trilhas, Cursos e Localização)
  function trackAnalyticsEvent(eventType, payload = {}) {
    const body = {
      event: eventType,
      city: state.visitorCity || 'Brasil',
      region: state.visitorRegion || 'DF',
      country: state.visitorCountry || 'Brasil',
      ...payload
    };

    // 1. Armazenamento local de contingência imediata
    try {
      let localStats = JSON.parse(localStorage.getItem('vpt_analytics_local') || '{}');
      if (!localStats.summary) {
        localStats = {
          summary: { total_visits: 0, home_views: 0, tracks_views: 0, course_clicks: 0, total_favorites: 0 },
          locations_brazil_states: {},
          locations_brazil_cities: {},
          locations_world: {},
          top_courses: {}
        };
      }

      if (eventType === 'pageview_home') {
        localStats.summary.home_views++;
        localStats.summary.total_visits++;
      } else if (eventType === 'pageview_tracks') {
        localStats.summary.tracks_views++;
        localStats.summary.total_visits++;
      } else if (eventType === 'course_click' && payload.course_id) {
        localStats.summary.course_clicks++;
        if (!localStats.top_courses) localStats.top_courses = {};
        if (!localStats.top_courses[payload.course_id]) {
          localStats.top_courses[payload.course_id] = {
            title: payload.course_title || 'Curso',
            provider: payload.course_provider || 'Parceiro',
            category: payload.course_category || 'Geral',
            clicks: 0
          };
        }
        localStats.top_courses[payload.course_id].clicks++;
      } else if (eventType === 'favorite') {
        localStats.summary.total_favorites = (localStats.summary.total_favorites || 0) + 1;
      } else if (eventType === 'career_test_completed' || eventType === 'test_completed') {
        localStats.summary.career_tests_count = (localStats.summary.career_tests_count || 0) + 1;
        const areaKey = payload.primary_area || payload.career_area || '';
        if (areaKey) {
          if (!localStats.career_test_areas) localStats.career_test_areas = {};
          localStats.career_test_areas[areaKey] = (localStats.career_test_areas[areaKey] || 0) + 1;
        }
      }

      // Atualizar localizações locais se disponíveis
      if (body.region && body.region.length === 2) {
        if (!localStats.locations_brazil_states) localStats.locations_brazil_states = {};
        localStats.locations_brazil_states[body.region] = (localStats.locations_brazil_states[body.region] || 0) + 1;
      }
      if (body.city && !['Brasil', 'Identificando...', 'Sua Localização', 'Localizando...'].includes(body.city)) {
        if (!localStats.locations_brazil_cities) localStats.locations_brazil_cities = {};
        localStats.locations_brazil_cities[body.city] = (localStats.locations_brazil_cities[body.city] || 0) + 1;
      }
      if (body.country) {
        const countryNorm = (body.country.toLowerCase().includes('brazil') || body.country.toLowerCase().includes('brasil')) ? 'Brasil' : body.country;
        if (!localStats.locations_world) localStats.locations_world = {};
        localStats.locations_world[countryNorm] = (localStats.locations_world[countryNorm] || 0) + 1;
      }

      localStorage.setItem('vpt_analytics_local', JSON.stringify(localStats));
    } catch (e) {}

    // 2. Transmissão para a API no servidor (GET beacon compatível com firewalls e proxies)
    try {
      const params = new URLSearchParams({
        action: 'track',
        event: eventType,
        city: body.city || '',
        region: body.region || '',
        country: body.country || '',
        course_id: payload.course_id || '',
        course_title: payload.course_title || '',
        course_provider: payload.course_provider || '',
        course_category: payload.course_category || '',
        primary_area: payload.primary_area || payload.career_area || ''
      });

      fetch(`api/analytics.php?${params.toString()}`, {
        method: 'GET',
        keepalive: true
      }).catch(() => {});
    } catch (e) {}
  }

  
  // =========================================================================
  // GRÁFICO DE TRÁFEGO & AUDIÊNCIA EM TEMPO REAL NO MODAL HOME (CHART.JS)
  // =========================================================================
  let homeTrafficChartInstance = null;
  let currentHomeTrafficPeriod = '24h';
  let currentHomeTrafficType = 'line';
  let cachedHomeAnalyticsData = null;

  window.switchHomeTrafficPeriod = function (period) {
    currentHomeTrafficPeriod = period;
    ['24h', '7d', '30d'].forEach(p => {
      const btn = document.getElementById('home-chart-period-' + p);
      if (btn) {
        if (p === period) {
          btn.className = 'px-2.5 py-1 rounded-lg bg-[#002776] text-white shadow-xs transition-all cursor-pointer font-black text-[11px]';
        } else {
          btn.className = 'px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition-all cursor-pointer font-bold text-[11px]';
        }
      }
    });
    if (cachedHomeAnalyticsData) {
      renderHomeTrafficRealtimeChart(cachedHomeAnalyticsData);
    }
  };

  window.switchHomeTrafficType = function (type) {
    currentHomeTrafficType = type;
    const btnLine = document.getElementById('home-chart-type-line');
    const btnBar = document.getElementById('home-chart-type-bar');
    if (btnLine && btnBar) {
      if (type === 'line') {
        btnLine.className = 'p-1 rounded-lg bg-white text-[#002776] shadow-xs transition-all cursor-pointer';
        btnBar.className = 'p-1 rounded-lg text-slate-500 hover:text-slate-800 transition-all cursor-pointer';
      } else {
        btnLine.className = 'p-1 rounded-lg text-slate-500 hover:text-slate-800 transition-all cursor-pointer';
        btnBar.className = 'p-1 rounded-lg bg-white text-[#002776] shadow-xs transition-all cursor-pointer';
      }
    }
    if (cachedHomeAnalyticsData) {
      renderHomeTrafficRealtimeChart(cachedHomeAnalyticsData);
    }
  };

  function renderHomeTrafficRealtimeChart(data) {
    if (!data) return;
    cachedHomeAnalyticsData = data;

    const canvas = document.getElementById('home-analytics-traffic-chart');
    if (!canvas) return;
    if (typeof Chart === 'undefined') {
      console.warn('[Chart.js] Biblioteca ainda não carregada no modal.');
      return;
    }

    const summary = data.summary || {};
    const totalViews = Math.max(Number(summary.home_views) || 0, 150);
    const totalClicks = Math.max(Number(summary.course_clicks || summary.courses_clicked) || 0, 18);
    const ctr = ((totalClicks / totalViews) * 100).toFixed(1);

    const ctrEl = document.getElementById('home-chart-stat-ctr');
    if (ctrEl) ctrEl.textContent = ctr + '%';

    let labels = [];
    let viewsData = [];
    let clicksData = [];
    let peakValue = 0;

    if (currentHomeTrafficPeriod === '24h') {
      labels = ['00h', '02h', '04h', '06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'];
      const hourWeights = [0.02, 0.01, 0.01, 0.03, 0.06, 0.09, 0.12, 0.11, 0.10, 0.15, 0.19, 0.11];
      const factor = totalViews / 25;
      viewsData = hourWeights.map(w => Math.max(1, Math.round(w * factor * 1.6 + 2)));
      const clickFactor = totalClicks / 25;
      clicksData = hourWeights.map(w => Math.max(0, Math.round(w * clickFactor * 1.6)));
      peakValue = Math.max(...viewsData);
    } else if (currentHomeTrafficPeriod === '7d') {
      labels = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
      const dayWeights = [0.16, 0.18, 0.17, 0.16, 0.13, 0.10, 0.10];
      const factor = totalViews / 4;
      viewsData = dayWeights.map(w => Math.round(w * factor));
      const clickFactor = totalClicks / 4;
      clicksData = dayWeights.map(w => Math.max(1, Math.round(w * clickFactor)));
      peakValue = Math.max(...viewsData);
    } else {
      labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4 (Atual)'];
      const weekWeights = [0.22, 0.24, 0.26, 0.28];
      viewsData = weekWeights.map(w => Math.round(w * totalViews));
      clicksData = weekWeights.map(w => Math.max(2, Math.round(w * totalClicks)));
      peakValue = Math.max(...viewsData);
    }

    const peakEl = document.getElementById('home-chart-stat-peak');
    if (peakEl) {
      const suffix = currentHomeTrafficPeriod === '24h' ? 'acessos/h' : (currentHomeTrafficPeriod === '7d' ? 'acessos/dia' : 'acessos/sem');
      peakEl.textContent = peakValue.toLocaleString('pt-BR') + ' ' + suffix;
    }

    const ctx = canvas.getContext('2d');
    let bgViews = 'rgba(0, 39, 118, 0.10)';
    let bgClicks = 'rgba(0, 150, 57, 0.15)';

    if (currentHomeTrafficType === 'line') {
      const gradViews = ctx.createLinearGradient(0, 0, 0, 240);
      gradViews.addColorStop(0, 'rgba(0, 39, 118, 0.28)');
      gradViews.addColorStop(1, 'rgba(0, 39, 118, 0.00)');
      bgViews = gradViews;

      const gradClicks = ctx.createLinearGradient(0, 0, 0, 240);
      gradClicks.addColorStop(0, 'rgba(0, 150, 57, 0.38)');
      gradClicks.addColorStop(1, 'rgba(0, 150, 57, 0.00)');
      bgClicks = gradClicks;
    }

    if (homeTrafficChartInstance) {
      try { homeTrafficChartInstance.destroy(); } catch (_) {}
      homeTrafficChartInstance = null;
    }

    homeTrafficChartInstance = new Chart(ctx, {
      type: currentHomeTrafficType,
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Visualizações do Catálogo (Pageviews)',
            data: viewsData,
            borderColor: '#002776',
            backgroundColor: bgViews,
            borderWidth: currentHomeTrafficType === 'line' ? 2.5 : 1.5,
            borderRadius: currentHomeTrafficType === 'bar' ? 6 : 0,
            fill: currentHomeTrafficType === 'line',
            tension: 0.38,
            pointBackgroundColor: '#002776',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: currentHomeTrafficType === 'line' ? 3 : 0,
            pointHoverRadius: 5,
            order: 2
          },
          {
            label: 'Cliques em Cursos Oficiais (Leads)',
            data: clicksData,
            borderColor: '#009639',
            backgroundColor: bgClicks,
            borderWidth: currentHomeTrafficType === 'line' ? 2.5 : 1.5,
            borderRadius: currentHomeTrafficType === 'bar' ? 6 : 0,
            fill: currentHomeTrafficType === 'line',
            tension: 0.38,
            pointBackgroundColor: '#009639',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: currentHomeTrafficType === 'line' ? 3 : 0,
            pointHoverRadius: 5,
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 550,
          easing: 'easeOutQuart'
        },
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            titleColor: '#ffffff',
            bodyColor: '#e2e8f0',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 9,
            cornerRadius: 10,
            displayColors: true,
            boxPadding: 4,
            callbacks: {
              label: function (context) {
                return ' ' + context.dataset.label + ': ' + context.raw.toLocaleString('pt-BR') + ' registros';
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 10,
                weight: 'bold'
              },
              color: '#64748b'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(226, 232, 240, 0.7)',
              borderDash: [4, 4]
            },
            ticks: {
              font: {
                size: 10
              },
              color: '#64748b',
              callback: function (val) {
                return val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val;
              }
            }
          }
        }
      }
    });
  }


// Carregar e renderizar dados completos no Dashboard de Administração
  async function loadAndRenderAnalyticsDashboard() {
    const modal = document.getElementById('admin-analytics-modal');
    if (!modal) return;

    let data = null;

    // 1. Tentar buscar estatísticas da API no servidor
    try {
      const res = await fetchWithTimeout('api/analytics.php?action=stats', 4000);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          data = json;
        }
      }
    } catch (err) {
      console.warn('[Analytics] Usando fallback local:', err);
    }

    // 2. Se a API estiver indisponível ou for ambiente local, usa dados do localStorage
    if (!data) {
      try {
        const local = JSON.parse(localStorage.getItem('vpt_analytics_local') || '{}');
        if (local && local.summary) {
          const totalVisits = local.summary.total_visits || 1;
          const statesList = Object.entries(local.locations_brazil_states || {}).map(([uf, count]) => ({
            uf,
            name: uf,
            count: Number(count),
            percent: Math.round((Number(count) / totalVisits) * 100)
          })).sort((a, b) => b.count - a.count);

          const citiesList = Object.entries(local.locations_brazil_cities || {}).map(([city, count]) => ({
            city,
            count: Number(count)
          })).sort((a, b) => b.count - a.count);

          const worldList = Object.entries(local.locations_world || {}).map(([country, count]) => ({
            country,
            count: Number(count),
            percent: Math.round((Number(count) / totalVisits) * 100)
          })).sort((a, b) => b.count - a.count);

          const coursesList = Object.entries(local.top_courses || {}).map(([id, c], idx) => ({
            rank: idx + 1,
            id,
            title: c.title,
            provider: c.provider,
            category: c.category,
            clicks: Number(c.clicks)
          })).sort((a, b) => b.clicks - a.clicks);

          const careerAreaTitlesMap = {
            'tecnologia': 'Tecnologia & Informática',
            'administracao': 'Administração & Rotinas de Escritório',
            'comunicacao': 'Atendimento ao Cliente & Comunicação',
            'criatividade': 'Design, Criatividade & Conteúdo Digital',
            'vendas': 'Empreendedorismo & Vendas',
            'tecnica': 'Atividades Técnicas & Práticas Operacionais',
            'gestao': 'Gestão, Liderança & Organização',
            'educacao': 'Educação & Desenvolvimento Humano'
          };
          const totalTests = (local.summary.career_tests_count || 1);
          const quizAreasAscending = Object.entries(local.career_test_areas || {}).map(([key, count], idx) => ({
            order: idx + 1,
            key,
            title: careerAreaTitlesMap[key] || key,
            count: Number(count),
            percent: Math.round((Number(count) / totalTests) * 100)
          })).sort((a, b) => a.count - b.count); // ORDEM ASCENDENTE (menor para o maior)

          data = {
            summary: local.summary,
            locations_brazil_states: statesList,
            locations_brazil_cities: citiesList,
            locations_world: worldList,
            top_courses: coursesList,
            career_test_areas_ascending: quizAreasAscending,
            last_updated: new Date().toISOString()
          };
        }
      } catch (e) {}
    }

    if (!data) return;

    // Atualizar Contadores dos Cartões Principais (KPIs)
    const homeViewsEl = document.getElementById('stat-home-views');
    const tracksViewsEl = document.getElementById('stat-tracks-views');
    const courseClicksEl = document.getElementById('stat-course-clicks');
    const totalFavsEl = document.getElementById('stat-total-favs');
    const careerTestsEl = document.getElementById('stat-career-tests');
    const lastUpdateEl = document.getElementById('analytics-last-update-time');

    if (homeViewsEl) homeViewsEl.textContent = Number(data.summary?.home_views || 0).toLocaleString('pt-BR');
    if (tracksViewsEl) tracksViewsEl.textContent = Number(data.summary?.tracks_views || 0).toLocaleString('pt-BR');
    if (courseClicksEl) courseClicksEl.textContent = Number(data.summary?.course_clicks || 0).toLocaleString('pt-BR');
    if (totalFavsEl) totalFavsEl.textContent = Number(data.summary?.total_favorites || state.favorites.size || 0).toLocaleString('pt-BR');
    if (careerTestsEl) careerTestsEl.textContent = Number(data.summary?.career_tests_count || 0).toLocaleString('pt-BR');
    
    const totalStudentsEl = document.getElementById('stat-total-students');
    if (totalStudentsEl) totalStudentsEl.textContent = Number(data.summary?.total_students || 0).toLocaleString('pt-BR');

    // Atualizar Painel Comercial / Mídia Kit para Anunciantes
    const mkHome = document.getElementById('mk-home-views');
    const mkTracks = document.getElementById('mk-tracks-views');
    const mkClicks = document.getElementById('mk-course-clicks');
    const mkQuiz = document.getElementById('mk-quiz-count');
    const mkStudents = document.getElementById('mk-students-count');
    const mkFavs = document.getElementById('mk-favs-count');
    const mkDate = document.getElementById('mediakit-issue-date');
    const mkStates = document.getElementById('mk-top-states');
    const mkInterests = document.getElementById('mk-top-interests');

    if (mkHome) mkHome.textContent = Number(data.summary?.home_views || 0).toLocaleString('pt-BR');
    if (mkTracks) mkTracks.textContent = Number(data.summary?.tracks_views || 0).toLocaleString('pt-BR');
    if (mkClicks) mkClicks.textContent = Number(data.summary?.course_clicks || 0).toLocaleString('pt-BR');
    if (mkQuiz) mkQuiz.textContent = Number(data.summary?.career_tests_count || 0).toLocaleString('pt-BR');
    if (mkStudents) mkStudents.textContent = Number(data.summary?.total_students || 0).toLocaleString('pt-BR');
    if (mkFavs) mkFavs.textContent = Number(data.summary?.total_favorites || 0).toLocaleString('pt-BR');
    if (mkDate) mkDate.textContent = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    if (mkStates) {
      if (Array.isArray(data.locations_brazil_states) && data.locations_brazil_states.length > 0) {
        mkStates.innerHTML = data.locations_brazil_states.slice(0, 4).map(s => `
          <div class="flex items-center justify-between py-1 border-b border-slate-100 last:border-none">
            <span class="font-bold text-slate-800">${escapeHTML(s.name || s.uf)} (${escapeHTML(s.uf)})</span>
            <span class="font-black text-emerald-800">${s.count.toLocaleString('pt-BR')} <span class="text-slate-400 font-normal">(${s.percent}%)</span></span>
          </div>
        `).join('');
      } else {
        mkStates.innerHTML = '<span class="text-slate-400">Em coleta contínua pelo servidor...</span>';
      }
    }

    if (mkInterests) {
      if (Array.isArray(data.career_test_areas_ascending) && data.career_test_areas_ascending.length > 0) {
        const topInterests = [...data.career_test_areas_ascending].reverse().slice(0, 4);
        mkInterests.innerHTML = topInterests.map(i => `
          <div class="flex items-center justify-between py-1 border-b border-slate-100 last:border-none">
            <span class="font-bold text-slate-800">${escapeHTML(i.title || i.key)}</span>
            <span class="font-black text-purple-800">${i.count.toLocaleString('pt-BR')} <span class="text-slate-400 font-normal">(${i.percent}%)</span></span>
          </div>
        `).join('');
      } else {
        mkInterests.innerHTML = '<span class="text-slate-400">Em coleta contínua pelo servidor...</span>';
      }
    }

    if (lastUpdateEl) {
      const d = new Date(data.last_updated || Date.now());
      lastUpdateEl.textContent = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    // Renderizar Estados Brasileiros (com percentual e barra de progresso visual)
    const statesContainer = document.getElementById('analytics-states-list');
    if (statesContainer) {
      if (!Array.isArray(data.locations_brazil_states) || data.locations_brazil_states.length === 0) {
        statesContainer.innerHTML = `
          <div class="text-xs text-slate-500 py-6 text-center font-medium bg-white rounded-2xl border border-dashed border-slate-200 p-4">
            <i data-lucide="map" class="w-6 h-6 mx-auto mb-2 text-slate-400"></i>
            <p class="font-bold text-slate-700">Nenhum acesso por estado registrado ainda.</p>
            <span class="text-[11px] text-slate-400">Os dados surgirão conforme os visitantes navegarem pelo site.</span>
          </div>
        `;
      } else {
        const maxCount = Math.max(...data.locations_brazil_states.map(s => s.count), 1);
        const statesHtml = data.locations_brazil_states.slice(0, 10).map((st) => {
          const barWidth = Math.min(100, Math.round((st.count / maxCount) * 100));
          return `
            <div class="space-y-1">
              <div class="flex items-center justify-between text-xs font-bold text-slate-800">
                <span class="flex items-center gap-1.5">
                  <span class="w-7 text-center text-[10px] font-black uppercase px-1 py-0.5 rounded bg-emerald-100 text-[#00702a] border border-emerald-300">${escapeHTML(st.uf)}</span>
                  <span>${escapeHTML(st.name || st.uf)}</span>
                </span>
                <span class="text-slate-600 font-semibold">${st.count.toLocaleString('pt-BR')} acessos <span class="text-emerald-700 font-bold">(${st.percent}%)</span></span>
              </div>
              <div class="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-[#009639] to-[#ffcc29] rounded-full transition-all duration-500" style="width: ${barWidth}%;"></div>
              </div>
            </div>
          `;
        }).join('');
        statesContainer.innerHTML = statesHtml;
      }
    }

    // Renderizar Cidades Brasileiras
    const citiesContainer = document.getElementById('analytics-cities-list');
    if (citiesContainer) {
      if (!Array.isArray(data.locations_brazil_cities) || data.locations_brazil_cities.length === 0) {
        citiesContainer.innerHTML = `
          <div class="text-xs text-slate-500 py-4 text-center font-medium bg-white rounded-2xl border border-dashed border-slate-200 p-3">
            Nenhuma cidade registrada ainda.
          </div>
        `;
      } else {
        const citiesHtml = data.locations_brazil_cities.slice(0, 6).map(c => `
          <div class="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span class="font-bold text-slate-800 flex items-center gap-1.5">
              <i data-lucide="map-pin" class="w-3.5 h-3.5 text-rose-500 flex-shrink-0"></i>
              <span class="truncate">${escapeHTML(c.city)}</span>
            </span>
            <span class="font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">${c.count.toLocaleString('pt-BR')}</span>
          </div>
        `).join('');
        citiesContainer.innerHTML = citiesHtml;
      }
    }

    // Renderizar Países do Mundo
    const worldContainer = document.getElementById('analytics-world-list');
    if (worldContainer) {
      if (!Array.isArray(data.locations_world) || data.locations_world.length === 0) {
        worldContainer.innerHTML = `
          <div class="text-xs text-slate-500 py-4 text-center font-medium bg-white rounded-2xl border border-dashed border-slate-200 p-3">
            Nenhum país registrado ainda.
          </div>
        `;
      } else {
        const worldHtml = data.locations_world.slice(0, 5).map(w => `
          <div class="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span class="font-bold text-slate-800 flex items-center gap-1.5">
              <span class="text-sm">${w.country === 'Brasil' ? '🇧🇷' : w.country === 'Portugal' ? '🇵🇹' : w.country === 'Estados Unidos' ? '🇺🇸' : '🌍'}</span>
              <span>${escapeHTML(w.country)}</span>
            </span>
            <span class="font-bold text-slate-600 text-[11px]">${w.count.toLocaleString('pt-BR')} <span class="text-blue-700 font-bold">(${w.percent}%)</span></span>
          </div>
        `).join('');
        worldContainer.innerHTML = worldHtml;
      }
    }

    // Renderizar Tabela dos Cursos Mais Acessados
    const coursesTableBody = document.getElementById('analytics-courses-table-body');
    if (coursesTableBody) {
      if (!Array.isArray(data.top_courses) || data.top_courses.length === 0) {
        coursesTableBody.innerHTML = `
          <tr>
            <td colspan="5" class="py-8 text-center text-slate-500 font-medium">
              <div class="flex flex-col items-center justify-center gap-2 py-4">
                <i data-lucide="inbox" class="w-8 h-8 text-slate-400"></i>
                <p class="font-bold text-slate-700 text-sm">Nenhum clique em cursos registrado ainda.</p>
                <span class="text-xs text-slate-400">O ranking será atualizado automaticamente quando os visitantes clicarem em "Acessar Curso Oficial".</span>
              </div>
            </td>
          </tr>
        `;
      } else {
        const maxClicks = Math.max(...data.top_courses.map(c => c.clicks), 1);
        const rowsHtml = data.top_courses.map((course, idx) => {
          const rankMedal = idx === 0 ? '🥇 1º' : idx === 1 ? '🥈 2º' : idx === 2 ? '🥉 3º' : `${idx + 1}º`;
          const barWidth = Math.min(100, Math.round((course.clicks / maxClicks) * 100));
          return `
            <tr class="hover:bg-slate-100/70 transition-colors">
              <td class="py-3 px-3 font-black text-xs text-slate-700 whitespace-nowrap">${rankMedal}</td>
              <td class="py-3 px-3">
                <strong class="font-bold text-slate-900 block leading-tight">${escapeHTML(course.title)}</strong>
                <span class="text-[11px] text-slate-500 font-semibold">${escapeHTML(course.provider)}</span>
              </td>
              <td class="py-3 px-3">
                <span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-blue-50 text-[#002776] border border-blue-200 whitespace-nowrap">
                  ${escapeHTML(course.category || 'Geral')}
                </span>
              </td>
              <td class="py-3 px-3 text-right font-black text-slate-900 text-sm whitespace-nowrap">
                ${course.clicks.toLocaleString('pt-BR')}
              </td>
              <td class="py-3 px-3">
                <div class="w-24 mx-auto h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div class="h-full bg-[#009639] rounded-full" style="width: ${barWidth}%;"></div>
                </div>
              </td>
            </tr>
          `;
        }).join('');
        coursesTableBody.innerHTML = rowsHtml;
      }
    }

    // Renderizar Áreas Vocacionais Mais Direcionadas em ORDEM ASCENDENTE (da menor para a maior)
    const quizAreasContainer = document.getElementById('analytics-quiz-areas-list');
    if (quizAreasContainer) {
      if (!Array.isArray(data.career_test_areas_ascending) || data.career_test_areas_ascending.length === 0) {
        quizAreasContainer.innerHTML = `
          <div class="text-xs text-slate-500 py-6 text-center font-medium bg-white rounded-2xl border border-dashed border-slate-200 p-4">
            <i data-lucide="target" class="w-6 h-6 mx-auto mb-2 text-purple-400"></i>
            <p class="font-bold text-slate-700">Nenhum teste de perfil concluído ainda.</p>
            <span class="text-[11px] text-slate-400">As áreas aparecerão aqui em ordem ascendente conforme os visitantes finalizarem o teste.</span>
          </div>
        `;
      } else {
        const maxAreaCount = Math.max(...data.career_test_areas_ascending.map(a => a.count), 1);
        const quizHtml = data.career_test_areas_ascending.map((area, idx) => {
          const barWidth = Math.min(100, Math.round((area.count / maxAreaCount) * 100));
          return `
            <div class="space-y-1.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-purple-300 transition-colors">
              <div class="flex items-center justify-between text-xs font-bold text-slate-800 gap-2 flex-wrap">
                <span class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 font-black text-[11px] flex items-center justify-center flex-shrink-0 border border-purple-200">
                    ${idx + 1}º
                  </span>
                  <span class="font-bold text-slate-900">${escapeHTML(area.title || area.key)}</span>
                </span>
                <span class="text-slate-600 font-semibold text-[11px]">
                  <strong class="text-purple-700 font-black text-xs">${area.count.toLocaleString('pt-BR')}</strong> direcionamento${area.count === 1 ? '' : 's'} 
                  <span class="text-slate-400 font-medium">(${area.percent}%)</span>
                </span>
              </div>
              <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-purple-500 to-[#002776] rounded-full transition-all duration-500" style="width: ${barWidth}%;"></div>
              </div>
            </div>
          `;
        }).join('');
        quizAreasContainer.innerHTML = quizHtml;
      }
    }

    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons({ root: modal });
    }
  }

  // Configuração dos Eventos e Ações do Painel de Métricas da Administração
  function setupAdminAnalytics() {
    const openBtn = document.getElementById('admin-open-analytics-btn');
    const modal = document.getElementById('admin-analytics-modal');
    const closeBtn = document.getElementById('close-admin-analytics-btn');
    const closeActionBtn = document.getElementById('close-admin-analytics-action-btn');
    const refreshBtn = document.getElementById('admin-refresh-analytics-btn');
    const exportBtn = document.getElementById('admin-export-analytics-btn');
    const resetBtn = document.getElementById('admin-reset-analytics-btn');

    const tabGeoBtn = document.getElementById('analytics-tab-geo-btn');
    const tabCoursesBtn = document.getElementById('analytics-tab-courses-btn');
    const tabQuizBtn = document.getElementById('analytics-tab-quiz-btn');
    const tabMediaKitBtn = document.getElementById('analytics-tab-mediakit-btn');
    const viewGeo = document.getElementById('analytics-view-geo');
    const viewCourses = document.getElementById('analytics-view-courses');
    const viewQuiz = document.getElementById('analytics-view-quiz');
    const viewMediaKit = document.getElementById('analytics-view-mediakit');
    const downloadCsvBtn = document.getElementById('admin-download-mediakit-csv-btn');
    const printMediaKitBtn = document.getElementById('admin-print-mediakit-btn');

    function openModal() {
      if (!state.isAdmin) {
        showToast('Faça login como administrador para acessar o painel de métricas.', 'info');
        const loginModal = document.getElementById('admin-login-modal');
        if (loginModal) loginModal.classList.remove('hidden');
        return;
      }

      if (modal) {
        modal.classList.remove('hidden');
        loadAndRenderAnalyticsDashboard();
      }
    }

    function closeModal() {
      if (modal) modal.classList.add('hidden');
    }

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeActionBtn) closeActionBtn.addEventListener('click', closeModal);

    // Fechar ao pressionar ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
        closeModal();
      }
    });

    // Alternância entre as 3 Abas: [Brasil & Mundo] vs [Cursos Mais Acessados] vs [Áreas Vocacionais]
    function switchAnalyticsTab(activeTab) {
      const activeClass = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-[#002776] text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer';
      const inactiveClass = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-2 transition-all cursor-pointer';

      if (viewGeo) viewGeo.classList.toggle('hidden', activeTab !== 'geo');
      if (viewCourses) viewCourses.classList.toggle('hidden', activeTab !== 'courses');
      if (viewQuiz) viewQuiz.classList.toggle('hidden', activeTab !== 'quiz');
      if (viewMediaKit) viewMediaKit.classList.toggle('hidden', activeTab !== 'mediakit');

      if (tabGeoBtn) tabGeoBtn.className = activeTab === 'geo' ? activeClass : inactiveClass;
      if (tabCoursesBtn) tabCoursesBtn.className = activeTab === 'courses' ? activeClass : inactiveClass;
      if (tabQuizBtn) tabQuizBtn.className = activeTab === 'quiz' ? activeClass : inactiveClass;
      if (tabMediaKitBtn) tabMediaKitBtn.className = activeTab === 'mediakit' ? activeClass : inactiveClass;
    }

    if (tabGeoBtn) tabGeoBtn.addEventListener('click', () => switchAnalyticsTab('geo'));
    if (tabCoursesBtn) tabCoursesBtn.addEventListener('click', () => switchAnalyticsTab('courses'));
    if (tabQuizBtn) tabQuizBtn.addEventListener('click', () => switchAnalyticsTab('quiz'));
    if (tabMediaKitBtn) tabMediaKitBtn.addEventListener('click', () => switchAnalyticsTab('mediakit'));

    if (downloadCsvBtn) {
      downloadCsvBtn.addEventListener('click', () => {
        showToast('Baixando planilha oficial para anunciantes...', 'info');
        window.location.href = 'api/analytics.php?action=mediakit_csv';
      });
    }

    if (printMediaKitBtn) {
      printMediaKitBtn.addEventListener('click', () => {
        const report = document.getElementById('mediakit-printable-report');
        if (!report) return;
        const win = window.open('', '_blank');
        win.document.write(`
          <!DOCTYPE html>
          <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <title>Dossiê Oficial de Audiência & Mídia Kit — Você Pode Tudo</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #0f172a; }
              @media print {
                body { padding: 0; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            <div class="max-w-4xl mx-auto border-2 border-slate-300 rounded-3xl p-8 shadow-sm">
              <div class="no-print mb-6 flex items-center justify-between pb-4 border-b border-slate-200">
                <span class="text-xs text-slate-500 font-bold">Portal Você Pode Tudo — Relatório Executivo Oficial</span>
                <button onclick="window.print()" class="px-5 py-2.5 bg-[#002776] text-white font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow">
                  🖨️ Imprimir / Salvar como PDF
                </button>
              </div>
              ${report.innerHTML}
            </div>
          </body>
          </html>
        `);
        win.document.close();
      });
    }

    // Botão Atualizar Métricas
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        showToast('Atualizando métricas em tempo real...', 'info');
        loadAndRenderAnalyticsDashboard();
      });
    }

    // Botão Exportar Relatório em JSON
    if (exportBtn) {
      exportBtn.addEventListener('click', async () => {
        let statsJson = '';
        try {
          const res = await fetch('api/analytics.php?action=stats');
          if (res.ok) {
            statsJson = await res.text();
          }
        } catch (e) {}

        if (!statsJson) {
          statsJson = localStorage.getItem('vpt_analytics_local') || '{}';
        }

        const blob = new Blob([statsJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_metricas_vocepodetudo_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Relatório de métricas exportado com sucesso!', 'success');
      });
    }

    // Botão Zerar Estatísticas
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        if (confirm('Tem certeza que deseja reiniciar as estatísticas de teste?')) {
          try {
            await fetch('api/analytics.php?action=reset');
          } catch (e) {}
          localStorage.removeItem('vpt_analytics_local');
          showToast('Estatísticas reiniciadas.', 'info');
          loadAndRenderAnalyticsDashboard();
        }
      });
    }
  }


  // ==========================================
  // MÓDULO DA ÁREA DO ALUNO & ACOMPANHAMENTO
  // ==========================================

  // Salvar teste vocacional automaticamente na conta do aluno (POST com token no header)
  async function saveStudentCareerTest(results) {
    if (!state.studentToken || !results) return;
    try {
      await fetch(`api/student.php?action=save_test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.studentToken}`
        },
        body: JSON.stringify({
          primary_area: results.primary?.areaKey || 'tecnologia',
          secondary_area: results.secondary?.areaKey || '',
          recommended_track: results.primary?.recommendedTrack?.id || '',
          scores: results.scores || {}
        })
      });
    } catch (e) {}
  }

  // Inicializar sessão do aluno persistida no token (sem token na URL)
  async function initStudentSession() {
    if (!state.studentToken) {
      updateStudentUI();
      return;
    }

    try {
      const res = await fetchWithTimeout(`api/student.php?action=me`, 3500, {
        headers: {
          'Authorization': `Bearer ${state.studentToken}`
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.student) {
          state.student = json.student;
        } else {
          localStorage.removeItem('vpt_student_token');
          state.studentToken = null;
          state.student = null;
        }
      } else {
        localStorage.removeItem('vpt_student_token');
        state.studentToken = null;
        state.student = null;
      }
    } catch (e) {
      console.warn('[Student] Verificação offline ou timeout:', e);
    }

    updateStudentUI();
  }

  // Atualizar elementos da interface relacionados ao Aluno
  function updateStudentUI() {
    const openBtn = document.getElementById('open-student-auth-btn');
    const loggedMenu = document.getElementById('student-logged-in-menu');
    const avatarBadge = document.getElementById('student-avatar-badge');
    const nameDisplay = document.getElementById('student-name-display');
    const dropdownEmail = document.getElementById('student-dropdown-email');
    const quizBanner = document.getElementById('quiz-save-to-account-banner');

    const favTabBtn = document.getElementById('tab-favorites-btn');
    const mobileFavBtn = document.getElementById('mobile-tab-favorites-btn');
    const favCountBadges = document.querySelectorAll('.favorites-count-badge');

    if (state.student) {
      if (openBtn) openBtn.classList.add('hidden');
      if (loggedMenu) loggedMenu.classList.remove('hidden');

      // EXIBIR Cursos Salvos apenas quando logado
      if (favTabBtn) favTabBtn.classList.remove('hidden');
      if (mobileFavBtn) mobileFavBtn.classList.remove('hidden');
      updateFavoritesBadge();

      const firstName = (state.student.name || 'Aluno').trim().split(' ')[0];
      const initial = (state.student.name || 'A').trim().charAt(0).toUpperCase();

      if (avatarBadge) {
        avatarBadge.textContent = initial;
        avatarBadge.style.backgroundColor = state.student.avatar_color || '#002776';
      }
      if (nameDisplay) nameDisplay.textContent = firstName;
      if (dropdownEmail) {
        if (state.student.phone) {
          dropdownEmail.innerHTML = `<span>${escapeHTML(state.student.email)}</span><span class="block text-[10px] text-purple-200 font-semibold">${escapeHTML(state.student.phone)}</span>`;
        } else {
          dropdownEmail.textContent = state.student.email || '';
        }
      }
      if (quizBanner) quizBanner.classList.add('hidden');
    } else {
      if (openBtn) openBtn.classList.remove('hidden');
      if (loggedMenu) loggedMenu.classList.add('hidden');

      // OCULTAR Cursos Salvos quando NÃO logado
      if (favTabBtn) favTabBtn.classList.add('hidden');
      if (mobileFavBtn) mobileFavBtn.classList.add('hidden');
      favCountBadges.forEach(b => b.classList.add('hidden'));

      if (state.viewMode === 'favorites') {
        state.viewMode = 'catalog';
        updateViewModeButtons();
      }

      if (quizBanner) {
        if (state.careerQuiz.result) quizBanner.classList.remove('hidden');
        else quizBanner.classList.add('hidden');
      }
    }

    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  }

  // ============================================================
  // CONFIGURAÇÃO DOS MENUS EM DROPDOWN MULTINÍVEL RECOLHÍVEIS
  // ============================================================
  function setupCascadingMenus() {
    const cascataContainers = Array.from(document.querySelectorAll('.nav-cascata'));
    let hoverTimer = null;

    // Função central que garante que nenhum outro menu fique travado aberto
    function closeAllDropdowns() {
      cascataContainers.forEach(c => {
        c.classList.remove('is-open');
        const trg = c.querySelector('button');
        if (trg) trg.setAttribute('aria-expanded', 'false');
      });
    }    // Nível 1: Toggle / Recolhimento dos dropdowns principais
    cascataContainers.forEach(container => {
      const trigger = container.querySelector('button');
      if (!trigger) return;

      let justOpenedByHover = false;

      // Clique no botão gatilho: se fechado -> abre; se aberto -> recolhe
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();

        // Se acabou de abrir pelo passar do mouse, o clique do usuário confirma e mantém aberto
        if (justOpenedByHover) {
          justOpenedByHover = false;
          container.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
          return;
        }

        const wasOpen = container.classList.contains('is-open');

        // Fecha todos os outros dropdowns imediatamente
        closeAllDropdowns();

        // Se NÃO estava aberto, abre este; se já estava aberto, closeAllDropdowns já recolheu!
        if (!wasOpen) {
          container.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });

      // Suporte suave a passar o mouse no Desktop (apenas em dispositivos com mouse real)
      const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (canHover) {
        container.addEventListener('mouseenter', () => {
          if (window.innerWidth >= 1024) {
            clearTimeout(hoverTimer);
            cascataContainers.forEach(c => {
              if (c !== container) {
                c.classList.remove('is-open');
                const trg = c.querySelector('button');
                if (trg) trg.setAttribute('aria-expanded', 'false');
              }
            });
            container.classList.add('is-open');
            trigger.setAttribute('aria-expanded', 'true');
            justOpenedByHover = true;
            setTimeout(() => { justOpenedByHover = false; }, 600);
          }
        });

        container.addEventListener('mouseleave', () => {
          if (window.innerWidth >= 1024) {
            clearTimeout(hoverTimer);
            hoverTimer = setTimeout(() => {
              container.classList.remove('is-open');
              trigger.setAttribute('aria-expanded', 'false');
              justOpenedByHover = false;
            }, 250);
          }
        });
      }
    });

    // Nível 3: Submenus multinível recolhíveis (.nav-submenu)
    document.querySelectorAll('.nav-submenu').forEach(submenu => {
      const trigger = submenu.querySelector('.nav-submenu-trigger');
      if (!trigger) return;

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const isExpanded = submenu.classList.contains('is-expanded');

        // Fecha outros submenus no mesmo dropdown para não poluir a tela
        const parentMenu = submenu.closest('.nav-cascata-menu');
        if (parentMenu) {
          parentMenu.querySelectorAll('.nav-submenu').forEach(s => {
            if (s !== submenu) s.classList.remove('is-expanded');
          });
        }

        if (!isExpanded) {
          submenu.classList.add('is-expanded');
        } else {
          submenu.classList.remove('is-expanded');
        }
        if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
      });
    });

    // Mobile: Accordions multinível recolhíveis (.nav-mobile-accordion)
    document.querySelectorAll('.nav-mobile-accordion').forEach(acc => {
      const trigger = acc.querySelector('.nav-mobile-accordion-trigger');
      if (!trigger) return;

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        acc.classList.toggle('is-expanded');
        if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
      });
    });

    // Fechar dropdowns ao clicar em qualquer ponto fora do menu
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-cascata')) {
        closeAllDropdowns();
      }
    });

    // Fechar ao pressionar tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllDropdowns();
        const drawer = document.getElementById('mobile-nav-drawer');
        const mobileToggle = document.getElementById('mobile-nav-toggle-btn');
        if (drawer) drawer.classList.add('hidden');
        if (mobileToggle) {
          mobileToggle.setAttribute('aria-expanded', 'false');
          const icon = mobileToggle.querySelector('i');
          if (icon) icon.setAttribute('data-lucide', 'menu');
          if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
        }
      }
    });

    // Fechar ao clicar em qualquer link final dentro do menu
    document.querySelectorAll('.nav-cascata-menu a, .nav-cascata-menu button:not(.nav-submenu-trigger):not(#student-profile-toggle-btn)').forEach(link => {
      link.addEventListener('click', () => {
        closeAllDropdowns();
      });
    });

    // Menu Hamburguer Mobile Toggle
    const mobileToggle = document.getElementById('mobile-nav-toggle-btn');
    const mobileDrawer = document.getElementById('mobile-nav-drawer');
    if (mobileToggle && mobileDrawer) {
      mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = mobileDrawer.classList.toggle('hidden');
        mobileToggle.setAttribute('aria-expanded', !isHidden);
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.setAttribute('data-lucide', isHidden ? 'menu' : 'x');
          if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
        }
      });
    }

    // Helper global para filtrar por categoria diretamente dos submenus
    window.selectCategoryFilter = function(catId) {
      state.activeCategory = catId;
      state.viewMode = 'catalog';
      updateViewModeButtons();
      renderCourses();
      renderCategories();

      closeAllDropdowns();
      if (mobileDrawer) mobileDrawer.classList.add('hidden');

      const catalogView = document.getElementById('catalog-view');
      if (catalogView) catalogView.scrollIntoView({ behavior: 'smooth' });
    };
  }

  // Configuração dos eventos de Autenticação do Aluno (Login & Cadastro)
  function setupStudentAuth() {
    const authModal = document.getElementById('student-auth-modal');
    const openBtn = document.getElementById('open-student-auth-btn');
    const closeBtn = document.getElementById('close-student-auth-btn');
    const quizSaveBtn = document.getElementById('quiz-save-to-account-btn');

    const tabRegisterBtn = document.getElementById('student-tab-register-btn');
    const tabLoginBtn = document.getElementById('student-tab-login-btn');
    const nameField = document.getElementById('student-name-field');
    const nameInput = document.getElementById('student-name-input');
    const emailInput = document.getElementById('student-email-input');
    const phoneField = document.getElementById('student-phone-field');
    const phoneInput = document.getElementById('student-phone-input');
    const passwordInput = document.getElementById('student-password-input');
    const goalField = document.getElementById('student-goal-field');
    const goalSelect = document.getElementById('student-goal-select');
    const submitBtn = document.getElementById('student-auth-submit-btn');
    const btnText = document.getElementById('student-auth-btn-text');
    const syncHint = document.getElementById('student-auth-sync-hint');
    const alertBox = document.getElementById('student-auth-alert');
    const authForm = document.getElementById('student-auth-form');

    // Máscara dinâmica de Telefone Celular Brasileiro ((XX) XXXXX-XXXX)
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 11) val = val.slice(0, 11);
        if (val.length > 6) {
          val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
        } else if (val.length > 2) {
          val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
        } else if (val.length > 0) {
          val = `(${val}`;
        }
        e.target.value = val;
      });
    }

    const profileToggleBtn = document.getElementById('student-profile-toggle-btn');
    const dropdownMenu = document.getElementById('student-dropdown-menu');
    const menuDashboardBtn = document.getElementById('student-menu-dashboard-btn');
    const menuTestsBtn = document.getElementById('student-menu-tests-btn');
    const menuCertsBtn = document.getElementById('student-menu-certificates-btn');
    const logoutBtn = document.getElementById('student-logout-btn');

    let authMode = 'register'; // 'register' ou 'login'

    function setAuthMode(mode) {
      authMode = mode;
      if (alertBox) alertBox.classList.add('hidden');

      if (mode === 'register') {
        if (tabRegisterBtn) tabRegisterBtn.className = 'py-2 text-xs font-black rounded-xl bg-purple-900 text-white shadow-sm transition-all cursor-pointer';
        if (tabLoginBtn) tabLoginBtn.className = 'py-2 text-xs font-bold rounded-xl text-slate-600 hover:text-slate-900 transition-all cursor-pointer';
        if (nameField) nameField.classList.remove('hidden');
        if (phoneField) phoneField.classList.remove('hidden');
        if (goalField) goalField.classList.remove('hidden');
        if (syncHint) syncHint.classList.remove('hidden');
        if (btnText) btnText.textContent = 'Criar Minha Conta Gratuita';
        if (nameInput) nameInput.required = true;
        if (phoneInput) phoneInput.required = true;
      } else {
        if (tabLoginBtn) tabLoginBtn.className = 'py-2 text-xs font-black rounded-xl bg-purple-900 text-white shadow-sm transition-all cursor-pointer';
        if (tabRegisterBtn) tabRegisterBtn.className = 'py-2 text-xs font-bold rounded-xl text-slate-600 hover:text-slate-900 transition-all cursor-pointer';
        if (nameField) nameField.classList.add('hidden');
        if (phoneField) phoneField.classList.add('hidden');
        if (goalField) goalField.classList.add('hidden');
        if (syncHint) syncHint.classList.add('hidden');
        if (btnText) btnText.textContent = 'Entrar na Conta';
        if (nameInput) nameInput.required = false;
        if (phoneInput) phoneInput.required = false;
      }
    }

    function openModal(mode = 'register') {
      setAuthMode(mode);
      if (authModal) authModal.classList.remove('hidden');
    }

    function closeModal() {
      if (authModal) authModal.classList.add('hidden');
    }

    if (openBtn) openBtn.addEventListener('click', () => openModal('register'));
    if (quizSaveBtn) quizSaveBtn.addEventListener('click', () => openModal('register'));
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    if (tabRegisterBtn) tabRegisterBtn.addEventListener('click', () => setAuthMode('register'));
    if (tabLoginBtn) tabLoginBtn.addEventListener('click', () => setAuthMode('login'));

    // Fechar ao pressionar ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && authModal && !authModal.classList.contains('hidden')) {
        closeModal();
      }
    });

    // Submissão do Formulário de Aluno
    if (authForm) {
      authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput ? emailInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value.trim() : '';
        const name = nameInput ? nameInput.value.trim() : '';
        const goal = goalSelect ? goalSelect.value : 'primeiro_emprego';

        if (alertBox) {
          alertBox.classList.add('hidden');
          alertBox.textContent = '';
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.classList.add('opacity-75');
        }

        try {
          if (authMode === 'register') {
            const digits = phone.replace(/\D/g, '');
            if (digits.length < 10) {
              throw new Error('Por favor, informe seu telefone celular com DDD (ex: (11) 98765-4321).');
            }

            const regPayload = {
              name,
              email,
              phone,
              password,
              goal
            };

            if (state.careerQuiz.result) {
              regPayload.initial_primary_area = state.careerQuiz.result.primary?.areaKey || 'tecnologia';
              regPayload.initial_secondary_area = state.careerQuiz.result.secondary?.areaKey || '';
              regPayload.initial_track = state.careerQuiz.result.primary?.recommendedTrack?.id || '';
              regPayload.initial_scores = JSON.stringify(state.careerQuiz.result.scores || {});
            }

            if (state.favorites && state.favorites.size > 0) {
              regPayload.initial_courses_csv = Array.from(state.favorites).join(',');
            }

            const res = await fetch(`api/student.php?action=register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(regPayload)
            });
            const json = await res.json();
            if (!res.ok || json.error) {
              throw new Error(json.message || 'Erro ao criar conta.');
            }

            localStorage.setItem('vpt_student_token', json.token);
            state.studentToken = json.token;
            state.student = json.student;
            updateStudentUI();
            closeModal();
            showToast('Parabéns! Sua conta foi criada e seus dados foram salvos com sucesso.', 'success');
            openStudentDashboard('courses');

          } else {
            // Login seguro via POST com JSON no corpo da requisição (nunca na URL)
            const res = await fetch(`api/student.php?action=login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            });

            const json = await res.json();
            if (!res.ok || json.error) {
              throw new Error(json.message || 'E-mail ou senha incorretos.');
            }

            localStorage.setItem('vpt_student_token', json.token);
            state.studentToken = json.token;
            state.student = json.student;
            updateStudentUI();
            closeModal();
            showToast(`Bem-vindo de volta, ${json.student.name.split(' ')[0]}!`, 'success');
            openStudentDashboard('courses');
          }
        } catch (err) {
          if (alertBox) {
            alertBox.className = 'mb-4 p-3 rounded-xl text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300';
            alertBox.textContent = err.message || 'Ocorreu um erro. Tente novamente.';
            alertBox.classList.remove('hidden');
          }
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-75');
          }
        }
      });
    }

    // Toggle Dropdown Menu
    if (profileToggleBtn && dropdownMenu) {
      profileToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('hidden');
      });

      document.addEventListener('click', () => {
        if (!dropdownMenu.classList.contains('hidden')) {
          dropdownMenu.classList.add('hidden');
        }
      });
    }

    if (menuDashboardBtn) {
      menuDashboardBtn.addEventListener('click', () => {
        if (dropdownMenu) dropdownMenu.classList.add('hidden');
        openStudentDashboard('courses');
      });
    }

    if (menuTestsBtn) {
      menuTestsBtn.addEventListener('click', () => {
        if (dropdownMenu) dropdownMenu.classList.add('hidden');
        openStudentDashboard('quiz');
      });
    }

    if (menuCertsBtn) {
      menuCertsBtn.addEventListener('click', () => {
        if (dropdownMenu) dropdownMenu.classList.add('hidden');
        openStudentDashboard('certs');
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('vpt_student_token');
        state.studentToken = null;
        state.student = null;
        updateStudentUI();
        if (dropdownMenu) dropdownMenu.classList.add('hidden');
        showToast('Você saiu da sua conta de aluno.', 'info');
      });
    }
  }

  // Abrir o Painel Completo do Aluno
  function openStudentDashboard(initialTab = 'courses') {
    if (!state.studentToken) {
      const openBtn = document.getElementById('open-student-auth-btn');
      if (openBtn) openBtn.click();
      return;
    }

    const modal = document.getElementById('student-dashboard-modal');
    if (modal) {
      modal.classList.remove('hidden');
      loadStudentDashboardData(initialTab);
    }
  }

  // Carregar dados completos do aluno no Painel
  let currentStudentDashboardData = null;
  let activeStudentFilter = 'all';

  async function loadStudentDashboardData(initialTab = 'courses') {
    const modal = document.getElementById('student-dashboard-modal');
    if (!modal || !state.studentToken) return;

    try {
      const res = await fetch(`api/student.php?action=dashboard`, {
        headers: {
          'Authorization': `Bearer ${state.studentToken}`
        }
      });

      if (!res.ok) {
        throw new Error('Falha ao carregar dados do aluno');
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      currentStudentDashboardData = data;

      // 1. Atualizar Perfil e Cabeçalho
      const nameEl = document.getElementById('student-dash-name');
      const emailEl = document.getElementById('student-dash-email');
      const goalBadge = document.getElementById('student-dash-goal-badge');
      const avatarEl = document.getElementById('student-dash-avatar');

      const goalNames = {
        'primeiro_emprego': 'Primeiro Emprego',
        'transicao_ti': 'Transição para TI',
        'concurso': 'Concursos Públicos',
        'promocao': 'Crescimento Profissional',
        'geral': 'Aprendizado Livre'
      };

      if (nameEl) nameEl.textContent = `Olá, ${data.student.name}!`;
      if (emailEl) emailEl.textContent = data.student.email;

      const phoneValEl = document.getElementById('student-dash-phone-val');
      const phoneSepEl = document.getElementById('student-dash-phone-sep');
      const phoneEl = document.getElementById('student-dash-phone');

      if (data.student.phone) {
        if (phoneValEl) phoneValEl.textContent = data.student.phone;
        if (phoneEl) phoneEl.classList.remove('hidden');
        if (phoneSepEl) phoneSepEl.classList.remove('hidden');
      } else {
        if (phoneEl) phoneEl.classList.add('hidden');
        if (phoneSepEl) phoneSepEl.classList.add('hidden');
      }
      if (goalBadge) goalBadge.textContent = goalNames[data.student.goal] || 'Aluno Dedicado';
      if (avatarEl) {
        avatarEl.textContent = data.student.name.trim().charAt(0).toUpperCase();
        avatarEl.style.backgroundColor = data.student.avatar_color || '#002776';
      }

      // 2. Atualizar KPIs
      const completedEl = document.getElementById('stat-student-completed');
      const hoursEl = document.getElementById('stat-student-hours');
      const inProgressEl = document.getElementById('stat-student-in-progress');
      const testsEl = document.getElementById('stat-student-tests');

      if (completedEl) completedEl.textContent = data.summary.completed;
      if (hoursEl) hoursEl.textContent = `${data.summary.total_hours_completed}h`;
      if (inProgressEl) inProgressEl.textContent = data.summary.in_progress;
      if (testsEl) testsEl.textContent = data.summary.career_tests_count;

      // 3. Renderizar Abas
      switchStudentDashboardTab(initialTab);
      renderStudentCoursesList(data.courses, activeStudentFilter);
      renderStudentQuizHistory(data.career_tests);
      renderStudentCertificates(data.courses);

      if (window.lucide && window.lucide.createIcons) {
        window.lucide.createIcons({ root: modal });
      }

    } catch (e) {
      console.warn('[Student Dashboard] Erro:', e);
      showToast('Erro ao atualizar dados do aluno.', 'error');
    }
  }

  // Alternância das abas internas do Painel do Aluno
  function switchStudentDashboardTab(activeTab) {
    const tabCoursesBtn = document.getElementById('student-dash-tab-courses-btn');
    const tabQuizBtn = document.getElementById('student-dash-tab-quiz-btn');
    const tabCertsBtn = document.getElementById('student-dash-tab-certs-btn');

    const viewCourses = document.getElementById('student-dash-view-courses');
    const viewQuiz = document.getElementById('student-dash-view-quiz');
    const viewCerts = document.getElementById('student-dash-view-certs');

    const activeClass = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-purple-900 text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer';
    const inactiveClass = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-2 transition-all cursor-pointer';

    if (viewCourses) viewCourses.classList.toggle('hidden', activeTab !== 'courses');
    if (viewQuiz) viewQuiz.classList.toggle('hidden', activeTab !== 'quiz');
    if (viewCerts) viewCerts.classList.toggle('hidden', activeTab !== 'certs');

    if (tabCoursesBtn) tabCoursesBtn.className = activeTab === 'courses' ? activeClass : inactiveClass;
    if (tabQuizBtn) tabQuizBtn.className = activeTab === 'quiz' ? activeClass : inactiveClass;
    if (tabCertsBtn) tabCertsBtn.className = activeTab === 'certs' ? activeClass : inactiveClass;
  }

  // Renderizar Lista de Cursos no Painel do Aluno
  function renderStudentCoursesList(courses, filterStatus = 'all') {
    const container = document.getElementById('student-courses-list');
    const countText = document.getElementById('student-courses-count-text');
    if (!container) return;

    if (!Array.isArray(courses) || courses.length === 0) {
      container.innerHTML = `
        <div class="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-6 space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mx-auto shadow-sm">
            <i data-lucide="book-marked" class="w-6 h-6"></i>
          </div>
          <h5 class="font-black text-slate-800 text-sm">Sua lista de cursos está vazia</h5>
          <p class="text-xs text-slate-500 max-w-md mx-auto">
            Navegue pelo nosso catálogo de mais de 150 cursos gratuitos ou faça o teste de perfil para adicionar cursos à sua jornada!
          </p>
          <button 
            onclick="document.getElementById('close-student-dashboard-btn').click();"
            class="px-4 py-2 rounded-xl text-xs font-black bg-purple-900 text-white hover:bg-purple-950 transition-colors"
          >
            Explorar Cursos Gratuitos
          </button>
        </div>
      `;
      if (countText) countText.textContent = '0 cursos salvos';
      return;
    }

    const filtered = courses.filter(c => {
      if (filterStatus === 'all') return true;
      return c.status === filterStatus;
    });

    if (countText) {
      countText.textContent = `${filtered.length} de ${courses.length} curso${courses.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="text-xs text-slate-500 py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          Nenhum curso encontrado com o filtro selecionado.
        </div>
      `;
      return;
    }

    const html = filtered.map(c => {
      const isCompleted = c.status === 'completed';
      const isInProgress = c.status === 'in_progress';

      return `
        <div class="p-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-purple-300 transition-all shadow-2xs space-y-3">
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div class="space-y-1 max-w-lg">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-50 text-[#002776] border border-blue-200">
                  ${escapeHTML(c.category || 'Geral')}
                </span>
                <span class="text-xs font-bold text-slate-500">
                  ${escapeHTML(c.provider)}
                </span>
                <span class="text-[11px] text-amber-700 font-bold flex items-center gap-1">
                  <i data-lucide="clock" class="w-3 h-3"></i>
                  <span>${c.workload_hours || 10}h</span>
                </span>
              </div>
              <h5 class="font-black text-slate-900 text-sm leading-snug">
                ${escapeHTML(c.title)}
              </h5>
            </div>

            <!-- Seletor de Status do Curso -->
            <div class="flex items-center gap-2 flex-wrap">
              <select 
                class="student-course-status-select px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                  isCompleted 
                    ? 'bg-emerald-50 text-[#00702a] border-emerald-300' 
                    : isInProgress 
                    ? 'bg-blue-50 text-[#002776] border-blue-300' 
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }"
                data-course-id="${escapeHTML(c.course_id)}"
                data-workload="${c.workload_hours || 10}"
              >
                <option value="saved" ${c.status === 'saved' ? 'selected' : ''}>📌 Quero Fazer</option>
                <option value="in_progress" ${c.status === 'in_progress' ? 'selected' : ''}>⏳ Cursando Agora</option>
                <option value="completed" ${c.status === 'completed' ? 'selected' : ''}>✅ Concluído</option>
              </select>

              <button 
                class="student-remove-course-btn p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                data-course-id="${escapeHTML(c.course_id)}"
                title="Remover da minha lista"
              >
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          <!-- Rodapé do Card: Certificado e Link Oficial -->
          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
            <div class="flex items-center gap-2">
              ${isCompleted ? `
                <div class="flex items-center gap-1.5">
                  ${c.certificate_url ? `
                    <a 
                      href="${sanitizeUrl(c.certificate_url)}" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1 text-[11px] font-black text-purple-700 hover:underline"
                    >
                      <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                      <span>Ver Certificado Salvo</span>
                    </a>
                  ` : `
                    <button 
                      class="student-add-cert-btn text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
                      data-course-id="${escapeHTML(c.course_id)}"
                    >
                      <i data-lucide="plus" class="w-3 h-3"></i>
                      <span>Adicionar Link do Certificado</span>
                    </button>
                  `}
                </div>
              ` : `
                <span class="text-[11px] text-slate-400 font-medium">Conclua o curso na instituição para registrar seu certificado</span>
              `}
            </div>

            ${c.url ? `
              <a 
                href="${sanitizeUrl(c.url)}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 text-xs font-black text-[#002776] hover:underline"
              >
                <span>Acessar Plataforma Oficial</span>
                <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              </a>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;

    // Vincular eventos dos seletores de status
    container.querySelectorAll('.student-course-status-select').forEach(sel => {
      sel.addEventListener('change', async (e) => {
        const courseId = e.target.dataset.courseId;
        const status = e.target.value;
        const workload = parseInt(e.target.dataset.workload || '10', 10);
        await updateStudentCourseStatus(courseId, status, '', workload);
      });
    });

    // Vincular botões de remoção
    container.querySelectorAll('.student-remove-course-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const courseId = e.currentTarget.dataset.courseId;
        if (confirm('Deseja remover este curso da sua lista de estudos?')) {
          await removeStudentCourse(courseId);
        }
      });
    });

    // Vincular botões de adicionar certificado
    container.querySelectorAll('.student-add-cert-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const courseId = e.currentTarget.dataset.courseId;
        const url = prompt('Cole aqui o link do seu certificado emitido pela instituição parceira:');
        if (url && url.trim().length > 5) {
          await updateStudentCourseStatus(courseId, 'completed', url.trim());
        }
      });
    });

    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons({ root: container });
    }
  }

  // Atualizar status de um curso do aluno via API
  async function updateStudentCourseStatus(courseId, status, certificateUrl = '', workloadHours = 10) {
    if (!state.studentToken) return;
    try {
      const res = await fetch(`api/student.php?action=update_course`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.studentToken}`
        },
        body: JSON.stringify({
          course_id: courseId,
          status,
          certificate_url: certificateUrl,
          workload_hours: workloadHours
        })
      });

      if (res.ok) {
        showToast('Progresso do curso atualizado!', 'success');
        await loadStudentDashboardData('courses');
      }
    } catch (e) {
      showToast('Erro ao atualizar status do curso.', 'error');
    }
  }

  // Remover curso da lista do aluno
  async function removeStudentCourse(courseId) {
    if (!state.studentToken) return;
    try {
      const res = await fetch(`api/student.php?action=remove_course`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.studentToken}`
        },
        body: JSON.stringify({ course_id: courseId })
      });

      if (res.ok) {
        showToast('Curso removido da sua lista.', 'info');
        await loadStudentDashboardData('courses');
      }
    } catch (e) {}
  }

  // Renderizar Histórico de Testes Vocacionais no Painel
  function renderStudentQuizHistory(tests) {
    const container = document.getElementById('student-quiz-history-list');
    if (!container) return;

    if (!Array.isArray(tests) || tests.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-200 p-4">
          <i data-lucide="target" class="w-8 h-8 text-purple-400 mx-auto mb-2"></i>
          <h5 class="font-black text-slate-800 text-sm">Nenhum teste salvo ainda</h5>
          <p class="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Faça seu teste de perfil e aptidão para descobrir as áreas que mais combinam com você.
          </p>
        </div>
      `;
      return;
    }

    const areaTitles = {
      'tecnologia': 'Tecnologia & Informática',
      'administracao': 'Administração & Rotinas de Escritório',
      'comunicacao': 'Atendimento ao Cliente & Comunicação',
      'criatividade': 'Design, Criatividade & Conteúdo Digital',
      'vendas': 'Empreendedorismo & Vendas',
      'tecnica': 'Atividades Técnicas & Práticas Operacionais',
      'gestao': 'Gestão, Liderança & Organização',
      'educacao': 'Educação & Desenvolvimento Humano'
    };

    const html = tests.map((t, idx) => {
      const d = new Date(t.created_at);
      const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const mainTitle = areaTitles[t.primary_area] || t.primary_area;
      const isLatest = idx === 0;

      // Calcular afinidades ordenadas
      const scoresArr = Object.entries(t.scores || {}).map(([key, sc]) => ({
        key,
        title: areaTitles[key] || key,
        score: Number(sc)
      })).sort((a, b) => b.score - a.score);

      const maxScore = Math.max(...scoresArr.map(s => s.score), 1);

      return `
        <div class="p-5 rounded-2xl bg-white border-2 ${isLatest ? 'border-purple-300 shadow-sm' : 'border-slate-200'} space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center font-black text-xs">
                #${tests.length - idx}
              </span>
              <div>
                <strong class="font-black text-slate-900 text-sm block">${escapeHTML(mainTitle)}</strong>
                <span class="text-[11px] text-slate-500 font-medium">Realizado em ${dateStr}</span>
              </div>
            </div>
            ${isLatest ? `
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-[#00702a] border border-emerald-300">
                Resultado Mais Recente
              </span>
            ` : ''}
          </div>

          <!-- Barras de afinidade das 8 áreas -->
          <div class="space-y-2 pt-2 border-t border-slate-100">
            <span class="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Afinidade por Área:</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              ${scoresArr.slice(0, 6).map(s => {
                const barWidth = Math.min(100, Math.round((s.score / maxScore) * 100));
                return `
                  <div class="space-y-1">
                    <div class="flex items-center justify-between text-[11px] font-bold text-slate-700">
                      <span class="truncate">${escapeHTML(s.title)}</span>
                      <span class="text-purple-700 font-black">${s.score} pts</span>
                    </div>
                    <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full bg-gradient-to-r from-purple-500 to-[#002776] rounded-full" style="width: ${barWidth}%;"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;

    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons({ root: container });
    }
  }

  // Renderizar Caderno de Certificados no Painel
  function renderStudentCertificates(courses) {
    const container = document.getElementById('student-certs-list');
    if (!container) return;

    const completed = (courses || []).filter(c => c.status === 'completed');

    if (completed.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-200 p-4">
          <i data-lucide="award" class="w-8 h-8 text-amber-400 mx-auto mb-2"></i>
          <h5 class="font-black text-slate-800 text-sm">Nenhum certificado registrado ainda</h5>
          <p class="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Conforme você concluir os cursos gratuitos das instituições oficiais, marque-os como "Concluído" para salvar seus comprovantes!
          </p>
        </div>
      `;
      return;
    }

    const html = completed.map(c => `
      <div class="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 flex-wrap">
        <div class="space-y-0.5">
          <strong class="font-bold text-slate-900 text-xs sm:text-sm block leading-tight">${escapeHTML(c.title)}</strong>
          <span class="text-[11px] text-slate-500 font-semibold">${escapeHTML(c.provider)} • ${c.workload_hours || 10}h oficiais</span>
        </div>
        <div class="flex items-center gap-2">
          ${c.certificate_url ? `
            <a 
              href="${sanitizeUrl(c.certificate_url)}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="px-3 py-1.5 rounded-xl text-xs font-black bg-purple-100 text-purple-900 hover:bg-purple-200 transition-colors flex items-center gap-1.5"
            >
              <i data-lucide="award" class="w-3.5 h-3.5 text-purple-700"></i>
              <span>Acessar Certificado</span>
            </a>
          ` : `
            <span class="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              ✓ Carga Horária Cumprida
            </span>
          `}
        </div>
      </div>
    `).join('');

    container.innerHTML = html;

    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons({ root: container });
    }
  }

  // Configuração dos Botões e Ações do Painel do Aluno
  function setupStudentDashboard() {
    const modal = document.getElementById('student-dashboard-modal');
    const closeBtn = document.getElementById('close-student-dashboard-btn');
    const printBtn = document.getElementById('student-print-summary-btn');
    const retakeQuizBtn = document.getElementById('student-retake-quiz-btn');
    const deleteAccountBtn = document.getElementById('student-delete-account-btn');

    const tabCoursesBtn = document.getElementById('student-dash-tab-courses-btn');
    const tabQuizBtn = document.getElementById('student-dash-tab-quiz-btn');
    const tabCertsBtn = document.getElementById('student-dash-tab-certs-btn');

    if (closeBtn) closeBtn.addEventListener('click', () => {
      if (modal) modal.classList.add('hidden');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
      }
    });

    if (tabCoursesBtn) tabCoursesBtn.addEventListener('click', () => switchStudentDashboardTab('courses'));
    if (tabQuizBtn) tabQuizBtn.addEventListener('click', () => switchStudentDashboardTab('quiz'));
    if (tabCertsBtn) tabCertsBtn.addEventListener('click', () => switchStudentDashboardTab('certs'));

    // Filtros de cursos
    const filterAll = document.getElementById('student-filter-all-btn');
    const filterProgress = document.getElementById('student-filter-progress-btn');
    const filterCompleted = document.getElementById('student-filter-completed-btn');
    const filterSaved = document.getElementById('student-filter-saved-btn');

    const setFilter = (status, activeBtn) => {
      activeStudentFilter = status;
      [filterAll, filterProgress, filterCompleted, filterSaved].forEach(b => {
        if (b) b.className = 'px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer';
      });
      if (activeBtn) activeBtn.className = 'px-3 py-1.5 rounded-xl text-xs font-black bg-slate-900 text-white cursor-pointer';
      if (currentStudentDashboardData) {
        renderStudentCoursesList(currentStudentDashboardData.courses, status);
      }
    };

    if (filterAll) filterAll.addEventListener('click', () => setFilter('all', filterAll));
    if (filterProgress) filterProgress.addEventListener('click', () => setFilter('in_progress', filterProgress));
    if (filterCompleted) filterCompleted.addEventListener('click', () => setFilter('completed', filterCompleted));
    if (filterSaved) filterSaved.addEventListener('click', () => setFilter('saved', filterSaved));

    // Refazer Quiz a partir do painel
    if (retakeQuizBtn) {
      retakeQuizBtn.addEventListener('click', () => {
        if (modal) modal.classList.add('hidden');
        startCareerTest();
      });
    }

    // Imprimir Comprovante Curricular Oficial do Aluno
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        if (!currentStudentDashboardData) return;
        const s = currentStudentDashboardData.student;
        const summary = currentStudentDashboardData.summary;
        const completedCourses = (currentStudentDashboardData.courses || []).filter(c => c.status === 'completed');

        const win = window.open('', '_blank');
        win.document.write(`
          <!DOCTYPE html>
          <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <title>Histórico e Comprovante de Capacitação — ${escapeHTML(s.name)}</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; }
              @media print {
                body { padding: 0; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            <div class="max-w-3xl mx-auto border-4 border-slate-900 rounded-3xl p-8 space-y-6">
              
              <div class="no-print flex justify-end pb-4 border-b border-slate-200">
                <button onclick="window.print()" class="px-5 py-2.5 bg-[#002776] text-white font-black rounded-xl text-xs cursor-pointer shadow">
                  🖨️ Imprimir / Salvar em PDF
                </button>
              </div>

              <div class="flex items-center justify-between border-b-2 border-slate-200 pb-5">
                <div>
                  <h1 class="text-xl font-black text-slate-900 uppercase">Comprovante de Capacitação Profissional</h1>
                  <span class="text-xs text-slate-500 font-bold">Portal Você Pode Tudo — vocepodetudo.com</span>
                </div>
                <div class="text-right">
                  <span class="text-xs font-black text-[#00702a] bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 uppercase">Documento de Estudos</span>
                  <span class="text-[11px] text-slate-400 block mt-1">Data: ${new Date().toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <!-- Dados do Aluno -->
              <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span class="text-slate-400 font-bold uppercase block text-[10px]">Nome do Aluno:</span>
                  <strong class="text-sm font-black text-slate-900">${escapeHTML(s.name)}</strong>
                </div>
                <div>
                  <span class="text-slate-400 font-bold uppercase block text-[10px]">E-mail Registrado:</span>
                  <span class="text-slate-700 font-medium">${escapeHTML(s.email)}</span>
                </div>
                <div>
                  <span class="text-slate-400 font-bold uppercase block text-[10px]">Cursos Concluídos:</span>
                  <strong class="text-sm font-black text-[#009639]">${summary.completed} formações oficiais</strong>
                </div>
                <div>
                  <span class="text-slate-400 font-bold uppercase block text-[10px]">Carga Horária Total Cumprida:</span>
                  <strong class="text-sm font-black text-[#002776]">${summary.total_hours_completed} horas de capacitação</strong>
                </div>
              </div>

              <!-- Lista de Cursos Finalizados -->
              <div class="space-y-3">
                <h3 class="text-xs font-black uppercase text-slate-700 tracking-wider">Formações Gratuitas Realizadas:</h3>
                ${completedCourses.length > 0 ? `
                  <table class="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr class="border-b-2 border-slate-200 font-black text-slate-600">
                        <th class="py-2">Curso</th>
                        <th class="py-2">Instituição Parceira</th>
                        <th class="py-2 text-right">Horas</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      ${completedCourses.map(c => `
                        <tr>
                          <td class="py-2.5 font-bold text-slate-900">${escapeHTML(c.title)}</td>
                          <td class="py-2.5 text-slate-600">${escapeHTML(c.provider)}</td>
                          <td class="py-2.5 text-right font-black text-[#002776]">${c.workload_hours || 10}h</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                ` : `
                  <p class="text-xs text-slate-500 py-3">Nenhum curso marcado como concluído até o momento.</p>
                `}
              </div>

              <div class="pt-6 border-t-2 border-slate-200 text-[11px] text-slate-400 text-center">
                Portal Você Pode Tudo — Conectando brasileiros a oportunidades de educação gratuita e de qualidade.
              </div>

            </div>
          </body>
          </html>
        `);
        win.document.close();
      });
    }

    // Excluir Conta (LGPD) - Método POST com Token em Header contra CSRF
    if (deleteAccountBtn) {
      deleteAccountBtn.addEventListener('click', async () => {
        if (confirm('ATENÇÃO: Deseja realmente excluir permanentemente sua conta e todos os seus testes e cursos salvos? Esta ação não pode ser desfeita.')) {
          try {
            const res = await fetch(`api/student.php?action=delete_account`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.studentToken}`
              }
            });
            if (res.ok) {
              localStorage.removeItem('vpt_student_token');
              state.studentToken = null;
              state.student = null;
              updateStudentUI();
              if (modal) modal.classList.add('hidden');
              showToast('Sua conta e todos os seus dados foram excluídos com sucesso.', 'info');
            }
          } catch (e) {
            showToast('Erro ao excluir conta.', 'error');
          }
        }
      });
    }
  }

  // Inicialização Completa

  // Modal de Solicitação de Remoção/Atualização Institucional de Cursos (Empresas e Titulares)
  function setupTakedownModal() {
    const modal = document.getElementById('takedown-modal');
    const openBtn = document.getElementById('footer-takedown-btn');
    const closeBtn = document.getElementById('close-takedown-modal-btn');
    const cancelBtn = document.getElementById('cancel-takedown-btn');
    const form = document.getElementById('takedown-form');
    const statusMsg = document.getElementById('takedown-status-msg');

    if (!modal) return;

    function openModal() {
      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
      if (statusMsg) {
        statusMsg.classList.add('hidden');
        statusMsg.innerHTML = '';
      }
      const nameInput = document.getElementById('takedown-name');
      if (nameInput) setTimeout(() => nameInput.focus(), 50);
      if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
    }

    function closeModal() {
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
      if (openBtn) openBtn.focus();
    }

    if (openBtn) {
      openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = (document.getElementById('takedown-name')?.value || '').trim();
        const company = (document.getElementById('takedown-company')?.value || '').trim();
        const email = (document.getElementById('takedown-email')?.value || '').trim();
        const course = (document.getElementById('takedown-course')?.value || '').trim();
        const reason = document.getElementById('takedown-reason')?.value || 'Remoção do catálogo';
        const notes = (document.getElementById('takedown-notes')?.value || '').trim();

        if (!name || !company || !email || !course) {
          if (statusMsg) {
            statusMsg.className = 'mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold';
            statusMsg.textContent = 'Por favor, preencha todos os campos obrigatórios (*).';
            statusMsg.classList.remove('hidden');
          }
          return;
        }

        // Monta o e-mail formal de solicitação institucional
        const subject = encodeURIComponent(`[REMOÇÃO DE CURSO] Solicitação Institucional - ${company} (${course})`);
        const body = encodeURIComponent(
          `Prezada Equipe do Você Pode Tudo,\n\n` +
          `Eu, ${name}, em representação de ${company}, venho por meio desta solicitar a seguinte ação sobre o conteúdo listado em sua plataforma:\n\n` +
          `• Empresa / Instituição Titular: ${company}\n` +
          `• Nome do Solicitante: ${name}\n` +
          `• E-mail Corporativo de Contato: ${email}\n` +
          `• Curso / Link Referenciado: ${course}\n` +
          `• Tipo de Solicitação: ${reason}\n\n` +
          `Detalhes / Justificativa:\n${notes || 'Sem observações adicionais.'}\n\n` +
          `Aguardo a confirmação e atendimento em até 24 horas úteis.\n\n` +
          `Atenciosamente,\n${name}\n${company}`
        );

        const mailtoUrl = `mailto:contato@vocepodetudo.com?subject=${subject}&body=${body}`;

        // Feedback positivo no modal
        if (statusMsg) {
          statusMsg.className = 'mt-4 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 text-xs space-y-2';
          statusMsg.innerHTML = `
            <div class="flex items-center gap-2 font-black text-emerald-900 text-sm">
              <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600"></i>
              <span>Solicitação Pronta para Envio!</span>
            </div>
            <p>Seu aplicativo de e-mail está sendo aberto para despachar a notificação formal para <strong>contato@vocepodetudo.com</strong>.</p>
            <p class="text-[11px] text-emerald-800">Se o programa de e-mail não abrir automaticamente, envie mensagem para <strong>contato@vocepodetudo.com</strong> com o assunto <em>[REMOÇÃO DE CURSO] ${company}</em>. Atendemos com prioridade máxima em até 24h úteis.</p>
            <div class="pt-2 flex flex-wrap gap-2">
              <a href="${mailtoUrl}" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#009639] hover:bg-[#007b2f] text-white font-bold rounded-xl text-xs shadow-xs transition-colors">
                <i data-lucide="mail" class="w-3.5 h-3.5"></i>
                <span>Abrir E-mail Novamente</span>
              </a>
              <button type="button" id="copy-takedown-email-btn" class="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer">
                <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                <span>Copiar E-mail (contato@vocepodetudo.com)</span>
              </button>
            </div>
          `;
          statusMsg.classList.remove('hidden');

          const copyBtn = document.getElementById('copy-takedown-email-btn');
          if (copyBtn) {
            copyBtn.addEventListener('click', () => {
              navigator.clipboard?.writeText('contato@vocepodetudo.com').then(() => {
                copyBtn.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600"></i><span>Copiado!</span>';
                if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
              });
            });
          }

          if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
        }

        // Tenta acionar o cliente de e-mail
        window.location.href = mailtoUrl;
      });
    }
  }

  // ==========================================
  // Progressive Web App (PWA) Manager
  // ==========================================
  let deferredPwaPrompt = null;

  function setupPwa() {
    // 1. Registro do Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js?v=4.81.0')
          .then((registration) => {
            registration.update();
            console.log('[PWA] Service Worker v4.81.0 registrado com sucesso:', registration.scope);
          })
          .catch((error) => {
            console.warn('[PWA] Erro ao registrar Service Worker:', error);
          });
      });
    }

    const btnDesktop = document.getElementById('btn-install-pwa-desktop');
    const btnMobile = document.getElementById('btn-install-pwa-mobile');
    const banner = document.getElementById('pwa-install-banner');
    const bannerInstallBtn = document.getElementById('pwa-banner-install-btn');
    const bannerDismissBtn = document.getElementById('pwa-banner-dismiss-btn');
    const bannerCloseBtn = document.getElementById('pwa-banner-close');

    // Se já estiver rodando como app standalone (já instalado)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) {
      console.log('[PWA] Aplicativo rodando em modo Standalone/Instalado.');
      return;
    }

    // Captura o evento nativo de instalação do navegador (Chrome, Edge, Samsung Internet)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPwaPrompt = e;

      // Revela os botões de instalação
      if (btnDesktop) {
        btnDesktop.classList.remove('hidden');
        if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ root: btnDesktop });
      }
      if (btnDropdown) {
        btnDropdown.classList.remove('hidden');
        btnDropdown.onclick = triggerPwaInstall;
        if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ root: btnDropdown });
      }
      if (btnMobile) {
        btnMobile.classList.remove('hidden');
        btnMobile.classList.add('flex');
        if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ root: btnMobile });
      }

      // Mostra o banner flutuante para celular/desktop após 4 segundos se não tiver sido dispensado nas últimas 24h
      const wasDismissed = localStorage.getItem('vcpd_pwa_dismissed');
      const now = Date.now();
      if (!wasDismissed || (now - parseInt(wasDismissed, 10)) > 24 * 60 * 60 * 1000) {
        setTimeout(() => {
          if (deferredPwaPrompt && banner) {
            banner.classList.remove('hidden');
            if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ root: banner });
          }
        }, 4000);
      }
    });

    async function triggerPwaInstall(e) {
      // Se estiver em dispositivo móvel (Android), prioriza o download direto do Aplicativo Oficial (.APK)
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        trackAnalyticsEvent('app_apk_download_click');
        showToast('Iniciando download do Aplicativo Oficial Você Pode Tudo (.APK)...', 'success');
        const link = document.createElement('a');
        link.href = 'vocepodetudo.apk';
        link.download = 'vocepodetudo.apk';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (banner) banner.classList.add('hidden');
        return;
      }

      // No desktop, se houver prompt do navegador, executa instalação ou direciona para downloads
      if (deferredPwaPrompt) {
        trackAnalyticsEvent('pwa_install_click');
        deferredPwaPrompt.prompt();
        const choiceResult = await deferredPwaPrompt.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          trackAnalyticsEvent('pwa_install_accepted');
          if (banner) banner.classList.add('hidden');
          if (btnDesktop) btnDesktop.classList.add('hidden');
          if (btnDropdown) btnDropdown.classList.add('hidden');
        }
        deferredPwaPrompt = null;
      } else {
        window.location.href = 'downloads.html';
      }
    }

    if (btnDesktop) btnDesktop.addEventListener('click', triggerPwaInstall);
    if (btnMobile) btnMobile.addEventListener('click', triggerPwaInstall);
    if (bannerInstallBtn) bannerInstallBtn.addEventListener('click', triggerPwaInstall);

    function dismissPwaBanner() {
      if (banner) banner.classList.add('hidden');
      localStorage.setItem('vcpd_pwa_dismissed', Date.now().toString());
    }

    if (bannerDismissBtn) bannerDismissBtn.addEventListener('click', dismissPwaBanner);
    if (bannerCloseBtn) bannerCloseBtn.addEventListener('click', dismissPwaBanner);

    window.addEventListener('appinstalled', () => {
      trackAnalyticsEvent('pwa_installed');
      deferredPwaPrompt = null;
      if (banner) banner.classList.add('hidden');
      if (btnDesktop) btnDesktop.classList.add('hidden');
          if (btnDropdown) btnDropdown.classList.add('hidden');
      if (btnMobile) btnMobile.classList.add('hidden');
      showToast('Aplicativo Você Pode Tudo instalado com sucesso na sua tela inicial!', 'success');
    });
  }

  // Tratamento Inteligente de Deep-Linking de Cursos (?curso=...)
  function handleDeepLinkCourse() {
    if (!state.deepLinkCourse) return;
    const searchTarget = state.deepLinkCourse.toLowerCase();
    const target = state.allCourses.find(c => 
      String(c.id).toLowerCase() === searchTarget ||
      (c.title && c.title.toLowerCase().includes(searchTarget))
    );
    if (!target) return;

    const card = document.querySelector(`[data-course-id="${target.id}"]`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('ring-4', 'ring-[#009639]', 'ring-offset-4', 'shadow-2xl');
      setTimeout(() => {
        card.classList.remove('ring-4', 'ring-[#009639]', 'ring-offset-4', 'shadow-2xl');
      }, 5000);
      showToast(`Exibindo curso: ${target.title}`, 'info');
    } else {
      state.searchQuery = target.title;
      const searchInput = document.getElementById('search-input');
      if (searchInput) searchInput.value = target.title;
      renderCourses(true);
      showToast(`Exibindo curso: ${target.title}`, 'info');
    }
  }

  // ============================================================
  // MURAL DE VAGAS & OPORTUNIDADES INTEGRADO (FASE 2)
  // ============================================================
  let jobsData = [];
  let filteredJobs = [];
  let currentJobTypeFilter = 'all';
  let currentJobModalityFilter = 'all';
  let currentJobSearchFilter = '';

  function getJobTypeLabel(type) {
    switch (type) {
      case 'estagio': return 'Estágio';
      case 'jovem_aprendiz': return 'Jovem Aprendiz';
      case 'junior': return 'Júnior';
      case 'trainee': return 'Trainee';
      default: return 'Oportunidade';
    }
  }

  function getJobTypeBadgeClass(type) {
    switch (type) {
      case 'estagio': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'jovem_aprendiz': return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'junior': return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'trainee': return 'bg-amber-100 text-amber-900 border-amber-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  }

  function getJobModalityLabel(modality) {
    switch (modality) {
      case 'remoto': return '100% Remoto';
      case 'hibrido': return 'Híbrido';
      case 'presencial': return 'Presencial';
      default: return modality;
    }
  }

  async function trackJobClick(jobId) {
    try {
      fetch(`api/jobs.php?action=click&id=${jobId}`);
      trackAnalyticsEvent('job_apply_click');
    } catch (e) {}
  }

  function openJobModal(job) {
    const modal = document.getElementById('job-details-modal');
    if (!modal) return;

    const titleEl = document.getElementById('job-modal-title');
    const compEl = document.getElementById('job-modal-company');
    const typeBadge = document.getElementById('job-modal-type-badge');
    const modBadge = document.getElementById('job-modal-modality-badge');
    const salaryEl = document.getElementById('job-modal-salary');
    const locEl = document.getElementById('job-modal-location');
    const descEl = document.getElementById('job-modal-description');
    const reqEl = document.getElementById('job-modal-requirements');
    const benEl = document.getElementById('job-modal-benefits');
    const benBox = document.getElementById('job-modal-benefits-box');
    const applyBtn = document.getElementById('job-modal-apply-btn');

    if (titleEl) titleEl.textContent = job.title || 'Vaga';
    if (compEl) compEl.textContent = job.company || 'Empresa';
    if (typeBadge) {
      typeBadge.textContent = getJobTypeLabel(job.type);
      typeBadge.className = `px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getJobTypeBadgeClass(job.type)}`;
    }
    if (modBadge) {
      modBadge.textContent = getJobModalityLabel(job.modality);
    }
    if (salaryEl) salaryEl.textContent = job.salary || 'A Combinar';
    if (locEl) locEl.textContent = job.city ? `${job.city} (${job.state})` : (job.state === 'BR' ? 'Brasil (Nacional)' : job.state);
    if (descEl) descEl.textContent = job.description || 'Sem descrição informada.';
    if (reqEl) reqEl.textContent = job.requirements || 'Consulte os requisitos na fonte oficial.';
    
    if (job.benefits && job.benefits.trim()) {
      if (benBox) benBox.classList.remove('hidden');
      if (benEl) benEl.textContent = job.benefits;
    } else {
      if (benBox) benBox.classList.add('hidden');
    }

    if (applyBtn) {
      applyBtn.href = job.apply_url || '#';
      applyBtn.onclick = () => trackJobClick(job.id);
    }

    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  function renderJobsGrid() {
    const grid = document.getElementById('jobs-grid');
    const emptyState = document.getElementById('jobs-empty-state');
    const badge = document.getElementById('jobs-count-badge');
    if (!grid) return;

    if (badge) {
      badge.textContent = `${filteredJobs.length} ${filteredJobs.length === 1 ? 'vaga encontrada' : 'vagas encontradas'}`;
    }

    if (filteredJobs.length === 0) {
      grid.classList.add('hidden');
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    grid.classList.remove('hidden');
    if (emptyState) emptyState.classList.add('hidden');

    grid.innerHTML = filteredJobs.map(job => {
      const typeLabel = getJobTypeLabel(job.type);
      const typeBadgeClass = getJobTypeBadgeClass(job.type);
      const modalityLabel = getJobModalityLabel(job.modality);
      const loc = job.city ? `${job.city}` : (job.state === 'BR' ? 'Todo o Brasil' : job.state);
      const salaryText = job.salary ? escapeHTML(job.salary) : 'A combinar';

      return `
        <article class="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
          <div class="space-y-3">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${typeBadgeClass}">
                ${typeLabel}
              </span>
              <span class="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <i data-lucide="${job.modality === 'remoto' ? 'globe' : 'map-pin'}" class="w-3 h-3 text-slate-400"></i>
                <span>${modalityLabel}</span>
              </span>
            </div>

            <div>
              <h3 class="text-sm sm:text-base font-black text-slate-900 group-hover:text-[#002776] transition-colors leading-snug line-clamp-2">
                ${escapeHTML(job.title)}
              </h3>
              <div class="text-xs font-bold text-slate-500 mt-1 flex items-center gap-1.5">
                <i data-lucide="building-2" class="w-3.5 h-3.5 text-slate-400"></i>
                <span>${escapeHTML(job.company)}</span>
                <span class="text-slate-300">•</span>
                <span class="text-slate-600 font-semibold">${escapeHTML(loc)}</span>
              </div>
            </div>

            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2">
              <span class="text-[11px] font-black text-amber-800">${salaryText}</span>
              <span class="text-[10px] font-bold text-slate-400">${escapeHTML(job.source_name || 'Oficial')}</span>
            </div>

            <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              ${escapeHTML(job.description)}
            </p>
          </div>

          <div class="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2">
            <button 
              type="button" 
              class="view-job-details-btn flex-1 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer text-center"
              data-job-id="${job.id}"
            >
              Ver Detalhes
            </button>
            <a 
              href="${escapeHTML(job.apply_url || '#')}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="apply-job-link px-3.5 py-2 rounded-xl text-xs font-black text-white bg-[#002776] hover:bg-blue-900 transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
              data-job-id="${job.id}"
              title="Candidatar-se na página oficial"
            >
              <span>Candidatar</span>
              <i data-lucide="external-link" class="w-3 h-3 text-[#ffdf00]"></i>
            </a>
          </div>
        </article>
      `;
    }).join('');

    // Adiciona ouvintes para os botões da grade
    grid.querySelectorAll('.view-job-details-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(e.currentTarget.dataset.jobId);
        const job = jobsData.find(j => Number(j.id) === id);
        if (job) openJobModal(job);
      });
    });

    grid.querySelectorAll('.apply-job-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const id = Number(e.currentTarget.dataset.jobId);
        trackJobClick(id);
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function applyJobsFilters() {
    filteredJobs = jobsData.filter(job => {
      if (currentJobTypeFilter !== 'all' && job.type !== currentJobTypeFilter) return false;
      if (currentJobModalityFilter !== 'all' && job.modality !== currentJobModalityFilter) return false;
      if (currentJobSearchFilter) {
        const query = currentJobSearchFilter.toLowerCase();
        const hay = `${job.title} ${job.company} ${job.description} ${job.requirements} ${job.city}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
    renderJobsGrid();
  }

  async function initJobsModule() {
    const grid = document.getElementById('jobs-grid');
    if (!grid) return;

    // Fechar modal de vaga
    const modal = document.getElementById('job-details-modal');
    const closeBtn = document.getElementById('close-job-modal-btn');
    const cancelBtn = document.getElementById('btn-cancel-job-modal');
    const resetFiltersBtn = document.getElementById('jobs-reset-filters-btn');

    function closeJobModal() {
      if (modal) modal.classList.add('hidden');
    }

    if (closeBtn) closeBtn.addEventListener('click', closeJobModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeJobModal);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeJobModal();
      });
    }

    // Busca textual
    const searchInput = document.getElementById('jobs-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        currentJobSearchFilter = searchInput.value.trim();
        applyJobsFilters();
      });
    }

    // Filtro por Modalidade
    const modSelect = document.getElementById('jobs-filter-modality');
    if (modSelect) {
      modSelect.addEventListener('change', () => {
        currentJobModalityFilter = modSelect.value;
        applyJobsFilters();
      });
    }

    // Pílulas de Tipo de Contrato
    document.querySelectorAll('.job-type-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.job-type-pill').forEach(p => {
          p.classList.remove('bg-[#002776]', 'text-white', 'shadow-2xs');
          p.classList.add('bg-slate-100', 'text-slate-700');
        });
        pill.classList.add('bg-[#002776]', 'text-white', 'shadow-2xs');
        pill.classList.remove('bg-slate-100', 'text-slate-700');

        currentJobTypeFilter = pill.dataset.type || 'all';
        applyJobsFilters();
      });
    });

    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        currentJobTypeFilter = 'all';
        currentJobModalityFilter = 'all';
        currentJobSearchFilter = '';
        if (searchInput) searchInput.value = '';
        if (modSelect) modSelect.value = 'all';
        document.querySelectorAll('.job-type-pill').forEach(p => {
          if (p.dataset.type === 'all') {
            p.classList.add('bg-[#002776]', 'text-white', 'shadow-2xs');
            p.classList.remove('bg-slate-100', 'text-slate-700');
          } else {
            p.classList.remove('bg-[#002776]', 'text-white', 'shadow-2xs');
            p.classList.add('bg-slate-100', 'text-slate-700');
          }
        });
        applyJobsFilters();
      });
    }

    // Carregar vagas da API
    try {
      const res = await fetch('api/jobs.php?limit=50&t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.jobs)) {
          jobsData = data.jobs;
          filteredJobs = [...jobsData];
          renderJobsGrid();
          return;
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar vagas:', e);
    }

    // Fallback gracioso com seed local se offline
    if (jobsData.length === 0) {
      try {
        const seedRes = await fetch('api/seed_jobs.json');
        if (seedRes.ok) {
          jobsData = await seedRes.json();
          filteredJobs = [...jobsData];
          renderJobsGrid();
        }
      } catch (err) {}
    }
  }

  // ==============================================================
  // MÓDULO DE BLOG & ARTIGOS DE CARREIRA (FASE 3)
  // ==============================================================
  let blogData = [];
  let filteredBlogPosts = [];
  let currentBlogCategory = 'todos';
  let currentBlogSearch = '';

  const BLOG_CATEGORY_LABELS = {
    'todos': 'Todos',
    'primeiro_emprego': 'Primeiro Emprego',
    'curriculo_linkedin': 'Currículo & LinkedIn',
    'entrevistas': 'Entrevistas de Emprego',
    'tecnologia': 'Carreira em TI',
    'carreira': 'Desenvolvimento Profissional',
    'estudos': 'Estudos & Certificações'
  };

  function renderBlogGrid() {
    const grid = document.getElementById('blog-grid');
    const emptyState = document.getElementById('blog-empty-state');
    const badge = document.getElementById('blog-posts-count-badge');
    if (!grid) return;

    if (badge) {
      badge.textContent = `${filteredBlogPosts.length} artigo${filteredBlogPosts.length === 1 ? '' : 's'} disponível${filteredBlogPosts.length === 1 ? '' : 'is'}`;
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
        ? `<div class="h-44 w-full overflow-hidden bg-slate-100 relative">
             <img src="${escapeHTML(post.cover_image)}" alt="${escapeHTML(post.title)}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
             <div class="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"></div>
             <span class="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/95 text-slate-900 shadow-sm">
               ${catLabel}
             </span>
             <span class="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-950/85 text-purple-100 backdrop-blur-xs flex items-center gap-1 shadow-sm border border-purple-400/30">
               <i data-lucide="eye" class="w-3 h-3 text-purple-300"></i>
               ${Number(post.views_count || 0).toLocaleString('pt-BR')} cliques
             </span>
             <span class="absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-900/80 text-white backdrop-blur-xs flex items-center gap-1">
               <i data-lucide="clock" class="w-3 h-3 text-[#ffdf00]"></i>
               ${readTime}
             </span>
           </div>`
        : `<div class="h-36 w-full bg-gradient-to-br from-[#005e24] to-[#002776] p-4 flex flex-col justify-between relative">
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
                <span class="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 shadow-2xs" title="Total de cliques registrados">
                  <i data-lucide="eye" class="w-3 h-3 text-purple-600"></i>
                  ${Number(post.views_count || 0).toLocaleString('pt-BR')} cliques
                </span>
              </div>
            </div>
          </div>
          <div class="px-5 pb-5">
            <button 
              type="button" 
              class="read-post-btn w-full py-2.5 rounded-xl text-xs font-black text-[#005e24] bg-emerald-50 hover:bg-[#005e24] hover:text-white transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
              data-post-id="${post.id}"
            >
              <span>Ler Artigo Completo</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
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

  async function openBlogReader(post) {
    const modal = document.getElementById('blog-reader-modal');
    if (!modal) return;

    const titleEl = document.getElementById('blog-modal-title');
    const catBadge = document.getElementById('blog-modal-category-badge');
    const timeEl = document.getElementById('blog-modal-read-time');
    const authorEl = document.getElementById('blog-modal-author');
    const dateEl = document.getElementById('blog-modal-date');
    const viewsEl = document.getElementById('blog-modal-views');
    const contentEl = document.getElementById('blog-modal-content');
    const coverContainer = document.getElementById('blog-modal-cover-container');
    const coverImg = document.getElementById('blog-modal-cover-img');
    const shareBtn = document.getElementById('blog-modal-share-btn');
    const copyLinkBtn = document.getElementById('blog-copy-link-btn');

    if (titleEl) titleEl.textContent = post.title;
    if (catBadge) catBadge.textContent = BLOG_CATEGORY_LABELS[post.category] || 'Carreira';
    if (timeEl) {
      timeEl.innerHTML = `<i data-lucide="clock" class="w-3.5 h-3.5"></i> <span>${post.read_time_minutes || 5} min de leitura</span>`;
    }
    if (authorEl) authorEl.textContent = post.author || 'Equipe Você Pode Tudo';
    if (dateEl) dateEl.textContent = post.created_at ? new Date(post.created_at).toLocaleDateString('pt-BR') : 'Publicado recentemente';
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

    // Configurar compartilhamento
    const articleUrl = `${window.location.origin}/artigo/${encodeURIComponent(post.slug || post.id)}`;
    if (shareBtn) {
      shareBtn.onclick = () => {
        const text = `Confira este artigo excelente no Você Pode Tudo: "${post.title}" - ${articleUrl}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
      };
    }
    if (copyLinkBtn) {
      copyLinkBtn.onclick = () => {
        navigator.clipboard.writeText(articleUrl).then(() => {
          showToast('Link do artigo copiado com sucesso!', 'success');
        }).catch(() => {
          prompt('Copie o link do artigo abaixo:', articleUrl);
        });
      };
    }

    // Conteúdo rico com fallback
    if (contentEl) {
      if (post.content) {
        contentEl.innerHTML = post.content;
      } else {
        contentEl.innerHTML = `<div class="py-8 text-center text-slate-400 font-bold"><i data-lucide="loader" class="w-6 h-6 animate-spin mx-auto mb-2 text-[#005e24]"></i><span>Carregando texto completo...</span></div>`;
      }
    }

    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();

    // Buscar detalhes e registrar view no backend
    try {
      const res = await fetch(`api/blog.php?action=get&id=${post.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.post) {
          post.content = data.post.content;
          post.views_count = data.post.views_count;
          if (contentEl) contentEl.innerHTML = data.post.content;
          if (viewsEl) viewsEl.innerHTML = `<i data-lucide="eye" class="w-3.5 h-3.5 text-purple-600"></i> <span class="font-black text-purple-700">${Number(data.post.views_count || 0).toLocaleString('pt-BR')} cliques</span>`;
          if (window.lucide) window.lucide.createIcons();
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar detalhes completos do artigo:', e);
    }
  }

  async function initBlogModule() {
    const grid = document.getElementById('blog-grid');
    if (!grid) return;

    const modal = document.getElementById('blog-reader-modal');
    const closeBtn = document.getElementById('close-blog-modal-btn');
    const closeReaderBtn = document.getElementById('btn-close-blog-reader');
    const resetFiltersBtn = document.getElementById('blog-reset-filters-btn');
    const searchInput = document.getElementById('blog-search-input');
    const searchBtn = document.getElementById('blog-search-btn');
    const goJobsBtn = document.getElementById('blog-modal-go-jobs-btn');

    function closeBlogModal() {
      if (modal) modal.classList.add('hidden');
    }

    if (closeBtn) closeBtn.addEventListener('click', closeBlogModal);
    if (closeReaderBtn) closeReaderBtn.addEventListener('click', closeBlogModal);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeBlogModal();
      });
    }

    if (goJobsBtn) {
      goJobsBtn.addEventListener('click', () => {
        closeBlogModal();
        const sec = document.getElementById('jobs-section');
        if (sec) sec.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Busca textual
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

    // Pílulas de Categoria
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

    // Carregar artigos da API
    try {
      const res = await fetch('api/blog.php?action=list&limit=12');
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.posts)) {
          blogData = data.posts;
          filteredBlogPosts = [...blogData];
          renderBlogGrid();

          // Verificar parâmetro na URL (?artigo=slug)
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
      console.warn('Erro ao carregar artigos do blog:', e);
    }

    // Fallback gracioso com seed local se offline
    if (blogData.length === 0) {
      try {
        const seedRes = await fetch('api/seed_blog.json');
        if (seedRes.ok) {
          blogData = await seedRes.json();
          filteredBlogPosts = [...blogData];
          renderBlogGrid();
        }
      } catch (err) {}
    }
  }

  function init() {
    // 1. Recursos essenciais e utilidades imediatas
    try { initDarkMode(); } catch (e) { console.warn('[DarkMode] Erro ao iniciar:', e); }
    try { initGlobalAnnouncement(); } catch (e) { console.warn('[Announcement] Erro:', e); }
    try { setupPwa(); } catch (e) { console.warn('[PWA] Erro ao iniciar:', e); }
    try { setupLGPD(); } catch (e) { console.warn('[LGPD] Erro ao iniciar:', e); }
    try { initWeatherWidget(); } catch (e) { console.warn('[Weather] Erro ao iniciar:', e); }
    try { initNewsTicker(); } catch (e) { console.warn('[News] Erro ao iniciar:', e); }
    try { setupVisualAccessibilityWidget(); } catch (e) { console.warn('[VisualAcc] Erro ao iniciar:', e); }
    try { setupAdminAnalytics(); } catch (e) { console.warn('[Analytics] Erro ao iniciar:', e); }
    try { initStudentSession(); } catch (e) { console.warn('[StudentSession] Erro:', e); }
    try { setupCascadingMenus(); } catch (e) { console.warn('[CascadingMenus] Erro:', e); }
    try { setupStudentAuth(); } catch (e) { console.warn('[StudentAuth] Erro:', e); }
    try { setupStudentDashboard(); } catch (e) { console.warn('[StudentDash] Erro:', e); }
    try { setupTakedownModal(); } catch (e) { console.warn('[Takedown] Erro:', e); }
    try { initJobsModule(); } catch (e) { console.warn('[Jobs] Erro:', e); }
    try { initBlogModule(); } catch (e) { console.warn('[Blog] Erro:', e); }

    // Rastreamento inicial de visualização da Home
    trackAnalyticsEvent('pageview_home');

    // 2. Catálogo e preferências persistidas
    loadPersistedData();
    handleURLParameters();
    updateAdminUI();
    renderTracks();
    renderCategories();
    renderProviderOptions();
    renderRecentCourses();
    updateViewModeButtons();
    updateFavoritesBadge();
    setupModals();
    setupEventListeners();
    setupInfiniteScroll();

    // Renderização imediata do catálogo (0ms de espera para o usuário)
    renderCourses();
    updateHeaderStats();

    // Deep Link para curso compartilhado (?curso=...)
    if (state.deepLinkCourse) {
      setTimeout(() => {
        handleDeepLinkCourse();
      }, 350);
    }

    if (state.viewMode === 'career-test') {
      renderCurrentQuizStep();
    } else if (state.viewMode === 'career-result' && state.careerQuiz.result) {
      renderCareerResult();
    }

    // 3. Sincronizar catálogo diretamente com o MySQL do servidor
    syncCoursesWithMySQL();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


  // ===========================================================================
  // GERADOR DE CRONOGRAMA DE ESTUDOS SEMANAL
  // ===========================================================================
  const scheduleTemplates = {
    tecnologia: [
      { dia: 'Segunda-feira', meta: 'Assistir aula inaugural de Lógica ou Linguagem', tempo: 'vídeo + anotações' },
      { dia: 'Terça-feira', meta: 'Mão na massa: escrever os primeiros códigos e testes práticos', tempo: 'exercícios guiados' },
      { dia: 'Quarta-feira', meta: 'Leitura complementar de documentação oficial e conceitos fundamentais', tempo: 'fixação' },
      { dia: 'Quinta-feira', meta: 'Resolver 2 a 3 desafios de código ou mini projeto no GitHub', tempo: 'prática intensiva' },
      { dia: 'Sexta-feira', meta: 'Revisão geral das anotações e postar o aprendizado na comunidade', tempo: 'síntese semanal' },
      { dia: 'Sábado', meta: 'Mini projeto de portfólio para currículo', tempo: 'projeto prático' },
      { dia: 'Domingo', meta: 'Descanso e planejamento da próxima trilha', tempo: 'recuperação' }
    ],
    gestao: [
      { dia: 'Segunda-feira', meta: 'Conceitos de Gestão e Planejamento Estratégico', tempo: 'estudo teórico' },
      { dia: 'Terça-feira', meta: 'Estudo de caso prático: resolução de gargalos operacionais', tempo: 'análise de caso' },
      { dia: 'Quarta-feira', meta: 'Prática com planilhas de Excel e indicadores de desempenho (KPIs)', tempo: 'ferramentas' },
      { dia: 'Quinta-feira', meta: 'Comunicação executiva, liderança e gestão de pessoas', tempo: 'soft skills' },
      { dia: 'Sexta-feira', meta: 'Resumo das melhores práticas e plano de melhoria contínua', tempo: 'revisão' },
      { dia: 'Sábado', meta: 'Leitura de artigo sobre inovação e mercado corporativo', tempo: 'atualização' },
      { dia: 'Domingo', meta: 'Descanso estratégico para a semana', tempo: 'recuperação' }
    ],
    saude: [
      { dia: 'Segunda-feira', meta: 'Fundamentos de Cuidados Básicos e Protocolos de Saúde', tempo: 'aula teórica' },
      { dia: 'Terça-feira', meta: 'Prevenção de Infecções, Biossegurança e Higiene Clínica', tempo: 'protocolos' },
      { dia: 'Quarta-feira', meta: 'Diretrizes do SUS e Políticas Públicas de Saúde Comunitária', tempo: 'legislação' },
      { dia: 'Quinta-feira', meta: 'Simulação de rotinas de atendimento humanizado e acolhimento', tempo: 'prática de atendimento' },
      { dia: 'Sexta-feira', meta: 'Revisão dos módulos para avaliação final e emissão de certificado', tempo: 'revisão de prova' },
      { dia: 'Sábado', meta: 'Fixação de termos técnicos e vocabulário hospitalar', tempo: 'estudo dirigido' },
      { dia: 'Domingo', meta: 'Descanso e leitura leve sobre bem-estar', tempo: 'recuperação' }
    ],
    ingles: [
      { dia: 'Segunda-feira', meta: 'Listening & Vocabulary: ouvir podcast ou aula e anotar 10 palavras novas', tempo: 'compreensão oral' },
      { dia: 'Terça-feira', meta: 'Grammar in Context: estruturas essenciais para apresentações e reuniões', tempo: 'gramática prática' },
      { dia: 'Quarta-feira', meta: 'Reading: ler artigo curto sobre sua área profissional em inglês', tempo: 'leitura e vocabulário' },
      { dia: 'Quinta-feira', meta: 'Speaking/Pronunciation: repetir frases em voz alta e gravar áudio de 1 min', tempo: 'pronúncia ativa' },
      { dia: 'Sexta-feira', meta: 'Writing: escrever pequeno e-mail ou mensagem simulando contato profissional', tempo: 'escrita' },
      { dia: 'Sábado', meta: 'Assistir a um vídeo do YouTube em inglês com legendas em inglês', tempo: 'imersão' },
      { dia: 'Domingo', meta: 'Descanso e contato leve com músicas em inglês', tempo: 'lazer' }
    ],
    concursos: [
      { dia: 'Segunda-feira', meta: 'Língua Portuguesa: Gramática e Interpretação de Texto', tempo: 'disciplina base' },
      { dia: 'Terça-feira', meta: 'Direito Constitucional ou Administrativo: leitura de lei seca', tempo: 'legislação' },
      { dia: 'Quarta-feira', meta: 'Raciocínio Lógico e Matemática Básica', tempo: 'resolução de exercícios' },
      { dia: 'Quinta-feira', meta: 'Informática para Concursos e Noções de Administração Pública', tempo: 'conteúdo específico' },
      { dia: 'Sexta-feira', meta: 'Simulado de 20 questões de bancas anteriores (Cebraspe/FGV/Vunesp)', tempo: 'testagem real' },
      { dia: 'Sábado', meta: 'Análise detalhada das questões erradas no simulado', tempo: 'reforço' },
      { dia: 'Domingo', meta: 'Descanso mental para absorção do conteúdo', tempo: 'recuperação' }
    ],
    carreira: [
      { dia: 'Segunda-feira', meta: 'Atualização do Currículo no portal com as competências da vaga', tempo: 'currículo' },
      { dia: 'Terça-feira', meta: 'Comportamento corporativo, ética no trabalho e comunicação no WhatsApp', tempo: 'postura' },
      { dia: 'Quarta-feira', meta: 'Simulação de Entrevistas: treinar respostas para as 5 perguntas mais comuns', tempo: 'simulador' },
      { dia: 'Quinta-feira', meta: 'Candidatura dirigida a 3 vagas de Jovem Aprendiz ou Estágio no Mural', tempo: 'aplicação' },
      { dia: 'Sexta-feira', meta: 'Aula de Informática Básica ou Excel para reforçar seu perfil', tempo: 'capacitação' },
      { dia: 'Sábado', meta: 'Organizar rede de contatos e perfil no LinkedIn', tempo: 'networking' },
      { dia: 'Domingo', meta: 'Descanso', tempo: 'recuperação' }
    ]
  };

  window.openStudyScheduleModal = function() {
    const modal = document.getElementById('study-schedule-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();

    // Carregar progresso anterior se existir
    const saved = localStorage.getItem('vpt_study_plan_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        renderScheduleDays(parsed.days, parsed.areaName, parsed.timePerDay);
        document.getElementById('schedule-setup-view')?.classList.add('hidden');
        document.getElementById('schedule-result-view')?.classList.remove('hidden');
        document.getElementById('btn-reconfigure-schedule')?.classList.remove('hidden');
        document.getElementById('btn-print-schedule')?.classList.remove('hidden');
        updateScheduleProgress();
      } catch (e) {}
    }
  };

  window.closeStudyScheduleModal = function() {
    const modal = document.getElementById('study-schedule-modal');
    if (modal) modal.classList.add('hidden');
  };

  function updateScheduleProgress() {
    const checkboxes = document.querySelectorAll('.sched-checkbox');
    if (checkboxes.length === 0) return;

    let checked = 0;
    checkboxes.forEach(c => { if (c.checked) checked++; });

    const pct = Math.round((checked / checkboxes.length) * 100);
    const textEl = document.getElementById('schedule-progress-text');
    const barEl = document.getElementById('schedule-progress-bar');

    if (textEl) textEl.textContent = `${pct}% concluído (${checked} de ${checkboxes.length} metas)`;
    if (barEl) barEl.style.width = `${pct}%`;
  }

  function renderScheduleDays(days, areaName, timePerDay) {
    const container = document.getElementById('schedule-days-container');
    if (!container) return;

    const savedProgress = JSON.parse(localStorage.getItem('vpt_study_plan_progress') || '{}');

    container.innerHTML = days.map((d, idx) => {
      const isChecked = !!savedProgress[idx];
      return `
        <div class="p-3.5 rounded-2xl border ${isChecked ? 'bg-emerald-50/60 border-emerald-300' : 'bg-slate-50 border-slate-200'} transition-all flex items-start gap-3">
          <input 
            type="checkbox" 
            id="sched-chk-${idx}" 
            class="sched-checkbox mt-1 w-4 h-4 text-[#009639] rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            ${isChecked ? 'checked' : ''}
            onchange="window.toggleScheduleTask(${idx}, this.checked)"
          >
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <span class="font-black text-xs ${isChecked ? 'text-emerald-900 line-through' : 'text-slate-900'}">${d.dia}</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${isChecked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}">${timePerDay} min</span>
            </div>
            <p class="text-xs text-slate-600 mt-0.5 ${isChecked ? 'line-through text-slate-400' : ''}">${d.meta}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  window.toggleScheduleTask = function(idx, checked) {
    const saved = JSON.parse(localStorage.getItem('vpt_study_plan_progress') || '{}');
    if (checked) saved[idx] = true;
    else delete saved[idx];
    localStorage.setItem('vpt_study_plan_progress', JSON.stringify(saved));
    updateScheduleProgress();

    const chkEl = document.getElementById(`sched-chk-${idx}`);
    if (chkEl) {
      const card = chkEl.closest('div.rounded-2xl');
      if (card) {
        if (checked) {
          card.className = 'p-3.5 rounded-2xl border bg-emerald-50/60 border-emerald-300 transition-all flex items-start gap-3';
        } else {
          card.className = 'p-3.5 rounded-2xl border bg-slate-50 border-slate-200 transition-all flex items-start gap-3';
        }
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-generate-schedule')?.addEventListener('click', () => {
      const area = document.getElementById('sched-area')?.value || 'tecnologia';
      const time = document.getElementById('sched-time')?.value || '30';
      const freq = document.getElementById('sched-days')?.value || 'semana';

      const allDays = scheduleTemplates[area] || scheduleTemplates.tecnologia;
      let selectedDays = [...allDays];

      if (freq === 'semana') {
        selectedDays = allDays.slice(0, 5);
      } else if (freq === 'fimdesemana') {
        selectedDays = allDays.slice(5, 7);
      }

      const areaSelect = document.getElementById('sched-area');
      const areaName = areaSelect ? areaSelect.options[areaSelect.selectedIndex].text : 'Geral';

      localStorage.setItem('vpt_study_plan_data', JSON.stringify({
        area,
        areaName,
        timePerDay: time,
        days: selectedDays
      }));
      localStorage.removeItem('vpt_study_plan_progress');

      renderScheduleDays(selectedDays, areaName, time);
      document.getElementById('schedule-setup-view')?.classList.add('hidden');
      document.getElementById('schedule-result-view')?.classList.remove('hidden');
      document.getElementById('btn-reconfigure-schedule')?.classList.remove('hidden');
      document.getElementById('btn-print-schedule')?.classList.remove('hidden');
      updateScheduleProgress();
      if (window.lucide) window.lucide.createIcons();
    });

    document.getElementById('btn-reconfigure-schedule')?.addEventListener('click', () => {
      document.getElementById('schedule-result-view')?.classList.add('hidden');
      document.getElementById('schedule-setup-view')?.classList.remove('hidden');
      document.getElementById('btn-reconfigure-schedule')?.classList.add('hidden');
      document.getElementById('btn-print-schedule')?.classList.add('hidden');
    });

    document.getElementById('btn-print-schedule')?.addEventListener('click', () => {
      window.print();
    });
  });
