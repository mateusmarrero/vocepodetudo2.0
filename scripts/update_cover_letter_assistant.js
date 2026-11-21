const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const cvHtmlPath = path.join(ROOT, 'curriculo.html');
const cvJsPath = path.join(ROOT, 'src', 'curriculo.js');

let cvHtml = fs.readFileSync(cvHtmlPath, 'utf8');
let cvJs = fs.readFileSync(cvJsPath, 'utf8');

console.log('--- Aprimorando Gerador de Carta & Mensagens para WhatsApp e LinkedIn ---');

// 1. Atualizar HTML do modal em curriculo.html
const targetHeader = `<div class="p-5 overflow-y-auto space-y-3 flex-1">
        <div class="flex items-center justify-between text-xs text-slate-500">
          <span>Você pode editar e personalizar o texto antes de copiar:</span>
          <span class="font-bold text-[#009639]">Formatada para e-mail ou anexo</span>
        </div>`;

const newTabsHeader = `<div class="p-5 overflow-y-auto space-y-3 flex-1">
        <!-- Seletor de Tipo de Apresentação -->
        <div class="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 text-xs font-bold flex-wrap">
          <button type="button" id="tab-cl-formal" class="cl-type-btn active flex-1 py-1.5 px-2.5 rounded-lg bg-white text-[#002776] shadow-xs cursor-pointer text-center font-black" onclick="window.cvApp.switchCoverLetterType('formal')">
            ✉️ Carta de E-mail
          </button>
          <button type="button" id="tab-cl-whatsapp" class="cl-type-btn flex-1 py-1.5 px-2.5 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer text-center font-bold" onclick="window.cvApp.switchCoverLetterType('whatsapp')">
            💬 WhatsApp Recrutador
          </button>
          <button type="button" id="tab-cl-linkedin" class="cl-type-btn flex-1 py-1.5 px-2.5 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer text-center font-bold" onclick="window.cvApp.switchCoverLetterType('linkedin')">
            🔗 Conexão LinkedIn
          </button>
        </div>

        <div class="flex items-center justify-between text-xs text-slate-500">
          <span>Você pode editar e personalizar o texto antes de copiar:</span>
          <span id="cl-type-indicator" class="font-bold text-[#009639]">Formatada para e-mail ou anexo</span>
        </div>`;

if (!cvHtml.includes('id="tab-cl-whatsapp"')) {
  cvHtml = cvHtml.replace(targetHeader, newTabsHeader);
  console.log('✅ Abas de tipo de mensagem inseridas no modal em curriculo.html.');
}

// Inserir botão de WhatsApp no rodapé do modal se ainda não existir
const targetFooterBtns = `<button 
            type="button" 
            id="btn-copy-cover-letter"`;

const newWaBtn = `<button 
            type="button" 
            id="btn-open-wa-cover-letter"
            class="px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            onclick="window.cvApp.shareCoverLetterOnWhatsApp()"
            title="Compartilhar ou enviar via WhatsApp"
          >
            <i data-lucide="message-circle" class="w-3.5 h-3.5 text-emerald-700"></i>
            <span>Enviar no WhatsApp</span>
          </button>\n          <button \n            type="button" \n            id="btn-copy-cover-letter"`;

if (!cvHtml.includes('id="btn-open-wa-cover-letter"')) {
  cvHtml = cvHtml.replace(targetFooterBtns, newWaBtn);
  console.log('✅ Botão de WhatsApp inserido no rodapé do modal.');
}

fs.writeFileSync(cvHtmlPath, cvHtml, 'utf8');

// 2. Atualizar src/curriculo.js com as novas funções
const targetGenerateFn = `  function generateCoverLetterText() {
    const nome = cvState.personal.fullName || '[Seu Nome]';
    const email = cvState.personal.email || '[Seu E-mail]';
    const telefone = cvState.personal.phone || '[Seu Telefone]';
    const cidade = cvState.personal.city || '';
    const uf = cvState.personal.state || '';
    const cargo = cvState.personal.targetJob || '[Cargo Pretendido]';
    const local = cidade ? (uf ? \`\${cidade} - \${uf}\` : cidade) : '';

    const expRecente = cvState.experiences && cvState.experiences.length > 0 ? cvState.experiences[0] : null;
    const formacaoRecente = cvState.education && cvState.education.length > 0 ? cvState.education[0] : null;
    const skillsList = cvState.skills && cvState.skills.length > 0 ? cvState.skills.slice(0, 5).join(', ') : '';

    let trechoExp = '';
    if (expRecente && expRecente.role && expRecente.company) {
      trechoExp = \`Com atuação profissional em empresas como a \${expRecente.company}, onde desempenhei o papel de \${expRecente.role}, desenvolvi sólido domínio em processos operacionais, foco em resultados e trabalho em equipe.\`;
    } else if (formacaoRecente && formacaoRecente.course) {
      trechoExp = \`Com formação em \${formacaoRecente.course} pela instituição \${formacaoRecente.institution || 'instituição de ensino'}, possuo sólida preparação teórica e prática, com foco em rápido aprendizado e dedicação total às metas da empresa.\`;
    } else {
      trechoExp = \`Possuo grande motivação para integrar a equipe, trazendo proatividade, facilidade para assimilar novos processos e dedicação rigorosa aos objetivos estratégicos da organização.\`;
    }

    const trechoSkills = skillsList 
      ? \`Entre as minhas principais competências profissionais, destaco: \${skillsList}.\` 
      : 'Possuo excelente comunicação interpessoal, facilidade para atuar sob metas e dedicação integral ao aprimoramento contínuo.';

    const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    return \`À Equipe de Recrutamento e Seleção,

Apresento meu currículo para apreciação à oportunidade de \${cargo}.

\${trechoExp}

\${trechoSkills}

Coloco-me à inteira disposição para participar de uma entrevista, onde poderei aprofundar meu histórico profissional e esclarecer como pretendo contribuir positivamente para os resultados da empresa.

Agradeço antecipadamente pela atenção.

Atenciosamente,

\${nome}
\${cargo}
Telefone: \${telefone}
E-mail: \${email}\`;
  }`;

const newGenerateFn = `  let currentCoverLetterType = 'formal';

  function generateCoverLetterText(type = 'formal') {
    const nome = cvState.personal.fullName || '[Seu Nome]';
    const email = cvState.personal.email || '[Seu E-mail]';
    const telefone = cvState.personal.phone || '[Seu Telefone]';
    const cargo = cvState.personal.targetJob || '[Cargo Pretendido]';
    const skillsList = cvState.skills && cvState.skills.length > 0 ? cvState.skills.slice(0, 4).join(', ') : '';
    const expRecente = cvState.experiences && cvState.experiences.length > 0 ? cvState.experiences[0] : null;

    if (type === 'whatsapp') {
      return \`Olá! Tudo bem? Me chamo \${nome}.

Vi a oportunidade para a vaga de \${cargo} e gostaria de me candidatar. \${expRecente && expRecente.role ? \`Tenho experiência como \${expRecente.role} e \` : ''}possuo facilidade com \${skillsList || 'trabalho em equipe e foco em resultados'}.

Meu currículo completo está em anexo em formato PDF. Fico à disposição para uma conversa!

Contato: \${telefone} | \${email}\`;
    }

    if (type === 'linkedin') {
      return \`Olá! Me chamo \${nome}. Acompanho o trabalho da sua empresa e gostaria de me conectar. Atuo na área de \${cargo}\${skillsList ? \`, com foco em \${skillsList}\` : ''}. Caso tenham oportunidades abertas, estou à disposição para conversar e compartilhar meu currículo. Um abraço!\`;
    }

    // Padrão Formal
    let trechoExp = '';
    if (expRecente && expRecente.role && expRecente.company) {
      trechoExp = \`Com atuação profissional em empresas como a \${expRecente.company}, onde desempenhei o papel de \${expRecente.role}, desenvolvi sólido domínio em processos operacionais, foco em resultados e trabalho em equipe.\`;
    } else {
      trechoExp = \`Possuo grande motivação para integrar a equipe, trazendo proatividade, facilidade para assimilar novos processos e dedicação rigorosa aos objetivos estratégicos da organização.\`;
    }

    const trechoSkills = skillsList 
      ? \`Entre as minhas principais competências profissionais, destaco: \${skillsList}.\` 
      : 'Possuo excelente comunicação interpessoal, facilidade para atuar sob metas e dedicação integral ao aprimoramento contínuo.';

    return \`À Equipe de Recrutamento e Seleção,

Apresento meu currículo para apreciação à oportunidade de \${cargo}.

\${trechoExp}

\${trechoSkills}

Coloco-me à inteira disposição para participar de uma entrevista, onde poderei aprofundar meu histórico profissional e esclarecer como pretendo contribuir positivamente para os resultados da empresa.

Agradeço antecipadamente pela atenção.

Atenciosamente,

\${nome}
\${cargo}
Telefone: \${telefone}
E-mail: \${email}\`;
  }

  function switchCoverLetterType(type) {
    currentCoverLetterType = type;
    const textarea = document.getElementById('cover-letter-text');
    const indicator = document.getElementById('cl-type-indicator');

    document.querySelectorAll('.cl-type-btn').forEach(b => {
      b.className = 'cl-type-btn flex-1 py-1.5 px-2.5 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer text-center font-bold';
    });

    const activeBtn = document.getElementById(\`tab-cl-\${type}\`);
    if (activeBtn) {
      activeBtn.className = 'cl-type-btn active flex-1 py-1.5 px-2.5 rounded-lg bg-white text-[#002776] shadow-xs cursor-pointer text-center font-black';
    }

    if (textarea) textarea.value = generateCoverLetterText(type);

    if (indicator) {
      if (type === 'whatsapp') indicator.textContent = 'Mensagem curta e amigável para envio direto no WhatsApp';
      else if (type === 'linkedin') indicator.textContent = 'Mensagem concisa para pedido de conexão no LinkedIn';
      else indicator.textContent = 'Formatada para e-mail formal ou anexo';
    }
  }

  function shareCoverLetterOnWhatsApp() {
    const textarea = document.getElementById('cover-letter-text');
    const text = textarea ? textarea.value : generateCoverLetterText('whatsapp');
    const encoded = encodeURIComponent(text);
    window.open(\`https://api.whatsapp.com/send?text=\${encoded}\`, '_blank');
  }`;

if (cvJs.includes('function generateCoverLetterText() {')) {
  cvJs = cvJs.replace(targetGenerateFn, newGenerateFn);
  console.log('✅ Funções generateCoverLetterText, switchCoverLetterType e shareCoverLetterOnWhatsApp adicionadas em src/curriculo.js.');
}

// Expor as funções no window.cvApp
const targetExports = `openCoverLetterModal,
    closeCoverLetterModal,
    copyCoverLetterText,
    downloadCoverLetterTxt,`;

const newExports = `openCoverLetterModal,
    closeCoverLetterModal,
    copyCoverLetterText,
    downloadCoverLetterTxt,
    switchCoverLetterType,
    shareCoverLetterOnWhatsApp,`;

if (!cvJs.includes('switchCoverLetterType,')) {
  cvJs = cvJs.replace(targetExports, newExports);
  console.log('✅ Novas funções expostas em window.cvApp.');
}

fs.writeFileSync(cvJsPath, cvJs, 'utf8');
console.log('--- Gerador de Carta & Mensagens Atualizado com Sucesso ---');
