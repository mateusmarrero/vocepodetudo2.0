<?php
/**
 * api/contact.php - Fale Conosco & Central de Mensagens Administrativa
 * Você Pode Tudo — Plataforma Oficial
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

$cacheFile = __DIR__ . '/cache_contacts.json';

// Helper para ler mensagens do cache
function loadContactsCache(string $path): array {
    if (file_exists($path)) {
        $raw = @file_get_contents($path);
        if ($raw) {
            $data = json_decode($raw, true);
            if (is_array($data)) return $data;
        }
    }
    return [];
}

// Helper para salvar mensagens no cache
function saveContactsCache(string $path, array $data): bool {
    return (bool) @file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// -------------------------------------------------------------
// VERIFICA SE É UMA REQUISIÇÃO ADMINISTRATIVA
// -------------------------------------------------------------
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
$isAdminReq = !empty($authHeader) && stripos($authHeader, 'Bearer ') === 0;

if ($isAdminReq || isset($_GET['admin'])) {
    $auth = requireAdmin(false); // Exige admin autenticado
    $action = $_GET['action'] ?? 'list';
    $contacts = loadContactsCache($cacheFile);

    // 1. LISTAR MENSAGENS COM FILTRO E BUSCA
    if ($action === 'list') {
        $filterStatus = $_GET['status'] ?? 'all';
        $search = trim(mb_strtolower((string) ($_GET['search'] ?? '')));

        $filtered = array_filter($contacts, function($c) use ($filterStatus, $search) {
            if ($filterStatus !== 'all' && ($c['status'] ?? 'nao_lida') !== $filterStatus) {
                return false;
            }
            if (!empty($search)) {
                $haystack = mb_strtolower(($c['nome'] ?? '') . ' ' . ($c['email'] ?? '') . ' ' . ($c['assunto'] ?? '') . ' ' . ($c['mensagem'] ?? ''));
                if (strpos($haystack, $search) === false) return false;
            }
            return true;
        });

        // Contadores
        $unreadCount = count(array_filter($contacts, fn($c) => ($c['status'] ?? 'nao_lida') === 'nao_lida'));
        $repliedCount = count(array_filter($contacts, fn($c) => ($c['status'] ?? '') === 'respondida'));
        $archivedCount = count(array_filter($contacts, fn($c) => ($c['status'] ?? '') === 'arquivada'));

        jsonResponse([
            'success' => true,
            'total' => count($contacts),
            'unread_count' => $unreadCount,
            'replied_count' => $repliedCount,
            'archived_count' => $archivedCount,
            'messages' => array_values($filtered)
        ]);
    }

    // 2. ATUALIZAR STATUS DA MENSAGEM (ex: nao_lida -> lida, respondida, arquivada)
    if ($action === 'update_status' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = trim((string) ($input['id'] ?? ''));
        $newStatus = trim((string) ($input['status'] ?? 'lida'));

        $allowedStatuses = ['nao_lida', 'lida', 'respondida', 'arquivada'];
        if (!in_array($newStatus, $allowedStatuses, true)) {
            jsonResponse(['success' => false, 'error' => 'Status inválido.'], 400);
        }

        $found = false;
        foreach ($contacts as &$c) {
            if (($c['id'] ?? '') === $id) {
                $c['status'] = $newStatus;
                $c['updated_at'] = date('Y-m-d H:i:s');
                $found = true;
                break;
            }
        }
        unset($c);

        if (!$found) {
            jsonResponse(['success' => false, 'error' => 'Mensagem não encontrada.'], 404);
        }

        saveContactsCache($cacheFile, $contacts);
        jsonResponse(['success' => true, 'message' => "Status atualizado para '$newStatus'."]);
    }

    // 3. EXCLUIR MENSAGEM
    if ($action === 'delete' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = trim((string) ($input['id'] ?? ''));

        $initialCount = count($contacts);
        $contacts = array_values(array_filter($contacts, fn($c) => ($c['id'] ?? '') !== $id));

        if (count($contacts) === $initialCount) {
            jsonResponse(['success' => false, 'error' => 'Mensagem não encontrada.'], 404);
        }

        saveContactsCache($cacheFile, $contacts);
        jsonResponse(['success' => true, 'message' => 'Mensagem excluída com sucesso.']);
    }

    // 4. REGISTRAR RESPOSTA ENVIADA AO VISITANTE
    if ($action === 'reply' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = trim((string) ($input['id'] ?? ''));
        $replyText = trim((string) ($input['reply_text'] ?? ''));

        if (empty($id) || empty($replyText)) {
            jsonResponse(['success' => false, 'error' => 'ID e texto da resposta são obrigatórios.'], 400);
        }

        $targetMsg = null;
        foreach ($contacts as &$c) {
            if (($c['id'] ?? '') === $id) {
                $c['status'] = 'respondida';
                $c['reply'] = htmlspecialchars($replyText, ENT_QUOTES, 'UTF-8');
                $c['replied_at'] = date('Y-m-d H:i:s');
                $c['replied_by'] = $auth['username'] ?? 'admin';
                $targetMsg = $c;
                break;
            }
        }
        unset($c);

        if (!$targetMsg) {
            jsonResponse(['success' => false, 'error' => 'Mensagem não encontrada.'], 404);
        }

        saveContactsCache($cacheFile, $contacts);

        // Tentativa de envio real por e-mail se mail() habilitado
        $destEmail = $targetMsg['email'] ?? '';
        if (filter_var($destEmail, FILTER_VALIDATE_EMAIL)) {
            $subj = "Re: " . ($targetMsg['assunto'] ?? 'Contato') . " — Você Pode Tudo";
            $body = "Olá, " . ($targetMsg['nome'] ?? 'Visitante') . "!\n\n" .
                    "Recebemos sua mensagem enviada pelo Portal Você Pode Tudo e estamos respondendo:\n\n" .
                    $replyText . "\n\n" .
                    "---\nEquipe Você Pode Tudo\nhttps://vocepodetudo.com";
            $headers = "From: contato@vocepodetudo.com\r\n" .
                       "Reply-To: contato@vocepodetudo.com\r\n" .
                       "X-Mailer: PHP/" . phpversion();
            @mail($destEmail, $subj, $body, $headers);
        }

        jsonResponse([
            'success' => true, 
            'message' => 'Resposta registrada e e-mail encaminhado ao visitante.'
        ]);
    }

    jsonResponse(['success' => false, 'error' => 'Ação administrativa inválida.'], 400);
}

// -------------------------------------------------------------
// ENVIO PÚBLICO DE MENSAGEM (FORMULÁRIO DE CONTATO)
// -------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$nome = trim((string) ($input['nome'] ?? ''));
$email = trim((string) ($input['email'] ?? ''));
$assunto = trim((string) ($input['assunto'] ?? 'Contato Geral'));
$mensagem = trim((string) ($input['mensagem'] ?? ''));

if (empty($nome) || empty($email) || empty($mensagem)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Por favor, preencha seu nome, e-mail e sua mensagem.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'O e-mail informado é inválido.']);
    exit;
}

$contacts = loadContactsCache($cacheFile);

$novaMensagem = [
    'id' => uniqid('msg_'),
    'data' => date('Y-m-d H:i:s'),
    'ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
    'nome' => htmlspecialchars($nome, ENT_QUOTES, 'UTF-8'),
    'email' => htmlspecialchars($email, ENT_QUOTES, 'UTF-8'),
    'assunto' => htmlspecialchars($assunto, ENT_QUOTES, 'UTF-8'),
    'mensagem' => htmlspecialchars($mensagem, ENT_QUOTES, 'UTF-8'),
    'status' => 'nao_lida'
];

array_unshift($contacts, $novaMensagem);

// Limitar histórico a 500 mensagens
if (count($contacts) > 500) {
    $contacts = array_slice($contacts, 0, 500);
}

saveContactsCache($cacheFile, $contacts);

// Notificar administrador por e-mail se configurado
@mail('contato@vocepodetudo.com', "[Você Pode Tudo] Nova mensagem de $nome: $assunto", "Mensagem de: $nome ($email)\n\n$mensagem");

echo json_encode([
    'success' => true,
    'message' => 'Mensagem enviada com sucesso! Nossa equipe entrará em contato em breve.'
], JSON_UNESCAPED_UNICODE);
