const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const adminPath = path.join(ROOT, 'admin.html');

let adminHtml = fs.readFileSync(adminPath, 'utf8');

console.log('--- Iniciando Injeção das Novas Abas e Seções em admin.html ---');

// 1. Injetar novas abas na barra de navegação Desktop
// Abaixo de Mídia Kit, adicionar Banners & Parceiros
const mediakitDesktopTab = `              <button 
                id="tab-btn-mediakit" 
                class="tab-nav-btn px-3 py-1.5 rounded-xl text-slate-700 hover:text-[#002776] hover:bg-white flex items-center gap-1.5 flex-shrink-0 cursor-pointer transition-all"
                title="Mídia Kit & Espaços Publicitários"
              >
                <i data-lucide="file-spreadsheet" class="w-4 h-4 text-emerald-600"></i>
                <span>Mídia Kit</span>
                <span class="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-[#ffcc29] text-slate-950 uppercase">Oficial</span>
              </button>`;

const bannersDesktopTab = `
              <button 
                id="tab-btn-banners" 
                class="tab-nav-btn px-3 py-1.5 rounded-xl text-slate-700 hover:text-[#002776] hover:bg-white flex items-center gap-1.5 flex-shrink-0 cursor-pointer transition-all"
                title="Banners de Parceiros & Anunciantes Diretos"
              >
                <i data-lucide="image" class="w-4 h-4 text-purple-600"></i>
                <span>Banners Parceiros</span>
              </button>`;

if (!adminHtml.includes('id="tab-btn-banners"')) {
  adminHtml = adminHtml.replace(mediakitDesktopTab, mediakitDesktopTab + bannersDesktopTab);
  console.log('✅ Aba Desktop: Banners Parceiros inserida.');
}

// Abaixo de Teste Vocacional, adicionar Avaliações & Notas
const quizDesktopTab = `              <button 
                id="tab-btn-quiz" 
                class="tab-nav-btn px-3 py-1.5 rounded-xl text-slate-700 hover:text-[#002776] hover:bg-white flex items-center gap-1.5 flex-shrink-0 cursor-pointer transition-all"
                title="Estatísticas do Teste Vocacional"
              >
                <i data-lucide="target" class="w-4 h-4 text-amber-500"></i>
                <span>Teste Vocacional</span>
              </button>`;

const ratingsDesktopTab = `
              <button 
                id="tab-btn-ratings" 
                class="tab-nav-btn px-3 py-1.5 rounded-xl text-slate-700 hover:text-[#002776] hover:bg-white flex items-center gap-1.5 flex-shrink-0 cursor-pointer transition-all"
                title="Avaliações & Prova Social dos Cursos"
              >
                <i data-lucide="star" class="w-4 h-4 text-amber-500"></i>
                <span>Avaliações & Notas</span>
              </button>`;

if (!adminHtml.includes('id="tab-btn-ratings"')) {
  adminHtml = adminHtml.replace(quizDesktopTab, quizDesktopTab + ratingsDesktopTab);
  console.log('✅ Aba Desktop: Avaliações & Notas inserida.');
}

// Em Engajamento & Sistema, adicionar Mensagens & Fale Conosco e Log de Auditoria
const pushDesktopTab = `              <button 
                id="tab-btn-push" 
                class="tab-nav-btn px-3 py-1.5 rounded-xl text-slate-700 hover:text-[#002776] hover:bg-white flex items-center gap-1.5 flex-shrink-0 cursor-pointer transition-all"
                title="Disparar Notificações Web Push"
              >
                <i data-lucide="bell-ring" class="w-4 h-4 text-amber-500"></i>
                <span>Push</span>
                <span id="badge-total-push" class="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-100 text-amber-800">...</span>
              </button>`;

const messagesAndAuditDesktopTabs = `
              <button 
                id="tab-btn-messages" 
                class="tab-nav-btn px-3 py-1.5 rounded-xl text-slate-700 hover:text-[#002776] hover:bg-white flex items-center gap-1.5 flex-shrink-0 cursor-pointer transition-all"
                title="Mensagens Recebidas pelo Fale Conosco"
              >
                <i data-lucide="inbox" class="w-4 h-4 text-blue-600"></i>
                <span>Mensagens</span>
                <span id="badge-unread-messages" class="hidden px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-600 text-white animate-pulse">0</span>
              </button>
              <button 
                id="tab-btn-audit" 
                class="tab-nav-btn px-3 py-1.5 rounded-xl text-slate-700 hover:text-[#002776] hover:bg-white flex items-center gap-1.5 flex-shrink-0 cursor-pointer transition-all"
                title="Log de Auditoria e Segurança"
              >
                <i data-lucide="shield-alert" class="w-4 h-4 text-slate-600"></i>
                <span>Auditoria</span>
              </button>`;

if (!adminHtml.includes('id="tab-btn-messages"')) {
  adminHtml = adminHtml.replace(pushDesktopTab, pushDesktopTab + messagesAndAuditDesktopTabs);
  console.log('✅ Abas Desktop: Mensagens e Auditoria inseridas.');
}

// 2. Injetar novas abas no Drawer Móvel
const mobileMediakitTab = `<!-- 2. Mídia Kit & Anunciantes -->
              <button 
                type="button"
                data-target-tab="tab-btn-mediakit"
                data-target-section="section-mediakit"
                onclick="if(window.switchAdminTab){window.switchAdminTab(this.getAttribute('data-target-tab'),this.getAttribute('data-target-section'))}" class="admin-mobile-tab-item w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <div class="flex items-center gap-2.5">
                  <i data-lucide="file-spreadsheet" class="w-4 h-4 text-emerald-600"></i>
                  <span>Mídia Kit & Anunciantes</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#ffcc29] text-slate-950 uppercase">Oficial</span>
                  <i data-lucide="check" class="w-3.5 h-3.5 mobile-tab-check hidden"></i>
                </div>
              </button>`;

const mobileBannersTab = `
              <!-- Banners Parceiros Móvel -->
              <button 
                type="button"
                data-target-tab="tab-btn-banners"
                data-target-section="section-banners"
                onclick="if(window.switchAdminTab){window.switchAdminTab(this.getAttribute('data-target-tab'),this.getAttribute('data-target-section'))}" class="admin-mobile-tab-item w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <div class="flex items-center gap-2.5">
                  <i data-lucide="image" class="w-4 h-4 text-purple-600"></i>
                  <span>Banners de Parceiros</span>
                </div>
                <i data-lucide="check" class="w-3.5 h-3.5 mobile-tab-check hidden"></i>
              </button>`;

if (!adminHtml.includes('data-target-tab="tab-btn-banners"')) {
  adminHtml = adminHtml.replace(mobileMediakitTab, mobileMediakitTab + mobileBannersTab);
  console.log('✅ Aba Móvel: Banners Parceiros inserida.');
}

const mobileQuizTab = `<!-- 6. Teste Vocacional -->
              <button 
                type="button"
                data-target-tab="tab-btn-quiz"
                data-target-section="section-quiz"
                onclick="if(window.switchAdminTab){window.switchAdminTab(this.getAttribute('data-target-tab'),this.getAttribute('data-target-section'))}" class="admin-mobile-tab-item w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <div class="flex items-center gap-2.5">
                  <i data-lucide="target" class="w-4 h-4 text-amber-500"></i>
                  <span>Teste Vocacional</span>
                </div>
                <i data-lucide="check" class="w-3.5 h-3.5 mobile-tab-check hidden"></i>
              </button>`;

const mobileRatingsTab = `
              <!-- Avaliações Móvel -->
              <button 
                type="button"
                data-target-tab="tab-btn-ratings"
                data-target-section="section-ratings"
                onclick="if(window.switchAdminTab){window.switchAdminTab(this.getAttribute('data-target-tab'),this.getAttribute('data-target-section'))}" class="admin-mobile-tab-item w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <div class="flex items-center gap-2.5">
                  <i data-lucide="star" class="w-4 h-4 text-amber-500"></i>
                  <span>Avaliações & Notas</span>
                </div>
                <i data-lucide="check" class="w-3.5 h-3.5 mobile-tab-check hidden"></i>
              </button>`;

if (!adminHtml.includes('data-target-tab="tab-btn-ratings"')) {
  adminHtml = adminHtml.replace(mobileQuizTab, mobileQuizTab + mobileRatingsTab);
  console.log('✅ Aba Móvel: Avaliações inserida.');
}

const mobilePushTab = `<!-- 12. Notificações Push -->
              <button 
                type="button"
                data-target-tab="tab-btn-push"
                data-target-section="section-push"
                onclick="if(window.switchAdminTab){window.switchAdminTab(this.getAttribute('data-target-tab'),this.getAttribute('data-target-section'))}" class="admin-mobile-tab-item w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <div class="flex items-center gap-2.5">
                  <i data-lucide="bell-ring" class="w-4 h-4 text-amber-500"></i>
                  <span>Notificações Push</span>
                </div>
                <div class="flex items-center gap-2">
                  <span id="badge-total-push-mobile" class="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">...</span>
                  <i data-lucide="check" class="w-3.5 h-3.5 mobile-tab-check hidden"></i>
                </div>
              </button>`;

const mobileMessagesAndAuditTabs = `
              <!-- Mensagens Fale Conosco Móvel -->
              <button 
                type="button"
                data-target-tab="tab-btn-messages"
                data-target-section="section-messages"
                onclick="if(window.switchAdminTab){window.switchAdminTab(this.getAttribute('data-target-tab'),this.getAttribute('data-target-section'))}" class="admin-mobile-tab-item w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <div class="flex items-center gap-2.5">
                  <i data-lucide="inbox" class="w-4 h-4 text-blue-600"></i>
                  <span>Mensagens & Suporte</span>
                </div>
                <div class="flex items-center gap-2">
                  <span id="badge-unread-messages-mobile" class="hidden px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white">0</span>
                  <i data-lucide="check" class="w-3.5 h-3.5 mobile-tab-check hidden"></i>
                </div>
              </button>

              <!-- Log de Auditoria Móvel -->
              <button 
                type="button"
                data-target-tab="tab-btn-audit"
                data-target-section="section-audit"
                onclick="if(window.switchAdminTab){window.switchAdminTab(this.getAttribute('data-target-tab'),this.getAttribute('data-target-section'))}" class="admin-mobile-tab-item w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <div class="flex items-center gap-2.5">
                  <i data-lucide="shield-alert" class="w-4 h-4 text-slate-600"></i>
                  <span>Log de Auditoria</span>
                </div>
                <i data-lucide="check" class="w-3.5 h-3.5 mobile-tab-check hidden"></i>
              </button>`;

if (!adminHtml.includes('data-target-tab="tab-btn-messages"')) {
  adminHtml = adminHtml.replace(mobilePushTab, mobilePushTab + mobileMessagesAndAuditTabs);
  console.log('✅ Abas Móvel: Mensagens e Auditoria inseridas.');
}

fs.writeFileSync(adminPath, adminHtml, 'utf8');
console.log('✅ Navegação de admin.html atualizada com sucesso.');
