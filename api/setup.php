<?php
/**
 * Instalador e Semeador Automático do Banco MySQL
 * Portal Você Pode Tudo — ServerByte
 * 
 * Acesse uma única vez pelo navegador: https://seusite.com/api/setup.php
 */

require_once __DIR__ . '/config.php';

header('Content-Type: text/html; charset=UTF-8');

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Instalação do Banco MySQL — Você Pode Tudo</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; padding: 40px 20px; }
    .card { max-width: 650px; margin: 0 auto; background: white; border-radius: 20px; padding: 35px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 2px solid #e2e8f0; }
    h1 { color: #002776; font-size: 24px; margin-top: 0; }
    .step { display: flex; align-items: center; gap: 10px; margin: 15px 0; font-size: 15px; font-weight: 600; }
    .success { color: #009639; }
    .error { color: #dc2626; }
    .info-box { background: #eff6ff; border-left: 4px solid #002776; padding: 15px; border-radius: 8px; margin-top: 25px; font-size: 13px; line-height: 1.6; }
    .btn { display: inline-block; background: #009639; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 Instalador do Banco de Dados — Você Pode Tudo</h1>
    <p>Executando configuração automática das tabelas e importação inicial dos 155 cursos oficiais...</p>

<?php
try {
    $pdo = getDBConnection();
    echo "<div class='step success'>✓ Conexão com o MySQL realizada com sucesso!</div>";

    // 1. Criar Tabela admin_users
    $pdo->exec("
      CREATE TABLE IF NOT EXISTS `admin_users` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `username` VARCHAR(50) NOT NULL UNIQUE,
        `password_hash` VARCHAR(255) NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "<div class='step success'>✓ Tabela <code>admin_users</code> criada/verificada.</div>";

    // 2. Criar ou verificar usuário admin padrão
    $checkAdmin = $pdo->prepare("SELECT id FROM admin_users WHERE username = 'admin' LIMIT 1");
    $checkAdmin->execute();
    if (!$checkAdmin->fetch()) {
        $defaultHash = password_hash('admin123', PASSWORD_BCRYPT);
        $insertAdmin = $pdo->prepare("INSERT INTO admin_users (username, password_hash) VALUES ('admin', ?)");
        $insertAdmin->execute([$defaultHash]);
        echo "<div class='step success'>✓ Administrador inicial <strong>admin</strong> cadastrado com hash BCRYPT seguro (senha: <code>admin123</code>).</div>";
    } else {
        echo "<div class='step success'>✓ Usuário administrador já existe no banco.</div>";
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
    echo "<div class='step success'>✓ Tabela <code>courses</code> criada/verificada.</div>";

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
            echo "<div class='step success'>✓ <strong>{$seededCount} cursos oficiais</strong> sincronizados no MySQL com sucesso!</div>";
        }
    }

    echo "
      <div class='info-box'>
        <strong>Parabéns! Seu banco de dados MySQL está 100% pronto.</strong><br>
        - Acesso de Administrador: usuário <code>admin</code> | senha <code>admin123</code><br>
        - Por questões de segurança, após testar o site, você pode remover ou renomear este arquivo <code>api/setup.php</code>.
      </div>
      <a href='../index.html' class='btn'>Acessar o Portal Você Pode Tudo →</a>
    ";

} catch (Exception $e) {
    echo "<div class='step error'>❌ Erro durante a instalação: " . htmlspecialchars($e->getMessage()) . "</div>";
    echo "<p>Certifique-se de preencher o arquivo <code>api/config.php</code> com os dados de acesso do banco criados no cPanel da ServerByte.</p>";
}
?>
  </div>
</body>
</html>
