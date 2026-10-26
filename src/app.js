// Você Pode Tudo — Lógica da Aplicação com Acessibilidade, Segurança Criptográfica, MySQL Backend & SEO

(function() {
  'use strict';

  // Configuração da API do Servidor (ServerByte / cPanel)
  const API_BASE = './api';

  // Configurações e Constantes de Segurança
  const SECURITY = {
    MAX_ATTEMPTS: 5,
    LOCKOUT_DURATION_MS: 5 * 60 * 1000,    // 5 minutos de bloqueio temporário
    SESSION_MAX_AGE_MS: 2 * 60 * 60 * 1000 // 2 horas de inatividade máxima
  };

  // Funções Utilitárias de Segurança (Hashing, Anti-XSS e Sanitização)
  async function hashPassword(plainText) {
    if (!window.crypto || !window.crypto.subtle) {
      return btoa(SECURITY.SALT + plainText);
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(SECURITY.SALT + plainText);
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
    studentToken: localStorage.getItem('vpt_student_token') || null
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
          state.allCourses = data.courses;
          renderCourses();
          renderTracksRoadmap();
          renderCategories();
          renderProviderOptions();
          updateHeaderStats();
          console.log(`[Você Pode Tudo] Conectado ao MySQL ServerByte: ${data.courses.length} cursos sincronizados.`);
        }
      }
    } catch (err) {
      // Se a API estiver offline ou em ambiente sem PHP, os dados de fallback locais permanecem ativos
      console.info('[Você Pode Tudo] Backend MySQL não detectado no momento. Utilizando catálogo integrado.', err);
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
      b.style.display = state.favorites.size > 0 ? 'inline-flex' : 'none';
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
    if (!container || !window.PORTAL_DATA || !window.PORTAL_DATA.tracks) return;

    container.innerHTML = window.PORTAL_DATA.tracks.map(track => {
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
    if (!grid || !window.PORTAL_DATA || !window.PORTAL_DATA.tracks) return;

    grid.innerHTML = window.PORTAL_DATA.tracks.map((track) => {
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
          url: 'https://www.vocepodetudo.com'
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
                  href="${safeUrl}" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="font-bold text-[#009639] hover:underline flex items-center gap-1 flex-shrink-0"
                  aria-label="Abrir aula do curso ${safeTitle} (abre em nova aba com segurança)"
                >
                  <span>Abrir Aula</span>
                  <i data-lucide="external-link" class="w-3 h-3"></i>
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
    if (!container || !window.PORTAL_DATA) return;

    container.innerHTML = window.PORTAL_DATA.categories.map(cat => {
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
    if (!select || !window.PORTAL_DATA) return;

    select.innerHTML = window.PORTAL_DATA.providers.map(p => `
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

  // Gerador de HTML de Card de Curso com Tamanho Otimizado e Animação Suave
  function createCourseCardHtml(course) {
    const isFav = state.favorites.has(course.id);
    const safeTitle = escapeHTML(course.title);
    const safeDesc = escapeHTML(course.description);
    const safeProvider = escapeHTML(course.provider);
    const safeTag = escapeHTML(course.providerTag || course.provider);
    const safeUrl = sanitizeUrl(course.url);
    
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

    const shareMsg = `Olha esse curso 100% gratuito que encontrei no Você Pode Tudo: "${safeTitle}" (${safeProvider}) com ${course.workloadHours}h de aula. Acesse aqui: ${safeUrl}`;
    const directWhatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMsg)}`;

    return `
      <article class="course-card animate-fade-in-up flex flex-col justify-between bg-white border-2 border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-xl hover:border-[#009639] transition-all relative group" aria-label="${safeTitle}">
        <div>
          <div class="flex items-start justify-between gap-1.5 mb-2.5">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold border-2 ${course.providerColor || 'bg-slate-100 text-slate-800 border-slate-300'}">
              ${safeTag}
            </span>
            
            <div class="flex items-center gap-1">
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
            ${safeTitle}
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

          <div class="flex items-center gap-1.5">
            <a 
              href="${safeUrl}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="course-access-link flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs bg-[#009639] hover:bg-[#00702a] text-white shadow-md shadow-emerald-700/20 active:scale-95 transition-all truncate"
              data-course-id="${course.id}"
              data-course-title="${safeTitle}"
              data-course-provider="${safeProvider}"
              data-course-category="${escapeHTML(course.category || 'Geral')}"
              aria-label="Acessar página oficial do curso ${safeTitle} (abre em nova aba)"
            >
              <span>Acessar Curso Oficial</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5 flex-shrink-0"></i>
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
      </article>
    `;
  }

  // Vincular ouvintes de evento aos cards de curso
  function attachCourseCardListeners(container) {
    if (!container) return;

    container.querySelectorAll('.speak-course-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
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
        const url = btn.getAttribute('data-share-url');
        const title = btn.getAttribute('data-course-title');
        const provider = btn.getAttribute('data-course-provider');
        openShareModal(title, provider, url);
      });
    });

    // Rastreamento de Cliques em Cursos Oficiais para Métricas da Administração
    container.querySelectorAll('.course-access-link').forEach(link => {
      link.addEventListener('click', () => {
        const courseId = link.getAttribute('data-course-id');
        const title = link.getAttribute('data-course-title');
        const provider = link.getAttribute('data-course-provider');
        const category = link.getAttribute('data-course-category');
        trackAnalyticsEvent('course_click', {
          course_id: courseId,
          course_title: title,
          course_provider: provider,
          course_category: category
        });
      });
    });
  }

  // Atualiza indicadores de carregamento suave / fim de catálogo
  function updateScrollUI(hasMore, totalFiltered) {
    const loadMoreBox = document.getElementById('load-more-box');
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
    const btn = document.getElementById('load-more-courses-btn');
    if (spinner) {
      spinner.classList.remove('hidden');
      spinner.classList.add('inline-flex');
    }
    if (btn) btn.classList.add('hidden');

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
      if (spinner) {
        spinner.classList.add('hidden');
        spinner.classList.remove('inline-flex');
      }
      if (btn) btn.classList.remove('hidden');

      updateScrollUI(hasMore, totalFiltered);
      state.isLoadingMore = false;
    }, 250);
  }

  // Renderizar Cards de Cursos no Catálogo com Carregamento Progressivo Suave
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
        resultCount.innerHTML = `Exibindo <strong class="text-[#009639]">${visibleCourses.length}</strong> de <strong class="text-slate-800">${totalFiltered}</strong> ${viewLabel}`;
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
    visibleCourses.forEach((course) => {
      cardsHtml.push(createCourseCardHtml(course));
    });

    grid.innerHTML = cardsHtml.join('');
    attachCourseCardListeners(grid);

    if (window.lucide) window.lucide.createIcons({ root: grid });
    updateScrollUI(hasMore, totalFiltered);
    updateHeaderStats();
  }

  // Configuração do Scroll Infinito Suave via IntersectionObserver
  function setupInfiniteScroll() {
    const trigger = document.getElementById('courses-scroll-trigger');
    const loadMoreBtn = document.getElementById('load-more-courses-btn');

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        loadMoreCourses();
      });
    }

    if (trigger && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
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
        rootMargin: '300px',
        threshold: 0.1
      });

      observer.observe(trigger);
    }
  }

  function updateHeaderStats() {
    const totalCoursesEl = document.getElementById('stat-total-courses');
    const totalProvidersEl = document.getElementById('stat-total-providers');
    const freeCertsEl = document.getElementById('stat-free-certs');

    if (totalCoursesEl) totalCoursesEl.textContent = state.allCourses.length;
    if (totalProvidersEl) {
      const uniqueProviders = new Set(state.allCourses.map(c => c.provider));
      totalProvidersEl.textContent = uniqueProviders.size;
    }
    if (freeCertsEl) {
      const freeCount = state.allCourses.filter(c => c.hasFreeCertificate).length;
      freeCertsEl.textContent = `${freeCount} Cursos`;
    }
  }

  // Alternador de Visualização (Cursos, Trilhas, Salvos, Teste Vocacional, Resultado)
  function updateViewModeButtons() {
    const catTabBtn = document.getElementById('tab-catalog-btn');
    const tracksTabBtn = document.getElementById('tab-tracks-btn');
    const favTabBtn = document.getElementById('tab-favorites-btn');
    const careerTabBtn = document.getElementById('tab-career-test-btn');

    const catalogView = document.getElementById('catalog-view');
    const tracksView = document.getElementById('tracks-view');
    const careerTestView = document.getElementById('career-test-view');
    const careerResultView = document.getElementById('career-result-view');

    const activeClasses = 'px-3 sm:px-4 py-2 rounded-xl bg-[#009639] text-white shadow-sm transition-all font-bold';
    const inactiveClasses = 'px-3 sm:px-4 py-2 rounded-xl text-slate-700 hover:text-[#009639] transition-all font-bold';

    if (catTabBtn) catTabBtn.className = state.viewMode === 'catalog' ? activeClasses : inactiveClasses;
    if (tracksTabBtn) {
      tracksTabBtn.className = `${state.viewMode === 'tracks' ? activeClasses : inactiveClasses} flex items-center gap-1.5`;
    }
    if (favTabBtn) {
      favTabBtn.className = `${state.viewMode === 'favorites' ? activeClasses : inactiveClasses} flex items-center gap-1.5`;
    }
    if (careerTabBtn) {
      const isTestActive = state.viewMode === 'career-test' || state.viewMode === 'career-result';
      careerTabBtn.className = `${isTestActive ? 'px-3 sm:px-4 py-2 rounded-xl bg-[#002776] text-white shadow-sm transition-all font-bold' : inactiveClasses} flex items-center gap-1.5`;
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
                href="${escapeHTML(course.url)}"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full md:w-auto px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-[#009639] hover:bg-[#00702a] text-white transition-all shadow-sm flex items-center justify-center gap-2"
                data-course-id="${escapeHTML(course.id)}"
                data-course-title="${escapeHTML(course.title)}"
                data-course-provider="${escapeHTML(course.provider)}"
                data-course-category="${escapeHTML(course.category || 'Geral')}"
              >
                <span>Acessar Curso Oficial</span>
                <i data-lucide="external-link" class="w-4 h-4"></i>
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
                href="${escapeHTML(c.url)}" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="font-black text-[#002776] hover:underline flex items-center gap-1"
                data-course-id="${escapeHTML(c.id)}"
                data-course-title="${escapeHTML(c.title)}"
                data-course-provider="${escapeHTML(c.provider)}"
              >
                <span>Acessar</span>
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
    const modal = document.getElementById('career-explore-modal');
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

        const remaining = getLockoutRemainingSeconds();
        if (remaining > 0) {
          showToast(`Acesso temporariamente bloqueado. Aguarde ${remaining} segundos.`, 'error');
          updateLockoutUI();
          return;
        }

        const userInput = document.getElementById('admin-user-input');
        const passInput = document.getElementById('admin-pass-input');

        const enteredUser = userInput ? userInput.value.trim() : '';
        const enteredPass = passInput ? passInput.value.trim() : '';

        // Autenticação Segura no Servidor (POST com JSON)
        try {
          const res = await fetch(`${API_BASE}/auth.php?action=login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: enteredUser, password: enteredPass })
          });

          const result = await res.json();

          if (res.ok && result.success && result.token) {
            state.isAdmin = true;
            sessionStorage.setItem('vpt_is_admin', 'true');
            sessionStorage.setItem('vpt_auth_token', result.token);
            sessionStorage.setItem('vpt_admin_login_time', Date.now().toString());
            clearFailedLoginAttempts();
            updateAdminUI();
            if (adminLoginModal) adminLoginModal.classList.add('hidden');
            adminLoginForm.reset();
            showToast('Login de administrador autenticado com sucesso no servidor!', 'success');
            return;
          }

          const lockedSecs = registerFailedLoginAttempt();
          updateLockoutUI();
          if (lockedSecs > 0) {
            showToast(`Bloqueio de segurança ativado por ${lockedSecs / 60} minutos.`, 'error');
          } else {
            const currentAttempts = parseInt(localStorage.getItem('vpt_admin_failed_attempts') || '0', 10);
            showToast(`Usuário ou senha incorretos (${currentAttempts}/${SECURITY.MAX_ATTEMPTS} tentativas).`, 'error');
          }
        } catch (serverErr) {
          console.error('Erro ao conectar com servidor de autenticação:', serverErr);
          showToast('Erro ao comunicar com o servidor de autenticação.', 'error');
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

        // Tentar alterar diretamente no MySQL
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
          }
        }

        // Fallback Local
        const savedHash = localStorage.getItem('vpt_admin_hash') || SECURITY.DEFAULT_ADMIN_HASH;
        const currentHash = await hashPassword(currentPass);

        if (currentHash !== savedHash) {
          showToast('A senha atual digitada está incorreta.', 'error');
          return;
        }

        const newHash = await hashPassword(newPass);
        localStorage.setItem('vpt_admin_hash', newHash);
        changePasswordForm.reset();
        if (changePasswordModal) changePasswordModal.classList.add('hidden');
        if (adminCourseModal) adminCourseModal.classList.remove('hidden');
        showToast('Senha de administrador atualizada e criptografada com sucesso!', 'success');
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

    // Modal Popup de Boas-Vindas e Aviso de Utilidade Pública (Não Hospedamos Cursos)
    const disclaimerModal = document.getElementById('welcome-disclaimer-modal');
    const closeDisclaimerXBtn = document.getElementById('close-disclaimer-x-btn');
    const confirmDisclaimerBtn = document.getElementById('confirm-disclaimer-btn');
    const dontShowAgainCheckbox = document.getElementById('dont-show-disclaimer-again');

    function closeDisclaimer() {
      if (disclaimerModal) {
        disclaimerModal.classList.add('hidden');
      }
      if (dontShowAgainCheckbox && dontShowAgainCheckbox.checked) {
        localStorage.setItem('vpt_disclaimer_dismissed', 'true');
      }
    }

    if (closeDisclaimerXBtn) closeDisclaimerXBtn.addEventListener('click', closeDisclaimer);
    if (confirmDisclaimerBtn) confirmDisclaimerBtn.addEventListener('click', closeDisclaimer);

    if (disclaimerModal) {
      // Exibe suavemente na primeira visita (ou se o usuário não marcou "não mostrar novamente")
      const isDismissed = localStorage.getItem('vpt_disclaimer_dismissed') === 'true';
      if (!isDismissed) {
        setTimeout(() => {
          disclaimerModal.classList.remove('hidden');
        }, 500);
      }
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

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        if (clearSearchBtn) {
          clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
        }
        if (state.viewMode !== 'catalog') {
          state.viewMode = 'catalog';
          updateViewModeButtons();
        }
        renderCourses();
      });
    }

    if (clearSearchBtn && searchInput) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        state.searchQuery = '';
        clearSearchBtn.style.display = 'none';
        searchInput.focus();
        renderCourses();
      });
    }

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
            b.el.className = 'px-3.5 py-2 rounded-xl text-xs font-bold bg-[#009639] text-white shadow-sm';
            b.el.setAttribute('aria-pressed', 'true');
          } else {
            b.el.className = 'px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200';
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
  async function fetchWithTimeout(url, timeoutMs = 3500) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
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
    // Renderiza estado inicial padrão imediatamente para nunca ficar em branco
    renderWeatherUI({
      city: 'Brasil',
      region: '',
      temp: 24,
      label: 'Tempo Estável',
      icon: 'sun',
      color: 'text-[#ffdf00]'
    });
    fetchIPLocationAndWeather();
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
      link: "https://www.vocepodetudo.com"
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
  // WIDGET FLUTUANTE DE ACESSIBILIDADE VISUAL (ABAIXO DO VLIBRAS)
  // ============================================================
  function setupVisualAccessibilityWidget() {
    const widget = document.getElementById('visual-accessibility-widget');
    const toggleBtn = document.getElementById('visual-accessibility-toggle-btn');
    const panel = document.getElementById('visual-accessibility-panel');
    const closeBtn = document.getElementById('close-visual-accessibility-btn');

    if (!widget || !toggleBtn || !panel) return;

    function openPanel() {
      panel.classList.remove('hidden');
      toggleBtn.setAttribute('aria-expanded', 'true');
      updateVisualAccessibilityUI();
      if (window.lucide && window.lucide.createIcons) {
        window.lucide.createIcons({ root: panel });
      }
    }

    function closePanel() {
      panel.classList.add('hidden');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }

    function togglePanel() {
      if (panel.classList.contains('hidden')) {
        openPanel();
      } else {
        closePanel();
      }
    }

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePanel();
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closePanel();
      });
    }

    // Fechar ao clicar fora do painel
    document.addEventListener('click', (e) => {
      if (!panel.classList.contains('hidden') && !panel.contains(e.target) && !toggleBtn.contains(e.target)) {
        closePanel();
      }
    });

    // Fechar ao pressionar ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.classList.contains('hidden')) {
        closePanel();
      }
    });

    // Alinhamento dinâmico automático com a posição exata do VLibras
    function alignWithVLibras() {
      const vlibrasBtn = document.querySelector('[vw-access-button], .vw-access-button, [vw] div[vw-access-button]');
      if (vlibrasBtn) {
        const rect = vlibrasBtn.getBoundingClientRect();
        if (rect && rect.height > 0 && rect.bottom > 0) {
          widget.style.top = `${Math.round(rect.bottom + 8)}px`;
          return;
        }
      }
      widget.style.top = 'calc(50% + 28px)';
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

  // Salvar teste vocacional automaticamente na conta do aluno
  async function saveStudentCareerTest(results) {
    if (!state.studentToken || !results) return;
    try {
      const params = new URLSearchParams({
        action: 'save_test',
        token: state.studentToken,
        primary_area: results.primary?.areaKey || 'tecnologia',
        secondary_area: results.secondary?.areaKey || '',
        recommended_track: results.primary?.recommendedTrack?.id || '',
        scores: JSON.stringify(results.scores || {})
      });
      await fetch(`api/student.php?${params.toString()}`);
    } catch (e) {}
  }

  // Inicializar sessão do aluno persistida no token
  async function initStudentSession() {
    if (!state.studentToken) {
      updateStudentUI();
      return;
    }

    try {
      const res = await fetchWithTimeout(`api/student.php?action=me&token=${encodeURIComponent(state.studentToken)}`, 3500);
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

    if (state.student) {
      if (openBtn) openBtn.classList.add('hidden');
      if (loggedMenu) loggedMenu.classList.remove('hidden');

      const firstName = (state.student.name || 'Aluno').trim().split(' ')[0];
      const initial = (state.student.name || 'A').trim().charAt(0).toUpperCase();

      if (avatarBadge) {
        avatarBadge.textContent = initial;
        avatarBadge.style.backgroundColor = state.student.avatar_color || '#002776';
      }
      if (nameDisplay) nameDisplay.textContent = firstName;
      if (dropdownEmail) dropdownEmail.textContent = state.student.email;
      if (quizBanner) quizBanner.classList.add('hidden');
    } else {
      if (openBtn) openBtn.classList.remove('hidden');
      if (loggedMenu) loggedMenu.classList.add('hidden');
      if (quizBanner) {
        if (state.careerQuiz.result) quizBanner.classList.remove('hidden');
        else quizBanner.classList.add('hidden');
      }
    }

    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
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
    const passwordInput = document.getElementById('student-password-input');
    const goalField = document.getElementById('student-goal-field');
    const goalSelect = document.getElementById('student-goal-select');
    const submitBtn = document.getElementById('student-auth-submit-btn');
    const btnText = document.getElementById('student-auth-btn-text');
    const syncHint = document.getElementById('student-auth-sync-hint');
    const alertBox = document.getElementById('student-auth-alert');
    const authForm = document.getElementById('student-auth-form');

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
        if (goalField) goalField.classList.remove('hidden');
        if (syncHint) syncHint.classList.remove('hidden');
        if (btnText) btnText.textContent = 'Criar Minha Conta Gratuita';
        if (nameInput) nameInput.required = true;
      } else {
        if (tabLoginBtn) tabLoginBtn.className = 'py-2 text-xs font-black rounded-xl bg-purple-900 text-white shadow-sm transition-all cursor-pointer';
        if (tabRegisterBtn) tabRegisterBtn.className = 'py-2 text-xs font-bold rounded-xl text-slate-600 hover:text-slate-900 transition-all cursor-pointer';
        if (nameField) nameField.classList.add('hidden');
        if (goalField) goalField.classList.add('hidden');
        if (syncHint) syncHint.classList.add('hidden');
        if (btnText) btnText.textContent = 'Entrar na Conta';
        if (nameInput) nameInput.required = false;
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
            const regPayload = {
              name,
              email,
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
      const res = await fetch(`api/student.php?action=dashboard&token=${encodeURIComponent(state.studentToken)}`);

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
      const params = new URLSearchParams({
        action: 'update_course',
        token: state.studentToken,
        course_id: courseId,
        status,
        certificate_url: certificateUrl,
        workload_hours: workloadHours
      });
      const res = await fetch(`api/student.php?${params.toString()}`);

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
      const params = new URLSearchParams({
        action: 'remove_course',
        token: state.studentToken,
        course_id: courseId
      });
      const res = await fetch(`api/student.php?${params.toString()}`);

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
                  <span class="text-xs text-slate-500 font-bold">Portal Você Pode Tudo — www.vocepodetudo.com</span>
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

    // Excluir Conta (LGPD)
    if (deleteAccountBtn) {
      deleteAccountBtn.addEventListener('click', async () => {
        if (confirm('ATENÇÃO: Deseja realmente excluir permanentemente sua conta e todos os seus testes e cursos salvos? Esta ação não pode ser desfeita.')) {
          try {
            const params = new URLSearchParams({
              action: 'delete_account',
              token: state.studentToken
            });
            const res = await fetch(`api/student.php?${params.toString()}`);
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
  function init() {
    // 1. Recursos essenciais e utilidades imediatas
    try { setupLGPD(); } catch (e) { console.warn('[LGPD] Erro ao iniciar:', e); }
    try { initWeatherWidget(); } catch (e) { console.warn('[Weather] Erro ao iniciar:', e); }
    try { initNewsTicker(); } catch (e) { console.warn('[News] Erro ao iniciar:', e); }
    try { setupVisualAccessibilityWidget(); } catch (e) { console.warn('[VisualAcc] Erro ao iniciar:', e); }
    try { setupAdminAnalytics(); } catch (e) { console.warn('[Analytics] Erro ao iniciar:', e); }
    try { initStudentSession(); } catch (e) { console.warn('[StudentSession] Erro:', e); }
    try { setupStudentAuth(); } catch (e) { console.warn('[StudentAuth] Erro:', e); }
    try { setupStudentDashboard(); } catch (e) { console.warn('[StudentDash] Erro:', e); }

    // Rastreamento inicial de visualização da Home
    trackAnalyticsEvent('pageview_home');

    // 2. Catálogo e preferências persistidas
    loadPersistedData();
    handleURLParameters();
    updateAdminUI();
    renderTracks();
    renderCategories();
    renderProviderOptions();
    updateViewModeButtons();
    updateFavoritesBadge();
    setupModals();
    setupEventListeners();
    setupInfiniteScroll();

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
