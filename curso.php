<?php
/**
 * curso.php - Página Oficial Própria do Curso (SSR, SEO Avançado & Detalhes Completos)
 * Portal Você Pode Tudo — vocepodetudo.com
 * 
 * Renderização Server-Side Completa com:
 * 1. Dados estruturados Schema.org (Course, BreadcrumbList, FAQPage).
 * 2. Ementa curricular detalhada módulo a módulo com tópicos.
 * 3. Resultados de aprendizagem (o que você vai aprender).
 * 4. Metodologia, nota mínima e sistema de avaliação autoinstrucional.
 * 5. Validade legal da certificação (LDB Lei 9.394/96, horas complementares e concursos).
 * 6. Dicas práticas de currículo e palavras-chave ATS para recrutamento.
 * 7. FAQ com respostas diretas a dúvidas frequentes.
 * 8. Perfil da instituição certificadora parceira.
 * 9. Botão de inscrição e acesso ao curso oficial exclusivo dentro desta página.
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
$detailsFile = __DIR__ . '/api/cache_course_details.json';

$course = null;
$allCourses = [];
$allDetails = [];

// Carregar detalhes enriquecidos
if (file_exists($detailsFile)) {
    $contentDetails = @file_get_contents($detailsFile);
    if ($contentDetails) {
        $allDetails = json_decode($contentDetails, true) ?: [];
    }
}

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
$shareMessage = "Olha esse curso gratuito com certificado que encontrei no Você Pode Tudo: \"{$course['title']}\" ({$course['provider']}) com {$workload}h de aula! Veja a ementa completa: {$canonicalUrl}";
$whatsappShareUrl = 'https://api.whatsapp.com/send?text=' . urlencode($shareMessage);
$telegramShareUrl = 'https://t.me/share/url?url=' . urlencode($canonicalUrl) . '&text=' . urlencode($shareMessage);

// Tags do curso
$tags = is_array($course['tags'] ?? null) ? $course['tags'] : [];

// Obter detalhes profundos do cache enriquecido
$d = $allDetails[$course['id']] ?? [];
$syllabus = !empty($d['syllabus']) ? $d['syllabus'] : [
    [
        'number' => 1,
        'title' => 'Módulo 1: Fundamentos e Visão Geral',
        'description' => "Introdução completa aos conceitos centrais de {$course['title']}, ambientação com a metodologia e primeiras aplicações práticas.",
        'topics' => ['Conceitos fundamentais e histórico', 'Panorama do mercado e tendências', 'Configuração inicial e primeiros passos']
    ],
    [
        'number' => 2,
        'title' => 'Módulo 2: Desenvolvimento de Competências Práticas',
        'description' => "Aprofundamento técnico e exercícios aplicados orientados às exigências reais de empresas e processos seletivos.",
        'topics' => ['Técnicas essenciais e ferramentas', 'Estudos de caso reais', 'Boas práticas profissionais']
    ],
    [
        'number' => 3,
        'title' => 'Módulo 3: Projeto Aplicado e Validação de Aprendizagem',
        'description' => "Consolidação dos conhecimentos adquiridos, elaboração de projeto prático e preparação para validação de competências.",
        'topics' => ['Revisão integrada de tópicos', 'Projeto final / Avaliação prática', 'Como destacar no currículo e LinkedIn']
    ]
];

$learningOutcomes = !empty($d['learningOutcomes']) ? $d['learningOutcomes'] : [
    "Dominar os conceitos teóricos e aplicações práticas essenciais de {$course['title']}",
    "Desenvolver autonomia com ferramentas e metodologias utilizadas no mercado profissional",
    "Resolver desafios práticos reais exigidos em entrevistas de emprego e seleções",
    "Obter certificação emitida por instituição de renome para impulsionar o currículo"
];

$passingScore = htmlspecialchars((string)($d['passingScore'] ?? ($hasCert ? '60%' : '70%')), ENT_QUOTES, 'UTF-8');
$minEducation = htmlspecialchars((string)($d['minEducation'] ?? 'Ensino Fundamental II ou Médio em andamento'), ENT_QUOTES, 'UTF-8');
$targetAudience = htmlspecialchars((string)($d['targetAudience'] ?? 'Estudantes, profissionais em busca de qualificação e pessoas interessadas em adquirir novas competências.'), ENT_QUOTES, 'UTF-8');
$providerProfile = $d['providerProfile'] ?? [
    'name' => $course['provider'],
    'description' => "{$course['provider']} é uma das principais instituições do país comprometidas com a formação de qualidade e democratização do conhecimento gratuito.",
    'badge' => 'Instituição Oficial Parceira',
    'website' => $course['url']
];
$faqs = !empty($d['faqs']) ? $d['faqs'] : [];

// Cursos Relacionados da mesma categoria
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
if (count($relatedCourses) < 3) {
    foreach ($allCourses as $rc) {
        if ($rc['id'] !== $course['id'] && !in_array($rc, $relatedCourses, true) && (!isset($rc['isActive']) || $rc['isActive'])) {
            $relatedCourses[] = $rc;
            if (count($relatedCourses) >= 3) break;
        }
    }
}

// Construção de dados estruturados JSON-LD do FAQ
$faqJsonElements = [];
foreach ($faqs as $faqItem) {
    $faqJsonElements[] = [
        '@type' => 'Question',
        'name' => $faqItem['q'],
        'acceptedAnswer' => [
            '@type' => 'Answer',
            'text' => $faqItem['a']
        ]
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
  <meta name="description" content="Curso gratuito <?= $title ?> com <?= $workload ?>h de aulas oficiais ministradas por <?= $provider ?>. Veja a ementa completa, pré-requisitos, certificação e inscreva-se online sem pagar nada!">
  <meta name="keywords" content="<?= $title ?>, curso gratis <?= $provider ?>, ementa <?= $title ?>, certificado <?= $title ?>, vocepodetudo">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <link rel="canonical" href="<?= $canonicalUrl ?>">

  <!-- Open Graph / Redes Sociais / WhatsApp -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Você Pode Tudo">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:url" content="<?= $canonicalUrl ?>">
  <meta property="og:title" content="<?= $title ?> — Curso Gratuito Online | <?= $provider ?>">
  <meta property="og:description" content="<?= $description ?> Carga horária: <?= $workload ?>h. 100% gratuito e com certificado oficial!">
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

  <!-- Dados Estruturados Schema.org para o Google (Course, BreadcrumbList e FAQPage) -->
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
      <?php if (!empty($faqJsonElements)): ?>
      ,
      {
        "@type": "FAQPage",
        "mainEntity": <?= json_encode($faqJsonElements, JSON_UNESCAPED_UNICODE) ?>
      }
      <?php endif; ?>
    ]
  }
  </script>

  <style>
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
      
      <!-- Coluna Principal Esquerda (Informações, Capa, Ementa, ATS, FAQs) -->
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
              <span class="text-slate-500">(<?= number_format($reviews, 0, ',', '.') ?> avaliações de alunos)</span>
            </div>
            <span class="text-slate-300">•</span>
            <div class="flex items-center gap-1.5">
              <i data-lucide="clock" class="w-4 h-4 text-[#009639]"></i>
              <span><strong><?= $workload ?> horas</strong> oficiais</span>
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

          <!-- 6 Cards de Destaques Rápidos -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6">
            <div class="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200">
              <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Investimento</span>
              <strong class="text-[#00702a] text-sm font-black flex items-center gap-1 mt-0.5">
                <i data-lucide="check" class="w-4 h-4"></i> 100% Gratuito
              </strong>
            </div>
            <div class="p-3 bg-blue-50/60 rounded-2xl border border-blue-200">
              <span class="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">Formato</span>
              <strong class="text-blue-900 text-sm font-black flex items-center gap-1 mt-0.5">
                <i data-lucide="monitor" class="w-4 h-4"></i> Online (EAD)
              </strong>
            </div>
            <div class="p-3 bg-purple-50/60 rounded-2xl border border-purple-200">
              <span class="text-[10px] font-bold uppercase tracking-wider text-purple-800 block">Carga Horária</span>
              <strong class="text-purple-900 text-sm font-black flex items-center gap-1 mt-0.5">
                <i data-lucide="clock" class="w-4 h-4"></i> <?= $workload ?>h Certificadas
              </strong>
            </div>
            <div class="p-3 bg-amber-50/60 rounded-2xl border border-amber-200">
              <span class="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Avaliação</span>
              <strong class="text-amber-950 text-sm font-black flex items-center gap-1 mt-0.5">
                <i data-lucide="check-circle" class="w-4 h-4"></i> Mínimo <?= $passingScore ?>
              </strong>
            </div>
            <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Escolaridade</span>
              <strong class="text-slate-800 text-xs font-bold block truncate mt-0.5" title="<?= $minEducation ?>">
                <?= $minEducation ?>
              </strong>
            </div>
            <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Certificação</span>
              <strong class="text-slate-800 text-xs font-bold block truncate mt-0.5">
                <?= $hasCert ? 'PDF com Código' : 'Ouvinte Grátis' ?>
              </strong>
            </div>
          </div>

          <!-- Descrição Detalhada -->
          <div class="text-slate-700 leading-relaxed text-sm sm:text-base pt-4 border-t border-slate-100">
            <h2 class="text-lg sm:text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
              <i data-lucide="book-open" class="w-5 h-5 text-[#009639]"></i>
              <span>Visão Geral e Apresentação do Curso</span>
            </h2>
            <p class="mb-4 text-justify"><?= $description ?></p>
            <p class="text-slate-600">
              Ministrado oficialmente por <strong><?= $provider ?></strong>, este programa foi desenvolvido sob os mais altos critérios pedagógicos, com linguagem didática e ritmo autoinstrucional. O conteúdo permanece disponível 24 horas por dia para que você avance conforme sua rotina, seja pelo smartphone, tablet ou computador.
            </p>
          </div>

        </div>

        <!-- O Que Você Vai Aprender (Resultados de Aprendizagem) -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
            <i data-lucide="target" class="w-5 h-5 text-[#009639]"></i>
            <span>O Que Você Vai Aprender na Prática</span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mb-6">Competências e habilidades desenvolvidas durante o programa de estudos:</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <?php foreach ($learningOutcomes as $outcome): ?>
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-emerald-100 text-[#00702a] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i data-lucide="check" class="w-3.5 h-3.5 font-black"></i>
                </div>
                <span class="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                  <?= htmlspecialchars($outcome, ENT_QUOTES, 'UTF-8') ?>
                </span>
              </div>
            <?php endforeach; ?>
          </div>
        </div>

        <!-- Ementa Completa e Módulos Estruturados -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <i data-lucide="layers" class="w-5 h-5 text-[#009639]"></i>
                <span>Ementa Curricular Completa</span>
              </h2>
              <p class="text-xs sm:text-sm text-slate-500 mt-1">Conheça a sequência didática e todos os tópicos das aulas:</p>
            </div>
            <span class="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-[#00702a] border border-emerald-200">
              <?= count($syllabus) ?> Módulos Estruturados
            </span>
          </div>

          <div class="space-y-4">
            <?php foreach ($syllabus as $idx => $mod): ?>
              <div class="border border-slate-200 rounded-2xl p-5 hover:border-emerald-300 transition-colors bg-slate-50/50">
                <div class="flex items-start gap-3.5">
                  <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#009639] to-[#005e24] text-white font-black text-sm flex items-center justify-center flex-shrink-0 shadow-xs">
                    <?= $mod['number'] ?? ($idx + 1) ?>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-bold text-slate-900 text-sm sm:text-base mb-1.5">
                      <?= htmlspecialchars($mod['title'], ENT_QUOTES, 'UTF-8') ?>
                    </h3>
                    <p class="text-xs sm:text-sm text-slate-600 mb-3.5 leading-relaxed">
                      <?= htmlspecialchars($mod['description'], ENT_QUOTES, 'UTF-8') ?>
                    </p>
                    <?php if (!empty($mod['topics']) && is_array($mod['topics'])): ?>
                      <div class="flex flex-wrap gap-2">
                        <?php foreach ($mod['topics'] as $topic): ?>
                          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-2xs">
                            <span class="w-1.5 h-1.5 rounded-full bg-[#009639]"></span>
                            <?= htmlspecialchars($topic, ENT_QUOTES, 'UTF-8') ?>
                          </span>
                        <?php endforeach; ?>
                      </div>
                    <?php endif; ?>
                  </div>
                </div>
              </div>
            <?php endforeach; ?>
          </div>
        </div>

        <!-- Metodologia e Avaliação & Validade Legal -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Metodologia -->
          <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4">
              <i data-lucide="clipboard-check" class="w-5 h-5"></i>
            </div>
            <h3 class="text-base font-black text-slate-900 mb-2">Metodologia & Avaliação</h3>
            <ul class="text-xs text-slate-600 space-y-2 leading-relaxed">
              <li class="flex items-start gap-2">
                <i data-lucide="check" class="w-4 h-4 text-[#009639] flex-shrink-0 mt-0.5"></i>
                <span><strong>Autoinstrucional:</strong> Inicie no seu ritmo, sem prazos de encerramento de turma.</span>
              </li>
              <li class="flex items-start gap-2">
                <i data-lucide="check" class="w-4 h-4 text-[#009639] flex-shrink-0 mt-0.5"></i>
                <span><strong>Exercícios de Fixação:</strong> Questionários práticos a cada unidade estudada.</span>
              </li>
              <li class="flex items-start gap-2">
                <i data-lucide="check" class="w-4 h-4 text-[#009639] flex-shrink-0 mt-0.5"></i>
                <span><strong>Aprovação:</strong> Alcance nota mínima de <strong><?= $passingScore ?></strong> para liberação imediata.</span>
              </li>
              <li class="flex items-start gap-2">
                <i data-lucide="check" class="w-4 h-4 text-[#009639] flex-shrink-0 mt-0.5"></i>
                <span><strong>Tentativas Livres:</strong> Se não atingir na primeira tentativa, você pode revisar e refazer.</span>
              </li>
            </ul>
          </div>

          <!-- Validade Legal -->
          <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 text-[#00702a] flex items-center justify-center mb-4">
              <i data-lucide="shield-check" class="w-5 h-5"></i>
            </div>
            <h3 class="text-base font-black text-slate-900 mb-2">Validade Legal do Certificado</h3>
            <ul class="text-xs text-slate-600 space-y-2 leading-relaxed">
              <li class="flex items-start gap-2">
                <i data-lucide="check" class="w-4 h-4 text-[#009639] flex-shrink-0 mt-0.5"></i>
                <span><strong>Amparo na LDB:</strong> Válido em todo o Brasil (Lei Federal nº 9.394/96 e Dec. 5.154/04).</span>
              </li>
              <li class="flex items-start gap-2">
                <i data-lucide="check" class="w-4 h-4 text-[#009639] flex-shrink-0 mt-0.5"></i>
                <span><strong>Horas Complementares:</strong> Aceito em faculdades para cumprimento de AACCs do MEC.</span>
              </li>
              <li class="flex items-start gap-2">
                <i data-lucide="check" class="w-4 h-4 text-[#009639] flex-shrink-0 mt-0.5"></i>
                <span><strong>Concursos Públicos:</strong> Pontuação em prova de títulos (conforme exigência do edital).</span>
              </li>
              <li class="flex items-start gap-2">
                <i data-lucide="check" class="w-4 h-4 text-[#009639] flex-shrink-0 mt-0.5"></i>
                <span><strong>Autenticidade:</strong> Código verificador e QR Code para checagem online por recrutadores.</span>
              </li>
            </ul>
          </div>

        </div>

        <!-- Seção de Alavancagem no Currículo (Dicas ATS) -->
        <div class="bg-gradient-to-br from-emerald-50 via-white to-blue-50 rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs">
          <div class="flex items-start gap-4 mb-4">
            <div class="w-12 h-12 rounded-2xl bg-[#009639] text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <i data-lucide="file-check-2" class="w-6 h-6"></i>
            </div>
            <div>
              <h2 class="text-xl font-black text-slate-900 leading-tight">Como Destacar Este Curso no seu Currículo</h2>
              <p class="text-xs sm:text-sm text-slate-600 mt-1">Dicas estratégicas para ser aprovado nos softwares de recrutamento (ATS da Gupy, Kenoby e Vagas):</p>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-5 border border-emerald-200 text-xs sm:text-sm text-slate-700 space-y-4 mb-6">
            <div>
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Texto pronto para a seção "Cursos e Certificações":</span>
              <div class="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 font-mono text-xs text-slate-800 leading-relaxed select-all flex items-center justify-between gap-2">
                <span>• <?= $title ?> — <?= $provider ?> (Carga Horária: <?= $workload ?>h)</span>
                <button id="copy-cv-text-btn" class="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors flex-shrink-0">
                  Copiar
                </button>
              </div>
            </div>

            <!-- Palavras-chave ATS -->
            <?php if (!empty($d['resumeTips']['atsKeywords'])): ?>
              <div>
                <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Palavras-chave essenciais para incluir no CV:</span>
                <div class="flex flex-wrap gap-1.5">
                  <?php foreach ($d['resumeTips']['atsKeywords'] as $kw): ?>
                    <span class="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                      #<?= htmlspecialchars($kw, ENT_QUOTES, 'UTF-8') ?>
                    </span>
                  <?php endforeach; ?>
                </div>
              </div>
            <?php endif; ?>

            <div class="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong>💡 Dica para Entrevista:</strong> <?= htmlspecialchars($d['resumeTips']['interviewTip'] ?? "Enfatize aos recrutadores como a carga horária de {$workload}h pelo {$provider} contribuiu para sua capacidade técnica e postura profissional.", ENT_QUOTES, 'UTF-8') ?>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <a href="/curriculo" class="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-[#009639] hover:bg-emerald-700 text-white shadow-md transition-all flex items-center gap-2">
              <i data-lucide="file-text" class="w-4 h-4"></i>
              <span>Criar Currículo Grátis com Este Curso</span>
            </a>
            <a href="/simulador-entrevista" class="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition-all flex items-center gap-2">
              <i data-lucide="mic" class="w-4 h-4 text-blue-600"></i>
              <span>Simular Entrevista com Inteligência Artificial</span>
            </a>
          </div>
        </div>

        <!-- Sobre a Instituição Certificadora -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div class="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
            <i data-lucide="building" class="w-4 h-4"></i>
            <span>Instituição Certificadora</span>
          </div>
          <h2 class="text-xl font-black text-slate-900 mb-3"><?= htmlspecialchars($providerProfile['name'] ?? $provider, ENT_QUOTES, 'UTF-8') ?></h2>
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
            <?= htmlspecialchars($providerProfile['description'] ?? '', ENT_QUOTES, 'UTF-8') ?>
          </p>
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
            <i data-lucide="award" class="w-4 h-4 text-[#009639]"></i>
            <span><?= htmlspecialchars($providerProfile['badge'] ?? 'Instituição Parceira Oficial', ENT_QUOTES, 'UTF-8') ?></span>
          </div>
        </div>

        <!-- Perguntas Frequentes (FAQ) -->
        <?php if (!empty($faqs)): ?>
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
              <i data-lucide="help-circle" class="w-5 h-5 text-[#009639]"></i>
              <span>Perguntas Frequentes sobre Este Curso</span>
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 mb-6">Tire suas dúvidas antes de iniciar seus estudos:</p>

            <div class="space-y-3.5">
              <?php foreach ($faqs as $fItem): ?>
                <div class="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-slate-50/60">
                  <h3 class="text-sm sm:text-base font-bold text-slate-900 mb-2 flex items-start gap-2">
                    <span class="text-[#009639] font-black">Q:</span>
                    <span><?= htmlspecialchars($fItem['q'], ENT_QUOTES, 'UTF-8') ?></span>
                  </h3>
                  <p class="text-xs sm:text-sm text-slate-600 pl-5 leading-relaxed">
                    <?= htmlspecialchars($fItem['a'], ENT_QUOTES, 'UTF-8') ?>
                  </p>
                </div>
              <?php endforeach; ?>
            </div>
          </div>
        <?php endif; ?>

        <!-- Seção de Compartilhamento Social -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <h2 class="text-lg font-black text-slate-900 mb-2">Ajude um amigo ou familiar a se qualificar</h2>
          <p class="text-xs sm:text-sm text-slate-600 mb-4">Compartilhe o link desta página de curso gratuito com quem precisa de oportunidade profissional:</p>
          
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
              <span>Copiar Link da Página</span>
            </button>
          </div>
        </div>

      </div>

      <!-- Coluna Lateral Direita (Card de Acesso Oficial Fixo) -->
      <div class="lg:col-span-4">
        
        <!-- Card Fixo de Inscrição Oficial (O LINK ESTÁ DENTRO DA PÁGINA!) -->
        <div class="sticky top-24 z-20 bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-500/60 shadow-xl shadow-emerald-900/10">
          
          <div class="mb-4">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-[#00702a] border border-emerald-200 mb-2">
              <span class="w-2 h-2 rounded-full bg-[#009639] animate-pulse"></span>
              Inscrições Abertas
            </span>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl sm:text-4xl font-black text-[#009639]">Grátis</span>
              <span class="text-sm line-through text-slate-400">R$ 297,00</span>
            </div>
            <p class="text-xs text-slate-500 mt-1">Acesso livre oficial, sem mensalidade ou taxa de matrícula.</p>
          </div>

          <!-- BOTÃO EXCLUSIVO DE ACESSO OFICIAL AO CURSO -->
          <a 
            href="<?= $courseUrl ?>" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="touch-target w-full py-4 px-6 rounded-2xl font-black text-sm text-center bg-gradient-to-r from-[#009639] via-[#008031] to-[#005e24] hover:from-[#008031] hover:to-[#00471b] text-white shadow-lg shadow-emerald-700/30 active:scale-95 transition-all flex items-center justify-center gap-2.5 mb-3 cursor-pointer group"
          >
            <span>Acessar Curso no Site Oficial</span>
            <i data-lucide="external-link" class="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform"></i>
          </a>

          <!-- Instruções de Acesso -->
          <div class="bg-slate-50 rounded-xl p-3 border border-slate-200 text-[11px] text-slate-600 mb-5 space-y-1">
            <p class="font-bold text-slate-800">Passo a Passo para Iniciar:</p>
            <p>1. Clique no botão acima para abrir a plataforma oficial;</p>
            <p>2. Crie ou acesse seu cadastro gratuito em <strong><?= $provider ?></strong>;</p>
            <p>3. Inicie suas aulas imediatamente pelo celular ou computador!</p>
          </div>

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
              <span>Válido para horas complementares na faculdade</span>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- Cursos Relacionados da Mesma Categoria em Grade de Destaque -->
    <?php if (!empty($relatedCourses)): ?>
      <section class="mt-12 pt-10 border-t border-slate-200" aria-label="Cursos Relacionados Recomendados">
        <div class="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-[#00702a] border border-emerald-200 mb-1.5">
              <i data-lucide="sparkles" class="w-3.5 h-3.5 text-[#009639]"></i>
              Outras Oportunidades Gratuitas
            </span>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900">
              Cursos Relacionados Recomendados
            </h2>
          </div>
          <a href="/#catalog-view" class="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
            <span>Ver todo o catálogo</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <?php foreach ($relatedCourses as $rc): 
            $rcTitle = htmlspecialchars((string)$rc['title'], ENT_QUOTES, 'UTF-8');
            $rcProvider = htmlspecialchars((string)$rc['provider'], ENT_QUOTES, 'UTF-8');
            $rcImg = htmlspecialchars((string)($rc['imageUrl'] ?? $defaultImage), ENT_QUOTES, 'UTF-8');
            $rcUrl = '/curso/' . htmlspecialchars((string)$rc['id'], ENT_QUOTES, 'UTF-8');
            $rcHours = (int)($rc['workloadHours'] ?? 20);
          ?>
            <article class="bg-white rounded-2xl border border-slate-200 hover:border-[#009639] p-4 transition-all hover:shadow-lg flex flex-col justify-between group">
              <div>
                <a href="<?= $rcUrl ?>" class="block relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3 border border-slate-200">
                  <img src="<?= $rcImg ?>" alt="<?= $rcTitle ?>" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-105 transition-transform" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80';">
                  <div class="absolute top-2 left-2">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-white/95 text-slate-800 border border-slate-200 shadow-xs">
                      <?= $rcProvider ?>
                    </span>
                  </div>
                  <div class="absolute bottom-2 right-2">
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                      <i data-lucide="clock" class="w-3 h-3 text-emerald-400"></i> <?= $rcHours ?>h
                    </span>
                  </div>
                </a>
                <h3 class="font-bold text-sm text-slate-900 group-hover:text-[#009639] transition-colors line-clamp-2 leading-snug mb-2">
                  <a href="<?= $rcUrl ?>">
                    <?= $rcTitle ?>
                  </a>
                </h3>
              </div>
              <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                <span class="text-xs font-black text-[#00702a]">100% Gratuito</span>
                <a href="<?= $rcUrl ?>" class="inline-flex items-center gap-1 text-xs font-black text-emerald-700 hover:text-emerald-900">
                  <span>Ver Curso</span>
                  <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                </a>
              </div>
            </article>
          <?php endforeach; ?>
        </div>
      </section>
    <?php endif; ?>

    </div>

  </main>

  <!-- Sticky Bottom Bar Especial para Dispositivos Móveis (O LINK ESTÁ DENTRO DA PÁGINA!) -->
  <div class="lg:hidden sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 p-3 shadow-2xl flex items-center justify-between gap-3">
    <div class="min-w-0 flex-1">
      <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Curso Oficial <?= $providerTag ?></span>
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

      // Botão de Copiar Link da Página
      var copyBtn = document.getElementById('copy-course-link-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', function() {
          var url = window.location.href;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(function() {
              copyBtn.innerHTML = '<i data-lucide="check" class="w-4 h-4 text-emerald-600"></i><span>Copiado!</span>';
              if (window.lucide) window.lucide.createIcons({ root: copyBtn });
              setTimeout(function() {
                copyBtn.innerHTML = '<i data-lucide="link" class="w-4 h-4"></i><span>Copiar Link da Página</span>';
                if (window.lucide) window.lucide.createIcons({ root: copyBtn });
              }, 2500);
            });
          }
        });
      }

      // Botão de Copiar Texto para Currículo
      var copyCvBtn = document.getElementById('copy-cv-text-btn');
      if (copyCvBtn) {
        copyCvBtn.addEventListener('click', function() {
          var textToCopy = <?= json_encode("• {$course['title']} — {$course['provider']} (Carga Horária: {$workload}h)", JSON_UNESCAPED_UNICODE) ?>;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy).then(function() {
              copyCvBtn.textContent = 'Copiado!';
              copyCvBtn.classList.add('bg-emerald-200', 'text-emerald-900');
              setTimeout(function() {
                copyCvBtn.textContent = 'Copiar';
                copyCvBtn.classList.remove('bg-emerald-200', 'text-emerald-900');
              }, 2000);
            });
          }
        });
      }
    });
  </script>
</body>
</html>
