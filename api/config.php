<?php
/**
 * Configuração Geral da API & Conexão MySQL (PDO)
 * Portal Você Pode Tudo — ServerByte / cPanel
 */

// Padronização Estrita do Fuso Horário Oficial (Horário de Brasília - UTC-3)
date_default_timezone_set('America/Sao_Paulo');

// Desabilitar exibição direta de erros no frontend em produção (mas logar no servidor)
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// Cabeçalhos CORS Universais (permite requisições de qualquer origem, www e preflight)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Configurações do Banco de Dados MySQL na ServerByte / StackCP (obtidas do painel)
define('DB_HOST', 'sdb-73.hosting.stackcp.net');
define('DB_NAME', 'voce_podetudo-35303633ebd7');
define('DB_USER', 'voce_podetudo');
define('DB_PASS', '#$1*vocepodetudoPTDOfV'); // Senha do banco MySQL na ServerByte
define('DB_CHARSET', 'utf8mb4');

// Chaves Secretas para Assinatura de Tokens de Acesso (HMAC-SHA256) - Segregação Estrita de Roles
define('JWT_SECRET', 'vpt_secret_serverbyte_2026_super_secure_key_brasilll!');
define('JWT_STUDENT_SECRET', 'vpt_student_secret_serverbyte_2026_isolated_student_key!');
define('TOKEN_EXPIRATION_SECONDS', 86400 * 7); // 7 dias de validade do token

/**
 * Retorna conexão PDO ativa com o MySQL
 */
function getDBConnection() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        // Garantir que a sessão MySQL opere estritamente no fuso de Brasília (UTC-3)
        $pdo->exec("SET time_zone = '-03:00'");
        return $pdo;
    } catch (PDOException $e) {
        error_log("Erro de Conexão MySQL: " . $e->getMessage());
        // Resposta segura em produção: NUNCA vazar detalhes de infraestrutura ou diagnóstico
        jsonResponse([
            'error' => true,
            'message' => 'Serviço temporariamente indisponível. Tente novamente mais tarde.'
        ], 503);
    }
}

/**
 * Tenta conexão PDO sem interromper a execução com jsonResponse caso falhe
 */
function tryGetDBConnection() {
    static $attempted = false;
    static $safePdo = null;

    if ($attempted) return $safePdo;
    $attempted = true;

    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::ATTR_TIMEOUT            => 5
    ];

    try {
        $safePdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        // Garantir que a sessão MySQL opere estritamente no fuso de Brasília (UTC-3)
        $safePdo->exec("SET time_zone = '-03:00'");
        return $safePdo;
    } catch (Throwable $e) {
        error_log("tryGetDBConnection failed: " . $e->getMessage());
        return null;
    }
}

/**
 * Responde em JSON com código HTTP apropriado
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=UTF-8');
    header('Cache-Control: private, no-cache, no-store, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('Strict-Transport-Security: max-age=63072000; includeSubDomains; preload');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Gera Token Criptográfico Seguro de Administrador (HMAC-SHA256)
 * Suporta role 'admin' (pleno) e 'viewer' (somente leitura)
 */
function generateToken($userId, $username, $role = 'admin') {
    $validRole = ($role === 'viewer') ? 'viewer' : 'admin';
    $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $payload = base64_encode(json_encode([
        'uid' => $userId,
        'user' => $username,
        'role' => $validRole,
        'exp' => time() + TOKEN_EXPIRATION_SECONDS,
        'iat' => time()
    ]));
    $signature = hash_hmac('sha256', "$header.$payload", JWT_SECRET);
    return "$header.$payload.$signature";
}

/**
 * Valida Token Criptográfico com segredo configurável
 */
function verifyToken($token, $secret = JWT_SECRET) {
    if (!$token || substr_count($token, '.') !== 2) {
        return false;
    }
    list($header, $payload, $signature) = explode('.', $token);
    $expectedSignature = hash_hmac('sha256', "$header.$payload", $secret);

    if (!hash_equals($expectedSignature, $signature)) {
        return false;
    }

    $data = json_decode(base64_decode($payload), true);
    if (!$data || !isset($data['exp']) || time() > $data['exp']) {
        return false; // Expirado ou inválido
    }

    return $data;
}

/**
 * Proteção de Rota: Exige autenticação e autorização explícita de Administrador (Role Enforcement)
 * Se $allowViewer for true, usuários com role 'viewer' (somente leitura) também são autorizados.
 * Se $allowViewer for false (padrão), apenas administradores plenos ('admin') têm acesso a mutações.
 */
function requireAdmin($allowViewer = false) {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';

    $token = '';
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
    } elseif (isset($_COOKIE['vpt_auth_token'])) {
        $token = $_COOKIE['vpt_auth_token'];
    } elseif (!empty($_POST['token'])) {
        $token = trim($_POST['token']);
    }

    if (empty($token)) {
        jsonResponse([
            'error' => true,
            'message' => 'Autenticação necessária. Token de administrador ausente.'
        ], 401);
    }

    // 1. Validação Criptográfica da Assinatura e Expiração usando a chave de Administrador
    $userData = verifyToken($token, JWT_SECRET);
    if (!$userData) {
        jsonResponse([
            'error' => true,
            'message' => 'Token de administrador inválido ou expirado. Faça login novamente.'
        ], 401);
    }

    // 2. Verificação Estrita de Role (Mitigação P0 contra Escalada de Privilégios: Sem papel implícito)
    $isStudent = (isset($userData['role']) && $userData['role'] === 'student') || isset($userData['sub']);
    $role = (string)($userData['role'] ?? '');
    $isStaff = (!empty($userData['user']) && ($role === 'admin' || $role === 'viewer'));

    if ($isStudent || !$isStaff) {
        jsonResponse([
            'error' => true,
            'message' => 'Acesso negado. Esta operação exige privilégios administrativos.'
        ], 403);
    }

    // 3. Se a rota exigir permissão de escrita/modificação e o usuário for apenas visualizador, bloqueia!
    if (!$allowViewer && $role === 'viewer') {
        jsonResponse([
            'error' => true,
            'message' => 'Acesso negado: Perfil de visualizador possui permissão apenas de leitura.'
        ], 403);
    }

    return $userData;
}

/**
 * Helper explícito para rotas de leitura administrativa (permite admin e viewer)
 */
function requireAdminRead() {
    return requireAdmin(true);
}

/**
 * Helper explícito para rotas de escrita/mutação administrativa (estrito para admin pleno)
 */
function requireAdminWrite() {
    return requireAdmin(false);
}

/**
 * Alias de compatibilidade retroativa para rotas administrativas existentes
 */
function requireAuth($allowViewer = false) {
    return requireAdmin($allowViewer);
}

/**
 * Verifica de forma não-bloqueante se a requisição atual possui sessão/token válido de administrador.
 * Retorna os dados do usuário administrativo autenticado ou null caso seja visitante anônimo ou inválido.
 * NUNCA aceita tokens por parâmetro GET para evitar vazamento ou contorno de links.
 */
function checkAdminSession(): ?array {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';

    $token = '';
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
    } elseif (isset($_COOKIE['vpt_auth_token'])) {
        $token = $_COOKIE['vpt_auth_token'];
    }

    if (empty($token)) {
        return null;
    }

    $userData = verifyToken($token, JWT_SECRET);
    if (!$userData) {
        return null;
    }

    // Verificação Estrita de Role: Sem papel administrativo implícito (exige explicitamente 'admin' ou 'viewer')
    $isStudent = (isset($userData['role']) && $userData['role'] === 'student') || isset($userData['sub']);
    $role = (string)($userData['role'] ?? '');
    $isStaff = (!empty($userData['user']) && ($role === 'admin' || $role === 'viewer'));

    if ($isStudent || !$isStaff) {
        return null;
    }

    return $userData;
}

/**
 * Gera Token de Acesso do Aluno com Chave Isolada (HMAC-SHA256)
 */
function generateStudentToken($studentId, $name, $email) {
    $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $payload = base64_encode(json_encode([
        'sub' => (int) $studentId,
        'name' => $name,
        'email' => $email,
        'role' => 'student',
        'exp' => time() + (TOKEN_EXPIRATION_SECONDS * 4), // 28 dias para comodidade do aluno
        'iat' => time()
    ]));
    $signature = hash_hmac('sha256', "$header.$payload", JWT_STUDENT_SECRET);
    return "$header.$payload.$signature";
}

/**
 * Proteção de Rota: Exige autenticação de Aluno (Valida Role 'student' e Chave de Aluno)
 */
function requireStudentAuth() {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? '');

    $token = '';
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
    } elseif (isset($_COOKIE['vpt_student_token'])) {
        $token = $_COOKIE['vpt_student_token'];
    } elseif (!empty($_POST['token'])) {
        $token = trim($_POST['token']);
    }

    if (empty($token)) {
        jsonResponse([
            'error' => true,
            'message' => 'Autenticação de aluno necessária. Token ausente.'
        ], 401);
    }

    // 1. Tentar validar com a chave isolada de alunos (novo padrão)
    $tokenData = verifyToken($token, JWT_STUDENT_SECRET);
    
    // 2. Se falhar, tenta com a chave anterior para manter sessões existentes de alunos ativas sem logout forçado
    if (!$tokenData) {
        $tokenData = verifyToken($token, JWT_SECRET);
    }

    // 3. Garantir que a role seja estritamente 'student' e possua 'sub'
    if (!$tokenData || ($tokenData['role'] ?? '') !== 'student' || empty($tokenData['sub'])) {
        jsonResponse([
            'error' => true,
            'message' => 'Sessão do aluno expirada ou inválida. Por favor, faça login.'
        ], 401);
    }

    return $tokenData;
}

/**
 * Sanitiza valores para exportação segura em arquivos CSV (Anti-Formula Injection / CWE-1236)
 * Previne execução de comandos arbitrários no Excel/Calc via =, +, -, @, \t, \r
 */
function sanitizeCsvField($value): string {
    if ($value === null) {
        return '';
    }
    $str = (string) $value;
    $trimmed = ltrim($str);
    if ($trimmed !== '' && in_array($trimmed[0], ['=', '+', '-', '@', "\t", "\r"], true)) {
        return "'" . $str;
    }
    return $str;
}

/**
 * Validação rigorosa contra SSRF (Server-Side Request Forgery / CWE-918)
 * Garante que a URL externa aponte estritamente para endereços IP públicos e protocolos HTTP/HTTPS
 */
function isSafePublicUrl(string $url, ?string &$resolvedIp = null): bool {
    $parsed = parse_url($url);
    if (!$parsed || empty($parsed['scheme']) || empty($parsed['host'])) {
        return false;
    }

    $scheme = strtolower($parsed['scheme']);
    if ($scheme !== 'http' && $scheme !== 'https') {
        return false;
    }

    $host = strtolower($parsed['host']);
    
    // Bloqueio imediato de nomes locais e metadados
    if (in_array($host, ['localhost', 'loopback', 'metadata.google.internal', 'instance-data'], true)) {
        return false;
    }

    // Se for IP direto, valida
    if (filter_var($host, FILTER_VALIDATE_IP)) {
        $ip = $host;
    } else {
        // Resolução DNS
        $ips = @gethostbynamel($host);
        if (!$ips || empty($ips)) {
            return false;
        }
        $ip = $ips[0];
    }

    $resolvedIp = $ip;

    // Garante que o IP seja IPv4 ou IPv6 estritamente público
    $isPublic = filter_var(
        $ip,
        FILTER_VALIDATE_IP,
        FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
    );

    if (!$isPublic) {
        return false;
    }

    // Verificações adicionais de faixas sensíveis (ex: AWS/GCP/Azure link-local metadata 169.254.x.x)
    if (strpos($ip, '169.254.') === 0 || strpos($ip, '127.') === 0 || strpos($ip, '0.') === 0) {
        return false;
    }

    return true;
}
