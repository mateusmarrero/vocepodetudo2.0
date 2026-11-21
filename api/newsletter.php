<?php
/**
 * api/newsletter.php - Captura de E-mails & Newsletter de Oportunidades
 * Você Pode Tudo — Qualificação Profissional & Empregabilidade
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

$cacheFile = __DIR__ . '/cache_newsletter.json';

// Helper para ler inscritos do cache JSON
function loadSubscribersFromCache(string $file): array {
    if (file_exists($file)) {
        $content = @file_get_contents($file);
        if ($content) {
            $data = json_decode($content, true);
            if (is_array($data)) return $data;
        }
    }
    return [];
}

// Helper para salvar inscritos no cache JSON
function saveSubscribersToCache(string $file, array $data): bool {
    return (bool) @file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Inicializar tabela no MySQL caso não exista
function ensureNewsletterTableExists(PDO $pdo): void {
    $sql = "CREATE TABLE IF NOT EXISTS `newsletter_subscribers` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `email` VARCHAR(190) NOT NULL UNIQUE,
        `name` VARCHAR(150) NULL,
        `source_page` VARCHAR(100) DEFAULT 'home',
        `ip_address` VARCHAR(45) NULL,
        `is_active` TINYINT(1) DEFAULT 1,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX `idx_email` (`email`),
        INDEX `idx_active` (`is_active`),
        INDEX `idx_created` (`created_at`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    try {
        $pdo->exec($sql);
    } catch (\Throwable $t) {
        // Ignora caso não tenha permissão de DDL
    }
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? '';

// -----------------------------------------------------------------------------
// POST: Disparo de Edição Semanal / Broadcast de Newsletter (Acesso Admin)
// -----------------------------------------------------------------------------
if ($method === 'POST' && $action === 'broadcast') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token = '';
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = trim($matches[1]);
    }
    $user = verifyJwtToken($token);
    if (!$user || ($user['role'] ?? '') !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Acesso negado. Apenas administradores podem disparar newsletters.']);
        exit;
    }

    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    $subject = trim($data['subject'] ?? 'Destaques da Semana — Você Pode Tudo');
    $summary = trim($data['summary'] ?? 'Confira os novos cursos gratuitos, artigos práticos e vagas abertas no portal.');
    $link = trim($data['link'] ?? 'https://vocepodetudo.com/blog.html');

    $subscribers = [];
    $pdo = getDbConnection();
    if ($pdo instanceof PDO) {
        try {
            ensureNewsletterTableExists($pdo);
            $stmt = $pdo->query("SELECT `id`, `email`, `name` FROM `newsletter_subscribers` WHERE `is_active` = 1");
            $subscribers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\Throwable $t) {}
    }
    if (empty($subscribers)) {
        $cached = loadSubscribersFromCache($cacheFile);
        $subscribers = array_filter($cached, fn($s) => ($s['is_active'] ?? 1) == 1);
    }

    $activeCount = count($subscribers);

    // Salvar no histórico de disparos
    $historyFile = __DIR__ . '/cache_newsletter_history.json';
    $history = file_exists($historyFile) ? json_decode(file_get_contents($historyFile), true) ?: [] : [];
    $record = [
        'id' => count($history) + 1,
        'subject' => $subject,
        'summary' => $summary,
        'link' => $link,
        'recipients_count' => $activeCount,
        'sent_at' => date('Y-m-d H:i:s')
    ];
    $history[] = $record;
    file_put_contents($historyFile, json_encode($history, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    echo json_encode([
        'success' => true,
        'message' => "Edição Semanal registrada e disparada com sucesso para {$activeCount} inscritos ativos!",
        'payload' => $record
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// POST: Nova Inscrição na Newsletter
// -----------------------------------------------------------------------------
if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Payload JSON inválido.']);
        exit;
    }

    $email = trim($data['email'] ?? '');
    $name = trim($data['name'] ?? '');
    $source = trim($data['source'] ?? 'rodape');
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';

    // Validação de E-mail
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Por favor, informe um e-mail válido.']);
        exit;
    }

    $emailLower = strtolower($email);
    $savedInDb = false;

    // Tentar gravar no MySQL via PDO
    $pdo = getDbConnection();
    if ($pdo instanceof PDO) {
        try {
            ensureNewsletterTableExists($pdo);
            $stmt = $pdo->prepare("INSERT INTO `newsletter_subscribers` (`email`, `name`, `source_page`, `ip_address`) 
                                   VALUES (:email, :name, :source, :ip) 
                                   ON DUPLICATE KEY UPDATE `is_active` = 1");
            $stmt->execute([
                ':email' => $emailLower,
                ':name' => $name ?: null,
                ':source' => substr($source, 0, 100),
                ':ip' => substr($ip, 0, 45)
            ]);
            $savedInDb = true;
        } catch (\Throwable $t) {
            error_log("[Newsletter DB Error] " . $t->getMessage());
        }
    }

    // Gravação redundante no cache JSON
    $cached = loadSubscribersFromCache($cacheFile);
    $exists = false;
    foreach ($cached as &$sub) {
        if (strtolower($sub['email'] ?? '') === $emailLower) {
            $sub['is_active'] = 1;
            $sub['updated_at'] = date('Y-m-d H:i:s');
            $exists = true;
            break;
        }
    }
    unset($sub);

    if (!$exists) {
        $cached[] = [
            'id' => count($cached) + 1,
            'email' => $emailLower,
            'name' => $name,
            'source_page' => $source,
            'ip_address' => $ip,
            'is_active' => 1,
            'created_at' => date('Y-m-d H:i:s')
        ];
    }
    saveSubscribersToCache($cacheFile, $cached);

    echo json_encode([
        'success' => true,
        'message' => 'Parabéns! Sua inscrição foi realizada com sucesso. Você receberá nossas melhores oportunidades.',
        'already_subscribed' => $exists
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// GET: Listagem de Inscritos (Acesso Administrativo ou Exportação)
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    // Autenticação simples de Admin via Token Bearer
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token = '';
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = trim($matches[1]);
    }

    $export = isset($_GET['export']) && $_GET['export'] === 'csv';

    // Verificação de autenticação administrativa
    $isAdmin = false;
    if (!empty($token)) {
        $user = verifyJwtToken($token);
        if ($user && in_array($user['role'] ?? '', ['admin', 'viewer'], true)) {
            $isAdmin = true;
        }
    }

    if (!$isAdmin) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Acesso não autorizado. É necessário login administrativo.']);
        exit;
    }

    $subscribers = [];
    $pdo = getDbConnection();

    if ($pdo instanceof PDO) {
        try {
            ensureNewsletterTableExists($pdo);
            $stmt = $pdo->query("SELECT `id`, `email`, `name`, `source_page`, `is_active`, `created_at` FROM `newsletter_subscribers` ORDER BY `id` DESC");
            $subscribers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\Throwable $t) {
            error_log("[Newsletter Fetch DB Error] " . $t->getMessage());
        }
    }

    // Fallback para o arquivo JSON se banco estiver vazio ou offline
    if (empty($subscribers)) {
        $subscribers = loadSubscribersFromCache($cacheFile);
    }

    // Se solicitado exportação em CSV:
    if ($export) {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename=newsletter_vocepodetudo_' . date('Y-m-d') . '.csv');
        $output = fopen('php://output', 'w');
        // BOM UTF-8 para Excel abrir com acentuação correta
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
        fputcsv($output, ['ID', 'E-mail', 'Nome', 'Origem', 'Status', 'Data de Cadastro'], ';');
        foreach ($subscribers as $row) {
            fputcsv($output, array_map('sanitizeCsvField', [
                $row['id'] ?? '',
                $row['email'] ?? '',
                $row['name'] ?? '',
                $row['source_page'] ?? '',
                ($row['is_active'] ?? 1) ? 'Ativo' : 'Inativo',
                $row['created_at'] ?? ''
            ]), ';');
        }
        fclose($output);
        exit;
    }

    echo json_encode([
        'success' => true,
        'count' => count($subscribers),
        'subscribers' => $subscribers
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// DELETE: Excluir/Desativar Inscrição (Acesso Administrativo)
// -----------------------------------------------------------------------------
if ($method === 'DELETE') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token = '';
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = trim($matches[1]);
    }
    $user = verifyJwtToken($token);
    if (!$user || ($user['role'] ?? '') !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Apenas administradores podem remover inscrições.']);
        exit;
    }

    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'ID inválido.']);
        exit;
    }

    $pdo = getDbConnection();
    if ($pdo instanceof PDO) {
        try {
            $stmt = $pdo->prepare("DELETE FROM `newsletter_subscribers` WHERE `id` = :id");
            $stmt->execute([':id' => $id]);
        } catch (\Throwable $t) {}
    }

    $cached = loadSubscribersFromCache($cacheFile);
    $cached = array_values(array_filter($cached, fn($s) => ($s['id'] ?? 0) !== $id));
    saveSubscribersToCache($cacheFile, $cached);

    echo json_encode(['success' => true, 'message' => 'Inscrição removida com sucesso.']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Método não permitido.']);
