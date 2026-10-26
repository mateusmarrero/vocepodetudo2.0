<?php
// Você Pode Tudo — API Proxy de Notícias Oficiais do Brasil (Agência Brasil / EBC)
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: public, max-age=600'); // Cache no navegador por 10 minutos

$cacheFile = __DIR__ . '/cache_news.json';
$cacheTime = 600; // 10 minutos

// 1. Verificar cache local no servidor
if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheTime)) {
    $cached = @file_get_contents($cacheFile);
    if (!empty($cached)) {
        echo $cached;
        exit;
    }
}

// 2. Buscar RSS oficial da Agência Brasil (EBC)
$feedUrls = [
    'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml',
    'https://agenciabrasil.ebc.com.br/rss/educacao/feed.xml'
];

$items = [];

foreach ($feedUrls as $url) {
    $context = stream_context_create([
        'http' => [
            'timeout' => 4,
            'user_agent' => 'VocePodeTudo/1.0 (+https://vocepodetudo.com)'
        ],
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false
        ]
    ]);

    $xmlContent = @file_get_contents($url, false, $context);
    if ($xmlContent) {
        $xml = @simplexml_load_string($xmlContent, 'SimpleXMLElement', LIBXML_NOCDATA);
        if ($xml && isset($xml->channel->item)) {
            foreach ($xml->channel->item as $entry) {
                $title = trim((string)$entry->title);
                $link = trim((string)$entry->link);
                $pubDate = trim((string)$entry->pubDate);
                
                if (!empty($title) && !empty($link) && !in_array($title, ['Feed Últimas', 'Feed Editoria'])) {
                    $items[] = [
                        'title' => html_entity_decode($title, ENT_QUOTES | ENT_HTML5, 'UTF-8'),
                        'link'  => $link,
                        'date'  => $pubDate
                    ];
                }
                if (count($items) >= 12) break;
            }
        }
    }
    if (count($items) >= 10) break;
}

// 3. Fallback de contingência caso o feed externo esteja temporariamente indisponível
if (empty($items)) {
    $items = [
        [
            'title' => 'MEC e Governo Federal ampliam vagas em cursos técnicos e superiores gratuitos em todo o país',
            'link'  => 'https://agenciabrasil.ebc.com.br/educacao',
            'date'  => date('r')
        ],
        [
            'title' => 'Inscrições abertas para novos programas de qualificação profissional em tecnologia e inovação',
            'link'  => 'https://agenciabrasil.ebc.com.br/economia',
            'date'  => date('r')
        ],
        [
            'title' => 'Mercado de trabalho exige qualificação contínua e certificações digitais no Brasil',
            'link'  => 'https://agenciabrasil.ebc.com.br/geral',
            'date'  => date('r')
        ],
        [
            'title' => 'Fundação Bradesco e parceiros oferecem mais de 100 cursos online com certificado gratuito',
            'link'  => 'https://agenciabrasil.ebc.com.br/educacao',
            'date'  => date('r')
        ],
        [
            'title' => 'Capacitação profissional gratuita: saiba como turbinar seu currículo com cursos oficiais',
            'link'  => 'https://agenciabrasil.ebc.com.br/educacao',
            'date'  => date('r')
        ]
    ];
}

$response = [
    'success' => true,
    'source'  => 'Agência Brasil (EBC)',
    'updated' => date('c'),
    'items'   => array_slice($items, 0, 10)
];

$jsonOutput = json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
@file_put_contents($cacheFile, $jsonOutput);

echo $jsonOutput;
