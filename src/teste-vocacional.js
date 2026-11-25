/**
 * src/teste-vocacional.js
 * Controlador da Página Dedicada de Teste Vocacional e Trilhas de Aprendizagem
 * Portal Você Pode Tudo
 */

(function () {
  'use strict';

  let currentStep = 0;
  let userAnswers = {};
  let quizResult = null;

  function init() {
    loadSavedResult();
    setupEventListeners();
  }

  function loadSavedResult() {
    try {
      const saved = localStorage.getItem('vpt_career_test_result');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.primary) {
          quizResult = parsed;
          renderResultView(parsed);
          return;
        }
      }
    } catch (e) {}

    // Se não tiver salvo, inicia na primeira pergunta
    renderQuestionStep();
  }

  function setupEventListeners() {
    const prevBtn = document.getElementById('tv-prev-btn');
    const nextBtn = document.getElementById('tv-next-btn');
    const restartBtn = document.getElementById('tv-restart-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
          currentStep--;
          renderQuestionStep();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const quiz = window.CAREER_QUIZ;
        if (!quiz) return;

        const q = quiz.questions[currentStep];
        if (!userAnswers[q.id] && !q.isOptional) {
          showToast('Por favor, selecione uma opção para continuar.', 'warning');
          return;
        }

        if (currentStep < quiz.questions.length - 1) {
          currentStep++;
          renderQuestionStep();
        } else {
          finishQuiz();
        }
      });
    }

    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        if (confirm('Deseja reiniciar o teste e responder novamente?')) {
          restartQuiz();
        }
      });
    }
  }

  function restartQuiz() {
    currentStep = 0;
    userAnswers = {};
    quizResult = null;
    try {
      localStorage.removeItem('vpt_career_test_result');
    } catch (e) {}

    const resultView = document.getElementById('tv-result-view');
    const questionView = document.getElementById('tv-question-view');

    if (resultView) resultView.classList.add('hidden');
    if (questionView) questionView.classList.remove('hidden');

    renderQuestionStep();
  }

  function renderQuestionStep() {
    const quiz = window.CAREER_QUIZ;
    if (!quiz || !quiz.questions) return;

    const questionView = document.getElementById('tv-question-view');
    const resultView = document.getElementById('tv-result-view');
    if (questionView) questionView.classList.remove('hidden');
    if (resultView) resultView.classList.add('hidden');

    const total = quiz.questions.length;
    const q = quiz.questions[currentStep];
    if (!q) return;

    // Indicadores
    const stepEl = document.getElementById('tv-step-counter');
    const catEl = document.getElementById('tv-category-badge');
    const barEl = document.getElementById('tv-progress-bar');
    const titleEl = document.getElementById('tv-question-title');
    const subtitleEl = document.getElementById('tv-question-subtitle');
    const optionsContainer = document.getElementById('tv-options-container');
    const prevBtn = document.getElementById('tv-prev-btn');
    const nextBtnText = document.getElementById('tv-next-btn-text');

    const percent = Math.round(((currentStep + 1) / total) * 100);

    if (stepEl) stepEl.textContent = `Pergunta ${currentStep + 1} de ${total}`;
    if (catEl) catEl.textContent = q.category || 'Vocacional';
    if (barEl) barEl.style.width = `${percent}%`;
    if (titleEl) titleEl.textContent = q.title;
    if (subtitleEl) subtitleEl.textContent = q.subtitle || '';

    if (prevBtn) {
      if (currentStep === 0) {
        prevBtn.classList.add('opacity-40', 'pointer-events-none');
      } else {
        prevBtn.classList.remove('opacity-40', 'pointer-events-none');
      }
    }

    if (nextBtnText) {
      nextBtnText.textContent = currentStep === total - 1 ? 'Concluir e Ver Meu Resultado 🎉' : 'Avançar';
    }

    // Renderizar Opções
    const selected = userAnswers[q.id];
    if (optionsContainer) {
      optionsContainer.innerHTML = q.options.map(opt => {
        const isSelected = selected === opt.id;
        const borderClass = isSelected
          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-md ring-2 ring-emerald-400'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs';

        const letterClass = isSelected
          ? 'bg-emerald-600 text-white font-black'
          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold';

        return `
          <button 
            type="button" 
            data-opt-id="${opt.id}" 
            class="tv-option-btn w-full p-4 sm:p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-4 ${borderClass}"
          >
            <span class="w-8 h-8 rounded-xl flex items-center justify-center text-xs flex-shrink-0 ${letterClass}">
              ${opt.letter || '•'}
            </span>
            <div class="flex-1">
              <span class="text-sm sm:text-base font-bold text-slate-900 dark:text-white block leading-snug">
                ${opt.text}
              </span>
            </div>
            ${isSelected ? '<i data-lucide="check-circle" class="w-5 h-5 text-emerald-600 flex-shrink-0"></i>' : ''}
          </button>
        `;
      }).join('');

      // Adicionar listeners nas opções
      const buttons = optionsContainer.querySelectorAll('.tv-option-btn');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const optId = btn.dataset.optId;
          userAnswers[q.id] = optId;
          renderQuestionStep();
        });
      });
    }

    if (window.lucide) window.lucide.createIcons();
    window.scrollTo({ top: 120, behavior: 'smooth' });
  }

  function finishQuiz() {
    const quiz = window.CAREER_QUIZ;
    if (!quiz) return;

    const allCourses = window.COURSES_DATA || window.localCourses || [];
    quizResult = quiz.calculateResults(userAnswers, allCourses);

    try {
      localStorage.setItem('vpt_career_test_result', JSON.stringify(quizResult));
    } catch (e) {}

    renderResultView(quizResult);
  }

  function renderResultView(res) {
    const questionView = document.getElementById('tv-question-view');
    const resultView = document.getElementById('tv-result-view');

    if (questionView) questionView.classList.add('hidden');
    if (resultView) resultView.classList.remove('hidden');

    const primary = res.primary;
    const secondary = res.secondary;

    // Header Destaque
    const primaryNameEl = document.getElementById('tv-res-primary-name');
    const primaryTaglineEl = document.getElementById('tv-res-primary-tagline');
    const primaryDescEl = document.getElementById('tv-res-primary-desc');
    const primaryMarketEl = document.getElementById('tv-res-primary-market');
    const primaryScoreEl = document.getElementById('tv-res-primary-score');
    const primaryBadgeEl = document.getElementById('tv-res-primary-badge');

    if (primaryNameEl) primaryNameEl.textContent = primary.title;
    if (primaryTaglineEl) primaryTaglineEl.textContent = primary.tagline;
    if (primaryDescEl) primaryDescEl.textContent = primary.description;
    if (primaryMarketEl) primaryMarketEl.textContent = primary.marketContext;
    if (primaryScoreEl) primaryScoreEl.textContent = `${primary.percentage}%`;
    if (primaryBadgeEl) primaryBadgeEl.textContent = primary.badge;

    // Área Secundária
    const secBox = document.getElementById('tv-res-secondary-box');
    if (secBox && secondary) {
      secBox.innerHTML = `
        <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
          <i data-lucide="plus-circle" class="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"></i>
          <div>
            <span class="text-xs font-black uppercase text-slate-500 tracking-wider">Perfil Complementar Secundário:</span>
            <h4 class="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
              ${secondary.title} (${secondary.percentage}% de afinidade)
            </h4>
            <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">
              ${secondary.description}
            </p>
          </div>
        </div>
      `;
    }

    // Gráfico de Afinidades
    const chartContainer = document.getElementById('tv-res-affinities-container');
    if (chartContainer && res.affinities) {
      chartContainer.innerHTML = res.affinities.map(aff => {
        return `
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span class="flex items-center gap-1.5">
                <i data-lucide="${aff.icon || 'star'}" class="w-3.5 h-3.5 text-[#002776] dark:text-blue-400"></i>
                <span>${aff.title}</span>
              </span>
              <span class="font-black">${aff.percentage}%</span>
            </div>
            <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <div 
                class="h-full rounded-full transition-all duration-1000 ${aff.areaKey === primary.areaKey ? 'bg-emerald-600' : 'bg-blue-600'}" 
                style="width: ${aff.percentage}%"
              ></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Trilha de Aprendizagem Passo a Passo
    const trackTitleEl = document.getElementById('tv-res-track-title');
    const trackStepsEl = document.getElementById('tv-res-track-steps');

    if (trackTitleEl) trackTitleEl.textContent = primary.trackTitle || 'Trilha de Aprendizagem Recomendada';

    if (trackStepsEl && res.stepCourses) {
      trackStepsEl.innerHTML = res.stepCourses.map(step => {
        const course = step.course;
        const link = course ? `/curso/${encodeURIComponent(course.id)}` : '/#catalog-view';
        const providerName = course ? course.provider : 'Portal Você Pode Tudo';

        return `
          <div class="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-emerald-500 transition-all shadow-xs">
            <div class="flex items-start gap-3">
              <span class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-sm flex items-center justify-center flex-shrink-0">
                ${step.step}
              </span>
              <div>
                <span class="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wider block">Passo Obrigatório</span>
                <h4 class="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                  ${step.label}
                </h4>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Instituição: <strong class="text-slate-700 dark:text-slate-300">${providerName}</strong> • Certificado Gratuito Incluso
                </p>
              </div>
            </div>

            <a 
              href="${link}" 
              class="px-4 py-2 rounded-xl bg-[#002776] hover:bg-emerald-600 text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 flex-shrink-0 shadow-2xs"
            >
              <span>Ver Curso Completo</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </a>
          </div>
        `;
      }).join('');
    }

    // Botão de Compartilhar no WhatsApp
    const shareBtn = document.getElementById('tv-res-share-whatsapp-btn');
    if (shareBtn) {
      shareBtn.onclick = () => {
        const text = `🎯 *Resultado do Meu Teste Vocacional — Você Pode Tudo*\n\n` +
          `🏆 Minha principal vocação é: *${primary.title}* (${primary.percentage}% de afinidade)!\n` +
          `📖 Minha Trilha Gratuita de Aprendizagem já está montada com cursos oficiais e certificados gratuitos.\n\n` +
          `Descubra a sua também no Você Pode Tudo:\n` +
          `https://vocepodetudo.com/teste-vocacional.html`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
      };
    }

    // Botão de Imprimir / PDF
    const printBtn = document.getElementById('tv-res-print-btn');
    if (printBtn) {
      printBtn.onclick = () => window.print();
    }

    if (window.lucide) window.lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl text-white text-xs font-bold shadow-xl flex items-center gap-2 animate-bounce ${
      type === 'warning' ? 'bg-amber-600' : 'bg-[#002776]'
    }`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
