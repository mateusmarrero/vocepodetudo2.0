<?php
/**
 * api/ratings.php - Sistema de Avaliação, Prova Social & Moderação Administrativa
 * Você Pode Tudo — Plataforma Oficial
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

$cacheRatings = __DIR__ . '/cache_ratings.json';
$cacheReviewsList = __DIR__ . '/cache_reviews_list.json';

function loadRatingsCache(string $path): array {
    if (file_exists($path)) {
        $data = json_decode(@file_get_contents($path) ?: '{}', true);
        if (is_array($data)) return $data;
    }
    return [];
}

function saveRatingsCache(string $path, array $data): bool {
    return (bool) @file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function ensureRatingsTable(PDO $pdo): void {
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS `course_ratings` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `course_id` VARCHAR(64) NOT NULL,
            `rating` INT NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
            `comment` VARCHAR(255) NULL,
            `student_name` VARCHAR(100) NULL,
            `status` ENUM('aprovado', 'pendente', 'rejeitado') DEFAULT 'aprovado',
            `ip_address` VARCHAR(45) NULL,
            `user_token` VARCHAR(64) NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX `idx_course_id` (`course_id`),
            INDEX `idx_rating` (`rating`),
            INDEX `idx_status` (`status`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    } catch (\Throwable $t) {}
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? '';

// -----------------------------------------------------------------------------
// SEÇÃO ADMINISTRATIVA (Exige Token de Admin)
// -----------------------------------------------------------------------------
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
$isAdminReq = !empty($authHeader) && stripos($authHeader, 'Bearer ') === 0;

if ($isAdminReq && in_array($action, ['admin_list', 'moderate', 'delete', 'stats'], true)) {
    $auth = requireAdmin(false);

    $pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;

    // 1. LISTAR TODAS AS AVALIAÇÕES PARA MODERAÇÃO
    if ($action === 'admin_list') {
        $statusFilter = $_GET['status'] ?? 'all';
        $reviews = [];

        if ($pdo instanceof PDO) {
            try {
                ensureRatingsTable($pdo);
                if ($statusFilter !== 'all') {
                    $stmt = $pdo->prepare("SELECT * FROM `course_ratings` WHERE `status` = ? ORDER BY `id` DESC LIMIT 300");
                    $stmt->execute([$statusFilter]);
                } else {
                    $stmt = $pdo->query("SELECT * FROM `course_ratings` ORDER BY `id` DESC LIMIT 300");
                }
                $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (\Throwable $t) {
                error_log("[Ratings Admin List SQL Error] " . $t->getMessage());
            }
        }

        // Fallback JSON se banco não tiver dados
        if (empty($reviews) && file_exists($cacheReviewsList)) {
            $raw = @file_get_contents($cacheReviewsList);
            $reviews = json_decode($raw ?: '[]', true) ?: [];
            if ($statusFilter !== 'all') {
                $reviews = array_filter($reviews, fn($r) => ($r['status'] ?? 'aprovado') === $statusFilter);
            }
        }

        // Estatísticas
        $summary = loadRatingsCache($cacheRatings);
        $totalEvaluated = count($summary);
        $totalReviewsCount = 0;
        $sumAvg = 0;
        foreach ($summary as $item) {
            $totalReviewsCount += (int) ($item['count'] ?? 1);
            $sumAvg += (float) ($item['avg'] ?? 5.0);
        }
        $platformAvg = $totalEvaluated > 0 ? round($sumAvg / $totalEvaluated, 2) : 5.0;

        jsonResponse([
            'success' => true,
            'total_reviews' => count($reviews),
            'platform_average' => $platformAvg,
            'courses_evaluated' => $totalEvaluated,
            'total_votes' => $totalReviewsCount,
            'reviews' => array_values($reviews)
        ]);
    }

    // 2. MODERAR AVALIAÇÃO (aprovado, pendente, rejeitado)
    if ($action === 'moderate' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = (int) ($input['id'] ?? 0);
        $newStatus = trim((string) ($input['status'] ?? 'aprovado'));

        if ($id <= 0 || !in_array($newStatus, ['aprovado', 'pendente', 'rejeitado'], true)) {
            jsonResponse(['success' => false, 'error' => 'Parâmetros inválidos.'], 400);
        }

        if ($pdo instanceof PDO) {
            try {
                ensureRatingsTable($pdo);
                $stmt = $pdo->prepare("UPDATE `course_ratings` SET `status` = ? WHERE `id` = ?");
                $stmt->execute([$newStatus, $id]);
            } catch (\Throwable $t) {}
        }

        // Atualizar lista JSON se existir
        if (file_exists($cacheReviewsList)) {
            $list = json_decode(@file_get_contents($cacheReviewsList) ?: '[]', true) ?: [];
            foreach ($list as &$item) {
                if (($item['id'] ?? 0) === $id) {
                    $item['status'] = $newStatus;
                    break;
                }
            }
            saveRatingsCache($cacheReviewsList, $list);
        }

        jsonResponse(['success' => true, 'message' => "Avaliação marcada como '$newStatus'."]);
    }

    // 3. EXCLUIR AVALIAÇÃO
    if ($action === 'delete' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = (int) ($input['id'] ?? 0);

        if ($id <= 0) {
            jsonResponse(['success' => false, 'error' => 'ID inválido.'], 400);
        }

        if ($pdo instanceof PDO) {
            try {
                $stmt = $pdo->prepare("DELETE FROM `course_ratings` WHERE `id` = ?");
                $stmt->execute([$id]);
            } catch (\Throwable $t) {}
        }

        if (file_exists($cacheReviewsList)) {
            $list = json_decode(@file_get_contents($cacheReviewsList) ?: '[]', true) ?: [];
            $list = array_values(array_filter($list, fn($r) => ($r['id'] ?? 0) !== $id));
            saveRatingsCache($cacheReviewsList, $list);
        }

        jsonResponse(['success' => true, 'message' => 'Avaliação excluída com sucesso.']);
    }
}

// -----------------------------------------------------------------------------
// POST: Enviar Avaliação Pública (Estrelas de 1 a 5)
// -----------------------------------------------------------------------------
if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Dados inválidos.']);
        exit;
    }

    $courseId = trim((string) ($data['course_id'] ?? ''));
    $rating = (int) ($data['rating'] ?? 5);
    $comment = trim(substr((string) ($data['comment'] ?? ''), 0, 255));
    $studentName = trim(substr((string) ($data['student_name'] ?? 'Aluno'), 0, 100));
    $userToken = trim((string) ($data['user_token'] ?? ''));
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';

    if (empty($courseId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'ID do curso é obrigatório.']);
        exit;
    }

    if ($rating < 1 || $rating > 5) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'A nota deve ser de 1 a 5 estrelas.']);
        exit;
    }

    $insertedId = time();

    $pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;
    if ($pdo instanceof PDO) {
        try {
            ensureRatingsTable($pdo);
            $stmt = $pdo->prepare("INSERT INTO `course_ratings` (`course_id`, `rating`, `comment`, `student_name`, `status`, `ip_address`, `user_token`)
                                   VALUES (?, ?, ?, ?, 'aprovado', ?, ?)");
            $stmt->execute([$courseId, $rating, $comment ?: null, $studentName ?: 'Aluno', substr($ip, 0, 45), $userToken ?: null]);
            $insertedId = (int) $pdo->lastInsertId();

            // Recalcular média e contagem na tabela courses
            $calcStmt = $pdo->prepare("SELECT ROUND(AVG(rating), 1) as avg_rating, COUNT(*) as total_reviews FROM `course_ratings` WHERE `course_id` = ? AND `status` = 'aprovado'");
            $calcStmt->execute([$courseId]);
            $calc = $calcStmt->fetch(PDO::FETCH_ASSOC);

            if ($calc && $calc['total_reviews'] > 0) {
                $updStmt = $pdo->prepare("UPDATE `courses` SET `rating` = ?, `reviews_count` = `reviews_count` + 1 WHERE `id` = ?");
                $updStmt->execute([$calc['avg_rating'], $courseId]);
            }
        } catch (\Throwable $t) {
            error_log("[Rating Save Error] " . $t->getMessage());
        }
    }

    // Cache local JSON
    $cache = loadRatingsCache($cacheRatings);
    if (!isset($cache[$courseId])) {
        $cache[$courseId] = ['sum' => 0, 'count' => 0, 'avg' => 5.0];
    }
    $cache[$courseId]['sum'] += $rating;
    $cache[$courseId]['count'] += 1;
    $cache[$courseId]['avg'] = round($cache[$courseId]['sum'] / $cache[$courseId]['count'], 1);
    saveRatingsCache($cacheRatings, $cache);

    // Salvar na lista de reviews recente para o admin
    $reviewsList = loadRatingsCache($cacheReviewsList);
    array_unshift($reviewsList, [
        'id' => $insertedId,
        'course_id' => $courseId,
        'rating' => $rating,
        'comment' => htmlspecialchars($comment, ENT_QUOTES, 'UTF-8'),
        'student_name' => htmlspecialchars($studentName, ENT_QUOTES, 'UTF-8'),
        'status' => 'aprovado',
        'created_at' => date('Y-m-d H:i:s')
    ]);
    if (count($reviewsList) > 300) {
        $reviewsList = array_slice($reviewsList, 0, 300);
    }
    saveRatingsCache($cacheReviewsList, $reviewsList);

    echo json_encode([
        'success' => true,
        'message' => 'Obrigado por avaliar este curso! Sua opinião ajuda milhares de estudantes.',
        'new_rating' => $cache[$courseId]['avg'],
        'reviews_count' => $cache[$courseId]['count']
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// GET: Obter Avaliações de um Curso ou Resumo Geral
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    $courseId = trim((string) ($_GET['course_id'] ?? ''));
    $cache = loadRatingsCache($cacheRatings);

    if (!empty($courseId)) {
        $data = $cache[$courseId] ?? ['avg' => 5.0, 'count' => 1];
        echo json_encode(['success' => true, 'course_id' => $courseId, 'rating' => $data['avg'], 'count' => $data['count']]);
        exit;
    }

    echo json_encode(['success' => true, 'ratings' => $cache]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Método não permitido.']);
