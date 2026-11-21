const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

// ========================================================
// 1. Atualizar src/vagas.js
// ========================================================
const vagasJsPath = path.join(ROOT_DIR, 'src', 'vagas.js');
let vagasJs = fs.readFileSync(vagasJsPath, 'utf8');

// SVG do WhatsApp (compacto)
const WA_SVG = `<svg class="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>`;

// Substituir o bloco de geração do card para incluir waShareUrl e o botão
const oldCardButtons = `          <div class="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2">
            <button 
              type="button" 
              class="view-job-details-btn flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer text-center"
              data-job-id="\${job.id}"
            >
              Ver Detalhes
            </button>
            <a 
              href="\${escapeHTML(job.apply_url || '#')}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="apply-job-link px-4 py-2.5 rounded-xl text-xs font-black text-white bg-[#002776] hover:bg-blue-900 transition-all shadow-2xs flex items-center gap-1 cursor-pointer flex-shrink-0"
              data-job-id="\${job.id}"
              title="Candidatar-se na página oficial"
            >
              <span>Candidatar</span>
              <i data-lucide="external-link" class="w-3 h-3 text-[#ffdf00]"></i>
            </a>
          </div>`;

const newCardButtons = `          <div class="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-1.5 sm:gap-2">
            <button 
              type="button" 
              class="view-job-details-btn flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer text-center"
              data-job-id="\${job.id}"
            >
              Ver Detalhes
            </button>
            <a 
              href="\${waShareUrl}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="p-2.5 rounded-xl bg-emerald-50 hover:bg-[#25D366] text-[#00702a] hover:text-white border border-emerald-200/80 transition-all shadow-2xs flex items-center justify-center cursor-pointer flex-shrink-0 active:scale-95"
              title="Compartilhar esta vaga no WhatsApp"
              aria-label="Compartilhar vaga no WhatsApp"
            >
              ${WA_SVG}
            </a>
            <a 
              href="\${escapeHTML(job.apply_url || '#')}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="apply-job-link px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-black text-white bg-[#002776] hover:bg-blue-900 transition-all shadow-2xs flex items-center gap-1 cursor-pointer flex-shrink-0 active:scale-95"
              data-job-id="\${job.id}"
              title="Candidatar-se na página oficial"
            >
              <span>Candidatar</span>
              <i data-lucide="external-link" class="w-3 h-3 text-[#ffdf00]"></i>
            </a>
          </div>`;

// Definir waShareUrl antes do return
const locationDefinition = `      const locationText = job.modality === 'remoto' 
        ? 'Todo o Brasil (100% Remoto)' 
        : \`\${escapeHTML(job.city || 'Principal')}, \${escapeHTML(job.state || 'BR')}\`;`;

const newLocationDefinition = `      const locationText = job.modality === 'remoto' 
        ? 'Todo o Brasil (100% Remoto)' 
        : \`\${escapeHTML(job.city || 'Principal')}, \${escapeHTML(job.state || 'BR')}\`;

      const shareMsg = \`🚨 *Vaga de Emprego / Estágio Aberta*\\n💼 *\${job.title}*\\n🏢 *Empresa:* \${job.company}\\n📍 *Local:* \${locationText}\\n💰 *Salário:* \${salaryText}\\n\\n👉 Inscrição 100% gratuita no portal Você Pode Tudo:\\nhttps://www.vocepodetudo.com/vagas.html\`;
      const waShareUrl = \`https://api.whatsapp.com/send?text=\${encodeURIComponent(shareMsg)}\`;`;

if (vagasJs.includes(locationDefinition) && !vagasJs.includes('const waShareUrl =')) {
  vagasJs = vagasJs.replace(locationDefinition, newLocationDefinition);
  console.log('✅ Definição de waShareUrl adicionada em src/vagas.js');
}

if (vagasJs.includes(oldCardButtons)) {
  vagasJs = vagasJs.replace(oldCardButtons, newCardButtons);
  console.log('✅ Botão Compartilhar WhatsApp adicionado nos cards de vagas em src/vagas.js');
}

// Configurar botão de WhatsApp no openJobModal
const modalApplySetup = `    if (applyBtn) {
      applyBtn.href = job.apply_url || '#';
      applyBtn.onclick = () => trackJobClick(job.id);
    }`;

const newModalApplySetup = `    if (applyBtn) {
      applyBtn.href = job.apply_url || '#';
      applyBtn.onclick = () => trackJobClick(job.id);
    }

    const modalShareWaBtn = document.getElementById('job-modal-share-wa-btn');
    if (modalShareWaBtn) {
      const locText = job.modality === 'remoto' ? 'Todo o Brasil (100% Remoto)' : \`\${job.city || 'Principal'}, \${job.state || 'BR'}\`;
      const salText = job.salary || 'A Combinar';
      const modalShareMsg = \`🚨 *Vaga de Emprego / Estágio Aberta*\\n💼 *\${job.title}*\\n🏢 *Empresa:* \${job.company}\\n📍 *Local:* \${locText}\\n💰 *Salário:* \${salText}\\n\\n👉 Inscrição 100% gratuita no portal Você Pode Tudo:\\nhttps://www.vocepodetudo.com/vagas.html\`;
      modalShareWaBtn.href = \`https://api.whatsapp.com/send?text=\${encodeURIComponent(modalShareMsg)}\`;
    }`;

if (vagasJs.includes(modalApplySetup) && !vagasJs.includes('modalShareWaBtn')) {
  vagasJs = vagasJs.replace(modalApplySetup, newModalApplySetup);
  console.log('✅ Botão Compartilhar do Modal configurado em src/vagas.js');
}

fs.writeFileSync(vagasJsPath, vagasJs, 'utf8');

// ========================================================
// 2. Atualizar vagas.html
// ========================================================
const vagasHtmlPath = path.join(ROOT_DIR, 'vagas.html');
let vagasHtml = fs.readFileSync(vagasHtmlPath, 'utf8');

// Atualizar og:image e twitter:image
vagasHtml = vagasHtml.replace('https://vocepodetudo.com/assets/logo-icon.png', 'https://www.vocepodetudo.com/assets/logo.png');
vagasHtml = vagasHtml.replace('https://vocepodetudo.com/assets/logo-icon.png', 'https://www.vocepodetudo.com/assets/logo.png');

// Inserir botão de WhatsApp no modal
const modalFooterTarget = `        <a 
          id="job-modal-apply-btn" 
          href="#" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="px-5 py-2.5 rounded-xl bg-[#002776] hover:bg-blue-900 text-white font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
        >`;

const newModalFooterContent = `        <div class="flex items-center gap-2">
          <a 
            id="job-modal-share-wa-btn" 
            href="#" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="px-3 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Compartilhar esta vaga no WhatsApp"
          >
            ${WA_SVG}
            <span class="hidden sm:inline">Compartilhar</span>
          </a>
          <a 
            id="job-modal-apply-btn" 
            href="#" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="px-4 sm:px-5 py-2.5 rounded-xl bg-[#002776] hover:bg-blue-900 text-white font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
          >`;

if (vagasHtml.includes(modalFooterTarget) && !vagasHtml.includes('id="job-modal-share-wa-btn"')) {
  // Encontrar o fechamento do modal apply btn
  const closeTag = `</a>\r\n      </div>\r\n    </div>\r\n  </div>`;
  const closeTagLF = `</a>\n      </div>\n    </div>\n  </div>`;

  if (vagasHtml.includes(modalFooterTarget)) {
    vagasHtml = vagasHtml.replace(modalFooterTarget, newModalFooterContent);
    // fechar a div adicional inserida
    if (vagasHtml.includes(closeTag)) {
      vagasHtml = vagasHtml.replace(closeTag, `</a>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>`);
    } else if (vagasHtml.includes(closeTagLF)) {
      vagasHtml = vagasHtml.replace(closeTagLF, `</a>\n        </div>\n      </div>\n    </div>\n  </div>`);
    }
    console.log('✅ Botão de Compartilhar WhatsApp inserido no rodapé do modal em vagas.html');
  }
}

fs.writeFileSync(vagasHtmlPath, vagasHtml, 'utf8');

// ========================================================
// 3. Atualizar downloads.html (og:image)
// ========================================================
const dlHtmlPath = path.join(ROOT_DIR, 'downloads.html');
if (fs.existsSync(dlHtmlPath)) {
  let dlHtml = fs.readFileSync(dlHtmlPath, 'utf8');
  dlHtml = dlHtml.replace('https://vocepodetudo.com/assets/logo-icon.png', 'https://www.vocepodetudo.com/assets/logo.png');
  fs.writeFileSync(dlHtmlPath, dlHtml, 'utf8');
  console.log('✅ og:image atualizado em downloads.html');
}

// ========================================================
// 4. Bump sw.js
// ========================================================
const swPath = path.join(ROOT_DIR, 'sw.js');
if (fs.existsSync(swPath)) {
  let sw = fs.readFileSync(swPath, 'utf8');
  sw = sw.replace(/const CACHE_NAME = 'vocepodetudo-pwa-v\d+\.\d+\.\d+';/, "const CACHE_NAME = 'vocepodetudo-pwa-v4.54.0';");
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log('✅ sw.js atualizado para v4.54.0');
}

console.log('🚀 Integração do Compartilhamento WhatsApp nas Vagas concluída com sucesso!');
