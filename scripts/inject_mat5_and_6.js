const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const cardMaterial5e6 = `
      <!-- Material 5: Modelo de Carta de Apresentação Profissional -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-blue-500 transition-all group">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black">
              <i data-lucide="mail" class="w-6 h-6"></i>
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              Formato DOC / Word
            </span>
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
              Carta de Apresentação Profissional (Word)
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              3 modelos prontos e persuasivos (Primeiro Emprego, Transição de Carreira e Profissional Experiente) para enviar por e-mail, anexar na Gupy ou enviar no LinkedIn.
            </p>
          </div>
          <ul class="text-[11px] space-y-1 text-slate-500 dark:text-slate-400 font-medium">
            <li class="flex items-center gap-1.5"><i data-lucide="check" class="w-3.5 h-3.5 text-blue-500"></i> Texto persuasivo focado em destacar competências</li>
            <li class="flex items-center gap-1.5"><i data-lucide="check" class="w-3.5 h-3.5 text-blue-500"></i> Campos editáveis claros para preenchimento rápido</li>
            <li class="flex items-center gap-1.5"><i data-lucide="check" class="w-3.5 h-3.5 text-blue-500"></i> Modelo aprovado por especialistas de RH</li>
          </ul>
        </div>
        <div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button type="button" id="btn-download-carta" class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
            <i data-lucide="download" class="w-3.5 h-3.5"></i>
            <span>Baixar Carta (.doc)</span>
          </button>
          <span class="text-[11px] text-slate-400 font-bold">100% Gratuito</span>
        </div>
      </div>

      <!-- Material 6: Planilha de Cronograma de Estudos para Concursos -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-emerald-500 transition-all group">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black">
              <i data-lucide="calendar-check" class="w-6 h-6"></i>
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Formato CSV / Excel
            </span>
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
              Ciclo de Estudos & Concursos (Excel / Planilha)
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Planilha de ciclo de estudos semanal com metas de horas líquidas, controle de acertos em questões e cronograma de revisões espaçadas (24h, 7d, 30d).
            </p>
          </div>
          <ul class="text-[11px] space-y-1 text-slate-500 dark:text-slate-400 font-medium">
            <li class="flex items-center gap-1.5"><i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500"></i> Método de Ciclos de Estudo flexível</li>
            <li class="flex items-center gap-1.5"><i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500"></i> Controle de acertos e aproveitamento (%)</li>
            <li class="flex items-center gap-1.5"><i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500"></i> Compatível com Excel, Google Planilhas e Calc</li>
          </ul>
        </div>
        <div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button type="button" id="btn-download-cronograma" class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
            <i data-lucide="download" class="w-3.5 h-3.5"></i>
            <span>Baixar Planilha (.csv)</span>
          </button>
          <span class="text-[11px] text-slate-400 font-bold">100% Gratuito</span>
        </div>
      </div>
`;

['downloads.html', 'materiais-gratuitos.html'].forEach(filename => {
  const filePath = path.join(baseDir, filename);
  let content = fs.readFileSync(filePath, 'utf-8');

  if (!content.includes('id="btn-download-carta"')) {
    const targetAnchor = 'Ver obrigações do MEI no Blog →\n          </a>\n        </div>\n      </div>\n\n    </div>';
    if (content.includes(targetAnchor)) {
      const replacement = 'Ver obrigações do MEI no Blog →\n          </a>\n        </div>\n      </div>\n' + cardMaterial5e6 + '\n    </div>';
      content = content.replace(targetAnchor, replacement);
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`[OK] Inseridos os cards 5 e 6 no grid de ${filename}!`);
    } else {
      console.log(`[AVISO] Padrão não encontrado em ${filename}`);
    }
  } else {
    console.log(`[INFO] ${filename} já possuía os cards 5 e 6.`);
  }
});
