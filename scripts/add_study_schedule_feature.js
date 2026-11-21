const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const indexPath = path.join(ROOT, 'index.html');
const appJsPath = path.join(ROOT, 'src', 'app.js');

let indexHtml = fs.readFileSync(indexPath, 'utf8');
let appJs = fs.readFileSync(appJsPath, 'utf8');

console.log('--- Injetando Gerador de Cronograma de Estudos ---');

// 1. Injetar atalho no dropdown Cursos & Trilhas de index.html
const targetCursosDropdown = `<!-- Submenu Multinível 2: Trilhas de Aprendizagem + Subnível Recolhível -->`;

const scheduleShortcutHtml = `<!-- Atalho: Gerador de Cronograma de Estudos Semanal (Novo) -->
              <button 
                type="button"
                id="btn-open-schedule-nav"
                class="w-full flex items-center justify-between p-2 rounded-lg hover:bg-emerald-50 transition-colors group cursor-pointer text-left"
                onclick="window.openStudyScheduleModal && window.openStudyScheduleModal()"
              >
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-md bg-[#009639] text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <i data-lucide="calendar-check-2" class="w-3.5 h-3.5 text-[#ffdf00]"></i>
                  </div>
                  <div>
                    <span class="text-xs font-bold text-slate-900 group-hover:text-[#009639] block leading-tight">Plano de Estudos Semanal</span>
                    <span class="text-[10px] text-slate-500 block">Cronograma em PDF & Checklist</span>
                  </div>
                </div>
                <span class="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded">Novo</span>
              </button>\n\n              `;

if (!indexHtml.includes('id="btn-open-schedule-nav"')) {
  indexHtml = indexHtml.replace(targetCursosDropdown, scheduleShortcutHtml + targetCursosDropdown);
  console.log('✅ Atalho de Cronograma inserido no menu Cursos & Trilhas.');
}

// 2. Injetar modal completo do Cronograma de Estudos antes de </body> em index.html
const scheduleModalHtml = `
  <!-- MODAL: GERADOR DE CRONOGRAMA DE ESTUDOS SEMANAL -->
  <div id="study-schedule-modal" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 hidden">
    <div class="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-scale-up">
      
      <!-- Cabeçalho do Modal -->
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-white to-blue-50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#009639] to-[#005e24] text-[#ffdf00] flex items-center justify-center shadow-sm">
            <i data-lucide="calendar-check-2" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="text-base font-black text-slate-900 leading-tight">Cronograma de Estudos Semanal</h3>
            <p class="text-xs text-slate-500 font-semibold">Organize seu aprendizado passo a passo com metas diárias</p>
          </div>
        </div>
        <button type="button" class="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors" onclick="window.closeStudyScheduleModal && window.closeStudyScheduleModal()">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Corpo do Modal -->
      <div class="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
        
        <!-- Formulário de Configuração -->
        <div id="schedule-setup-view" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="sched-area" class="block text-xs font-black text-slate-700 mb-1">Qual área você quer estudar?</label>
              <select id="sched-area" class="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#009639]">
                <option value="tecnologia">💻 Tecnologia & Programação</option>
                <option value="gestao">💼 Gestão, Liderança & Administração</option>
                <option value="saude">🩺 Saúde & Cuidados Comunitários</option>
                <option value="ingles">🌐 Inglês para o Mercado de Trabalho</option>
                <option value="concursos">🏛️ Concursos Públicos & Direito</option>
                <option value="carreira">🎯 Primeiro Emprego & Jovem Aprendiz</option>
              </select>
            </div>

            <div>
              <label for="sched-time" class="block text-xs font-black text-slate-700 mb-1">Tempo livre por dia</label>
              <select id="sched-time" class="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#009639]">
                <option value="15">⏱️ 15 min / dia (Microlearning Rápido)</option>
                <option value="30" selected>⚡ 30 min / dia (Recomendado)</option>
                <option value="60">🚀 1 hora / dia (Avançado)</option>
                <option value="120">🔥 2 horas / dia (Intensivo)</option>
              </select>
            </div>
          </div>

          <div>
            <label for="sched-days" class="block text-xs font-black text-slate-700 mb-1">Frequência Semanal</label>
            <select id="sched-days" class="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#009639]">
              <option value="semana" selected>Segunda a Sexta (5 dias úteis - Descanso no fim de semana)</option>
              <option value="todos">Todos os dias (7 dias por semana - Constância máxima)</option>
              <option value="fimdesemana">Finais de Semana (Sábado e Domingo)</option>
            </select>
          </div>

          <button 
            type="button" 
            id="btn-generate-schedule" 
            class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#009639] to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <i data-lucide="sparkles" class="w-4 h-4 text-[#ffdf00]"></i>
            <span>Gerar Meu Cronograma Personalizado</span>
          </button>
        </div>

        <!-- Visualização do Cronograma Gerado -->
        <div id="schedule-result-view" class="hidden space-y-4 animate-fade-in">
          
          <!-- Barra de Progresso Semanal -->
          <div class="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
            <div class="flex items-center justify-between text-xs font-bold text-emerald-950 mb-1.5">
              <span>Progresso da Semana:</span>
              <span id="schedule-progress-text" class="font-black text-[#00702a]">0% concluído</span>
            </div>
            <div class="w-full h-2 rounded-full bg-emerald-200 overflow-hidden">
              <div id="schedule-progress-bar" class="h-full bg-gradient-to-r from-emerald-600 to-[#009639] transition-all duration-300" style="width: 0%;"></div>
            </div>
          </div>

          <!-- Grade de Dias e Metas -->
          <div id="schedule-days-container" class="space-y-2.5">
            <!-- Gerado via JavaScript -->
          </div>

          <!-- Dica de Ouro -->
          <div class="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 font-medium flex items-center gap-2">
            <i data-lucide="info" class="w-4 h-4 text-blue-700 flex-shrink-0"></i>
            <span>Seu progresso fica salvo automaticamente neste navegador. Ao concluir as metas, marque a caixinha!</span>
          </div>

        </div>

      </div>

      <!-- Rodapé do Modal -->
      <div class="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2 flex-wrap">
        <button 
          type="button" 
          class="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          onclick="window.closeStudyScheduleModal && window.closeStudyScheduleModal()"
        >
          Fechar
        </button>
        <div class="flex items-center gap-2">
          <button 
            type="button" 
            id="btn-reconfigure-schedule"
            class="hidden px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-all cursor-pointer"
          >
            Refazer Plano
          </button>
          <button 
            type="button" 
            id="btn-print-schedule"
            class="hidden px-4 py-2 rounded-xl text-xs font-black text-white bg-[#002776] hover:bg-blue-900 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <i data-lucide="printer" class="w-3.5 h-3.5 text-[#ffdf00]"></i>
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </div>

    </div>
  </div>
`;

if (!indexHtml.includes('id="study-schedule-modal"')) {
  indexHtml = indexHtml.replace('</body>', scheduleModalHtml + '\n</body>');
  console.log('✅ Modal de Cronograma de Estudos inserido em index.html.');
}

fs.writeFileSync(indexPath, indexHtml, 'utf8');

// 3. Injetar funções em src/app.js
const scheduleJsCode = `
  // ===========================================================================
  // GERADOR DE CRONOGRAMA DE ESTUDOS SEMANAL
  // ===========================================================================
  const scheduleTemplates = {
    tecnologia: [
      { dia: 'Segunda-feira', meta: 'Assistir aula inaugural de Lógica ou Linguagem', tempo: 'vídeo + anotações' },
      { dia: 'Terça-feira', meta: 'Mão na massa: escrever os primeiros códigos e testes práticos', tempo: 'exercícios guiados' },
      { dia: 'Quarta-feira', meta: 'Leitura complementar de documentação oficial e conceitos fundamentais', tempo: 'fixação' },
      { dia: 'Quinta-feira', meta: 'Resolver 2 a 3 desafios de código ou mini projeto no GitHub', tempo: 'prática intensiva' },
      { dia: 'Sexta-feira', meta: 'Revisão geral das anotações e postar o aprendizado na comunidade', tempo: 'síntese semanal' },
      { dia: 'Sábado', meta: 'Mini projeto de portfólio para currículo', tempo: 'projeto prático' },
      { dia: 'Domingo', meta: 'Descanso e planejamento da próxima trilha', tempo: 'recuperação' }
    ],
    gestao: [
      { dia: 'Segunda-feira', meta: 'Conceitos de Gestão e Planejamento Estratégico', tempo: 'estudo teórico' },
      { dia: 'Terça-feira', meta: 'Estudo de caso prático: resolução de gargalos operacionais', tempo: 'análise de caso' },
      { dia: 'Quarta-feira', meta: 'Prática com planilhas de Excel e indicadores de desempenho (KPIs)', tempo: 'ferramentas' },
      { dia: 'Quinta-feira', meta: 'Comunicação executiva, liderança e gestão de pessoas', tempo: 'soft skills' },
      { dia: 'Sexta-feira', meta: 'Resumo das melhores práticas e plano de melhoria contínua', tempo: 'revisão' },
      { dia: 'Sábado', meta: 'Leitura de artigo sobre inovação e mercado corporativo', tempo: 'atualização' },
      { dia: 'Domingo', meta: 'Descanso estratégico para a semana', tempo: 'recuperação' }
    ],
    saude: [
      { dia: 'Segunda-feira', meta: 'Fundamentos de Cuidados Básicos e Protocolos de Saúde', tempo: 'aula teórica' },
      { dia: 'Terça-feira', meta: 'Prevenção de Infecções, Biossegurança e Higiene Clínica', tempo: 'protocolos' },
      { dia: 'Quarta-feira', meta: 'Diretrizes do SUS e Políticas Públicas de Saúde Comunitária', tempo: 'legislação' },
      { dia: 'Quinta-feira', meta: 'Simulação de rotinas de atendimento humanizado e acolhimento', tempo: 'prática de atendimento' },
      { dia: 'Sexta-feira', meta: 'Revisão dos módulos para avaliação final e emissão de certificado', tempo: 'revisão de prova' },
      { dia: 'Sábado', meta: 'Fixação de termos técnicos e vocabulário hospitalar', tempo: 'estudo dirigido' },
      { dia: 'Domingo', meta: 'Descanso e leitura leve sobre bem-estar', tempo: 'recuperação' }
    ],
    ingles: [
      { dia: 'Segunda-feira', meta: 'Listening & Vocabulary: ouvir podcast ou aula e anotar 10 palavras novas', tempo: 'compreensão oral' },
      { dia: 'Terça-feira', meta: 'Grammar in Context: estruturas essenciais para apresentações e reuniões', tempo: 'gramática prática' },
      { dia: 'Quarta-feira', meta: 'Reading: ler artigo curto sobre sua área profissional em inglês', tempo: 'leitura e vocabulário' },
      { dia: 'Quinta-feira', meta: 'Speaking/Pronunciation: repetir frases em voz alta e gravar áudio de 1 min', tempo: 'pronúncia ativa' },
      { dia: 'Sexta-feira', meta: 'Writing: escrever pequeno e-mail ou mensagem simulando contato profissional', tempo: 'escrita' },
      { dia: 'Sábado', meta: 'Assistir a um vídeo do YouTube em inglês com legendas em inglês', tempo: 'imersão' },
      { dia: 'Domingo', meta: 'Descanso e contato leve com músicas em inglês', tempo: 'lazer' }
    ],
    concursos: [
      { dia: 'Segunda-feira', meta: 'Língua Portuguesa: Gramática e Interpretação de Texto', tempo: 'disciplina base' },
      { dia: 'Terça-feira', meta: 'Direito Constitucional ou Administrativo: leitura de lei seca', tempo: 'legislação' },
      { dia: 'Quarta-feira', meta: 'Raciocínio Lógico e Matemática Básica', tempo: 'resolução de exercícios' },
      { dia: 'Quinta-feira', meta: 'Informática para Concursos e Noções de Administração Pública', tempo: 'conteúdo específico' },
      { dia: 'Sexta-feira', meta: 'Simulado de 20 questões de bancas anteriores (Cebraspe/FGV/Vunesp)', tempo: 'testagem real' },
      { dia: 'Sábado', meta: 'Análise detalhada das questões erradas no simulado', tempo: 'reforço' },
      { dia: 'Domingo', meta: 'Descanso mental para absorção do conteúdo', tempo: 'recuperação' }
    ],
    carreira: [
      { dia: 'Segunda-feira', meta: 'Atualização do Currículo no portal com as competências da vaga', tempo: 'currículo' },
      { dia: 'Terça-feira', meta: 'Comportamento corporativo, ética no trabalho e comunicação no WhatsApp', tempo: 'postura' },
      { dia: 'Quarta-feira', meta: 'Simulação de Entrevistas: treinar respostas para as 5 perguntas mais comuns', tempo: 'simulador' },
      { dia: 'Quinta-feira', meta: 'Candidatura dirigida a 3 vagas de Jovem Aprendiz ou Estágio no Mural', tempo: 'aplicação' },
      { dia: 'Sexta-feira', meta: 'Aula de Informática Básica ou Excel para reforçar seu perfil', tempo: 'capacitação' },
      { dia: 'Sábado', meta: 'Organizar rede de contatos e perfil no LinkedIn', tempo: 'networking' },
      { dia: 'Domingo', meta: 'Descanso', tempo: 'recuperação' }
    ]
  };

  window.openStudyScheduleModal = function() {
    const modal = document.getElementById('study-schedule-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();

    // Carregar progresso anterior se existir
    const saved = localStorage.getItem('vpt_study_plan_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        renderScheduleDays(parsed.days, parsed.areaName, parsed.timePerDay);
        document.getElementById('schedule-setup-view')?.classList.add('hidden');
        document.getElementById('schedule-result-view')?.classList.remove('hidden');
        document.getElementById('btn-reconfigure-schedule')?.classList.remove('hidden');
        document.getElementById('btn-print-schedule')?.classList.remove('hidden');
        updateScheduleProgress();
      } catch (e) {}
    }
  };

  window.closeStudyScheduleModal = function() {
    const modal = document.getElementById('study-schedule-modal');
    if (modal) modal.classList.add('hidden');
  };

  function updateScheduleProgress() {
    const checkboxes = document.querySelectorAll('.sched-checkbox');
    if (checkboxes.length === 0) return;

    let checked = 0;
    checkboxes.forEach(c => { if (c.checked) checked++; });

    const pct = Math.round((checked / checkboxes.length) * 100);
    const textEl = document.getElementById('schedule-progress-text');
    const barEl = document.getElementById('schedule-progress-bar');

    if (textEl) textEl.textContent = \`\${pct}% concluído (\${checked} de \${checkboxes.length} metas)\`;
    if (barEl) barEl.style.width = \`\${pct}%\`;
  }

  function renderScheduleDays(days, areaName, timePerDay) {
    const container = document.getElementById('schedule-days-container');
    if (!container) return;

    const savedProgress = JSON.parse(localStorage.getItem('vpt_study_plan_progress') || '{}');

    container.innerHTML = days.map((d, idx) => {
      const isChecked = !!savedProgress[idx];
      return \`
        <div class="p-3.5 rounded-2xl border \${isChecked ? 'bg-emerald-50/60 border-emerald-300' : 'bg-slate-50 border-slate-200'} transition-all flex items-start gap-3">
          <input 
            type="checkbox" 
            id="sched-chk-\${idx}" 
            class="sched-checkbox mt-1 w-4 h-4 text-[#009639] rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            \${isChecked ? 'checked' : ''}
            onchange="window.toggleScheduleTask(\${idx}, this.checked)"
          >
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <span class="font-black text-xs \${isChecked ? 'text-emerald-900 line-through' : 'text-slate-900'}">\${d.dia}</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-md \${isChecked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}">\${timePerDay} min</span>
            </div>
            <p class="text-xs text-slate-600 mt-0.5 \${isChecked ? 'line-through text-slate-400' : ''}">\${d.meta}</p>
          </div>
        </div>
      \`;
    }).join('');
  }

  window.toggleScheduleTask = function(idx, checked) {
    const saved = JSON.parse(localStorage.getItem('vpt_study_plan_progress') || '{}');
    if (checked) saved[idx] = true;
    else delete saved[idx];
    localStorage.setItem('vpt_study_plan_progress', JSON.stringify(saved));
    updateScheduleProgress();

    const chkEl = document.getElementById(\`sched-chk-\${idx}\`);
    if (chkEl) {
      const card = chkEl.closest('div.rounded-2xl');
      if (card) {
        if (checked) {
          card.className = 'p-3.5 rounded-2xl border bg-emerald-50/60 border-emerald-300 transition-all flex items-start gap-3';
        } else {
          card.className = 'p-3.5 rounded-2xl border bg-slate-50 border-slate-200 transition-all flex items-start gap-3';
        }
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-generate-schedule')?.addEventListener('click', () => {
      const area = document.getElementById('sched-area')?.value || 'tecnologia';
      const time = document.getElementById('sched-time')?.value || '30';
      const freq = document.getElementById('sched-days')?.value || 'semana';

      const allDays = scheduleTemplates[area] || scheduleTemplates.tecnologia;
      let selectedDays = [...allDays];

      if (freq === 'semana') {
        selectedDays = allDays.slice(0, 5);
      } else if (freq === 'fimdesemana') {
        selectedDays = allDays.slice(5, 7);
      }

      const areaSelect = document.getElementById('sched-area');
      const areaName = areaSelect ? areaSelect.options[areaSelect.selectedIndex].text : 'Geral';

      localStorage.setItem('vpt_study_plan_data', JSON.stringify({
        area,
        areaName,
        timePerDay: time,
        days: selectedDays
      }));
      localStorage.removeItem('vpt_study_plan_progress');

      renderScheduleDays(selectedDays, areaName, time);
      document.getElementById('schedule-setup-view')?.classList.add('hidden');
      document.getElementById('schedule-result-view')?.classList.remove('hidden');
      document.getElementById('btn-reconfigure-schedule')?.classList.remove('hidden');
      document.getElementById('btn-print-schedule')?.classList.remove('hidden');
      updateScheduleProgress();
      if (window.lucide) window.lucide.createIcons();
    });

    document.getElementById('btn-reconfigure-schedule')?.addEventListener('click', () => {
      document.getElementById('schedule-result-view')?.classList.add('hidden');
      document.getElementById('schedule-setup-view')?.classList.remove('hidden');
      document.getElementById('btn-reconfigure-schedule')?.classList.add('hidden');
      document.getElementById('btn-print-schedule')?.classList.add('hidden');
    });

    document.getElementById('btn-print-schedule')?.addEventListener('click', () => {
      window.print();
    });
  });
`;

if (!appJs.includes('GERADOR DE CRONOGRAMA DE ESTUDOS SEMANAL')) {
  appJs += '\n' + scheduleJsCode;
  fs.writeFileSync(appJsPath, appJs, 'utf8');
  console.log('✅ Lógica de Cronograma de Estudos inserida em src/app.js.');
}

console.log('--- Cronograma de Estudos Concluído com Sucesso ---');
