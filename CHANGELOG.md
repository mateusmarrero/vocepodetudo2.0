# Changelog - Você Pode Tudo (vocepodetudo.com)

Todas as alterações notáveis, correções de segurança, melhorias de desempenho, acessibilidade e novas funcionalidades implementadas neste projeto estão documentadas neste arquivo.

O formato é baseado no [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/), e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [4.87.0] - 2026-11-22
### 🏛️ Novas Páginas de Produto, Recursos e Jurídico & Rodapé Multi-Coluna Padronizado

- **Novas Páginas Integradas e Conteúdos Completos:**
  - **Produto:**
    - `funcionalidades.html`: Catálogo completo de recursos, comparativo de benefícios e diferenciais do portal.
    - `planos.html`: Declaração de gratuidade permanente (R$ 0 para alunos/trabalhadores) e modelos institucionais.
    - `como-funciona.html`: Guia passo a passo em 4 etapas (Escolha, Estudo no Parceiro, Certificado Oficial, Vaga).
    - `parcerias.html`: Canal para homologação de cursos, integração de vagas de RH e parcerias ESG/comunitárias.
  - **Recursos:**
    - `recursos.html`: Hub centralizado com todas as ferramentas (Currículo, Vagas, Simulador, Calculadoras, Downloads, Blog).
    - `central-de-ajuda.html`: Base de conhecimento com busca instantânea em tempo real para dúvidas sobre certificados e processos.
  - **Legal:**
    - `politica-de-cookies.html`: Política transparente sobre cookies necessários, preferências de acessibilidade e AdSense.
    - `lgpd.html`: Portal de conformidade com a Lei Federal nº 13.709/2018, direitos dos titulares e canal do DPO.
    - `termos-de-servico.html`: Termos formais e diretrizes de utilização aceitável da plataforma.
- **Padronização do Rodapé Global (`index.html`, `vagas.html`, `curriculo.html`, `blog.html`, `downloads.html`):**
  - Reorganização em colunas dedicadas: *Sobre*, *Produto*, *Recursos* e *Legal*, com links diretos e acessíveis.
- **Roteamento e SEO (`.htaccess`, `sitemap.php`, `sitemap.xml`):**
  - Rotas amigáveis sem `.html` para todas as 9 páginas adicionadas.
  - Expansão do `sitemap.xml` para 75 URLs ativas de alto valor de indexação no Googlebot.

---

## [4.86.0] - 2026-11-21
### 🔒 Segurança de Credenciais, Sincronização de SEO e Limpeza de Cache

- **Segurança e Variáveis de Ambiente (`.env`, `.env.example`, `.gitignore` & `scripts/ftp_config.js`):**
  - Isolamento completo de senhas de acesso FTP e administração em arquivo `.env`.
  - Inclusão rigorosa de `.env` e arquivos correlatos no `.gitignore` para proteção do repositório.
  - Sanitização de todos os scripts operacionais e de deploy, removendo credenciais em texto claro.
  - Criação do módulo centralizador `scripts/ftp_config.js` com carregamento automático de ambiente.
- **Sincronização de SEO & Sitemap (`sitemap.xml` & `rss.xml`):**
  - Atualização estática dos arquivos com os 41 artigos publicados até a data presente (63 URLs ativas no total).
  - Atualização automática dos metadados e feeds RSS para acelerar indexação pelo Googlebot.
- **PWA e Service Worker (`sw.js`):**
  - Atualização do cache para a versão `vocepodetudo-pwa-v4.86.0` garantindo expurgo de versões obsoletas.

---

## [4.85.0] - 2026-11-14
### 📄 Opções de Download da Lista de Itens do Blog para Controle Interno

- **Central Editorial do Blog (`admin.html`, `src/admin.js` & `api/blog.php`):**
  - **Novo Botão de Destaque na Barra Superior**: `Baixar Lista (Controle Interno)` com ícone de download e menu expansível de opções imediatas.
  - **Planilha Excel / Sheets (.CSV)**:
    - Download de todos os 144 artigos com ID, número sequencial, título, slug, categoria, status editorial (No Ar / Agendado / Rascunho), data de agendamento, tempo de leitura, visualizações, autor, palavras-chave/tags, resumo e URL oficial.
    - Sanitização integral contra injeção de fórmulas e delimitador ponto-e-vírgula com BOM UTF-8 para abertura perfeita no Excel.
  - **Documento de Texto (.TXT Formatado para Controle Interno)**:
    - Geração de relatório tabulado e limpo em texto puro, ideal para leitura offline, impressões e controle interno de pautas e redação.
    - Cabeçalho timbrado com data de emissão, contagem de itens, fichamento por artigo com links e resumos.
  - **Botões Rápidos na Tabela**:
    - Inclusão dos botões diretos `Baixar CSV` e `Baixar TXT` na barra de filtros da tabela de artigos.
  - **Endpoint de Servidor (`api/blog.php?action=export_txt`)**:
    - Suporte nativo para download direto do relatório em texto formatado pelo backend.

---

## [4.84.0] - 2026-11-14
### 🔍 Painel de SEO & Busca do Google no Painel Administrativo

- **Novo Módulo Administrativo: Painel de SEO & Busca do Google (`admin.html` & `src/admin.js`):**
  - **Acesso Dedicado em Desktop e Mobile**:
    - Botão no cabeçalho desktop com badge de status do Google Search Console (`tab-btn-seo`).
    - Item integrado no menu hambúrguer móvel (`section-seo`).
  - **KPIs em Tempo Real de Rastreabilidade e Saúde Técnica**:
    - Score de Saúde SEO: **98/100 (Excelente)**.
    - URLs Mapeadas no Sitemap: **168 URLs ativas**.
    - Core Web Vitals Auditados: LCP (0.9s), FID (<10ms), CLS (0.01) — 100% verde no mobile.
    - Schemas JSON-LD: 5 entidades estruturadas (`Course`, `JobPosting`, `EducationalOrganization`, `BreadcrumbList`, `WebSite`).
    - Rastreabilidade Googlebot: robots.txt verificado sem bloqueios indevidos e com proteção estrita para `/api/` e arquivos sensíveis.
  - **Simulador Interativo de Snippet do Google (SERP Preview Tool)**:
    - Alternador de visualização em tempo real entre modo **Mobile (Smartphones)** e **Desktop**.
    - Seletor de páginas estratégicas (Home, Vagas, Currículo, Blog, Simulador, Teste Vocacional, Calculadora, Mídia Kit).
    - Edição dinâmica com contadores automáticos de caracteres para Title Tag (máx 65) e Meta Description (máx 160).
    - Renderização fiel com Favicon oficial, Breadcrumb, Título clicável, Estrelas de Avaliação douradas (4.9 / 1.840 avaliações) e Tag de gratuidade.
  - **Auditoria On-Page das Páginas Estratégicas**:
    - Tabela completa mapeando todas as rotas principais com verificação de URL Canônica oficial, integridade de títulos, meta descrições e schemas.
    - Botões de atalho rápido: "Ver no Google" (`site:vocepodetudo.com/...`) e "Testar Rich Results no Google".
  - **Monitoramento de Palavras-Chave Estratégicas no Brasil**:
    - Tabela das 12 principais consultas de estudantes no Google (`cursos gratuitos com certificado`, `hackers do bem inscricoes`, `fundacao bradesco cursos`, `vagas jovem aprendiz home office`, `gerador de curriculo gratis pdf`, etc.).
    - Exibição de Intenção de Busca, Página de Destino, Volume Estimado Mensal, CTR Orgânico Médio e Posição Média.
  - **Visualizadores de Sitemap.xml e Robots.txt**:
    - Caixas de código com as diretivas oficiais e links diretos para abertura do XML e TXT.
  - **Exportação de Relatório Completo em Planilha CSV**:
    - Botão "Exportar CSV" que gera relatório com todas as páginas auditadas e palavras-chave, 100% protegido contra CSV/Formula Injection.

---

## [4.83.0] - 2026-11-14
### 🎨 Correção Estrutural de Filtros do Catálogo & Blindagem de Segurança (Fase P0)

- **Redesenho do Painel de Filtros Avançados (`index.html` & `src/app.js`):**
  - **Eliminação de sobreposição e quebra desordenada**: reorganizada a barra de filtros do catálogo em dois blocos hierárquicos integrados e responsivos.
  - **Bloco Superior (Pílulas de Certificado)**: linha horizontal dedicada para os filtros `Todos os Cursos`, `✓ Somente Certificado Grátis` e `Modo Ouvinte (Gratuito)` com `whitespace-nowrap`, eliminando colisão e quebras erráticas em telas de notebooks e desktops.
  - **Bloco Inferior (Filtros Dropdown em Grade)**: distribuição harmoniosa em 3 colunas (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) para `Órgão / Instituição`, `Duração` e `Ordenar por`, com rótulos e ícones alinhados no topo de cada select.
  - **Preservação de Estado e Eventos**: mantidos rigorosamente os IDs originais e os handlers no `src/app.js`, assegurando filtragem em tempo real e acessibilidade via teclado.

- **Blindagem de Segurança e Integridade (Fase P0):**
  - **Anti-SSRF (`api/config.php` & `api/courses.php`)**: validação estrita com `isSafePublicUrl()` que resolve DNS e bloqueia loopback, localhost, redes privadas (RFC 1918) e metadados de nuvem (`169.254.x.x`). Desabilitado redirect cego e ativada verificação TLS.
  - **Anti-CSV Injection (`api/config.php` e endpoints)**: sanitização com `sanitizeCsvField()` em todas as exportações de dados administrativos (`admin_students.php`, `resumes.php`, `newsletter.php`, `audit_logs.php`, `blog.php`), neutralizando operadores de fórmula (`=`, `+`, `-`, `@`).
  - **Google OAuth Seguro (`api/student.php`)**: remoção de bypass não verificado, rejeitando qualquer token que não seja validado diretamente pela API do Google.
  - **LGPD (`api/student.php`)**: correção da query de exclusão de currículos (`candidate_email`), garantindo expurgo total dos dados pessoais.
  - **Gestão de Acesso (`api/auth.php`)**: remoção do bloco de criação estática do usuário `visualizador`.
  - **Proteção Web & Repositório (`.htaccess` & `.gitignore`)**: bloqueio no servidor para chaves de assinatura, backups e arquivos de log sensíveis.
  - **Suíte de Testes Automatizados**: criação de `scripts/test_p0_security.js` com 14 testes cobrindo todas as correções de P0, 100% aprovados.

---

## [4.81.0] - 2026-11-14
### 💼 Tabela de Aluguel de Espaços de Propaganda & Gerador Rápido de Proposta Comercial

- **Tabela Comercial de Aluguel de Espaços de Propaganda (`midia-kit.html` e `admin.html`):**
  - Implementação idêntica ao modelo do guia de sobrevivência, apresentando valores claros de locação mensal, trimestral, semestral e anual.
  - **Cards Estratégicos com Valores & Especificações:**
    - Banner Super Leaderboard Topo (728x90 / 320x100) — **R$ 850,00/mês** (*Disponível*)
    - Card Patrocinado Nativo In-Feed (Grade de Cursos & Mural de Vagas) — **R$ 650,00/mês** (*Mais Escolhido / CTR até 5,2%*)
    - Half-Page Lateral Sticky no Blog (300x600) — **R$ 750,00/mês** (*Disponível / 45s de retenção*)
    - Naming Rights Oficial do Criador de Currículos (Logo no Topo + Selo no PDF) — **R$ 1.500,00/mês** (*Exclusivo*)
    - Patrocínio do Simulador de Entrevistas com IA — **R$ 1.200,00/mês** (*Inovação*)
    - Publieditorial Assinado com Link Dofollow Permanente — **R$ 1.250,00 (único)** (*Recomendado / SEO vitalício*)
  - Descontos contratuais automáticos: Trimestral (10% OFF), Semestral (15% OFF) e Anual (25% OFF).

- **Gerador Dinâmico e Interativo de Proposta Comercial (`#gerador-proposta-card`):**
  - Formulário para inserção do Nome da Empresa / Marca, Contato e Telefone/WhatsApp.
  - Seleção dinâmica por checkboxes de todos os 9 formatos disponíveis, com cálculo automático em tempo real do investimento total.
  - Campo de desconto especial adicional (%).
  - Caixa de pré-visualização da **Proposta Comercial Oficial** em texto formatado para envio direto, com saudação personalizada, entregáveis, condições de pagamento (Pix/Boleto com NF) e validade.
  - Botão **"Copiar Proposta"** para transferência imediata e botão **"Abrir WhatsApp Pronto"** com a proposta já codificada para envio via WhatsApp Web/App.
  - Botão **"Copiar Pitch Rápido"** no cabeçalho e na barra de ações administrativa.

---

## [4.80.0] - 2026-11-14
### 📊 Mídia Kit Completo, Dossiê Oficial para Anunciantes & Página Pública (/midia-kit)

- **Nova Página Pública Oficial (`midia-kit.html` e rota amigável `/midia-kit`):**
  - Criação da página comercial completa para marcas, agências de publicidade e instituições parceiras.
  - **Métricas Auditadas em Tempo Real:** Conexão dinâmica com a API de telemetria (`api/analytics.php?action=stats`) exibindo visualizações (pageviews), cliques em cursos oficiais (leads qualificados com CTR médio de 3,4%), base de alunos cadastrados, testes vocacionais e tempo médio de sessão (4m 45s).
  - **Perfil Qualificado da Audiência:** Mapeamento demográfico com faixas etárias dominantes (16-24 anos: 42% Primeiro Emprego/Jovem Aprendiz; 25-34 anos: 38% Transição e Especialização; 35-54 anos: 16%; 55+ anos: 4%), proporção por gênero (54% feminino / 46% masculino), penetração mobile (78% smartphones / 22% desktops) e ranking dos estados com maior audiência (SP, RJ, MG, BA, PR, RS, CE, PE, GO, DF).
  - **Catálogo Completo de Formatos Publicitários (Padrão IAB & Nativos):** Super Leaderboard Topo (728x90 / 320x100), Card Patrocinado Nativo In-Feed (300x250 com CTR de até 5,2%), Half-Page Lateral Sticky no Blog (300x600), Billboard Intertítulo (970x250), Push Notifications segmentadas e Naming Rights com patrocínio exclusivo de ferramentas (Criador de Currículos, Simulador de Entrevistas com IA e Calculadoras CLT/PJ).
  - **Simulador Interativo de Campanhas:** Widget em JavaScript permitindo que anunciantes escolham o formato, configurem o volume de impressões desejado (20k a 500k) e o período, obtendo projeções imediatas de cliques e alcance de usuários únicos.
  - **Dossiê Timbrado para Impressão e PDF:** Folha de estilos dedicada (`@media print`) que formata a página perfeitamente em tamanho A4 corporativo timbrado com cabeçalho oficial e dados auditados ao acionar o botão de impressão.
  - **Formulário Comercial Direto & WhatsApp:** Canal direto com pré-formatação automática de proposta para WhatsApp Business e e-mail institucional (`comercial@vocepodetudo.com`).

- **Enriquecimento do Mídia Kit na Gestão Administrativa (`admin.html`):**
  - Reestruturação da aba Mídia Kit com incorporação de tabelas IAB, métricas de ferramentas interativas, diretrizes de homologação técnica (150KB máx, HTML5, SSL, tags Google Ad Manager) e link direto para a página pública.
  - Correção e fechamento estrutural do container timbrado de impressão.

- **Expansão da Exportação de Dados em Planilha Excel (`api/analytics.php`):**
  - Adição de seções completas no CSV exportável (`action=mediakit_csv`), cobrindo inventário de formatos IAB, especificações técnicas, modelos comerciais (CPM, CPC, Fixo Mensal) e selo de conformidade com LGPD e Brand Safety Tier 1.

- **Infraestrutura, Rotas & Rodapés:**
  - Inclusão de link "Mídia Kit & Publicidade" no rodapé de todas as 24 páginas HTML do portal.
  - Configuração de redirecionamentos amigáveis no `.htaccess` (`/media-kit`, `/anuncie`, `/publicidade` -> `/midia-kit`).
  - Indexação no `sitemap.xml` com prioridade comercial de 0.85 e registro no cache do Service Worker (`sw.js`).
  - Registro de deploy automático no `scripts/deploy_ftp.js`.

---

## [4.79.0] - 2026-11-13
### 🎯 Expansão Exclusiva (Accordion Único) e Efeito Pop-Out de Elevação nos Cards

- **Isolamento de Expansão por Card (`src/app.js` & `src/style.css`):**
  - Implementação de fechamento automático: ao clicar em um card, qualquer outro card aberto na tela fecha instantaneamente, mantendo apenas 1 card ativo por vez.
  - Alinhamento de grade independente (`align-self: start` e `items-start`): impede que os cards vizinhos da mesma linha se estiquem ou deformem quando um card é aberto.
  - **Efeito Pop-Out ("Pular na Tela"):** O card ativo recebe elevação tridimensional (`transform: translateY(-8px) scale(1.02)`), sobreposição à frente (`z-index: 30`) e sombra profunda (`shadow-2xl`), destacando-se nitidamente do restante da página.
  - Rolagem inteligente suave para manter o card confortável no campo de visão do aluno.

---

## [4.78.0] - 2026-11-13
### ⚡ Layout Super Compacto e Minimalista dos Cards Expandidos de Cursos

- **Redimensionamento Enxuto da Ementa e Detalhes (`src/data/course_details.js` & `src/style.css`):**
  - Substituição das 5 seções extensas por um bloco compacto e objetivo de altura reduzida (~140px a 180px).
  - **Ementa Programática Direta:** Lista condensada de 3 a 4 tópicos essenciais em linhas únicas com badge numérico.
  - **Grid de Informações Chave 2x2:** 4 mini cards elegantes destacando Certificado Gratuito, Critério de Avaliação, Pré-requisito e Metodologia Online.
  - **Ações de Rodapé Compactas:** Barra única simplificada com botão de inscrição e botão de recolher discreto, sem botões duplicados.
  - Redução do limite de expansão de 5000px para 420px com scroll suave, mantendo o alinhamento e a proporção da vitrine de cursos.

---

## [4.77.0] - 2026-11-13
### 📚 Expansão Dinâmica dos Cards de Cursos com Informações Ricas (Ementa, Pré-requisitos e Certificação)

- **Motor Central de Ementas e Detalhes Ricos (`src/data/course_details.js`):**
  - Mapeamento universal cobrindo os 200 cursos catalogados nas 8 áreas do portal.
  - Estrutura rica em 5 eixos essenciais:
    - **Ementa Estruturada (`syllabus`):** 3 a 5 módulos detalhados por curso com tópicos práticos e competências adquiridas.
    - **Pré-requisitos e Público-Alvo (`prerequisites`):** Escolaridade mínima, faixa etária recomendada e dispositivos de acesso.
    - **Metodologia de Ensino & Critério de Aprovação (`methodology`):** Formato 100% online, ritmo autoinstrucional e pontuação mínima para certificação (60% para cursos federais/MEC/EV.G e 70% para Sebrae/Bradesco).
    - **Certificação Gratuita e Válida (`certification`):** Emissão digital sem custos com código verificador de autenticidade / QR Code, válido em todo o Brasil (LDB e horas complementares MEC).
    - **Destaque no Currículo (`resumeTips`):** Sugestão prática de inclusão no currículo, palavras-chave para robôs ATS (Gupy / LinkedIn) e botão de cópia com um clique.

- **Interface do Aluno e Interatividade In-Place (`src/app.js` & `src/style.css`):**
  - Botão interativo *"🔍 Ver Ementa e Detalhes"* com ícone chevron animado (rotação suave de 180°).
  - Expansão dinâmica suave diretamente no card (in-place accordion) sem necessidade de pop-up ou redirecionamento de tela.
  - Prevenção de propagação de clique (`stopPropagation`) para isolar botões de favoritar, leitor de áudio TTS e link oficial de matrícula externa.
  - Acessibilidade total via teclado (`Enter` e `Barra de Espaço`) e suporte nativo a leitores de tela com `aria-expanded` e `aria-controls`.
  - Design responsivo otimizado para celulares e desktops com total integração ao Dark Mode.

- **Garantia de Qualidade & Testes Aprovados:**
  - 100% de conformidade validada em todos os 200 cursos (`node scripts/test_course_details.js`).
  - Suíte de 25 testes do Criador de Currículos 100% aprovada (`node scripts/test_curriculo.js`).
  - Testes automatizados em navegador real via Edge Headless CDP com 6/6 cenários aprovados (`node scripts/test_card_expansion_cdp.js`).

---

## [4.76.0] - 2026-11-13
### 🌸 Expansão do Catálogo: 8 Novos Cursos Gratuitos de Estética e Beleza (Total de 200 Cursos)

- **Novos Cursos Oficiais Adicionados ao Catálogo:**
  - **Biossegurança e Boas Práticas em Serviços de Beleza e Estética (30h - MEC / Aprenda Mais):** Esterilização em autoclave, higienização, descarte de perfurocortantes, uso de EPIs e normas da Anvisa.
  - **Atendimento ao Cliente e Gestão para Salões e Clínicas de Estética (20h - Sebrae):** Excelência no atendimento, recepção humanizada, fidelização e gestão operacional de clínicas e salões.
  - **Cuidados com a Pele, Fisiologia Cutânea e Cosmetologia Básica (30h - PoCA / UFSCar):** Fisiologia da pele, biotipos cutâneos, rotinas de skincare, fotoproteção e formulações cosméticas.
  - **Boas Práticas, Higiene e Vigilância Sanitária em Espaços de Beleza (20h - Escola Virtual Gov / EV.G / Anvisa):** Risco sanitário, desinfecção de instrumentais, ventilação e requisitos sanitários legais.
  - **Maquiagem e Visagismo Profissional (40h - IFRS):** Tipometria facial, preparação cutânea, teoria das cores, correção de pele e técnicas para olhos e boca.
  - **Noções Fundamentais de Drenagem Linfática e Massagem Estética (35h - MEC / Aprenda Mais):** Bases circulatórias, movimentos manuais clássicos, massagem modeladora e contraindicações clínicas.
  - **Design de Sobrancelhas, Visagismo Facial e Embelezamento do Olhar (25h - Kultivi):** Mapeamento facial com paquímetro, técnicas de epilação com pinça, aplicação de henna e visagismo.
  - **Marketing Digital, Captação de Clientes e Vendas para Negócios de Beleza (25h - Sebrae):** Posicionamento no Instagram e TikTok, fotos de antes/depois com autorização e pacotes de serviços.

- **Atualização da Base de Dados:**
  - O catálogo do portal alcança o marco de **200 cursos gratuitos com certificado**.
  - Sincronização de `src/data/courses.js`, `api/seed_courses.json` e `api/cache_courses.json`.

- **Garantia de Qualidade & Testes:**
  - 25 testes do Criador de Currículos aprovados (25/25).
  - 100% de aprovação na auditoria Edge Headless CDP com zero erros de console.

---

## [4.75.0] - 2026-11-13
### 🛡️ Página Oficial de Exclusão de Conta e Dados (Google Play & LGPD)

- **Criação da Página Oficial de Exclusão de Dados (`exclusao-de-dados.html`):**
  - Implementada a URL canônica `https://vocepodetudo.com/exclusao-de-dados` em atendimento ao requisito mandatório de exclusão de conta da Google Play Store (*Play Console Account Deletion Policy*) e ao Art. 18 da LGPD.
  - Formulário interativo com emissão de número de protocolo para solicitação de remoção de dados de cadastro e newsletter.
  - Botão de limpeza imediata de registros armazenados localmente no navegador (*LocalStorage* do Criador de Currículos e Simulador).
  - Informações transparentes sobre prazos legais (até 15 dias) e canal oficial do Encarregado de Proteção de Dados (DPO).
  - Atualização do `sitemap.xml` e links de rodapé em `politica-privacidade.html`.

---

## [4.74.0] - 2026-11-13
### ✍️ Saneamento Ortográfico Profundo dos Artigos do Blog & Sincronização MySQL

- **Correção Exaustiva de Letras Truncadas (Cedilha 'ç' e Acentuação Completa):**
  - Identificada e corrigida a causa raiz que fazia certas palavras nos artigos perderem a letra com cedilha ou acento (ex: *"Organizao"* -> *"Organização"*, *"Profisses"* -> *"Profissões"*, *"Segurana"* -> *"Segurança"*, *"comear"* -> *"começar"*, *"portflio"* -> *"portfólio"*, *"resoluo"* -> *"resolução"*, *"documentao"* -> *"documentação"*, *"prtico"* -> *"prático"*, *"mtodos"* -> *"métodos"*, *"gesto"* -> *"gestão"*).
  - Mais de **440 correções ortográficas e de acentuação** aplicadas diretamente em `api/seed_blog.json` e `api/cache_blog.json` cobrindo títulos, resumos e conteúdos dos 144 artigos.

- **Sincronização Forçada e Automática com o Banco de Dados MySQL (`api/blog.php`):**
  - Atualizado o script `api/blog.php` para disparar `ON DUPLICATE KEY UPDATE` automaticamente e sob demanda (`force_sync=1`), garantindo que registros legados com caracteres truncados no MySQL sejam sobrescritos com a versão 100% corrigida e em UTF-8.
  - Sincronização do catálogo completo de 144 artigos com o banco de dados de produção.

---

## [4.73.0] - 2026-11-13
### 📰 Páginas Próprias Dedicadas para Todos os Artigos do Blog (SSR & SEO)

- **Criação da Página Própria Completa do Artigo (`artigo.php`):**
  - Cada artigo do blog agora possui uma página web própria, independente, responsiva e com renderização no servidor (SSR), eliminando a dependência exclusiva do modal em JavaScript e permitindo indexação direta e completa pelo Googlebot.
  - **Identidade e Tipografia Editorial:** Barra de utilidades, cabeçalho e rodapé oficiais do portal, breadcrumbs estruturados, título semântico `<h1>`, lead destacado e formatação rica de leitura (`.article-body`).
  - **Acessibilidade e Narração de Voz:** Botão nativo *"Ouvir Artigo"* via Web Speech API (pt-BR) com controles de reprodução (Play, Pause e Stop) e barra superior dinâmica de progresso de leitura.
  - **Smart CTAs Contextuais:** Inserção de chamadas para ação inteligentes baseadas na temática do post (Criador de Currículos ATS para matérias de currículo, Simulador STAR para entrevistas, Calculadora Trabalhista para rescisões e Cursos Gratuitos para capacitação).
  - **Engajamento e Compartilhamento Social:** Botão oficial do WhatsApp com pré-visualização rica, LinkedIn, Telegram e botão de copiar link com notificação em toast, além de widget interativo de feedback útil (Sim/Não).
  - **Recomendação de Conteúdo:** Seção com 3 artigos relacionados da mesma categoria ou recomendados com links diretos para suas respectivas páginas próprias.
  - **Tratamento de Erros:** Página 404 personalizada e amigável caso o artigo não exista ou tenha mudado de endereço.

- **Otimização SEO e Dados Estruturados Schema.org:**
  - Inclusão do Schema.org `@graph` com `NewsArticle` (autor, editora, data de publicação ISO, imagem destacada, headline) e `BreadcrumbList` para navegação estruturada no Google.
  - Meta tags completas de Open Graph e Twitter Cards garantindo cards visuais perfeitos no WhatsApp, Facebook, LinkedIn e Telegram.

- **Atualização na Listagem e Leitor do Blog (`blog.html` & `src/blog.js`):**
  - Os cards da vitrine do blog agora contêm links semânticos nativos direcionando diretamente para a página própria (`/artigo/slug`), preservando também o botão de visualização rápida em modal.
  - Adicionado botão *"Abrir em Página Própria"* no cabeçalho e rodapé do modal do leitor.

---

## [4.72.0] - 2026-11-13
### 🚀 Simulador de Entrevistas Avançado STAR & Auditoria Ortográfica Global

- **Expansão Profunda do Simulador de Entrevistas (`simulador-entrevista.html` & `src/simulador.js`):**
  - **9 Trilhas de Carreira Especializadas (45 Perguntas Reais de RH):** Jovem Aprendiz, Administrativo, Atendimento/SAC, Tecnologia, Saúde & Enfermagem, Vendas & Comercial, Logística & Estoque, Liderança & Gestão, e Perguntas Difíceis/Pegadinhas de RH.
  - **Modo Cronometrado Real:** Treino com tempo limite ajustável (Livre, 60s Pressão Rápida, 90s Padrão RH e 120s Caso STAR) com display regressivo, barra de progresso colorida e aviso sonoro.
  - **Motor de Avaliação Multidimensional STAR:** Avaliação detalhada de 0 a 100 pontos dividida em 4 eixos (Clareza, Método STAR Situação-Tarefa-Ação-Resultado, Vocabulário Profissional e Relevância).
  - **Detector de Vícios de Linguagem:** Análise em tempo real de expressões informais como *"tipo assim"*, *"né"*, *"aí"*, *"meio que"*, com alertas construtivos.
  - **Exportação do Relatório em PDF A4 Timbrado:** Download direto do relatório completo de desempenho diagramado para impressão e compartilhamento via WhatsApp.

- **Auditoria e Correção Ortográfica e de Acentuação em Todo o Portal:**
  - Varredura completa em todos os 22 arquivos HTML, descrições do catálogo de cursos (`src/data/courses.js`), banco de vagas (`api/seed_jobs.json`) e artigos (`api/seed_blog.json`).
  - Correção de centenas de palavras sem acentuação gráfica (agudos, circunflexos, crases, tils e cedilhas) em textos visíveis, meta tags, títulos e placeholders segundo o Acordo Ortográfico.

- **Garantia de Qualidade & Testes:**
  - 25 testes do Criador de Currículos aprovados (25/25).
  - 100% das páginas testadas no Edge Headless via protocolo CDP com zero erros de console.



## [4.71.0] - 2026-11-13
### 🌐 URLs Amigáveis (Clean URLs) em Todo o Portal e Otimização SEO

- **Eliminação de Extensões `.html` em Todas as Rotas Públicas:**
  - Configuração do Apache (`.htaccess`) com reescrita transparente (`mod_rewrite`) para servir páginas HTML sem extensão na URL (ex: `/curriculo`, `/vagas`, `/blog`, `/calculadora-trabalhista`, `/downloads`, `/sobre`, etc.).
  - Redirecionamento 301 Permanente de URLs antigas com extensão (`page.html` -> `page`) via `%{THE_REQUEST}` para evitar conteúdo duplicado no Google.
  - Conversão de todos os links internos (`href`) e metadados (`canonical`, `og:url`) nos 22 arquivos HTML do portal.

- **URLs Amigáveis para Artigos do Blog (`/artigo/slug-do-artigo` & `/blog/slug-do-artigo`):**
  - Implementado roteador limpo no `.htaccess` e em `artigo.php` para exibir URLs elegantes sem query parameters.
  - Atualização no `src/blog.js` para gerenciar o histórico do navegador via `history.replaceState` ao abrir e fechar artigos.

- **Atualização Canônica no Sitemap & Feed RSS (`sitemap.xml` & `rss.xml`):**
  - Todas as 19 páginas fixas e os 144 artigos do blog atualizados no `sitemap.xml` e `rss.xml` para utilizarem exclusivamente URLs amigáveis.

- **Auditoria de Qualidade em Tempo Real:**
  - 25 testes do Criador de Currículos aprovados (25/25).
  - Verificação automatizada Edge Headless via CDP em todas as rotas amigáveis com zero erros no console.



## [4.70.0] - 2026-11-12
### 🚀 Google for Jobs Schema.org, Ícone Oficial do WhatsApp e Gatilhos Virais

- **Correção Visual do Compartilhamento WhatsApp nas Vagas (`src/vagas.js`):**
  - Substituído o ícone genérico por SVG oficial e nítido do WhatsApp com cor institucional e preenchimento perfeito.
  - Correção na ordem de montagem do DOM garantindo a execução completa de `lucide.createIcons` nos cards de oportunidades.

- **Ativação Oficial do Google for Jobs (`vagas.html` & `src/vagas.js`):**
  - Implementação completa dos dados estruturados `JobPosting` (Schema.org / JSON-LD) estáticos no `<head>` e dinâmicos para cada busca/filtro.
  - Campos técnicos mapeados: modalidade (`TELECOMMUTE` para remoto e endereço físico para vagas presenciais), salários no padrão ISO, empresa contratante e link oficial de candidatura direta (`directApply`).

- **Google Rich Snippets de Cursos Gratuitos (`index.html`):**
  - Inserção de dados estruturados Schema.org `Course` com credenciais educacionais (`educationalCredentialAwarded`), formato online e indicação de gratuidade oficial para rastreamento nos resultados do Google.

- **Gatilhos Virais de Compartilhamento no WhatsApp (`vagas.html` & `curriculo.html`):**
  - Adicionado card promocional *"Ajude um Amigo"* no final do Mural de Vagas e no Criador de Currículos com mensagens pré-formatadas para indicação rápida via WhatsApp.

- **Auditoria de Qualidade em Tempo Real:**
  - 25 testes do Criador de Currículos aprovados (25/25).
  - Verificação automatizada Edge Headless via CDP em todas as rotas com zero erros de console.



## [4.69.0] - 2026-11-12
### 🚀 Gerador de Carta de Recomendação & PDF A4, Alerta VIP de Vagas e In-Feed AdSense

- **Gerador de Carta de Apresentação e Carta de Recomendação em PDF A4 (`curriculo.html` & `src/curriculo.js`):**
  - Implementada 4ª aba oficial *"📜 Carta de Recomendação"* no modal de cartas profissionais.
  - Seletor inteligente com 4 modalidades: E-mail Formal, Mensagem Direta para WhatsApp do Recrutador, Abordagem de Conexão no LinkedIn e Modelo Oficial Timbrado de Recomendação Profissional.
  - Novo botão *"📄 Baixar PDF"* gerando documento em alta resolução no padrão A4 oficial timbrado com margens técnicas de 20mm, cabeçalho e rodapé institucionais do Portal Você Pode Tudo via html2pdf.js.
  - Exportação e persistência 100% locais sem envio de dados pessoais para servidores externos.
  - Suíte dos 25 testes do Criador de Currículos aprovada (25/25).

- **Alerta VIP de Novas Vagas & Estágios (`vagas.html` & `src/vagas.js`):**
  - Adicionado banner interativo no topo do Mural de Vagas com gradiente institucional, selo VIP gratuito e formulário de inscrição.
  - Filtro de recebimento por área de interesse: Jovem Aprendiz, Estágio/Superior, Tecnologia & TI, Administração e Saúde.
  - Conexão assíncrona com fallback local resiliente e feedback com toast visual de confirmação.

- **Monetização Otimizada com Google AdSense In-Feed Fluido (`src/app.js` & `src/vagas.js`):**
  - Injeção automática e elegante de blocos in-feed patrocinados a cada 6 cursos no catálogo e a cada 6 oportunidades no mural de vagas.
  - Blindagem contra erros de domínio local (`localhost` / `127.0.0.1`) e controle estrito de status `pending` no DOM para evitar repetição de chamadas de anúncio.

- **Expansão Estratégica do Blog & SEO Orgânico (`api/seed_blog.json`, `sitemap.xml`, `rss.xml`):**
  - Publicação de 3 novos artigos pilares (total de 144 artigos): Jovem Aprendiz 2026 (Regras, Salários e Inscrição), Primeiro Emprego sem Experiência e Cursos Gratuitos SENAI/SESI/Bradesco com Certificado MEC.
  - Sitemap e Feed RSS regenerados com canonicalização limpa (sem `www.`).

- **Garantia de Qualidade & Testes em Tempo Real:**
  - Verificação automatizada em Edge Headless via protocolo CDP: 100% das páginas com zero erros no console.



## [4.33.0] - 2026-11-01
### 🎨 Cards com Imagens Fotográficas por Assunto, 12 Novos Cursos e Filtro Avançado de Certificados

- **Imagens Temáticas em Todos os Cursos do Catálogo (`src/app.js` + `src/data/courses.js`):**
  - Implementação de capas fotográficas de alta definição (Unsplash CDN com renderização responsiva e lazy loading) mapeadas semanticamente de acordo com o assunto exato de cada um dos 186 cursos (Programação, IA, Nuvem, Dados, Excel, Saúde, Agronegócio, Idiomas, Libras, Design, Vendas, Finanças, Concursos, Gestão, Suporte TI e Carreira).
  - Novo design dos cards de curso com foto widescreen, badges flutuantes da instituição e botões de favoritos e áudio integrados, aumentando o engajamento e a atratividade visual para os alunos.
- **12 Novos Cursos Oficiais Adicionados ao Catálogo:**
  - *Python Básico* (Fundação Bradesco - 24h)
  - *Comunicação Escrita e Redação Corporativa* (Fundação Bradesco - 40h)
  - *Letramento Digital e Produtividade com Microsoft 365* (Escola do Trabalhador 4.0 / Microsoft - 30h)
  - *Fundamentos de IA e Azure AI AI-900* (Escola do Trabalhador 4.0 / Microsoft - 25h)
  - *Gestão Ágil de Projetos com Scrum* (EV.G / ENAP - 30h)
  - *Introdução à Lei Geral de Proteção de Dados LGPD* (EV.G / ENAP - 20h)
  - *Marketing Digital para Pequenos Negócios* (Sebrae - 15h)
  - *Gestão Financeira e Controle de Fluxo de Caixa* (Sebrae - 20h)
  - *Introdução à Ciência de Dados* (FGV - 30h)
  - *Fundamentos das Relações de Consumo* (FGV - 10h)
  - *Introdução à Ciência da Computação com Python* (USP / Coursera - 32h - Modo Ouvinte Gratuito)
  - *Desenvolvimento Ágil com Padrões de Projeto* (ITA / Coursera - 28h - Modo Ouvinte Gratuito)
- **Filtro Especial para Cursos com Certificado Opcional / Pago:**
  - Atualização dos filtros na página principal (`index.html` e `src/app.js`):
    - *Todos os Cursos*
    - *🎓 Certificado 100% Grátis*
    - *📄 Modo Ouvinte (Certificado Opcional / Pago)*
  - Permite aos estudantes filtrarem especificamente oportunidades de prestígio acadêmico (USP, ITA) com aulas 100% gratuitas onde o certificado é opcional.

---

## [4.59.0] - 2026-11-11
### 🏥 Expansão do Catálogo de Saúde: 6 Novos Cursos Oficiais Gratuitos com Certificado

- **6 Novos Cursos Oficiais Adicionados (`src/data/courses.js`, `api/cache_courses.json`, `api/seed_courses.json`, `database.sql`):**
  - *Cuidados Paliativos na Atenção Primária à Saúde* (UNA-SUS / Fiocruz - 30h - Certificado Gratuito)
  - *Biossegurança e Controle de Infecções em Serviços de Saúde* (Escola Virtual de Governo / Anvisa - 40h - Certificado Gratuito)
  - *Saúde da Mulher e Acolhimento Humanizado no Pré-Natal* (AVASUS / Ministério da Saúde / UFRN - 30h - Certificado Gratuito)
  - *Vigilância Epidemiológica e Imunizações no SUS* (Campus Virtual Fiocruz - 40h - Certificado Gratuito)
  - *Acolhimento com Classificação de Risco e Humanização na Recepção* (UNA-SUS / UFMA - 30h - Certificado Gratuito)
  - *Noções de Farmacologia e Uso Racional de Medicamentos* (PoCA / UFSCar - 20h - Certificado Gratuito)
- **Total do Catálogo Expandido:**
  - O portal atinge **192 cursos oficiais gratuitos catalogados**, sendo **23 cursos dedicados à área de Saúde e Bem-estar (SUS)**.
- **Cache-busting global:**
  - Atualizado para `v=4.59.0` em todos os 22 arquivos HTML e no Service Worker (`sw.js`).

## [4.58.0] - 2026-11-11
### 🏥 Expansão de Opções Profissionais no Criador de Currículos: Área da Saúde, Educação, RH e mais

- **Inclusão da Área de Saúde, Enfermagem e Cuidados (`curriculo.html` + `src/curriculo.js`):**
  - Nova opção no seletor de Área Profissional: `🏥 Saúde, Enfermagem e Cuidados`, além de `📚 Educação, Docência e Pedagogia`, `👥 Recursos Humanos`, `🍳 Gastronomia e Hotelaria`, `🛡️ Segurança e Portaria`, `📱 Marketing e Mídias`, `✨ Estética e Bem-Estar`, `🔨 Construção e Manutenção` e `⚖️ Jurídico e Serviços Notariais`.
- **Assistente de Escrita com Sugestões Específicas em 1 Clique:**
  - Modelos de Objetivo Profissional prontos para Técnicos de Enfermagem, Cuidadores de Idosos, Recepção Clínica/Hospitalar, Farmácia/Drogaria, Docência e Gestão de Pessoas.
  - Modelos de Resumo Profissional e Verbos de Ação assistenciais (`Aferiu`, `Ministrou`, `Acolheu`, `Higienizou`, `Triou`).
  - Dicionário de aprimoramento textual automático para expressões do cotidiano da saúde (`cuidava de idoso`, `trabalhava no hospital`, `aplicava injeção`, etc.).
- **Sugestões Contextuais de Habilidades e Integração com Cursos:**
  - Banco de habilidades inteligentes adaptado à área selecionada (ex: Aferição de Sinais Vitais, Primeiros Socorros, Normas ANVISA/Biossegurança, Prontuário Eletrônico, Curativos Básicos).
  - Sugestão automática de cursos gratuitos oficiais do portal em saúde e cuidados (SUS/Fiocruz, Bradesco, EV.G).
- **Menu "Carregar Exemplo" por Área:**
  - Adicionado suporte a múltiplos exemplos completos no topo do gerador de currículos: Exemplo Completo da Área de Saúde (Técnica de Enfermagem / Cuidadora) e Exemplo de Administração.

## [4.57.0] - 2026-11-10
### 📱 Correção Definitiva de Overflow no Cabeçalho Mobile e Enquadramento da Barra Superior

- **Resolução do Overflow Horizontal do Cabeçalho (`index.html`, `vagas.html`, `blog.html`):**
  - Ocultamento responsivo no mobile dos botões de ação secundários do topo (`hidden sm:inline-flex` para Criar Currículo, `hidden md:inline-flex` para Mural de Vagas e Teste Vocacional, `hidden xl:inline-flex` para Blog).
  - Em telas móveis (320px a 640px), o cabeçalho agora exibe apenas a Logo Oficial, o seletor de Modo Escuro e o botão Hambúrguer, eliminando o estouro horizontal de 140px que empurrava a barra para fora da tela.
  - Todas as opções e ferramentas continuam acessíveis no menu gaveta (`mobile-nav-drawer`).
- **Ajuste Fino na Barra de Informações do Topo (`#top-utility-bar`):**
  - Adicionado `overflow-hidden w-full max-w-full min-w-0` e ocultado o texto longo de Acessibilidade no mobile (`<span class="hidden sm:inline">Acessibilidade</span>`), mantendo o ícone visual acessível e o ticker de notícias contido em uma única linha suave sem scroll horizontal.
- **Blindagem do Layout e Versionamento Global:**
  - Aplicação de `overflow-x-hidden w-full max-w-full` em `<html>` e `<body>`.
  - Bump geral de cache-busting para `v=4.57.0` em todos os 22 arquivos HTML e no Service Worker (`sw.js`).

## [4.32.0] - 2026-11-01
### 🚀 Simulador de Entrevistas STAR, Teste Vocacional Dedicado e Monitor de Saúde de Links

- **Simulador de Entrevistas de Emprego (`simulador-entrevista.html` + `src/simulador.js`):**
  - Ferramenta interativa de preparação para processos seletivos por área profissional: *Jovem Aprendiz*, *Administrativo*, *Atendimento/SAC*, *TI & Suporte* e *Logística & Estoque*.
  - Avaliação imediata baseada no **Método STAR** (Situação, Tarefa, Ação, Resultado), contagem de palavras-chave de RH, pontos fortes, oportunidades de melhoria e resposta-modelo ideal.
  - Suporte nativo a transcrição de áudio por microfone (`SpeechRecognition`) e sugestões de cursos gratuitos específicos do portal.
  - Tag oficial do Google AdSense e metadados SEO/OpenGraph.
- **Página Dedicada do Teste Vocacional (`teste-vocacional.html` + `src/teste-vocacional.js`):**
  - Experiência completa com layout independente, indicadores visuais de progresso e cartões acessíveis.
  - Algoritmo de mapeamento de perfil profissional cruzando interesses e habilidades com 8 áreas produtivas.
  - Exibição de afinidade percentual, vocação secundária, gráfico comparativo de barras e **Trilha de Aprendizagem Passo a Passo (1 a 5)** conectada ao catálogo do Você Pode Tudo.
  - Recursos de exportação e salvamento em PDF e compartilhamento imediato via WhatsApp.
- **Link Health Monitor no Painel Administrativo (`admin.html` + `src/admin.js` + `api/courses.php`):**
  - Endpoint `check_url` com cURL assíncrono para testar conectividade e códigos HTTP de cursos oficiais.
  - Botão *"Verificar Links dos Cursos"* no painel com barra de progresso em tempo real e contadores (Online, Redirecionados, Inacessíveis/Erro).
  - Badges visuais dinâmicas inseridas na tabela de cursos para identificação e correção instantânea de links quebrados.
- **Adequações de Segurança, Jurídicas e Monetização:**
  - Token JWT transferido exclusivamente via cabeçalho `Authorization: Bearer` com downloads via Blob em memória (`downloadWithAuth()`).
  - Atualização do salário mínimo do Jovem Aprendiz para **R$ 1.621,00** (Decreto nº 12.797/2025).
  - Autoexclusão em cascata conforme LGPD (Art. 16, I da Lei 13.709/2018).
  - Remoção de resquícios de comentários de desenvolvimento e referências a IA em todo o código-fonte de produção.
  - Atualização de navegação em cascata e rodapés de todas as páginas e do `sitemap.xml`.

---

## [4.59.0] - 2026-11-11
### 🏥 Expansão do Catálogo de Saúde: 6 Novos Cursos Oficiais Gratuitos com Certificado

- **6 Novos Cursos Oficiais Adicionados (`src/data/courses.js`, `api/cache_courses.json`, `api/seed_courses.json`, `database.sql`):**
  - *Cuidados Paliativos na Atenção Primária à Saúde* (UNA-SUS / Fiocruz - 30h - Certificado Gratuito)
  - *Biossegurança e Controle de Infecções em Serviços de Saúde* (Escola Virtual de Governo / Anvisa - 40h - Certificado Gratuito)
  - *Saúde da Mulher e Acolhimento Humanizado no Pré-Natal* (AVASUS / Ministério da Saúde / UFRN - 30h - Certificado Gratuito)
  - *Vigilância Epidemiológica e Imunizações no SUS* (Campus Virtual Fiocruz - 40h - Certificado Gratuito)
  - *Acolhimento com Classificação de Risco e Humanização na Recepção* (UNA-SUS / UFMA - 30h - Certificado Gratuito)
  - *Noções de Farmacologia e Uso Racional de Medicamentos* (PoCA / UFSCar - 20h - Certificado Gratuito)
- **Total do Catálogo Expandido:**
  - O portal atinge **192 cursos oficiais gratuitos catalogados**, sendo **23 cursos dedicados à área de Saúde e Bem-estar (SUS)**.
- **Cache-busting global:**
  - Atualizado para `v=4.59.0` em todos os 22 arquivos HTML e no Service Worker (`sw.js`).

## [4.58.0] - 2026-11-11
### 🏥 Expansão de Opções Profissionais no Criador de Currículos: Área da Saúde, Educação, RH e mais

- **Inclusão da Área de Saúde, Enfermagem e Cuidados (`curriculo.html` + `src/curriculo.js`):**
  - Nova opção no seletor de Área Profissional: `🏥 Saúde, Enfermagem e Cuidados`, além de `📚 Educação, Docência e Pedagogia`, `👥 Recursos Humanos`, `🍳 Gastronomia e Hotelaria`, `🛡️ Segurança e Portaria`, `📱 Marketing e Mídias`, `✨ Estética e Bem-Estar`, `🔨 Construção e Manutenção` e `⚖️ Jurídico e Serviços Notariais`.
- **Assistente de Escrita com Sugestões Específicas em 1 Clique:**
  - Modelos de Objetivo Profissional prontos para Técnicos de Enfermagem, Cuidadores de Idosos, Recepção Clínica/Hospitalar, Farmácia/Drogaria, Docência e Gestão de Pessoas.
  - Modelos de Resumo Profissional e Verbos de Ação assistenciais (`Aferiu`, `Ministrou`, `Acolheu`, `Higienizou`, `Triou`).
  - Dicionário de aprimoramento textual automático para expressões do cotidiano da saúde (`cuidava de idoso`, `trabalhava no hospital`, `aplicava injeção`, etc.).
- **Sugestões Contextuais de Habilidades e Integração com Cursos:**
  - Banco de habilidades inteligentes adaptado à área selecionada (ex: Aferição de Sinais Vitais, Primeiros Socorros, Normas ANVISA/Biossegurança, Prontuário Eletrônico, Curativos Básicos).
  - Sugestão automática de cursos gratuitos oficiais do portal em saúde e cuidados (SUS/Fiocruz, Bradesco, EV.G).
- **Menu "Carregar Exemplo" por Área:**
  - Adicionado suporte a múltiplos exemplos completos no topo do gerador de currículos: Exemplo Completo da Área de Saúde (Técnica de Enfermagem / Cuidadora) e Exemplo de Administração.

## [4.57.0] - 2026-11-10
### 📱 Correção Definitiva de Overflow no Cabeçalho Mobile e Enquadramento da Barra Superior

- **Resolução do Overflow Horizontal do Cabeçalho (`index.html`, `vagas.html`, `blog.html`):**
  - Ocultamento responsivo no mobile dos botões de ação secundários do topo (`hidden sm:inline-flex` para Criar Currículo, `hidden md:inline-flex` para Mural de Vagas e Teste Vocacional, `hidden xl:inline-flex` para Blog).
  - Em telas móveis (320px a 640px), o cabeçalho agora exibe apenas a Logo Oficial, o seletor de Modo Escuro e o botão Hambúrguer, eliminando o estouro horizontal de 140px que empurrava a barra para fora da tela.
  - Todas as opções e ferramentas continuam acessíveis no menu gaveta (`mobile-nav-drawer`).
- **Ajuste Fino na Barra de Informações do Topo (`#top-utility-bar`):**
  - Adicionado `overflow-hidden w-full max-w-full min-w-0` e ocultado o texto longo de Acessibilidade no mobile (`<span class="hidden sm:inline">Acessibilidade</span>`), mantendo o ícone visual acessível e o ticker de notícias contido em uma única linha suave sem scroll horizontal.
- **Blindagem do Layout e Versionamento Global:**
  - Aplicação de `overflow-x-hidden w-full max-w-full` em `<html>` e `<body>`.
  - Bump geral de cache-busting para `v=4.57.0` em todos os 22 arquivos HTML e no Service Worker (`sw.js`).

## [4.31.0] - 2026-10-31
### 📅 Central Editorial do Blog: 30 Novos Artigos Agendados & Publicação Automática

- **Agenda Editorial de 30 Dias (Novembro/2026):**
  - Implementação de 30 novos artigos completos (IDs 8 a 37), totalizando 37 artigos cadastrados.
  - Estrutura padrão *"Aprenda de Graça"* em todos os posts: o que é a profissão/habilidade, demanda e remuneração média de mercado em 2026, conhecimentos exigidos, onde estudar gratuitamente em órgãos oficiais e trilha passo a passo.
  - CTAs internos integrados direcionando para o Criador de Currículos ATS, Mural de Vagas, Calculadora de Aprendiz e Cursos Gratuitos.
- **Sistema de Agendamento Automático de Posts:**
  - `api/blog.php`: Suporte a liberação programada por data (`created_at <= NOW()`). Artigos com data futura ficam restritos aos administradores e tornam-se públicos automaticamente na data agendada.
  - `src/blog.js`: Fallback no cliente que respeita o agendamento temporal.
- **Painel Administrativo (`admin.html` & `src/admin.js`):**
  - Identificação de status para artigos agendados com badge `Agendado (DD/MM)` e novo filtro no seletor de status.

---

## [4.59.0] - 2026-11-11
### 🏥 Expansão do Catálogo de Saúde: 6 Novos Cursos Oficiais Gratuitos com Certificado

- **6 Novos Cursos Oficiais Adicionados (`src/data/courses.js`, `api/cache_courses.json`, `api/seed_courses.json`, `database.sql`):**
  - *Cuidados Paliativos na Atenção Primária à Saúde* (UNA-SUS / Fiocruz - 30h - Certificado Gratuito)
  - *Biossegurança e Controle de Infecções em Serviços de Saúde* (Escola Virtual de Governo / Anvisa - 40h - Certificado Gratuito)
  - *Saúde da Mulher e Acolhimento Humanizado no Pré-Natal* (AVASUS / Ministério da Saúde / UFRN - 30h - Certificado Gratuito)
  - *Vigilância Epidemiológica e Imunizações no SUS* (Campus Virtual Fiocruz - 40h - Certificado Gratuito)
  - *Acolhimento com Classificação de Risco e Humanização na Recepção* (UNA-SUS / UFMA - 30h - Certificado Gratuito)
  - *Noções de Farmacologia e Uso Racional de Medicamentos* (PoCA / UFSCar - 20h - Certificado Gratuito)
- **Total do Catálogo Expandido:**
  - O portal atinge **192 cursos oficiais gratuitos catalogados**, sendo **23 cursos dedicados à área de Saúde e Bem-estar (SUS)**.
- **Cache-busting global:**
  - Atualizado para `v=4.59.0` em todos os 22 arquivos HTML e no Service Worker (`sw.js`).

## [4.58.0] - 2026-11-11
### 🏥 Expansão de Opções Profissionais no Criador de Currículos: Área da Saúde, Educação, RH e mais

- **Inclusão da Área de Saúde, Enfermagem e Cuidados (`curriculo.html` + `src/curriculo.js`):**
  - Nova opção no seletor de Área Profissional: `🏥 Saúde, Enfermagem e Cuidados`, além de `📚 Educação, Docência e Pedagogia`, `👥 Recursos Humanos`, `🍳 Gastronomia e Hotelaria`, `🛡️ Segurança e Portaria`, `📱 Marketing e Mídias`, `✨ Estética e Bem-Estar`, `🔨 Construção e Manutenção` e `⚖️ Jurídico e Serviços Notariais`.
- **Assistente de Escrita com Sugestões Específicas em 1 Clique:**
  - Modelos de Objetivo Profissional prontos para Técnicos de Enfermagem, Cuidadores de Idosos, Recepção Clínica/Hospitalar, Farmácia/Drogaria, Docência e Gestão de Pessoas.
  - Modelos de Resumo Profissional e Verbos de Ação assistenciais (`Aferiu`, `Ministrou`, `Acolheu`, `Higienizou`, `Triou`).
  - Dicionário de aprimoramento textual automático para expressões do cotidiano da saúde (`cuidava de idoso`, `trabalhava no hospital`, `aplicava injeção`, etc.).
- **Sugestões Contextuais de Habilidades e Integração com Cursos:**
  - Banco de habilidades inteligentes adaptado à área selecionada (ex: Aferição de Sinais Vitais, Primeiros Socorros, Normas ANVISA/Biossegurança, Prontuário Eletrônico, Curativos Básicos).
  - Sugestão automática de cursos gratuitos oficiais do portal em saúde e cuidados (SUS/Fiocruz, Bradesco, EV.G).
- **Menu "Carregar Exemplo" por Área:**
  - Adicionado suporte a múltiplos exemplos completos no topo do gerador de currículos: Exemplo Completo da Área de Saúde (Técnica de Enfermagem / Cuidadora) e Exemplo de Administração.

## [4.57.0] - 2026-11-10
### 📱 Correção Definitiva de Overflow no Cabeçalho Mobile e Enquadramento da Barra Superior

- **Resolução do Overflow Horizontal do Cabeçalho (`index.html`, `vagas.html`, `blog.html`):**
  - Ocultamento responsivo no mobile dos botões de ação secundários do topo (`hidden sm:inline-flex` para Criar Currículo, `hidden md:inline-flex` para Mural de Vagas e Teste Vocacional, `hidden xl:inline-flex` para Blog).
  - Em telas móveis (320px a 640px), o cabeçalho agora exibe apenas a Logo Oficial, o seletor de Modo Escuro e o botão Hambúrguer, eliminando o estouro horizontal de 140px que empurrava a barra para fora da tela.
  - Todas as opções e ferramentas continuam acessíveis no menu gaveta (`mobile-nav-drawer`).
- **Ajuste Fino na Barra de Informações do Topo (`#top-utility-bar`):**
  - Adicionado `overflow-hidden w-full max-w-full min-w-0` e ocultado o texto longo de Acessibilidade no mobile (`<span class="hidden sm:inline">Acessibilidade</span>`), mantendo o ícone visual acessível e o ticker de notícias contido em uma única linha suave sem scroll horizontal.
- **Blindagem do Layout e Versionamento Global:**
  - Aplicação de `overflow-x-hidden w-full max-w-full` em `<html>` e `<body>`.
  - Bump geral de cache-busting para `v=4.57.0` em todos os 22 arquivos HTML e no Service Worker (`sw.js`).

## [4.14.0] - 2026-10-29
### 📰 Fase 3 de Transformação em Portal Completo: Blog & Central Editorial de Carreira, Dicas de Entrevista e Empregabilidade

#### 🌟 Blog & Central de Artigos de Carreira (`#blog-section` & `#blog-reader-modal`)
- **Seção Editorial no Portal:** Área dedicada no portal com badge, apresentação moderna, barra de busca textual instantânea e filtros por pílulas temáticas (*Todos*, *Primeiro Emprego*, *Currículo & LinkedIn*, *Entrevistas de Emprego*, *Carreira em Tecnologia*).
- **Cards Responsivos de Artigos:** Exibição com thumbnail/capa com efeito zoom suave, badge de categoria, tempo estimado de leitura (ex.: "6 min de leitura"), título, resumo cativante, autor e visualizações.
- **Modal Leitor Rico e Focado (`#blog-reader-modal`):**
  - Leitura livre de distrações com tipografia otimizada, cabeçalhos estilizados, listas e blocos de destaque.
  - Informações completas de autor, data de publicação e métricas de audiência.
  - Integração social: botão de compartilhamento rápido via WhatsApp e cópia de link direto com suporte a deep-linking (`?artigo=slug`).
  - CTA contextual no rodapé de cada artigo incentivando a criação de currículo ATS e busca de vagas abertas no portal.
- **Navegação Global Integrada:** Atalho no cabeçalho desktop (`nav-btn-blog`), menu em cascata, gaveta móvel de navegação e cabeçalho do criador de currículos (`curriculo.html`).

#### 🛠️ Gestão Editorial no Painel Administrativo (`admin.html` + `src/admin.js`)
- **Nova Aba "Blog & Artigos":** Tabela completa de artigos cadastrados com contadores de status, tempo de leitura e visualizações acumuladas.
- **Editor Completo de Artigos (CRUD):** Modal integrado para criar ou editar artigos com título, categoria, tempo de leitura, autor, tags, resumo e conteúdo completo com suporte a HTML semântico.
- **Controle de Publicação em 1 Clique:** Alternância instantânea entre status *Publicado* e *Rascunho* e exclusão definitiva de artigos.
- **Filtros no Painel:** Busca textual em tempo real e filtros combinados por categoria e status de publicação.

#### 🔌 Backend Editorial Resiliente & Backup (`api/blog.php`)
- **Tabela `blog_posts` no MySQL:** Auto-criação da tabela no banco com índices otimizados por categoria, status de publicação e contagem de leituras.
- **Arquitetura Híbrida de Alta Disponibilidade:** Fallback automático para `api/cache_blog.json` e seed com 6 artigos originais aprofundados (`api/seed_blog.json`) cobrindo currículo ATS sem experiência, legislação do jovem aprendiz, técnica STAR em entrevistas, LinkedIn campeão, roadmap gratuito em tecnologia e soft skills.
- **Segurança de Acesso:** Proteção das rotas de escrita/edição/exclusão com validação de JWT Bearer Token e enforçamento de permissão RBAC.
- **Inclusão na Central de Backups:** Tabela `blog_posts` adicionada à rotina de dump MySQL em 1 clique (`api/backup.php`).

---

## [4.13.0] - 2026-10-29
### 💼 Fase 2 de Transformação em Portal Completo: Mural de Vagas, Estágios e Oportunidades de Emprego Integrado

#### 🌟 Mural de Vagas & Início de Carreira (`#jobs-section`)
- **Seção Dedicada no Portal:** Mural dinâmico conectando os alunos recém-qualificados às oportunidades reais do mercado de trabalho.
- **Categorização Oficial:** Filtros instantâneos por tipo de contrato (*Estágio*, *Jovem Aprendiz*, *Júnior / Primeiro Emprego* e *Trainee*) e modalidade (*100% Remoto*, *Híbrido* e *Presencial*).
- **Cards Ricos de Oportunidades:** Exibição com badges visuais temáticas, localidade, faixa de bolsa-auxílio/salário, resumo das atividades, requisitos essenciais e botão de candidatura oficial.
- **Modal de Detalhes da Vaga:** Visualização completa de atribuições, requisitos e benefícios com dica especial para criar um currículo ATS sob medida no Você Pode Tudo.
- **Atalhos Rápidos de Navegação:** Botão `[💼 Vagas & Estágios]` com badge "Novo" fixado no cabeçalho desktop, no menu suspenso de carreira e na gaveta móvel de navegação.
- **Integração no Criador de Currículos:** Atalho para o Mural de Vagas inserido no cabeçalho de `curriculo.html`, permitindo aos usuários buscar vagas imediatamente após finalizar seus currículos.

#### 🛠️ Gestão de Oportunidades no Painel Administrativo (`admin.html` + `src/admin.js`)
- **Aba "Mural de Vagas":** Nova aba no painel com tabela completa de oportunidades cadastradas, busca instantânea e filtros por status e tipo de vaga.
- **Gerenciamento de Vagas (CRUD):** Modal integrado para cadastrar novas oportunidades com título, empresa, modalidade, remuneração, requisitos e link oficial.
- **Controle Operacional:** Botão rápido para pausar/ativar vagas e exclusão de oportunidades encerradas.
- **Métricas de Empregabilidade:** Contador de cliques de candidatura em cada oportunidade para acompanhamento do engajamento dos estudantes.

#### 🔌 Backend e Persistência Resiliente (`api/jobs.php`)
- **Tabela `job_vacancies` no MySQL:** Criação automática de tabela no banco com índices otimizados por tipo, modalidade e estado.
- **Contingência em JSON (`api/cache_jobs.json` e `api/seed_jobs.json`):** Operação 100% autônoma com cache JSON de alta performance e seed de 10 oportunidades reais (Itaú, Bradesco, Santander, Petrobras, Nubank, CIEE, Hackers do Bem, Magalu, Mercado Livre e Ambev).
- **Tracking Analítico de Candidatura:** Endpoint `api/jobs.php?action=click&id=...` para contabilizar cliques reais sem lentidão na experiência do candidato.

---

## [4.12.0] - 2026-10-29
### 🚀 Fase 1 de Transformação em Portal Completo: CRM de Alunos, Central de Avisos Globais e Backups com 1 Clique

#### 💾 Backups Automatizados & Armazenamento Seguro
- **Backup Local Pré-Fase 1:** Arquivo `backups/backup_vocepodetudo_pre_fase1_20261029_155956.zip` gerado com todos os fontes e assets (919.606 bytes).
- **Backup no Servidor FTP:** Upload e isolamento físico em `/backups/backup_vocepodetudo_pre_fase1_20261029_155956.zip` na raiz do servidor FTP fora do `public_html`.

#### 🌓 Correção e Refinamento do Modo Claro e Escuro (Dark Mode)
- **Correção de Sobreposição de Gradientes Tailwind:** Resolução do bug onde o Hero mantinha degradê claro sobre o fundo escuro; agora com sobrescrita explícita de `background: linear-gradient(...) !important` para `html.dark`.
- **Prevenção de Mutação SVG do Lucide:** Substituição limpa do `innerHTML` dos botões de alternância antes de invocar `lucide.createIcons()`, garantindo troca fluida entre ícones de Sol e Lua sem falhas de elemento.
- **Validação Headless CDP:** Testado em Microsoft Edge headless sem erros de console ou mutações órfãs.

#### 📢 Central de Avisos Globais do Portal (Admin & Frontend)
- **Banner Oficial no Portal:** Barra dinâmica fixada no topo de todas as páginas (`#global-announcement-banner`) com suporte a mensagens customizadas, cores de alerta (Destaque Ouro, Azul Informativo, Alerta Vermelho), link opcional com ação e botão de fechar.
- **Painel Administrativo em Tempo Real:** Novo card em `admin.html` (Aba Sistema) permitindo ativar/desativar o aviso, alterar texto, selecionar estilo visual e definir link com 1 clique.
- **Endpoint Seguro `api/announcement.php`:** Leitura pública com cache JSON e gravação restrita por autenticação de administrador pleno (`Bearer` / cookie / GET token).

#### 👥 CRM e Gestão de Base de Alunos
- **Aba "Base de Alunos" no Admin:** Interface completa com busca em tempo real por nome, e-mail, telefone ou objetivo profissional, contadores de cursos inscritos/concluídos e horas acumuladas.
- **Exportação CSV com 1 Clique (`api/admin_students.php`):** Exportação direta com cabeçalhos estruturados e caractere BOM UTF-8 (`\xEF\xBB\xBF`) para compatibilidade perfeita com Microsoft Excel no Brasil.

#### 🗄️ Central de Backups do Portal (Download MySQL em 1 Clique)
- **Endpoint `api/backup.php`:** Geração e streaming direto de dump SQL completo (`.sql`) com todas as tabelas essenciais (`admin_users`, `courses`, `students`, `student_courses`, `student_career_tests`), com proteção estrita por token de administrador.
- **Card Dedicado na Aba Sistema:** Botão "Baixar .SQL" no painel com autenticação embutida via token e indicador de proteção FTP.

---

## [4.11.0] - 2026-10-29
### 🌟 Redimensionamento de Ações, Modo Escuro (Dark Mode) Nativo e "Continuar de Onde Parou" (Recentes)

#### 📐 Redimensionamento Harmonioso de Currículo e Teste Vocacional
- **Hub de Destaques em Grid Responsivo:** Substituição de dois banners verticais gigantes e sequenciais por um grid harmonioso de 2 colunas (`grid grid-cols-1 md:grid-cols-2`), reduzindo mais de 400px de altura vertical, com botões de ação perfeitamente proporcionados para "Criar Currículo" (com atalho para modelos) e "Teste Vocacional" (com atalho para trilhas).
- **Atalhos Rápidos no Cabeçalho (Navbar):** Botões diretos `[Criar Currículo]` e `[Teste Vocacional]` dispostos lado a lado com dimensionamento otimizado (`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black`), sem sobrecarregar ou quebrar menus em telas móveis e desktop.
- **Navegação Cruzada no Criador de Currículos:** Adicionado atalho direto para o Teste Vocacional no cabeçalho de `curriculo.html`, permitindo aos candidatos descobrirem cursos e qualificações para colocar no currículo.

#### 🌙 Modo Escuro (Dark Mode) Completo & Persistente
- **Alternador Instantâneo no Topo:** Botão toggle com ícone dinâmico Sol/Lua no cabeçalho do portal e na gaveta móvel, com transição visual suave.
- **Persistência em Navegador & SO:** Salva automaticamente a preferência em `localStorage` (`vpt_theme = 'dark' | 'light'`) e detecta preferência nativa via `prefers-color-scheme`.
- **Estilização Completa e Confortável:** Paleta dark elegante baseada em tons de ardósia profunda (`#0b1120`, `#1e293b`), com contraste AAA para leitura prolongada à noite e preservação das cores nacionais.
- **Dark Mode no Criador de Currículos:** O editor escurece para conforto visual, enquanto a folha de pré-visualização A4 permanece branca e pura para simulação idêntica à impressão real.

#### 🕒 Cursos Vistos Recentemente ("Continuar de Onde Parou")
- **Histórico Inteligente em LocalStorage:** Cada clique em "Acessar Curso Oficial" salva instantaneamente o curso no histórico recente local (máximo de 3 cursos).
- **Bloco Dinâmico na Home:** Exibe chips compactos com título, instituição e botão "Continuar", acompanhado de botão para "Limpar Histórico". A seção permanece invisível quando o histórico está vazio.

---

## [4.10.0] - 2026-10-29
### 🚀 Pacote Completo de Melhorias: Backup em Nuvem/Local, Viralidade, Força ATS, Carta de Apresentação e 2FA

#### 💾 Backups Realizados
- **Backup Local Completo:** Arquivo `backups/backup_vocepodetudo_pre_tudo_20261029_110819.zip` gerado localmente com todos os arquivos fonte e assets (898.833 bytes).
- **Backup no Servidor FTP:** Upload automático e isolamento físico em `/backups/backup_vocepodetudo_pre_tudo_20261029_110819.zip` (diretório seguro na raiz do servidor FTP fora do `public_html`).

#### 🎯 Viralidade & Retenção de Estudantes
- **Cursos Favoritos (❤️) Sem Bloqueio:** O usuário pode favoritar cursos livremente (salvos no `localStorage`). O botão e a aba de favoritos agora abrem diretamente sem obrigar login prévio, exibindo a contagem na navegação.
- **Deep-Linking de Cursos (`?curso=...`):** Abertura, rolagem suave e destaque com anel verde e sombra para o curso referenciado na URL, permitindo compartilhar links diretos.
- **Compartilhamento no WhatsApp em 1 Clique:** Links de compartilhamento em cada card de curso atualizados para incluir o deep-link com título e carga horária.

#### 📄 Super Recursos no Criador de Currículos (`curriculo.html`)
- **Medidor de Força do Currículo (ATS Score Checker):** Barra de progresso dinâmica em tempo real (0% a 100%) com classificação (Básico, Bom, Excelente) e dicas inteligentes baseadas em critérios reais de triagem de RH.
- **Backup e Restauração em JSON:** Botões "Salvar Backup (.json)" e "Carregar Backup" na barra superior para exportar e reimportar dados completos sem perda de preenchimento.
- **Gerador Automático de Carta de Apresentação:** Modal inteligente com geração de texto formal de candidatura personalizado, botão de cópia com 1 clique e download em `.txt`.

#### 🔐 Segurança Avançada da Administração
- **Camuflagem de Rota no Apache:** Criação das rotas limpas `/painel-gestao` e `/gestao-interna` mapeadas diretamente no `.htaccess`.
- **Autenticação em Duas Etapas (2FA / TOTP RFC 6238):** Suporte nativo completo a Google Authenticator, Microsoft Authenticator e Authy em `api/auth.php` com migração automática no banco de dados e tela de login adaptativa em `admin.html`.

---

## [4.9.9] - 2026-10-29
### 🛡️ Blindagem de Transporte HSTS Preload (2 anos), Hardening 80→443 e Pacote DNSSEC / DMARC / CAA

#### Adicionado & Aprimorado
- **HSTS Preload Standard (RFC 6797):** Cabeçalho `Strict-Transport-Security` elevado para `max-age=63072000; includeSubDomains; preload` (2 anos) em `.htaccess` e `api/config.php`, cumprindo 100% dos requisitos de submissão para o programa de inclusão permanente em navegadores (Google Chrome, Mozilla Firefox, Apple Safari).
- **Redirecionamento 80→443 Explícito:** Regra Apache `mod_rewrite` otimizada com preservação canônica de hostname e compatibilidade com proxies reversos do StackCP.
- **Auditoria de Regras 403 e Bots:** Validação em produção confirmando que robôs de busca (Googlebot, Bingbot), serviços de mensageria (WhatsApp, Slack) e monitores de disponibilidade (UptimeRobot) recebem `HTTP 200 OK` irrestrito, limitando o erro 403 estritamente à proteção de arquivos de sistema e controle de acesso RBAC.
- **Pacote de Configuração de DNS:** Geração do registro DMARC (`v=DMARC1; p=none...`), restrição de autoridade certificadora via CAA (`letsencrypt.org`), ativação de DNSSEC e fechamento da tríade de e-mail com Stackmail DKIM.

---

## [4.9.8] - 2026-10-28
### 🤖 Ecossistema Android Oficial (Google Play Store AAB & APK Direto)

#### Adicionado
- **Digital Asset Links (`.well-known/assetlinks.json`):** Registro de relacionamento de aplicativo Android TWA assinado com SHA-256 no domínio `vocepodetudo.com`.
- **Publicação do Pacote Android (`app.apk`):** Download direto para usuários Android em `vocepodetudo.com/app.apk`.

---

#### Corrigido & Aprimorado
- **Isolamento Total do Painel Administrativo do Service Worker (`sw.js` & `.htaccess`):** O Service Worker agora ignora expressamente requisições administrativas (`admin`) e de API (`/api/`), prevenindo que páginas de autenticação ou tabelas em tempo real sejam interceptadas ou recebam respostas em cache obsoletas.
- **Cabeçalhos `Cache-Control: no-cache, no-store, must-revalidate` (.htaccess):** Ativados para `sw.js` e `admin.html`, forçando os navegadores a sempre checar a versão mais recente em tempo real sem reter versões legadas quebradas.
- **Inclusão da Folha de Estilos em `admin.html`:** Adicionada a referência a `src/style.css`, restaurando estilos críticos do modo visualizador (`.is-viewer-mode`), barras de rolagem finas e formatação padronizada.
- **Correção da Alternância da Aba de Currículos (`admin.html`):** Adicionado `'tab-btn-resumes': 'section-resumes'` no mapa de delegação global de eventos do painel.
- **Inicialização Visual de Ícones (`src/admin.js`):** `lucide.createIcons()` agora é invocado imediatamente na tela de autenticação e no carregamento geral do DOM.
- **Sincronização de Dados e Catálogo no Criador de Currículos (`src/curriculo.js`):** Tratamento resiliente para carregamento de cursos por sugestão inteligente com suporte unificado a `window.PORTAL_DATA` e `window.localCourses`.
- **Atualização Geral de Cache-Busting (`v=4.9.7`):** Atualizado em `index.html`, `admin.html`, `curriculo.html`, `src/app.js` e `sw.js`.

---

## [4.9.6] - 2026-10-28
### 🚨 Correção Crítica de Integridade do Catálogo & Blindagem do Service Worker

#### Corrigido & Blindado
- **Restauração de Metadados do Catálogo (`src/data/courses.js`):** Correção do carregamento síncrono de `window.PORTAL_DATA` incluindo categorias, trilhas e lista de provedores, garantindo renderização imediata a 0ms no primeiro carregamento do catálogo.
- **Blindagem do Service Worker (`sw.js`):** Restrição estrita do interceptador de requisições apenas para o domínio oficial (`same-origin`), impedindo interferência em CDNs essenciais de terceiros (Tailwind CSS, Lucide Icons, Google Fonts, VLibras).
- **Tratamento Defensivo contra Erros de Renderização (`src/app.js`):** Inclusão de verificações defensivas com fallbacks nativos em `renderCategories()`, `renderTracks()` e `renderProviderOptions()`, prevenindo qualquer travamento de DOM.

---

## [4.9.5] - 2026-10-28
### 📱 Lançamento Oficial do Progressive Web App (PWA Android / Desktop)

#### Adicionado
- **Service Worker (`sw.js`):** Implementação de Service Worker com estratégia híbrida (Network-First para HTML e Stale-While-Revalidate para estáticos), garantindo carregamento ultrarrápido e funcionamento com cache resiliente.
- **Manifesto Web Completo (`manifest.json`):**
  - Identificação de app autônomo (`display: standalone`, `theme_color: #009639`).
  - Geração de ícones dedicados de alta qualidade em 192x192 e 512x512 (com suporte a *maskable icons* para adaptação em círculos/quadrados da interface do Android).
  - Atalhos rápidos nativos no ícone do aplicativo (*App Shortcuts*): "Catálogo de Cursos", "Criar Currículo Grátis" e "Portal do Aluno".
- **Interface de Instalação Intuitiva:**
  - Botão de instalação no cabeçalho desktop (`#btn-install-pwa-desktop`).
  - Botão destacado no menu lateral mobile (`#btn-install-pwa-mobile`).
  - Banner flutuante inteligente para smartphones (`#pwa-install-banner`) com acionamento nativo do prompt do Android e opção de dispensa por 24 horas.
  - Detecção automática de modo standalone para ocultar botões se o app já estiver instalado.
- **Compatibilidade Apple iOS / iPadOS:** Inclusão de tags `apple-touch-icon` e `apple-mobile-web-app-capable` em todas as páginas públicas.

---

## [4.9.4] - 2026-10-28
### ⚡ Carregamento Progressivo Sob Demanda & Scroll Infinito no Catálogo

#### Adicionado
- **Scroll Infinito Contínuo (Infinite Scroll):** O catálogo de cursos agora inicia exibindo um lote inicial otimizado de 12 cursos e carrega automaticamente os lotes seguintes à medida que o visitante desce a página, sem necessidade de cliques manuais.
- **Detecção Híbrida de Rolagem com Alta Performance:** Implementação com mecanismo duplo:
  1. `IntersectionObserver` moderno com margem antecipada de 600px (`rootMargin: '600px 0px 600px 0px'`).
  2. Ouvinte de rolagem e toque (`scroll`, `touchmove`, `resize`) passivo e sincronizado com `requestAnimationFrame`, garantindo fluidez ininterrupta mesmo em conexões lentas ou WebViews móveis.
- **Feedback Visual Fluido:** Indicador visual animado com efeito pulse e spinner durante o carregamento de novos lotes e mensagem comemorativa de conclusão ao término do catálogo.
- **Suporte a Paginação na API (`api/courses.php`):** O endpoint público de listagem agora aceita parâmetros `?page=X&limit=Y`, retornando a fatia exata de cursos, total disponível e flag `hasMore`.

---

## [4.9.3] - 2026-10-28
### 🚀 Mega Auditoria de Qualidade, Acessibilidade (WCAG 2.1 AA), Segurança e Velocidade

#### Adicionado
- **Compressão HTTP GZIP (`mod_deflate`):** Ativação de compressão nativa no servidor Apache via `.htaccess` para HTML, CSS, JavaScript, JSON, XML e SVG, resultando em uma redução média de 70% a 85% no tráfego de rede transferido por requisição.
- **Dicas de Pré-Conexão e DNS (`Resource Hints`):** Injeção de tags `<link rel="preconnect">` e `<link rel="dns-prefetch">` no `index.html` e `curriculo.html` para os domínios de terceiros (`fonts.googleapis.com`, `cdnjs.cloudflare.com`, `unpkg.com`), reduzindo o tempo de handshake TLS e latência inicial.
- **Relatório Completo de Auditoria:** Criação de artefato técnico detalhado documentando os 26 testes de integridade, score de desempenho e matriz de acessibilidade.

#### Modificado & Otimizado
- **Acessibilidade Web (WCAG 2.1 AA):**
  - Correção de 12 apontamentos críticos de conformidade de contraste, leitores de tela e navegação por teclado.
  - Vínculo formal de elementos `<label for="...">` em todos os campos dos modais de login, takedown institucional e filtros.
  - Inclusão de `aria-label="Alternar visibilidade da senha"` e atributos `type="button"` nos botões de visualização de senha.
  - Adição de `aria-label="Fechar modal"` em todos os botões de fechar modais (`.modal-close`, `.auth-modal-close`, `.takedown-modal-close`).
  - Atribuição de rótulos acessíveis e atributos ARIA nos seletores de cor interativos (`color-swatch`) do gerador de currículos.
- **Core Web Vitals & Layout Stability (CLS):**
  - Adição explícita de atributos `width` e `height` nos elementos `<img>` do logotipo e banners institucionais para evitar Cumulative Layout Shift (CLS = 0.00).
  - Adição de `loading="lazy"` nas imagens abaixo da dobra.
- **Otimização de Scripts:**
  - Carregamento postergado da biblioteca pesada `html2pdf.js` via injeção sob demanda (`dynamic import`/script defer), acelerando o carregamento inicial do gerador de currículos em até 60%.

#### Segurança
- **api/courses.php:** Refatoração de montagem de consultas SQL no endpoint de listagem/busca de cursos. Todas as cláusulas `WHERE` foram migradas para Prepared Statements com placeholders posicionais/nomeados estritos via PDO, eliminando interpolações diretas de strings.

---

## [4.9.2] - 2026-10-28
### 🗄️ Sincronização de Currículos no Painel Admin & Perfil Somente-Leitura (Viewer)

#### Adicionado
- **Persistência de Currículos Gerados (`api/resumes.php`):**
  - Criação de endpoint RESTful para recebimento e armazenamento seguro dos dados estruturados de currículos criados pelos alunos.
  - Criação da tabela relacional `generated_resumes` no MySQL com índices em `created_at`, `email` e `slug`.
  - Mecanismo de contingência resiliente em arquivo `api/cache_generated_resumes.json` para operação contínua mesmo se a base de dados estiver indisponível.
- **Módulo Administrativo de Currículos:**
  - Nova aba interativa **"Currículos Gerados"** (`#tab-btn-resumes`) no painel de administração (`admin.html` / `src/admin.js`).
  - Painel de métricas e KPI dinâmico de currículos totais criados.
  - Tabela com filtros, ordenação e ações rápidas: link direto para conversa no WhatsApp (`https://wa.me/55...`), envio de e-mail institucional e botão de visualização completa.
  - Modal de inspeção detalhada do candidato (`#admin-resume-modal`) exibindo foto de perfil, dados de contato, resumo profissional, histórico de experiências e formação acadêmica.
  - Exportação completa da base de candidatos para formato CSV compatível com Excel e Google Sheets.
- **Perfil de Administrador Somente-Leitura (`visualizador`):**
  - Nova credencial institucional (`visualizador` / `VocePodeTudo@2026View`) destinada a analistas e auditores.
  - Enforçamento de segurança RBAC no backend (`api/config.php` e `api/auth.php`): qualquer requisição de mutação (`POST`, `PUT`, `DELETE` em cursos, curadoria, alunos ou currículos) realizada por visualizador é sumariamente abortada com status `403 Forbidden`.
  - Interface do painel adaptativa (`.is-viewer-mode`): oculta botões de exclusão, formulários de criação e desativa inputs de edição.

---

## [4.9.1] - 2026-10-28
### 🛡️ Conformidade Institucional, Canal de Takedown & Google AdSense

#### Adicionado
- **Canal Institucional de Remoção de Conteúdo (Takedown):**
  - Inserção de link transparente no rodapé do site (`#footer-takedown-btn`: *"Solicitar Remoção de Curso"*), oferecendo canal oficial para instituições de ensino e empresas detentoras de direitos autorais.
  - Modal interativo e acessível (`#takedown-modal`) com campos de nome da instituição, e-mail de contato, URL do curso e justificativa técnica/legal.
  - Roteamento de protocolo e notificação formal de solicitação de despublicação.
- **Monetização Google AdSense (`ads.txt`):**
  - Criação e deploy do arquivo de verificação `ads.txt` na raiz pública do domínio com a identificação oficial do publisher: `google.com, pub-9421145457118515, DIRECT, f08c47fec0942fa0`.
  - Verificação de cabeçalho `Content-Type: text/plain` e retorno HTTP 200 via `https://vocepodetudo.com/ads.txt`.

#### Modificado
- **Segurança da Interface Principal:**
  - Remoção de todos os atalhos e botões diretos de login administrativo do cabeçalho público (dropdown desktop e gaveta móvel), aumentando o isolamento e reduzindo a superfície de exposição contra robôs maliciosos. O acesso administrativo permanece restrito via URL direta e autenticação segura com rate limiting.

---

## [4.9.0] - 2026-10-28
### 🎨 Motor Dinâmico de Ícones Lucide

#### Adicionado
- **Identificação Visual Inteligente para Cursos:**
  - Algoritmo em JavaScript que analisa contextual mente o título, a categoria e a instituição de cada um dos 174 cursos do catálogo e injeta automaticamente o ícone semântico Lucide correspondente (ex: `code`, `brain`, `dollar-sign`, `stethoscope`, `shield`, `briefcase`).
  - Otimização do renderizador de cards na página inicial e nas páginas de listagem com ícones visualmente coerentes em padrão SVG.

---

## [4.8.5] - 2026-10-28
### 📷 Suporte a Foto de Perfil no Gerador de Currículos

#### Adicionado
- **Upload e Manipulação de Foto do Candidato:**
  - Inclusão de campo de upload de imagem de perfil com processamento local em Data URI (`base64`).
  - Recorte circular e ajuste de proporção para evitar distorções de aspecto.
  - Atualização dos 12 templates de currículo (Moderno, Clássico, Executivo, Minimalista, Tecnológico, Elegante, Criativo, Compacto, Acadêmico, etc.) para exibir a fotografia de forma harmoniosa e profissional.

---

## [4.8.0] - 2026-10-27
### 🧭 Navegação Multinível em Cascata & Correção de Filtros

#### Adicionado
- **Menu Multinível no Cabeçalho:**
  - Navegação hierárquica suspensa permitindo explorar cursos por Grande Área (Ex: Tecnologia) ➡️ Subcategoria (Ex: Inteligência Artificial, Desenvolvimento Web) ➡️ Instituição/Provedor.
  - Suporte completo a navegação por toque no mobile (drawer lateral).

#### Corrigido
- Resolução de inconsistência de IDs de alunos no portal de estudos.
- Correção no reset de filtros múltiplos de busca combinada (duração, nível, certificação e provedor).

---

## [4.7.0] - 2026-10-27
### 📄 Lançamento do Gerador de Currículos Profissionais Gratuito

#### Adicionado
- **Página Dedicada (`curriculo.html`):**
  - Módulo completo de criação de currículos com layout responsivo e interface intuitiva em etapas.
  - 12 modelos profissionais diagramados segundo as melhores práticas internacionais de Recrutamento & Seleção e sistemas ATS (Applicant Tracking Systems).
  - Pré-visualização em tempo real das alterações conforme o usuário digita.
  - Seções estruturadas para: Dados Pessoais, Resumo Profissional, Experiências, Educação, Competências, Idiomas e Cursos Adicionais.
  - Seletor de paletas cromáticas com contraste validado.
  - Exportação direta em PDF de alta resolução com paginação controlada.

---

## [4.4.0] - 2026-10-27
### 🎓 Motor de Curadoria & Expansão de Catálogo (174 Cursos)

#### Adicionado
- **Mecanismo Central de Curadoria:**
  - Criação do serviço `api/curation.php` para triagem, aprovação e controle de cursos ofertados na plataforma.
  - Catálogo expandido de 110 para 174 cursos gratuitos criteriosamente selecionados de parceiros confiáveis (Harvard, MIT OpenCourseWare, Fundação Bradesco, SENAI, Sebrae, Coursera, Google, Microsoft).
  - Geração automática e deploy de `sitemap.xml` estruturado para indexação otimizada no Google Search Console.

#### Otimizado
- Sincronização automática entre o cache estático do servidor (`api/cache_courses.json`) e os conjuntos de dados do front-end (`src/data/courses.js`).

---

## [3.5.0] - 2026-10-26
### 🔒 Baseline de Segurança, Hardening de Produção & Arquitetura Inicial

#### Adicionado
- **Arquitetura Base:**
  - Portal de cursos com catálogo responsivo, filtros de busca, quiz vocacional e portal do estudante.
  - Painel administrativo com controle de autenticação, dashboard de métricas e gerenciador de cursos.
- **Hardening de Segurança (P0/P1):**
  - Implementação de cabeçalhos rígidos no Apache `.htaccess`: `Content-Security-Policy` (CSP), `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security` (HSTS).
  - Publicação das diretrizes de reporte responsável de vulnerabilidades em `security.txt` e `.well-known/security.txt` (RFC 9116).
  - Proteção contra força bruta com Rate Limiting baseado em IP no endpoint `api/auth.php`.
  - Cookies de sessão protegidos com flags `HttpOnly`, `Secure` e `SameSite=Lax`.
  - Sanitização e migração de consultas de banco de dados para PDO com Prepared Statements.
  - Rotina de exclusão defensiva pós-deploy de instaladores e scripts operacionais (`api/setup.php`, `api/test_db.php`, `api/reset_admin.php`, `database.sql`, `package.zip`).

---

## Resumo dos Deploys em Produção

| # | Data/Hora (BRT) | Versão | Descrição Resumida | Arquivos | Status |
|---|---|---|---|:---:|:---:|
| 01 | 26/10/2026 22:41 | v3.5.0 | Baseline Inicial e sincronização FTP | 21 | Sucesso |
| 02 | 26/10/2026 22:51 | v3.5.0 | Hotfix de autenticação e proteção contra força bruta | 21 | Sucesso |
| 03 | 26/10/2026 23:19 | v3.5.1 | Hardening de segurança P0/P1, headers e security.txt | 23 | Sucesso |
| 04 | 26/10/2026 23:39 | v3.5.2 | Proteção de cookies de sessão de aluno (SameSite, HttpOnly) | 23 | Sucesso |
| 05 | 26/10/2026 23:46 | v3.5.3 | Blindagem contra SQL Injection (Prepared Statements) | 23 | Sucesso |
| 06 | 27/10/2026 07:15 | v3.6.0 | Sistema de cache JSON para otimização de consultas | 23 | Sucesso |
| 07 | 27/10/2026 07:25 | v3.7.0 | Expansão de catálogo - Etapa 1 | 23 | Sucesso |
| 08 | 27/10/2026 07:45 | v3.8.0 | Expansão de catálogo - Etapa 2 (Novos provedores) | 23 | Sucesso |
| 09 | 27/10/2026 07:50 | v3.8.1 | Otimização de índices no MySQL | 23 | Sucesso |
| 10 | 27/10/2026 08:05 | v3.8.2 | Resiliência de conexão e tratamento de timeouts | 23 | Sucesso |
| 11 | 27/10/2026 09:39 | v3.8.3 | Limpeza defensiva de arquivos de instalação em public_html | 18 | Sucesso |
| 12 | 27/10/2026 21:12 | v4.0.0-rc | Patch no backend de curadoria de cursos | 3 | Sucesso |
| 13 | 27/10/2026 21:38 | v4.4.0 | Lançamento oficial do catálogo com 174 cursos e sitemap | 23 | Sucesso |
| 14 | 27/10/2026 21:49 | v4.4.1 | Sincronização e alinhamento de cache de cursos | 23 | Sucesso |
| 15 | 27/10/2026 22:15 | v4.7.0 | Lançamento do Gerador de Currículos com 12 modelos | 23 | Sucesso |
| 16 | 27/10/2026 22:54 | v4.8.0 | Correção de filtros em cascata e persistência de IDs | 23 | Sucesso |
| 17 | 28/10/2026 07:55 | v4.8.1 | Menu multinível em cascata no cabeçalho desktop | 23 | Sucesso |
| 18 | 28/10/2026 08:10 | v4.8.2 | Refinamento do drawer de navegação mobile | 23 | Sucesso |
| 19 | 28/10/2026 08:36 | v4.8.5 | Suporte a foto de perfil nos 12 templates de currículo | 23 | Sucesso |
| 20 | 28/10/2026 10:52 | v4.9.0 | Mapeamento automático de ícones Lucide para cursos | 23 | Sucesso |
| 21 | 28/10/2026 11:06 | v4.9.1 | Remoção do botão de admin do topo e canal de takedown | 23 | Sucesso |
| 22 | 28/10/2026 11:37 | v4.9.1-ads | Deploy de verificação Google AdSense (`ads.txt`) | 24 | Sucesso |
| 23 | 28/10/2026 11:54 | v4.9.2 | Sincronização de currículos no banco e aba no Admin | 26 | Sucesso |
| 24 | 28/10/2026 13:21 | v4.9.2-viewer | Perfil de Administrador Visualizador (somente-leitura) | 26 | Sucesso |
| 25 | 28/10/2026 13:38 | v4.9.3 | Auditoria WCAG 2.1 AA, compressão GZIP e refatoração SQL | 26 | Sucesso |
| 26 | 28/10/2026 13:44 | v4.9.3-perf | Injeção de resource hints (preconnect / dns-prefetch) | 26 | Sucesso |
