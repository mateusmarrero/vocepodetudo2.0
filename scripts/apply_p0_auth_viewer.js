const fs = require('fs');

const authPath = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/auth.php';
let content = fs.readFileSync(authPath, 'utf8');

const oldBlockRegex = /try\s*\{\s*\$chkViewer\s*=\s*\$pdo->prepare\("SELECT id FROM admin_users WHERE username = 'visualizador' LIMIT 1"\);[\s\S]*?\}\s*catch\s*\(Throwable\s*\$e\)\s*\{\}/;

if (oldBlockRegex.test(content)) {
    content = content.replace(oldBlockRegex, '// Segurança P0: Bloco de auto-criação de usuário visualizador com credencial estática removido do código.');
    fs.writeFileSync(authPath, content, 'utf8');
    console.log('✅ Bloco de auto-criação de credencial estática removido de api/auth.php');
} else {
    console.error('❌ Não encontrou bloco visualizador em api/auth.php');
    process.exit(1);
}
