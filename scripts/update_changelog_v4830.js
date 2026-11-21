const fs = require('fs');
const path = require('path');

const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
let content = fs.readFileSync(changelogPath, 'utf8');

const entry = `## [4.83.0] - 2026-11-14
### 🎨 Correção Estrutural de Filtros do Catálogo & Blindagem de Segurança (Fase P0)

- **Redesenho do Painel de Filtros Avançados (\`index.html\` & \`src/app.js\`):**
  - **Eliminação de sobreposição e quebra desordenada**: reorganizada a barra de filtros do catálogo em dois blocos hierárquicos integrados e responsivos.
  - **Bloco Superior (Pílulas de Certificado)**: linha horizontal dedicada para os filtros \`Todos os Cursos\`, \`✓ Somente Certificado Grátis\` e \`Modo Ouvinte (Gratuito)\` com \`whitespace-nowrap\`, eliminando colisão e quebras erráticas em telas de notebooks e desktops.
  - **Bloco Inferior (Filtros Dropdown em Grade)**: distribuição harmoniosa em 3 colunas (\`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3\`) para \`Órgão / Instituição\`, \`Duração\` e \`Ordenar por\`, com rótulos e ícones alinhados no topo de cada select.
  - **Preservação de Estado e Eventos**: mantidos rigorosamente os IDs originais e os handlers no \`src/app.js\`, assegurando filtragem em tempo real e acessibilidade via teclado.

- **Blindagem de Segurança e Integridade (Fase P0):**
  - **Anti-SSRF (\`api/config.php\` & \`api/courses.php\`)**: validação estrita com \`isSafePublicUrl()\` que resolve DNS e bloqueia loopback, localhost, redes privadas (RFC 1918) e metadados de nuvem (\`169.254.x.x\`). Desabilitado redirect cego e ativada verificação TLS.
  - **Anti-CSV Injection (\`api/config.php\` e endpoints)**: sanitização com \`sanitizeCsvField()\` em todas as exportações de dados administrativos (\`admin_students.php\`, \`resumes.php\`, \`newsletter.php\`, \`audit_logs.php\`, \`blog.php\`), neutralizando operadores de fórmula (\`=\`, \`+\`, \`-\`, \`@\`).
  - **Google OAuth Seguro (\`api/student.php\`)**: remoção de bypass não verificado, rejeitando qualquer token que não seja validado diretamente pela API do Google.
  - **LGPD (\`api/student.php\`)**: correção da query de exclusão de currículos (\`candidate_email\`), garantindo expurgo total dos dados pessoais.
  - **Gestão de Acesso (\`api/auth.php\`)**: remoção do bloco de criação estática do usuário \`visualizador\`.
  - **Proteção Web & Repositório (\`.htaccess\` & \`.gitignore\`)**: bloqueio no servidor para chaves de assinatura, backups e arquivos de log sensíveis.
  - **Suíte de Testes Automatizados**: criação de \`scripts/test_p0_security.js\` com 14 testes cobrindo todas as correções de P0, 100% aprovados.

---

`;

if (!content.includes('## [4.83.0]')) {
  content = content.replace('## [4.81.0]', entry + '## [4.81.0]');
  fs.writeFileSync(changelogPath, content, 'utf8');
  console.log('✅ CHANGELOG.md atualizado com sucesso para v4.83.0!');
} else {
  console.log('ℹ️ CHANGELOG.md já contém a versão v4.83.0.');
}
