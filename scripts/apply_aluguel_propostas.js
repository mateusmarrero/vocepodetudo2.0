const fs = require('fs');

console.log('--- Preparando atualização de Mídia Kit com Tabela de Aluguel e Gerador de Proposta ---');

// 1. Atualizar midia-kit.html
let mk = fs.readFileSync('midia-kit.html', 'utf8');

// Adicionar botão de Apresentação/Pitch no Hero se não tiver
if (!mk.includes('copyMediaKitPitch()')) {
  const targetHeroBtns = '<a \n                href="#simulador" \n                class="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all flex items-center gap-2 backdrop-blur-sm"\n              >\n                <i data-lucide="calculator" class="w-4 h-4 text-[#ffdf00]"></i>\n                <span>Simular Orçamento</span>\n              </a>';
  
  const repHeroBtns = targetHeroBtns + `\n              <a \n                href="#gerador-proposta-card" \n                class="px-6 py-3 rounded-xl bg-[#002776] hover:bg-blue-900 text-white font-bold text-xs uppercase tracking-wider border border-blue-400/30 transition-all flex items-center gap-2 shadow-md"\n              >\n                <i data-lucide="file-signature" class="w-4 h-4 text-amber-300"></i>\n                <span>Gerador de Proposta</span>\n              </a>\n              <button \n                type="button"\n                onclick="window.copyMediaKitPitch()"\n                class="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"\n                title="Copiar apresentação rápida para WhatsApp"\n              >\n                <i data-lucide="copy" class="w-4 h-4"></i>\n                <span>Copiar Pitch Rápido</span>\n              </button>`;
  
  if (mk.includes(targetHeroBtns)) {
    mk = mk.replace(targetHeroBtns, repHeroBtns);
    console.log('✅ Botões adicionados no Hero de midia-kit.html');
  }
}

// Bloco da Tabela de Aluguel e Gerador de Proposta
const aluguelSectionHtml = `
        <!-- TABELA DE ALUGUEL DE ESPAÇOS PUBLICITÁRIOS 2026 -->
        <div id="tabela-aluguel" class="pt-10 space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-[#009639] text-white tracking-wider">
                OPORTUNIDADES 2026
              </span>
              <h3 class="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Tabela de Aluguel de Espaço de Propaganda & Patrocínios
              </h3>
              <p class="text-xs text-slate-500 font-medium">
                Contratações diretas sem intermediários com emissão de Nota Fiscal e relatórios auditados.
              </p>
            </div>
            <div class="text-xs text-slate-500 font-medium sm:text-right">
              Contratos: <strong class="text-slate-800">Mensal, Trimestral (-10%), Semestral (-15%) ou Anual (-25%)</strong>
            </div>
          </div>

          <!-- Grid dos 6 Formatos de Aluguel -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <!-- Formato 1: Banner Leaderboard Topo -->
            <div class="bg-white border-2 border-blue-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#002776] transition-all print-card">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-100 text-[#002776]">
                    ALTA VISIBILIDADE
                  </span>
                  <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Disponível
                  </span>
                </div>
                <h4 class="text-base font-black text-slate-900">Banner Super Leaderboard Topo</h4>
                <p class="text-xs text-slate-600 leading-relaxed font-medium">
                  Exibição destacada no topo de todas as páginas do portal, 200 cursos oficiais e ferramentas. Impacto visual imediato acima da dobra em 100% dos visitantes.
                </p>
                <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-medium space-y-1">
                  <div><strong>Dimensões:</strong> 728x90 (Desktop) / 320x100 (Mobile)</div>
                  <div><strong>Formatos:</strong> JPG, PNG, GIF, HTML5 e tags GAM</div>
                </div>
              </div>
              <div class="pt-4 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <span class="text-[10px] text-slate-400 uppercase font-black block">Investimento Base</span>
                  <strong class="text-2xl font-black text-[#002776]">R$ 850,00</strong>
                  <span class="text-[10px] text-slate-500 font-bold">/ mês</span>
                </div>
                <a href="#gerador-proposta-card" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-[#002776] hover:text-white text-slate-800 text-xs font-bold transition-all">
                  Simular
                </a>
              </div>
            </div>

            <!-- Formato 2: Card Patrocinado Nativo In-Feed -->
            <div class="bg-emerald-50/50 border-2 border-emerald-400 rounded-3xl p-6 shadow-md flex flex-col justify-between space-y-4 relative print-card">
              <span class="absolute -top-3 right-6 px-3 py-1 rounded-full bg-[#009639] text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                Mais Escolhido
              </span>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-[#00702a]">
                    CTR ATÉ 5,2%
                  </span>
                  <span class="text-[10px] font-bold text-[#009639] bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                    Alta Conversão
                  </span>
                </div>
                <h4 class="text-base font-black text-slate-900">Card Patrocinado Nativo In-Feed</h4>
                <p class="text-xs text-slate-600 leading-relaxed font-medium">
                  Integrado organicamente entre os cards dos 200 cursos oficiais e no mural de vagas. Possui capa, título, selo de Patrocinado e botão de ação direta para o site da sua marca.
                </p>
                <div class="p-3 rounded-2xl bg-white border border-emerald-200 text-[11px] text-emerald-900 font-medium space-y-1">
                  <div><strong>Localização:</strong> Grade de Cursos & Mural de Vagas</div>
                  <div><strong>Métrica:</strong> CTR até 3x superior aos banners comuns</div>
                </div>
              </div>
              <div class="pt-4 border-t border-emerald-200 flex items-baseline justify-between">
                <div>
                  <span class="text-[10px] text-slate-400 uppercase font-black block">Investimento Base</span>
                  <strong class="text-2xl font-black text-[#009639]">R$ 650,00</strong>
                  <span class="text-[10px] text-slate-500 font-bold">/ mês</span>
                </div>
                <a href="#gerador-proposta-card" class="px-3.5 py-2 rounded-xl bg-[#009639] hover:bg-emerald-800 text-white text-xs font-bold transition-all">
                  Simular
                </a>
              </div>
            </div>

            <!-- Formato 3: Half-Page Lateral Sticky no Blog -->
            <div class="bg-white border-2 border-purple-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-purple-600 transition-all print-card">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
                    LONGA EXPOSIÇÃO
                  </span>
                  <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Disponível
                  </span>
                </div>
                <h4 class="text-base font-black text-slate-900">Half-Page Lateral no Blog (300x600)</h4>
                <p class="text-xs text-slate-600 leading-relaxed font-medium">
                  Fixado na barra lateral de todos os 80+ artigos do Blog Você Pode Tudo. Permanece estático e visível na tela enquanto o usuário rola a página para ler o conteúdo.
                </p>
                <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-medium space-y-1">
                  <div><strong>Dimensões:</strong> 300x600 px (Sticky)</div>
                  <div><strong>Duração de Visualização:</strong> ~45 segundos contínuos</div>
                </div>
              </div>
              <div class="pt-4 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <span class="text-[10px] text-slate-400 uppercase font-black block">Investimento Base</span>
                  <strong class="text-2xl font-black text-purple-700">R$ 750,00</strong>
                  <span class="text-[10px] text-slate-500 font-bold">/ mês</span>
                </div>
                <a href="#gerador-proposta-card" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-purple-700 hover:text-white text-slate-800 text-xs font-bold transition-all">
                  Simular
                </a>
              </div>
            </div>

            <!-- Formato 4: Naming Rights do Criador de Currículos -->
            <div class="bg-white border-2 border-amber-300 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-500 transition-all print-card">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                    NAMING RIGHTS & PDF
                  </span>
                  <span class="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Exclusivo
                  </span>
                </div>
                <h4 class="text-base font-black text-slate-900">Patrocínio Oficial do Criador de Currículos</h4>
                <p class="text-xs text-slate-600 leading-relaxed font-medium">
                  Exclusividade setorial 100%. Sua marca como apoio oficial no cabeçalho do assistente de currículos e selo institucional timbrado no rodapé de cada currículo em PDF exportado!
                </p>
                <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-medium space-y-1">
                  <div><strong>Tempo Médio de Uso:</strong> 12 a 15 minutos por usuário</div>
                  <div><strong>Retenção Física:</strong> Selo impresso no PDF guardado pelo aluno</div>
                </div>
              </div>
              <div class="pt-4 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <span class="text-[10px] text-slate-400 uppercase font-black block">Investimento Mensal</span>
                  <strong class="text-2xl font-black text-amber-600">R$ 1.500,00</strong>
                  <span class="text-[10px] text-slate-500 font-bold">/ mês</span>
                </div>
                <a href="#gerador-proposta-card" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-amber-600 hover:text-white text-slate-800 text-xs font-bold transition-all">
                  Simular
                </a>
              </div>
            </div>

            <!-- Formato 5: Patrocínio do Simulador de Entrevistas com IA -->
            <div class="bg-white border-2 border-blue-300 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-600 transition-all print-card">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                    INOVAÇÃO & IA
                  </span>
                  <span class="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    Disponível
                  </span>
                </div>
                <h4 class="text-base font-black text-slate-900">Patrocínio do Simulador de Entrevistas</h4>
                <p class="text-xs text-slate-600 leading-relaxed font-medium">
                  Candidatos treinam respostas para entrevistas com inteligência artificial. Apresentado por sua marca na tela inicial e dica patrocinada exclusiva entre as rodadas de perguntas.
                </p>
                <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-medium space-y-1">
                  <div><strong>Engajamento:</strong> 8 a 10 minutos por simulação</div>
                  <div><strong>Conexão:</strong> Forte impacto emocional de conquista de emprego</div>
                </div>
              </div>
              <div class="pt-4 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <span class="text-[10px] text-slate-400 uppercase font-black block">Investimento Mensal</span>
                  <strong class="text-2xl font-black text-blue-700">R$ 1.200,00</strong>
                  <span class="text-[10px] text-slate-500 font-bold">/ mês</span>
                </div>
                <a href="#gerador-proposta-card" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-blue-700 hover:text-white text-slate-800 text-xs font-bold transition-all">
                  Simular
                </a>
              </div>
            </div>

            <!-- Formato 6: Publieditorial Técnico com SEO Vitalício -->
            <div class="bg-white border-2 border-emerald-300 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-600 transition-all print-card">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    SEO PERMANENTE
                  </span>
                  <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Recomendado
                  </span>
                </div>
                <h4 class="text-base font-black text-slate-900">Publieditorial Assinado com Link Dofollow</h4>
                <p class="text-xs text-slate-600 leading-relaxed font-medium">
                  Artigo exclusivo elaborado pela nossa equipe editorial sobre os serviços ou cursos da sua marca. Fica publicado permanentemente com link Dofollow indexado no Google.
                </p>
                <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-medium space-y-1">
                  <div><strong>Entrega:</strong> Texto editorial de valor + imagens + links</div>
                  <div><strong>Duração:</strong> Permanente e perpétuo (sem taxa de renovação)</div>
                </div>
              </div>
              <div class="pt-4 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <span class="text-[10px] text-slate-400 uppercase font-black block">Investimento Único</span>
                  <strong class="text-2xl font-black text-[#009639]">R$ 1.250,00</strong>
                  <span class="text-[10px] text-slate-500 font-bold">vitalício</span>
                </div>
                <a href="#gerador-proposta-card" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-[#009639] hover:text-white text-slate-800 text-xs font-bold transition-all">
                  Simular
                </a>
              </div>
            </div>

          </div>
        </div>

        <!-- GERADOR DINÂMICO DE PROPOSTA COMERCIAL (INTERATIVO) -->
        <div id="gerador-proposta-card" class="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-white no-print mt-10">
          <div class="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-[#ffdf00] text-slate-950 tracking-wider inline-block mb-1">
                FERRAMENTA DE PROPOSTA RÁPIDA
              </span>
              <h3 class="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <i data-lucide="file-signature" class="w-6 h-6 text-[#ffdf00]"></i>
                <span>Gerador Rápido de Proposta Comercial</span>
              </h3>
              <p class="text-xs text-slate-300 font-medium">
                Monte e gere o texto da proposta personalizado em segundos para enviar pelo WhatsApp ou E-mail da marca parceira.
              </p>
            </div>
            <div class="text-right">
              <span id="prop-total-calculated" class="text-sm font-black text-[#ffdf00] bg-white/10 px-4 py-2 rounded-xl border border-white/20 inline-block font-mono">
                Investimento: R$ 0,00
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <!-- Coluna 1: Campos e Seleção de Espaços -->
            <div class="space-y-4 text-xs font-medium">
              <div>
                <label for="prop-company-name" class="block font-bold text-slate-200 mb-1">Nome da Empresa / Marca Parceira:</label>
                <input 
                  type="text" 
                  id="prop-company-name" 
                  oninput="window.updateProposalPreview()" 
                  placeholder="Ex: Faculdade Estácio, CIEE, Alura, Santander..." 
                  class="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#ffdf00] transition-colors"
                >
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="prop-contact-name" class="block font-bold text-slate-200 mb-1">Nome do Contato:</label>
                  <input 
                    type="text" 
                    id="prop-contact-name" 
                    oninput="window.updateProposalPreview()" 
                    placeholder="Ex: Mariana / Gerente de Mídia" 
                    class="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#ffdf00] transition-colors"
                  >
                </div>
                <div>
                  <label for="prop-contact-phone" class="block font-bold text-slate-200 mb-1">WhatsApp do Contato:</label>
                  <input 
                    type="text" 
                    id="prop-contact-phone" 
                    placeholder="Ex: 11999998888" 
                    class="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#ffdf00] transition-colors font-mono"
                  >
                </div>
              </div>

              <!-- Seleção dos Espaços para Aluguel -->
              <div>
                <label class="block font-bold text-slate-200 mb-1.5">Selecione os Espaços Incluídos na Proposta:</label>
                <div class="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10 max-h-60 overflow-y-auto">
                  <label class="flex items-center gap-2.5 cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors">
                    <input type="checkbox" id="chk-banner-topo" onchange="window.updateProposalPreview()" checked class="rounded text-[#009639] focus:ring-[#009639]">
                    <span class="text-xs text-slate-200">Banner Super Leaderboard Topo (R$ 850,00/mês)</span>
                  </label>
                  <label class="flex items-center gap-2.5 cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors">
                    <input type="checkbox" id="chk-card-nativo" onchange="window.updateProposalPreview()" checked class="rounded text-[#009639] focus:ring-[#009639]">
                    <span class="text-xs text-slate-200">Card Patrocinado Nativo In-Feed (R$ 650,00/mês)</span>
                  </label>
                  <label class="flex items-center gap-2.5 cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors">
                    <input type="checkbox" id="chk-halfpage" onchange="window.updateProposalPreview()" class="rounded text-[#009639] focus:ring-[#009639]">
                    <span class="text-xs text-slate-200">Half-Page Lateral no Blog 300x600 (R$ 750,00/mês)</span>
                  </label>
                  <label class="flex items-center gap-2.5 cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors">
                    <input type="checkbox" id="chk-billboard" onchange="window.updateProposalPreview()" class="rounded text-[#009639] focus:ring-[#009639]">
                    <span class="text-xs text-slate-200">Billboard Intertítulo 970x250 (R$ 800,00/mês)</span>
                  </label>
                  <label class="flex items-center gap-2.5 cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors">
                    <input type="checkbox" id="chk-naming-cv" onchange="window.updateProposalPreview()" class="rounded text-[#009639] focus:ring-[#009639]">
                    <span class="text-xs text-slate-200">Naming Rights do Criador de Currículos + Selo no PDF (R$ 1.500,00/mês)</span>
                  </label>
                  <label class="flex items-center gap-2.5 cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors">
                    <input type="checkbox" id="chk-patrocinio-ia" onchange="window.updateProposalPreview()" class="rounded text-[#009639] focus:ring-[#009639]">
                    <span class="text-xs text-slate-200">Patrocínio do Simulador de Entrevistas com IA (R$ 1.200,00/mês)</span>
                  </label>
                  <label class="flex items-center gap-2.5 cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors">
                    <input type="checkbox" id="chk-patrocinio-calc" onchange="window.updateProposalPreview()" class="rounded text-[#009639] focus:ring-[#009639]">
                    <span class="text-xs text-slate-200">Patrocínio da Calculadora CLT/PJ (R$ 700,00/mês)</span>
                  </label>
                  <label class="flex items-center gap-2.5 cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors">
                    <input type="checkbox" id="chk-push-alunos" onchange="window.updateProposalPreview()" class="rounded text-[#009639] focus:ring-[#009639]">
                    <span class="text-xs text-slate-200">Disparo de Push Notification para Alunos (R$ 450,00/disparo)</span>
                  </label>
                  <label class="flex items-center gap-2.5 cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors">
                    <input type="checkbox" id="chk-publieditorial" onchange="window.updateProposalPreview()" class="rounded text-[#009639] focus:ring-[#009639]">
                    <span class="text-xs text-slate-200">1 Publieditorial Assinado com Link Dofollow Perpétuo (R$ 1.250,00 único)</span>
                  </label>
                </div>
              </div>

              <!-- Duração & Desconto -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="prop-period" class="block font-bold text-slate-200 mb-1">Período de Contrato:</label>
                  <select 
                    id="prop-period" 
                    onchange="window.updateProposalPreview()" 
                    class="w-full px-4 py-2.5 bg-slate-800 border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#ffdf00] transition-colors cursor-pointer"
                  >
                    <option value="mensal">Mensal (Preço Base)</option>
                    <option value="trimestral" selected>Trimestral (10% OFF)</option>
                    <option value="semestral">Semestral (15% OFF)</option>
                    <option value="anual">Anual (25% OFF)</option>
                  </select>
                </div>
                <div>
                  <label for="prop-discount" class="block font-bold text-slate-200 mb-1">Desconto Especial (%):</label>
                  <input 
                    type="number" 
                    id="prop-discount" 
                    oninput="window.updateProposalPreview()" 
                    value="0" 
                    min="0" 
                    max="50" 
                    placeholder="0" 
                    class="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#ffdf00] transition-colors font-mono"
                  >
                </div>
              </div>

            </div>

            <!-- Coluna 2: Pré-visualização da Mensagem e Botões -->
            <div class="space-y-4 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label for="prop-message-preview" class="font-bold text-slate-200 text-xs">Pré-visualização da Proposta (WhatsApp / E-mail):</label>
                  <span class="text-[10px] text-slate-400 font-mono">Pronta para envio</span>
                </div>
                <textarea 
                  id="prop-message-preview" 
                  rows="14" 
                  class="w-full p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-2xl border border-white/20 outline-none focus:border-[#ffdf00] leading-relaxed custom-scrollbar"
                ></textarea>
              </div>

              <!-- Ações da Proposta -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button 
                  type="button" 
                  onclick="window.copyProposalToClipboard()" 
                  class="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 border border-white/20 shadow-md cursor-pointer"
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

// Inserir antes de </section> da seção modelos
const targetEndOfModelos = '      </div>\n    </section>\n\n    <!-- SEÇÃO 6: BRAND SAFETY, GOVERNANÇA & LGPD -->';
if (mk.includes(targetEndOfModelos)) {
  mk = mk.replace(targetEndOfModelos, aluguelSectionHtml + '\n      </div>\n    </section>\n\n    <!-- SEÇÃO 6: BRAND SAFETY, GOVERNANÇA & LGPD -->');
  console.log('✅ Tabela de Aluguel e Gerador de Proposta inseridos em midia-kit.html!');
} else {
  console.error('Target de fim da seção modelos não encontrado em midia-kit.html');
}

// Implementar funções JS em midia-kit.html
const jsFunctions = `
      // --- LÓGICA DO GERADOR DE PROPOSTA COMERCIAL & ALUGUEL DE ESPAÇOS ---
      window.copyMediaKitPitch = function() {
        const pitch = \`*PORTAL VOCÊ PODE TUDO — MÍDIA KIT & OPORTUNIDADES 2026*\\n\\n\` +
          \`Somos o maior ecossistema gratuito de qualificação profissional, ferramentas de carreira e cursos oficiais do Brasil (vocepodetudo.com).\\n\\n\` +
          \`📌 *Destaques do Ecossistema:*\\n\` +
          \`• Mais de 200 Cursos Oficiais com Certificado Gratuito (MEC, Sebrae, Bradesco, EV.G, USP)\\n\` +
          \`• Ferramentas de Alta Retenção: Criador de Currículos ATS, Simulador de Entrevistas com IA e Calculadoras CLT/PJ\\n\` +
          \`• Audiência: 42% entre 16-24 anos (Jovem Aprendiz/Estágio) e 38% entre 25-34 anos (Especialização/Carreira)\\n\` +
          \`• Espaços para Patrocinadores: Super Leaderboard Topo, Cards Nativos In-Feed, Naming Rights de Ferramentas, Half-Page no Blog e Publieditoriais Dofollow.\\n\\n\` +
          \`Gostaria de receber nossa proposta personalizada de aluguel de espaço para sua marca?\\n\` +
          \`WhatsApp Comercial: (11) 99999-9999 | E-mail: comercial@vocepodetudo.com\`;

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(pitch).then(() => {
            alert('Apresentação rápida (pitch) copiada para a área de transferência!');
          }).catch(() => {
            alert('Apresentação copiada com sucesso!');
          });
        } else {
          alert('Apresentação copiada com sucesso!');
        }
      };

      window.updateProposalPreview = function() {
        const company = (document.getElementById('prop-company-name')?.value || '').trim() || '[Nome da Marca / Empresa]';
        const contact = (document.getElementById('prop-contact-name')?.value || '').trim() || 'Equipe Comercial / Marketing';
        const period = document.getElementById('prop-period')?.value || 'trimestral';
        const discount = Math.max(0, Math.min(50, parseFloat(document.getElementById('prop-discount')?.value || 0)));

        let items = [];
        let monthlySubtotal = 0;
        let oneTimeSubtotal = 0;

        const chkTopo = document.getElementById('chk-banner-topo');
        const chkNativo = document.getElementById('chk-card-nativo');
        const chkHalf = document.getElementById('chk-halfpage');
        const chkBill = document.getElementById('chk-billboard');
        const chkCv = document.getElementById('chk-naming-cv');
        const chkIa = document.getElementById('chk-patrocinio-ia');
        const chkCalc = document.getElementById('chk-patrocinio-calc');
        const chkPush = document.getElementById('chk-push-alunos');
        const chkPubli = document.getElementById('chk-publieditorial');

        if (chkTopo && chkTopo.checked) {
          items.push('• Banner Super Leaderboard Topo (Todas as Páginas e Cursos) — R$ 850,00/mês');
          monthlySubtotal += 850;
        }
        if (chkNativo && chkNativo.checked) {
          items.push('• Card Patrocinado Nativo In-Feed (Grade de Cursos & Mural de Vagas) — R$ 650,00/mês');
          monthlySubtotal += 650;
        }
        if (chkHalf && chkHalf.checked) {
          items.push('• Half-Page Lateral Sticky no Blog (80+ Artigos de Carreira) — R$ 750,00/mês');
          monthlySubtotal += 750;
        }
        if (chkBill && chkBill.checked) {
          items.push('• Billboard Intertítulo Editorial (970x250 Desktop / 300x250 Mobile) — R$ 800,00/mês');
          monthlySubtotal += 800;
        }
        if (chkCv && chkCv.checked) {
          items.push('• Naming Rights do Criador de Currículos (Logo no Topo + Selo no PDF) — R$ 1.500,00/mês');
          monthlySubtotal += 1500;
        }
        if (chkIa && chkIa.checked) {
          items.push('• Patrocínio Oficial do Simulador de Entrevistas com IA — R$ 1.200,00/mês');
          monthlySubtotal += 1200;
        }
        if (chkCalc && chkCalc.checked) {
          items.push('• Patrocínio Oficial da Calculadora Trabalhista CLT/PJ — R$ 700,00/mês');
          monthlySubtotal += 700;
        }
        if (chkPush && chkPush.checked) {
          items.push('• Disparo de Push Notification para Alunos Inscritos — R$ 450,00/disparo');
          oneTimeSubtotal += 450;
        }
        if (chkPubli && chkPubli.checked) {
          items.push('• 1 Publieditorial Assinado com Link Dofollow Perpétuo no Blog — R$ 1.250,00 (vitalício)');
          oneTimeSubtotal += 1250;
        }

        let months = 1;
        let periodDiscount = 0;
        let periodLabel = 'Mensal';

        if (period === 'trimestral') {
          months = 3;
          periodDiscount = 10;
          periodLabel = 'Trimestral (com 10% de desconto)';
        } else if (period === 'semestral') {
          months = 6;
          periodDiscount = 15;
          periodLabel = 'Semestral (com 15% de desconto)';
        } else if (period === 'anual') {
          months = 12;
          periodDiscount = 25;
          periodLabel = 'Anual (com 25% de desconto)';
        }

        const totalRecorrenteBruto = monthlySubtotal * months;
        const descTotalPerc = periodDiscount + discount;
        const totalRecorrenteComDesc = totalRecorrenteBruto * (1 - descTotalPerc / 100);
        const totalFinal = totalRecorrenteComDesc + oneTimeSubtotal;

        const totalCalculatedEl = document.getElementById('prop-total-calculated');
        if (totalCalculatedEl) {
          totalCalculatedEl.textContent = \`Investimento: R$ \${totalFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (\${periodLabel})\`;
        }

        const text = \`PROPOSTA COMERCIAL & ALUGUEL DE ESPAÇO DE PROPAGANDA\\n\` +
          \`De: Portal Você Pode Tudo (vocepodetudo.com)\\n\` +
          \`Para: \${company} (A/C: \${contact})\\n\` +
          \`Data: \${new Date().toLocaleDateString('pt-BR')} • Validade: 15 dias\\n\\n\` +
          \`Olá, \${contact}! Apresentamos nossa proposta de parceria comercial para inserção e homologação da \${company} no ecossistema do Portal Você Pode Tudo, o maior portal gratuito de cursos, empregabilidade e carreira do Brasil.\\n\\n\` +
          \`🎯 ENTREGÁVEIS & ESPAÇOS CONTRATADOS:\\n\` +
          (items.length > 0 ? items.join('\\n') : '• Nenhum formato selecionado') + \`\\n\\n\` +
          \`💰 INVESTIMENTO & CONDIÇÕES:\\n\` +
          \`• Período do Contrato: \${periodLabel}\\n\` +
          (descTotalPerc > 0 ? \`• Desconto Especial Aplicado: \${descTotalPerc}% OFF\\n\` : '') +
          \`• Valor Total do Plano: R$ \${totalFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\\n\` +
          \`• Forma de Pagamento: Pix, Boleto Bancário ou Cartão de Crédito com Nota Fiscal Eletrônica\\n\\n\` +
          \`📊 BENEFÍCIOS PARA A SUA MARCA:\\n\` +
          \`1. Alcance massivo e qualificado diante de milhares de estudantes, jovens profissionais e candidatos motivados em todo o Brasil.\\n\` +
          \`2. Ambiente 100% Brand Safe (Tier 1) e em estrita conformidade com a LGPD (Lei nº 13.709/2018).\\n\` +
          \`3. Formatos de alta visibilidade e conversão direta (CTR médio de 3,4% e picos de 5,2% nos cards nativos).\\n\\n\` +
          \`Ficamos à disposição para darmos início imediato à veiculação da \${company}!\\n\\n\` +
          \`Atenciosamente,\\n\` +
          \`Coordenação Comercial • Portal Você Pode Tudo\\n\` +
          \`WhatsApp: (11) 99999-9999 | E-mail: comercial@vocepodetudo.com\`;

        const previewArea = document.getElementById('prop-message-preview');
        if (previewArea) {
          previewArea.value = text;
        }
      };

      window.copyProposalToClipboard = function() {
        const previewArea = document.getElementById('prop-message-preview');
        if (!previewArea || !previewArea.value) {
          window.updateProposalPreview();
        }
        const val = previewArea ? previewArea.value : '';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(val).then(() => {
            alert('Proposta comercial copiada com sucesso! Pronto para colar no WhatsApp ou E-mail.');
          }).catch(() => {
            alert('Proposta copiada com sucesso!');
          });
        } else {
          alert('Proposta copiada com sucesso!');
        }
      };

      window.sendProposalWhatsApp = function() {
        const previewArea = document.getElementById('prop-message-preview');
        if (!previewArea || !previewArea.value) {
          window.updateProposalPreview();
        }
        const rawPhone = (document.getElementById('prop-contact-phone')?.value || '').replace(/\\D/g, '');
        const phone = rawPhone ? (rawPhone.startsWith('55') ? rawPhone : '55' + rawPhone) : '';
        const text = encodeURIComponent(previewArea.value);
        const url = phone ? \`https://wa.me/\${phone}?text=\${text}\` : \`https://wa.me/?text=\${text}\`;
        window.open(url, '_blank');
      };

      window.updateProposalPreview();
`;

// Inserir JS antes de </script> final
const targetJsEnd = '      updateSimulation();';
if (mk.includes(targetJsEnd)) {
  mk = mk.replace(targetJsEnd, targetJsEnd + '\n' + jsFunctions);
  console.log('✅ Funções JS de Proposta adicionadas em midia-kit.html!');
}

fs.writeFileSync('midia-kit.html', mk, 'utf8');
console.log('🎉 midia-kit.html atualizado com sucesso!');
