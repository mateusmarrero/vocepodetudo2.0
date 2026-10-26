<?php
/**
 * API de Cursos (Leitura Pública & Gravação Restrita a Administradores)
 * Portal Você Pode Tudo
 * 
 * Suporta modo duplo: Banco MySQL ativo ou Contingência Resiliente JSON
 */

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? ($method === 'POST' ? 'create' : ($method === 'DELETE' ? 'delete' : 'list'));
$pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;
$cacheFile = __DIR__ . '/cache_courses.json';

// Obter dados de entrada (JSON, POST ou GET)
$rawInput = file_get_contents('php://input');
$inputData = json_decode($rawInput, true) ?? $_POST;
if (empty($inputData)) {
    $inputData = $_GET;
}

function loadCourseFileData($cacheFile) {
    if (file_exists($cacheFile)) {
        $data = @json_decode(@file_get_contents($cacheFile), true);
        if (is_array($data)) return $data;
    }
    return [];
}

function saveCourseFileData($cacheFile, $data) {
    @file_put_contents($cacheFile, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

switch ($action) {
    case 'list':
        $isAdminRequest = !empty($_GET['admin']) || !empty($_GET['all']);
        $courses = [];

        if ($pdo) {
            try {
                $whereClause = $isAdminRequest ? "1=1" : "is_active = 1";
                $stmt = $pdo->query("
                    SELECT 
                        id, title, provider, provider_tag AS providerTag, provider_color AS providerColor,
                        category, description, url, workload_hours AS workloadHours,
                        has_free_certificate AS hasFreeCertificate, certificate_note AS certificateNote,
                        level, tags, featured, rating, reviews_count AS reviewsCount,
                        is_active AS isActive, created_at AS createdAt
                    FROM courses 
                    WHERE {$whereClause}
                    ORDER BY featured DESC, rating DESC, id DESC
                ");

                $rows = $stmt->fetchAll();
                $courses = array_map(function($c) {
                    return [
                        'id' => $c['id'],
                        'title' => $c['title'],
                        'provider' => $c['provider'],
                        'providerTag' => $c['providerTag'] ?: substr($c['provider'], 0, 15),
                        'providerColor' => $c['providerColor'] ?: 'bg-slate-100 text-slate-800 border-slate-300 font-bold',
                        'category' => $c['category'],
                        'categoryName' => $c['category'],
                        'description' => $c['description'] ?: '',
                        'url' => $c['url'],
                        'workloadHours' => (int) $c['workloadHours'],
                        'hasFreeCertificate' => (bool) $c['hasFreeCertificate'],
                        'certificateNote' => $c['certificateNote'] ?: ($c['hasFreeCertificate'] ? 'Certificado 100% Gratuito' : 'Modo Ouvinte Gratuito'),
                        'level' => $c['level'] ?: 'Iniciante',
                        'tags' => !empty($c['tags']) ? (json_decode($c['tags'], true) ?: array_map('trim', explode(',', $c['tags']))) : [],
                        'featured' => (bool) $c['featured'],
                        'rating' => (float) ($c['rating'] ?: 5.0),
                        'reviewsCount' => (int) ($c['reviewsCount'] ?: 100),
                        'isActive' => (bool) ($c['isActive'] ?? true)
                    ];
                }, $rows);
            } catch (Exception $e) {
                $courses = [];
            }
        }

        if (empty($courses)) {
            $fileCourses = loadCourseFileData($cacheFile);
            if ($isAdminRequest) {
                $courses = $fileCourses;
            } else {
                $courses = array_values(array_filter($fileCourses, function($c) {
                    return !isset($c['isActive']) || $c['isActive'] === true;
                }));
            }
        }

        jsonResponse([
            'success' => true,
            'count' => count($courses),
            'courses' => $courses
        ]);
        break;

    case 'create':
        requireAuth();

        $title = trim($inputData['title'] ?? '');
        $provider = trim($inputData['provider'] ?? '');
        $category = trim($inputData['category'] ?? 'tecnologia');
        $url = trim($inputData['url'] ?? '');
        $workloadHours = (int) ($inputData['workloadHours'] ?? 20);
        $hasFreeCert = !empty($inputData['hasFreeCertificate']) ? 1 : 0;
        $level = trim($inputData['level'] ?? 'Iniciante');
        $desc = trim($inputData['description'] ?? '');
        $featured = !empty($inputData['featured']) ? 1 : 0;

        if (empty($title) || empty($provider) || empty($url)) {
            jsonResponse(['error' => true, 'message' => 'Título, instituição e link oficial são obrigatórios.'], 400);
        }

        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            jsonResponse(['error' => true, 'message' => 'O link informado não é uma URL válida.'], 400);
        }

        $id = 'curso-' . time() . '-' . mt_rand(100, 999);
        $providerTag = mb_substr($provider, 0, 15);
        $providerColor = 'bg-emerald-50 text-emerald-900 border-emerald-300 font-black';
        $tagsJson = json_encode(['Oficial', 'Novo', $provider], JSON_UNESCAPED_UNICODE);
        $certNote = $hasFreeCert ? 'Certificado 100% Gratuito' : 'Modo Ouvinte Gratuito';

        $newCourse = [
            'id' => $id,
            'title' => $title,
            'provider' => $provider,
            'providerTag' => $providerTag,
            'providerColor' => $providerColor,
            'category' => $category,
            'categoryName' => $category,
            'description' => $desc,
            'url' => $url,
            'workloadHours' => $workloadHours,
            'hasFreeCertificate' => (bool)$hasFreeCert,
            'certificateNote' => $certNote,
            'level' => $level,
            'tags' => ['Oficial', 'Novo', $provider],
            'featured' => (bool)$featured,
            'rating' => 5.0,
            'reviewsCount' => 1,
            'isActive' => true
        ];

        if ($pdo) {
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO courses (
                        id, title, provider, provider_tag, provider_color, category, 
                        description, url, workload_hours, has_free_certificate, 
                        certificate_note, level, tags, featured, rating, reviews_count, is_active
                    ) VALUES (
                        ?, ?, ?, ?, ?, ?, 
                        ?, ?, ?, ?, 
                        ?, ?, ?, ?, 5.0, 1, 1
                    )
                ");
                $stmt->execute([
                    $id, $title, $provider, $providerTag, $providerColor, $category,
                    $desc, $url, $workloadHours, $hasFreeCert,
                    $certNote, $level, $tagsJson, $featured
                ]);
            } catch (Exception $e) {}
        }

        // Salvar também no arquivo JSON de contingência
        $fileCourses = loadCourseFileData($cacheFile);
        array_unshift($fileCourses, $newCourse);
        saveCourseFileData($cacheFile, $fileCourses);

        jsonResponse([
            'success' => true,
            'message' => 'Curso adicionado com sucesso ao catálogo!',
            'course' => $newCourse
        ], 201);
        break;

    case 'update':
        requireAuth();

        $id = trim($inputData['id'] ?? '');
        $title = trim($inputData['title'] ?? '');
        $provider = trim($inputData['provider'] ?? '');
        $category = trim($inputData['category'] ?? '');
        $url = trim($inputData['url'] ?? '');
        $workloadHours = isset($inputData['workloadHours']) ? (int)$inputData['workloadHours'] : null;
        $hasFreeCert = isset($inputData['hasFreeCertificate']) ? (!empty($inputData['hasFreeCertificate']) ? 1 : 0) : null;
        $desc = isset($inputData['description']) ? trim($inputData['description']) : null;
        $featured = isset($inputData['featured']) ? (!empty($inputData['featured']) ? 1 : 0) : null;

        if (empty($id)) {
            jsonResponse(['error' => true, 'message' => 'ID do curso obrigatório.'], 400);
        }

        if ($pdo) {
            try {
                $stmt = $pdo->prepare("
                    UPDATE courses SET
                        title = COALESCE(NULLIF(?, ''), title),
                        provider = COALESCE(NULLIF(?, ''), provider),
                        category = COALESCE(NULLIF(?, ''), category),
                        url = COALESCE(NULLIF(?, ''), url),
                        workload_hours = COALESCE(?, workload_hours),
                        has_free_certificate = COALESCE(?, has_free_certificate),
                        description = COALESCE(?, description),
                        featured = COALESCE(?, featured)
                    WHERE id = ?
                ");
                $stmt->execute([
                    $title, $provider, $category, $url,
                    $workloadHours, $hasFreeCert, $desc, $featured,
                    $id
                ]);
            } catch (Exception $e) {}
        }

        $fileCourses = loadCourseFileData($cacheFile);
        foreach ($fileCourses as &$c) {
            if ($c['id'] === $id) {
                if ($title) $c['title'] = $title;
                if ($provider) $c['provider'] = $provider;
                if ($category) { $c['category'] = $category; $c['categoryName'] = $category; }
                if ($url) $c['url'] = $url;
                if ($workloadHours !== null) $c['workloadHours'] = $workloadHours;
                if ($hasFreeCert !== null) $c['hasFreeCertificate'] = (bool)$hasFreeCert;
                if ($desc !== null) $c['description'] = $desc;
                if ($featured !== null) $c['featured'] = (bool)$featured;
                break;
            }
        }
        saveCourseFileData($cacheFile, $fileCourses);

        jsonResponse([
            'success' => true,
            'message' => 'Curso atualizado com sucesso!'
        ]);
        break;

    case 'toggle':
        requireAuth();

        $id = trim($inputData['id'] ?? '');
        if (empty($id)) {
            jsonResponse(['error' => true, 'message' => 'ID do curso não informado.'], 400);
        }

        $newState = true;

        if ($pdo) {
            try {
                $stmt = $pdo->prepare("UPDATE courses SET is_active = IF(is_active = 1, 0, 1) WHERE id = ?");
                $stmt->execute([$id]);
                $stmtCheck = $pdo->prepare("SELECT is_active FROM courses WHERE id = ?");
                $stmtCheck->execute([$id]);
                $newState = ((int)$stmtCheck->fetchColumn()) === 1;
            } catch (Exception $e) {}
        }

        $fileCourses = loadCourseFileData($cacheFile);
        foreach ($fileCourses as &$c) {
            if ($c['id'] === $id) {
                $c['isActive'] = !($c['isActive'] ?? true);
                $newState = $c['isActive'];
                break;
            }
        }
        saveCourseFileData($cacheFile, $fileCourses);

        jsonResponse([
            'success' => true,
            'message' => $newState ? 'Curso ativado com sucesso.' : 'Curso pausado/desativado do catálogo.',
            'isActive' => $newState
        ]);
        break;

    case 'delete':
        requireAuth();

        $courseId = trim($inputData['id'] ?? '');
        if (empty($courseId)) {
            jsonResponse(['error' => true, 'message' => 'ID do curso não informado.'], 400);
        }

        if ($pdo) {
            try {
                $stmt = $pdo->prepare("UPDATE courses SET is_active = 0 WHERE id = ?");
                $stmt->execute([$courseId]);
            } catch (Exception $e) {}
        }

        $fileCourses = loadCourseFileData($cacheFile);
        foreach ($fileCourses as &$c) {
            if ($c['id'] === $courseId) {
                $c['isActive'] = false;
                break;
            }
        }
        saveCourseFileData($cacheFile, $fileCourses);

        jsonResponse([
            'success' => true,
            'message' => 'Curso desativado do catálogo com sucesso.'
        ]);
        break;

    default:
        jsonResponse(['error' => true, 'message' => 'Ação não reconhecida.'], 405);
}
