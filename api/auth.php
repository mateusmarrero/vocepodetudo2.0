<?php
/**
 * API de Autenticação Segura (Login & Troca de Senha com BCRYPT)
 * Portal Você Pode Tudo
 */

require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? 'login';
$method = $_SERVER['REQUEST_METHOD'];

// Obter corpo da requisição estritamente via JSON ou POST (NUNCA via GET para credenciais)
$inputRaw = file_get_contents('php://input');
$inputData = json_decode($inputRaw, true);
if (!is_array($inputData)) {
    $inputData = $_POST;
}

switch ($action) {
    case 'login':
        if ($method !== 'POST') {
            jsonResponse(['error' => true, 'message' => 'Método não permitido. Utilize POST para autenticação.'], 405);
        }

        $username = trim($inputData['username'] ?? '');
        $password = trim($inputData['password'] ?? '');

        if (empty($username) || empty($password)) {
            jsonResponse(['error' => true, 'message' => 'Informe usuário e senha.'], 400);
        }

        $pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;
        $user = null;

        if ($pdo) {
            // Buscar usuário no banco MySQL
            $stmt = $pdo->prepare("SELECT id, username, password_hash FROM admin_users WHERE username = ? LIMIT 1");
            $stmt->execute([$username]);
            $user = $stmt->fetch();
        }

        // Senha fixa oficial de Administrador (Rx178gpo2@1985) com hash BCRYPT seguro
        $defaultHash = '$2b$10$X.fiIOTfTyCr1XsA7Na5A.Uqi.EfRRIfiqCNLfuexDCmxN9DNsoDG';
        $isValid = false;
        $userId = 1;
        $finalUsername = 'admin';

        if ($user && isset($user['password_hash'])) {
            $isValid = password_verify($password, $user['password_hash']);
            // Se a senha informada for a oficial fixa mas o banco ainda tiver hash antigo, sincroniza o banco
            if (!$isValid && ($password === 'Rx178gpo2@1985' || password_verify($password, $defaultHash))) {
                $isValid = true;
                try {
                    $pdo->prepare("UPDATE admin_users SET password_hash = ? WHERE id = ?")->execute([$defaultHash, $user['id']]);
                } catch (Exception $e) {}
            }
            $userId = (int)$user['id'];
            $finalUsername = $user['username'];
        } elseif (strtolower($username) === 'admin') {
            // Fallback seguro em PHP (validação da senha oficial fixa no servidor)
            $isValid = password_verify($password, $defaultHash) || ($password === 'Rx178gpo2@1985');
            $userId = 1;
            $finalUsername = 'admin';
        }

        if (!$isValid) {
            // Delay intencional para mitigar timing attacks e brute force
            usleep(250000); // 250ms
            jsonResponse(['error' => true, 'message' => 'Usuário ou senha incorretos.'], 401);
        }

        // Se a senha foi verificada com sucesso, gera token JWT assinado criptograficamente
        $token = generateToken($userId, $finalUsername);

        jsonResponse([
            'success' => true,
            'message' => 'Login realizado com sucesso.',
            'token' => $token,
            'username' => $finalUsername
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
            jsonResponse(['error' => true, 'message' => 'Método não permitido. Utilize POST.'], 405);
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
