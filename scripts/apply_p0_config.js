const fs = require('fs');
const path = require('path');

const configPath = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/config.php';
let content = fs.readFileSync(configPath, 'utf8');

const helpers = `
/**
 * Sanitiza valores para exportação segura em arquivos CSV (Anti-Formula Injection / CWE-1236)
 * Previne execução de comandos arbitrários no Excel/Calc via =, +, -, @, \\t, \\r
 */
function sanitizeCsvField($value): string {
    if ($value === null) {
        return '';
    }
    $str = (string) $value;
    $trimmed = ltrim($str);
    if ($trimmed !== '' && in_array($trimmed[0], ['=', '+', '-', '@', "\\t", "\\r"], true)) {
        return "'" . $str;
    }
    return $str;
}

/**
 * Validação rigorosa contra SSRF (Server-Side Request Forgery / CWE-918)
 * Garante que a URL externa aponte estritamente para endereços IP públicos e protocolos HTTP/HTTPS
 */
function isSafePublicUrl(string $url, ?string &$resolvedIp = null): bool {
    $parsed = parse_url($url);
    if (!$parsed || empty($parsed['scheme']) || empty($parsed['host'])) {
        return false;
    }

    $scheme = strtolower($parsed['scheme']);
    if ($scheme !== 'http' && $scheme !== 'https') {
        return false;
    }

    $host = strtolower($parsed['host']);
    
    // Bloqueio imediato de nomes locais e metadados
    if (in_array($host, ['localhost', 'loopback', 'metadata.google.internal', 'instance-data'], true)) {
        return false;
    }

    // Se for IP direto, valida
    if (filter_var($host, FILTER_VALIDATE_IP)) {
        $ip = $host;
    } else {
        // Resolução DNS
        $ips = @gethostbynamel($host);
        if (!$ips || empty($ips)) {
            return false;
        }
        $ip = $ips[0];
    }

    $resolvedIp = $ip;

    // Garante que o IP seja IPv4 ou IPv6 estritamente público
    $isPublic = filter_var(
        $ip,
        FILTER_VALIDATE_IP,
        FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
    );

    if (!$isPublic) {
        return false;
    }

    // Verificações adicionais de faixas sensíveis (ex: AWS/GCP/Azure link-local metadata 169.254.x.x)
    if (strpos($ip, '169.254.') === 0 || strpos($ip, '127.') === 0 || strpos($ip, '0.') === 0) {
        return false;
    }

    return true;
}
`;

if (!content.includes('function sanitizeCsvField')) {
    content = content.trimEnd() + '\n' + helpers;
    fs.writeFileSync(configPath, content, 'utf8');
    console.log('✅ Helpers sanitizeCsvField e isSafePublicUrl adicionados a api/config.php');
} else {
    console.log('Helpers já existentes em api/config.php');
}
