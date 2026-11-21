const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const newMaterialsHtml = `
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
              3 modelos prontos (Primeiro Emprego, Transição de Carreira e Profissional Experiente) para enviar por e-mail, LinkedIn ou anexar no Gupy.
            </p>
          </div>
          <ul class="text-[11px] space-y-1 text-slate-500 dark:text-slate-400 font-medium">
            <li class="flex items-center gap-1.5"><i data-lucide="check" class="w-3.5 h-3.5 text-blue-500"></i> Texto persuasivo com técnicas de storytelling</li>
            <li class="flex items-center gap-1.5"><i data-lucide="check" class="w-3.5 h-3.5 text-blue-500"></i> Campos editáveis destacados para preencher</li>
            <li class="flex items-center gap-1.5"><i data-lucide="check" class="w-3.5 h-3.5 text-blue-500"></i> Modelo recomendado por recrutadores</li>
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
            <li class="flex items-center gap-1.5"><i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500"></i> Abre no Excel, Google Planilhas e LibreOffice</li>
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

const jsDownloadHandlers = `
    // Download Material 5: Carta de Apresentação
    document.getElementById('btn-download-carta')?.addEventListener('click', () => {
      const docContent = \`<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>Modelos de Carta de Apresentação — Você Pode Tudo</title>
<style>
body { font-family: Calibri, Arial, sans-serif; line-height: 1.6; color: #333; margin: 40px; }
h1 { color: #002776; border-bottom: 2px solid #009639; padding-bottom: 8px; font-size: 20pt; }
h2 { color: #009639; margin-top: 24pt; font-size: 14pt; }
.box { background: #f8fafc; border-left: 4px solid #002776; padding: 12px; margin: 15px 0; }
.destaque { font-weight: bold; color: #002776; }
</style>
</head>
<body>
<h1>MODELOS DE CARTA DE APRESENTAÇÃO PROFISSIONAL</h1>
<p><em>Curadoria Oficial Você Pode Tudo (vocepodetudo.com)</em></p>

<h2>MODELO 1: PROFISSIONAL EM BUSCA DE RECOLOCAÇÃO / EXPERIENTE</h2>
<div class='box'>
<p>Prezada equipe de recrutamento da [Nome da Empresa],</p>
<p>Escrevo com grande entusiasmo para manifestar meu interesse na oportunidade de [Nome do Cargo], divulgada recentemente. Acompanho a trajetória da [Nome da Empresa] e me identifico plenamente com seus valores de inovação e excelência.</p>
<p>Com sólida vivência na área de [Sua Área], desenvolvi competências estratégicas em [Citar 2 ou 3 habilidades ou ferramentas principais]. Em minha última experiência na [Empresa Anterior], fui responsável por [Citar uma conquista real ou resultado mensurável, ex: otimizar processos em 20%].</p>
<p>Acredito que meu perfil proativo e foco em resultados agregará valor imediato à equipe. Meu currículo segue em anexo para apreciação e estou à disposição para uma entrevista.</p>
<p>Atenciosamente,<br><strong>[Seu Nome Completo]</strong><br>[Telefone com DDD] | [Seu E-mail] | [Link do LinkedIn]</p>
</div>

<h2>MODELO 2: PRIMEIRO EMPREGO / JOVEM APRENDIZ / ESTÁGIO</h2>
<div class='box'>
<p>Prezado(a) Gestor(a) de Recursos Humanos,</p>
<p>Meu nome é [Seu Nome], tenho [Sua Idade] anos e busco uma oportunidade para iniciar minha trajetória profissional na [Nome da Empresa] como [Jovem Aprendiz / Estagiário / Assistente].</p>
<p>Atualmente estou cursando [Seu Curso ou Ensino Médio] na instituição [Nome da Instituição]. Recentemente concluí os cursos de qualificação em [Nome dos Cursos Feitos, ex: Pacote Office, Informática, Atendimento ao Cliente], o que me proporcionou uma sólida base técnica e organização.</p>
<p>Destaco minha facilidade de aprendizado, pontualidade e vontade de crescer junto à empresa. Agradeço desde já pela atenção e oportunidade de participar do processo seletivo.</p>
<p>Cordialmente,<br><strong>[Seu Nome Completo]</strong><br>[Telefone com DDD] | [Seu E-mail]</p>
</div>

</body></html>\`;
      const blob = new Blob(['\\ufeff' + docContent], { type: 'application/msword;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'modelos-carta-de-apresentacao-vocepodetudo.doc';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    // Download Material 6: Cronograma de Estudos para Concursos
    document.getElementById('btn-download-cronograma')?.addEventListener('click', () => {
      const csvContent = \`DIA DA SEMANA;DISCIPLINA;TÓPICO / EDITAL;TEMPO PLANEJADO (MIN);TEMPO REAL (MIN);QUESTÕES RESOLVIDAS;ACERTOS (%);STATUS REVISÃO (24h/7d)
Segunda-feira;Língua Portuguesa;Interpretação de Texto & Sintaxe;90;90;25;88%;OK (24h)
Segunda-feira;Direito Constitucional;Direitos e Garantias Fundamentais;60;60;20;85%;Pendente
Terça-feira;Raciocínio Lógico-Matemático;Porcentagem & Proporcionalidade;90;80;30;80%;OK (24h)
Terça-feira;Informática;Segurança da Informação & Nuvem;60;60;15;93%;OK (24h)
Quarta-feira;Direito Administrativo;Atos Administrativos & Poderes;90;90;20;85%;Pendente
Quarta-feira;Conhecimentos Específicos;Legislação do Órgão / Atendimento;60;60;25;92%;OK (24h)
Quinta-feira;Língua Portuguesa;Crase, Concordância e Regência;90;90;30;86%;Pendente
Quinta-feira;Atualidades / Redação;Prática de Redação Dissertativa;60;60;1 Tema;100%;OK
Sexta-feira;Revisão Geral da Semana;Flashcards & Questões dos Erros;120;110;40;90%;OK (7d)
Sábado;Simulado Oficial;Prova Anterior Completa Cronometrada;240;230;70;84%;Revisar Erros
Domingo;Descanso Ativo;Revisão Leve ou Planejamento Semanal;60;60;0;-;Planejamento Pronto
\`;
      const blob = new Blob(['\\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'planilha-ciclo-estudos-concursos-vocepodetudo.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
`;

['downloads.html', 'materiais-gratuitos.html'].forEach(file => {
  const filePath = path.join(baseDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  if (!content.includes('id="btn-download-carta"')) {
    // Inserir os novos cards antes do fechamento do grid
    const gridEnd = '</div>\n\n    <!-- Bloco de AdSense Oficial';
    content = content.replace(gridEnd, newMaterialsHtml + '\n    ' + gridEnd);

    // Inserir os event listeners no script
    const scriptAnchor = "document.getElementById('btn-download-contrato')";
    content = content.replace(scriptAnchor, jsDownloadHandlers + '\n    ' + scriptAnchor);

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`[OK] Adicionados novos materiais em ${file}`);
  } else {
    console.log(`[INFO] ${file} já possuía os novos materiais.`);
  }
});
