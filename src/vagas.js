/**
 * src/vagas.js - Mural de Vagas e Oportunidades Independente
 * Você Pode Tudo — Empregabilidade & Qualificação Profissional
 */

(function () {
  'use strict';

  let jobsData = [];
  let filteredJobs = [];
  let currentJobTypeFilter = 'all';
  let currentJobModalityFilter = 'all';
  let currentJobSearchFilter = '';

  const JOB_TYPE_LABELS = {
    'estagio': 'Estágio',
    'jovem_aprendiz': 'Jovem Aprendiz',
    'junior': 'Júnior',
    'trainee': 'Trainee',
    'outro': 'Oportunidade'
  };

  const JOB_MODALITY_LABELS = {
    'remoto': '100% Remoto',
    'hibrido': 'Híbrido',
    'presencial': 'Presencial'
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

  function normalizeText(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
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

  
  function createJobInFeedAdHtml(index) {
    return `
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
          <a href="curriculo" class="inline-flex items-center gap-1.5 text-xs font-black text-[#002776] dark:text-blue-400 hover:underline">
            <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
            <span>Criar Currículo Grátis</span>
          </a>
        </div>
      </div>
    `;
  }

  // ============================================================================
  // GOOGLE FOR JOBS (SCHEMA.ORG / JOBPOSTING) - ESTRUTURAÇÃO OFICIAL DE DADOS
  // ============================================================================
  function updateGoogleJobsSchema(jobs) {
    let scriptTag = document.getElementById('google-jobs-schema-jsonld');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'google-jobs-schema-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    if (!jobs || jobs.length === 0) {
      return;
    }

    const empTypeMap = {
      'jovem_aprendiz': 'PART_TIME',
      'estagio': 'INTERN',
      'junior': 'FULL_TIME',
      'trainee': 'FULL_TIME'
    };

    const structured = jobs.slice(0, 15).map(function(j, idx) {
      var isRemote = j.modality === 'remoto';
      var city = j.city || 'São Paulo';
      var state = j.state || 'SP';
      var datePosted = j.date || '2026-11-10';

      var posting = {
        '@context': 'https://schema.org/',
        '@type': 'JobPosting',
        'title': j.title,
        'description': (j.description || j.title) + ' - Inscrição gratuita no Portal Você Pode Tudo.',
        'identifier': {
          '@type': 'PropertyValue',
          'name': j.company || 'Empresa Parceira',
          'value': 'vpt-job-' + (j.id || idx)
        },
        'datePosted': datePosted,
        'validThrough': '2026-12-31T23:59:59Z',
        'employmentType': empTypeMap[j.type] || 'FULL_TIME',
        'hiringOrganization': {
          '@type': 'Organization',
          'name': j.company || 'Empresa Confidencial',
          'sameAs': 'https://vocepodetudo.com/vagas'
        },
        'directApply': true
      };

      if (isRemote) {
        posting.jobLocationType = 'TELECOMMUTE';
        posting.applicantLocationRequirements = {
          '@type': 'Country',
          'name': 'BR'
        };
      } else {
        posting.jobLocation = {
          '@type': 'Place',
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': 'Centro',
            'addressLocality': city,
            'addressRegion': state,
            'addressCountry': 'BR'
          }
        };
      }

      return posting;
    });

    scriptTag.textContent = JSON.stringify(structured);
  }

  function renderJobsGrid() {
    const grid = document.getElementById('jobs-grid');
    const emptyState = document.getElementById('jobs-empty-state');
    const badge = document.getElementById('jobs-count-badge');
    if (!grid) return;

    if (badge) {
      const isFiltered = currentJobTypeFilter !== 'all' || currentJobModalityFilter !== 'all' || Boolean(currentJobSearchFilter);
      if (isFiltered) {
        badge.textContent = `${filteredJobs.length} vaga${filteredJobs.length === 1 ? '' : 's'} encontrada${filteredJobs.length === 1 ? '' : 's'}`;
      } else {
        badge.textContent = `${filteredJobs.length} vaga${filteredJobs.length === 1 ? '' : 's'} aberta${filteredJobs.length === 1 ? '' : 's'}`;
      }
    }

    if (filteredJobs.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    const jobCardsHtml = [];
    filteredJobs.forEach((job, idx) => {
      const typeLabel = JOB_TYPE_LABELS[job.type] || 'Oportunidade';
      const modalityLabel = JOB_MODALITY_LABELS[job.modality] || 'Remoto';
      const salaryText = job.salary ? escapeHTML(job.salary) : 'Bolsa / Salário a combinar';
      const locationText = job.modality === 'remoto' 
        ? 'Todo o Brasil (100% Remoto)' 
        : `${escapeHTML(job.city || 'Principal')}, ${escapeHTML(job.state || 'BR')}`;

      const shareMsg = `🚨 *Vaga de Emprego / Estágio Aberta*\n💼 *${job.title}*\n🏢 *Empresa:* ${job.company}\n📍 *Local:* ${locationText}\n💰 *Salário:* ${salaryText}\n\n👉 Inscrição 100% gratuita no Mural de Vagas:\nhttps://vocepodetudo.com/vagas`;
      const shareWaUrl = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(shareMsg);

      const isRemote = job.modality === 'remoto';
      const modalityClass = isRemote 
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
        : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';

      const typeClass = job.type === 'jovem_aprendiz'
        ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
        : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';

      jobCardsHtml.push(`
        <article class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-[#002776]/30 dark:hover:border-blue-500/30 transition-all flex flex-col justify-between group">
          <div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${typeClass}">
                ${escapeHTML(typeLabel)}
              </span>
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${modalityClass}">
                <i data-lucide="${isRemote ? 'wifi' : 'map-pin'}" class="w-3 h-3"></i>
                ${escapeHTML(modalityLabel)}
              </span>
            </div>

            <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-[#002776] dark:group-hover:text-blue-400 transition-colors">
              ${escapeHTML(job.title)}
            </h3>
            
            <p class="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-1.5">
              <i data-lucide="building-2" class="w-4 h-4 text-slate-400"></i>
              ${escapeHTML(job.company)}
            </p>

            <div class="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mb-4">
              <div class="flex items-center gap-2">
                <i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400 shrink-0"></i>
                <span>${escapeHTML(locationText)}</span>
              </div>
              <div class="flex items-center gap-2">
                <i data-lucide="banknote" class="w-3.5 h-3.5 text-emerald-500 shrink-0"></i>
                <span class="font-bold text-slate-700 dark:text-slate-200">${salaryText}</span>
              </div>
            </div>

            <p class="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 leading-relaxed font-normal">
              ${escapeHTML(job.description || 'Confira todos os requisitos, benefícios e detalhes do processo seletivo na página oficial da vaga.')}
            </p>
          </div>

          <div class="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-2">
            <a 
              href="${escapeHTML(job.url || '#')}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="flex-1 py-2.5 px-4 rounded-xl bg-[#002776] hover:bg-[#001c54] text-white text-xs font-black transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-1.5 text-center"
            >
              <span>Candidatar-se</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>

            <a 
              href="${shareWaUrl}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-xs cursor-pointer flex items-center justify-center shrink-0"
              title="Compartilhar vaga no WhatsApp"
            >
              <svg class="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24" aria-hidden="true"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            </a>
          </div>
        </article>
      `);

      // Injetar anúncio a cada 6 vagas
      if ((idx + 1) % 6 === 0 && (idx + 1) < filteredJobs.length) {
        jobCardsHtml.push(createJobInFeedAdHtml((idx + 1) / 6));
      }
    });

    grid.innerHTML = jobCardsHtml.join('');

    // Renderizar ícones do Lucide no grid
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: grid });
    }

    // Injetar dados estruturados Schema.org JobPosting para Google for Jobs
    updateGoogleJobsSchema(filteredJobs);

    try {
      if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        const ads = grid.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status])');
        ads.forEach(ad => {
          ad.setAttribute('data-adsbygoogle-status', 'pending');
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        });
      }
    } catch (e) {
      // Bloqueador de anúncio ativo
    }
    return;
    const _ignoredOldLoop = filteredJobs.map(job => {
      const typeLabel = JOB_TYPE_LABELS[job.type] || 'Oportunidade';
      const modalityLabel = JOB_MODALITY_LABELS[job.modality] || 'Remoto';
      const salaryText = job.salary ? escapeHTML(job.salary) : 'Bolsa / Salário a combinar';
      const locationText = job.modality === 'remoto' 
        ? 'Todo o Brasil (100% Remoto)' 
        : `${escapeHTML(job.city || 'Principal')}, ${escapeHTML(job.state || 'BR')}`;

      const shareMsg = `🚨 *Vaga de Emprego / Estágio Aberta*\n💼 *${job.title}*\n🏢 *Empresa:* ${job.company}\n📍 *Local:* ${locationText}\n💰 *Salário:* ${salaryText}\n\n👉 Inscrição 100% gratuita no portal Você Pode Tudo:\nhttps://vocepodetudo.com/vagas`;
      const waShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMsg)}`;

      const typeBadgeClass = job.type === 'estagio' 
        ? 'bg-emerald-100 text-emerald-800' 
        : job.type === 'jovem_aprendiz' 
        ? 'bg-blue-100 text-blue-800' 
        : job.type === 'trainee'
        ? 'bg-purple-100 text-purple-800'
        : 'bg-amber-100 text-amber-900';

      const modalityBadgeClass = job.modality === 'remoto'
        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
        : job.modality === 'hibrido'
        ? 'bg-blue-50 text-blue-800 border-blue-300'
        : 'bg-slate-100 text-slate-800 border-slate-300';

      return `
        <article class="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all flex flex-col justify-between group">
          <div class="space-y-3.5">
            <div class="flex items-start justify-between gap-3">
              <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-50 to-slate-100 border border-slate-200 flex items-center justify-center font-black text-sm text-[#002776] shadow-2xs flex-shrink-0 group-hover:scale-105 transition-transform">
                ${escapeHTML(job.company ? job.company.substring(0, 2).toUpperCase() : 'VP')}
              </div>
              <div class="flex items-center gap-1.5 flex-wrap justify-end">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${typeBadgeClass}">
                  ${typeLabel}
                </span>
                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold border ${modalityBadgeClass}">
                  ${modalityLabel}
                </span>
              </div>
            </div>

            <div>
              <h3 class="text-base font-black text-slate-900 group-hover:text-[#002776] transition-colors leading-snug line-clamp-2">
                ${escapeHTML(job.title)}
              </h3>
              <div class="flex items-center gap-1 text-xs font-bold text-slate-600 mt-1">
                <span>${escapeHTML(job.company)}</span>
                <span class="text-slate-300">•</span>
                <span class="text-slate-500 font-medium">${locationText}</span>
              </div>
            </div>

            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2">
              <span class="text-[11px] font-black text-amber-800">${salaryText}</span>
              <span class="text-[10px] font-bold text-slate-400">${escapeHTML(job.source_name || 'Oficial')}</span>
            </div>

            <p class="text-xs text-slate-600 line-clamp-3 leading-relaxed">
              ${escapeHTML(job.description)}
            </p>
          </div>

          <div class="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-1.5 sm:gap-2">
            <button 
              type="button" 
              class="view-job-details-btn flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer text-center"
              data-job-id="${job.id}"
            >
              Ver Detalhes
            </button>
            <a 
              href="${waShareUrl}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="p-2.5 rounded-xl bg-emerald-50 hover:bg-[#25D366] text-[#00702a] hover:text-white border border-emerald-200/80 transition-all shadow-2xs flex items-center justify-center cursor-pointer flex-shrink-0 active:scale-95"
              title="Compartilhar esta vaga no WhatsApp"
              aria-label="Compartilhar vaga no WhatsApp"
            >
              <svg class="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            </a>
            <a 
              href="${escapeHTML(job.apply_url || '#')}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="apply-job-link px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-black text-white bg-[#002776] hover:bg-blue-900 transition-all shadow-2xs flex items-center gap-1 cursor-pointer flex-shrink-0 active:scale-95"
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
    const rawTokens = currentJobSearchFilter ? normalizeText(currentJobSearchFilter).split(/\s+/).filter(Boolean) : [];

    filteredJobs = jobsData.filter(job => {
      if (currentJobTypeFilter !== 'all' && job.type !== currentJobTypeFilter) return false;
      if (currentJobModalityFilter !== 'all' && job.modality !== currentJobModalityFilter) return false;

      if (rawTokens.length > 0) {
        const typeLabel = JOB_TYPE_LABELS[job.type] || '';
        const modalityLabel = JOB_MODALITY_LABELS[job.modality] || '';
        const extraSynonyms = job.modality === 'remoto' ? 'home office teletrabalho ead virtual' : '';
        const typeSynonyms = job.type === 'estagio' 
          ? 'estagio estagiario programa de estagio' 
          : job.type === 'jovem_aprendiz' 
          ? 'aprendiz menor aprendiz primeiro emprego' 
          : job.type === 'junior'
          ? 'junior clt efetivo'
          : '';

        const hay = normalizeText(
          `${job.title || ''} ${job.company || ''} ${job.description || ''} ${job.requirements || ''} ${job.city || ''} ${job.state || ''} ${job.area || ''} ${job.salary || ''} ${job.type || ''} ${typeLabel} ${typeSynonyms} ${job.modality || ''} ${modalityLabel} ${extraSynonyms}`
        );

        const matchesAll = rawTokens.every(tok => hay.includes(tok));
        if (!matchesAll) return false;
      }
      return true;
    });
    renderJobsGrid();
  }

  function openJobModal(job) {
    const modal = document.getElementById('job-details-modal');
    if (!modal) return;

    const titleEl = document.getElementById('job-modal-title');
    const compEl = document.getElementById('job-modal-company');
    const typeEl = document.getElementById('job-modal-type-badge');
    const modEl = document.getElementById('job-modal-modality-badge');
    const salEl = document.getElementById('job-modal-salary');
    const locEl = document.getElementById('job-modal-location');
    const descEl = document.getElementById('job-modal-description');
    const reqEl = document.getElementById('job-modal-requirements');
    const benBox = document.getElementById('job-modal-benefits-box');
    const benEl = document.getElementById('job-modal-benefits');
    const applyBtn = document.getElementById('job-modal-apply-btn');

    if (titleEl) titleEl.textContent = job.title;
    if (compEl) compEl.textContent = job.company;
    if (typeEl) {
      typeEl.textContent = JOB_TYPE_LABELS[job.type] || 'Estágio';
      typeEl.className = `px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
        job.type === 'estagio' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
      }`;
    }
    if (modEl) {
      modEl.textContent = JOB_MODALITY_LABELS[job.modality] || 'Remoto';
      modEl.className = `px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
        job.modality === 'remoto' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
      }`;
    }
    if (salEl) salEl.textContent = job.salary || 'A Combinar';
    if (locEl) locEl.textContent = job.modality === 'remoto' ? 'Todo o Brasil (100% Remoto)' : `${job.city || 'Principal'}, ${job.state || 'BR'}`;
    if (descEl) descEl.textContent = job.description;
    if (reqEl) reqEl.textContent = job.requirements || 'Nenhum requisito específico informado.';

    if (benBox && benEl) {
      if (job.benefits && job.benefits.trim()) {
        benEl.textContent = job.benefits;
        benBox.classList.remove('hidden');
      } else {
        benBox.classList.add('hidden');
      }
    }

    if (applyBtn) {
      applyBtn.href = job.apply_url || '#';
      applyBtn.onclick = () => trackJobClick(job.id);
    }

    const modalShareWaBtn = document.getElementById('job-modal-share-wa-btn');
    if (modalShareWaBtn) {
      const locText = job.modality === 'remoto' ? 'Todo o Brasil (100% Remoto)' : `${job.city || 'Principal'}, ${job.state || 'BR'}`;
      const salText = job.salary || 'A Combinar';
      const modalShareMsg = `🚨 *Vaga de Emprego / Estágio Aberta*\n💼 *${job.title}*\n🏢 *Empresa:* ${job.company}\n📍 *Local:* ${locText}\n💰 *Salário:* ${salText}\n\n👉 Inscrição 100% gratuita no portal Você Pode Tudo:\nhttps://vocepodetudo.com/vagas`;
      modalShareWaBtn.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(modalShareMsg)}`;
    }

    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  async function trackJobClick(jobId) {
    if (!jobId) return;
    try {
      fetch('api/jobs.php?action=click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(jobId) })
      }).catch(() => {});
    } catch (e) {}
  }

  async function init() {
    initDarkMode();
    initMobileDrawer();

    const grid = document.getElementById('jobs-grid');
    if (!grid) return;

    // Fechar modal
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

    // Busca textual & Botão Limpar
    const searchInput = document.getElementById('jobs-search-input');
    const searchClearBtn = document.getElementById('jobs-search-clear-btn');

    function updateSearchClearBtn() {
      if (!searchClearBtn) return;
      if (searchInput && searchInput.value.trim().length > 0) {
        searchClearBtn.classList.remove('hidden');
      } else {
        searchClearBtn.classList.add('hidden');
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        currentJobSearchFilter = searchInput.value.trim();
        updateSearchClearBtn();
        applyJobsFilters();
      });
    }

    if (searchClearBtn && searchInput) {
      searchClearBtn.addEventListener('click', () => {
        searchInput.value = '';
        currentJobSearchFilter = '';
        updateSearchClearBtn();
        applyJobsFilters();
        searchInput.focus();
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
          p.classList.add('bg-white', 'text-slate-700');
        });
        pill.classList.add('bg-[#002776]', 'text-white', 'shadow-2xs');
        pill.classList.remove('bg-white', 'text-slate-700');

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
        if (searchClearBtn) searchClearBtn.classList.add('hidden');
        if (modSelect) modSelect.value = 'all';
        document.querySelectorAll('.job-type-pill').forEach(p => {
          if (p.dataset.type === 'all') {
            p.classList.add('bg-[#002776]', 'text-white', 'shadow-2xs');
            p.classList.remove('bg-white', 'text-slate-700');
          } else {
            p.classList.remove('bg-[#002776]', 'text-white', 'shadow-2xs');
            p.classList.add('bg-white', 'text-slate-700');
          }
        });
        applyJobsFilters();
      });
    }

    // Ler parâmetros da URL (?q=..., ?tipo=..., ?modalidade=...)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const qParam = urlParams.get('q') || urlParams.get('search') || urlParams.get('busca');
      const typeParam = urlParams.get('tipo') || urlParams.get('type');
      const modParam = urlParams.get('modalidade') || urlParams.get('modality');

      if (qParam && searchInput) {
        currentJobSearchFilter = qParam.trim();
        searchInput.value = qParam.trim();
        updateSearchClearBtn();
      }

      if (typeParam && ['estagio', 'jovem_aprendiz', 'junior', 'trainee', 'outro'].includes(typeParam)) {
        currentJobTypeFilter = typeParam;
        document.querySelectorAll('.job-type-pill').forEach(pill => {
          if (pill.dataset.type === typeParam) {
            pill.classList.add('bg-[#002776]', 'text-white', 'shadow-2xs');
            pill.classList.remove('bg-white', 'text-slate-700');
          } else {
            pill.classList.remove('bg-[#002776]', 'text-white', 'shadow-2xs');
            pill.classList.add('bg-white', 'text-slate-700');
          }
        });
      }

      if (modParam && ['remoto', 'hibrido', 'presencial'].includes(modParam)) {
        currentJobModalityFilter = modParam;
        if (modSelect) modSelect.value = modParam;
      }
    } catch (e) {}

    // Carregar vagas da API
    try {
      const res = await fetch('api/jobs.php?action=list&limit=100');
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
      console.warn('Erro ao carregar vagas da API:', e);
    }

    // Fallback de contingência
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

    function setupVagasNewsletter() {
    const form = document.getElementById('vagas-newsletter-form');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('vagas-newsletter-email');
      const submitBtn = document.getElementById('vagas-newsletter-submit-btn');
      const feedback = document.getElementById('vagas-newsletter-feedback');
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
          body: JSON.stringify({ email: email, source: 'vagas' })
        });
        const data = await res.json();
        if (feedback) {
          feedback.classList.remove('hidden');
          if (res.ok && data.success) {
            feedback.className = 'mt-3 text-xs font-bold p-2.5 rounded-xl bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 animate-fade-in';
            feedback.textContent = data.message || 'Inscrição realizada com sucesso! Fique atento às novas vagas.';
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
          submitBtn.innerHTML = '<i data-lucide="send" class="w-4 h-4 text-slate-950"></i><span>Receber Vagas por E-mail</span>';
          if (window.lucide) window.lucide.createIcons();
        }
      }
    });
  }

  function setupScrollToTop() {
    const btn = document.getElementById('btn-scroll-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 350) {
        btn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-3');
        btn.classList.add('opacity-100', 'translate-y-0');
      } else {
        btn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-3');
        btn.classList.remove('opacity-100', 'translate-y-0');
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      setupVagasNewsletter();
      setupScrollToTop();
    });
  } else {
    init();
    setupVagasNewsletter();
    setupScrollToTop();
  }
})();
