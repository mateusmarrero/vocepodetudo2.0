const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY';

console.log('====================================================');
console.log('SUÍTE DE TESTES DE SEGURANÇA E INTEGRIDADE — FASE P0');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASSOU] Teste ${totalTests < 10 ? '0' + totalTests : totalTests}: ${testName}`);
    if (details) console.log(`         -> ${details}`);
  } else {
    console.error(`[FALHOU] Teste ${totalTests < 10 ? '0' + totalTests : totalTests}: ${testName}`);
    if (details) console.error(`         -> ${details}`);
  }
}

// 1. Teste de Validação de Sintaxe PHP em todos os arquivos modificados
const phpFiles = [
  'api/config.php',
  'api/courses.php',
  'api/student.php',
  'api/auth.php',
  'api/admin_students.php',
  'api/resumes.php',
  'api/newsletter.php',
  'api/audit_logs.php',
  'api/blog.php'
];

let allSyntaxOk = true;
for (const file of phpFiles) {
  try {
    const full = path.join(ROOT, file);
    execSync(`php -l "${full}"`, { stdio: 'pipe' });
  } catch (e) {
    allSyntaxOk = false;
    console.error(`Erro de sintaxe em ${file}:`, e.message);
  }
}
assert(allSyntaxOk, 'Validação de Sintaxe PHP (php -l)', 'Zero erros em todos os 9 arquivos de API auditados');

// 2. Teste Unitário PHP para isSafePublicUrl e sanitizeCsvField
const phpUnitFilePath = path.join(ROOT, 'scripts/temp_unit_p0.php');
const phpUnitTestScript = `<?php
require_once '${path.join(ROOT, 'api/config.php').replace(/\\/g, '/')}';

$tests = [];

// Testes Anti-SSRF
$tests['ssrf_localhost'] = !isSafePublicUrl('http://localhost:8080/admin');
$tests['ssrf_loopback'] = !isSafePublicUrl('http://127.0.0.1/test');
$tests['ssrf_link_local'] = !isSafePublicUrl('http://169.254.169.254/latest/meta-data/');
$tests['ssrf_private_10'] = !isSafePublicUrl('http://10.0.0.5/api');
$tests['ssrf_private_192'] = !isSafePublicUrl('http://192.168.0.1/');
$tests['ssrf_private_172'] = !isSafePublicUrl('http://172.16.0.1/');
$tests['ssrf_file_scheme'] = !isSafePublicUrl('file:///etc/passwd');
$tests['ssrf_gopher'] = !isSafePublicUrl('gopher://127.0.0.1:25/');
$tests['ssrf_valid_public'] = isSafePublicUrl('https://www.google.com');

// Testes Anti-CSV Injection
$tests['csv_equal'] = (sanitizeCsvField("=cmd|' /C calc'!A0") === "'=cmd|' /C calc'!A0");
$tests['csv_plus'] = (sanitizeCsvField('+2+3') === "'+2+3");
$tests['csv_minus'] = (sanitizeCsvField('-5') === "'-5");
$tests['csv_at'] = (sanitizeCsvField('@SUM(1,2)') === "'@SUM(1,2)");
$tests['csv_safe_name'] = (sanitizeCsvField('Carlos Pereira') === 'Carlos Pereira');
$tests['csv_safe_email'] = (sanitizeCsvField('carlos@email.com') === 'carlos@email.com');

echo json_encode($tests);
`;

fs.writeFileSync(phpUnitFilePath, phpUnitTestScript, 'utf8');
let unitOutput = '';
try {
  unitOutput = execSync(`php "${phpUnitFilePath}"`, { encoding: 'utf8' });
} finally {
  if (fs.existsSync(phpUnitFilePath)) {
    fs.unlinkSync(phpUnitFilePath);
  }
}
const unitResults = JSON.parse(unitOutput);

assert(unitResults.ssrf_localhost && unitResults.ssrf_loopback, 'Anti-SSRF: Bloqueio de Localhost e 127.0.0.1', 'Loopbacks rejeitados com sucesso');
assert(unitResults.ssrf_link_local, 'Anti-SSRF: Bloqueio de Metadados de Nuvem (169.254.x.x)', 'Endereço link-local rejeitado');
assert(unitResults.ssrf_private_10 && unitResults.ssrf_private_192 && unitResults.ssrf_private_172, 'Anti-SSRF: Bloqueio de Redes Privadas (RFC 1918)', 'Faixas 10.x, 192.168.x e 172.16.x rejeitadas');
assert(unitResults.ssrf_file_scheme && unitResults.ssrf_gopher, 'Anti-SSRF: Bloqueio de Esquemas não-HTTP', 'Protocolos file:// e gopher:// rejeitados');
assert(unitResults.ssrf_valid_public, 'Anti-SSRF: Liberação de Domínios Públicos Legítimos', 'URLs públicas autorizadas normalmente');

assert(unitResults.csv_equal && unitResults.csv_plus && unitResults.csv_minus && unitResults.csv_at, 'Anti-CSV Injection: Escapamento de Operadores de Fórmula', 'Operadores =, +, -, @ prefixados com apóstrofo');
assert(unitResults.csv_safe_name && unitResults.csv_safe_email, 'Anti-CSV Injection: Preservação de Textos e E-mails Normais', 'Textos e e-mails legítimos mantidos sem alteração');

// 3. Verificação de Código: Google OAuth sem fallback não autenticado
const studentCode = fs.readFileSync(path.join(ROOT, 'api/student.php'), 'utf8');
const hasGoogleFallback = studentCode.includes('decodificar JWT se timeout externo') || studentCode.includes('parsedLocal[\'iss\']');
assert(!hasGoogleFallback, 'Google OAuth: Eliminação de Fallback Inseguro', 'Removido bypass que aceitava tokens não verificados');

// 4. Verificação de Código: Correção do campo LGPD em generated_resumes
const hasCorrectLgpdField = studentCode.includes('WHERE student_id = ? OR candidate_email = ?');
assert(hasCorrectLgpdField, 'LGPD: Correção de Exclusão em generated_resumes', 'Query ajustada para usar candidate_email');

// 5. Verificação de Código: Eliminação da auto-criação de visualizador com senha estática
const authCode = fs.readFileSync(path.join(ROOT, 'api/auth.php'), 'utf8');
const hasViewerAutoInsert = authCode.includes('INSERT INTO admin_users (username, password_hash, role) VALUES (\'visualizador\'');
assert(!hasViewerAutoInsert, 'Gestão de Acesso: Remoção de Senha Estática do Visualizador', 'Eliminada auto-criação de usuário com credencial codificada');

// 6. Verificação do .gitignore e .htaccess
const gitignore = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
const htaccess = fs.readFileSync(path.join(ROOT, '.htaccess'), 'utf8');
const gitignoreProtected = gitignore.includes('signing-key-info.txt') && gitignore.includes('CHANGELOG_COMPLETO_VOCEPODETUDO.txt');
const htaccessProtected = htaccess.includes('signing-key-info') && htaccess.includes('keystore');
assert(gitignoreProtected, 'Proteção Local: .gitignore atualizado', 'signing-key-info.txt e changelog ignorados');
assert(htaccessProtected, 'Proteção Web: .htaccess bloqueia chaves e logs', 'Arquivos protegidos no nível do servidor Apache');

// 7. Execução dos 25 testes obrigatórios do Criador de Currículos
console.log('\nExecutando Suíte de Testes do Criador de Currículos (25 Itens)...');
const curriculoTestOutput = execSync(`node "${path.join(ROOT, 'scripts/test_curriculo.js')}"`, { encoding: 'utf8' });
const curriculoPassed = curriculoTestOutput.includes('TOTAL: 25 de 25 testes aprovados com sucesso.');
assert(curriculoPassed, 'Regressão: Suíte de 25 Testes do Criador de Currículos', 'Todos os 25 testes permanecem 100% aprovados');

console.log('\n====================================================');
console.log(`TOTAL DE TESTES P0: ${passedTests} de ${totalTests} APROVADOS.`);
console.log('====================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
