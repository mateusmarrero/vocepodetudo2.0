<?php
/**
 * api/social_autopost.php
 * Publicador Automático para LinkedIn, Instagram e Facebook (3x ao dia)
 * Portal Você Pode Tudo — Curadoria de Cursos Gratuitos
 */

declare(strict_types=1);

date_default_timezone_set('America/Sao_Paulo');
ob_start();

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

$CRON_SECRET = 'vpt_social_cron_2026_secure';
$configFile = __DIR__ . '/config_social.json';
$historyFile = __DIR__ . '/cache_social_history.json';
$coursesCacheFile = __DIR__ . '/cache_courses.json';
$coursesSeedFile = __DIR__ . '/seed_courses.json';

$action = $_GET['action'] ?? $_POST['action'] ?? 'get_config';
$isCli = (php_sapi_name() === 'cli' || empty($_SERVER['REMOTE_ADDR']));
$cronKeyParam = $_GET['cron_key'] ?? $_POST['cron_key'] ?? '';

// =========================================================================
// CONTROLE DE ACESSO
// =========================================================================
$isAuthorized = false;
if ($isCli) {
    $isAuthorized = true;
    $action = $argv[1] ?? 'run';
} elseif (in_array($action, ['run', 'check_video_caps'], true) && $cronKeyParam === $CRON_SECRET) {
    $isAuthorized = true;
} else {
    // Exige sessão de administrador via Bearer Token
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
        if (function_exists('verifyToken') && verifyToken($matches[1])) {
            $isAuthorized = true;
        }
    }
}

if (!$isAuthorized) {
    if (ob_get_length()) ob_clean();
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Acesso não autorizado ao módulo de Redes Sociais.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// =========================================================================
// HELPERS DE CONFIGURAÇÃO, HISTÓRICO E CURSOS
// =========================================================================
function getSocialConfig(string $file): array {
    $default = [
        'facebook' => [
            'enabled' => false,
            'page_id' => '',
            'access_token' => ''
        ],
        'instagram' => [
            'enabled' => false,
            'ig_user_id' => '',
            'access_token' => ''
        ],
        'linkedin' => [
            'enabled' => false,
            'author_urn' => '',
            'access_token' => ''
        ],
        'updated_at' => date('c')
    ];
    if (file_exists($file)) {
        $data = json_decode((string)@file_get_contents($file), true);
        if (is_array($data)) {
            return array_replace_recursive($default, $data);
        }
    }
    return $default;
}

function saveSocialConfig(string $file, array $cfg): bool {
    $cfg['updated_at'] = date('c');
    return @file_put_contents($file, json_encode($cfg, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) !== false;
}

function maskSecret(string $val): string {
    $len = strlen($val);
    if ($len === 0) return '';
    if ($len <= 10) return str_repeat('*', $len);
    return substr($val, 0, 5) . str_repeat('*', min(12, $len - 9)) . substr($val, -4);
}

function loadSocialHistory(string $file): array {
    if (file_exists($file)) {
        $data = json_decode((string)@file_get_contents($file), true);
        if (is_array($data)) return $data;
    }
    return [];
}

function appendSocialHistory(string $file, array $entry): void {
    $hist = loadSocialHistory($file);
    array_unshift($hist, $entry);
    if (count($hist) > 60) {
        $hist = array_slice($hist, 0, 60);
    }
    @file_put_contents($file, json_encode($hist, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function loadActiveCourses(string $cacheFile, string $seedFile): array {
    $raw = [];
    if (file_exists($cacheFile)) {
        $raw = json_decode((string)@file_get_contents($cacheFile), true) ?: [];
    }
    if (empty($raw) && file_exists($seedFile)) {
        $raw = json_decode((string)@file_get_contents($seedFile), true) ?: [];
    }
    return array_values(array_filter($raw, function ($c) {
        return !empty($c['id']) && !empty($c['title']) && (!isset($c['isActive']) || $c['isActive']);
    }));
}

function loadActiveBlogPosts(): array {
    $cacheFile = __DIR__ . '/cache_blog.json';
    $seedFile = __DIR__ . '/seed_blog.json';
    $raw = [];
    if (file_exists($cacheFile)) {
        $raw = json_decode((string)@file_get_contents($cacheFile), true) ?: [];
    }
    if (empty($raw) && file_exists($seedFile)) {
        $raw = json_decode((string)@file_get_contents($seedFile), true) ?: [];
    }
    $now = date('Y-m-d H:i:s');
    return array_values(array_filter($raw, function ($p) use ($now) {
        $isPub = !isset($p['is_published']) || (int)$p['is_published'] === 1;
        $dt = (string)($p['created_at'] ?? '2026-01-01 00:00:00');
        return $isPub && $dt <= $now && !empty($p['slug']) && !empty($p['title']);
    }));
}

function pickRandomCourse(array $courses, array $history): ?array {
    if (empty($courses)) return null;
    $recentIds = array_slice(array_column($history, 'course_id'), 0, 12);
    $candidates = array_values(array_filter($courses, function ($c) use ($recentIds) {
        return !in_array($c['id'], $recentIds, true);
    }));
    if (empty($candidates)) {
        $candidates = $courses;
    }
    // Priorizar cursos que já possuem vídeo vertical Reels (.mp4) quando disponíveis
    $reelsCandidates = array_values(array_filter($candidates, function ($c) {
        return file_exists(__DIR__ . '/../assets/reels/' . basename((string)$c['id']) . '.mp4');
    }));
    if (!empty($reelsCandidates)) {
        return $reelsCandidates[array_rand($reelsCandidates)];
    }
    return $candidates[array_rand($candidates)];
}

function pickRandomContentItem(array $courses, array $blogPosts, array $history, string $forceType = ''): ?array {
    $useBlog = false;
    if ($forceType === 'blog') {
        $useBlog = !empty($blogPosts);
    } elseif ($forceType !== 'course' && !empty($blogPosts)) {
        // Alternar / sortear entre cursos (~60%) e artigos do blog (~40%)
        $useBlog = (rand(1, 100) <= 40);
    }

    if ($useBlog) {
        $recentIds = array_slice(array_column($history, 'course_id'), 0, 20);
        $candidates = array_values(array_filter($blogPosts, function ($p) use ($recentIds) {
            return !in_array('blog:' . $p['slug'], $recentIds, true);
        }));
        if (empty($candidates)) $candidates = $blogPosts;
        $picked = $candidates[array_rand($candidates)];
        return ['type' => 'blog', 'id' => 'blog:' . $picked['slug'], 'data' => $picked];
    }

    $c = pickRandomCourse($courses, $history);
    if (!$c) return null;
    return ['type' => 'course', 'id' => (string)$c['id'], 'data' => $c];
}

function buildBlogPostContent(array $article, string $periodOverride = ''): array {
    $hour = (int)date('G');
    $period = $periodOverride ?: ($hour < 12 ? 'manha' : ($hour < 18 ? 'tarde' : 'noite'));
    $intros = [
        'manha' => '☀️ Leitura rápida da manhã para acelerar sua carreira:',
        'tarde' => '💡 Dica prática da tarde no Blog do Você Pode Tudo:',
        'noite' => '🌙 Leitura da noite para sair na frente no mercado de trabalho:'
    ];
    $intro = $intros[$period] ?? $intros['tarde'];
    $title = trim((string)$article['title']);
    $desc = trim((string)($article['excerpt'] ?? $article['summary'] ?? 'Confira o guia completo com dicas práticas e gratuitas no portal Você Pode Tudo.'));
    if (mb_strlen($desc, 'UTF-8') > 180) {
        $desc = mb_substr($desc, 0, 177, 'UTF-8') . '...';
    }
    $articleUrl = 'https://vocepodetudo.com/artigo/' . rawurlencode((string)$article['slug']);
    $img = resolveCourseImage(['imageUrl' => $article['cover_image'] ?? '']);

    $caption = "{$intro}\n\n"
        . "📰 {$title}\n\n"
        . "{$desc}\n\n"
        . "👉 Leia o artigo completo gratuitamente aqui:\n"
        . "{$articleUrl}\n\n"
        . "📲 Acompanhe o hub oficial: @hub.vocepodetudo\n\n"
        . "#Carreira #Emprego #DicasDeCarreira #BlogVocePodeTudo #Capacitacao";

    return [
        'period' => $period,
        'title' => $title,
        'provider' => 'Blog Você Pode Tudo',
        'url' => $articleUrl,
        'image_url' => $img,
        'caption' => $caption,
        'description' => $desc
    ];
}

function resolveCourseImage(array $course): string {
    $raw = trim((string)($course['imageUrl'] ?? ''));
    if (empty($raw)) {
        return 'https://vocepodetudo.com/assets/og-banner.jpg';
    }
    if (preg_match('#^https?://#i', $raw)) {
        if (strpos($raw, 'images.unsplash.com') !== false) {
            $base = explode('?', $raw)[0];
            return $base . '?w=1200&h=630&auto=format&fit=crop&q=85';
        }
        return $raw;
    }
    return 'https://vocepodetudo.com/' . ltrim($raw, './');
}

function buildPostContent(array $course, string $periodOverride = ''): array {
    $hour = (int)date('G');
    $period = $periodOverride ?: ($hour < 12 ? 'manha' : ($hour < 18 ? 'tarde' : 'noite'));

    $intros = [
        'manha' => [
            '☀️ Bom dia! Comece o dia investindo no seu currículo sem gastar nada:',
            '🚀 Bom dia! Que tal aproveitar a manhã para conquistar um novo certificado gratuito?',
            '📚 Comece a manhã aprendendo uma habilidade valorizada pelo mercado:'
        ],
        'tarde' => [
            '💡 Dica da tarde para turbinar o seu currículo gratuitamente:',
            '⚡ Pausa produtiva da tarde: curso 100% gratuito e online com inscrição aberta!',
            '🎯 Destaque da tarde no Você Pode Tudo para quem quer evoluir na carreira:'
        ],
        'noite' => [
            '🌙 Boa noite! Ainda dá tempo de começar um curso gratuito hoje mesmo:',
            '✨ Feche o dia investindo no seu futuro profissional sem pagar mensalidade:',
            '🎓 Dica da noite: capacitação 100% online para fazer no seu ritmo:'
        ]
    ];
    $pool = $intros[$period] ?? $intros['tarde'];
    $intro = $pool[array_rand($pool)];

    $title = trim((string)$course['title']);
    $provider = trim((string)($course['provider'] ?? 'Instituição Oficial'));
    $hours = (int)($course['workloadHours'] ?? 20);
    $hasCert = !empty($course['hasFreeCertificate']);
    $certLabel = $hasCert ? '✅ Certificado 100% Gratuito' : '✅ Aulas 100% Gratuitas';
    $desc = trim((string)($course['description'] ?? ''));
    if (mb_strlen($desc, 'UTF-8') > 180) {
        $desc = mb_substr($desc, 0, 177, 'UTF-8') . '...';
    }

    $courseUrl = 'https://vocepodetudo.com/curso/' . rawurlencode((string)$course['id']);
    $rawCat = strtr((string)($course['categoryName'] ?? 'Carreira'), [
        'á'=>'a','à'=>'a','ã'=>'a','â'=>'a','é'=>'e','ê'=>'e','í'=>'i','ó'=>'o','ô'=>'o','õ'=>'o','ú'=>'u','ü'=>'u','ç'=>'c',
        'Á'=>'A','À'=>'A','Ã'=>'A','Â'=>'A','É'=>'E','Ê'=>'E','Í'=>'I','Ó'=>'O','Ô'=>'O','Õ'=>'O','Ú'=>'U','Ü'=>'U','Ç'=>'C'
    ]);
    $catTag = preg_replace('/[^a-zA-Z0-9]/', '', $rawCat) ?: 'Carreira';

    $caption = "{$intro}\n\n"
        . "📌 {$title}\n"
        . "🏛 Instituição: {$provider}\n"
        . "⏱ Carga horária: {$hours}h (100% Online)\n"
        . "{$certLabel}\n\n"
        . "{$desc}\n\n"
        . "👉 Acesse a ementa completa e o link oficial de inscrição aqui:\n"
        . "{$courseUrl}\n\n"
        . "📲 Acompanhe o hub oficial: @hub.vocepodetudo\n\n"
        . "#CursosGratuitos #CapacitacaoProfissional #Emprego #Curriculo #VocePodeTudo #{$catTag}";

    return [
        'period' => $period,
        'title' => $title,
        'provider' => $provider,
        'url' => $courseUrl,
        'image_url' => resolveCourseImage($course),
        'caption' => $caption,
        'description' => $desc
    ];
}

function httpPostJson(string $url, array $payload, array $headers = []): array {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload, JSON_UNESCAPED_UNICODE));
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge(['Content-Type: application/json'], $headers));
    $resp = curl_exec($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    return ['code' => $code, 'body' => $resp, 'error' => $err];
}

function httpPostForm(string $url, array $fields): array {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($fields));
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);
    $resp = curl_exec($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    return ['code' => $code, 'body' => $resp, 'error' => $err];
}

// =========================================================================
// PUBLICADORES POR REDE SOCIAL
// =========================================================================
function publishToFacebook(array $cfg, array $post): array {
    if (empty($cfg['enabled']) || empty($cfg['page_id']) || empty($cfg['access_token'])) {
        return ['status' => 'skipped', 'message' => 'Facebook desativado ou sem credenciais'];
    }
    $url = 'https://graph.facebook.com/v21.0/' . rawurlencode($cfg['page_id']) . '/feed';
    $res = httpPostForm($url, [
        'message' => $post['caption'],
        'link' => $post['url'],
        'access_token' => $cfg['access_token']
    ]);
    $json = json_decode((string)$res['body'], true);
    if ($res['code'] >= 200 && $res['code'] < 300 && !empty($json['id'])) {
        return ['status' => 'ok', 'post_id' => $json['id']];
    }
    return ['status' => 'error', 'message' => $json['error']['message'] ?? $res['error'] ?? ('HTTP ' . $res['code'])];
}

function publishInstagramMediaContainer(string $igUserId, string $token, array $mediaFields, string $localVideoPath = ''): array {
    $createUrl = 'https://graph.facebook.com/v21.0/' . rawurlencode($igUserId) . '/media';
    $createRes = httpPostForm($createUrl, $mediaFields);
    $createJson = json_decode((string)$createRes['body'], true);
    if ($createRes['code'] < 200 || $createRes['code'] >= 300 || empty($createJson['id'])) {
        return ['status' => 'error', 'message' => $createJson['error']['message'] ?? $createRes['error'] ?? ('Container HTTP ' . $createRes['code'])];
    }

    $containerId = $createJson['id'];

    if (!empty($localVideoPath)) {
        $uploadUri = $createJson['uri'] ?? ('https://rupload.facebook.com/ig-api-upload/v21.0/' . rawurlencode($containerId));
        $fileBytes = @file_get_contents($localVideoPath);
        $fileSize = $fileBytes !== false ? strlen($fileBytes) : 0;
        if ($fileSize === 0) {
            return ['status' => 'error', 'message' => 'Arquivo de vídeo vazio ou ilegível.'];
        }

        $chUp = curl_init($uploadUri);
        curl_setopt($chUp, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($chUp, CURLOPT_POST, true);
        curl_setopt($chUp, CURLOPT_POSTFIELDS, $fileBytes);
        curl_setopt($chUp, CURLOPT_TIMEOUT, 60);
        curl_setopt($chUp, CURLOPT_HTTPHEADER, [
            'Authorization: OAuth ' . $token,
            'offset: 0',
            'file_size: ' . $fileSize
        ]);
        $upResp = curl_exec($chUp);
        $upCode = (int)curl_getinfo($chUp, CURLINFO_HTTP_CODE);
        $upErr = curl_error($chUp);
        curl_close($chUp);
        $upJson = json_decode((string)$upResp, true);

        if ($upCode < 200 || $upCode >= 300 || empty($upJson['success'])) {
            return ['status' => 'error', 'message' => 'Upload direto falhou: ' . ($upJson['debug_info']['message'] ?? $upErr ?: ('HTTP ' . $upCode . ' ' . $upResp))];
        }

        $statusUrl = 'https://graph.facebook.com/v21.0/' . rawurlencode($containerId) . '?fields=status,status_code&access_token=' . rawurlencode($token);
        $ready = false;
        for ($i = 0; $i < 12; $i++) {
            sleep(3);
            $ch = curl_init($statusUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 15);
            $stResp = curl_exec($ch);
            curl_close($ch);
            $stJson = json_decode((string)$stResp, true);
            $code = strtoupper((string)($stJson['status_code'] ?? ''));
            if ($code === 'FINISHED') {
                $ready = true;
                break;
            }
            if ($code === 'ERROR' || $code === 'EXPIRED') {
                $detail = !empty($stJson['status']) ? ' - ' . $stJson['status'] : '';
                return ['status' => 'error', 'message' => 'Processamento na Meta falhou (' . $code . $detail . ')'];
            }
        }
        if (!$ready) {
            return ['status' => 'error', 'message' => 'Tempo limite aguardando processamento do vídeo na Meta.'];
        }
    }

    $pubUrl = 'https://graph.facebook.com/v21.0/' . rawurlencode($igUserId) . '/media_publish';
    $pubRes = httpPostForm($pubUrl, [
        'creation_id' => $containerId,
        'access_token' => $token
    ]);
    $pubJson = json_decode((string)$pubRes['body'], true);
    if ($pubRes['code'] >= 200 && $pubRes['code'] < 300 && !empty($pubJson['id'])) {
        return ['status' => 'ok', 'post_id' => $pubJson['id'], 'media_type' => $mediaFields['media_type'] ?? 'IMAGE'];
    }
    return ['status' => 'error', 'message' => $pubJson['error']['message'] ?? $pubRes['error'] ?? ('Publish HTTP ' . $pubRes['code'])];
}

function publishToInstagram(array $cfg, array $post, string $fbFallbackToken = '', string $courseId = '', string $onlyMode = ''): array {
    $token = !empty($cfg['access_token']) ? $cfg['access_token'] : $fbFallbackToken;
    if (empty($cfg['enabled']) || empty($cfg['ig_user_id']) || empty($token)) {
        return ['status' => 'skipped', 'message' => 'Instagram desativado ou sem credenciais'];
    }

    $reelLocalPath = __DIR__ . '/../assets/reels/' . basename($courseId) . '.mp4';
    $hasReelVideo = !empty($courseId) && file_exists($reelLocalPath);

    if ($onlyMode === 'story') {
        if (!$hasReelVideo) {
            return ['status' => 'skipped', 'message' => 'Curso selecionado sem vídeo vertical para Story'];
        }
        return publishInstagramMediaContainer((string)$cfg['ig_user_id'], $token, [
            'media_type' => 'STORIES',
            'upload_type' => 'resumable',
            'access_token' => $token
        ], $reelLocalPath);
    }

    // 1. Publicação Principal (REELS se houver .mp4, ou Imagem padrão no Feed)
    $mediaFields = [
        'caption' => $post['caption'],
        'access_token' => $token
    ];
    if ($hasReelVideo) {
        $mediaFields['media_type'] = 'REELS';
        $mediaFields['upload_type'] = 'resumable';
        $mediaFields['share_to_feed'] = 'true';
    } else {
        $mediaFields['image_url'] = $post['image_url'];
    }

    $mainResult = publishInstagramMediaContainer((string)$cfg['ig_user_id'], $token, $mediaFields, $hasReelVideo ? $reelLocalPath : '');

    // 2. Publicar também nos Stories quando houver vídeo vertical 9:16 (.mp4)
    if ($hasReelVideo && $mainResult['status'] === 'ok') {
        $storyResult = publishInstagramMediaContainer((string)$cfg['ig_user_id'], $token, [
            'media_type' => 'STORIES',
            'upload_type' => 'resumable',
            'access_token' => $token
        ], $reelLocalPath);
        $mainResult['story'] = $storyResult;
    }

    return $mainResult;
}

function resolveLinkedInAuthorUrn(string $accessToken, string $configuredUrn = ''): string {
    $urn = trim($configuredUrn);
    if (!empty($urn) && strtolower($urn) !== 'auto') {
        return $urn;
    }
    $ch = curl_init('https://api.linkedin.com/v2/userinfo');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken]);
    $resp = curl_exec($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($code >= 200 && $code < 300 && $resp) {
        $data = json_decode((string)$resp, true);
        if (!empty($data['sub'])) {
            return 'urn:li:person:' . $data['sub'];
        }
    }
    return '';
}

function publishToLinkedIn(array $cfg, array $post): array {
    if (empty($cfg['enabled']) || empty($cfg['access_token'])) {
        return ['status' => 'skipped', 'message' => 'LinkedIn desativado ou sem token'];
    }
    $authorUrn = resolveLinkedInAuthorUrn((string)$cfg['access_token'], (string)($cfg['author_urn'] ?? ''));
    if (empty($authorUrn)) {
        return ['status' => 'error', 'message' => 'Não foi possível identificar o Author URN do LinkedIn (preencha ou verifique o scope openid/profile).'];
    }
    $url = 'https://api.linkedin.com/v2/ugcPosts';
    $payload = [
        'author' => $authorUrn,
        'lifecycleState' => 'PUBLISHED',
        'specificContent' => [
            'com.linkedin.ugc.ShareContent' => [
                'shareCommentary' => [
                    'text' => $post['caption']
                ],
                'shareMediaCategory' => 'ARTICLE',
                'media' => [
                    [
                        'status' => 'READY',
                        'description' => ['text' => $post['description'] ?: $post['title']],
                        'originalUrl' => $post['url'],
                        'title' => ['text' => $post['title'] . ' — ' . $post['provider']]
                    ]
                ]
            ]
        ],
        'visibility' => [
            'com.linkedin.ugc.MemberNetworkVisibility' => 'PUBLIC'
        ]
    ];

    $res = httpPostJson($url, $payload, [
        'Authorization: Bearer ' . $cfg['access_token'],
        'X-Restli-Protocol-Version: 2.0.0'
    ]);
    $json = json_decode((string)$res['body'], true);
    if ($res['code'] >= 200 && $res['code'] < 300) {
        return ['status' => 'ok', 'post_id' => $json['id'] ?? 'published'];
    }
    return ['status' => 'error', 'message' => $json['message'] ?? $res['error'] ?? ('HTTP ' . $res['code'])];
}

// =========================================================================
// ROTEAMENTO DE AÇÕES
// =========================================================================
if ($action === 'check_video_caps') {
    $disabled = array_map('trim', explode(',', (string)ini_get('disable_functions')));
    $canExec = function_exists('exec') && !in_array('exec', $disabled, true);
    $ffmpegPath = '';
    $ffmpegVer = '';
    if ($canExec) {
        @exec('which ffmpeg 2>/dev/null', $outPath);
        $ffmpegPath = trim((string)($outPath[0] ?? ''));
        if (!empty($ffmpegPath)) {
            @exec('ffmpeg -version 2>/dev/null | head -n 1', $outVer);
            $ffmpegVer = trim((string)($outVer[0] ?? ''));
        }
    }
    echo json_encode([
        'success' => true,
        'php_version' => PHP_VERSION,
        'can_exec' => $canExec,
        'ffmpeg_path' => $ffmpegPath,
        'ffmpeg_version' => $ffmpegVer,
        'gd_loaded' => extension_loaded('gd'),
        'imagick_loaded' => extension_loaded('imagick'),
        'max_execution_time' => ini_get('max_execution_time')
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'get_config') {
    $cfg = getSocialConfig($configFile);
    $history = loadSocialHistory($historyFile);
    $fallbackDate = (string)($cfg['updated_at'] ?? date('c'));
    $calcExpiry = function (array $netCfg) use ($fallbackDate): array {
        $hasTok = !empty($netCfg['access_token']);
        if (!$hasTok) return ['days_remaining' => null, 'expires_at' => null];
        $updatedAt = (string)($netCfg['token_updated_at'] ?? $fallbackDate);
        $ts = strtotime($updatedAt) ?: time();
        $expTs = $ts + (60 * 86400);
        $daysLeft = (int)floor(($expTs - time()) / 86400);
        return [
            'days_remaining' => max(0, $daysLeft),
            'expires_at' => date('Y-m-d', $expTs)
        ];
    };
    $fbExp = $calcExpiry($cfg['facebook'] ?? []);
    $igExp = $calcExpiry($cfg['instagram'] ?? []);
    $liExp = $calcExpiry($cfg['linkedin'] ?? []);

    echo json_encode([
        'success' => true,
        'config' => [
            'facebook' => [
                'enabled' => !empty($cfg['facebook']['enabled']),
                'page_id' => $cfg['facebook']['page_id'] ?? '',
                'has_token' => !empty($cfg['facebook']['access_token']),
                'token_masked' => maskSecret($cfg['facebook']['access_token'] ?? ''),
                'days_remaining' => $fbExp['days_remaining'],
                'expires_at' => $fbExp['expires_at']
            ],
            'instagram' => [
                'enabled' => !empty($cfg['instagram']['enabled']),
                'ig_user_id' => $cfg['instagram']['ig_user_id'] ?? '',
                'has_token' => !empty($cfg['instagram']['access_token']),
                'token_masked' => maskSecret($cfg['instagram']['access_token'] ?? ''),
                'days_remaining' => $igExp['days_remaining'],
                'expires_at' => $igExp['expires_at']
            ],
            'linkedin' => [
                'enabled' => !empty($cfg['linkedin']['enabled']),
                'author_urn' => $cfg['linkedin']['author_urn'] ?? '',
                'has_token' => !empty($cfg['linkedin']['access_token']),
                'token_masked' => maskSecret($cfg['linkedin']['access_token'] ?? ''),
                'days_remaining' => $liExp['days_remaining'],
                'expires_at' => $liExp['expires_at']
            ],
            'updated_at' => $cfg['updated_at'] ?? ''
        ],
        'history' => array_slice($history, 0, 20)
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'save_config') {
    $input = json_decode((string)file_get_contents('php://input'), true) ?: $_POST;
    $current = getSocialConfig($configFile);

    foreach (['facebook', 'instagram', 'linkedin'] as $net) {
        if (isset($input[$net]) && is_array($input[$net])) {
            $current[$net]['enabled'] = !empty($input[$net]['enabled']);
            if (isset($input[$net]['page_id'])) $current[$net]['page_id'] = trim((string)$input[$net]['page_id']);
            if (isset($input[$net]['ig_user_id'])) $current[$net]['ig_user_id'] = trim((string)$input[$net]['ig_user_id']);
            if (isset($input[$net]['author_urn'])) $current[$net]['author_urn'] = trim((string)$input[$net]['author_urn']);

            $newTok = trim((string)($input[$net]['access_token'] ?? ''));
            if ($newTok !== '' && strpos($newTok, '****') === false) {
                $current[$net]['access_token'] = $newTok;
                $current[$net]['token_updated_at'] = date('c');
            }
        }
    }

    saveSocialConfig($configFile, $current);
    echo json_encode(['success' => true, 'message' => 'Configurações das redes sociais salvas com segurança.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'preview') {
    $courses = loadActiveCourses($coursesCacheFile, $coursesSeedFile);
    $blogPosts = loadActiveBlogPosts();
    $history = loadSocialHistory($historyFile);
    $picked = pickRandomContentItem($courses, $blogPosts, $history, (string)($_GET['type'] ?? ''));
    if (!$picked) {
        echo json_encode(['success' => false, 'error' => 'Nenhum conteúdo ativo encontrado.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $post = $picked['type'] === 'blog'
        ? buildBlogPostContent($picked['data'], (string)($_GET['period'] ?? ''))
        : buildPostContent($picked['data'], (string)($_GET['period'] ?? ''));
    echo json_encode(['success' => true, 'preview' => $post, 'course_id' => $picked['id'], 'content_type' => $picked['type']], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'run' || $action === 'test_post') {
    $cfg = getSocialConfig($configFile);
    $courses = loadActiveCourses($coursesCacheFile, $coursesSeedFile);
    $blogPosts = loadActiveBlogPosts();
    $history = loadSocialHistory($historyFile);
    $picked = pickRandomContentItem($courses, $blogPosts, $history, (string)($_GET['type'] ?? ''));

    if (!$picked) {
        if (($_GET['silent'] ?? '') === '1') { http_response_code(200); exit; }
        echo json_encode(['success' => false, 'error' => 'Nenhum conteúdo ativo encontrado para postagem.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $post = $picked['type'] === 'blog'
        ? buildBlogPostContent($picked['data'], (string)($_GET['period'] ?? ''))
        : buildPostContent($picked['data'], (string)($_GET['period'] ?? ''));
    $reelId = $picked['type'] === 'course' ? $picked['id'] : '';

    $onlyNet = strtolower(trim((string)($_GET['only'] ?? '')));
    $results = [
        'facebook' => (!$onlyNet || $onlyNet === 'facebook') ? publishToFacebook($cfg['facebook'] ?? [], $post) : ['status' => 'skipped', 'message' => 'Ignorado por filtro only'],
        'instagram' => (!$onlyNet || $onlyNet === 'instagram' || $onlyNet === 'story') ? publishToInstagram($cfg['instagram'] ?? [], $post, $cfg['facebook']['access_token'] ?? '', $reelId, $onlyNet) : ['status' => 'skipped', 'message' => 'Ignorado por filtro only'],
        'linkedin' => (!$onlyNet || $onlyNet === 'linkedin') ? publishToLinkedIn($cfg['linkedin'] ?? [], $post) : ['status' => 'skipped', 'message' => 'Ignorado por filtro only']
    ];

    $anyOk = ($results['facebook']['status'] === 'ok' || $results['instagram']['status'] === 'ok' || $results['linkedin']['status'] === 'ok');

    appendSocialHistory($historyFile, [
        'timestamp' => date('c'),
        'period' => $post['period'],
        'content_type' => $picked['type'],
        'course_id' => $picked['id'],
        'course_title' => $post['title'],
        'course_url' => $post['url'],
        'results' => $results
    ]);

    if (ob_get_length()) ob_clean();
    if (($_GET['silent'] ?? $_POST['silent'] ?? '') === '1') {
        http_response_code(200);
        exit;
    }

    echo json_encode([
        'success' => true,
        'published_any' => $anyOk,
        'content_type' => $picked['type'],
        'course_id' => $picked['id'],
        'course_title' => $post['title'],
        'period' => $post['period'],
        'results' => $results
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['success' => false, 'error' => 'Ação inválida.'], JSON_UNESCAPED_UNICODE);
