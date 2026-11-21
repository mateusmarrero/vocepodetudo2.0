const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const NEW_VER = '4.63.0';

console.log(`--- Iniciando Bump de Versão para v${NEW_VER} ---`);

const files = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));

let updatedCount = 0;
for (const file of files) {
  const filePath = path.join(ROOT_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  content = content.replace(/\?v=\d+\.\d+\.\d+/g, `?v=${NEW_VER}`);

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    updatedCount++;
    console.log(`✅ Cache busting atualizado para v=${NEW_VER} em: ${file}`);
  }
}

// Atualizar sw.js
const swPath = path.join(ROOT_DIR, 'sw.js');
if (fs.existsSync(swPath)) {
  let sw = fs.readFileSync(swPath, 'utf8');
  sw = sw.replace(/const CACHE_NAME = 'vocepodetudo-pwa-v\d+\.\d+\.\d+';/, `const CACHE_NAME = 'vocepodetudo-pwa-v${NEW_VER}';`);
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log(`✅ Service Worker CACHE_NAME atualizado para v=${NEW_VER}`);
}

// Atualizar CHANGELOG.md
const changelogPath = path.join(ROOT_DIR, 'CHANGELOG.md');
if (fs.existsSync(changelogPath)) {
  let cl = fs.readFileSync(changelogPath, 'utf8');
  const today = new Date().toISOString().split('T')[0];
  const newEntry = `## [4.63.0] - ${today}
### Adicionado
- **Gerador de Cronograma de Estudos Semanal (index.html / app.js):** Planejador personalizado por área (Tecnologia, Gestão, Saúde, Inglês, Concursos e Carreira), metas diárias ajustáveis (15min a 2h), checklist com salvamento automático no LocalStorage, barra de progresso em tempo real e opção de impressão em folha A4 / PDF.
- **Comparador CLT vs. PJ (calculadora-trabalhista.html / calculadora.js):** Nova calculadora inteligente com cálculo de equivalência salarial, consideração de benefícios mensais, 13º salário, férias + 1/3, FGTS, impostos de pessoa jurídica (Simples Nacional) e veredito financeiro comparativo em tempo real.
- **Assistente de Apresentação & Mensagens (curriculo.html / curriculo.js):** Expansão do gerador de cartas com modos dedicados: Carta Formal de E-mail, Mensagem Curta para WhatsApp do Recrutador, Mensagem de Conexão LinkedIn e botão direto de envio via WhatsApp.

### Verificado
- **Validação Completa de Funcionalidade:** Suíte de 25 testes do Criador de Currículo aprovada com 100% de sucesso, validação sintática estrita em todos os scripts JavaScript e PHP 8.3, navegação e menus responsivos preservados.

`;
  cl = cl.replace('# Changelog\n', '# Changelog\n\n' + newEntry);
  fs.writeFileSync(changelogPath, cl, 'utf8');
  console.log(`✅ CHANGELOG.md atualizado com as notas da v${NEW_VER}`);
}

console.log(`\n🎉 Concluído! ${updatedCount} arquivos HTML e Service Worker atualizados para v${NEW_VER}.`);
