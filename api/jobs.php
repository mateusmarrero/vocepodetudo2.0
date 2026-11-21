<?php
/**
 * api/jobs.php - Mural de Vagas e Oportunidades Integrado (Fase 2 Portal)
 * Você Pode Tudo — Empregabilidade & Qualificação Profissional
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');

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

require_once __DIR__ . '/config.php';

$cacheFile = __DIR__ . '/cache_jobs.json';
$seedFile = __DIR__ . '/seed_jobs.json';

// Função auxiliar para carregar vagas do arquivo JSON
function loadJobsFromCache(string $file, string $seed): array {
    if (file_exists($file)) {
        $content = @file_get_contents($file);
        if ($content) {
            $data = json_decode($content, true);
            if (is_array($data)) return $data;
        }
    }
    if (file_exists($seed)) {
        $content = @file_get_contents($seed);
        if ($content) {
            $data = json_decode($content, true);
            if (is_array($data)) {
                @file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                return $data;
            }
        }
    }
    return [];
}

// Salvar dados no cache JSON
function saveJobsToCache(string $file, array $jobs): bool {
    return (bool) @file_put_contents($file, json_encode($jobs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Tentar conexão com MySQL
$pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;

// Auto-criação da tabela se MySQL conectado
if ($pdo) {
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `job_vacancies` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `title` VARCHAR(200) NOT NULL,
              `company` VARCHAR(150) NOT NULL,
              `company_logo` VARCHAR(255) NULL,
              `type` ENUM('estagio', 'jovem_aprendiz', 'junior', 'trainee', 'outro') NOT NULL DEFAULT 'estagio',
              `modality` ENUM('remoto', 'hibrido', 'presencial') NOT NULL DEFAULT 'remoto',
              `area` VARCHAR(100) NOT NULL DEFAULT 'tecnologia',
              `state` VARCHAR(20) NOT NULL DEFAULT 'BR',
              `city` VARCHAR(100) NULL,
              `salary` VARCHAR(100) NULL,
              `description` TEXT NOT NULL,
              `requirements` TEXT NOT NULL,
              `benefits` TEXT NULL,
              `apply_url` VARCHAR(500) NOT NULL,
              `source_name` VARCHAR(100) DEFAULT 'Oficial',
              `deadline` VARCHAR(50) NULL,
              `is_active` TINYINT(1) NOT NULL DEFAULT 1,
              `views_count` INT NOT NULL DEFAULT 0,
              `clicks_count` INT NOT NULL DEFAULT 0,
              `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              INDEX `idx_job_type` (`type`),
              INDEX `idx_job_modality` (`modality`),
              INDEX `idx_job_area` (`area`),
              INDEX `idx_job_state` (`state`),
              INDEX `idx_job_active` (`is_active`),
              INDEX `idx_job_created` (`created_at`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Seed inicial no MySQL se a tabela estiver vazia
        $countCheck = (int) $pdo->query("SELECT COUNT(*) FROM `job_vacancies`")->fetchColumn();
        if ($countCheck === 0) {
            $seedData = loadJobsFromCache($cacheFile, $seedFile);
            if (!empty($seedData)) {
                $insertStmt = $pdo->prepare("
                    INSERT INTO `job_vacancies` 
                    (title, company, company_logo, type, modality, area, state, city, salary, description, requirements, benefits, apply_url, source_name, deadline, is_active, views_count, clicks_count)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                foreach ($seedData as $j) {
                    $insertStmt->execute([
                        $j['title'] ?? 'Vaga',
                        $j['company'] ?? 'Empresa',
                        $j['company_logo'] ?? '',
                        $j['type'] ?? 'estagio',
                        $j['modality'] ?? 'remoto',
                        $j['area'] ?? 'tecnologia',
                        $j['state'] ?? 'BR',
                        $j['city'] ?? '',
                        $j['salary'] ?? '',
                        $j['description'] ?? '',
                        $j['requirements'] ?? '',
                        $j['benefits'] ?? '',
                        $j['apply_url'] ?? '',
                        $j['source_name'] ?? 'Oficial',
                        $j['deadline'] ?? 'Aberto',
                        isset($j['is_active']) ? (int) $j['is_active'] : 1,
                        (int) ($j['views_count'] ?? 0),
                        (int) ($j['clicks_count'] ?? 0)
                    ]);
                }
            }
        }
    } catch (Exception $e) {
        // Ignora erro de DDL se já existir
    }
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';

// -------------------------------------------------------------
// 1. ROTA PÚBLICA: TRACKING DE CLIQUE EM CANDIDATURA
// -------------------------------------------------------------
if ($method === 'GET' && $action === 'click') {
    $id = (int) ($_GET['id'] ?? 0);
    if ($id > 0) {
        if ($pdo) {
            try {
                $pdo->prepare("UPDATE `job_vacancies` SET `clicks_count` = `clicks_count` + 1 WHERE `id` = ?")->execute([$id]);
            } catch (Exception $e) {}
        } else {
            $jobs = loadJobsFromCache($cacheFile, $seedFile);
            foreach ($jobs as &$j) {
                if ((int) $j['id'] === $id) {
                    $j['clicks_count'] = ((int) ($j['clicks_count'] ?? 0)) + 1;
                    break;
                }
            }
            saveJobsToCache($cacheFile, $jobs);
        }
    }
    echo json_encode(['success' => true, 'id' => $id]);
    exit;
}

// -------------------------------------------------------------
// 2. ROTA PÚBLICA: LISTAGEM DE VAGAS COM FILTROS E BUSCA
// -------------------------------------------------------------
if ($method === 'GET' && ($action === 'list' || $action === '')) {
    $search = trim($_GET['search'] ?? '');
    $type = trim($_GET['type'] ?? 'all');
    $modality = trim($_GET['modality'] ?? 'all');
    $area = trim($_GET['area'] ?? 'all');
    $stateFilter = trim($_GET['state'] ?? 'all');
    $status = trim($_GET['status'] ?? 'active'); // 'active', 'all' (admin)
    $page = max(1, (int) ($_GET['page'] ?? 1));
    $limit = min(150, max(6, (int) ($_GET['limit'] ?? 12)));
    $offset = ($page - 1) * $limit;

    $results = [];
    $total = 0;

    if ($pdo) {
        try {
            $where = [];
            $params = [];

            if ($status === 'active') {
                $where[] = "is_active = 1";
            }

            if ($type !== 'all' && !empty($type)) {
                $where[] = "type = ?";
                $params[] = $type;
            }

            if ($modality !== 'all' && !empty($modality)) {
                $where[] = "modality = ?";
                $params[] = $modality;
            }

            if ($area !== 'all' && !empty($area)) {
                $where[] = "area = ?";
                $params[] = $area;
            }

            if ($stateFilter !== 'all' && !empty($stateFilter)) {
                $where[] = "(state = ? OR state = 'BR')";
                $params[] = $stateFilter;
            }

            if (!empty($search)) {
                $where[] = "(title LIKE ? OR company LIKE ? OR description LIKE ? OR requirements LIKE ?)";
                $params[] = "%$search%";
                $params[] = "%$search%";
                $params[] = "%$search%";
                $params[] = "%$search%";
            }

            $whereSql = !empty($where) ? "WHERE " . implode(' AND ', $where) : "";

            $countStmt = $pdo->prepare("SELECT COUNT(*) FROM `job_vacancies` $whereSql");
            $countStmt->execute($params);
            $total = (int) $countStmt->fetchColumn();

            $sql = "SELECT * FROM `job_vacancies` $whereSql ORDER BY id DESC LIMIT $limit OFFSET $offset";
            $dataStmt = $pdo->prepare($sql);
            $dataStmt->execute($params);
            $results = $dataStmt->fetchAll(PDO::FETCH_ASSOC);

        } catch (Exception $e) {
            $results = [];
        }
    }

    // Fallback de contingência JSON
    if (empty($results) && (!$pdo || $total === 0)) {
        $all = loadJobsFromCache($cacheFile, $seedFile);
        $filtered = array_filter($all, function($j) use ($status, $type, $modality, $area, $stateFilter, $search) {
            if ($status === 'active' && empty($j['is_active'])) return false;
            if ($type !== 'all' && !empty($type) && ($j['type'] ?? '') !== $type) return false;
            if ($modality !== 'all' && !empty($modality) && ($j['modality'] ?? '') !== $modality) return false;
            if ($area !== 'all' && !empty($area) && ($j['area'] ?? '') !== $area) return false;
            if ($stateFilter !== 'all' && !empty($stateFilter) && ($j['state'] ?? 'BR') !== $stateFilter && ($j['state'] ?? '') !== 'BR') return false;
            if (!empty($search)) {
                $haystack = strtolower(($j['title'] ?? '') . ' ' . ($j['company'] ?? '') . ' ' . ($j['description'] ?? '') . ' ' . ($j['requirements'] ?? ''));
                if (strpos($haystack, strtolower($search)) === false) return false;
            }
            return true;
        });

        $total = count($filtered);
        $results = array_slice(array_values($filtered), $offset, $limit);
    }

    echo json_encode([
        'success' => true,
        'total' => $total,
        'page' => $page,
        'limit' => $limit,
        'jobs' => $results
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// -------------------------------------------------------------
// 3. ROTA PÚBLICA: DETALHES DE UMA VAGA POR ID
// -------------------------------------------------------------
if ($method === 'GET' && $action === 'get') {
    $id = (int) ($_GET['id'] ?? 0);
    $job = null;

    if ($pdo && $id > 0) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM `job_vacancies` WHERE id = ?");
            $stmt->execute([$id]);
            $job = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($job) {
                $pdo->prepare("UPDATE `job_vacancies` SET `views_count` = `views_count` + 1 WHERE id = ?")->execute([$id]);
            }
        } catch (Exception $e) {}
    }

    if (!$job && $id > 0) {
        $all = loadJobsFromCache($cacheFile, $seedFile);
        foreach ($all as $j) {
            if ((int) $j['id'] === $id) {
                $job = $j;
                break;
            }
        }
    }

    if ($job) {
        echo json_encode(['success' => true, 'job' => $job], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Vaga não encontrada.'], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// -------------------------------------------------------------
// 4. ROTAS ADMINISTRATIVAS (POST MUTATIONS)
// -------------------------------------------------------------
if ($method === 'POST') {
    // Exige autenticação de administrador
    $auth = requireAdmin(false);

    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true) ?? $_POST;

    // A. Alternar Status (Ativar / Pausar Vaga)
    if ($action === 'toggle') {
        $id = (int) ($payload['id'] ?? 0);
        $isActive = isset($payload['is_active']) ? ((int) $payload['is_active'] ? 1 : 0) : 1;

        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ID inválido.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($pdo) {
            try {
                $stmt = $pdo->prepare("UPDATE `job_vacancies` SET `is_active` = ? WHERE `id` = ?");
                $stmt->execute([$isActive, $id]);
            } catch (Exception $e) {}
        }

        // Sincroniza cache
        $all = loadJobsFromCache($cacheFile, $seedFile);
        foreach ($all as &$j) {
            if ((int) $j['id'] === $id) {
                $j['is_active'] = $isActive;
                break;
            }
        }
        saveJobsToCache($cacheFile, $all);

        echo json_encode(['success' => true, 'message' => 'Status da vaga alterado com sucesso!', 'is_active' => $isActive]);
        exit;
    }

    // B. Excluir Vaga
    if ($action === 'delete') {
        $id = (int) ($payload['id'] ?? 0);
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ID inválido.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($pdo) {
            try {
                $stmt = $pdo->prepare("DELETE FROM `job_vacancies` WHERE `id` = ?");
                $stmt->execute([$id]);
            } catch (Exception $e) {}
        }

        $all = loadJobsFromCache($cacheFile, $seedFile);
        $all = array_values(array_filter($all, fn($j) => (int) $j['id'] !== $id));
        saveJobsToCache($cacheFile, $all);

        echo json_encode(['success' => true, 'message' => 'Vaga excluída com sucesso!']);
        exit;
    }

    // C. Criar ou Atualizar Vaga
    if ($action === 'save' || $action === 'create' || $action === 'update') {
        $id = (int) ($payload['id'] ?? 0);
        $title = trim($payload['title'] ?? '');
        $company = trim($payload['company'] ?? '');
        $type = in_array($payload['type'] ?? '', ['estagio', 'jovem_aprendiz', 'junior', 'trainee', 'outro'], true) ? $payload['type'] : 'estagio';
        $modality = in_array($payload['modality'] ?? '', ['remoto', 'hibrido', 'presencial'], true) ? $payload['modality'] : 'remoto';
        $area = trim($payload['area'] ?? 'tecnologia');
        $stateVal = trim($payload['state'] ?? 'BR');
        $city = trim($payload['city'] ?? '');
        $salary = trim($payload['salary'] ?? '');
        $description = trim($payload['description'] ?? '');
        $requirements = trim($payload['requirements'] ?? '');
        $benefits = trim($payload['benefits'] ?? '');
        $applyUrl = trim($payload['apply_url'] ?? '');
        $sourceName = trim($payload['source_name'] ?? 'Oficial');
        $deadline = trim($payload['deadline'] ?? 'Inscrições Abertas');
        $isActive = isset($payload['is_active']) ? ((int) $payload['is_active'] ? 1 : 0) : 1;

        if (empty($title) || empty($company) || empty($applyUrl)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Título, Empresa e Link de Inscrição são obrigatórios.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($id > 0) {
            // Update
            if ($pdo) {
                try {
                    $stmt = $pdo->prepare("
                        UPDATE `job_vacancies` SET 
                            title = ?, company = ?, type = ?, modality = ?, area = ?, state = ?, city = ?, 
                            salary = ?, description = ?, requirements = ?, benefits = ?, apply_url = ?, 
                            source_name = ?, deadline = ?, is_active = ?
                        WHERE id = ?
                    ");
                    $stmt->execute([
                        $title, $company, $type, $modality, $area, $stateVal, $city,
                        $salary, $description, $requirements, $benefits, $applyUrl,
                        $sourceName, $deadline, $isActive, $id
                    ]);
                } catch (Exception $e) {}
            }

            $all = loadJobsFromCache($cacheFile, $seedFile);
            foreach ($all as &$j) {
                if ((int) $j['id'] === $id) {
                    $j = array_merge($j, [
                        'title' => $title, 'company' => $company, 'type' => $type, 'modality' => $modality,
                        'area' => $area, 'state' => $stateVal, 'city' => $city, 'salary' => $salary,
                        'description' => $description, 'requirements' => $requirements, 'benefits' => $benefits,
                        'apply_url' => $applyUrl, 'source_name' => $sourceName, 'deadline' => $deadline,
                        'is_active' => $isActive
                    ]);
                    break;
                }
            }
            saveJobsToCache($cacheFile, $all);

            echo json_encode(['success' => true, 'message' => 'Oportunidade atualizada com sucesso!', 'id' => $id]);
            exit;
        } else {
            // Create
            $newId = time();
            if ($pdo) {
                try {
                    $stmt = $pdo->prepare("
                        INSERT INTO `job_vacancies` 
                        (title, company, type, modality, area, state, city, salary, description, requirements, benefits, apply_url, source_name, deadline, is_active)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ");
                    $stmt->execute([
                        $title, $company, $type, $modality, $area, $stateVal, $city,
                        $salary, $description, $requirements, $benefits, $applyUrl,
                        $sourceName, $deadline, $isActive
                    ]);
                    $newId = (int) $pdo->lastInsertId();
                } catch (Exception $e) {}
            }

            $all = loadJobsFromCache($cacheFile, $seedFile);
            $newJob = [
                'id' => $newId,
                'title' => $title,
                'company' => $company,
                'type' => $type,
                'modality' => $modality,
                'area' => $area,
                'state' => $stateVal,
                'city' => $city,
                'salary' => $salary,
                'description' => $description,
                'requirements' => $requirements,
                'benefits' => $benefits,
                'apply_url' => $applyUrl,
                'source_name' => $sourceName,
                'deadline' => $deadline,
                'is_active' => $isActive,
                'views_count' => 0,
                'clicks_count' => 0,
                'created_at' => date('Y-m-d H:i:s')
            ];
            array_unshift($all, $newJob);
            saveJobsToCache($cacheFile, $all);

            echo json_encode(['success' => true, 'message' => 'Nova oportunidade cadastrada com sucesso no mural!', 'id' => $newId]);
            exit;
        }
    }
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Ação não reconhecida.']);
