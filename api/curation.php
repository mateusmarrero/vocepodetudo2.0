<?php
/**
 * API Administrativa de Curadoria e Gestão de Cursos Pendentes
 * Portal Você Pode Tudo
 * 
 * Exclusivo para Administradores Autenticados (RBAC Enforcement)
 */

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? ($method === 'POST' ? 'approve' : 'pending');

// Permite visualizadores consultarem as listas; mutações exigem admin pleno
$isWriteAction = in_array($action, ['approve', 'reject', 'update_draft'], true);
$adminUser = requireAdmin(!$isWriteAction);

$pendingFile = dirname(__DIR__) . '/curadoria_pendente/cursos_pendentes.json';
$approvedFile = dirname(__DIR__) . '/curadoria_pendente/historico_aprovados.json';
$rejectedFile = dirname(__DIR__) . '/curadoria_pendente/historico_rejeitados.json';
$auditLogFile = dirname(__DIR__) . '/curadoria_pendente/curation_audit.log';
$cacheFile = __DIR__ . '/cache_courses.json';
$coursesJsFile = dirname(__DIR__) . '/src/data/courses.js';
$indexHtmlFile = dirname(__DIR__) . '/index.html';

// Obter entrada JSON ou POST
$rawInput = file_get_contents('php://input');
$inputData = json_decode($rawInput, true) ?? $_POST;
if (empty($inputData)) {
    $inputData = $_GET;
}

function loadJsonArrayFile($filePath) {
    if (file_exists($filePath)) {
        $content = @file_get_contents($filePath);
        $data = @json_decode($content, true);
        if (is_array($data)) return $data;
    }
    return [];
}

function saveJsonArrayFile($filePath, $data) {
    $dir = dirname($filePath);
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    @file_put_contents($filePath, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

function writeCurationAuditLog($logFile, $adminUsername, $actionType, $details) {
    $dir = dirname($logFile);
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    $timestamp = date('c');
    $logLine = sprintf("[%s] ADMIN: %s | AÇÃO: %s | %s\n", $timestamp, $adminUsername, $actionType, $details);
    @file_put_contents($logFile, $logLine, FILE_APPEND);
}

switch ($action) {
    // -------------------------------------------------------------
    // 1. LISTAR CURSOS PENDENTES NA FILA
    // -------------------------------------------------------------
    case 'pending':
    case 'list':
        $pendingCourses = loadJsonArrayFile($pendingFile);
        $cacheCourses = loadJsonArrayFile($cacheFile);
        $activeIds = array_flip(array_column($cacheCourses, 'id'));

        $pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;
        if ($pdo) {
            try {
                $dbIds = $pdo->query("SELECT id FROM courses")->fetchAll(PDO::FETCH_COLUMN);
                foreach ($dbIds as $dId) {
                    $activeIds[$dId] = true;
                }
            } catch (Exception $e) {}
        }

        // Remove da fila pendente qualquer curso que já esteja ativo no catálogo (desaparece da fila)
        $initialCount = count($pendingCourses);
        $pendingCourses = array_values(array_filter($pendingCourses, function($c) use ($activeIds) {
            return !isset($activeIds[$c['id']]);
        }));

        if (count($pendingCourses) !== $initialCount) {
            saveJsonArrayFile($pendingFile, $pendingCourses);
        }
        
        $stats = [
            'totalPending' => count($pendingCourses),
            'confirmedFree' => 0,
            'confirmedCert' => 0,
            'needReview' => 0
        ];

        foreach ($pendingCourses as $c) {
            if (($c['pricingStatus'] ?? '') === 'GRATUITO_CONFIRMADO') {
                $stats['confirmedFree']++;
            }
            if (!empty($c['hasFreeCertificate']) || ($c['certificateStatus'] ?? '') === 'CERTIFICADO_GRATUITO_CONFIRMADO') {
                $stats['confirmedCert']++;
            } else {
                $stats['needReview']++;
            }
        }

        jsonResponse([
            'success' => true,
            'stats' => $stats,
            'courses' => $pendingCourses
        ], 200);
        break;

    // -------------------------------------------------------------
    // 2. APROVAR CURSO E PUBLICAR NO CATÁLOGO
    // -------------------------------------------------------------
    case 'approve':
        if ($method !== 'POST') {
            jsonResponse(['error' => true, 'message' => 'Método inválido para aprovação.'], 405);
        }

        $courseId = trim($inputData['id'] ?? '');
        if (empty($courseId)) {
            jsonResponse(['error' => true, 'message' => 'Identificador do curso não informado.'], 400);
        }

        $pendingCourses = loadJsonArrayFile($pendingFile);
        $targetIndex = -1;
        $courseData = null;

        foreach ($pendingCourses as $idx => $c) {
            if (($c['id'] ?? '') === $courseId) {
                $targetIndex = $idx;
                $courseData = $c;
                break;
            }
        }

        if (!$courseData) {
            jsonResponse(['error' => true, 'message' => 'Curso não encontrado na fila de pendentes.'], 404);
        }

        // Permite ao administrador sobrescrever campos durante a aprovação
        $title = trim($inputData['title'] ?? $courseData['title']);
        $provider = trim($inputData['provider'] ?? $courseData['provider']);
        $category = trim($inputData['category'] ?? $courseData['category']);
        $url = trim($inputData['url'] ?? $courseData['url']);
        $workloadHours = (int) ($inputData['workloadHours'] ?? $courseData['workloadHours'] ?? 20);
        $hasFreeCert = isset($inputData['hasFreeCertificate']) ? (bool) $inputData['hasFreeCertificate'] : !empty($courseData['hasFreeCertificate']);
        $certNote = trim($inputData['certificateNote'] ?? ($hasFreeCert ? 'Certificado Oficial Gratuito' : 'Modo Ouvinte Gratuito'));
        $level = trim($inputData['level'] ?? $courseData['level'] ?? 'Iniciante');
        $desc = trim($inputData['description'] ?? $courseData['description'] ?? '');
        $featured = !empty($inputData['featured']) ? 1 : 0;

        if (empty($title) || empty($provider) || empty($url)) {
            jsonResponse(['error' => true, 'message' => 'Título, instituição e URL são obrigatórios para publicação.'], 400);
        }

        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            jsonResponse(['error' => true, 'message' => 'A URL informada é inválida.'], 400);
        }

        $providerTag = mb_substr($provider, 0, 15);
        $providerColor = $courseData['providerColor'] ?? 'bg-slate-50 text-slate-800 border-slate-300 font-black';
        $tags = isset($inputData['tags']) && is_array($inputData['tags']) 
            ? $inputData['tags'] 
            : ($courseData['tags'] ?? ['Oficial', $provider]);
        $tagsJson = json_encode($tags, JSON_UNESCAPED_UNICODE);

        $pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;

        // 1. Verificação de Duplicata no Banco de Dados
        if ($pdo) {
            try {
                $checkStmt = $pdo->prepare("SELECT id FROM courses WHERE id = ? OR url = ? LIMIT 1");
                $checkStmt->execute([$courseId, $url]);
                if ($existing = $checkStmt->fetch()) {
                    // O curso já está no banco de dados! Remove imediatamente da fila de pendentes
                    array_splice($pendingCourses, $targetIndex, 1);
                    saveJsonArrayFile($pendingFile, $pendingCourses);

                    jsonResponse([
                        'success' => true,
                        'alreadyActive' => true,
                        'message' => 'Curso já cadastrado no catálogo ativo e removido da fila de curadoria com sucesso!',
                        'remainingPending' => count($pendingCourses)
                    ], 200);
                }
            } catch (Exception $e) {}
        }

        // 2. Gravação no Banco MariaDB (Transação Atômica)
        $dbSaved = false;
        if ($pdo) {
            try {
                $pdo->beginTransaction();

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
                    $courseId, $title, $provider, $providerTag, $providerColor, $category,
                    $desc, $url, $workloadHours, $hasFreeCert ? 1 : 0,
                    $certNote, $level, $tagsJson, $featured
                ]);

                $pdo->commit();
                $dbSaved = true;
            } catch (Exception $e) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                jsonResponse(['error' => true, 'message' => 'Erro ao persistir no MariaDB: ' . $e->getMessage()], 500);
            }
        }

        // 3. Montar Objeto Publicado
        $publishedCourse = [
            'id' => $courseId,
            'title' => $title,
            'provider' => $provider,
            'providerTag' => $providerTag,
            'providerColor' => $providerColor,
            'category' => $category,
            'categoryName' => $category,
            'description' => $desc,
            'url' => $url,
            'workloadHours' => $workloadHours,
            'hasFreeCertificate' => $hasFreeCert,
            'certificateNote' => $certNote,
            'level' => $level,
            'tags' => $tags,
            'featured' => (bool)$featured,
            'rating' => 5.0,
            'reviewsCount' => 1,
            'isActive' => true
        ];

        // 4. Atualizar Cache de Contingência (api/cache_courses.json)
        $cacheCourses = loadJsonArrayFile($cacheFile);
        // Evita duplicatas no cache
        $cacheCourses = array_values(array_filter($cacheCourses, function($c) use ($courseId) {
            return ($c['id'] ?? '') !== $courseId;
        }));
        array_unshift($cacheCourses, $publishedCourse);
        saveJsonArrayFile($cacheFile, $cacheCourses);

        // 5. Remover da Fila de Pendentes
        array_splice($pendingCourses, $targetIndex, 1);
        saveJsonArrayFile($pendingFile, $pendingCourses);

        // 6. Arquivar em Histórico de Aprovados
        $approvedHistory = loadJsonArrayFile($approvedFile);
        $courseData['approvedAt'] = date('c');
        $courseData['approvedBy'] = $adminUser['user'] ?? 'admin';
        $courseData['finalData'] = $publishedCourse;
        array_unshift($approvedHistory, $courseData);
        saveJsonArrayFile($approvedFile, $approvedHistory);

        // 7. Log de Auditoria
        writeCurationAuditLog(
            $auditLogFile, 
            $adminUser['user'] ?? 'admin', 
            'APROVAÇÃO', 
            sprintf("Curso '%s' (ID: %s, %s) aprovado e publicado. BD: %s.", $title, $courseId, $provider, $dbSaved ? 'SIM' : 'MODO_CACHE')
        );

        jsonResponse([
            'success' => true,
            'message' => 'Curso aprovado e publicado com sucesso no catálogo!',
            'course' => $publishedCourse,
            'remainingPending' => count($pendingCourses)
        ], 200);
        break;

    // -------------------------------------------------------------
    // 3. REJEITAR CURSO COM MOTIVO OBRIGATÓRIO
    // -------------------------------------------------------------
    case 'reject':
        if ($method !== 'POST') {
            jsonResponse(['error' => true, 'message' => 'Método inválido para rejeição.'], 405);
        }

        $courseId = trim($inputData['id'] ?? '');
        $reason = trim($inputData['reason'] ?? '');

        if (empty($courseId)) {
            jsonResponse(['error' => true, 'message' => 'Identificador do curso não informado.'], 400);
        }

        if (empty($reason)) {
            jsonResponse(['error' => true, 'message' => 'O motivo da rejeição é obrigatório para auditoria.'], 400);
        }

        $pendingCourses = loadJsonArrayFile($pendingFile);
        $targetIndex = -1;
        $courseData = null;

        foreach ($pendingCourses as $idx => $c) {
            if (($c['id'] ?? '') === $courseId) {
                $targetIndex = $idx;
                $courseData = $c;
                break;
            }
        }

        if (!$courseData) {
            jsonResponse(['error' => true, 'message' => 'Curso não encontrado na fila de pendentes.'], 404);
        }

        // Remover da fila de pendentes
        array_splice($pendingCourses, $targetIndex, 1);
        saveJsonArrayFile($pendingFile, $pendingCourses);

        // Arquivar no Histórico de Rejeitados com motivo
        $rejectedHistory = loadJsonArrayFile($rejectedFile);
        $rejectedEntry = [
            'id' => $courseId,
            'title' => $courseData['title'] ?? '',
            'provider' => $courseData['provider'] ?? '',
            'url' => $courseData['url'] ?? '',
            'rejectionReason' => $reason,
            'rejectedAt' => date('c'),
            'rejectedBy' => $adminUser['user'] ?? 'admin',
            'originalData' => $courseData
        ];
        array_unshift($rejectedHistory, $rejectedEntry);
        saveJsonArrayFile($rejectedFile, $rejectedHistory);

        // Log de Auditoria
        writeCurationAuditLog(
            $auditLogFile, 
            $adminUser['user'] ?? 'admin', 
            'REJEIÇÃO', 
            sprintf("Curso '%s' (ID: %s) rejeitado. Motivo: '%s'.", $courseData['title'] ?? $courseId, $courseId, $reason)
        );

        jsonResponse([
            'success' => true,
            'message' => 'Curso rejeitado e registrado no histórico de auditoria com sucesso.',
            'remainingPending' => count($pendingCourses)
        ], 200);
        break;

    // -------------------------------------------------------------
    // 4. ATUALIZAR RASCUNHO PENDENTE SEM APROVAR
    // -------------------------------------------------------------
    case 'update_draft':
        if ($method !== 'POST') {
            jsonResponse(['error' => true, 'message' => 'Método inválido.'], 405);
        }

        $courseId = trim($inputData['id'] ?? '');
        if (empty($courseId)) {
            jsonResponse(['error' => true, 'message' => 'ID não informado.'], 400);
        }

        $pendingCourses = loadJsonArrayFile($pendingFile);
        $found = false;

        foreach ($pendingCourses as &$c) {
            if (($c['id'] ?? '') === $courseId) {
                if (isset($inputData['title'])) $c['title'] = trim($inputData['title']);
                if (isset($inputData['provider'])) $c['provider'] = trim($inputData['provider']);
                if (isset($inputData['category'])) $c['category'] = trim($inputData['category']);
                if (isset($inputData['url'])) $c['url'] = trim($inputData['url']);
                if (isset($inputData['workloadHours'])) $c['workloadHours'] = (int) $inputData['workloadHours'];
                if (isset($inputData['hasFreeCertificate'])) $c['hasFreeCertificate'] = (bool) $inputData['hasFreeCertificate'];
                if (isset($inputData['certificateNote'])) $c['certificateNote'] = trim($inputData['certificateNote']);
                if (isset($inputData['description'])) $c['description'] = trim($inputData['description']);
                $c['updatedAt'] = date('c');
                $found = true;
                break;
            }
        }

        if (!$found) {
            jsonResponse(['error' => true, 'message' => 'Curso não encontrado na fila.'], 404);
        }

        saveJsonArrayFile($pendingFile, $pendingCourses);

        writeCurationAuditLog(
            $auditLogFile,
            $adminUser['user'] ?? 'admin',
            'ATUALIZACAO_RASCUNHO',
            sprintf("Rascunho de curso '%s' retificado.", $courseId)
        );

        jsonResponse(['success' => true, 'message' => 'Rascunho atualizado com sucesso.'], 200);
        break;

    // -------------------------------------------------------------
    // 5. HISTÓRICO DE AUDITORIA (APROVADOS E REJEITADOS)
    // -------------------------------------------------------------
    case 'history':
        $approved = loadJsonArrayFile($approvedFile);
        $rejected = loadJsonArrayFile($rejectedFile);

        jsonResponse([
            'success' => true,
            'approvedCount' => count($approved),
            'rejectedCount' => count($rejected),
            'approvedRecent' => array_slice($approved, 0, 20),
            'rejectedRecent' => array_slice($rejected, 0, 20)
        ], 200);
        break;

    default:
        jsonResponse(['error' => true, 'message' => 'Ação de curadoria desconhecida.'], 404);
        break;
}
