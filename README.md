# 🎓 Você Pode Tudo (VCPDTD) — Portal Oficial de Cursos Gratuitos com Certificado

> **"Você Pode Tudo — Conhecimento ao seu alcance"**: O maior portal aberto e inclusivo de cursos online gratuitos e de alto impacto no Brasil.

Integramos toda a base oficial do portal **[www.vocepodetudo.com](https://vocepodetudo.netlify.app)** combinada com os maiores programas de capacitação pública e corporativa do país, totalizando **155 cursos gratuitos**, **8 trilhas de aprendizagem guiadas**, **segurança criptográfica de ponta** e **máxima indexabilidade nos motores de busca**.

---

## 🔒 Arquitetura de Segurança & Proteção de Dados

Para garantir a integridade dos dados e impedir acessos não autorizados:

1. **Criptografia SHA-256 com Salting (Web Cryptography API):**
   - Senhas de acesso nunca são armazenadas ou comparadas em texto puro.
   - Utilização de digest criptográfico `crypto.subtle.digest('SHA-256', ...)` com salting exclusivo de alta entropia.
   - Acesso de Administrador oficial: Usuário `admin` com autenticação segura BCRYPT e token HMAC.
2. **Proteção contra Ataques de Força Bruta (Rate Limiting):**
   - Monitoramento contínuo de tentativas de autenticação.
   - Após 5 tentativas incorretas, o acesso é automaticamente bloqueado por 5 minutos com exibição de temporizador regressivo no modal.
3. **Expiração Automática de Sessão (Anti-Hijacking):**
   - Sessões administrativas expiram automaticamente após 2 horas de inatividade.
4. **Proteção Anti-XSS (Cross-Site Scripting) & Sanitização de Links:**
   - Todos os dados renderizados passam por escape rigoroso de entidades HTML (`escapeHTML()`).
   - Todos os links externos são validados (`sanitizeUrl()`), bloqueando esquemas perigosos como `javascript:`, `data:` ou `vbscript:`.
   - Links externos utilizam `rel="noopener noreferrer"` para proteger contra exploração de `window.opener`.
5. **Alteração Segura de Senha do Administrador:**
   - O administrador autenticado pode redefinir sua senha diretamente pelo painel através do modal com validação de senha atual e nova criptografia em tempo real.
6. **Políticas de Cabeçalhos HTTP de Segurança (`_headers` e `netlify.toml`):**
   - `Strict-Transport-Security` (HSTS com preload).
   - `X-Content-Type-Options: nosniff`.
   - `X-Frame-Options: SAMEORIGIN`.
   - `Referrer-Policy: strict-origin-when-cross-origin`.
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

---

## 🌐 Otimização para Rastreamento & Indexação (SEO & Web Discoverability)

Para que o portal seja facilmente encontrado no Google, Bing, Yahoo e nas redes sociais:

1. **Meta Tags de Alta Relevância:**
   - Título e descrição otimizados com termos de alto volume de busca orgânica no Brasil.
   - Diretivas para robôs: `index, follow, max-image-preview:large, max-snippet:-1`.
   - Tag canônica oficial: `https://www.vocepodetudo.com/`.
2. **Dados Estruturados Schema.org (JSON-LD):**
   - Entidade `WebSite` com `SearchAction` (habilita caixa de pesquisa do site diretamente no resultado de busca do Google).
   - Entidade `EducationalOrganization` com logotipo oficial e descrição.
   - `ItemList` de cursos com preços zerados (`price: 0`, `isAccessibleForFree: true`), impulsionando o selo de curso gratuito nos resultados.
3. **Card Social Rich Snippets (Open Graph & Twitter Cards):**
   - Compartilhamento no WhatsApp, LinkedIn, Telegram e Twitter gera automaticamente card com imagem, título e descrição.
4. **Mapa do Site Oficial (`sitemap.xml`):**
   - Índice completo de URLs do portal, categorias e trilhas para rastreamento prioritário.
5. **Robots.txt Padronizado (`robots.txt`):**
   - Permissão universal de rastreamento com referência direta ao sitemap.
6. **Progressive Web App (`manifest.json`):**
   - Habilita instalação como aplicativo no Android, iOS e Windows, aumentando a pontuação nos critérios do Google Mobile-First Indexing.
7. **Deep-linking & Busca por URL:**
   - Suporte nativo a parâmetros de URL compartilháveis:
     - `?q=python`: Executa busca instantânea pelo termo.
     - `?categoria=tecnologia`: Filtra diretamente pela área.
     - `?trilha=ciberseguranca`: Ativa a trilha selecionada.
     - `?view=tracks`: Abre diretamente a visualização dos roteiros de trilhas.

---

## 🚀 8 Trilhas de Aprendizagem Guiadas

1. **💼 Primeiro Emprego (40h):** Currículo, entrevistas, direitos trabalhistas e postura corporativa.
2. **🖥️ Informática Básica Essencial (30h):** Windows, Word, Excel, PowerPoint, e-mail e segurança.
3. **💻 Formação Desenvolvedor Fullstack (80h):** Lógica, Git/GitHub, HTML5/CSS3, JavaScript, Python, SQL, REST APIs e React.
4. **🛡️ Cibersegurança & Defesa Digital (120h):** Hackers do Bem, redes Cisco e segurança Microsoft.
5. **🤖 Inteligência Artificial & Nuvem (60h):** Oracle ONE, IA Generativa Microsoft, AWS e Google Cloud.
6. **💡 Empreendedorismo & Criação de Negócios (50h):** Modelo Canvas, finanças, MEI e vendas.
7. **🏛️ Concursos Públicos & Carreiras de Estado (45h):** LGPD, Ética Pública (ENAP), Redação Oficial e Matemática Básica.
8. **📄 Melhorar Meu Currículo & Imagem Profissional (20h):** Currículo para ATS, LinkedIn campeão, portfólio digital e networking.

---

## 🚀 Como Executar

Dê um duplo clique no arquivo [`index.html`](file:///c:/Users/usuario/Downloads/VCPDTD%20ANTIGRAVITY/index.html) no seu navegador, ou inicie um servidor local leve:

```powershell
python -m http.server 3000
```
Depois abra `http://localhost:3000`.
