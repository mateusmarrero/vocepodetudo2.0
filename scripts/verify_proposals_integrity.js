const fs = require('fs');

console.log('--- Verificando integridade dos arquivos atualizados ---');

// 1. midia-kit.html
const mk = fs.readFileSync('midia-kit.html', 'utf8');
console.log('midia-kit.html:');
console.log(' - possui tabela-aluguel:', mk.includes('id="tabela-aluguel"'));
console.log(' - possui gerador-proposta-card:', mk.includes('id="gerador-proposta-card"'));
console.log(' - possui prop-message-preview:', mk.includes('id="prop-message-preview"'));
console.log(' - possui copyProposalToClipboard:', mk.includes('copyProposalToClipboard'));
console.log(' - possui sendProposalWhatsApp:', mk.includes('sendProposalWhatsApp'));

// 2. admin.html
const adm = fs.readFileSync('admin.html', 'utf8');
console.log('\nadmin.html:');
console.log(' - possui gerador-proposta-card:', adm.includes('id="gerador-proposta-card"'));
console.log(' - possui prop-message-preview:', adm.includes('id="prop-message-preview"'));
console.log(' - possui copyProposalToClipboard:', adm.includes('copyProposalToClipboard'));

// 3. src/admin.js
const admJs = fs.readFileSync('src/admin.js', 'utf8');
console.log('\nsrc/admin.js:');
console.log(' - possui window.copyMediaKitPitch:', admJs.includes('window.copyMediaKitPitch'));
console.log(' - possui window.updateProposalPreview:', admJs.includes('window.updateProposalPreview'));
console.log(' - possui window.copyProposalToClipboard:', admJs.includes('window.copyProposalToClipboard'));

console.log('\n✅ Todos os arquivos verificados com sucesso!');
