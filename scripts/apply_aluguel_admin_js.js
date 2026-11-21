const fs = require('fs');

let adminJs = fs.readFileSync('src/admin.js', 'utf8');

const jsProposalFunctions = `
  // ==============================================================================
  // GERADOR DINÂMICO DE PROPOSTA COMERCIAL & ALUGUEL DE ESPAÇOS (MÍDIA KIT)
  // ==============================================================================
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
        if (typeof showToast === 'function') showToast('Apresentação rápida (pitch) copiada para a área de transferência!', 'success');
        else alert('Apresentação rápida copiada!');
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
        if (typeof showToast === 'function') showToast('Proposta comercial copiada com sucesso! Pronto para colar no WhatsApp ou E-mail.', 'success');
        else alert('Proposta copiada com sucesso!');
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
`;

if (!adminJs.includes('window.copyMediaKitPitch')) {
  // Inserir antes do último fechamento de });
  const lastIndex = adminJs.lastIndexOf('  });');
  if (lastIndex !== -1) {
    adminJs = adminJs.slice(0, lastIndex) + jsProposalFunctions + '\n    window.updateProposalPreview();\n' + adminJs.slice(lastIndex);
    fs.writeFileSync('src/admin.js', adminJs, 'utf8');
    console.log('✅ Funções de Proposta Comercial adicionadas em src/admin.js!');
  } else {
    adminJs += jsProposalFunctions;
    fs.writeFileSync('src/admin.js', adminJs, 'utf8');
    console.log('✅ Funções adicionadas ao final de src/admin.js!');
  }
} else {
  console.log('Funções já existem em src/admin.js');
}
