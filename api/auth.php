<?php
/**
 * API de Autenticação Segura (Login & Troca de Senha com BCRYPT + 2FA TOTP RFC 6238)
 * Portal Você Pode Tudo
 */

require_once __DIR__ . '/config.php';

// Funções Nativas de Autenticação em Duas Etapas (2FA / TOTP)
function base32Decode($b32) {
    $b32 = strtoupper(preg_replace('/[^A-Z2-7]/', '', $b32));
    if (empty($b32)) return '';
    $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $binary = '';
    for ($i = 0; $i < strlen($b32); $i++) {
        $val = strpos($chars, $b32[$i]);
        if ($val === false) continue;
        $binary .= str_pad(decbin($val), 5, '0', STR_PAD_LEFT);
    }
    $bytes = '';
    for ($i = 0; $i + 8 <= strlen($binary); $i += 8) {
        $bytes .= chr(bindec(substr($binary, $i, 8)));
    }
    return $bytes;
}

function verifyTotp($secretBase32, $code, $discrepancy = 1) {
    $secret = base32Decode($secretBase32);
    if (!$secret) return false;
    $timeStep = 30;
    $currentTime = floor(time() / $timeStep);
    $inputCode = str_pad(trim($code), 6, '0', STR_PAD_LEFT);

    for ($i = -$discrepancy; $i <= $discrepancy; $i++) {
        $time = $currentTime + $i;
        $timePacked = pack('N*', 0) . pack('N*', $time);
        $hash = hash_hmac('sha1', $timePacked, $secret, true);
        $offset = ord(substr($hash, -1)) & 0x0F;
        $part = substr($hash, $offset, 4);
        $value = unpack('N', $part)[1] & 0x7FFFFFFF;
        $calculatedCode = str_pad($value % 1000000, 6, '0', STR_PAD_LEFT);
        if (hash_equals($calculatedCode, $inputCode)) {
            return true;
        }
    }
    return false;
}

function generateBase32Secret($length = 16) {
    $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $secret = '';
    for ($i = 0; $i < $length; $i++) {
        $secret .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $secret;
}

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

        if (empty($password)) {
            jsonResponse(['error' => true, 'message' => 'Informe a senha de acesso.'], 400);
        }

        if (empty($username)) {
            $username = 'admin';
        }

        $pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;
        if (!$pdo) {
            jsonResponse(['error' => true, 'message' => 'Serviço temporariamente indisponível. Tente novamente mais tarde.'], 503);
        }

        // Migração suave e garantia das colunas de role e 2FA TOTP
        try {
            $pdo->exec("ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS `role` VARCHAR(20) NOT NULL DEFAULT 'admin'");
            $pdo->exec("ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS `totp_secret` VARCHAR(64) NULL");
            $pdo->exec("ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS `totp_enabled` TINYINT(1) NOT NULL DEFAULT 0");
        } catch (Throwable $e) {}

        // Segurança P0: Bloco de auto-criação de usuário visualizador com credencial estática removido do código.

        // Buscar usuário estritamente na base de dados (incluindo dados de 2FA)
        $stmt = $pdo->prepare("SELECT id, username, password_hash, role, totp_secret, totp_enabled FROM admin_users WHERE username = ? LIMIT 1");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        // Se o usuário informado for 'administrador', mapear para a conta 'admin'
        if (!$user && ($username === 'administrador')) {
            $stmt = $pdo->prepare("SELECT id, username, password_hash, role, totp_secret, totp_enabled FROM admin_users WHERE username = 'admin' LIMIT 1");
            $stmt->execute();
            $user = $stmt->fetch();
        }

        $isValid = false;
        if ($user && !empty($user['password_hash'])) {
            $isValid = password_verify($password, $user['password_hash']);
        }

        if (!$isValid) {
            // Delay intencional para mitigar timing attacks e ataques de força bruta
            usleep(250000); // 250ms
            jsonResponse(['error' => true, 'message' => 'Usuário ou senha incorretos.'], 401);
        }

        // Validação Estrita de 2FA (TOTP) se estiver ativado para a conta
        $hasTotp = !empty($user['totp_enabled']) && !empty($user['totp_secret']);
        $totpCode = trim($inputData['totp_code'] ?? '');

        if ($hasTotp) {
            if (empty($totpCode)) {
                jsonResponse([
                    'requires_2fa' => true,
                    'message' => 'Código de verificação em duas etapas (2FA) necessário.'
                ], 200);
            }
            if (!verifyTotp($user['totp_secret'], $totpCode)) {
                usleep(250000);
                jsonResponse(['error' => true, 'message' => 'Código 2FA incorreto ou expirado.'], 401);
            }
        }

        $userId = (int)$user['id'];
        $finalUsername = $user['username'];
        $userRole = !empty($user['role']) ? $user['role'] : 'admin';

        // Se a senha foi verificada com sucesso via BCRYPT, gera token JWT assinado criptograficamente com a role
        $token = generateToken($userId, $finalUsername, $userRole);

        jsonResponse([
            'success' => true,
            'message' => 'Login realizado com sucesso.',
            'token' => $token,
            'username' => $finalUsername,
            'role' => $userRole
        ]);
        break;

    case 'verify':
        $userData = requireAdmin(true); // Permite admin e viewer verificarem sessão
        jsonResponse([
            'success' => true,
            'valid' => true,
            'username' => $userData['user'],
            'role' => $userData['role'] ?? 'admin'
        ]);
        break;

    case 'get_2fa_status':
        $userData = requireAdmin(true);
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("SELECT totp_enabled FROM admin_users WHERE id = ? LIMIT 1");
        $stmt->execute([$userData['uid']]);
        $u = $stmt->fetch();
        jsonResponse([
            'success' => true,
            'enabled' => !empty($u['totp_enabled'])
        ]);
        break;

    case 'setup_2fa':
        $userData = requireAdmin(false); // Apenas admin pleno pode configurar 2FA
        $secret = generateBase32Secret(16);
        $otpauthUrl = "otpauth://totp/VocePodeTudo:" . urlencode($userData['user']) . "?secret={$secret}&issuer=VocePodeTudo";
        jsonResponse([
            'success' => true,
            'secret' => $secret,
            'otpauth_url' => $otpauthUrl
        ]);
        break;

    case 'enable_2fa':
        if ($method !== 'POST') {
            jsonResponse(['error' => true, 'message' => 'Método não permitido.'], 405);
        }
        $userData = requireAdmin(false);
        $secret = trim($inputData['secret'] ?? '');
        $code = trim($inputData['code'] ?? '');
        if (empty($secret) || empty($code)) {
            jsonResponse(['error' => true, 'message' => 'Chave secreta e código são obrigatórios.'], 400);
        }
        if (!verifyTotp($secret, $code)) {
            jsonResponse(['error' => true, 'message' => 'Código 2FA incorreto. Verifique o horário do seu celular.'], 400);
        }
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("UPDATE admin_users SET totp_secret = ?, totp_enabled = 1 WHERE id = ?");
        $stmt->execute([$secret, $userData['uid']]);
        jsonResponse(['success' => true, 'message' => 'Autenticação em duas etapas ativada com sucesso!']);
        break;

    case 'disable_2fa':
        if ($method !== 'POST') {
            jsonResponse(['error' => true, 'message' => 'Método não permitido.'], 405);
        }
        $userData = requireAdmin(false);
        $password = trim($inputData['password'] ?? '');
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("SELECT password_hash FROM admin_users WHERE id = ? LIMIT 1");
        $stmt->execute([$userData['uid']]);
        $u = $stmt->fetch();
        if (!$u || !password_verify($password, $u['password_hash'])) {
            jsonResponse(['error' => true, 'message' => 'Senha incorreta para desativar 2FA.'], 401);
        }
        $stmt = $pdo->prepare("UPDATE admin_users SET totp_secret = NULL, totp_enabled = 0 WHERE id = ?");
        $stmt->execute([$userData['uid']]);
        jsonResponse(['success' => true, 'message' => 'Autenticação em duas etapas desativada com sucesso.']);
        break;

    case 'change_password':
        if ($method !== 'POST') {
            jsonResponse(['error' => true, 'message' => 'Método não permitido. Utilize POST.'], 405);
        }
        $userData = requireAdmin(false); // Apenas admin pleno pode alterar senha
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
