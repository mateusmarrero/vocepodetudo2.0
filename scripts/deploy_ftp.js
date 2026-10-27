const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

async function deploy() {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  console.log('🚀 Iniciando deploy automático via FTP para Você Pode Tudo...');
  try {
    await client.access({
      host: 'ftp.vocepodetudo.com',
      user: 'vocepodetudo.com',
      password: process.env.FTP_PASSWORD || 'Rx178gpo2@1985',
      secure: false
    });
    console.log('✅ Conexão FTP autenticada com sucesso!');

    const filesToUpload = [
      { local: '.htaccess', remote: 'public_html/.htaccess' },
      { local: 'index.html', remote: 'public_html/index.html' },
      { local: 'admin.html', remote: 'public_html/admin.html' },
      { local: 'database.sql', remote: 'public_html/database.sql' },
      { local: 'package.zip', remote: 'public_html/package.zip' },
      { local: 'src/app.js', remote: 'public_html/src/app.js' },
      { local: 'src/admin.js', remote: 'public_html/src/admin.js' },
      { local: 'src/style.css', remote: 'public_html/src/style.css' },
      { local: 'api/auth.php', remote: 'public_html/api/auth.php' },
      { local: 'api/config.php', remote: 'public_html/api/config.php' },
      { local: 'api/courses.php', remote: 'public_html/api/courses.php' },
      { local: 'api/cache_courses.json', remote: 'public_html/api/cache_courses.json' },
      { local: 'api/seed_courses.json', remote: 'public_html/api/seed_courses.json' },
      { local: 'api/student.php', remote: 'public_html/api/student.php' },
      { local: 'api/setup.php', remote: 'public_html/api/setup.php' },
      { local: 'api/test_db.php', remote: 'public_html/api/test_db.php' },
      { local: 'api/reset_admin.php', remote: 'public_html/api/reset_admin.php' },
      { local: 'api/analytics.php', remote: 'public_html/api/analytics.php' },
      { local: 'api/news.php', remote: 'public_html/api/news.php' }
    ];

    for (const item of filesToUpload) {
      if (fs.existsSync(item.local)) {
        process.stdout.write(`📤 Enviando ${item.local} -> ${item.remote}... `);
        await client.uploadFrom(item.local, item.remote);
        console.log(`OK (${fs.statSync(item.local).size} bytes)`);
      }
    }

    console.log('\n🎉 Deploy concluído com sucesso no servidor de produção!');
  } catch (err) {
    console.error('❌ Erro durante o deploy via FTP:', err);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
