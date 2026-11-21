const fs = require('fs');

console.log('--- Atualizando admin.html e src/admin.js com Propostas de Aluguel e Gerador Comercial ---');

// 1. Atualizar admin.html
let adminHtml = fs.readFileSync('admin.html', 'utf8');

// Adicionar botão no topo da barra de ações de admin.html
const targetTopActions = '<a \n              href="midia-kit" \n              target="_blank"\n              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-black shadow-xs transition-all cursor-pointer"\n              title="Abrir a página pública do Mídia Kit acessível a anunciantes"\n            >\n              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>\n              <span>Ver Página Pública (/midia-kit)</span>\n            </a>';

const repTopActions = targetTopActions + `\n            <button \n              type="button"\n              onclick="window.copyMediaKitPitch()"\n              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black shadow-xs transition-all cursor-pointer"\n              title="Copiar texto de apresentação rápida para WhatsApp"\n            >\n              <i data-lucide="copy" class="w-3.5 h-3.5"></i>\n              <span>Copiar Pitch Rápido</span>\n            </button>`;

if (adminHtml.includes(targetTopActions) && !adminHtml.includes('copyMediaKitPitch()')) {
  adminHtml = adminHtml.replace(targetTopActions, repTopActions);
  console.log('✅ Botão de Pitch adicionado na barra de ações de admin.html');
}

// Bloco do Gerador de Proposta e Tabela de Aluguel para admin.html
const adminAluguelHtml = `
        <!-- TABELA COMERCIAL DE ALUGUEL DE ESPAÇOS 2026 -->
        <div class="no-print bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div class="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-[#009639] text-white tracking-wider">
                TABELA OFICIAL DE INVESTIMENTO
              </span>
              <h3 class="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
                <i data-lucide="tag" class="w-5 h-5 text-[#009639]"></i>
                <span>Tabela de Aluguel de Espaço de Propaganda & Patrocínios</span>
              </h3>
              <p class="text-xs text-slate-500 font-medium">Valores de referência para comercialização direta com marcas, faculdades e agências de publicidade.</p>
            </div>
            <div class="text-xs text-slate-500 font-bold">
              Descontos: <span class="text-[#009639]">Trimestral -10% • Semestral -15% • Anual -25%</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div class="flex justify-between items-center">
                <span class="font-black text-[#002776]">Banner Leaderboard Topo</span>
                <span class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Disponível</span>
              </div>
              <p class="text-slate-600 text-[11px]">728x90 (Desktop) / 320x100 (Mobile) no topo de 100% das páginas do portal.</p>
              <div class="pt-2 border-t border-slate-200 font-black text-slate-900 text-sm">R$ 850,00 <span class="text-[10px] text-slate-400 font-normal">/ mês</span></div>
            </div>

            <div class="p-4 rounded-2xl bg-emerald-50/60 border-2 border-emerald-300 space-y-2">
              <div class="flex justify-between items-center">
                <span class="font-black text-[#009639]">Card Patrocinado Nativo</span>
                <span class="text-[10px] font-bold text-white bg-[#009639] px-2 py-0.5 rounded">CTR até 5,2%</span>
              </div>
              <p class="text-slate-600 text-[11px]">Inserido organicamente entre os 200 cursos oficiais e vagas com selo Patrocinado.</p>
              <div class="pt-2 border-t border-emerald-200 font-black text-[#009639] text-sm">R$ 650,00 <span class="text-[10px] text-slate-500 font-normal">/ mês</span></div>
            </div>

            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div class="flex justify-between items-center">
                <span class="font-black text-purple-700">Half-Page Lateral no Blog</span>
                <span class="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">Sticky</span>
              </div>
              <p class="text-slate-600 text-[11px]">300x600 px fixo nas laterais dos 80+ artigos do Blog Você Pode Tudo.</p>
              <div class="pt-2 border-t border-slate-200 font-black text-slate-900 text-sm">R$ 750,00 <span class="text-[10px] text-slate-400 font-normal">/ mês</span></div>
            </div>

            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div class="flex justify-between items-center">
                <span class="font-black text-amber-700">Naming Rights: Criador de CV</span>
                <span class="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Exclusivo</span>
              </div>
              <p class="text-slate-600 text-[11px]">Logotipo no assistente + selo institucional timbrado no rodapé do currículo em PDF.</p>
              <div class="pt-2 border-t border-slate-200 font-black text-amber-600 text-sm">R$ 1.500,00 <span class="text-[10px] text-slate-400 font-normal">/ mês</span></div>
            </div>

            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div class="flex justify-between items-center">
                <span class="font-black text-blue-700">Simulador de Entrevista IA</span>
                <span class="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Inovação</span>
              </div>
              <p class="text-slate-600 text-[11px]">Apresentação exclusiva da ferramenta de IA e dica patrocinada entre as rodadas.</p>
              <div class="pt-2 border-t border-slate-200 font-black text-slate-900 text-sm">R$ 1.200,00 <span class="text-[10px] text-slate-400 font-normal">/ mês</span></div>
            </div>

            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div class="flex justify-between items-center">
                <span class="font-black text-emerald-800">Publieditorial SEO Dofollow</span>
                <span class="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Vitalício</span>
              </div>
              <p class="text-slate-600 text-[11px]">Artigo assinado pela redação com link dofollow perpétuo indexado no Google.</p>
              <div class="pt-2 border-t border-slate-200 font-black text-[#009639] text-sm">R$ 1.250,00 <span class="text-[10px] text-slate-400 font-normal">único</span></div>
            </div>
          </div>
        </div>

        <!-- GERADOR DINÂMICO DE PROPOSTA COMERCIAL (INTERATIVO) -->
        <div id="gerador-proposta-card" class="no-print bg-white p-6 sm:p-8 rounded-3xl border-2 border-emerald-500/40 shadow-xl space-y-6">
          <div class="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-[#002776] text-white tracking-wider">
                FERRAMENTA DE FECHAMENTO
              </span>
              <h3 class="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
                <i data-lucide="file-signature" class="w-5 h-5 text-[#009639]"></i>
                <span>Gerador Rápido de Proposta Comercial</span>
              </h3>
              <p class="text-xs text-slate-500 font-medium">
                Monte e gere o texto da proposta personalizado em segundos para enviar pelo WhatsApp ou E-mail da marca parceira.
              </p>
            </div>
            <div>
              <span id="prop-total-calculated" class="text-xs sm:text-sm font-black text-[#009639] bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 inline-block font-mono">
                Investimento: R$ 0,00
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <!-- Coluna 1: Campos e Seleção -->
            <div class="space-y-4 text-xs font-medium">
              <div>
                <label for="prop-company-name" class="block font-bold text-slate-700 mb-1">Nome da Empresa / Marca Parceira:</label>
                <input 
                  type="text" 
                  id="prop-company-name" 
                  oninput="window.updateProposalPreview()" 
                  placeholder="Ex: Faculdade Estácio, CIEE, Alura, Santander..." 
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#002776] transition-colors"
                >
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="prop-contact-name" class="block font-bold text-slate-700 mb-1">Nome do Contato:</label>
                  <input 
                    type="text" 
                    id="prop-contact-name" 
                    oninput="window.updateProposalPreview()" 
                    placeholder="Ex: Mariana / Gerente de Mídia" 
                    class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#002776] transition-colors"
                  >
                </div>
                <div>
                  <label for="prop-contact-phone" class="block font-bold text-slate-700 mb-1">WhatsApp do Contato:</label>
                  <input 
                    type="text" 
                    id="prop-contact-phone" 
                    placeholder="Ex: 11999998888" 
                    class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#002776] transition-colors font-mono"
                  >
                </div>
              </div>

              <!-- Seleção de Espaços -->
              <div>
                <label class="block font-bold text-slate-700 mb-1.5">Selecione os Espaços Incluídos na Proposta:</label>
                <div class="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 max-h-56 overflow-y-auto">
                  <label class="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded-lg transition-colors">
                    <input type="checkbox" id="chk-banner-topo" onchange="window.updateProposalPreview()" checked class="rounded text-[#009639] focus:ring-[#009639]">
                    <span class="text-xs text-slate-700">Banner Super Leaderboard Topo (R$ 850,00/mês)</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded-lg transition-colors">
                    <input type="checkbox" id="chk-card-nativo" onchange="window.updateProposalPreview()" checked class="rounded text-[#009639] focus:ring-[#009639]">
                    <span class="text-xs text-slate-700">Card Patrocinado Nativo In-Feed (R$ 650,00/mês)</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded-lg transition-colors">
                    <input type="checkbox" id="chk-halfpage" onchange="window.updateProposalPreview()" class="rounded text-[#009639] focus:ring-[#009639]">
                    <span class="text-xs text-slate-700">Half-Page Lateral no Blog 300x600 (R$ 750,00/mês)</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded-lg transition-colors">
                    <input type="checkbox" id="chk-billboard" onchange="window.updateProposalPreview()" class="rounded text-[#009639] focus:ring-[#009639]">
                    <span class="text-xs text-slate-700">Billboard Intertítulo 970x250 (R$ 800,00/mês)</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded-lg transition-colors">
                    <input type="checkbox" id="chk-naming-cv" onchange="window.updateProposalPreview()" class="rounded text-[#009639] focus:ring-[#009639]">
                    <span class="text-xs text-slate-700">Naming Rights do Criador de Currículos + Selo no PDF (R$ 1.500,00/mês)</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded-lg transition-colors">
                    <input type="checkbox" id="chk-patrocinio-ia" onchange="window.updateProposalPreview()" class="rounded text-[#009639] focus:ring-[#009639]">
                    <span class="text-xs text-slate-700">Patrocínio Oficial do Simulador de IA (R$ 1.200,00/mês)</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded-lg transition-colors">
                    <input type="checkbox" id="chk-patrocinio-calc" onchange="window.updateProposalPreview()" class="rounded text-[#009639] focus:ring-[#009639]">
                    <span class="text-xs text-slate-700">Patrocínio da Calculadora CLT/PJ (R$ 700,00/mês)</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded-lg transition-colors">
                    <input type="checkbox" id="chk-push-alunos" onchange="window.updateProposalPreview()" class="rounded text-[#009639] focus:ring-[#009639]">
                    <span class="text-xs text-slate-700">Disparo de Push Notification para Alunos (R$ 450,00/disparo)</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded-lg transition-colors">
                    <input type="checkbox" id="chk-publieditorial" onchange="window.updateProposalPreview()" class="rounded text-[#009639] focus:ring-[#009639]">
                    <span class="text-xs text-slate-700">1 Publieditorial Assinado com Link Dofollow Perpétuo (R$ 1.250,00 único)</span>
                  </label>
                </div>
              </div>

              <!-- Duração & Desconto -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="prop-period" class="block font-bold text-slate-700 mb-1">Período de Contrato:</label>
                  <select 
                    id="prop-period" 
                    onchange="window.updateProposalPreview()" 
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#002776] transition-colors cursor-pointer"
                  >
                    <option value="mensal">Mensal (Preço Base)</option>
                    <option value="trimestral" selected>Trimestral (10% OFF)</option>
                    <option value="semestral">Semestral (15% OFF)</option>
                    <option value="anual">Anual (25% OFF)</option>
                  </select>
                </div>
                <div>
                  <label for="prop-discount" class="block font-bold text-slate-700 mb-1">Desconto Especial (%):</label>
                  <input 
                    type="number" 
                    id="prop-discount" 
                    oninput="window.updateProposalPreview()" 
                    value="0" 
                    min="0" 
                    max="50" 
                    placeholder="0" 
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#002776] transition-colors font-mono"
                  >
                </div>
              </div>

            </div>

            <!-- Coluna 2: Pré-visualização da Mensagem e Botões -->
            <div class="space-y-4 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label for="prop-message-preview" class="font-bold text-slate-700 text-xs">Pré-visualização da Proposta (WhatsApp / E-mail):</label>
                  <span class="text-[10px] text-slate-400 font-mono">Pronta para envio</span>
                </div>
                <textarea 
                  id="prop-message-preview" 
                  rows="14" 
                  class="w-full p-3.5 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl border border-slate-700 outline-none focus:border-[#009639] leading-relaxed custom-scrollbar"
                ></textarea>
              </div>

              <!-- Ações da Proposta -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button 
                  type="button" 
                  onclick="window.copyProposalToClipboard()" 
                  class="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 border border-slate-700 shadow-md cursor-pointer"
                >
                  <i data-lucide="copy" class="w-4 h-4"></i>
                  <span>Copiar Proposta</span>
                </button>
                <button 
                  type="button" 
                  onclick="window.sendProposalWhatsApp()" 
                  class="bg-[#25D366] hover:bg-[#1ebd5b] text-white font-black text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                  <span>Abrir WhatsApp Pronto</span>
                </button>
              </div>
            </div>

          </div>
        </div>
`;

// Inserir antes de <!-- Kit Oficial de Divulgação & Redes Sociais -->
const targetDossierEnd = '        <!-- Kit Oficial de Divulgação & Redes Sociais -->';
if (adminHtml.includes(targetDossierEnd) && !adminHtml.includes('id="gerador-proposta-card"')) {
  adminHtml = adminHtml.replace(targetDossierEnd, adminAluguelHtml + '\n\n' + targetDossierEnd);
  console.log('✅ Tabela de Aluguel e Gerador de Proposta inseridos em admin.html!');
} else {
  console.log('Target já presente ou não encontrado em admin.html');
}

fs.writeFileSync('admin.html', adminHtml, 'utf8');
console.log('🎉 admin.html atualizado com sucesso!');
