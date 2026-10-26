<?php
/**
 * API da Área do Aluno & Acompanhamento de Desenvolvimento
 * Portal Você Pode Tudo
 * 
 * Funcionalidades:
 * - Cadastro e Login seguro de alunos (BCRYPT + JWT)
 * - Histórico completo de Testes Vocacionais com pontuações
 * - Acompanhamento de Cursos (Salvos, Em Andamento, Concluídos)
 * - Registro de Horas Acumuladas e Links de Certificados
 * - Sincronização automática com dados prévios do visitante
 * - Conformidade com LGPD (exclusão de conta e dados em 1 clique)
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? 'me';
$method = $_SERVER['REQUEST_METHOD'];

// Obter dados da requisição (JSON ou POST/GET)
$inputRaw = file_get_contents('php://input');
$inputJson = json_decode($inputRaw, true);
$input = is_array($inputJson) ? array_merge($_GET, $inputJson) : array_merge($_GET, $_POST);

/**
 * Garante que as tabelas de alunos existem no banco (Auto-cura do schema)
 */
function ensureStudentTables($pdo) {
    static $checked = false;
    if ($checked) return;

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

    $checked = true;
}

try {
    $pdo = getDBConnection();
    ensureStudentTables($pdo);

    switch ($action) {
        // ==========================================
        // 1. CADASTRO DE ALUNO (REGISTRO)
        // ==========================================
        case 'register':
            $name = trim($input['name'] ?? '');
            $email = strtolower(trim($input['email'] ?? ''));
            $password = trim($input['password'] ?? '');

            if (empty($name) || strlen($name) < 2) {
                jsonResponse(['error' => true, 'message' => 'Por favor, informe seu nome completo.'], 400);
            }
            if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                jsonResponse(['error' => true, 'message' => 'Por favor, informe um e-mail válido.'], 400);
            }
            if (empty($password) || strlen($password) < 6) {
                jsonResponse(['error' => true, 'message' => 'A senha deve ter pelo menos 6 caracteres.'], 400);
            }

            // Verificar se o e-mail já existe
            $stmt = $pdo->prepare("SELECT id FROM students WHERE email = ? LIMIT 1");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                jsonResponse(['error' => true, 'message' => 'Este e-mail já está cadastrado. Faça login ou use outro e-mail.'], 409);
            }

            // Cores aleatórias elegantes para o avatar do aluno
            $colors = ['#002776', '#009639', '#6b21a8', '#0369a1', '#b45309', '#be123c'];
            $avatarColor = $colors[array_rand($colors)];

            $hash = password_hash($password, PASSWORD_BCRYPT);
            $goal = trim($input['goal'] ?? 'primeiro_emprego');
            $device = trim($input['device_preference'] ?? 'ambos');
            $hours = trim($input['weekly_hours'] ?? '5-10h');

            $insert = $pdo->prepare("
                INSERT INTO students (name, email, password_hash, avatar_color, goal, device_preference, weekly_hours, last_login_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            $insert->execute([$name, $email, $hash, $avatarColor, $goal, $device, $hours]);
            $studentId = (int) $pdo->lastInsertId();

            // Sincronização Mágica: Se o visitante realizou um teste vocacional prévio, salva na conta!
            if (!empty($input['initial_test']) && is_array($input['initial_test'])) {
                $test = $input['initial_test'];
                $primaryArea = trim($test['primary_area'] ?? 'tecnologia');
                $secondaryArea = trim($test['secondary_area'] ?? '');
                $scoresJson = is_string($test['scores'] ?? null) ? $test['scores'] : json_encode($test['scores'] ?? [], JSON_UNESCAPED_UNICODE);
                $track = trim($test['recommended_track'] ?? '');

                $stmtTest = $pdo->prepare("
                    INSERT INTO student_career_tests (student_id, primary_area, secondary_area, scores_json, recommended_track)
                    VALUES (?, ?, ?, ?, ?)
                ");
                $stmtTest->execute([$studentId, $primaryArea, $secondaryArea, $scoresJson, $track]);
            }

            // Sincronização Mágica: Se o visitante favoritou cursos antes de cadastrar, salva na conta!
            if (!empty($input['initial_courses']) && is_array($input['initial_courses'])) {
                $stmtCourse = $pdo->prepare("
                    INSERT IGNORE INTO student_courses (student_id, course_id, status, workload_hours)
                    VALUES (?, ?, 'saved', ?)
                ");
                foreach ($input['initial_courses'] as $c) {
                    $cId = is_array($c) ? ($c['id'] ?? '') : (string) $c;
                    $wHours = is_array($c) ? (int) ($c['workload_hours'] ?? 10) : 10;
                    if (!empty($cId)) {
                        $stmtCourse->execute([$studentId, $cId, $wHours]);
                    }
                }
            }

            $token = generateStudentToken($studentId, $name, $email);

            jsonResponse([
                'success' => true,
                'message' => 'Conta criada com sucesso! Bem-vindo ao Você Pode Tudo.',
                'token' => $token,
                'student' => [
                    'id' => $studentId,
                    'name' => $name,
                    'email' => $email,
                    'avatar_color' => $avatarColor,
                    'goal' => $goal
                ]
            ]);
            break;

        // ==========================================
        // 2. LOGIN DO ALUNO
        // ==========================================
        case 'login':
            $email = strtolower(trim($input['email'] ?? ''));
            $password = trim($input['password'] ?? '');

            if (empty($email) || empty($password)) {
                jsonResponse(['error' => true, 'message' => 'Informe seu e-mail e senha cadastrados.'], 400);
            }

            $stmt = $pdo->prepare("SELECT id, name, email, password_hash, avatar_color, goal FROM students WHERE email = ? LIMIT 1");
            $stmt->execute([$email]);
            $student = $stmt->fetch();

            if (!$student || !password_verify($password, $student['password_hash'])) {
                usleep(200000); // 200ms anti-bruteforce
                jsonResponse(['error' => true, 'message' => 'E-mail ou senha incorretos.'], 401);
            }

            // Atualizar último login
            $pdo->prepare("UPDATE students SET last_login_at = NOW() WHERE id = ?")->execute([$student['id']]);

            $token = generateStudentToken($student['id'], $student['name'], $student['email']);

            jsonResponse([
                'success' => true,
                'message' => 'Login realizado com sucesso!',
                'token' => $token,
                'student' => [
                    'id' => (int) $student['id'],
                    'name' => $student['name'],
                    'email' => $student['email'],
                    'avatar_color' => $student['avatar_color'] ?? '#002776',
                    'goal' => $student['goal'] ?? 'primeiro_emprego'
                ]
            ]);
            break;

        // ==========================================
        // 3. MEU PERFIL (VERIFICAÇÃO DE SESSÃO)
        // ==========================================
        case 'me':
            $auth = requireStudentAuth();
            $studentId = (int) $auth['sub'];

            $stmt = $pdo->prepare("SELECT id, name, email, avatar_color, goal, device_preference, weekly_hours, created_at FROM students WHERE id = ? LIMIT 1");
            $stmt->execute([$studentId]);
            $student = $stmt->fetch();

            if (!$student) {
                jsonResponse(['error' => true, 'message' => 'Aluno não encontrado.'], 404);
            }

            jsonResponse([
                'success' => true,
                'student' => $student
            ]);
            break;

        // ==========================================
        // 4. DASHBOARD COMPLETO DO ALUNO
        // ==========================================
        case 'dashboard':
            $auth = requireStudentAuth();
            $studentId = (int) $auth['sub'];

            // 1. Dados do Aluno
            $stmt = $pdo->prepare("SELECT id, name, email, avatar_color, goal, device_preference, weekly_hours, created_at FROM students WHERE id = ? LIMIT 1");
            $stmt->execute([$studentId]);
            $student = $stmt->fetch();

            // 2. Histórico de Testes Vocacionais
            $stmtTests = $pdo->prepare("
                SELECT id, primary_area, secondary_area, scores_json, recommended_track, created_at
                FROM student_career_tests
                WHERE student_id = ?
                ORDER BY created_at DESC
            ");
            $stmtTests->execute([$studentId]);
            $testsRaw = $stmtTests->fetchAll();
            $tests = [];
            foreach ($testsRaw as $t) {
                $t['scores'] = json_decode($t['scores_json'], true) ?? [];
                unset($t['scores_json']);
                $tests[] = $t;
            }

            // 3. Cursos do Aluno (com JOIN em courses se disponível)
            $stmtCourses = $pdo->prepare("
                SELECT 
                    sc.id as student_course_id,
                    sc.course_id,
                    sc.status,
                    sc.workload_hours,
                    sc.started_at,
                    sc.completed_at,
                    sc.certificate_url,
                    COALESCE(c.title, 'Curso Parceiro') as title,
                    COALESCE(c.provider, 'Instituição Oficial') as provider,
                    COALESCE(c.category, 'Geral') as category,
                    COALESCE(c.url, '') as url,
                    COALESCE(c.has_free_certificate, 1) as has_free_certificate
                FROM student_courses sc
                LEFT JOIN courses c ON sc.course_id = c.id
                WHERE sc.student_id = ?
                ORDER BY sc.created_at DESC
            ");
            $stmtCourses->execute([$studentId]);
            $courses = $stmtCourses->fetchAll();

            // 4. Métricas Consolidadas do Aluno
            $summary = [
                'total_saved' => 0,
                'in_progress' => 0,
                'completed' => 0,
                'total_hours_completed' => 0,
                'career_tests_count' => count($tests)
            ];

            foreach ($courses as $c) {
                if ($c['status'] === 'saved') $summary['total_saved']++;
                elseif ($c['status'] === 'in_progress') $summary['in_progress']++;
                elseif ($c['status'] === 'completed') {
                    $summary['completed']++;
                    $summary['total_hours_completed'] += (int) ($c['workload_hours'] ?: 10);
                }
            }

            jsonResponse([
                'success' => true,
                'student' => $student,
                'summary' => $summary,
                'career_tests' => $tests,
                'courses' => $courses
            ]);
            break;

        // ==========================================
        // 5. SALVAR NOVO RESULTADO DE TESTE VOCACIONAL
        // ==========================================
        case 'save_test':
            $auth = requireStudentAuth();
            $studentId = (int) $auth['sub'];

            $primaryArea = trim($input['primary_area'] ?? 'tecnologia');
            $secondaryArea = trim($input['secondary_area'] ?? '');
            $scores = $input['scores'] ?? [];
            $scoresJson = is_string($scores) ? $scores : json_encode($scores, JSON_UNESCAPED_UNICODE);
            $track = trim($input['recommended_track'] ?? '');

            $stmt = $pdo->prepare("
                INSERT INTO student_career_tests (student_id, primary_area, secondary_area, scores_json, recommended_track)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([$studentId, $primaryArea, $secondaryArea, $scoresJson, $track]);

            jsonResponse([
                'success' => true,
                'message' => 'Resultado do teste vocacional salvo com sucesso no seu perfil!',
                'test_id' => (int) $pdo->lastInsertId()
            ]);
            break;

        // ==========================================
        // 6. ATUALIZAR STATUS DE UM CURSO DO ALUNO
        // ==========================================
        case 'update_course':
            $auth = requireStudentAuth();
            $studentId = (int) $auth['sub'];

            $courseId = trim($input['course_id'] ?? '');
            $status = trim($input['status'] ?? 'saved'); // 'saved', 'in_progress', 'completed'
            $certificateUrl = trim($input['certificate_url'] ?? '');
            $workloadHours = (int) ($input['workload_hours'] ?? 10);

            if (empty($courseId)) {
                jsonResponse(['error' => true, 'message' => 'Identificador do curso não informado.'], 400);
            }
            if (!in_array($status, ['saved', 'in_progress', 'completed'])) {
                $status = 'saved';
            }

            $stmt = $pdo->prepare("
                INSERT INTO student_courses (student_id, course_id, status, workload_hours, certificate_url, completed_at)
                VALUES (?, ?, ?, ?, ?, IF(? = 'completed', NOW(), NULL))
                ON DUPLICATE KEY UPDATE 
                    status = VALUES(status),
                    certificate_url = COALESCE(NULLIF(VALUES(certificate_url), ''), certificate_url),
                    completed_at = IF(VALUES(status) = 'completed', COALESCE(completed_at, NOW()), NULL)
            ");
            $stmt->execute([$studentId, $courseId, $status, $workloadHours, $certificateUrl, $status]);

            jsonResponse([
                'success' => true,
                'message' => 'Status do curso atualizado com sucesso!',
                'course_id' => $courseId,
                'status' => $status
            ]);
            break;

        // ==========================================
        // 7. REMOVER CURSO DA LISTA DO ALUNO
        // ==========================================
        case 'remove_course':
            $auth = requireStudentAuth();
            $studentId = (int) $auth['sub'];
            $courseId = trim($input['course_id'] ?? '');

            if (!empty($courseId)) {
                $stmt = $pdo->prepare("DELETE FROM student_courses WHERE student_id = ? AND course_id = ?");
                $stmt->execute([$studentId, $courseId]);
            }

            jsonResponse([
                'success' => true,
                'message' => 'Curso removido da sua lista.'
            ]);
            break;

        // ==========================================
        // 8. EXCLUIR CONTA & DIREITO AO ESQUECIMENTO (LGPD)
        // ==========================================
        case 'delete_account':
            $auth = requireStudentAuth();
            $studentId = (int) $auth['sub'];

            $pdo->prepare("DELETE FROM student_career_tests WHERE student_id = ?")->execute([$studentId]);
            $pdo->prepare("DELETE FROM student_courses WHERE student_id = ?")->execute([$studentId]);
            $pdo->prepare("DELETE FROM students WHERE id = ?")->execute([$studentId]);

            jsonResponse([
                'success' => true,
                'message' => 'Sua conta e todos os seus dados foram permanentemente excluídos.'
            ]);
            break;

        default:
            jsonResponse(['error' => true, 'message' => 'Ação não reconhecida.'], 404);
            break;
    }

} catch (Exception $e) {
    error_log("[API Student] Erro: " . $e->getMessage());
    jsonResponse([
        'error' => true,
        'message' => 'Ocorreu um erro no servidor. Tente novamente mais tarde.',
        'detail' => $e->getMessage()
    ], 500);
}
