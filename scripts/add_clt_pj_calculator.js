const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const calcHtmlPath = path.join(ROOT, 'calculadora-trabalhista.html');
const calcJsPath = path.join(ROOT, 'src', 'calculadora.js');

let calcHtml = fs.readFileSync(calcHtmlPath, 'utf8');
let calcJs = fs.readFileSync(calcJsPath, 'utf8');

console.log('--- Injetando Calculadora CLT vs PJ ---');

// 1. Injetar botão da aba em calculadora-trabalhista.html
const targetBtn = `<button type="button" class="calc-tab-btn px-4 py-2.5 rounded-2xl text-xs font-black transition-all bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer" data-target="panel-seguro-desemprego">
        <i data-lucide="shield-check" class="w-4 h-4"></i>
        <span>Seguro-Desemprego</span>
      </button>`;

const newCltPjBtn = `
      <button type="button" class="calc-tab-btn px-4 py-2.5 rounded-2xl text-xs font-black transition-all bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer" data-target="panel-clt-pj">
        <i data-lucide="scale" class="w-4 h-4 text-emerald-500"></i>
        <span>Comparador CLT vs PJ</span>
      </button>`;

if (!calcHtml.includes('data-target="panel-clt-pj"')) {
  calcHtml = calcHtml.replace(targetBtn, targetBtn + newCltPjBtn);
  console.log('✅ Botão da aba CLT vs PJ inserido.');
}

// 2. Injetar painel em calculadora-trabalhista.html
const cltPjPanelHtml = `
    <!-- PAINEL 7: COMPARADOR CLT VS PJ -->
    <div id="panel-clt-pj" class="calc-panel hidden bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div class="max-w-2xl mx-auto">
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mb-2">
            <i data-lucide="scale" class="w-3.5 h-3.5"></i>
            <span>Equivalência Salarial Inteligente</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Comparador de Salário CLT vs. PJ</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg mx-auto font-medium">
            Descubra qual proposta vale mais a pena financeiramente considerando 13º, férias + 1/3, FGTS, benefícios e impostos de pessoa jurídica.
          </p>
        </div>

        <form id="form-clt-pj" class="space-y-5" onsubmit="return false;">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="cltpj-salario-clt" class="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                Salário Bruto CLT (R$)
              </label>
              <input 
                type="number" 
                id="cltpj-salario-clt" 
                placeholder="Ex: 5000" 
                step="0.01" 
                min="0"
                class="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
              >
            </div>
            <div>
              <label for="cltpj-beneficios-clt" class="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                Benefícios Mensais CLT (VR, VT, Plano)
              </label>
              <input 
                type="number" 
                id="cltpj-beneficios-clt" 
                placeholder="Ex: 800" 
                step="0.01" 
                min="0"
                class="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
              >
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="cltpj-proposta-pj" class="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                Proposta PJ Recebida (Opcional - R$)
              </label>
              <input 
                type="number" 
                id="cltpj-proposta-pj" 
                placeholder="Ex: 8500" 
                step="0.01" 
                min="0"
                class="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
              >
            </div>
            <div>
              <label for="cltpj-imposto-pj" class="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                Alíquota Média de Imposto PJ (%)
              </label>
              <select 
                id="cltpj-imposto-pj" 
                class="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="0.06">6% (Simples Nacional - Anexo III)</option>
                <option value="0.10">10% (Simples Nacional Médio)</option>
                <option value="0.155">15.5% (Simples Nacional - Anexo V)</option>
                <option value="0.00">0% / MEI (Taxa fixa mensal)</option>
              </select>
            </div>
          </div>

          <button 
            type="button" 
            id="btn-calc-clt-pj" 
            class="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-[#009B3A] text-white font-black text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <i data-lucide="calculator" class="w-4 h-4"></i>
            <span>Comparar Vantagens Financeiras</span>
          </button>
        </form>

        <!-- Resultado do Comparador -->
        <div id="result-clt-pj" class="hidden mt-8 space-y-6 animate-fade-in">
          <!-- Veredito de Destaque -->
          <div id="cltpj-veredito-card" class="p-5 rounded-2xl border transition-all text-center">
            <span class="text-xs font-black uppercase tracking-wider block mb-1" id="cltpj-veredito-badge">Análise Comparativa</span>
            <h3 class="text-lg sm:text-xl font-black" id="cltpj-veredito-title">...</h3>
            <p class="text-xs mt-1" id="cltpj-veredito-desc">...</p>
          </div>

          <!-- Grade Comparativa Lado a Lado -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Coluna CLT -->
            <div class="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-3">
              <div class="flex items-center justify-between pb-2 border-b border-blue-100 dark:border-blue-800/60">
                <span class="font-black text-xs text-[#002776] dark:text-blue-300 uppercase">Regime CLT</span>
                <span class="text-[10px] font-bold text-blue-600 dark:text-blue-400">Com Direitos</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-slate-600 dark:text-slate-300">Salário Líquido na Conta:</span>
                <strong id="cltpj-clt-liquido" class="text-slate-900 dark:text-white">R$ 0,00</strong>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-slate-600 dark:text-slate-300">FGTS Mensal (8%):</span>
                <strong id="cltpj-clt-fgts" class="text-slate-900 dark:text-white">R$ 0,00</strong>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-slate-600 dark:text-slate-300">13º + Férias (Proporção):</span>
                <strong id="cltpj-clt-direitos" class="text-slate-900 dark:text-white">R$ 0,00</strong>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-slate-600 dark:text-slate-300">Benefícios Mensais:</span>
                <strong id="cltpj-clt-beneficios" class="text-slate-900 dark:text-white">R$ 0,00</strong>
              </div>
              <div class="pt-2 border-t border-blue-200 dark:border-blue-800 flex justify-between text-sm font-black text-[#002776] dark:text-blue-300">
                <span>Pacote Mensal Real:</span>
                <span id="cltpj-clt-total">R$ 0,00</span>
              </div>
            </div>

            <!-- Coluna PJ -->
            <div class="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
              <div class="flex items-center justify-between pb-2 border-b border-emerald-100 dark:border-emerald-800/60">
                <span class="font-black text-xs text-emerald-800 dark:text-emerald-300 uppercase">Regime PJ</span>
                <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Prestação de Serviço</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-slate-600 dark:text-slate-300">Proposta Bruta PJ:</span>
                <strong id="cltpj-pj-bruto" class="text-slate-900 dark:text-white">R$ 0,00</strong>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-slate-600 dark:text-slate-300">Impostos Estimados (DAS):</span>
                <strong id="cltpj-pj-impostos" class="text-rose-600 dark:text-rose-400">- R$ 0,00</strong>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-slate-600 dark:text-slate-300">Custo Contabilidade:</span>
                <strong id="cltpj-pj-contabil" class="text-slate-500">- R$ 150,00</strong>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-slate-600 dark:text-slate-300">Reserva de Férias/Inatividade:</span>
                <strong id="cltpj-pj-reserva" class="text-slate-500">Por sua conta</strong>
              </div>
              <div class="pt-2 border-t border-emerald-200 dark:border-emerald-800 flex justify-between text-sm font-black text-emerald-800 dark:text-emerald-300">
                <span>Líquido PJ no Bolso:</span>
                <span id="cltpj-pj-total">R$ 0,00</span>
              </div>
            </div>
          </div>

          <!-- Sugestão de Proposta Ideal PJ -->
          <div class="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 font-medium">
            💡 <strong>Regra de Ouro do Mercado:</strong> Para compensar a perda de férias remuneradas, 13º salário, FGTS (e multa de 40%) e aviso prévio, um contrato PJ geralmente deve pagar entre <strong>30% a 50% a mais</strong> que o salário bruto CLT equivalente.
            Para este salário CLT informado, o valor ideal a negociar como PJ seria de aproximadamente <strong id="cltpj-pj-sugerido" class="font-black text-emerald-700 dark:text-emerald-400">R$ 0,00</strong>.
          </div>
        </div>
      </div>
    </div>
`;

if (!calcHtml.includes('id="panel-clt-pj"')) {
  // Inserir antes de </main>
  calcHtml = calcHtml.replace('</main>', cltPjPanelHtml + '\n  </main>');
  console.log('✅ Painel CLT vs PJ inserido em calculadora-trabalhista.html.');
}

fs.writeFileSync(calcHtmlPath, calcHtml, 'utf8');

// 3. Injetar função initCltPj em src/calculadora.js
const cltPjJsCode = `
  // ===========================================================================
  // COMPARADOR CLT VS PJ
  // ===========================================================================
  function initCltPj() {
    const btn = document.getElementById('btn-calc-clt-pj');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const salarioClt = parseFloat(document.getElementById('cltpj-salario-clt')?.value) || 0;
      const beneficiosClt = parseFloat(document.getElementById('cltpj-beneficios-clt')?.value) || 0;
      let propostaPj = parseFloat(document.getElementById('cltpj-proposta-pj')?.value) || 0;
      const aliquotaPj = parseFloat(document.getElementById('cltpj-imposto-pj')?.value) || 0.06;

      if (salarioClt <= 0 && propostaPj <= 0) {
        alert('Por favor, informe ao menos o Salário CLT ou a Proposta PJ.');
        return;
      }

      // Cálculos CLT
      const inssClt = calcularINSS(salarioClt);
      const baseIrrfClt = Math.max(0, salarioClt - inssClt);
      const irrfClt = calcularIRRF(baseIrrfClt);
      const salarioLiquidoClt = Math.max(0, salarioClt - inssClt - irrfClt);
      const fgtsMensal = salarioClt * 0.08;
      // Proporção de 13º (8.33%) e Férias com 1/3 (11.11%)
      const decimoMensal = salarioClt / 12;
      const feriasMensal = (salarioClt * (4/3)) / 12;
      const pacoteTotalClt = salarioLiquidoClt + fgtsMensal + decimoMensal + feriasMensal + beneficiosClt;

      // Sugestão de PJ equivalente (cobre pacote CLT + impostos PJ + R$ 150 contabilidade)
      const custoContabilidade = 150;
      const pjEquivalenteSugerido = (pacoteTotalClt + custoContabilidade) / (1 - aliquotaPj);

      // Se usuário não digitou PJ, usar a sugestão equivalente
      if (propostaPj <= 0) {
        propostaPj = pjEquivalenteSugerido;
      }

      // Cálculos PJ
      const impostosPj = propostaPj * aliquotaPj;
      const liquidoPj = Math.max(0, propostaPj - impostosPj - custoContabilidade);

      // Renderizar valores
      document.getElementById('cltpj-clt-liquido').textContent = formatBRL(salarioLiquidoClt);
      document.getElementById('cltpj-clt-fgts').textContent = formatBRL(fgtsMensal);
      document.getElementById('cltpj-clt-direitos').textContent = formatBRL(decimoMensal + feriasMensal);
      document.getElementById('cltpj-clt-beneficios').textContent = formatBRL(beneficiosClt);
      document.getElementById('cltpj-clt-total').textContent = formatBRL(pacoteTotalClt);

      document.getElementById('cltpj-pj-bruto').textContent = formatBRL(propostaPj);
      document.getElementById('cltpj-pj-impostos').textContent = '- ' + formatBRL(impostosPj);
      document.getElementById('cltpj-pj-total').textContent = formatBRL(liquidoPj);
      document.getElementById('cltpj-pj-sugerido').textContent = formatBRL(pjEquivalenteSugerido);

      // Veredito
      const card = document.getElementById('cltpj-veredito-card');
      const title = document.getElementById('cltpj-veredito-title');
      const desc = document.getElementById('cltpj-veredito-desc');
      const badge = document.getElementById('cltpj-veredito-badge');

      const diff = liquidoPj - pacoteTotalClt;

      if (diff > 500) {
        card.className = 'p-5 rounded-2xl border bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-center';
        badge.className = 'text-xs font-black uppercase tracking-wider block mb-1 text-emerald-800 dark:text-emerald-300';
        badge.textContent = 'Veredito: Regime PJ Mais Vantajoso';
        title.className = 'text-lg sm:text-xl font-black text-emerald-900 dark:text-white';
        title.textContent = 'A proposta PJ oferece ganho financeiro superior';
        desc.textContent = \`Você ganha aproximadamente \${formatBRL(diff)} a mais por mês mesmo após pagar impostos e contabilidade.\`;
      } else if (diff < -500) {
        card.className = 'p-5 rounded-2xl border bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-center';
        badge.className = 'text-xs font-black uppercase tracking-wider block mb-1 text-[#002776] dark:text-blue-300';
        badge.textContent = 'Veredito: Regime CLT Mais Seguro e Vantajoso';
        title.className = 'text-lg sm:text-xl font-black text-[#002776] dark:text-white';
        title.textContent = 'O pacote CLT compensa mais';
        desc.textContent = \`A proposta PJ está abaixo do necessário. Com FGTS, 13º e benefícios, a CLT entrega cerca de \${formatBRL(Math.abs(diff))} a mais de valor.\`;
      } else {
        card.className = 'p-5 rounded-2xl border bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-center';
        badge.className = 'text-xs font-black uppercase tracking-wider block mb-1 text-amber-800 dark:text-amber-300';
        badge.textContent = 'Veredito: Empate Financeiro Técnico';
        title.className = 'text-lg sm:text-xl font-black text-amber-900 dark:text-white';
        title.textContent = 'Ambas as propostas entregam poder de compra similar';
        desc.textContent = 'A decisão deve considerar outros fatores: estabilidade e direitos (CLT) versus flexibilidade e autonomia (PJ).';
      }

      document.getElementById('result-clt-pj')?.classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    });
  }
`;

if (!calcJs.includes('function initCltPj()')) {
  // Adicionar initCltPj() e chamá-la no final
  calcJs = calcJs.replace('initSeguroDesemprego();', 'initSeguroDesemprego();\n    initCltPj();');
  calcJs += '\n' + cltPjJsCode;
  fs.writeFileSync(calcJsPath, calcJs, 'utf8');
  console.log('✅ initCltPj inserido em src/calculadora.js.');
}

console.log('--- Comparador CLT vs PJ Finalizado ---');
