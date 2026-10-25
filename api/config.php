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
        jsonResponse([
            'error' => true,
            'message' => 'Falha de conexão com o banco de dados MySQL. Verifique as credenciais no arquivo api/config.php.'
        ], 500);
    }
}

/**
 * Responde em JSON com código HTTP apropriado
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=UTF-8');
    header('X-Content-Type-Options: nosniff');
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
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    $token = '';
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
    } elseif (isset($_COOKIE['vpt_auth_token'])) {
        $token = $_COOKIE['vpt_auth_token'];
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
