<?php
/**
 * api/banners.php - Central de Banners de Parceiros & Anunciantes Diretos
 * Você Pode Tudo — Plataforma Oficial
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

$cacheBannersFile = __DIR__ . '/cache_banners.json';

function ensureBannersTable(PDO $pdo): void {
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS `partner_banners` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `title` VARCHAR(150) NOT NULL,
            `advertiser` VARCHAR(100) NOT NULL,
            `image_url` VARCHAR(255) NOT NULL,
            `target_url` VARCHAR(255) NOT NULL,
            `position` ENUM('home_top', 'sidebar', 'footer', 'course_card') DEFAULT 'home_top',
            `status` ENUM('active', 'paused') DEFAULT 'active',
            `start_date` DATE NULL,
            `end_date` DATE NULL,
            `impressions` INT DEFAULT 0,
            `clicks` INT DEFAULT 0,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX `idx_position_status` (`position`, `status`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    } catch (\Throwable $t) {
        error_log("[Banners Table Error] " . $t->getMessage());
    }
}

function loadBannersCache(string $path): array {
    if (file_exists($path)) {
        $raw = @file_get_contents($path);
        if ($raw) {
            $data = json_decode($raw, true);
            if (is_array($data)) return $data;
        }
    }
    return [];
}

function saveBannersCache(string $path, array $data): bool {
    return (bool) @file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$action = $_GET['action'] ?? 'active';

// -------------------------------------------------------------
// REDIRECIONAMENTO DE CLIQUE PÚBLICO (Computa clique)
// -------------------------------------------------------------
if ($action === 'click') {
    $id = (int) ($_GET['id'] ?? 0);
    $banners = loadBannersCache($cacheBannersFile);
    $targetUrl = 'https://vocepodetudo.com';

    $pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;
    if ($pdo instanceof PDO && $id > 0) {
        try {
            ensureBannersTable($pdo);
            $stmt = $pdo->prepare("UPDATE `partner_banners` SET `clicks` = `clicks` + 1 WHERE `id` = ?");
            $stmt->execute([$id]);

            $urlStmt = $pdo->prepare("SELECT `target_url` FROM `partner_banners` WHERE `id` = ?");
            $urlStmt->execute([$id]);
            $res = $urlStmt->fetchColumn();
            if ($res) $targetUrl = $res;
        } catch (\Throwable $t) {}
    }

    foreach ($banners as &$b) {
        if (($b['id'] ?? 0) === $id) {
            $b['clicks'] = ($b['clicks'] ?? 0) + 1;
            if (!empty($b['target_url'])) $targetUrl = $b['target_url'];
            break;
        }
    }
    unset($b);
    saveBannersCache($cacheBannersFile, $banners);

    header("Location: $targetUrl", true, 302);
    exit;
}

// -------------------------------------------------------------
// CONSULTA PÚBLICA DE BANNERS ATIVOS (Para exibir no portal)
// -------------------------------------------------------------
if ($action === 'active') {
    $position = trim((string) ($_GET['position'] ?? ''));
    $banners = loadBannersCache($cacheBannersFile);

    $now = date('Y-m-d');
    $active = array_filter($banners, function($b) use ($position, $now) {
        if (($b['status'] ?? 'active') !== 'active') return false;
        if (!empty($position) && ($b['position'] ?? '') !== $position) return false;
        if (!empty($b['start_date']) && $b['start_date'] > $now) return false;
        if (!empty($b['end_date']) && $b['end_date'] < $now) return false;
        return true;
    });

    jsonResponse([
        'success' => true,
        'banners' => array_values($active)
    ]);
}

// -------------------------------------------------------------
// ÁREA ADMINISTRATIVA (Exige Token de Admin)
// -------------------------------------------------------------
$auth = requireAdmin(false);

// 1. LISTAR TODOS OS BANNERS PARA O ADMIN
if ($action === 'list') {
    $pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;
    $banners = [];

    if ($pdo instanceof PDO) {
        try {
            ensureBannersTable($pdo);
            $stmt = $pdo->query("SELECT * FROM `partner_banners` ORDER BY `id` DESC");
            $banners = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\Throwable $t) {}
    }

    if (empty($banners)) {
        $banners = loadBannersCache($cacheBannersFile);
    }

    jsonResponse([
        'success' => true,
        'total' => count($banners),
        'banners' => $banners
    ]);
}

// 2. SALVAR OU CRIAR BANNER
if ($action === 'save' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $id = (int) ($input['id'] ?? 0);
    $title = trim((string) ($input['title'] ?? ''));
    $advertiser = trim((string) ($input['advertiser'] ?? 'Parceiro Oficial'));
    $imageUrl = trim((string) ($input['image_url'] ?? ''));
    $targetUrl = trim((string) ($input['target_url'] ?? ''));
    $position = trim((string) ($input['position'] ?? 'home_top'));
    $startDate = !empty($input['start_date']) ? $input['start_date'] : null;
    $endDate = !empty($input['end_date']) ? $input['end_date'] : null;
    $status = in_array($input['status'] ?? '', ['active', 'paused'], true) ? $input['status'] : 'active';

    if (empty($title) || empty($imageUrl) || empty($targetUrl)) {
        jsonResponse(['success' => false, 'error' => 'Título, URL da imagem e link de destino são obrigatórios.'], 400);
    }

    $pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;
    $savedId = $id;

    if ($pdo instanceof PDO) {
        try {
            ensureBannersTable($pdo);
            if ($id > 0) {
                $stmt = $pdo->prepare("UPDATE `partner_banners` 
                                       SET `title` = ?, `advertiser` = ?, `image_url` = ?, `target_url` = ?, `position` = ?, `start_date` = ?, `end_date` = ?, `status` = ? 
                                       WHERE `id` = ?");
                $stmt->execute([$title, $advertiser, $imageUrl, $targetUrl, $position, $startDate, $endDate, $status, $id]);
            } else {
                $stmt = $pdo->prepare("INSERT INTO `partner_banners` (`title`, `advertiser`, `image_url`, `target_url`, `position`, `start_date`, `end_date`, `status`) 
                                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$title, $advertiser, $imageUrl, $targetUrl, $position, $startDate, $endDate, $status]);
                $savedId = (int) $pdo->lastInsertId();
            }
        } catch (\Throwable $t) {
            error_log("[Banner Save Error] " . $t->getMessage());
        }
    }

    // Atualiza cache local
    $banners = loadBannersCache($cacheBannersFile);
    if ($savedId === 0) $savedId = time();

    $found = false;
    foreach ($banners as &$b) {
        if (($b['id'] ?? 0) === $savedId) {
            $b['title'] = $title;
            $b['advertiser'] = $advertiser;
            $b['image_url'] = $imageUrl;
            $b['target_url'] = $targetUrl;
            $b['position'] = $position;
            $b['start_date'] = $startDate;
            $b['end_date'] = $endDate;
            $b['status'] = $status;
            $found = true;
            break;
        }
    }
    unset($b);

    if (!$found) {
        array_unshift($banners, [
            'id' => $savedId,
            'title' => $title,
            'advertiser' => $advertiser,
            'image_url' => $imageUrl,
            'target_url' => $targetUrl,
            'position' => $position,
            'status' => $status,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'impressions' => 0,
            'clicks' => 0,
            'created_at' => date('Y-m-d H:i:s')
        ]);
    }

    saveBannersCache($cacheBannersFile, $banners);

    jsonResponse([
        'success' => true,
        'message' => 'Banner parceiro salvo com sucesso!',
        'id' => $savedId
    ]);
}

// 3. ALTERNAR STATUS DO BANNER (active / paused)
if ($action === 'toggle' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = (int) ($input['id'] ?? 0);

    if ($id <= 0) jsonResponse(['success' => false, 'error' => 'ID inválido.'], 400);

    $pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;
    $newStatus = 'active';

    $banners = loadBannersCache($cacheBannersFile);
    foreach ($banners as &$b) {
        if (($b['id'] ?? 0) === $id) {
            $b['status'] = ($b['status'] ?? 'active') === 'active' ? 'paused' : 'active';
            $newStatus = $b['status'];
            break;
        }
    }
    unset($b);
    saveBannersCache($cacheBannersFile, $banners);

    if ($pdo instanceof PDO) {
        try {
            $stmt = $pdo->prepare("UPDATE `partner_banners` SET `status` = ? WHERE `id` = ?");
            $stmt->execute([$newStatus, $id]);
        } catch (\Throwable $t) {}
    }

    jsonResponse(['success' => true, 'new_status' => $newStatus, 'message' => "Banner alterado para '$newStatus'."]);
}

// 4. EXCLUIR BANNER
if ($action === 'delete' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = (int) ($input['id'] ?? 0);

    if ($id <= 0) jsonResponse(['success' => false, 'error' => 'ID inválido.'], 400);

    $pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;
    if ($pdo instanceof PDO) {
        try {
            $stmt = $pdo->prepare("DELETE FROM `partner_banners` WHERE `id` = ?");
            $stmt->execute([$id]);
        } catch (\Throwable $t) {}
    }

    $banners = loadBannersCache($cacheBannersFile);
    $banners = array_values(array_filter($banners, fn($b) => ($b['id'] ?? 0) !== $id));
    saveBannersCache($cacheBannersFile, $banners);

    jsonResponse(['success' => true, 'message' => 'Banner excluído com sucesso.']);
}

jsonResponse(['success' => false, 'error' => 'Ação não permitida.'], 400);
