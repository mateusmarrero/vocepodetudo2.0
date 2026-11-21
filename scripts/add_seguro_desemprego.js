const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

// 1. Atualizar calculadora-trabalhista.html
const htmlPath = path.join(baseDir, 'calculadora-trabalhista.html');
let html = fs.readFileSync(htmlPath, 'utf-8');

// Adicionar botão da aba 6 (Seguro-Desemprego)
const targetBtn = 'data-target="panel-horas-extras">\n        <i data-lucide="clock" class="w-4 h-4 text-amber-500"></i>\n        <span>Horas Extras & Noturno</span>\n      </button>';
const newBtn = `${targetBtn}
      <button type="button" class="calc-tab-btn px-4 py-2.5 rounded-2xl text-xs font-black transition-all bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer" data-target="panel-seguro">
        <i data-lucide="shield-alert" class="w-4 h-4 text-cyan-500"></i>
        <span>Seguro-Desemprego</span>
      </button>`;

if (!html.includes('data-target="panel-seguro"')) {
  html = html.replace(targetBtn, newBtn);
  console.log('[OK] calculadora-trabalhista.html: Botão de Seguro-Desemprego adicionado!');
}

// Adicionar Painel 6 (Seguro-Desemprego)
const panelSeguroHtml = `
      <!-- PAINEL 6: SEGURO-DESEMPREGO 2026 -->
      <div id="panel-seguro" class="calc-panel hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div class="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h2 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <i data-lucide="shield-alert" class="w-5 h-5 text-cyan-500"></i>
              <span>Simulador de Seguro-Desemprego Oficial 2026</span>
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Descubra quantas parcelas você tem direito a receber e o valor exato de cada uma conforme a tabela CODEFAT.</p>
          </div>

          <form id="form-seguro" class="space-y-4">
            <div class="space-y-1.5">
              <label for="seg-solicitacoes" class="block text-xs font-black text-slate-700 dark:text-slate-300">Quantas vezes você já pediu o benefício? *</label>
              <select id="seg-solicitacoes" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none">
                <option value="1" selected>1ª vez (Primeira solicitação)</option>
                <option value="2">2ª vez (Segunda solicitação)</option>
                <option value="3">3ª vez ou mais</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label for="seg-meses" class="block text-xs font-black text-slate-700 dark:text-slate-300">Meses trabalhados com carteira assinada (últimos 36 meses) *</label>
              <input type="number" id="seg-meses" min="1" max="120" value="18" required placeholder="Ex: 18" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="space-y-1.5">
                <label for="seg-sal1" class="block text-[11px] font-black text-slate-700 dark:text-slate-300">Salário Penúltimo Mês (R$) *</label>
                <input type="number" id="seg-sal1" step="0.01" min="0" required value="2500" placeholder="Ex: 2500" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none">
              </div>
              <div class="space-y-1.5">
                <label for="seg-sal2" class="block text-[11px] font-black text-slate-700 dark:text-slate-300">Salário Mês Anterior (R$) *</label>
                <input type="number" id="seg-sal2" step="0.01" min="0" required value="2500" placeholder="Ex: 2500" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none">
              </div>
              <div class="space-y-1.5">
                <label for="seg-sal3" class="block text-[11px] font-black text-slate-700 dark:text-slate-300">Último Salário (R$) *</label>
                <input type="number" id="seg-sal3" step="0.01" min="0" required value="2500" placeholder="Ex: 2500" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none">
              </div>
            </div>

            <button type="submit" class="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
              <i data-lucide="calculator" class="w-4 h-4"></i>
              <span>Calcular Seguro-Desemprego</span>
            </button>
          </form>
        </div>

        <div class="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-700/50 space-y-6">
          <div>
            <span class="text-[10px] font-black uppercase tracking-wider text-cyan-400 block mb-1">Previsão de Benefício</span>
            <div class="text-2xl sm:text-3xl font-black text-white" id="res-seg-total">R$ 0,00</div>
            <span class="text-xs text-slate-400" id="res-seg-subtitulo">Total do benefício a receber</span>
          </div>

          <div class="divide-y divide-slate-700/60 text-xs">
            <div class="py-2 flex justify-between">
              <span class="text-slate-400">Salário Médio dos Últimos 3 Meses:</span>
              <span class="font-bold text-white" id="res-seg-media">R$ 0,00</span>
            </div>
            <div class="py-2 flex justify-between">
              <span class="text-slate-400">Quantidade de Parcelas:</span>
              <span class="font-bold text-cyan-400" id="res-seg-parcelas">0 parcelas</span>
            </div>
            <div class="py-2 flex justify-between">
              <span class="text-slate-400">Valor de Cada Parcela:</span>
              <span class="font-bold text-emerald-400" id="res-seg-valor-parcela">R$ 0,00</span>
            </div>
            <div class="py-2 flex justify-between">
              <span class="text-slate-400">Piso Nacional Garantido:</span>
              <span class="font-bold text-slate-300">R$ 1.518,00</span>
            </div>
            <div class="py-2 flex justify-between">
              <span class="text-slate-400">Teto Máximo do Benefício:</span>
              <span class="font-bold text-slate-300">R$ 2.351,48</span>
            </div>
          </div>

          <div class="p-3 bg-white/5 rounded-2xl text-[11px] text-slate-300 space-y-1">
            <p>💡 <em>Como solicitar:</em> Você pode requerer o benefício pelo aplicativo <strong>Carteira de Trabalho Digital</strong> ou pelo portal <strong>Gov.br</strong> de 7 a 120 dias após a demissão.</p>
          </div>
        </div>
      </div>
`;

if (!html.includes('id="panel-seguro"')) {
  const panelAnchor = '</div>\n\n    <!-- Bloco Oficial AdSense Responsivo -->';
  html = html.replace(panelAnchor, panelSeguroHtml + '\n' + panelAnchor);
  console.log('[OK] calculadora-trabalhista.html: Painel de Seguro-Desemprego adicionado!');
}

fs.writeFileSync(htmlPath, html, 'utf-8');

// 2. Atualizar src/calculadora.js
const jsPath = path.join(baseDir, 'src', 'calculadora.js');
let js = fs.readFileSync(jsPath, 'utf-8');

const seguroLogic = `
  // ==========================================
  // CALCULADORA 6: SEGURO-DESEMPREGO 2026
  // ==========================================
  function initSeguroDesemprego() {
    const form = document.getElementById('form-seguro');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const solicitacoes = parseInt(document.getElementById('seg-solicitacoes').value, 10) || 1;
      const meses = parseInt(document.getElementById('seg-meses').value, 10) || 0;
      const s1 = parseFloat(document.getElementById('seg-sal1').value) || 0;
      const s2 = parseFloat(document.getElementById('seg-sal2').value) || 0;
      const s3 = parseFloat(document.getElementById('seg-sal3').value) || 0;

      const media = (s1 + s2 + s3) / 3;

      if (media <= 0) return;

      // Cálculo do valor da parcela (Tabela CODEFAT 2026)
      // Piso: 1.518,00 | Teto: 2.351,48
      let parcela = 0;
      if (media <= 2074.67) {
        parcela = media * 0.80;
      } else if (media <= 3458.15) {
        parcela = 1659.74 + ((media - 2074.67) * 0.50);
      } else {
        parcela = 2351.48;
      }

      // Garantir piso do salário mínimo nacional
      if (parcela < 1518.00) {
        parcela = 1518.00;
      }

      // Cálculo da quantidade de parcelas
      let qtdParcelas = 0;
      let elegivel = true;

      if (solicitacoes === 1) {
        if (meses < 12) {
          elegivel = false;
        } else if (meses <= 23) {
          qtdParcelas = 4;
        } else {
          qtdParcelas = 5;
        }
      } else if (solicitacoes === 2) {
        if (meses < 9) {
          elegivel = false;
        } else if (meses <= 11) {
          qtdParcelas = 3;
        } else if (meses <= 23) {
          qtdParcelas = 4;
        } else {
          qtdParcelas = 5;
        }
      } else {
        if (meses < 6) {
          elegivel = false;
        } else if (meses <= 11) {
          qtdParcelas = 3;
        } else if (meses <= 23) {
          qtdParcelas = 4;
        } else {
          qtdParcelas = 5;
        }
      }

      if (!elegivel) {
        document.getElementById('res-seg-total').textContent = 'Ineligível';
        document.getElementById('res-seg-subtitulo').textContent = 'Tempo trabalhado insuficiente para esta solicitação';
        document.getElementById('res-seg-media').textContent = formatBRL(media);
        document.getElementById('res-seg-parcelas').textContent = '0 parcelas (Mínimo exigido não atingido)';
        document.getElementById('res-seg-valor-parcela').textContent = 'R$ 0,00';
        return;
      }

      const totalBeneficio = parcela * qtdParcelas;

      document.getElementById('res-seg-total').textContent = formatBRL(totalBeneficio);
      document.getElementById('res-seg-subtitulo').textContent = \`\${qtdParcelas} parcelas de \${formatBRL(parcela)}\`;
      document.getElementById('res-seg-media').textContent = formatBRL(media);
      document.getElementById('res-seg-parcelas').textContent = \`\${qtdParcelas} parcelas mensais\`;
      document.getElementById('res-seg-valor-parcela').textContent = formatBRL(parcela);
    });
  }
`;

if (!js.includes('function initSeguroDesemprego()')) {
  js = js.replace('initHorasExtras();', 'initHorasExtras();\n    initSeguroDesemprego();');
  js = js.replace("document.addEventListener('DOMContentLoaded', () => {", seguroLogic + "\n  document.addEventListener('DOMContentLoaded', () => {");
  fs.writeFileSync(jsPath, js, 'utf-8');
  console.log('[OK] src/calculadora.js: Lógica do Seguro-Desemprego adicionada!');
}
