const fs = require('fs');
const path = require('path');

const appPath = path.resolve(__dirname, '../src/app.js');
let code = fs.readFileSync(appPath, 'utf8');

const norm = s => s.replace(/\r\n/g, '\n');
let normCode = norm(code);

// 1. Substituição do botão de ação principal do card
const searchStr1 = `            <a 
              href="\${safeUrl}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="course-access-link flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#009639] via-[#008031] to-[#005e24] hover:from-[#008031] hover:to-[#00471b] text-white shadow-md shadow-emerald-700/20 active:scale-95 transition-all truncate group/btn"
              data-course-id="\${course.id}"
              data-course-title="\${safeTitle}"
              data-course-provider="\${safeProvider}"
              data-course-category="\${escapeHTML(course.category || 'Geral')}"
              aria-label="Acessar página oficial do curso \${safeTitle} (abre em nova aba)"
            >
              <span>Acessar Curso</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5 flex-shrink-0 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"></i>
            </a>

            <!-- Link direto para a página exclusiva de SEO do Curso -->
            <a 
              href="\${coursePageUrl}"
              class="p-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-emerald-700 transition-colors flex-shrink-0"
              title="Página detalhada do curso com ementa e certificado"
              aria-label="Página do curso \${safeTitle}"
            >
              <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
            </a>`;

const replaceStr1 = `            <!-- Link Principal para a Página Exclusiva do Curso -->
            <a 
              href="\${coursePageUrl}"
              class="course-page-link flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-[#009639] via-[#008031] to-[#005e24] hover:from-[#008031] hover:to-[#00471b] text-white shadow-md shadow-emerald-700/20 active:scale-95 transition-all truncate group/btn"
              data-course-id="\${course.id}"
              data-course-title="\${safeTitle}"
              data-course-provider="\${safeProvider}"
              data-course-category="\${escapeHTML(course.category || 'Geral')}"
              aria-label="Ver informações completas e acessar curso \${safeTitle}"
            >
              <span>Ver Curso Completo</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5 flex-shrink-0 group-hover/btn:translate-x-1 transition-transform"></i>
            </a>`;

const normSearch1 = norm(searchStr1);
const normReplace1 = norm(replaceStr1);

if (normCode.includes(normSearch1)) {
  normCode = normCode.replace(normSearch1, normReplace1);
  console.log('✅ Botão principal do card atualizado com sucesso.');
} else {
  console.warn('⚠️ Bloco 1 não encontrado.');
}

// 2. Substituição do botão de ação no bloco expandido
const searchStr2 = `              <a 
                href="\${safeUrl}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="course-access-link flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-[#009639] hover:bg-[#007a2e] text-white transition-colors truncate group/cta"
                data-course-id="\${course.id}"
                data-course-title="\${safeTitle}"
                data-course-provider="\${safeProvider}"
                data-course-category="\${escapeHTML(course.category || 'Geral')}"
                aria-label="Fazer inscrição gratuita no \${safeProvider} para \${safeTitle} (abre em nova aba)"
              >
                <span>Inscrição Oficial</span>
                <i data-lucide="external-link" class="w-3 h-3 group-hover/cta:translate-x-0.5 transition-transform"></i>
              </a>`;

const replaceStr2 = `              <a 
                href="\${coursePageUrl}" 
                class="course-page-link flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-[#009639] hover:bg-[#007a2e] text-white transition-colors truncate group/cta"
                data-course-id="\${course.id}"
                data-course-title="\${safeTitle}"
                data-course-provider="\${safeProvider}"
                data-course-category="\${escapeHTML(course.category || 'Geral')}"
                aria-label="Ver página oficial com ementa e acesso ao curso \${safeTitle}"
              >
                <span>Acessar Página do Curso</span>
                <i data-lucide="arrow-right" class="w-3 h-3 group-hover/cta:translate-x-0.5 transition-transform"></i>
              </a>`;

const normSearch2 = norm(searchStr2);
const normReplace2 = norm(replaceStr2);

if (normCode.includes(normSearch2)) {
  normCode = normCode.replace(normSearch2, normReplace2);
  console.log('✅ Link dentro do bloco expandido atualizado com sucesso.');
} else {
  console.warn('⚠️ Bloco 2 não encontrado.');
}

fs.writeFileSync(appPath, normCode, 'utf8');
console.log('src/app.js gravado com sucesso.');
