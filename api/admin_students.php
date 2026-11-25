<?php
/**
 * api/admin_students.php - CRM e Gestão de Alunos para Painel Administrativo
 * Você Pode Tudo — Plataforma Oficial
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = ['https://vocepodetudo.com', 'https://www.vocepodetudo.com', 'http://localhost:3000', 'http://localhost:3333', 'http://localhost:3456'];
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: https://vocepodetudo.com");
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Autenticação Obrigatória de Administrador (Leitura permitida para viewer)
$auth = requireAdmin(true);

$action = $_GET['action'] ?? 'list';
$pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;

// Garante coluna is_active na tabela students se MySQL conectado
if ($pdo) {
    try {
        $colCheck = $pdo->query("SHOW COLUMNS FROM `students` LIKE 'is_active'");
        if ($colCheck && $colCheck->rowCount() === 0) {
            $pdo->exec("ALTER TABLE `students` ADD COLUMN `is_active` TINYINT(1) NOT NULL DEFAULT 1 AFTER `password_hash`");
        }
    } catch (Exception $e) {}
}

// -------------------------------------------------------------
// 1. EXPORTAÇÃO CSV DE ALUNOS
// -------------------------------------------------------------
if ($action === 'export_csv') {
    $filename = 'alunos_vocepodetudo_' . date('Ymd_His') . '.csv';
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Pragma: no-cache');
    header('Expires: 0');

    $output = fopen('php://output', 'w');
    // Adiciona UTF-8 BOM para o Microsoft Excel abrir com acentuação correta no Brasil
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

    fputcsv($output, ['ID', 'Nome Completo', 'E-mail', 'Telefone', 'Objetivo Profissional', 'Status', 'Cursos Salvos', 'Testes Vocacionais', 'Data de Cadastro', 'Último Acesso'], ';');

    if ($pdo) {
        try {
            $sql = "
                SELECT s.id, s.name, s.email, s.phone, s.goal, s.is_active, s.created_at, s.last_login_at,
                       COUNT(DISTINCT sc.id) as saved_courses,
                       COUNT(DISTINCT st.id) as tests_count
                FROM students s
                LEFT JOIN student_courses sc ON sc.student_id = s.id
                LEFT JOIN student_career_tests st ON st.student_id = s.id
                GROUP BY s.id
                ORDER BY s.created_at DESC
            ";
            $stmt = $pdo->query($sql);
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                fputcsv($output, array_map('sanitizeCsvField', [
                    $row['id'],
                    $row['name'],
                    $row['email'],
                    $row['phone'] ?? '-',
                    $row['goal'] ?? 'Geral',
                    ($row['is_active'] == 1 ? 'Ativo' : 'Bloqueado'),
                    $row['saved_courses'],
                    $row['tests_count'],
                    date('d/m/Y H:i', strtotime($row['created_at'])),
                    $row['last_login_at'] ? date('d/m/Y H:i', strtotime($row['last_login_at'])) : 'Nunca acessou'
                ]), ';');
            }
        } catch (Exception $e) {}
    } else {
        // Fallback de contingência arquivo JSON
        $cacheFile = __DIR__ . '/cache_students.json';
        if (file_exists($cacheFile)) {
            $data = json_decode(file_get_contents($cacheFile), true);
            if (!empty($data['students'])) {
                foreach ($data['students'] as $s) {
                    fputcsv($output, array_map('sanitizeCsvField', [
                        $s['id'],
                        $s['name'],
                        $s['email'],
                        $s['phone'] ?? '-',
                        $s['goal'] ?? 'Geral',
                        'Ativo',
                        0,
                        0,
                        $s['created_at'] ?? date('d/m/Y H:i'),
                        '-'
                    ]), ';');
                }
            }
        }
    }
    fclose($output);
    exit;
}

// -------------------------------------------------------------
// 2. ALTERAR STATUS (BLOQUEAR / ATIVAR ALUNO)
// -------------------------------------------------------------
if ($action === 'toggle_status' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json; charset=utf-8');
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);
    $studentId = (int) ($payload['id'] ?? 0);
    $isActive = isset($payload['is_active']) ? ((int) $payload['is_active'] ? 1 : 0) : 1;

    if ($studentId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'ID de aluno inválido.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($pdo) {
        try {
            $stmt = $pdo->prepare("UPDATE `students` SET `is_active` = ? WHERE `id` = ?");
            $stmt->execute([$isActive, $studentId]);
            echo json_encode(['success' => true, 'message' => 'Status do aluno atualizado com sucesso!', 'is_active' => $isActive], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            error_log('[admin_students] Erro SQL: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Falha interna ao atualizar status do aluno.'], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    echo json_encode(['success' => true, 'message' => 'Simulação de alteração concluída.', 'is_active' => $isActive], JSON_UNESCAPED_UNICODE);
    exit;
}

// -------------------------------------------------------------
// 3. LISTAGEM COM BUSCA E FILTROS DE ALUNOS
// -------------------------------------------------------------
header('Content-Type: application/json; charset=utf-8');

$search = trim($_GET['search'] ?? '');
$filterStatus = $_GET['status'] ?? 'all'; // 'all', 'active', 'blocked'
$page = max(1, (int) ($_GET['page'] ?? 1));
$limit = min(100, max(10, (int) ($_GET['limit'] ?? 25)));
$offset = ($page - 1) * $limit;

$students = [];
$totalCount = 0;

if ($pdo) {
    try {
        $where = ["1=1"];
        $params = [];

        if ($search !== '') {
            $where[] = "(s.name LIKE ? OR s.email LIKE ? OR s.phone LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        if ($filterStatus === 'active') {
            $where[] = "s.is_active = 1";
        } elseif ($filterStatus === 'blocked') {
            $where[] = "s.is_active = 0";
        }

        $whereClause = implode(' AND ', $where);

        // Contagem Total
        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM `students` s WHERE $whereClause");
        $countStmt->execute($params);
        $totalCount = (int) $countStmt->fetchColumn();

        // Dados com paginação
        $sql = "
            SELECT s.id, s.name, s.email, s.phone, s.goal, s.is_active, s.created_at, s.last_login_at, s.avatar_color,
                   COUNT(DISTINCT sc.id) as saved_courses_count,
                   COUNT(DISTINCT st.id) as tests_count
            FROM `students` s
            LEFT JOIN `student_courses` sc ON sc.student_id = s.id
            LEFT JOIN `student_career_tests` st ON st.student_id = s.id
            WHERE $whereClause
            GROUP BY s.id
            ORDER BY s.created_at DESC
            LIMIT $limit OFFSET $offset
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    } catch (Exception $e) {
        $errorMsg = $e->getMessage();
    }
}

// Se não houver banco ou lista vazia, checa arquivo de contingência
if (empty($students) && file_exists(__DIR__ . '/cache_students.json')) {
    $data = json_decode(file_get_contents(__DIR__ . '/cache_students.json'), true);
    if (!empty($data['students'])) {
        $totalCount = count($data['students']);
        $students = array_slice($data['students'], $offset, $limit);
    }
}

echo json_encode([
    'success' => true,
    'total' => $totalCount,
    'page' => $page,
    'limit' => $limit,
    'students' => $students
], JSON_UNESCAPED_UNICODE);
