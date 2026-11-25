<?php
/**
 * artigo.php - Página Oficial Própria do Artigo (SSR & SEO)
 * Portal Você Pode Tudo — vocepodetudo.com
 * 
 * Renderização completa Server-Side para leitores e motores de busca (Googlebot),
 * com Metadados Open Graph ricos, Schema.org Article/NewsArticle, BreadcrumbList,
 * barra de progresso de leitura, narração de texto por voz (TTS), CTAs inteligentes
 * e compartilhamento social otimizado para WhatsApp.
 */

declare(strict_types=1);

// 1. Obter e sanitizar o slug requisitado
$rawSlug = trim((string)($_GET['slug'] ?? $_GET['artigo'] ?? $_GET['p'] ?? ''));
if (empty($rawSlug)) {
    // Tentar extrair do REQUEST_URI caso venha por rewrite direto
    $uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?: '';
    if (preg_match('#^/(?:artigo|blog)/([a-zA-Z0-9_-]+)#i', $uriPath, $m)) {
        $rawSlug = $m[1];
    }
}

$slug = preg_replace('/[^a-zA-Z0-9_-]/', '', $rawSlug);

// 2. Carregar o artigo do Banco de Dados MySQL ou Cache/Seed JSON
require_once __DIR__ . '/api/config.php';

// Verificar se a requisição possui sessão/token válido de administrador
$adminUser = function_exists('checkAdminSession') ? checkAdminSession() : null;
$isAdmin = ($adminUser !== null);

$cacheFile = __DIR__ . '/api/cache_blog.json';
$seedFile  = __DIR__ . '/api/seed_blog.json';

$post = null;
$allPosts = [];
$isPreview = false;

// Tentar buscar no MySQL se disponível
$pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;
if ($pdo && !empty($slug)) {
    try {
        if ($isAdmin) {
            // Administrador autenticado: pode consultar tanto publicados quanto agendados
            $stmt = $pdo->prepare("SELECT * FROM `blog_posts` WHERE (`slug` = :slug OR `id` = :id) AND `is_published` = 1 LIMIT 1");
        } else {
            // Visitante anônimo: SOMENTE publicados cuja data/hora de publicação já foi atingida (created_at <= NOW() no Horário de Brasília)
            $stmt = $pdo->prepare("SELECT * FROM `blog_posts` WHERE (`slug` = :slug OR `id` = :id) AND `is_published` = 1 AND `created_at` <= NOW() LIMIT 1");
        }
        $stmt->execute([':slug' => $slug, ':id' => $slug]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $post = $row;
            $postScheduled = !empty($post['created_at']) && (strtotime($post['created_at']) > time());
            if ($postScheduled) {
                if ($isAdmin) {
                    $isPreview = true;
                } else {
                    // Camada de segurança estrita: anônimo NUNCA carrega artigo futuro
                    $post = null;
                }
            } else {
                // Anti-Inflação de Cliques: Apenas acessos de visitantes humanos reais, com bloqueio de robôs/crawlers, administradores e deduplicação de F5 por sessão (2h)
                $userAgent = strtolower($_SERVER['HTTP_USER_AGENT'] ?? '');
                $isBot = empty($userAgent) || (bool)preg_match('/(bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot|twitterbot|pinterest|google|bing|yahoo|duckduckgo|yandex|baidu|curl|wget|python|headless|lighthouse)/i', $userAgent);
                $viewCookie = $_COOKIE['vpt_viewed_articles'] ?? '';
                $viewedList = array_filter(explode(',', $viewCookie));
                $articleIdStr = (string)$post['id'];
                $alreadyViewed = in_array($articleIdStr, $viewedList, true);

                if (!$isAdmin && !$isBot && !$alreadyViewed) {
                    $pdo->prepare("UPDATE `blog_posts` SET `views_count` = `views_count` + 1 WHERE `id` = :id")->execute([':id' => $post['id']]);
                    $post['views_count'] = (int)($post['views_count'] ?? 0) + 1;
                    $viewedList[] = $articleIdStr;
                    if (count($viewedList) > 50) array_shift($viewedList);
                    @setcookie('vpt_viewed_articles', implode(',', $viewedList), [
                        'expires' => time() + 7200,
                        'path' => '/',
                        'secure' => true,
                        'httponly' => true,
                        'samesite' => 'Lax'
                    ]);
                }
            }
        }
    } catch (Throwable $e) {
        error_log("Erro ao consultar artigo no MySQL: " . $e->getMessage());
    }
}

// Fallback para Cache e Seed JSON
if (file_exists($cacheFile)) {
    $content = @file_get_contents($cacheFile);
    if ($content) $allPosts = json_decode($content, true) ?: [];
}
if (empty($allPosts) && file_exists($seedFile)) {
    $content = @file_get_contents($seedFile);
    if ($content) $allPosts = json_decode($content, true) ?: [];
}

if (!$post && !empty($slug) && !empty($allPosts)) {
    $nowTs = time();
    foreach ($allPosts as $p) {
        $matchesSlug = (($p['slug'] ?? '') === $slug || (string)($p['id'] ?? '') === $slug);
        if (!$matchesSlug) continue;

        $isPub = (int)($p['is_published'] ?? 1) === 1;
        if (!$isPub) continue;

        $pScheduled = !empty($p['created_at']) && (strtotime($p['created_at']) > $nowTs);
        if ($pScheduled) {
            if ($isAdmin) {
                $post = $p;
                $isPreview = true;
                break;
            } else {
                // Visitante anônimo: artigo agendado permanece inacessível (HTTP 404)
                continue;
            }
        } else {
            $post = $p;
            break;
        }
    }
}

// Caso o artigo não exista ou ainda não tenha sido publicado: Exibir página 404 amigável
if (!$post) {
    http_response_code(404);
    // Garantir que a resposta 404 nunca seja armazenada em cache por navegadores ou proxies,
    // assegurando que assim que o artigo atingir o horário de publicação ele fique imediatamente disponível.
    header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');
    header('X-Robots-Tag: noindex, nofollow');

    $pageTitle = "Artigo Não Encontrado — Você Pode Tudo";
    $metaDescription = "O artigo que você procura não está mais disponível ou mudou de endereço. Confira os artigos mais recentes do Blog Você Pode Tudo.";
    ?>
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?></title>
      <meta name="robots" content="noindex, follow">
      <script src="https://cdn.tailwindcss.com"></script>
      <script defer src="https://unpkg.com/lucide@0.344.0/dist/umd/lucide.min.js"></script>
      <link rel="stylesheet" href="/src/style.css?v=4.72.0">
    </head>
    <body class="bg-slate-50 text-slate-800 min-h-screen flex flex-col justify-between antialiased">
      <header class="bg-white border-b border-slate-200 py-4 px-6 shadow-xs">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" class="flex items-center gap-2.5 group">
            <img src="/assets/logo-icon.png" alt="Logo Oficial Você Pode Tudo" width="36" height="36" class="h-8 sm:h-9 w-auto object-contain">
            <span class="text-base font-black tracking-tight text-slate-900">
              Você<span class="text-[#009639]">Pode</span><span class="text-[#ffcc29]">Tudo</span>
            </span>
          </a>
          <a href="/blog" class="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5">
            <i data-lucide="book-open" class="w-4 h-4"></i>
            <span>Voltar ao Blog</span>
          </a>
        </div>
      </header>

      <main class="max-w-2xl mx-auto px-4 py-16 text-center flex-1 flex flex-col items-center justify-center">
        <div class="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6 shadow-inner">
          <i data-lucide="file-question" class="w-10 h-10"></i>
        </div>
        <h1 class="text-3xl font-black text-slate-900 mb-3">Ops! Artigo não encontrado</h1>
        <p class="text-slate-600 text-sm max-w-md mx-auto mb-8 leading-relaxed">
          O conteúdo que você tentou acessar pode ter sido atualizado ou mudado de link. Mas temos dezenas de outros artigos práticos de carreira prontos para você.
        </p>
        <div class="flex flex-wrap items-center justify-center gap-3">
          <a href="/blog" class="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2">
            <i data-lucide="compass" class="w-4 h-4"></i>
            <span>Explorar Todos os Artigos</span>
          </a>
          <a href="/" class="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200 shadow-xs transition-all flex items-center gap-2">
            <i data-lucide="home" class="w-4 h-4"></i>
            <span>Ir para o Início</span>
          </a>
        </div>
      </main>

      <footer class="bg-slate-900 text-slate-400 py-6 text-center text-xs">
        <p>© 2026 Você Pode Tudo. Todos os direitos reservados.</p>
      </footer>
      <script>
        document.addEventListener('DOMContentLoaded', () => {
          if (window.lucide) window.lucide.createIcons();
        });
      </script>
    </body>
    </html>
    <?php
    exit;
}

// 3. Mapeamento e Preparação dos Dados do Artigo
$title = (string)($post['title'] ?? 'Artigo Você Pode Tudo');
$excerpt = (string)($post['excerpt'] ?? 'Confira as melhores dicas de carreira, currículo e empregabilidade no portal Você Pode Tudo.');
$author = (string)($post['author'] ?? 'Equipe Editorial Você Pode Tudo');
$categoryKey = (string)($post['category'] ?? 'carreira');

// Mapeamento Oficial de Especialistas E-E-A-T (Qualidade e Autoridade Editorial)
$authorsMap = [
    'mateus' => [
        'name' => 'Mateus S. Marrero',
        'role' => 'Fundador & Responsável Editorial',
        'badge' => 'Fundador • Tecnologia & Segurança da Informação',
        'bio' => 'Profissional de Tecnologia da Informação, formado em Gestão de TI e pós-graduado em Segurança da Informação. Entusiasta da educação, inovação e inclusão digital. Idealizador do Você Pode Tudo, projeto dedicado à democratização do conhecimento e ao acesso gratuito a oportunidades de desenvolvimento pessoal e profissional.',
        'avatar' => 'https://vocepodetudo.com/assets/mateus-marrero.jpg',
        'linkedin' => 'https://www.linkedin.com/in/mateus-marrero-68466820/'
    ],
    'moises' => [
        'name' => 'Moises Souza',
        'role' => 'Especialista em Empregabilidade & Inclusão | CEO Já Te Contaram PcD?',
        'badge' => 'Editor de Currículo, Entrevistas & Direitos CLT',
        'bio' => 'CEO e criador da Já Te Contaram PcD?, palestrante e consultor especializado em diversidade, inclusão e acessibilidade organizacional. Atua apoiando empresas de diferentes segmentos e portes na construção de culturas mais inclusivas, lideranças preparadas e processos mais justos e acessíveis, unindo visão estratégica, sensibilidade humana e foco em resultados práticos.',
        'avatar' => 'https://vocepodetudo.com/assets/moises-souza.jpg',
        'linkedin' => 'https://www.linkedin.com/in/moises-inclus%C3%A3o-16781171/'
    ]
];

$authorLower = mb_strtolower($author, 'UTF-8');
if (strpos($authorLower, 'mateus') !== false || strpos($authorLower, 'marrero') !== false || in_array($categoryKey, ['tecnologia', 'programacao', 'ia', 'informatica', 'excel', 'estudos_e_ferramentas', 'cidadania_digital'], true)) {
    $expert = $authorsMap['mateus'];
} else {
    $expert = $authorsMap['moises'];
}
$displayAuthorName = !empty($author) && strpos($author, 'Equipe') === false ? $author : $expert['name'];
$readTime = (int)($post['read_time_minutes'] ?? 5);
if ($readTime <= 0) $readTime = 5;
$viewsCount = max(0, (int)($post['views_count'] ?? 0));

// Normalização da Imagem de Capa para Redes Sociais (WhatsApp, Facebook, Twitter, LinkedIn, Telegram)
$rawCoverImage = !empty($post['cover_image']) ? trim((string)$post['cover_image']) : '';
if (!empty($rawCoverImage)) {
    if (preg_match('#^https?://#i', $rawCoverImage)) {
        $coverImage = $rawCoverImage;
        // Otimização de dimensões do Unsplash para Open Graph HD (1200x630 proporção 1.91:1)
        if (strpos($coverImage, 'images.unsplash.com') !== false) {
            $baseUnsplash = explode('?', $coverImage)[0];
            $coverImage = $baseUnsplash . '?w=1200&h=630&auto=format&fit=crop&q=85';
        }
    } else {
        $cleanPath = ltrim($rawCoverImage, './');
        $coverImage = 'https://vocepodetudo.com/' . $cleanPath;
    }
} else {
    // Imagem padrão chamativa de alta resolução
    $coverImage = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&auto=format&fit=crop&q=85';
}

// Tipo MIME dinâmico para a tag og:image:type
$imageExt = strtolower(pathinfo(parse_url($coverImage, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION));
$imageMimeType = ($imageExt === 'png') ? 'image/png' : (($imageExt === 'webp') ? 'image/webp' : 'image/jpeg');
$slugStr = (string)($post['slug'] ?? $slug);
$canonicalUrl = 'https://vocepodetudo.com/artigo/' . urlencode($slugStr);
$contentHtml = (string)($post['content'] ?? '<p>' . htmlspecialchars($excerpt, ENT_QUOTES, 'UTF-8') . '</p>');
// Sanitizar qualquer quebra de linha escapada como texto literal (\r\n, \n) que possa ter vazado de dumps legados
$contentHtml = str_replace(["\\r\\n", "\\r", "\\n"], "\n", $contentHtml);

// Dicionário de Categorias Amigáveis e Cores
$categoryMap = [
    'carreira'   => ['label' => 'Carreira & Emprego',       'badgeBg' => 'bg-emerald-500', 'badgeText' => 'text-white', 'border' => 'border-emerald-500'],
    'entrevista' => ['label' => 'Dicas de Entrevista',      'badgeBg' => 'bg-indigo-600',  'badgeText' => 'text-white', 'border' => 'border-indigo-600'],
    'curriculo'  => ['label' => 'Currículo Profissional',   'badgeBg' => 'bg-blue-600',    'badgeText' => 'text-white', 'border' => 'border-blue-600'],
    'estudos'    => ['label' => 'Cursos & Capacitação',     'badgeBg' => 'bg-purple-600',  'badgeText' => 'text-white', 'border' => 'border-purple-600'],
    'financas'   => ['label' => 'Educação Financeira',      'badgeBg' => 'bg-amber-500',   'badgeText' => 'text-slate-950', 'border' => 'border-amber-500'],
    'tecnologia' => ['label' => 'Tecnologia & Inovação',    'badgeBg' => 'bg-cyan-600',    'badgeText' => 'text-white', 'border' => 'border-cyan-600'],
    'clt'        => ['label' => 'Direitos Trabalhistas',    'badgeBg' => 'bg-rose-600',    'badgeText' => 'text-white', 'border' => 'border-rose-600']
];
$currentCat = $categoryMap[$categoryKey] ?? ['label' => ucfirst($categoryKey), 'badgeBg' => 'bg-emerald-600', 'badgeText' => 'text-white', 'border' => 'border-emerald-600'];

// Processar Tags
$tags = [];
if (!empty($post['tags'])) {
    if (is_array($post['tags'])) {
        $tags = $post['tags'];
    } else {
        $tags = array_filter(array_map('trim', explode(',', (string)$post['tags'])));
    }
}
if (empty($tags)) {
    $tags = ['Carreira', 'Dicas Profissionais', 'Empregabilidade', 'Você Pode Tudo'];
}

// Formatar data em português por extenso
function formatBrazilianFullDate(?string $dateStr): string {
    if (empty($dateStr)) return date('d/m/Y');
    $time = strtotime($dateStr);
    if (!$time) return date('d/m/Y');
    
    $meses = [
        1 => 'janeiro', 2 => 'fevereiro', 3 => 'março', 4 => 'abril',
        5 => 'maio', 6 => 'junho', 7 => 'julho', 8 => 'agosto',
        9 => 'setembro', 10 => 'outubro', 11 => 'novembro', 12 => 'dezembro'
    ];
    $dia = (int)date('d', $time);
    $mes = $meses[(int)date('n', $time)] ?? '';
    $ano = date('Y', $time);
    return "{$dia} de {$mes} de {$ano}";
}

$datePublishedIso = !empty($post['created_at']) ? date('c', strtotime($post['created_at'])) : date('c');
$dateFormatted = formatBrazilianFullDate($post['created_at'] ?? null);

// Buscar Artigos Relacionados (Apenas artigos EFETIVAMENTE PUBLICADOS)
$relatedPosts = [];
if (!empty($allPosts)) {
    $nowTs = time();
    $publishedPool = array_filter($allPosts, function($other) use ($nowTs) {
        $isPub = (int)($other['is_published'] ?? 1) === 1;
        $dateTs = !empty($other['created_at']) ? strtotime($other['created_at']) : 0;
        return $isPub && $dateTs <= $nowTs;
    });

    foreach ($publishedPool as $other) {
        if (($other['slug'] ?? '') !== $slugStr && (string)($other['id'] ?? '') !== (string)($post['id'] ?? '')) {
            if (($other['category'] ?? '') === $categoryKey) {
                $relatedPosts[] = $other;
            }
        }
        if (count($relatedPosts) >= 3) break;
    }
    // Se não encontrou 3 da mesma categoria, preencher com os primeiros disponíveis do pool publicado
    if (count($relatedPosts) < 3) {
        foreach ($publishedPool as $other) {
            if (($other['slug'] ?? '') !== $slugStr && (string)($other['id'] ?? '') !== (string)($post['id'] ?? '')) {
                if (!in_array($other, $relatedPosts, true)) {
                    $relatedPosts[] = $other;
                }
            }
            if (count($relatedPosts) >= 3) break;
        }
    }
}

// Configuração do Smart CTA de acordo com o tema
$ctaConfig = [
    'badge' => 'Ferramenta 100% Gratuita',
    'title' => 'Turbine seu Currículo com Cursos Gratuitos',
    'desc'  => 'Capacite-se com mais de 190 cursos online com certificado reconhecido pelo MEC e aumente suas chances de contratação.',
    'btn'   => 'Ver Cursos Gratuitos',
    'url'   => '/',
    'icon'  => 'graduation-cap',
    'bg'    => 'from-emerald-700 to-teal-800'
];

$titleLower = mb_strtolower($title, 'UTF-8');
if ($categoryKey === 'curriculo' || str_contains($titleLower, 'currículo') || str_contains($titleLower, 'curriculo') || str_contains($titleLower, 'ats')) {
    $ctaConfig = [
        'badge' => 'Criador Profissional ATS',
        'title' => 'Crie seu Currículo Perfeito em Minutos',
        'desc'  => 'Preencha seus dados de forma guiada, exporte em PDF de alta qualidade e seja notado pelos recrutadores e sistemas de RH.',
        'btn'   => 'Criar Currículo Grátis',
        'url'   => '/curriculo',
        'icon'  => 'file-check-2',
        'bg'    => 'from-blue-700 to-indigo-800'
    ];
} elseif ($categoryKey === 'entrevista' || str_contains($titleLower, 'entrevista') || str_contains($titleLower, 'rh') || str_contains($titleLower, 'star')) {
    $ctaConfig = [
        'badge' => 'Simulador Interativo STAR',
        'title' => 'Treine para Entrevistas de Emprego Reais',
        'desc'  => 'Pratique 45 perguntas reais de RH divididas em 9 áreas com cronômetro, análise do Método STAR e emissão de laudo em PDF.',
        'btn'   => 'Treinar Entrevista Agora',
        'url'   => '/simulador-entrevista',
        'icon'  => 'message-square',
        'bg'    => 'from-indigo-700 to-purple-800'
    ];
} elseif ($categoryKey === 'clt' || str_contains($titleLower, 'rescisão') || str_contains($titleLower, 'rescisao') || str_contains($titleLower, 'demissão') || str_contains($titleLower, 'trabalhista')) {
    $ctaConfig = [
        'badge' => 'Cálculo Conforme a CLT 2026',
        'title' => 'Calcule sua Rescisão Trabalhista Grátis',
        'desc'  => 'Descubra exatamente quanto você tem a receber: saldo de salário, aviso prévio, férias proporcionais, 13º e multa do FGTS.',
        'btn'   => 'Calcular Rescisão Grátis',
        'url'   => '/calculadora-trabalhista',
        'icon'  => 'calculator',
        'bg'    => 'from-rose-700 to-red-800'
    ];
}

// Cabeçalhos de Cache & Indexação
if ($isPreview) {
    // Pré-visualização administrativa de artigo agendado: NUNCA armazenar em cache público ou intermediário
    header('X-Robots-Tag: noindex, nofollow, noarchive');
    header('Cache-Control: private, no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');
} else {
    // Artigo publicado: Cache privado sem proxy intermediário para garantir contagem 100% autêntica de cliques em tempo real
    header('Cache-Control: private, no-cache, no-store, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');
}
?>
<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- SEO Primário -->
  <title><?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?><?= $isPreview ? ' [PREVIEW]' : '' ?> — Você Pode Tudo</title>
  <meta name="description" content="<?= htmlspecialchars($excerpt, ENT_QUOTES, 'UTF-8') ?>">
  <meta name="keywords" content="<?= htmlspecialchars(implode(', ', $tags), ENT_QUOTES, 'UTF-8') ?>, blog vocepodetudo">
  <meta name="author" content="<?= htmlspecialchars($author, ENT_QUOTES, 'UTF-8') ?>">
  <?php if ($isPreview): ?>
  <meta name="robots" content="noindex, nofollow, noarchive">
  <?php else: ?>
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <?php endif; ?>
  <link rel="canonical" href="<?= $canonicalUrl ?>">

  <!-- Open Graph / WhatsApp / Facebook / LinkedIn / Telegram -->
  <meta property="og:locale" content="pt_BR">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Você Pode Tudo">
  <meta property="og:title" content="<?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?>">
  <meta property="og:description" content="<?= htmlspecialchars($excerpt, ENT_QUOTES, 'UTF-8') ?>">
  <meta property="og:image" content="<?= htmlspecialchars($coverImage, ENT_QUOTES, 'UTF-8') ?>">
  <meta property="og:image:secure_url" content="<?= htmlspecialchars($coverImage, ENT_QUOTES, 'UTF-8') ?>">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="<?= $imageMimeType ?>">
  <meta property="og:image:alt" content="<?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?>">
  <meta property="og:url" content="<?= $canonicalUrl ?>">
  <meta property="article:published_time" content="<?= $datePublishedIso ?>">
  <meta property="article:modified_time" content="<?= $datePublishedIso ?>">
  <meta property="article:author" content="<?= htmlspecialchars($author, ENT_QUOTES, 'UTF-8') ?>">
  <meta property="article:section" content="<?= htmlspecialchars($currentCat['label'], ENT_QUOTES, 'UTF-8') ?>">
  <?php foreach ($tags as $t): ?>
  <meta property="article:tag" content="<?= htmlspecialchars($t, ENT_QUOTES, 'UTF-8') ?>">
  <?php endforeach; ?>

  <!-- Fallback direto para WhatsApp, Telegram e navegadores móveis -->
  <link rel="image_src" href="<?= htmlspecialchars($coverImage, ENT_QUOTES, 'UTF-8') ?>">

  <!-- Twitter / X Cards com Imagem Grande (Large Image Preview) -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@vocepodetudo">
  <meta name="twitter:creator" content="@vocepodetudo">
  <meta name="twitter:title" content="<?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?>">
  <meta name="twitter:description" content="<?= htmlspecialchars($excerpt, ENT_QUOTES, 'UTF-8') ?>">
  <meta name="twitter:image" content="<?= htmlspecialchars($coverImage, ENT_QUOTES, 'UTF-8') ?>">
  <meta name="twitter:image:alt" content="<?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?>">

  <!-- Favicon e Ícones PWA -->
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/logo-icon.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/assets/icon-192.png">
  <link rel="apple-touch-icon" sizes="192x192" href="/assets/icon-192.png">
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#005e24">

  <!-- Resource Hints -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://cdn.tailwindcss.com">

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              green: '#009B3A',
              yellow: '#FFDF00',
              blue: '#002776'
            }
          }
        }
      }
    };
  </script>

  <!-- Lucide Icons -->
  <script defer src="https://unpkg.com/lucide@0.344.0/dist/umd/lucide.min.js"></script>

  <!-- Estilos Globais -->
  <link rel="stylesheet" href="/src/style.css?v=4.72.0">

  <!-- Estilos Ricos de Leitura Tipográfica e Impressão -->
  <style>
    .article-body {
      font-size: 1.05rem;
      line-height: 1.85;
      color: #334155;
    }
    .article-body p {
      margin-bottom: 1.4rem;
    }
    .article-body h2 {
      font-size: 1.55rem;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2.25rem;
      margin-bottom: 0.85rem;
      line-height: 1.35;
      position: relative;
      padding-bottom: 0.35rem;
      border-bottom: 2px solid #e2e8f0;
    }
    .article-body h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
      margin-top: 1.75rem;
      margin-bottom: 0.65rem;
      line-height: 1.4;
    }
    .article-body ul, .article-body ol {
      margin-bottom: 1.4rem;
      padding-left: 1.6rem;
    }
    .article-body ul {
      list-style-type: disc;
    }
    .article-body ol {
      list-style-type: decimal;
    }
    .article-body li {
      margin-bottom: 0.5rem;
    }
    .article-body strong {
      color: #0f172a;
      font-weight: 700;
    }
    .article-body blockquote {
      border-left: 4px solid #009B3A;
      padding-left: 1.25rem;
      margin: 1.5rem 0;
      font-style: italic;
      color: #475569;
      background: #f8fafc;
      padding-top: 0.75rem;
      padding-bottom: 0.75rem;
      border-radius: 0 0.75rem 0.75rem 0;
    }
    .article-body a {
      color: #008031;
      text-decoration: underline;
      font-weight: 600;
      transition: color 0.15s ease;
    }
    .article-body a:hover {
      color: #005e24;
    }

    /* Tabelas Comparativas Ricas e Responsivas */
    .article-body .table-wrapper {
      width: 100%;
      overflow-x: auto;
      margin: 1.75rem 0;
      border-radius: 1rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .article-body table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
      text-align: left;
    }
    .article-body th {
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 800;
      padding: 0.75rem 1rem;
      border-bottom: 2px solid #cbd5e1;
    }
    .article-body td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }
    .article-body tr:last-child td {
      border-bottom: none;
    }
    .article-body tr:nth-child(even) {
      background: #f8fafc;
    }

    /* Caixas de Destaque / Callouts */
    .callout-dica {
      background: #f0fdf4;
      border-left: 4px solid #16a34a;
      border-radius: 0 1rem 1rem 0;
      padding: 1rem 1.25rem;
      margin: 1.5rem 0;
      color: #166534;
    }
    .callout-alerta {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      border-radius: 0 1rem 1rem 0;
      padding: 1rem 1.25rem;
      margin: 1.5rem 0;
      color: #92400e;
    }
    .callout-exemplo {
      background: #f0f9ff;
      border-left: 4px solid #0284c7;
      border-radius: 0 1rem 1rem 0;
      padding: 1rem 1.25rem;
      margin: 1.5rem 0;
      color: #075985;
    }

    /* FAQ Box */
    .article-faq {
      margin-top: 2.5rem;
      padding-top: 2rem;
      border-top: 2px dashed #e2e8f0;
    }

    /* Impressão Limpa sem Cabeçalhos/Anúncios */
    @media print {
      header, footer, aside, #reading-progress-bar, #share-bar-top, #article-social-footer, #article-reactions, #smart-cta-banner, #related-articles-section, #floating-whatsapp-widget, #mobile-bottom-bar, #tts-audio-box {
        display: none !important;
      }
      body {
        background: white !important;
        color: black !important;
      }
      .article-body {
        font-size: 11pt !important;
        line-height: 1.6 !important;
      }
    }
  </style>

  <?php if (!$isPreview): ?>
  <!-- Schema.org Estruturado: NewsArticle e BreadcrumbList -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        "@id": <?= json_encode($canonicalUrl . '#article') ?>,
        "isPartOf": {
          "@type": "WebPage",
          "@id": <?= json_encode($canonicalUrl) ?>
        },
        "headline": <?= json_encode($title) ?>,
        "description": <?= json_encode($excerpt) ?>,
        "inLanguage": "pt-BR",
        "image": [<?= json_encode($coverImage) ?>],
        "datePublished": <?= json_encode($datePublishedIso) ?>,
        "dateModified": <?= json_encode($datePublishedIso) ?>,
        "mainEntityOfPage": <?= json_encode($canonicalUrl) ?>,
        "author": {
          "@type": "Person",
          "name": <?= json_encode($expert['name']) ?>,
          "jobTitle": <?= json_encode($expert['role']) ?>,
          "url": "https://vocepodetudo.com/politica-editorial"<?= !empty($expert['linkedin']) ? ",\n          \"sameAs\": " . json_encode([$expert['linkedin']]) : "" ?>
        },
        "publisher": {
          "@type": "Organization",
          "name": "Você Pode Tudo",
          "url": "https://vocepodetudo.com",
          "logo": {
            "@type": "ImageObject",
            "url": "https://vocepodetudo.com/assets/logo.png"
          }
        },
        "articleSection": <?= json_encode($currentCat['label']) ?>,
        "keywords": <?= json_encode(implode(', ', $tags)) ?>
      },
      {
        "@type": "BreadcrumbList",
        "@id": <?= json_encode($canonicalUrl . '#breadcrumb') ?>,
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
            "name": "Blog de Carreira",
            "item": "https://vocepodetudo.com/blog"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": <?= json_encode($currentCat['label']) ?>,
            "item": <?= json_encode("https://vocepodetudo.com/blog?cat=" . urlencode($categoryKey)) ?>
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": <?= json_encode($title) ?>,
            "item": <?= json_encode($canonicalUrl) ?>
          }
        ]
      }
    ]
  }
  </script>
  <?php else: ?>
  <!-- Pré-visualização Administrativa: NewsArticle suprimido para impedir indexação e rastreamento de dados de artigo futuro -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
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
        "name": "Blog de Carreira",
        "item": "https://vocepodetudo.com/blog"
      }
    ]
  }
  </script>
  <?php endif; ?>

  <!-- Google AdSense Oficial -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9421145457118515" crossorigin="anonymous"></script>
</head>
<body class="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col font-sans">

  <?php if ($isPreview): ?>
  <!-- Banner Visual de Pré-Visualização Administrativa (Artigo Agendado) -->
  <div class="bg-amber-500 text-slate-950 px-4 py-3 border-b-2 border-amber-600 font-bold text-sm shadow-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-3">
      <div class="flex items-center gap-2.5">
        <i data-lucide="shield-alert" class="w-5 h-5 flex-shrink-0 text-slate-950"></i>
        <div>
          <span class="font-black text-sm uppercase tracking-wide">Modo de Pré-visualização Administrativa</span>
          <span class="block text-xs font-semibold text-slate-900 mt-0.5">
            Este artigo está <strong>agendado</strong> para publicação oficial em: <strong><?= date('d/m/Y \à\s H:i', strtotime($post['created_at'])) ?> (Horário de Brasília)</strong>.
            Visitantes anônimos e robôs de busca recebem <strong>HTTP 404 (Artigo Não Encontrado)</strong>.
          </span>
        </div>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <span class="px-2.5 py-1 rounded bg-slate-950 text-amber-400 text-xs font-black uppercase">noindex</span>
        <a href="/painel-gestao" class="px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors">Voltar ao Painel</a>
      </div>
    </div>
  </div>
  <?php endif; ?>

  <!-- Barra de Progresso de Leitura Fixa no Topo -->
  <div id="reading-progress-bar" class="fixed top-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-[#FFDF00] z-50 transition-all duration-150 w-0"></div>

  <!-- Barra de Utilidades do Topo -->
  <aside class="bg-gradient-to-r from-[#005e24] via-[#008031] to-[#005e24] text-white border-b-2 border-[#ffcc29] text-xs py-1.5 px-3 select-none relative z-40">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
      <div class="flex items-center gap-2">
        <a href="/blog" class="inline-flex items-center gap-1 text-white hover:text-[#ffdf00] font-black transition-colors" title="Voltar ao Blog">
          <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
          <span>Voltar ao Blog</span>
        </a>
        <span class="text-white/40">|</span>
        <span class="text-emerald-100 hidden sm:inline">Portal de Conteúdo Aberto • 100% Gratuito</span>
      </div>

      <div class="flex items-center gap-3">
        <a href="/vagas" class="text-xs font-bold text-[#ffdf00] hover:text-white underline cursor-pointer flex items-center gap-1">
          <i data-lucide="briefcase" class="w-3 h-3"></i>
          <span>Mural de Vagas</span>
        </a>
        <span class="text-white/40">|</span>
        <a href="/curriculo" class="text-xs font-bold text-emerald-100 hover:text-white underline cursor-pointer flex items-center gap-1">
          <i data-lucide="file-check-2" class="w-3 h-3"></i>
          <span>Criar Currículo ATS</span>
        </a>
        <span class="text-white/40">|</span>
        <a href="/simulador-entrevista" class="text-xs font-bold text-teal-200 hover:text-white underline cursor-pointer flex items-center gap-1">
          <i data-lucide="message-square" class="w-3 h-3"></i>
          <span>Simulador de Entrevistas</span>
        </a>
      </div>
    </div>
  </aside>

  <!-- Cabeçalho Principal -->
  <header class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-4 border-[#009639] shadow-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
      <a href="/" class="flex items-center gap-2.5 group" title="Página Inicial do Você Pode Tudo">
        <img src="/assets/logo-icon.png" alt="Logo Oficial Você Pode Tudo" width="36" height="36" class="h-8 sm:h-9 w-auto object-contain drop-shadow-xs group-hover:scale-105 transition-transform flex-shrink-0">
        <div class="flex flex-col">
          <span class="text-base sm:text-lg font-black tracking-tight leading-none text-slate-900 group-hover:text-[#009639] transition-colors">
            Você<span class="text-[#009639]">Pode</span><span class="text-[#ffcc29]">Tudo</span>
          </span>
          <span class="text-[9px] uppercase font-bold tracking-wider text-slate-400">
            Cursos & Oportunidades
          </span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-4 text-sm font-bold text-slate-700">
        <a href="/" class="hover:text-emerald-700 transition-colors">Cursos Grátis</a>
        <a href="/vagas" class="hover:text-emerald-700 transition-colors">Vagas Abertas</a>
        <a href="/curriculo" class="hover:text-emerald-700 transition-colors">Criador de Currículos</a>
        <a href="/simulador-entrevista" class="hover:text-emerald-700 transition-colors">Simulador STAR</a>
        <a href="/calculadora-trabalhista" class="hover:text-emerald-700 transition-colors">Calculadora CLT</a>
        <a href="/blog" class="text-emerald-700 font-black flex items-center gap-1">
          <i data-lucide="book-open" class="w-4 h-4"></i>
          <span>Blog</span>
        </a>
      </nav>

      <div class="flex items-center gap-2">
        <a href="/blog" class="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors flex items-center gap-1.5">
          <i data-lucide="compass" class="w-3.5 h-3.5"></i>
          <span class="hidden sm:inline">Mais Artigos</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Conteúdo Principal do Artigo -->
  <main class="flex-1 py-8 px-4 sm:px-6">
    <article class="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 sm:p-10">

      <!-- Breadcrumbs Estruturados -->
      <nav aria-label="Breadcrumb" class="mb-6 text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
        <a href="/" class="hover:text-emerald-700 transition-colors flex items-center gap-1">
          <i data-lucide="home" class="w-3.5 h-3.5"></i>
          <span>Início</span>
        </a>
        <span>/</span>
        <a href="/blog" class="hover:text-emerald-700 transition-colors">Blog</a>
        <span>/</span>
        <a href="/blog?cat=<?= urlencode($categoryKey) ?>" class="text-emerald-700 font-semibold hover:underline">
          <?= htmlspecialchars($currentCat['label'], ENT_QUOTES, 'UTF-8') ?>
        </a>
        <span>/</span>
        <span class="text-slate-400 truncate max-w-[200px] sm:max-w-xs" title="<?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?>">
          <?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?>
        </span>
      </nav>

      <!-- Badge de Categoria & Tempo de Leitura -->
      <div class="flex items-center gap-2 mb-4 flex-wrap">
        <span class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider <?= $currentCat['badgeBg'] ?> <?= $currentCat['badgeText'] ?> shadow-xs">
          <?= htmlspecialchars($currentCat['label'], ENT_QUOTES, 'UTF-8') ?>
        </span>
        <span class="inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          <i data-lucide="clock" class="w-3.5 h-3.5 text-emerald-600"></i>
          <span><?= $readTime ?> min de leitura</span>
        </span>
        <span class="inline-flex items-center gap-1.5 text-xs font-black text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full shadow-2xs" title="Total de visualizações e cliques registrados">
          <i data-lucide="eye" class="w-3.5 h-3.5 text-purple-600"></i>
          <span><?= number_format($viewsCount, 0, ',', '.') ?> cliques</span>
        </span>
      </div>

      <!-- Título Principal do Artigo -->
      <h1 class="text-2xl sm:text-4xl font-black text-slate-900 leading-tight sm:leading-snug mb-4 tracking-tight">
        <?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?>
      </h1>

      <!-- Resumo / Lead Excerpt -->
      <p class="text-base sm:text-lg text-slate-600 font-normal leading-relaxed mb-6 border-l-4 border-emerald-500 pl-4 py-1 bg-emerald-50/40 rounded-r-xl">
        <?= htmlspecialchars($excerpt, ENT_QUOTES, 'UTF-8') ?>
      </p>

      <!-- Metadados do Autor, Data & Barra de Ferramentas de Leitura -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-slate-100 mb-8">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#005e24] to-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-sm flex-shrink-0">
            <?= mb_strtoupper(mb_substr($author, 0, 2, 'UTF-8'), 'UTF-8') ?>
          </div>
          <div>
            <div class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span><?= htmlspecialchars($author, ENT_QUOTES, 'UTF-8') ?></span>
              <i data-lucide="badge-check" class="w-3.5 h-3.5 text-emerald-600" title="Redação Oficial Verificada"></i>
            </div>
            <div class="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
              <span>Publicado em <?= $dateFormatted ?></span>
              <span>•</span>
              <span class="font-bold text-purple-700 flex items-center gap-1"><i data-lucide="eye" class="w-3 h-3 text-purple-600"></i> <?= number_format($viewsCount, 0, ',', '.') ?> cliques</span>
              <span>•</span>
              <span>Atualizado para 2026</span>
            </div>
          </div>
        </div>

        <!-- Botões de Acessibilidade & Ações Rápidas -->
        <div class="flex items-center gap-2 flex-wrap">
          <!-- Botão Ouvir Artigo (Web Speech API) -->
          <div id="tts-audio-box" class="flex items-center gap-1">
            <button 
              type="button" 
              id="article-tts-play-btn" 
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
              title="Escutar este artigo em voz alta"
            >
              <i data-lucide="volume-2" class="w-3.5 h-3.5"></i>
              <span id="article-tts-label">Ouvir Artigo</span>
            </button>
            <button 
              type="button" 
              id="article-tts-stop-btn" 
              class="hidden px-2 py-1.5 rounded-xl bg-slate-200 hover:bg-rose-100 hover:text-rose-600 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              title="Interromper leitura"
            >
              <i data-lucide="square" class="w-3.5 h-3.5"></i>
            </button>
          </div>

          <!-- Botão de Imprimir Artigo -->
          <button 
            type="button" 
            onclick="window.print()" 
            class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer" 
            title="Imprimir Artigo ou Salvar em PDF"
          >
            <i data-lucide="printer" class="w-4 h-4"></i>
          </button>

          <!-- Botão de Copiar Link -->
          <button 
            type="button" 
            id="article-copy-link-top-btn" 
            class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer" 
            title="Copiar link do artigo"
          >
            <i data-lucide="link" class="w-4 h-4"></i>
          </button>
        </div>
      </div>

      <!-- Imagem de Capa em Destaque -->
      <?php if (!empty($post['cover_image'])): ?>
      <figure class="mb-8 rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs bg-slate-100">
        <img 
          src="<?= htmlspecialchars($coverImage, ENT_QUOTES, 'UTF-8') ?>" 
          alt="<?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?>" 
          loading="eager"
          onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&auto=format&fit=crop&q=85';" class="w-full h-auto max-h-[460px] object-cover"
        >
        <figcaption class="px-4 py-2 text-center text-xs text-slate-400 bg-white border-t border-slate-100">
          Guia prático e editorial do portal Você Pode Tudo • Reprodução autorizada com citação da fonte
        </figcaption>
      </figure>
      <?php endif; ?>

      <!-- Corpo do Artigo Renderizado com Tipografia Rica -->
      <div id="article-content-body" class="article-body mb-10">
        <?= $contentHtml ?>
      </div>

      <!-- Seção de Tags do Artigo -->
      <?php if (!empty($tags)): ?>
      <div class="mb-8 pt-4 border-t border-slate-100">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Tópicos Relacionados:</span>
        <div class="flex flex-wrap gap-1.5">
          <?php foreach ($tags as $tag): ?>
          <a href="/blog?q=<?= urlencode($tag) ?>" class="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 transition-colors">
            #<?= htmlspecialchars($tag, ENT_QUOTES, 'UTF-8') ?>
          </a>
          <?php endforeach; ?>
        </div>
      </div>
      <?php endif; ?>

      <!-- Caixa de Avaliação & Feedback Interativo -->
      <div id="article-reactions" class="mb-10 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h4 class="text-sm font-bold text-slate-900">Este conteúdo foi útil para você?</h4>
          <p class="text-xs text-slate-500">Sua avaliação nos ajuda a produzir conteúdos cada vez melhores.</p>
        </div>
        <div class="flex items-center gap-2" id="reaction-btns-container">
          <button type="button" onclick="handleReaction(true)" class="px-4 py-2 rounded-xl bg-white hover:bg-emerald-50 hover:border-emerald-400 text-slate-700 hover:text-emerald-700 font-bold text-xs border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs">
            <span>👍 Sim, ajudou muito!</span>
          </button>
          <button type="button" onclick="handleReaction(false)" class="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 font-bold text-xs border border-slate-200 transition-all cursor-pointer shadow-2xs">
            <span>👎 Precisa melhorar</span>
          </button>
        </div>
      </div>

      <!-- Smart CTA Contextual de Carreira -->
      <aside id="smart-cta-banner" class="mb-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-br <?= $ctaConfig['bg'] ?> text-white shadow-lg relative overflow-hidden">
        <div class="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div class="max-w-xl">
            <span class="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/20 text-[#ffdf00] backdrop-blur-xs mb-2">
              <?= $ctaConfig['badge'] ?>
            </span>
            <h3 class="text-xl sm:text-2xl font-black text-white leading-tight mb-2">
              <?= $ctaConfig['title'] ?>
            </h3>
            <p class="text-xs sm:text-sm text-slate-100 leading-relaxed">
              <?= $ctaConfig['desc'] ?>
            </p>
          </div>
          <a 
            href="<?= $ctaConfig['url'] ?>" 
            class="px-6 py-3.5 rounded-2xl bg-[#ffdf00] hover:bg-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer"
          >
            <i data-lucide="<?= $ctaConfig['icon'] ?>" class="w-4 h-4"></i>
            <span><?= $ctaConfig['btn'] ?></span>
          </a>
        </div>
      </aside>

      <!-- Box do Autor Especialista & Compromisso Editorial (E-E-A-T) -->
      <div class="my-10 p-6 sm:p-8 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-50 rounded-3xl border border-slate-200/90 shadow-sm">
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <img src="<?= htmlspecialchars($expert['avatar'], ENT_QUOTES, 'UTF-8') ?>" 
               alt="<?= htmlspecialchars($expert['name'], ENT_QUOTES, 'UTF-8') ?>" 
               class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-3 border-emerald-500 shadow-md flex-shrink-0">
          
          <div class="space-y-2 text-center sm:text-left flex-1">
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 class="text-base sm:text-lg font-black text-slate-900"><?= htmlspecialchars($expert['name'], ENT_QUOTES, 'UTF-8') ?></h3>
              <span class="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#005e24]">
                <i data-lucide="badge-check" class="w-3.5 h-3.5"></i>
                <span><?= htmlspecialchars($expert['badge'], ENT_QUOTES, 'UTF-8') ?></span>
              </span>
            </div>

            <p class="text-xs font-bold text-emerald-800"><?= htmlspecialchars($expert['role'], ENT_QUOTES, 'UTF-8') ?></p>
            <p class="text-xs text-slate-600 leading-relaxed"><?= htmlspecialchars($expert['bio'], ENT_QUOTES, 'UTF-8') ?></p>

            <div class="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[11px] font-bold text-slate-500">
              <span class="flex items-center gap-1 text-[#005e24]">
                <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
                <span>Revisão com Base na Legislação & Padrões MEC</span>
              </span>
              <span>•</span>
              <a href="/politica-editorial" class="text-blue-700 hover:text-blue-900 underline flex items-center gap-1">
                <span>Diretrizes Editoriais</span>
                <i data-lucide="external-link" class="w-3 h-3"></i>
              </a>
              <?php if (!empty($expert['linkedin'])): ?>
                <span>•</span>
                <a href="<?= htmlspecialchars($expert['linkedin'], ENT_QUOTES, 'UTF-8') ?>" target="_blank" rel="noopener noreferrer" class="text-[#0A66C2] hover:text-[#004182] font-black underline flex items-center gap-1">
                  <i data-lucide="linkedin" class="w-3.5 h-3.5"></i>
                  <span>LinkedIn Oficial</span>
                </a>
              <?php endif; ?>
            </div>
          </div>
        </div>
      </div>

      <!-- Barra de Compartilhamento Social Otimizada para WhatsApp & Redes -->
      <div id="article-social-footer" class="pt-6 border-t border-slate-200">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider text-center sm:text-left mb-1">Compartilhe esta informação:</h4>
            <p class="text-[11px] text-slate-500 text-center sm:text-left">Ajude amigos e colegas que também buscam crescimento profissional.</p>
          </div>

          <div class="flex items-center gap-2 flex-wrap justify-center">
            <!-- Botão Nativo de Compartilhar (Celular / Android / iOS) -->
            <button 
              type="button" 
              id="share-native-mobile-btn" 
              class="px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs shadow-xs transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer"
              title="Compartilhar no celular"
            >
              <i data-lucide="share-2" class="w-4 h-4"></i>
              <span>Compartilhar</span>
            </button>

            <!-- Botão WhatsApp com Ícone Oficial -->
            <a 
              id="share-whatsapp-btn"
              href="https://api.whatsapp.com/send?text=<?= urlencode('Confira este excelente artigo no Você Pode Tudo: "' . $title . '" — ' . $canonicalUrl) ?>" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-xs transition-transform hover:scale-105 flex items-center gap-2 cursor-pointer"
              title="Compartilhar no WhatsApp"
            >
              <svg class="w-4 h-4 fill-current text-white flex-shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              <span>WhatsApp</span>
            </a>

            <!-- LinkedIn -->
            <a 
              href="https://www.linkedin.com/sharing/share-offsite/?url=<?= urlencode($canonicalUrl) ?>" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="px-4 py-2.5 rounded-xl bg-[#0077b5] hover:bg-[#006097] text-white font-bold text-xs shadow-xs transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer"
              title="Compartilhar no LinkedIn"
            >
              <i data-lucide="linkedin" class="w-4 h-4"></i>
              <span>LinkedIn</span>
            </a>

            <!-- Telegram -->
            <a 
              href="https://t.me/share/url?url=<?= urlencode($canonicalUrl) ?>&text=<?= urlencode($title) ?>" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="px-4 py-2.5 rounded-xl bg-[#229ED9] hover:bg-[#1b80b0] text-white font-bold text-xs shadow-xs transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer"
              title="Compartilhar no Telegram"
            >
              <i data-lucide="send" class="w-4 h-4"></i>
              <span>Telegram</span>
            </a>

            <!-- Copiar Link -->
            <button 
              type="button" 
              id="share-copy-link-bottom-btn" 
              class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copiar Link"
            >
              <i data-lucide="copy" class="w-4 h-4 text-slate-600"></i>
              <span>Copiar Link</span>
            </button>
          </div>
        </div>
      </div>

    </article>

    <!-- Seção de Artigos Relacionados / Você Também Pode Gostar -->
    <?php if (!empty($relatedPosts)): ?>
    <section id="related-articles-section" class="max-w-4xl mx-auto mt-12 mb-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <span class="text-xs font-black text-emerald-700 uppercase tracking-wider block">Continue Aprendendo</span>
          <h2 class="text-xl sm:text-2xl font-black text-slate-900">Artigos Relacionados de Carreira</h2>
        </div>
        <a href="/blog" class="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1">
          <span>Ver todos os artigos</span>
          <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
        </a>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <?php foreach ($relatedPosts as $rel): 
          $relCat = $categoryMap[$rel['category'] ?? 'carreira'] ?? ['label' => 'Carreira', 'badgeBg' => 'bg-emerald-600', 'badgeText' => 'text-white'];
          $relUrl = '/artigo/' . urlencode((string)($rel['slug'] ?? $rel['id']));
          $relCover = !empty($rel['cover_image']) ? $rel['cover_image'] : '/assets/logo-icon.png';
        ?>
        <article class="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
          <div>
            <a href="<?= $relUrl ?>" class="block h-36 w-full overflow-hidden bg-slate-100 relative">
              <img 
                src="<?= htmlspecialchars($relCover, ENT_QUOTES, 'UTF-8') ?>" 
                alt="<?= htmlspecialchars((string)($rel['title'] ?? ''), ENT_QUOTES, 'UTF-8') ?>" 
                loading="lazy" 
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              >
              <span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase <?= $relCat['badgeBg'] ?> <?= $relCat['badgeText'] ?> shadow-xs">
                <?= htmlspecialchars($relCat['label'], ENT_QUOTES, 'UTF-8') ?>
              </span>
            </a>
            <div class="p-4">
              <h3 class="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 mb-2 leading-snug">
                <a href="<?= $relUrl ?>"><?= htmlspecialchars((string)($rel['title'] ?? ''), ENT_QUOTES, 'UTF-8') ?></a>
              </h3>
              <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                <?= htmlspecialchars((string)($rel['excerpt'] ?? ''), ENT_QUOTES, 'UTF-8') ?>
              </p>
              <div class="flex items-center justify-between text-[11px] text-slate-400 font-semibold pt-2 border-t border-slate-100">
                <span><?= $rel['read_time_minutes'] ?? 5 ?> min de leitura</span>
                <span class="inline-flex items-center gap-1 font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                  <i data-lucide="eye" class="w-3 h-3 text-purple-600"></i>
                  <?= number_format((int)($rel['views_count'] ?? 0), 0, ',', '.') ?> cliques
                </span>
              </div>
            </div>
          </div>
          <div class="p-4 pt-0">
            <a href="<?= $relUrl ?>" class="w-full py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white transition-all text-center flex items-center justify-center gap-1">
              <span>Ler Artigo</span>
              <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
            </a>
          </div>
        </article>
        <?php endforeach; ?>
      </div>
    </section>
    <?php endif; ?>

  </main>

  <!-- Rodapé Oficial do Portal Você Pode Tudo -->
  <footer class="bg-slate-900 text-slate-300 pt-12 pb-24 md:pb-12 border-t-4 border-[#009639]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
        <div>
          <div class="flex items-center gap-2.5 mb-4">
            <img src="/assets/logo-icon.png" alt="Você Pode Tudo" width="36" height="36" loading="lazy" decoding="async" class="w-9 h-9 object-contain drop-shadow-sm">
            <div>
              <span class="text-base font-black text-white leading-tight block">Você<span class="text-[#009639]">Pode</span><span class="text-[#ffcc29]">Tudo</span></span>
              <span class="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Cursos & Carreiras</span>
            </div>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed mb-4">
            Plataforma 100% gratuita de capacitação profissional, vagas de emprego, gerador de currículos ATS, simulador de entrevistas e orientações de carreira.
          </p>
          <div class="flex items-center gap-2">
            <a href="https://chat.whatsapp.com/FN9jb73jdKs1UYq0BbIC3j" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-xl bg-[#25D366] text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-90">
              <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
              <span>Comunidade no WhatsApp</span>
            </a>
          </div>
        </div>

        <div>
          <h5 class="text-xs font-black uppercase text-white tracking-wider mb-3">Ferramentas Gratuitas</h5>
          <ul class="text-xs space-y-2 text-slate-400">
            <li><a href="/curriculo" class="hover:text-emerald-400 transition-colors">Criador de Currículos ATS</a></li>
            <li><a href="/simulador-entrevista" class="hover:text-emerald-400 transition-colors">Simulador de Entrevistas STAR</a></li>
            <li><a href="/calculadora-trabalhista" class="hover:text-emerald-400 transition-colors">Calculadora Trabalhista CLT</a></li>
            <li><a href="/vagas" class="hover:text-emerald-400 transition-colors">Mural de Vagas Atualizado</a></li>
            <li><a href="/downloads" class="hover:text-emerald-400 transition-colors">Modelos de Currículo para Download</a></li>
          </ul>
        </div>

        <div>
          <h5 class="text-xs font-black uppercase text-white tracking-wider mb-3">Categorias do Blog</h5>
          <ul class="text-xs space-y-2 text-slate-400">
            <li><a href="/blog?cat=carreira" class="hover:text-emerald-400 transition-colors">Carreira & Primeiro Emprego</a></li>
            <li><a href="/blog?cat=entrevista" class="hover:text-emerald-400 transition-colors">Perguntas de Entrevista de RH</a></li>
            <li><a href="/blog?cat=curriculo" class="hover:text-emerald-400 transition-colors">Dicas para Currículo Perfeito</a></li>
            <li><a href="/blog?cat=estudos" class="hover:text-emerald-400 transition-colors">Cursos Gratuitos com Certificado</a></li>
            <li><a href="/blog?cat=clt" class="hover:text-emerald-400 transition-colors">Direitos do Trabalhador</a></li>
          </ul>
        </div>

        <div>
          <h5 class="text-xs font-black uppercase text-white tracking-wider mb-3">Institucional</h5>
          <ul class="text-xs space-y-2 text-slate-400">
            <li><a href="/sobre" class="hover:text-emerald-400 transition-colors">Quem Somos</a></li>
            <li><a href="/contato" class="hover:text-emerald-400 transition-colors">Fale Conosco</a></li>
            <li><a href="/politica-privacidade" class="hover:text-emerald-400 transition-colors">Política de Privacidade</a></li>
            <li><a href="/termos-de-uso" class="hover:text-emerald-400 transition-colors">Termos de Uso</a></li>
            <li><a href="/sitemap.xml" class="hover:text-emerald-400 transition-colors">Mapa do Site (XML)</a></li>
          </ul>
        </div>
      </div>

            <!-- Declaração Oficial de Independência Institucional e Curadoria -->
      <div class="my-6 p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-[11px] text-slate-400 leading-relaxed">
        <p class="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
          <i data-lucide="shield-alert" class="w-4 h-4 text-[#ffcc29]"></i>
          <span>Aviso de Independência Institucional & Isenção de Vínculos</span>
        </p>
        <p>
          O <strong>Você Pode Tudo (vocepodetudo.com)</strong> é um portal brasileiro de utilidade pública e curadoria independente. <strong>Não somos uma instituição de ensino, não comercializamos vagas e não emitimos certificados em nosso nome.</strong> Todas as marcas, logotipos e nomes de instituições mencionadas pertencem exclusivamente aos seus respectivos titulares de direitos. A menção a tais entidades tem caráter estritamente informativo e de utilidade pública, não implicando parceria comercial, patrocínio societário ou endosso recíproco. O acesso oficial, matrícula e emissão de certificados ocorrem unicamente dentro das plataformas externas de cada instituição responsável.
        </p>
      </div>

<div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center sm:text-left">
        <div>
          <span>© 2026 Você Pode Tudo. Todos os direitos reservados.</span>
          <span class="block text-[11px] text-slate-500 mt-0.5">Conteúdos editoriais independentes com foco em educação e empregabilidade.</span>
        </div>
      </div>
    </div>
  </footer>

  <!-- Barra de Navegação Inferior Mobile -->
  <nav 
    id="mobile-bottom-bar"
    class="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5"
    aria-label="Navegação Rápida Mobile"
  >
    <div class="max-w-md mx-auto grid grid-cols-5 gap-1 text-center">
      <a href="/" class="flex flex-col items-center justify-center py-1 rounded-xl text-slate-600 hover:text-emerald-600 transition-colors">
        <i data-lucide="home" class="w-5 h-5"></i>
        <span class="text-[10px] font-bold mt-0.5 leading-none">Início</span>
      </a>
      <a href="/vagas" class="flex flex-col items-center justify-center py-1 rounded-xl text-slate-600 hover:text-emerald-600 transition-colors">
        <i data-lucide="briefcase" class="w-5 h-5"></i>
        <span class="text-[10px] font-bold mt-0.5 leading-none">Vagas</span>
      </a>
      <a href="/curriculo" class="flex flex-col items-center justify-center py-1 rounded-xl text-slate-600 hover:text-emerald-600 transition-colors">
        <i data-lucide="file-text" class="w-5 h-5"></i>
        <span class="text-[10px] font-bold mt-0.5 leading-none">Currículo</span>
      </a>
      <a href="/blog" class="flex flex-col items-center justify-center py-1 rounded-xl text-emerald-700 font-bold">
        <i data-lucide="book-open" class="w-5 h-5"></i>
        <span class="text-[10px] font-bold mt-0.5 leading-none">Blog</span>
      </a>
      <a href="/simulador-entrevista" class="flex flex-col items-center justify-center py-1 rounded-xl text-slate-600 hover:text-emerald-600 transition-colors">
        <i data-lucide="message-square" class="w-5 h-5"></i>
        <span class="text-[10px] font-bold mt-0.5 leading-none">Simulador</span>
      </a>
    </div>
  </nav>

  <!-- Botão Flutuante do WhatsApp -->
  <aside 
    id="floating-whatsapp-widget" 
    class="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center"
    aria-label="Grupo Oficial do WhatsApp"
  >
    <a 
      href="https://chat.whatsapp.com/FN9jb73jdKs1UYq0BbIC3j" 
      target="_blank" 
      rel="noopener noreferrer" 
      class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white focus:outline-none cursor-pointer"
      title="Entrar na Comunidade Oficial do WhatsApp"
    >
      <svg class="w-7 h-7 fill-current text-white flex-shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
    </a>
  </aside>

  <!-- Container de Toast Flutuante -->
  <div id="article-toast" class="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold transition-all duration-300 opacity-0 pointer-events-none flex items-center gap-2 border border-slate-700">
    <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400"></i>
    <span id="article-toast-msg">Link copiado com sucesso!</span>
  </div>

  <!-- Scripts Interativos da Página Própria do Artigo -->
  <script>
    // Inicializar ícones Lucide
    document.addEventListener('DOMContentLoaded', () => {
      if (window.lucide) window.lucide.createIcons();
    });

    // Barra de Progresso de Leitura
    window.addEventListener('scroll', () => {
      const progressBar = document.getElementById('reading-progress-bar');
      if (!progressBar) return;
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      progressBar.style.width = Math.min(100, Math.max(0, scrolled)) + '%';
    });

    // Função de Toast
    function showArticleToast(msg) {
      const toast = document.getElementById('article-toast');
      const toastMsg = document.getElementById('article-toast-msg');
      if (!toast || !toastMsg) return;
      toastMsg.textContent = msg;
      toast.classList.remove('opacity-0', 'pointer-events-none');
      setTimeout(() => {
        toast.classList.add('opacity-0', 'pointer-events-none');
      }, 3000);
    }

    // Copiar Link
    function setupCopyLinkBtn(btnId) {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          showArticleToast('Link do artigo copiado para a área de transferência!');
        } catch (e) {
          showArticleToast('Link: ' + window.location.href);
        }
      });
    }
    setupCopyLinkBtn('article-copy-link-top-btn');
    setupCopyLinkBtn('share-copy-link-bottom-btn');

    // Botão Nativo de Compartilhamento (Web Share API)
    const nativeShareBtn = document.getElementById('share-native-mobile-btn');
    if (nativeShareBtn) {
      if (navigator.share) {
        nativeShareBtn.addEventListener('click', async () => {
          try {
            await navigator.share({
              title: <?= json_encode($title) ?>,
              text: <?= json_encode('Confira este excelente artigo no Você Pode Tudo: "' . $title . '"') ?>,
              url: <?= json_encode($canonicalUrl) ?>
            });
          } catch (e) {}
        });
      } else {
        nativeShareBtn.classList.add('hidden');
      }
    }

    // Reações Sim/Não
    function handleReaction(isPositive) {
      const container = document.getElementById('reaction-btns-container');
      if (!container) return;
      if (isPositive) {
        container.innerHTML = '<span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5"><i data-lucide="check" class="w-3.5 h-3.5"></i> Obrigado pelo seu feedback positivo!</span>';
      } else {
        container.innerHTML = '<span class="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">Obrigado! Trabalharemos para melhorar cada vez mais.</span>';
      }
      if (window.lucide) window.lucide.createIcons();
    }

    // Narração de Voz (Web Speech API)
    let currentSpeechUtterance = null;
    let isSpeechSpeaking = false;
    let isSpeechPaused = false;

    function stopArticleSpeech() {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      isSpeechSpeaking = false;
      isSpeechPaused = false;
      currentSpeechUtterance = null;
      const playBtn = document.getElementById('article-tts-play-btn');
      const stopBtn = document.getElementById('article-tts-stop-btn');
      const label = document.getElementById('article-tts-label');
      if (playBtn) {
        playBtn.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer';
        playBtn.innerHTML = '<i data-lucide="volume-2" class="w-3.5 h-3.5"></i><span id="article-tts-label">Ouvir Artigo</span>';
      }
      if (stopBtn) stopBtn.classList.add('hidden');
      if (window.lucide) window.lucide.createIcons();
    }

    function toggleArticleSpeech() {
      if (!('speechSynthesis' in window)) {
        showArticleToast('Seu navegador não suporta leitura em voz alta.');
        return;
      }

      const playBtn = document.getElementById('article-tts-play-btn');
      const stopBtn = document.getElementById('article-tts-stop-btn');

      if (isSpeechSpeaking) {
        if (isSpeechPaused) {
          window.speechSynthesis.resume();
          isSpeechPaused = false;
          if (playBtn) {
            playBtn.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer';
            playBtn.innerHTML = '<i data-lucide="pause" class="w-3.5 h-3.5"></i><span>Pausar</span>';
          }
        } else {
          window.speechSynthesis.pause();
          isSpeechPaused = true;
          if (playBtn) {
            playBtn.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer';
            playBtn.innerHTML = '<i data-lucide="play" class="w-3.5 h-3.5"></i><span>Continuar</span>';
          }
        }
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      // Iniciar nova leitura
      window.speechSynthesis.cancel();
      const bodyEl = document.getElementById('article-content-body');
      const titleEl = document.querySelector('h1');
      const textToRead = `${titleEl ? titleEl.innerText : ''}. ${bodyEl ? bodyEl.innerText : ''}`.slice(0, 30000);

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find(v => v.lang.startsWith('pt') || v.lang.includes('BR'));
      if (ptVoice) utterance.voice = ptVoice;

      utterance.onstart = () => {
        isSpeechSpeaking = true;
        isSpeechPaused = false;
        if (playBtn) {
          playBtn.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer';
          playBtn.innerHTML = '<i data-lucide="pause" class="w-3.5 h-3.5"></i><span>Pausar</span>';
        }
        if (stopBtn) stopBtn.classList.remove('hidden');
        if (window.lucide) window.lucide.createIcons();
      };

      utterance.onend = () => {
        stopArticleSpeech();
      };

      utterance.onerror = () => {
        stopArticleSpeech();
      };

      currentSpeechUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    }

    const ttsPlayBtn = document.getElementById('article-tts-play-btn');
    const ttsStopBtn = document.getElementById('article-tts-stop-btn');
    if (ttsPlayBtn) ttsPlayBtn.addEventListener('click', toggleArticleSpeech);
    if (ttsStopBtn) ttsStopBtn.addEventListener('click', stopArticleSpeech);
  </script>
</body>
</html>
