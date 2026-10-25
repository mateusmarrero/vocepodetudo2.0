<?php
/**
 * Diagnóstico & Teste de Conexão MySQL em Tempo Real
 * Portal Você Pode Tudo — ServerByte / StackCP
 */

header('Content-Type: text/html; charset=UTF-8');

$defaultHost = 'sdb-73.hosting.stackcp.net';
$defaultDb   = 'voce_podetudo-35303633ebd7';
$defaultUser = 'voce_podetudo';
$defaultPass = 'Rx178gpo2@1985!';

// Ler do formulário se houver teste manual
$host = $_POST['host'] ?? $defaultHost;
$db   = $_POST['db']   ?? $defaultDb;
$user = $_POST['user'] ?? $defaultUser;
$pass = $_POST['pass'] ?? $defaultPass;

$result = null;
$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' || isset($_GET['auto'])) {
    try {
        $dsn = "mysql:host={$host};dbname={$db};charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5
        ];
        $pdo = new PDO($dsn, $user, $pass, $options);
        $result = "✓ CONEXÃO BEM-SUCEDIDA com o MySQL na ServerByte! O servidor e as credenciais estão 100% corretos.";
    } catch (PDOException $e) {
        $code = $e->getCode();
        $msg = $e->getMessage();
        $error = "Erro [{$code}]: {$msg}";

        if (strpos($msg, '1045') !== false || strpos($msg, 'Access denied') !== false) {
            $errorHelp = "<strong>Causa:</strong> Senha ou usuário rejeitado pelo MySQL. Significa que a senha digitada aqui não é a mesma que foi salva no campo 'New password' do painel da ServerByte/StackCP.";
        } elseif (strpos($msg, '2002') !== false || strpos($msg, 'Connection timed out') !== false || strpos($msg, 'No such host') !== false) {
            $errorHelp = "<strong>Causa:</strong> O servidor <code>{$host}</code> não respondeu. Tente trocar o Host para <code>localhost</code> ou verificar se há bloqueio de firewall.";
        } elseif (strpos($msg, '1049') !== false || strpos($msg, 'Unknown database') !== false) {
            $errorHelp = "<strong>Causa:</strong> O banco de dados <code>{$db}</code> não foi encontrado.";
        } else {
            $errorHelp = "<strong>Detalhe:</strong> Verifique as credenciais no painel.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Diagnóstico de Conexão MySQL — Você Pode Tudo</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f5f9; padding: 30px 15px; color: #0f172a; }
    .card { max-width: 620px; margin: 0 auto; background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 2px solid #cbd5e1; }
    h1 { font-size: 20px; color: #002776; margin-top: 0; }
    .status-box { padding: 16px; border-radius: 12px; margin: 20px 0; font-size: 14px; line-height: 1.5; }
    .status-success { background: #dcfce7; border: 2px solid #22c55e; color: #15803d; font-weight: bold; }
    .status-error { background: #fee2e2; border: 2px solid #ef4444; color: #b91c1c; }
    .field { margin-bottom: 14px; }
    label { display: block; font-size: 12px; font-weight: bold; color: #334155; margin-bottom: 4px; }
    input { width: 100%; padding: 10px 12px; border-radius: 8px; border: 2px solid #cbd5e1; font-size: 14px; box-sizing: border-box; }
    input:focus { outline: none; border-color: #009639; }
    button { background: #009639; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: bold; font-size: 14px; cursor: pointer; width: 100%; }
    button:hover { background: #00702a; }
    .btn-setup { display: inline-block; background: #002776; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🔧 Teste & Diagnóstico de Conexão MySQL</h1>
    <p style="font-size: 13px; color: #64748b; margin-bottom: 20px;">
      Teste a conexão em tempo real para descobrir o motivo exato da falha.
    </p>

    <?php if ($result): ?>
      <div class="status-box status-success">
        <?= $result ?><br><br>
        <a href="setup.php" class="btn-setup">Executar o Instalador Automático Agora →</a>
      </div>
    <?php elseif ($error): ?>
      <div class="status-box status-error">
        <strong>❌ Falha na Conexão:</strong><br>
        <code><?= htmlspecialchars($error) ?></code><br><br>
        <?= $errorHelp ?>
      </div>
    <?php endif; ?>

    <form method="POST">
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
      <button type="submit">Testar Conexão Agora ➔</button>
    </form>
  </div>
</body>
</html>
