<?php
/**
 * API de Controle de Métricas & Analytics
 * Painel Administrativo do Portal Você Pode Tudo
 * 
 * Monitora em tempo real:
 * - Origem de visitantes: Estados do Brasil, Cidades Brasileiras e Países do Mundo
 * - Visualizações da Home (Catálogo)
 * - Visualizações de Trilhas de Aprendizagem
 * - Cursos mais acessados / clicados
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

$cacheFile = __DIR__ . '/cache_analytics.json';
$action = $_GET['action'] ?? 'stats';
$method = $_SERVER['REQUEST_METHOD'];

// Nomes completos dos estados do Brasil para exibição rica no dashboard
$brazilStateNames = [
    'SP' => 'São Paulo', 'RJ' => 'Rio de Janeiro', 'MG' => 'Minas Gerais', 'BA' => 'Bahia',
    'RS' => 'Rio Grande do Sul', 'PR' => 'Paraná', 'DF' => 'Distrito Federal', 'CE' => 'Ceará',
    'PE' => 'Pernambuco', 'SC' => 'Santa Catarina', 'GO' => 'Goiás', 'ES' => 'Espírito Santo',
    'PA' => 'Pará', 'MA' => 'Maranhão', 'MT' => 'Mato Grosso', 'MS' => 'Mato Grosso do Sul',
    'PB' => 'Paraíba', 'RN' => 'Rio Grande do Norte', 'AL' => 'Alagoas', 'PI' => 'Piauí',
    'AM' => 'Amazonas', 'SE' => 'Sergipe', 'RO' => 'Rondônia', 'TO' => 'Tocantins',
    'AC' => 'Acre', 'AP' => 'Amapá', 'RR' => 'Roraima'
];

// Nomes completos das 8 áreas profissionais do teste vocacional
$careerAreaTitles = [
    'tecnologia' => 'Tecnologia & Informática',
    'administracao' => 'Administração & Rotinas de Escritório',
    'comunicacao' => 'Atendimento ao Cliente & Comunicação',
    'criatividade' => 'Design, Criatividade & Conteúdo Digital',
    'vendas' => 'Empreendedorismo & Vendas',
    'tecnica' => 'Atividades Técnicas & Práticas Operacionais',
    'gestao' => 'Gestão, Liderança & Organização',
    'educacao' => 'Educação & Desenvolvimento Humano'
];

/**
 * Retorna os dados padrão consolidados caso o arquivo de métricas ainda não exista
 */
function getDefaultAnalyticsData() {
    return [
        'summary' => [
            'total_visits' => 0,
            'home_views' => 0,
            'tracks_views' => 0,
            'course_clicks' => 0,
            'total_favorites' => 0,
            'career_tests_count' => 0
        ],
        'locations_brazil_states' => [],
        'locations_brazil_cities' => [],
        'locations_world' => [],
        'top_courses' => [],
        'career_test_areas' => [],
        'traffic_sources' => [],
        'click_traffic_sources' => [],
        'click_origins_pages' => [],
        'device_types' => [],
        'utm_campaigns' => [],
        'recent_clicks' => [],
        'last_updated' => date('c')
    ];
}

/**
 * Classifica o canal de origem a partir de UTM ou Referrer
 */
function classifyTrafficSource($sourceInput = '', $referrer = '', $utmSource = '') {
    $src = trim((string) $sourceInput);
    if (!empty($src) && $src !== 'Desconhecido') {
        return mb_substr($src, 0, 80, 'UTF-8');
    }

    $utm = strtolower(trim((string) $utmSource));
    if (!empty($utm)) {
        if (strpos($utm, 'whatsapp') !== false || $utm === 'wa') return 'WhatsApp';
        if (strpos($utm, 'instagram') !== false || $utm === 'ig') return 'Instagram';
        if (strpos($utm, 'facebook') !== false || $utm === 'fb') return 'Facebook';
        if (strpos($utm, 'tiktok') !== false) return 'TikTok';
        if (strpos($utm, 'google') !== false) return 'Google Ads / Busca';
        if (strpos($utm, 'youtube') !== false || $utm === 'yt') return 'YouTube';
        if (strpos($utm, 'linkedin') !== false) return 'LinkedIn';
        if (strpos($utm, 'email') !== false || strpos($utm, 'newsletter') !== false) return 'Newsletter / E-mail';
        return 'UTM: ' . ucfirst(mb_substr($utm, 0, 50, 'UTF-8'));
    }

    $ref = strtolower(trim((string) $referrer));
    if (empty($ref)) {
        return 'Acesso Direto';
    }

    $host = parse_url($ref, PHP_URL_HOST) ?: $ref;
    $host = preg_replace('/^www\./', '', $host);

    if (strpos($host, 'vocepodetudo.com') !== false || strpos($host, 'localhost') !== false) {
        return 'Navegação Interna';
    }
    if (strpos($host, 'google.') !== false) return 'Google Orgânico';
    if (strpos($host, 'bing.com') !== false || strpos($host, 'yahoo.') !== false || strpos($host, 'duckduckgo.') !== false) return 'Outros Buscadores (Bing/Yahoo)';
    if (strpos($host, 'chatgpt.com') !== false || strpos($host, 'openai.com') !== false || strpos($host, 'perplexity.ai') !== false || strpos($host, 'claude.ai') !== false || strpos($host, 'copilot.microsoft.com') !== false || strpos($host, 'gemini.google.com') !== false) return 'Buscadores IA (ChatGPT/Perplexity/Gemini)';
    if (strpos($host, 'instagram.com') !== false) return 'Instagram';
    if (strpos($host, 'facebook.com') !== false || strpos($host, 'fb.com') !== false) return 'Facebook';
    if (strpos($host, 'whatsapp.com') !== false || strpos($host, 'wa.me') !== false) return 'WhatsApp';
    if (strpos($host, 'tiktok.com') !== false) return 'TikTok';
    if (strpos($host, 'youtube.com') !== false || strpos($host, 'youtu.be') !== false) return 'YouTube';
    if (strpos($host, 'linkedin.com') !== false || strpos($host, 'lnkd.in') !== false) return 'LinkedIn';
    if (strpos($host, 't.co') !== false || strpos($host, 'twitter.com') !== false || strpos($host, 'x.com') !== false) return 'X (Twitter)';

    return 'Referência: ' . mb_substr($host, 0, 60, 'UTF-8');
}

/**
 * Detecta tipo de dispositivo do visitante
 */
function detectDeviceType($clientDevice = '', $userAgent = '') {
    $dev = trim((string) $clientDevice);
    if (in_array($dev, ['Celular (Mobile)', 'Computador (Desktop)', 'Tablet'], true)) {
        return $dev;
    }
    $ua = strtolower((string) $userAgent);
    if (empty($ua)) return 'Computador (Desktop)';
    if (preg_match('/(ipad|tablet|playbook|silk)|(android(?!.*mobile))/i', $ua)) {
        return 'Tablet';
    }
    if (preg_match('/(mobi|iphone|ipod|android|blackberry|opera mini|iemobile)/i', $ua)) {
        return 'Celular (Mobile)';
    }
    return 'Computador (Desktop)';
}

/**
 * Lê os dados atuais do arquivo local
 */
function loadAnalyticsData($cacheFile) {
    if (file_exists($cacheFile)) {
        $content = @file_get_contents($cacheFile);
        if ($content) {
            $data = json_decode($content, true);
            if (is_array($data) && isset($data['summary'])) {
                $arrayKeys = [
                    'locations_brazil_states', 'locations_brazil_cities', 'locations_world',
                    'top_courses', 'career_test_areas', 'traffic_sources',
                    'click_traffic_sources', 'click_origins_pages', 'device_types',
                    'utm_campaigns', 'recent_clicks'
                ];
                foreach ($arrayKeys as $key) {
                    if (!isset($data[$key]) || !is_array($data[$key])) {
                        $data[$key] = [];
                    }
                }
                if (!isset($data['summary']['career_tests_count'])) {
                    $data['summary']['career_tests_count'] = 0;
                }
                return $data;
            }
        }
    }
    $default = getDefaultAnalyticsData();
    @file_put_contents($cacheFile, json_encode($default, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    return $default;
}

/**
 * Salva os dados no arquivo local
 */
function saveAnalyticsData($cacheFile, $data) {
    $data['last_updated'] = date('c');
    return @file_put_contents($cacheFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// ==========================================
// ROTEAMENTO DE AÇÕES
// ==========================================

switch ($action) {
    case 'track':
        $inputRaw = file_get_contents('php://input');
        $inputJson = json_decode($inputRaw, true);
        $input = is_array($inputJson) ? array_merge($_GET, $inputJson) : array_merge($_GET, $_POST);

        $event = trim($input['event'] ?? 'pageview_home');
        $city = trim($input['city'] ?? '');
        $region = strtoupper(trim($input['region'] ?? ''));
        $country = trim($input['country'] ?? 'Brasil');
        $referrer = trim((string)($input['referrer'] ?? ($_SERVER['HTTP_REFERER'] ?? '')));
        $utmSource = trim((string)($input['utm_source'] ?? ''));
        $utmCampaign = trim((string)($input['utm_campaign'] ?? ''));
        $trafficSource = classifyTrafficSource($input['traffic_source'] ?? '', $referrer, $utmSource);
        $deviceType = detectDeviceType($input['device'] ?? '', $_SERVER['HTTP_USER_AGENT'] ?? '');
        $clickPage = trim((string)($input['click_page'] ?? ''));

        $data = loadAnalyticsData($cacheFile);

        // Registrar origem de tráfego e dispositivo nas interações principais
        if (in_array($event, ['pageview_home', 'pageview_tracks', 'pageview_course', 'pageview_blog', 'course_click'], true)) {
            $data['traffic_sources'][$trafficSource] = ($data['traffic_sources'][$trafficSource] ?? 0) + 1;
            $data['device_types'][$deviceType] = ($data['device_types'][$deviceType] ?? 0) + 1;
            if (!empty($utmCampaign)) {
                $campKey = ($utmSource ? $utmSource . ' / ' : '') . mb_substr($utmCampaign, 0, 60, 'UTF-8');
                $data['utm_campaigns'][$campKey] = ($data['utm_campaigns'][$campKey] ?? 0) + 1;
            }
        }

        // 1. Atualizar Contadores de Evento
        if ($event === 'pageview_home') {
            $data['summary']['home_views']++;
            $data['summary']['total_visits']++;
        } elseif ($event === 'pageview_tracks') {
            $data['summary']['tracks_views']++;
            $data['summary']['total_visits']++;
        } elseif ($event === 'pageview_course' || $event === 'pageview_blog') {
            $data['summary']['total_visits']++;
        } elseif ($event === 'course_click') {
            $data['summary']['course_clicks']++;
            $courseId = trim($input['course_id'] ?? '');
            $title = trim($input['course_title'] ?? 'Curso Oficial');
            $provider = trim($input['course_provider'] ?? 'Parceiro');
            $category = trim($input['course_category'] ?? 'Geral');
            $pageLabel = !empty($clickPage) ? mb_substr($clickPage, 0, 80, 'UTF-8') : 'Catálogo Principal (Home)';

            // Contadores específicos de Origem dos Cliques
            $data['click_traffic_sources'][$trafficSource] = ($data['click_traffic_sources'][$trafficSource] ?? 0) + 1;
            $data['click_origins_pages'][$pageLabel] = ($data['click_origins_pages'][$pageLabel] ?? 0) + 1;

            if (!empty($courseId)) {
                if (!isset($data['top_courses'][$courseId])) {
                    $data['top_courses'][$courseId] = [
                        'title' => $title,
                        'provider' => $provider,
                        'category' => $category,
                        'clicks' => 0
                    ];
                }
                $data['top_courses'][$courseId]['clicks']++;
            }

            // Registrar no histórico recente (últimos 50 cliques)
            $refHost = '';
            if (!empty($referrer)) {
                $refHost = parse_url($referrer, PHP_URL_HOST) ?: $referrer;
                $refHost = preg_replace('/^www\./', '', (string)$refHost);
            }
            array_unshift($data['recent_clicks'], [
                'timestamp' => date('c'),
                'course_id' => $courseId,
                'course_title' => mb_substr($title, 0, 100, 'UTF-8'),
                'course_provider' => mb_substr($provider, 0, 60, 'UTF-8'),
                'traffic_source' => $trafficSource,
                'click_page' => $pageLabel,
                'device' => $deviceType,
                'city' => $city ?: 'Brasil',
                'region' => $region ?: '',
                'utm_source' => $utmSource,
                'utm_campaign' => $utmCampaign,
                'referrer_host' => $refHost
            ]);
            if (count($data['recent_clicks']) > 50) {
                $data['recent_clicks'] = array_slice($data['recent_clicks'], 0, 50);
            }
        } elseif ($event === 'favorite') {
            $data['summary']['total_favorites']++;
        } elseif ($event === 'career_test_completed' || $event === 'test_completed') {
            if (!isset($data['summary']['career_tests_count'])) {
                $data['summary']['career_tests_count'] = 0;
            }
            $data['summary']['career_tests_count']++;
            $areaKey = trim($input['primary_area'] ?? $input['career_area'] ?? '');
            if (!empty($areaKey)) {
                if (!isset($data['career_test_areas'][$areaKey])) {
                    $data['career_test_areas'][$areaKey] = 0;
                }
                $data['career_test_areas'][$areaKey]++;
            }
        }

        // 2. Atualizar Geolocalização (Países)
        if (!empty($country)) {
            $countryNorm = (stripos($country, 'Brazil') !== false || stripos($country, 'Brasil') !== false) ? 'Brasil' : $country;
            if (!isset($data['locations_world'][$countryNorm])) {
                $data['locations_world'][$countryNorm] = 0;
            }
            $data['locations_world'][$countryNorm]++;
        }

        // 3. Atualizar Geolocalização (Estados e Cidades do Brasil)
        if (!empty($region) && strlen($region) === 2) {
            if (!isset($data['locations_brazil_states'][$region])) {
                $data['locations_brazil_states'][$region] = 0;
            }
            $data['locations_brazil_states'][$region]++;
        }

        if (!empty($city) && !in_array($city, ['Brasil', 'Identificando...', 'Sua Localização', 'Localizando...'])) {
            if (!isset($data['locations_brazil_cities'][$city])) {
                $data['locations_brazil_cities'][$city] = 0;
            }
            $data['locations_brazil_cities'][$city]++;
        }

        saveAnalyticsData($cacheFile, $data);

        echo json_encode(['success' => true, 'tracked' => $event]);
        exit;

    case 'stats':
    default:
        $data = loadAnalyticsData($cacheFile);

        // Formatar e ordenar Estados Brasileiros
        $statesList = [];
        if (!empty($data['locations_brazil_states']) && is_array($data['locations_brazil_states'])) {
            $totalStateVisits = array_sum($data['locations_brazil_states']) ?: 1;
            arsort($data['locations_brazil_states']);

            foreach ($data['locations_brazil_states'] as $uf => $count) {
                $fullName = $brazilStateNames[$uf] ?? ($uf === 'Outros' ? 'Outros Estados' : $uf);
                $statesList[] = [
                    'uf' => $uf,
                    'name' => $fullName,
                    'count' => (int) $count,
                    'percent' => round(($count / $totalStateVisits) * 100, 1)
                ];
            }
        }

        // Formatar e ordenar Cidades Brasileiras
        $citiesList = [];
        if (!empty($data['locations_brazil_cities']) && is_array($data['locations_brazil_cities'])) {
            arsort($data['locations_brazil_cities']);
            $topCities = array_slice($data['locations_brazil_cities'], 0, 10, true);
            foreach ($topCities as $cityName => $count) {
                $citiesList[] = [
                    'city' => $cityName,
                    'count' => (int) $count
                ];
            }
        }

        // Formatar e ordenar Países do Mundo
        $worldList = [];
        if (!empty($data['locations_world']) && is_array($data['locations_world'])) {
            $totalWorldVisits = array_sum($data['locations_world']) ?: 1;
            arsort($data['locations_world']);
            foreach ($data['locations_world'] as $countryName => $count) {
                $worldList[] = [
                    'country' => $countryName,
                    'count' => (int) $count,
                    'percent' => round(($count / $totalWorldVisits) * 100, 1)
                ];
            }
        }

        // Formatar e ordenar Top Cursos Mais Acessados
        $coursesList = [];
        if (!empty($data['top_courses']) && is_array($data['top_courses'])) {
            uasort($data['top_courses'], function($a, $b) {
                return ($b['clicks'] ?? 0) <=> ($a['clicks'] ?? 0);
            });

            $rank = 1;
            foreach ($data['top_courses'] as $id => $course) {
                $coursesList[] = [
                    'rank' => $rank++,
                    'id' => $id,
                    'title' => $course['title'] ?? 'Curso',
                    'provider' => $course['provider'] ?? 'Parceiro',
                    'category' => $course['category'] ?? 'Geral',
                    'clicks' => (int) ($course['clicks'] ?? 0)
                ];
                if ($rank > 15) break; // Top 15
            }
        }

        // Formatar e ordenar Áreas do Teste Vocacional em ORDEM ASCENDENTE (menor para maior)
        $quizAreasAscending = [];
        if (!empty($data['career_test_areas']) && is_array($data['career_test_areas'])) {
            $totalTests = (!empty($data['summary']['career_tests_count']) ? (int) $data['summary']['career_tests_count'] : array_sum($data['career_test_areas'])) ?: 1;
            $sortedAreas = $data['career_test_areas'];
            asort($sortedAreas); // ORDEM ASCENDENTE (do menor para o maior)

            $order = 1;
            foreach ($sortedAreas as $areaKey => $count) {
                $quizAreasAscending[] = [
                    'order' => $order++,
                    'key' => $areaKey,
                    'title' => $careerAreaTitles[$areaKey] ?? ucfirst($areaKey),
                    'count' => (int) $count,
                    'percent' => round(($count / $totalTests) * 100, 1)
                ];
            }
        }

        // Obter Total de Alunos Cadastrados no Banco MySQL ou Arquivo Protegido
        $totalStudents = 0;
        try {
            if (file_exists(__DIR__ . '/config.php')) {
                require_once __DIR__ . '/config.php';
                $pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;
                if ($pdo) {
                    $stmtStudents = $pdo->query("SELECT COUNT(*) FROM students");
                    if ($stmtStudents) {
                        $totalStudents = (int) $stmtStudents->fetchColumn();
                    }
                }
            }
        } catch (Exception $e) {}

        if ($totalStudents === 0 && file_exists(__DIR__ . '/cache_students.json')) {
            $studentData = @json_decode(@file_get_contents(__DIR__ . '/cache_students.json'), true);
            if (!empty($studentData['students'])) {
                $totalStudents = count($studentData['students']);
            }
        }

        $data['summary']['total_students'] = $totalStudents;

        $formatAssocStats = function($assoc, $keyName = 'name', $limit = 15) {
            $result = [];
            if (!empty($assoc) && is_array($assoc)) {
                $total = array_sum($assoc) ?: 1;
                arsort($assoc);
                $countItems = 0;
                foreach ($assoc as $label => $cnt) {
                    $result[] = [
                        $keyName => (string)$label,
                        'count' => (int)$cnt,
                        'percent' => round(($cnt / $total) * 100, 1)
                    ];
                    if (++$countItems >= $limit) break;
                }
            }
            return $result;
        };

        $clickTrafficSourcesList = $formatAssocStats($data['click_traffic_sources'] ?? [], 'source', 12);
        $trafficSourcesList = $formatAssocStats($data['traffic_sources'] ?? [], 'source', 12);
        $clickOriginsPagesList = $formatAssocStats($data['click_origins_pages'] ?? [], 'page', 10);
        $deviceTypesList = $formatAssocStats($data['device_types'] ?? [], 'device', 5);
        $utmCampaignsList = $formatAssocStats($data['utm_campaigns'] ?? [], 'campaign', 10);
        $recentClicksList = array_slice($data['recent_clicks'] ?? [], 0, 50);

        echo json_encode([
            'success' => true,
            'summary' => $data['summary'],
            'locations_brazil_states' => $statesList,
            'locations_brazil_cities' => $citiesList,
            'locations_world' => $worldList,
            'top_courses' => $coursesList,
            'career_test_areas_ascending' => $quizAreasAscending,
            'click_traffic_sources' => $clickTrafficSourcesList,
            'traffic_sources' => $trafficSourcesList,
            'click_origins_pages' => $clickOriginsPagesList,
            'device_types' => $deviceTypesList,
            'utm_campaigns' => $utmCampaignsList,
            'recent_clicks' => $recentClicksList,
            'last_updated' => $data['last_updated'] ?? date('c')
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;

    case 'mediakit_csv':
        $data = loadAnalyticsData($cacheFile);
        
        $totalStudents = 0;
        try {
            if (file_exists(__DIR__ . '/config.php')) {
                require_once __DIR__ . '/config.php';
                $pdo = function_exists('tryGetDBConnection') ? tryGetDBConnection() : null;
                if ($pdo) {
                    $stmtStudents = $pdo->query("SELECT COUNT(*) FROM students");
                    if ($stmtStudents) {
                        $totalStudents = (int) $stmtStudents->fetchColumn();
                    }
                }
            }
        } catch (Exception $e) {}

        if ($totalStudents === 0 && file_exists(__DIR__ . '/cache_students.json')) {
            $studentData = @json_decode(@file_get_contents(__DIR__ . '/cache_students.json'), true);
            if (!empty($studentData['students'])) {
                $totalStudents = count($studentData['students']);
            }
        }

        $dateStr = date('d/m/Y H:i:s');
        $fileName = 'midia_kit_audiencia_vocepodetudo_' . date('Y_m_d') . '.csv';

        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="' . $fileName . '"');
        header('Pragma: no-cache');
        header('Expires: 0');

        $out = fopen('php://output', 'w');
        // UTF-8 BOM para abrir perfeitamente no Excel
        fprintf($out, chr(0xEF).chr(0xBB).chr(0xBF));

        // Cabeçalho Oficial
        fputcsv($out, ['DOSSIÊ DE AUDIÊNCIA & MÍDIA KIT OFICIAL — PORTAL VOCÊ PODE TUDO'], ';');
        fputcsv($out, ['Documento de Comprovação de Tráfego e Métricas de Visitantes'], ';');
        fputcsv($out, ['Data de Emissão', $dateStr], ';');
        fputcsv($out, ['URL Oficial', 'https://www.vocepodetudo.com'], ';');
        fputcsv($out, ['Ambiente', 'Servidor de Produção ServerByte / StackCP'], ';');
        fputcsv($out, [], ';');

        // 1. Resumo Executivo
        fputcsv($out, ['--- 1. INDICADORES-CHAVE DE AUDIÊNCIA (KPIs) ---'], ';');
        fputcsv($out, ['Indicador de Mídia', 'Total Registrado', 'Descrição'], ';');
        fputcsv($out, ['Visualizações da Home / Catálogo', $data['summary']['home_views'] ?? 0, 'Impressões diretas da vitrine principal de cursos'], ';');
        fputcsv($out, ['Visualizações de Trilhas Guiadas', $data['summary']['tracks_views'] ?? 0, 'Acessos às páginas de primeiro emprego, TI, etc.'], ';');
        fputcsv($out, ['Cliques em Cursos Oficiais (Conversão)', $data['summary']['course_clicks'] ?? 0, 'Cliques no botão Acessar Curso Oficial'], ';');
        fputcsv($out, ['Testes Vocacionais Concluídos', $data['summary']['career_tests_count'] ?? 0, 'Visitantes qualificados que responderam ao teste completo'], ';');
        fputcsv($out, ['Base de Alunos Cadastrados', $totalStudents, 'Alunos registrados com conta e progresso ativo'], ';');
        fputcsv($out, ['Cursos Salvos / Favoritados', $data['summary']['total_favorites'] ?? 0, 'Itens salvos com intenção de estudo'], ';');
        fputcsv($out, [], ';');

        // 2. Estados Brasileiros
        fputcsv($out, ['--- 2. DISTRIBUIÇÃO GEOGRÁFICA NACIONAL (ESTADOS DO BRASIL) ---'], ';');
        fputcsv($out, ['UF', 'Estado', 'Acessos', 'Participação (%)'], ';');
        if (!empty($data['locations_brazil_states'])) {
            $totalSt = array_sum($data['locations_brazil_states']) ?: 1;
            arsort($data['locations_brazil_states']);
            foreach ($data['locations_brazil_states'] as $uf => $cnt) {
                $name = $brazilStateNames[$uf] ?? $uf;
                $pct = round(($cnt / $totalSt) * 100, 1);
                fputcsv($out, [$uf, $name, $cnt, $pct . '%'], ';');
            }
        } else {
            fputcsv($out, ['Nenhum dado registrado ainda', '-', 0, '0%'], ';');
        }
        fputcsv($out, [], ';');

        // 3. Top Cidades
        fputcsv($out, ['--- 3. TOP CIDADES DO BRASIL COM MAIS VISITANTES ---'], ';');
        fputcsv($out, ['Cidade', 'Acessos Registrados'], ';');
        if (!empty($data['locations_brazil_cities'])) {
            arsort($data['locations_brazil_cities']);
            foreach (array_slice($data['locations_brazil_cities'], 0, 15, true) as $city => $cnt) {
                fputcsv($out, [$city, $cnt], ';');
            }
        }
        fputcsv($out, [], ';');

        // 4. Países
        fputcsv($out, ['--- 4. ALCANCE GLOBAL (PAÍSES) ---'], ';');
        fputcsv($out, ['País', 'Acessos Registrados'], ';');
        if (!empty($data['locations_world'])) {
            arsort($data['locations_world']);
            foreach ($data['locations_world'] as $country => $cnt) {
                fputcsv($out, [$country, $cnt], ';');
            }
        }
        fputcsv($out, [], ';');

        // 5. Interesses Vocacionais
        fputcsv($out, ['--- 5. PERFIL DE INTERESSES E AFINIDADES DOS VISITANTES (TESTE VOCACIONAL) ---'], ';');
        fputcsv($out, ['Área Profissional', 'Direcionamentos', 'Participação (%)'], ';');
        if (!empty($data['career_test_areas'])) {
            $totalQ = array_sum($data['career_test_areas']) ?: 1;
            arsort($data['career_test_areas']);
            foreach ($data['career_test_areas'] as $k => $cnt) {
                $title = $careerAreaTitles[$k] ?? ucfirst($k);
                $pct = round(($cnt / $totalQ) * 100, 1);
                fputcsv($out, [$title, $cnt, $pct . '%'], ';');
            }
        }
        fputcsv($out, [], ';');

        // 6. Ranking de Cursos Mais Procurados
        fputcsv($out, ['--- 6. CURSOS DE MAIOR ENGAJAMENTO E CLIQUES ---'], ';');
        fputcsv($out, ['Posição', 'Nome do Curso', 'Instituição Parceira', 'Categoria', 'Cliques Oficiais'], ';');
        if (!empty($data['top_courses'])) {
            uasort($data['top_courses'], function($a, $b) {
                return ($b['clicks'] ?? 0) <=> ($a['clicks'] ?? 0);
            });
            $rank = 1;
            foreach (array_slice($data['top_courses'], 0, 20, true) as $c) {
                fputcsv($out, [$rank++, $c['title'] ?? '', $c['provider'] ?? '', $c['category'] ?? '', $c['clicks'] ?? 0], ';');
            }
        }

        fputcsv($out, [], ';');

        // 7. Catálogo de Formatos Publicitários (IAB & Nativos)
        fputcsv($out, ['--- 7. CATÁLOGO DE ESPAÇOS PUBLICITÁRIOS (PADRÃO IAB) ---'], ';');
        fputcsv($out, ['Formato', 'Dimensões (Desktop / Mobile)', 'Posicionamento', 'Peso Máximo', 'CTR Médio Histórico'], ';');
        fputcsv($out, ['Super Leaderboard Topo', '728x90 / 320x100', 'Acima da dobra em todas as páginas', '150 KB', '1,8% a 2,5%'], ';');
        fputcsv($out, ['Card Patrocinado Nativo In-Feed', '300x250 ou Fluido', 'Integrado na grade de cursos e vagas', '100 KB', '3,8% a 5,2%'], ';');
        fputcsv($out, ['Half-Page Lateral (Skyscraper)', '300x600 (Sticky)', 'Barra lateral fixa nos artigos do Blog', '200 KB', '2,2% a 3,1%'], ';');
        fputcsv($out, ['Billboard Intertítulo Editorial', '970x250 / 300x250', 'Entre seções estratégicas na Home', '200 KB', '2,0% a 2,9%'], ';');
        fputcsv($out, ['Push Notification Segmentada', 'Texto + Ícone + Link', 'Direto na tela de smartphones/desktop', '-', '6,5% a 9,8%'], ';');
        fputcsv($out, [], ';');

        // 8. Patrocínio Exclusivo de Ferramentas (Naming Rights)
        fputcsv($out, ['--- 8. NAMING RIGHTS & PATROCÍNIO EXCLUSIVO DE FERRAMENTAS ---'], ';');
        fputcsv($out, ['Ferramenta', 'Tempo Médio de Uso', 'Benefício para o Patrocinador', 'Exclusividade'], ';');
        fputcsv($out, ['Criador de Currículos ATS', '12 a 15 minutos', 'Logo no topo + Selo timbrado no PDF exportado', '100% Share of Voice (Setorial)'], ';');
        fputcsv($out, ['Simulador de Entrevistas com IA', '8 a 10 minutos', 'Apresentado por [Marca] + Dica patrocinada entre rodadas', '100% Share of Voice (Setorial)'], ';');
        fputcsv($out, ['Calculadora Trabalhista CLT/PJ', '5 a 7 minutos', 'Calculadora apoiada por [Marca] + Banner contextual', '100% Share of Voice (Setorial)'], ';');
        fputcsv($out, [], ';');

        // 9. Modelos Comerciais & Brand Safety
        fputcsv($out, ['--- 9. DIRETRIZES COMERCIAIS & BRAND SAFETY ---'], ';');
        fputcsv($out, ['Item', 'Diretriz Oficial'], ';');
        fputcsv($out, ['Modelos Aceitos', 'CPM (Custo por Mil), CPC (Custo por Clique), Fixo Mensal (Tenancy) e Publieditoriais'], ';');
        fputcsv($out, ['Formatos Criativos', 'JPG, PNG, GIF, HTML5 (ZIP), Google Ad Manager e Third-Party Tags seguras (SSL)'], ';');
        fputcsv($out, ['Prazo de Homologação', 'Envio com no mínimo 48 horas úteis de antecedência'], ';');
        fputcsv($out, ['Classificação Brand Safety', 'Tier 1 (Máximo) — 100% Educacional, zero violência, zero política partidária'], ';');
        fputcsv($out, ['Conformidade LGPD', 'Total conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)'], ';');
        fputcsv($out, ['Contato Comercial', 'comercial@vocepodetudo.com — WhatsApp: (11) 99999-9999'], ';');
        fputcsv($out, ['Página Pública do Mídia Kit', 'https://vocepodetudo.com/midia-kit'], ';');
        fputcsv($out, [], ';');

        fputcsv($out, ['Autenticidade', 'Dados certificados diretamente pelo sistema de telemetria do Portal Você Pode Tudo'], ';');
        fclose($out);
        exit;

    case 'reset':
        requireAdmin();
        $fresh = getDefaultAnalyticsData();
        saveAnalyticsData($cacheFile, $fresh);
        echo json_encode(['success' => true, 'message' => 'Métricas reiniciadas com sucesso.', 'data' => $fresh]);
        exit;
}
