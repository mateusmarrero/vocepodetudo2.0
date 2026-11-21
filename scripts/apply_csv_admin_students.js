const fs = require('fs');

const file = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/admin_students.php';
let content = fs.readFileSync(file, 'utf8');

// Substituir as linhas de fputcsv para mapear com sanitizeCsvField
const oldBlock1 = `fputcsv($output, [
                    $row['id'],
                    $row['name'],
                    $row['email'],
                    $row['phone'] ?? '-',
                    $row['goal'] ?? 'Geral',
                    ($row['is_active'] == 1 ? 'Ativo' : 'Bloqueado'),
                    $row['saved_courses'],
                    $row['tests_count'],
                    date('d/m/Y H:i', strtotime($row['created_at'])),
                    $row['last_login_at'] ? date('d/m/Y H:i', strtotime($row['last_login_at'])) : 'Nunca acessou'
                ], ';');`;

const newBlock1 = `fputcsv($output, array_map('sanitizeCsvField', [
                    $row['id'],
                    $row['name'],
                    $row['email'],
                    $row['phone'] ?? '-',
                    $row['goal'] ?? 'Geral',
                    ($row['is_active'] == 1 ? 'Ativo' : 'Bloqueado'),
                    $row['saved_courses'],
                    $row['tests_count'],
                    date('d/m/Y H:i', strtotime($row['created_at'])),
                    $row['last_login_at'] ? date('d/m/Y H:i', strtotime($row['last_login_at'])) : 'Nunca acessou'
                ]), ';');`;

const oldBlock2 = `fputcsv($output, [
                        $s['id'],
                        $s['name'],
                        $s['email'],
                        $s['phone'] ?? '-',
                        $s['goal'] ?? 'Geral',
                        'Ativo',
                        0,
                        0,
                        $s['created_at'] ?? date('d/m/Y H:i'),
                        '-'
                    ], ';');`;

const newBlock2 = `fputcsv($output, array_map('sanitizeCsvField', [
                        $s['id'],
                        $s['name'],
                        $s['email'],
                        $s['phone'] ?? '-',
                        $s['goal'] ?? 'Geral',
                        'Ativo',
                        0,
                        0,
                        $s['created_at'] ?? date('d/m/Y H:i'),
                        '-'
                    ]), ';');`;

if (content.includes(oldBlock1) && content.includes(oldBlock2)) {
    content = content.replace(oldBlock1, newBlock1).replace(oldBlock2, newBlock2);
    fs.writeFileSync(file, content, 'utf8');
    console.log('✅ api/admin_students.php protegido contra CSV Injection!');
} else {
    console.log('Aviso: Blocos em admin_students.php possuem pequenas variações de espaço.');
}
