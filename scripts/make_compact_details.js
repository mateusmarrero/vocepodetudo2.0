const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'course_details.js');
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = '  function getCourseExpandedDetailsHtml(course) {';
const endMarker = '  function escapeHtml(str) {';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Marcadores não encontrados em course_details.js');
  process.exit(1);
}

const compactFn = `  function getCourseExpandedDetailsHtml(course) {
    const details = getCourseExpandedDetails(course);
    if (!details) return '';

    // Módulos resumidos e diretos (máximo 4 tópicos em lista enxuta)
    const modulesCompactHtml = (details.syllabus || []).slice(0, 4).map(m => \`
      <li class="flex items-center gap-1.5 py-0.5 text-[11px] text-slate-700 leading-tight">
        <span class="w-3.5 h-3.5 rounded-full bg-emerald-100 text-[#00702a] text-[9px] font-black flex items-center justify-center flex-shrink-0">
          \${m.number}
        </span>
        <span class="truncate font-medium">\${escapeHtml(m.title)}</span>
      </li>
    \`).join('');

    // Tags ATS compactas (máximo 3)
    const atsTagsCompact = (details.resumeTips?.atsKeywords || []).slice(0, 3).map(kw => \`
      <span class="inline-block px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-medium">
        #\${escapeHtml(kw)}
      </span>
    \`).join('');

    return \`
      <div class="course-expanded-content text-left space-y-2 pt-2 border-t border-slate-200 text-slate-800">
        
        <!-- Bloco 1: Ementa Rápida -->
        <div class="p-2 rounded-xl bg-slate-50 border border-slate-200/90">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[11px] font-bold text-slate-900 flex items-center gap-1">
              <span>📖</span> Conteúdo (\${details.totalModules} Módulos)
            </span>
            <span class="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              \${details.workloadHours}h oficiais
            </span>
          </div>
          <ul class="space-y-0.5">
            \${modulesCompactHtml}
          </ul>
        </div>

        <!-- Bloco 2: 4 Pílulas de Informações Importantes em Grid 2x2 -->
        <div class="grid grid-cols-2 gap-1.5 text-xs">
          <!-- Certificado -->
          <div class="p-1.5 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-center gap-1.5">
            <i data-lucide="file-badge" class="w-3.5 h-3.5 text-emerald-600 flex-shrink-0"></i>
            <div class="min-w-0">
              <span class="block text-[9.5px] font-bold text-emerald-900 uppercase tracking-wide leading-none">Certificado</span>
              <span class="text-[10.5px] font-semibold text-slate-700 truncate block">100% Grátis (PDF)</span>
            </div>
          </div>

          <!-- Avaliação -->
          <div class="p-1.5 rounded-lg bg-amber-50/70 border border-amber-200 flex items-center gap-1.5">
            <i data-lucide="clipboard-check" class="w-3.5 h-3.5 text-amber-600 flex-shrink-0"></i>
            <div class="min-w-0">
              <span class="block text-[9.5px] font-bold text-amber-900 uppercase tracking-wide leading-none">Avaliação</span>
              <span class="text-[10.5px] font-semibold text-slate-700 truncate block">Nota mín. \${escapeHtml(details.methodology?.passingScore || '60%')}</span>
            </div>
          </div>

          <!-- Formato / Pré-requisitos -->
          <div class="p-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-1.5">
            <i data-lucide="users" class="w-3.5 h-3.5 text-[#002776] flex-shrink-0"></i>
            <div class="min-w-0">
              <span class="block text-[9.5px] font-bold text-slate-600 uppercase tracking-wide leading-none">Pré-requisito</span>
              <span class="text-[10.5px] font-semibold text-slate-700 truncate block">\${escapeHtml(details.prerequisites?.recommendedEducation || 'Livre')}</span>
            </div>
          </div>

          <!-- Metodologia / Formato -->
          <div class="p-1.5 rounded-lg bg-blue-50/70 border border-blue-200 flex items-center gap-1.5">
            <i data-lucide="award" class="w-3.5 h-3.5 text-blue-600 flex-shrink-0"></i>
            <div class="min-w-0">
              <span class="block text-[9.5px] font-bold text-blue-900 uppercase tracking-wide leading-none">Metodologia</span>
              <span class="text-[10.5px] font-semibold text-slate-700 truncate block">100% Online</span>
            </div>
          </div>
        </div>

        <!-- Bloco 3: Destaque no Currículo (Linha Única) -->
        <div class="flex items-center gap-1 overflow-hidden text-[10px] text-slate-500 pt-0.5">
          <span class="font-bold text-slate-600 flex-shrink-0">No Currículo:</span>
          <div class="flex items-center gap-1 truncate">
            \${atsTagsCompact}
          </div>
        </div>

      </div>
    \`;
  }

`;

content = content.substring(0, startIdx) + compactFn + content.substring(endIdx);
fs.writeFileSync(filePath, content, 'utf8');
console.log('course_details.js atualizado com formato super compacto com sucesso!');
