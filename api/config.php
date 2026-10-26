<?php
/**
 * Configuração Geral da API & Conexão MySQL (PDO)
 * Portal Você Pode Tudo — ServerByte / cPanel
 */

// Desabilitar exibição direta de erros no frontend em produção (mas logar no servidor)
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// Configurações do Banco de Dados MySQL na ServerByte / StackCP (obtidas do painel)
define('DB_HOST', 'sdb-73.hosting.stackcp.net');
define('DB_NAME', 'voce_podetudo-35303633ebd7');
define('DB_USER', 'voce_podetudo');
define('DB_PASS', 'Rx178gpo2@1985!'); // Senha definida no campo "New password" e salva
define('DB_CHARSET', 'utf8mb4');

// Chave Secreta para Assinatura de Tokens de Acesso (HMAC-SHA256)
define('JWT_SECRET', 'vpt_secret_serverbyte_2026_super_secure_key_brasilll!');
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
        return $pdo;
    } catch (PDOException $e) {
        error_log("Erro de Conexão MySQL: " . $e->getMessage());
        // Resposta segura em produção: NUNCA vazar detalhes de infraestrutura ou diagnóstico
        if (strpos($_SERVER['REQUEST_URI'] ?? '', 'setup.php') === false && strpos($_SERVER['REQUEST_URI'] ?? '', 'test_db.php') === false) {
            jsonResponse([
                'error' => true,
                'message' => 'Serviço temporariamente indisponível. Tente novamente mais tarde.'
            ], 503);
        }
        throw $e;
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
        PDO::ATTR_TIMEOUT            => 2
    ];

    try {
        $safePdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $safePdo;
    } catch (Throwable $e) {
        return null;
    }
}

/**
 * Responde em JSON com código HTTP apropriado
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=UTF-8');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Gera Token Criptográfico Seguro (HMAC-SHA256)
 */
function generateToken($userId, $username) {
    $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $payload = base64_encode(json_encode([
        'uid' => $userId,
        'user' => $username,
        'exp' => time() + TOKEN_EXPIRATION_SECONDS,
        'iat' => time()
    ]));
    $signature = hash_hmac('sha256', "$header.$payload", JWT_SECRET);
    return "$header.$payload.$signature";
}

/**
 * Valida Token Criptográfico
 */
function verifyToken($token) {
    if (!$token || substr_count($token, '.') !== 2) {
        return false;
    }
    list($header, $payload, $signature) = explode('.', $token);
    $expectedSignature = hash_hmac('sha256', "$header.$payload", JWT_SECRET);

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
 * Proteção de Rota: Exige autenticação de Administrador
 */
function requireAuth() {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    $token = '';
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
    } elseif (isset($_COOKIE['vpt_auth_token'])) {
        $token = $_COOKIE['vpt_auth_token'];
    } elseif (!empty($_GET['token'])) {
        $token = trim($_GET['token']);
    } elseif (!empty($_POST['token'])) {
        $token = trim($_POST['token']);
    }

    $userData = verifyToken($token);
    if (!$userData) {
        jsonResponse([
            'error' => true,
            'message' => 'Acesso não autorizado. Faça login como administrador.'
        ], 401);
    }

    return $userData;
}

/**
 * Gera Token de Acesso do Aluno (HMAC-SHA256)
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
    $signature = hash_hmac('sha256', "$header.$payload", JWT_SECRET);
    return "$header.$payload.$signature";
}

/**
 * Proteção de Rota: Exige autenticação de Aluno
 */
function requireStudentAuth() {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? '');

    $token = '';
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
    } elseif (isset($_COOKIE['vpt_student_token'])) {
        $token = $_COOKIE['vpt_student_token'];
    } elseif (isset($_GET['token'])) {
        $token = $_GET['token'];
    }

    $tokenData = verifyToken($token);
    if (!$tokenData || ($tokenData['role'] ?? '') !== 'student') {
        jsonResponse([
            'error' => true,
            'message' => 'Sessão do aluno expirada ou inválida. Por favor, faça login.'
        ], 401);
    }

    return $tokenData;
}
