<?php
/**
 * api/announcement.php - Central de Comunicados e Avisos Globais no Portal
 * Você Pode Tudo — Plataforma de Educação e Empregabilidade
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

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

$cacheFile = __DIR__ . '/cache_announcement.json';

// Padrão de anúncio inicial
$defaultAnnouncement = [
    'active' => false,
    'message' => 'Bem-vindo ao portal oficial Você Pode Tudo. Todos os cursos são 100% gratuitos com certificado.',
    'type' => 'info', // 'info', 'warning', 'danger'
    'link' => '',
    'linkText' => '',
    'updatedAt' => date('c')
];

function loadAnnouncement(string $file, array $default): array {
    if (file_exists($file)) {
        $content = @file_get_contents($file);
        if ($content) {
            $json = json_decode($content, true);
            if (is_array($json)) {
                return array_merge($default, $json);
            }
        }
    }
    return $default;
}

function saveAnnouncement(string $file, array $data): bool {
    return (bool) @file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $announcement = loadAnnouncement($cacheFile, $defaultAnnouncement);
    echo json_encode(['success' => true, 'announcement' => $announcement], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    // Autenticação Obrigatória de Administrador Pleno (Mutações requerem admin)
    require_once __DIR__ . '/config.php';
    $auth = requireAdmin(false);

    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);
    if (!is_array($payload)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Payload JSON inválido.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $current = loadAnnouncement($cacheFile, $defaultAnnouncement);
    $active = isset($payload['active']) ? (bool) $payload['active'] : $current['active'];
    $message = isset($payload['message']) ? trim((string) $payload['message']) : $current['message'];
    $type = isset($payload['type']) && in_array($payload['type'], ['info', 'warning', 'danger'], true) ? $payload['type'] : $current['type'];
    $link = isset($payload['link']) ? trim((string) $payload['link']) : $current['link'];
    $linkText = isset($payload['linkText']) ? trim((string) $payload['linkText']) : $current['linkText'];

    $updated = [
        'active' => $active,
        'message' => $message,
        'type' => $type,
        'link' => $link,
        'linkText' => $linkText,
        'updatedAt' => date('c'),
        'updatedBy' => $auth['username'] ?? 'admin'
    ];

    saveAnnouncement($cacheFile, $updated);

    echo json_encode(['success' => true, 'message' => 'Comunicado global atualizado com sucesso!', 'announcement' => $updated], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Método não permitido.'], JSON_UNESCAPED_UNICODE);
