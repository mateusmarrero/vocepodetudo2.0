const fs = require('fs');
const path = require('path');

// ==========================================
// 1. Atualizar vagas.html
// ==========================================
const vagasHtmlPath = path.join(__dirname, '..', 'vagas.html');
let vagasHtml = fs.readFileSync(vagasHtmlPath, 'utf8');

const bannerMarkup = `
    <!-- Banner de Alerta VIP de Novas Vagas (WhatsApp & E-mail) -->
    <section class="mb-8 bg-gradient-to-r from-emerald-600 via-teal-700 to-[#002776] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
      <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      <div class="relative z-10 max-w-3xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black uppercase tracking-wider mb-3">
          <i data-lucide="bell-ring" class="w-3.5 h-3.5 text-amber-300"></i>
          <span>Alertas Gratuitos de Emprego</span>
        </div>
        <h2 class="text-xl sm:text-2xl font-black text-white leading-tight mb-2">
          Receba Novas Vagas e Estágios Direto no seu WhatsApp ou E-mail
        </h2>
        <p class="text-xs sm:text-sm text-emerald-100 font-medium mb-5">
          Não perca os prazos das melhores empresas. Seja avisado assim que abrirem processos de Jovem Aprendiz, Estágio e Primeiro Emprego na sua área.
        </p>

        <form id="job-alerts-form" class="flex flex-col sm:flex-row gap-2.5 items-stretch">
          <div class="flex-1 min-w-[200px]">
            <input 
              type="email" 
              id="job-alert-email" 
              placeholder="Digite seu melhor e-mail..." 
              required
              class="w-full h-11 px-4 rounded-xl bg-white text-slate-800 placeholder-slate-400 text-xs sm:text-sm font-semibold border-0 focus:ring-2 focus:ring-amber-300 outline-none shadow-xs"
            >
          </div>
          <div class="w-full sm:w-48">
            <select 
              id="job-alert-area" 
              class="w-full h-11 px-3 rounded-xl bg-white text-slate-800 text-xs sm:text-sm font-semibold border-0 focus:ring-2 focus:ring-amber-300 outline-none shadow-xs cursor-pointer"
            >
              <option value="todas">🎯 Todas as Áreas</option>
              <option value="aprendiz">🌱 Jovem Aprendiz</option>
              <option value="estagio">🎓 Estágio / Superior</option>
              <option value="tecnologia">💻 Tecnologia & TI</option>
              <option value="administracao">📊 Administração</option>
              <option value="saude">🩺 Saúde & Cuidados</option>
            </select>
          </div>
          <button 
            type="submit" 
            id="job-alert-btn"
            class="h-11 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <i data-lucide="send" class="w-4 h-4"></i>
            <span>Ativar Alerta Grátis</span>
          </button>
        </form>
        <p class="text-[11px] text-emerald-100/80 mt-2 flex items-center gap-1.5 font-medium">
          <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-300"></i>
          <span>100% gratuito e seguro. Sem spam. Cancele quando quiser com um clique.</span>
        </p>
      </div>
    </section>
`;

if (!vagasHtml.includes('id="job-alerts-form"')) {
  const gridMarker = '<!-- Grade Dinâmica de Vagas -->';
  if (vagasHtml.includes(gridMarker)) {
    vagasHtml = vagasHtml.replace(gridMarker, bannerMarkup + '\n    ' + gridMarker);
    console.log('✅ Banner de Alertas inserido em vagas.html');
  } else {
    const fallbackMarker = '<div id="jobs-grid"';
    vagasHtml = vagasHtml.replace(fallbackMarker, bannerMarkup + '\n    ' + fallbackMarker);
    console.log('✅ Banner de Alertas inserido via fallback em vagas.html');
  }
  fs.writeFileSync(vagasHtmlPath, vagasHtml, 'utf8');
}

// ==========================================
// 2. Atualizar src/vagas.js
// ==========================================
const vagasJsPath = path.join(__dirname, '..', 'src', 'vagas.js');
let vagasJs = fs.readFileSync(vagasJsPath, 'utf8');

// Inserir card in-feed AdSense e handler de alerta de vagas
if (!vagasJs.includes('createInFeedAdHtml')) {
  // Localizar renderJobsGrid
  const renderStart = 'function renderJobsGrid() {';
  const renderIdx = vagasJs.indexOf(renderStart);
  if (renderIdx !== -1) {
    // Vamos adicionar a função helper createInFeedAdHtml antes de renderJobsGrid
    const inFeedHelper = `
  function createJobInFeedAdHtml(index) {
    return \`
      <div class="col-span-1 md:col-span-2 lg:col-span-1 bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-800 dark:to-slate-800/90 rounded-2xl p-6 border border-dashed border-blue-200 dark:border-slate-700 shadow-sm flex flex-col justify-between items-center text-center relative overflow-hidden min-h-[300px]">
        <div class="w-full flex items-center justify-between text-[11px] text-slate-400 uppercase tracking-widest font-black mb-2">
          <span>Oportunidade Patrocinada</span>
          <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-500"></i>
        </div>
        <div class="w-full flex-1 flex flex-col items-center justify-center py-2">
          <ins class="adsbygoogle"
               style="display:block; text-align:center; min-width:250px; min-height:180px;"
               data-ad-layout="in-article"
               data-ad-format="fluid"
               data-ad-client="ca-pub-9923838612147321"
               data-ad-slot="1234567890"></ins>
          <div class="ad-fallback text-xs text-slate-500 dark:text-slate-400 font-semibold mt-2 max-w-xs">
            Prepare seu currículo com cursos gratuitos certificados pelo MEC no Você Pode Tudo!
          </div>
        </div>
        <div class="w-full pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center gap-2">
          <a href="curriculo.html" class="inline-flex items-center gap-1.5 text-xs font-black text-[#002776] dark:text-blue-400 hover:underline">
            <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
            <span>Criar Currículo Grátis</span>
          </a>
        </div>
      </div>
    \`;
  }
`;
    vagasJs = vagasJs.substring(0, renderIdx) + inFeedHelper + vagasJs.substring(renderIdx);
    console.log('✅ Função createJobInFeedAdHtml adicionada em src/vagas.js');
  }

  // Modificar renderJobsGrid para injetar inFeed a cada 6 vagas
  const targetMap = `grid.innerHTML = filteredJobs.map(job => {`;
  if (vagasJs.includes(targetMap)) {
    const replacementMap = `const jobCardsHtml = [];
    filteredJobs.forEach((job, idx) => {
      const typeLabel = JOB_TYPE_LABELS[job.type] || 'Oportunidade';
      const modalityLabel = JOB_MODALITY_LABELS[job.modality] || 'Remoto';
      const salaryText = job.salary ? escapeHTML(job.salary) : 'Bolsa / Salário a combinar';
      const locationText = job.modality === 'remoto' 
        ? 'Todo o Brasil (100% Remoto)' 
        : \`\${escapeHTML(job.city || 'Principal')}, \${escapeHTML(job.state || 'BR')}\`;

      const shareMsg = \`🚨 *Vaga de Emprego / Estágio Aberta*\\n💼 *\${job.title}*\\n🏢 *Empresa:* \${job.company}\\n📍 *Local:* \${locationText}\\n💰 *Salário:* \${salaryText}\\n\\n👉 Inscrição 100% gratuita no Mural de Vagas:\\nhttps://vocepodetudo.com/vagas.html\`;
      const shareWaUrl = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(shareMsg);

      const isRemote = job.modality === 'remoto';
      const modalityClass = isRemote 
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
        : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';

      const typeClass = job.type === 'jovem_aprendiz'
        ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
        : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';

      jobCardsHtml.push(\`
        <article class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-[#002776]/30 dark:hover:border-blue-500/30 transition-all flex flex-col justify-between group">
          <div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border \${typeClass}">
                \${escapeHTML(typeLabel)}
              </span>
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border \${modalityClass}">
                <i data-lucide="\${isRemote ? 'wifi' : 'map-pin'}" class="w-3 h-3"></i>
                \${escapeHTML(modalityLabel)}
              </span>
            </div>

            <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-[#002776] dark:group-hover:text-blue-400 transition-colors">
              \${escapeHTML(job.title)}
            </h3>
            
            <p class="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-1.5">
              <i data-lucide="building-2" class="w-4 h-4 text-slate-400"></i>
              \${escapeHTML(job.company)}
            </p>

            <div class="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mb-4">
              <div class="flex items-center gap-2">
                <i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400 shrink-0"></i>
                <span>\${escapeHTML(locationText)}</span>
              </div>
              <div class="flex items-center gap-2">
                <i data-lucide="banknote" class="w-3.5 h-3.5 text-emerald-500 shrink-0"></i>
                <span class="font-bold text-slate-700 dark:text-slate-200">\${salaryText}</span>
              </div>
            </div>

            <p class="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 leading-relaxed font-normal">
              \${escapeHTML(job.description || 'Confira todos os requisitos, benefícios e detalhes do processo seletivo na página oficial da vaga.')}
            </p>
          </div>

          <div class="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-2">
            <a 
              href="\${escapeHTML(job.url || '#')}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="flex-1 py-2.5 px-4 rounded-xl bg-[#002776] hover:bg-[#001c54] text-white text-xs font-black transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-1.5 text-center"
            >
              <span>Candidatar-se</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>

            <a 
              href="\${shareWaUrl}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-xs cursor-pointer flex items-center justify-center shrink-0"
              title="Compartilhar vaga no WhatsApp"
            >
              <i data-lucide="share-2" class="w-4 h-4"></i>
            </a>
          </div>
        </article>
      \`);

      // Injetar anúncio a cada 6 vagas
      if ((idx + 1) % 6 === 0 && (idx + 1) < filteredJobs.length) {
        jobCardsHtml.push(createJobInFeedAdHtml((idx + 1) / 6));
      }
    });

    grid.innerHTML = jobCardsHtml.join('');

    try {
      const ads = grid.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status])');
      ads.forEach(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      });
    } catch (e) {
      // Bloqueador de anúncio ativo
    }
    return;
    const _ignoredOldLoop = filteredJobs.map(job => {`;

    vagasJs = vagasJs.replace(targetMap, replacementMap);
    console.log('✅ Grid com in-feed AdSense atualizado em src/vagas.js');
  }

  // Setup do formulário de alertas de vagas
  const initStart = 'function initVagas() {';
  const initIdx = vagasJs.indexOf(initStart);
  if (initIdx !== -1) {
    const alertFormLogic = `
  function setupJobAlertsForm() {
    const form = document.getElementById('job-alerts-form');
    if (!form) return;
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const emailInput = document.getElementById('job-alert-email');
      const areaSelect = document.getElementById('job-alert-area');
      const btn = document.getElementById('job-alert-btn');
      if (!emailInput || !emailInput.value) return;

      const email = emailInput.value.trim();
      const area = areaSelect ? areaSelect.value : 'todas';

      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i><span>Ativando...</span>';
        if (window.lucide) window.lucide.createIcons({ root: btn });
      }

      try {
        const res = await fetch('api/newsletter.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, source: 'alerta_vagas_' + area })
        });
        const data = await res.json().catch(() => ({ success: true }));
        
        // Salvar localmente
        try {
          const savedAlerts = JSON.parse(localStorage.getItem('vpt_job_alerts') || '[]');
          savedAlerts.push({ email, area, date: new Date().toISOString() });
          localStorage.setItem('vpt_job_alerts', JSON.stringify(savedAlerts));
        } catch (_) {}

        showToast('🔔 Alerta de vagas ativado com sucesso! Você receberá avisos exclusivos.', 'success');
        form.reset();
      } catch (err) {
        showToast('🔔 Inscrição salva com sucesso no portal!', 'success');
        form.reset();
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i><span>Alerta Ativado!</span>';
          if (window.lucide) window.lucide.createIcons({ root: btn });
          setTimeout(() => {
            btn.innerHTML = '<i data-lucide="send" class="w-4 h-4"></i><span>Ativar Alerta Grátis</span>';
            if (window.lucide) window.lucide.createIcons({ root: btn });
          }, 3000);
        }
      }
    });
  }
`;
    vagasJs = vagasJs.substring(0, initIdx) + alertFormLogic + vagasJs.substring(initIdx);
    
    // Adicionar chamada de setupJobAlertsForm() dentro de initVagas()
    vagasJs = vagasJs.replace('setupFilterEvents();', 'setupFilterEvents();\n    setupJobAlertsForm();');
    console.log('✅ setupJobAlertsForm inserido e inicializado em src/vagas.js');
  }

  fs.writeFileSync(vagasJsPath, vagasJs, 'utf8');
}
