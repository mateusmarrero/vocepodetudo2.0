<?php
/**
 * API de Autenticação Segura (Login & Troca de Senha com BCRYPT)
 * Portal Você Pode Tudo
 */

require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? 'login';
$method = $_SERVER['REQUEST_METHOD'];

// Obter corpo da requisição (JSON ou POST Form)
$inputRaw = file_get_contents('php://input');
$inputData = json_decode($inputRaw, true) ?? $_POST;

switch ($action) {
    case 'login':
        if ($method !== 'POST') {
            jsonResponse(['error' => true, 'message' => 'Método inválido.'], 405);
        }

        $username = trim($inputData['username'] ?? '');
        $password = trim($inputData['password'] ?? '');

        if (empty($username) || empty($password)) {
            jsonResponse(['error' => true, 'message' => 'Informe usuário e senha.'], 400);
        }

        $pdo = getDBConnection();

        // Buscar usuário no banco
        $stmt = $pdo->prepare("SELECT id, username, password_hash FROM admin_users WHERE username = ? LIMIT 1");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            // Delay intencional para mitigar timing attacks e brute force
            usleep(250000); // 250ms
            jsonResponse(['error' => true, 'message' => 'Usuário ou senha incorretos.'], 401);
        }

        // Se a senha foi verificada com sucesso, gera token JWT
        $token = generateToken($user['id'], $user['username']);

        jsonResponse([
            'success' => true,
            'message' => 'Login realizado com sucesso.',
            'token' => $token,
            'username' => $user['username']
        ]);
        break;

    case 'verify':
        $userData = requireAuth();
        jsonResponse([
            'success' => true,
            'valid' => true,
            'username' => $userData['user']
        ]);
        break;

    case 'change_password':
        if ($method !== 'POST') {
            jsonResponse(['error' => true, 'message' => 'Método inválido.'], 405);
        }

        $userData = requireAuth();
        $currentPassword = trim($inputData['current_password'] ?? '');
        $newPassword = trim($inputData['new_password'] ?? '');

        if (strlen($newPassword) < 6) {
            jsonResponse(['error' => true, 'message' => 'A nova senha deve ter no mínimo 6 caracteres.'], 400);
        }

        $pdo = getDBConnection();
        $stmt = $pdo->prepare("SELECT id, password_hash FROM admin_users WHERE id = ? LIMIT 1");
        $stmt->execute([$userData['uid']]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
            jsonResponse(['error' => true, 'message' => 'A senha atual informada está incorreta.'], 401);
        }

        // Criptografar nova senha com BCRYPT
        $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
        $updateStmt = $pdo->prepare("UPDATE admin_users SET password_hash = ? WHERE id = ?");
        $updateStmt->execute([$newHash, $userData['uid']]);

        jsonResponse([
            'success' => true,
            'message' => 'Senha alterada com sucesso no banco de dados!'
        ]);
        break;

    default:
        jsonResponse(['error' => true, 'message' => 'Ação não reconhecida.'], 404);
}
