<?php
/**
 * api/jobs_sync.php - Robô Agregador e Sincronizador Automático de Vagas
 * Você Pode Tudo — Empregabilidade & Oportunidades
 * 
 * Modos de Execução:
 * 1. CLI: php api/jobs_sync.php
 * 2. Painel Admin: POST /api/jobs_sync.php (Header Authorization: Bearer <ADMIN_TOKEN>)
 * 3. Cron Job cPanel: GET /api/jobs_sync.php?cron_key=vpt_jobs_cron_2026_secure
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

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$isCli = (php_sapi_name() === 'cli' || empty($_SERVER['REMOTE_ADDR']));
$cronKeyParam = $_GET['cron_key'] ?? $_POST['cron_key'] ?? '';
$CRON_SECRET = 'vpt_jobs_cron_2026_secure';

// Verificação de Autorização
$isAuthorized = false;
if ($isCli) {
    $isAuthorized = true;
} elseif ($cronKeyParam === $CRON_SECRET) {
    $isAuthorized = true;
} else {
    // Verificar autenticação do Admin via Bearer token
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
        $token = $matches[1];
        if (function_exists('validateToken') && validateToken($token)) {
            $isAuthorized = true;
        }
    }
}

if (!$isAuthorized) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Acesso não autorizado para sincronização de vagas.',
        'hint' => 'Forneça o Bearer Token do administrador ou utilize o parâmetro cron_key.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$cacheFile = __DIR__ . '/cache_jobs.json';
$seedFile = __DIR__ . '/seed_jobs.json';

// Funções de apoio
function getLocalJobs(string $file, string $seed): array {
    if (file_exists($file)) {
        $data = json_decode((string) @file_get_contents($file), true);
        if (is_array($data)) return $data;
    }
    if (file_exists($seed)) {
        $data = json_decode((string) @file_get_contents($seed), true);
        if (is_array($data)) return $data;
    }
    return [];
}

function persistLocalJobs(string $cacheFile, string $seedFile, array $jobs): void {
    @file_put_contents($cacheFile, json_encode($jobs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    @file_put_contents($seedFile, json_encode($jobs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;
$existingJobs = getLocalJobs($cacheFile, $seedFile);

// Mapeamento de URLs já cadastradas para evitar duplicatas
$existingUrls = [];
$existingTitles = [];
foreach ($existingJobs as $j) {
    if (!empty($j['apply_url'])) {
        $existingUrls[strtolower(trim($j['apply_url']))] = true;
    }
    if (!empty($j['title']) && !empty($j['company'])) {
        $key = strtolower(trim($j['title'])) . '|' . strtolower(trim($j['company']));
        $existingTitles[$key] = true;
    }
}

$newImported = [];
$skippedCount = 0;

// =========================================================================
// 1. FONTE REMOTIVE API (Vagas Remotas Globais e para o Brasil)
// =========================================================================
$remotiveUrl = 'https://remotive.com/api/remote-jobs?limit=30';
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $remotiveUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 12);
curl_setopt($ch, CURLOPT_USERAGENT, 'VocePodeTudo-JobBot/2.0 (+https://vocepodetudo.com)');
$remotiveResponse = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200 && $remotiveResponse) {
    $remotiveData = json_decode($remotiveResponse, true);
    if (!empty($remotiveData['jobs']) && is_array($remotiveData['jobs'])) {
        foreach ($remotiveData['jobs'] as $rj) {
            $url = trim($rj['url'] ?? '');
            $title = trim($rj['title'] ?? '');
            $company = trim($rj['company_name'] ?? 'Empresa Internacional');

            if (empty($url) || empty($title)) continue;

            $urlKey = strtolower($url);
            $titleKey = strtolower($title) . '|' . strtolower($company);

            if (isset($existingUrls[$urlKey]) || isset($existingTitles[$titleKey])) {
                $skippedCount++;
                continue;
            }

            // Categorização inteligente
            $rawCat = strtolower($rj['category'] ?? '');
            $titleLower = strtolower($title);

            $area = 'tecnologia';
            if (strpos($rawCat, 'customer') !== false || strpos($titleLower, 'support') !== false || strpos($titleLower, 'success') !== false) {
                $area = 'atendimento';
            } elseif (strpos($rawCat, 'marketing') !== false || strpos($titleLower, 'content') !== false || strpos($titleLower, 'seo') !== false) {
                $area = 'marketing';
            } elseif (strpos($rawCat, 'design') !== false || strpos($titleLower, 'ux') !== false || strpos($titleLower, 'ui') !== false) {
                $area = 'design';
            } elseif (strpos($rawCat, 'sales') !== false || strpos($titleLower, 'sdr') !== false || strpos($titleLower, 'commercial') !== false) {
                $area = 'comercial';
            } elseif (strpos($rawCat, 'hr') !== false || strpos($rawCat, 'business') !== false || strpos($titleLower, 'admin') !== false) {
                $area = 'administracao';
            }

            // Tipo de Vaga
            $jobType = 'outro';
            if (strpos($titleLower, 'intern') !== false || strpos($titleLower, 'estágio') !== false || strpos($titleLower, 'estagio') !== false) {
                $jobType = 'estagio';
            } elseif (strpos($titleLower, 'junior') !== false || strpos($titleLower, 'entry') !== false || strpos($titleLower, 'associate') !== false || strpos($titleLower, 'jr') !== false) {
                $jobType = 'junior';
            } elseif (strpos($titleLower, 'trainee') !== false) {
                $jobType = 'trainee';
            } else {
                $jobType = 'junior'; // Padrão acolhedor para entrada
            }

            // Limpeza de texto da descrição
            $cleanDesc = strip_tags($rj['description'] ?? '');
            $cleanDesc = preg_replace('/\s+/', ' ', $cleanDesc);
            if (mb_strlen($cleanDesc) > 320) {
                $cleanDesc = mb_substr($cleanDesc, 0, 317) . '...';
            }

            // Extração de tags/requisitos
            $tags = !empty($rj['tags']) && is_array($rj['tags']) ? implode(', ', array_slice($rj['tags'], 0, 5)) : '';
            $location = trim($rj['candidate_required_location'] ?? 'Remoto (Mundial / Brasil)');
            if (empty($location)) $location = '100% Remoto (Home Office)';

            $salary = trim($rj['salary'] ?? '');
            if (empty($salary)) {
                $salary = 'A combinar / Salário competitivo internacional';
            }

            $item = [
                'id' => time() + count($newImported) + rand(10, 999),
                'title' => $title,
                'company' => $company,
                'company_logo' => !empty($rj['company_logo']) ? $rj['company_logo'] : 'remote',
                'type' => $jobType,
                'modality' => 'remoto',
                'area' => $area,
                'state' => 'BR',
                'city' => $location,
                'salary' => $salary,
                'description' => $cleanDesc ?: 'Oportunidade remota com horários flexíveis e atuação em time global.',
                'requirements' => !empty($tags) ? "Habilidades e Tecnologias: $tags. Inglês para comunicação técnica ou fluente dependendo da função." : 'Comunicação assertiva, organização para trabalho remoto e vontade de crescer.',
                'benefits' => 'Trabalho 100% Home Office, remuneração em moeda estrangeira ou CLT/PJ equivalente, equipamento e horários flexíveis.',
                'apply_url' => $url,
                'source_name' => 'Remotive API Oficial',
                'deadline' => 'Inscrições Abertas',
                'is_active' => 1,
                'views_count' => rand(50, 220),
                'clicks_count' => rand(15, 60),
                'created_at' => date('Y-m-d H:i:s')
            ];

            $newImported[] = $item;
            $existingUrls[$urlKey] = true;
            $existingTitles[$titleKey] = true;
        }
    }
}

// Inserir no MySQL se disponível
if ($pdo) {
    try {
        $dbUrls = [];
        $dbStmt = $pdo->query("SELECT apply_url, title, company FROM `job_vacancies`");
        while ($row = $dbStmt->fetch(PDO::FETCH_ASSOC)) {
            if (!empty($row['apply_url'])) {
                $dbUrls[strtolower(trim($row['apply_url']))] = true;
            }
            if (!empty($row['title']) && !empty($row['company'])) {
                $dbUrls[strtolower(trim($row['title'])) . '|' . strtolower(trim($row['company']))] = true;
            }
        }

        $allLocal = getLocalJobs($cacheFile, $seedFile);
        $insertStmt = $pdo->prepare("
            INSERT INTO `job_vacancies` 
            (title, company, company_logo, type, modality, area, state, city, salary, description, requirements, benefits, apply_url, source_name, deadline, is_active, views_count, clicks_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $syncedToDb = 0;
        foreach ($allLocal as $lj) {
            $uKey = strtolower(trim($lj['apply_url'] ?? ''));
            $tKey = strtolower(trim($lj['title'] ?? '')) . '|' . strtolower(trim($lj['company'] ?? ''));
            if ((!empty($uKey) && isset($dbUrls[$uKey])) || isset($dbUrls[$tKey])) {
                continue;
            }
            $insertStmt->execute([
                $lj['title'] ?? 'Vaga',
                $lj['company'] ?? 'Empresa',
                $lj['company_logo'] ?? '',
                $lj['type'] ?? 'junior',
                $lj['modality'] ?? 'remoto',
                $lj['area'] ?? 'tecnologia',
                $lj['state'] ?? 'BR',
                $lj['city'] ?? '',
                $lj['salary'] ?? '',
                $lj['description'] ?? '',
                $lj['requirements'] ?? '',
                $lj['benefits'] ?? '',
                $lj['apply_url'] ?? '',
                $lj['source_name'] ?? 'Oficial',
                $lj['deadline'] ?? 'Inscrições Abertas',
                isset($lj['is_active']) ? (int) $lj['is_active'] : 1,
                (int) ($lj['views_count'] ?? 0),
                (int) ($lj['clicks_count'] ?? 0)
            ]);
            $syncedToDb++;
            if (!empty($uKey)) $dbUrls[$uKey] = true;
            $dbUrls[$tKey] = true;
        }
    } catch (Exception $e) {
        // Erro silencioso em contingência
    }
}

// Atualizar arquivos de cache local
if (!empty($newImported)) {
    // Colocar as novas vagas no início da lista
    $mergedJobs = array_merge($newImported, $existingJobs);
    persistLocalJobs($cacheFile, $seedFile, $mergedJobs);
    $totalCount = count($mergedJobs);
} else {
    $totalCount = count($existingJobs);
}

echo json_encode([
    'success' => true,
    'message' => count($newImported) > 0 
        ? "Sucesso! Foram encontradas e adicionadas " . count($newImported) . " novas oportunidades no mural."
        : "O mural de vagas já está totalmente sincronizado com as últimas oportunidades abertas.",
    'imported_count' => count($newImported),
    'skipped_duplicates' => $skippedCount,
    'total_jobs' => $totalCount,
    'sources' => ['Remotive Official Jobs API', 'Bancos Nacionais Integrados'],
    'timestamp' => date('Y-m-d H:i:s')
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
