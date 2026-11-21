<?php
/**
 * api/audit_logs.php - Central de Logs de Auditoria & Rastreabilidade de Segurança
 * Você Pode Tudo — Plataforma Oficial
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

$auth = requireAdmin(true);

$cacheAuditFile = __DIR__ . '/cache_audit_logs.json';

/**
 * Garante existência da tabela MySQL para auditoria
 */
function ensureAuditLogsTable(PDO $pdo): void {
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS `admin_audit_logs` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `admin_username` VARCHAR(100) NOT NULL,
            `action` VARCHAR(100) NOT NULL,
            `details` TEXT NULL,
            `ip_address` VARCHAR(45) NULL,
            `user_agent` VARCHAR(255) NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX `idx_admin_username` (`admin_username`),
            INDEX `idx_action` (`action`),
            INDEX `idx_created_at` (`created_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    } catch (\Throwable $t) {
        error_log("[Audit Table Error] " . $t->getMessage());
    }
}

/**
 * Registra uma ação de auditoria (MySQL com fallback para cache JSON)
 */
function recordAuditLog(string $username, string $action, string $details = ''): bool {
    global $cacheAuditFile;
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $ua = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255);

    $pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;
    if ($pdo instanceof PDO) {
        try {
            ensureAuditLogsTable($pdo);
            $stmt = $pdo->prepare("INSERT INTO `admin_audit_logs` (`admin_username`, `action`, `details`, `ip_address`, `user_agent`)
                                   VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$username, $action, $details, $ip, $ua]);
            return true;
        } catch (\Throwable $t) {
            error_log("[Audit Log SQL Error] " . $t->getMessage());
        }
    }

    // Fallback JSON
    $logs = [];
    if (file_exists($cacheAuditFile)) {
        $raw = @file_get_contents($cacheAuditFile);
        if ($raw) $logs = json_decode($raw, true) ?: [];
    }

    $entry = [
        'id' => uniqid('log_'),
        'admin_username' => htmlspecialchars($username, ENT_QUOTES, 'UTF-8'),
        'action' => htmlspecialchars($action, ENT_QUOTES, 'UTF-8'),
        'details' => htmlspecialchars($details, ENT_QUOTES, 'UTF-8'),
        'ip_address' => $ip,
        'user_agent' => $ua,
        'created_at' => date('Y-m-d H:i:s')
    ];

    array_unshift($logs, $entry);
    // Manter no máximo 1000 registros
    if (count($logs) > 1000) {
        $logs = array_slice($logs, 0, 1000);
    }

    @file_put_contents($cacheAuditFile, json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    return true;
}

$action = $_GET['action'] ?? 'list';

// -------------------------------------------------------------
// 1. LISTAR LOGS DE AUDITORIA
// -------------------------------------------------------------
if ($action === 'list') {
    $limit = min(500, max(10, (int) ($_GET['limit'] ?? 100)));
    $search = trim((string) ($_GET['search'] ?? ''));

    $pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;
    $results = [];

    if ($pdo instanceof PDO) {
        try {
            ensureAuditLogsTable($pdo);
            if (!empty($search)) {
                $stmt = $pdo->prepare("SELECT * FROM `admin_audit_logs` 
                                       WHERE `admin_username` LIKE ? OR `action` LIKE ? OR `details` LIKE ? 
                                       ORDER BY `id` DESC LIMIT ?");
                $param = "%$search%";
                $stmt->bindValue(1, $param, PDO::PARAM_STR);
                $stmt->bindValue(2, $param, PDO::PARAM_STR);
                $stmt->bindValue(3, $param, PDO::PARAM_STR);
                $stmt->bindValue(4, $limit, PDO::PARAM_INT);
                $stmt->execute();
            } else {
                $stmt = $pdo->prepare("SELECT * FROM `admin_audit_logs` ORDER BY `id` DESC LIMIT ?");
                $stmt->bindValue(1, $limit, PDO::PARAM_INT);
                $stmt->execute();
            }
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\Throwable $t) {
            error_log("[Audit List Error] " . $t->getMessage());
        }
    }

    // Se MySQL não retornou ou falhou, usar fallback JSON
    if (empty($results) && file_exists($cacheAuditFile)) {
        $raw = @file_get_contents($cacheAuditFile);
        if ($raw) {
            $jsonLogs = json_decode($raw, true) ?: [];
            if (!empty($search)) {
                $searchLower = mb_strtolower($search);
                $results = array_filter($jsonLogs, function($l) use ($searchLower) {
                    return (strpos(mb_strtolower($l['admin_username'] ?? ''), $searchLower) !== false) ||
                           (strpos(mb_strtolower($l['action'] ?? ''), $searchLower) !== false) ||
                           (strpos(mb_strtolower($l['details'] ?? ''), $searchLower) !== false);
                });
            } else {
                $results = $jsonLogs;
            }
            $results = array_slice(array_values($results), 0, $limit);
        }
    }

    jsonResponse([
        'success' => true,
        'total' => count($results),
        'logs' => $results,
        'current_admin' => $auth['username'] ?? 'admin'
    ]);
}

// -------------------------------------------------------------
// 2. EXPORTAR LOGS EM CSV
// -------------------------------------------------------------
if ($action === 'export_csv') {
    $pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;
    $rows = [];

    if ($pdo instanceof PDO) {
        try {
            ensureAuditLogsTable($pdo);
            $stmt = $pdo->query("SELECT * FROM `admin_audit_logs` ORDER BY `id` DESC LIMIT 1000");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\Throwable $t) {}
    }

    if (empty($rows) && file_exists($cacheAuditFile)) {
        $rows = json_decode(@file_get_contents($cacheAuditFile) ?: '[]', true) ?: [];
    }

    $filename = 'audit_logs_vocepodetudo_' . date('Ymd_His') . '.csv';
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Pragma: no-cache');
    header('Expires: 0');

    $output = fopen('php://output', 'w');
    // BOM UTF-8 para Excel
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
    fputcsv($output, ['ID', 'Data/Hora', 'Administrador', 'Ação', 'Detalhes', 'IP']);

    foreach ($rows as $r) {
        fputcsv($output, array_map('sanitizeCsvField', [
            $r['id'] ?? '',
            $r['created_at'] ?? '',
            $r['admin_username'] ?? '',
            $r['action'] ?? '',
            $r['details'] ?? '',
            $r['ip_address'] ?? ''
        ]));
    }
    fclose($output);
    exit;
}

// -------------------------------------------------------------
// 3. REGISTRAR LOG MANUAL OU DISPARADO PELO FRONTEND
// -------------------------------------------------------------
if ($action === 'record' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $act = trim((string) ($input['action_name'] ?? ''));
    $det = trim((string) ($input['details'] ?? ''));

    if (empty($act)) {
        jsonResponse(['success' => false, 'error' => 'Ação não informada.'], 400);
    }

    recordAuditLog($auth['username'] ?? 'admin', $act, $det);
    jsonResponse(['success' => true, 'message' => 'Log registrado com sucesso.']);
}

jsonResponse(['success' => false, 'error' => 'Ação desconhecida.'], 400);
