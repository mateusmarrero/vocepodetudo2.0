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
                // Carregar cache local para enriquecer com imagens fotográficas por assunto
                $fileCoursesForImages = loadCourseFileData($cacheFile);
                $imageMap = [];
                foreach ($fileCoursesForImages as $fc) {
                    if (!empty($fc['id']) && !empty($fc['imageUrl'])) {
                        $imageMap[$fc['id']] = $fc['imageUrl'];
                    }
                }

                if ($isAdminRequest) {
                    $stmt = $pdo->query("
                        SELECT 
                            id, title, provider, provider_tag AS providerTag, provider_color AS providerColor,
                            category, description, url, workload_hours AS workloadHours,
                            has_free_certificate AS hasFreeCertificate, certificate_note AS certificateNote,
                            level, tags, featured, rating, reviews_count AS reviewsCount,
                            is_active AS isActive, created_at AS createdAt
                        FROM courses 
                        ORDER BY featured DESC, rating DESC, id DESC
                    ");
                } else {
                    $stmt = $pdo->prepare("
                        SELECT 
                            id, title, provider, provider_tag AS providerTag, provider_color AS providerColor,
                            category, description, url, workload_hours AS workloadHours,
                            has_free_certificate AS hasFreeCertificate, certificate_note AS certificateNote,
                            level, tags, featured, rating, reviews_count AS reviewsCount,
                            is_active AS isActive, created_at AS createdAt
                        FROM courses 
                        WHERE is_active = 1
                        ORDER BY featured DESC, rating DESC, id DESC
                    ");
                    $stmt->execute();
                }

                $rows = $stmt->fetchAll();
                $courses = array_map(function($c) use ($imageMap) {
                    $cid = $c['id'];
                    return [
                        'id' => $cid,
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
                        'isActive' => (bool) ($c['isActive'] ?? true),
                        'imageUrl' => $imageMap[$cid] ?? null
                    ];
                }, $rows);
            } catch (Exception $e) {
                $courses = [];
            }
        }

        // Sincronizar e complementar com a base oficial de cursos se houver cursos novos
        $fileCourses = loadCourseFileData($cacheFile);
        if (empty($fileCourses)) {
            $seedFile = __DIR__ . '/seed_courses.json';
            $fileCourses = loadCourseFileData($seedFile);
            if (!empty($fileCourses)) {
                saveCourseFileData($cacheFile, $fileCourses);
            }
        }

        if (!empty($fileCourses)) {
            $existingIds = !empty($courses) ? array_flip(array_column($courses, 'id')) : [];
            $missingCourses = [];
            foreach ($fileCourses as $fc) {
                if (!isset($existingIds[$fc['id']])) {
                    $courses[] = $fc;
                    $missingCourses[] = $fc;
                }
            }

            // Se o MySQL estiver ativo e houver cursos novos no catálogo, auto-persiste no MySQL
            if ($pdo && !empty($missingCourses)) {
                try {
                    $insStmt = $pdo->prepare("
                        INSERT IGNORE INTO courses (
                            id, title, provider, provider_tag, provider_color, category, 
                            description, url, workload_hours, has_free_certificate, 
                            certificate_note, level, tags, featured, rating, reviews_count, is_active
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ");
                    foreach ($missingCourses as $mc) {
                        $tagsVal = is_array($mc['tags'] ?? null) ? json_encode($mc['tags'], JSON_UNESCAPED_UNICODE) : ($mc['tags'] ?? '[]');
                        $insStmt->execute([
                            $mc['id'],
                            $mc['title'],
                            $mc['provider'] ?? 'Instituição Parceira',
                            $mc['providerTag'] ?? $mc['provider'] ?? 'Curso',
                            $mc['providerColor'] ?? 'bg-slate-100 text-slate-800 border-slate-300 font-bold',
                            $mc['category'] ?? 'geral',
                            $mc['description'] ?? '',
                            $mc['url'] ?? 'https://vocepodetudo.com/',
                            (int)($mc['workloadHours'] ?? 20),
                            !empty($mc['hasFreeCertificate']) ? 1 : 0,
                            $mc['certificateNote'] ?? 'Certificado Gratuito',
                            $mc['level'] ?? 'Iniciante',
                            $tagsVal,
                            !empty($mc['featured']) ? 1 : 0,
                            (float)($mc['rating'] ?? 4.9),
                            (int)($mc['reviewsCount'] ?? 100),
                            1
                        ]);
                    }
                } catch (Throwable $e) {
                    error_log('Erro ao auto-sincronizar cursos no MySQL: ' . $e->getMessage());
                }
            }
        }

        if (!$isAdminRequest) {
            $courses = array_values(array_filter($courses, function($c) {
                return !isset($c['isActive']) || $c['isActive'] === true;
            }));
        }

        // Suporte opcional a paginação via parâmetros ?page=1&limit=12
        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : null;
        $limit = isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : null;
        $totalCourses = count($courses);

        if ($page !== null && $limit !== null) {
            $offset = ($page - 1) * $limit;
            $pagedCourses = array_slice($courses, $offset, $limit);
            $hasMore = ($offset + $limit) < $totalCourses;
            jsonResponse([
                'success' => true,
                'count' => count($pagedCourses),
                'total' => $totalCourses,
                'page' => $page,
                'limit' => $limit,
                'hasMore' => $hasMore,
                'courses' => $pagedCourses
            ]);
            break;
        }

        jsonResponse([
            'success' => true,
            'count' => $totalCourses,
            'courses' => $courses
        ]);
        break;

    case 'institutions':
        // Relação agregada de instituições com cursos gratuitos já adicionados
        $fileCourses = loadCourseFileData($cacheFile);
        if (empty($fileCourses) || count($fileCourses) < 50) {
            $seedFile = __DIR__ . '/seed_courses.json';
            $fileCourses = loadCourseFileData($seedFile);
        }

        $institutions = [];
        $totalActive = 0;
        $totalCert = 0;
        $totalHours = 0;

        foreach ($fileCourses as $c) {
            if (isset($c['isActive']) && $c['isActive'] === false) continue;
            $prov = trim($c['provider'] ?? 'Não informado');
            if (!isset($institutions[$prov])) {
                $institutions[$prov] = [
                    'name' => $prov,
                    'providerTag' => $c['providerTag'] ?? substr($prov, 0, 15),
                    'totalCourses' => 0,
                    'freeCertificates' => 0,
                    'totalHours' => 0,
                    'categories' => []
                ];
            }
            $institutions[$prov]['totalCourses']++;
            $totalActive++;
            if (!empty($c['hasFreeCertificate'])) {
                $institutions[$prov]['freeCertificates']++;
                $totalCert++;
            }
            $hrs = (int) ($c['workloadHours'] ?? 0);
            $institutions[$prov]['totalHours'] += $hrs;
            $totalHours += $hrs;

            $cat = $c['categoryName'] ?? ($c['category'] ?? '');
            if ($cat && !in_array($cat, $institutions[$prov]['categories'])) {
                $institutions[$prov]['categories'][] = $cat;
            }
        }

        usort($institutions, function($a, $b) {
            return $b['totalCourses'] <=> $a['totalCourses'];
        });

        jsonResponse([
            'success' => true,
            'totalInstitutions' => count($institutions),
            'totalCourses' => $totalActive,
            'totalFreeCertificates' => $totalCert,
            'totalHours' => $totalHours,
            'institutions' => array_values($institutions)
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

    case 'check_url':
        requireAdminRead();

        $targetUrl = trim($inputData['url'] ?? '');
        if (empty($targetUrl) || !filter_var($targetUrl, FILTER_VALIDATE_URL)) {
            jsonResponse(['error' => true, 'message' => 'URL inválida ou não fornecida.'], 400);
        }

        $resolvedIp = null;
        if (!isSafePublicUrl($targetUrl, $resolvedIp)) {
            jsonResponse([
                'error' => true,
                'message' => 'Acesso bloqueado: A URL fornecida aponta para um endereço privado, reservado ou não seguro (Anti-SSRF).'
            ], 403);
        }

        $ch = curl_init($targetUrl);
        curl_setopt($ch, CURLOPT_NOBODY, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 6);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 4);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false); // Anti-SSRF: validação de cada salto sem aceitar loopback
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (VocePodeTudo-Auditor/5.0)');
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
        if (defined('CURLPROTO_HTTP') && defined('CURLPROTO_HTTPS')) {
            curl_setopt($ch, CURLOPT_PROTOCOLS, CURLPROTO_HTTP | CURLPROTO_HTTPS);
            curl_setopt($ch, CURLOPT_REDIR_PROTOCOLS, CURLPROTO_HTTP | CURLPROTO_HTTPS);
        }
        curl_exec($ch);
        $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $redirectUrl = (string) curl_getinfo($ch, CURLINFO_REDIRECT_URL);
        $curlError = curl_error($ch);
        curl_close($ch);

        $status = 'ok';
        if ($httpCode === 0 || $httpCode >= 400) {
            $status = 'broken';
        } elseif ($httpCode >= 300 && $httpCode < 400) {
            $status = 'redirect';
            if (!empty($redirectUrl) && !isSafePublicUrl($redirectUrl)) {
                $status = 'broken';
                $curlError = 'Redirecionamento bloqueado por segurança para destino não público (Anti-SSRF).';
            }
        }

        jsonResponse([
            'success' => true,
            'url' => $targetUrl,
            'httpCode' => $httpCode,
            'status' => $status,
            'resolvedIp' => $resolvedIp,
            'redirectUrl' => $redirectUrl ?: null,
            'error' => $curlError ?: null
        ]);
        break;

    default:
        jsonResponse(['error' => true, 'message' => 'Ação não reconhecida.'], 405);
}
