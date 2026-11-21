const fs = require('fs');
const path = require('path');

const curriculoJsPath = path.join(__dirname, '..', 'src', 'curriculo.js');
let js = fs.readFileSync(curriculoJsPath, 'utf8');

const oldBlockStart = 'function generateCoverLetterText() {';
const oldBlockEndMarker = '// GERENCIAMENTO DE UPLOAD E RECORTE DE FOTO PROFISSIONAL';

const startIndex = js.indexOf(oldBlockStart);
const endIndex = js.indexOf(oldBlockEndMarker, startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.error('Bloco antigo não localizado em src/curriculo.js');
  process.exit(1);
}

const newBlock = `let currentCoverLetterType = 'formal';

  function generateCoverLetterText(type = currentCoverLetterType) {
    const c = state.curriculo || {};
    const nome = c.nome ? c.nome.trim() : 'Candidato';
    const cargo = c.cargoDesejado ? c.cargoDesejado.trim() : (c.objetivoProfissional ? c.objetivoProfissional.trim() : 'Oportunidade Profissional');
    const cidade = (c.cidade && c.estado) ? \`\${c.cidade} - \${c.estado}\` : (c.cidade || 'Brasil');
    const email = c.email || '';
    const telefone = c.telefone || '';
    const resumo = c.resumoProfissional ? c.resumoProfissional.trim() : '';

    const skillsText = (c.habilidades && c.habilidades.length > 0) 
      ? c.habilidades.slice(0, 5).join(', ') 
      : 'comunicação assertiva, foco em resultados e colaboração em equipe';

    const cursosText = (c.cursos && c.cursos.length > 0)
      ? c.cursos.slice(0, 3).map(k => \`\${k.nome} (\${k.instituicao})\`).join(', ')
      : '';

    const expRecente = (c.experiencias && c.experiencias.length > 0) ? c.experiencias[0] : null;

    let corpoExp = '';
    if (expRecente && expRecente.cargo) {
      corpoExp = \`Em minha atuação como \${expRecente.cargo} na empresa \${expRecente.empresa || 'empresa de referência'}, desenvolvi competências sólidas e compromisso com entregas de qualidade. \`;
    }

    let corpoCursos = '';
    if (cursosText) {
      corpoCursos = \`Buscando aperfeiçoamento constante, realizei qualificações em: \${cursosText}. \`;
    }

    const hoje = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

    // 1. Mensagem para WhatsApp do Recrutador
    if (type === 'whatsapp') {
      return \`Olá! Tudo bem? Me chamo \${nome}.

Vi a oportunidade aberta para a posição de *\${cargo}* e gostaria muito de me apresentar.

📌 *Resumo do Perfil:*
\${resumo ? '• ' + resumo.substring(0, 180) + '...' : '• Profissional dedicado com foco em aprendizado rápido e resultados.'}
• Competências: \${skillsText}
\${corpoExp ? '• ' + corpoExp.trim() : ''}

Estou anexando meu currículo completo em PDF para sua avaliação e fico à disposição para uma conversa.

Muito obrigado(a) pela atenção!
\${nome}
📱 \${telefone}
✉️ \${email}\`;
    }

    // 2. Abordagem para Conexão / Mensagem LinkedIn
    if (type === 'linkedin') {
      return \`Olá! Espero que este momento o(a) encontre bem.

Acompanho sua trajetória e o trabalho exemplar de sua organização. Gostaria de me conectar para acompanhar novidades na área de \${cargo}.

Tenho dedicado minha atuação e estudos a \${skillsText}\${cursosText ? ' e certificações em ' + cursosText : ''}. Acredito que posso somar à equipe com entusiasmo, proatividade e entrega de valor.

Será uma honra fazer parte da sua rede profissional.

Um abraço cordial,
\${nome}\`;
    }

    // 3. Modelo Oficial de Carta de Recomendação
    if (type === 'recommendation') {
      return \`\${cidade}, \${hoje}

CARTA DE RECOMENDAÇÃO PROFISSIONAL

A quem possa interessar,

É com satisfação que apresento esta carta de recomendação em favor de \${nome}, portador(a) dos contatos informados abaixo, que atuou com excelência e dedicação na função de \${expRecente && expRecente.cargo ? expRecente.cargo : cargo}.

Durante o período em que convivemos profissionalmente, \${nome} demonstrou elevado senso de responsabilidade, pontualidade, facilidade de trabalho em equipe e rápida curva de aprendizado, destacando-se em competências como: \${skillsText}.

\${corpoExp}Seu comprometimento com o autoaperfeiçoamento e integridade profissional o(a) credenciam como um(a) colaborador(a) de valor para qualquer organização que busque qualidade e dedicação.

Portanto, recomendo seus serviços e postura profissional com total convicção, colocando-me à disposição para prestar esclarecimentos adicionais se necessário.

Atenciosamente,

[Nome do Gestor / Recomendante]
[Cargo / Empresa / Telefone de Contato]

Candidato(a) Recomendado(a):
\${nome} - \${cargo}
E-mail: \${email} | Telefone: \${telefone}\`;
    }

    // 4. Carta Formal Padrão (E-mail / Anexo Oficial)
    return \`\${cidade}, \${hoje}

À Equipe de Recrutamento & Seleção,

Assunto: Candidatura à posição de \${cargo}

Prezados(as) Senhores(as),

Apresento meu currículo para expressar meu grande interesse em integrar sua equipe na função de \${cargo}. Acredito que meu perfil profissional, dedicação e facilidade de adaptação podem contribuir diretamente com o alcance das metas da organização.

\${resumo ? resumo + '\\n\\n' : ''}\${corpoExp}\${corpoCursos}Possuo facilidade para atuar com \${skillsText}, buscando sempre qualidade, responsabilidade e foco no trabalho em equipe.

Coloco-me à disposição para uma entrevista e agradeço antecipadamente pela oportunidade e atenção.

Atenciosamente,

\${nome}
\${cargo}
Telefone: \${telefone}
E-mail: \${email}\`;
  }

  function switchCoverLetterType(type) {
    currentCoverLetterType = type;
    const btnIds = {
      'formal': 'tab-cl-formal',
      'whatsapp': 'tab-cl-whatsapp',
      'linkedin': 'tab-cl-linkedin',
      'recommendation': 'tab-cl-recommendation'
    };

    const indicators = {
      'formal': 'Formatada para e-mail profissional ou anexo oficial',
      'whatsapp': 'Mensagem direta e objetiva para envio no WhatsApp',
      'linkedin': 'Pitch de abordagem para conexão no LinkedIn',
      'recommendation': 'Modelo timbrado para impressão ou envio a recrutador'
    };

    Object.keys(btnIds).forEach(k => {
      const btn = document.getElementById(btnIds[k]);
      if (btn) {
        if (k === type) {
          btn.className = 'cl-type-btn active flex-1 py-1.5 px-2.5 rounded-lg bg-white text-[#002776] shadow-xs cursor-pointer text-center font-black';
        } else {
          btn.className = 'cl-type-btn flex-1 py-1.5 px-2.5 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer text-center font-bold';
        }
      }
    });

    const indicator = document.getElementById('cl-type-indicator');
    if (indicator && indicators[type]) {
      indicator.textContent = indicators[type];
    }

    const textarea = document.getElementById('cover-letter-text');
    if (textarea) {
      textarea.value = generateCoverLetterText(type);
    }
  }

  function openCoverLetterModal() {
    const modal = document.getElementById('cover-letter-modal');
    if (!modal) return;
    switchCoverLetterType(currentCoverLetterType || 'formal');
    modal.classList.remove('hidden');
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function closeCoverLetterModal() {
    const modal = document.getElementById('cover-letter-modal');
    if (modal) modal.classList.add('hidden');
  }

  function copyCoverLetterText() {
    const textarea = document.getElementById('cover-letter-text');
    const btn = document.getElementById('btn-copy-cover-letter');
    if (!textarea) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textarea.value).then(() => {
        if (btn) {
          const oldHtml = btn.innerHTML;
          btn.innerHTML = \`<i data-lucide="check" class="w-3.5 h-3.5"></i><span>Copiada!</span>\`;
          if (window.lucide) window.lucide.createIcons();
          setTimeout(() => {
            btn.innerHTML = oldHtml;
            if (window.lucide) window.lucide.createIcons();
          }, 2500);
        }
      }).catch(() => {
        fallbackCopy(textarea);
      });
    } else {
      fallbackCopy(textarea);
    }
  }

  function fallbackCopy(textarea) {
    textarea.select();
    document.execCommand('copy');
    alert('Texto da carta copiado para a área de transferência!');
  }

  function downloadCoverLetterTxt() {
    const textarea = document.getElementById('cover-letter-text');
    if (!textarea) return;
    const nome = sanitizeFilename(state.curriculo.nome || 'Carta_Apresentacao');
    const blob = new Blob([textarea.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`Carta_\${currentCoverLetterType}_\${nome}.txt\`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function downloadCoverLetterPdf() {
    const textarea = document.getElementById('cover-letter-text');
    if (!textarea) return;
    const textContent = textarea.value || '';
    const nome = sanitizeFilename(state.curriculo.nome || 'Profissional');
    const tituloDoc = currentCoverLetterType === 'recommendation' ? 'CARTA DE RECOMENDAÇÃO' : 'CARTA DE APRESENTAÇÃO';

    // Seletor ou fallback de biblioteca html2pdf
    if (typeof window.html2pdf === 'undefined') {
      alert('Biblioteca de PDF indisponível no momento. Use a opção Baixar .TXT.');
      return;
    }

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '210mm';
    container.style.padding = '20mm 20mm 20mm 20mm';
    container.style.background = '#ffffff';
    container.style.color = '#1e293b';
    container.style.fontFamily = "'Inter', Arial, sans-serif";
    container.style.fontSize = '12pt';
    container.style.lineHeight = '1.6';
    container.style.boxSizing = 'border-box';

    const paragraphs = textContent.split('\\n').map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '<div style="height: 10px;"></div>';
      return \`<p style="margin: 0 0 12px 0; text-align: justify; word-break: break-word;">\${escapeHtml(trimmed)}</p>\`;
    }).join('');

    container.innerHTML = \`
      <div style="border-bottom: 2px solid #002776; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h1 style="font-size: 16pt; font-weight: 800; color: #002776; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">\${tituloDoc}</h1>
          <p style="font-size: 9pt; color: #64748b; margin: 4px 0 0 0; font-weight: 600;">PORTAL VOCÊ PODE TUDO • QUALIFICAÇÃO & EMPREGABILIDADE</p>
        </div>
        <div style="font-size: 8pt; color: #94a3b8; text-align: right; font-weight: bold;">
          DOC OFICIAL<br>A4 FORMAT
        </div>
      </div>
      <div style="min-height: 220mm;">
        \${paragraphs}
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 20px; font-size: 8pt; color: #94a3b8; text-align: center;">
        Documento gerado gratuitamente pelo Portal Você Pode Tudo (vocepodetudo.com) — Formato A4
      </div>
    \`;

    document.body.appendChild(container);

    const opt = {
      margin: 0,
      filename: \`\${tituloDoc.replace(/\\s+/g, '_')}_\${nome}.pdf\`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    window.html2pdf().set(opt).from(container).save().then(() => {
      container.remove();
    }).catch(err => {
      console.error('Erro ao gerar PDF da carta:', err);
      container.remove();
      alert('Não foi possível gerar o PDF. Recomendamos copiar o texto ou baixar em .TXT.');
    });
  }

  `;

js = js.substring(0, startIndex) + newBlock + js.substring(endIndex);

// Atualizar exportação em window.cvApp
const windowCvAppIdx = js.lastIndexOf('window.cvApp = {');
if (windowCvAppIdx !== -1) {
  if (!js.includes('switchCoverLetterType,')) {
    const targetExport = 'downloadCoverLetterTxt,';
    const replacementExport = 'downloadCoverLetterTxt,\n    switchCoverLetterType,\n    downloadCoverLetterPdf,';
    js = js.replace(targetExport, replacementExport);
    console.log('✅ Métodos switchCoverLetterType e downloadCoverLetterPdf exportados em window.cvApp');
  }
}

fs.writeFileSync(curriculoJsPath, js, 'utf8');
console.log('✅ src/curriculo.js atualizado com sucesso.');
