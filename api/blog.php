<?php
/**
 * api/blog.php - Blog & Central de Artigos de Carreira, Dicas de Entrevista e Empregabilidade
 * Você Pode Tudo — Plataforma Oficial
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = ['https://vocepodetudo.com', 'https://www.vocepodetudo.com', 'http://localhost:3000', 'http://localhost:3333', 'http://localhost:3456'];
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: https://vocepodetudo.com");
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$cacheFile = __DIR__ . '/cache_blog.json';
$seedFile = __DIR__ . '/seed_blog.json';

// Função auxiliar para carregar posts do arquivo JSON
function loadBlogFromCache(string $file, string $seed): array {
    if (file_exists($file)) {
        $content = @file_get_contents($file);
        if ($content) {
            $data = json_decode($content, true);
            if (is_array($data)) return $data;
        }
    }
    if (file_exists($seed)) {
        $content = @file_get_contents($seed);
        if ($content) {
            $data = json_decode($content, true);
            if (is_array($data)) {
                @file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                return $data;
            }
        }
    }
    return [];
}

// Salvar dados no cache JSON
function saveBlogToCache(string $file, array $posts): bool {
    return (bool) @file_put_contents($file, json_encode($posts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Gerador de slug simples
function generateSlug(string $text): string {
    $text = transliterator_transliterate('Any-Latin; Latin-ASCII; Lower()', $text) ?: strtolower($text);
    $text = preg_replace('/[^a-z0-9\-]/', '-', $text);
    $text = preg_replace('/-+/', '-', $text);
    return trim($text, '-');
}

// Tentar conexão com MySQL
$pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;

// Auto-criação da tabela se MySQL conectado
if ($pdo) {
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `blog_posts` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `slug` VARCHAR(255) NOT NULL UNIQUE,
              `title` VARCHAR(255) NOT NULL,
              `category` VARCHAR(50) NOT NULL DEFAULT 'carreira',
              `excerpt` TEXT NOT NULL,
              `content` MEDIUMTEXT NOT NULL,
              `author` VARCHAR(100) NOT NULL DEFAULT 'Equipe Você Pode Tudo',
              `read_time_minutes` INT NOT NULL DEFAULT 5,
              `cover_image` VARCHAR(500) NULL,
              `tags` VARCHAR(255) NULL,
              `views_count` INT NOT NULL DEFAULT 0,
              `is_published` TINYINT(1) NOT NULL DEFAULT 1,
              `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              INDEX `idx_blog_category` (`category`),
              INDEX `idx_blog_published` (`is_published`),
              INDEX `idx_blog_created` (`created_at`),
              INDEX `idx_blog_views` (`views_count`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Garantir que a coluna category no MySQL suporte novas categorias flexíveis
        try {
            $pdo->exec("ALTER TABLE `blog_posts` MODIFY COLUMN `category` VARCHAR(50) NOT NULL DEFAULT 'carreira'");
        } catch (Throwable $e) {}

        // Seed inicial ou sincronização de novos artigos no MySQL
        $seedData = loadBlogFromCache($cacheFile, $seedFile);
        if (!empty($seedData)) {
            $existingIds = $pdo->query("SELECT `id` FROM `blog_posts`")->fetchAll(PDO::FETCH_COLUMN);
            $existingSet = array_flip($existingIds);
            $forceSync = isset($_GET['sync']) || isset($_GET['force_sync']) || count($existingIds) < count($seedData);

            if (isset($_GET['reset_views']) || isset($_GET['reset_all_views'])) {
                try {
                    $pdo->exec("UPDATE `blog_posts` SET `views_count` = 0");
                } catch (Throwable $e) {
                    error_log("Erro ao resetar views no MySQL: " . $e->getMessage());
                }
            }

            $ins = $pdo->prepare("
                INSERT INTO `blog_posts` 
                (`id`, `slug`, `title`, `category`, `excerpt`, `content`, `author`, `read_time_minutes`, `cover_image`, `tags`, `views_count`, `is_published`, `created_at`)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                `title` = VALUES(`title`),
                `category` = VALUES(`category`),
                `excerpt` = VALUES(`excerpt`),
                `content` = VALUES(`content`),
                `author` = VALUES(`author`),
                `read_time_minutes` = VALUES(`read_time_minutes`),
                `cover_image` = VALUES(`cover_image`),
                `tags` = VALUES(`tags`),
                `created_at` = VALUES(`created_at`)
            ");

            foreach ($seedData as $p) {
                if ($forceSync || !isset($existingSet[$p['id']])) {
                    $tagsVal = is_array($p['tags'] ?? null) ? implode(',', $p['tags']) : ($p['tags'] ?? null);
                    $ins->execute([
                        $p['id'] ?? null,
                        $p['slug'] ?? generateSlug($p['title'] ?? 'artigo'),
                        $p['title'] ?? 'Sem título',
                        $p['category'] ?? 'carreira',
                        $p['excerpt'] ?? '',
                        $p['content'] ?? '',
                        $p['author'] ?? 'Equipe Você Pode Tudo',
                        (int)($p['read_time_minutes'] ?? 5),
                        $p['cover_image'] ?? null,
                        $tagsVal,
                        (int)($p['views_count'] ?? 0),
                        (int)($p['is_published'] ?? 1),
                        $p['created_at'] ?? date('Y-m-d H:i:s')
                    ]);
                }
            }
        }
    } catch (Throwable $e) {
        error_log("Erro ao gerenciar tabela blog_posts: " . $e->getMessage());
    }
}

$action = $_GET['action'] ?? 'list';
$method = $_SERVER['REQUEST_METHOD'];

// =============================================================
// 1. LISTAGEM DE ARTIGOS (Público ou Admin)
// =============================================================
if ($action === 'list') {
    $category = trim($_GET['category'] ?? '');
    $search = trim($_GET['q'] ?? '');
    $limit = max(1, min(500, (int)($_GET['limit'] ?? 12)));
    $page = max(1, (int)($_GET['page'] ?? 1));
    $offset = ($page - 1) * $limit;
    $includeDrafts = isset($_GET['include_drafts']) && $_GET['include_drafts'] === '1';

    // Verificar se o usuário autenticou como admin para ver agendados e rascunhos
    $isAdmin = false;
    if ($includeDrafts) {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
        $rawToken = '';
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $rawToken = $matches[1];
        } elseif (isset($_COOKIE['vpt_auth_token'])) {
            $rawToken = $_COOKIE['vpt_auth_token'];
        }
        if (!empty($rawToken)) {
            $userData = verifyToken($rawToken, JWT_SECRET);
            if ($userData) {
                $isAdmin = true;
            }
        }
    }

    if ($pdo) {
        try {
            $sql = "SELECT `id`, `slug`, `title`, `category`, `excerpt`, `author`, `read_time_minutes`, `cover_image`, `tags`, `views_count`, `is_published`, `created_at` FROM `blog_posts` WHERE 1=1";
            $params = [];

            if (!$isAdmin) {
                $sql .= " AND `is_published` = 1 AND `created_at` <= NOW()";
            }

            if (!empty($category) && $category !== 'todos') {
                $sql .= " AND `category` = ?";
                $params[] = $category;
            }

            if (!empty($search)) {
                $sql .= " AND (`title` LIKE ? OR `excerpt` LIKE ? OR `tags` LIKE ?)";
                $like = "%$search%";
                $params[] = $like;
                $params[] = $like;
                $params[] = $like;
            }

            // Total de registros
            $countSql = "SELECT COUNT(*) FROM (" . $sql . ") as total_table";
            $countStmt = $pdo->prepare($countSql);
            $countStmt->execute($params);
            $total = (int)$countStmt->fetchColumn();

            // Ordenação por mais recentes
            $sql .= " ORDER BY `created_at` DESC, `id` DESC LIMIT " . (int)$limit . " OFFSET " . (int)$offset;
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $posts = $stmt->fetchAll();

            jsonResponse([
                'success' => true,
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'posts' => $posts
            ]);
        } catch (Throwable $e) {
            error_log("Erro na busca MySQL de blog: " . $e->getMessage());
        }
    }

    // Fallback: Cache JSON
    $nowStr = date('Y-m-d H:i:s');
    $all = loadBlogFromCache($cacheFile, $seedFile);
    $filtered = array_filter($all, function($p) use ($isAdmin, $category, $search, $nowStr) {
        if (!$isAdmin) {
            if (empty($p['is_published'])) return false;
            if (!empty($p['created_at']) && $p['created_at'] > $nowStr) return false;
        }
        if (!empty($category) && $category !== 'todos' && ($p['category'] ?? '') !== $category) return false;
        if (!empty($search)) {
            $text = mb_strtolower(($p['title'] ?? '') . ' ' . ($p['excerpt'] ?? '') . ' ' . ($p['tags'] ?? ''));
            if (mb_strpos($text, mb_strtolower($search)) === false) return false;
        }
        return true;
    });

    // Ordenar decrescente por ID ou created_at
    usort($filtered, function($a, $b) {
        return ($b['id'] ?? 0) <=> ($a['id'] ?? 0);
    });

    $total = count($filtered);
    $slice = array_slice($filtered, $offset, $limit);

    // Omitir campo content no resumo de listagem para economizar payload
    $summary = array_map(function($p) {
        unset($p['content']);
        return $p;
    }, $slice);

    jsonResponse([
        'success' => true,
        'total' => $total,
        'page' => $page,
        'limit' => $limit,
        'posts' => array_values($summary)
    ]);
}

// =============================================================
// 2. DETALHES DE UM ARTIGO (Público - com incremento de view)
// =============================================================
if ($action === 'get') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    $slug = trim($_GET['slug'] ?? '');

    if ($id <= 0 && empty($slug)) {
        jsonResponse(['error' => true, 'message' => 'Identificador ou slug do artigo não informado.'], 400);
    }

    if ($pdo) {
        try {
            if ($id > 0) {
                $stmt = $pdo->prepare("SELECT * FROM `blog_posts` WHERE `id` = ? LIMIT 1");
                $stmt->execute([$id]);
            } else {
                $stmt = $pdo->prepare("SELECT * FROM `blog_posts` WHERE `slug` = ? LIMIT 1");
                $stmt->execute([$slug]);
            }
            $post = $stmt->fetch();

            if ($post) {
                // Verificar permissão para posts agendados ou rascunhos
                $isPostPublished = (int)($post['is_published'] ?? 1) === 1;
                $isPostScheduled = !empty($post['created_at']) && strtotime($post['created_at']) > time();
                if (!$isAdmin && (!$isPostPublished || $isPostScheduled)) {
                    // Visitante anônimo: retorna HTTP 404 real para não vazar a existência do artigo futuro
                    jsonResponse(['error' => true, 'message' => 'Artigo não encontrado.'], 404);
                }

                // Anti-Inflação de Cliques: Apenas visitantes humanos reais, sem bots, sem admins e com deduplicação de 2h
                $userAgent = strtolower($_SERVER['HTTP_USER_AGENT'] ?? '');
                $isBot = empty($userAgent) || (bool)preg_match('/(bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot|twitterbot|pinterest|google|bing|yahoo|duckduckgo|yandex|baidu|curl|wget|python|headless|lighthouse)/i', $userAgent);
                $viewCookie = $_COOKIE['vpt_viewed_articles'] ?? '';
                $viewedList = array_filter(explode(',', $viewCookie));
                $articleIdStr = (string)$post['id'];
                $alreadyViewed = in_array($articleIdStr, $viewedList, true);

                if (!$isAdmin && !$isBot && !$alreadyViewed && !$isPostScheduled) {
                    $pdo->prepare("UPDATE `blog_posts` SET `views_count` = `views_count` + 1 WHERE `id` = ?")->execute([$post['id']]);
                    $post['views_count'] = (int)$post['views_count'] + 1;
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
                jsonResponse(['success' => true, 'post' => $post]);
            }
        } catch (Throwable $e) {
            error_log("Erro no get MySQL de blog: " . $e->getMessage());
        }
    }

    // Fallback: Cache JSON
    $all = loadBlogFromCache($cacheFile, $seedFile);
    foreach ($all as &$p) {
        if (($id > 0 && ($p['id'] ?? 0) === $id) || (!empty($slug) && ($p['slug'] ?? '') === $slug)) {
            $isPostPublished = (int)($p['is_published'] ?? 1) === 1;
            $isPostScheduled = !empty($p['created_at']) && strtotime($p['created_at']) > time();
            if (!$isAdmin && (!$isPostPublished || $isPostScheduled)) {
                // Visitante anônimo: retorna HTTP 404 real para não vazar a existência do artigo futuro
                jsonResponse(['error' => true, 'message' => 'Artigo não encontrado.'], 404);
            }

            $userAgent = strtolower($_SERVER['HTTP_USER_AGENT'] ?? '');
            $isBot = empty($userAgent) || (bool)preg_match('/(bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot|twitterbot|pinterest|google|bing|yahoo|duckduckgo|yandex|baidu|curl|wget|python|headless|lighthouse)/i', $userAgent);
            $viewCookie = $_COOKIE['vpt_viewed_articles'] ?? '';
            $viewedList = array_filter(explode(',', $viewCookie));
            $articleIdStr = (string)($p['id'] ?? '');
            $alreadyViewed = in_array($articleIdStr, $viewedList, true);

            if (!$isAdmin && !$isBot && !$alreadyViewed && !$isPostScheduled) {
                $p['views_count'] = ($p['views_count'] ?? 0) + 1;
                saveBlogToCache($cacheFile, $all);
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
            jsonResponse(['success' => true, 'post' => $p]);
        }
    }

    jsonResponse(['error' => true, 'message' => 'Artigo não encontrado.'], 404);
}

// =============================================================
// 3. SALVAR / EDITAR ARTIGO (Admin Apenas)
// =============================================================
if ($action === 'save') {
    if ($method !== 'POST') {
        jsonResponse(['error' => true, 'message' => 'Método inválido.'], 405);
    }

    $auth = requireAdmin(false);

    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data)) $data = $_POST;

    $id = isset($data['id']) ? (int)$data['id'] : 0;
    $title = trim($data['title'] ?? '');
    $category = trim($data['category'] ?? 'carreira');
    $excerpt = trim($data['excerpt'] ?? '');
    $content = trim($data['content'] ?? '');
    $author = trim($data['author'] ?? 'Equipe Você Pode Tudo');
    $readTime = max(1, (int)($data['read_time_minutes'] ?? 5));
    $coverImage = trim($data['cover_image'] ?? '');
    $tags = trim($data['tags'] ?? '');
    $isPublished = isset($data['is_published']) ? (int)(bool)$data['is_published'] : 1;
    $viewsCount = isset($data['views_count']) ? max(0, (int)$data['views_count']) : null;

    if (empty($title) || empty($content)) {
        jsonResponse(['error' => true, 'message' => 'Título e conteúdo completo são obrigatórios.'], 400);
    }

    if (empty($excerpt)) {
        $clean = strip_tags($content);
        $excerpt = mb_substr($clean, 0, 180) . (mb_strlen($clean) > 180 ? '...' : '');
    }

    $slug = trim($data['slug'] ?? '');
    if (empty($slug)) {
        $slug = generateSlug($title);
    }

    $savedId = $id;

    // Processar created_at / agendamento
    $createdAtInput = trim($data['created_at'] ?? '');
    $finalCreatedAt = null;
    if (!empty($createdAtInput)) {
        $ts = strtotime($createdAtInput);
        if ($ts !== false) {
            $finalCreatedAt = date('Y-m-d H:i:s', $ts);
        }
    }

    if ($pdo) {
        try {
            if ($id > 0) {
                if ($viewsCount !== null) {
                    if ($finalCreatedAt !== null) {
                        $stmt = $pdo->prepare("
                            UPDATE `blog_posts` SET
                                `title` = ?, `category` = ?, `excerpt` = ?, `content` = ?,
                                `author` = ?, `read_time_minutes` = ?, `cover_image` = ?, `tags` = ?,
                                `is_published` = ?, `created_at` = ?, `views_count` = ?
                            WHERE `id` = ?
                        ");
                        $stmt->execute([
                            $title, $category, $excerpt, $content,
                            $author, $readTime, $coverImage, $tags,
                            $isPublished, $finalCreatedAt, $viewsCount, $id
                        ]);
                    } else {
                        $stmt = $pdo->prepare("
                            UPDATE `blog_posts` SET
                                `title` = ?, `category` = ?, `excerpt` = ?, `content` = ?,
                                `author` = ?, `read_time_minutes` = ?, `cover_image` = ?, `tags` = ?,
                                `is_published` = ?, `views_count` = ?
                            WHERE `id` = ?
                        ");
                        $stmt->execute([
                            $title, $category, $excerpt, $content,
                            $author, $readTime, $coverImage, $tags,
                            $isPublished, $viewsCount, $id
                        ]);
                    }
                } else {
                    if ($finalCreatedAt !== null) {
                        $stmt = $pdo->prepare("
                            UPDATE `blog_posts` SET
                                `title` = ?, `category` = ?, `excerpt` = ?, `content` = ?,
                                `author` = ?, `read_time_minutes` = ?, `cover_image` = ?, `tags` = ?,
                                `is_published` = ?, `created_at` = ?
                            WHERE `id` = ?
                        ");
                        $stmt->execute([
                            $title, $category, $excerpt, $content,
                            $author, $readTime, $coverImage, $tags,
                            $isPublished, $finalCreatedAt, $id
                        ]);
                    } else {
                        $stmt = $pdo->prepare("
                            UPDATE `blog_posts` SET
                                `title` = ?, `category` = ?, `excerpt` = ?, `content` = ?,
                                `author` = ?, `read_time_minutes` = ?, `cover_image` = ?, `tags` = ?,
                                `is_published` = ?
                            WHERE `id` = ?
                        ");
                        $stmt->execute([
                            $title, $category, $excerpt, $content,
                            $author, $readTime, $coverImage, $tags,
                            $isPublished, $id
                        ]);
                    }
                }
            } else {
                // Garantir slug único
                $checkSlug = $pdo->prepare("SELECT id FROM `blog_posts` WHERE `slug` = ? LIMIT 1");
                $checkSlug->execute([$slug]);
                if ($checkSlug->fetch()) {
                    $slug .= '-' . time();
                }

                $initialViews = $viewsCount !== null ? $viewsCount : 0;
                $stmt = $pdo->prepare("
                    INSERT INTO `blog_posts` 
                    (`slug`, `title`, `category`, `excerpt`, `content`, `author`, `read_time_minutes`, `cover_image`, `tags`, `views_count`, `is_published`, `created_at`)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $slug, $title, $category, $excerpt, $content,
                    $author, $readTime, $coverImage, $tags, $initialViews, $isPublished,
                    $finalCreatedAt ?: date('Y-m-d H:i:s')
                ]);
                $savedId = (int)$pdo->lastInsertId();
            }
        } catch (Throwable $e) {
            error_log("Erro no save MySQL de blog: " . $e->getMessage());
        }
    }

    // Sincronizar cache JSON e seed JSON
    $all = loadBlogFromCache($cacheFile, $seedFile);
    if ($savedId > 0 && $id > 0) {
        foreach ($all as &$p) {
            if (($p['id'] ?? 0) === $id) {
                $p['title'] = $title;
                $p['category'] = $category;
                $p['excerpt'] = $excerpt;
                $p['content'] = $content;
                $p['author'] = $author;
                $p['read_time_minutes'] = $readTime;
                $p['cover_image'] = $coverImage;
                $p['tags'] = $tags;
                $p['is_published'] = $isPublished;
                if ($finalCreatedAt !== null) {
                    $p['created_at'] = $finalCreatedAt;
                }
                if ($viewsCount !== null) {
                    $p['views_count'] = $viewsCount;
                }
                break;
            }
        }
        unset($p);
    } else {
        if ($savedId <= 0) {
            $savedId = !empty($all) ? max(array_column($all, 'id')) + 1 : 1;
        }
        $newPost = [
            'id' => $savedId,
            'slug' => $slug,
            'title' => $title,
            'category' => $category,
            'excerpt' => $excerpt,
            'content' => $content,
            'author' => $author,
            'read_time_minutes' => $readTime,
            'cover_image' => $coverImage,
            'tags' => $tags,
            'views_count' => $viewsCount !== null ? $viewsCount : 0,
            'is_published' => $isPublished,
            'created_at' => $finalCreatedAt ?: date('Y-m-d H:i:s')
        ];
        array_unshift($all, $newPost);
    }
    saveBlogToCache($cacheFile, $all);
    saveBlogToCache($seedFile, $all);

    jsonResponse([
        'success' => true,
        'message' => $id > 0 ? 'Artigo atualizado com sucesso!' : 'Novo artigo salvo com sucesso!',
        'id' => $savedId
    ]);
}

// =============================================================
// 3.05. CONTROLE DIRETO DE CLIQUES / VIEWS (Admin Apenas)
// =============================================================
if ($action === 'update_views') {
    if ($method !== 'POST') {
        jsonResponse(['error' => true, 'message' => 'Método inválido.'], 405);
    }
    $auth = requireAdmin(false);

    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data)) $data = $_POST;

    $id = isset($data['id']) ? (int)$data['id'] : 0;
    if ($id <= 0) {
        jsonResponse(['error' => true, 'message' => 'ID do artigo inválido.'], 400);
    }

    $viewsCount = isset($data['views_count']) ? max(0, (int)$data['views_count']) : 0;

    // Atualizar no MySQL
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("UPDATE `blog_posts` SET `views_count` = ? WHERE `id` = ?");
            $stmt->execute([$viewsCount, $id]);
        } catch (Throwable $e) {
            error_log("Erro ao atualizar cliques no MySQL: " . $e->getMessage());
        }
    }

    // Sincronizar cache JSON e seed JSON
    $all = loadBlogFromCache($cacheFile, $seedFile);
    $found = false;
    foreach ($all as &$p) {
        if (($p['id'] ?? 0) === $id) {
            $p['views_count'] = $viewsCount;
            $found = true;
            break;
        }
    }
    unset($p);

    if ($found) {
        saveBlogToCache($cacheFile, $all);
        saveBlogToCache($seedFile, $all);
    }

    jsonResponse([
        'success' => true,
        'id' => $id,
        'views_count' => $viewsCount,
        'message' => "Contagem de cliques atualizada com sucesso para {$viewsCount}!"
    ]);
}

// =============================================================
// 3.1. CONTROLE E REAGENDAMENTO RÁPIDO (Admin Apenas)
// =============================================================
if ($action === 'quick_schedule') {
    if ($method !== 'POST') {
        jsonResponse(['error' => true, 'message' => 'Método inválido.'], 405);
    }

    $auth = requireAdmin(false);

    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data)) $data = $_POST;

    $id = (int)($data['id'] ?? 0);
    $newDate = trim($data['created_at'] ?? '');
    $publishNow = !empty($data['publish_now']);

    if ($id <= 0) {
        jsonResponse(['error' => true, 'message' => 'ID do artigo inválido.'], 400);
    }

    if ($publishNow) {
        $finalDate = date('Y-m-d H:i:s');
    } else {
        $ts = strtotime($newDate);
        if ($ts === false) {
            jsonResponse(['error' => true, 'message' => 'Data/hora informada é inválida.'], 400);
        }
        $finalDate = date('Y-m-d H:i:s', $ts);
    }

    if ($pdo) {
        try {
            $stmt = $pdo->prepare("UPDATE `blog_posts` SET `created_at` = ?, `is_published` = 1 WHERE `id` = ?");
            $stmt->execute([$finalDate, $id]);
        } catch (Throwable $e) {
            error_log("Erro no quick_schedule MySQL: " . $e->getMessage());
        }
    }

    $all = loadBlogFromCache($cacheFile, $seedFile);
    foreach ($all as &$p) {
        if (($p['id'] ?? 0) === $id) {
            $p['created_at'] = $finalDate;
            $p['is_published'] = 1;
            break;
        }
    }
    saveBlogToCache($cacheFile, $all);

    jsonResponse([
        'success' => true,
        'message' => $publishNow ? 'Artigo publicado imediatamente com sucesso!' : 'Data de agendamento alterada com sucesso!',
        'created_at' => $finalDate
    ]);
}

// =============================================================
// 4. ALTERAR STATUS (Ativo / Pausado) (Admin Apenas)
// =============================================================
if ($action === 'toggle') {
    if ($method !== 'POST') {
        jsonResponse(['error' => true, 'message' => 'Método inválido.'], 405);
    }

    $auth = requireAdmin(false);

    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data)) $data = $_POST;

    $id = (int)($data['id'] ?? 0);
    if ($id <= 0) {
        jsonResponse(['error' => true, 'message' => 'ID de artigo inválido.'], 400);
    }

    $newStatus = 1;

    if ($pdo) {
        try {
            $stmt = $pdo->prepare("SELECT `is_published` FROM `blog_posts` WHERE `id` = ? LIMIT 1");
            $stmt->execute([$id]);
            $current = $stmt->fetchColumn();
            $newStatus = $current ? 0 : 1;

            $upd = $pdo->prepare("UPDATE `blog_posts` SET `is_published` = ? WHERE `id` = ?");
            $upd->execute([$newStatus, $id]);
        } catch (Throwable $e) {
            error_log("Erro no toggle MySQL de blog: " . $e->getMessage());
        }
    }

    $all = loadBlogFromCache($cacheFile, $seedFile);
    foreach ($all as &$p) {
        if (($p['id'] ?? 0) === $id) {
            $newStatus = !empty($p['is_published']) ? 0 : 1;
            $p['is_published'] = $newStatus;
            break;
        }
    }
    saveBlogToCache($cacheFile, $all);

    jsonResponse([
        'success' => true,
        'is_published' => $newStatus,
        'message' => $newStatus === 1 ? 'Artigo publicado com sucesso!' : 'Artigo movido para rascunho.'
    ]);
}

// =============================================================
// 5. EXCLUIR ARTIGO (Admin Apenas)
// =============================================================
if ($action === 'delete') {
    if ($method !== 'POST') {
        jsonResponse(['error' => true, 'message' => 'Método inválido.'], 405);
    }

    $auth = requireAdmin(false);

    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data)) $data = $_POST;

    $id = (int)($data['id'] ?? 0);
    if ($id <= 0) {
        jsonResponse(['error' => true, 'message' => 'ID de artigo inválido.'], 400);
    }

    if ($pdo) {
        try {
            $stmt = $pdo->prepare("DELETE FROM `blog_posts` WHERE `id` = ?");
            $stmt->execute([$id]);
        } catch (Throwable $e) {
            error_log("Erro no delete MySQL de blog: " . $e->getMessage());
        }
    }

    $all = loadBlogFromCache($cacheFile, $seedFile);
    $all = array_filter($all, function($p) use ($id) {
        return ($p['id'] ?? 0) !== $id;
    });
    saveBlogToCache($cacheFile, array_values($all));

    jsonResponse(['success' => true, 'message' => 'Artigo excluído permanentemente.']);
}

// =============================================================
// 6. EXPORTAR LISTA DE ARTIGOS (CSV - Admin Apenas)
// =============================================================

// ==========================================
// EXPORTAR LISTA DO BLOG EM TXT (CONTROLE INTERNO)
// ==========================================
if ($action === 'export_txt') {
    $auth = requireAdmin(false);

    $posts = [];
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT * FROM `blog_posts` ORDER BY `created_at` ASC");
            $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Throwable $e) {
            $posts = [];
        }
    }
    if (empty($posts)) {
        $posts = loadBlogFromCache($cacheFile, $seedFile);
        usort($posts, function($a, $b) {
            return strcmp($a['created_at'] ?? '', $b['created_at'] ?? '');
        });
    }

    $filename = 'artigos_blog_controle_interno_' . date('Y-m-d') . '.txt';
    header('Content-Type: text/plain; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Pragma: no-cache');
    header('Expires: 0');

    $sep = str_repeat('=', 80) . "\r\n";
    $subSep = str_repeat('-', 80) . "\r\n";

    echo $sep;
    echo "PORTAL VOCÊ PODE TUDO (vocepodetudo.com)\r\n";
    echo "CONTROLE INTERNO EDITORIAL — LISTA COMPLETA DE ARTIGOS DO BLOG\r\n";
    echo $sep;
    echo "Data de Emissão: " . date('d/m/Y H:i:s') . "\r\n";
    echo "Total de Artigos Listados: " . count($posts) . " item(ns)\r\n";
    echo "Finalidade: Gestão editorial, planejamento de pautas, agendamentos e arquivo offline.\r\n";
    echo $sep . "\r\n";

    $now = date('Y-m-d H:i:s');
    $index = 1;
    foreach ($posts as $p) {
        $numStr = str_pad($index++, 3, '0', STR_PAD_LEFT);
        $isPub = (int)($p['is_published'] ?? 1) === 1;
        $createdAt = $p['created_at'] ?? '';
        $statusStr = 'Rascunho / Pausado';
        if ($isPub) {
            $statusStr = ($createdAt > $now) ? 'Agendado Futuro' : 'No Ar (Publicado)';
        }

        $fullUrl = 'https://vocepodetudo.com/blog.html?post=' . ($p['slug'] ?? '');
        $excerpt = preg_replace('/\s+/', ' ', trim(strip_tags((string)($p['excerpt'] ?? ''))));

        echo "[$numStr] " . ($p['title'] ?? 'Sem Título') . "\r\n";
        echo $subSep;
        echo "• ID do Sistema: " . ($p['id'] ?? '') . "\r\n";
        echo "• Categoria: " . ($p['category'] ?? 'Geral') . "\r\n";
        echo "• Status Editorial: $statusStr\r\n";
        echo "• Data / Agendamento: $createdAt\r\n";
        echo "• Tempo de Leitura: " . ($p['read_time_minutes'] ?? 5) . " min | Leituras: " . ($p['views_count'] ?? 0) . "\r\n";
        echo "• Autor: " . ($p['author'] ?? 'Equipe Você Pode Tudo') . "\r\n";
        echo "• Palavras-Chave / Tags: " . ($p['tags'] ?? 'Geral') . "\r\n";
        echo "• Link Oficial: $fullUrl\r\n";
        if (!empty($excerpt)) {
            echo "• Resumo da Pauta:\r\n  $excerpt\r\n";
        }
        echo $subSep . "\r\n";
    }

    echo $sep;
    echo "FIM DO RELATÓRIO EDITORIAL DE CONTROLE INTERNO — VOCÊ PODE TUDO\r\n";
    echo $sep;
    exit;
}

if ($action === 'export_csv') {
    $auth = requireAdmin(false);

    // Verificação estrita de privilégio: apenas Administrador Pleno (role === 'admin')
    $role = $auth['role'] ?? '';
    if ($role !== 'admin') {
        jsonResponse([
            'error' => true,
            'message' => 'Acesso negado. A exportação da lista de artigos é exclusiva para o administrador.'
        ], 403);
    }

    $posts = [];
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT * FROM `blog_posts` ORDER BY `created_at` ASC");
            $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Throwable $e) {
            $posts = [];
        }
    }
    if (empty($posts)) {
        $posts = loadBlogFromCache($cacheFile, $seedFile);
        usort($posts, function($a, $b) {
            return strcmp($a['created_at'] ?? '', $b['created_at'] ?? '');
        });
    }

    $filename = 'artigos_blog_vocepodetudo_' . date('Y-m-d') . '.csv';
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Pragma: no-cache');
    header('Expires: 0');

    $output = fopen('php://output', 'w');
    // Escrever BOM UTF-8 para compatibilidade nativa perfeita com Excel
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

    $delimiter = ';';
    $headers = [
        'ID',
        'Título',
        'Slug',
        'Categoria',
        'Data / Agendamento',
        'Status',
        'Tempo de Leitura (min)',
        'Visualizações',
        'Autor',
        'Tags',
        'Resumo',
        'URL Completa'
    ];
    fputcsv($output, $headers, $delimiter);

    $now = date('Y-m-d H:i:s');
    foreach ($posts as $p) {
        $isPub = (int)($p['is_published'] ?? 1) === 1;
        $createdAt = $p['created_at'] ?? '';
        $statusStr = 'Rascunho / Pausado';
        if ($isPub) {
            $statusStr = ($createdAt > $now) ? 'Agendado Futuro' : 'No Ar (Publicado)';
        }

        $row = [
            $p['id'] ?? '',
            $p['title'] ?? '',
            $p['slug'] ?? '',
            $p['category'] ?? '',
            $createdAt,
            $statusStr,
            $p['read_time_minutes'] ?? 5,
            $p['views_count'] ?? 0,
            $p['author'] ?? 'Equipe Você Pode Tudo',
            $p['tags'] ?? '',
            preg_replace('/\s+/', ' ', trim(strip_tags((string)($p['excerpt'] ?? '')))),
            'https://vocepodetudo.com/blog.html?post=' . ($p['slug'] ?? '')
        ];
        fputcsv($output, array_map('sanitizeCsvField', $row), $delimiter);
    }

    fclose($output);
    exit;
}

// =============================================================
// 7. AÇÕES EM LOTE (Bulk Actions - Admin Apenas)
// =============================================================
if ($action === 'bulk_action') {
    if ($method !== 'POST') {
        jsonResponse(['error' => true, 'message' => 'Método inválido.'], 405);
    }
    $auth = requireAdmin(false);
    $role = $auth['role'] ?? '';
    if ($role !== 'admin') {
        jsonResponse(['error' => true, 'message' => 'Acesso negado. Ações em lote são exclusivas do administrador.'], 403);
    }

    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data)) $data = $_POST;

    $actionType = trim((string)($data['action_type'] ?? ''));
    $ids = array_map('intval', (array)($data['ids'] ?? []));
    $ids = array_values(array_filter($ids, function($v) { return $v > 0; }));

    if (empty($ids)) {
        jsonResponse(['error' => true, 'message' => 'Nenhum artigo selecionado para operação em lote.'], 400);
    }

    $all = loadBlogFromCache($cacheFile, $seedFile);
    $affected = 0;
    $now = date('Y-m-d H:i:s');

    if ($actionType === 'delete') {
        if ($pdo) {
            $inQuery = implode(',', array_fill(0, count($ids), '?'));
            try {
                $stmt = $pdo->prepare("DELETE FROM `blog_posts` WHERE `id` IN ($inQuery)");
                $stmt->execute(array_values($ids));
            } catch (Throwable $e) {}
        }
        $all = array_filter($all, function($p) use ($ids, &$affected) {
            if (in_array((int)($p['id'] ?? 0), $ids, true)) {
                $affected++;
                return false;
            }
            return true;
        });
        saveBlogToCache($cacheFile, array_values($all));
        saveBlogToCache($seedFile, array_values($all));
        jsonResponse(['success' => true, 'affected' => $affected, 'message' => "{$affected} artigos excluídos permanentemente."]);
    }

    if ($actionType === 'publish_now') {
        foreach ($all as &$p) {
            if (in_array((int)($p['id'] ?? 0), $ids, true)) {
                $p['is_published'] = 1;
                $p['created_at'] = $now;
                $affected++;
                if ($pdo) {
                    try {
                        $stmt = $pdo->prepare("UPDATE `blog_posts` SET `is_published` = 1, `created_at` = ? WHERE `id` = ?");
                        $stmt->execute([$now, (int)$p['id']]);
                    } catch (Throwable $e) {}
                }
            }
        }
        unset($p);
        saveBlogToCache($cacheFile, $all);
        saveBlogToCache($seedFile, $all);
        jsonResponse(['success' => true, 'affected' => $affected, 'message' => "{$affected} artigos publicados imediatamente!"]);
    }

    if ($actionType === 'to_draft') {
        foreach ($all as &$p) {
            if (in_array((int)($p['id'] ?? 0), $ids, true)) {
                $p['is_published'] = 0;
                $affected++;
                if ($pdo) {
                    try {
                        $stmt = $pdo->prepare("UPDATE `blog_posts` SET `is_published` = 0 WHERE `id` = ?");
                        $stmt->execute([(int)$p['id']]);
                    } catch (Throwable $e) {}
                }
            }
        }
        unset($p);
        saveBlogToCache($cacheFile, $all);
        saveBlogToCache($seedFile, $all);
        jsonResponse(['success' => true, 'affected' => $affected, 'message' => "{$affected} artigos movidos para rascunho."]);
    }

    if ($actionType === 'reschedule_days') {
        $days = (int)($data['days'] ?? 7);
        foreach ($all as &$p) {
            if (in_array((int)($p['id'] ?? 0), $ids, true)) {
                $currentTs = !empty($p['created_at']) ? strtotime($p['created_at']) : time();
                $newTs = $currentTs + ($days * 86400);
                $newDate = date('Y-m-d H:i:s', $newTs);
                $p['created_at'] = $newDate;
                $affected++;
                if ($pdo) {
                    try {
                        $stmt = $pdo->prepare("UPDATE `blog_posts` SET `created_at` = ? WHERE `id` = ?");
                        $stmt->execute([$newDate, (int)$p['id']]);
                    } catch (Throwable $e) {}
                }
            }
        }
        unset($p);
        saveBlogToCache($cacheFile, $all);
        saveBlogToCache($seedFile, $all);
        $signal = $days >= 0 ? "+{$days}" : "{$days}";
        jsonResponse(['success' => true, 'affected' => $affected, 'message' => "{$affected} artigos reagendados ({$signal} dias)!"]);
    }

    if ($actionType === 'reset_views') {
        if ($pdo) {
            $inQuery = implode(',', array_fill(0, count($ids), '?'));
            try {
                $stmt = $pdo->prepare("UPDATE `blog_posts` SET `views_count` = 0 WHERE `id` IN ($inQuery)");
                $stmt->execute(array_values($ids));
            } catch (Throwable $e) {}
        }
        foreach ($all as &$p) {
            if (in_array((int)($p['id'] ?? 0), $ids, true)) {
                $p['views_count'] = 0;
                $affected++;
            }
        }
        unset($p);
        saveBlogToCache($cacheFile, $all);
        saveBlogToCache($seedFile, $all);
        jsonResponse(['success' => true, 'affected' => $affected, 'message' => "Contagem de cliques zerada para {$affected} artigos!"]);
    }

    if ($actionType === 'set_views') {
        $newViews = max(0, (int)($data['views_count'] ?? 0));
        if ($pdo) {
            $inQuery = implode(',', array_fill(0, count($ids), '?'));
            try {
                $stmt = $pdo->prepare("UPDATE `blog_posts` SET `views_count` = ? WHERE `id` IN ($inQuery)");
                $stmt->execute(array_merge([$newViews], array_values($ids)));
            } catch (Throwable $e) {}
        }
        foreach ($all as &$p) {
            if (in_array((int)($p['id'] ?? 0), $ids, true)) {
                $p['views_count'] = $newViews;
                $affected++;
            }
        }
        unset($p);
        saveBlogToCache($cacheFile, $all);
        saveBlogToCache($seedFile, $all);
        jsonResponse(['success' => true, 'affected' => $affected, 'message' => "Cliques atualizados para {$newViews} em {$affected} artigos!"]);
    }

    jsonResponse(['error' => true, 'message' => 'Tipo de ação em lote não reconhecida.'], 400);
}

// =============================================================
// 8. IMPORTAR ARTIGOS EM LOTE (JSON/CSV Processado - Admin Apenas)
// =============================================================
if ($action === 'import_batch') {
    if ($method !== 'POST') {
        jsonResponse(['error' => true, 'message' => 'Método inválido.'], 405);
    }
    $auth = requireAdmin(false);
    $role = $auth['role'] ?? '';
    if ($role !== 'admin') {
        jsonResponse(['error' => true, 'message' => 'Acesso negado. Importação é exclusiva do administrador.'], 403);
    }

    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data) || empty($data['posts'])) {
        jsonResponse(['error' => true, 'message' => 'Lista de artigos inválida ou vazia.'], 400);
    }

    $incoming = (array)$data['posts'];
    $all = loadBlogFromCache($cacheFile, $seedFile);
    
    // Obter maior ID atual e slugs existentes
    $maxId = 0;
    $existingSlugs = [];
    foreach ($all as $p) {
        $pid = (int)($p['id'] ?? 0);
        if ($pid > $maxId) $maxId = $pid;
        if (!empty($p['slug'])) $existingSlugs[$p['slug']] = true;
    }

    $imported = 0;
    foreach ($incoming as $item) {
        $title = trim((string)($item['title'] ?? ''));
        if (empty($title)) continue;

        $baseSlug = !empty($item['slug']) ? generateSlug((string)$item['slug']) : generateSlug($title);
        $slug = $baseSlug;
        $counter = 1;
        while (isset($existingSlugs[$slug])) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }
        $existingSlugs[$slug] = true;

        $maxId++;
        $newPost = [
            'id' => $maxId,
            'slug' => $slug,
            'title' => $title,
            'category' => !empty($item['category']) ? trim((string)$item['category']) : 'carreira',
            'excerpt' => trim((string)($item['excerpt'] ?? '')),
            'content' => !empty($item['content']) ? (string)$item['content'] : '<p>' . htmlspecialchars($item['excerpt'] ?? $title) . '</p>',
            'author' => !empty($item['author']) ? trim((string)$item['author']) : 'Equipe Você Pode Tudo',
            'read_time_minutes' => max(1, (int)($item['read_time_minutes'] ?? $item['read_time'] ?? 5)),
            'cover_image' => !empty($item['cover_image']) ? trim((string)$item['cover_image']) : null,
            'tags' => !empty($item['tags']) ? trim((string)$item['tags']) : 'Carreira, Emprego',
            'views_count' => 0,
            'is_published' => isset($item['is_published']) ? (int)$item['is_published'] : 1,
            'created_at' => !empty($item['created_at']) ? trim((string)$item['created_at']) : date('Y-m-d H:i:s')
        ];

        if ($pdo) {
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO `blog_posts` 
                    (`slug`, `title`, `category`, `excerpt`, `content`, `author`, `read_time_minutes`, `cover_image`, `tags`, `views_count`, `is_published`, `created_at`) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $newPost['slug'],
                    $newPost['title'],
                    $newPost['category'],
                    $newPost['excerpt'],
                    $newPost['content'],
                    $newPost['author'],
                    $newPost['read_time_minutes'],
                    $newPost['cover_image'],
                    $newPost['tags'],
                    0,
                    $newPost['is_published'],
                    $newPost['created_at']
                ]);
                $newPost['id'] = (int)$pdo->lastInsertId();
            } catch (Throwable $e) {}
        }

        $all[] = $newPost;
        $imported++;
    }

    saveBlogToCache($cacheFile, $all);
    saveBlogToCache($seedFile, $all);

    jsonResponse([
        'success' => true,
        'imported' => $imported,
        'total' => count($all),
        'message' => "Importação concluída com sucesso! {$imported} novos artigos cadastrados."
    ]);
}

jsonResponse(['error' => true, 'message' => 'Ação não reconhecida.'], 404);
