const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const adminJsPath = path.join(ROOT, 'src', 'admin.js');

let adminJs = fs.readFileSync(adminJsPath, 'utf8');

console.log('--- Injetando Lógica das Novas Ferramentas em src/admin.js ---');

// 1. Atualizar array tabs em setupTabNavigation
const oldTabsArray = `      { id: 'tab-btn-push', section: 'section-push' },
      { id: 'tab-btn-system', section: 'section-system' }`;

const newTabsArray = `      { id: 'tab-btn-push', section: 'section-push' },
      { id: 'tab-btn-system', section: 'section-system' },
      { id: 'tab-btn-messages', section: 'section-messages' },
      { id: 'tab-btn-ratings', section: 'section-ratings' },
      { id: 'tab-btn-banners', section: 'section-banners' },
      { id: 'tab-btn-audit', section: 'section-audit' }`;

if (!adminJs.includes("'tab-btn-messages'")) {
  adminJs = adminJs.replace(oldTabsArray, newTabsArray);
  console.log('✅ setupTabNavigation atualizado com novas abas.');
}

// 2. Atualizar loadAllDashboardData com novos loaders
const oldLoadAll = `      loadAnnouncementData(),
      fetchAdminJobsData(),
      fetchAdminBlogData()`;

const newLoadAll = `      loadAnnouncementData(),
      fetchAdminJobsData(),
      fetchAdminBlogData(),
      fetchMessagesData(),
      fetchRatingsData(),
      fetchBannersData(),
      fetchAuditLogsData(),
      fetchSystemHealthData()`;

if (!adminJs.includes('fetchMessagesData()')) {
  adminJs = adminJs.replace(oldLoadAll, newLoadAll);
  console.log('✅ loadAllDashboardData atualizado com novas funções.');
}

// 3. Adicionar código dos novos módulos ao final de src/admin.js antes do fechamento
const newModulesCode = `
  // ===========================================================================
  // MÓDULO 14: CENTRAL DE MENSAGENS & FALE CONOSCO (INBOX)
  // ===========================================================================
  let adminMessages = [];
  let selectedMessageId = null;

  async function fetchMessagesData() {
    try {
      const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_admin_token');
      const res = await fetch(\`\${API_BASE}/contact.php?action=list&t=\${Date.now()}\`, {
        headers: { 'Authorization': \`Bearer \${token}\` }
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

    if (counter) counter.textContent = \`\${filtered.length} mensagens\`;

    if (filtered.length === 0) {
      container.innerHTML = \`<div class="p-8 text-center text-slate-400 text-xs font-bold">Nenhuma mensagem encontrada neste filtro.</div>\`;
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

      return \`
        <div class="p-3.5 hover:bg-slate-50 cursor-pointer transition-colors \${isSelected ? 'bg-blue-50/70 border-l-4 border-[#002776]' : ''}" onclick="window.selectAdminMessage('\${m.id}')">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="font-bold text-xs text-slate-900 truncate \${isUnread ? 'font-black text-[#002776]' : ''}">\${escapeHTML(m.nome || 'Visitante')}</span>
            <span class="px-2 py-0.5 rounded-full text-[9px] \${badgeBg}">\${badgeText}</span>
          </div>
          <div class="text-[11px] font-bold text-slate-700 truncate mb-1">\${escapeHTML(m.assunto || 'Contato Geral')}</div>
          <p class="text-[10px] text-slate-500 line-clamp-1 mb-1.5">\${escapeHTML(m.mensagem || '')}</p>
          <div class="text-[9px] text-slate-400">📅 \${escapeHTML(m.data || '')}</div>
        </div>
      \`;
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
      await fetch(\`\${API_BASE}/contact.php?action=update_status\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
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
        const res = await fetch(\`\${API_BASE}/contact.php?action=delete\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
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
      document.getElementById('reply-msg-to').value = \`\${msg.nome} <\${msg.email}>\`;
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
        const res = await fetch(\`\${API_BASE}/contact.php?action=reply\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
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
      const res = await fetch(\`\${API_BASE}/ratings.php?action=admin_list&t=\${Date.now()}\`, {
        headers: { 'Authorization': \`Bearer \${token}\` }
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
      satEl.textContent = \`\${pct}%\`;
    }

    renderRatingsTable(adminRatings);
  }

  function renderRatingsTable(list) {
    const tbody = document.getElementById('ratings-table-body');
    if (!tbody) return;

    if (!list || list.length === 0) {
      tbody.innerHTML = \`<tr><td colspan="6" class="p-8 text-center text-slate-400 font-bold">Nenhuma avaliação cadastrada ainda.</td></tr>\`;
      return;
    }

    tbody.innerHTML = list.map(r => {
      const stars = '★'.repeat(r.rating || 5) + '☆'.repeat(5 - (r.rating || 5));
      const isApproved = (r.status || 'aprovado') === 'aprovado';
      const statusBadge = isApproved 
        ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Aprovado</span>'
        : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Pendente</span>';

      return \`
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="p-3.5 font-bold text-slate-900">\${escapeHTML(r.course_id || 'Curso')}</td>
          <td class="p-3.5 text-amber-500 font-black text-sm tracking-widest">\${stars}</td>
          <td class="p-3.5">
            <span class="font-bold text-slate-900 block">\${escapeHTML(r.student_name || 'Aluno')}</span>
            <span class="text-slate-500 text-[11px]">\${escapeHTML(r.comment || 'Sem comentário')}</span>
          </td>
          <td class="p-3.5 text-slate-400 text-[11px] whitespace-nowrap">\${escapeHTML(r.created_at || '')}</td>
          <td class="p-3.5">\${statusBadge}</td>
          <td class="p-3.5 text-right whitespace-nowrap">
            <button type="button" onclick="window.moderateAdminRating(\${r.id}, '\${isApproved ? 'pendente' : 'aprovado'}')" class="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer" title="\${isApproved ? 'Desaprovar' : 'Aprovar'}">
              <i data-lucide="\${isApproved ? 'eye-off' : 'check'}" class="w-4 h-4"></i>
            </button>
            <button type="button" onclick="window.deleteAdminRating(\${r.id})" class="p-1.5 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer" title="Excluir">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </td>
        </tr>
      \`;
    }).join('');

    if (window.lucide) window.lucide.createIcons({ root: tbody });
  }

  window.moderateAdminRating = async function(id, newStatus) {
    try {
      const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_admin_token');
      const res = await fetch(\`\${API_BASE}/ratings.php?action=moderate\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
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
      const res = await fetch(\`\${API_BASE}/ratings.php?action=delete\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
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
      const res = await fetch(\`\${API_BASE}/banners.php?action=list&t=\${Date.now()}\`, {
        headers: { 'Authorization': \`Bearer \${token}\` }
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
    if (ctrEl) ctrEl.textContent = \`\${ctr}%\`;
    if (countBadge) countBadge.textContent = \`\${adminBanners.length} cadastrados\`;

    renderBannersTable(adminBanners);
  }

  function renderBannersTable(list) {
    const tbody = document.getElementById('banners-table-body');
    if (!tbody) return;

    if (!list || list.length === 0) {
      tbody.innerHTML = \`<tr><td colspan="7" class="p-8 text-center text-slate-400 font-bold">Nenhum banner cadastrado. Clique em "+ Novo Banner Parceiro" para criar.</td></tr>\`;
      return;
    }

    tbody.innerHTML = list.map(b => {
      const isActive = (b.status || 'active') === 'active';
      const posLabels = { home_top: 'Topo da Home', sidebar: 'Barra Lateral', footer: 'Rodapé' };
      const posText = posLabels[b.position] || b.position;
      const clicks = parseInt(b.clicks || 0, 10);
      const impr = parseInt(b.impressions || 0, 10);
      const ctr = impr > 0 ? ((clicks / impr) * 100).toFixed(1) : '0.0';

      return \`
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="p-3.5">
            <div class="flex items-center gap-3">
              <img src="\${escapeHTML(b.image_url)}" alt="Banner" class="w-12 h-8 rounded object-cover border border-slate-200 shadow-2xs" onerror="this.src='assets/logo-icon.png'">
              <div>
                <span class="font-bold text-slate-900 block leading-tight">\${escapeHTML(b.title)}</span>
                <a href="\${escapeHTML(b.target_url)}" target="_blank" class="text-[10px] text-blue-600 hover:underline truncate max-w-[180px] block">\${escapeHTML(b.target_url)}</a>
              </div>
            </div>
          </td>
          <td class="p-3.5 font-bold text-slate-700">\${escapeHTML(b.advertiser || 'Parceiro')}</td>
          <td class="p-3.5 text-slate-600"><span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100">\${posText}</span></td>
          <td class="p-3.5 text-[11px] text-slate-500 whitespace-nowrap">\${b.start_date || 'Imediato'} até \${b.end_date || 'Indeterminado'}</td>
          <td class="p-3.5 font-bold text-slate-900">\${clicks} <span class="text-[10px] text-slate-400">(\${ctr}%)</span></td>
          <td class="p-3.5">
            <button type="button" onclick="window.toggleAdminBanner(\${b.id})" class="px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer transition-colors \${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}">
              \${isActive ? 'Ativo' : 'Pausado'}
            </button>
          </td>
          <td class="p-3.5 text-right whitespace-nowrap">
            <button type="button" onclick="window.editAdminBanner(\${b.id})" class="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer" title="Editar">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button type="button" onclick="window.deleteAdminBanner(\${b.id})" class="p-1.5 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer" title="Excluir">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </td>
        </tr>
      \`;
    }).join('');

    if (window.lucide) window.lucide.createIcons({ root: tbody });
  }

  window.toggleAdminBanner = async function(id) {
    try {
      const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_admin_token');
      const res = await fetch(\`\${API_BASE}/banners.php?action=toggle\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
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
      const res = await fetch(\`\${API_BASE}/banners.php?action=delete\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
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
        const res = await fetch(\`\${API_BASE}/banners.php?action=save\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
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
      const res = await fetch(\`\${API_BASE}/audit_logs.php?action=list&t=\${Date.now()}\`, {
        headers: { 'Authorization': \`Bearer \${token}\` }
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
      tbody.innerHTML = \`<tr><td colspan="5" class="p-8 text-center text-slate-400 font-bold">Nenhum registro de auditoria encontrado.</td></tr>\`;
      return;
    }

    tbody.innerHTML = list.map(l => {
      let badgeStyle = 'bg-slate-100 text-slate-700';
      if ((l.action || '').includes('login')) badgeStyle = 'bg-blue-100 text-blue-800 font-bold';
      if ((l.action || '').includes('delete')) badgeStyle = 'bg-rose-100 text-rose-800 font-bold';
      if ((l.action || '').includes('save') || (l.action || '').includes('create')) badgeStyle = 'bg-emerald-100 text-emerald-800 font-bold';

      return \`
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="p-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">\${escapeHTML(l.created_at || '')}</td>
          <td class="p-3.5 font-black text-slate-900">\${escapeHTML(l.admin_username || 'admin')}</td>
          <td class="p-3.5"><span class="px-2 py-0.5 rounded-md text-[10px] \${badgeStyle}">\${escapeHTML(l.action || '')}</span></td>
          <td class="p-3.5 text-slate-700 font-medium">\${escapeHTML(l.details || '-')}</td>
          <td class="p-3.5 text-slate-400 font-mono text-[11px]">\${escapeHTML(l.ip_address || '127.0.0.1')}</td>
        </tr>
      \`;
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-refresh-audit')?.addEventListener('click', () => {
      fetchAuditLogsData();
      showToast('Logs de auditoria atualizados.', 'info');
    });

    document.getElementById('btn-export-audit-csv')?.addEventListener('click', () => {
      const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_admin_token');
      downloadWithAuth(\`\${API_BASE}/audit_logs.php?action=export_csv\`, 'audit_logs_vocepodetudo.csv');
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
      const res = await fetch(\`\${API_BASE}/backup.php?action=system_health&t=\${Date.now()}\`, {
        headers: { 'Authorization': \`Bearer \${token}\` }
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
      phpEl.textContent = \`PHP \${data.environment.php_version || '8.x'}\`;
    }

    if (memEl && data.environment) {
      memEl.textContent = \`\${data.environment.memory_limit || '256M'} (Upload: \${data.environment.upload_max_filesize || '64M'})\`;
    }

    if (cacheEl && data.filesystem) {
      cacheEl.textContent = \`\${data.filesystem.total_caches} arquivos (\${data.filesystem.total_cache_size})\`;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Baixar backup SQL
    document.getElementById('btn-download-sql-backup')?.addEventListener('click', () => {
      showToast('Gerando dump do banco de dados MySQL...', 'info');
      downloadWithAuth(\`\${API_BASE}/backup.php?action=dump_mysql\`, \`backup_vocepodetudo_\${new Date().toISOString().slice(0,10)}.sql\`);
    });

    // Baixar backup JSON
    document.getElementById('btn-download-json-backup')?.addEventListener('click', () => {
      showToast('Gerando dump estruturado em JSON...', 'info');
      downloadWithAuth(\`\${API_BASE}/backup.php?action=dump_json\`, \`backup_vocepodetudo_\${new Date().toISOString().slice(0,10)}.json\`);
    });

    // Limpar e Recarregar Caches
    document.getElementById('btn-clear-system-cache')?.addEventListener('click', async () => {
      if (!confirm('Deseja purgar e regenerar todos os arquivos de cache do sistema?')) return;
      try {
        const token = state.token || localStorage.getItem('vpt_admin_token') || sessionStorage.getItem('vpt_admin_token');
        const res = await fetch(\`\${API_BASE}/backup.php?action=clear_cache\`, {
          method: 'POST',
          headers: { 'Authorization': \`Bearer \${token}\` }
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
  });
`;

if (!adminJs.includes('MÓDULO 14: CENTRAL DE MENSAGENS')) {
  adminJs += '\n' + newModulesCode;
  fs.writeFileSync(adminJsPath, adminJs, 'utf8');
  console.log('✅ Novos módulos de lógica inseridos em src/admin.js.');
} else {
  console.log('ℹ️ Módulos já existentes em src/admin.js.');
}

console.log('--- Finalizado com Sucesso ---');
