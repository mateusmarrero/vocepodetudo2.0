<?php
/**
 * Instalador e Semeador Automático do Banco MySQL
 * Portal Você Pode Tudo — ServerByte
 */

header('Content-Type: text/html; charset=UTF-8');

$host = 'sdb-73.hosting.stackcp.net';
$db   = 'voce_podetudo-35303633ebd7';
$user = 'voce_podetudo';
$pass = 'Rx178gpo2@1985!';

// Trava de segurança: Exige chave de autorização ou execução restrita
$setupKey = $_GET['key'] ?? '';
if ($setupKey !== 'vpt_admin_setup_secure_2026') {
    http_response_code(403);
    die('<h2 style="color:red;font-family:sans-serif;">Acesso Restrito: Chave de segurança inválida ou ausente.</h2>');
}

// Tentar carregar de config.php se existir
if (file_exists(__DIR__ . '/config.php')) {
    @include_once __DIR__ . '/config.php';
    if (defined('DB_HOST')) $host = DB_HOST;
    if (defined('DB_NAME')) $db   = DB_NAME;
    if (defined('DB_USER')) $user = DB_USER;
    if (defined('DB_PASS')) $pass = DB_PASS;
}

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
    $dsn = "mysql:host={$host};dbname={$db};charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 6
    ];
    $pdo = new PDO($dsn, $user, $pass, $options);
    echo "<div class='step success'>✓ Conexão com o MySQL na ServerByte realizada com sucesso!</div>";

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

    // 2. Criar ou atualizar usuário admin oficial (Senha Fixa: Rx178gpo2@1985)
    $defaultHash = '$2b$10$X.fiIOTfTyCr1XsA7Na5A.Uqi.EfRRIfiqCNLfuexDCmxN9DNsoDG';
    $checkAdmin = $pdo->prepare("SELECT id FROM admin_users WHERE username = 'admin' LIMIT 1");
    $checkAdmin->execute();
    if (!$checkAdmin->fetch()) {
        $insertAdmin = $pdo->prepare("INSERT INTO admin_users (username, password_hash) VALUES ('admin', ?)");
        $insertAdmin->execute([$defaultHash]);
        echo "<div class='step success'>✓ Administrador oficial <strong>admin</strong> cadastrado com hash BCRYPT seguro (senha fixa definida).</div>";
    } else {
        $updateAdmin = $pdo->prepare("UPDATE admin_users SET password_hash = ? WHERE username = 'admin'");
        $updateAdmin->execute([$defaultHash]);
        echo "<div class='step success'>✓ Senha do administrador oficial <strong>admin</strong> atualizada no banco de dados.</div>";
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

    // 4. Criar Tabelas da Área do Aluno (Students, Career Tests, Student Courses)
    $pdo->exec("
      CREATE TABLE IF NOT EXISTS `students` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(100) NOT NULL,
        `email` VARCHAR(150) NOT NULL UNIQUE,
        `password_hash` VARCHAR(255) NOT NULL,
        `avatar_color` VARCHAR(20) DEFAULT '#002776',
        `goal` VARCHAR(50) DEFAULT 'primeiro_emprego',
        `device_preference` VARCHAR(20) DEFAULT 'ambos',
        `weekly_hours` VARCHAR(20) DEFAULT '5-10h',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `last_login_at` TIMESTAMP NULL,
        INDEX `idx_email` (`email`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "<div class='step success'>✓ Tabela <code>students</code> (Alunos) criada/verificada.</div>";

    $pdo->exec("
      CREATE TABLE IF NOT EXISTS `student_career_tests` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `student_id` INT NOT NULL,
        `primary_area` VARCHAR(50) NOT NULL,
        `secondary_area` VARCHAR(50) NULL,
        `scores_json` TEXT NOT NULL,
        `recommended_track` VARCHAR(50) NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX `idx_student_test` (`student_id`, `created_at`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "<div class='step success'>✓ Tabela <code>student_career_tests</code> (Histórico Vocacional) criada/verificada.</div>";

    $pdo->exec("
      CREATE TABLE IF NOT EXISTS `student_courses` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `student_id` INT NOT NULL,
        `course_id` VARCHAR(64) NOT NULL,
        `status` ENUM('saved', 'in_progress', 'completed') DEFAULT 'saved',
        `workload_hours` INT DEFAULT 10,
        `started_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `completed_at` TIMESTAMP NULL,
        `certificate_url` VARCHAR(500) NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY `uk_student_course` (`student_id`, `course_id`),
        INDEX `idx_student_status` (`student_id`, `status`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "<div class='step success'>✓ Tabela <code>student_courses</code> (Cursos e Certificados do Aluno) criada/verificada.</div>";

    // 5. Semear os 155 Cursos Iniciais
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
        - Acesso de Administrador: usuário <code>admin</code> (com a sua senha oficial definida)<br>
        - Por questões de segurança, você já pode acessar o site.
      </div>
      <a href='../index.html' class='btn'>Acessar o Portal Você Pode Tudo →</a>
    ";

} catch (Exception $e) {
    echo "<div class='step error'>❌ Erro ao conectar no MySQL: " . htmlspecialchars($e->getMessage()) . "</div>";
    echo "<div class='info-box' style='background:#fef2f2; border-color:#dc2626;'>
            <strong>O que fazer:</strong><br>
            Acesse a ferramenta de teste para testar a conexão diretamente:<br><br>
            <a href='test_db.php' class='btn' style='background:#002776; display:inline-block;'>Abrir Ferramenta de Teste de Conexão ➔</a>
          </div>";
}
?>
  </div>
</body>
</html>
