const fs = require('fs');

const file = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/resumes.php';
let content = fs.readFileSync(file, 'utf8');

const oldBlock = `foreach ($rows as $row) {
            fputcsv($output, [
                $row['id'],
                $row['candidate_name'],
                $row['candidate_email'],
                $row['candidate_phone'],
                $row['candidate_city'],
                $row['candidate_state'],
                $row['target_role'],
                $row['template_id'],
                ($row['has_photo'] == 1 || $row['has_photo'] === 'Sim') ? 'Sim' : 'Não',
                $row['downloads_count'],
                $row['created_at']
            ], ';');
        }`;

const newBlock = `foreach ($rows as $row) {
            fputcsv($output, array_map('sanitizeCsvField', [
                $row['id'],
                $row['candidate_name'],
                $row['candidate_email'],
                $row['candidate_phone'],
                $row['candidate_city'],
                $row['candidate_state'],
                $row['target_role'],
                $row['template_id'],
                ($row['has_photo'] == 1 || $row['has_photo'] === 'Sim') ? 'Sim' : 'Não',
                $row['downloads_count'],
                $row['created_at']
            ]), ';');
        }`;

if (content.includes(oldBlock)) {
    content = content.replace(oldBlock, newBlock);
    fs.writeFileSync(file, content, 'utf8');
    console.log('✅ api/resumes.php protegido contra CSV Injection!');
} else {
    console.error('❌ Bloco não encontrado em api/resumes.php');
}
