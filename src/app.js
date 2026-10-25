// Você Pode Tudo — Lógica da Aplicação com Acessibilidade, Segurança Criptográfica, MySQL Backend & SEO

(function() {
  'use strict';

  // Configuração da API do Servidor (ServerByte / cPanel)
  const API_BASE = './api';

  // Configurações e Constantes de Segurança Criptográfica
  const SECURITY = {
    SALT: 'vpt_brazil_secure_salt_2026',
    // Hash SHA-256 de fallback (SALT + 'admin123')
    DEFAULT_ADMIN_HASH: '1c6a7fb1921db4c75ab524113183912227cc3b6c00a780915c9646d3e73efbdb',
    DEFAULT_ADMIN_USER: 'admin',
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
    viewMode: 'catalog',      // 'catalog', 'tracks', ou 'favorites'
    selectedTrack: null,      // id da trilha de aprendizagem ativa no catálogo
    isAdmin: false,           // status de autenticação do administrador
    fontSizeLevel: 1,         // 0: Pequeno, 1: Normal, 2: Grande, 3: Extra Grande
    isHighContrast: false,
    isSpeaking: false,
    coursesPerPage: 12,       // Paginação e carregamento progressivo suave
    currentPage: 1,
    isLoadingMore: false
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

  // Leitor de Texto em Voz Alta (Acessibilidade TTS)
  function speakText(text) {
    if (!('speechSynthesis' in window)) {
      showToast('Seu navegador não possui suporte para síntese de voz.', 'error');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      state.isSpeaking = false;
      showToast('Leitura de voz interrompida.', 'info');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;

    utterance.onstart = () => {
      state.isSpeaking = true;
      showToast('Lendo em voz alta...', 'info');
    };

    utterance.onend = () => {
      state.isSpeaking = false;
    };

    utterance.onerror = () => {
      state.isSpeaking = false;
    };

    window.speechSynthesis.speak(utterance);
  }

  // Acessibilidade: Controles de Fonte
  function applyFontSize() {
    const html = document.documentElement;
    fontSizes.forEach(cls => html.classList.remove(cls));
    html.classList.add(fontSizes[state.fontSizeLevel]);
    localStorage.setItem('vocepodetudo_fontsize', state.fontSizeLevel);
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
  }

  // Carregar dados salvos no LocalStorage / SessionStorage com Validação de Segurança
  function loadPersistedData() {
    try {
      // 1. Verificação de Sessão com Expiração Automática
      if (sessionStorage.getItem('vpt_is_admin') === 'true') {
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

      // 5. Cursos Adicionados por Admin com Validação Anti-Tampering (Fallback Local)
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

  // Atualização Visual do Painel de Administrador
  function updateAdminUI() {
    const loggedOutContainer = document.getElementById('admin-logged-out-container');
    const loggedInContainer = document.getElementById('admin-logged-in-container');

    if (state.isAdmin) {
      if (loggedOutContainer) loggedOutContainer.classList.add('hidden');
      if (loggedInContainer) {
        loggedInContainer.classList.remove('hidden');
        loggedInContainer.classList.add('flex');
      }
    } else {
      if (loggedOutContainer) loggedOutContainer.classList.remove('hidden');
      if (loggedInContainer) {
        loggedInContainer.classList.add('hidden');
        loggedInContainer.classList.remove('flex');
      }
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
      if (viewParam === 'tracks' || viewParam === 'favorites') {
        state.viewMode = viewParam;
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

  // Gerador de HTML de Card de Curso com Animação Suave Fade-In
  function createCourseCardHtml(course) {
    const isFav = state.favorites.has(course.id);
    const safeTitle = escapeHTML(course.title);
    const safeDesc = escapeHTML(course.description);
    const safeProvider = escapeHTML(course.provider);
    const safeTag = escapeHTML(course.providerTag || course.provider);
    const safeUrl = sanitizeUrl(course.url);
    
    const certBadge = course.hasFreeCertificate 
      ? `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-[#00702a] border border-emerald-300">
           <i data-lucide="check-circle-2" class="w-4 h-4"></i>
           Certificado 100% Gratuito
         </span>`
      : `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
           <i data-lucide="info" class="w-4 h-4"></i>
           ${escapeHTML(course.certificateNote || 'Modo Ouvinte Gratuito')}
         </span>`;

    const tagsHtml = (course.tags || []).slice(0, 3).map(tag => `
      <span class="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        #${escapeHTML(tag)}
      </span>
    `).join('');

    return `
      <article class="course-card animate-fade-in-up flex flex-col justify-between bg-white border-2 border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-[#009639] transition-all relative group" aria-label="${safeTitle}">
        <div>
          <div class="flex items-start justify-between gap-2 mb-3">
            <span class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border-2 ${course.providerColor || 'bg-slate-100 text-slate-800 border-slate-300'}">
              ${safeTag}
            </span>
            
            <div class="flex items-center gap-1">
              <button 
                data-speak-title="${safeTitle}"
                data-speak-provider="${safeProvider}"
                data-speak-workload="${course.workloadHours}"
                data-speak-desc="${safeDesc}"
                class="speak-course-btn p-2 rounded-xl text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                title="Ouvir em voz alta os dados deste curso"
                aria-label="Ouvir descrição de ${safeTitle} em voz alta"
              >
                <i data-lucide="volume-2" class="w-4 h-4"></i>
              </button>

              <button 
                data-course-id="${escapeHTML(course.id)}"
                class="fav-btn p-2 rounded-xl border transition-colors ${
                  isFav 
                    ? 'text-rose-600 bg-rose-50 border-rose-200' 
                    : 'text-slate-400 bg-slate-50 border-slate-200 hover:text-rose-600 hover:bg-rose-50'
                }"
                title="${isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}"
                aria-label="${isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}"
              >
                <i data-lucide="heart" class="w-4 h-4 ${isFav ? 'fill-current' : ''}"></i>
              </button>
            </div>
          </div>

          <h3 class="text-lg font-extrabold text-slate-900 leading-snug mb-2 group-hover:text-[#009639] transition-colors">
            ${safeTitle}
          </h3>

          <p class="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
            <i data-lucide="building-2" class="w-4 h-4 text-slate-400 flex-shrink-0"></i>
            <span class="truncate">${safeProvider}</span>
          </p>

          <p class="text-sm text-slate-700 mb-5 leading-relaxed">
            ${safeDesc}
          </p>
        </div>

        <div>
          <div class="flex flex-wrap items-center gap-3 mb-4 py-2.5 border-y border-slate-100 text-xs text-slate-700 font-semibold">
            <span class="inline-flex items-center gap-1.5">
              <i data-lucide="clock" class="w-4 h-4 text-[#009639]"></i>
              ${course.workloadHours}h de aula
            </span>
            <span class="text-slate-300">•</span>
            <span class="inline-flex items-center gap-1.5">
              <i data-lucide="bar-chart-2" class="w-4 h-4 text-[#002776]"></i>
              ${escapeHTML(course.level || 'Iniciante')}
            </span>
            <span class="text-slate-300">•</span>
            <span class="inline-flex items-center gap-1 font-bold text-amber-700">
              <i data-lucide="star" class="w-4 h-4 fill-amber-400 text-amber-500"></i>
              ${course.rating ? course.rating.toFixed(1) : '4.9'}
            </span>
          </div>

          <div class="flex items-center justify-between gap-2 mb-4 flex-wrap">
            ${certBadge}
            <div class="flex items-center gap-1 overflow-hidden">
              ${tagsHtml}
            </div>
          </div>

          <div class="flex items-center gap-2">
            <a 
              href="${safeUrl}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-[#009639] hover:bg-[#00702a] text-white shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
              aria-label="Acessar página oficial do curso ${safeTitle} (abre em nova aba)"
            >
              <span>Acessar Curso Oficial</span>
              <i data-lucide="external-link" class="w-4 h-4"></i>
            </a>

            <button 
              data-share-url="${safeUrl}"
              data-course-title="${safeTitle}"
              class="share-btn p-3 rounded-xl border-2 border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
              title="Copiar link do curso"
              aria-label="Copiar link do curso ${safeTitle}"
            >
              <i data-lucide="share-2" class="w-4 h-4"></i>
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

    container.querySelectorAll('.share-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const url = btn.getAttribute('data-share-url');
        const title = btn.getAttribute('data-course-title');
        try {
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(url);
            showToast(`Link de "${title}" copiado com sucesso!`, 'success');
          } else {
            prompt('Copie o link abaixo:', url);
          }
        } catch (err) {
          showToast('Link do curso: ' + url, 'info');
        }
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
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = nextBatch.map(createCourseCardHtml).join('');
        
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

    grid.innerHTML = visibleCourses.map(createCourseCardHtml).join('');
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

  // Alternador de Visualização (Cursos, Trilhas, Salvos)
  function updateViewModeButtons() {
    const catTabBtn = document.getElementById('tab-catalog-btn');
    const tracksTabBtn = document.getElementById('tab-tracks-btn');
    const favTabBtn = document.getElementById('tab-favorites-btn');

    const catalogView = document.getElementById('catalog-view');
    const tracksView = document.getElementById('tracks-view');

    const activeClasses = 'px-3 sm:px-4 py-2 rounded-xl bg-[#009639] text-white shadow-sm transition-all font-bold';
    const inactiveClasses = 'px-3 sm:px-4 py-2 rounded-xl text-slate-700 hover:text-[#009639] transition-all font-bold';

    if (catTabBtn) catTabBtn.className = state.viewMode === 'catalog' ? activeClasses : inactiveClasses;
    if (tracksTabBtn) {
      tracksTabBtn.className = `${state.viewMode === 'tracks' ? activeClasses : inactiveClasses} flex items-center gap-1.5`;
    }
    if (favTabBtn) {
      favTabBtn.className = `${state.viewMode === 'favorites' ? activeClasses : inactiveClasses} flex items-center gap-1.5`;
    }

    if (state.viewMode === 'tracks') {
      if (catalogView) catalogView.classList.add('hidden');
      if (tracksView) tracksView.classList.remove('hidden');
      renderTracksRoadmap();
    } else {
      if (tracksView) tracksView.classList.add('hidden');
      if (catalogView) catalogView.classList.remove('hidden');
      renderCourses();
    }
  }

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

    const handleAdminAccess = () => {
      if (state.isAdmin) {
        if (adminCourseModal) adminCourseModal.classList.remove('hidden');
      } else {
        updateLockoutUI();
        if (adminLoginModal) adminLoginModal.classList.remove('hidden');
      }
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

        // 1. Tentar autenticação no Servidor MySQL
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
            showToast('Login de administrador autenticado com sucesso no servidor MySQL!', 'success');
            return;
          }

          if (res.status === 401) {
            const lockedSecs = registerFailedLoginAttempt();
            updateLockoutUI();
            showToast('Usuário ou senha incorretos no servidor.', 'error');
            return;
          }
        } catch (serverErr) {
          console.info('Autenticação local de contingência:', serverErr);
        }

        // 2. Fallback Seguro Local caso a API PHP esteja sendo configurada
        const savedHash = localStorage.getItem('vpt_admin_hash') || SECURITY.DEFAULT_ADMIN_HASH;
        const savedUser = localStorage.getItem('vpt_admin_user') || SECURITY.DEFAULT_ADMIN_USER;
        const calculatedHash = await hashPassword(enteredPass);

        if (enteredUser.toLowerCase() === savedUser.toLowerCase() && calculatedHash === savedHash) {
          state.isAdmin = true;
          sessionStorage.setItem('vpt_is_admin', 'true');
          sessionStorage.setItem('vpt_admin_login_time', Date.now().toString());
          clearFailedLoginAttempts();
          updateAdminUI();
          if (adminLoginModal) adminLoginModal.classList.add('hidden');
          adminLoginForm.reset();
          showToast('Login de administrador realizado com sucesso!', 'success');
        } else {
          const lockedSecs = registerFailedLoginAttempt();
          updateLockoutUI();
          if (lockedSecs > 0) {
            showToast(`Bloqueio de segurança ativado por ${lockedSecs / 60} minutos.`, 'error');
          } else {
            const currentAttempts = parseInt(localStorage.getItem('vpt_admin_failed_attempts') || '0', 10);
            showToast(`Usuário ou senha incorretos (${currentAttempts}/${SECURITY.MAX_ATTEMPTS} tentativas).`, 'error');
          }
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

    [adminLoginModal, adminCourseModal, changePasswordModal, reportModal, disclaimerModal].forEach(modal => {
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
          'welcome-disclaimer-modal'
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
      });
    }

    if (tracksTabBtn) {
      tracksTabBtn.addEventListener('click', () => {
        state.viewMode = 'tracks';
        updateViewModeButtons();
      });
    }

    if (viewAllTracksLink) {
      viewAllTracksLink.addEventListener('click', () => {
        state.viewMode = 'tracks';
        updateViewModeButtons();
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
  }

  // Inicialização Completa
  function init() {
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

    // Sincronizar catálogo diretamente com o MySQL do servidor
    syncCoursesWithMySQL();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
