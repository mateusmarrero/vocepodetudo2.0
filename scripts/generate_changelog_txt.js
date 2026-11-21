const fs = require('fs');
const path = require('path');

const changelogMd = fs.readFileSync('CHANGELOG.md', 'utf8');

const header = `================================================================================
                    PORTAL VOCÊ PODE TUDO (vocepodetudo.com)
                  HISTÓRICO COMPLETO DE DESENVOLVIMENTO (CHANGELOG)
                           Todas as Versões: v1.0.0 a v4.81.0
================================================================================
Data de Emissão: 14 de Novembro de 2026
Ambiente Oficial: vocepodetudo.com (Apache / PHP 8.3 / MySQL / StackCP)
Arquitetura: Frontend Responsivo (Tailwind CSS, Lucide Icons) + Backend Resiliente
================================================================================

RESUMO CONSOLIDADO DO ECOSSISTEMA:
--------------------------------------------------------------------------------
• Cursos Gratuitos Oficiais Catalogados: 200 cursos ativos com certificados livres
• Modelos de Currículo Profissional ATS: 12 modelos visuais (A4 real)
• Suíte de Testes Automatizada: 25 de 25 testes aprovados (test_curriculo.js)
• Ferramentas Gratuitas Ativas: 6 ferramentas de retenção e empregabilidade
• Artigos Editoriais Publicados: 80+ artigos detalhados no Blog
• Páginas HTML Integradas: 24 páginas com suporte a PWA e Dark Mode
• Total de Releases Documentados: 44 versões
• Conformidade de Segurança: LGPD (Lei 13.709/2018), Brand Safety Tier 1 e CSP

================================================================================
CRONOLOGIA DOS GRANDES MARCOS E FASES:
================================================================================

[FASE 1: FUNDAÇÃO, CATÁLOGO BASE & INFRAESTRUTURA (v1.0.0 a v3.5.0)]
--------------------------------------------------------------------------------
- Lançamento oficial do Portal Você Pode Tudo como hub aberto de capacitação profissional.
- Catalogação de 155 cursos livres gratuitos de grandes instituições parceiras:
  Fundação Bradesco, EV.G/Enap, Sebrae, USP, Microsoft, Cisco e Hackers do Bem.
- Estruturação das 8 Trilhas Guiadas de Carreira (TI, Gestão, Primeiro Emprego, etc.).
- Conexão direta com banco de dados MySQL na hospedagem ServerByte/StackCP.
- Autenticação com criptografia de ponta (PASSWORD_BCRYPT com custo 12).
- Ferramentas de contingência e recuperação: test_db.php, setup.php, reset_admin.php.
- Suporte à acessibilidade: Integração com VLibras e barra de alto contraste visual.
- Rolagem suave progressiva (infinite scroll) para navegação fluida em smartphones.
- Telemetria de audiência via Web Beacon seguro GET, mapeando acessos de estados e países.

[FASE 2: PWA, ÁREA DO ALUNO & BLINDAGEM DE SEGURANÇA (v4.0.0 a v4.15.0)]
--------------------------------------------------------------------------------
- Transformação em Progressive Web App (PWA): Service Worker (sw.js) resiliente.
- Ícones de alta resolução (icon-192.png, icon-512.png) e manifest.json configurado.
- Sistema de Área do Aluno com cadastro e login de estudantes (api/student.php).
- Campo de telefone celular obrigatório para alertas e oportunidades de emprego.
- Recursos de favoritar cursos e rastrear progresso individual.
- Políticas de privacidade e termos de uso em conformidade estrita com a LGPD.
- Automação de deploy via FTP com script dedicado em lote (scripts/deploy_ftp.js).

[FASE 3: HUB DE EMPREGABILIDADE, VAGAS & BLOG (v4.16.0 a v4.45.0)]
--------------------------------------------------------------------------------
- Lançamento do Mural Oficial de Vagas de Emprego (vagas.html):
  Filtros avançados por cidade, modalidade (Home Office, Híbrido, Presencial) e nível.
  Página nichada: vagas-jovem-aprendiz-2026.html.
- Blog Editorial de Empregabilidade (blog.html e artigo.php):
  Mais de 80 artigos profundos com SEO on-page, Open Graph e Schema.org Article.
- Calculadoras Trabalhistas CLT vs PJ (calculadora-trabalhista.html):
  Salário Líquido (INSS e IRRF 2026), Rescisão de Contrato, Férias, 13º, Horas Extras
  e Seguro-Desemprego.
- Teste Vocacional e Aptidão Profissional (teste-vocacional.html):
  Questionário com recomendações de cursos e ranking de áreas no painel administrativo.
- Central de Downloads Gratuitos (downloads.html):
  Modelos de currículo em Word, planilhas financeiras e cartilhas profissionais.

[FASE 4: CRIADOR DE CURRÍCULOS ATS & INTELIGÊNCIA ARTIFICIAL (v4.46.0 a v4.65.0)]
--------------------------------------------------------------------------------
- Criador Profissional de Currículos (curriculo.html):
  12 modelos visuais projetados para alta conversão em softwares de triagem (ATS).
  Exportação em PDF real A4 mantendo proporções sem quebra de seções.
  Assistente local de escrita e pontuação operando 100% offline.
  Suíte de testes automatizados com 25 testes mandatórios aprovados.
- Simulador de Entrevistas com Inteligência Artificial (simulador-entrevista.html):
  Treinamento interativo com simulação de perguntas reais de RH e pontuação instantânea.
- Auditoria de segurança e performance: blindagem contra XSS, política AdSense
  e otimização de tempo de carregamento com defer de scripts.

[FASE 5: EXPANSÃO PARA 200 CURSOS & CARDS POP-OUT (v4.66.0 a v4.79.0)]
--------------------------------------------------------------------------------
- Expansão do catálogo oficial atingindo a marca de 200 cursos ativos com certificado.
- Inclusão das áreas de Estética, Beleza, Saúde, Bem-Estar e Cuidados Pessoais.
- Expansão dinâmica dos cards de cursos via motor src/data/course_details.js.
- Formato Super Compacto e Accordion Exclusivo: apenas 1 card expandido por vez na tela.
- Efeito Pop-Out Tridimensional: elevação do card ativo com translateY(-8px),
  scale(1.02), z-index 30 e sombra profunda shadow-2xl.
- Isolamento total de grade: impedimento de esticamento nos cards vizinhos.

[FASE 6: MÍDIA KIT COMPLETO, DOSSIÊ & ALUGUEL DE ESPAÇOS (v4.80.0 a v4.81.0)]
--------------------------------------------------------------------------------
- Criação da página pública oficial do Mídia Kit (midia-kit.html e rota /midia-kit).
- Big Numbers e métricas auditadas em tempo real via telemetria direta do servidor.
- Perfil qualificado da audiência: faixas etárias, gênero, penetração mobile (78%)
  e top estados brasileiros.
- Tabela de Aluguel de Espaços de Propaganda com preços transparentes:
  * Super Leaderboard Topo: R$ 850,00/mês
  * Card Patrocinado Nativo In-Feed: R$ 650,00/mês
  * Half-Page Lateral no Blog: R$ 750,00/mês
  * Naming Rights do Criador de Currículos (+ Selo no PDF): R$ 1.500,00/mês
  * Patrocínio do Simulador de Entrevistas IA: R$ 1.200,00/mês
  * Patrocínio da Calculadora CLT/PJ: R$ 700,00/mês
  * Disparo de Push Notification para Alunos: R$ 450,00/envio
  * Publieditorial Permanente Dofollow: R$ 1.250,00 (único/vitalício)
- Gerador Dinâmico e Rápido de Proposta Comercial interativo com cálculo automático,
  descontos por período (10%, 15%, 25%) e botões de envio para WhatsApp e E-mail.
- Dossiê Timbrado para Impressão e PDF com regras @media print no padrão A4 corporativo.
- Inclusão do link "Mídia Kit & Publicidade" no rodapé de todas as 24 páginas HTML.
- Exportação enriquecida de dados em planilha Excel (.CSV) via api/analytics.php.

================================================================================
REGISTRO DETALHADO VERSÃO POR VERSÃO (DO CHANGELOG OFICIAL):
================================================================================
`;

// Limpar tags markdown para texto puro
let textBody = changelogMd
  .replace(/^# /gm, '================================================================================\n')
  .replace(/^## /gm, '\n--------------------------------------------------------------------------------\nVERSÃO ')
  .replace(/^### /gm, '\n• ')
  .replace(/\*\*(.*?)\*\*/g, '$1')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  .replace(/---/g, '--------------------------------------------------------------------------------');

const fullTxt = header + '\n' + textBody + `\n
================================================================================
FIM DO DOCUMENTO — PORTAL VOCÊ PODE TUDO OFICIAL (vocepodetudo.com)
================================================================================
`;

const outputPath = 'CHANGELOG_COMPLETO_VOCEPODETUDO.txt';
fs.writeFileSync(outputPath, fullTxt, 'utf8');

// Também copiar para a pasta de artefatos para fácil acesso
const artifactPath = 'C:\\Users\\usuario\\.gemini\\antigravity\\brain\\fb4d587b-7761-4998-b197-12547ebe42b0\\CHANGELOG_COMPLETO_VOCEPODETUDO.txt';
fs.writeFileSync(artifactPath, fullTxt, 'utf8');

console.log(`✅ Arquivo .txt gerado com sucesso em:`);
console.log(`- ${outputPath} (${fullTxt.length} caracteres)`);
console.log(`- ${artifactPath}`);
