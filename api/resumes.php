<?php
/**
 * API de Gestão de Currículos Gerados
 * Portal Você Pode Tudo
 * 
 * Funcionalidades:
 * - Registro e sincronização automática de currículos gerados/exportados pelos usuários (POST save)
 * - Consulta, busca e paginação de currículos exclusiva para Administradores (GET list)
 * - Visualização detalhada do currículo completo para o Administrador (GET get)
 * - Exclusão de currículo com controle estrito de RBAC (POST/DELETE delete)
 * - Estatísticas de geração e formatos mais utilizados (GET stats)
 * - Exportação de relatório em formato CSV (GET export_csv)
 * - Arquitetura Híbrida: MySQL PDO com contingência resiliente em arquivo JSON
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? 'list';
$method = $_SERVER['REQUEST_METHOD'];
$cacheFile = __DIR__ . '/cache_generated_resumes.json';

// Obter dados da requisição (JSON ou POST/GET)
$inputRaw = file_get_contents('php://input');
$inputJson = json_decode($inputRaw, true);
$input = is_array($inputJson) ? array_merge($_GET, $inputJson) : array_merge($_GET, $_POST);

// Helper para contingência em arquivo JSON
function loadResumesFileData($file) {
    if (file_exists($file)) {
        $content = @file_get_contents($file);
        if ($content) {
            $data = json_decode($content, true);
            if (is_array($data)) return $data;
        }
    }
    return [];
}

function saveResumesFileData($file, $data) {
    @file_put_contents($file, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);
}

// Tentar obter conexão ativa com o banco MySQL
$pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;

// Se MySQL estiver conectado, garante a tabela
if ($pdo) {
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `generated_resumes` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `student_id` INT NULL,
                `candidate_name` VARCHAR(150) NOT NULL,
                `candidate_email` VARCHAR(150) NULL,
                `candidate_phone` VARCHAR(50) NULL,
                `candidate_city` VARCHAR(100) NULL,
                `candidate_state` VARCHAR(20) NULL,
                `target_role` VARCHAR(150) NULL,
                `template_id` VARCHAR(50) NOT NULL DEFAULT 'moderno',
                `has_photo` TINYINT(1) DEFAULT 0,
                `resume_data` MEDIUMTEXT NOT NULL,
                `downloads_count` INT DEFAULT 1,
                `ip_address` VARCHAR(45) NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX `idx_created_at` (`created_at`),
                INDEX `idx_candidate_name` (`candidate_name`),
                INDEX `idx_candidate_email` (`candidate_email`),
                INDEX `idx_target_role` (`target_role`),
                INDEX `idx_template_id` (`template_id`),
                INDEX `idx_student_id` (`student_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    } catch (Throwable $e) {
        error_log("[Resumes API] Falha ao verificar tabela MySQL: " . $e->getMessage());
    }
}

// Obter IP do cliente de forma segura
function getClientIpAddress() {
    $ip = $_SERVER['HTTP_CF_CONNECTING_IP'] 
       ?? $_SERVER['HTTP_X_FORWARDED_FOR'] 
       ?? $_SERVER['REMOTE_ADDR'] 
       ?? '0.0.0.0';
    if (strpos($ip, ',') !== false) {
        $parts = explode(',', $ip);
        $ip = trim($parts[0]);
    }
    return substr(strip_tags($ip), 0, 45);
}

// ==============================================================================
// ROTAS DA API DE CURRÍCULOS
// ==============================================================================

switch ($action) {

    // --------------------------------------------------------------------------
    // 1. SALVAR / SINCRONIZAR CURRÍCULO GERADO (Público / Aluno)
    // --------------------------------------------------------------------------
    case 'save':
        if ($method !== 'POST') {
            jsonResponse(['error' => true, 'message' => 'Método inválido. Utilize POST.'], 405);
        }

        $curriculo = $input['curriculo'] ?? null;
        if (!is_array($curriculo)) {
            jsonResponse(['error' => true, 'message' => 'Estrutura do currículo inválida ou ausente.'], 400);
        }

        $candidateName = trim(strip_tags($curriculo['nome'] ?? ''));
        if (mb_strlen($candidateName) < 2) {
            jsonResponse(['error' => true, 'message' => 'Nome do candidato é obrigatório (mínimo de 2 caracteres).'], 400);
        }

        $candidateEmail = trim(strip_tags($curriculo['email'] ?? ''));
        $candidatePhone = trim(strip_tags($curriculo['telefone'] ?? ''));
        $candidateCity  = trim(strip_tags($curriculo['cidade'] ?? ''));
        $candidateState = trim(strip_tags($curriculo['estado'] ?? ''));
        $targetRole     = trim(strip_tags($curriculo['cargoDesejado'] ?? ($curriculo['areaProfissional'] ?? 'Profissional')));
        $templateId     = trim(strip_tags($input['templateId'] ?? ($input['activeTemplate'] ?? 'moderno')));
        
        $hasPhoto = 0;
        if (!empty($curriculo['foto']) && is_string($curriculo['foto'])) {
            if (strpos($curriculo['foto'], 'data:image/') === 0 || mb_strlen($curriculo['foto']) > 100) {
                $hasPhoto = 1;
            }
        }

        // Tenta capturar student_id se o usuário estiver logado como estudante
        $studentId = null;
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? '');
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $studentTokenData = verifyToken($matches[1], JWT_STUDENT_SECRET);
            if (!$studentTokenData) {
                $studentTokenData = verifyToken($matches[1], JWT_SECRET);
            }
            if ($studentTokenData && isset($studentTokenData['sub'])) {
                $studentId = (int)$studentTokenData['sub'];
            }
        }

        $clientIp = getClientIpAddress();
        $resumePayload = [
            'templateId' => $templateId,
            'primaryColor' => $input['primaryColor'] ?? '#002776',
            'fontScale' => $input['fontScale'] ?? 1,
            'curriculo' => $curriculo,
            'savedAt' => date('Y-m-d H:i:s')
        ];
        $resumeJson = json_encode($resumePayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $insertedId = null;

        // Persistência em MySQL
        if ($pdo) {
            try {
                // Verifica se existe um currículo idêntico salvo nas últimas 2 horas (mesmo nome e email/telefone)
                $existingStmt = $pdo->prepare("
                    SELECT id, downloads_count 
                    FROM generated_resumes 
                    WHERE candidate_name = ? 
                      AND (candidate_email = ? OR (candidate_phone = ? AND candidate_phone != ''))
                      AND created_at >= NOW() - INTERVAL 2 HOUR 
                    ORDER BY id DESC LIMIT 1
                ");
                $existingStmt->execute([$candidateName, $candidateEmail, $candidatePhone]);
                $existing = $existingStmt->fetch(PDO::FETCH_ASSOC);

                if ($existing) {
                    $insertedId = (int)$existing['id'];
                    $updStmt = $pdo->prepare("
                        UPDATE generated_resumes 
                        SET candidate_city = ?,
                            candidate_state = ?,
                            target_role = ?,
                            template_id = ?,
                            has_photo = ?,
                            resume_data = ?,
                            downloads_count = downloads_count + 1,
                            student_id = COALESCE(?, student_id),
                            updated_at = NOW()
                        WHERE id = ?
                    ");
                    $updStmt->execute([
                        $candidateCity,
                        $candidateState,
                        $targetRole,
                        $templateId,
                        $hasPhoto,
                        $resumeJson,
                        $studentId,
                        $insertedId
                    ]);
                } else {
                    $insStmt = $pdo->prepare("
                        INSERT INTO generated_resumes 
                        (student_id, candidate_name, candidate_email, candidate_phone, candidate_city, candidate_state, target_role, template_id, has_photo, resume_data, downloads_count, ip_address)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
                    ");
                    $insStmt->execute([
                        $studentId,
                        $candidateName,
                        $candidateEmail,
                        $candidatePhone,
                        $candidateCity,
                        $candidateState,
                        $targetRole,
                        $templateId,
                        $hasPhoto,
                        $resumeJson,
                        $clientIp
                    ]);
                    $insertedId = (int)$pdo->lastInsertId();
                }
            } catch (Throwable $e) {
                error_log("[Resumes API] Falha no MySQL ao salvar currículo: " . $e->getMessage());
            }
        }

        // Contingência / Espelho em Arquivo JSON
        try {
            $fileResumes = loadResumesFileData($cacheFile);
            $foundIndex = -1;

            if ($insertedId) {
                foreach ($fileResumes as $idx => $r) {
                    if (isset($r['id']) && $r['id'] === $insertedId) {
                        $foundIndex = $idx;
                        break;
                    }
                }
            }

            if ($foundIndex >= 0) {
                $fileResumes[$foundIndex]['candidate_city'] = $candidateCity;
                $fileResumes[$foundIndex]['candidate_state'] = $candidateState;
                $fileResumes[$foundIndex]['target_role'] = $targetRole;
                $fileResumes[$foundIndex]['template_id'] = $templateId;
                $fileResumes[$foundIndex]['has_photo'] = $hasPhoto;
                $fileResumes[$foundIndex]['resume_data'] = $resumeJson;
                $fileResumes[$foundIndex]['downloads_count'] = ($fileResumes[$foundIndex]['downloads_count'] ?? 1) + 1;
                $fileResumes[$foundIndex]['updated_at'] = date('Y-m-d H:i:s');
            } else {
                if (!$insertedId) {
                    $insertedId = count($fileResumes) > 0 ? (max(array_column($fileResumes, 'id')) + 1) : 1;
                }
                $fileResumes[] = [
                    'id' => $insertedId,
                    'student_id' => $studentId,
                    'candidate_name' => $candidateName,
                    'candidate_email' => $candidateEmail,
                    'candidate_phone' => $candidatePhone,
                    'candidate_city' => $candidateCity,
                    'candidate_state' => $candidateState,
                    'target_role' => $targetRole,
                    'template_id' => $templateId,
                    'has_photo' => $hasPhoto,
                    'resume_data' => $resumeJson,
                    'downloads_count' => 1,
                    'ip_address' => $clientIp,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ];
            }
            saveResumesFileData($cacheFile, $fileResumes);
        } catch (Throwable $e) {
            error_log("[Resumes API] Falha ao salvar arquivo cache: " . $e->getMessage());
        }

        jsonResponse([
            'success' => true,
            'id' => $insertedId,
            'message' => 'Currículo registrado e disponibilizado para a administração com sucesso.'
        ]);
        break;

    // --------------------------------------------------------------------------
    // 2. LISTAR CURRÍCULOS GERADOS (Exclusivo Administrador / Visualizador)
    // --------------------------------------------------------------------------
    case 'list':
        $admin = requireAdmin(true);

        $search = trim($input['search'] ?? '');
        $templateFilter = trim($input['template'] ?? 'all');
        $photoFilter = trim($input['has_photo'] ?? 'all');
        $page = max(1, (int)($input['page'] ?? 1));
        $limit = min(100, max(5, (int)($input['limit'] ?? 50)));
        $offset = ($page - 1) * $limit;

        $total = 0;
        $resumes = [];

        if ($pdo) {
            try {
                $whereConditions = [];
                $params = [];

                if ($search !== '') {
                    $whereConditions[] = "(candidate_name LIKE ? OR candidate_email LIKE ? OR candidate_phone LIKE ? OR target_role LIKE ? OR candidate_city LIKE ?)";
                    $sTerm = "%{$search}%";
                    $params[] = $sTerm;
                    $params[] = $sTerm;
                    $params[] = $sTerm;
                    $params[] = $sTerm;
                    $params[] = $sTerm;
                }

                if ($templateFilter !== '' && $templateFilter !== 'all') {
                    $whereConditions[] = "template_id = ?";
                    $params[] = $templateFilter;
                }

                if ($photoFilter === '1') {
                    $whereConditions[] = "has_photo = 1";
                } elseif ($photoFilter === '0') {
                    $whereConditions[] = "has_photo = 0";
                }

                $whereSql = count($whereConditions) > 0 ? "WHERE " . implode(" AND ", $whereConditions) : "";

                // Count total
                $countStmt = $pdo->prepare("SELECT COUNT(*) as total FROM generated_resumes {$whereSql}");
                $countStmt->execute($params);
                $total = (int)$countStmt->fetch(PDO::FETCH_ASSOC)['total'];

                // Select metadata without heavy resume_data for fast list
                $listStmt = $pdo->prepare("
                    SELECT id, student_id, candidate_name, candidate_email, candidate_phone, 
                           candidate_city, candidate_state, target_role, template_id, has_photo, 
                           downloads_count, created_at, updated_at
                    FROM generated_resumes 
                    {$whereSql}
                    ORDER BY id DESC
                    LIMIT {$limit} OFFSET {$offset}
                ");
                $listStmt->execute($params);
                $resumes = $listStmt->fetchAll(PDO::FETCH_ASSOC);

            } catch (Throwable $e) {
                error_log("[Resumes API] Falha na consulta MySQL: " . $e->getMessage());
            }
        }

        // Fallback em arquivo JSON se MySQL não retornou
        if (empty($resumes) && $total === 0) {
            $allFileResumes = loadResumesFileData($cacheFile);
            $filtered = [];

            foreach ($allFileResumes as $r) {
                if ($search !== '') {
                    $s = mb_strtolower($search);
                    $matches = (
                        strpos(mb_strtolower($r['candidate_name'] ?? ''), $s) !== false ||
                        strpos(mb_strtolower($r['candidate_email'] ?? ''), $s) !== false ||
                        strpos(mb_strtolower($r['candidate_phone'] ?? ''), $s) !== false ||
                        strpos(mb_strtolower($r['target_role'] ?? ''), $s) !== false ||
                        strpos(mb_strtolower($r['candidate_city'] ?? ''), $s) !== false
                    );
                    if (!$matches) continue;
                }

                if ($templateFilter !== '' && $templateFilter !== 'all') {
                    if (($r['template_id'] ?? '') !== $templateFilter) continue;
                }

                if ($photoFilter === '1' && empty($r['has_photo'])) continue;
                if ($photoFilter === '0' && !empty($r['has_photo'])) continue;

                $clean = $r;
                unset($clean['resume_data']); // Remove blob pesado da listagem
                $filtered[] = $clean;
            }

            usort($filtered, function($a, $b) {
                return ($b['id'] ?? 0) - ($a['id'] ?? 0);
            });

            $total = count($filtered);
            $resumes = array_slice($filtered, $offset, $limit);
        }

        jsonResponse([
            'success' => true,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit),
            'resumes' => $resumes
        ]);
        break;

    // --------------------------------------------------------------------------
    // 3. OBTER CURRÍCULO COMPLETO PARA VISUALIZAÇÃO/IMPRESSÃO (Exclusivo Administrador)
    // --------------------------------------------------------------------------
    case 'get':
        $admin = requireAdmin(true);
        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) {
            jsonResponse(['error' => true, 'message' => 'ID do currículo inválido.'], 400);
        }

        $resume = null;

        if ($pdo) {
            try {
                $stmt = $pdo->prepare("SELECT * FROM generated_resumes WHERE id = ? LIMIT 1");
                $stmt->execute([$id]);
                $resume = $stmt->fetch(PDO::FETCH_ASSOC);
            } catch (Throwable $e) {
                error_log("[Resumes API] Falha no get MySQL: " . $e->getMessage());
            }
        }

        if (!$resume) {
            $all = loadResumesFileData($cacheFile);
            foreach ($all as $item) {
                if (($item['id'] ?? 0) === $id) {
                    $resume = $item;
                    break;
                }
            }
        }

        if (!$resume) {
            jsonResponse(['error' => true, 'message' => 'Currículo não encontrado.'], 404);
        }

        // Decodificar resume_data JSON
        $dataParsed = null;
        if (!empty($resume['resume_data'])) {
            $dataParsed = is_string($resume['resume_data']) ? json_decode($resume['resume_data'], true) : $resume['resume_data'];
        }
        $resume['resume_data'] = $dataParsed;

        jsonResponse([
            'success' => true,
            'resume' => $resume
        ]);
        break;

    // --------------------------------------------------------------------------
    // 4. EXCLUIR CURRÍCULO (Exclusivo Administrador)
    // --------------------------------------------------------------------------
    case 'delete':
        $admin = requireAdmin();
        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) {
            jsonResponse(['error' => true, 'message' => 'ID do currículo inválido.'], 400);
        }

        if ($pdo) {
            try {
                $stmt = $pdo->prepare("DELETE FROM generated_resumes WHERE id = ?");
                $stmt->execute([$id]);
            } catch (Throwable $e) {
                error_log("[Resumes API] Falha no delete MySQL: " . $e->getMessage());
            }
        }

        try {
            $all = loadResumesFileData($cacheFile);
            $newAll = array_values(array_filter($all, function($item) use ($id) {
                return ($item['id'] ?? 0) !== $id;
            }));
            saveResumesFileData($cacheFile, $newAll);
        } catch (Throwable $e) {}

        jsonResponse([
            'success' => true,
            'message' => 'Currículo excluído com sucesso.'
        ]);
        break;

    // --------------------------------------------------------------------------
    // 5. ESTATÍSTICAS PARA O DASHBOARD ADMINISTRATIVO (Exclusivo Administrador)
    // --------------------------------------------------------------------------
    case 'stats':
        $admin = requireAdmin(true);

        $stats = [
            'total_resumes' => 0,
            'with_photo_count' => 0,
            'total_downloads' => 0,
            'today_count' => 0,
            'top_template' => 'moderno',
            'templates_breakdown' => []
        ];

        if ($pdo) {
            try {
                $q1 = $pdo->query("SELECT COUNT(*) as total, SUM(has_photo) as with_photo, SUM(downloads_count) as downloads FROM generated_resumes");
                $r1 = $q1->fetch(PDO::FETCH_ASSOC);
                $stats['total_resumes'] = (int)($r1['total'] ?? 0);
                $stats['with_photo_count'] = (int)($r1['with_photo'] ?? 0);
                $stats['total_downloads'] = (int)($r1['downloads'] ?? 0);

                $q2 = $pdo->query("SELECT COUNT(*) as today FROM generated_resumes WHERE DATE(created_at) = CURDATE()");
                $r2 = $q2->fetch(PDO::FETCH_ASSOC);
                $stats['today_count'] = (int)($r2['today'] ?? 0);

                $q3 = $pdo->query("SELECT template_id, COUNT(*) as cnt FROM generated_resumes GROUP BY template_id ORDER BY cnt DESC");
                $tpls = $q3->fetchAll(PDO::FETCH_ASSOC);
                if (!empty($tpls)) {
                    $stats['top_template'] = $tpls[0]['template_id'];
                    $stats['templates_breakdown'] = $tpls;
                }
            } catch (Throwable $e) {
                error_log("[Resumes API] Falha no stats MySQL: " . $e->getMessage());
            }
        }

        if ($stats['total_resumes'] === 0) {
            $all = loadResumesFileData($cacheFile);
            $stats['total_resumes'] = count($all);
            $tplCounts = [];
            $today = date('Y-m-d');
            foreach ($all as $item) {
                if (!empty($item['has_photo'])) $stats['with_photo_count']++;
                $stats['total_downloads'] += (int)($item['downloads_count'] ?? 1);
                if (strpos($item['created_at'] ?? '', $today) === 0) {
                    $stats['today_count']++;
                }
                $t = $item['template_id'] ?? 'moderno';
                $tplCounts[$t] = ($tplCounts[$t] ?? 0) + 1;
            }
            arsort($tplCounts);
            foreach ($tplCounts as $tid => $c) {
                $stats['templates_breakdown'][] = ['template_id' => $tid, 'cnt' => $c];
            }
            if (!empty($tplCounts)) {
                $stats['top_template'] = array_key_first($tplCounts);
            }
        }

        jsonResponse([
            'success' => true,
            'stats' => $stats
        ]);
        break;

    // --------------------------------------------------------------------------
    // 6. EXPORTAÇÃO CSV DE CURRÍCULOS (Exclusivo Administrador)
    // --------------------------------------------------------------------------
    case 'export_csv':
        $admin = requireAdmin(true);

        $rows = [];
        if ($pdo) {
            try {
                $stmt = $pdo->query("
                    SELECT id, candidate_name, candidate_email, candidate_phone, candidate_city, 
                           candidate_state, target_role, template_id, has_photo, downloads_count, created_at 
                    FROM generated_resumes 
                    ORDER BY id DESC
                ");
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (Throwable $e) {}
        }

        if (empty($rows)) {
            $all = loadResumesFileData($cacheFile);
            foreach ($all as $r) {
                $rows[] = [
                    'id' => $r['id'] ?? '',
                    'candidate_name' => $r['candidate_name'] ?? '',
                    'candidate_email' => $r['candidate_email'] ?? '',
                    'candidate_phone' => $r['candidate_phone'] ?? '',
                    'candidate_city' => $r['candidate_city'] ?? '',
                    'candidate_state' => $r['candidate_state'] ?? '',
                    'target_role' => $r['target_role'] ?? '',
                    'template_id' => $r['template_id'] ?? '',
                    'has_photo' => !empty($r['has_photo']) ? 'Sim' : 'Não',
                    'downloads_count' => $r['downloads_count'] ?? 1,
                    'created_at' => $r['created_at'] ?? ''
                ];
            }
        }

        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="curriculos_gerados_' . date('Y-m-d_His') . '.csv"');
        
        $output = fopen('php://output', 'w');
        // UTF-8 BOM para compatibilidade com Microsoft Excel
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

        fputcsv($output, ['ID', 'Nome do Candidato', 'E-mail', 'Telefone', 'Cidade', 'Estado', 'Cargo Desejado', 'Modelo', 'Possui Foto', 'Downloads', 'Data de Criação'], ';');

        foreach ($rows as $row) {
            fputcsv($output, array_map('sanitizeCsvField', [
                $row['id'],
                $row['candidate_name'],
                $row['candidate_email'],
                $row['candidate_phone'],
                $row['candidate_city'],
                $row['candidate_state'],
                $row['target_role'],
                $row['template_id'],
                ($row['has_photo'] == 1 || $row['has_photo'] === 'Sim') ? 'Sim' : 'Não',
                $row['downloads_count'],
                $row['created_at']
            ]), ';');
        }

        fclose($output);
        exit;

    default:
        jsonResponse(['error' => true, 'message' => "Ação desconhecida: {$action}"], 400);
}
