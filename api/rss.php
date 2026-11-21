<?php
/**
 * api/rss.php - Feed RSS 2.0 Dinâmico do Blog Você Pode Tudo
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

header('Content-Type: application/rss+xml; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$cacheFile = __DIR__ . '/cache_blog.json';
$seedFile = __DIR__ . '/seed_blog.json';

$posts = [];
if (file_exists($cacheFile)) {
    $content = @file_get_contents($cacheFile);
    if ($content) $posts = json_decode($content, true) ?: [];
}
if (empty($posts) && file_exists($seedFile)) {
    $content = @file_get_contents($seedFile);
    if ($content) $posts = json_decode($content, true) ?: [];
}

// Filtrar apenas publicados e já no ar
$now = date('Y-m-d H:i:s');
$published = array_filter($posts, function($p) use ($now) {
    $isPub = (int)($p['is_published'] ?? 1) === 1;
    $date = $p['created_at'] ?? '2000-01-01 00:00:00';
    return $isPub && $date <= $now;
});

usort($published, function($a, $b) {
    return strcmp($b['created_at'] ?? '', $a['created_at'] ?? '');
});

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Blog Você Pode Tudo — Empregabilidade e Carreira</title>
    <link>https://vocepodetudo.com/blog</link>
    <description>Dicas de currículo, entrevistas de emprego, mercado de trabalho e cursos gratuitos com certificado.</description>
    <language>pt-BR</language>
    <lastBuildDate><?= date(DATE_RSS) ?></lastBuildDate>
    <atom:link href="https://www.vocepodetudo.com/api/rss.php" rel="self" type="application/rss+xml"/>
    <image>
      <url>https://www.vocepodetudo.com/assets/logo-icon.png</url>
      <title>Você Pode Tudo</title>
      <link>https://vocepodetudo.com/blog</link>
    </image>
    <?php foreach ($published as $p): 
        $url = 'https://vocepodetudo.com/artigo/' . urlencode((string)$p['slug']);
        $pubDate = !empty($p['created_at']) ? date(DATE_RSS, strtotime($p['created_at'])) : date(DATE_RSS);
    ?>
    <item>
      <title><?= htmlspecialchars((string)$p['title'], ENT_XML1, 'UTF-8') ?></title>
      <link><?= htmlspecialchars($url, ENT_XML1, 'UTF-8') ?></link>
      <guid isPermaLink="true"><?= htmlspecialchars($url, ENT_XML1, 'UTF-8') ?></guid>
      <description><?= htmlspecialchars((string)($p['excerpt'] ?? $p['title']), ENT_XML1, 'UTF-8') ?></description>
      <category><?= htmlspecialchars((string)($p['category'] ?? 'Carreira'), ENT_XML1, 'UTF-8') ?></category>
      <author>contato@vocepodetudo.com (<?= htmlspecialchars((string)($p['author'] ?? 'Equipe Você Pode Tudo'), ENT_XML1, 'UTF-8') ?>)</author>
      <pubDate><?= $pubDate ?></pubDate>
      <?php if (!empty($p['cover_image'])): 
          $imgUrl = (string)$p['cover_image'];
          if (strpos($imgUrl, 'images.unsplash.com') !== false) {
              $baseImg = explode('?', $imgUrl)[0];
              $imgUrl = $baseImg . '?w=1200&h=630&auto=format&fit=crop&q=85';
          }
      ?>
      <enclosure url="<?= htmlspecialchars($imgUrl, ENT_XML1, 'UTF-8') ?>" type="image/jpeg" length="120000" />
      <media:thumbnail url="<?= htmlspecialchars($imgUrl, ENT_XML1, 'UTF-8') ?>" />
      <media:content url="<?= htmlspecialchars($imgUrl, ENT_XML1, 'UTF-8') ?>" medium="image" />
      <?php endif; ?>
    </item>
    <?php endforeach; ?>
  </channel>
</rss>
