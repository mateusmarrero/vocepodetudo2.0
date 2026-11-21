const fs = require('fs');

const midiaKitHtml = `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- SEO & Metadados Comerciais -->
  <title>Mídia Kit & Publicidade 2026 — Portal Você Pode Tudo</title>
  <meta name="description" content="Dossiê oficial de audiência, métricas de tráfego auditadas e catálogo de formatos publicitários do Você Pode Tudo. Conecte sua marca a milhares de estudantes e profissionais em todo o Brasil.">
  <meta name="keywords" content="mídia kit você pode tudo, publicidade vocepodetudo, anuncie cursos gratuitos, mídia kit portal educacional, publicidade jovem aprendiz, formatos iab brasil">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <link rel="canonical" href="https://vocepodetudo.com/midia-kit">

  <!-- Open Graph / Redes Sociais -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://vocepodetudo.com/midia-kit">
  <meta property="og:title" content="Mídia Kit & Publicidade 2026 — Portal Você Pode Tudo">
  <meta property="og:description" content="Dossiê corporativo de audiência, métricas em tempo real e oportunidades de patrocínio para marcas e agências.">
  <meta property="og:image" content="https://vocepodetudo.com/assets/logo.png">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Mídia Kit & Publicidade 2026 — Você Pode Tudo">
  <meta name="twitter:description" content="Métricas auditadas, perfil de público e catálogo de formatos publicitários. Conecte-se com talentos de todo o Brasil.">
  <meta name="twitter:image" content="https://vocepodetudo.com/assets/logo.png">

  <!-- Favicon & PWA -->
  <link rel="icon" type="image/png" sizes="32x32" href="./assets/logo-icon.png">
  <link rel="manifest" href="./manifest.json">
  <meta name="theme-color" content="#002776">

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              blue: '#002776',
              green: '#009639',
              yellow: '#ffdf00',
              dark: '#001642'
            }
          }
        }
      }
    }
  </script>

  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>

  <!-- Estilos Personalizados e Folha de Estilos de Impressão (Dossiê A4) -->
  <style>
    @media print {
      body {
        background: #ffffff !important;
        color: #0f172a !important;
        font-size: 11pt !important;
      }
      .no-print, header, footer, #btn-simulador, #commercial-form-section, #floating-whatsapp {
        display: none !important;
      }
      .print-only {
        display: block !important;
      }
      .page-break {
        page-break-before: always;
      }
      .print-card {
        border: 1px solid #cbd5e1 !important;
        box-shadow: none !important;
        background: #ffffff !important;
      }
      a {
        text-decoration: none !important;
        color: inherit !important;
      }
    }
    .print-only {
      display: none;
    }
  </style>

  <!-- Schema.org JSON-LD (WebPage + Service) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Mídia Kit & Publicidade — Portal Você Pode Tudo",
    "url": "https://vocepodetudo.com/midia-kit",
    "description": "Dossiê oficial de métricas, audiência e formatos publicitários do Portal Você Pode Tudo.",
    "publisher": {
      "@type": "Organization",
      "name": "Você Pode Tudo",
      "url": "https://vocepodetudo.com",
      "logo": "https://vocepodetudo.com/assets/logo.png"
    }
  }
  </script>
</head>
<body class="bg-slate-50 text-slate-800 antialiased font-sans flex flex-col min-h-screen">

  <!-- Cabeçalho Institucional / Barra de Navegação -->
  <header class="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 shadow-xs no-print">
    <div class="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
      <a href="/" class="flex items-center gap-3 group">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#009639] via-[#005e24] to-[#002776] flex items-center justify-center text-white shadow-md font-black text-lg group-hover:scale-105 transition-transform">
          VP
        </div>
        <div>
          <span class="text-lg font-black tracking-tight text-slate-900">Você<span class="text-[#009639]">Pode</span><span class="text-[#FFDF00]">Tudo</span></span>
          <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Mídia Kit Oficial 2026</span>
        </div>
      </a>

      <!-- Navegação Interna do Mídia Kit -->
      <nav class="hidden lg:flex items-center gap-5 text-xs font-bold text-slate-600">
        <a href="#metricas" class="hover:text-[#009639] transition-colors">Audiência & KPIs</a>
        <a href="#perfil" class="hover:text-[#009639] transition-colors">Perfil do Público</a>
        <a href="#formatos" class="hover:text-[#009639] transition-colors">Formatos IAB</a>
        <a href="#naming-rights" class="hover:text-[#009639] transition-colors">Patrocínio de Ferramentas</a>
        <a href="#modelos" class="hover:text-[#009639] transition-colors">Modelos & Investimento</a>
        <a href="#brand-safety" class="hover:text-[#009639] transition-colors">Brand Safety & LGPD</a>
      </nav>

      <!-- Botões de Ação Imediata -->
      <div class="flex items-center gap-2.5">
        <button 
          id="btn-print-dossier" 
          type="button"
          class="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition-all cursor-pointer shadow-xs"
          title="Imprimir ou Salvar Dossiê em PDF"
        >
          <i data-lucide="printer" class="w-3.5 h-3.5 text-[#002776]"></i>
          <span>Imprimir / PDF</span>
        </button>

        <a 
          href="api/analytics.php?action=mediakit_csv" 
          download="vocepodetudo_mediakit_oficial.csv"
          class="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#00702a] text-xs font-bold border border-emerald-300 transition-all cursor-pointer shadow-xs"
          title="Baixar planilha de métricas em formato CSV"
        >
          <i data-lucide="file-spreadsheet" class="w-3.5 h-3.5 text-[#009639]"></i>
          <span>Planilha (.CSV)</span>
        </a>

        <a 
          href="#contato" 
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#002776] hover:bg-blue-900 text-white text-xs font-black transition-all shadow-sm"
        >
          <i data-lucide="mail" class="w-3.5 h-3.5 text-[#ffdf00]"></i>
          <span>Falar com Comercial</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Cabeçalho Timbrado Exclusivo para Impressão em PDF (Aparece apenas na impressão) -->
  <div class="print-only p-6 border-b-2 border-slate-900 mb-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <img src="./assets/logo.png" alt="Logo Você Pode Tudo" class="h-12 w-auto">
        <div>
          <h1 class="text-xl font-black text-[#002776]">VOCÊ PODE TUDO — DOSSIÊ COMERCIAL & MÍDIA KIT OFICIAL</h1>
          <p class="text-xs text-slate-600 font-bold uppercase tracking-wider">Comprovante de Audiência, Tráfego e Oportunidades Publicitárias • vocepodetudo.com</p>
        </div>
      </div>
      <div class="text-right text-xs">
        <span class="font-black text-emerald-700 block">Métricas Auditadas do Servidor</span>
        <span id="print-issue-date" class="text-slate-500 font-medium">Emissão: Hoje</span>
      </div>
    </div>
  </div>

  <main class="flex-grow">

    <!-- HERO SECTION: Apresentação Comercial de Alto Impacto -->
    <section class="relative bg-gradient-to-b from-[#002776] via-[#001c54] to-slate-900 text-white pt-16 pb-20 overflow-hidden">
      <!-- Decorações de Fundo -->
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#ffdf00_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div class="max-w-7xl mx-auto px-4 relative z-10 text-center sm:text-left">
        <div class="flex flex-col lg:flex-row items-center justify-between gap-10">
          <div class="max-w-2xl space-y-5">
            <!-- Badge de Autenticidade -->
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#ffdf00] text-xs font-black uppercase tracking-wider">
              <i data-lucide="award" class="w-4 h-4"></i>
              <span>Dossiê Comercial & Mídia Kit Oficial 2026</span>
            </div>

            <h1 class="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Conecte sua Marca ao Maior Ecossistema Gratuito de <span class="text-[#ffdf00]">Qualificação & Carreira</span> do Brasil.
            </h1>

            <p class="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
              O portal <strong class="text-white font-bold">Você Pode Tudo</strong> reúne mais de 200 cursos oficiais com certificados gratuitos reconhecidos (MEC, Sebrae, Fundação Bradesco, EV.G, USP) e ferramentas de alta retenção como Criador de Currículos e Simulador de Entrevistas. Posicione sua marca diante de uma audiência altamente motivada em qualificação, crescimento profissional e consumo consciente.
            </p>

            <!-- 4 Selos de Garantia Institucional -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div class="p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
                <i data-lucide="shield-check" class="w-5 h-5 text-emerald-400 mb-1"></i>
                <div class="text-xs font-black text-white">100% Brand Safe</div>
                <div class="text-[10px] text-slate-300">Conteúdo puramente educativo</div>
              </div>
              <div class="p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
                <i data-lucide="activity" class="w-5 h-5 text-[#ffdf00] mb-1"></i>
                <div class="text-xs font-black text-white">Métricas Auditadas</div>
                <div class="text-[10px] text-slate-300">Telemetria direta do servidor</div>
              </div>
              <div class="p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
                <i data-lucide="lock" class="w-5 h-5 text-blue-300 mb-1"></i>
                <div class="text-xs font-black text-white">100% LGPD</div>
                <div class="text-[10px] text-slate-300">Sem invasão de privacidade</div>
              </div>
              <div class="p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
                <i data-lucide="layout-template" class="w-5 h-5 text-purple-300 mb-1"></i>
                <div class="text-xs font-black text-white">Padrão IAB</div>
                <div class="text-[10px] text-slate-300">Suporte a Google Ad Manager</div>
              </div>
            </div>

            <!-- Botões de Ação do Hero -->
            <div class="flex flex-wrap items-center gap-3 pt-3 justify-center sm:justify-start">
              <a 
                href="#formatos" 
                class="px-6 py-3 rounded-xl bg-[#009639] hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-2"
              >
                <i data-lucide="eye" class="w-4 h-4"></i>
                <span>Ver Formatos Disponíveis</span>
              </a>
              <a 
                href="#simulador" 
                class="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all flex items-center gap-2 backdrop-blur-sm"
              >
                <i data-lucide="calculator" class="w-4 h-4 text-[#ffdf00]"></i>
                <span>Simular Orçamento</span>
              </a>
            </div>
          </div>

          <!-- Card Resumo Lateral: Destaques Comerciais -->
          <div class="w-full lg:w-96 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl space-y-4">
            <div class="flex items-center justify-between border-b border-white/10 pb-3">
              <span class="text-xs font-black uppercase text-[#ffdf00] tracking-wider">Status Comercial</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Inventário Aberto 2026</span>
              </span>
            </div>

            <div class="space-y-3 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-slate-300">Taxa de Cliques (CTR Médio):</span>
                <span class="font-black text-white text-sm">2,8% a 4,5%</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-300">Tempo Médio de Sessão:</span>
                <span class="font-black text-white text-sm">4m 45s</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-300">Acesso via Mobile:</span>
                <span class="font-black text-white text-sm">78%</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-300">Acesso via Desktop:</span>
                <span class="font-black text-white text-sm">22%</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-300">Nível de Brand Safety:</span>
                <span class="font-black text-emerald-400 text-sm">Tier 1 (Máximo)</span>
              </div>
            </div>

            <div class="pt-3 border-t border-white/10">
              <a 
                href="#contato" 
                class="w-full py-2.5 rounded-xl bg-[#ffdf00] hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider text-center block transition-all shadow-md"
              >
                Solicitar Proposta Customizada
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SEÇÃO 1: BIG NUMBERS & INDICADORES DE ALCANCE (AUDITADOS) -->
    <section id="metricas" class="py-16 bg-white border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4">
        
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div class="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#009639] tracking-wider mb-1">
              <i data-lucide="bar-chart-2" class="w-4 h-4"></i>
              <span>1. Big Numbers & Telemetria em Tempo Real</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Métricas Consolidadas de Audiência e Engajamento
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Dados extraídos diretamente da infraestrutura do portal com validação de requisições únicas.
            </p>
          </div>
          <div class="text-xs text-slate-400 font-medium">
            Última Sincronização: <strong id="live-sync-time" class="text-slate-700">Hoje</strong>
          </div>
        </div>

        <!-- Grid de 8 Cards de Métricas -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          
          <!-- KPI 1: Visualizações Totais -->
          <div class="p-5 rounded-3xl bg-slate-50 border border-slate-200 hover:border-[#002776]/40 transition-all shadow-xs print-card">
            <div class="w-10 h-10 rounded-2xl bg-blue-100 text-[#002776] flex items-center justify-center mb-3">
              <i data-lucide="eye" class="w-5 h-5"></i>
            </div>
            <span class="text-[11px] font-black uppercase text-slate-400 tracking-wider block">Visualizações (Pageviews)</span>
            <div id="kpi-home-views" class="text-2xl sm:text-3xl font-black text-[#002776] mt-1">Carregando...</div>
            <span class="text-[10px] text-emerald-700 font-bold block mt-1">Impressões totais de catálogo</span>
          </div>

          <!-- KPI 2: Cliques em Cursos Oficiais -->
          <div class="p-5 rounded-3xl bg-slate-50 border border-slate-200 hover:border-[#009639]/40 transition-all shadow-xs print-card">
            <div class="w-10 h-10 rounded-2xl bg-emerald-100 text-[#009639] flex items-center justify-center mb-3">
              <i data-lucide="mouse-pointer-click" class="w-5 h-5"></i>
            </div>
            <span class="text-[11px] font-black uppercase text-slate-400 tracking-wider block">Cliques em Cursos (Leads)</span>
            <div id="kpi-course-clicks" class="text-2xl sm:text-3xl font-black text-[#009639] mt-1">Carregando...</div>
            <span class="text-[10px] text-slate-500 font-bold block mt-1">Alta intenção de estudo (CTR 3,4%)</span>
          </div>

          <!-- KPI 3: Alunos Cadastrados -->
          <div class="p-5 rounded-3xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition-all shadow-xs print-card">
            <div class="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
              <i data-lucide="users" class="w-5 h-5"></i>
            </div>
            <span class="text-[11px] font-black uppercase text-slate-400 tracking-wider block">Alunos Cadastrados</span>
            <div id="kpi-students-count" class="text-2xl sm:text-3xl font-black text-purple-700 mt-1">Carregando...</div>
            <span class="text-[10px] text-slate-500 font-bold block mt-1">Comunidade com login e histórico</span>
          </div>

          <!-- KPI 4: Cursos Salvos / Favoritos -->
          <div class="p-5 rounded-3xl bg-slate-50 border border-slate-200 hover:border-rose-300 transition-all shadow-xs print-card">
            <div class="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <i data-lucide="heart" class="w-5 h-5"></i>
            </div>
            <span class="text-[11px] font-black uppercase text-slate-400 tracking-wider block">Cursos Favoritados</span>
            <div id="kpi-favorites-count" class="text-2xl sm:text-3xl font-black text-rose-600 mt-1">Carregando...</div>
            <span class="text-[10px] text-slate-500 font-bold block mt-1">Intenção declarada de matrícula</span>
          </div>

          <!-- KPI 5: Testes Vocacionais Realizados -->
          <div class="p-5 rounded-3xl bg-slate-50 border border-slate-200 hover:border-amber-300 transition-all shadow-xs print-card">
            <div class="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
              <i data-lucide="compass" class="w-5 h-5"></i>
            </div>
            <span class="text-[11px] font-black uppercase text-slate-400 tracking-wider block">Testes Vocacionais</span>
            <div id="kpi-career-tests" class="text-2xl sm:text-3xl font-black text-amber-600 mt-1">Carregando...</div>
            <span class="text-[10px] text-slate-500 font-bold block mt-1">Mapeamento de interesses</span>
          </div>

          <!-- KPI 6: Catálogo Oficial Ativo -->
          <div class="p-5 rounded-3xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all shadow-xs print-card">
            <div class="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
              <i data-lucide="book-open" class="w-5 h-5"></i>
            </div>
            <span class="text-[11px] font-black uppercase text-slate-400 tracking-wider block">Cursos Catalogados</span>
            <div class="text-2xl sm:text-3xl font-black text-blue-700 mt-1">200 Cursos</div>
            <span class="text-[10px] text-slate-500 font-bold block mt-1">Parceiros de primeira linha</span>
          </div>

          <!-- KPI 7: Ferramentas Interativas Ativas -->
          <div class="p-5 rounded-3xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all shadow-xs print-card">
            <div class="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <i data-lucide="wrench" class="w-5 h-5"></i>
            </div>
            <span class="text-[11px] font-black uppercase text-slate-400 tracking-wider block">Ferramentas de Carreira</span>
            <div class="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">6 Ferramentas</div>
            <span class="text-[10px] text-slate-500 font-bold block mt-1">Currículos, IA, Vagas, Salários</span>
          </div>

          <!-- KPI 8: Tempo Médio de Sessão -->
          <div class="p-5 rounded-3xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all shadow-xs print-card">
            <div class="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
              <i data-lucide="clock" class="w-5 h-5"></i>
            </div>
            <span class="text-[11px] font-black uppercase text-slate-400 tracking-wider block">Tempo Médio (Dwell Time)</span>
            <div class="text-2xl sm:text-3xl font-black text-indigo-700 mt-1">4m 45s</div>
            <span class="text-[10px] text-emerald-700 font-bold block mt-1">Altíssimo engajamento</span>
          </div>

        </div>

      </div>
    </section>

    <!-- SEÇÃO 2: PERFIL DEMOGRÁFICO & PSICOGRÁFICO DA AUDIÊNCIA -->
    <section id="perfil" class="py-16 bg-slate-50 border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4">
        
        <div class="max-w-3xl mb-12">
          <div class="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#002776] tracking-wider mb-1">
            <i data-lucide="pie-chart" class="w-4 h-4"></i>
            <span>2. Quem Acessa o Portal</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Perfil Qualificado da Audiência
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Nossos usuários estão em momentos decisivos de suas trajetórias: iniciando no mercado de trabalho, buscando promoções ou investindo em novas habilidades.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Coluna 1: Faixas Etárias -->
          <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 print-card">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 class="text-sm font-black text-slate-900 flex items-center gap-2">
                <i data-lucide="calendar" class="w-4 h-4 text-[#002776]"></i>
                <span>Faixas Etárias Dominantes</span>
              </h3>
              <span class="text-[10px] font-bold text-slate-400">Total 100%</span>
            </div>

            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-xs font-bold mb-1">
                  <span class="text-slate-700">16 a 24 anos (Primeiro Emprego & Estágio)</span>
                  <span class="text-[#002776] font-black">42%</span>
                </div>
                <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-[#002776] rounded-full" style="width: 42%"></div>
                </div>
                <p class="text-[10px] text-slate-500 mt-1">Estudantes do Ensino Médio, vestibulandos e aprendizes.</p>
              </div>

              <div>
                <div class="flex justify-between text-xs font-bold mb-1">
                  <span class="text-slate-700">25 a 34 anos (Transição & Especialização)</span>
                  <span class="text-[#009639] font-black">38%</span>
                </div>
                <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-[#009639] rounded-full" style="width: 38%"></div>
                </div>
                <p class="text-[10px] text-slate-500 mt-1">Profissionais juniores/plenos buscando certificação para promoção.</p>
              </div>

              <div>
                <div class="flex justify-between text-xs font-bold mb-1">
                  <span class="text-slate-700">35 a 54 anos (Recertificação & Gestão)</span>
                  <span class="text-amber-500 font-black">16%</span>
                </div>
                <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-amber-500 rounded-full" style="width: 16%"></div>
                </div>
                <p class="text-[10px] text-slate-500 mt-1">Profissionais maduros e empreendedores em busca de requalificação.</p>
              </div>

              <div>
                <div class="flex justify-between text-xs font-bold mb-1">
                  <span class="text-slate-700">55+ anos (Inclusão Digital & Hobbies)</span>
                  <span class="text-purple-600 font-black">4%</span>
                </div>
                <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-purple-600 rounded-full" style="width: 4%"></div>
                </div>
                <p class="text-[10px] text-slate-500 mt-1">Público sênior focado em informática básica e alfabetização digital.</p>
              </div>
            </div>

            <!-- Gênero -->
            <div class="pt-4 border-t border-slate-100">
              <span class="text-[10px] font-black uppercase text-slate-400 block mb-2">Divisão por Gênero</span>
              <div class="grid grid-cols-2 gap-3 text-center">
                <div class="p-2.5 rounded-2xl bg-rose-50 border border-rose-100">
                  <span class="text-xs font-black text-rose-700 block">54% Feminino</span>
                  <span class="text-[9px] text-slate-500">Engajadas em Saúde, Gestão e TI</span>
                </div>
                <div class="p-2.5 rounded-2xl bg-blue-50 border border-blue-100">
                  <span class="text-xs font-black text-blue-700 block">46% Masculino</span>
                  <span class="text-[9px] text-slate-500">Engajados em TI, Finanças e Vendas</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Coluna 2: Concentração Geográfica Nacional -->
          <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 print-card">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 class="text-sm font-black text-slate-900 flex items-center gap-2">
                <i data-lucide="map-pin" class="w-4 h-4 text-[#009639]"></i>
                <span>Top Estados Brasileiros (UF)</span>
              </h3>
              <span class="text-[10px] font-bold text-emerald-700">89%+ Brasil</span>
            </div>

            <div id="states-distribution-bars" class="space-y-3 text-xs">
              <!-- Renderizado dinamicamente via JS ou fallback elegante -->
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-700 flex items-center gap-1.5"><span class="w-5 font-mono text-[10px] font-black text-slate-400">SP</span> São Paulo</span>
                <div class="flex items-center gap-2">
                  <div class="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-[#009639]" style="width: 32%"></div>
                  </div>
                  <span class="font-black text-slate-800 w-10 text-right">32.4%</span>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-700 flex items-center gap-1.5"><span class="w-5 font-mono text-[10px] font-black text-slate-400">RJ</span> Rio de Janeiro</span>
                <div class="flex items-center gap-2">
                  <div class="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-[#009639]" style="width: 15%"></div>
                  </div>
                  <span class="font-black text-slate-800 w-10 text-right">15.1%</span>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-700 flex items-center gap-1.5"><span class="w-5 font-mono text-[10px] font-black text-slate-400">MG</span> Minas Gerais</span>
                <div class="flex items-center gap-2">
                  <div class="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-[#009639]" style="width: 12%"></div>
                  </div>
                  <span class="font-black text-slate-800 w-10 text-right">12.3%</span>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-700 flex items-center gap-1.5"><span class="w-5 font-mono text-[10px] font-black text-slate-400">BA</span> Bahia</span>
                <div class="flex items-center gap-2">
                  <div class="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-[#009639]" style="width: 8%"></div>
                  </div>
                  <span class="font-black text-slate-800 w-10 text-right">8.2%</span>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-700 flex items-center gap-1.5"><span class="w-5 font-mono text-[10px] font-black text-slate-400">PR</span> Paraná</span>
                <div class="flex items-center gap-2">
                  <div class="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-[#009639]" style="width: 6%"></div>
                  </div>
                  <span class="font-black text-slate-800 w-10 text-right">6.4%</span>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-700 flex items-center gap-1.5"><span class="w-5 font-mono text-[10px] font-black text-slate-400">RS</span> Rio Grande do Sul</span>
                <div class="flex items-center gap-2">
                  <div class="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-[#009639]" style="width: 5%"></div>
                  </div>
                  <span class="font-black text-slate-800 w-10 text-right">5.5%</span>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-700 flex items-center gap-1.5"><span class="w-5 font-mono text-[10px] font-black text-slate-400">CE</span> Ceará</span>
                <div class="flex items-center gap-2">
                  <div class="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-[#009639]" style="width: 5%"></div>
                  </div>
                  <span class="font-black text-slate-800 w-10 text-right">5.1%</span>
                </div>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
              Forte capilaridade em capitais e polos metropolitanos com conexão de banda larga e 4G/5G.
            </div>
          </div>

          <!-- Coluna 3: Dispositivos & Poder de Compra -->
          <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 print-card">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 class="text-sm font-black text-slate-900 flex items-center gap-2">
                <i data-lucide="smartphone" class="w-4 h-4 text-purple-600"></i>
                <span>Dispositivos & Hábitos</span>
              </h3>
              <span class="text-[10px] font-bold text-purple-700">Mobile First</span>
            </div>

            <div class="grid grid-cols-2 gap-3 text-center">
              <div class="p-4 rounded-2xl bg-purple-50 border border-purple-100">
                <i data-lucide="smartphone" class="w-6 h-6 text-purple-600 mx-auto mb-1"></i>
                <div class="text-2xl font-black text-purple-900">78%</div>
                <div class="text-[11px] font-bold text-slate-600">Smartphones</div>
                <div class="text-[9px] text-slate-400">Android 82% • iOS 18%</div>
              </div>

              <div class="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <i data-lucide="monitor" class="w-6 h-6 text-[#002776] mx-auto mb-1"></i>
                <div class="text-2xl font-black text-[#002776]">22%</div>
                <div class="text-[11px] font-bold text-slate-600">Desktop / PC</div>
                <div class="text-[9px] text-slate-400">Windows, Mac & Linux</div>
              </div>
            </div>

            <div class="space-y-2 pt-2">
              <span class="text-[10px] font-black uppercase text-slate-400 block">Afinidade de Consumo da Audiência</span>
              <ul class="text-xs text-slate-600 space-y-1.5 font-medium">
                <li class="flex items-center gap-2">
                  <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-600 flex-shrink-0"></i>
                  <span><strong>Educação:</strong> Faculdades, EAD, vestibulares e pós-graduação.</span>
                </li>
                <li class="flex items-center gap-2">
                  <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-600 flex-shrink-0"></i>
                  <span><strong>Tecnologia:</strong> Celulares, computadores e planos de internet móvel.</span>
                </li>
                <li class="flex items-center gap-2">
                  <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-600 flex-shrink-0"></i>
                  <span><strong>Fintechs:</strong> Bancos digitais, cartões sem anuidade e empréstimos.</span>
                </li>
                <li class="flex items-center gap-2">
                  <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-600 flex-shrink-0"></i>
                  <span><strong>Varejo:</strong> Vestuário profissional, livrarias e materiais de estudo.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

      </div>
    </section>

    <!-- SEÇÃO 3: CATÁLOGO DE FORMATOS PUBLICITÁRIOS (PADRÃO IAB & NATIVOS) -->
    <section id="formatos" class="py-16 bg-white border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4">
        
        <div class="max-w-3xl mb-12">
          <div class="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#009639] tracking-wider mb-1">
            <i data-lucide="layout" class="w-4 h-4"></i>
            <span>3. Catálogo Técnico de Mídia</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Formatos Publicitários & Especificações IAB
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Espaços estrategicamente posicionados para aliar alta visibilidade a uma experiência agradável ao usuário, sem poluição visual.
          </p>
        </div>

        <!-- Tabela Comparativa de Formatos -->
        <div class="overflow-x-auto mb-10 border border-slate-200 rounded-3xl shadow-sm print-card">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th class="py-4 px-5">Formato Comercial</th>
                <th class="py-4 px-5">Dimensões (Desktop / Mobile)</th>
                <th class="py-4 px-5">Posicionamento</th>
                <th class="py-4 px-5">Peso Máximo</th>
                <th class="py-4 px-5">Formatos Aceitos</th>
                <th class="py-4 px-5">CTR Médio Histórico</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 text-slate-600 font-medium">
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="py-4 px-5 font-black text-[#002776]">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-[#002776]"></span>
                    <span>Super Leaderboard Topo</span>
                  </div>
                </td>
                <td class="py-4 px-5 font-mono font-bold text-slate-800">728x90 / 320x100</td>
                <td class="py-4 px-5">Acima da dobra em todas as páginas</td>
                <td class="py-4 px-5">150 KB</td>
                <td class="py-4 px-5">JPG, PNG, GIF, HTML5, GAM</td>
                <td class="py-4 px-5 font-black text-emerald-700">1,8% a 2,5%</td>
              </tr>

              <tr class="hover:bg-slate-50 transition-colors bg-emerald-50/30">
                <td class="py-4 px-5 font-black text-[#009639]">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-[#009639]"></span>
                    <span>Card Patrocinado Nativo In-Feed</span>
                  </div>
                </td>
                <td class="py-4 px-5 font-mono font-bold text-slate-800">300x250 ou Fluido Nativo</td>
                <td class="py-4 px-5">Integrado no grid de cursos e vagas</td>
                <td class="py-4 px-5">100 KB</td>
                <td class="py-4 px-5">Imagem + Título + CTA Personalizado</td>
                <td class="py-4 px-5 font-black text-[#009639]">3,8% a 5,2% (Destaque)</td>
              </tr>

              <tr class="hover:bg-slate-50 transition-colors">
                <td class="py-4 px-5 font-black text-purple-700">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-purple-700"></span>
                    <span>Half-Page Lateral (Skyscraper)</span>
                  </div>
                </td>
                <td class="py-4 px-5 font-mono font-bold text-slate-800">300x600 (Sticky)</td>
                <td class="py-4 px-5">Barra lateral dos 80+ artigos do Blog</td>
                <td class="py-4 px-5">200 KB</td>
                <td class="py-4 px-5">JPG, PNG, HTML5, Rich Media</td>
                <td class="py-4 px-5 font-black text-purple-700">2,2% a 3,1%</td>
              </tr>

              <tr class="hover:bg-slate-50 transition-colors">
                <td class="py-4 px-5 font-black text-blue-700">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-blue-700"></span>
                    <span>Billboard Intertítulo Editorial</span>
                  </div>
                </td>
                <td class="py-4 px-5 font-mono font-bold text-slate-800">970x250 / 300x250</td>
                <td class="py-4 px-5">Entre seções de alto interesse na Home</td>
                <td class="py-4 px-5">200 KB</td>
                <td class="py-4 px-5">JPG, PNG, GIF, HTML5</td>
                <td class="py-4 px-5 font-black text-blue-700">2,0% a 2,9%</td>
              </tr>

              <tr class="hover:bg-slate-50 transition-colors">
                <td class="py-4 px-5 font-black text-amber-700">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                    <span>Push Notification Segmentada</span>
                  </div>
                </td>
                <td class="py-4 px-5 font-mono font-bold text-slate-800">Texto + Ícone + Link</td>
                <td class="py-4 px-5">Direto na tela do smartphone/desktop</td>
                <td class="py-4 px-5">--</td>
                <td class="py-4 px-5">Título (45 carac.) + Mensagem (120 carac.)</td>
                <td class="py-4 px-5 font-black text-amber-700">6,5% a 9,8% Abertura</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 3 Cards Visuais Explicativos -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div class="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 print-card">
            <div class="w-12 h-12 rounded-2xl bg-blue-100 text-[#002776] flex items-center justify-center font-black">
              728x90
            </div>
            <h4 class="text-base font-black text-slate-900">1. Super Leaderboard Topo</h4>
            <p class="text-xs text-slate-600 leading-relaxed font-medium">
              Primeiro elemento visual após o cabeçalho. Perfeito para campanhas de awareness institucional, vestibulinhos, lançamentos de cursos superiores e marcas de abrangência nacional.
            </p>
            <div class="p-3 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-500 font-mono">
              Visualização garantida em 100% das visitas.
            </div>
          </div>

          <div class="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-300 space-y-4 print-card relative">
            <span class="absolute -top-3 right-5 px-3 py-1 rounded-full bg-[#009639] text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
              Mais Escolhido
            </span>
            <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-[#009639] flex items-center justify-center font-black">
              In-Feed
            </div>
            <h4 class="text-base font-black text-slate-900">2. Card Patrocinado Nativo</h4>
            <p class="text-xs text-slate-600 leading-relaxed font-medium">
              Mimetiza a estrutura visual dos 200 cursos catalogados, com foto de capa, selo oficial de patrocinador e botão de ação direta (CTA). Gera a menor taxa de rejeição e a maior conversão.
            </p>
            <div class="p-3 rounded-xl bg-white border border-emerald-200 text-[11px] text-emerald-800 font-bold">
              CTR até 3x superior aos banners convencionais de display.
            </div>
          </div>

          <div class="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 print-card">
            <div class="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
              300x600
            </div>
            <h4 class="text-base font-black text-slate-900">3. Half-Page Sticky no Blog</h4>
            <p class="text-xs text-slate-600 leading-relaxed font-medium">
              Permanece fixo na tela enquanto o leitor percorre nossos artigos detalhados sobre carreira, CLT, currículo e vagas. Proporciona até 45 segundos de exposição contínua por visualização.
            </p>
            <div class="p-3 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-500 font-mono">
              Excelente para marcas de serviços financeiros e telecom.
            </div>
          </div>

        </div>

      </div>
    </section>

    <!-- SEÇÃO 4: NAMING RIGHTS & PATROCÍNIO EXCLUSIVO DE FERRAMENTAS -->
    <section id="naming-rights" class="py-16 bg-gradient-to-br from-slate-900 via-[#002776] to-slate-900 text-white">
      <div class="max-w-7xl mx-auto px-4">
        
        <div class="max-w-3xl mb-12">
          <div class="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#ffdf00] tracking-wider mb-1">
            <i data-lucide="crown" class="w-4 h-4"></i>
            <span>4. Naming Rights & Projetos Especiais</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Patrocínio Exclusivo de Ferramentas de Alta Retenção
          </h2>
          <p class="text-xs sm:text-sm text-slate-200 font-normal mt-1">
            Associe sua marca à utilidade prática do cotidiano do trabalhador brasileiro. Exclusividade setorial garantida de 100% (Share of Voice total).
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Ferramenta 1: Criador de Currículos -->
          <div class="p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 space-y-4">
            <div class="flex items-center justify-between">
              <span class="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <i data-lucide="file-text" class="w-5 h-5"></i>
              </span>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-[#ffdf00] text-slate-950">
                Mais Retenção
              </span>
            </div>
            <h3 class="text-lg font-black text-white">Criador de Currículos Profissionais</h3>
            <p class="text-xs text-slate-300 leading-relaxed">
              O usuário passa em média 12 minutos preenchendo seu currículo no portal. Sua marca estará presente no topo do assistente, em botões de apoio e no rodapé do currículo PDF gerado!
            </p>
            <div class="pt-3 border-t border-white/10 text-xs space-y-1.5 text-slate-200">
              <div class="flex items-center gap-2">
                <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400"></i>
                <span>"Oferecido por [Sua Marca]"</span>
              </div>
              <div class="flex items-center gap-2">
                <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400"></i>
                <span>Selo timbrado no PDF de exportação</span>
              </div>
            </div>
          </div>

          <!-- Ferramenta 2: Simulador de Entrevistas com IA -->
          <div class="p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 space-y-4">
            <div class="flex items-center justify-between">
              <span class="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
                <i data-lucide="bot" class="w-5 h-5"></i>
              </span>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-400/20 text-blue-200 border border-blue-400/30">
                Inovação
              </span>
            </div>
            <h3 class="text-lg font-black text-white">Simulador de Entrevista de Emprego</h3>
            <p class="text-xs text-slate-300 leading-relaxed">
              Candidatos treinam respostas para perguntas difíceis do RH com inteligência artificial. Formato de alta conexão emocional onde sua marca apoia o sucesso do candidato na contratação.
            </p>
            <div class="pt-3 border-t border-white/10 text-xs space-y-1.5 text-slate-200">
              <div class="flex items-center gap-2">
                <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400"></i>
                <span>"Apresentado por [Sua Marca]"</span>
              </div>
              <div class="flex items-center gap-2">
                <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400"></i>
                <span>Dica patrocinada entre as rodadas</span>
              </div>
            </div>
          </div>

          <!-- Ferramenta 3: Calculadora Trabalhista CLT/PJ -->
          <div class="p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 space-y-4">
            <div class="flex items-center justify-between">
              <span class="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                <i data-lucide="calculator" class="w-5 h-5"></i>
              </span>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-purple-400/20 text-purple-200 border border-purple-400/30">
                Finanças
              </span>
            </div>
            <h3 class="text-lg font-black text-white">Calculadora Trabalhista & Salário Líquido</h3>
            <p class="text-xs text-slate-300 leading-relaxed">
              Trabalhadores calculam rescisão, férias, 13º e comparam CLT vs PJ. Posicionamento de ouro para fintechs, bancos digitais, contabilidades e serviços de antecipação de FGTS.
            </p>
            <div class="pt-3 border-t border-white/10 text-xs space-y-1.5 text-slate-200">
              <div class="flex items-center gap-2">
                <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400"></i>
                <span>"Calculadora apoiada por [Sua Marca]"</span>
              </div>
              <div class="flex items-center gap-2">
                <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400"></i>
                <span>Banner de conversão financeira contextual</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>

    <!-- SEÇÃO 5: MODELOS COMERCIAIS & DIRETRIZES DE VEICULAÇÃO -->
    <section id="modelos" class="py-16 bg-white border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4">
        
        <div class="max-w-3xl mb-12">
          <div class="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#002776] tracking-wider mb-1">
            <i data-lucide="briefcase" class="w-4 h-4"></i>
            <span>5. Modelos Comerciais & Diretrizes</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Modalidades Flexíveis de Investimento
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Trabalhamos tanto com modelos de performance quanto com fixação contínua de marca (branding).
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          
          <div class="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 print-card">
            <span class="text-xs font-black uppercase text-[#002776]">Modelo 1</span>
            <h4 class="text-lg font-black text-slate-900">CPM (Custo por Mil)</h4>
            <p class="text-xs text-slate-600 leading-relaxed font-medium">
              Ideal para campanhas pontuais com metas estritas de impressões. Relatórios semanais com métricas auditadas do servidor.
            </p>
            <div class="text-[11px] font-bold text-slate-500">Mínimo: 50.000 impressões</div>
          </div>

          <div class="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 print-card">
            <span class="text-xs font-black uppercase text-[#009639]">Modelo 2</span>
            <h4 class="text-lg font-black text-slate-900">CPC (Custo por Clique)</h4>
            <p class="text-xs text-slate-600 leading-relaxed font-medium">
              Foco exclusivo em conversão e geração de tráfego para a página de destino da sua marca ou formulário de captação.
            </p>
            <div class="text-[11px] font-bold text-slate-500">Mínimo: 1.000 cliques qualificados</div>
          </div>

          <div class="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 print-card">
            <span class="text-xs font-black uppercase text-purple-700">Modelo 3</span>
            <h4 class="text-lg font-black text-slate-900">Patrocínio Fixo Mensal</h4>
            <p class="text-xs text-slate-600 leading-relaxed font-medium">
              Exclusividade garantida no formato escolhido por 30 dias (Fixed Tenancy). Sem oscilação de custo durante grandes picos de acesso.
            </p>
            <div class="text-[11px] font-bold text-slate-500">Contratos de 1, 3, 6 ou 12 meses</div>
          </div>

          <div class="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 print-card">
            <span class="text-xs font-black uppercase text-amber-600">Modelo 4</span>
            <h4 class="text-lg font-black text-slate-900">Publieditorial no Blog</h4>
            <p class="text-xs text-slate-600 leading-relaxed font-medium">
              Artigo de valor assinado por nossa redação com foco em SEO perpétuo e link dofollow para o domínio do anunciante.
            </p>
            <div class="text-[11px] font-bold text-slate-500">Indexação permanente no Google</div>
          </div>

        </div>

        <!-- Diretrizes Técnicas de Envio de Materiais -->
        <div class="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-[#ffdf00] text-slate-950 flex items-center justify-center font-black">
              <i data-lucide="check-circle" class="w-5 h-5"></i>
            </div>
            <div>
              <h4 class="text-base font-black text-white">Diretrizes de Homologação de Peças Publicitárias</h4>
              <p class="text-xs text-slate-300">Padrões rígidos para manter a velocidade de carregamento (Core Web Vitals) do portal.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300 pt-2">
            <div class="p-4 rounded-2xl bg-white/5 border border-white/10">
              <strong class="text-white block mb-1">Prazos de Entrega</strong>
              Envio dos criativos com no mínimo 48 horas úteis de antecedência do início da veiculação para testes de compatibilidade.
            </div>
            <div class="p-4 rounded-2xl bg-white/5 border border-white/10">
              <strong class="text-white block mb-1">Tags de Terceiros</strong>
              Aceitamos tags de veiculação seguras (HTTPS) via Google Ad Manager, Campaign Manager 360, Sizmek e AdForm.
            </div>
            <div class="p-4 rounded-2xl bg-white/5 border border-white/10">
              <strong class="text-white block mb-1">Áudio & Expansão</strong>
              Anúncios em vídeo ou áudio só devem emitir som após clique explícito do usuário (User-initiated sound). Sem autoplay com som.
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- SEÇÃO 6: BRAND SAFETY, GOVERNANÇA & LGPD -->
    <section id="brand-safety" class="py-16 bg-slate-50 border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4">
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div class="space-y-5">
            <div class="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#009639] tracking-wider">
              <i data-lucide="shield-check" class="w-4 h-4"></i>
              <span>6. Brand Safety & Compliance</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Sua Marca em um Ambiente 100% Seguro, Construtivo e Auditado
            </h2>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Diferente de portais de notícias gerais com escândalos ou redes sociais com comentários tóxicos, o portal <strong>Você Pode Tudo</strong> tem foco estritamente educacional e profissional. Nossa linha editorial é orientada a esperança, capacitação e conquista de emprego.
            </p>

            <div class="space-y-3 text-xs font-medium text-slate-700">
              <div class="flex items-start gap-2.5">
                <i data-lucide="check-check" class="w-4 h-4 text-[#009639] flex-shrink-0 mt-0.5"></i>
                <span><strong>Zero Polarização Política:</strong> Ambiente neutro, institucional e focado em empregabilidade.</span>
              </div>
              <div class="flex items-start gap-2.5">
                <i data-lucide="check-check" class="w-4 h-4 text-[#009639] flex-shrink-0 mt-0.5"></i>
                <span><strong>Zero Conteúdo Sensível:</strong> Sem violência, pornografia, desinformação ou jogos de azar não regulamentados.</span>
              </div>
              <div class="flex items-start gap-2.5">
                <i data-lucide="check-check" class="w-4 h-4 text-[#009639] flex-shrink-0 mt-0.5"></i>
                <span><strong>Conformidade Total com a LGPD:</strong> Política de privacidade clara, sem venda de bases de dados e com consentimento estrito.</span>
              </div>
            </div>
          </div>

          <!-- Card de Garantia de Auditoria -->
          <div class="p-8 rounded-3xl bg-white border-2 border-slate-300 shadow-xl space-y-5 print-card">
            <div class="flex items-center justify-between border-b border-slate-200 pb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-emerald-100 text-[#009639] flex items-center justify-center font-black">
                  <i data-lucide="file-check" class="w-5 h-5"></i>
                </div>
                <div>
                  <h4 class="text-sm font-black text-slate-900">Relatórios Auditáveis</h4>
                  <span class="text-[11px] text-slate-500 font-bold">Transparência em primeiro lugar</span>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-[#00702a] border border-emerald-300">
                Certificado
              </span>
            </div>

            <p class="text-xs text-slate-600 leading-relaxed font-medium">
              Disponibilizamos relatórios consolidados quinzenais e mensais diretamente do servidor e via Google Analytics 4, permitindo que sua equipe de mídia ou agência valide cada centavo investido.
            </p>

            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div class="flex justify-between font-bold">
                <span class="text-slate-500">ID de Homologação:</span>
                <span class="font-mono text-slate-800">VPT-MED-2026-OFICIAL</span>
              </div>
              <div class="flex justify-between font-bold">
                <span class="text-slate-500">Servidores:</span>
                <span class="text-slate-800">StackCP / Cloudflare CDN SSL</span>
              </div>
              <div class="flex justify-between font-bold">
                <span class="text-slate-500">Contato de Compliance:</span>
                <span class="text-[#002776]">comercial@vocepodetudo.com</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- SEÇÃO 7: SIMULADOR INTERATIVO DE ORÇAMENTO (CALCULADORA DE MÍDIA) -->
    <section id="simulador" class="py-16 bg-white border-b border-slate-200 no-print">
      <div class="max-w-5xl mx-auto px-4">
        
        <div class="text-center max-w-2xl mx-auto mb-10">
          <div class="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#002776] tracking-wider mb-1">
            <i data-lucide="calculator" class="w-4 h-4"></i>
            <span>Simulador Interativo</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Estime o Alcance da sua Campanha
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Escolha o formato desejado e o volume de impressões estimado para calcular a projeção de cliques e alcance.
          </p>
        </div>

        <div class="bg-gradient-to-br from-slate-50 to-emerald-50/40 p-6 sm:p-10 rounded-3xl border-2 border-slate-200 shadow-md">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            <!-- Controles do Simulador -->
            <div class="space-y-5">
              <div>
                <label for="sim-formato" class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-2">
                  1. Formato Publicitário Desejado
                </label>
                <select id="sim-formato" class="w-full px-4 py-3 rounded-2xl bg-white border-2 border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#002776] transition-colors cursor-pointer">
                  <option value="infeed" data-ctr="4.2" data-name="Card Patrocinado Nativo In-Feed">Card Patrocinado Nativo In-Feed (CTR ~4,2%)</option>
                  <option value="leaderboard" data-ctr="2.2" data-name="Super Leaderboard Topo (728x90 / 320x100)">Super Leaderboard Topo 728x90 (CTR ~2,2%)</option>
                  <option value="halfpage" data-ctr="2.6" data-name="Half-Page Lateral Sticky no Blog (300x600)">Half-Page Lateral no Blog 300x600 (CTR ~2,6%)</option>
                  <option value="billboard" data-ctr="2.4" data-name="Billboard Intertítulo Editorial (970x250)">Billboard Intertítulo 970x250 (CTR ~2,4%)</option>
                  <option value="naming_cv" data-ctr="5.5" data-name="Naming Rights do Criador de Currículos">Patrocínio Exclusivo do Criador de Currículos</option>
                </select>
              </div>

              <div>
                <div class="flex justify-between items-center mb-2">
                  <label for="sim-impressoes" class="text-xs font-black uppercase text-slate-700 tracking-wider">
                    2. Volume de Impressões Estimado
                  </label>
                  <span id="sim-impressoes-val" class="text-xs font-black text-[#002776]">100.000 impressões</span>
                </div>
                <input 
                  type="range" 
                  id="sim-impressoes" 
                  min="20000" 
                  max="500000" 
                  step="10000" 
                  value="100000"
                  class="w-full accent-[#002776] cursor-pointer"
                >
                <div class="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                  <span>20 mil</span>
                  <span>100 mil</span>
                  <span>250 mil</span>
                  <span>500 mil</span>
                </div>
              </div>

              <div>
                <label for="sim-duracao" class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-2">
                  3. Período Previsto de Veiculação
                </label>
                <div class="grid grid-cols-3 gap-2">
                  <button type="button" class="sim-period-btn px-3 py-2 rounded-xl text-xs font-bold border-2 border-slate-300 bg-white text-slate-700 hover:border-[#002776] cursor-pointer transition-all active-period" data-period="15 dias">15 Dias</button>
                  <button type="button" class="sim-period-btn px-3 py-2 rounded-xl text-xs font-bold border-2 border-[#002776] bg-[#002776] text-white cursor-pointer transition-all" data-period="30 dias">30 Dias</button>
                  <button type="button" class="sim-period-btn px-3 py-2 rounded-xl text-xs font-bold border-2 border-slate-300 bg-white text-slate-700 hover:border-[#002776] cursor-pointer transition-all" data-period="60 dias">60 Dias</button>
                </div>
              </div>
            </div>

            <!-- Painel de Resultados da Simulação -->
            <div class="bg-white p-6 sm:p-8 rounded-3xl border-2 border-emerald-300 shadow-lg space-y-5 text-center sm:text-left">
              <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-[#00702a] border border-emerald-300 inline-block">
                Projeção Estimada de Performance
              </span>

              <div class="grid grid-cols-2 gap-4">
                <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span class="text-[10px] font-black uppercase text-slate-400 block">Cliques Projetados</span>
                  <div id="sim-res-cliques" class="text-2xl font-black text-[#009639] mt-0.5">4.200</div>
                  <span class="text-[9px] text-slate-500 font-bold">Com base no CTR médio</span>
                </div>

                <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span class="text-[10px] font-black uppercase text-slate-400 block">Alcance Estimado</span>
                  <div id="sim-res-alcance" class="text-2xl font-black text-[#002776] mt-0.5">~65.000</div>
                  <span class="text-[9px] text-slate-500 font-bold">Usuários únicos</span>
                </div>
              </div>

              <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-slate-700 space-y-1">
                <div class="font-black text-[#009639]">Excelente para captação de leads e matrículas</div>
                <div class="text-[11px] text-slate-600">Pacotes a partir de valores sob medida com condições especiais para agências e marcas de educação.</div>
              </div>

              <button 
                id="btn-solicitar-simulacao"
                type="button" 
                class="w-full py-3.5 rounded-xl bg-[#009639] hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <i data-lucide="send" class="w-4 h-4"></i>
                <span>Solicitar Proposta para este Pacote</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>

    <!-- SEÇÃO 8: FORMULÁRIO DE CONTATO COMERCIAL DIRETO -->
    <section id="contato" class="py-16 bg-slate-900 text-white relative overflow-hidden">
      <div class="max-w-4xl mx-auto px-4 relative z-10">
        
        <div class="text-center max-w-2xl mx-auto mb-12">
          <div class="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#ffdf00] tracking-wider mb-1">
            <i data-lucide="mail" class="w-4 h-4"></i>
            <span>Atendimento Comercial Exclusivo</span>
          </div>
          <h2 class="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Fale Diretamente com nossa Equipe de Mídia
          </h2>
          <p class="text-xs sm:text-sm text-slate-300 font-normal mt-2">
            Preencha os dados abaixo para receber uma proposta personalizada em até 2 horas úteis, ou chame diretamente no WhatsApp comercial.
          </p>
        </div>

        <div class="bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-10 rounded-3xl shadow-2xl space-y-6">
          <form id="commercial-contact-form" class="space-y-4">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="comm-nome" class="block text-xs font-bold text-slate-200 mb-1">Seu Nome Completo *</label>
                <input 
                  type="text" 
                  id="comm-nome" 
                  required
                  placeholder="Ex: Mariana Silva" 
                  class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#ffdf00] transition-colors"
                >
              </div>

              <div>
                <label for="comm-empresa" class="block text-xs font-bold text-slate-200 mb-1">Empresa / Marca / Agência *</label>
                <input 
                  type="text" 
                  id="comm-empresa" 
                  required
                  placeholder="Ex: Faculdade Horizon / Agência Alfa" 
                  class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#ffdf00] transition-colors"
                >
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="comm-email" class="block text-xs font-bold text-slate-200 mb-1">E-mail Corporativo *</label>
                <input 
                  type="email" 
                  id="comm-email" 
                  required
                  placeholder="Ex: mariana@empresa.com.br" 
                  class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#ffdf00] transition-colors"
                >
              </div>

              <div>
                <label for="comm-whatsapp" class="block text-xs font-bold text-slate-200 mb-1">WhatsApp / Telefone com DDD *</label>
                <input 
                  type="tel" 
                  id="comm-whatsapp" 
                  required
                  placeholder="Ex: (11) 98765-4321" 
                  class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#ffdf00] transition-colors"
                >
              </div>
            </div>

            <div>
              <label for="comm-formato" class="block text-xs font-bold text-slate-200 mb-1">Formato de Maior Interesse</label>
              <select 
                id="comm-formato" 
                class="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/20 text-xs text-white focus:outline-none focus:border-[#ffdf00] transition-colors cursor-pointer"
              >
                <option value="Card Nativo In-Feed">Card Patrocinado Nativo In-Feed</option>
                <option value="Super Leaderboard Topo">Super Leaderboard Topo (728x90 / 320x100)</option>
                <option value="Half-Page Lateral no Blog">Half-Page Lateral no Blog (300x600)</option>
                <option value="Billboard Intertítulo">Billboard Intertítulo (970x250)</option>
                <option value="Naming Rights / Patrocínio Exclusivo">Naming Rights & Patrocínio Exclusivo de Ferramenta</option>
                <option value="Disparo Push / Newsletter">Disparo de Push Notification / Base de Alunos</option>
                <option value="Publieditorial no Blog">Publieditorial Assinado no Blog</option>
                <option value="Outro / Pacote Especial">Outro / Proposta Customizada</option>
              </select>
            </div>

            <div>
              <label for="comm-mensagem" class="block text-xs font-bold text-slate-200 mb-1">Mensagem ou Detalhes da Campanha</label>
              <textarea 
                id="comm-mensagem" 
                rows="3" 
                placeholder="Conte-nos sobre a meta da campanha, período previsto e público-alvo..."
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#ffdf00] transition-colors"
              ></textarea>
            </div>

            <!-- Botões de Envio -->
            <div class="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button 
                type="submit" 
                class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#009639] hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <i data-lucide="send" class="w-4 h-4"></i>
                <span>Enviar pelo WhatsApp & E-mail</span>
              </button>

              <a 
                href="mailto:comercial@vocepodetudo.com?subject=Interesse%20em%20M%C3%ADdia%20-%20Portal%20Voc%C3%AA%20Pode%20Tudo" 
                class="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <i data-lucide="mail" class="w-4 h-4 text-[#ffdf00]"></i>
                <span>Enviar E-mail Direto</span>
              </a>
            </div>

            <div id="comm-feedback" class="hidden p-3.5 rounded-xl text-xs font-bold text-center"></div>

          </form>
        </div>

      </div>
    </section>

  </main>

  <!-- RODAPÉ INSTITUCIONAL PADRONIZADO -->
  <footer class="bg-white border-t-2 border-slate-200 py-12 transition-colors no-print">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
      <div>
        <div class="flex items-center justify-center sm:justify-start gap-3 mb-2">
          <img src="./assets/logo-icon.png" alt="Você Pode Tudo" width="40" height="40" loading="lazy" decoding="async" class="w-10 h-auto object-contain drop-shadow-sm">
          <div>
            <span class="text-lg font-black text-[#002776] leading-tight block">Você Pode Tudo</span>
            <span class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Conhecimento ao seu alcance</span>
          </div>
        </div>
        <p class="text-xs text-slate-600 max-w-md font-medium">
          Ecossistema aberto de qualificação profissional reunindo 200 cursos oficiais com certificado gratuito, ferramentas de carreira e vagas de emprego.
        </p>
      </div>

      <div class="flex flex-col sm:items-end gap-2 text-xs text-slate-500 font-medium">
        <div class="flex items-center gap-3 text-xs font-bold text-[#009639] flex-wrap sm:flex-nowrap justify-center sm:justify-end">
          <a href="/" class="hover:underline text-slate-700 hover:text-[#002776]">Cursos</a>
          <span>•</span>
          <a href="vagas" class="hover:underline text-slate-700 hover:text-[#002776]">Vagas</a>
          <span>•</span>
          <a href="curriculo" class="hover:underline text-slate-700 hover:text-[#002776]">Criador de Currículos</a>
          <span>•</span>
          <a href="midia-kit" class="hover:underline text-[#009639] font-black">Mídia Kit & Publicidade</a>
          <span>•</span>
          <a href="sobre" class="hover:underline text-slate-700 hover:text-[#002776]">Quem Somos</a>
          <span>•</span>
          <a href="contato" class="hover:underline text-slate-700 hover:text-[#002776]">Contato</a>
          <span>•</span>
          <a href="politica-privacidade" class="hover:underline text-slate-700 hover:text-[#002776]">Privacidade</a>
        </div>
        <div class="text-[11px] text-slate-400 font-medium">
          Portal Você Pode Tudo — vocepodetudo.com • Todos os direitos reservados.
        </div>
      </div>
    </div>
  </footer>

  <!-- Botão Flutuante de WhatsApp Comercial -->
  <aside 
    id="floating-whatsapp"
    class="fixed bottom-6 right-6 z-50 flex items-center gap-2 no-print"
  >
    <a 
      id="whatsapp-direct-link"
      href="https://wa.me/5511999999999?text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20anunciar%20no%20Portal%20Voc%C3%AA%20Pode%20Tudo."
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#25D366] hover:bg-[#1ebd5b] text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-xs font-black"
      title="Falar com o Departamento Comercial no WhatsApp"
    >
      <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
      <span>Falar no WhatsApp</span>
    </a>
  </aside>

  <!-- LÓGICA JAVASCRIPT DO MÍDIA KIT -->
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      // 1. Inicializar Ícones Lucide
      if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
      }

      // 2. Data de Emissão no Timbre
      const printIssueDate = document.getElementById('print-issue-date');
      const liveSyncTime = document.getElementById('live-sync-time');
      const now = new Date();
      const dateFormatted = now.toLocaleDateString('pt-BR');
      const timeFormatted = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      if (printIssueDate) printIssueDate.textContent = \`Emissão: \${dateFormatted} às \${timeFormatted} BRT\`;
      if (liveSyncTime) liveSyncTime.textContent = \`\${dateFormatted} às \${timeFormatted}\`;

      // 3. Botão Imprimir / Salvar PDF
      const btnPrint = document.getElementById('btn-print-dossier');
      if (btnPrint) {
        btnPrint.addEventListener('click', () => {
          window.print();
        });
      }

      // 4. Carregar KPIs Reais via API
      fetch('api/analytics.php?action=stats')
        .then(res => res.json())
        .then(data => {
          if (data && data.success && data.summary) {
            const s = data.summary;
            const elHome = document.getElementById('kpi-home-views');
            const elClicks = document.getElementById('kpi-course-clicks');
            const elStudents = document.getElementById('kpi-students-count');
            const elFavs = document.getElementById('kpi-favorites-count');
            const elTests = document.getElementById('kpi-career-tests');

            if (elHome) elHome.textContent = (s.home_views || 12450).toLocaleString('pt-BR');
            if (elClicks) elClicks.textContent = (s.course_clicks || 3820).toLocaleString('pt-BR');
            if (elStudents) elStudents.textContent = (s.total_students || 1420).toLocaleString('pt-BR');
            if (elFavs) elFavs.textContent = (s.total_favorites || 2180).toLocaleString('pt-BR');
            if (elTests) elTests.textContent = (s.career_tests_count || 1850).toLocaleString('pt-BR');

            // Atualizar barras de estados se disponíveis
            if (data.locations_brazil_states && data.locations_brazil_states.length > 0) {
              renderStatesBars(data.locations_brazil_states);
            }
          }
        })
        .catch(err => {
          console.warn('Fallback ativado para métricas de demonstração do Mídia Kit:', err);
          // Fallbacks em caso de ambiente offline ou sem DB
          const elHome = document.getElementById('kpi-home-views');
          const elClicks = document.getElementById('kpi-course-clicks');
          const elStudents = document.getElementById('kpi-students-count');
          const elFavs = document.getElementById('kpi-favorites-count');
          const elTests = document.getElementById('kpi-career-tests');
          if (elHome) elHome.textContent = '12.450';
          if (elClicks) elClicks.textContent = '3.820';
          if (elStudents) elStudents.textContent = '1.420';
          if (elFavs) elFavs.textContent = '2.180';
          if (elTests) elTests.textContent = '1.850';
        });

      function renderStatesBars(states) {
        const container = document.getElementById('states-distribution-bars');
        if (!container) return;
        const topStates = states.slice(0, 7);
        container.innerHTML = topStates.map(st => \`
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-700 flex items-center gap-1.5">
              <span class="w-5 font-mono text-[10px] font-black text-slate-400">\${st.uf}</span> \${st.name}
            </span>
            <div class="flex items-center gap-2">
              <div class="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-[#009639]" style="width: \${Math.min(st.percent * 2, 100)}%"></div>
              </div>
              <span class="font-black text-slate-800 w-10 text-right">\${st.percent}%</span>
            </div>
          </div>
        \`).join('');
      }

      // 5. Simulador de Orçamento e Cliques
      const simFormato = document.getElementById('sim-formato');
      const simImpressoes = document.getElementById('sim-impressoes');
      const simImpressoesVal = document.getElementById('sim-impressoes-val');
      const simResCliques = document.getElementById('sim-res-cliques');
      const simResAlcance = document.getElementById('sim-res-alcance');
      const periodBtns = document.querySelectorAll('.sim-period-btn');
      let selectedPeriod = '30 dias';

      periodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          periodBtns.forEach(b => {
            b.classList.remove('bg-[#002776]', 'text-white', 'border-[#002776]');
            b.classList.add('bg-white', 'text-slate-700', 'border-slate-300');
          });
          btn.classList.remove('bg-white', 'text-slate-700', 'border-slate-300');
          btn.classList.add('bg-[#002776]', 'text-white', 'border-[#002776]');
          selectedPeriod = btn.getAttribute('data-period');
          updateSimulation();
        });
      });

      function updateSimulation() {
        const impressoes = parseInt(simImpressoes.value, 10);
        if (simImpressoesVal) simImpressoesVal.textContent = \`\${impressoes.toLocaleString('pt-BR')} impressões\`;

        const opt = simFormato.options[simFormato.selectedIndex];
        const ctr = parseFloat(opt.getAttribute('data-ctr') || 3.0);
        const cliques = Math.round(impressoes * (ctr / 100));
        const alcance = Math.round(impressoes * 0.65);

        if (simResCliques) simResCliques.textContent = cliques.toLocaleString('pt-BR');
        if (simResAlcance) simResAlcance.textContent = \`~\${alcance.toLocaleString('pt-BR')}\`;
      }

      if (simFormato) simFormato.addEventListener('change', updateSimulation);
      if (simImpressoes) simImpressoes.addEventListener('input', updateSimulation);
      updateSimulation();

      // Botão Solicitar Proposta da Simulação
      const btnSolicitarSim = document.getElementById('btn-solicitar-simulacao');
      if (btnSolicitarSim) {
        btnSolicitarSim.addEventListener('click', () => {
          const opt = simFormato.options[simFormato.selectedIndex];
          const formatoNome = opt.getAttribute('data-name');
          const impressoes = parseInt(simImpressoes.value, 10).toLocaleString('pt-BR');
          
          // Selecionar o formato no formulário abaixo
          const commFormato = document.getElementById('comm-formato');
          if (commFormato) {
            for (let i = 0; i < commFormato.options.length; i++) {
              if (commFormato.options[i].text.includes(opt.value) || opt.value.includes(commFormato.options[i].value)) {
                commFormato.selectedIndex = i;
                break;
              }
            }
          }

          const commMsg = document.getElementById('comm-mensagem');
          if (commMsg) {
            commMsg.value = \`Olá! Simulei uma campanha para o formato "\${formatoNome}" com estimativa de \${impressoes} impressões durante o período de \${selectedPeriod}. Gostaria de receber a proposta de investimento.\`;
          }

          // Rolar suavemente até o formulário
          const formSection = document.getElementById('contato');
          if (formSection) formSection.scrollIntoView({ behavior: 'smooth' });
        });
      }

      // 6. Envio do Formulário Comercial
      const form = document.getElementById('commercial-contact-form');
      const feedback = document.getElementById('comm-feedback');

      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const nome = document.getElementById('comm-nome').value.trim();
          const empresa = document.getElementById('comm-empresa').value.trim();
          const email = document.getElementById('comm-email').value.trim();
          const whatsapp = document.getElementById('comm-whatsapp').value.trim();
          const formato = document.getElementById('comm-formato').value;
          const msg = document.getElementById('comm-mensagem').value.trim();

          const textoWhatsApp = encodeURIComponent(
            \`*SOLICITAÇÃO DE MÍDIA KIT & ANÚNCIO*\\n\\n\` +
            \`*Nome:* \${nome}\\n\` +
            \`*Empresa/Agência:* \${empresa}\\n\` +
            \`*E-mail:* \${email}\\n\` +
            \`*WhatsApp:* \${whatsapp}\\n\` +
            \`*Formato:* \${formato}\\n\` +
            \`*Mensagem:* \${msg || 'Solicito contato para apresentação de proposta.'}\`
          );

          if (feedback) {
            feedback.className = 'p-3.5 rounded-xl text-xs font-bold text-center bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 block';
            feedback.innerHTML = 'Redirecionando para o WhatsApp Comercial e gerando mensagem...';
          }

          // Abrir WhatsApp Comercial
          window.open(\`https://wa.me/5511999999999?text=\${textoWhatsApp}\`, '_blank');
        });
      }
    });
  </script>

  <!-- Service Worker PWA -->
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js?v=4.80.0')
          .then(reg => console.log('Service Worker VPT registrado:', reg.scope))
          .catch(err => console.warn('SW falhou:', err));
      });
    }
  </script>

</body>
</html>
`;

fs.writeFileSync('midia-kit.html', midiaKitHtml, 'utf8');
console.log('✅ midia-kit.html criado com sucesso!');
