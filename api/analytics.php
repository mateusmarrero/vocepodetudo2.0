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
        'last_updated' => date('c')
    ];
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
                if (!isset($data['locations_brazil_states']) || !is_array($data['locations_brazil_states'])) {
                    $data['locations_brazil_states'] = [];
                }
                if (!isset($data['locations_brazil_cities']) || !is_array($data['locations_brazil_cities'])) {
                    $data['locations_brazil_cities'] = [];
                }
                if (!isset($data['locations_world']) || !is_array($data['locations_world'])) {
                    $data['locations_world'] = [];
                }
                if (!isset($data['top_courses']) || !is_array($data['top_courses'])) {
                    $data['top_courses'] = [];
                }
                if (!isset($data['career_test_areas']) || !is_array($data['career_test_areas'])) {
                    $data['career_test_areas'] = [];
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

        $data = loadAnalyticsData($cacheFile);

        // 1. Atualizar Contadores de Evento
        if ($event === 'pageview_home') {
            $data['summary']['home_views']++;
            $data['summary']['total_visits']++;
        } elseif ($event === 'pageview_tracks') {
            $data['summary']['tracks_views']++;
            $data['summary']['total_visits']++;
        } elseif ($event === 'course_click') {
            $data['summary']['course_clicks']++;
            $courseId = trim($input['course_id'] ?? '');
            $title = trim($input['course_title'] ?? 'Curso Oficial');
            $provider = trim($input['course_provider'] ?? 'Parceiro');
            $category = trim($input['course_category'] ?? 'Geral');

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

        echo json_encode([
            'success' => true,
            'summary' => $data['summary'],
            'locations_brazil_states' => $statesList,
            'locations_brazil_cities' => $citiesList,
            'locations_world' => $worldList,
            'top_courses' => $coursesList,
            'career_test_areas_ascending' => $quizAreasAscending,
            'last_updated' => $data['last_updated'] ?? date('c')
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;

    case 'reset':
        $fresh = getDefaultAnalyticsData();
        saveAnalyticsData($cacheFile, $fresh);
        echo json_encode(['success' => true, 'message' => 'Métricas reiniciadas com sucesso.', 'data' => $fresh]);
        exit;
}
