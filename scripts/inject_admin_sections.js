const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const adminPath = path.join(ROOT, 'admin.html');

let adminHtml = fs.readFileSync(adminPath, 'utf8');

console.log('--- Injetando as Seções Completas em admin.html ---');

// HTML da Seção 1: Mensagens & Suporte (Fale Conosco)
const sectionMessagesHtml = `
      <!-- =================================================================== -->
      <!-- ABA: CENTRAL DE MENSAGENS & FALE CONOSCO (INBOX) -->
      <!-- =================================================================== -->
      <section id="section-messages" class="admin-tab-section hidden space-y-6">
        
        <!-- Cabeçalho da Seção -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 class="text-lg font-black text-slate-900 flex items-center gap-2">
              <i data-lucide="inbox" class="w-5 h-5 text-blue-600"></i>
              Central de Mensagens & Fale Conosco
            </h2>
            <p class="text-xs text-slate-500 font-medium">
              Gerencie todas as mensagens, dúvidas, sugestões e pedidos de parceria enviados pelos visitantes do portal.
            </p>
          </div>
          
          <div class="flex items-center gap-2">
            <button 
              type="button" 
              id="btn-refresh-messages"
              class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
              title="Atualizar caixa de entrada"
            >
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        <!-- Cards de Métricas de Mensagens -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span class="text-[10px] font-black uppercase text-slate-400 block mb-1">Total de Contatos</span>
            <span id="msg-stat-total" class="text-2xl font-black text-slate-900">0</span>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-rose-200 shadow-sm bg-rose-50/20">
            <span class="text-[10px] font-black uppercase text-rose-600 block mb-1">Não Lidas</span>
            <span id="msg-stat-unread" class="text-2xl font-black text-rose-600">0</span>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/20">
            <span class="text-[10px] font-black uppercase text-emerald-600 block mb-1">Respondidas</span>
            <span id="msg-stat-replied" class="text-2xl font-black text-emerald-600">0</span>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span class="text-[10px] font-black uppercase text-slate-400 block mb-1">Arquivadas</span>
            <span id="msg-stat-archived" class="text-2xl font-black text-slate-700">0</span>
          </div>
        </div>

        <!-- Filtros e Barra de Busca -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <button type="button" class="msg-filter-btn active px-3 py-1.5 rounded-xl text-xs font-bold bg-[#002776] text-white cursor-pointer" data-filter="all">Todas</button>
            <button type="button" class="msg-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer" data-filter="nao_lida">Não Lidas</button>
            <button type="button" class="msg-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer" data-filter="respondida">Respondidas</button>
            <button type="button" class="msg-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer" data-filter="arquivada">Arquivadas</button>
          </div>

          <div class="relative w-full sm:w-72">
            <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-2.5"></i>
            <input 
              type="text" 
              id="input-search-messages" 
              placeholder="Buscar por nome, email ou assunto..." 
              class="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:outline-none focus:border-[#002776]"
            >
          </div>
        </div>

        <!-- Lista e Painel de Leitura de Mensagens -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Coluna 1: Lista de Mensagens (5 cols) -->
          <div class="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[560px]">
            <div class="p-3 border-b border-slate-100 font-bold text-xs text-slate-500 bg-slate-50/50 flex justify-between items-center">
              <span>Mensagens Recebidas</span>
              <span id="msg-list-counter" class="text-[11px] font-black text-slate-700">0 mensagens</span>
            </div>
            <div id="messages-list-container" class="flex-1 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
              <div class="p-8 text-center text-slate-400 text-xs">Carregando mensagens...</div>
            </div>
          </div>

          <!-- Coluna 2: Detalhes e Ações da Mensagem Selecionada (7 cols) -->
          <div class="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-[560px]">
            <div id="message-detail-empty" class="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <i data-lucide="mail-open" class="w-12 h-12 text-slate-300 mb-3 stroke-[1.5]"></i>
              <p class="text-xs font-bold text-slate-600">Selecione uma mensagem na lista ao lado para ler e responder.</p>
            </div>

            <div id="message-detail-content" class="hidden flex-1 flex flex-col min-h-0">
              <div class="pb-4 border-b border-slate-100 mb-4 flex-shrink-0">
                <div class="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 id="msg-detail-subject" class="text-base font-black text-slate-900 leading-snug">...</h3>
                    <p class="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      De: <strong id="msg-detail-sender" class="text-slate-900">...</strong> 
                      &lt;<span id="msg-detail-email" class="text-blue-600">...</span>&gt;
                    </p>
                  </div>
                  <span id="msg-detail-status-badge" class="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 uppercase">Não Lida</span>
                </div>
                <div class="text-[11px] text-slate-400 flex items-center gap-4">
                  <span>📅 Recebido em: <strong id="msg-detail-date" class="text-slate-600">...</strong></span>
                  <span>🌐 IP: <strong id="msg-detail-ip" class="text-slate-600">...</strong></span>
                </div>
              </div>

              <!-- Corpo da Mensagem -->
              <div class="flex-1 overflow-y-auto mb-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-800 leading-relaxed custom-scrollbar whitespace-pre-wrap font-sans" id="msg-detail-body">
                ...
              </div>

              <!-- Histórico de Resposta (se houver) -->
              <div id="msg-reply-history" class="hidden mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex-shrink-0">
                <div class="font-black text-[11px] text-emerald-800 mb-1 flex items-center gap-1">
                  <i data-lucide="check-check" class="w-3.5 h-3.5"></i>
                  <span>Resposta enviada:</span>
                </div>
                <p id="msg-reply-history-text" class="text-emerald-900 whitespace-pre-wrap">...</p>
              </div>

              <!-- Ações Rápidas -->
              <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-shrink-0">
                <div class="flex items-center gap-2">
                  <button type="button" id="btn-msg-mark-read" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">
                    Marcar como Lida
                  </button>
                  <button type="button" id="btn-msg-archive" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">
                    Arquivar
                  </button>
                  <button type="button" id="btn-msg-delete" class="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold cursor-pointer">
                    Excluir
                  </button>
                </div>
                <button type="button" id="btn-msg-open-reply" class="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-700 to-[#002776] text-white text-xs font-black shadow-xs hover:shadow cursor-pointer flex items-center gap-1.5">
                  <i data-lucide="reply" class="w-3.5 h-3.5"></i>
                  <span>Responder Visitante</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </section>
`;

// HTML da Seção 2: Avaliações & Notas dos Cursos
const sectionRatingsHtml = `
      <!-- =================================================================== -->
      <!-- ABA: AVALIAÇÕES & PROVA SOCIAL DE CURSOS -->
      <!-- =================================================================== -->
      <section id="section-ratings" class="admin-tab-section hidden space-y-6">
        
        <!-- Cabeçalho -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 class="text-lg font-black text-slate-900 flex items-center gap-2">
              <i data-lucide="star" class="w-5 h-5 text-amber-500"></i>
              Avaliações & Prova Social dos Cursos
            </h2>
            <p class="text-xs text-slate-500 font-medium">
              Monitore a satisfação dos alunos, média de estrelas de cada curso e modere comentários da comunidade.
            </p>
          </div>
          
          <div class="flex items-center gap-2">
            <button 
              type="button" 
              id="btn-refresh-ratings"
              class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
            >
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        <!-- Cards de Estatísticas de Avaliações -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm bg-amber-50/20">
            <span class="text-[10px] font-black uppercase text-amber-800 block mb-1">Média Geral do Portal</span>
            <div class="flex items-center gap-1.5">
              <span id="rating-stat-avg" class="text-2xl font-black text-amber-600">5.0</span>
              <span class="text-amber-500 text-lg">★★★★★</span>
            </div>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span class="text-[10px] font-black uppercase text-slate-400 block mb-1">Total de Avaliações</span>
            <span id="rating-stat-total" class="text-2xl font-black text-slate-900">0</span>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span class="text-[10px] font-black uppercase text-slate-400 block mb-1">Cursos Avaliados</span>
            <span id="rating-stat-courses" class="text-2xl font-black text-slate-900">0</span>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/20">
            <span class="text-[10px] font-black uppercase text-emerald-700 block mb-1">Satisfação Geral</span>
            <span id="rating-stat-satisfaction" class="text-2xl font-black text-emerald-600">98%</span>
          </div>
        </div>

        <!-- Tabela de Avaliações dos Alunos -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-700">Comentários & Notas Recentes</h3>
            <div class="relative w-full sm:w-64">
              <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-2.5"></i>
              <input 
                type="text" 
                id="input-search-ratings" 
                placeholder="Filtrar por curso ou aluno..." 
                class="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-white border border-slate-200 font-medium text-slate-900 focus:outline-none focus:border-[#002776]"
              >
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-600">
              <thead class="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-wider border-b border-slate-100">
                <tr>
                  <th class="p-3.5">Curso</th>
                  <th class="p-3.5">Nota</th>
                  <th class="p-3.5">Aluno & Comentário</th>
                  <th class="p-3.5">Data</th>
                  <th class="p-3.5">Status</th>
                  <th class="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody id="ratings-table-body" class="divide-y divide-slate-100">
                <tr>
                  <td colspan="6" class="p-8 text-center text-slate-400">Carregando avaliações...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </section>
`;

// HTML da Seção 3: Banners de Parceiros & Anunciantes Diretos
const sectionBannersHtml = `
      <!-- =================================================================== -->
      <!-- ABA: BANNERS DE PARCEIROS & ANUNCIANTES DIRETOS -->
      <!-- =================================================================== -->
      <section id="section-banners" class="admin-tab-section hidden space-y-6">
        
        <!-- Cabeçalho -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 class="text-lg font-black text-slate-900 flex items-center gap-2">
              <i data-lucide="image" class="w-5 h-5 text-purple-600"></i>
              Banners de Parceiros & Anunciantes Diretos
            </h2>
            <p class="text-xs text-slate-500 font-medium">
              Controle a veiculação de publicidade direta, patrocinadores de trilhas e parcerias com faculdades e escolas.
            </p>
          </div>
          
          <div class="flex items-center gap-2">
            <button 
              type="button" 
              id="btn-new-banner"
              class="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-[#002776] text-white text-xs font-black shadow-xs hover:shadow cursor-pointer flex items-center gap-1.5"
            >
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>Novo Banner Parceiro</span>
            </button>
          </div>
        </div>

        <!-- Cards de Métricas de Publicidade Direta -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white p-4 rounded-2xl border border-purple-200 shadow-sm bg-purple-50/20">
            <span class="text-[10px] font-black uppercase text-purple-800 block mb-1">Banners Ativos</span>
            <span id="banner-stat-active" class="text-2xl font-black text-purple-700">0</span>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span class="text-[10px] font-black uppercase text-slate-400 block mb-1">Impressões Totais</span>
            <span id="banner-stat-impressions" class="text-2xl font-black text-slate-900">0</span>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span class="text-[10px] font-black uppercase text-slate-400 block mb-1">Cliques Totais</span>
            <span id="banner-stat-clicks" class="text-2xl font-black text-blue-600">0</span>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/20">
            <span class="text-[10px] font-black uppercase text-emerald-800 block mb-1">Taxa de Cliques (CTR)</span>
            <span id="banner-stat-ctr" class="text-2xl font-black text-emerald-600">0.0%</span>
          </div>
        </div>

        <!-- Tabela de Banners -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-700">Campanhas & Anúncios Ativos</h3>
            <span id="banners-count-badge" class="text-xs font-black text-slate-500">0 cadastrados</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-600">
              <thead class="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-wider border-b border-slate-100">
                <tr>
                  <th class="p-3.5">Banner / Título</th>
                  <th class="p-3.5">Anunciante</th>
                  <th class="p-3.5">Posição</th>
                  <th class="p-3.5">Período</th>
                  <th class="p-3.5">Cliques & CTR</th>
                  <th class="p-3.5">Status</th>
                  <th class="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody id="banners-table-body" class="divide-y divide-slate-100">
                <tr>
                  <td colspan="7" class="p-8 text-center text-slate-400">Carregando banners de parceiros...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </section>
`;

// HTML da Seção 4: Log de Auditoria & Segurança
const sectionAuditHtml = `
      <!-- =================================================================== -->
      <!-- ABA: LOG DE AUDITORIA & SEGURANÇA -->
      <!-- =================================================================== -->
      <section id="section-audit" class="admin-tab-section hidden space-y-6">
        
        <!-- Cabeçalho -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 class="text-lg font-black text-slate-900 flex items-center gap-2">
              <i data-lucide="shield-alert" class="w-5 h-5 text-slate-700"></i>
              Log de Auditoria & Rastreabilidade de Segurança
            </h2>
            <p class="text-xs text-slate-500 font-medium">
              Histórico completo de ações administrativas executadas no painel com registro de data, usuário e IP.
            </p>
          </div>
          
          <div class="flex items-center gap-2">
            <button 
              type="button" 
              id="btn-export-audit-csv"
              class="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
            >
              <i data-lucide="download" class="w-3.5 h-3.5"></i>
              <span>Exportar CSV</span>
            </button>
            <button 
              type="button" 
              id="btn-refresh-audit"
              class="px-3.5 py-1.5 rounded-xl bg-[#002776] text-white text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
            >
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        <!-- Tabela de Logs de Auditoria -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-700">Histórico de Atividades Administrativas</h3>
            <div class="relative w-full sm:w-64">
              <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-2.5"></i>
              <input 
                type="text" 
                id="input-search-audit" 
                placeholder="Buscar por usuário, ação ou detalhe..." 
                class="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-white border border-slate-200 font-medium text-slate-900 focus:outline-none focus:border-[#002776]"
              >
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-600">
              <thead class="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-wider border-b border-slate-100">
                <tr>
                  <th class="p-3.5">Data / Hora</th>
                  <th class="p-3.5">Administrador</th>
                  <th class="p-3.5">Ação Realizada</th>
                  <th class="p-3.5">Detalhes</th>
                  <th class="p-3.5">Endereço IP</th>
                </tr>
              </thead>
              <tbody id="audit-table-body" class="divide-y divide-slate-100">
                <tr>
                  <td colspan="5" class="p-8 text-center text-slate-400">Carregando logs de auditoria...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </section>
`;

// HTML da Central de Backup & Saúde (para injetar dentro de section-system)
const systemBackupAndHealthHtml = `
        <!-- CENTRAL DE BACKUP 1-CLIQUE & SAÚDE DO SERVIDOR -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          
          <!-- Card de Backup 1-Clique -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div class="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <i data-lucide="database" class="w-5 h-5 text-emerald-600"></i>
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider">
                Central de Backups 1-Clique
              </h3>
            </div>
            <p class="text-xs text-slate-600 mb-4 font-medium leading-relaxed">
              Exporte todo o banco de dados e arquivos de configuração para manter cópias de segurança locais e prevenir perda de dados.
            </p>

            <div class="space-y-3">
              <button 
                type="button" 
                id="btn-download-sql-backup"
                class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-[#009B3A] hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-black shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <i data-lucide="download" class="w-4 h-4 text-[#ffdf00]"></i>
                <span>Baixar Backup Completo MySQL (.sql)</span>
              </button>

              <button 
                type="button" 
                id="btn-download-json-backup"
                class="w-full py-2.5 px-4 rounded-xl bg-[#002776] hover:bg-blue-900 text-white text-xs font-black shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <i data-lucide="file-json" class="w-4 h-4 text-emerald-400"></i>
                <span>Baixar Dados Estruturados em JSON (.json)</span>
              </button>

              <button 
                type="button" 
                id="btn-clear-system-cache"
                class="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <i data-lucide="refresh-cw" class="w-4 h-4 text-amber-600"></i>
                <span>Limpar & Recarregar Caches do Sistema</span>
              </button>
            </div>
          </div>

          <!-- Card de Saúde do Servidor & Conexão -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div class="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <i data-lucide="activity" class="w-5 h-5 text-blue-600"></i>
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider">
                Diagnóstico de Saúde do Servidor
              </h3>
            </div>

            <div class="space-y-3 text-xs">
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span class="font-bold text-slate-600">Banco de Dados MySQL</span>
                <span id="health-db-badge" class="px-2 py-0.5 rounded-md font-black text-[10px] bg-emerald-100 text-emerald-800">Conectado (PDO)</span>
              </div>
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span class="font-bold text-slate-600">Versão do PHP</span>
                <span id="health-php-version" class="font-black text-slate-900">...</span>
              </div>
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span class="font-bold text-slate-600">Limite de Memória / Upload</span>
                <span id="health-memory-limit" class="font-black text-slate-900">...</span>
              </div>
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span class="font-bold text-slate-600">Arquivos de Cache Local</span>
                <span id="health-cache-status" class="font-black text-emerald-700">...</span>
              </div>
            </div>
          </div>

        </div>
`;

// Modal de Resposta de Mensagem
const replyModalHtml = `
  <!-- MODAL: RESPONDER MENSAGEM DO VISITANTE -->
  <div id="modal-reply-message" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <h3 class="text-sm font-black text-slate-900 flex items-center gap-2">
          <i data-lucide="reply" class="w-4 h-4 text-blue-600"></i>
          <span>Responder Visitante</span>
        </h3>
        <button type="button" id="btn-close-reply-modal" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <form id="form-reply-message" class="space-y-4">
        <input type="hidden" id="reply-msg-id" value="">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Destinatário</label>
          <input type="text" id="reply-msg-to" readonly class="w-full px-3 py-2 rounded-xl text-xs bg-slate-100 border border-slate-200 text-slate-700 font-bold">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Mensagem de Resposta</label>
          <textarea id="reply-msg-text" required rows="5" placeholder="Digite sua resposta aqui..." class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-[#002776]"></textarea>
        </div>
        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button type="button" id="btn-cancel-reply" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">Cancelar</button>
          <button type="submit" class="px-4 py-2 rounded-xl text-xs font-black bg-[#002776] text-white hover:bg-blue-900 cursor-pointer flex items-center gap-1.5">
            <i data-lucide="send" class="w-3.5 h-3.5"></i>
            <span>Enviar Resposta</span>
          </button>
        </div>
      </form>
    </div>
  </div>
`;

// Modal de Banner Parceiro
const bannerModalHtml = `
  <!-- MODAL: CADASTRAR / EDITAR BANNER PARCEIRO -->
  <div id="modal-banner" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <h3 class="text-sm font-black text-slate-900 flex items-center gap-2">
          <i data-lucide="image" class="w-4 h-4 text-purple-600"></i>
          <span id="modal-banner-title-text">Novo Banner Parceiro</span>
        </h3>
        <button type="button" id="btn-close-banner-modal" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <form id="form-banner" class="space-y-3.5">
        <input type="hidden" id="banner-id" value="0">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Título da Campanha</label>
          <input type="text" id="banner-title" required placeholder="Ex: Bolsas de Estudo 2026" class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-purple-600">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Nome do Anunciante / Marca</label>
          <input type="text" id="banner-advertiser" required placeholder="Ex: Faculdade Parceira" class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-purple-600">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">URL da Imagem do Banner</label>
          <input type="url" id="banner-image-url" required placeholder="https://... ou assets/..." class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-purple-600">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Link de Destino ao Clicar</label>
          <input type="url" id="banner-target-url" required placeholder="https://parceiro.com.br/inscricao" class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-purple-600">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Posição</label>
            <select id="banner-position" class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-purple-600">
              <option value="home_top">Topo da Home</option>
              <option value="sidebar">Barra Lateral</option>
              <option value="footer">Rodapé</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Status</label>
            <select id="banner-status" class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-purple-600">
              <option value="active">Ativo (Publicado)</option>
              <option value="paused">Pausado (Rascunho)</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Data Início</label>
            <input type="date" id="banner-start-date" class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-300 text-slate-900">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Data Término</label>
            <input type="date" id="banner-end-date" class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-300 text-slate-900">
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button type="button" id="btn-cancel-banner" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">Cancelar</button>
          <button type="submit" class="px-4 py-2 rounded-xl text-xs font-black bg-purple-700 text-white hover:bg-purple-800 cursor-pointer">Salvar Banner</button>
        </div>
      </form>
    </div>
  </div>
`;

// Inserir as seções antes do fechamento </main>
if (!adminHtml.includes('id="section-messages"')) {
  adminHtml = adminHtml.replace('</main>', sectionMessagesHtml + sectionRatingsHtml + sectionBannersHtml + sectionAuditHtml + '\n      </main>');
  console.log('✅ Seções Messages, Ratings, Banners e Audit inseridas em admin.html.');
}

// Inserir Backup e Saúde dentro de section-system antes do fechamento </section> de section-system
if (!adminHtml.includes('id="btn-download-sql-backup"')) {
  const systemClosingTagIdx = adminHtml.indexOf('</section>', adminHtml.indexOf('id="section-system"'));
  if (systemClosingTagIdx !== -1) {
    adminHtml = adminHtml.slice(0, systemClosingTagIdx) + systemBackupAndHealthHtml + '\n      ' + adminHtml.slice(systemClosingTagIdx);
    console.log('✅ Card de Backup 1-Clique & Saúde inserido em section-system.');
  }
}

// Inserir Modais antes de </body>
if (!adminHtml.includes('id="modal-reply-message"')) {
  adminHtml = adminHtml.replace('</body>', replyModalHtml + bannerModalHtml + '\n</body>');
  console.log('✅ Modais de Resposta e Banners inseridos em admin.html.');
}

fs.writeFileSync(adminPath, adminHtml, 'utf8');
console.log('✅ admin.html completamente atualizado com todas as novas ferramentas!');
