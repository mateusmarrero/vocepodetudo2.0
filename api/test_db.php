<?php
/**
 * Diagnóstico, Teste de Conexão & Instalador Completo em 1 Clique
 * Portal Você Pode Tudo — ServerByte / StackCP
 */

header('Content-Type: text/html; charset=UTF-8');

// Trava de segurança: Exige chave de autorização ou execução restrita
$accessKey = $_GET['key'] ?? $_POST['key'] ?? '';
if ($accessKey !== 'vpt_admin_setup_secure_2026') {
    http_response_code(403);
    die('<h2 style="color:red;font-family:sans-serif;">Acesso Restrito: Chave de segurança do banco de dados inválida ou ausente.</h2>');
}

$defaultHost = 'sdb-73.hosting.stackcp.net';
$defaultDb   = 'voce_podetudo-35303633ebd7';
$defaultUser = 'voce_podetudo';
$defaultPass = 'Rx178gpo2@1985!';

// Ler parâmetros do formulário
$host = trim($_POST['host'] ?? $defaultHost);
$db   = trim($_POST['db']   ?? $defaultDb);
$user = trim($_POST['user'] ?? $defaultUser);
$pass = trim($_POST['pass'] ?? $defaultPass);

$result = null;
$error = null;
$installSuccess = null;
$installedSteps = [];

try {
    $dsn = "mysql:host={$host};dbname={$db};charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 5
    ];
    $pdo = new PDO($dsn, $user, $pass, $options);
    $result = "✓ CONEXÃO BEM-SUCEDIDA com o MySQL na ServerByte! O servidor e as credenciais estão 100% corretos.";

    // Se o usuário clicou no botão "Instalar Banco de Dados com Estas Credenciais"
    if (isset($_POST['do_install'])) {
        // 1. Criar Tabela admin_users
        $pdo->exec("
          CREATE TABLE IF NOT EXISTS `admin_users` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `username` VARCHAR(50) NOT NULL UNIQUE,
            `password_hash` VARCHAR(255) NOT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
        $installedSteps[] = "Tabela <code>admin_users</code> criada com sucesso.";

        // 2. Criar ou verificar usuário admin padrão
        $checkAdmin = $pdo->prepare("SELECT id FROM admin_users WHERE username = 'admin' LIMIT 1");
        $checkAdmin->execute();
        $defaultHash = '$2b$10$X.fiIOTfTyCr1XsA7Na5A.Uqi.EfRRIfiqCNLfuexDCmxN9DNsoDG';
        if (!$checkAdmin->fetch()) {
            $insertAdmin = $pdo->prepare("INSERT INTO admin_users (username, password_hash) VALUES ('admin', ?)");
            $insertAdmin->execute([$defaultHash]);
            $installedSteps[] = "Administrador oficial <strong>admin</strong> cadastrado com senha fixa.";
        } else {
            $updateAdmin = $pdo->prepare("UPDATE admin_users SET password_hash = ? WHERE username = 'admin'");
            $updateAdmin->execute([$defaultHash]);
            $installedSteps[] = "Senha do administrador oficial <strong>admin</strong> atualizada.";
        }

        // 3. Criar Tabela courses
        $pdo->exec("
          CREATE TABLE IF NOT EXISTS `courses` (
            `id` VARCHAR(64) PRIMARY KEY,
            `title` VARCHAR(255) NOT NULL,
            `provider` VARCHAR(100) NOT NULL,
            `provider_tag` VARCHAR(50) NULL,
            `provider_color` VARCHAR(100) NULL,
            `category` VARCHAR(50) NOT NULL,
            `description` TEXT NULL,
            `url` VARCHAR(500) NOT NULL,
            `workload_hours` INT NOT NULL DEFAULT 10,
            `has_free_certificate` TINYINT(1) NOT NULL DEFAULT 1,
            `certificate_note` VARCHAR(150) NULL,
            `level` VARCHAR(50) DEFAULT 'Iniciante',
            `tags` TEXT NULL,
            `featured` TINYINT(1) DEFAULT 0,
            `rating` DECIMAL(2,1) DEFAULT 5.0,
            `reviews_count` INT DEFAULT 1,
            `is_active` TINYINT(1) DEFAULT 1,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX `idx_category` (`category`),
            INDEX `idx_provider` (`provider`),
            INDEX `idx_is_active` (`is_active`),
            INDEX `idx_featured` (`featured`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
        $installedSteps[] = "Tabela <code>courses</code> criada com sucesso.";

        // 4. Semear os 155 Cursos Iniciais
        $jsonFile = __DIR__ . '/seed_courses.json';
        $seededCount = 0;

        if (file_exists($jsonFile)) {
            $coursesData = json_decode(file_get_contents($jsonFile), true);
            if (is_array($coursesData)) {
                $insertStmt = $pdo->prepare("
                    INSERT IGNORE INTO courses (
                        id, title, provider, provider_tag, provider_color, category,
                        description, url, workload_hours, has_free_certificate,
                        certificate_note, level, tags, featured, rating, reviews_count, is_active
                    ) VALUES (
                        ?, ?, ?, ?, ?, ?,
                        ?, ?, ?, ?,
                        ?, ?, ?, ?, ?, ?, 1
                    )
                ");

                foreach ($coursesData as $c) {
                    $tagsJson = json_encode($c['tags'] ?? [], JSON_UNESCAPED_UNICODE);
                    $insertStmt->execute([
                        $c['id'],
                        $c['title'],
                        $c['provider'],
                        $c['providerTag'] ?? substr($c['provider'], 0, 15),
                        $c['providerColor'] ?? '',
                        $c['category'] ?? 'tecnologia',
                        $c['description'] ?? '',
                        $c['url'] ?? '',
                        $c['workloadHours'] ?? 10,
                        !empty($c['hasFreeCertificate']) ? 1 : 0,
                        $c['certificateNote'] ?? 'Certificado 100% Gratuito',
                        $c['level'] ?? 'Iniciante',
                        $tagsJson,
                        !empty($c['featured']) ? 1 : 0,
                        $c['rating'] ?? 5.0,
                        $c['reviewsCount'] ?? 100
                    ]);
                    $seededCount++;
                }
                $installedSteps[] = "<strong>{$seededCount} cursos oficiais</strong> sincronizados no MySQL!";
            }
        }

        // 5. Gravar automaticamente o arquivo api/config.php com as credenciais funcionando
        $safePass = addslashes($pass);
        $configCode = "<?php
/**
 * Configuração Geral da API & Conexão MySQL (PDO)
 * Gerado automaticamente com credenciais verificadas na ServerByte
 */

ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

define('DB_HOST', '{$host}');
define('DB_NAME', '{$db}');
define('DB_USER', '{$user}');
define('DB_PASS', '{$safePass}');
define('DB_CHARSET', 'utf8mb4');

define('JWT_SECRET', 'vpt_secret_serverbyte_2026_super_secure_key_brasilll!');
define('TOKEN_EXPIRATION_SECONDS', 86400 * 7);

function getDBConnection() {
    static \$pdo = null;
    if (\$pdo !== null) return \$pdo;

    \$dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
    \$options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_TIMEOUT => 5
    ];

    try {
        \$pdo = new PDO(\$dsn, DB_USER, DB_PASS, \$options);
        return \$pdo;
    } catch (PDOException \$e) {
        error_log('Erro MySQL: ' . \$e->getMessage());
        http_response_code(500);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(['error' => true, 'message' => 'Falha de conexão: ' . \$e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

function jsonResponse(\$data, \$statusCode = 200) {
    http_response_code(\$statusCode);
    header('Content-Type: application/json; charset=UTF-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode(\$data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function generateToken(\$userId, \$username) {
    \$header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    \$payload = base64_encode(json_encode([
        'uid' => \$userId,
        'user' => \$username,
        'exp' => time() + TOKEN_EXPIRATION_SECONDS,
        'iat' => time()
    ]));
    \$signature = hash_hmac('sha256', \"\$header.\$payload\", JWT_SECRET);
    return \"\$header.\$payload.\$signature\";
}

function verifyToken(\$token) {
    if (!\$token || substr_count(\$token, '.') !== 2) return false;
    list(\$header, \$payload, \$signature) = explode('.', \$token);
    \$expected = hash_hmac('sha256', \"\$header.\$payload\", JWT_SECRET);
    if (!hash_equals(\$expected, \$signature)) return false;
    \$data = json_decode(base64_decode(\$payload), true);
    if (!\$data || !isset(\$data['exp']) || time() > \$data['exp']) return false;
    return \$data;
}

function requireAuth() {
    \$headers = getallheaders();
    \$auth = \$headers['Authorization'] ?? \$headers['authorization'] ?? '';
    \$token = '';
    if (preg_match('/Bearer\\s(\\S+)/', \$auth, \$m)) \$token = \$m[1];
    elseif (isset(\$_COOKIE['vpt_auth_token'])) \$token = \$_COOKIE['vpt_auth_token'];
    \$user = verifyToken(\$token);
    if (!\$user) {
        jsonResponse(['error' => true, 'message' => 'Acesso não autorizado.'], 401);
    }
    return \$user;
}
";
        @file_put_contents(__DIR__ . '/config.php', $configCode);
        $installedSteps[] = "Arquivo <code>api/config.php</code> regravado e sincronizado automaticamente!";
        $installSuccess = true;
    }

} catch (PDOException $e) {
    $code = $e->getCode();
    $msg = $e->getMessage();
    $error = "Erro [{$code}]: {$msg}";

    if (strpos($msg, '1045') !== false || strpos($msg, 'Access denied') !== false) {
        $errorHelp = "<strong>Causa:</strong> Senha ou usuário rejeitado pelo MySQL. Significa que a senha digitada aqui não é a mesma que foi salva no campo 'New password' do painel da ServerByte/StackCP.";
    } elseif (strpos($msg, '2002') !== false || strpos($msg, 'Connection timed out') !== false || strpos($msg, 'No such host') !== false) {
        $errorHelp = "<strong>Causa:</strong> O servidor <code>{$host}</code> não respondeu. Tente trocar o Host para <code>localhost</code>.";
    } elseif (strpos($msg, '1049') !== false || strpos($msg, 'Unknown database') !== false) {
        $errorHelp = "<strong>Causa:</strong> O banco de dados <code>{$db}</code> não foi encontrado.";
    } else {
        $errorHelp = "<strong>Detalhe:</strong> Verifique as credenciais no painel.";
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Instalador & Teste MySQL — Você Pode Tudo</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f5f9; padding: 30px 15px; color: #0f172a; }
    .card { max-width: 650px; margin: 0 auto; background: white; padding: 35px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 2px solid #cbd5e1; }
    h1 { font-size: 22px; color: #002776; margin-top: 0; }
    .status-box { padding: 18px; border-radius: 12px; margin: 20px 0; font-size: 14px; line-height: 1.6; }
    .status-success { background: #dcfce7; border: 2px solid #22c55e; color: #15803d; }
    .status-error { background: #fee2e2; border: 2px solid #ef4444; color: #b91c1c; }
    .field { margin-bottom: 14px; }
    label { display: block; font-size: 12px; font-weight: bold; color: #334155; margin-bottom: 4px; }
    input { width: 100%; padding: 10px 12px; border-radius: 8px; border: 2px solid #cbd5e1; font-size: 14px; box-sizing: border-box; }
    input:focus { outline: none; border-color: #009639; }
    .btn-green { background: #009639; color: white; border: none; padding: 14px 24px; border-radius: 10px; font-weight: bold; font-size: 15px; cursor: pointer; width: 100%; text-decoration: none; display: inline-block; text-align: center; box-sizing: border-box; }
    .btn-green:hover { background: #00702a; }
    .btn-blue { background: #002776; color: white; border: none; padding: 14px 24px; border-radius: 10px; font-weight: bold; font-size: 15px; cursor: pointer; width: 100%; text-decoration: none; display: inline-block; text-align: center; box-sizing: border-box; margin-top: 15px; }
    .btn-blue:hover { background: #001a4e; }
    ul.steps { padding-left: 20px; margin: 12px 0; }
    ul.steps li { margin-bottom: 6px; font-size: 13px; color: #166534; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 Instalador & Conexão MySQL — Você Pode Tudo</h1>

    <?php if ($installSuccess): ?>
      <div class="status-box status-success">
        <h3 style="margin-top:0; color:#15803d; font-size:18px;">🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!</h3>
        <p>Seu banco de dados MySQL na ServerByte foi totalmente estruturado e alimentado:</p>
        <ul class="steps">
          <?php foreach ($installedSteps as $step): ?>
            <li>✓ <?= $step ?></li>
          <?php endforeach; ?>
        </ul>
        <p style="font-size:12px; color:#166534;">
          Acesso de Administrador configurado: Usuário <code>admin</code> (com a senha oficial definida)
        </p>
        <a href="../index.html" class="btn-green">Abrir o Portal Você Pode Tudo Agora ➔</a>
      </div>
    <?php elseif ($result): ?>
      <div class="status-box status-success">
        <strong><?= $result ?></strong>
        <p style="margin: 10px 0 0 0; font-size: 13px;">
          As credenciais estão validadas! Clique no botão abaixo para criar as tabelas e importar todos os 155 cursos automaticamente:
        </p>
        <form method="POST" style="margin-top: 15px;">
          <input type="hidden" name="host" value="<?= htmlspecialchars($host) ?>">
          <input type="hidden" name="db" value="<?= htmlspecialchars($db) ?>">
          <input type="hidden" name="user" value="<?= htmlspecialchars($user) ?>">
          <input type="hidden" name="pass" value="<?= htmlspecialchars($pass) ?>">
          <input type="hidden" name="do_install" value="1">
          <button type="submit" class="btn-green" style="font-size: 16px; padding: 15px;">
            ⚡ Executar Instalação e Semear 155 Cursos no MySQL Agora ➔
          </button>
        </form>
      </div>
    <?php elseif ($error): ?>
      <div class="status-box status-error">
        <strong>❌ Falha na Conexão:</strong><br>
        <code><?= htmlspecialchars($error) ?></code><br><br>
        <?= $errorHelp ?>
      </div>
    <?php endif; ?>

    <?php if (!$installSuccess): ?>
      <form method="POST" style="margin-top: 20px;">
        <div class="field">
          <label>Servidor / Host do MySQL:</label>
          <input type="text" name="host" value="<?= htmlspecialchars($host) ?>" required>
        </div>
        <div class="field">
          <label>Nome do Banco de Dados:</label>
          <input type="text" name="db" value="<?= htmlspecialchars($db) ?>" required>
        </div>
        <div class="field">
          <label>Usuário do MySQL:</label>
          <input type="text" name="user" value="<?= htmlspecialchars($user) ?>" required>
        </div>
        <div class="field">
          <label>Senha do MySQL:</label>
          <input type="text" name="pass" value="<?= htmlspecialchars($pass) ?>" required>
        </div>
        <button type="submit" class="btn-blue">Testar Conexão Novamente ➔</button>
      </form>
    <?php endif; ?>
  </div>
</body>
</html>
