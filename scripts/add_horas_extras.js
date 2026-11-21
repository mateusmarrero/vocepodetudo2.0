const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

// 1. Atualizar calculadora-trabalhista.html
const htmlPath = path.join(baseDir, 'calculadora-trabalhista.html');
let html = fs.readFileSync(htmlPath, 'utf-8');

// A. Inserir botão de aba
const tabTarget = 'data-target="panel-rescisao">\n        <i data-lucide="briefcase" class="w-4 h-4 text-rose-500"></i>\n        <span>Rescisão CLT</span>\n      </button>';
const newTabBtn = `${tabTarget}
      <button type="button" class="calc-tab-btn px-4 py-2.5 rounded-2xl text-xs font-black transition-all bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer" data-target="panel-horas-extras">
        <i data-lucide="clock" class="w-4 h-4 text-amber-500"></i>
        <span>Horas Extras & Noturno</span>
      </button>`;

if (!html.includes('data-target="panel-horas-extras"')) {
  html = html.replace(tabTarget, newTabBtn);
}

// B. Inserir Painel de Horas Extras
const panelHorasExtrasHtml = `
      <!-- PAINEL 5: HORAS EXTRAS & ADICIONAL NOTURNO -->
      <div id="panel-horas-extras" class="calc-panel hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div class="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h2 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <i data-lucide="clock" class="w-5 h-5 text-amber-500"></i>
              <span>Cálculo de Horas Extras e Adicional Noturno</span>
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Calcule o valor exato da sua hora de trabalho, adicionais de 50%, 100% e reflexo de DSR.</p>
          </div>

          <form id="form-horas-extras" class="space-y-4">
            <div class="space-y-1.5">
              <label for="he-salario-bruto" class="block text-xs font-black text-slate-700 dark:text-slate-300">Salário Base Mensal (R$) *</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-slate-400">R$</span>
                <input type="number" id="he-salario-bruto" step="0.01" min="0" required placeholder="Ex: 3000.00" class="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label for="he-jornada" class="block text-xs font-black text-slate-700 dark:text-slate-300">Jornada Mensal (Horas) *</label>
                <select id="he-jornada" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none">
                  <option value="220" selected>220h (44h semanais - Padrão CLT)</option>
                  <option value="200">200h (40h semanais)</option>
                  <option value="180">180h (36h semanais)</option>
                  <option value="150">150h (30h semanais)</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label for="he-qtd-50" class="block text-xs font-black text-slate-700 dark:text-slate-300">Horas Extras a 50% (Dias Úteis)</label>
                <input type="number" id="he-qtd-50" step="0.5" min="0" value="10" placeholder="Ex: 10" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label for="he-qtd-100" class="block text-xs font-black text-slate-700 dark:text-slate-300">Horas Extras a 100% (Domingos/Feriados)</label>
                <input type="number" id="he-qtd-100" step="0.5" min="0" value="0" placeholder="Ex: 5" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none">
              </div>

              <div class="space-y-1.5">
                <label for="he-qtd-noturnas" class="block text-xs font-black text-slate-700 dark:text-slate-300">Horas Noturnas (22h às 5h)</label>
                <input type="number" id="he-qtd-noturnas" step="0.5" min="0" value="0" placeholder="Ex: 20" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none">
              </div>
            </div>

            <button type="submit" class="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
              <i data-lucide="calculator" class="w-4 h-4"></i>
              <span>Calcular Horas Extras</span>
            </button>
          </form>
        </div>

        <div class="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-700/50 space-y-6">
          <div>
            <span class="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">Resultado Detalhado</span>
            <div class="text-2xl sm:text-3xl font-black text-white" id="res-he-total">R$ 0,00</div>
            <span class="text-xs text-slate-400">Total bruto adicional a receber no mês</span>
          </div>

          <div class="divide-y divide-slate-700/60 text-xs">
            <div class="py-2 flex justify-between">
              <span class="text-slate-400">Valor da Hora Normal:</span>
              <span class="font-bold text-white" id="res-he-valor-hora">R$ 0,00</span>
            </div>
            <div class="py-2 flex justify-between">
              <span class="text-slate-400">Valor da Hora 50%:</span>
              <span class="font-bold text-white" id="res-he-valor-hora-50">R$ 0,00</span>
            </div>
            <div class="py-2 flex justify-between">
              <span class="text-slate-400">Total Horas 50%:</span>
              <span class="font-bold text-emerald-400" id="res-he-total-50">R$ 0,00</span>
            </div>
            <div class="py-2 flex justify-between">
              <span class="text-slate-400">Total Horas 100%:</span>
              <span class="font-bold text-emerald-400" id="res-he-total-100">R$ 0,00</span>
            </div>
            <div class="py-2 flex justify-between">
              <span class="text-slate-400">Adicional Noturno (20%):</span>
              <span class="font-bold text-amber-400" id="res-he-total-noturno">R$ 0,00</span>
            </div>
            <div class="py-2 flex justify-between">
              <span class="text-slate-400">Reflexo Estimado no DSR:</span>
              <span class="font-bold text-emerald-400" id="res-he-total-dsr">R$ 0,00</span>
            </div>
          </div>

          <div class="p-3 bg-white/5 rounded-2xl text-[11px] text-slate-300">
            💡 <em>Nota legal:</em> O cálculo do DSR considera a média aproximada de 25 dias úteis e 5 domingos/feriados no mês.
          </div>
        </div>
      </div>
`;

if (!html.includes('id="panel-horas-extras"')) {
  // Inserir após o fechamento de panel-rescisao
  const rescisaoEnd = '💡 <em>Atenção:</em> Este simulador oferece uma estimativa pedagógica com base na CLT. Valores exatos podem variar com acordos e convenções coletivas da categoria.\n            </div>\n          </div>\n        </div>\n      </div>';
  if (html.includes(rescisaoEnd)) {
    html = html.replace(rescisaoEnd, rescisaoEnd + '\n' + panelHorasExtrasHtml);
    console.log('[OK] calculadora-trabalhista.html: Inserido painel de Horas Extras!');
  } else {
    // Alternativa: buscar o final do panel-rescisao
    const pEnd = 'id="panel-rescisao"';
    const indexPanel = html.indexOf(pEnd);
    const closeDiv = html.indexOf('</div>\n\n    <!-- Bloco Oficial AdSense', indexPanel);
    if (closeDiv !== -1) {
      html = html.slice(0, closeDiv) + panelHorasExtrasHtml + html.slice(closeDiv);
      console.log('[OK] calculadora-trabalhista.html: Inserido painel antes do AdSense!');
    }
  }
}

fs.writeFileSync(htmlPath, html, 'utf-8');

// 2. Atualizar src/calculadora.js
const jsPath = path.join(baseDir, 'src', 'calculadora.js');
let js = fs.readFileSync(jsPath, 'utf-8');

const initHorasExtrasCode = `
  // ==========================================
  // CALCULADORA 5: HORAS EXTRAS & NOTURNO
  // ==========================================
  function initHorasExtras() {
    const form = document.getElementById('form-horas-extras');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const salario = parseFloat(document.getElementById('he-salario-bruto').value) || 0;
      const jornada = parseFloat(document.getElementById('he-jornada').value) || 220;
      const qtd50 = parseFloat(document.getElementById('he-qtd-50').value) || 0;
      const qtd100 = parseFloat(document.getElementById('he-qtd-100').value) || 0;
      const qtdNoturnas = parseFloat(document.getElementById('he-qtd-noturnas').value) || 0;

      if (salario <= 0) return;

      const valorHora = salario / jornada;
      const valorHora50 = valorHora * 1.5;
      const valorHora100 = valorHora * 2.0;

      const total50 = qtd50 * valorHora50;
      const total100 = qtd100 * valorHora100;

      // Adicional Noturno: 20% sobre a hora base (ou hora reduzida noturna)
      const valorHoraNoturna = valorHora * 0.20;
      const totalNoturno = qtdNoturnas * valorHoraNoturna;

      // DSR estimado: (Total Horas Extras / 25 dias uteis) * 5 domingos e feriados
      const totalHE = total50 + total100;
      const totalDSR = totalHE > 0 ? (totalHE / 25) * 5 : 0;

      const totalGeral = total50 + total100 + totalNoturno + totalDSR;

      document.getElementById('res-he-total').textContent = formatBRL(totalGeral);
      document.getElementById('res-he-valor-hora').textContent = formatBRL(valorHora);
      document.getElementById('res-he-valor-hora-50').textContent = formatBRL(valorHora50);
      document.getElementById('res-he-total-50').textContent = formatBRL(total50);
      document.getElementById('res-he-total-100').textContent = formatBRL(total100);
      document.getElementById('res-he-total-noturno').textContent = formatBRL(totalNoturno);
      document.getElementById('res-he-total-dsr').textContent = formatBRL(totalDSR);
    });
  }
`;

if (!js.includes('function initHorasExtras()')) {
  // Inserir antes do document.addEventListener('DOMContentLoaded'
  js = js.replace("document.addEventListener('DOMContentLoaded', () => {", initHorasExtrasCode + "\n  document.addEventListener('DOMContentLoaded', () => {");
  js = js.replace("initRescisao();", "initRescisao();\n    initHorasExtras();");
  fs.writeFileSync(jsPath, js, 'utf-8');
  console.log('[OK] src/calculadora.js: Adicionada lógica de cálculo de Horas Extras!');
}
