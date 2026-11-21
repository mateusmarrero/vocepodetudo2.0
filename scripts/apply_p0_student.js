const fs = require('fs');

const studentPath = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/student.php';
let content = fs.readFileSync(studentPath, 'utf8');

// 1. Remover fallback não assinado do Google OAuth
const oldGoogleFallback = `            // Fallback: decodificar JWT se timeout externo
            if (!$googlePayload) {
                $jwtParts = explode('.', $credential);
                if (count($jwtParts) === 3) {
                    $jwtBody = base64_decode(str_replace(['-', '_'], ['+', '/'], $jwtParts[1]));
                    $parsedLocal = json_decode($jwtBody, true);
                    if (is_array($parsedLocal) && !empty($parsedLocal['email'])) {
                        $iss = $parsedLocal['iss'] ?? '';
                        if (strpos($iss, 'accounts.google.com') !== false) {
                            $googlePayload = $parsedLocal;
                        }
                    }
                }
            }`;

if (content.includes(oldGoogleFallback)) {
    content = content.replace(oldGoogleFallback, '            // Segurança P0: Fallback inseguro sem assinatura criptográfica foi removido.');
    console.log('✅ Fallback não autenticado do Google OAuth removido com sucesso!');
} else {
    console.warn('Aviso: Bloco do Google OAuth pode ter formatação diferente.');
}

// 2. Corrigir campo candidate_email na exclusão de conta (LGPD)
const oldLgpdQuery = '$pdo->prepare("DELETE FROM generated_resumes WHERE student_id = ? OR email = ?")->execute([$studentId, $studentEmail]);';
const newLgpdQuery = '$pdo->prepare("DELETE FROM generated_resumes WHERE student_id = ? OR candidate_email = ?")->execute([$studentId, $studentEmail]);';

if (content.includes(oldLgpdQuery)) {
    content = content.replace(oldLgpdQuery, newLgpdQuery);
    console.log('✅ Campo candidate_email corrigido na query LGPD de generated_resumes!');
} else {
    console.warn('Aviso: Query LGPD não encontrada com string exata.');
}

fs.writeFileSync(studentPath, content, 'utf8');
console.log('api/student.php atualizado com sucesso!');
