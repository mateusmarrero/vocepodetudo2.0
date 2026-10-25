<?php
/**
 * API de Cursos (Leitura Pública & Gravação Restrita a Administradores)
 * Portal Você Pode Tudo
 */

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDBConnection();

switch ($method) {
    case 'GET':
        // Leitura Pública: Retorna todos os cursos ativos
        try {
            $stmt = $pdo->query("
                SELECT 
                    id,
                    title,
                    provider,
                    provider_tag AS providerTag,
                    provider_color AS providerColor,
                    category,
                    description,
                    url,
                    workload_hours AS workloadHours,
                    has_free_certificate AS hasFreeCertificate,
                    certificate_note AS certificateNote,
                    level,
                    tags,
                    featured,
                    rating,
                    reviews_count AS reviewsCount,
                    created_at AS createdAt
                FROM courses 
                WHERE is_active = 1 
                ORDER BY featured DESC, rating DESC, id DESC
            ");

            $rows = $stmt->fetchAll();

            // Formatar tipos de dados para o padrão do frontend
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
                    'reviewsCount' => (int) ($c['reviewsCount'] ?: 100)
                ];
            }, $rows);

            jsonResponse([
                'success' => true,
                'count' => count($courses),
                'courses' => $courses
            ]);
        } catch (PDOException $e) {
            error_log("Erro ao buscar cursos: " . $e->getMessage());
            jsonResponse(['error' => true, 'message' => 'Erro ao consultar catálogo no banco.'], 500);
        }
        break;

    case 'POST':
        // Gravação Restrita: Somente Administrador Autenticado
        requireAuth();

        $rawInput = file_get_contents('php://input');
        $data = json_decode($rawInput, true) ?? $_POST;

        $title = trim($data['title'] ?? '');
        $provider = trim($data['provider'] ?? '');
        $category = trim($data['category'] ?? 'tecnologia');
        $url = trim($data['url'] ?? '');
        $workloadHours = (int) ($data['workloadHours'] ?? 20);
        $hasFreeCert = !empty($data['hasFreeCertificate']) ? 1 : 0;
        $level = trim($data['level'] ?? 'Iniciante');
        $desc = trim($data['description'] ?? '');

        // Validações de segurança
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

        try {
            $stmt = $pdo->prepare("
                INSERT INTO courses (
                    id, title, provider, provider_tag, provider_color, category, 
                    description, url, workload_hours, has_free_certificate, 
                    certificate_note, level, tags, featured, rating, reviews_count, is_active
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, 
                    ?, ?, ?, ?, 
                    ?, ?, ?, 1, 5.0, 1, 1
                )
            ");

            $certNote = $hasFreeCert ? 'Certificado 100% Gratuito' : 'Modo Ouvinte Gratuito';

            $stmt->execute([
                $id,
                $title,
                $provider,
                $providerTag,
                $providerColor,
                $category,
                $desc,
                $url,
                $workloadHours,
                $hasFreeCert,
                $certNote,
                $level,
                $tagsJson
            ]);

            jsonResponse([
                'success' => true,
                'message' => 'Curso adicionado com sucesso no banco de dados MySQL!',
                'course' => [
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
                    'hasFreeCertificate' => (bool) $hasFreeCert,
                    'certificateNote' => $certNote,
                    'level' => $level,
                    'tags' => ['Oficial', 'Novo', $provider],
                    'featured' => true,
                    'rating' => 5.0,
                    'reviewsCount' => 1
                ]
            ], 201);
        } catch (PDOException $e) {
            error_log("Erro ao salvar curso no MySQL: " . $e->getMessage());
            jsonResponse(['error' => true, 'message' => 'Erro ao gravar curso no banco de dados.'], 500);
        }
        break;

    case 'DELETE':
        // Exclusão / Desativação: Somente Administrador Autenticado
        requireAuth();

        $courseId = trim($_GET['id'] ?? '');
        if (empty($courseId)) {
            jsonResponse(['error' => true, 'message' => 'ID do curso não informado.'], 400);
        }

        try {
            // Desativar logicamente (soft delete)
            $stmt = $pdo->prepare("UPDATE courses SET is_active = 0 WHERE id = ?");
            $stmt->execute([$courseId]);

            jsonResponse([
                'success' => true,
                'message' => 'Curso desativado do catálogo com sucesso.'
            ]);
        } catch (PDOException $e) {
            error_log("Erro ao desativar curso: " . $e->getMessage());
            jsonResponse(['error' => true, 'message' => 'Erro ao remover curso do banco.'], 500);
        }
        break;

    default:
        jsonResponse(['error' => true, 'message' => 'Método HTTP não suportado.'], 405);
}
