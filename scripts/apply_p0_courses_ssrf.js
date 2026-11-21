const fs = require('fs');

const coursesPath = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/courses.php';
let content = fs.readFileSync(coursesPath, 'utf8');

const oldCheckUrlRegex = /case 'check_url':[\s\S]*?break;/;

const newCheckUrl = `case 'check_url':
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
        break;`;

if (oldCheckUrlRegex.test(content)) {
    content = content.replace(oldCheckUrlRegex, newCheckUrl);
    fs.writeFileSync(coursesPath, content, 'utf8');
    console.log('✅ Endpoint check_url protegido contra SSRF em api/courses.php');
} else {
    console.error('❌ Não encontrou bloco check_url em api/courses.php');
    process.exit(1);
}
