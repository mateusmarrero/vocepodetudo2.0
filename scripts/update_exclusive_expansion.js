const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'src', 'app.js');
let appContent = fs.readFileSync(appPath, 'utf8');

const startMarker = '  // Alternador de expansão/recolhimento de card com acessibilidade e carregamento dinâmico\r\n  function toggleCourseCardExpansion(card, courseId, forceState) {';
const altStartMarker = '  // Alternador de expansão/recolhimento de card com acessibilidade e carregamento dinâmico\n  function toggleCourseCardExpansion(card, courseId, forceState) {';
const endMarker = '  // Gerador de HTML de Card de Curso com Tamanho Otimizado';

let startIdx = appContent.indexOf(startMarker);
if (startIdx === -1) startIdx = appContent.indexOf(altStartMarker);
const endIdx = appContent.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Marcadores não encontrados em src/app.js', { startIdx, endIdx });
  process.exit(1);
}

const newFunction = `  // Alternador de expansão/recolhimento de card com acessibilidade e carregamento dinâmico
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

`;

appContent = appContent.substring(0, startIdx) + newFunction + appContent.substring(endIdx);
fs.writeFileSync(appPath, appContent, 'utf8');
console.log('src/app.js atualizado com expansão exclusiva!');

// Atualizar index.html com items-start nos grids de cursos
const indexPath = path.join(__dirname, '..', 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

indexContent = indexContent.replace(
  'class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 focus:outline-none"',
  'class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 focus:outline-none items-start"'
);

indexContent = indexContent.replace(
  'class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"',
  'class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start"'
);

fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('index.html atualizado com items-start!');
