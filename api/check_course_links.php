<?php
/**
 * api/check_course_links.php
 * Verificador Automático de Links Externos dos Cursos (Link Checker)
 * Portal Você Pode Tudo
 */

declare(strict_types=1);

date_default_timezone_set('America/Sao_Paulo');
@set_time_limit(180);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = ['https://vocepodetudo.com', 'https://www.vocepodetudo.com', 'http://localhost:3000', 'http://localhost:3333'];
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: https://vocepodetudo.com");
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$CRON_SECRET = 'vpt_links_cron_2026_secure';
$action = $_GET['action'] ?? $_POST['action'] ?? 'report';
$isCli = (php_sapi_name() === 'cli' || empty($_SERVER['REMOTE_ADDR']));
$cronKey = $_GET['cron_key'] ?? $_POST['cron_key'] ?? '';

$isAuthorized = false;
if ($isCli || ($action === 'run' && $cronKey === $CRON_SECRET)) {
    $isAuthorized = true;
} else {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $m)) {
        if (function_exists('verifyToken') && verifyToken($m[1])) {
            $isAuthorized = true;
        }
    }
}

if (!$isAuthorized) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Acesso não autorizado.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$reportFile = __DIR__ . '/cache_links_report.json';

if ($action === 'report') {
    if (file_exists($reportFile)) {
        $data = json_decode((string)@file_get_contents($reportFile), true);
        if (is_array($data)) {
            echo json_encode(['success' => true, 'report' => $data], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
    echo json_encode(['success' => true, 'report' => null], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'run') {
    $coursesFile = file_exists(__DIR__ . '/cache_courses.json') ? __DIR__ . '/cache_courses.json' : __DIR__ . '/seed_courses.json';
    $courses = json_decode((string)@file_get_contents($coursesFile), true) ?: [];
    $active = array_values(array_filter($courses, fn($c) => !empty($c['url']) && (!isset($c['isActive']) || $c['isActive'])));

    // Agrupar por URL única para evitar checar a mesma URL dezenas de vezes
    $urlMap = [];
    foreach ($active as $c) {
        $u = trim((string)$c['url']);
        if (!isset($urlMap[$u])) {
            $urlMap[$u] = [];
        }
        $urlMap[$u][] = ['id' => $c['id'], 'title' => $c['title'], 'provider' => $c['provider'] ?? ''];
    }

    $urls = array_keys($urlMap);
    $batchSize = 15;
    $broken = [];
    $okCount = 0;

    for ($offset = 0; $offset < count($urls); $offset += $batchSize) {
        $slice = array_slice($urls, $offset, $batchSize);
        $mh = curl_multi_init();
        $handles = [];
        foreach ($slice as $u) {
            $ch = curl_init($u);
            curl_setopt($ch, CURLOPT_NOBODY, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_MAXREDIRS, 4);
            curl_setopt($ch, CURLOPT_TIMEOUT, 7);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 4);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (compatible; VocePodeTudo-LinkChecker/1.0)');
            curl_multi_add_handle($mh, $ch);
            $handles[$u] = $ch;
        }

        $running = null;
        do {
            curl_multi_exec($mh, $running);
            curl_multi_select($mh, 0.2);
        } while ($running > 0);

        foreach ($handles as $u => $ch) {
            $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $err = curl_error($ch);
            curl_multi_remove_handle($mh, $ch);
            curl_close($ch);

            // 200-399 ou 403/405/429 (alguns sites bloqueiam HEAD/bots mas existem) são considerados ativos; 404/410/5xx/0 são quebrados
            if ($code >= 200 && $code < 400 || in_array($code, [403, 405, 429], true)) {
                $okCount += count($urlMap[$u]);
            } else {
                foreach ($urlMap[$u] as $courseRef) {
                    $broken[] = [
                        'id' => $courseRef['id'],
                        'title' => $courseRef['title'],
                        'provider' => $courseRef['provider'],
                        'url' => $u,
                        'http_code' => $code,
                        'error' => $err ?: ($code === 0 ? 'Timeout / DNS' : "HTTP $code")
                    ];
                }
            }
        }
        curl_multi_close($mh);
    }

    $report = [
        'checked_at' => date('c'),
        'total_courses' => count($active),
        'unique_urls' => count($urls),
        'ok_courses' => $okCount,
        'broken_count' => count($broken),
        'broken' => array_slice($broken, 0, 50)
    ];

    @file_put_contents($reportFile, json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    if (($_GET['silent'] ?? '') === '1') {
        http_response_code(200);
        exit;
    }

    echo json_encode(['success' => true, 'report' => $report], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['success' => false, 'error' => 'Ação inválida.'], JSON_UNESCAPED_UNICODE);
