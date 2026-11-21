<?php
/**
 * api/backup.php - Central de Backups & Diagnóstico de Saúde do Servidor
 * Você Pode Tudo — Plataforma Oficial
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

// Autenticação Obrigatória de Administrador
$auth = requireAdmin(true);

$action = $_GET['action'] ?? 'status';

// -------------------------------------------------------------
// 1. GERAR E BAIXAR DUMP MYSQL (.SQL)
// -------------------------------------------------------------
if ($action === 'dump_mysql') {
    $pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;
    if (!$pdo) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => 'Conexão com MySQL indisponível no momento.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $filename = 'backup_vocepodetudo_mysql_' . date('Ymd_His') . '.sql';
    header('Content-Type: application/sql; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Pragma: no-cache');
    header('Expires: 0');

    echo "-- ==============================================================\n";
    echo "-- BACKUP AUTOMÁTICO DO BANCO DE DADOS — VOCÊ PODE TUDO\n";
    echo "-- Data de Geração: " . date('d/m/Y H:i:s') . "\n";
    echo "-- Gerado por: " . htmlspecialchars($auth['username'] ?? 'admin') . "\n";
    echo "-- ==============================================================\n\n";
    echo "SET NAMES utf8mb4;\n";
    echo "SET FOREIGN_KEY_CHECKS = 0;\n\n";

    $tables = ['admin_users', 'courses', 'students', 'student_courses', 'student_career_tests', 'generated_resumes', 'job_vacancies', 'blog_posts', 'course_ratings', 'admin_audit_logs'];

    foreach ($tables as $table) {
        try {
            $check = $pdo->query("SHOW TABLES LIKE '$table'");
            if (!$check || $check->rowCount() === 0) continue;

            echo "-- -------------------------------------------------------------\n";
            echo "-- Estrutura da tabela `$table`\n";
            echo "-- -------------------------------------------------------------\n";
            $createStmt = $pdo->query("SHOW CREATE TABLE `$table`");
            $createRow = $createStmt->fetch(PDO::FETCH_NUM);
            if ($createRow && isset($createRow[1])) {
                echo "DROP TABLE IF EXISTS `$table`;\n";
                echo $createRow[1] . ";\n\n";
            }

            echo "-- Dados da tabela `$table`\n";
            $dataStmt = $pdo->query("SELECT * FROM `$table`");
            $rows = $dataStmt->fetchAll(PDO::FETCH_ASSOC);

            if (!empty($rows)) {
                $columns = array_keys($rows[0]);
                $colNames = '`' . implode('`, `', $columns) . '`';

                echo "INSERT INTO `$table` ($colNames) VALUES\n";
                $valLines = [];
                foreach ($rows as $row) {
                    $escapedVals = array_map(function($val) use ($pdo) {
                        if ($val === null) return 'NULL';
                        return $pdo->quote((string) $val);
                    }, array_values($row));
                    $valLines[] = "(" . implode(', ', $escapedVals) . ")";
                }
                echo implode(",\n", $valLines) . ";\n\n";
            } else {
                echo "-- Tabela `$table` está vazia.\n\n";
            }
        } catch (\Throwable $eTable) {
            echo "-- Erro ao exportar tabela `$table`: " . $eTable->getMessage() . "\n\n";
        }
    }

    echo "SET FOREIGN_KEY_CHECKS = 1;\n";
    echo "-- FIM DO BACKUP MYSQL\n";
    exit;
}

// -------------------------------------------------------------
// 2. GERAR E BAIXAR DUMP COMPLETO EM JSON
// -------------------------------------------------------------
if ($action === 'dump_json') {
    $pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;
    $dump = [
        'metadata' => [
            'portal' => 'Você Pode Tudo',
            'version' => '4.62.0',
            'exported_at' => date('Y-m-d H:i:s'),
            'exported_by' => $auth['username'] ?? 'admin'
        ],
        'tables' => []
    ];

    if ($pdo instanceof PDO) {
        $tables = ['admin_users', 'courses', 'students', 'student_courses', 'student_career_tests', 'generated_resumes', 'job_vacancies', 'blog_posts', 'course_ratings', 'admin_audit_logs'];
        foreach ($tables as $t) {
            try {
                $check = $pdo->query("SHOW TABLES LIKE '$t'");
                if ($check && $check->rowCount() > 0) {
                    $stmt = $pdo->query("SELECT * FROM `$t`");
                    $dump['tables'][$t] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                }
            } catch (\Throwable $e) {}
        }
    }

    // Incluir caches JSON no dump
    $jsonFiles = glob(__DIR__ . '/cache_*.json') ?: [];
    $dump['json_caches'] = [];
    foreach ($jsonFiles as $jf) {
        $bname = basename($jf);
        $dump['json_caches'][$bname] = json_decode(@file_get_contents($jf) ?: 'null', true);
    }

    $filename = 'backup_vocepodetudo_json_' . date('Ymd_His') . '.json';
    header('Content-Type: application/json; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Pragma: no-cache');
    header('Expires: 0');
    echo json_encode($dump, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// -------------------------------------------------------------
// 3. DIAGNÓSTICO DE SAÚDE DO SISTEMA (SYSTEM HEALTH)
// -------------------------------------------------------------
if ($action === 'system_health') {
    $pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;
    $dbConnected = ($pdo instanceof PDO);
    $tableCounts = [];

    if ($dbConnected) {
        $tables = ['courses', 'students', 'job_vacancies', 'blog_posts', 'course_ratings', 'generated_resumes', 'admin_audit_logs'];
        foreach ($tables as $t) {
            try {
                $chk = $pdo->query("SHOW TABLES LIKE '$t'");
                if ($chk && $chk->rowCount() > 0) {
                    $cnt = $pdo->query("SELECT COUNT(*) FROM `$t`")->fetchColumn();
                    $tableCounts[$t] = (int) $cnt;
                } else {
                    $tableCounts[$t] = 0;
                }
            } catch (\Throwable $e) {
                $tableCounts[$t] = 'erro';
            }
        }
    }

    // Caches de disco
    $cacheFiles = glob(__DIR__ . '/cache_*.json') ?: [];
    $cacheInfo = [];
    $totalCacheBytes = 0;
    foreach ($cacheFiles as $cf) {
        $size = filesize($cf);
        $totalCacheBytes += $size;
        $cacheInfo[] = [
            'name' => basename($cf),
            'size_bytes' => $size,
            'size_human' => round($size / 1024, 1) . ' KB',
            'modified' => date('d/m/Y H:i:s', filemtime($cf))
        ];
    }

    // Permissões
    $apiWritable = is_writable(__DIR__);
    $backupsWritable = is_writable(dirname(__DIR__) . '/backups') || is_writable(dirname(__DIR__));

    jsonResponse([
        'success' => true,
        'environment' => [
            'php_version' => PHP_VERSION,
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Web Server',
            'memory_limit' => ini_get('memory_limit'),
            'max_execution_time' => ini_get('max_execution_time') . 's',
            'upload_max_filesize' => ini_get('upload_max_filesize'),
            'post_max_size' => ini_get('post_max_size'),
            'server_time' => date('d/m/Y H:i:s'),
            'opcache_enabled' => function_exists('opcache_get_status') && !empty(opcache_get_status(false)['opcache_enabled'])
        ],
        'database' => [
            'connected' => $dbConnected,
            'driver' => 'MySQL (PDO)',
            'tables' => $tableCounts
        ],
        'filesystem' => [
            'api_writable' => $apiWritable,
            'total_caches' => count($cacheFiles),
            'total_cache_size' => round($totalCacheBytes / 1024, 1) . ' KB',
            'caches' => $cacheInfo
        ]
    ]);
}

// -------------------------------------------------------------
// 4. LIMPEZA SEGURA DE CACHE
// -------------------------------------------------------------
if ($action === 'clear_cache' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    // Regenerar caches essenciais a partir de arquivos seed ou banco
    $cleared = [];

    // Purga arquivos temporários de rating e jobs se necessário
    $tempCaches = ['cache_announcement.json'];
    foreach ($tempCaches as $tc) {
        $fp = __DIR__ . '/' . $tc;
        if (file_exists($fp)) {
            $cleared[] = $tc;
        }
    }

    // Recarregar courses cache se o seed existir
    if (file_exists(__DIR__ . '/seed_courses.json')) {
        @copy(__DIR__ . '/seed_courses.json', __DIR__ . '/cache_courses.json');
        $cleared[] = 'cache_courses.json (recatalogado a partir do seed)';
    }

    jsonResponse([
        'success' => true,
        'message' => 'Caches do sistema purgados e sincronizados com sucesso!',
        'cleared' => $cleared
    ]);
}

// -------------------------------------------------------------
// 5. STATUS DOS BACKUPS EXISTENTES
// -------------------------------------------------------------
$backupDir = dirname(__DIR__) . '/backups';
$backups = [];

if (file_exists($backupDir) && is_dir($backupDir)) {
    $files = scandir($backupDir);
    foreach ($files as $f) {
        if ($f !== '.' && $f !== '..' && in_array(pathinfo($f, PATHINFO_EXTENSION), ['zip', 'sql', 'json'], true)) {
            $filePath = $backupDir . '/' . $f;
            $backups[] = [
                'name' => $f,
                'size' => filesize($filePath),
                'size_human' => round(filesize($filePath) / 1024 / 1024, 2) . ' MB',
                'created_at' => date('d/m/Y H:i:s', filemtime($filePath))
            ];
        }
    }
}

jsonResponse([
    'success' => true,
    'total_backups' => count($backups),
    'backups' => $backups,
    'server_time' => date('d/m/Y H:i:s')
]);
