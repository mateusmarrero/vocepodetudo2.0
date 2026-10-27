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

    await client.cd('public_html');

    const filesToUpload = [
      { local: '.htaccess', remote: '.htaccess' },
      { local: 'security.txt', remote: 'security.txt' },
      { local: 'index.html', remote: 'index.html' },
      { local: 'admin.html', remote: 'admin.html' },
      { local: 'database.sql', remote: 'database.sql' },
      { local: 'package.zip', remote: 'package.zip' },
      { local: 'src/app.js', remote: 'src/app.js' },
      { local: 'src/admin.js', remote: 'src/admin.js' },
      { local: 'src/style.css', remote: 'src/style.css' },
      { local: 'src/data/courses.js', remote: 'src/data/courses.js' },
      { local: 'src/data/career_quiz.js', remote: 'src/data/career_quiz.js' },
      { local: 'api/auth.php', remote: 'api/auth.php' },
      { local: 'api/config.php', remote: 'api/config.php' },
      { local: 'api/courses.php', remote: 'api/courses.php' },
      { local: 'api/cache_courses.json', remote: 'api/cache_courses.json' },
      { local: 'api/seed_courses.json', remote: 'api/seed_courses.json' },
      { local: 'api/student.php', remote: 'api/student.php' },
      { local: 'api/setup.php', remote: 'api/setup.php' },
      { local: 'api/test_db.php', remote: 'api/test_db.php' },
      { local: 'api/reset_admin.php', remote: 'api/reset_admin.php' },
      { local: 'api/analytics.php', remote: 'api/analytics.php' },
      { local: 'api/news.php', remote: 'api/news.php' }
    ];

    for (const item of filesToUpload) {
      if (fs.existsSync(item.local)) {
        process.stdout.write(`📤 Enviando ${item.local} -> ${item.remote}... `);
        await client.uploadFrom(item.local, item.remote);
        console.log(`OK (${fs.statSync(item.local).size} bytes)`);
      }
    }

    try {
      try { await client.send('MKD .well-known'); } catch (e) {}
      if (fs.existsSync('.well-known/security.txt')) {
        process.stdout.write('📤 Enviando .well-known/security.txt... ');
        await client.uploadFrom('.well-known/security.txt', '.well-known/security.txt');
        console.log('OK');
      }
    } catch (e) {}

    console.log('\n🎉 Deploy concluído com sucesso no servidor de produção!');
  } catch (err) {
    console.error('❌ Erro durante o deploy via FTP:', err);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
