<?php
/**
 * api/push.php - Web Push Notifications (Inscrição, Listagem e Envio)
 * Você Pode Tudo — Notificações em Tempo Real de Cursos e Vagas
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
    header("Access-Control-Allow-Origin: *");
}
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$cacheSubscriptions = __DIR__ . '/cache_push_subscriptions.json';
$cacheNotifications = __DIR__ . '/cache_push_notifications.json';

// Helper de Cache JSON
function loadJsonArray(string $path): array {
    if (file_exists($path)) {
        $data = json_decode(@file_get_contents($path) ?: '[]', true);
        if (is_array($data)) return $data;
    }
    return [];
}

function saveJsonArray(string $path, array $data): bool {
    return (bool) @file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Cria tabela se não existir
function ensurePushTables(PDO $pdo): void {
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS `push_subscriptions` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `endpoint` TEXT NOT NULL,
            `endpoint_hash` VARCHAR(64) NOT NULL UNIQUE,
            `keys_p256dh` TEXT NULL,
            `keys_auth` TEXT NULL,
            `user_agent` TEXT NULL,
            `ip_address` VARCHAR(45) NULL,
            `is_active` TINYINT(1) DEFAULT 1,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX `idx_endpoint_hash` (`endpoint_hash`),
            INDEX `idx_active` (`is_active`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        $pdo->exec("CREATE TABLE IF NOT EXISTS `push_notifications_history` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `title` VARCHAR(200) NOT NULL,
            `body` TEXT NOT NULL,
            `url` VARCHAR(500) NOT NULL,
            `sent_count` INT DEFAULT 0,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    } catch (\Throwable $t) {}
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// -----------------------------------------------------------------------------
// POST: Registrar Inscrição de Notificação (do Navegador do Usuário)
// -----------------------------------------------------------------------------
if ($method === 'POST' && $action === 'subscribe') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    if (!is_array($data) || empty($data['endpoint'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Endpoint de push é obrigatório.']);
        exit;
    }

    $endpoint = trim((string) $data['endpoint']);
    $endpointHash = hash('sha256', $endpoint);
    $p256dh = $data['keys']['p256dh'] ?? '';
    $auth = $data['keys']['auth'] ?? '';
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';

    $pdo = getDbConnection();
    if ($pdo instanceof PDO) {
        try {
            ensurePushTables($pdo);
            $stmt = $pdo->prepare("INSERT INTO `push_subscriptions` (`endpoint`, `endpoint_hash`, `keys_p256dh`, `keys_auth`, `user_agent`, `ip_address`)
                                   VALUES (:endpoint, :hash, :p256dh, :auth, :ua, :ip)
                                   ON DUPLICATE KEY UPDATE `is_active` = 1");
            $stmt->execute([
                ':endpoint' => $endpoint,
                ':hash' => $endpointHash,
                ':p256dh' => $p256dh,
                ':auth' => $auth,
                ':ua' => substr($ua, 0, 255),
                ':ip' => substr($ip, 0, 45)
            ]);
        } catch (\Throwable $t) {
            error_log("[Push Sub DB Error] " . $t->getMessage());
        }
    }

    // Redundância JSON
    $subs = loadJsonArray($cacheSubscriptions);
    $exists = false;
    foreach ($subs as &$s) {
        if (($s['endpoint_hash'] ?? '') === $endpointHash) {
            $s['is_active'] = 1;
            $s['updated_at'] = date('Y-m-d H:i:s');
            $exists = true;
            break;
        }
    }
    unset($s);

    if (!$exists) {
        $subs[] = [
            'id' => count($subs) + 1,
            'endpoint' => $endpoint,
            'endpoint_hash' => $endpointHash,
            'keys' => ['p256dh' => $p256dh, 'auth' => $auth],
            'user_agent' => $ua,
            'is_active' => 1,
            'created_at' => date('Y-m-d H:i:s')
        ];
    }
    saveJsonArray($cacheSubscriptions, $subs);

    echo json_encode([
        'success' => true,
        'message' => 'Notificações ativadas com sucesso! Você será avisado quando novas vagas e cursos surgirem.'
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// POST: Enviar Notificação Push (Acesso Administrativo)
// -----------------------------------------------------------------------------
if ($method === 'POST' && $action === 'send') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token = '';
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = trim($matches[1]);
    }
    $user = verifyJwtToken($token);
    if (!$user || ($user['role'] ?? '') !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Acesso negado. Apenas administradores podem disparar notificações.']);
        exit;
    }

    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    $title = trim($data['title'] ?? 'Nova Oportunidade no Você Pode Tudo');
    $body = trim($data['body'] ?? 'Novos cursos gratuitos e vagas acabaram de ser adicionados!');
    $url = trim($data['url'] ?? 'https://vocepodetudo.com');

    // Registrar no histórico de notificações
    $history = loadJsonArray($cacheNotifications);
    $subs = loadJsonArray($cacheSubscriptions);
    $activeCount = count(array_filter($subs, fn($s) => ($s['is_active'] ?? 1) == 1));

    $notificationRecord = [
        'id' => count($history) + 1,
        'title' => $title,
        'body' => $body,
        'url' => $url,
        'sent_count' => $activeCount,
        'created_at' => date('Y-m-d H:i:s')
    ];
    $history[] = $notificationRecord;
    saveJsonArray($cacheNotifications, $history);

    // Salvar no MySQL
    $pdo = getDbConnection();
    if ($pdo instanceof PDO) {
        try {
            ensurePushTables($pdo);
            $stmt = $pdo->prepare("INSERT INTO `push_notifications_history` (`title`, `body`, `url`, `sent_count`) VALUES (?, ?, ?, ?)");
            $stmt->execute([$title, $body, $url, $activeCount]);
        } catch (\Throwable $t) {}
    }

    echo json_encode([
        'success' => true,
        'message' => "Notificação registrada com sucesso para {$activeCount} inscritos ativos!",
        'payload' => $notificationRecord
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// GET: Status de Inscrições & Última Notificação (Público ou Admin)
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    if ($action === 'latest') {
        // Retorna a última notificação para os navegadores verificarem
        $history = loadJsonArray($cacheNotifications);
        $latest = !empty($history) ? end($history) : null;
        echo json_encode(['success' => true, 'latest' => $latest]);
        exit;
    }

    // Listagem para o admin
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token = '';
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = trim($matches[1]);
    }
    $user = verifyJwtToken($token);
    if (!$user) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Acesso não autorizado.']);
        exit;
    }

    $subs = loadJsonArray($cacheSubscriptions);
    $history = loadJsonArray($cacheNotifications);

    echo json_encode([
        'success' => true,
        'total_subscriptions' => count($subs),
        'active_subscriptions' => count(array_filter($subs, fn($s) => ($s['is_active'] ?? 1) == 1)),
        'history' => array_reverse($history)
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Método não permitido.']);
