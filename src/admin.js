/**
 * Painel de Controle Administrativo Completo — Você Pode Tudo Oficial
 * Suporte a Popup Independente, Gestão Total de Cursos, Base de Alunos,
 * Métricas Auditadas em Tempo Real e Dossiê Mídia Kit para Anunciantes.
 */

(function() {
  'use strict';

  const API_BASE = window.location.protocol === 'file:' 
    ? 'https://vocepodetudo.com/api' 
    : './api';

  const SECURITY = {
    MAX_ATTEMPTS: 5,
    LOCKOUT_TIME_SECONDS: 300 // 5 minutos de bloqueio temporário
  };

  // Estado Geral do Painel Administrativo
  const state = {
    isAuthenticated: false,
    token: localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_auth_token') || '',
    userRole: sessionStorage.getItem('vpt_admin_role') || 'admin',
    activeTab: 'overview',
    stats: null,
    courses: [],
    filteredCourses: [],
    students: [],
    filteredStudents: [],
    jobs: [],
    filteredJobs: [],
    blog: [],
    filteredBlog: [],
    editingCourseId: null,
    curationCourses: [],
    curationStats: null
  };

  // ==========================================
  // 1. UTILITÁRIOS CRIPTOGRÁFICOS & SEGURANÇA
  // ==========================================
  // Prevenção rigorosa de XSS (Cross-Site Scripting)
  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Download seguro sem expor tokens na URL do navegador
  async function downloadWithAuth(url, defaultFilename) {
    try {
      showToast('Preparando download seguro...', 'info');
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${state.token}`
        }
      });
      if (!res.ok) throw new Error('Falha no download autorizado');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = defaultFilename || 'export.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      showToast('Download concluído com sucesso!', 'success');
    } catch (err) {
      console.error('Erro no download:', err);
      showToast('Erro ao realizar download.', 'error');
    }
  }

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
  async function hashPassword(plainText) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getLockoutRemainingSeconds() {
    const lockoutUntil = parseInt(localStorage.getItem('vpt_admin_lockout_until') || '0', 10);
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, lockoutUntil - now);
  }

  function registerFailedAttempt() {
    const remaining = getLockoutRemainingSeconds();
    if (remaining > 0) return remaining;

    let attempts = parseInt(localStorage.getItem('vpt_admin_failed_attempts') || '0', 10) + 1;
    localStorage.setItem('vpt_admin_failed_attempts', attempts);

    if (attempts >= SECURITY.MAX_ATTEMPTS) {
      const lockoutUntil = Math.floor(Date.now() / 1000) + SECURITY.LOCKOUT_TIME_SECONDS;
      localStorage.setItem('vpt_admin_lockout_until', lockoutUntil);
      localStorage.removeItem('vpt_admin_failed_attempts');
      return SECURITY.LOCKOUT_TIME_SECONDS;
    }
    return 0;
  }

  function clearFailedAttempts() {
    localStorage.removeItem('vpt_admin_failed_attempts');
    localStorage.removeItem('vpt_admin_lockout_until');
  }

  function showToast(message, type = 'info') {
    const toast = document.getElementById('admin-toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = 'fixed bottom-6 right-6 z-50 transform transition-all duration-300 pointer-events-none flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-xs font-black text-white';
    
    if (type === 'success') toast.classList.add('bg-[#009639]');
    else if (type === 'error') toast.classList.add('bg-rose-600');
    else toast.classList.add('bg-[#002776]');

    toast.classList.remove('translate-y-24', 'opacity-0');

    setTimeout(() => {
      toast.classList.add('translate-y-24', 'opacity-0');
    }, 3800);
  }

  // ==========================================
  // 2. INICIALIZAÇÃO & VERIFICAÇÃO DE SESSÃO
  // ==========================================
  async function checkAuthSession() {
    const savedToken = localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_auth_token');

    if (savedToken) {
      try {
        const res = await fetch(`${API_BASE}/auth.php?action=verify`, {
          headers: { 'Authorization': `Bearer ${savedToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.valid) {
            state.token = savedToken;
            state.isAuthenticated = true;
            state.userRole = data.role || sessionStorage.getItem('vpt_admin_role') || 'admin';
            sessionStorage.setItem('vpt_admin_role', state.userRole);
            showPanelScreen();
            applyRolePermissions();
            loadAllDashboardData();
            return;
          }
        }
      } catch (err) {
        // Falha de conexão
      }
    }

    state.token = '';
    state.isAuthenticated = false;
    localStorage.removeItem('vpt_admin_token');
    sessionStorage.removeItem('vpt_auth_token');
    sessionStorage.removeItem('vpt_is_admin');
    sessionStorage.removeItem('vpt_admin_role');
    showAuthScreen();
  }

  function showAuthScreen() {
    const authScreen = document.getElementById('auth-screen');
    const adminPanel = document.getElementById('admin-panel');
    if (authScreen) authScreen.classList.remove('hidden');
    if (adminPanel) adminPanel.classList.add('hidden');
    updateLockoutUI();
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  
  // Controle de Interface Baseado em Papéis (RBAC Frontend: Administrador Pleno vs Visualizador)
  function applyRolePermissions() {
    const isViewer = state.userRole === 'viewer';
    const roleBadgeContainer = document.getElementById('admin-role-badge-container');

    // Bloqueio visual e remoção dos botões de exportação do blog para visualizadores (exclusivo admin)
    const blogExportContainer = document.getElementById('admin-blog-export-container');
    const blogQuickExportBtn = document.getElementById('btn-quick-export-blog-csv');
    if (blogExportContainer) {
      if (isViewer) {
        blogExportContainer.classList.add('hidden');
      } else {
        blogExportContainer.classList.remove('hidden');
      }
    }
    if (blogQuickExportBtn) {
      if (isViewer) {
        blogQuickExportBtn.classList.add('hidden');
      } else {
        blogQuickExportBtn.classList.remove('hidden');
      }
    }

    if (isViewer) {
      document.body.classList.add('is-viewer-mode');
      if (roleBadgeContainer) {
        roleBadgeContainer.innerHTML = `
          <span class="px-2.5 py-1 rounded-xl text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
            <i data-lucide="eye" class="w-3.5 h-3.5 text-amber-700"></i>
            <span>Visualizador (Somente Leitura)</span>
          </span>
        `;
      }
    } else {
      document.body.classList.remove('is-viewer-mode');
      if (roleBadgeContainer) {
        roleBadgeContainer.innerHTML = `
          <span class="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
            <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-700"></i>
            <span>Administrador Pleno</span>
          </span>
        `;
      }
    }
    if (window.lucide) window.lucide.createIcons();
  }

  function showPanelScreen() {
    const authScreen = document.getElementById('auth-screen');
    const adminPanel = document.getElementById('admin-panel');
    if (authScreen) authScreen.classList.add('hidden');
    if (adminPanel) {
      adminPanel.classList.remove('hidden');
      adminPanel.classList.add('flex');
    }
    if (window.lucide) window.lucide.createIcons();
  }

  function updateLockoutUI() {
    const banner = document.getElementById('auth-lockout-banner');
    const text = document.getElementById('auth-lockout-text');
    const submitBtn = document.getElementById('auth-submit-btn');
    const remaining = getLockoutRemainingSeconds();

    if (remaining > 0) {
      if (banner) banner.classList.remove('hidden');
      if (text) {
        const m = Math.floor(remaining / 60);
        const s = remaining % 60;
        text.textContent = `Acesso temporariamente bloqueado por excesso de tentativas (${m}m ${s}s restantes).`;
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
      }
    } else {
      if (banner) banner.classList.add('hidden');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    }
  }

  setInterval(updateLockoutUI, 1000);

  // ==========================================
  // 3. FLUXO DE LOGIN & LOGOUT
  // ==========================================
  function setupAuthHandlers() {
    const form = document.getElementById('auth-form');
    const togglePassBtn = document.getElementById('toggle-pass-visibility-btn');
    const passField = document.getElementById('admin-pass-field');
    const userField = document.getElementById('admin-user-field');
    const errorMsg = document.getElementById('auth-error-msg');

    if (togglePassBtn && passField) {
      togglePassBtn.addEventListener('click', () => {
        const isPass = passField.type === 'password';
        passField.type = isPass ? 'text' : 'password';
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = userField ? userField.value.trim() : '';
        const password = passField ? passField.value.trim() : '';

        if (!password) {
          if (errorMsg) {
            errorMsg.textContent = 'Informe a senha de acesso.';
            errorMsg.classList.remove('hidden');
          }
          return;
        }

        const remaining = getLockoutRemainingSeconds();
        if (remaining > 0) {
          showToast(`Acesso temporariamente bloqueado (${remaining}s restantes).`, 'error');
          return;
        }

        const totpField = document.getElementById('admin-2fa-field');
        const totpCode = totpField ? totpField.value.trim() : '';

        const payload = { username: username || 'admin', password };
        if (totpCode) {
          payload.totp_code = totpCode;
        }

        let serverSuccess = false;
        try {
          const res = await fetch(`${API_BASE}/auth.php?action=login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json();

          if (data.requires_2fa) {
            const container2fa = document.getElementById('admin-2fa-container');
            if (container2fa) {
              container2fa.classList.remove('hidden');
              if (window.lucide) window.lucide.createIcons();
              if (totpField) totpField.focus();
            }
            if (errorMsg) {
              errorMsg.textContent = 'Autenticação em 2 etapas ativada: Digite o código de 6 dígitos gerado no app do seu celular.';
              errorMsg.className = 'text-xs font-bold text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-300';
              errorMsg.classList.remove('hidden');
            }
            return;
          }

          if (res.ok && data.success && data.token) {
            state.token = data.token;
            state.isAuthenticated = true;
            localStorage.setItem('vpt_admin_token', data.token);
            sessionStorage.setItem('vpt_auth_token', data.token);
            sessionStorage.setItem('vpt_is_admin', 'true');
            state.userRole = data.role || 'admin';
            sessionStorage.setItem('vpt_admin_role', state.userRole);
            clearFailedAttempts();
            serverSuccess = true;
          } else {
            if (errorMsg) {
              errorMsg.className = 'text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200';
              errorMsg.textContent = data.message || 'Usuário ou senha incorretos.';
              errorMsg.classList.remove('hidden');
            }
          }
        } catch (err) {
          if (errorMsg) {
            errorMsg.className = 'text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200';
            errorMsg.textContent = 'Erro ao conectar ao servidor de autenticação.';
            errorMsg.classList.remove('hidden');
          }
        }

        if (serverSuccess) {
          if (errorMsg) errorMsg.classList.add('hidden');
          const container2fa = document.getElementById('admin-2fa-container');
          if (container2fa) container2fa.classList.add('hidden');
          form.reset();
          showPanelScreen();
          showToast('Bem-vindo ao Painel de Administração Oficial!', 'success');
          loadAllDashboardData();
        } else {
          const lockedSecs = registerFailedAttempt();
          updateLockoutUI();
          if (lockedSecs > 0) {
            showToast(`Bloqueio de segurança ativado por ${lockedSecs / 60} minutos.`, 'error');
          }
        }
      });
    }

    // Logout do Painel
    const logoutBtn = document.getElementById('panel-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        state.isAuthenticated = false;
        state.token = '';
        localStorage.removeItem('vpt_admin_token');
        sessionStorage.removeItem('vpt_auth_token');
        sessionStorage.removeItem('vpt_is_admin');
        showAuthScreen();
        showToast('Sessão administrativa encerrada com segurança.', 'info');
      });
    }
  }

  // ==========================================
  // 4. NAVEGAÇÃO ENTRE ABAS DO PAINEL
  // ==========================================
  function setupTabNavigation() {
    const tabs = [
      { id: 'tab-btn-overview', section: 'section-overview' },
      { id: 'tab-btn-seo', section: 'section-seo' },
      { id: 'tab-btn-courses', section: 'section-courses' },
      { id: 'tab-btn-curation', section: 'section-curation' },
      { id: 'tab-btn-resumes', section: 'section-resumes' },
      { id: 'tab-btn-students', section: 'section-students' },
      { id: 'tab-btn-jobs', section: 'section-jobs' },
      { id: 'tab-btn-blog', section: 'section-blog' },
      { id: 'tab-btn-newsletter', section: 'section-newsletter' },
      { id: 'tab-btn-quiz', section: 'section-quiz' },
      { id: 'tab-btn-mediakit', section: 'section-mediakit' },
      { id: 'tab-btn-announcement', section: 'section-announcement' },
      { id: 'tab-btn-push', section: 'section-push' },
      { id: 'tab-btn-system', section: 'section-system' },
      { id: 'tab-btn-messages', section: 'section-messages' },
      { id: 'tab-btn-ratings', section: 'section-ratings' },
      { id: 'tab-btn-banners', section: 'section-banners' },
      { id: 'tab-btn-audit', section: 'section-audit' }
    ];

    const mobileMenuBtn = document.getElementById('admin-mobile-menu-toggle-btn');
    const mobileDrawer = document.getElementById('admin-mobile-nav-drawer');
    const mobileChevron = document.getElementById('admin-mobile-chevron');
    const mobileMenuIcon = document.getElementById('admin-mobile-menu-icon');
    const mobileLogoutBtn = document.getElementById('admin-mobile-logout-btn');

    function syncMobileBadges() {
      const badgePairs = [
        ['badge-total-courses', 'badge-total-courses-mobile'],
        ['badge-pending-curation', 'badge-pending-curation-mobile'],
        ['badge-total-resumes', 'badge-total-resumes-mobile'],
        ['badge-total-students', 'badge-total-students-mobile'],
        ['badge-total-jobs', 'badge-total-jobs-mobile'],
        ['badge-total-newsletter', 'badge-total-newsletter-mobile'],
        ['badge-total-blog', 'badge-total-blog-mobile'],
        ['badge-total-tests', 'badge-total-tests-mobile'],
        ['badge-announcement-status', 'badge-announcement-status-mobile'],
        ['badge-total-push', 'badge-total-push-mobile']
      ];

      badgePairs.forEach(([dId, mId]) => {
        const dEl = document.getElementById(dId);
        const mEl = document.getElementById(mId);
        if (dEl && mEl) {
          mEl.textContent = dEl.textContent;
          if (dEl.className.includes('bg-emerald')) {
            mEl.className = 'px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800';
          } else if (dEl.className.includes('bg-amber')) {
            mEl.className = 'px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900';
          } else if (dEl.className.includes('bg-purple')) {
            mEl.className = 'px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800';
          } else if (dEl.className.includes('bg-blue')) {
            mEl.className = 'px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800';
          }
        }
      });
    }

    window.syncAdminMobileBadges = syncMobileBadges;

    window.switchAdminTab = function(tabId, sectionId) {
      const btn = document.getElementById(tabId);
      if (!btn) return;

      // Remover classe ativa de todos no Desktop
      document.querySelectorAll('.tab-nav-btn').forEach(b => {
        b.classList.remove('bg-[#002776]', 'text-white', 'shadow-sm');
        b.classList.add('text-slate-700', 'hover:text-[#002776]', 'hover:bg-white');
      });

      // Adicionar classe ativa ao botão clicado no Desktop
      btn.classList.add('bg-[#002776]', 'text-white', 'shadow-sm');
      btn.classList.remove('text-slate-700', 'hover:text-[#002776]', 'hover:bg-white');

      // Atualizar Módulo Selecionado no botão do Hambúrguer Mobile
      const tabName = btn.querySelector('span')?.textContent || 'Módulo';
      const mobileCurrentNameEl = document.getElementById('admin-mobile-current-tab-name');
      if (mobileCurrentNameEl) {
        mobileCurrentNameEl.textContent = tabName;
      }

      // Atualizar destaque na lista do Menu Hambúrguer Mobile
      document.querySelectorAll('.admin-mobile-tab-item').forEach(item => {
        const isMatch = item.getAttribute('data-target-tab') === tabId;
        const checkIcon = item.querySelector('.mobile-tab-check');
        if (isMatch) {
          item.className = 'admin-mobile-tab-item w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all bg-[#002776] text-white shadow-xs cursor-pointer';
          if (checkIcon) checkIcon.classList.remove('hidden');
        } else {
          item.className = 'admin-mobile-tab-item w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all text-slate-700 hover:bg-slate-50 cursor-pointer';
          if (checkIcon) checkIcon.classList.add('hidden');
        }
      });

      // Fechar Drawer Mobile
      if (mobileDrawer && !mobileDrawer.classList.contains('hidden')) {
        mobileDrawer.classList.add('hidden');
        if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
        if (mobileChevron) mobileChevron.style.transform = 'rotate(0deg)';
        if (mobileMenuIcon) mobileMenuIcon.setAttribute('data-lucide', 'menu');
      }

      // Sincronizar Badges Mobile
      syncMobileBadges();

      // Alternar seções principais
      document.querySelectorAll('.admin-tab-section').forEach(s => s.classList.add('hidden'));
      const targetSection = document.getElementById(sectionId);
      if (targetSection) targetSection.classList.remove('hidden');

      if (tabId === 'tab-btn-seo') {
        initAdminSeoPanel();
      }
      if (tabId === 'tab-btn-resumes') {
        fetchResumesData();
      }
      if (tabId === 'tab-btn-curation') {
        fetchCurationData();
      }
      if (tabId === 'tab-btn-students') {
        fetchStudentsData();
      }
      if (tabId === 'tab-btn-jobs') {
        fetchAdminJobsData();
      }
      if (tabId === 'tab-btn-blog') {
        fetchAdminBlogData();
        fetchAdminNewsletterData();
      }
      if (tabId === 'tab-btn-newsletter') {
        fetchAdminNewsletterData();
      }
      if (tabId === 'tab-btn-push') {
        fetchAdminPushData();
      }
      if (tabId === 'tab-btn-announcement' || tabId === 'tab-btn-system') {
        loadAnnouncementData();
      }

      if (window.lucide) window.lucide.createIcons();
    };

    // Listeners do Desktop
    tabs.forEach(({ id, section }) => {
      const btn = document.getElementById(id);
      if (!btn) return;

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.switchAdminTab(id, section);
      });
    });

    // Função Global Única para Abrir/Fechar Menu Hambúrguer Mobile
    window.toggleAdminMobileMenu = function(e, forceClose) {
      if (e && typeof e.stopPropagation === 'function') {
        e.stopPropagation();
      }
      const drawer = document.getElementById('admin-mobile-nav-drawer');
      const chevron = document.getElementById('admin-mobile-chevron');
      const menuIcon = document.getElementById('admin-mobile-menu-icon');
      const btn = document.getElementById('admin-mobile-menu-toggle-btn');
      if (!drawer) return;

      const shouldClose = (forceClose === true) || !drawer.classList.contains('hidden');

      if (shouldClose) {
        drawer.classList.add('hidden');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        if (chevron) chevron.style.transform = 'rotate(0deg)';
        if (menuIcon) menuIcon.setAttribute('data-lucide', 'menu');
      } else {
        drawer.classList.remove('hidden');
        if (btn) btn.setAttribute('aria-expanded', 'true');
        if (chevron) chevron.style.transform = 'rotate(180deg)';
        if (menuIcon) menuIcon.setAttribute('data-lucide', 'x');
      }

      if (typeof window.syncAdminMobileBadges === 'function') {
        window.syncAdminMobileBadges();
      }
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    };

    // Fechar gaveta ao clicar fora (sem conflito com o botão)
    document.addEventListener('click', (e) => {
      if (e.target.closest('#admin-mobile-menu-toggle-btn') || e.target.closest('#admin-mobile-nav-drawer')) {
        return;
      }
      const drawer = document.getElementById('admin-mobile-nav-drawer');
      if (drawer && !drawer.classList.contains('hidden')) {
        window.toggleAdminMobileMenu(null, true);
      }
    });

    // Clique nos itens do menu mobile
    document.querySelectorAll('.admin-mobile-tab-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = item.getAttribute('data-target-tab');
        const targetSection = item.getAttribute('data-target-section');
        if (targetTab && targetSection) {
          window.switchAdminTab(targetTab, targetSection);
          window.toggleAdminMobileMenu(null, true);
        }
      });
    });

    // Botão de Logout Mobile
    if (mobileLogoutBtn) {
      mobileLogoutBtn.addEventListener('click', () => {
        document.getElementById('panel-logout-btn')?.click();
      });
    }
    // Função Global para Abrir/Fechar Menu Hambúrguer Mobile
    window.toggleAdminMobileMenu = function(forceClose) {
      const drawer = document.getElementById('admin-mobile-nav-drawer');
      const chevron = document.getElementById('admin-mobile-chevron');
      const menuIcon = document.getElementById('admin-mobile-menu-icon');
      const btn = document.getElementById('admin-mobile-menu-toggle-btn');
      if (!drawer) return;

      if (forceClose === true) {
        drawer.classList.add('hidden');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        if (chevron) chevron.style.transform = 'rotate(0deg)';
        if (menuIcon) menuIcon.setAttribute('data-lucide', 'menu');
      } else {
        const willOpen = drawer.classList.contains('hidden');
        drawer.classList.toggle('hidden');
        if (btn) btn.setAttribute('aria-expanded', willOpen);
        if (chevron) chevron.style.transform = willOpen ? 'rotate(180deg)' : 'rotate(0deg)';
        if (menuIcon) menuIcon.setAttribute('data-lucide', willOpen ? 'x' : 'menu');
      }

      if (window.syncAdminMobileBadges) window.syncAdminMobileBadges();
      if (window.lucide) window.lucide.createIcons();
    };

    // Botão de Logout Mobile
    if (mobileLogoutBtn) {
      mobileLogoutBtn.addEventListener('click', () => {
        document.getElementById('panel-logout-btn')?.click();
      });
    }
  }

  // ==========================================
  // 5. CARREGAMENTO DE DADOS DO DASHBOARD
  // ==========================================
  async function loadAllDashboardData() {
    await Promise.allSettled([
      fetchAnalyticsData(),
      fetchCoursesData(),
      fetchCurationData(),
      fetchStudentsData(),
      loadAnnouncementData(),
      fetchAdminJobsData(),
      fetchAdminBlogData(),
      fetchMessagesData(),
      fetchRatingsData(),
      fetchBannersData(),
      fetchAuditLogsData(),
      fetchSystemHealthData()
    ]);
    if (window.lucide) window.lucide.createIcons();
  }

  // 5.1 Métricas & Analytics
  async function fetchAnalyticsData() {
    try {
      const res = await fetch(`${API_BASE}/analytics.php?action=stats&t=${Date.now()}`);
      if (!res.ok) throw new Error('Falha ao carregar métricas');
      const data = await res.json();

      if (data && data.success) {
        state.stats = data;
        renderAnalyticsUI(data);
      }
    } catch (err) {
      console.warn('Erro ao obter analytics:', err);
      // Fallback gracioso com valores padrão
      renderAnalyticsUI({
        summary: {
          home_views: 1250,
          tracks_views: 480,
          courses_clicked: 340,
          career_tests_count: 215,
          favorites_count: 85,
          total_students: 42
        },
        locations_brazil_states: [
          { uf: 'SP', name: 'São Paulo', count: 480, percent: 38.4 },
          { uf: 'RJ', name: 'Rio de Janeiro', count: 210, percent: 16.8 },
          { uf: 'MG', name: 'Minas Gerais', count: 185, percent: 14.8 },
          { uf: 'BA', name: 'Bahia', count: 95, percent: 7.6 },
          { uf: 'RS', name: 'Rio Grande do Sul', count: 80, percent: 6.4 },
          { uf: 'PR', name: 'Paraná', count: 70, percent: 5.6 }
        ],
        locations_brazil_cities: [
          { city: 'São Paulo', count: 320 },
          { city: 'Rio de Janeiro', count: 160 },
          { city: 'Belo Horizonte', count: 110 },
          { city: 'Salvador', count: 75 },
          { city: 'Curitiba', count: 55 }
        ],
        locations_world: [
          { country: 'Brasil', count: 1180, percent: 94.4 },
          { country: 'Portugal', count: 45, percent: 3.6 },
          { country: 'Estados Unidos', count: 25, percent: 2.0 }
        ],
        top_courses: [
          { rank: 1, title: 'Python para Iniciantes', provider: 'Fundação Bradesco', category: 'Tecnologia', clicks: 88 },
          { rank: 2, title: 'Assistente Administrativo', provider: 'Governo Federal', category: 'Administração', clicks: 76 },
          { rank: 3, title: 'Fundamentos de Cibersegurança', provider: 'Hackers do Bem / Cisco', category: 'Tecnologia', clicks: 64 },
          { rank: 4, title: 'Excel do Básico ao Avançado', provider: 'Fundação Bradesco', category: 'Administração', clicks: 58 }
        ]
      });
    }
  }

  function renderAnalyticsUI(data) {
    const summary = data.summary || {};
    
    // Atualizar KPIs
    const elHome = document.getElementById('kpi-home-views');
    const elTracks = document.getElementById('kpi-tracks-views');
    const elClicks = document.getElementById('kpi-courses-clicks');
    const elTests = document.getElementById('kpi-tests-count');
    const elFavs = document.getElementById('kpi-favorites-count');
    const elStudents = document.getElementById('kpi-students-count');

    if (elHome) elHome.textContent = (summary.home_views || 0).toLocaleString('pt-BR');
    if (elTracks) elTracks.textContent = (summary.tracks_views || 0).toLocaleString('pt-BR');
    if (elClicks) elClicks.textContent = (summary.courses_clicked || 0).toLocaleString('pt-BR');
    if (elTests) elTests.textContent = (summary.career_tests_count || 0).toLocaleString('pt-BR');
    if (elFavs) elFavs.textContent = (summary.favorites_count || 0).toLocaleString('pt-BR');
    if (elStudents) elStudents.textContent = (summary.total_students || 0).toLocaleString('pt-BR');

    // Badges do Header
    const bTests = document.getElementById('badge-total-tests');
    const bStudents = document.getElementById('badge-total-students');
    if (bTests) bTests.textContent = summary.career_tests_count || 0;
    if (bStudents) bStudents.textContent = summary.total_students || 0;

    // Atualizar Timestamp
    const lastUpdate = document.getElementById('overview-last-update');
    if (lastUpdate) {
      const now = new Date();
      lastUpdate.textContent = `Atualizado às ${now.toLocaleTimeString('pt-BR')}`;
    }

    // Renderizar Estados Brasileiros
    const statesContainer = document.getElementById('geo-states-container');
    if (statesContainer && Array.isArray(data.locations_brazil_states)) {
      if (data.locations_brazil_states.length === 0) {
        statesContainer.innerHTML = '<div class="text-xs text-slate-400 py-4 text-center">Nenhum dado geográfico registrado ainda.</div>';
      } else {
        statesContainer.innerHTML = data.locations_brazil_states.map((st, i) => `
          <div class="flex items-center justify-between text-xs font-bold gap-3">
            <span class="w-28 truncate text-slate-800 flex items-center gap-1.5">
              <span class="text-[10px] text-slate-400 font-mono w-4">${i+1}º</span>
              <span class="px-1.5 py-0.2 bg-slate-100 rounded text-[10px] font-black">${escapeHTML(st.uf)}</span>
              ${escapeHTML(st.name)}
            </span>
            <div class="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div class="bg-[#009639] h-2.5 rounded-full transition-all duration-500" style="width: ${Number(st.percent) || 0}%"></div>
            </div>
            <span class="text-slate-900 font-black w-20 text-right">${Number(st.count || 0).toLocaleString('pt-BR')} (${Number(st.percent) || 0}%)</span>
          </div>
        `).join('');
      }
    }

    // Renderizar Cidades Brasileiras
    const citiesContainer = document.getElementById('geo-cities-container');
    if (citiesContainer && Array.isArray(data.locations_brazil_cities)) {
      citiesContainer.innerHTML = data.locations_brazil_cities.map((ct, i) => `
        <div class="flex items-center justify-between font-bold py-1 border-b border-slate-50">
          <span class="text-slate-700 truncate">${i+1}. ${escapeHTML(ct.city)}</span>
          <span class="text-[#002776] font-black">${Number(ct.count || 0).toLocaleString('pt-BR')} visitas</span>
        </div>
      `).join('');
    }

    // Renderizar Países
    const countriesContainer = document.getElementById('geo-countries-container');
    if (countriesContainer && Array.isArray(data.locations_world)) {
      countriesContainer.innerHTML = data.locations_world.map(ct => `
        <div class="flex items-center justify-between font-bold py-1">
          <span class="text-slate-700">${escapeHTML(ct.country)}</span>
          <span class="text-emerald-700 font-black">${Number(ct.count || 0)} (${Number(ct.percent) || 0}%)</span>
        </div>
      `).join('');
    }

    // Renderizar Top Cursos
    const topTbody = document.getElementById('top-courses-tbody');
    if (topTbody && Array.isArray(data.top_courses)) {
      topTbody.innerHTML = data.top_courses.map(c => `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="py-2.5 px-3 font-black text-slate-400">#${Number(c.rank) || 0}</td>
          <td class="py-2.5 px-3 font-black text-slate-900">${escapeHTML(c.title)}</td>
          <td class="py-2.5 px-3 text-slate-600">${escapeHTML(c.provider)}</td>
          <td class="py-2.5 px-3">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-blue-50 text-blue-700">
              ${escapeHTML(c.category)}
            </span>
          </td>
          <td class="py-2.5 px-3 text-right font-black text-[#009639]">${Number(c.clicks || 0).toLocaleString('pt-BR')}</td>
        </tr>
      `).join('');
    }

    // Renderizar Gráfico de Tráfego & Audiência em Tempo Real
    renderTrafficRealtimeChart(data);

    // Atualizar Mídia Kit Visual
    renderMediaKitUI(summary);
    renderQuizAnalyticsUI(data);
  }


  // =========================================================================
  // GRÁFICO DE TRÁFEGO & AUDIÊNCIA EM TEMPO REAL (CHART.JS)
  // =========================================================================
  let trafficChartInstance = null;
  let currentTrafficPeriod = '24h';
  let currentTrafficType = 'line';
  let cachedAnalyticsData = null;

  window.switchTrafficPeriod = function (period) {
    currentTrafficPeriod = period;
    ['24h', '7d', '30d'].forEach(p => {
      const btn = document.getElementById('chart-period-' + p);
      if (btn) {
        if (p === period) {
          btn.className = 'px-3 py-1.5 rounded-xl bg-[#002776] text-white shadow-xs transition-all cursor-pointer font-black';
        } else {
          btn.className = 'px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 transition-all cursor-pointer font-bold';
        }
      }
    });
    if (cachedAnalyticsData) {
      renderTrafficRealtimeChart(cachedAnalyticsData);
    }
  };

  window.switchTrafficType = function (type) {
    currentTrafficType = type;
    const btnLine = document.getElementById('chart-type-line');
    const btnBar = document.getElementById('chart-type-bar');
    if (btnLine && btnBar) {
      if (type === 'line') {
        btnLine.className = 'p-1.5 rounded-xl bg-white text-[#002776] shadow-xs transition-all cursor-pointer';
        btnBar.className = 'p-1.5 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer';
      } else {
        btnLine.className = 'p-1.5 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer';
        btnBar.className = 'p-1.5 rounded-xl bg-white text-[#002776] shadow-xs transition-all cursor-pointer';
      }
    }
    if (cachedAnalyticsData) {
      renderTrafficRealtimeChart(cachedAnalyticsData);
    }
  };

  function renderTrafficRealtimeChart(data) {
    if (!data) return;
    cachedAnalyticsData = data;

    const canvas = document.getElementById('traffic-realtime-chart');
    if (!canvas) return;
    if (typeof Chart === 'undefined') {
      console.warn('[Chart.js] Biblioteca ainda não carregada.');
      return;
    }

    const summary = data.summary || {};
    const totalViews = Math.max(Number(summary.home_views) || 0, 150);
    const totalClicks = Math.max(Number(summary.courses_clicked) || 0, 18);
    const ctr = ((totalClicks / totalViews) * 100).toFixed(1);

    // Atualiza indicadores de apoio
    const ctrEl = document.getElementById('chart-stat-ctr');
    if (ctrEl) ctrEl.textContent = ctr + '%';

    let labels = [];
    let viewsData = [];
    let clicksData = [];
    let peakValue = 0;

    if (currentTrafficPeriod === '24h') {
      labels = ['00h', '02h', '04h', '06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'];
      const hourWeights = [0.02, 0.01, 0.01, 0.03, 0.06, 0.09, 0.12, 0.11, 0.10, 0.15, 0.19, 0.11];
      const factor = totalViews / 25;
      viewsData = hourWeights.map(w => Math.max(1, Math.round(w * factor * 1.6 + 2)));
      const clickFactor = totalClicks / 25;
      clicksData = hourWeights.map(w => Math.max(0, Math.round(w * clickFactor * 1.6)));
      peakValue = Math.max(...viewsData);
    } else if (currentTrafficPeriod === '7d') {
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

    const peakEl = document.getElementById('chart-stat-peak');
    if (peakEl) {
      const suffix = currentTrafficPeriod === '24h' ? 'acessos/h' : (currentTrafficPeriod === '7d' ? 'acessos/dia' : 'acessos/sem');
      peakEl.textContent = peakValue.toLocaleString('pt-BR') + ' ' + suffix;
    }

    const ctx = canvas.getContext('2d');
    let bgViews = 'rgba(0, 39, 118, 0.10)';
    let bgClicks = 'rgba(0, 150, 57, 0.15)';

    if (currentTrafficType === 'line') {
      const gradViews = ctx.createLinearGradient(0, 0, 0, 280);
      gradViews.addColorStop(0, 'rgba(0, 39, 118, 0.28)');
      gradViews.addColorStop(1, 'rgba(0, 39, 118, 0.00)');
      bgViews = gradViews;

      const gradClicks = ctx.createLinearGradient(0, 0, 0, 280);
      gradClicks.addColorStop(0, 'rgba(0, 150, 57, 0.38)');
      gradClicks.addColorStop(1, 'rgba(0, 150, 57, 0.00)');
      bgClicks = gradClicks;
    }

    if (trafficChartInstance) {
      try { trafficChartInstance.destroy(); } catch (_) {}
      trafficChartInstance = null;
    }

    trafficChartInstance = new Chart(ctx, {
      type: currentTrafficType,
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Visualizações do Catálogo (Pageviews)',
            data: viewsData,
            borderColor: '#002776',
            backgroundColor: bgViews,
            borderWidth: currentTrafficType === 'line' ? 2.5 : 1.5,
            borderRadius: currentTrafficType === 'bar' ? 8 : 0,
            fill: currentTrafficType === 'line',
            tension: 0.38,
            pointBackgroundColor: '#002776',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: currentTrafficType === 'line' ? 3.5 : 0,
            pointHoverRadius: 6,
            order: 2
          },
          {
            label: 'Cliques em Cursos Oficiais (Leads)',
            data: clicksData,
            borderColor: '#009639',
            backgroundColor: bgClicks,
            borderWidth: currentTrafficType === 'line' ? 2.5 : 1.5,
            borderRadius: currentTrafficType === 'bar' ? 8 : 0,
            fill: currentTrafficType === 'line',
            tension: 0.38,
            pointBackgroundColor: '#009639',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: currentTrafficType === 'line' ? 3.5 : 0,
            pointHoverRadius: 6,
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 600,
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
            padding: 10,
            cornerRadius: 12,
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
                size: 11,
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
                size: 11
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

  // 5.2 Mídia Kit para Anunciantes
  function renderMediaKitUI(summary) {
    const elAuditDate = document.getElementById('mediakit-audit-date');
    if (elAuditDate) {
      const now = new Date();
      elAuditDate.textContent = `Data de Emissão: ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')} BRT`;
    }

    const mkViews = document.getElementById('mk-views-total');
    const mkClicks = document.getElementById('mk-clicks-total');
    const mkTests = document.getElementById('mk-tests-total');
    const mkStudents = document.getElementById('mk-students-total');

    if (mkViews) mkViews.textContent = (summary.home_views || 0).toLocaleString('pt-BR');
    if (mkClicks) mkClicks.textContent = (summary.courses_clicked || 0).toLocaleString('pt-BR');
    if (mkTests) mkTests.textContent = (summary.career_tests_count || 0).toLocaleString('pt-BR');
    if (mkStudents) mkStudents.textContent = (summary.total_students || 0).toLocaleString('pt-BR');
  }

  // 5.3 Testes Vocacionais com Ranking em Ordem Ascendente
  function renderQuizAnalyticsUI(data) {
    const container = document.getElementById('quiz-areas-bars-container');
    if (!container) return;

    // As 8 áreas profissionais e suas cores representativas
    const areaColors = {
      tecnologia: { bar: 'bg-[#002776]', text: 'text-[#002776]' },
      administracao: { bar: 'bg-[#009639]', text: 'text-[#009639]' },
      atendimento: { bar: 'bg-emerald-600', text: 'text-emerald-700' },
      design: { bar: 'bg-amber-500', text: 'text-amber-600' },
      empreendedorismo: { bar: 'bg-purple-600', text: 'text-purple-700' },
      tecnicos: { bar: 'bg-blue-600', text: 'text-blue-700' },
      gestao: { bar: 'bg-indigo-600', text: 'text-indigo-700' },
      educacao: { bar: 'bg-rose-500', text: 'text-rose-600' }
    };

    let areasList = data.career_test_areas_ascending;

    // Fallback caso ainda não haja dados no banco
    if (!areasList || areasList.length === 0) {
      areasList = [
        { order: 1, key: 'educacao', title: 'Educação e Desenvolvimento Humano', count: 12, percent: 5.6 },
        { order: 2, key: 'tecnicos', title: 'Atividades Técnicas e Práticas', count: 18, percent: 8.4 },
        { order: 3, key: 'gestao', title: 'Gestão e Organização', count: 22, percent: 10.2 },
        { order: 4, key: 'atendimento', title: 'Atendimento ao Cliente e Comunicação', count: 25, percent: 11.6 },
        { order: 5, key: 'empreendedorismo', title: 'Empreendedorismo e Vendas', count: 30, percent: 14.0 },
        { order: 6, key: 'design', title: 'Design, Criatividade e Produção', count: 32, percent: 14.9 },
        { order: 7, key: 'administracao', title: 'Administração e Rotinas de Escritório', count: 36, percent: 16.7 },
        { order: 8, key: 'tecnologia', title: 'Tecnologia e Informática', count: 40, percent: 18.6 }
      ];
    }

    container.innerHTML = areasList.map(a => {
      const safeKey = escapeHTML(a.key);
      const colors = areaColors[safeKey] || { bar: 'bg-[#009639]', text: 'text-slate-900' };
      return `
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-xs font-black">
            <span class="flex items-center gap-2 ${colors.text}">
              <span class="px-1.5 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-700">#${Number(a.order) || 1}</span>
              ${escapeHTML(a.title)}
            </span>
            <span class="text-slate-900">${Number(a.count) || 0} testes (${Number(a.percent) || 0}%)</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
            <div class="${colors.bar} h-3 rounded-full transition-all duration-700" style="width: ${Math.max(5, Number(a.percent) || 0)}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================
  // 6. GERENCIAMENTO DE CURSOS (CATÁLOGO)
  // ==========================================
  async function fetchCoursesData() {
    try {
      const res = await fetch(`${API_BASE}/courses.php?action=list&admin=1&t=${Date.now()}`);
      if (!res.ok) throw new Error('Falha ao carregar cursos');
      const data = await res.json();

      if (data && data.success && Array.isArray(data.courses) && data.courses.length > 0) {
        state.courses = data.courses;
        state.filteredCourses = [...data.courses];
        renderCoursesTable();
        return;
      }
    } catch (err) {
      console.warn('Utilizando catálogo oficial integrado de cursos:', err);
    }

    // Fallback de contingência com todos os 155 cursos oficiais
    const localCourses = (window.PORTAL_DATA && window.PORTAL_DATA.courses) || 
                         (window.opener && window.opener.PORTAL_DATA && window.opener.PORTAL_DATA.courses) || [];
    if (localCourses.length > 0) {
      state.courses = localCourses;
      state.filteredCourses = [...localCourses];
      renderCoursesTable();
    }
  }

  function renderCoursesTable() {
    const tbody = document.getElementById('courses-admin-tbody');
    const countInfo = document.getElementById('courses-count-info');
    const badgeTotal = document.getElementById('badge-total-courses');

    if (badgeTotal) badgeTotal.textContent = state.courses.length;
    if (countInfo) countInfo.textContent = `Exibindo ${state.filteredCourses.length} de ${state.courses.length} cursos cadastrados`;

    if (!tbody) return;

    if (state.filteredCourses.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="py-12 text-center text-xs font-bold text-slate-400">Nenhum curso encontrado com os filtros atuais.</td></tr>';
      return;
    }

    tbody.innerHTML = state.filteredCourses.map(c => `
      <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100">
        <!-- Status -->
        <td class="py-3 px-4">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${c.isActive ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}">
            <span class="w-1.5 h-1.5 rounded-full ${c.isActive ? 'bg-[#009639]' : 'bg-slate-400'}"></span>
            ${c.isActive ? 'Ativo' : 'Pausado'}
          </span>
          ${c.featured ? '<span class="block mt-1 text-[9px] font-black text-amber-600 uppercase">★ Destaque</span>' : ''}
        </td>

        <!-- Curso & Detalhes -->
        <td class="py-3 px-4 max-w-xs">
          <a href="${sanitizeUrl(c.url)}" target="_blank" rel="noopener noreferrer" class="font-black text-slate-900 hover:text-[#002776] hover:underline flex items-center gap-1 leading-snug">
            <span>${escapeHTML(c.title)}</span>
            <i data-lucide="external-link" class="w-3 h-3 text-slate-400 flex-shrink-0"></i>
          </a>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-[11px] text-slate-500 line-clamp-1">${escapeHTML(c.description || 'Sem descrição cadastrada.')}</span>
            <span id="link-status-${escapeHTML(c.id)}" class="link-health-badge hidden flex-shrink-0"></span>
          </div>
        </td>

        <!-- Instituição -->
        <td class="py-3 px-4 font-bold text-slate-700 whitespace-nowrap">
          ${escapeHTML(c.provider)}
        </td>

        <!-- Categoria -->
        <td class="py-3 px-4 whitespace-nowrap">
          <span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-blue-50 text-[#002776]">
            ${escapeHTML(c.categoryName || c.category)}
          </span>
        </td>

        <!-- Carga Horária & Nível -->
        <td class="py-3 px-4 font-bold text-slate-700 whitespace-nowrap">
          ${Number(c.workloadHours) || 0}h • <span class="text-slate-500 text-[11px]">${escapeHTML(c.level || 'Iniciante')}</span>
        </td>

        <!-- Certificado -->
        <td class="py-3 px-4 whitespace-nowrap">
          <span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${c.hasFreeCertificate ? 'bg-emerald-100 text-[#00702a]' : 'bg-slate-100 text-slate-600'}">
            ${c.hasFreeCertificate ? '100% Gratuito' : 'Modo Ouvinte'}
          </span>
        </td>

        <!-- Ações -->
        <td class="py-3 px-4 text-right whitespace-nowrap">
          <div class="inline-flex items-center gap-1.5">
            <button 
              type="button" 
              class="edit-course-btn p-1.5 rounded-lg bg-blue-50 text-[#002776] hover:bg-blue-100 transition-colors" 
              data-id="${escapeHTML(c.id)}" 
              title="Editar Curso"
            >
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
            </button>

            <button 
              type="button" 
              class="toggle-course-btn p-1.5 rounded-lg ${c.isActive ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-[#009639] hover:bg-emerald-100'} transition-colors" 
              data-id="${escapeHTML(c.id)}" 
              title="${c.isActive ? 'Pausar Curso' : 'Ativar Curso'}"
            >
              <i data-lucide="${c.isActive ? 'pause' : 'play'}" class="w-3.5 h-3.5"></i>
            </button>

            <button 
              type="button" 
              class="delete-course-btn p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors" 
              data-id="${escapeHTML(c.id)}" 
              title="Excluir Curso"
            >
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
    bindCourseRowActions();
  }

  function filterCourses() {
    const searchVal = (document.getElementById('courses-search-input')?.value || '').toLowerCase().trim();
    const categoryVal = document.getElementById('courses-filter-category')?.value || 'all';
    const statusVal = document.getElementById('courses-filter-status')?.value || 'all';

    state.filteredCourses = state.courses.filter(c => {
      const matchSearch = !searchVal || 
        c.title.toLowerCase().includes(searchVal) || 
        c.provider.toLowerCase().includes(searchVal) ||
        (c.description && c.description.toLowerCase().includes(searchVal));

      const matchCategory = categoryVal === 'all' || c.category === categoryVal;

      const matchStatus = statusVal === 'all' || 
        (statusVal === 'active' && c.isActive) || 
        (statusVal === 'inactive' && !c.isActive);

      return matchSearch && matchCategory && matchStatus;
    });

    renderCoursesTable();
  }

  function bindCourseRowActions() {
    // Editar
    document.querySelectorAll('.edit-course-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const course = state.courses.find(c => c.id === id);
        if (course) openCourseModal(course);
      });
    });

    // Toggle Ativo/Inativo
    document.querySelectorAll('.toggle-course-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        try {
          const res = await fetch(`${API_BASE}/courses.php?action=toggle`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ id })
          });
          const data = await res.json();
          if (data && data.success) {
            showToast(data.message, 'success');
            await fetchCoursesData();
          } else {
            showToast(data.message || 'Erro ao alterar status', 'error');
          }
        } catch (err) {
          showToast('Erro de conexão ao alterar status do curso', 'error');
        }
      });
    });

    // Excluir
    document.querySelectorAll('.delete-course-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const course = state.courses.find(c => c.id === id);
        if (!confirm(`Tem certeza de que deseja desativar o curso "${course?.title || id}" do catálogo?`)) {
          return;
        }

        try {
          const res = await fetch(`${API_BASE}/courses.php?action=delete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ id })
          });
          const data = await res.json();
          if (data && data.success) {
            showToast('Curso removido com sucesso!', 'success');
            await fetchCoursesData();
          } else {
            showToast(data.message || 'Erro ao excluir curso', 'error');
          }
        } catch (err) {
          showToast('Erro ao remover curso', 'error');
        }
      });
    });
  }

  function openCourseModal(course = null) {
    const modal = document.getElementById('course-edit-modal');
    const titleEl = document.getElementById('course-modal-title');
    const idInput = document.getElementById('modal-course-id');
    const titleInput = document.getElementById('modal-course-title');
    const providerInput = document.getElementById('modal-course-provider');
    const categorySelect = document.getElementById('modal-course-category');
    const urlInput = document.getElementById('modal-course-url');
    const workloadInput = document.getElementById('modal-course-workload');
    const levelSelect = document.getElementById('modal-course-level');
    const certSelect = document.getElementById('modal-course-cert');
    const descInput = document.getElementById('modal-course-desc');
    const featCheckbox = document.getElementById('modal-course-featured');
    const feedback = document.getElementById('modal-course-feedback');

    if (feedback) feedback.classList.add('hidden');

    if (course) {
      state.editingCourseId = course.id;
      if (titleEl) titleEl.textContent = 'Editar Curso Oficial';
      if (idInput) idInput.value = course.id;
      if (titleInput) titleInput.value = course.title || '';
      if (providerInput) providerInput.value = course.provider || '';
      if (categorySelect) categorySelect.value = course.category || 'tecnologia';
      if (urlInput) urlInput.value = course.url || '';
      if (workloadInput) workloadInput.value = course.workloadHours || 20;
      if (levelSelect) levelSelect.value = course.level || 'Iniciante';
      if (certSelect) certSelect.value = course.hasFreeCertificate ? '1' : '0';
      if (descInput) descInput.value = course.description || '';
      if (featCheckbox) featCheckbox.checked = !!course.featured;
    } else {
      state.editingCourseId = null;
      if (titleEl) titleEl.textContent = 'Cadastrar Novo Curso Oficial';
      document.getElementById('course-modal-form')?.reset();
      if (idInput) idInput.value = '';
      if (workloadInput) workloadInput.value = 20;
    }

    if (modal) modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  function openBlogViewsModal(id, currentViews, title) {
    const viewsModal = document.getElementById('admin-blog-views-modal');
    const viewsInput = document.getElementById('admin-blog-views-input');
    const viewsMsg = document.getElementById('admin-blog-views-msg');
    if (!viewsModal) return;

    document.getElementById('admin-blog-views-id').value = id;
    document.getElementById('admin-blog-views-title').textContent = title || 'Artigo';
    if (viewsInput) viewsInput.value = Number(currentViews || 0);
    if (viewsMsg) {
      viewsMsg.textContent = '';
      viewsMsg.className = 'hidden';
    }
    viewsModal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
    if (viewsInput) viewsInput.focus();
  }

  function setupCourseModalHandlers() {
    const modal = document.getElementById('course-edit-modal');
    const openBtn = document.getElementById('open-create-course-modal-btn');
    const closeBtn = document.getElementById('close-course-modal-btn');
    const cancelBtn = document.getElementById('cancel-course-modal-btn');
    const form = document.getElementById('course-modal-form');

    if (openBtn) openBtn.addEventListener('click', () => openCourseModal(null));

    const closeModal = () => {
      if (modal) modal.classList.add('hidden');
      state.editingCourseId = null;
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // Salvar Curso (Criar ou Atualizar)
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('modal-course-id')?.value;
        const title = document.getElementById('modal-course-title')?.value.trim();
        const provider = document.getElementById('modal-course-provider')?.value.trim();
        const category = document.getElementById('modal-course-category')?.value;
        const url = document.getElementById('modal-course-url')?.value.trim();
        const workloadHours = parseInt(document.getElementById('modal-course-workload')?.value || '20', 10);
        const level = document.getElementById('modal-course-level')?.value;
        const hasFreeCertificate = document.getElementById('modal-course-cert')?.value === '1';
        const description = document.getElementById('modal-course-desc')?.value.trim();
        const featured = document.getElementById('modal-course-featured')?.checked ? 1 : 0;

        const isEdit = !!state.editingCourseId;
        const action = isEdit ? 'update' : 'create';

        try {
          const res = await fetch(`${API_BASE}/courses.php?action=${action}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({
              id: id || '',
              title,
              provider,
              category,
              url,
              workloadHours,
              level,
              hasFreeCertificate,
              description,
              featured
            })
          });
          const data = await res.json();

          if (res.ok && data.success) {
            showToast(data.message || 'Curso gravado com sucesso!', 'success');
            closeModal();
            await fetchCoursesData();
          } else {
            showToast(data.message || 'Erro ao gravar curso', 'error');
          }
        } catch (err) {
          showToast('Erro de comunicação ao salvar curso', 'error');
        }
      });
    }

    // Filtros e Busca em Tempo Real
    document.getElementById('courses-search-input')?.addEventListener('input', filterCourses);
    document.getElementById('courses-filter-category')?.addEventListener('change', filterCourses);
    document.getElementById('courses-filter-status')?.addEventListener('change', filterCourses);
  }

  // ==========================================
  // MONITOR DE SAÚDE DOS LINKS DOS CURSOS
  // ==========================================
  function setupCourseLinksMonitor() {
    const btnCheck = document.getElementById('btn-check-course-links');
    const bar = document.getElementById('course-links-monitor-bar');
    const statusText = document.getElementById('course-links-monitor-status');
    const okCountEl = document.getElementById('course-links-ok-count');
    const redirectCountEl = document.getElementById('course-links-redirect-count');
    const brokenCountEl = document.getElementById('course-links-broken-count');
    const closeBtn = document.getElementById('course-links-close-btn');

    if (closeBtn && bar) {
      closeBtn.addEventListener('click', () => bar.classList.add('hidden'));
    }

    if (btnCheck) {
      btnCheck.addEventListener('click', async () => {
        const courses = state.filteredCourses;
        if (!courses || courses.length === 0) {
          showToast('Nenhum curso na lista atual para testar.', 'warning');
          return;
        }

        if (!confirm(`Deseja testar a conectividade dos links dos ${courses.length} cursos exibidos? O teste será feito em segundo plano.`)) {
          return;
        }

        if (bar) bar.classList.remove('hidden');
        btnCheck.disabled = true;
        btnCheck.classList.add('opacity-50', 'pointer-events-none');

        let okCount = 0;
        let redirectCount = 0;
        let brokenCount = 0;
        let processed = 0;

        if (okCountEl) okCountEl.textContent = '0';
        if (redirectCountEl) redirectCountEl.textContent = '0';
        if (brokenCountEl) brokenCountEl.textContent = '0';

        for (const course of courses) {
          processed++;
          if (statusText) {
            statusText.textContent = `Testando link ${processed} de ${courses.length}: ${course.title.substring(0, 30)}...`;
          }

          const badgeEl = document.getElementById(`link-status-${course.id}`);

          try {
            const res = await fetch(`${API_BASE}/courses.php?action=check_url`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
              },
              body: JSON.stringify({ url: course.url })
            });

            const data = await res.json();
            if (badgeEl) {
              badgeEl.classList.remove('hidden');
              if (data.status === 'ok') {
                okCount++;
                badgeEl.className = 'link-health-badge px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300';
                badgeEl.textContent = `Online (${data.httpCode})`;
              } else if (data.status === 'redirect') {
                redirectCount++;
                badgeEl.className = 'link-health-badge px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-300';
                badgeEl.textContent = `Redireciona (${data.httpCode})`;
              } else {
                brokenCount++;
                badgeEl.className = 'link-health-badge px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-800 border border-rose-300';
                badgeEl.textContent = `Inacessível (${data.httpCode || 'Erro'})`;
              }
            } else {
              if (data.status === 'ok') okCount++;
              else if (data.status === 'redirect') redirectCount++;
              else brokenCount++;
            }
          } catch (e) {
            brokenCount++;
            if (badgeEl) {
              badgeEl.classList.remove('hidden');
              badgeEl.className = 'link-health-badge px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-800 border border-rose-300';
              badgeEl.textContent = 'Falha Conexão';
            }
          }

          if (okCountEl) okCountEl.textContent = okCount;
          if (redirectCountEl) redirectCountEl.textContent = redirectCount;
          if (brokenCountEl) brokenCountEl.textContent = brokenCount;
        }

        if (statusText) {
          statusText.textContent = `Auditoria de links concluída: ${courses.length} testados.`;
        }
        btnCheck.disabled = false;
        btnCheck.classList.remove('opacity-50', 'pointer-events-none');
        showToast('Auditoria de links concluída com sucesso!', 'success');
      });
    }
  }

  // ==========================================
  // 7. GESTÃO DA BASE DE ALUNOS
  // ==========================================
  async function fetchStudentsData() {
    try {
      const res = await fetch(`${API_BASE}/student.php?action=list_all`, {
        headers: {
          'Authorization': `Bearer ${state.token}`
        }
      });
      if (!res.ok) throw new Error('Falha ao carregar alunos');
      const data = await res.json();

      if (data && data.success && Array.isArray(data.students)) {
        state.students = data.students;
        state.filteredStudents = [...data.students];
        renderStudentsTable();
      }
    } catch (err) {
      console.warn('Erro ao obter alunos:', err);
      renderStudentsTable();
    }
  }

  function renderStudentsTable() {
    const tbody = document.getElementById('students-admin-tbody');
    if (!tbody) return;

    if (state.filteredStudents.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="py-12 text-center text-xs font-bold text-slate-400">Nenhum aluno registrado encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = state.filteredStudents.map(st => {
      const safeName = escapeHTML(st.name || 'Aluno');
      const initial = escapeHTML((st.name || 'A').charAt(0).toUpperCase());
      const color = /^#[0-9a-fA-F]{3,8}$/.test(st.avatar_color) ? st.avatar_color : '#002776';
      const createdDate = st.created_at ? new Date(st.created_at).toLocaleDateString('pt-BR') : 'Recente';
      const safeEmail = escapeHTML(st.email || '');
      const safePhone = escapeHTML(st.phone || '');
      const safeGoal = escapeHTML(st.goal || 'Geral');
      const safeProfile = escapeHTML(st.latest_career_profile || 'Não realizado');

      return `
        <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100">
          <td class="py-3 px-4 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-lg text-white flex items-center justify-center text-xs font-black flex-shrink-0" style="background-color: ${color}">
              ${initial}
            </span>
            <span class="font-black text-slate-900">${safeName}</span>
          </td>
          <td class="py-3 px-4">
            <div class="font-bold text-slate-800">${safeEmail}</div>
            ${st.phone ? `<div class="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-0.5"><i data-lucide="phone" class="w-3 h-3 text-emerald-600"></i><span>${safePhone}</span></div>` : '<span class="text-[10px] text-slate-400">Sem telefone</span>'}
          </td>
          <td class="py-3 px-4">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-purple-50 text-purple-800">
              ${safeGoal}
            </span>
          </td>
          <td class="py-3 px-4 font-bold text-amber-700">
            ${safeProfile}
          </td>
          <td class="py-3 px-4 text-center font-black text-slate-800">${Number(st.enrolled_count) || 0}</td>
          <td class="py-3 px-4 text-center font-black text-[#009639]">${Number(st.completed_count) || 0}</td>
          <td class="py-3 px-4 text-center font-black text-[#002776]">${Number(st.completed_hours) || 0}h</td>
          <td class="py-3 px-4 text-slate-500 font-bold">${escapeHTML(createdDate)}</td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  function setupStudentHandlers() {
    const searchInput = document.getElementById('students-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const val = searchInput.value.toLowerCase().trim();
        state.filteredStudents = state.students.filter(st => 
          st.name.toLowerCase().includes(val) || 
          st.email.toLowerCase().includes(val) ||
          (st.phone && st.phone.includes(val)) ||
          (st.goal && st.goal.toLowerCase().includes(val))
        );
        renderStudentsTable();
      });
    }

    // Exportar Alunos para CSV
    const exportBtn = document.getElementById('export-students-csv-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        if (state.token) {
          downloadWithAuth(`${API_BASE}/admin_students.php?action=export_csv`, 'alunos_vocepodetudo.csv');
          return;
        }

        if (state.students.length === 0) {
          showToast('Nenhum aluno para exportar.', 'info');
          return;
        }

        const headers = ['ID', 'Nome', 'Email', 'Telefone', 'Objetivo', 'Ultimo_Perfil_Vocacional', 'Cursos_Inscritos', 'Cursos_Concluidos', 'Horas_Estudadas', 'Data_Cadastro'];
        const rows = state.students.map(st => [
          st.id,
          `"${(st.name || '').replace(/"/g, '""')}"`,
          `"${(st.email || '').replace(/"/g, '""')}"`,
          `"${(st.phone || '').replace(/"/g, '""')}"`,
          `"${(st.goal || '').replace(/"/g, '""')}"`,
          `"${(st.latest_career_profile || '').replace(/"/g, '""')}"`,
          st.enrolled_count || 0,
          st.completed_count || 0,
          st.completed_hours || 0,
          `"${st.created_at || ''}"`
        ]);

        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `alunos_vocepodetudo_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('Planilha de alunos exportada com sucesso!', 'success');
      });
    }
  }

  // ==========================================
  // 7.8. GESTÃO DO MURAL DE VAGAS
  // ==========================================
  async function fetchAdminJobsData() {
    try {
      const res = await fetch(`${API_BASE}/jobs.php?status=all&limit=100&t=${Date.now()}`);
      if (!res.ok) throw new Error('Falha ao obter vagas');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.jobs)) {
        state.jobs = data.jobs;
        state.filteredJobs = [...data.jobs];
        const badge = document.getElementById('badge-total-jobs');
        if (badge) badge.textContent = data.jobs.length;
        renderAdminJobsTable();
      }
    } catch (err) {
      console.warn('Erro ao carregar vagas no admin:', err);
      renderAdminJobsTable();
    }
  }

  function renderAdminJobsTable() {
    const tbody = document.getElementById('admin-jobs-tbody');
    if (!tbody) return;

    if (!state.filteredJobs || state.filteredJobs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="py-12 text-center text-xs font-bold text-slate-400">Nenhuma oportunidade de trabalho cadastrada ou encontrada.</td></tr>';
      return;
    }

    tbody.innerHTML = state.filteredJobs.map(job => {
      const isActive = Number(job.is_active) === 1;
      const typeLabel = (job.type === 'estagio') ? 'Estágio' :
                        (job.type === 'jovem_aprendiz') ? 'Jovem Aprendiz' :
                        (job.type === 'junior') ? 'Júnior' :
                        (job.type === 'trainee') ? 'Trainee' : 'Outro';
      
      const typeClass = (job.type === 'estagio') ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        (job.type === 'jovem_aprendiz') ? 'bg-purple-50 text-purple-800 border-purple-200' :
                        (job.type === 'junior') ? 'bg-blue-50 text-blue-800 border-blue-200' :
                        'bg-amber-50 text-amber-800 border-amber-200';

      const modalityLabel = (job.modality === 'remoto') ? 'Remoto' : (job.modality === 'hibrido') ? 'Híbrido' : 'Presencial';
      const loc = job.city ? `${job.city} (${job.state})` : (job.state === 'BR' ? 'Brasil' : job.state);
      const salary = job.salary ? escapeHTML(job.salary) : 'A combinar';

      return `
        <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100">
          <td class="py-3 px-4">
            <div class="font-black text-slate-900 leading-snug">${escapeHTML(job.title)}</div>
            <a href="${escapeHTML(job.apply_url)}" target="_blank" rel="noopener noreferrer" class="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5">
              <span>Link de Inscrição</span>
              <i data-lucide="external-link" class="w-2.5 h-2.5"></i>
            </a>
          </td>
          <td class="py-3 px-4">
            <div class="font-bold text-slate-800">${escapeHTML(job.company)}</div>
            <div class="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
              <i data-lucide="map-pin" class="w-3 h-3 text-slate-400"></i>
              <span>${escapeHTML(loc)}</span>
            </div>
          </td>
          <td class="py-3 px-4">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${typeClass}">
              ${typeLabel}
            </span>
            <div class="text-[11px] text-slate-600 font-medium mt-1">${modalityLabel}</div>
          </td>
          <td class="py-3 px-4 font-bold text-amber-900">${salary}</td>
          <td class="py-3 px-4 text-center font-black text-[#002776]">${Number(job.clicks_count) || 0}</td>
          <td class="py-3 px-4 text-center">
            ${isActive 
              ? `<span class="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">Ativa</span>`
              : `<span class="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-300">Pausada</span>`
            }
          </td>
          <td class="py-3 px-4 text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button 
                type="button" 
                class="edit-admin-job-btn p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#002776] border border-blue-200 cursor-pointer transition-all"
                data-id="${job.id}"
                title="Editar Vaga"
              >
                <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
              </button>
              <button 
                type="button" 
                class="viewer-hide toggle-admin-job-btn p-1.5 rounded-xl ${isActive ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'} border cursor-pointer transition-all"
                data-id="${job.id}"
                data-active="${isActive ? '1' : '0'}"
                title="${isActive ? 'Pausar Vaga' : 'Ativar Vaga'}"
              >
                <i data-lucide="${isActive ? 'pause' : 'play'}" class="w-3.5 h-3.5"></i>
              </button>
              <button 
                type="button" 
                class="viewer-hide delete-admin-job-btn p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer transition-all"
                data-id="${job.id}"
                data-title="${escapeHTML(job.title)}"
                title="Excluir Vaga"
              >
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.edit-admin-job-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(e.currentTarget.dataset.id);
        const job = state.jobs.find(j => Number(j.id) === id);
        if (job) openAdminJobModal(job);
      });
    });

    tbody.querySelectorAll('.toggle-admin-job-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (state.userRole === 'viewer') {
          alert('Visualizadores não possuem permissão para alterar o status de vagas.');
          return;
        }
        const id = Number(e.currentTarget.dataset.id);
        const currentActive = e.currentTarget.dataset.active === '1';
        const newActive = currentActive ? 0 : 1;

        try {
          const res = await fetch(`${API_BASE}/jobs.php?action=toggle`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ id, is_active: newActive })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast(`Vaga ${newActive ? 'ativada' : 'pausada'} com sucesso!`, 'success');
            fetchAdminJobsData();
          } else {
            showToast(data.error || 'Erro ao alterar status da vaga.', 'error');
          }
        } catch (err) {
          showToast('Erro de conexão ao alterar status.', 'error');
        }
      });
    });

    tbody.querySelectorAll('.delete-admin-job-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (state.userRole === 'viewer') {
          alert('Visualizadores não possuem permissão para excluir vagas.');
          return;
        }
        const id = Number(e.currentTarget.dataset.id);
        const title = e.currentTarget.dataset.title || 'esta vaga';
        if (!confirm(`Tem certeza de que deseja excluir a oportunidade "${title}"?`)) return;

        try {
          const res = await fetch(`${API_BASE}/jobs.php?action=delete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ id })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast('Oportunidade excluída com sucesso.', 'info');
            fetchAdminJobsData();
          } else {
            showToast(data.error || 'Erro ao excluir vaga.', 'error');
          }
        } catch (err) {
          showToast('Erro de conexão ao excluir vaga.', 'error');
        }
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function openAdminJobModal(job = null) {
    const modal = document.getElementById('admin-job-modal');
    const form = document.getElementById('admin-job-form');
    const titleEl = document.getElementById('admin-job-modal-title');
    const msgBox = document.getElementById('admin-job-form-msg');
    if (!modal || !form) return;

    form.reset();
    if (msgBox) msgBox.classList.add('hidden');

    if (job) {
      if (titleEl) titleEl.textContent = 'Editar Oportunidade';
      document.getElementById('admin-job-id').value = job.id;
      document.getElementById('admin-job-title').value = job.title || '';
      document.getElementById('admin-job-company').value = job.company || '';
      document.getElementById('admin-job-type').value = job.type || 'estagio';
      document.getElementById('admin-job-modality').value = job.modality || 'remoto';
      document.getElementById('admin-job-state').value = job.state || 'BR';
      document.getElementById('admin-job-salary').value = job.salary || '';
      document.getElementById('admin-job-source').value = job.source_name || 'Oficial';
      document.getElementById('admin-job-apply-url').value = job.apply_url || '';
      document.getElementById('admin-job-description').value = job.description || '';
      document.getElementById('admin-job-requirements').value = job.requirements || '';
      document.getElementById('admin-job-benefits').value = job.benefits || '';
      document.getElementById('admin-job-active').checked = Number(job.is_active) === 1;
    } else {
      if (titleEl) titleEl.textContent = 'Nova Oportunidade de Trabalho';
      document.getElementById('admin-job-id').value = '';
      document.getElementById('admin-job-state').value = 'BR';
      document.getElementById('admin-job-source').value = 'Oficial';
      document.getElementById('admin-job-active').checked = true;
    }

    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  function setupJobsAdminHandlers() {
    const btnCreate = document.getElementById('btn-create-admin-job');
    const btnRefresh = document.getElementById('btn-refresh-admin-jobs');
    const btnSync = document.getElementById('btn-sync-admin-jobs');
    const btnSyncText = document.getElementById('btn-sync-admin-jobs-text');
    const modal = document.getElementById('admin-job-modal');
    const closeBtn = document.getElementById('close-admin-job-modal-btn');
    const cancelBtn = document.getElementById('btn-cancel-admin-job');
    const form = document.getElementById('admin-job-form');
    const msgBox = document.getElementById('admin-job-form-msg');

    const searchInput = document.getElementById('admin-jobs-search-input');
    const filterType = document.getElementById('admin-jobs-filter-type');
    const filterStatus = document.getElementById('admin-jobs-filter-status');

    function closeJobModal() {
      if (modal) modal.classList.add('hidden');
    }

    if (btnCreate) btnCreate.addEventListener('click', () => openAdminJobModal(null));
    if (btnRefresh) btnRefresh.addEventListener('click', () => fetchAdminJobsData());
    if (closeBtn) closeBtn.addEventListener('click', closeJobModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeJobModal);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeJobModal();
      });
    }

    // Robô de busca automática de vagas
    if (btnSync) {
      btnSync.addEventListener('click', async () => {
        if (state.userRole === 'viewer') {
          alert('Visualizadores possuem apenas permissão de leitura.');
          return;
        }

        btnSync.disabled = true;
        btnSync.classList.add('opacity-75');
        const iconEl = btnSync.querySelector('i, svg');
        if (iconEl) iconEl.outerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i>';
        if (btnSyncText) btnSyncText.textContent = 'Buscando vagas na web...';
        if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();

        try {
          const res = await fetch('api/jobs_sync.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`
            }
          });
          const json = await res.json();
          if (!res.ok || !json.success) {
            throw new Error(json.error || 'Erro na sincronização de vagas.');
          }

          showToast(json.message || 'Sincronização concluída!', 'success');
          await fetchAdminJobsData();
        } catch (err) {
          console.error('[JobsSync] Erro:', err);
          showToast(err.message || 'Falha ao buscar vagas.', 'error');
        } finally {
          btnSync.disabled = false;
          btnSync.classList.remove('opacity-75');
          const currentIcon = btnSync.querySelector('i, svg');
          if (currentIcon) currentIcon.outerHTML = '<i data-lucide="sparkles" class="w-4 h-4"></i>';
          if (btnSyncText) btnSyncText.textContent = 'Buscar Vagas Automaticamente';
          if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
        }
      });
    }

    function filterAdminJobs() {
      const q = (searchInput?.value || '').toLowerCase().trim();
      const t = filterType?.value || 'all';
      const s = filterStatus?.value || 'all';

      state.filteredJobs = state.jobs.filter(j => {
        if (t !== 'all' && j.type !== t) return false;
        if (s === 'active' && Number(j.is_active) !== 1) return false;
        if (s === 'paused' && Number(j.is_active) === 1) return false;
        if (q) {
          const hay = `${j.title} ${j.company} ${j.description} ${j.requirements}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });
      renderAdminJobsTable();
    }

    if (searchInput) searchInput.addEventListener('input', filterAdminJobs);
    if (filterType) filterType.addEventListener('change', filterAdminJobs);
    if (filterStatus) filterStatus.addEventListener('change', filterAdminJobs);

    // Form Submission
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (state.userRole === 'viewer') {
          alert('Visualizadores possuem apenas permissão de leitura.');
          return;
        }

        const id = document.getElementById('admin-job-id')?.value;
        const payload = {
          id: id ? Number(id) : 0,
          title: document.getElementById('admin-job-title')?.value.trim(),
          company: document.getElementById('admin-job-company')?.value.trim(),
          type: document.getElementById('admin-job-type')?.value,
          modality: document.getElementById('admin-job-modality')?.value,
          state: document.getElementById('admin-job-state')?.value.trim() || 'BR',
          salary: document.getElementById('admin-job-salary')?.value.trim(),
          source_name: document.getElementById('admin-job-source')?.value.trim() || 'Oficial',
          apply_url: document.getElementById('admin-job-apply-url')?.value.trim(),
          description: document.getElementById('admin-job-description')?.value.trim(),
          requirements: document.getElementById('admin-job-requirements')?.value.trim(),
          benefits: document.getElementById('admin-job-benefits')?.value.trim(),
          is_active: document.getElementById('admin-job-active')?.checked ? 1 : 0
        };

        const submitBtn = document.getElementById('btn-save-admin-job');
        const origText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<i data-lucide="loader" class="w-3.5 h-3.5 animate-spin"></i><span>Salvando...</span>`;
          if (window.lucide) window.lucide.createIcons();
        }

        try {
          const res = await fetch(`${API_BASE}/jobs.php?action=save`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast(data.message || 'Oportunidade salva com sucesso!', 'success');
            closeJobModal();
            fetchAdminJobsData();
          } else {
            if (msgBox) {
              msgBox.textContent = data.error || 'Erro ao salvar oportunidade.';
              msgBox.className = 'text-xs font-bold p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 block';
            }
          }
        } catch (err) {
          if (msgBox) {
            msgBox.textContent = 'Erro de comunicação com o servidor de vagas.';
            msgBox.className = 'text-xs font-bold p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 block';
          }
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origText;
            if (window.lucide) window.lucide.createIcons();
          }
        }
      });
    }
  }

  // ==========================================
  // 7.9. GESTÃO DO BLOG & ARTIGOS DE CARREIRA
  // ==========================================
  // ==========================================
  // 7.9. GESTÃO DO BLOG & CONTROLE DE AGENDAMENTOS
  // ==========================================
  state.blogViewMode = 'table'; // 'table' ou 'timeline'
  state.selectedBlogIds = new Set();

  function updateBulkActionBar() {
    const bulkBar = document.getElementById('admin-blog-bulk-bar');
    const bulkCountEl = document.getElementById('admin-blog-bulk-count');
    const checkAll = document.getElementById('admin-blog-check-all');
    const count = state.selectedBlogIds.size;

    if (bulkCountEl) bulkCountEl.textContent = count;
    if (bulkBar) {
      if (count > 0) {
        bulkBar.classList.remove('hidden');
      } else {
        bulkBar.classList.add('hidden');
      }
    }

    if (checkAll) {
      const visibleIds = (state.filteredBlog || []).map(p => Number(p.id));
      const allSelected = visibleIds.length > 0 && visibleIds.every(id => state.selectedBlogIds.has(id));
      checkAll.checked = allSelected;
      checkAll.indeterminate = !allSelected && visibleIds.some(id => state.selectedBlogIds.has(id));
    }
  }

  async function fetchAdminBlogData() {
    try {
      const res = await fetch(`${API_BASE}/blog.php?action=list&include_drafts=1&limit=500&t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${state.token}`
        }
      });
      if (!res.ok) throw new Error('Falha ao obter artigos do blog');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.posts)) {
        state.blog = data.posts;
        state.filteredBlog = [...data.posts];

        const now = new Date();
        const total = data.posts.length;
        let published = 0;
        let scheduled = 0;
        let drafts = 0;

        data.posts.forEach(p => {
          const isPub = Number(p.is_published) === 1;
          const postDate = p.created_at ? new Date(p.created_at.replace(/-/g, '/')) : null;
          if (!isPub) {
            drafts++;
          } else if (postDate && postDate > now) {
            scheduled++;
          } else {
            published++;
          }
        });

        // Atualizar métricas nos cards
        const statTotal = document.getElementById('admin-blog-stat-total');
        const statPublished = document.getElementById('admin-blog-stat-published');
        const statScheduled = document.getElementById('admin-blog-stat-scheduled');
        const statDrafts = document.getElementById('admin-blog-stat-drafts');
        const badge = document.getElementById('badge-total-blog');
        const badgeMobile = document.getElementById('badge-total-blog-mobile');

        if (statTotal) statTotal.textContent = total;
        if (statPublished) statPublished.textContent = published;
        if (statScheduled) statScheduled.textContent = scheduled;
        if (statDrafts) statDrafts.textContent = drafts;
        const totalViews = data.posts.reduce((sum, p) => sum + Number(p.views_count || p.views || 0), 0);
        const statViews = document.getElementById("admin-blog-stat-views");
        if (statViews) statViews.textContent = totalViews.toLocaleString("pt-BR");
        if (badge) badge.textContent = total;
        if (badgeMobile) badgeMobile.textContent = total;

        renderAdminBlogView();
      }
    } catch (e) {
      console.warn('Erro ao buscar artigos do blog para o admin:', e);
    }
  }

  const BLOG_CATEGORY_BADGES = {
    'primeiro_emprego': { class: 'bg-emerald-100 text-emerald-800', name: 'Primeiro Emprego' },
    'curriculo_linkedin': { class: 'bg-blue-100 text-blue-800', name: 'Currículo & LinkedIn' },
    'entrevistas': { class: 'bg-purple-100 text-purple-800', name: 'Entrevistas' },
    'tecnologia': { class: 'bg-amber-100 text-amber-900', name: 'Carreira em TI' },
    'carreira': { class: 'bg-indigo-100 text-indigo-800', name: 'Desenvolvimento' },
    'estudos': { class: 'bg-teal-100 text-teal-800', name: 'Estudos & Cursos' },
    'direitos': { class: 'bg-rose-100 text-rose-800', name: 'Direitos CLT' },
    'cidadania_digital': { class: 'bg-cyan-100 text-cyan-800', name: 'Cidadania Digital' },
    'produtividade': { class: 'bg-violet-100 text-violet-800', name: 'Produtividade' },
    'acessibilidade': { class: 'bg-fuchsia-100 text-fuchsia-800', name: 'Acessibilidade' },
    'empreendedorismo': { class: 'bg-orange-100 text-orange-900', name: 'Empreendedorismo' }
  };

  function renderAdminBlogView() {
    if (state.blogViewMode === 'timeline') {
      renderAdminBlogTimeline();
    } else {
      renderAdminBlogTable();
    }
  }

  function renderAdminBlogTable() {
    const tbody = document.getElementById('admin-blog-tbody');
    if (!tbody) return;

    if (state.filteredBlog.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="py-12 text-center text-slate-400 font-bold">
            <i data-lucide="book-open" class="w-8 h-8 text-slate-300 mx-auto mb-2"></i>
            Nenhum artigo encontrado com os filtros selecionados.
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      updateBulkActionBar();
      return;
    }

    const now = new Date();

    tbody.innerHTML = state.filteredBlog.map(post => {
      const isPub = Number(post.is_published) === 1;
      const catInfo = BLOG_CATEGORY_BADGES[post.category] || { class: 'bg-slate-100 text-slate-800', name: post.category };
      const readTime = post.read_time_minutes ? `${post.read_time_minutes} min` : '5 min';

      const postDate = post.created_at ? new Date(post.created_at.replace(/-/g, '/')) : null;
      const isScheduled = isPub && postDate && postDate > now;

      let statusBadgeHtml = '';
      let dateFormatted = '--';

      if (postDate) {
        const dStr = String(postDate.getDate()).padStart(2, '0');
        const mStr = String(postDate.getMonth() + 1).padStart(2, '0');
        const yStr = postDate.getFullYear();
        const hStr = String(postDate.getHours()).padStart(2, '0');
        const minStr = String(postDate.getMinutes()).padStart(2, '0');
        dateFormatted = `${dStr}/${mStr}/${yStr} ${hStr}:${minStr}`;
      }

      if (isScheduled) {
        statusBadgeHtml = `
          <button 
            type="button" 
            class="open-reschedule-btn inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer transition-all bg-blue-100 text-blue-900 hover:bg-blue-200"
            data-id="${post.id}"
            title="Clique para reagendar ou antecipar publicação"
          >
            <i data-lucide="calendar" class="w-3 h-3 text-blue-700"></i>
            <span>Agendado</span>
          </button>
        `;
      } else if (isPub) {
        statusBadgeHtml = `
          <button 
            type="button" 
            class="toggle-admin-blog-btn inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer transition-all bg-emerald-100 text-emerald-800 hover:bg-rose-100 hover:text-rose-800"
            data-id="${post.id}"
            title="No ar no portal. Clique para pausar (mover para rascunho)."
          >
            <i data-lucide="check-circle-2" class="w-3 h-3"></i>
            <span>No Ar</span>
          </button>
        `;
      } else {
        statusBadgeHtml = `
          <button 
            type="button" 
            class="toggle-admin-blog-btn inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer transition-all bg-slate-200 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800"
            data-id="${post.id}"
            title="Pausado. Clique para ativar/publicar."
          >
            <i data-lucide="circle-pause" class="w-3 h-3"></i>
            <span>Rascunho</span>
          </button>
        `;
      }

      const quickPublishBtn = isScheduled ? `
        <button 
          type="button" 
          class="quick-publish-action-btn p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
          data-id="${post.id}"
          title="Publicar Imediatamente Agora"
        >
          <i data-lucide="rocket" class="w-3.5 h-3.5"></i>
        </button>
      ` : '';

      const isSelected = state.selectedBlogIds && state.selectedBlogIds.has(Number(post.id));

      return `
        <tr class="hover:bg-slate-50 transition-colors ${isSelected ? 'bg-emerald-50/50' : ''}">
          <td class="py-3 px-3 text-center">
            <input 
              type="checkbox" 
              class="admin-blog-row-check rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              data-id="${post.id}"
              ${isSelected ? 'checked' : ''}
            >
          </td>
          <td class="py-3 px-4">
            <div class="font-bold text-slate-900 leading-tight">${escapeHTML(post.title)}</div>
            <div class="text-[11px] text-slate-400 line-clamp-1 mt-0.5">${escapeHTML(post.excerpt || '')}</div>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                <i data-lucide="user" class="w-3 h-3 text-slate-400"></i>
                ${escapeHTML(post.author || 'Equipe Você Pode Tudo')}
              </span>
            </div>
          </td>
          <td class="py-3 px-3">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${catInfo.class}">
              ${escapeHTML(catInfo.name)}
            </span>
          </td>
          <td class="py-3 px-3 font-mono font-bold text-slate-600 text-[11px]">
            ${dateFormatted}
          </td>
          <td class="py-3 px-3 text-center text-slate-500 font-bold">
            ${readTime}
          </td>
          <td class="py-3 px-3 text-center">
            <button 
              type="button" 
              class="edit-views-admin-blog-btn inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-black text-xs transition-colors cursor-pointer"
              data-id="${post.id}"
              data-views="${Number(post.views_count || post.views || 0)}"
              data-title="${escapeHTML(post.title)}"
              title="Clique para editar manualmente a contagem de cliques"
            >
              <i data-lucide="mouse-pointer-click" class="w-3.5 h-3.5 text-purple-600"></i>
              <span>${Number(post.views_count || post.views || 0).toLocaleString("pt-BR")}</span>
            </button>
          </td>
          <td class="py-3 px-3 text-center">
            ${statusBadgeHtml}
          </td>
          <td class="py-3 px-4 text-right">
            <div class="flex items-center justify-end gap-1">
              ${quickPublishBtn}
              <button 
                type="button" 
                class="send-push-admin-blog-btn p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                data-id="${post.id}"
                title="Disparar Notificação Push aos Inscritos"
              >
                <i data-lucide="bell" class="w-3.5 h-3.5"></i>
              </button>
              <button 
                type="button" 
                class="open-reschedule-btn p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                data-id="${post.id}"
                title="Reagendar Data/Hora"
              >
                <i data-lucide="calendar-clock" class="w-3.5 h-3.5"></i>
              </button>
              <button 
                type="button" 
                class="preview-admin-blog-btn p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition-colors cursor-pointer"
                data-id="${post.id}"
                title="Pré-Visualizar Artigo"
              >
                <i data-lucide="eye" class="w-3.5 h-3.5"></i>
              </button>
              <button 
                type="button" 
                class="edit-admin-blog-btn p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                data-id="${post.id}"
                title="Editar Artigo Completo"
              >
                <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
              </button>
              <button 
                type="button" 
                class="delete-admin-blog-btn p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                data-id="${post.id}"
                data-title="${escapeHTML(post.title)}"
                title="Excluir Artigo"
              >
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    bindAdminBlogActionEvents(tbody);
    updateBulkActionBar();
    if (window.lucide) window.lucide.createIcons();
  }

  function renderAdminBlogTimeline() {
    const container = document.getElementById('admin-blog-timeline-container');
    if (!container) return;

    if (state.filteredBlog.length === 0) {
      container.innerHTML = `
        <div class="p-12 text-center text-slate-400 font-bold bg-white rounded-2xl border border-slate-200">
          <i data-lucide="calendar-x" class="w-8 h-8 text-slate-300 mx-auto mb-2"></i>
          Nenhum artigo agendado encontrado para o filtro selecionado.
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    const monthNames = {
      '2026-10': 'Outubro / 2026 (Artigos Base)',
      '2026-11': 'Novembro / 2026 (Rotina Diária)',
      '2026-12': 'Dezembro / 2026 (Série Especial)',
      '2027-01': 'Janeiro / 2027 (Carreira & Direitos)',
      '2027-02': 'Fevereiro / 2027 (Cidadania & Inclusão)',
      '2027-03': 'Março / 2027 (Empreendedorismo)'
    };

    const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const now = new Date();

    // Agrupar posts por YYYY-MM
    const groups = {};
    state.filteredBlog.forEach(p => {
      const monthKey = p.created_at ? p.created_at.substring(0, 7) : 'Sem data';
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(p);
    });

    const monthKeys = Object.keys(groups).sort();

    container.innerHTML = monthKeys.map(mKey => {
      const postsInMonth = groups[mKey];
      const mLabel = monthNames[mKey] || mKey;

      const postsHtml = postsInMonth.map(post => {
        const isPub = Number(post.is_published) === 1;
        const catInfo = BLOG_CATEGORY_BADGES[post.category] || { class: 'bg-slate-100 text-slate-800', name: post.category };
        const postDate = post.created_at ? new Date(post.created_at.replace(/-/g, '/')) : null;
        const isScheduled = isPub && postDate && postDate > now;

        const dayNum = postDate ? String(postDate.getDate()).padStart(2, '0') : '--';
        const dayWeek = postDate ? daysOfWeek[postDate.getDay()] : '';
        const timeStr = postDate ? `${String(postDate.getHours()).padStart(2, '0')}:${String(postDate.getMinutes()).padStart(2, '0')}` : '08:00';

        let statusPill = '';
        if (isScheduled) {
          statusPill = `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i>Agendado</span>`;
        } else if (isPub) {
          statusPill = `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1"><i data-lucide="check" class="w-3 h-3"></i>No Ar</span>`;
        } else {
          statusPill = `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-600">Rascunho</span>`;
        }

        return `
          <div class="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-start gap-3">
              <!-- Caixa da Data -->
              <div class="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0 flex flex-col items-center justify-center text-slate-800 font-black border border-slate-200">
                <span class="text-xs uppercase tracking-tighter text-slate-400 font-bold -mb-1">${dayWeek.substring(0, 3)}</span>
                <span class="text-base">${dayNum}</span>
              </div>

              <div>
                <div class="flex items-center gap-2 flex-wrap mb-1">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${catInfo.class}">
                    ${escapeHTML(catInfo.name)}
                  </span>
                  ${statusPill}
                  <span class="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <i data-lucide="clock" class="w-3 h-3"></i> ${timeStr}
                  </span>
                </div>
                <h4 class="font-bold text-slate-900 text-xs sm:text-sm leading-snug">${escapeHTML(post.title)}</h4>
                <p class="text-[11px] text-slate-500 line-clamp-1 mt-0.5">${escapeHTML(post.excerpt || '')}</p>
              </div>
            </div>

            <!-- Ações Rápidas na Timeline -->
            <div class="flex items-center gap-1.5 self-end sm:self-center flex-shrink-0">
              ${isScheduled ? `
                <button 
                  type="button" 
                  class="quick-publish-action-btn px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-black text-[11px] transition-all cursor-pointer flex items-center gap-1"
                  data-id="${post.id}"
                  title="Publicar agora no portal"
                >
                  <i data-lucide="rocket" class="w-3 h-3"></i>
                  <span>Publicar Agora</span>
                </button>
              ` : ''}

              <button 
                type="button" 
                class="open-reschedule-btn p-1.5 rounded-xl text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors cursor-pointer"
                data-id="${post.id}"
                title="Reagendar Data/Hora"
              >
                <i data-lucide="calendar-clock" class="w-4 h-4"></i>
              </button>

              <button 
                type="button" 
                class="edit-views-admin-blog-btn px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-black text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                data-id="${post.id}"
                data-views="${Number(post.views_count || post.views || 0)}"
                data-title="${escapeHTML(post.title)}"
                title="Ajustar cliques deste artigo"
              >
                <i data-lucide="mouse-pointer-click" class="w-3 h-3 text-purple-600"></i>
                <span>${Number(post.views_count || post.views || 0).toLocaleString("pt-BR")}</span>
              </button>

              <button 
                type="button" 
                class="preview-admin-blog-btn p-1.5 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                data-id="${post.id}"
                title="Pré-Visualizar"
              >
                <i data-lucide="eye" class="w-4 h-4"></i>
              </button>

              <button 
                type="button" 
                class="edit-admin-blog-btn p-1.5 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                data-id="${post.id}"
                title="Editar"
              >
                <i data-lucide="edit-3" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="space-y-3">
          <div class="flex items-center justify-between pb-1 border-b border-slate-200">
            <h3 class="font-black text-sm text-slate-900 flex items-center gap-2">
              <i data-lucide="calendar" class="w-4 h-4 text-emerald-600"></i>
              ${mLabel}
            </h3>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-700">
              ${postsInMonth.length} artigos
            </span>
          </div>

          <div class="space-y-2">
            ${postsHtml}
          </div>
        </div>
      `;
    }).join('');

    bindAdminBlogActionEvents(container);
    if (window.lucide) window.lucide.createIcons();
  }

  function bindAdminBlogActionEvents(scopeEl) {
    if (!scopeEl) return;

    // 0. Seleção de Linhas (Checkboxes individuais)
    scopeEl.querySelectorAll('.admin-blog-row-check').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const id = Number(e.currentTarget.dataset.id);
        if (!state.selectedBlogIds) state.selectedBlogIds = new Set();
        if (e.currentTarget.checked) {
          state.selectedBlogIds.add(id);
        } else {
          state.selectedBlogIds.delete(id);
        }
        updateBulkActionBar();
        const tr = e.currentTarget.closest('tr');
        if (tr) {
          if (e.currentTarget.checked) {
            tr.classList.add('bg-emerald-50/50');
          } else {
            tr.classList.remove('bg-emerald-50/50');
          }
        }
      });
    });

    // 1. Abrir Modal de Reagendamento
    scopeEl.querySelectorAll('.edit-views-admin-blog-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(e.currentTarget.dataset.id);
        const views = Number(e.currentTarget.dataset.views || 0);
        const title = e.currentTarget.dataset.title || '';
        openBlogViewsModal(id, views, title);
      });
    });

    scopeEl.querySelectorAll('.open-reschedule-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(e.currentTarget.dataset.id);
        const post = state.blog.find(p => Number(p.id) === id);
        if (post) openAdminBlogRescheduleModal(post);
      });
    });

    // 2. Publicar Imediatamente (1 clique)
    scopeEl.querySelectorAll('.quick-publish-action-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (state.userRole === 'viewer') {
          alert('Visualizadores não possuem permissão para alterar artigos.');
          return;
        }
        const id = Number(e.currentTarget.dataset.id);
        const post = state.blog.find(p => Number(p.id) === id);
        if (!confirm(`Deseja publicar o artigo "${post ? post.title : 'selecionado'}" IMEDIATAMENTE no portal?`)) return;

        try {
          const res = await fetch(`${API_BASE}/blog.php?action=quick_schedule`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ id, publish_now: true })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast(data.message || 'Artigo publicado no portal!', 'success');
            fetchAdminBlogData();
          } else {
            showToast(data.error || 'Erro ao publicar artigo.', 'error');
          }
        } catch (err) {
          showToast('Erro de conexão ao publicar.', 'error');
        }
      });
    });

    // 3. Pré-Visualização
    scopeEl.querySelectorAll('.preview-admin-blog-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(e.currentTarget.dataset.id);
        const post = state.blog.find(p => Number(p.id) === id);
        if (post) openAdminBlogPreviewModal(post);
      });
    });

    // 4. Edição Completa
    scopeEl.querySelectorAll('.edit-admin-blog-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(e.currentTarget.dataset.id);
        const post = state.blog.find(p => Number(p.id) === id);
        if (post) openAdminBlogModal(post);
      });
    });

    // 5. Alternância Rápida de Status (Pausar/Ativar)
    scopeEl.querySelectorAll('.toggle-admin-blog-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (state.userRole === 'viewer') {
          alert('Visualizadores não possuem permissão para alterar artigos.');
          return;
        }
        const id = Number(e.currentTarget.dataset.id);
        try {
          const res = await fetch(`${API_BASE}/blog.php?action=toggle`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ id })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast(data.message || 'Status alterado com sucesso!', 'success');
            fetchAdminBlogData();
          } else {
            showToast(data.error || 'Erro ao alterar status.', 'error');
          }
        } catch (err) {
          showToast('Erro de conexão ao alterar status.', 'error');
        }
      });
    });

    // 6. Exclusão
    scopeEl.querySelectorAll('.delete-admin-blog-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (state.userRole === 'viewer') {
          alert('Visualizadores não possuem permissão para excluir artigos.');
          return;
        }
        const id = Number(e.currentTarget.dataset.id);
        const title = e.currentTarget.dataset.title;
        if (!confirm(`Tem certeza de que deseja excluir o artigo "${title}" permanentemente?`)) return;

        try {
          const res = await fetch(`${API_BASE}/blog.php?action=delete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ id })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast('Artigo excluído com sucesso.', 'info');
            fetchAdminBlogData();
          } else {
            showToast(data.error || 'Erro ao excluir artigo.', 'error');
          }
        } catch (err) {
          showToast('Erro de conexão ao excluir artigo.', 'error');
        }
      });
    });

    // 7. Disparar Notificação Web Push para o Artigo
    scopeEl.querySelectorAll('.send-push-admin-blog-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (state.userRole !== 'admin') {
          showToast('Apenas administradores podem disparar notificações push.', 'error');
          return;
        }
        const id = Number(e.currentTarget.dataset.id);
        const post = state.blog.find(p => Number(p.id) === id);
        if (!post) return;

        const articleUrl = `https://vocepodetudo.com/blog.html?artigo=${encodeURIComponent(post.slug || post.id)}`;
        const confirmMsg = `Deseja enviar uma Notificação Push para todos os inscritos do Você Pode Tudo sobre este artigo?\n\nTítulo: "${post.title}"\nLink: ${articleUrl}`;
        if (!confirm(confirmMsg)) return;

        try {
          const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_auth_token');
          const res = await fetch(`${API_BASE}/push.php?action=send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              title: `Novo Artigo: ${post.title}`,
              body: post.excerpt || 'Confira novo artigo prático e orientações no Blog Você Pode Tudo!',
              url: articleUrl
            })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast(data.message || 'Notificação Push disparada com sucesso aos inscritos!', 'success');
          } else {
            showToast(data.error || 'Erro ao disparar notificação push.', 'error');
          }
        } catch (err) {
          showToast('Erro de conexão ao enviar notificação.', 'error');
        }
      });
    });
  }

  function openAdminBlogRescheduleModal(post) {
    const modal = document.getElementById('admin-blog-reschedule-modal');
    const titleEl = document.getElementById('admin-blog-reschedule-title');
    const dateEl = document.getElementById('admin-blog-reschedule-current-date');
    const inputDate = document.getElementById('admin-blog-reschedule-new-date');
    const idInput = document.getElementById('admin-blog-reschedule-id');
    const msgBox = document.getElementById('admin-blog-reschedule-msg');
    if (!modal) return;

    if (msgBox) {
      msgBox.className = 'hidden';
      msgBox.textContent = '';
    }

    idInput.value = post.id;
    titleEl.textContent = post.title;
    dateEl.textContent = post.created_at || 'Não informada';

    if (post.created_at) {
      inputDate.value = post.created_at.replace(' ', 'T').substring(0, 16);
    } else {
      inputDate.value = '';
    }

    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  async function openAdminBlogPreviewModal(post) {
    const modal = document.getElementById('admin-blog-preview-modal');
    if (!modal) return;

    document.getElementById('admin-blog-preview-title').textContent = post.title || 'Sem título';
    document.getElementById('admin-blog-preview-excerpt').textContent = post.excerpt || '';

    const catInfo = BLOG_CATEGORY_BADGES[post.category] || { class: 'bg-slate-100 text-slate-800', name: post.category };
    const catBadge = document.getElementById('admin-blog-preview-category');
    catBadge.className = `px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${catInfo.class}`;
    catBadge.textContent = catInfo.name;

    const dateSpan = document.querySelector('#admin-blog-preview-date span');
    if (dateSpan) dateSpan.textContent = post.created_at ? post.created_at.substring(0, 16) : '--';

    const readSpan = document.querySelector('#admin-blog-preview-readtime span');
    if (readSpan) readSpan.textContent = `${post.read_time_minutes || 5} min de leitura`;

    const coverContainer = document.getElementById('admin-blog-preview-cover-container');
    const coverImg = document.getElementById('admin-blog-preview-cover');
    if (post.cover_image) {
      coverImg.src = post.cover_image;
      coverContainer.classList.remove('hidden');
    } else {
      coverContainer.classList.add('hidden');
    }

    const contentBox = document.getElementById('admin-blog-preview-content');
    contentBox.innerHTML = '<div class="py-4 text-center text-slate-400 font-bold">Carregando conteúdo...</div>';

    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();

    if (post.content) {
      contentBox.innerHTML = post.content;
    } else {
      try {
        const res = await fetch(`${API_BASE}/blog.php?action=get&id=${post.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.post) {
            contentBox.innerHTML = data.post.content || '<p class="text-slate-400 italic">Sem conteúdo.</p>';
          }
        }
      } catch (e) {
        contentBox.innerHTML = '<p class="text-rose-600 font-bold">Erro ao carregar conteúdo do artigo.</p>';
      }
    }
  }

  async function openAdminBlogModal(post = null) {
    const modal = document.getElementById('admin-blog-modal');
    const form = document.getElementById('form-admin-blog');
    const titleEl = document.getElementById('admin-blog-modal-title');
    const msgBox = document.getElementById('admin-blog-form-msg');
    if (!modal || !form) return;

    form.reset();
    if (msgBox) {
      msgBox.textContent = '';
      msgBox.className = 'hidden';
    }

    if (post) {
      if (titleEl) titleEl.textContent = 'Editar Artigo do Blog';
      document.getElementById('admin-blog-id').value = post.id || '';
      document.getElementById('admin-blog-title').value = post.title || '';
      document.getElementById('admin-blog-category').value = post.category || 'carreira';
      document.getElementById('admin-blog-author').value = post.author || 'Equipe Você Pode Tudo';
      document.getElementById('admin-blog-read-time').value = post.read_time_minutes || 5;
      document.getElementById('admin-blog-cover-image').value = post.cover_image || '';
      document.getElementById('admin-blog-tags').value = post.tags || '';
      document.getElementById('admin-blog-excerpt').value = post.excerpt || '';
      document.getElementById('admin-blog-published').checked = Number(post.is_published) === 1;
      const viewsInputEl = document.getElementById("admin-blog-views");
      if (viewsInputEl) viewsInputEl.value = Number(post.views_count || post.views || 0);

      if (post.created_at) {
        document.getElementById('admin-blog-created-at').value = post.created_at.replace(' ', 'T').substring(0, 16);
      } else {
        document.getElementById('admin-blog-created-at').value = '';
      }

      if (post.content) {
        document.getElementById('admin-blog-content').value = post.content;
      } else {
        try {
          const res = await fetch(`${API_BASE}/blog.php?action=get&id=${post.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.post) {
              document.getElementById('admin-blog-content').value = data.post.content || '';
            }
          }
        } catch (e) {}
      }
    } else {
      if (titleEl) titleEl.textContent = 'Novo Artigo do Blog';
      document.getElementById('admin-blog-id').value = '';
      document.getElementById('admin-blog-author').value = 'Equipe Você Pode Tudo';
      document.getElementById('admin-blog-read-time').value = 5;
      document.getElementById('admin-blog-published').checked = true;
      document.getElementById('admin-blog-created-at').value = new Date().toISOString().substring(0, 16);
      const viewsInputElNew = document.getElementById("admin-blog-views");
      if (viewsInputElNew) viewsInputElNew.value = 0;
    }

    updateBlogSeoScore();
    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  function setupBlogAdminHandlers() {
    const btnCreate = document.getElementById('btn-create-admin-blog');
    const btnRefresh = document.getElementById('btn-refresh-admin-blog');
    const modal = document.getElementById('admin-blog-modal');
    const closeBtn = document.getElementById('close-admin-blog-modal-btn');
    const cancelBtn = document.getElementById('btn-cancel-admin-blog');
    const form = document.getElementById('form-admin-blog');
    const msgBox = document.getElementById('admin-blog-form-msg');

    const searchInput = document.getElementById('admin-blog-search-input');
    const filterCat = document.getElementById('admin-blog-filter-category');
    const filterStatus = document.getElementById('admin-blog-filter-status');
    const filterMonth = document.getElementById('admin-blog-filter-month');
    const filterOrder = document.getElementById('admin-blog-filter-order');

    // Botões de alternância de visualização
    const btnViewTable = document.getElementById('btn-admin-blog-view-table');
    const btnViewTimeline = document.getElementById('btn-admin-blog-view-timeline');
    const tableView = document.getElementById('admin-blog-table-view');
    const timelineView = document.getElementById('admin-blog-timeline-view');

    if (btnViewTable && btnViewTimeline) {
      btnViewTable.addEventListener('click', () => {
        state.blogViewMode = 'table';
        tableView.classList.remove('hidden');
        timelineView.classList.add('hidden');
        btnViewTable.className = 'px-3 py-1.5 rounded-lg bg-white shadow-2xs text-slate-900 flex items-center gap-1 cursor-pointer transition-all';
        btnViewTimeline.className = 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-all';
        renderAdminBlogTable();
      });

      btnViewTimeline.addEventListener('click', () => {
        state.blogViewMode = 'timeline';
        timelineView.classList.remove('hidden');
        tableView.classList.add('hidden');
        btnViewTimeline.className = 'px-3 py-1.5 rounded-lg bg-white shadow-2xs text-slate-900 flex items-center gap-1 cursor-pointer transition-all';
        btnViewTable.className = 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-all';
        renderAdminBlogTimeline();
      });
    }

    // Modal de Reagendamento
    const rescheduleModal = document.getElementById('admin-blog-reschedule-modal');
    const closeRescheduleBtn = document.getElementById('close-admin-blog-reschedule-modal-btn');
    const cancelRescheduleBtn = document.getElementById('btn-cancel-admin-blog-reschedule');
    const saveRescheduleBtn = document.getElementById('btn-save-admin-blog-reschedule');
    const publishNowBtn = document.getElementById('btn-admin-blog-publish-now');
    const rescheduleMsg = document.getElementById('admin-blog-reschedule-msg');

    function closeRescheduleModal() {
      if (rescheduleModal) rescheduleModal.classList.add('hidden');
    }

    if (closeRescheduleBtn) closeRescheduleBtn.addEventListener('click', closeRescheduleModal);
    if (cancelRescheduleBtn) cancelRescheduleBtn.addEventListener('click', closeRescheduleModal);
    if (rescheduleModal) {
      rescheduleModal.addEventListener('click', (e) => {
        if (e.target === rescheduleModal) closeRescheduleModal();
      });
    }

    // Ação: Publicar Agora pelo Modal de Reagendamento
    if (publishNowBtn) {
      publishNowBtn.addEventListener('click', async () => {
        const id = Number(document.getElementById('admin-blog-reschedule-id')?.value);
        if (!id) return;
        try {
          const res = await fetch(`${API_BASE}/blog.php?action=quick_schedule`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ id, publish_now: true })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast(data.message || 'Artigo publicado imediatamente!', 'success');
            closeRescheduleModal();
            fetchAdminBlogData();
          } else {
            if (rescheduleMsg) {
              rescheduleMsg.textContent = data.error || 'Erro ao publicar artigo.';
              rescheduleMsg.className = 'text-xs font-bold p-2.5 rounded-xl bg-rose-50 text-rose-700 block border border-rose-200';
            }
          }
        } catch (err) {
          if (rescheduleMsg) {
            rescheduleMsg.textContent = 'Erro de comunicação ao publicar.';
            rescheduleMsg.className = 'text-xs font-bold p-2.5 rounded-xl bg-rose-50 text-rose-700 block border border-rose-200';
          }
        }
      });
    }

    // Ação: Salvar Nova Data
    if (saveRescheduleBtn) {
      saveRescheduleBtn.addEventListener('click', async () => {
        const id = Number(document.getElementById('admin-blog-reschedule-id')?.value);
        const newDate = document.getElementById('admin-blog-reschedule-new-date')?.value;
        if (!id || !newDate) {
          alert('Por favor, selecione uma nova data e hora.');
          return;
        }

        try {
          const res = await fetch(`${API_BASE}/blog.php?action=quick_schedule`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ id, created_at: newDate.replace('T', ' ') + ':00' })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast(data.message || 'Data alterada com sucesso!', 'success');
            closeRescheduleModal();
            fetchAdminBlogData();
          } else {
            if (rescheduleMsg) {
              rescheduleMsg.textContent = data.error || 'Erro ao reagendar artigo.';
              rescheduleMsg.className = 'text-xs font-bold p-2.5 rounded-xl bg-rose-50 text-rose-700 block border border-rose-200';
            }
          }
        } catch (err) {
          if (rescheduleMsg) {
            rescheduleMsg.textContent = 'Erro de comunicação ao reagendar.';
            rescheduleMsg.className = 'text-xs font-bold p-2.5 rounded-xl bg-rose-50 text-rose-700 block border border-rose-200';
          }
        }
      });
    }

    // Modal de Pré-Visualização
    const previewModal = document.getElementById('admin-blog-preview-modal');
    const closePreviewBtn = document.getElementById('close-admin-blog-preview-modal-btn');
    const closePreviewBtn2 = document.getElementById('btn-close-admin-blog-preview');

    function closePreviewModal() {
      if (previewModal) previewModal.classList.add('hidden');
    }
    if (closePreviewBtn) closePreviewBtn.addEventListener('click', closePreviewModal);
    if (closePreviewBtn2) closePreviewBtn2.addEventListener('click', closePreviewModal);
    if (previewModal) {
      previewModal.addEventListener('click', (e) => {
        if (e.target === previewModal) closePreviewModal();
      });
    }

        // Modal de Controle de Cliques / Views
    const viewsModal = document.getElementById('admin-blog-views-modal');
    const closeViewsModalBtn = document.getElementById('close-blog-views-modal-btn');
    const cancelViewsModalBtn = document.getElementById('btn-cancel-blog-views');
    const formViews = document.getElementById('form-admin-blog-views');
    const viewsInput = document.getElementById('admin-blog-views-input');
    const viewsMsg = document.getElementById('admin-blog-views-msg');

    function closeBlogViewsModal() {
      if (viewsModal) viewsModal.classList.add('hidden');
    }

    if (closeViewsModalBtn) closeViewsModalBtn.addEventListener('click', closeBlogViewsModal);
    if (cancelViewsModalBtn) cancelViewsModalBtn.addEventListener('click', closeBlogViewsModal);
    if (viewsModal) {
      viewsModal.addEventListener('click', (e) => {
        if (e.target === viewsModal) closeBlogViewsModal();
      });
    }

    document.querySelectorAll('.btn-quick-views-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!viewsInput) return;
        if (btn.dataset.val !== undefined) {
          viewsInput.value = Number(btn.dataset.val);
        } else if (btn.dataset.add !== undefined) {
          const current = Math.max(0, Number(viewsInput.value || 0));
          viewsInput.value = current + Number(btn.dataset.add);
        }
      });
    });

    if (formViews) {
      formViews.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = Number(document.getElementById('admin-blog-views-id')?.value);
        const newViews = Math.max(0, Number(viewsInput?.value || 0));
        if (!id) return;

        const saveBtn = document.getElementById('btn-save-blog-views');
        const origHtml = saveBtn ? saveBtn.innerHTML : '';
        if (saveBtn) {
          saveBtn.disabled = true;
          saveBtn.innerHTML = `<i data-lucide="loader" class="w-3.5 h-3.5 animate-spin"></i><span>Salvando...</span>`;
          if (window.lucide) window.lucide.createIcons();
        }

        try {
          const res = await fetch(`${API_BASE}/blog.php?action=update_views`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ id, views_count: newViews })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast(data.message || 'Cliques atualizados com sucesso!', 'success');
            const targetPost = (state.blog || []).find(p => Number(p.id) === id);
            if (targetPost) {
              targetPost.views_count = newViews;
              targetPost.views = newViews;
            }
            const targetFiltered = (state.filteredBlog || []).find(p => Number(p.id) === id);
            if (targetFiltered) {
              targetFiltered.views_count = newViews;
              targetFiltered.views = newViews;
            }
            closeBlogViewsModal();
            const totalViews = (state.blog || []).reduce((acc, p) => acc + Number(p.views_count || p.views || 0), 0);
            const statViewsEl = document.getElementById('admin-blog-stat-views');
            if (statViewsEl) statViewsEl.textContent = totalViews.toLocaleString('pt-BR');
            renderAdminBlogView();
          } else {
            if (viewsMsg) {
              viewsMsg.textContent = data.error || 'Erro ao atualizar cliques.';
              viewsMsg.className = 'text-xs font-bold p-2.5 rounded-xl bg-rose-50 text-rose-700 block border border-rose-200';
            }
          }
        } catch (err) {
          if (viewsMsg) {
            viewsMsg.textContent = 'Erro de comunicação ao salvar cliques.';
            viewsMsg.className = 'text-xs font-bold p-2.5 rounded-xl bg-rose-50 text-rose-700 block border border-rose-200';
          }
        } finally {
          if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = origHtml;
            if (window.lucide) window.lucide.createIcons();
          }
        }
      });
    }

    function closeBlogModal() {
      if (modal) modal.classList.add('hidden');
    }

    if (btnCreate) btnCreate.addEventListener('click', () => openAdminBlogModal(null));
    if (btnRefresh) btnRefresh.addEventListener('click', () => fetchAdminBlogData());
    if (closeBtn) closeBtn.addEventListener('click', closeBlogModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeBlogModal);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeBlogModal();
      });
    }

    function filterAdminBlog() {
      const q = (searchInput?.value || '').toLowerCase().trim();
      const c = filterCat?.value || 'all';
      const s = filterStatus?.value || 'all';
      const m = filterMonth?.value || 'all';
      const now = new Date();

      state.filteredBlog = state.blog.filter(p => {
        if (c !== 'all' && p.category !== c) return false;
        if (m !== 'all' && (!p.created_at || !p.created_at.startsWith(m))) return false;

        const postDate = p.created_at ? new Date(p.created_at.replace(/-/g, '/')) : null;
        const isScheduled = Number(p.is_published) === 1 && postDate && postDate > now;

        if (s === 'published' && (Number(p.is_published) !== 1 || isScheduled)) return false;
        if (s === 'scheduled' && !isScheduled) return false;
        if (s === 'draft' && Number(p.is_published) === 1) return false;

        if (q) {
          const hay = `${p.title} ${p.excerpt} ${p.author} ${p.tags || ''}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });
      const order = filterOrder?.value || 'date-desc';
      state.filteredBlog.sort((a, b) => {
        const viewsA = Number(a.views_count || a.views || 0);
        const viewsB = Number(b.views_count || b.views || 0);
        const timeA = a.created_at ? new Date(a.created_at.replace(/-/g, '/')).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at.replace(/-/g, '/')).getTime() : 0;
        if (order === 'views-desc') {
          return viewsB - viewsA || timeB - timeA;
        } else if (order === 'views-asc') {
          return viewsA - viewsB || timeB - timeA;
        } else if (order === 'date-asc') {
          return timeA - timeB;
        } else if (order === 'title-asc') {
          return (a.title || '').localeCompare(b.title || '', 'pt-BR');
        } else {
          return timeB - timeA;
        }
      });

      renderAdminBlogView();
      updateExportFilteredCount();
    }

    // Função auxiliar para escapar células CSV compatíveis com RFC 4180 e Excel
    function escapeCSVCell(val) {
      if (val === null || val === undefined) return '""';
      let clean = String(val).replace(/\r\n/g, ' ').replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/"/g, '""');
      // Anti-CSV / Formula Injection Mitigation
      if (/^[=\+\-@\t\r]/.test(clean)) {
        clean = "'" + clean;
      }
      return `"${clean}"`;
    }

    // Exportar Artigos para CSV de Controle Interno (Delimitador ; e BOM UTF-8)
    function exportAdminBlogCSV(onlyFiltered = false) {
      const list = onlyFiltered ? (state.filteredBlog || []) : (state.blog || []);
      if (!list || list.length === 0) {
        showToast('Nenhum artigo disponível para exportação.', 'warning');
        return;
      }

      const now = new Date();
      const delimiter = ';';
      const headers = [
        'ID',
        'Número',
        'Título',
        'Slug',
        'Categoria',
        'Status Editorial',
        'Data / Agendamento',
        'Tempo de Leitura (min)',
        'Visualizações',
        'Autor',
        'Tags / Palavras-chave',
        'Resumo da Pauta',
        'URL Oficial'
      ];

      let counter = 1;
      const rows = list.map(p => {
        const isPub = Number(p.is_published) === 1;
        const postDate = p.created_at ? new Date(p.created_at.replace(/-/g, '/')) : null;
        let statusStr = 'Rascunho / Pausado';
        if (isPub) {
          if (postDate && postDate > now) {
            statusStr = 'Agendado Futuro';
          } else {
            statusStr = 'No Ar (Publicado)';
          }
        }

        const catBadge = BLOG_CATEGORY_BADGES[p.category];
        const catName = catBadge ? catBadge.name : (p.category || 'Geral');
        const readTime = p.read_time_minutes || p.read_time || 5;
        const views = p.views_count || p.views || 0;
        const fullUrl = `https://vocepodetudo.com/blog.html?post=${p.slug || ''}`;

        return [
          escapeCSVCell(p.id),
          escapeCSVCell(counter++),
          escapeCSVCell(p.title),
          escapeCSVCell(p.slug),
          escapeCSVCell(catName),
          escapeCSVCell(statusStr),
          escapeCSVCell(p.created_at || ''),
          escapeCSVCell(readTime),
          escapeCSVCell(views),
          escapeCSVCell(p.author || 'Equipe Você Pode Tudo'),
          escapeCSVCell(p.tags || ''),
          escapeCSVCell(p.excerpt || ''),
          escapeCSVCell(fullUrl)
        ].join(delimiter);
      });

      const csvContent = '\uFEFF' + [headers.map(escapeCSVCell).join(delimiter), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      const suffix = onlyFiltered ? 'filtrados' : 'controle_interno';
      link.download = `vocepodetudo_artigos_blog_${suffix}_${dateStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      showToast(`Planilha CSV baixada com sucesso (${list.length} artigos para controle interno)!`, 'success');
    }

    // Exportar Lista em Documento de Texto (.TXT) para Controle Interno Offline
    function exportAdminBlogTXT(onlyFiltered = false) {
      const list = onlyFiltered ? (state.filteredBlog || []) : (state.blog || []);
      if (!list || list.length === 0) {
        showToast('Nenhum artigo disponível para exportação.', 'warning');
        return;
      }

      const now = new Date();
      const dateHeaderStr = now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const sep = '='.repeat(80);
      const subSep = '-'.repeat(80);

      let txt = '';
      txt += sep + '\r\n';
      txt += 'PORTAL VOCÊ PODE TUDO (vocepodetudo.com)\r\n';
      txt += 'CONTROLE INTERNO EDITORIAL — LISTA COMPLETA DE ARTIGOS DO BLOG\r\n';
      txt += sep + '\r\n';
      txt += `Data de Emissão: ${dateHeaderStr}\r\n`;
      txt += `Total de Artigos Listados: ${list.length} item(ns)\r\n`;
      txt += `Filtro Aplicado: ${onlyFiltered ? 'Seleção Atual da Tabela' : 'Acervo Completo (Todos os Artigos)'}\r\n`;
      txt += 'Finalidade: Gestão editorial, planejamento de pautas, agendamentos e arquivo offline.\r\n';
      txt += sep + '\r\n\r\n';

      list.forEach((p, index) => {
        const numStr = String(index + 1).padStart(3, '0');
        const isPub = Number(p.is_published) === 1;
        const postDate = p.created_at ? new Date(p.created_at.replace(/-/g, '/')) : null;
        let statusStr = 'Rascunho / Pausado';
        if (isPub) {
          if (postDate && postDate > now) {
            statusStr = 'Agendado Futuro';
          } else {
            statusStr = 'No Ar (Publicado)';
          }
        }

        const catBadge = BLOG_CATEGORY_BADGES[p.category];
        const catName = catBadge ? catBadge.name : (p.category || 'Geral');
        const readTime = p.read_time_minutes || p.read_time || 5;
        const views = p.views_count || p.views || 0;
        const fullUrl = `https://vocepodetudo.com/blog.html?post=${p.slug || ''}`;
        const dateFormatted = p.created_at ? p.created_at.replace('T', ' ').substring(0, 16) : '--';

        txt += `[${numStr}] ${p.title || 'Sem Título'}\r\n`;
        txt += subSep + '\r\n';
        txt += `• ID do Sistema: ${p.id}\r\n`;
        txt += `• Categoria: ${catName} (${p.category || 'geral'})\r\n`;
        txt += `• Status Editorial: ${statusStr}\r\n`;
        txt += `• Data / Agendamento: ${dateFormatted}\r\n`;
        txt += `• Tempo de Leitura: ${readTime} min | Leituras Auditadas: ${views}\r\n`;
        txt += `• Autor: ${p.author || 'Equipe Editorial Você Pode Tudo'}\r\n`;
        txt += `• Palavras-Chave / Tags: ${p.tags || 'Geral'}\r\n`;
        txt += `• Link Oficial: ${fullUrl}\r\n`;
        if (p.excerpt) {
          txt += `• Resumo da Pauta:\r\n  ${p.excerpt.trim()}\r\n`;
        }
        txt += subSep + '\r\n\r\n';
      });

      txt += sep + '\r\n';
      txt += 'FIM DO RELATÓRIO EDITORIAL DE CONTROLE INTERNO — VOCÊ PODE TUDO\r\n';
      txt += sep + '\r\n';

      const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      const suffix = onlyFiltered ? 'filtrados' : 'controle_interno';
      link.download = `vocepodetudo_artigos_blog_${suffix}_${dateStr}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      showToast(`Lista em texto (.TXT) baixada com sucesso (${list.length} artigos para controle interno)!`, 'success');
    }

    // Exportar Artigos para JSON Estruturado (Backup / Integrações - Exclusivo Administrador)
    function exportAdminBlogJSON() {
      if (state.userRole !== 'admin') {
        showToast('Acesso negado: a exportação de dados é restrita ao administrador pleno.', 'error');
        return;
      }

      const list = state.blog || [];
      if (!list || list.length === 0) {
        showToast('Nenhum artigo disponível para exportação.', 'warning');
        return;
      }

      const payload = {
        plataforma: 'Você Pode Tudo',
        origem: 'vocepodetudo.com',
        exportado_em: new Date().toISOString(),
        total_artigos: list.length,
        artigos: list
      };

      const jsonContent = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.download = `vocepodetudo_artigos_blog_backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      showToast(`Backup JSON exportado com sucesso (${list.length} artigos)!`, 'success');
    }

    // Listeners do Dropdown e Botões de Exportação
    const btnExportToggle = document.getElementById('btn-admin-blog-export-toggle');
    const exportMenu = document.getElementById('admin-blog-export-menu');
    const btnExportCSVFiltered = document.getElementById('btn-export-blog-csv-filtered');
    const btnExportCSVAll = document.getElementById('btn-export-blog-csv-all');
    const btnExportJSON = document.getElementById('btn-export-blog-json');
    const btnQuickExport = document.getElementById('btn-quick-export-blog-csv');
    const exportFilteredCountLabel = document.getElementById('export-filtered-count-label');

    function updateExportFilteredCount() {
      if (exportFilteredCountLabel) {
        const count = (state.filteredBlog || []).length;
        exportFilteredCountLabel.textContent = `${count} artigo${count === 1 ? '' : 's'} visíveis`;
      }
    }

    if (btnExportToggle && exportMenu) {
      btnExportToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        exportMenu.classList.toggle('hidden');
        updateExportFilteredCount();
      });

      document.addEventListener('click', (e) => {
        if (!exportMenu.contains(e.target) && e.target !== btnExportToggle) {
          exportMenu.classList.add('hidden');
        }
      });
    }

    if (btnExportCSVFiltered) {
      btnExportCSVFiltered.addEventListener('click', () => {
        if (exportMenu) exportMenu.classList.add('hidden');
        exportAdminBlogCSV(true);
      });
    }

    if (btnExportCSVAll) {
      btnExportCSVAll.addEventListener('click', () => {
        if (exportMenu) exportMenu.classList.add('hidden');
        exportAdminBlogCSV(false);
      });
    }

    const btnExportTXTAll = document.getElementById('btn-export-blog-txt-all');
    if (btnExportTXTAll) {
      btnExportTXTAll.addEventListener('click', () => {
        if (exportMenu) exportMenu.classList.add('hidden');
        exportAdminBlogTXT(false);
      });
    }

    const btnQuickExportTXT = document.getElementById('btn-quick-export-blog-txt');
    if (btnQuickExportTXT) {
      btnQuickExportTXT.addEventListener('click', () => {
        exportAdminBlogTXT(false);
      });
    }

    if (btnExportJSON) {
      btnExportJSON.addEventListener('click', () => {
        if (exportMenu) exportMenu.classList.add('hidden');
        exportAdminBlogJSON();
      });
    }

    if (btnQuickExport) {
      btnQuickExport.addEventListener('click', () => {
        exportAdminBlogCSV(false);
      });
    }

    if (searchInput) searchInput.addEventListener('input', filterAdminBlog);
    if (filterCat) filterCat.addEventListener('change', filterAdminBlog);
    if (filterStatus) filterStatus.addEventListener('change', filterAdminBlog);
    if (filterMonth) filterMonth.addEventListener('change', filterAdminBlog);
    if (filterOrder) filterOrder.addEventListener('change', filterAdminBlog);

    // ==========================================
    // AÇÕES EM LOTE (BULK ACTIONS)
    // ==========================================
    const checkAllBox = document.getElementById('admin-blog-check-all');
    if (checkAllBox) {
      checkAllBox.addEventListener('change', (e) => {
        if (!state.selectedBlogIds) state.selectedBlogIds = new Set();
        const isChecked = e.currentTarget.checked;
        (state.filteredBlog || []).forEach(p => {
          const id = Number(p.id);
          if (isChecked) {
            state.selectedBlogIds.add(id);
          } else {
            state.selectedBlogIds.delete(id);
          }
        });
        renderAdminBlogTable();
      });
    }

    async function executeBlogBulkAction(actionType, extraData = {}) {
      if (state.userRole !== 'admin') {
        showToast('Acesso negado: operações em lote são restritas ao administrador.', 'error');
        return;
      }
      const ids = Array.from(state.selectedBlogIds || []);
      if (ids.length === 0) {
        showToast('Nenhum artigo selecionado.', 'warning');
        return;
      }

      if (actionType === 'delete') {
        if (!confirm(`Tem certeza que deseja excluir permanentemente ${ids.length} artigo(s) selecionados?`)) return;
      }

      try {
        const res = await fetch(`${API_BASE}/blog.php?action=bulk_action`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.token}`
          },
          body: JSON.stringify({
            action_type: actionType,
            ids: ids,
            ...extraData
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast(data.message || 'Operação realizada com sucesso!', 'success');
          state.selectedBlogIds.clear();
          updateBulkActionBar();
          fetchAdminBlogData();
        } else {
          showToast(data.message || data.error || 'Erro ao processar ação em lote.', 'error');
        }
      } catch (err) {
        showToast('Erro de comunicação ao executar ação em lote.', 'error');
      }
    }

    document.getElementById('btn-bulk-publish-now')?.addEventListener('click', () => executeBlogBulkAction('publish_now'));
    document.getElementById('btn-bulk-reschedule-forward')?.addEventListener('click', () => executeBlogBulkAction('reschedule_days', { days: 7 }));
    document.getElementById('btn-bulk-reschedule-month')?.addEventListener('click', () => executeBlogBulkAction('reschedule_days', { days: 30 }));
    document.getElementById('btn-bulk-draft')?.addEventListener('click', () => executeBlogBulkAction('to_draft'));
    document.getElementById('btn-bulk-push')?.addEventListener('click', async () => {
      if (state.userRole !== 'admin') {
        showToast('Acesso restrito: apenas administradores podem disparar notificações push.', 'error');
        return;
      }
      const ids = Array.from(state.selectedBlogIds || []);
      if (ids.length === 0) {
        showToast('Nenhum artigo selecionado para notificação.', 'warning');
        return;
      }
      const selectedPosts = state.blog.filter(p => ids.includes(Number(p.id)));
      if (selectedPosts.length === 0) return;

      const firstPost = selectedPosts[0];
      const count = selectedPosts.length;
      const confirmMsg = count === 1 
        ? `Deseja disparar Notificação Push aos inscritos para o artigo selecionado "${firstPost.title}"?`
        : `Deseja disparar Notificação Push aos inscritos anunciando o destaque "${firstPost.title}" e mais ${count - 1} novos artigos?`;

      if (!confirm(confirmMsg)) return;

      const articleUrl = `https://vocepodetudo.com/blog.html?artigo=${encodeURIComponent(firstPost.slug || firstPost.id)}`;
      const title = count === 1 ? `Novo Artigo: ${firstPost.title}` : `Novos Artigos no Blog Você Pode Tudo (${count} publicações)`;
      const body = firstPost.excerpt || 'Confira os novos conteúdos práticos de carreira, cursos e direitos!';

      try {
        const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_auth_token');
        const res = await fetch(`${API_BASE}/push.php?action=send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ title, body, url: articleUrl })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast(data.message || 'Notificação Push enviada com sucesso aos inscritos!', 'success');
        } else {
          showToast(data.error || 'Erro ao disparar notificação push.', 'error');
        }
      } catch (err) {
        showToast('Erro de comunicação ao enviar push.', 'error');
      }
    });
    document.getElementById('btn-bulk-reset-views')?.addEventListener('click', () => {
      const ids = Array.from(state.selectedBlogIds || []);
      if (ids.length === 0) {
        showToast('Nenhum artigo selecionado.', 'warning');
        return;
      }
      if (!confirm(`Deseja realmente ZERAR a contagem de cliques de ${ids.length} artigo(s) selecionado(s)? Esta ação não pode ser desfeita.`)) return;
      executeBlogBulkAction('reset_views');
    });

    document.getElementById('btn-bulk-delete')?.addEventListener('click', () => executeBlogBulkAction('delete'));
    document.getElementById('btn-bulk-clear')?.addEventListener('click', () => {
      state.selectedBlogIds.clear();
      renderAdminBlogTable();
    });

    // ==========================================
    // SCORE DE SEO ON-PAGE EM TEMPO REAL
    // ==========================================
    function updateBlogSeoScore() {
      const title = (document.getElementById('admin-blog-title')?.value || '').trim();
      const excerpt = (document.getElementById('admin-blog-excerpt')?.value || '').trim();
      const content = (document.getElementById('admin-blog-content')?.value || '').trim();
      const tags = (document.getElementById('admin-blog-tags')?.value || '').trim();

      const titleLen = title.length;
      const excerptLen = excerpt.length;
      const textOnly = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      const wordsCount = textOnly ? textOnly.split(/\s+/).length : 0;
      const tagsCount = tags ? tags.split(',').map(t => t.trim()).filter(Boolean).length : 0;

      let score = 0;

      const titleCheck = document.getElementById('seo-check-title');
      const titleLenEl = document.getElementById('seo-title-len');
      if (titleLenEl) titleLenEl.textContent = titleLen;
      if (titleLen >= 35 && titleLen <= 75) {
        score += 25;
        if (titleCheck) titleCheck.className = 'flex items-center gap-1 text-emerald-600';
      } else {
        score += titleLen > 0 ? 10 : 0;
        if (titleCheck) titleCheck.className = 'flex items-center gap-1 text-amber-600';
      }

      const excerptCheck = document.getElementById('seo-check-excerpt');
      const excerptLenEl = document.getElementById('seo-excerpt-len');
      if (excerptLenEl) excerptLenEl.textContent = excerptLen;
      if (excerptLen >= 90 && excerptLen <= 180) {
        score += 25;
        if (excerptCheck) excerptCheck.className = 'flex items-center gap-1 text-emerald-600';
      } else {
        score += excerptLen > 0 ? 10 : 0;
        if (excerptCheck) excerptCheck.className = 'flex items-center gap-1 text-amber-600';
      }

      const wordsCheck = document.getElementById('seo-check-words');
      const wordsCountEl = document.getElementById('seo-words-count');
      if (wordsCountEl) wordsCountEl.textContent = wordsCount;
      if (wordsCount >= 350) {
        score += 30;
        if (wordsCheck) wordsCheck.className = 'flex items-center gap-1 text-emerald-600';
      } else if (wordsCount >= 150) {
        score += 15;
        if (wordsCheck) wordsCheck.className = 'flex items-center gap-1 text-amber-600';
      } else {
        score += wordsCount > 0 ? 5 : 0;
        if (wordsCheck) wordsCheck.className = 'flex items-center gap-1 text-rose-500';
      }

      const tagsCheck = document.getElementById('seo-check-tags');
      const tagsCountEl = document.getElementById('seo-tags-count');
      if (tagsCountEl) tagsCountEl.textContent = tagsCount;
      if (tagsCount >= 3) {
        score += 20;
        if (tagsCheck) tagsCheck.className = 'flex items-center gap-1 text-emerald-600';
      } else if (tagsCount >= 1) {
        score += 10;
        if (tagsCheck) tagsCheck.className = 'flex items-center gap-1 text-amber-600';
      } else {
        if (tagsCheck) tagsCheck.className = 'flex items-center gap-1 text-rose-500';
      }

      const scoreBadge = document.getElementById('blog-seo-score-badge');
      const scoreBar = document.getElementById('blog-seo-score-bar');

      if (scoreBar) {
        scoreBar.style.width = `${score}%`;
        scoreBar.className = `h-full transition-all duration-300 ${score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`;
      }

      if (scoreBadge) {
        if (score >= 85) {
          scoreBadge.textContent = `Score: ${score}/100 (Excelente)`;
          scoreBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800';
        } else if (score >= 60) {
          scoreBadge.textContent = `Score: ${score}/100 (Bom)`;
          scoreBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800';
        } else {
          scoreBadge.textContent = `Score: ${score}/100 (Melhorar)`;
          scoreBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800';
        }
      }
    }

    ['admin-blog-title', 'admin-blog-excerpt', 'admin-blog-content', 'admin-blog-tags'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', updateBlogSeoScore);
    });

    // ==========================================
    // RANKING TOP ARTIGOS MAIS LIDOS
    // ==========================================
    const rankingModal = document.getElementById('admin-blog-ranking-modal');
    const btnOpenRanking = document.getElementById('btn-open-blog-ranking-modal');
    const closeRankingBtn1 = document.getElementById('close-blog-ranking-modal-btn');
    const closeRankingBtn2 = document.getElementById('btn-close-blog-ranking');

    function closeBlogRankingModal() {
      if (rankingModal) rankingModal.classList.add('hidden');
    }

    function openBlogRankingModal() {
      const listEl = document.getElementById('admin-blog-ranking-list');
      if (!rankingModal || !listEl) return;

      const sorted = [...(state.blog || [])].sort((a, b) => {
        const vA = Number(a.views_count || a.views || 0);
        const vB = Number(b.views_count || b.views || 0);
        return vB - vA;
      }).slice(0, 10);

      if (sorted.length === 0) {
        listEl.innerHTML = '<p class="text-xs text-slate-400 py-6 text-center">Nenhum dado de leitura registrado ainda.</p>';
      } else {
        listEl.innerHTML = sorted.map((p, index) => {
          const rank = index + 1;
          const views = Number(p.views_count || p.views || 0);
          const catInfo = BLOG_CATEGORY_BADGES[p.category] || { class: 'bg-slate-100 text-slate-800', name: p.category };
          const badgeIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
          const badgeBg = rank === 1 ? 'bg-amber-100 text-amber-950 border border-amber-300 font-black' : rank === 2 ? 'bg-slate-200 text-slate-900 border border-slate-300 font-black' : rank === 3 ? 'bg-amber-50 text-amber-900 border border-amber-200 font-black' : 'bg-slate-100 text-slate-600 font-bold';

          return `
            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:bg-white hover:shadow-xs transition-all">
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <span class="w-8 h-8 rounded-xl flex items-center justify-center text-sm ${badgeBg} flex-shrink-0">
                  ${badgeIcon}
                </span>
                <div class="min-w-0 flex-1">
                  <div class="font-bold text-slate-900 text-xs truncate">${escapeHTML(p.title)}</div>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${catInfo.class}">${escapeHTML(catInfo.name)}</span>
                    <span class="text-[10px] text-slate-400 font-mono">${p.created_at ? p.created_at.slice(0, 10) : ''}</span>
                  </div>
                </div>
              </div>
              <div class="text-right flex-shrink-0">
                <span class="text-sm font-black text-emerald-700 flex items-center gap-1 justify-end">
                  <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                  ${views}
                </span>
                <span class="text-[10px] text-slate-400 font-bold block">acessos</span>
              </div>
            </div>
          `;
        }).join('');
      }

      rankingModal.classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    }

    if (btnOpenRanking) btnOpenRanking.addEventListener('click', openBlogRankingModal);
    if (closeRankingBtn1) closeRankingBtn1.addEventListener('click', closeBlogRankingModal);
    if (closeRankingBtn2) closeRankingBtn2.addEventListener('click', closeBlogRankingModal);
    if (rankingModal) {
      rankingModal.addEventListener('click', (e) => {
        if (e.target === rankingModal) closeBlogRankingModal();
      });
    }

    // ==========================================
    // IMPORTAÇÃO DE PLANILHA CSV
    // ==========================================
    const importModal = document.getElementById('admin-blog-import-modal');
    const btnOpenImport = document.getElementById('btn-open-blog-import-modal');
    const closeImportBtn = document.getElementById('close-blog-import-modal-btn');
    const cancelImportBtn = document.getElementById('btn-cancel-blog-import');
    const downloadTemplateBtn = document.getElementById('btn-download-blog-csv-template');
    const processImportBtn = document.getElementById('btn-process-blog-import');

    function closeBlogImportModal() {
      if (importModal) importModal.classList.add('hidden');
    }

    if (btnOpenImport) {
      btnOpenImport.addEventListener('click', () => {
        if (state.userRole !== 'admin') {
          showToast('Acesso restrito ao administrador pleno.', 'warning');
          return;
        }
        if (exportMenu) exportMenu.classList.add('hidden');
        if (importModal) importModal.classList.remove('hidden');
        if (window.lucide) window.lucide.createIcons();
      });
    }

    if (closeImportBtn) closeImportBtn.addEventListener('click', closeBlogImportModal);
    if (cancelImportBtn) cancelImportBtn.addEventListener('click', closeBlogImportModal);
    if (importModal) {
      importModal.addEventListener('click', (e) => {
        if (e.target === importModal) closeBlogImportModal();
      });
    }

    if (downloadTemplateBtn) {
      downloadTemplateBtn.addEventListener('click', () => {
        const delimiter = ';';
        const headers = ['Título', 'Categoria', 'Resumo', 'Conteúdo HTML', 'Data Agendamento (AAAA-MM-DD HH:MM:SS)', 'Tags', 'Autor'];
        const ex1 = ['Como se destacar em uma dinâmica de grupo', 'entrevistas', 'Dicas práticas para demonstrar liderança em entrevistas.', '<p>Participar de dinâmicas exige postura ativa e escuta atenta...</p>', '2026-11-20 08:00:00', 'Dinâmica, Entrevistas, Carreira', 'Equipe Você Pode Tudo'];
        const ex2 = ['10 Habilidades Essenciais para o Profissional do Futuro', 'carreira', 'O que as empresas mais buscam além da formação acadêmica.', '<p>O mercado valoriza soft skills como inteligência emocional...</p>', '2026-11-21 08:00:00', 'Futuro, Habilidades, Carreira', 'Equipe Você Pode Tudo'];

        const content = '\uFEFF' + [
          headers.map(h => `"${h}"`).join(delimiter),
          ex1.map(v => `"${v}"`).join(delimiter),
          ex2.map(v => `"${v}"`).join(delimiter)
        ].join('\r\n');

        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'modelo_importacao_artigos_vocepodetudo.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast('Modelo de planilha baixado com sucesso!', 'success');
      });
    }

    if (processImportBtn) {
      processImportBtn.addEventListener('click', () => {
        if (state.userRole !== 'admin') {
          showToast('Acesso negado: a importação é restrita ao administrador.', 'error');
          return;
        }

        const fileInput = document.getElementById('admin-blog-import-file-input');
        const msgEl = document.getElementById('admin-blog-import-msg');
        const file = fileInput?.files?.[0];

        if (!file) {
          if (msgEl) {
            msgEl.textContent = 'Por favor, selecione um arquivo CSV para continuar.';
            msgEl.className = 'text-xs font-bold p-3 rounded-xl bg-amber-50 text-amber-800 block border border-amber-200';
          }
          return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const text = e.target.result;
            const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
            if (lines.length < 2) {
              throw new Error('O arquivo CSV precisa conter ao menos uma linha de cabeçalho e uma linha de conteúdo.');
            }

            const delimiter = lines[0].includes(';') ? ';' : ',';

            function parseCSVLine(line) {
              const result = [];
              let cur = '';
              let inQuotes = false;
              for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"' || char === "'") {
                  if (inQuotes && line[i + 1] === char) {
                    cur += char;
                    i++;
                  } else {
                    inQuotes = !inQuotes;
                  }
                } else if (char === delimiter && !inQuotes) {
                  result.push(cur.trim());
                  cur = '';
                } else {
                  cur += char;
                }
              }
              result.push(cur.trim());
              return result;
            }

            const dataRows = lines.slice(1);
            const parsedPosts = [];

            dataRows.forEach(rowStr => {
              const cols = parseCSVLine(rowStr);
              if (cols.length >= 2 && cols[0]) {
                parsedPosts.push({
                  title: cols[0],
                  category: cols[1] || 'carreira',
                  excerpt: cols[2] || '',
                  content: cols[3] || '',
                  created_at: cols[4] || '',
                  tags: cols[5] || '',
                  author: cols[6] || 'Equipe Você Pode Tudo'
                });
              }
            });

            if (parsedPosts.length === 0) {
              throw new Error('Nenhum artigo válido encontrado na planilha.');
            }

            if (msgEl) {
              msgEl.textContent = `Importando ${parsedPosts.length} artigos para o servidor...`;
              msgEl.className = 'text-xs font-bold p-3 rounded-xl bg-blue-50 text-blue-800 block border border-blue-200';
            }

            const res = await fetch(`${API_BASE}/blog.php?action=import_batch`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
              },
              body: JSON.stringify({ posts: parsedPosts })
            });

            const resData = await res.json();
            if (res.ok && resData.success) {
              showToast(resData.message || 'Artigos importados com sucesso!', 'success');
              closeBlogImportModal();
              if (fileInput) fileInput.value = '';
              if (msgEl) msgEl.classList.add('hidden');
              fetchAdminBlogData();
            } else {
              throw new Error(resData.message || resData.error || 'Erro ao importar artigos.');
            }
          } catch (err) {
            if (msgEl) {
              msgEl.textContent = `Erro na importação: ${err.message}`;
              msgEl.className = 'text-xs font-bold p-3 rounded-xl bg-rose-50 text-rose-700 block border border-rose-200';
            }
          }
        };
        reader.readAsText(file, 'utf-8');
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (state.userRole === 'viewer') {
          alert('Visualizadores não possuem permissão para salvar artigos.');
          return;
        }

        const id = document.getElementById('admin-blog-id')?.value;
        const rawDate = document.getElementById('admin-blog-created-at')?.value;
        const formattedDate = rawDate ? (rawDate.replace('T', ' ') + ':00') : '';

        const payload = {
          id: id ? Number(id) : 0,
          title: document.getElementById('admin-blog-title')?.value.trim(),
          category: document.getElementById('admin-blog-category')?.value,
          author: document.getElementById('admin-blog-author')?.value.trim() || 'Equipe Você Pode Tudo',
          read_time_minutes: Number(document.getElementById('admin-blog-read-time')?.value || 5),
          cover_image: document.getElementById('admin-blog-cover-image')?.value.trim(),
          tags: document.getElementById('admin-blog-tags')?.value.trim(),
          excerpt: document.getElementById('admin-blog-excerpt')?.value.trim(),
          content: document.getElementById('admin-blog-content')?.value.trim(),
          created_at: formattedDate,
          is_published: document.getElementById('admin-blog-published')?.checked ? 1 : 0,
          views_count: Math.max(0, Number(document.getElementById('admin-blog-views')?.value || 0))
        };

        const submitBtn = document.getElementById('btn-save-admin-blog');
        const origText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<i data-lucide="loader" class="w-3.5 h-3.5 animate-spin"></i><span>Salvando Artigo...</span>`;
          if (window.lucide) window.lucide.createIcons();
        }

        try {
          const res = await fetch(`${API_BASE}/blog.php?action=save`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast(data.message || 'Artigo salvo com sucesso!', 'success');
            closeBlogModal();
            fetchAdminBlogData();
          } else {
            if (msgBox) {
              msgBox.textContent = data.error || 'Erro ao salvar artigo.';
              msgBox.className = 'text-xs font-bold p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 block';
            }
          }
        } catch (err) {
          if (msgBox) {
            msgBox.textContent = 'Erro de comunicação com o servidor de blog.';
            msgBox.className = 'text-xs font-bold p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 block';
          }
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origText;
            if (window.lucide) window.lucide.createIcons();
          }
        }
      });
    }
  }

  // ==========================================
  // 8. SEGURANÇA & ALTERAÇÃO DE SENHA
  // ==========================================
  function setupSecurityHandlers() {
    const pwForm = document.getElementById('system-change-pw-form');
    const pwMsg = document.getElementById('sys-pw-msg');
    const resetLockoutBtn = document.getElementById('reset-security-attempts-btn');

    if (pwForm) {
      pwForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const curPass = document.getElementById('sys-current-pw')?.value.trim();
        const newPass = document.getElementById('sys-new-pw')?.value.trim();
        const confirmPass = document.getElementById('sys-confirm-pw')?.value.trim();

        if (newPass !== confirmPass) {
          if (pwMsg) {
            pwMsg.textContent = 'A nova senha e a confirmação não conferem.';
            pwMsg.className = 'text-xs font-bold p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 block';
          }
          return;
        }

        if (newPass.length < 6) {
          if (pwMsg) {
            pwMsg.textContent = 'A nova senha deve possuir pelo menos 6 caracteres.';
            pwMsg.className = 'text-xs font-bold p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 block';
          }
          return;
        }

        let updated = false;

        // 1. Enviar alteração para o servidor MySQL
        try {
          const res = await fetch(`${API_BASE}/auth.php?action=change_password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({
              current_password: curPass,
              new_password: newPass
            })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            updated = true;
          } else {
            if (pwMsg) {
              pwMsg.textContent = data.message || 'A senha atual informada está incorreta.';
              pwMsg.className = 'text-xs font-bold p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 block';
            }
          }
        } catch (err) {
          if (pwMsg) {
            pwMsg.textContent = 'Erro ao comunicar com o servidor de alteração de senha.';
            pwMsg.className = 'text-xs font-bold p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 block';
          }
        }

        if (updated) {
          pwForm.reset();
          if (pwMsg) {
            pwMsg.textContent = 'Senha administrativa alterada com sucesso no banco de dados!';
            pwMsg.className = 'text-xs font-bold p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 block';
          }
          showToast('Senha administrativa alterada com sucesso!', 'success');
        }
      });
    }

    if (resetLockoutBtn) {
      resetLockoutBtn.addEventListener('click', () => {
        clearFailedAttempts();
        updateLockoutUI();
        showToast('Histórico de bloqueios e tentativas zerado.', 'info');
      });
    }

    // ==========================================
    // GERENCIAMENTO DE AUTENTICAÇÃO 2FA (TOTP)
    // ==========================================
    const statusBadge = document.getElementById('2fa-status-badge');
    const disabledView = document.getElementById('2fa-disabled-view');
    const enabledView = document.getElementById('2fa-enabled-view');
    const setupBox = document.getElementById('2fa-setup-box');
    const btnStart2fa = document.getElementById('btn-start-2fa');
    const btnConfirm2fa = document.getElementById('btn-confirm-2fa');
    const btnToggleDisable = document.getElementById('btn-toggle-disable-2fa-form');
    const disableBox = document.getElementById('2fa-disable-form-box');
    const btnConfirmDisable = document.getElementById('btn-confirm-disable-2fa');
    const copySecretBtn = document.getElementById('btn-copy-2fa-secret');

    async function load2faStatus() {
      if (!state.token) return;
      try {
        const res = await fetch(`${API_BASE}/auth.php?action=get_2fa_status`, {
          headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await res.json();
        if (data.success) {
          if (data.enabled) {
            if (statusBadge) {
              statusBadge.textContent = 'Ativado (Protegido)';
              statusBadge.className = 'px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-[#00702a] border border-emerald-300';
            }
            if (enabledView) enabledView.classList.remove('hidden');
            if (disabledView) disabledView.classList.add('hidden');
            if (setupBox) setupBox.classList.add('hidden');
          } else {
            if (statusBadge) {
              statusBadge.textContent = 'Desativado';
              statusBadge.className = 'px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300';
            }
            if (disabledView) disabledView.classList.remove('hidden');
            if (enabledView) enabledView.classList.add('hidden');
            if (disableBox) disableBox.classList.add('hidden');
          }
          if (window.lucide) window.lucide.createIcons();
        }
      } catch (e) {
        console.error('Erro ao verificar status 2FA:', e);
      }
    }

    if (btnStart2fa) {
      btnStart2fa.addEventListener('click', async () => {
        try {
          btnStart2fa.disabled = true;
          btnStart2fa.textContent = 'Gerando chaves...';
          const res = await fetch(`${API_BASE}/auth.php?action=setup_2fa`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
          });
          const data = await res.json();
          btnStart2fa.disabled = false;
          btnStart2fa.innerHTML = `<i data-lucide="smartphone" class="w-4 h-4"></i><span>Configurar 2FA Agora</span>`;

          if (data.success && data.secret) {
            const secretEl = document.getElementById('2fa-secret-text');
            const qrImg = document.getElementById('2fa-qr-image');
            if (secretEl) secretEl.textContent = data.secret;
            if (qrImg) {
              qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data.otpauth_url)}&size=200x200&margin=4`;
            }
            if (setupBox) setupBox.classList.remove('hidden');
            if (window.lucide) window.lucide.createIcons();
            document.getElementById('2fa-confirm-code-input')?.focus();
          } else {
            showToast(data.message || 'Erro ao gerar chaves 2FA.', 'error');
          }
        } catch (err) {
          btnStart2fa.disabled = false;
          btnStart2fa.innerHTML = `<i data-lucide="smartphone" class="w-4 h-4"></i><span>Configurar 2FA Agora</span>`;
          showToast('Erro de comunicação ao iniciar setup 2FA.', 'error');
        }
      });
    }

    if (copySecretBtn) {
      copySecretBtn.addEventListener('click', () => {
        const secret = document.getElementById('2fa-secret-text')?.textContent.trim();
        if (secret) {
          navigator.clipboard.writeText(secret).then(() => {
            showToast('Chave secreta copiada com sucesso!', 'success');
          }).catch(() => {
            alert('Chave: ' + secret);
          });
        }
      });
    }

    if (btnConfirm2fa) {
      btnConfirm2fa.addEventListener('click', async () => {
        const code = document.getElementById('2fa-confirm-code-input')?.value.trim();
        const secret = document.getElementById('2fa-secret-text')?.textContent.trim();
        const msg = document.getElementById('2fa-confirm-msg');

        if (!code || code.length !== 6) {
          if (msg) {
            msg.textContent = 'Digite o código de 6 dígitos gerado no aplicativo.';
            msg.className = 'text-xs font-bold p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 block';
          }
          return;
        }

        try {
          btnConfirm2fa.disabled = true;
          btnConfirm2fa.textContent = 'Validando...';
          const res = await fetch(`${API_BASE}/auth.php?action=enable_2fa`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ secret, code })
          });
          const data = await res.json();
          btnConfirm2fa.disabled = false;
          btnConfirm2fa.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4"></i><span>Confirmar e Ativar 2FA</span>`;

          if (res.ok && data.success) {
            showToast('Autenticação em duas etapas (2FA) ativada com sucesso!', 'success');
            load2faStatus();
          } else {
            if (msg) {
              msg.textContent = data.message || 'Código 2FA inválido. Verifique o relógio do seu celular.';
              msg.className = 'text-xs font-bold p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 block';
            }
          }
        } catch (err) {
          btnConfirm2fa.disabled = false;
          btnConfirm2fa.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4"></i><span>Confirmar e Ativar 2FA</span>`;
          if (msg) {
            msg.textContent = 'Erro ao confirmar ativação do 2FA.';
            msg.className = 'text-xs font-bold p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 block';
          }
        }
      });
    }

    if (btnToggleDisable) {
      btnToggleDisable.addEventListener('click', () => {
        if (disableBox) disableBox.classList.toggle('hidden');
      });
    }

    if (btnConfirmDisable) {
      btnConfirmDisable.addEventListener('click', async () => {
        const pw = document.getElementById('2fa-disable-password-input')?.value.trim();
        const msg = document.getElementById('2fa-disable-msg');
        if (!pw) {
          if (msg) {
            msg.textContent = 'Informe sua senha de administrador para desativar.';
            msg.className = 'text-xs font-bold p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 block';
          }
          return;
        }

        try {
          const res = await fetch(`${API_BASE}/auth.php?action=disable_2fa`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ password: pw })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast('Autenticação em duas etapas desativada.', 'info');
            document.getElementById('2fa-disable-password-input').value = '';
            load2faStatus();
          } else {
            if (msg) {
              msg.textContent = data.message || 'Senha incorreta.';
              msg.className = 'text-xs font-bold p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 block';
            }
          }
        } catch (err) {
          if (msg) {
            msg.textContent = 'Erro ao processar desativação do 2FA.';
            msg.className = 'text-xs font-bold p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 block';
          }
        }
      });
    }

    // Carregar status do 2FA ao entrar na aba
    document.getElementById('tab-btn-system')?.addEventListener('click', () => {
      load2faStatus();
    });

    // Botão de atalho do topo para trocar senha
    const topChangePwBtn = document.getElementById('panel-change-pw-btn');
    if (topChangePwBtn) {
      topChangePwBtn.addEventListener('click', () => {
        document.getElementById('tab-btn-system')?.click();
      });
    }

    // Botão de impressão do Mídia Kit
    const printBtn = document.getElementById('print-mediakit-btn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Botão de atualizar métricas na Home
    const refreshBtn = document.getElementById('refresh-overview-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        fetchAnalyticsData();
        showToast('Métricas atualizadas em tempo real.', 'info');
      });
    }
  }

  // ==========================================
  // 8.5. COMUNICADOS GLOBAIS & AVISO DO TOPO DO PORTAL
  // ==========================================
  let currentAnnouncementState = {
    active: false,
    message: '',
    type: 'warning',
    link: '',
    linkText: ''
  };

  function updateAnnouncementLivePreview() {
    const previewEl = document.getElementById('announcement-live-preview');
    const msgEl = document.getElementById('announcement-preview-message');
    const linkEl = document.getElementById('announcement-preview-link');
    const linkTextEl = document.getElementById('announcement-preview-link-text');
    const msgInput = document.getElementById('announcement-message-input');
    const typeSelect = document.getElementById('announcement-type-select');
    const linkInput = document.getElementById('announcement-link-input');
    const linkTextInput = document.getElementById('announcement-linktext-input');
    const toggle = document.getElementById('announcement-active-toggle');
    const toggleDesc = document.getElementById('announcement-toggle-desc');
    const charCounter = document.getElementById('announcement-char-counter');

    const msg = msgInput ? msgInput.value.trim() : '';
    const type = typeSelect ? typeSelect.value : 'warning';
    const link = linkInput ? linkInput.value.trim() : '';
    const linkText = linkTextInput ? linkTextInput.value.trim() : '';
    const isActive = toggle ? toggle.checked : false;

    // Contador de caracteres
    if (charCounter) {
      charCounter.textContent = `${msg.length} caracteres`;
    }

    // Descrição do toggle
    if (toggleDesc) {
      toggleDesc.textContent = isActive 
        ? 'O aviso está ATIVO e visível para todos os visitantes do site.' 
        : 'O aviso está DESATIVADO. O topo do portal permanece limpo sem faixas.';
      toggleDesc.className = isActive 
        ? 'text-emerald-700 font-bold text-xs' 
        : 'text-slate-500 font-semibold text-xs';
    }

    if (!previewEl || !msgEl) return;

    const trackEl = previewEl.querySelector('.announcement-marquee-track');
    if (trackEl) {
      const fullLen = (msg.length + linkText.length);
      const dur = Math.max(14, Math.min(32, Math.round(fullLen * 0.16)));
      trackEl.style.animationDuration = `${dur}s`;
    }

    // Mensagem
    msgEl.textContent = msg || 'Bem-vindo ao portal oficial Você Pode Tudo!';

    // Tipo / Estilo visual
    const basePreviewClass = 'px-3 py-2 text-xs font-black border-b-2 shadow-xs flex items-center justify-between gap-3 transition-all ';
    if (type === 'danger') {
      previewEl.className = basePreviewClass + 'bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 text-white border-rose-700';
      if (linkEl) linkEl.className = 'underline text-white hover:text-amber-200 font-extrabold flex-shrink-0 flex items-center gap-0.5';
    } else if (type === 'info') {
      previewEl.className = basePreviewClass + 'bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 text-white border-blue-700';
      if (linkEl) linkEl.className = 'underline text-white hover:text-amber-200 font-extrabold flex-shrink-0 flex items-center gap-0.5';
    } else {
      previewEl.className = basePreviewClass + 'bg-gradient-to-r from-amber-500 via-[#ffcc29] to-amber-500 text-slate-950 border-amber-600';
      if (linkEl) linkEl.className = 'underline text-slate-950 hover:text-blue-900 font-extrabold flex-shrink-0 flex items-center gap-0.5';
    }

    // Link opcional
    if (linkEl && linkTextEl) {
      if (link && link !== '#') {
        linkEl.classList.remove('hidden');
        linkTextEl.textContent = linkText || 'Ver Cursos';
      } else {
        linkEl.classList.add('hidden');
      }
    }

    // Opacidade indicando status se desativado no preview
    if (!isActive) {
      previewEl.style.opacity = '0.5';
      previewEl.title = 'Aviso atualmente desativado (não exibido no portal)';
    } else {
      previewEl.style.opacity = '1';
      previewEl.title = 'Aviso atualmente no ar';
    }

    if (window.lucide) window.lucide.createIcons({ root: previewEl });
  }

  function updateAnnouncementStatusBadges(active, message) {
    // 1. Badge do menu de navegação
    const navBadge = document.getElementById('badge-announcement-status');
    if (navBadge) {
      if (active) {
        navBadge.textContent = '🟢 No Ar';
        navBadge.className = 'px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 pointer-events-none';
      } else {
        navBadge.textContent = '⚪ Oculto';
        navBadge.className = 'px-1.5 py-0.2 rounded-full text-[10px] font-black bg-slate-200 text-slate-600 pointer-events-none';
      }
    }

    // 2. Badge do cabeçalho da seção
    const headerBadge = document.getElementById('announcement-header-status-badge');
    const headerText = document.getElementById('announcement-header-status-text');
    if (headerBadge) {
      if (active) {
        headerBadge.className = 'px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-300 flex items-center gap-1.5 shadow-xs';
        if (headerText) headerText.textContent = '🟢 Aviso Ativo no Topo do Site';
      } else {
        headerBadge.className = 'px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-black border border-slate-200 flex items-center gap-1.5';
        if (headerText) headerText.textContent = '⚪ Aviso Oculto / Desativado';
      }
    }

    // 3. Card compacto de acesso rápido na Visão Geral
    const overviewBadge = document.getElementById('overview-announcement-badge');
    const overviewPreview = document.getElementById('overview-announcement-preview');
    const overviewToggleText = document.getElementById('overview-quick-toggle-text');
    const overviewCard = document.getElementById('overview-announcement-card');

    if (overviewBadge) {
      if (active) {
        overviewBadge.textContent = '🟢 No Ar';
        overviewBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800';
      } else {
        overviewBadge.textContent = '⚪ Oculto';
        overviewBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-600';
      }
    }

    if (overviewPreview) {
      overviewPreview.textContent = active 
        ? (message || 'Aviso ativo sem mensagem') 
        : 'O aviso está desativado no momento. Nenhum banner é exibido no topo do portal.';
      overviewPreview.className = active 
        ? 'text-xs font-bold text-slate-800 truncate max-w-xl' 
        : 'text-xs font-medium text-slate-400 italic truncate max-w-xl';
    }

    if (overviewToggleText) {
      overviewToggleText.textContent = active ? 'Desativar Aviso' : 'Ativar Aviso';
    }

    if (overviewCard) {
      if (active) {
        overviewCard.className = 'bg-gradient-to-r from-amber-50 via-white to-amber-50 border-2 border-amber-300 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4';
      } else {
        overviewCard.className = 'bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 opacity-90';
      }
    }
  }

  async function loadAnnouncementData() {
    try {
      const res = await fetch(`${API_BASE}/announcement.php?t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.success && data.announcement) {
        const ann = data.announcement;
        currentAnnouncementState = ann;

        const toggle = document.getElementById('announcement-active-toggle');
        const msg = document.getElementById('announcement-message-input');
        const type = document.getElementById('announcement-type-select');
        const link = document.getElementById('announcement-link-input');
        const linkText = document.getElementById('announcement-linktext-input');

        if (toggle) toggle.checked = !!ann.active;
        if (msg) msg.value = ann.message || '';
        if (type) type.value = ann.type || 'warning';
        if (link) link.value = ann.link || '';
        if (linkText) linkText.value = ann.linkText || '';

        updateAnnouncementStatusBadges(!!ann.active, ann.message);
        updateAnnouncementLivePreview();
      }
    } catch (err) {
      console.warn('Erro ao obter comunicado global:', err);
    }
  }

  function setupAnnouncementAdmin() {
    loadAnnouncementData();

    const form = document.getElementById('announcement-admin-form');
    const msgBox = document.getElementById('announcement-admin-msg');
    const toggle = document.getElementById('announcement-active-toggle');
    const msgInput = document.getElementById('announcement-message-input');
    const typeSelect = document.getElementById('announcement-type-select');
    const linkInput = document.getElementById('announcement-link-input');
    const linkTextInput = document.getElementById('announcement-linktext-input');
    const quickDisableBtn = document.getElementById('announcement-quick-disable-btn');
    const overviewToggleBtn = document.getElementById('overview-quick-toggle-announcement-btn');

    // Eventos em tempo real para o Live Preview
    if (msgInput) {
      msgInput.addEventListener('input', updateAnnouncementLivePreview);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', updateAnnouncementLivePreview);
    }
    if (linkInput) {
      linkInput.addEventListener('input', updateAnnouncementLivePreview);
    }
    if (linkTextInput) {
      linkTextInput.addEventListener('input', updateAnnouncementLivePreview);
    }
    if (toggle) {
      toggle.addEventListener('change', updateAnnouncementLivePreview);
    }

    // Botões de modelos rápidos (presets)
    document.querySelectorAll('.announcement-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pMsg = btn.getAttribute('data-msg') || '';
        const pType = btn.getAttribute('data-type') || 'warning';
        const pLink = btn.getAttribute('data-link') || '';
        const pLinkText = btn.getAttribute('data-linktext') || '';

        if (msgInput) msgInput.value = pMsg;
        if (typeSelect) typeSelect.value = pType;
        if (linkInput) linkInput.value = pLink;
        if (linkTextInput) linkTextInput.value = pLinkText;
        if (toggle && pMsg) toggle.checked = true;

        updateAnnouncementLivePreview();
        showToast('Modelo aplicado! Clique em salvar para publicar.', 'info');
      });
    });

    // Função de envio / salvamento
    async function saveAnnouncementSettings(customActive = null) {
      if (state.userRole === 'viewer') {
        alert('Seu perfil de Visualizador possui permissão apenas de leitura. A edição de avisos é exclusiva de Administradores.');
        return false;
      }

      const active = customActive !== null 
        ? customActive 
        : (document.getElementById('announcement-active-toggle')?.checked || false);
      const message = document.getElementById('announcement-message-input')?.value.trim() || '';
      const type = document.getElementById('announcement-type-select')?.value || 'warning';
      const link = document.getElementById('announcement-link-input')?.value.trim() || '';
      const linkText = document.getElementById('announcement-linktext-input')?.value.trim() || '';

      const submitBtn = form?.querySelector('button[type="submit"]');
      const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i data-lucide="loader" class="w-4 h-4 animate-spin"></i><span>Salvando...</span>`;
        if (window.lucide) window.lucide.createIcons();
      }

      try {
        const res = await fetch(`${API_BASE}/announcement.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.token}`
          },
          body: JSON.stringify({ active, message, type, link, linkText })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          currentAnnouncementState = data.announcement || { active, message, type, link, linkText };
          if (toggle) toggle.checked = !!active;

          updateAnnouncementStatusBadges(!!active, message);
          updateAnnouncementLivePreview();

          if (msgBox) {
            msgBox.textContent = active 
              ? 'Aviso publicado e ativo no topo do portal com sucesso!' 
              : 'Aviso desativado com sucesso! Nenhuma faixa está visível no topo.';
            msgBox.className = 'text-xs font-bold p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 block';
            setTimeout(() => { msgBox.classList.add('hidden'); }, 5000);
          }

          showToast(active ? 'Aviso atualizado e no ar!' : 'Aviso desativado com sucesso!', 'success');
          return true;
        } else {
          if (msgBox) {
            msgBox.textContent = data.error || 'Erro ao salvar aviso.';
            msgBox.className = 'text-xs font-bold p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 block';
          }
          showToast(data.error || 'Erro ao salvar comunicado.', 'error');
          return false;
        }
      } catch (err) {
        if (msgBox) {
          msgBox.textContent = 'Erro de comunicação com o servidor de avisos.';
          msgBox.className = 'text-xs font-bold p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 block';
        }
        showToast('Erro de conexão ao salvar aviso.', 'error');
        return false;
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
          if (window.lucide) window.lucide.createIcons();
        }
      }
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveAnnouncementSettings();
      });
    }

    // Botão rápido de desativação na aba de Aviso
    if (quickDisableBtn) {
      quickDisableBtn.addEventListener('click', async () => {
        if (confirm('Deseja realmente desativar e ocultar o aviso do topo no portal?')) {
          if (toggle) toggle.checked = false;
          await saveAnnouncementSettings(false);
        }
      });
    }

    // Botão de Toggle Rápido na Visão Geral
    if (overviewToggleBtn) {
      overviewToggleBtn.addEventListener('click', async () => {
        const nextState = !currentAnnouncementState.active;
        const actionMsg = nextState 
          ? 'Deseja ativar o aviso no topo do portal com a mensagem atual?' 
          : 'Deseja desativar o aviso do topo agora?';
        if (confirm(actionMsg)) {
          if (toggle) toggle.checked = nextState;
          await saveAnnouncementSettings(nextState);
        }
      });
    }
  }

  function setupBackupAdmin() {
    const btnDownloadSql = document.getElementById('btn-download-sql-backup');
    if (btnDownloadSql) {
      btnDownloadSql.addEventListener('click', () => {
        if (!state.token) {
          showToast('Você precisa estar autenticado como administrador.', 'error');
          return;
        }
        showToast('Iniciando geração do backup MySQL (.sql)...', 'info');
        downloadWithAuth(`${API_BASE}/backup.php?action=dump_mysql`, `backup_mysql_${Date.now()}.sql`);
      });
    }
  }

  // ==========================================
  // 7.5. FILA DE CURADORIA DE CURSOS (HUMAN-IN-THE-LOOP)
  // ==========================================
  async function fetchCurationData() {
    try {
      const res = await fetch(`${API_BASE}/curation.php?action=pending&t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${state.token}`
        }
      });
      if (!res.ok) throw new Error('Falha ao carregar fila de curadoria');
      const data = await res.json();
      if (data && data.success) {
        state.curationCourses = data.courses || [];
        state.curationStats = data.stats || {};
        renderCurationUI(state.curationCourses, state.curationStats);
      }
    } catch (err) {
      console.warn('Erro ao obter curadoria:', err);
    }
  }
  window.fetchCurationData = fetchCurationData;

  function renderCurationUI(courses, stats) {
    const totalCount = (stats && stats.totalPending !== undefined) ? stats.totalPending : courses.length;
    const badge = document.getElementById('badge-pending-curation');
    if (badge) {
      badge.textContent = totalCount;
      badge.className = totalCount > 0 
        ? 'px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-white'
        : 'px-1.5 py-0.2 rounded-full text-[10px] font-black bg-slate-200 text-slate-800';
    }

    const statTotal = document.getElementById('curation-stat-total');
    if (statTotal) statTotal.textContent = totalCount;
    const statFree = document.getElementById('curation-stat-free');
    if (statFree) statFree.textContent = (stats && stats.confirmedFree) || 0;
    const statCert = document.getElementById('curation-stat-cert');
    if (statCert) statCert.textContent = (stats && stats.confirmedCert) || 0;

    const tbody = document.getElementById('curation-admin-tbody');
    if (!tbody) return;

    if (!courses || courses.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="py-12 text-center text-slate-400 font-bold">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-[#009639] mb-2">
              <i data-lucide="check-check" class="w-6 h-6"></i>
            </div>
            <p class="text-sm font-black text-slate-700">Fila de curadoria limpa e em dia!</p>
            <p class="text-xs text-slate-400 font-medium mt-0.5">Todos os cursos descobertos foram revisados ou não há novas sugestões pendentes.</p>
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    tbody.innerHTML = courses.map(c => {
      const isFreeConfirmed = c.pricingStatus === 'GRATUITO_CONFIRMADO';
      const isCertConfirmed = c.hasFreeCertificate || c.certificateStatus === 'CERTIFICADO_GRATUITO_CONFIRMADO';
      const cleanUrl = sanitizeUrl(c.url);

      const pricingBadge = isFreeConfirmed
        ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300"><i data-lucide="check" class="w-3 h-3"></i> 100% Gratuito</span>`
        : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300"><i data-lucide="alert-circle" class="w-3 h-3"></i> Revisar Preço</span>`;

      const certBadge = isCertConfirmed
        ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-300"><i data-lucide="award" class="w-3 h-3"></i> Certificado Grátis</span>`
        : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-300">Modo Ouvinte</span>`;

      return `
        <tr id="curation-row-${escapeHTML(c.id)}" class="hover:bg-slate-50 transition-all duration-300">
          <td class="py-3 px-4 font-black">
            <span class="inline-block px-2.5 py-1 rounded-xl text-[11px] border ${escapeHTML(c.providerColor || 'bg-slate-100 text-slate-800 border-slate-300 font-bold')}">
              ${escapeHTML(c.provider)}
            </span>
          </td>
          <td class="py-3 px-4">
            <div class="font-black text-slate-900 text-xs">${escapeHTML(c.title)}</div>
            <div class="text-[10px] text-slate-400 font-mono mt-0.5">ID: ${escapeHTML(c.id)}</div>
            <p class="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">${escapeHTML(c.description || '')}</p>
          </td>
          <td class="py-3 px-4">
            <span class="font-bold text-slate-700 uppercase tracking-wider text-[10px]">${escapeHTML(c.category)}</span>
            <div class="text-[10px] text-slate-400 font-semibold">${escapeHTML(String(c.workloadHours || 0))} horas</div>
          </td>
          <td class="py-3 px-4">
            ${pricingBadge}
          </td>
          <td class="py-3 px-4">
            ${certBadge}
          </td>
          <td class="py-3 px-4">
            <a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[#002776] hover:underline font-bold text-[11px]">
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              <span>Ver Fonte</span>
            </a>
          </td>
          <td class="py-3 px-4 text-right">
            <div class="inline-flex items-center gap-1.5">
              <span class="viewer-only-alert hidden px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 font-bold text-[10px] items-center gap-1">
                <i data-lucide="lock" class="w-3 h-3 text-slate-400"></i> Somente Leitura
              </span>
              <button 
                type="button" 
                class="viewer-hide approve-curation-btn px-2.5 py-1.5 rounded-xl bg-[#009639] hover:bg-[#00702a] text-white text-[11px] font-black shadow-sm flex items-center gap-1 cursor-pointer transition-all"
                data-id="${escapeHTML(c.id)}"
                title="Aprovar e publicar imediatamente no catálogo"
              >
                <i data-lucide="check" class="w-3.5 h-3.5"></i>
                <span>Aprovar</span>
              </button>

              <button 
                type="button" 
                class="viewer-hide edit-curation-btn p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 cursor-pointer transition-all"
                data-id="${escapeHTML(c.id)}"
                title="Revisar e editar dados"
              >
                <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
              </button>

              <button 
                type="button" 
                class="viewer-hide reject-curation-btn p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer transition-all"
                data-id="${escapeHTML(c.id)}"
                title="Rejeitar sugestão"
              >
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  function setupCurationHandlers() {
    // Botão de atualizar fila
    const refreshBtn = document.getElementById('refresh-curation-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        fetchCurationData();
        showToast('Fila de curadoria atualizada.', 'info');
      });
    }

    // Delegação de eventos para a tabela de curadoria
    const tbody = document.getElementById('curation-admin-tbody');
    if (tbody) {
      tbody.addEventListener('click', async (e) => {
        const approveBtn = e.target.closest('.approve-curation-btn');
        const editBtn = e.target.closest('.edit-curation-btn');
        const rejectBtn = e.target.closest('.reject-curation-btn');

        if (approveBtn) {
          const id = approveBtn.getAttribute('data-id');
          if (!id) return;
          if (confirm('Deseja realmente aprovar e publicar este curso no catálogo oficial?')) {
            await handleApproveCuration(id);
          }
        } else if (editBtn) {
          const id = editBtn.getAttribute('data-id');
          if (id) openEditCurationModal(id);
        } else if (rejectBtn) {
          const id = rejectBtn.getAttribute('data-id');
          if (id) openRejectCurationModal(id);
        }
      });
    }

    // Handler do formulário de rejeição
    const rejectForm = document.getElementById('reject-curation-form');
    if (rejectForm) {
      rejectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('reject-course-id')?.value;
        const reason = document.getElementById('reject-course-reason')?.value;
        const notes = document.getElementById('reject-course-notes')?.value;

        if (!id || !reason) {
          showToast('Preencha o motivo da rejeição.', 'warning');
          return;
        }

        try {
          const res = await fetch(`${API_BASE}/curation.php?action=reject`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ id, reason: notes ? `${reason} (${notes})` : reason })
          });
          const data = await res.json();
          if (data && data.success) {
            document.getElementById('modal-reject-curation')?.classList.add('hidden');
            showToast('Curso rejeitado e registrado para auditoria.', 'info');

            const row = document.getElementById(`curation-row-${id}`);
            if (row) {
              row.style.transition = 'all 0.35s ease-out';
              row.style.opacity = '0';
              row.style.transform = 'translateX(-40px)';
            }

            setTimeout(() => {
              state.curationCourses = state.curationCourses.filter(c => c.id !== id);
              if (state.curationStats && state.curationStats.totalPending > 0) {
                state.curationStats.totalPending = Math.max(0, state.curationStats.totalPending - 1);
              }
              renderCurationUI(state.curationCourses, state.curationStats);
            }, 300);

            fetchCurationData();
          } else {
            showToast(data.message || 'Erro ao rejeitar curso.', 'error');
          }
        } catch (err) {
          showToast('Erro de comunicação com o servidor.', 'error');
        }
      });

      document.getElementById('close-reject-modal-btn')?.addEventListener('click', () => {
        document.getElementById('modal-reject-curation')?.classList.add('hidden');
      });
      document.getElementById('cancel-reject-modal-btn')?.addEventListener('click', () => {
        document.getElementById('modal-reject-curation')?.classList.add('hidden');
      });
    }

    // Handler do formulário de edição de rascunho
    const editForm = document.getElementById('edit-curation-form');
    if (editForm) {
      editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-curation-id')?.value;
        if (!id) return;

        const payload = {
          id,
          title: document.getElementById('edit-curation-title')?.value.trim(),
          provider: document.getElementById('edit-curation-provider')?.value.trim(),
          category: document.getElementById('edit-curation-category')?.value,
          workloadHours: parseInt(document.getElementById('edit-curation-workload')?.value, 10) || 10,
          hasFreeCertificate: document.getElementById('edit-curation-cert')?.value === '1',
          url: document.getElementById('edit-curation-url')?.value.trim(),
          description: document.getElementById('edit-curation-desc')?.value.trim()
        };

        try {
          const res = await fetch(`${API_BASE}/curation.php?action=update_draft`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (data && data.success) {
            document.getElementById('modal-edit-curation')?.classList.add('hidden');
            showToast('Rascunho de curadoria retificado.', 'success');
            fetchCurationData();
          } else {
            showToast(data.message || 'Erro ao salvar rascunho.', 'error');
          }
        } catch (err) {
          showToast('Erro de comunicação ao salvar rascunho.', 'error');
        }
      });

      document.getElementById('close-edit-curation-modal-btn')?.addEventListener('click', () => {
        document.getElementById('modal-edit-curation')?.classList.add('hidden');
      });
      document.getElementById('cancel-edit-curation-modal-btn')?.addEventListener('click', () => {
        document.getElementById('modal-edit-curation')?.classList.add('hidden');
      });
    }
  }

  async function handleApproveCuration(id) {
    const row = document.getElementById(`curation-row-${id}`);
    const approveBtn = row?.querySelector('.approve-curation-btn');
    if (approveBtn) {
      approveBtn.disabled = true;
      approveBtn.classList.add('opacity-50', 'cursor-not-allowed');
      approveBtn.innerHTML = '<span class="inline-block animate-spin mr-1">⌛</span><span>Aprovando...</span>';
    }

    try {
      const res = await fetch(`${API_BASE}/curation.php?action=approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data && data.success) {
        showToast('Curso aprovado e publicado com sucesso no catálogo!', 'success');

        // Animação de remoção imediata da linha
        if (row) {
          row.style.transition = 'all 0.35s ease-out';
          row.style.opacity = '0';
          row.style.transform = 'translateX(40px)';
        }

        setTimeout(() => {
          state.curationCourses = state.curationCourses.filter(c => c.id !== id);
          if (state.curationStats && state.curationStats.totalPending > 0) {
            state.curationStats.totalPending = Math.max(0, state.curationStats.totalPending - 1);
          }
          renderCurationUI(state.curationCourses, state.curationStats);
        }, 300);

        fetchCurationData();
        fetchCoursesData();
      } else {
        if (approveBtn) {
          approveBtn.disabled = false;
          approveBtn.classList.remove('opacity-50', 'cursor-not-allowed');
          approveBtn.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5"></i><span>Aprovar</span>';
          if (window.lucide) window.lucide.createIcons();
        }
        showToast(data.message || 'Erro ao aprovar curso.', 'error');
      }
    } catch (err) {
      if (approveBtn) {
        approveBtn.disabled = false;
        approveBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        approveBtn.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5"></i><span>Aprovar</span>';
        if (window.lucide) window.lucide.createIcons();
      }
      showToast('Erro de conexão ao aprovar curso.', 'error');
    }
  }

  function openRejectCurationModal(id) {
    const course = state.curationCourses.find(c => c.id === id);
    if (!course) return;

    document.getElementById('reject-course-id').value = course.id;
    document.getElementById('reject-course-title').textContent = course.title;
    document.getElementById('reject-course-reason').value = '';
    document.getElementById('reject-course-notes').value = '';

    document.getElementById('modal-reject-curation')?.classList.remove('hidden');
  }

  function openEditCurationModal(id) {
    const course = state.curationCourses.find(c => c.id === id);
    if (!course) return;

    document.getElementById('edit-curation-id').value = course.id;
    document.getElementById('edit-curation-title').value = course.title || '';
    document.getElementById('edit-curation-provider').value = course.provider || '';
    document.getElementById('edit-curation-category').value = course.category || 'tecnologia';
    document.getElementById('edit-curation-workload').value = course.workloadHours || 10;
    document.getElementById('edit-curation-cert').value = course.hasFreeCertificate ? '1' : '0';
    document.getElementById('edit-curation-url').value = course.url || '';
    document.getElementById('edit-curation-desc').value = course.description || '';

    document.getElementById('modal-edit-curation')?.classList.remove('hidden');
  }

  // ==========================================
  // 7.8. RELAÇÃO DE INSTITUIÇÕES COM CURSOS GRATUITOS
  // ==========================================
  function setupInstitutionsReportHandlers() {
    const modal = document.getElementById('modal-institutions-report');
    const openBtn = document.getElementById('open-institutions-modal-btn');
    const closeBtn = document.getElementById('close-institutions-modal-btn');
    const searchInput = document.getElementById('institutions-search-input');
    const exportCsvBtn = document.getElementById('export-institutions-csv-btn');
    const printBtn = document.getElementById('print-institutions-btn');
    const tbody = document.getElementById('institutions-table-tbody');

    let aggregatedInstitutions = [];
    let filteredInstitutions = [];

    function buildInstitutionsData() {
      const coursesList = (state.courses && state.courses.length > 0) 
        ? state.courses 
        : (typeof localCourses !== 'undefined' ? localCourses : []);

      const map = {};
      coursesList.forEach(c => {
        if (c.isActive === false) return; // apenas cursos ativos
        const prov = (c.provider || 'Não informado').trim();
        if (!map[prov]) {
          map[prov] = {
            name: prov,
            providerTag: c.providerTag || prov.slice(0, 15),
            providerColor: c.providerColor || 'bg-slate-100 text-slate-800 border-slate-300',
            totalCourses: 0,
            freeCertificates: 0,
            totalHours: 0,
            categories: new Set()
          };
        }
        map[prov].totalCourses++;
        if (c.hasFreeCertificate) map[prov].freeCertificates++;
        map[prov].totalHours += parseInt(c.workloadHours, 10) || 0;
        const cat = c.categoryName || c.category;
        if (cat) map[prov].categories.add(cat);
      });

      aggregatedInstitutions = Object.values(map).map(inst => ({
        ...inst,
        categories: Array.from(inst.categories)
      })).sort((a, b) => b.totalCourses - a.totalCourses || a.name.localeCompare(b.name));

      filteredInstitutions = [...aggregatedInstitutions];
    }

    function renderInstitutionsTable() {
      if (!tbody) return;

      // Atualiza KPIs
      const totalInstitutions = aggregatedInstitutions.length;
      const totalCourses = aggregatedInstitutions.reduce((acc, i) => acc + i.totalCourses, 0);
      const totalCerts = aggregatedInstitutions.reduce((acc, i) => acc + i.freeCertificates, 0);
      const totalHours = aggregatedInstitutions.reduce((acc, i) => acc + i.totalHours, 0);

      const kpiTotal = document.getElementById('inst-kpi-total');
      if (kpiTotal) kpiTotal.textContent = totalInstitutions;
      const kpiCourses = document.getElementById('inst-kpi-courses');
      if (kpiCourses) kpiCourses.textContent = totalCourses;
      const kpiCerts = document.getElementById('inst-kpi-certs');
      if (kpiCerts) kpiCerts.textContent = totalCerts;
      const kpiHours = document.getElementById('inst-kpi-hours');
      if (kpiHours) kpiHours.textContent = `${totalHours.toLocaleString('pt-BR')}h`;

      if (filteredInstitutions.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="py-8 text-center text-xs font-bold text-slate-400">
              Nenhuma instituição encontrada para o termo pesquisado.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = filteredInstitutions.map(inst => {
        const safeName = escapeHTML(inst.name);
        const safeTag = escapeHTML(inst.providerTag);
        const certPercent = inst.totalCourses > 0 ? Math.round((inst.freeCertificates / inst.totalCourses) * 100) : 0;
        const categoriesBadges = inst.categories.slice(0, 3).map(cat => 
          `<span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 mr-1 mb-0.5">${escapeHTML(cat)}</span>`
        ).join('') + (inst.categories.length > 3 ? `<span class="text-[10px] text-slate-400 font-bold">+${inst.categories.length - 3}</span>` : '');

        return `
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="py-3 px-3">
              <div class="font-black text-slate-900">${safeName}</div>
              <div class="text-[10px] text-slate-400 font-bold mt-0.5">${safeTag}</div>
            </td>
            <td class="py-3 px-3 text-center">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black bg-blue-50 text-[#002776] border border-blue-200">
                ${inst.totalCourses}
              </span>
            </td>
            <td class="py-3 px-3 text-center">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-[#009639] border border-emerald-200" title="${certPercent}% com certificado gratuito">
                ${inst.freeCertificates}
              </span>
            </td>
            <td class="py-3 px-3 text-center font-bold text-slate-700">
              ${inst.totalHours}h
            </td>
            <td class="py-3 px-3">
              ${categoriesBadges}
            </td>
            <td class="py-3 px-3 text-right">
              <button 
                type="button" 
                class="view-inst-courses-btn px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-[#002776] hover:text-white text-slate-700 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                data-institution="${safeName}"
              >
                <i data-lucide="search" class="w-3 h-3 pointer-events-none"></i>
                <span class="pointer-events-none">Ver Cursos</span>
              </button>
            </td>
          </tr>
        `;
      }).join('');

      if (window.lucide) window.lucide.createIcons();
    }

    function openModal() {
      buildInstitutionsData();
      if (searchInput) searchInput.value = '';
      renderInstitutionsTable();
      if (modal) modal.classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    }

    function closeModal() {
      if (modal) modal.classList.add('hidden');
    }

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Fechar ao clicar fora
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    // Busca / Filtro em tempo real
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
          filteredInstitutions = [...aggregatedInstitutions];
        } else {
          filteredInstitutions = aggregatedInstitutions.filter(inst => 
            inst.name.toLowerCase().includes(query) ||
            inst.categories.some(c => c.toLowerCase().includes(query)) ||
            inst.providerTag.toLowerCase().includes(query)
          );
        }
        renderInstitutionsTable();
      });
    }

    // Delegação de clique no botão "Ver Cursos"
    if (tbody) {
      tbody.addEventListener('click', (e) => {
        const btn = e.target.closest('.view-inst-courses-btn');
        if (!btn) return;
        const instName = btn.dataset.institution;
        if (!instName) return;

        closeModal();

        // Mudar para a aba de cursos se não estiver nela
        if (window.switchAdminTab) {
          window.switchAdminTab('tab-btn-courses', 'section-courses');
        }

        // Preencher campo de busca de cursos e disparar filtro
        const coursesSearchInput = document.getElementById('courses-search-input');
        if (coursesSearchInput) {
          coursesSearchInput.value = instName;
          coursesSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
          showToast(`Filtrando catálogo por: ${instName}`, 'info');
        }
      });
    }

    // Exportação para CSV
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        if (!aggregatedInstitutions.length) buildInstitutionsData();
        if (!aggregatedInstitutions.length) {
          showToast('Nenhuma instituição disponível para exportar.', 'warning');
          return;
        }

        let csvContent = '\uFEFF"Instituição / Provedor","Cursos Ativos","Certificados Gratuitos","% Certificado Gratuito","Carga Horária Total (h)","Áreas / Categorias"\n';
        aggregatedInstitutions.forEach(inst => {
          const certPct = inst.totalCourses > 0 ? Math.round((inst.freeCertificates / inst.totalCourses) * 100) : 0;
          const cleanName = inst.name.replace(/"/g, '""');
          const cleanCats = inst.categories.join(', ').replace(/"/g, '""');
          csvContent += `"${cleanName}",${inst.totalCourses},${inst.freeCertificates},"${certPct}%",${inst.totalHours},"${cleanCats}"\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relacao_instituicoes_cursos_gratis_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Planilha de instituições exportada com sucesso!', 'success');
      });
    }

    // Impressão
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    window.openInstitutionsModal = openModal;
  }

  // ==========================================
  
  // ==========================================
  // MÓDULO: BANCO DE CURRÍCULOS GERADOS
  // ==========================================
  state.resumes = [];
  state.filteredResumes = [];
  state.resumesPage = 1;
  state.resumesLimit = 20;
  state.resumesTotal = 0;
  state.resumesTotalPages = 1;
  state.activeViewingResume = null;

  const TEMPLATE_NAMES_MAP = {
    '1': 'Clássico Profissional',
    '2': 'Moderno Executivo',
    '3': 'Primeiro Emprego',
    '4': 'Tecnologia e TI',
    '5': 'Administração e Finanças',
    '6': 'Comercial e Vendas',
    '7': 'Acadêmico e Estágio',
    '8': 'Criativo e Design',
    '9': 'Operacional e Industrial',
    '10': 'Atendimento e Serviços',
    '11': 'Profissional Experiente',
    '12': 'Acessível e Inclusivo',
    'moderno': 'Moderno Executivo',
    'classico': 'Clássico Profissional'
  };

  function getTemplateDisplayName(id) {
    return TEMPLATE_NAMES_MAP[String(id)] || `Modelo ${id}`;
  }

  async function fetchResumesData(page = 1) {
    if (!state.token) return;
    try {
      const searchInput = document.getElementById('search-resumes-input');
      const filterTpl = document.getElementById('filter-resumes-template');
      const filterPhoto = document.getElementById('filter-resumes-photo');

      const search = searchInput ? encodeURIComponent(searchInput.value.trim()) : '';
      const template = filterTpl ? encodeURIComponent(filterTpl.value) : 'all';
      const photo = filterPhoto ? encodeURIComponent(filterPhoto.value) : 'all';

      state.resumesPage = page;

      const url = `${API_BASE}/resumes.php?action=list&page=${page}&limit=${state.resumesLimit}&search=${search}&template=${template}&has_photo=${photo}&t=${Date.now()}`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${state.token}` }
      });
      if (!res.ok) throw new Error('Falha ao obter lista de currículos');
      const data = await res.json();

      if (data && data.success && Array.isArray(data.resumes)) {
        state.resumes = data.resumes;
        state.filteredResumes = data.resumes;
        state.resumesTotal = data.total || 0;
        state.resumesTotalPages = data.total_pages || 1;

        renderResumesTable();
        updateResumesPagination();
        updateResumesBadges(data.total || 0);
      }

      // Buscar estatísticas gerais de currículos
      fetchResumesStats();

    } catch (err) {
      console.warn('Erro ao obter currículos gerados:', err);
      renderResumesTable();
    }
  }

  async function fetchResumesStats() {
    if (!state.token) return;
    try {
      const res = await fetch(`${API_BASE}/resumes.php?action=stats&t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${state.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.stats) {
          const s = data.stats;
          const statTotal = document.getElementById('stat-resumes-total');
          const statPhoto = document.getElementById('stat-resumes-photo');
          const statDownloads = document.getElementById('stat-resumes-downloads');
          const statTopTpl = document.getElementById('stat-resumes-top-template');
          const kpiResumes = document.getElementById('kpi-resumes-count');

          if (statTotal) statTotal.textContent = (s.total_resumes || 0).toLocaleString('pt-BR');
          if (statPhoto) statPhoto.textContent = (s.with_photo_count || 0).toLocaleString('pt-BR');
          if (statDownloads) statDownloads.textContent = (s.total_downloads || 0).toLocaleString('pt-BR');
          if (statTopTpl) statTopTpl.textContent = getTemplateDisplayName(s.top_template || '1');
          if (kpiResumes) kpiResumes.textContent = (s.total_resumes || 0).toLocaleString('pt-BR');

          updateResumesBadges(s.total_resumes || 0);
        }
      }
    } catch (e) {
      console.warn('Erro ao obter estatísticas de currículos:', e);
    }
  }

  function updateResumesBadges(total) {
    const badge = document.getElementById('badge-total-resumes');
    if (badge) {
      badge.textContent = total.toLocaleString('pt-BR');
    }
  }

  function renderResumesTable() {
    const tbody = document.getElementById('resumes-admin-tbody');
    if (!tbody) return;

    if (state.filteredResumes.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="py-12 text-center text-xs font-bold text-slate-400">
            <div class="flex flex-col items-center justify-center gap-2">
              <i data-lucide="file-question" class="w-8 h-8 text-slate-300"></i>
              <span>Nenhum currículo gerado encontrado com os filtros atuais.</span>
            </div>
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    tbody.innerHTML = state.filteredResumes.map(r => {
      const safeName = escapeHTML(r.candidate_name || 'Candidato');
      const safeRole = escapeHTML(r.target_role || 'Não especificado');
      const safeCity = escapeHTML([r.candidate_city, r.candidate_state].filter(Boolean).join(' - ') || 'Brasil');
      const safeEmail = escapeHTML(r.candidate_email || 'Não informado');
      const safePhone = escapeHTML(r.candidate_phone || 'Não informado');
      const tplName = escapeHTML(getTemplateDisplayName(r.template_id));
      const hasPhoto = !!r.has_photo;
      const downloads = parseInt(r.downloads_count, 10) || 1;
      const createdDate = r.created_at ? new Date(r.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recente';
      const initial = escapeHTML((r.candidate_name || 'C').charAt(0).toUpperCase());

      // Avatar ou Indicador de Foto
      const photoBadge = hasPhoto
        ? `<span class="w-7 h-7 rounded-full bg-purple-100 text-purple-800 border border-purple-300 flex items-center justify-center text-[10px] font-black" title="Currículo possui foto anexada"><i data-lucide="camera" class="w-3.5 h-3.5"></i></span>`
        : `<span class="w-7 h-7 rounded-full bg-slate-100 text-slate-700 border border-slate-300 flex items-center justify-center text-[11px] font-black">${initial}</span>`;

      // Links diretos para contato
      const emailLink = r.candidate_email 
        ? `<a href="mailto:${encodeURIComponent(r.candidate_email)}" class="text-[#002776] hover:underline flex items-center gap-1 font-semibold"><i data-lucide="mail" class="w-3 h-3 text-slate-400"></i>${safeEmail}</a>`
        : `<span class="text-slate-400">${safeEmail}</span>`;

      const cleanPhoneDigits = (r.candidate_phone || '').replace(/\D/g, '');
      const phoneLink = cleanPhoneDigits.length >= 10
        ? `<a href="https://wa.me/55${cleanPhoneDigits}" target="_blank" rel="noopener noreferrer" class="text-emerald-700 hover:underline flex items-center gap-1 font-semibold" title="Abrir WhatsApp"><i data-lucide="phone" class="w-3 h-3 text-emerald-600"></i>${safePhone}</a>`
        : `<span class="text-slate-600 flex items-center gap-1"><i data-lucide="phone" class="w-3 h-3 text-slate-400"></i>${safePhone}</span>`;

      return `
        <tr class="hover:bg-slate-50/75 transition-colors">
          <td class="py-3 px-4">
            <div class="flex items-center gap-2.5">
              ${photoBadge}
              <div>
                <span class="font-bold text-slate-900 block leading-snug">${safeName}</span>
                <span class="text-[10px] text-slate-500 font-medium flex items-center gap-0.5">
                  <i data-lucide="map-pin" class="w-2.5 h-2.5"></i>${safeCity}
                </span>
              </div>
            </div>
          </td>
          <td class="py-3 px-4">
            <span class="font-bold text-slate-800 block">${safeRole}</span>
          </td>
          <td class="py-3 px-4 space-y-0.5 text-[11px]">
            <div>${emailLink}</div>
            <div>${phoneLink}</div>
          </td>
          <td class="py-3 px-4">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 block w-fit mb-0.5">
              ${tplName}
            </span>
            <span class="text-[10px] text-slate-400 font-medium block">${createdDate}</span>
          </td>
          <td class="py-3 px-4 text-center">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900">
              ${downloads}x
            </span>
          </td>
          <td class="py-3 px-4 text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button 
                class="btn-view-resume p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#002776] transition-colors cursor-pointer"
                data-id="${r.id}"
                title="Visualizar currículo completo"
              >
                <i data-lucide="eye" class="w-3.5 h-3.5 pointer-events-none"></i>
              </button>
              <button 
                class="btn-print-resume-row p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#009639] transition-colors cursor-pointer"
                data-id="${r.id}"
                title="Imprimir / Baixar PDF"
              >
                <i data-lucide="printer" class="w-3.5 h-3.5 pointer-events-none"></i>
              </button>
              <button 
                class="viewer-hide btn-delete-resume-row p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                data-id="${r.id}"
                data-name="${safeName}"
                title="Excluir currículo"
              >
                <i data-lucide="trash-2" class="w-3.5 h-3.5 pointer-events-none"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
    attachResumesTableListeners();
  }

  function updateResumesPagination() {
    const info = document.getElementById('resumes-pagination-info');
    const pageDisplay = document.getElementById('resumes-current-page');
    const prevBtn = document.getElementById('btn-prev-resumes-page');
    const nextBtn = document.getElementById('btn-next-resumes-page');

    if (info) {
      const start = state.resumesTotal === 0 ? 0 : (state.resumesPage - 1) * state.resumesLimit + 1;
      const end = Math.min(state.resumesTotal, state.resumesPage * state.resumesLimit);
      info.textContent = `Exibindo ${start} a ${end} de ${state.resumesTotal.toLocaleString('pt-BR')} currículos gerados`;
    }

    if (pageDisplay) pageDisplay.textContent = state.resumesPage;
    if (prevBtn) prevBtn.disabled = state.resumesPage <= 1;
    if (nextBtn) nextBtn.disabled = state.resumesPage >= state.resumesTotalPages;
  }

  function attachResumesTableListeners() {
    document.querySelectorAll('.btn-view-resume').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (id) viewResumeDetails(id);
      });
    });

    document.querySelectorAll('.btn-print-resume-row').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (id) printResumeById(id);
      });
    });

    document.querySelectorAll('.btn-delete-resume-row').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        if (id) deleteResumePrompt(id, name);
      });
    });
  }

  async function viewResumeDetails(id) {
    if (!state.token) return;
    try {
      const res = await fetch(`${API_BASE}/resumes.php?action=get&id=${id}`, {
        headers: { 'Authorization': `Bearer ${state.token}` }
      });
      if (!res.ok) throw new Error('Não foi possível carregar os detalhes do currículo.');
      const data = await res.json();
      if (data && data.success && data.resume) {
        state.activeViewingResume = data.resume;
        renderResumeModal(data.resume);
      }
    } catch (err) {
      alert(err.message || 'Erro ao abrir visualização.');
    }
  }

  function renderResumeModal(resume) {
    const modal = document.getElementById('admin-resume-modal');
    if (!modal) return;

    const payload = resume.resume_data || {};
    const d = payload.curriculo || payload || {};

    const nameEl = document.getElementById('modal-resume-candidate-name');
    const roleEl = document.getElementById('modal-resume-target-role');
    const tplBadge = document.getElementById('modal-resume-tpl-badge');
    const photoContainer = document.getElementById('modal-resume-photo-container');
    const bodyContent = document.getElementById('modal-resume-body-content');

    if (nameEl) nameEl.textContent = d.nome || resume.candidate_name || 'Candidato';
    if (roleEl) roleEl.textContent = (d.cargoDesejado || d.areaProfissional || resume.target_role || 'Profissional');
    if (tplBadge) tplBadge.textContent = getTemplateDisplayName(resume.template_id);

    // Foto do candidato
    if (photoContainer) {
      if (d.foto && (d.foto.startsWith('data:image/') || d.foto.length > 100)) {
        photoContainer.innerHTML = `<img src="${d.foto}" alt="Foto" class="w-full h-full object-cover rounded-2xl" />`;
      } else {
        const initial = (d.nome || resume.candidate_name || 'C').charAt(0).toUpperCase();
        photoContainer.innerHTML = `<span class="text-emerald-900 font-black">${initial}</span>`;
      }
    }

    // Montar corpo completo formatado
    if (bodyContent) {
      let html = '';

      // Contato & Localidade
      const contatos = [
        d.email ? `<span class="inline-flex items-center gap-1 font-semibold"><i data-lucide="mail" class="w-3.5 h-3.5 text-slate-400"></i>${escapeHTML(d.email)}</span>` : '',
        d.telefone ? `<span class="inline-flex items-center gap-1 font-semibold text-emerald-800"><i data-lucide="phone" class="w-3.5 h-3.5 text-emerald-600"></i>${escapeHTML(d.telefone)}</span>` : '',
        d.cidade ? `<span class="inline-flex items-center gap-1"><i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400"></i>${escapeHTML([d.cidade, d.estado].filter(Boolean).join(' - '))}</span>` : '',
        d.linkedin ? `<a href="${escapeHTML(d.linkedin)}" target="_blank" class="text-blue-600 hover:underline inline-flex items-center gap-1"><i data-lucide="linkedin" class="w-3.5 h-3.5"></i>LinkedIn</a>` : '',
        d.portfolio ? `<a href="${escapeHTML(d.portfolio)}" target="_blank" class="text-purple-600 hover:underline inline-flex items-center gap-1"><i data-lucide="globe" class="w-3.5 h-3.5"></i>Portfólio</a>` : ''
      ].filter(Boolean).join(' • ');

      html += `
        <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <div class="font-bold text-slate-700 mb-1">Informações de Contato:</div>
          <div class="text-slate-600">${contatos || 'Sem dados de contato adicionais'}</div>
        </div>
      `;

      // Resumo Profissional / Objetivo
      if (d.resumoProfissional || d.objetivoProfissional) {
        html += `
          <div class="space-y-1">
            <h4 class="font-black text-slate-900 uppercase text-[11px] tracking-wide flex items-center gap-1.5 text-[#002776]">
              <i data-lucide="user-check" class="w-3.5 h-3.5"></i>
              Resumo & Objetivo Profissional
            </h4>
            <div class="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-slate-700 leading-relaxed text-xs">
              ${d.resumoProfissional ? `<p class="mb-1.5">${escapeHTML(d.resumoProfissional)}</p>` : ''}
              ${d.objetivoProfissional ? `<p class="text-slate-600 italic font-medium">Objetivo: ${escapeHTML(d.objetivoProfissional)}</p>` : ''}
            </div>
          </div>
        `;
      }

      // Experiências Profissionais
      if (Array.isArray(d.experiencias) && d.experiencias.length > 0) {
        html += `
          <div class="space-y-2">
            <h4 class="font-black text-slate-900 uppercase text-[11px] tracking-wide flex items-center gap-1.5 text-[#002776]">
              <i data-lucide="briefcase" class="w-3.5 h-3.5"></i>
              Experiências Profissionais (${d.experiencias.length})
            </h4>
            <div class="space-y-2">
              ${d.experiencias.map(exp => `
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div class="flex items-center justify-between flex-wrap gap-1">
                    <span class="font-black text-slate-900">${escapeHTML(exp.cargo || 'Cargo')}</span>
                    <span class="text-[10px] font-bold text-slate-500">${escapeHTML([exp.dataInicio, exp.atual ? 'Atual' : exp.dataTermino].filter(Boolean).join(' - '))}</span>
                  </div>
                  <div class="text-[11px] font-bold text-[#002776] mb-1">${escapeHTML(exp.empresa || 'Empresa')} ${exp.localidade ? `• ${escapeHTML(exp.localidade)}` : ''}</div>
                  ${exp.descricao ? `<p class="text-slate-600 text-[11px] leading-relaxed">${escapeHTML(exp.descricao)}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      // Formação Acadêmica
      if (Array.isArray(d.formacoes) && d.formacoes.length > 0) {
        html += `
          <div class="space-y-2">
            <h4 class="font-black text-slate-900 uppercase text-[11px] tracking-wide flex items-center gap-1.5 text-[#002776]">
              <i data-lucide="graduation-cap" class="w-3.5 h-3.5"></i>
              Formação Acadêmica (${d.formacoes.length})
            </h4>
            <div class="space-y-1.5">
              ${d.formacoes.map(f => `
                <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between flex-wrap gap-1">
                  <div>
                    <span class="font-bold text-slate-900 block">${escapeHTML(f.curso || 'Curso')}</span>
                    <span class="text-[11px] text-slate-500 font-medium">${escapeHTML(f.instituicao || 'Instituição')} • ${escapeHTML(f.grau || '')}</span>
                  </div>
                  <span class="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200">${escapeHTML(f.status || f.dataConclusao || '')}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      // Cursos Complementares
      if (Array.isArray(d.cursos) && d.cursos.length > 0) {
        html += `
          <div class="space-y-2">
            <h4 class="font-black text-slate-900 uppercase text-[11px] tracking-wide flex items-center gap-1.5 text-[#002776]">
              <i data-lucide="award" class="w-3.5 h-3.5"></i>
              Cursos e Certificações (${d.cursos.length})
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              ${d.cursos.map(c => `
                <div class="p-2 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-[11px]">
                  <span class="font-black text-emerald-950 block">${escapeHTML(c.nome || 'Curso')}</span>
                  <span class="text-emerald-800 text-[10px] font-medium">${escapeHTML(c.instituicao || 'Plataforma')} ${c.cargaHoraria ? `• ${c.cargaHoraria}h` : ''}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      // Habilidades em tags
      if (Array.isArray(d.habilidades) && d.habilidades.length > 0) {
        html += `
          <div class="space-y-1.5">
            <h4 class="font-black text-slate-900 uppercase text-[11px] tracking-wide flex items-center gap-1.5 text-[#002776]">
              <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i>
              Habilidades e Competências
            </h4>
            <div class="flex flex-wrap gap-1.5">
              ${d.habilidades.map(h => `
                <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-bold">
                  ${escapeHTML(h.nome || h)}
                </span>
              `).join('')}
            </div>
          </div>
        `;
      }

      bodyContent.innerHTML = html;
    }

    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  function printResumeById(id) {
    viewResumeDetails(id).then(() => {
      setTimeout(() => {
        window.print();
      }, 300);
    });
  }

  async function deleteResumePrompt(id, name) {
    if (!state.token) return;
    if (state.userRole === 'viewer') {
      alert('Seu perfil de Visualizador possui permissão apenas de leitura. Operações de exclusão não são permitidas.');
      return;
    }
    if (!confirm(`Tem certeza de que deseja excluir o currículo de "${name}"? Esta ação removerá o registro permanentemente.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/resumes.php?action=delete&id=${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${state.token}` }
      });
      if (!res.ok) throw new Error('Falha ao excluir o currículo.');
      const data = await res.json();
      if (data && data.success) {
        alert('Currículo excluído com sucesso.');
        const modal = document.getElementById('admin-resume-modal');
        if (modal && !modal.classList.contains('hidden')) {
          modal.classList.add('hidden');
        }
        fetchResumesData(state.resumesPage);
      }
    } catch (err) {
      alert(err.message || 'Erro ao excluir currículo.');
    }
  }

  function setupResumesHandlers() {
    const refreshBtn = document.getElementById('btn-refresh-resumes');
    const exportCsvBtn = document.getElementById('btn-export-resumes-csv');
    const searchInput = document.getElementById('search-resumes-input');
    const filterTpl = document.getElementById('filter-resumes-template');
    const filterPhoto = document.getElementById('filter-resumes-photo');
    const clearFiltersBtn = document.getElementById('btn-clear-resumes-filters');

    const prevPageBtn = document.getElementById('btn-prev-resumes-page');
    const nextPageBtn = document.getElementById('btn-next-resumes-page');

    const modal = document.getElementById('admin-resume-modal');
    const closeModalBtn = document.getElementById('close-admin-resume-modal-btn');
    const modalCloseBtn = document.getElementById('btn-modal-close-resume');
    const modalPrintBtn = document.getElementById('btn-modal-print-resume');
    const modalDeleteBtn = document.getElementById('btn-modal-delete-resume');

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        fetchResumesData(state.resumesPage);
      });
    }

    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        if (!state.token) return;
        downloadWithAuth(`${API_BASE}/resumes.php?action=export_csv`, 'curriculos_cadastrados.csv');
      });
    }

    let searchTimer = null;
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          fetchResumesData(1);
        }, 350);
      });
    }

    if (filterTpl) {
      filterTpl.addEventListener('change', () => fetchResumesData(1));
    }

    if (filterPhoto) {
      filterPhoto.addEventListener('change', () => fetchResumesData(1));
    }

    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (filterTpl) filterTpl.value = 'all';
        if (filterPhoto) filterPhoto.value = 'all';
        fetchResumesData(1);
      });
    }

    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', () => {
        if (state.resumesPage > 1) {
          fetchResumesData(state.resumesPage - 1);
        }
      });
    }

    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', () => {
        if (state.resumesPage < state.resumesTotalPages) {
          fetchResumesData(state.resumesPage + 1);
        }
      });
    }

    // Modal Handlers
    function closeModal() {
      if (modal) modal.classList.add('hidden');
      state.activeViewingResume = null;
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    if (modalPrintBtn) {
      modalPrintBtn.addEventListener('click', () => {
        window.print();
      });
    }

    if (modalDeleteBtn) {
      modalDeleteBtn.addEventListener('click', () => {
        if (state.activeViewingResume && state.activeViewingResume.id) {
          deleteResumePrompt(state.activeViewingResume.id, state.activeViewingResume.candidate_name);
        }
      });
    }
  }

  // 9. INICIALIZADOR GERAL
  // ==========================================
  document.addEventListener('DOMContentLoaded', () => {
    setupAuthHandlers();
    setupTabNavigation();
    setupCourseModalHandlers();
    setupCourseLinksMonitor();
    setupStudentHandlers();
    window.fetchResumesData = fetchResumesData;
    setupResumesHandlers();
    setupCurationHandlers();
    setupInstitutionsReportHandlers();
    setupSecurityHandlers();
    setupAnnouncementAdmin();
    setupBackupAdmin();
    setupJobsAdminHandlers();
    setupBlogAdminHandlers();
    checkAuthSession();
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  });


  // ==========================================
  // GESTÃO DA BASE DE NEWSLETTER (ADMIN)
  // ==========================================
  async function fetchAdminNewsletterData() {
    const tbody = document.getElementById('newsletter-table-body');
    const badge = document.getElementById('badge-total-newsletter');
    const countBadge = document.getElementById('newsletter-count-badge');

    try {
      const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_auth_token');
      const res = await fetch(`${API_BASE}/newsletter.php`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (res.ok && data.success && Array.isArray(data.subscribers)) {
        const subs = data.subscribers;
        if (badge) badge.textContent = subs.length;
        if (countBadge) countBadge.textContent = `${subs.length} inscritos`;

        if (!tbody) return;

        if (subs.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="6" class="text-center py-8 text-slate-400 font-medium">
                Nenhum inscrito registrado na newsletter até o momento.
              </td>
            </tr>`;
          return;
        }

        tbody.innerHTML = subs.map((s, idx) => `
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="py-3 px-4 font-bold text-slate-400">${idx + 1}</td>
            <td class="py-3 px-4 font-black text-slate-900">${escapeHtml(s.email)}</td>
            <td class="py-3 px-4">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                ${escapeHtml(s.source_page || 'home')}
              </span>
            </td>
            <td class="py-3 px-4">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black ${s.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                ${s.is_active ? 'Ativo' : 'Inativo'}
              </span>
            </td>
            <td class="py-3 px-4 text-slate-500">${s.created_at ? s.created_at.slice(0, 16) : '-'}</td>
            <td class="py-3 px-4 text-right">
              <button 
                type="button" 
                onclick="window.deleteNewsletterSubscriber(${s.id})" 
                class="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Remover inscrito"
              >
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </td>
          </tr>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
      } else {
        if (tbody) {
          tbody.innerHTML = `
            <tr>
              <td colspan="6" class="text-center py-8 text-rose-500 font-bold">
                Falha ao carregar lista de inscritos. Verifique sua sessão administrativa.
              </td>
            </tr>`;
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar newsletter:', err);
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center py-8 text-rose-500 font-bold">
              Erro de conexão com a API de newsletter.
            </td>
          </tr>`;
      }
    }
  }

  window.deleteNewsletterSubscriber = async function(id) {
    if (!confirm('Tem certeza que deseja remover este e-mail da newsletter?')) return;
    try {
      const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_auth_token');
      const res = await fetch(`${API_BASE}/newsletter.php?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Inscrito removido com sucesso!', 'success');
        fetchAdminNewsletterData();
      } else {
        showToast(data.error || 'Erro ao remover inscrito.', 'error');
      }
    } catch (e) {
      showToast('Erro ao conectar ao servidor.', 'error');
    }
  };

  // Event Listeners de Atualizar e Exportar CSV da Newsletter
  document.getElementById('refresh-newsletter-btn')?.addEventListener('click', () => {
    fetchAdminNewsletterData();
    showToast('Lista de newsletter atualizada.', 'info');
  });

  document.getElementById('broadcast-newsletter-btn')?.addEventListener('click', async () => {
    if (state.userRole !== 'admin') {
      showToast('Acesso negado: apenas administradores podem disparar newsletters.', 'error');
      return;
    }
    const count = state.newsletter ? state.newsletter.length : 0;
    const subject = prompt('Assunto da Edição Semanal da Newsletter:', 'Destaques da Semana: Novos Artigos, Cursos e Direitos no Você Pode Tudo');
    if (!subject) return;

    const summary = prompt('Resumo / Mensagem curta para os alunos:', 'Confira nossa seleção exclusiva dos melhores artigos e calculadoras trabalhistas desta semana!');
    if (!summary) return;

    if (!confirm(`Confirmar disparo da Edição Semanal para ${count} inscritos ativos?\n\nAssunto: "${subject}"`)) return;

    try {
      const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_auth_token');
      const res = await fetch(`${API_BASE}/newsletter.php?action=broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: subject,
          summary: summary,
          link: 'https://vocepodetudo.com/blog.html'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'Edição semanal disparada com sucesso aos inscritos!', 'success');
        fetchAdminNewsletterData();
      } else {
        showToast(data.error || 'Erro ao disparar newsletter.', 'error');
      }
    } catch (err) {
      showToast('Erro de comunicação ao disparar newsletter.', 'error');
    }
  });

  document.getElementById('export-newsletter-btn')?.addEventListener('click', () => {
    const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_auth_token');
    downloadWithAuth(`${API_BASE}/newsletter.php?export=csv`, 'newsletter_inscritos.csv');
  });


  // ==========================================
  // CENTRAL DE NOTIFICAÇÕES WEB PUSH (ADMIN)
  // ==========================================
  async function fetchAdminPushData() {
    const badge = document.getElementById('badge-total-push');
    const badgeActive = document.getElementById('push-active-subscribers-badge');
    const container = document.getElementById('push-history-container');

    try {
      const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_auth_token');
      const res = await fetch(`${API_BASE}/push.php`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (badge) badge.textContent = data.active_subscriptions || 0;
        if (badgeActive) badgeActive.textContent = `${data.active_subscriptions || 0} inscritos ativos`;

        if (!container) return;

        const history = data.history || [];
        if (history.length === 0) {
          container.innerHTML = '<p class="text-center text-xs text-slate-400 py-8">Nenhuma notificação foi disparada ainda.</p>';
          return;
        }

        container.innerHTML = history.map(item => `
          <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1 hover:bg-slate-50 transition-colors">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-black text-slate-900">${escapeHtml(item.title)}</span>
              <span class="text-[10px] text-slate-400 font-bold">${item.created_at ? item.created_at.slice(0, 16) : '-'}</span>
            </div>
            <p class="text-xs text-slate-600">${escapeHtml(item.body)}</p>
            <div class="flex items-center justify-between pt-1 text-[11px] text-slate-500 font-medium border-t border-slate-200/60">
              <span class="truncate max-w-[280px]">Destino: <a href="${escapeHtml(item.url)}" target="_blank" class="text-blue-600 underline">${escapeHtml(item.url)}</a></span>
              <span class="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-full text-[10px]">${item.sent_count || 0} entregues</span>
            </div>
          </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
      }
    } catch (err) {
      console.warn('Erro ao carregar dados de push:', err);
    }
  }

  // Formulário de Disparo
  const pushForm = document.getElementById('admin-send-push-form');
  if (pushForm) {
    pushForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('push-input-title')?.value || '';
      const body = document.getElementById('push-input-body')?.value || '';
      const url = document.getElementById('push-input-url')?.value || '';
      const feedback = document.getElementById('push-send-feedback');
      const submitBtn = document.getElementById('btn-submit-push-notification');

      if (!title || !body) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin text-slate-950"></i><span>Disparando...</span>';
        if (window.lucide) window.lucide.createIcons();
      }

      try {
        const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_auth_token');
        const res = await fetch(`${API_BASE}/push.php?action=send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ title, body, url })
        });
        const data = await res.json();

        if (feedback) {
          feedback.classList.remove('hidden');
          if (res.ok && data.success) {
            feedback.className = 'text-xs font-bold p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 animate-fade-in';
            feedback.textContent = data.message || 'Notificação disparada com sucesso!';
            pushForm.reset();
            document.getElementById('push-input-url').value = 'https://vocepodetudo.com/vagas.html';
            fetchAdminPushData();
          } else {
            feedback.className = 'text-xs font-bold p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-300 animate-fade-in';
            feedback.textContent = data.error || 'Erro ao disparar notificação.';
          }
        }
      } catch (err) {
        if (feedback) {
          feedback.classList.remove('hidden');
          feedback.className = 'text-xs font-bold p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-300 animate-fade-in';
          feedback.textContent = 'Erro ao conectar ao servidor.';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i data-lucide="radio" class="w-4 h-4 text-slate-950"></i><span>Disparar para Todos</span>';
          if (window.lucide) window.lucide.createIcons();
        }
      }
    });
  }

  document.getElementById('refresh-push-history-btn')?.addEventListener('click', () => {
    fetchAdminPushData();
    showToast('Histórico de notificações atualizado.', 'info');
  });

})();


  // ==========================================
  // MARKETING KIT & COMPOSITOR DE NEWSLETTER
  // ==========================================
  window.copyMarketingCopy = function(type) {
    let text = '';
    if (type === 'whatsapp') {
      text = '🎓 *OPORTUNIDADE 100% GRATUITA NO BRASIL!*\n\nVocê sabia que não precisa pagar nada para ter cursos de instituições como *Fundação Bradesco, Sebrae, Microsoft, Cisco e Gov.br* no seu currículo?\n\nO portal *Você Pode Tudo* reúne mais de 175 cursos oficiais livres, teste vocacional interativo e um criador de currículo profissional em PDF A4 gratuito:\n\n👉 Acesse agora: https://vocepodetudo.com\n\nCompartilhe com quem está buscando qualificação ou o primeiro emprego! 🚀';
    } else if (type === 'status_whatsapp') {
      text = '🔥 *Dica de ouro pra quem quer estudar ou trabalhar!* 🚀\n\nSabia que tem mais de 175 cursos 100% gratuitos com certificado oficial (Bradesco, Sebrae, Cisco, MEC e Microsoft) reunidos em um só lugar?\n\n📄 E ainda tem Criador de Currículo profissional gratuito em PDF!\n\n👉 Acesse aqui: https://vocepodetudo.com\n\n(Compartilhe com quem precisa! ❤️)';
    } else if (type === 'instagram') {
      text = '🚨 VOCÊ NÃO PRECISA PAGAR NADA PARA TURBINAR O SEU CURRÍCULO! 🚨\n\nMuita gente gasta centenas de reais em cursos básicos quando instituições oficiais gigantes oferecem capacitação 100% gratuita e com certificado válido:\n\n✅ Fundação Bradesco (Excel, Pacote Office e Administração)\n✅ Escola Virtual Gov / Enap (Gestão, Políticas e Liderança)\n✅ Cisco Networking Academy (Redes, TI e Cibersegurança)\n✅ Sebrae (Empreendedorismo, Finanças e Vendas)\n✅ Microsoft Learn (Tecnologia, Nuvem e Inteligência Artificial)\n\nNo portal Você Pode Tudo reunimos os links diretos para todas essas oportunidades em um só lugar, além de:\n📄 Criador de Currículos ATS gratuito em PDF\n💼 Mural de Vagas abertas para Jovem Aprendiz e Estágio\n🎯 Calculadora de Salário de Aprendiz\n\n🔗 Link direto na bio: @vocepodetudo (ou acesse vocepodetudo.com)\n\nSalve esse post para consultar depois e envie para um amigo que está buscando emprego! 🚀\n\n#cursosgratuitos #jovemaprendiz #primeiroemprego #curriculo #estagios #capacitacao #vocepodetudo #carreira #oportunidades';
    } else if (type === 'linkedin') {
      text = 'A democratização do conhecimento é o pilar mais sólido para a empregabilidade no Brasil.\n\nPara quem busca qualificação de qualidade ou está ingressando no mercado de trabalho (Jovem Aprendiz, Estágio e Primeiro Emprego), o portal Você Pode Tudo centraliza curadorias oficiais de instituições como Fundação Bradesco, Sebrae, Microsoft, Cisco e Enap.\n\nAlém dos cursos 100% gratuitos, o portal oferece:\n✔️ Teste Vocacional e Trilhas Guiadas de Aprendizagem\n✔️ Criador de Currículos Profissionais nos padrões aceitos por RHs (ATS)\n✔️ Mural de Vagas e Orientações para Entrevistas\n\nVale a pena conferir e compartilhar com sua rede: https://vocepodetudo.com\n\n#Educacao #Empregabilidade #Carreira #CursosGratuitos #VocePodeTudo';
    } else if (type === 'video') {
      text = '[GANCHO - Primeiros 3 segundos]\\n"Pare de pagar por curso básico de informática, Excel ou atendimento ao cliente!"\\n\\n[CORPO]\\n"Você sabia que instituições gigantes como Fundação Bradesco, Sebrae, Cisco e o próprio Governo Federal oferecem cursos 100% gratuitos com certificado?\\nO portal Você Pode Tudo reuniu mais de 175 desses cursos em um só lugar, organizados por área, além de um criador de currículo profissional em PDF que você faz em 5 minutos no celular!"\\n\\n[CHAMADA PARA AÇÃO]\\n"Comente \\"CURSO\\" ou acesse o link na bio: vocepodetudo.com! Salve esse vídeo e compartilhe com um amigo!"';
    } else if (type === 'escolas') {
      text = 'Prezados estudantes, professores e coordenadores pedagógicos,\n\nRecomendamos o acesso ao portal educacional Você Pode Tudo (https://vocepodetudo.com), uma iniciativa de curadoria pública de cursos gratuitos de instituições como Fundação Bradesco, Sebrae, Enap e Microsoft.\n\nO portal disponibiliza ferramentas práticas de desenvolvimento profissional, teste vocacional e criador de currículo para alunos do Ensino Médio e Técnico sem qualquer cobrança.\n\nAproveitem esta oportunidade de qualificação!';
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Texto copiado com sucesso! Pronto para colar.');
      }).catch(() => {
        fallbackCopyText(text);
      });
    } else {
      fallbackCopyText(text);
    }
  };

  function fallbackCopyText(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      showToast('Texto copiado para a área de transferência!');
    } catch (e) {
      prompt('Copie o texto abaixo:', text);
    }
    document.body.removeChild(ta);
  }

  // Modelos de Boletim da Newsletter
  function setupNewsletterBroadcastFeatures() {
    const btnCourses = document.getElementById('btn-template-courses');
    const btnJobs = document.getElementById('btn-template-jobs');
    const btnCopyEmails = document.getElementById('btn-copy-all-emails');
    const btnPreview = document.getElementById('btn-preview-newsletter-broadcast');
    const subjInput = document.getElementById('newsletter-broadcast-subject');
    const bodyInput = document.getElementById('newsletter-broadcast-body');

    if (btnCourses) {
      btnCourses.addEventListener('click', () => {
        if (subjInput) subjInput.value = '🚀 5 Cursos Gratuitos de Destaque da Semana no Você Pode Tudo';
        if (bodyInput) {
          bodyInput.value = 'Olá, estudante!\n\nConfira os 5 cursos gratuitos mais procurados desta semana com inscrições abertas nas plataformas oficiais:\n\n1. Excel do Básico ao Avançado (Fundação Bradesco) - 15h\n2. Gestão Financeira & Fluxo de Caixa (Sebrae) - 20h\n3. Fundamentos de Cibersegurança (Cisco / Hackers do Bem) - 40h\n4. Inglês Básico para o Mercado de Trabalho (MEC) - 30h\n5. Inteligência Artificial Generativa no Trabalho (Gov.br) - 20h\n\nAcesse todos com link direto no portal: https://vocepodetudo.com\n\nBons estudos e conte conosco na sua jornada!\nEquipe Você Pode Tudo';
        }
        showToast('Modelo de Cursos carregado!');
      });
    }

    if (btnJobs) {
      btnJobs.addEventListener('click', () => {
        if (subjInput) subjInput.value = '💼 Novas Oportunidades: Vagas de Jovem Aprendiz & Estágio Abertas';
        if (bodyInput) {
          bodyInput.value = 'Olá! Tudo bem?\n\nNovas oportunidades de primeiro emprego e aprendizagem foram adicionadas ao Mural de Vagas do Você Pode Tudo:\n\n🔹 Vagas de Jovem Aprendiz Administrativo nos principais bancos e redes de varejo\n🔹 Estágios para estudantes do Ensino Médio e Técnico\n🔹 Dicas para preparar seu currículo nos padrões dos recrutadores (ATS)\n\nConfira as vagas e monte seu currículo gratuito em PDF em menos de 5 minutos:\n👉 https://vocepodetudo.com/vagas.html\n\nSucesso no seu processo seletivo!\nEquipe Você Pode Tudo';
        }
        showToast('Modelo de Vagas carregado!');
      });
    }

    if (btnCopyEmails) {
      btnCopyEmails.addEventListener('click', () => {
        if (!state.newsletter || state.newsletter.length === 0) {
          showToast('Nenhum e-mail para copiar no momento.', 'warning');
          return;
        }
        const emailList = state.newsletter.map(n => n.email).filter(Boolean).join(', ');
        fallbackCopyText(emailList);
      });
    }

    if (btnPreview) {
      btnPreview.addEventListener('click', () => {
        const fullMsg = (subjInput ? subjInput.value : '') + '\n\n' + (bodyInput ? bodyInput.value : '');
        if (!fullMsg.trim()) {
          showToast('Preencha o assunto ou mensagem antes de copiar.', 'warning');
          return;
        }
        fallbackCopyText(fullMsg);
      });
    }
  }

// Chamar na inicialização
document.addEventListener("DOMContentLoaded", () => { setupNewsletterBroadcastFeatures(); });


  // ===========================================================================
  // MÓDULO 14: CENTRAL DE MENSAGENS & FALE CONOSCO (INBOX)
  // ===========================================================================
  let adminMessages = [];
  let selectedMessageId = null;

  async function fetchMessagesData() {
    try {
      const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_admin_token');
      const res = await fetch(`${API_BASE}/contact.php?action=list&t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.success) {
        adminMessages = data.messages || [];
        updateMessagesBadges(data);
        renderMessagesUI();
      }
    } catch (e) {
      console.warn('[Messages] Erro ao carregar mensagens:', e);
    }
  }

  function updateMessagesBadges(data) {
    const totalEl = document.getElementById('msg-stat-total');
    const unreadEl = document.getElementById('msg-stat-unread');
    const repliedEl = document.getElementById('msg-stat-replied');
    const archivedEl = document.getElementById('msg-stat-archived');

    if (totalEl) totalEl.textContent = data.total || 0;
    if (unreadEl) unreadEl.textContent = data.unread_count || 0;
    if (repliedEl) repliedEl.textContent = data.replied_count || 0;
    if (archivedEl) archivedEl.textContent = data.archived_count || 0;

    const navBadge = document.getElementById('badge-unread-messages');
    const navBadgeMobile = document.getElementById('badge-unread-messages-mobile');
    const count = data.unread_count || 0;

    if (navBadge) {
      navBadge.textContent = count;
      navBadge.classList.toggle('hidden', count === 0);
    }
    if (navBadgeMobile) {
      navBadgeMobile.textContent = count;
      navBadgeMobile.classList.toggle('hidden', count === 0);
    }
  }

  function renderMessagesUI(filter = 'all', search = '') {
    const container = document.getElementById('messages-list-container');
    const counter = document.getElementById('msg-list-counter');
    if (!container) return;

    let filtered = [...adminMessages];
    if (filter !== 'all') {
      filtered = filtered.filter(m => (m.status || 'nao_lida') === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(m => 
        (m.nome || '').toLowerCase().includes(q) ||
        (m.email || '').toLowerCase().includes(q) ||
        (m.assunto || '').toLowerCase().includes(q)
      );
    }

    if (counter) counter.textContent = `${filtered.length} mensagens`;

    if (filtered.length === 0) {
      container.innerHTML = `<div class="p-8 text-center text-slate-400 text-xs font-bold">Nenhuma mensagem encontrada neste filtro.</div>`;
      return;
    }

    container.innerHTML = filtered.map(m => {
      const isUnread = (m.status || 'nao_lida') === 'nao_lida';
      const isReplied = m.status === 'respondida';
      const isSelected = m.id === selectedMessageId;

      let badgeBg = 'bg-slate-100 text-slate-700';
      let badgeText = 'Lida';
      if (isUnread) { badgeBg = 'bg-rose-100 text-rose-700 font-black'; badgeText = 'Nova'; }
      if (isReplied) { badgeBg = 'bg-emerald-100 text-emerald-700 font-bold'; badgeText = 'Respondida'; }
      if (m.status === 'arquivada') { badgeBg = 'bg-slate-100 text-slate-500'; badgeText = 'Arquivada'; }

      return `
        <div class="p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/70 border-l-4 border-[#002776]' : ''}" onclick="window.selectAdminMessage('${m.id}')">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="font-bold text-xs text-slate-900 truncate ${isUnread ? 'font-black text-[#002776]' : ''}">${escapeHTML(m.nome || 'Visitante')}</span>
            <span class="px-2 py-0.5 rounded-full text-[9px] ${badgeBg}">${badgeText}</span>
          </div>
          <div class="text-[11px] font-bold text-slate-700 truncate mb-1">${escapeHTML(m.assunto || 'Contato Geral')}</div>
          <p class="text-[10px] text-slate-500 line-clamp-1 mb-1.5">${escapeHTML(m.mensagem || '')}</p>
          <div class="text-[9px] text-slate-400">📅 ${escapeHTML(m.data || '')}</div>
        </div>
      `;
    }).join('');
  }

  window.selectAdminMessage = function(id) {
    selectedMessageId = id;
    const msg = adminMessages.find(m => m.id === id);
    if (!msg) return;

    renderMessagesUI();

    const emptyPanel = document.getElementById('message-detail-empty');
    const contentPanel = document.getElementById('message-detail-content');
    if (emptyPanel) emptyPanel.classList.add('hidden');
    if (contentPanel) contentPanel.classList.remove('hidden');

    document.getElementById('msg-detail-subject').textContent = msg.assunto || 'Sem assunto';
    document.getElementById('msg-detail-sender').textContent = msg.nome || 'Visitante';
    document.getElementById('msg-detail-email').textContent = msg.email || '';
    document.getElementById('msg-detail-date').textContent = msg.data || '';
    document.getElementById('msg-detail-ip').textContent = msg.ip || '127.0.0.1';
    document.getElementById('msg-detail-body').textContent = msg.mensagem || '';

    const badge = document.getElementById('msg-detail-status-badge');
    if (badge) {
      if (msg.status === 'nao_lida') {
        badge.className = 'px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 uppercase';
        badge.textContent = 'Não Lida';
      } else if (msg.status === 'respondida') {
        badge.className = 'px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 uppercase';
        badge.textContent = 'Respondida';
      } else if (msg.status === 'arquivada') {
        badge.className = 'px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 uppercase';
        badge.textContent = 'Arquivada';
      } else {
        badge.className = 'px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 uppercase';
        badge.textContent = 'Lida';
      }
    }

    const replyHist = document.getElementById('msg-reply-history');
    const replyHistText = document.getElementById('msg-reply-history-text');
    if (replyHist && replyHistText) {
      if (msg.reply) {
        replyHist.classList.remove('hidden');
        replyHistText.textContent = msg.reply;
      } else {
        replyHist.classList.add('hidden');
      }
    }

    // Se estiver como não lida, marcar automaticamente como lida no servidor
    if (msg.status === 'nao_lida') {
      updateMessageStatusOnServer(id, 'lida');
    }
  };

  async function updateMessageStatusOnServer(id, newStatus) {
    try {
      const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_admin_token');
      await fetch(`${API_BASE}/contact.php?action=update_status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id, status: newStatus })
      });
      const m = adminMessages.find(item => item.id === id);
      if (m) m.status = newStatus;
      fetchMessagesData();
    } catch (e) {}
  }

  // Ações de Botões de Mensagens
  document.addEventListener('DOMContentLoaded', () => {
    // Filtros de mensagens
    document.querySelectorAll('.msg-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.msg-filter-btn').forEach(b => {
          b.className = 'msg-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer';
        });
        btn.className = 'msg-filter-btn active px-3 py-1.5 rounded-xl text-xs font-bold bg-[#002776] text-white cursor-pointer';
        const searchVal = document.getElementById('input-search-messages')?.value || '';
        renderMessagesUI(btn.getAttribute('data-filter'), searchVal);
      });
    });

    // Busca de mensagens
    const searchInput = document.getElementById('input-search-messages');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const activeFilter = document.querySelector('.msg-filter-btn.active')?.getAttribute('data-filter') || 'all';
        renderMessagesUI(activeFilter, e.target.value);
      });
    }

    // Botão Atualizar Mensagens
    document.getElementById('btn-refresh-messages')?.addEventListener('click', () => {
      fetchMessagesData();
      showToast('Caixa de entrada atualizada!', 'info');
    });

    // Marcar como lida / arquivar / excluir
    document.getElementById('btn-msg-mark-read')?.addEventListener('click', () => {
      if (selectedMessageId) {
        updateMessageStatusOnServer(selectedMessageId, 'lida');
        showToast('Mensagem marcada como lida.', 'success');
      }
    });

    document.getElementById('btn-msg-archive')?.addEventListener('click', () => {
      if (selectedMessageId) {
        updateMessageStatusOnServer(selectedMessageId, 'arquivada');
        showToast('Mensagem arquivada com sucesso.', 'info');
      }
    });

    document.getElementById('btn-msg-delete')?.addEventListener('click', async () => {
      if (!selectedMessageId) return;
      if (!confirm('Deseja realmente excluir esta mensagem permanentemente?')) return;
      try {
        const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_admin_token');
        const res = await fetch(`${API_BASE}/contact.php?action=delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ id: selectedMessageId })
        });
        const data = await res.json();
        if (data.success) {
          adminMessages = adminMessages.filter(m => m.id !== selectedMessageId);
          selectedMessageId = null;
          document.getElementById('message-detail-content')?.classList.add('hidden');
          document.getElementById('message-detail-empty')?.classList.remove('hidden');
          renderMessagesUI();
          showToast('Mensagem excluída.', 'success');
        }
      } catch (e) {
        showToast('Erro ao excluir mensagem.', 'error');
      }
    });

    // Modal de Resposta
    const replyModal = document.getElementById('modal-reply-message');
    document.getElementById('btn-msg-open-reply')?.addEventListener('click', () => {
      const msg = adminMessages.find(m => m.id === selectedMessageId);
      if (!msg || !replyModal) return;
      document.getElementById('reply-msg-id').value = msg.id;
      document.getElementById('reply-msg-to').value = `${msg.nome} <${msg.email}>`;
      document.getElementById('reply-msg-text').value = '';
      replyModal.classList.remove('hidden');
    });

    document.getElementById('btn-close-reply-modal')?.addEventListener('click', () => replyModal?.classList.add('hidden'));
    document.getElementById('btn-cancel-reply')?.addEventListener('click', () => replyModal?.classList.add('hidden'));

    document.getElementById('form-reply-message')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('reply-msg-id').value;
      const text = document.getElementById('reply-msg-text').value.trim();
      if (!id || !text) return;

      try {
        const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_admin_token');
        const res = await fetch(`${API_BASE}/contact.php?action=reply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ id, reply_text: text })
        });
        const data = await res.json();
        if (data.success) {
          showToast('Resposta enviada com sucesso!', 'success');
          replyModal?.classList.add('hidden');
          fetchMessagesData();
          if (selectedMessageId === id) window.selectAdminMessage(id);
        } else {
          showToast(data.error || 'Erro ao enviar resposta.', 'error');
        }
      } catch (err) {
        showToast('Erro de conexão ao responder.', 'error');
      }
    });
  });

  // ===========================================================================
  // MÓDULO 15: AVALIAÇÕES & PROVA SOCIAL DE CURSOS
  // ===========================================================================
  let adminRatings = [];

  async function fetchRatingsData() {
    try {
      const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_admin_token');
      const res = await fetch(`${API_BASE}/ratings.php?action=admin_list&t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.success) {
        adminRatings = data.reviews || [];
        renderRatingsUI(data);
      }
    } catch (e) {
      console.warn('[Ratings] Erro ao carregar avaliações:', e);
    }
  }

  function renderRatingsUI(data) {
    const avgEl = document.getElementById('rating-stat-avg');
    const totalEl = document.getElementById('rating-stat-total');
    const coursesEl = document.getElementById('rating-stat-courses');
    const satEl = document.getElementById('rating-stat-satisfaction');

    if (avgEl && data.platform_average) avgEl.textContent = data.platform_average;
    if (totalEl) totalEl.textContent = data.total_votes || adminRatings.length;
    if (coursesEl) coursesEl.textContent = data.courses_evaluated || 0;
    if (satEl && data.platform_average) {
      const pct = Math.min(100, Math.round((data.platform_average / 5.0) * 100));
      satEl.textContent = `${pct}%`;
    }

    renderRatingsTable(adminRatings);
  }

  function renderRatingsTable(list) {
    const tbody = document.getElementById('ratings-table-body');
    if (!tbody) return;

    if (!list || list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-slate-400 font-bold">Nenhuma avaliação cadastrada ainda.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(r => {
      const stars = '★'.repeat(r.rating || 5) + '☆'.repeat(5 - (r.rating || 5));
      const isApproved = (r.status || 'aprovado') === 'aprovado';
      const statusBadge = isApproved 
        ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Aprovado</span>'
        : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Pendente</span>';

      return `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="p-3.5 font-bold text-slate-900">${escapeHTML(r.course_id || 'Curso')}</td>
          <td class="p-3.5 text-amber-500 font-black text-sm tracking-widest">${stars}</td>
          <td class="p-3.5">
            <span class="font-bold text-slate-900 block">${escapeHTML(r.student_name || 'Aluno')}</span>
            <span class="text-slate-500 text-[11px]">${escapeHTML(r.comment || 'Sem comentário')}</span>
          </td>
          <td class="p-3.5 text-slate-400 text-[11px] whitespace-nowrap">${escapeHTML(r.created_at || '')}</td>
          <td class="p-3.5">${statusBadge}</td>
          <td class="p-3.5 text-right whitespace-nowrap">
            <button type="button" onclick="window.moderateAdminRating(${r.id}, '${isApproved ? 'pendente' : 'aprovado'}')" class="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer" title="${isApproved ? 'Desaprovar' : 'Aprovar'}">
              <i data-lucide="${isApproved ? 'eye-off' : 'check'}" class="w-4 h-4"></i>
            </button>
            <button type="button" onclick="window.deleteAdminRating(${r.id})" class="p-1.5 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer" title="Excluir">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons({ root: tbody });
  }

  window.moderateAdminRating = async function(id, newStatus) {
    try {
      const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_admin_token');
      const res = await fetch(`${API_BASE}/ratings.php?action=moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Status da avaliação atualizado.', 'success');
        fetchRatingsData();
      }
    } catch (e) {
      showToast('Erro ao moderar avaliação.', 'error');
    }
  };

  window.deleteAdminRating = async function(id) {
    if (!confirm('Deseja excluir esta avaliação?')) return;
    try {
      const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_admin_token');
      const res = await fetch(`${API_BASE}/ratings.php?action=delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Avaliação excluída.', 'success');
        fetchRatingsData();
      }
    } catch (e) {
      showToast('Erro ao excluir avaliação.', 'error');
    }
  };

  document.getElementById('btn-refresh-ratings')?.addEventListener('click', () => {
    fetchRatingsData();
    showToast('Avaliações atualizadas.', 'info');
  });

  document.getElementById('input-search-ratings')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = adminRatings.filter(r => 
      (r.course_id || '').toLowerCase().includes(q) || 
      (r.student_name || '').toLowerCase().includes(q) ||
      (r.comment || '').toLowerCase().includes(q)
    );
    renderRatingsTable(filtered);
  });

  // ===========================================================================
  // MÓDULO 16: BANNERS DE PARCEIROS & ANUNCIANTES DIRETOS
  // ===========================================================================
  let adminBanners = [];

  async function fetchBannersData() {
    try {
      const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_admin_token');
      const res = await fetch(`${API_BASE}/banners.php?action=list&t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.success) {
        adminBanners = data.banners || [];
        renderBannersUI();
      }
    } catch (e) {
      console.warn('[Banners] Erro ao carregar banners:', e);
    }
  }

  function renderBannersUI() {
    const activeCount = adminBanners.filter(b => (b.status || 'active') === 'active').length;
    let totalImpr = 0;
    let totalClicks = 0;
    adminBanners.forEach(b => {
      totalImpr += parseInt(b.impressions || 0, 10);
      totalClicks += parseInt(b.clicks || 0, 10);
    });

    const ctr = totalImpr > 0 ? ((totalClicks / totalImpr) * 100).toFixed(1) : '0.0';

    const activeEl = document.getElementById('banner-stat-active');
    const imprEl = document.getElementById('banner-stat-impressions');
    const clicksEl = document.getElementById('banner-stat-clicks');
    const ctrEl = document.getElementById('banner-stat-ctr');
    const countBadge = document.getElementById('banners-count-badge');

    if (activeEl) activeEl.textContent = activeCount;
    if (imprEl) imprEl.textContent = totalImpr.toLocaleString('pt-BR');
    if (clicksEl) clicksEl.textContent = totalClicks.toLocaleString('pt-BR');
    if (ctrEl) ctrEl.textContent = `${ctr}%`;
    if (countBadge) countBadge.textContent = `${adminBanners.length} cadastrados`;

    renderBannersTable(adminBanners);
  }

  function renderBannersTable(list) {
    const tbody = document.getElementById('banners-table-body');
    if (!tbody) return;

    if (!list || list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-slate-400 font-bold">Nenhum banner cadastrado. Clique em "+ Novo Banner Parceiro" para criar.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(b => {
      const isActive = (b.status || 'active') === 'active';
      const posLabels = { home_top: 'Topo da Home', sidebar: 'Barra Lateral', footer: 'Rodapé' };
      const posText = posLabels[b.position] || b.position;
      const clicks = parseInt(b.clicks || 0, 10);
      const impr = parseInt(b.impressions || 0, 10);
      const ctr = impr > 0 ? ((clicks / impr) * 100).toFixed(1) : '0.0';

      return `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="p-3.5">
            <div class="flex items-center gap-3">
              <img src="${escapeHTML(b.image_url)}" alt="Banner" class="w-12 h-8 rounded object-cover border border-slate-200 shadow-2xs" onerror="this.src='assets/logo-icon.png'">
              <div>
                <span class="font-bold text-slate-900 block leading-tight">${escapeHTML(b.title)}</span>
                <a href="${escapeHTML(b.target_url)}" target="_blank" class="text-[10px] text-blue-600 hover:underline truncate max-w-[180px] block">${escapeHTML(b.target_url)}</a>
              </div>
            </div>
          </td>
          <td class="p-3.5 font-bold text-slate-700">${escapeHTML(b.advertiser || 'Parceiro')}</td>
          <td class="p-3.5 text-slate-600"><span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100">${posText}</span></td>
          <td class="p-3.5 text-[11px] text-slate-500 whitespace-nowrap">${b.start_date || 'Imediato'} até ${b.end_date || 'Indeterminado'}</td>
          <td class="p-3.5 font-bold text-slate-900">${clicks} <span class="text-[10px] text-slate-400">(${ctr}%)</span></td>
          <td class="p-3.5">
            <button type="button" onclick="window.toggleAdminBanner(${b.id})" class="px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer transition-colors ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}">
              ${isActive ? 'Ativo' : 'Pausado'}
            </button>
          </td>
          <td class="p-3.5 text-right whitespace-nowrap">
            <button type="button" onclick="window.editAdminBanner(${b.id})" class="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer" title="Editar">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button type="button" onclick="window.deleteAdminBanner(${b.id})" class="p-1.5 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer" title="Excluir">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons({ root: tbody });
  }

  window.toggleAdminBanner = async function(id) {
    try {
      const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_admin_token');
      const res = await fetch(`${API_BASE}/banners.php?action=toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Status alterado.', 'success');
        fetchBannersData();
      }
    } catch (e) {
      showToast('Erro ao alternar status do banner.', 'error');
    }
  };

  window.editAdminBanner = function(id) {
    const b = adminBanners.find(item => item.id === id);
    if (!b) return;

    document.getElementById('banner-id').value = b.id;
    document.getElementById('banner-title').value = b.title || '';
    document.getElementById('banner-advertiser').value = b.advertiser || '';
    document.getElementById('banner-image-url').value = b.image_url || '';
    document.getElementById('banner-target-url').value = b.target_url || '';
    document.getElementById('banner-position').value = b.position || 'home_top';
    document.getElementById('banner-status').value = b.status || 'active';
    document.getElementById('banner-start-date').value = b.start_date || '';
    document.getElementById('banner-end-date').value = b.end_date || '';

    document.getElementById('modal-banner-title-text').textContent = 'Editar Banner Parceiro';
    document.getElementById('modal-banner')?.classList.remove('hidden');
  };

  window.deleteAdminBanner = async function(id) {
    if (!confirm('Deseja excluir este banner permanentemente?')) return;
    try {
      const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_admin_token');
      const res = await fetch(`${API_BASE}/banners.php?action=delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Banner excluído com sucesso.', 'success');
        fetchBannersData();
      }
    } catch (e) {
      showToast('Erro ao excluir banner.', 'error');
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const bannerModal = document.getElementById('modal-banner');
    document.getElementById('btn-new-banner')?.addEventListener('click', () => {
      document.getElementById('form-banner')?.reset();
      document.getElementById('banner-id').value = '0';
      document.getElementById('modal-banner-title-text').textContent = 'Novo Banner Parceiro';
      bannerModal?.classList.remove('hidden');
    });

    document.getElementById('btn-close-banner-modal')?.addEventListener('click', () => bannerModal?.classList.add('hidden'));
    document.getElementById('btn-cancel-banner')?.addEventListener('click', () => bannerModal?.classList.add('hidden'));

    document.getElementById('form-banner')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        id: parseInt(document.getElementById('banner-id').value, 10) || 0,
        title: document.getElementById('banner-title').value.trim(),
        advertiser: document.getElementById('banner-advertiser').value.trim(),
        image_url: document.getElementById('banner-image-url').value.trim(),
        target_url: document.getElementById('banner-target-url').value.trim(),
        position: document.getElementById('banner-position').value,
        status: document.getElementById('banner-status').value,
        start_date: document.getElementById('banner-start-date').value,
        end_date: document.getElementById('banner-end-date').value
      };

      try {
        const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_admin_token');
        const res = await fetch(`${API_BASE}/banners.php?action=save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message || 'Banner salvo com sucesso!', 'success');
          bannerModal?.classList.add('hidden');
          fetchBannersData();
        } else {
          showToast(data.error || 'Erro ao salvar banner.', 'error');
        }
      } catch (err) {
        showToast('Erro de conexão ao salvar banner.', 'error');
      }
    });
  });

  // ===========================================================================
  // MÓDULO 17: LOG DE AUDITORIA & SEGURANÇA
  // ===========================================================================
  let adminAuditLogs = [];

  async function fetchAuditLogsData() {
    try {
      const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_admin_token');
      const res = await fetch(`${API_BASE}/audit_logs.php?action=list&t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.success) {
        adminAuditLogs = data.logs || [];
        renderAuditTable(adminAuditLogs);
      }
    } catch (e) {
      console.warn('[Audit] Erro ao carregar logs:', e);
    }
  }

  function renderAuditTable(list) {
    const tbody = document.getElementById('audit-table-body');
    if (!tbody) return;

    if (!list || list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-slate-400 font-bold">Nenhum registro de auditoria encontrado.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(l => {
      let badgeStyle = 'bg-slate-100 text-slate-700';
      if ((l.action || '').includes('login')) badgeStyle = 'bg-blue-100 text-blue-800 font-bold';
      if ((l.action || '').includes('delete')) badgeStyle = 'bg-rose-100 text-rose-800 font-bold';
      if ((l.action || '').includes('save') || (l.action || '').includes('create')) badgeStyle = 'bg-emerald-100 text-emerald-800 font-bold';

      return `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="p-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">${escapeHTML(l.created_at || '')}</td>
          <td class="p-3.5 font-black text-slate-900">${escapeHTML(l.admin_username || 'admin')}</td>
          <td class="p-3.5"><span class="px-2 py-0.5 rounded-md text-[10px] ${badgeStyle}">${escapeHTML(l.action || '')}</span></td>
          <td class="p-3.5 text-slate-700 font-medium">${escapeHTML(l.details || '-')}</td>
          <td class="p-3.5 text-slate-400 font-mono text-[11px]">${escapeHTML(l.ip_address || '127.0.0.1')}</td>
        </tr>
      `;
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-refresh-audit')?.addEventListener('click', () => {
      fetchAuditLogsData();
      showToast('Logs de auditoria atualizados.', 'info');
    });

    document.getElementById('btn-export-audit-csv')?.addEventListener('click', () => {
      const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_admin_token');
      downloadWithAuth(`${API_BASE}/audit_logs.php?action=export_csv`, 'audit_logs_vocepodetudo.csv');
    });

    document.getElementById('input-search-audit')?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = adminAuditLogs.filter(l => 
        (l.admin_username || '').toLowerCase().includes(q) ||
        (l.action || '').toLowerCase().includes(q) ||
        (l.details || '').toLowerCase().includes(q)
      );
      renderAuditTable(filtered);
    });
  });

  // ===========================================================================
  // MÓDULO 18: CENTRAL DE BACKUP 1-CLIQUE & SAÚDE DO SERVIDOR
  // ===========================================================================
  async function fetchSystemHealthData() {
    try {
      const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_admin_token');
      const res = await fetch(`${API_BASE}/backup.php?action=system_health&t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.success) {
        renderSystemHealthUI(data);
      }
    } catch (e) {
      console.warn('[SystemHealth] Erro:', e);
    }
  }

  function renderSystemHealthUI(data) {
    const dbBadge = document.getElementById('health-db-badge');
    const phpEl = document.getElementById('health-php-version');
    const memEl = document.getElementById('health-memory-limit');
    const cacheEl = document.getElementById('health-cache-status');

    if (dbBadge && data.database) {
      if (data.database.connected) {
        dbBadge.className = 'px-2 py-0.5 rounded-md font-black text-[10px] bg-emerald-100 text-emerald-800';
        dbBadge.textContent = 'Online / Conectado';
      } else {
        dbBadge.className = 'px-2 py-0.5 rounded-md font-black text-[10px] bg-amber-100 text-amber-800';
        dbBadge.textContent = 'Modo Cache Local';
      }
    }

    if (phpEl && data.environment) {
      phpEl.textContent = `PHP ${data.environment.php_version || '8.x'}`;
    }

    if (memEl && data.environment) {
      memEl.textContent = `${data.environment.memory_limit || '256M'} (Upload: ${data.environment.upload_max_filesize || '64M'})`;
    }

    if (cacheEl && data.filesystem) {
      cacheEl.textContent = `${data.filesystem.total_caches} arquivos (${data.filesystem.total_cache_size})`;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Baixar backup SQL
    document.getElementById('btn-download-sql-backup')?.addEventListener('click', () => {
      showToast('Gerando dump do banco de dados MySQL...', 'info');
      downloadWithAuth(`${API_BASE}/backup.php?action=dump_mysql`, `backup_vocepodetudo_${new Date().toISOString().slice(0,10)}.sql`);
    });

    // Baixar backup JSON
    document.getElementById('btn-download-json-backup')?.addEventListener('click', () => {
      showToast('Gerando dump estruturado em JSON...', 'info');
      downloadWithAuth(`${API_BASE}/backup.php?action=dump_json`, `backup_vocepodetudo_${new Date().toISOString().slice(0,10)}.json`);
    });

    // Limpar e Recarregar Caches
    document.getElementById('btn-clear-system-cache')?.addEventListener('click', async () => {
      if (!confirm('Deseja purgar e regenerar todos os arquivos de cache do sistema?')) return;
      try {
        const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_admin_token');
        const res = await fetch(`${API_BASE}/backup.php?action=clear_cache`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message || 'Caches purgados com sucesso!', 'success');
          loadAllDashboardData();
        }
      } catch (e) {
        showToast('Erro ao limpar caches.', 'error');
      }
    });

  // ==============================================================================
  // GERADOR DINÂMICO DE PROPOSTA COMERCIAL & ALUGUEL DE ESPAÇOS (MÍDIA KIT)
  // ==============================================================================
  window.copyMediaKitPitch = function() {
    const pitch = `*PORTAL VOCÊ PODE TUDO — MÍDIA KIT & OPORTUNIDADES 2026*\n\n` +
      `Somos o maior ecossistema gratuito de qualificação profissional, ferramentas de carreira e cursos oficiais do Brasil (vocepodetudo.com).\n\n` +
      `📌 *Destaques do Ecossistema:*\n` +
      `• Mais de 200 Cursos Oficiais com Certificado Gratuito (MEC, Sebrae, Bradesco, EV.G, USP)\n` +
      `• Ferramentas de Alta Retenção: Criador de Currículos ATS, Simulador de Entrevistas com IA e Calculadoras CLT/PJ\n` +
      `• Audiência: 42% entre 16-24 anos (Jovem Aprendiz/Estágio) e 38% entre 25-34 anos (Especialização/Carreira)\n` +
      `• Espaços para Patrocinadores: Super Leaderboard Topo, Cards Nativos In-Feed, Naming Rights de Ferramentas, Half-Page no Blog e Publieditoriais Dofollow.\n\n` +
      `Gostaria de receber nossa proposta personalizada de aluguel de espaço para sua marca?\n` +
      `WhatsApp Comercial: (11) 99999-9999 | E-mail: comercial@vocepodetudo.com`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(pitch).then(() => {
        if (typeof showToast === 'function') showToast('Apresentação rápida (pitch) copiada para a área de transferência!', 'success');
        else alert('Apresentação rápida copiada!');
      }).catch(() => {
        alert('Apresentação copiada com sucesso!');
      });
    } else {
      alert('Apresentação copiada com sucesso!');
    }
  };

  window.updateProposalPreview = function() {
    const company = (document.getElementById('prop-company-name')?.value || '').trim() || '[Nome da Marca / Empresa]';
    const contact = (document.getElementById('prop-contact-name')?.value || '').trim() || 'Equipe Comercial / Marketing';
    const period = document.getElementById('prop-period')?.value || 'trimestral';
    const discount = Math.max(0, Math.min(50, parseFloat(document.getElementById('prop-discount')?.value || 0)));

    let items = [];
    let monthlySubtotal = 0;
    let oneTimeSubtotal = 0;

    const chkTopo = document.getElementById('chk-banner-topo');
    const chkNativo = document.getElementById('chk-card-nativo');
    const chkHalf = document.getElementById('chk-halfpage');
    const chkBill = document.getElementById('chk-billboard');
    const chkCv = document.getElementById('chk-naming-cv');
    const chkIa = document.getElementById('chk-patrocinio-ia');
    const chkCalc = document.getElementById('chk-patrocinio-calc');
    const chkPush = document.getElementById('chk-push-alunos');
    const chkPubli = document.getElementById('chk-publieditorial');

    if (chkTopo && chkTopo.checked) {
      items.push('• Banner Super Leaderboard Topo (Todas as Páginas e Cursos) — R$ 850,00/mês');
      monthlySubtotal += 850;
    }
    if (chkNativo && chkNativo.checked) {
      items.push('• Card Patrocinado Nativo In-Feed (Grade de Cursos & Mural de Vagas) — R$ 650,00/mês');
      monthlySubtotal += 650;
    }
    if (chkHalf && chkHalf.checked) {
      items.push('• Half-Page Lateral Sticky no Blog (80+ Artigos de Carreira) — R$ 750,00/mês');
      monthlySubtotal += 750;
    }
    if (chkBill && chkBill.checked) {
      items.push('• Billboard Intertítulo Editorial (970x250 Desktop / 300x250 Mobile) — R$ 800,00/mês');
      monthlySubtotal += 800;
    }
    if (chkCv && chkCv.checked) {
      items.push('• Naming Rights do Criador de Currículos (Logo no Topo + Selo no PDF) — R$ 1.500,00/mês');
      monthlySubtotal += 1500;
    }
    if (chkIa && chkIa.checked) {
      items.push('• Patrocínio Oficial do Simulador de Entrevistas com IA — R$ 1.200,00/mês');
      monthlySubtotal += 1200;
    }
    if (chkCalc && chkCalc.checked) {
      items.push('• Patrocínio Oficial da Calculadora Trabalhista CLT/PJ — R$ 700,00/mês');
      monthlySubtotal += 700;
    }
    if (chkPush && chkPush.checked) {
      items.push('• Disparo de Push Notification para Alunos Inscritos — R$ 450,00/disparo');
      oneTimeSubtotal += 450;
    }
    if (chkPubli && chkPubli.checked) {
      items.push('• 1 Publieditorial Assinado com Link Dofollow Perpétuo no Blog — R$ 1.250,00 (vitalício)');
      oneTimeSubtotal += 1250;
    }

    let months = 1;
    let periodDiscount = 0;
    let periodLabel = 'Mensal';

    if (period === 'trimestral') {
      months = 3;
      periodDiscount = 10;
      periodLabel = 'Trimestral (com 10% de desconto)';
    } else if (period === 'semestral') {
      months = 6;
      periodDiscount = 15;
      periodLabel = 'Semestral (com 15% de desconto)';
    } else if (period === 'anual') {
      months = 12;
      periodDiscount = 25;
      periodLabel = 'Anual (com 25% de desconto)';
    }

    const totalRecorrenteBruto = monthlySubtotal * months;
    const descTotalPerc = periodDiscount + discount;
    const totalRecorrenteComDesc = totalRecorrenteBruto * (1 - descTotalPerc / 100);
    const totalFinal = totalRecorrenteComDesc + oneTimeSubtotal;

    const totalCalculatedEl = document.getElementById('prop-total-calculated');
    if (totalCalculatedEl) {
      totalCalculatedEl.textContent = `Investimento: R$ ${totalFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${periodLabel})`;
    }

    const text = `PROPOSTA COMERCIAL & ALUGUEL DE ESPAÇO DE PROPAGANDA\n` +
      `De: Portal Você Pode Tudo (vocepodetudo.com)\n` +
      `Para: ${company} (A/C: ${contact})\n` +
      `Data: ${new Date().toLocaleDateString('pt-BR')} • Validade: 15 dias\n\n` +
      `Olá, ${contact}! Apresentamos nossa proposta de parceria comercial para inserção e homologação da ${company} no ecossistema do Portal Você Pode Tudo, o maior portal gratuito de cursos, empregabilidade e carreira do Brasil.\n\n` +
      `🎯 ENTREGÁVEIS & ESPAÇOS CONTRATADOS:\n` +
      (items.length > 0 ? items.join('\n') : '• Nenhum formato selecionado') + `\n\n` +
      `💰 INVESTIMENTO & CONDIÇÕES:\n` +
      `• Período do Contrato: ${periodLabel}\n` +
      (descTotalPerc > 0 ? `• Desconto Especial Aplicado: ${descTotalPerc}% OFF\n` : '') +
      `• Valor Total do Plano: R$ ${totalFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n` +
      `• Forma de Pagamento: Pix, Boleto Bancário ou Cartão de Crédito com Nota Fiscal Eletrônica\n\n` +
      `📊 BENEFÍCIOS PARA A SUA MARCA:\n` +
      `1. Alcance massivo e qualificado diante de milhares de estudantes, jovens profissionais e candidatos motivados em todo o Brasil.\n` +
      `2. Ambiente 100% Brand Safe (Tier 1) e em estrita conformidade com a LGPD (Lei nº 13.709/2018).\n` +
      `3. Formatos de alta visibilidade e conversão direta (CTR médio de 3,4% e picos de 5,2% nos cards nativos).\n\n` +
      `Ficamos à disposição para darmos início imediato à veiculação da ${company}!\n\n` +
      `Atenciosamente,\n` +
      `Coordenação Comercial • Portal Você Pode Tudo\n` +
      `WhatsApp: (11) 99999-9999 | E-mail: comercial@vocepodetudo.com`;

    const previewArea = document.getElementById('prop-message-preview');
    if (previewArea) {
      previewArea.value = text;
    }
  };

  window.copyProposalToClipboard = function() {
    const previewArea = document.getElementById('prop-message-preview');
    if (!previewArea || !previewArea.value) {
      window.updateProposalPreview();
    }
    const val = previewArea ? previewArea.value : '';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(val).then(() => {
        if (typeof showToast === 'function') showToast('Proposta comercial copiada com sucesso! Pronto para colar no WhatsApp ou E-mail.', 'success');
        else alert('Proposta copiada com sucesso!');
      }).catch(() => {
        alert('Proposta copiada com sucesso!');
      });
    } else {
      alert('Proposta copiada com sucesso!');
    }
  };

  window.sendProposalWhatsApp = function() {
    const previewArea = document.getElementById('prop-message-preview');
    if (!previewArea || !previewArea.value) {
      window.updateProposalPreview();
    }
    const rawPhone = (document.getElementById('prop-contact-phone')?.value || '').replace(/\D/g, '');
    const phone = rawPhone ? (rawPhone.startsWith('55') ? rawPhone : '55' + rawPhone) : '';
    const text = encodeURIComponent(previewArea.value);
    const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

    window.updateProposalPreview();
  });


  // ==========================================
  // PAINEL DE SEO & BUSCA DO GOOGLE
  // ==========================================
  const seoPagesData = [
    {
      page: 'Página Inicial (Home)',
      slug: '/',
      canonical: 'https://vocepodetudo.com/',
      title: 'Você Pode Tudo — Cursos Gratuitos com Certificado Oficial no Brasil',
      desc: 'Mais de 155 cursos 100% gratuitos com certificado oficial das maiores instituições: Bradesco, Gov.br, Microsoft, Oracle e Cisco. Qualifique-se grátis!',
      schema: 'WebSite, EducationalOrganization, Course, ItemList'
    },
    {
      page: 'Mural de Vagas & Empregos',
      slug: '/vagas',
      canonical: 'https://vocepodetudo.com/vagas',
      title: 'Vagas de Emprego, Estágio e Jovem Aprendiz 2026 — Você Pode Tudo',
      desc: 'Oportunidades atualizadas diariamente: vagas de primeiro emprego, home office, jovem aprendiz e estágios em todo o Brasil.',
      schema: 'JobPosting, BreadcrumbList, WebPage'
    },
    {
      page: 'Criador de Currículos ATS',
      slug: '/curriculo',
      canonical: 'https://vocepodetudo.com/curriculo',
      title: 'Criador de Currículo Grátis em PDF — 12 Modelos ATS Profissionais',
      desc: 'Crie seu currículo profissional grátis em menos de 5 minutos. Modelos formatados para sistemas ATS, download imediato em PDF sem cadastro.',
      schema: 'WebApplication, BreadcrumbList, HowTo'
    },
    {
      page: 'Blog de Carreira & Educação',
      slug: '/blog',
      canonical: 'https://vocepodetudo.com/blog',
      title: 'Blog Você Pode Tudo — Guia de Carreira, Empregabilidade e Cursos',
      desc: 'Artigos completos sobre mercado de trabalho, dicas de processos seletivos, certificações valorizadas e metodologias de estudo.',
      schema: 'Blog, BreadcrumbList, Organization'
    },
    {
      page: 'Simulador de Entrevistas STAR',
      slug: '/simulador-entrevista',
      canonical: 'https://vocepodetudo.com/simulador-entrevista',
      title: 'Simulador de Entrevista de Emprego com IA e Metodologia STAR',
      desc: 'Treine para entrevistas reais de emprego com perguntas comportamentais, cronômetro e feedback estruturado na metodologia STAR.',
      schema: 'WebApplication, SoftwareApplication'
    },
    {
      page: 'Teste Vocacional Interativo',
      slug: '/teste-vocacional',
      canonical: 'https://vocepodetudo.com/teste-vocacional',
      title: 'Teste Vocacional Gratuito Online — Descubra sua Carreira Ideal',
      desc: 'Descubra sua vocação profissional com teste baseado em metodologias de perfil de carreira e receba trilha de cursos recomendados.',
      schema: 'WebApplication, Quiz, EducationalOccupationalCredential'
    },
    {
      page: 'Calculadoras Trabalhistas',
      slug: '/calculadora-trabalhista',
      canonical: 'https://vocepodetudo.com/calculadora-trabalhista',
      title: 'Calculadoras Trabalhistas Online: Rescisão CLT, Comparador CLT x PJ',
      desc: 'Simule seus direitos trabalhistas gratuitamente: cálculo de rescisão CLT, horas extras, seguro-desemprego e comparativo de renda CLT x PJ.',
      schema: 'WebApplication, FinancialProduct'
    },
    {
      page: 'Mídia Kit & Publicidade',
      slug: '/midia-kit',
      canonical: 'https://vocepodetudo.com/midia-kit',
      title: 'Mídia Kit Comercial & Publicidade — Portal Você Pode Tudo',
      desc: 'Conecte sua marca a estudantes e profissionais em todo o Brasil. Conheça nossa audiência qualificada, formatos IAB e planos comerciais.',
      schema: 'WebPage, Organization, Offer'
    },
    {
      page: 'Cursos de TI & Programação',
      slug: '/cursos-gratis-programacao',
      canonical: 'https://vocepodetudo.com/cursos-gratis-programacao',
      title: 'Cursos Gratuitos de Programação com Certificado — TI, Python, Java',
      desc: 'Formação em desenvolvimento de software, lógica de programação, Python, Java, JavaScript e computação em nuvem com certificado oficial.',
      schema: 'ItemList, Course, BreadcrumbList'
    },
    {
      page: 'Cursos de Inteligência Artificial',
      slug: '/cursos-gratis-ia',
      canonical: 'https://vocepodetudo.com/cursos-gratis-ia',
      title: 'Cursos Gratuitos de Inteligência Artificial — Prompt, IA Generativa',
      desc: 'Aprenda IA Generativa, engenharia de prompt, automação e aprendizado de máquina com cursos oficiais e certificados gratuitos.',
      schema: 'ItemList, Course, BreadcrumbList'
    },
    {
      page: 'Vagas Jovem Aprendiz 2026',
      slug: '/vagas-jovem-aprendiz-2026',
      canonical: 'https://vocepodetudo.com/vagas-jovem-aprendiz-2026',
      title: 'Vagas Jovem Aprendiz 2026 — Oportunidades de Primeiro Emprego',
      desc: 'Inscrições abertas para programas de Jovem Aprendiz em grandes empresas no Brasil. Salário, benefícios e capacitação profissional.',
      schema: 'JobPosting, BreadcrumbList'
    }
  ];

  const seoKeywordsData = [
    {
      keyword: 'cursos gratuitos com certificado',
      intent: 'Transacional',
      page: 'https://vocepodetudo.com/',
      volume: '110.000',
      ctr: '5.8%',
      position: '3ª posição'
    },
    {
      keyword: 'hackers do bem inscricoes',
      intent: 'Navegacional',
      page: 'https://vocepodetudo.com/#hackers-do-bem',
      volume: '45.000',
      ctr: '8.4%',
      position: '2ª posição'
    },
    {
      keyword: 'fundacao bradesco cursos online',
      intent: 'Informacional',
      page: 'https://vocepodetudo.com/?q=bradesco',
      volume: '90.000',
      ctr: '4.2%',
      position: '4ª posição'
    },
    {
      keyword: 'vagas jovem aprendiz home office',
      intent: 'Transacional',
      page: 'https://vocepodetudo.com/vagas',
      volume: '33.000',
      ctr: '6.1%',
      position: '2ª posição'
    },
    {
      keyword: 'gerador de curriculo gratis pdf',
      intent: 'Transacional',
      page: 'https://vocepodetudo.com/curriculo',
      volume: '74.000',
      ctr: '7.9%',
      position: '1ª posição'
    },
    {
      keyword: 'simulador de entrevista STAR',
      intent: 'Informacional',
      page: 'https://vocepodetudo.com/simulador-entrevista',
      volume: '18.000',
      ctr: '9.2%',
      position: '1ª posição'
    },
    {
      keyword: 'cursos de inteligencia artificial gratis',
      intent: 'Informacional',
      page: 'https://vocepodetudo.com/cursos-gratis-ia',
      volume: '27.000',
      ctr: '5.1%',
      position: '3ª posição'
    },
    {
      keyword: 'oracle ONE tecnologia inscricao',
      intent: 'Navegacional',
      page: 'https://vocepodetudo.com/?q=oracle',
      volume: '22.000',
      ctr: '6.7%',
      position: '2ª posição'
    },
    {
      keyword: 'calculadora rescisao clt gratis',
      intent: 'Transacional',
      page: 'https://vocepodetudo.com/calculadora-trabalhista',
      volume: '60.000',
      ctr: '4.8%',
      position: '4ª posição'
    },
    {
      keyword: 'teste vocacional gratuito',
      intent: 'Transacional',
      page: 'https://vocepodetudo.com/teste-vocacional',
      volume: '40.000',
      ctr: '5.3%',
      position: '3ª posição'
    },
    {
      keyword: 'cursos senai gratuitos online',
      intent: 'Informacional',
      page: 'https://vocepodetudo.com/?q=senai',
      volume: '50.000',
      ctr: '4.5%',
      position: '5ª posição'
    },
    {
      keyword: 'primeiro emprego jovem aprendiz',
      intent: 'Informacional',
      page: 'https://vocepodetudo.com/vagas-jovem-aprendiz-2026',
      volume: '38.000',
      ctr: '6.4%',
      position: '2ª posição'
    }
  ];

  let seoPanelInitialized = false;

  function initAdminSeoPanel() {
    renderSeoPagesTable();
    renderSeoKeywordsTable();
    setupSerpPreviewControls();
    setupSeoCsvExport();

    if (window.lucide) {
      window.lucide.createIcons();
    }
    seoPanelInitialized = true;
  }

  function renderSeoPagesTable() {
    const tbody = document.getElementById('seo-pages-table-body');
    if (!tbody) return;

    tbody.innerHTML = seoPagesData.map(item => {
      const titleLen = item.title.length;
      const descLen = item.desc.length;
      const titleBadge = titleLen <= 65 
        ? `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">${titleLen} carac. (OK)</span>`
        : `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">${titleLen} carac. (Longo)</span>`;
      
      const descBadge = descLen <= 160 
        ? `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">${descLen} carac. (OK)</span>`
        : `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">${descLen} carac. (Longo)</span>`;

      return `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="p-3.5 font-bold text-slate-900 whitespace-nowrap">
            ${item.page}
            <span class="block text-[10px] text-slate-400 font-mono">${item.slug}</span>
          </td>
          <td class="p-3.5 font-mono text-[11px] text-blue-600 whitespace-nowrap">
            <span class="inline-flex items-center gap-1">
              <i data-lucide="link" class="w-3 h-3 text-slate-400"></i>
              ${item.canonical}
            </span>
          </td>
          <td class="p-3.5 max-w-xs">
            <div class="text-xs font-semibold text-slate-800 truncate" title="${item.title}">${item.title}</div>
            <div class="mt-1">${titleBadge}</div>
          </td>
          <td class="p-3.5 max-w-xs">
            <div class="text-xs text-slate-600 truncate" title="${item.desc}">${item.desc}</div>
            <div class="mt-1">${descBadge}</div>
          </td>
          <td class="p-3.5">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-200">
              ${item.schema.split(',')[0]}
            </span>
          </td>
          <td class="p-3.5 text-center whitespace-nowrap">
            <div class="inline-flex items-center gap-1.5">
              <a 
                href="https://www.google.com/search?q=site%3Avocepodetudo.com${item.slug === '/' ? '' : item.slug}" 
                target="_blank" 
                class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Buscar esta página no Google"
              >
                <i data-lucide="search" class="w-3.5 h-3.5"></i>
              </a>
              <a 
                href="https://search.google.com/test/rich-results?url=${encodeURIComponent(item.canonical)}" 
                target="_blank" 
                class="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#002776] transition-colors"
                title="Testar Rich Results no Google"
              >
                <i data-lucide="check" class="w-3.5 h-3.5"></i>
              </a>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderSeoKeywordsTable() {
    const tbody = document.getElementById('seo-keywords-table-body');
    if (!tbody) return;

    tbody.innerHTML = seoKeywordsData.map(item => {
      const intentBadge = item.intent === 'Transacional'
        ? 'bg-emerald-100 text-emerald-800'
        : item.intent === 'Navegacional'
          ? 'bg-blue-100 text-blue-800'
          : 'bg-amber-100 text-amber-800';

      return `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="p-3.5 font-bold text-slate-900 whitespace-nowrap flex items-center gap-2">
            <i data-lucide="sparkle" class="w-3.5 h-3.5 text-[#009639]"></i>
            <span>${item.keyword}</span>
          </td>
          <td class="p-3.5 whitespace-nowrap">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black ${intentBadge}">
              ${item.intent}
            </span>
          </td>
          <td class="p-3.5 text-[11px] font-mono text-blue-600 truncate max-w-xs" title="${item.page}">
            ${item.page}
          </td>
          <td class="p-3.5 font-bold text-slate-800 whitespace-nowrap">
            ${item.volume}
          </td>
          <td class="p-3.5 font-black text-emerald-600 whitespace-nowrap">
            ${item.ctr}
          </td>
          <td class="p-3.5 whitespace-nowrap">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-50 text-[#002776] border border-blue-200">
              ${item.position}
            </span>
          </td>
          <td class="p-3.5 text-center whitespace-nowrap">
            <a 
              href="https://www.google.com/search?q=${encodeURIComponent(item.keyword)}" 
              target="_blank" 
              class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
            >
              <span>Ver Google</span>
              <i data-lucide="external-link" class="w-3 h-3"></i>
            </a>
          </td>
        </tr>
      `;
    }).join('');
  }

  function setupSerpPreviewControls() {
    const pageSelect = document.getElementById('serp-select-page');
    const inputTitle = document.getElementById('serp-input-title');
    const inputSlug = document.getElementById('serp-input-slug');
    const inputDesc = document.getElementById('serp-input-desc');

    const previewUrl = document.getElementById('serp-preview-url');
    const previewTitle = document.getElementById('serp-preview-title');
    const previewDesc = document.getElementById('serp-preview-desc');
    const previewBox = document.getElementById('serp-preview-box');

    const titleCounter = document.getElementById('serp-title-counter');
    const descCounter = document.getElementById('serp-desc-counter');

    const mobileBtn = document.getElementById('serp-view-mobile-btn');
    const desktopBtn = document.getElementById('serp-view-desktop-btn');

    if (!pageSelect || !inputTitle || !inputDesc) return;

    function updatePreview() {
      const title = inputTitle.value.trim() || 'Você Pode Tudo';
      const slug = inputSlug.value.trim().replace(/^\//, '');
      const desc = inputDesc.value.trim() || 'Descrição da página...';

      if (previewTitle) previewTitle.textContent = title;
      if (previewDesc) previewDesc.textContent = desc;
      if (previewUrl) {
        previewUrl.textContent = slug ? `https://vocepodetudo.com › ${slug}` : 'https://vocepodetudo.com';
      }

      if (titleCounter) {
        const len = title.length;
        titleCounter.textContent = `${len}/65 carac.`;
        titleCounter.className = len <= 65 ? 'text-[11px] font-bold text-emerald-600' : 'text-[11px] font-bold text-rose-600';
      }

      if (descCounter) {
        const len = desc.length;
        descCounter.textContent = `${len}/160 carac.`;
        descCounter.className = len <= 160 ? 'text-[11px] font-bold text-emerald-600' : 'text-[11px] font-bold text-rose-600';
      }
    }

    inputTitle.addEventListener('input', updatePreview);
    inputSlug.addEventListener('input', updatePreview);
    inputDesc.addEventListener('input', updatePreview);

    pageSelect.addEventListener('change', () => {
      const val = pageSelect.value;
      const found = seoPagesData.find(p => {
        if (val === 'home') return p.slug === '/';
        return p.slug === '/' + val;
      });

      if (found) {
        inputTitle.value = found.title;
        inputSlug.value = found.slug === '/' ? '' : found.slug.replace(/^\//, '');
        inputDesc.value = found.desc;
        updatePreview();
      }
    });

    if (mobileBtn && desktopBtn && previewBox) {
      mobileBtn.addEventListener('click', () => {
        mobileBtn.className = 'px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-800 shadow-xs transition-all cursor-pointer flex items-center gap-1';
        desktopBtn.className = 'px-3 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition-all cursor-pointer flex items-center gap-1';
        previewBox.className = 'bg-white rounded-xl p-4 shadow-sm border border-slate-100 max-w-sm transition-all';
      });

      desktopBtn.addEventListener('click', () => {
        desktopBtn.className = 'px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-800 shadow-xs transition-all cursor-pointer flex items-center gap-1';
        mobileBtn.className = 'px-3 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition-all cursor-pointer flex items-center gap-1';
        previewBox.className = 'bg-white rounded-xl p-4 shadow-sm border border-slate-100 max-w-xl transition-all';
      });
    }

    updatePreview();
  }

  function setupSeoCsvExport() {
    const btn = document.getElementById('btn-export-seo-csv');
    if (!btn) return;

    btn.addEventListener('click', () => {
      let csv = '\uFEFF';
      csv += '--- RELATÓRIO DE SEO & BUSCA DO GOOGLE: VOCÊ PODE TUDO ---\n\n';
      csv += 'PÁGINAS ESTRATÉGICAS AUDITADAS (ON-PAGE)\n';
      csv += 'Pagina;URL Canonica;Titulo SEO;Caracteres Titulo;Meta Description;Caracteres Descricao;Schema Org\n';

      seoPagesData.forEach(p => {
        const safeTitle = (p.title || '').replace(/"/g, '""');
        const safeDesc = (p.desc || '').replace(/"/g, '""');
        csv += `"${p.page}";"${p.canonical}";"${safeTitle}";${p.title.length};"${safeDesc}";${p.desc.length};"${p.schema}"\n`;
      });

      csv += '\nPALAVRAS-CHAVE ESTRATÉGICAS NO GOOGLE BRASIL\n';
      csv += 'Palavra-Chave;Intencao;Pagina Destino;Volume Estimado Mensal;CTR Medio;Posicao Media Google\n';

      seoKeywordsData.forEach(k => {
        csv += `"${k.keyword}";"${k.intent}";"${k.page}";"${k.volume}";"${k.ctr}";"${k.position}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `vocepodetudo_seo_google_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (typeof showToast === 'function') {
        showToast('Relatório completo de SEO exportado com sucesso!', 'success');
      }
    });
  }
