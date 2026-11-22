<?php
/**
 * sitemap.php - Gerador Dinâmico Oficial de Sitemap XML
 * Portal Você Pode Tudo — vocepodetudo.com
 * 
 * Gera dinamicamente o sitemap.xml incluindo:
 * 1. Páginas institucionais, ferramentas e landing pages oficiais.
 * 2. Artigos do blog ESTRITAMENTE já publicados (created_at <= NOW()).
 * Novos artigos agendados entram no sitemap automaticamente quando a data/hora
 * programada de publicação for atingida, sem necessidade de edição manual.
 */

declare(strict_types=1);

require_once __DIR__ . '/api/config.php';

header('Content-Type: application/xml; charset=UTF-8');
header('X-Robots-Tag: noindex');
header('Cache-Control: public, max-age=3600');

$staticPages = [
    ['loc' => 'https://vocepodetudo.com/',                        'priority' => '1.0',  'changefreq' => 'daily',   'lastmod' => '2026-11-14'],
    ['loc' => 'https://vocepodetudo.com/vagas',                   'priority' => '0.95', 'changefreq' => 'daily',   'lastmod' => '2026-11-14'],
    ['loc' => 'https://vocepodetudo.com/blog',                    'priority' => '0.9',  'changefreq' => 'weekly',  'lastmod' => '2026-11-14'],
    ['loc' => 'https://vocepodetudo.com/curriculo',               'priority' => '0.95', 'changefreq' => 'weekly',  'lastmod' => '2026-11-14'],
    ['loc' => 'https://vocepodetudo.com/simulador-entrevista',    'priority' => '0.95', 'changefreq' => 'weekly',  'lastmod' => '2026-11-14'],
    ['loc' => 'https://vocepodetudo.com/calculadora-trabalhista', 'priority' => '0.9',  'changefreq' => 'monthly', 'lastmod' => '2026-11-14'],
    ['loc' => 'https://vocepodetudo.com/teste-vocacional',        'priority' => '0.9',  'changefreq' => 'monthly', 'lastmod' => '2026-11-14'],
    ['loc' => 'https://vocepodetudo.com/downloads',               'priority' => '0.9',  'changefreq' => 'weekly',  'lastmod' => '2026-11-14'],
    ['loc' => 'https://vocepodetudo.com/midia-kit',               'priority' => '0.85', 'changefreq' => 'weekly',  'lastmod' => '2026-11-14'],
    ['loc' => 'https://vocepodetudo.com/sobre',                   'priority' => '0.8',  'changefreq' => 'monthly', 'lastmod' => '2026-11-14'],
    ['loc' => 'https://vocepodetudo.com/politica-editorial',      'priority' => '0.8',  'changefreq' => 'monthly', 'lastmod' => '2026-11-19'],
    ['loc' => 'https://vocepodetudo.com/contato',                 'priority' => '0.8',  'changefreq' => 'monthly', 'lastmod' => '2026-11-14'],
    ['loc' => 'https://vocepodetudo.com/politica-privacidade',    'priority' => '0.5',  'changefreq' => 'yearly',  'lastmod' => '2026-11-14'],
    ['loc' => 'https://vocepodetudo.com/exclusao-de-dados',       'priority' => '0.5',  'changefreq' => 'yearly',  'lastmod' => '2026-11-14'],
    ['loc' => 'https://vocepodetudo.com/termos-de-uso',           'priority' => '0.5',  'changefreq' => 'yearly',  'lastmod' => '2026-11-14'],
    ['loc' => 'https://vocepodetudo.com/funcionalidades',         'priority' => '0.85', 'changefreq' => 'monthly', 'lastmod' => '2026-11-22'],
    ['loc' => 'https://vocepodetudo.com/planos',                  'priority' => '0.85', 'changefreq' => 'monthly', 'lastmod' => '2026-11-22'],
    ['loc' => 'https://vocepodetudo.com/como-funciona',           'priority' => '0.85', 'changefreq' => 'monthly', 'lastmod' => '2026-11-22'],
    ['loc' => 'https://vocepodetudo.com/parcerias',               'priority' => '0.8',  'changefreq' => 'monthly', 'lastmod' => '2026-11-22'],
    ['loc' => 'https://vocepodetudo.com/recursos',                'priority' => '0.9',  'changefreq' => 'weekly',  'lastmod' => '2026-11-22'],
    ['loc' => 'https://vocepodetudo.com/central-de-ajuda',        'priority' => '0.85', 'changefreq' => 'monthly', 'lastmod' => '2026-11-22'],
    ['loc' => 'https://vocepodetudo.com/politica-de-cookies',     'priority' => '0.5',  'changefreq' => 'yearly',  'lastmod' => '2026-11-22'],
    ['loc' => 'https://vocepodetudo.com/lgpd',                    'priority' => '0.5',  'changefreq' => 'yearly',  'lastmod' => '2026-11-22'],
    ['loc' => 'https://vocepodetudo.com/termos-de-servico',       'priority' => '0.5',  'changefreq' => 'yearly',  'lastmod' => '2026-11-22'],
    ['loc' => 'https://vocepodetudo.com/cursos-gratis-informatica',    'priority' => '0.85', 'changefreq' => 'weekly', 'lastmod' => '2026-11-14'],
    ['loc' => 'https://vocepodetudo.com/cursos-gratis-excel',          'priority' => '0.85', 'changefreq' => 'weekly', 'lastmod' => '2026-11-14'],
    ['loc' => 'https://vocepodetudo.com/cursos-gratis-programacao',    'priority' => '0.85', 'changefreq' => 'weekly', 'lastmod' => '2026-11-14'],
    ['loc' => 'https://vocepodetudo.com/cursos-gratis-ia',             'priority' => '0.85', 'changefreq' => 'weekly', 'lastmod' => '2026-11-14'],
    ['loc' => 'https://vocepodetudo.com/cursos-gratis-administracao',  'priority' => '0.85', 'changefreq' => 'weekly', 'lastmod' => '2026-11-14'],
    ['loc' => 'https://vocepodetudo.com/cursos-gratis-ingles',         'priority' => '0.85', 'changefreq' => 'weekly', 'lastmod' => '2026-11-14'],
    ['loc' => 'https://vocepodetudo.com/vagas-jovem-aprendiz-2026',    'priority' => '0.9',  'changefreq' => 'weekly', 'lastmod' => '2026-11-14'],
];

$articles = [];
$pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;
if ($pdo) {
    try {
        $stmt = $pdo->query("SELECT `slug`, `created_at` FROM `blog_posts` WHERE `is_published` = 1 AND `created_at` <= NOW() ORDER BY `created_at` DESC");
        $articles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        error_log("Erro sitemap MySQL: " . $e->getMessage());
    }
}

// Fallback para cache JSON caso MySQL esteja offline
if (empty($articles)) {
    $cacheFile = __DIR__ . '/api/cache_blog.json';
    $seedFile  = __DIR__ . '/api/seed_blog.json';
    $posts = [];
    if (file_exists($cacheFile)) {
        $content = @file_get_contents($cacheFile);
        if ($content) $posts = json_decode($content, true) ?: [];
    }
    if (empty($posts) && file_exists($seedFile)) {
        $content = @file_get_contents($seedFile);
        if ($content) $posts = json_decode($content, true) ?: [];
    }
    $now = date('Y-m-d H:i:s');
    foreach ($posts as $p) {
        $isPub = (int)($p['is_published'] ?? 1) === 1;
        $date = $p['created_at'] ?? '2099-01-01 00:00:00';
        if ($isPub && $date <= $now && !empty($p['slug'])) {
            $articles[] = [
                'slug' => $p['slug'],
                'created_at' => $date
            ];
        }
    }
    usort($articles, fn($a, $b) => strcmp($b['created_at'], $a['created_at']));
}

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <!-- Páginas Estratégicas e Ferramentas (URLs Amigáveis Oficiais) -->
<?php foreach ($staticPages as $page): ?>
  <url>
    <loc><?= htmlspecialchars($page['loc'], ENT_XML1, 'UTF-8') ?></loc>
    <lastmod><?= htmlspecialchars($page['lastmod'], ENT_XML1, 'UTF-8') ?></lastmod>
    <changefreq><?= htmlspecialchars($page['changefreq'], ENT_XML1, 'UTF-8') ?></changefreq>
    <priority><?= htmlspecialchars($page['priority'], ENT_XML1, 'UTF-8') ?></priority>
  </url>
<?php endforeach; ?>

  <!-- Artigos do Blog Efetivamente Publicados (Data/Hora alcançada) -->
<?php foreach ($articles as $art): 
    $slugClean = htmlspecialchars((string)$art['slug'], ENT_XML1, 'UTF-8');
    $lastmod = !empty($art['created_at']) ? date('Y-m-d', strtotime((string)$art['created_at'])) : date('Y-m-d');
?>
  <url>
    <loc>https://vocepodetudo.com/artigo/<?= $slugClean ?></loc>
    <lastmod><?= $lastmod ?></lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
<?php endforeach; ?>
</urlset>