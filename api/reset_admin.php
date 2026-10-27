<?php
/**
 * Ferramenta de Redefinição de Senha do Administrador
 * Portal Você Pode Tudo
 */

require_once __DIR__ . '/config.php';

header('Content-Type: text/html; charset=UTF-8');

$pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;
$message = null;
$status = null;

$targetPass = trim($_POST['new_password'] ?? $_GET['pass'] ?? 'Rx178gpo2@1985');

if ($_SERVER['REQUEST_METHOD'] === 'POST' || isset($_GET['pass']) || isset($_GET['reset'])) {
    if (strlen($targetPass) < 6) {
        $message = "A senha deve ter pelo menos 6 caracteres.";
        $status = "error";
    } else {
        $hash = password_hash($targetPass, PASSWORD_BCRYPT);
        if ($pdo) {
            try {
                $check = $pdo->prepare("SELECT id FROM admin_users WHERE username = 'admin' LIMIT 1");
                $check->execute();
                if ($check->fetch()) {
                    $up = $pdo->prepare("UPDATE admin_users SET password_hash = ? WHERE username = 'admin'");
                    $up->execute([$hash]);
                } else {
                    $ins = $pdo->prepare("INSERT INTO admin_users (username, password_hash) VALUES ('admin', ?)");
                    $ins->execute([$hash]);
                }
                $message = "Senha do administrador resetada com sucesso no MySQL para: <strong>" . htmlspecialchars($targetPass) . "</strong>";
                $status = "success";
            } catch (Exception $e) {
                $message = "Erro ao atualizar no MySQL: " . htmlspecialchars($e->getMessage());
                $status = "error";
            }
        } else {
            $message = "Banco de dados em contingência. A senha de fallback oficial ativa é: <strong>" . htmlspecialchars($targetPass) . "</strong>";
            $status = "success";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Resetar Senha do Administrador — Você Pode Tudo</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; padding: 40px 20px; display: flex; justify-content: center; }
    .card { max-width: 500px; width: 100%; background: white; border-radius: 20px; padding: 35px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 2px solid #e2e8f0; }
    h1 { color: #002776; font-size: 20px; margin-top: 0; }
    .alert { padding: 12px 16px; border-radius: 12px; font-size: 13px; font-weight: bold; margin-bottom: 20px; }
    .alert-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
    .alert-error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
    label { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #475569; display: block; margin-bottom: 6px; }
    input { width: 100%; box-sizing: border-box; padding: 12px 14px; border-radius: 12px; border: 2px solid #cbd5e1; font-size: 15px; font-weight: bold; outline: none; margin-bottom: 16px; }
    input:focus { border-color: #002776; }
    .btn { display: block; width: 100%; box-sizing: border-box; background: #009639; color: white; padding: 14px; border-radius: 12px; border: none; font-size: 14px; font-weight: 900; text-transform: uppercase; cursor: pointer; text-align: center; text-decoration: none; }
    .btn:hover { background: #00702a; }
    .btn-secondary { background: #002776; margin-top: 10px; }
    .btn-secondary:hover { background: #001a50; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🔑 Redefinir Senha do Administrador</h1>
    <p style="font-size: 13px; color: #64748b; margin-bottom: 20px;">
      Altere ou restaure imediatamente o acesso ao painel administrativo.
    </p>

    <?php if ($message): ?>
      <div class="alert alert-<?= $status ?>"><?= $message ?></div>
    <?php endif; ?>

    <form method="POST">
      <label for="new_password">Nova Senha do Administrador</label>
      <input type="text" id="new_password" name="new_password" value="Rx178gpo2@1985" required autocomplete="off">
      <button type="submit" class="btn">Salvar Nova Senha Agora</button>
    </form>

    <div style="margin-top: 25px; pt-4; border-top: 1px solid #e2e8f0; text-align: center;">
      <a href="../admin.html" class="btn btn-secondary">Ir para o Painel de Login ➔</a>
    </div>
  </div>
</body>
</html>
