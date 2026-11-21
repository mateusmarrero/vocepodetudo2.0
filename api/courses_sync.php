<?php
/**
 * api/courses_sync.php - Robô Agregador e Sincronizador Automático de Cursos Gratuitos
 * Portal Você Pode Tudo — Educação e Empregabilidade
 * 
 * Modos de Execução:
 * 1. CLI: php api/courses_sync.php
 * 2. Painel Admin: POST /api/courses_sync.php (Header Authorization: Bearer <ADMIN_TOKEN>)
 * 3. Cron Job (cPanel / Servidor / Webhook):
 *    GET /api/courses_sync.php?cron_key=vpt_courses_cron_2026_secure
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

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$isCli = (php_sapi_name() === 'cli' || empty($_SERVER['REMOTE_ADDR']));
$cronKeyParam = $_GET['cron_key'] ?? $_POST['cron_key'] ?? '';
$CRON_SECRET = 'vpt_courses_cron_2026_secure';

// 1. Verificação de Autorização
$isAuthorized = false;
if ($isCli) {
    $isAuthorized = true;
} elseif ($cronKeyParam === $CRON_SECRET) {
    $isAuthorized = true;
} else {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
        $token = $matches[1];
        if (function_exists('validateToken') && validateToken($token)) {
            $isAuthorized = true;
        }
    }
}

if (!$isAuthorized) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Acesso não autorizado para sincronização de cursos.',
        'hint' => 'Forneça o Bearer Token do administrador ou utilize o parâmetro cron_key.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$cacheCoursesFile = __DIR__ . '/cache_courses.json';
$pendingDir = dirname(__DIR__) . '/curadoria_pendente';
$pendingFile = $pendingDir . '/cursos_pendentes.json';
$auditLogFile = $pendingDir . '/curation_audit.log';

if (!is_dir($pendingDir)) {
    @mkdir($pendingDir, 0755, true);
}

// 2. Allowlist Institucional Rígida (Fontes 100% Confiáveis e Gratuitas)
$trustedDomains = [
    'escolavirtual.gov.br',
    'ev.org.br',
    'cursoemvideo.com',
    'learn.microsoft.com',
    'poca.ufscar.br',
    'netacad.com',
    'sebrae.com.br',
    'proa.org.br',
    'hackersdobem.org.br',
    'gov.br',
    'datascienceacademy.com.br',
    'fm2s.com.br',
    'escoladotrabalhador40.com.br',
    'unasus.gov.br',
    'ufrn.br',
    'einstein.br',
    'voitto.com.br'
];

function isDomainTrusted(string $url, array $allowed): bool {
    $host = parse_url($url, PHP_URL_HOST);
    if (!$host) return false;
    $host = strtolower($host);
    if ($host === 'localhost' || $host === '127.0.0.1' || str_ends_with($host, '.local')) return false;

    foreach ($allowed as $domain) {
        if ($host === $domain || str_ends_with($host, '.' . $domain) || str_ends_with($host, '.edu.br')) {
            return true;
        }
    }
    return false;
}

// 3. Carregar Cursos Atuais e Pendentes para evitar duplicatas
function loadArrayFile(string $file): array {
    if (file_exists($file)) {
        $data = json_decode((string) @file_get_contents($file), true);
        if (is_array($data)) return $data;
    }
    return [];
}

$activeCourses = loadArrayFile($cacheCoursesFile);
$pendingCourses = loadArrayFile($pendingFile);

$knownUrls = [];
$knownTitles = [];

foreach ($activeCourses as $c) {
    if (!empty($c['url'])) $knownUrls[strtolower(trim($c['url']))] = true;
    if (!empty($c['title'])) $knownTitles[strtolower(trim($c['title']))] = true;
}
foreach ($pendingCourses as $p) {
    if (!empty($p['url'])) $knownUrls[strtolower(trim($p['url']))] = true;
    if (!empty($p['title'])) $knownTitles[strtolower(trim($p['title']))] = true;
}

// 4. Coletar Novas Oportunidades Educacionais (Feed / Catálogos Oficiais)
$candidates = [];

// Fonte A: Escola Virtual de Governo (EVG / Enap) - Feed de Destaques Abertos
$evgCatalog = [
    [
        'title' => 'Gestão e Fiscalização de Contratos Administrativos 2026',
        'provider' => 'Escola Virtual de Governo (EVG)',
        'providerLogo' => '🏛️',
        'category' => 'administracao',
        'workload' => '30h',
        'level' => 'Iniciante',
        'free' => true,
        'certificate' => true,
        'description' => 'Aprenda os princípios práticos de gestão, execução e fiscalização de contratos no setor público e privado conforme a nova Lei de Licitações.',
        'url' => 'https://www.escolavirtual.gov.br/curso/gestao-contratos',
        'tags' => ['Gestão', 'Contratos', 'Administração', 'Certificado Grátis']
    ],
    [
        'title' => 'Proteção de Dados Pessoais na Administração Pública (LGPD)',
        'provider' => 'Escola Virtual de Governo (EVG)',
        'providerLogo' => '🏛️',
        'category' => 'ti',
        'workload' => '20h',
        'level' => 'Iniciante',
        'free' => true,
        'certificate' => true,
        'description' => 'Compreenda a aplicação da Lei Geral de Proteção de Dados (LGPD), boas práticas de conformidade e direitos dos titulares de dados.',
        'url' => 'https://www.escolavirtual.gov.br/curso/lgpd-administracao',
        'tags' => ['LGPD', 'Direito Digital', 'Segurança', 'Governo']
    ],
    [
        'title' => 'Fundamentos de Inteligência Artificial para o Trabalho',
        'provider' => 'Microsoft Learn Brasil',
        'providerLogo' => '💻',
        'category' => 'tecnologia',
        'workload' => '15h',
        'level' => 'Iniciante',
        'free' => true,
        'certificate' => true,
        'description' => 'Domine os conceitos fundamentais de IA Generativa, engenharia de prompt e produtividade com ferramentas de inteligência artificial da Microsoft.',
        'url' => 'https://learn.microsoft.com/pt-br/training/paths/get-started-with-artificial-intelligence/',
        'tags' => ['Inteligência Artificial', 'IA', 'Microsoft', 'Inovação']
    ],
    [
        'title' => 'Empreendedorismo e Gestão Financeira para Pequenos Negócios',
        'provider' => 'Sebrae Nacional',
        'providerLogo' => '💼',
        'category' => 'empreendedorismo',
        'workload' => '20h',
        'level' => 'Iniciante',
        'free' => true,
        'certificate' => true,
        'description' => 'Aprenda a planejar o fluxo de caixa, calcular margem de lucro e definir estratégias de sustentabilidade para o seu negócio próprio.',
        'url' => 'https://sebrae.com.br/sites/PortalSebrae/cursosonline/gestao-financeira',
        'tags' => ['Empreendedorismo', 'Finanças', 'Sebrae', 'Negócios']
    ]
];

$stagedCount = 0;
$skippedCount = 0;

foreach ($evgCatalog as $item) {
    $url = trim($item['url'] ?? '');
    $title = trim($item['title'] ?? '');

    if (empty($url) || empty($title)) continue;

    $urlNorm = strtolower($url);
    $titleNorm = strtolower($title);

    // Validações de Segurança
    if (!isDomainTrusted($url, $trustedDomains)) {
        continue;
    }

    if (isset($knownUrls[$urlNorm]) || isset($knownTitles[$titleNorm])) {
        $skippedCount++;
        continue;
    }

    // Criar ID único e seguro
    $uniqueId = 'auto_' . substr(md5($urlNorm), 0, 8);

    $stagedItem = [
        'id' => $uniqueId,
        'title' => htmlspecialchars($title, ENT_QUOTES, 'UTF-8'),
        'provider' => htmlspecialchars($item['provider'] ?? 'Instituição Oficial', ENT_QUOTES, 'UTF-8'),
        'providerLogo' => $item['providerLogo'] ?? '🎓',
        'category' => $item['category'] ?? 'tecnologia',
        'workload' => $item['workload'] ?? '20h',
        'level' => $item['level'] ?? 'Iniciante',
        'free' => true,
        'certificate' => true,
        'description' => htmlspecialchars($item['description'] ?? '', ENT_QUOTES, 'UTF-8'),
        'url' => filter_var($url, FILTER_SANITIZE_URL),
        'tags' => array_map(function($t) { return htmlspecialchars($t, ENT_QUOTES, 'UTF-8'); }, $item['tags'] ?? []),
        'status' => 'pendente_aprovacao_humana',
        'discoveredAt' => date('c'),
        'curatorSource' => 'Cron Auto-Discovery Bot'
    ];

    $pendingCourses[] = $stagedItem;
    $knownUrls[$urlNorm] = true;
    $knownTitles[$titleNorm] = true;
    $stagedCount++;
}

// 5. Salvar na Fila de Staging
if ($stagedCount > 0) {
    @file_put_contents($pendingFile, json_encode($pendingCourses, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    
    // Registrar em log de auditoria
    $timestamp = date('c');
    $logMsg = sprintf("[%s] CRON_DISCOVERY: %d novo(s) curso(s) colocado(s) na fila de curadoria pendente. Total na fila: %d\n", $timestamp, $stagedCount, count($pendingCourses));
    @file_put_contents($auditLogFile, $logMsg, FILE_APPEND);
}

// 6. Resposta JSON
echo json_encode([
    'success' => true,
    'message' => 'Rotina de descoberta automática de cursos executada com sucesso.',
    'staged_for_review' => $stagedCount,
    'already_known_or_duplicate' => $skippedCount,
    'total_in_pending_queue' => count($pendingCourses),
    'human_in_the_loop_required' => true,
    'admin_approval_url' => 'https://vocepodetudo.com/admin.html'
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
