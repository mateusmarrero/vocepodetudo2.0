const fs = require('fs');
const path = require('path');

const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
let content = fs.readFileSync(changelogPath, 'utf8');

const newEntry = `## [4.77.0] - 2026-11-13
### 📚 Expansão Dinâmica dos Cards de Cursos com Informações Ricas (Ementa, Pré-requisitos e Certificação)

- **Motor Central de Ementas e Detalhes Ricos (\`src/data/course_details.js\`):**
  - Mapeamento universal cobrindo os 200 cursos catalogados nas 8 áreas do portal.
  - Estrutura rica em 5 eixos essenciais:
    - **Ementa Estruturada (\`syllabus\`):** 3 a 5 módulos detalhados por curso com tópicos práticos e competências adquiridas.
    - **Pré-requisitos e Público-Alvo (\`prerequisites\`):** Escolaridade mínima, faixa etária recomendada e dispositivos de acesso.
    - **Metodologia de Ensino & Critério de Aprovação (\`methodology\`):** Formato 100% online, ritmo autoinstrucional e pontuação mínima para certificação (60% para cursos federais/MEC/EV.G e 70% para Sebrae/Bradesco).
    - **Certificação Gratuita e Válida (\`certification\`):** Emissão digital sem custos com código verificador de autenticidade / QR Code, válido em todo o Brasil (LDB e horas complementares MEC).
    - **Destaque no Currículo (\`resumeTips\`):** Sugestão prática de inclusão no currículo, palavras-chave para robôs ATS (Gupy / LinkedIn) e botão de cópia com um clique.

- **Interface do Aluno e Interatividade In-Place (\`src/app.js\` & \`src/style.css\`):**
  - Botão interativo *"🔍 Ver Ementa e Detalhes"* com ícone chevron animado (rotação suave de 180°).
  - Expansão dinâmica suave diretamente no card (in-place accordion) sem necessidade de pop-up ou redirecionamento de tela.
  - Prevenção de propagação de clique (\`stopPropagation\`) para isolar botões de favoritar, leitor de áudio TTS e link oficial de matrícula externa.
  - Acessibilidade total via teclado (\`Enter\` e \`Barra de Espaço\`) e suporte nativo a leitores de tela com \`aria-expanded\` e \`aria-controls\`.
  - Design responsivo otimizado para celulares e desktops com total integração ao Dark Mode.

- **Garantia de Qualidade & Testes Aprovados:**
  - 100% de conformidade validada em todos os 200 cursos (\`node scripts/test_course_details.js\`).
  - Suíte de 25 testes do Criador de Currículos 100% aprovada (\`node scripts/test_curriculo.js\`).
  - Testes automatizados em navegador real via Edge Headless CDP com 6/6 cenários aprovados (\`node scripts/test_card_expansion_cdp.js\`).

---

`;

if (!content.includes('[4.77.0]')) {
  content = content.replace('## [4.76.0] - 2026-11-13', newEntry + '## [4.76.0] - 2026-11-13');
  fs.writeFileSync(changelogPath, content, 'utf8');
  console.log('CHANGELOG.md atualizado para v4.77.0 com sucesso!');
} else {
  console.log('CHANGELOG.md já contém a versão 4.77.0.');
}
