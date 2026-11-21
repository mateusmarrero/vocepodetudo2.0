const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'src', 'app.js');
let content = fs.readFileSync(appPath, 'utf8');

const startMarker = '<!-- Seção 4: Botão de Ação Destacado e Botão Recolher -->';
const endMarker = '          </div>\r\n        </div>\r\n      </article>';
const altEndMarker = '          </div>\n        </div>\n      </article>';

let startIdx = content.indexOf(startMarker);
let endIdx = content.indexOf(endMarker);
if (endIdx === -1) endIdx = content.indexOf(altEndMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Marcadores não encontrados em src/app.js');
  process.exit(1);
}

const compactActions = `<!-- Ações Compactas de Rodapé -->
            <div class="course-expanded-actions flex items-center justify-between gap-2 pt-2 border-t border-slate-200 mt-2">
              <a 
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
              </a>

              <button 
                type="button" 
                class="collapse-course-details-btn inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 transition-colors flex-shrink-0 cursor-pointer"
                data-course-id="\${escapeHTML(course.id)}"
                aria-label="Recolher detalhes do curso \${safeTitle}"
              >
                <i data-lucide="chevron-up" class="w-3 h-3 pointer-events-none"></i>
                <span class="pointer-events-none">Recolher</span>
              </button>
            </div>
`;

content = content.substring(0, startIdx) + compactActions + content.substring(endIdx);
fs.writeFileSync(appPath, content, 'utf8');
console.log('src/app.js atualizado com ações compactas com sucesso!');
