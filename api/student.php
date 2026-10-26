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
 * - Arquitetura Híbrida e Resiliente: Conexão direta MySQL (PDO) com contingência automática em arquivo protegido
 * - Conformidade total com LGPD (exclusão de conta e dados em 1 clique)
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

$cacheFile = __DIR__ . '/cache_students.json';

// Helper para ler arquivo de contingência
function loadStudentFileData($file) {
    if (file_exists($file)) {
        $content = @file_get_contents($file);
        if ($content) {
            $json = json_decode($content, true);
            if (is_array($json) && isset($json['students'])) {
                return $json;
            }
        }
    }
    return [
        'students' => [],
        'career_tests' => [],
        'student_courses' => []
    ];
}

// Helper para salvar arquivo de contingência
function saveStudentFileData($file, $data) {
    return @file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Tentar obter conexão ativa com o banco MySQL
$pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;

// Se MySQL estiver conectado, garante as tabelas
if ($pdo) {
    try {
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
    } catch (Exception $e) {
        // Se der erro de criação de tabela, desativa PDO temporariamente
        $pdo = null;
    }
}

try {
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

            $colors = ['#002776', '#009639', '#6b21a8', '#0369a1', '#b45309', '#be123c'];
            $avatarColor = $colors[array_rand($colors)];
            $hash = password_hash($password, PASSWORD_BCRYPT);
            $goal = trim($input['goal'] ?? 'primeiro_emprego');

            if ($pdo) {
                // Modo MySQL
                $stmt = $pdo->prepare("SELECT id FROM students WHERE email = ? LIMIT 1");
                $stmt->execute([$email]);
                if ($stmt->fetch()) {
                    jsonResponse(['error' => true, 'message' => 'Este e-mail já está cadastrado. Faça login ou use outro e-mail.'], 409);
                }

                $insert = $pdo->prepare("
                    INSERT INTO students (name, email, password_hash, avatar_color, goal, last_login_at)
                    VALUES (?, ?, ?, ?, ?, NOW())
                ");
                $insert->execute([$name, $email, $hash, $avatarColor, $goal]);
                $studentId = (int) $pdo->lastInsertId();

                // Salvar teste inicial se houver
                if (!empty($input['initial_test']) && is_array($input['initial_test'])) {
                    $t = $input['initial_test'];
                    $pArea = trim($t['primary_area'] ?? 'tecnologia');
                    $sArea = trim($t['secondary_area'] ?? '');
                    $scoresJson = is_string($t['scores'] ?? null) ? $t['scores'] : json_encode($t['scores'] ?? [], JSON_UNESCAPED_UNICODE);
                    $track = trim($t['recommended_track'] ?? '');
                    $pdo->prepare("INSERT INTO student_career_tests (student_id, primary_area, secondary_area, scores_json, recommended_track) VALUES (?, ?, ?, ?, ?)")
                        ->execute([$studentId, $pArea, $sArea, $scoresJson, $track]);
                }

                // Salvar cursos favoritados prévios
                if (!empty($input['initial_courses']) && is_array($input['initial_courses'])) {
                    $stmtC = $pdo->prepare("INSERT IGNORE INTO student_courses (student_id, course_id, status, workload_hours) VALUES (?, ?, 'saved', ?)");
                    foreach ($input['initial_courses'] as $c) {
                        $cId = is_array($c) ? ($c['id'] ?? '') : (string) $c;
                        $wHours = is_array($c) ? (int) ($c['workload_hours'] ?? 10) : 10;
                        if (!empty($cId)) $stmtC->execute([$studentId, $cId, $wHours]);
                    }
                }
            } else {
                // Modo Contingência em Arquivo Protegido
                $fData = loadStudentFileData($cacheFile);
                foreach ($fData['students'] as $st) {
                    if (strtolower($st['email']) === $email) {
                        jsonResponse(['error' => true, 'message' => 'Este e-mail já está cadastrado. Faça login ou use outro e-mail.'], 409);
                    }
                }

                $studentId = count($fData['students']) + 1;
                $newStudent = [
                    'id' => $studentId,
                    'name' => $name,
                    'email' => $email,
                    'password_hash' => $hash,
                    'avatar_color' => $avatarColor,
                    'goal' => $goal,
                    'created_at' => date('c'),
                    'last_login_at' => date('c')
                ];
                $fData['students'][] = $newStudent;

                if (!empty($input['initial_test']) && is_array($input['initial_test'])) {
                    $t = $input['initial_test'];
                    $fData['career_tests'][] = [
                        'id' => count($fData['career_tests']) + 1,
                        'student_id' => $studentId,
                        'primary_area' => trim($t['primary_area'] ?? 'tecnologia'),
                        'secondary_area' => trim($t['secondary_area'] ?? ''),
                        'scores' => is_array($t['scores'] ?? null) ? $t['scores'] : json_decode($t['scores'] ?? '{}', true),
                        'recommended_track' => trim($t['recommended_track'] ?? ''),
                        'created_at' => date('c')
                    ];
                }

                if (!empty($input['initial_courses']) && is_array($input['initial_courses'])) {
                    foreach ($input['initial_courses'] as $c) {
                        $cId = is_array($c) ? ($c['id'] ?? '') : (string) $c;
                        $wHours = is_array($c) ? (int) ($c['workload_hours'] ?? 10) : 10;
                        if (!empty($cId)) {
                            $fData['student_courses'][] = [
                                'id' => count($fData['student_courses']) + 1,
                                'student_id' => $studentId,
                                'course_id' => $cId,
                                'status' => 'saved',
                                'workload_hours' => $wHours,
                                'certificate_url' => '',
                                'started_at' => date('c'),
                                'completed_at' => null,
                                'created_at' => date('c')
                            ];
                        }
                    }
                }

                saveStudentFileData($cacheFile, $fData);
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

            $student = null;
            if ($pdo) {
                $stmt = $pdo->prepare("SELECT id, name, email, password_hash, avatar_color, goal FROM students WHERE email = ? LIMIT 1");
                $stmt->execute([$email]);
                $student = $stmt->fetch();
                if ($student) {
                    $pdo->prepare("UPDATE students SET last_login_at = NOW() WHERE id = ?")->execute([$student['id']]);
                }
            } else {
                $fData = loadStudentFileData($cacheFile);
                foreach ($fData['students'] as &$st) {
                    if (strtolower($st['email']) === $email) {
                        $student = $st;
                        $st['last_login_at'] = date('c');
                        saveStudentFileData($cacheFile, $fData);
                        break;
                    }
                }
            }

            if (!$student || !password_verify($password, $student['password_hash'])) {
                usleep(200000); // 200ms anti-bruteforce
                jsonResponse(['error' => true, 'message' => 'E-mail ou senha incorretos.'], 401);
            }

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

            $student = null;
            if ($pdo) {
                $stmt = $pdo->prepare("SELECT id, name, email, avatar_color, goal, created_at FROM students WHERE id = ? LIMIT 1");
                $stmt->execute([$studentId]);
                $student = $stmt->fetch();
            } else {
                $fData = loadStudentFileData($cacheFile);
                foreach ($fData['students'] as $st) {
                    if ((int)$st['id'] === $studentId) {
                        $student = [
                            'id' => (int) $st['id'],
                            'name' => $st['name'],
                            'email' => $st['email'],
                            'avatar_color' => $st['avatar_color'],
                            'goal' => $st['goal'],
                            'created_at' => $st['created_at']
                        ];
                        break;
                    }
                }
            }

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

            $student = null;
            $tests = [];
            $courses = [];

            if ($pdo) {
                $stmt = $pdo->prepare("SELECT id, name, email, avatar_color, goal, created_at FROM students WHERE id = ? LIMIT 1");
                $stmt->execute([$studentId]);
                $student = $stmt->fetch();

                $stmtTests = $pdo->prepare("SELECT id, primary_area, secondary_area, scores_json, recommended_track, created_at FROM student_career_tests WHERE student_id = ? ORDER BY created_at DESC");
                $stmtTests->execute([$studentId]);
                $testsRaw = $stmtTests->fetchAll();
                foreach ($testsRaw as $t) {
                    $t['scores'] = json_decode($t['scores_json'], true) ?? [];
                    unset($t['scores_json']);
                    $tests[] = $t;
                }

                $stmtCourses = $pdo->prepare("
                    SELECT 
                        sc.id as student_course_id,
                        sc.course_id,
                        sc.status,
                        sc.workload_hours,
                        sc.started_at,
                        sc.completed_at,
                        sc.certificate_url,
                        COALESCE(c.title, 'Curso Oficial') as title,
                        COALESCE(c.provider, 'Instituição Parceira') as provider,
                        COALESCE(c.category, 'Geral') as category,
                        COALESCE(c.url, '') as url
                    FROM student_courses sc
                    LEFT JOIN courses c ON sc.course_id = c.id
                    WHERE sc.student_id = ?
                    ORDER BY sc.created_at DESC
                ");
                $stmtCourses->execute([$studentId]);
                $courses = $stmtCourses->fetchAll();
            } else {
                $fData = loadStudentFileData($cacheFile);
                foreach ($fData['students'] as $st) {
                    if ((int)$st['id'] === $studentId) {
                        $student = [
                            'id' => (int) $st['id'],
                            'name' => $st['name'],
                            'email' => $st['email'],
                            'avatar_color' => $st['avatar_color'] ?? '#002776',
                            'goal' => $st['goal'] ?? 'primeiro_emprego',
                            'created_at' => $st['created_at']
                        ];
                        break;
                    }
                }

                // Cursos catalogados para enriquecer títulos
                $coursesCatalog = [];
                $seedFile = __DIR__ . '/seed_courses.json';
                if (file_exists($seedFile)) {
                    $seedArr = json_decode(file_get_contents($seedFile), true) ?? [];
                    foreach ($seedArr as $sc) {
                        $coursesCatalog[$sc['id']] = $sc;
                    }
                }

                foreach ($fData['career_tests'] as $ct) {
                    if ((int)$ct['student_id'] === $studentId) {
                        $tests[] = $ct;
                    }
                }
                usort($tests, function($a, $b) {
                    return strtotime($b['created_at'] ?? '0') <=> strtotime($a['created_at'] ?? '0');
                });

                foreach ($fData['student_courses'] as $sc) {
                    if ((int)$sc['student_id'] === $studentId) {
                        $catItem = $coursesCatalog[$sc['course_id']] ?? [];
                        $courses[] = [
                            'student_course_id' => $sc['id'],
                            'course_id' => $sc['course_id'],
                            'status' => $sc['status'],
                            'workload_hours' => $sc['workload_hours'] ?? ($catItem['workloadHours'] ?? 10),
                            'started_at' => $sc['started_at'],
                            'completed_at' => $sc['completed_at'],
                            'certificate_url' => $sc['certificate_url'] ?? '',
                            'title' => $catItem['title'] ?? 'Curso Oficial',
                            'provider' => $catItem['provider'] ?? 'Instituição Parceira',
                            'category' => $catItem['category'] ?? 'Geral',
                            'url' => $catItem['url'] ?? ''
                        ];
                    }
                }
            }

            if (!$student) {
                jsonResponse(['error' => true, 'message' => 'Aluno não encontrado.'], 404);
            }

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

            if ($pdo) {
                $stmt = $pdo->prepare("INSERT INTO student_career_tests (student_id, primary_area, secondary_area, scores_json, recommended_track) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$studentId, $primaryArea, $secondaryArea, $scoresJson, $track]);
            } else {
                $fData = loadStudentFileData($cacheFile);
                $fData['career_tests'][] = [
                    'id' => count($fData['career_tests']) + 1,
                    'student_id' => $studentId,
                    'primary_area' => $primaryArea,
                    'secondary_area' => $secondaryArea,
                    'scores' => is_array($scores) ? $scores : json_decode($scoresJson, true),
                    'recommended_track' => $track,
                    'created_at' => date('c')
                ];
                saveStudentFileData($cacheFile, $fData);
            }

            jsonResponse([
                'success' => true,
                'message' => 'Resultado do teste vocacional salvo com sucesso no seu perfil!'
            ]);
            break;

        // ==========================================
        // 6. ATUALIZAR STATUS DE UM CURSO DO ALUNO
        // ==========================================
        case 'update_course':
            $auth = requireStudentAuth();
            $studentId = (int) $auth['sub'];

            $courseId = trim($input['course_id'] ?? '');
            $status = trim($input['status'] ?? 'saved');
            $certificateUrl = trim($input['certificate_url'] ?? '');
            $workloadHours = (int) ($input['workload_hours'] ?? 10);

            if (empty($courseId)) {
                jsonResponse(['error' => true, 'message' => 'Identificador do curso não informado.'], 400);
            }
            if (!in_array($status, ['saved', 'in_progress', 'completed'])) {
                $status = 'saved';
            }

            if ($pdo) {
                $stmt = $pdo->prepare("
                    INSERT INTO student_courses (student_id, course_id, status, workload_hours, certificate_url, completed_at)
                    VALUES (?, ?, ?, ?, ?, IF(? = 'completed', NOW(), NULL))
                    ON DUPLICATE KEY UPDATE 
                        status = VALUES(status),
                        certificate_url = COALESCE(NULLIF(VALUES(certificate_url), ''), certificate_url),
                        completed_at = IF(VALUES(status) = 'completed', COALESCE(completed_at, NOW()), NULL)
                ");
                $stmt->execute([$studentId, $courseId, $status, $workloadHours, $certificateUrl, $status]);
            } else {
                $fData = loadStudentFileData($cacheFile);
                $found = false;
                foreach ($fData['student_courses'] as &$sc) {
                    if ((int)$sc['student_id'] === $studentId && $sc['course_id'] === $courseId) {
                        $sc['status'] = $status;
                        if (!empty($certificateUrl)) $sc['certificate_url'] = $certificateUrl;
                        if ($status === 'completed' && empty($sc['completed_at'])) $sc['completed_at'] = date('c');
                        $found = true;
                        break;
                    }
                }
                if (!$found) {
                    $fData['student_courses'][] = [
                        'id' => count($fData['student_courses']) + 1,
                        'student_id' => $studentId,
                        'course_id' => $courseId,
                        'status' => $status,
                        'workload_hours' => $workloadHours,
                        'certificate_url' => $certificateUrl,
                        'started_at' => date('c'),
                        'completed_at' => $status === 'completed' ? date('c') : null,
                        'created_at' => date('c')
                    ];
                }
                saveStudentFileData($cacheFile, $fData);
            }

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

            if ($pdo) {
                $pdo->prepare("DELETE FROM student_courses WHERE student_id = ? AND course_id = ?")->execute([$studentId, $courseId]);
            } else {
                $fData = loadStudentFileData($cacheFile);
                $fData['student_courses'] = array_values(array_filter($fData['student_courses'], function($sc) use ($studentId, $courseId) {
                    return !((int)$sc['student_id'] === $studentId && $sc['course_id'] === $courseId);
                }));
                saveStudentFileData($cacheFile, $fData);
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

            if ($pdo) {
                $pdo->prepare("DELETE FROM student_career_tests WHERE student_id = ?")->execute([$studentId]);
                $pdo->prepare("DELETE FROM student_courses WHERE student_id = ?")->execute([$studentId]);
                $pdo->prepare("DELETE FROM students WHERE id = ?")->execute([$studentId]);
            } else {
                $fData = loadStudentFileData($cacheFile);
                $fData['students'] = array_values(array_filter($fData['students'], function($st) use ($studentId) {
                    return (int)$st['id'] !== $studentId;
                }));
                $fData['career_tests'] = array_values(array_filter($fData['career_tests'], function($ct) use ($studentId) {
                    return (int)$ct['student_id'] !== $studentId;
                }));
                $fData['student_courses'] = array_values(array_filter($fData['student_courses'], function($sc) use ($studentId) {
                    return (int)$sc['student_id'] !== $studentId;
                }));
                saveStudentFileData($cacheFile, $fData);
            }

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
        'message' => 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.'
    ], 500);
}
