const fs = require('fs');
const path = require('path');

const curriculoHtmlPath = path.join(__dirname, '..', 'curriculo.html');
let html = fs.readFileSync(curriculoHtmlPath, 'utf8');

// 1. Adicionar aba de Recomendação
if (!html.includes('id="tab-cl-recommendation"')) {
  const linkedinBtn = 'id="tab-cl-linkedin"';
  const linkedinIdx = html.indexOf(linkedinBtn);
  if (linkedinIdx !== -1) {
    const btnEndIdx = html.indexOf('</button>', linkedinIdx);
    if (btnEndIdx !== -1) {
      const insertion = `\n          <button type="button" id="tab-cl-recommendation" class="cl-type-btn flex-1 py-1.5 px-2.5 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer text-center font-bold" onclick="window.cvApp.switchCoverLetterType('recommendation')">\n            📜 Carta de Recomendação\n          </button>`;
      html = html.substring(0, btnEndIdx + 9) + insertion + html.substring(btnEndIdx + 9);
      console.log('✅ Aba Carta de Recomendação inserida em curriculo.html');
    }
  }
}

// 2. Adicionar botão Baixar PDF
if (!html.includes('id="btn-download-cover-letter-pdf"')) {
  const txtBtn = 'onclick="window.cvApp.downloadCoverLetterTxt()"';
  const txtIdx = html.indexOf(txtBtn);
  if (txtIdx !== -1) {
    const btnEndIdx = html.indexOf('</button>', txtIdx);
    if (btnEndIdx !== -1) {
      const pdfBtn = `\n          <button type="button" id="btn-download-cover-letter-pdf" class="px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs" onclick="window.cvApp.downloadCoverLetterPdf()" title="Baixar carta em formato PDF A4 pronto para impressão">\n            <i data-lucide="file-down" class="w-3.5 h-3.5"></i>\n            <span>Baixar PDF</span>\n          </button>`;
      html = html.substring(0, btnEndIdx + 9) + pdfBtn + html.substring(btnEndIdx + 9);
      console.log('✅ Botão Baixar PDF inserido em curriculo.html');
    }
  }
}

fs.writeFileSync(curriculoHtmlPath, html, 'utf8');
console.log('curriculo.html atualizado.');
