const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sitemapPhpPath = path.resolve(__dirname, '../sitemap.php');
let sitemapPhp = fs.readFileSync(sitemapPhpPath, 'utf8');

// Bloco para carregar os cursos no sitemap.php
const courseBlock = `
$coursesList = [];
if ($pdo) {
    try {
        $cStmt = $pdo->query("SELECT \`id\`, \`created_at\` FROM \`courses\` WHERE \`is_active\` = 1 ORDER BY \`featured\` DESC, \`id\` DESC");
        $coursesList = $cStmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {}
}
if (empty($coursesList)) {
    $courseCacheFile = __DIR__ . '/api/cache_courses.json';
    $courseSeedFile  = __DIR__ . '/api/seed_courses.json';
    $rawC = [];
    if (file_exists($courseCacheFile)) {
        $rawC = @json_decode(@file_get_contents($courseCacheFile), true) ?: [];
    }
    if (empty($rawC) && file_exists($courseSeedFile)) {
        $rawC = @json_decode(@file_get_contents($courseSeedFile), true) ?: [];
    }
    foreach ($rawC as $rc) {
        if (!empty($rc['id']) && (!isset($rc['isActive']) || $rc['isActive'])) {
            $coursesList[] = [
                'id' => $rc['id'],
                'created_at' => $rc['createdAt'] ?? '2026-11-20'
            ];
        }
    }
}
`;

// Inserir antes de echo '<?xml version="1.0" encoding="UTF-8"?>'
if (!sitemapPhp.includes('$coursesList = [];')) {
  sitemapPhp = sitemapPhp.replace(
    "echo '<?xml version=\"1.0\" encoding=\"UTF-8\"?>' . \"\\n\";",
    courseBlock + "\necho '<?xml version=\"1.0\" encoding=\"UTF-8\"?>' . \"\\n\";"
  );
}

// Inserir loop XML dos cursos antes de </urlset>
const xmlCourseLoop = `
  <!-- Páginas Individuais Oficiais de Cursos Gratuitos -->
<?php foreach ($coursesList as $cr): 
    $courseIdClean = htmlspecialchars((string)$cr['id'], ENT_XML1, 'UTF-8');
    $lastmodC = !empty($cr['created_at']) ? date('Y-m-d', strtotime((string)$cr['created_at'])) : date('Y-m-d');
?>
  <url>
    <loc>https://vocepodetudo.com/curso/<?= $courseIdClean ?></loc>
    <lastmod><?= $lastmodC ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
<?php endforeach; ?>
</urlset>`;

if (!sitemapPhp.includes('<!-- Páginas Individuais Oficiais de Cursos Gratuitos -->')) {
  sitemapPhp = sitemapPhp.replace('</urlset>', xmlCourseLoop);
}

fs.writeFileSync(sitemapPhpPath, sitemapPhp, 'utf8');
console.log('✅ sitemap.php atualizado com os cursos.');

// Agora executar o sitemap.php via php CLI para salvar a versão estática sitemap.xml
try {
  const xmlOutput = execSync('php sitemap.php', { cwd: path.resolve(__dirname, '..') }).toString();
  const sitemapXmlPath = path.resolve(__dirname, '../sitemap.xml');
  fs.writeFileSync(sitemapXmlPath, xmlOutput, 'utf8');
  console.log(`✅ sitemap.xml gerado com sucesso (${xmlOutput.length} bytes)!`);
} catch (err) {
  console.error('Erro ao gerar sitemap.xml:', err.message);
}
