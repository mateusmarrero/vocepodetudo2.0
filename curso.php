<?php
/**
 * curso.php - Página Oficial Própria do Curso (SSR & SEO Avançado)
 * Portal Você Pode Tudo — vocepodetudo.com
 * 
 * Renderização Server-Side Completa para Googlebot e Usuários,
 * com Metadados Open Graph ricos, Schema.org Course, BreadcrumbList,
 * ementa curricular estruturada, dicas ATS para currículo e compartilhamento social.
 */

declare(strict_types=1);

// 1. Obter e sanitizar o identificador do curso
$rawId = trim((string)($_GET['id'] ?? $_GET['curso'] ?? ''));
if (empty($rawId)) {
    $uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?: '';
    if (preg_match('#^/curso/([a-zA-Z0-9_-]+)#i', $uriPath, $m)) {
        $rawId = $m[1];
    }
}

$courseId = preg_replace('/[^a-zA-Z0-9_-]/', '', $rawId);

// 2. Carregar o curso do Banco de Dados MySQL ou Cache/Seed JSON
require_once __DIR__ . '/api/config.php';

$cacheFile = __DIR__ . '/api/cache_courses.json';
$seedFile  = __DIR__ . '/api/seed_courses.json';

$course = null;
$allCourses = [];

// Tentar carregar do MySQL se disponível
$pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;
if ($pdo && !empty($courseId)) {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                id, title, provider, provider_tag AS providerTag, provider_color AS providerColor,
                category, description, url, workload_hours AS workloadHours,
                has_free_certificate AS hasFreeCertificate, certificate_note AS certificateNote,
                level, tags, featured, rating, reviews_count AS reviewsCount,
                is_active AS isActive
            FROM courses 
            WHERE id = :id AND is_active = 1
            LIMIT 1
        ");
        $stmt->execute([':id' => $courseId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $row['hasFreeCertificate'] = (bool)$row['hasFreeCertificate'];
            $row['featured'] = (bool)$row['featured'];
            $row['rating'] = (float)($row['rating'] ?? 4.9);
            $row['reviewsCount'] = (int)($row['reviewsCount'] ?? 1420);
            $row['workloadHours'] = (int)($row['workloadHours'] ?? 20);
            if (!empty($row['tags']) && is_string($row['tags'])) {
                $decTags = json_decode($row['tags'], true);
                $row['tags'] = is_array($decTags) ? $decTags : array_filter(explode(',', $row['tags']));
            }
            $course = $row;
        }
    } catch (Throwable $e) {
        error_log("Erro ao consultar curso no MySQL: " . $e->getMessage());
    }
}

// Carregar catálogo de apoio (Cache ou Seed) para enriquecer dados e obter cursos relacionados
if (file_exists($cacheFile)) {
    $content = @file_get_contents($cacheFile);
    if ($content) $allCourses = json_decode($content, true) ?: [];
}
if (empty($allCourses) && file_exists($seedFile)) {
    $content = @file_get_contents($seedFile);
    if ($content) $allCourses = json_decode($content, true) ?: [];
}

// Fallback do curso nos arquivos JSON se não veio do MySQL
if (!$course && !empty($courseId)) {
    foreach ($allCourses as $c) {
        if ($c['id'] === $courseId && (!isset($c['isActive']) || $c['isActive'])) {
            $course = $c;
            break;
        }
    }
}

// Se o curso ainda não tiver imageUrl ou veio do MySQL sem imagem, associar do cache
if ($course && empty($course['imageUrl'])) {
    foreach ($allCourses as $c) {
        if ($c['id'] === $course['id'] && !empty($c['imageUrl'])) {
            $course['imageUrl'] = $c['imageUrl'];
            break;
        }
    }
}

// Imagem padrão defensiva
$defaultImage = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
$coverImage = !empty($course['imageUrl']) ? $course['imageUrl'] : $defaultImage;

// Se o curso não existe, retornar 404 amigável
if (!$course) {
    http_response_code(404);
    ?>
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Curso Não Encontrado — Você Pode Tudo</title>
      <meta name="robots" content="noindex, follow">
      <link rel="icon" type="image/png" sizes="32x32" href="/assets/logo-icon.png">
      <script src="https://cdn.tailwindcss.com"></script>
      <script defer src="https://unpkg.com/lucide@0.344.0/dist/umd/lucide.min.js"></script>
    </head>
    <body class="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col justify-between">
      <header class="bg-white border-b border-slate-200 py-4 px-6 shadow-xs">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" class="flex items-center gap-2.5">
            <img src="/assets/logo-icon.png" alt="Logo Você Pode Tudo" class="h-8 w-auto">
            <span class="text-base font-black tracking-tight text-slate-900">
              Você<span class="text-[#009639]">Pode</span><span class="text-[#ffcc29]">Tudo</span>
            </span>
          </a>
          <a href="/#catalog-view" class="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5">
            <span>Explorar Cursos Gratuitos</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </a>
        </div>
      </header>

      <main class="max-w-2xl mx-auto px-4 py-16 text-center flex-1 flex flex-col items-center justify-center">
        <div class="w-20 h-20 rounded-full bg-emerald-100 text-[#00702a] flex items-center justify-center mb-6 shadow-inner">
          <i data-lucide="book-x" class="w-10 h-10"></i>
        </div>
        <h1 class="text-3xl font-black text-slate-900 mb-3">Curso Não Encontrado</h1>
        <p class="text-slate-600 text-sm max-w-md mx-auto mb-8 leading-relaxed">
          O curso que você buscou pode ter sido atualizado ou o link está incorreto. Mas não se preocupe: temos mais de 200 cursos 100% gratuitos esperando por você!
        </p>
        <div class="flex flex-wrap items-center justify-center gap-3">
          <a href="/" class="px-5 py-2.5 rounded-xl font-bold text-sm bg-[#009639] hover:bg-emerald-700 text-white shadow-md transition-all flex items-center gap-2">
            <i data-lucide="search" class="w-4 h-4"></i>
            <span>Ver Catálogo Completo</span>
          </a>
          <a href="/curriculo" class="px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-200 hover:bg-slate-300 text-slate-800 transition-all flex items-center gap-2">
            <i data-lucide="file-text" class="w-4 h-4"></i>
            <span>Criador de Currículos</span>
          </a>
        </div>
      </main>

      <footer class="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© <?= date('Y') ?> Você Pode Tudo. Todos os direitos reservados.</p>
      </footer>
      <script>lucide.createIcons();</script>
    </body>
    </html>
    <?php
    exit;
}

// 3. Preparar variáveis e metadados SEO ricos
$title = htmlspecialchars((string)$course['title'], ENT_QUOTES, 'UTF-8');
$provider = htmlspecialchars((string)$course['provider'], ENT_QUOTES, 'UTF-8');
$providerTag = htmlspecialchars((string)($course['providerTag'] ?? $course['provider']), ENT_QUOTES, 'UTF-8');
$providerColor = htmlspecialchars((string)($course['providerColor'] ?? 'bg-slate-100 text-slate-800 border-slate-300 font-black'), ENT_QUOTES, 'UTF-8');
$category = htmlspecialchars((string)($course['categoryName'] ?? $course['category'] ?? 'Tecnologia'), ENT_QUOTES, 'UTF-8');
$description = htmlspecialchars((string)$course['description'], ENT_QUOTES, 'UTF-8');
$workload = (int)($course['workloadHours'] ?? 20);
$level = htmlspecialchars((string)($course['level'] ?? 'Iniciante'), ENT_QUOTES, 'UTF-8');
$hasCert = (bool)($course['hasFreeCertificate'] ?? false);
$certNote = htmlspecialchars((string)($course['certificateNote'] ?? ($hasCert ? 'Certificado 100% Gratuito' : 'Modo Ouvinte Gratuito')), ENT_QUOTES, 'UTF-8');
$rating = number_format((float)($course['rating'] ?? 4.9), 1);
$reviews = (int)($course['reviewsCount'] ?? 1420);
$courseUrl = htmlspecialchars((string)$course['url'], ENT_QUOTES, 'UTF-8');
$canonicalUrl = 'https://vocepodetudo.com/curso/' . htmlspecialchars((string)$course['id'], ENT_QUOTES, 'UTF-8');
$shareMessage = "Encontrei esse curso 100% gratuito com certificado oficial: \"{$course['title']}\" ({$course['provider']}) com {$workload}h no Você Pode Tudo! Acesse: {$canonicalUrl}";
$whatsappShareUrl = 'https://api.whatsapp.com/send?text=' . urlencode($shareMessage);
$telegramShareUrl = 'https://t.me/share/url?url=' . urlencode($canonicalUrl) . '&text=' . urlencode($shareMessage);

// Tags do curso
$tags = is_array($course['tags'] ?? null) ? $course['tags'] : [];

// Cursos Relacionados (da mesma categoria, excluindo o atual)
$relatedCourses = [];
$currentCatLower = mb_strtolower($category);
foreach ($allCourses as $rc) {
    if ($rc['id'] !== $course['id'] && (!isset($rc['isActive']) || $rc['isActive'])) {
        $rcCatLower = mb_strtolower((string)($rc['categoryName'] ?? $rc['category'] ?? ''));
        if ($rcCatLower === $currentCatLower) {
            $relatedCourses[] = $rc;
            if (count($relatedCourses) >= 3) break;
        }
    }
}
// Se a categoria tiver poucos, preencher com outros cursos de destaque
if (count($relatedCourses) < 3) {
    foreach ($allCourses as $rc) {
        if ($rc['id'] !== $course['id'] && !in_array($rc, $relatedCourses, true) && (!isset($rc['isActive']) || $rc['isActive'])) {
            $relatedCourses[] = $rc;
            if (count($relatedCourses) >= 3) break;
        }
    }
}

// Gerar Ementa / Módulos de Aprendizagem Didáticos
$modules = [
    [
        'title' => 'Módulo 1: Fundamentos e Visão Geral',
        'desc' => "Introdução completa aos conceitos centrais de {$course['title']}, ambientação com a metodologia e primeiras aplicações práticas.",
        'topics' => ['Conceitos fundamentais e histórico', 'Panorama do mercado e tendências', 'Configuração inicial e primeiros passos']
    ],
    [
        'title' => 'Módulo 2: Desenvolvimento de Competências Práticas',
        'desc' => "Aprofundamento técnico e exercícios aplicados orientados às exigências reais de empresas e processos seletivos.",
        'topics' => ['Técnicas essenciais e ferramentas', 'Estudos de caso reais', 'Boas práticas profissionais']
    ],
    [
        'title' => 'Módulo 3: Projeto Aplicado e Próximos Passos',
        'desc' => "Consolidação dos conhecimentos adquiridos, elaboração de projeto prático e preparação para validação de competências.",
        'topics' => ['Revisão integrada de tópicos', 'Projeto final / Avaliação prática', 'Como destacar no currículo e LinkedIn']
    ]
];
if ($workload >= 30) {
    $modules[] = [
        'title' => 'Módulo 4: Especialização e Boas Práticas Avançadas',
        'desc' => "Estratégias avançadas de otimização, resolução de problemas complexos e padrões recomendados por especialistas.",
        'topics' => ['Padrões avançados de mercado', 'Resolução de casos complexos', 'Certificação e continuidade nos estudos']
    ];
}
?>
<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- SEO & Meta Tags Oficiais do Google -->
  <title><?= $title ?> Gratuito com Certificado | <?= $provider ?> — Você Pode Tudo</title>
  <meta name="description" content="Faça o curso gratuito <?= $title ?> oferecido por <?= $provider ?>. <?= $workload ?>h de carga horária, aulas online gratuitas e certificado. Acesse agora no Você Pode Tudo!">
  <meta name="keywords" content="<?= $title ?>, curso gratis <?= $provider ?>, curso gratuito com certificado, <?= implode(', ', array_map('htmlspecialchars', $tags)) ?>, vocepodetudo">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <link rel="canonical" href="<?= $canonicalUrl ?>">

  <!-- Open Graph / Redes Sociais / WhatsApp -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Você Pode Tudo">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:url" content="<?= $canonicalUrl ?>">
  <meta property="og:title" content="<?= $title ?> — Curso Gratuito Online | <?= $provider ?>">
  <meta property="og:description" content="<?= $description ?> Carga horária: <?= $workload ?>h. 100% gratuito!">
  <meta property="og:image" content="<?= htmlspecialchars($coverImage, ENT_QUOTES, 'UTF-8') ?>">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Capa do curso <?= $title ?>">

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="<?= $title ?> — Curso Gratuito (<?= $provider ?>)">
  <meta name="twitter:description" content="<?= $description ?>">
  <meta name="twitter:image" content="<?= htmlspecialchars($coverImage, ENT_QUOTES, 'UTF-8') ?>">

  <!-- Favicon & PWA -->
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/logo-icon.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/assets/icon-192.png">
  <link rel="apple-touch-icon" href="/assets/icon-192.png">
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#005e24">

  <!-- Pré-conexão de Alta Performance para Celular (Core Web Vitals) -->
  <link rel="preconnect" href="https://images.unsplash.com" crossorigin>
  <link rel="preconnect" href="https://cdn.tailwindcss.com" crossorigin>
  <link rel="preconnect" href="https://unpkg.com" crossorigin>

  <!-- Tailwind CSS & Lucide Icons -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://unpkg.com/lucide@0.344.0/dist/umd/lucide.min.js"></script>

  <!-- Google AdSense Oficial -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9421145457118515" crossorigin="anonymous"></script>

  <!-- Dados Estruturados Schema.org para o Google (Course & BreadcrumbList) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course",
        "name": <?= json_encode($course['title'], JSON_UNESCAPED_UNICODE) ?>,
        "description": <?= json_encode($course['description'], JSON_UNESCAPED_UNICODE) ?>,
        "provider": {
          "@type": "Organization",
          "name": <?= json_encode($course['provider'], JSON_UNESCAPED_UNICODE) ?>,
          "sameAs": <?= json_encode($course['url'], JSON_UNESCAPED_UNICODE) ?>
        },
        "image": <?= json_encode($coverImage, JSON_UNESCAPED_UNICODE) ?>,
        "inLanguage": "pt-BR",
        "isAccessibleForFree": true,
        "offers": {
          "@type": "Offer",
          "category": "Free",
          "price": "0.00",
          "priceCurrency": "BRL",
          "availability": "https://schema.org/InStock",
          "validFrom": "2026-01-01"
        },
        "hasCourseInstance": {
          "@type": "CourseInstance",
          "courseMode": "Online",
          "courseWorkload": "PT<?= $workload ?>H"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": <?= $rating ?>,
          "reviewCount": <?= $reviews ?>,
          "bestRating": 5,
          "worstRating": 1
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Início",
            "item": "https://vocepodetudo.com/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Cursos Gratuitos",
            "item": "https://vocepodetudo.com/#catalog-view"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": <?= json_encode($category, JSON_UNESCAPED_UNICODE) ?>,
            "item": "https://vocepodetudo.com/?categoria=<?= urlencode((string)$course['category']) ?>"
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": <?= json_encode($course['title'], JSON_UNESCAPED_UNICODE) ?>,
            "item": <?= json_encode($canonicalUrl, JSON_UNESCAPED_UNICODE) ?>
          }
        ]
      }
    ]
  }
  </script>

  <style>
    /* Otimizações de renderização rápida em telas mobile */
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    @media (max-width: 640px) {
      .touch-target { min-height: 48px; min-width: 48px; }
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 font-sans antialiased min-h-screen flex flex-col selection:bg-[#009639] selection:text-white">

  <!-- Top Utility Bar Nacional -->
  <div class="bg-gradient-to-r from-[#005e24] via-[#008031] to-[#005e24] text-white py-1.5 px-4 text-xs font-semibold border-b-2 border-[#ffcc29]">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center justify-center w-2 h-2 rounded-full bg-[#ffcc29] animate-pulse"></span>
        <span>Guia Oficial do Conhecimento Gratuito no Brasil</span>
      </div>
      <div class="flex items-center gap-4 text-[11px]">
        <span class="hidden sm:inline text-emerald-100">100% Cursos Livres & Oficiais</span>
        <a href="/curriculo" class="text-[#ffcc29] hover:underline font-bold">Criar Currículo Grátis</a>
      </div>
    </div>
  </div>

  <!-- Header Principal com Navegação Global -->
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-slate-200 shadow-xs transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
      
      <!-- Logotipo Oficial -->
      <a href="/" class="flex items-center gap-3 group focus:outline-none" aria-label="Você Pode Tudo - Página Inicial">
        <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#009639] via-[#007a2e] to-[#002776] p-0.5 shadow-md group-hover:scale-105 transition-transform">
          <div class="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
            <img src="/assets/logo-icon.png" alt="Logotipo Você Pode Tudo" class="w-7 h-7 sm:w-8 sm:h-8 object-contain">
          </div>
        </div>
        <div class="flex flex-col">
          <span class="text-base sm:text-xl font-black tracking-tight leading-none text-slate-900 group-hover:text-[#009639] transition-colors">
            Você<span class="text-[#009639]">Pode</span><span class="text-[#ffcc29]">Tudo</span>
          </span>
          <span class="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
            Cursos Oficiais
          </span>
        </div>
      </a>

      <!-- Menu Superior -->
      <nav class="hidden md:flex items-center gap-5 text-sm font-bold text-slate-700">
        <a href="/" class="hover:text-[#009639] transition-colors">Catálogo de Cursos</a>
        <a href="/vagas" class="hover:text-[#009639] transition-colors">Vagas de Emprego</a>
        <a href="/curriculo" class="hover:text-[#009639] transition-colors">Criador de Currículos</a>
        <a href="/simulador-entrevista" class="hover:text-[#009639] transition-colors">Simulador de Entrevista</a>
        <a href="/blog" class="hover:text-[#009639] transition-colors">Blog & Dicas</a>
      </nav>

      <!-- Botão Voltar ao Catálogo -->
      <div class="flex items-center gap-2">
        <a href="/" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors">
          <i data-lucide="arrow-left" class="w-4 h-4"></i>
          <span class="hidden sm:inline">Ver Todos os Cursos</span>
          <span class="sm:hidden">Catálogo</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Miolo Principal da Página -->
  <main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
    
    <!-- Breadcrumbs de Navegação e Indexação -->
    <nav class="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6 flex-wrap" aria-label="Navegação Estrutural">
      <a href="/" class="hover:text-[#009639] transition-colors">Início</a>
      <span class="text-slate-300">/</span>
      <a href="/#catalog-view" class="hover:text-[#009639] transition-colors">Cursos Gratuitos</a>
      <span class="text-slate-300">/</span>
      <span class="text-slate-600"><?= $category ?></span>
      <span class="text-slate-300">/</span>
      <span class="text-slate-900 font-bold truncate max-w-xs sm:max-w-md"><?= $title ?></span>
    </nav>

    <!-- Layout Dividido em Duas Colunas -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Coluna Principal Esquerda (Informações, Capa, Ementa, ATS) -->
      <div class="lg:col-span-8 space-y-6 sm:space-y-8">
        
        <!-- Header do Curso -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          
          <!-- Badges de Categoria e Instituição -->
          <div class="flex flex-wrap items-center gap-2.5 mb-4">
            <span class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border-2 <?= $providerColor ?>">
              <?= $providerTag ?>
            </span>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              <i data-lucide="tag" class="w-3.5 h-3.5 text-slate-400"></i>
              <?= $category ?>
            </span>
            <?php if ($hasCert): ?>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-[#00702a] border border-emerald-300">
                <i data-lucide="award" class="w-3.5 h-3.5 text-[#009639]"></i>
                Certificado Gratuito
              </span>
            <?php else: ?>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
                <i data-lucide="info" class="w-3.5 h-3.5 text-amber-600"></i>
                <?= $certNote ?>
              </span>
            <?php endif; ?>
          </div>

          <!-- Título Oficial do Curso -->
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4 tracking-tight">
            <?= $title ?>
          </h1>

          <!-- Resumo de Avaliações e Carga Horária -->
          <div class="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 font-semibold pb-6 border-b border-slate-100">
            <div class="flex items-center gap-1 text-amber-700">
              <i data-lucide="star" class="w-4 h-4 fill-amber-400 text-amber-500"></i>
              <strong class="font-black text-slate-900"><?= $rating ?></strong>
              <span class="text-slate-500">(<?= number_format($reviews, 0, ',', '.') ?> avaliações)</span>
            </div>
            <span class="text-slate-300">•</span>
            <div class="flex items-center gap-1.5">
              <i data-lucide="clock" class="w-4 h-4 text-[#009639]"></i>
              <span><strong><?= $workload ?> horas</strong> de conteúdo</span>
            </div>
            <span class="text-slate-300">•</span>
            <div class="flex items-center gap-1.5">
              <i data-lucide="bar-chart-2" class="w-4 h-4 text-[#002776]"></i>
              <span>Nível <strong><?= $level ?></strong></span>
            </div>
          </div>

          <!-- Imagem de Capa em Alta Resolução Otimizada para Mobile -->
          <div class="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 my-6 shadow-sm border border-slate-200">
            <img 
              src="<?= htmlspecialchars($coverImage, ENT_QUOTES, 'UTF-8') ?>" 
              alt="Capa do curso <?= $title ?>" 
              width="1200" 
              height="675" 
              fetchpriority="high"
              decoding="async"
              class="w-full h-full object-cover"
              onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';"
            >
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40"></div>
          </div>

          <!-- Descrição Detalhada -->
          <div class="prose max-w-none text-slate-700 leading-relaxed text-sm sm:text-base">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 mb-2">Sobre este curso</h2>
            <p class="mb-4"><?= $description ?></p>
            <p>
              Oferecido oficialmente por <strong><?= $provider ?></strong>, este curso tem metodologia autoinstrucional flexível, permitindo que você estude no seu próprio ritmo, através de computador, tablet ou celular.
            </p>
          </div>

          <!-- Destaques Rápidos -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Custo</span>
              <strong class="text-emerald-700 text-sm font-black">100% Gratuito</strong>
            </div>
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Modalidade</span>
              <strong class="text-slate-800 text-sm font-black">Online / EAD</strong>
            </div>
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Duração</span>
              <strong class="text-slate-800 text-sm font-black"><?= $workload ?>h de Estudo</strong>
            </div>
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Acesso</span>
              <strong class="text-blue-800 text-sm font-black">Imediato</strong>
            </div>
          </div>

        </div>

        <!-- Ementa Completa e Módulos Estruturados -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <i data-lucide="layers" class="w-5 h-5 text-[#009639]"></i>
                <span>Ementa Curricular & Módulos</span>
              </h2>
              <p class="text-xs sm:text-sm text-slate-500 mt-1">Veja a trilha de tópicos abordada durante as aulas.</p>
            </div>
            <span class="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-[#00702a] border border-emerald-200">
              <?= count($modules) ?> Módulos
            </span>
          </div>

          <div class="space-y-4">
            <?php foreach ($modules as $idx => $mod): ?>
              <div class="border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-emerald-300 transition-colors bg-slate-50/50">
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 rounded-xl bg-emerald-100 text-[#00702a] font-black text-sm flex items-center justify-center flex-shrink-0">
                    <?= $idx + 1 ?>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-bold text-slate-900 text-sm sm:text-base mb-1">
                      <?= htmlspecialchars($mod['title'], ENT_QUOTES, 'UTF-8') ?>
                    </h3>
                    <p class="text-xs sm:text-sm text-slate-600 mb-3 leading-relaxed">
                      <?= htmlspecialchars($mod['desc'], ENT_QUOTES, 'UTF-8') ?>
                    </p>
                    <div class="flex flex-wrap gap-2">
                      <?php foreach ($mod['topics'] as $topic): ?>
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700">
                          <i data-lucide="check" class="w-3 h-3 text-[#009639]"></i>
                          <?= htmlspecialchars($topic, ENT_QUOTES, 'UTF-8') ?>
                        </span>
                      <?php endforeach; ?>
                    </div>
                  </div>
                </div>
              </div>
            <?php endforeach; ?>
          </div>
        </div>

        <!-- Seção de Alavancagem no Currículo (Dicas ATS) -->
        <div class="bg-gradient-to-br from-emerald-50 via-white to-blue-50 rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs">
          <div class="flex items-start gap-4 mb-4">
            <div class="w-12 h-12 rounded-2xl bg-[#009639] text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <i data-lucide="file-check-2" class="w-6 h-6"></i>
            </div>
            <div>
              <h2 class="text-xl font-black text-slate-900 leading-tight">Como destacar este curso no seu Currículo</h2>
              <p class="text-xs sm:text-sm text-slate-600 mt-1">Dica prática para passar nos filtros de recrutamento automatizados (ATS).</p>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200 text-xs sm:text-sm text-slate-700 space-y-3 mb-6">
            <p>
              <strong>Texto recomendado para a seção de Cursos Complementares:</strong>
            </p>
            <div class="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 font-mono text-xs text-slate-800 leading-relaxed select-all">
              • <?= $title ?> — <?= $provider ?> (Carga Horária: <?= $workload ?>h)
            </div>
            <p class="text-xs text-slate-500">
              💡 <em>Recrutadores valorizam certificados emitidos por instituições renomadas como <?= $provider ?>. Destaque os projetos e termos práticos aprendidos nas entrevistas!</em>
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <a href="/curriculo" class="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-[#009639] hover:bg-emerald-700 text-white shadow-md transition-all flex items-center gap-2">
              <i data-lucide="file-text" class="w-4 h-4"></i>
              <span>Criar Currículo Grátis com este Curso</span>
            </a>
            <a href="/simulador-entrevista" class="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition-all flex items-center gap-2">
              <i data-lucide="mic" class="w-4 h-4 text-blue-600"></i>
              <span>Treinar Entrevista</span>
            </a>
          </div>
        </div>

        <!-- Seção de Compartilhamento Social -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <h2 class="text-lg font-black text-slate-900 mb-2">Ajude um amigo a se qualificar</h2>
          <p class="text-xs sm:text-sm text-slate-600 mb-4">Compartilhe o link deste curso gratuito com quem precisa de oportunidade profissional:</p>
          
          <div class="flex flex-wrap items-center gap-2.5">
            <a href="<?= $whatsappShareUrl ?>" target="_blank" rel="noopener noreferrer" class="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-emerald-600 text-white shadow-xs transition-all flex items-center gap-2">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <span>WhatsApp</span>
            </a>
            <a href="<?= $telegramShareUrl ?>" target="_blank" rel="noopener noreferrer" class="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#0088cc] hover:bg-sky-600 text-white shadow-xs transition-all flex items-center gap-2">
              <i data-lucide="send" class="w-4 h-4"></i>
              <span>Telegram</span>
            </a>
            <button id="copy-course-link-btn" class="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all flex items-center gap-2">
              <i data-lucide="link" class="w-4 h-4"></i>
              <span>Copiar Link</span>
            </button>
          </div>
        </div>

      </div>

      <!-- Coluna Lateral Direita (Card de Acesso Oficial Fixo & Cursos Relacionados) -->
      <div class="lg:col-span-4 space-y-6">
        
        <!-- Card Fixo de Inscrição Oficial -->
        <div class="sticky top-24 bg-white rounded-3xl p-6 border-2 border-emerald-500/40 shadow-lg shadow-emerald-900/5">
          <div class="mb-4">
            <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Inscrição Direta</span>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-black text-[#009639]">Grátis</span>
              <span class="text-xs line-through text-slate-400">R$ 297,00</span>
            </div>
            <p class="text-xs text-slate-500 mt-1">Acesso livre e sem mensalidades.</p>
          </div>

          <!-- Botão Principal de Matrícula / Acesso Oficial -->
          <a 
            href="<?= $courseUrl ?>" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="touch-target w-full py-4 px-6 rounded-2xl font-black text-sm text-center bg-gradient-to-r from-[#009639] via-[#008031] to-[#005e24] hover:from-[#008031] hover:to-[#00471b] text-white shadow-md shadow-emerald-700/25 active:scale-95 transition-all flex items-center justify-center gap-2 mb-3 cursor-pointer group"
          >
            <span>Acessar Curso no Site Oficial</span>
            <i data-lucide="external-link" class="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"></i>
          </a>

          <p class="text-[11px] text-center text-slate-400 leading-tight mb-6">
            Você será direcionado com segurança para o portal oficial de <strong><?= $provider ?></strong>.
          </p>

          <!-- Itens Inclusos -->
          <div class="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
            <div class="flex items-center gap-2">
              <i data-lucide="check-circle-2" class="w-4 h-4 text-[#009639] flex-shrink-0"></i>
              <span>Aulas 100% online em qualquer horário</span>
            </div>
            <div class="flex items-center gap-2">
              <i data-lucide="check-circle-2" class="w-4 h-4 text-[#009639] flex-shrink-0"></i>
              <span>Sem exigência de vestibular ou taxa</span>
            </div>
            <div class="flex items-center gap-2">
              <i data-lucide="check-circle-2" class="w-4 h-4 text-[#009639] flex-shrink-0"></i>
              <span>Carga horária comprovada (<?= $workload ?>h)</span>
            </div>
            <div class="flex items-center gap-2">
              <i data-lucide="check-circle-2" class="w-4 h-4 text-[#009639] flex-shrink-0"></i>
              <span>Válido para horas complementares</span>
            </div>
          </div>
        </div>

        <!-- Cursos Relacionados da Mesma Categoria -->
        <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <h2 class="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
            <i data-lucide="sparkles" class="w-4 h-4 text-[#009639]"></i>
            <span>Cursos Relacionados Recomendados</span>
          </h2>

          <div class="space-y-4">
            <?php foreach ($relatedCourses as $rc): 
              $rcTitle = htmlspecialchars((string)$rc['title'], ENT_QUOTES, 'UTF-8');
              $rcProvider = htmlspecialchars((string)$rc['provider'], ENT_QUOTES, 'UTF-8');
              $rcImg = htmlspecialchars((string)($rc['imageUrl'] ?? $defaultImage), ENT_QUOTES, 'UTF-8');
              $rcUrl = '/curso/' . htmlspecialchars((string)$rc['id'], ENT_QUOTES, 'UTF-8');
              $rcHours = (int)($rc['workloadHours'] ?? 20);
            ?>
              <a href="<?= $rcUrl ?>" class="group block border border-slate-200 hover:border-[#009639] rounded-2xl p-3 transition-all bg-slate-50/50 hover:bg-white hover:shadow-sm">
                <div class="flex items-center gap-3">
                  <div class="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0 relative">
                    <img src="<?= $rcImg ?>" alt="<?= $rcTitle ?>" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-105 transition-transform" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&q=80';">
                  </div>
                  <div class="flex-1 min-w-0">
                    <span class="text-[10px] font-bold text-slate-500 uppercase block truncate"><?= $rcProvider ?></span>
                    <h3 class="font-bold text-xs text-slate-900 group-hover:text-[#009639] transition-colors line-clamp-2 leading-snug">
                      <?= $rcTitle ?>
                    </h3>
                    <span class="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-1">
                      <i data-lucide="clock" class="w-3 h-3"></i> <?= $rcHours ?>h • Grátis
                    </span>
                  </div>
                </div>
              </a>
            <?php endforeach; ?>
          </div>

          <a href="/#catalog-view" class="block w-full text-center mt-5 text-xs font-bold text-emerald-700 hover:text-emerald-800">
            Explorar todo o catálogo →
          </a>
        </div>

      </div>

    </div>

  </main>

  <!-- Sticky Bottom Bar Especial para Dispositivos Móveis (Mobile UX & Conversão) -->
  <div class="lg:hidden sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 p-3 shadow-2xl flex items-center justify-between gap-3">
    <div class="min-w-0 flex-1">
      <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Curso 100% Gratuito</span>
      <strong class="text-xs font-black text-slate-900 truncate block"><?= $title ?></strong>
    </div>
    <a 
      href="<?= $courseUrl ?>" 
      target="_blank" 
      rel="noopener noreferrer" 
      class="touch-target px-5 py-3 rounded-xl font-black text-xs bg-gradient-to-r from-[#009639] via-[#008031] to-[#005e24] text-white shadow-md flex items-center justify-center gap-1.5 flex-shrink-0 active:scale-95 transition-all"
    >
      <span>Acessar Curso</span>
      <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
    </a>
  </div>

  <!-- Rodapé Oficial do Portal -->
  <footer class="bg-slate-900 text-slate-300 pt-12 pb-8 border-t-4 border-[#009639] text-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        <div class="md:col-span-2 space-y-3">
          <div class="flex items-center gap-2">
            <img src="/assets/logo-icon.png" alt="Logo Você Pode Tudo" class="w-8 h-8 object-contain">
            <span class="text-lg font-black text-white">Você<span class="text-[#009639]">Pode</span><span class="text-[#ffcc29]">Tudo</span></span>
          </div>
          <p class="text-slate-400 text-xs leading-relaxed max-w-sm">
            Portal brasileiro independente de capacitação profissional e empregabilidade. Democratizando o acesso à educação com curadoria rigorosa de cursos oficiais gratuitos.
          </p>
          <p class="text-slate-400 text-xs">
            Contato oficial: <a href="mailto:contato@vocepodetudo.com" class="text-emerald-400 hover:underline">contato@vocepodetudo.com</a>
          </p>
        </div>
        <div>
          <h4 class="text-white font-bold text-sm mb-3">Links Rápidos</h4>
          <ul class="space-y-2">
            <li><a href="/" class="hover:text-white transition-colors">Todos os Cursos</a></li>
            <li><a href="/vagas" class="hover:text-white transition-colors">Mural de Vagas</a></li>
            <li><a href="/curriculo" class="hover:text-white transition-colors">Gerador de Currículo</a></li>
            <li><a href="/simulador-entrevista" class="hover:text-white transition-colors">Simulador de Entrevista</a></li>
            <li><a href="/blog" class="hover:text-white transition-colors">Blog Oficial</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-bold text-sm mb-3">Transparência & Legal</h4>
          <ul class="space-y-2">
            <li><a href="/sobre" class="hover:text-white transition-colors">Sobre o Projeto</a></li>
            <li><a href="/politica-editorial" class="hover:text-white transition-colors">Política Editorial</a></li>
            <li><a href="/politica-privacidade" class="hover:text-white transition-colors">Privacidade (LGPD)</a></li>
            <li><a href="/termos-de-uso" class="hover:text-white transition-colors">Termos de Uso</a></li>
            <li><a href="/contato" class="hover:text-white transition-colors">Fale Conosco</a></li>
          </ul>
        </div>
      </div>
      <div class="pt-6 border-t border-slate-800 text-center text-slate-500 text-[11px]">
        <p>© <?= date('Y') ?> Você Pode Tudo. Todos os direitos reservados. Feito com excelência para todos os brasileiros.</p>
      </div>
    </div>
  </footer>

  <!-- Script de Inicialização dos Ícones e Interações -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      if (window.lucide) window.lucide.createIcons();

      // Botão de Copiar Link
      var copyBtn = document.getElementById('copy-course-link-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', function() {
          var url = window.location.href;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(function() {
              copyBtn.innerHTML = '<i data-lucide="check" class="w-4 h-4 text-emerald-600"></i><span>Copiado!</span>';
              if (window.lucide) window.lucide.createIcons({ root: copyBtn });
              setTimeout(function() {
                copyBtn.innerHTML = '<i data-lucide="link" class="w-4 h-4"></i><span>Copiar Link</span>';
                if (window.lucide) window.lucide.createIcons({ root: copyBtn });
              }, 2500);
            });
          }
        });
      }
    });
  </script>
</body>
</html>
