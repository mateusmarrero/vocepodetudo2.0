const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const { getFtpConfig, projectRoot } = require('./ftp_config');

const ftpConfig = getFtpConfig();

async function uploadWithRetry(client, localPath, remotePath, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await client.uploadFrom(localPath, remotePath);
      return;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      console.warn(`\n⚠️ Tentativa ${attempt} falhou (${err.message}). Reconectando em 2s...`);
      await new Promise(r => setTimeout(r, 2000));
      try {
        await client.access(ftpConfig);
        await client.cd('public_html');
      } catch (e) {}
    }
  }
}

async function deploy() {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  client.ftp.timeout = 60000; // 60s timeout para estabilidade

  console.log('🚀 Iniciando deploy automático via FTP para Você Pode Tudo...');
  const uploadedFilesLog = [];

  try {
    await client.access(ftpConfig);
    console.log('✅ Conexão FTP autenticada com sucesso!');

    await client.cd('public_html');

    const filesToUpload = [
      { local: '.htaccess', remote: '.htaccess' },
      { local: 'manifest.json', remote: 'manifest.json' },
      { local: 'sw.js', remote: 'sw.js' },
      { local: 'ads.txt', remote: 'ads.txt' },
      { local: 'politica-privacidade.html', remote: 'politica-privacidade.html' },
      { local: 'exclusao-de-dados.html', remote: 'exclusao-de-dados.html' },
      { local: 'termos-de-uso.html', remote: 'termos-de-uso.html' },
      { local: 'robots.txt', remote: 'robots.txt' },
      { local: 'security.txt', remote: 'security.txt' },
      { local: 'sitemap.xml', remote: 'sitemap.xml' },
      { local: 'sitemap.php', remote: 'sitemap.php' },
      { local: 'rss.xml', remote: 'rss.xml' },
      { local: 'artigo.php', remote: 'artigo.php' },
      { local: 'curso.php', remote: 'curso.php' },
      { local: 'index.html', remote: 'index.html' },
      { local: 'midia-kit.html', remote: 'midia-kit.html' },
      { local: 'admin.html', remote: 'admin.html' },
      { local: 'curriculo.html', remote: 'curriculo.html' },
      { local: 'vagas.html', remote: 'vagas.html' },
      { local: 'blog.html', remote: 'blog.html' },
      { local: 'calculadora-trabalhista.html', remote: 'calculadora-trabalhista.html' },
      { local: 'materiais-gratuitos.html', remote: 'materiais-gratuitos.html' },
      { local: 'downloads.html', remote: 'downloads.html' },
      { local: 'vocepodetudo.apk', remote: 'vocepodetudo.apk' },
      { local: '404.html', remote: '404.html' },
      { local: 'sobre.html', remote: 'sobre.html' },
      { local: 'contato.html', remote: 'contato.html' },
      { local: 'funcionalidades.html', remote: 'funcionalidades.html' },
      { local: 'planos.html', remote: 'planos.html' },
      { local: 'como-funciona.html', remote: 'como-funciona.html' },
      { local: 'parcerias.html', remote: 'parcerias.html' },
      { local: 'recursos.html', remote: 'recursos.html' },
      { local: 'central-de-ajuda.html', remote: 'central-de-ajuda.html' },
      { local: 'politica-de-cookies.html', remote: 'politica-de-cookies.html' },
      { local: 'lgpd.html', remote: 'lgpd.html' },
      { local: 'termos-de-servico.html', remote: 'termos-de-servico.html' },
      { local: 'src/cookie-banner.js', remote: 'src/cookie-banner.js' },
      { local: 'api/contact.php', remote: 'api/contact.php' },
      { local: 'simulador-entrevista.html', remote: 'simulador-entrevista.html' },
      { local: 'teste-vocacional.html', remote: 'teste-vocacional.html' },
      { local: 'cursos-gratis-informatica.html', remote: 'cursos-gratis-informatica.html' },
      { local: 'cursos-gratis-excel.html', remote: 'cursos-gratis-excel.html' },
      { local: 'cursos-gratis-programacao.html', remote: 'cursos-gratis-programacao.html' },
      { local: 'cursos-gratis-ia.html', remote: 'cursos-gratis-ia.html' },
      { local: 'cursos-gratis-administracao.html', remote: 'cursos-gratis-administracao.html' },
      { local: 'cursos-gratis-ingles.html', remote: 'cursos-gratis-ingles.html' },
      { local: 'vagas-jovem-aprendiz-2026.html', remote: 'vagas-jovem-aprendiz-2026.html' },
      { local: 'assets/icon-192.png', remote: 'assets/icon-192.png' },
      { local: 'assets/icon-512.png', remote: 'assets/icon-512.png' },
      { local: 'assets/logo.png', remote: 'assets/logo.png' },
      { local: 'assets/logo-icon.png', remote: 'assets/logo-icon.png' },
      { local: 'assets/og-banner.jpg', remote: 'assets/og-banner.jpg' },
      { local: 'assets/mascote.png', remote: 'assets/mascote.png' },
      { local: 'src/app.js', remote: 'src/app.js' },
      { local: 'src/admin.js', remote: 'src/admin.js' },
      { local: 'src/style.css', remote: 'src/style.css' },
      { local: 'src/curriculo.js', remote: 'src/curriculo.js' },
      { local: 'src/curriculo.css', remote: 'src/curriculo.css' },
      { local: 'src/vagas.js', remote: 'src/vagas.js' },
      { local: 'src/blog.js', remote: 'src/blog.js' },
      { local: 'src/calculadora.js', remote: 'src/calculadora.js' },
      { local: 'src/simulador.js', remote: 'src/simulador.js' },
      { local: 'src/teste-vocacional.js', remote: 'src/teste-vocacional.js' },
      { local: 'src/data/courses.js', remote: 'src/data/courses.js' },
      { local: 'src/data/course_details.js', remote: 'src/data/course_details.js' },
      { local: 'src/data/career_quiz.js', remote: 'src/data/career_quiz.js' },
      { local: 'api/auth.php', remote: 'api/auth.php' },
      { local: 'api/config.php', remote: 'api/config.php' },
      { local: 'api/courses.php', remote: 'api/courses.php' },
      { local: 'api/curation.php', remote: 'api/curation.php' },
      { local: 'api/resumes.php', remote: 'api/resumes.php' },
      { local: 'api/cache_generated_resumes.json', remote: 'api/cache_generated_resumes.json' },
      { local: 'api/cache_courses.json', remote: 'api/cache_courses.json' },
      { local: 'api/cache_course_details.json', remote: 'api/cache_course_details.json' },
      { local: 'api/seed_courses.json', remote: 'api/seed_courses.json' },
      { local: 'api/student.php', remote: 'api/student.php' },
      { local: 'api/admin_students.php', remote: 'api/admin_students.php' },
      { local: 'api/announcement.php', remote: 'api/announcement.php' },
      { local: 'api/cache_announcement.json', remote: 'api/cache_announcement.json' },
      { local: 'api/backup.php', remote: 'api/backup.php' },
      { local: 'api/jobs.php', remote: 'api/jobs.php' },
      { local: 'api/jobs_sync.php', remote: 'api/jobs_sync.php' },
      { local: 'api/social_autopost.php', remote: 'api/social_autopost.php' },
      { local: 'api/courses_sync.php', remote: 'api/courses_sync.php' },
      { local: 'api/cache_jobs.json', remote: 'api/cache_jobs.json' },
      { local: 'api/seed_jobs.json', remote: 'api/seed_jobs.json' },
      { local: 'api/blog.php', remote: 'api/blog.php' },
      { local: 'api/cache_blog.json', remote: 'api/cache_blog.json' },
      { local: 'api/seed_blog.json', remote: 'api/seed_blog.json' },
      { local: 'api/analytics.php', remote: 'api/analytics.php' },
      { local: 'api/news.php', remote: 'api/news.php' },
      { local: 'api/rss.php', remote: 'api/rss.php' },
      { local: 'api/newsletter.php', remote: 'api/newsletter.php' },
      { local: 'api/cache_newsletter.json', remote: 'api/cache_newsletter.json' },
      { local: 'api/push.php', remote: 'api/push.php' },
      { local: 'api/cache_push_subscriptions.json', remote: 'api/cache_push_subscriptions.json' },
      { local: 'api/cache_push_notifications.json', remote: 'api/cache_push_notifications.json' },
      { local: 'api/ratings.php', remote: 'api/ratings.php' },
      { local: 'api/cache_ratings.json', remote: 'api/cache_ratings.json' },
      { local: 'api/audit_logs.php', remote: 'api/audit_logs.php' },
      { local: 'api/cache_audit_logs.json', remote: 'api/cache_audit_logs.json' },
      { local: 'api/banners.php', remote: 'api/banners.php' },
      { local: 'api/cache_banners.json', remote: 'api/cache_banners.json' },
      { local: 'curadoria_pendente/cursos_pendentes.json', remote: 'curadoria_pendente/cursos_pendentes.json' }
    ];

    try { await client.send('MKD assets'); } catch (e) {}
    try { await client.send('MKD curadoria_pendente'); } catch (e) {}

    for (const item of filesToUpload) {
      const localPath = path.resolve(projectRoot, item.local);
      if (fs.existsSync(localPath)) {
        process.stdout.write(`📤 Enviando ${item.local} -> ${item.remote}... `);
        await uploadWithRetry(client, localPath, item.remote);
        const size = fs.statSync(localPath).size;
        console.log(`OK (${size} bytes)`);
        uploadedFilesLog.push(`${item.local} -> ${item.remote}... OK (${size} bytes)`);
      } else {
        console.warn(`⚠️ Arquivo não encontrado localmente: ${localPath}`);
      }
    }

    // Remoção defensiva de arquivos sensíveis e utilitários obsoletos na produção
    const obsoleteFiles = [
      'api/setup.php',
      'api/test_db.php',
      'api/reset_admin.php',
      'database.sql',
      'package.zip'
    ];

    for (const obs of obsoleteFiles) {
      try {
        await client.remove(obs);
        console.log(`🗑️ Removido de public_html: ${obs}`);
      } catch (errIgnore) {
        // Arquivo já não existe no servidor
      }
    }

    try {
      try { await client.send('MKD .well-known'); } catch (e) {}
      const secPath = path.resolve(projectRoot, '.well-known/security.txt');
      if (fs.existsSync(secPath)) {
        process.stdout.write('📤 Enviando .well-known/security.txt... ');
        await uploadWithRetry(client, secPath, '.well-known/security.txt');
        console.log('OK');
        uploadedFilesLog.push('.well-known/security.txt... OK');
      }
      const assetlinksPath = path.resolve(projectRoot, '.well-known/assetlinks.json');
      if (fs.existsSync(assetlinksPath)) {
        process.stdout.write('📤 Enviando .well-known/assetlinks.json... ');
        await uploadWithRetry(client, assetlinksPath, '.well-known/assetlinks.json');
        console.log('OK');
        uploadedFilesLog.push('.well-known/assetlinks.json... OK');
      }
    } catch (e) {}

    console.log('\n🎉 Deploy concluído com sucesso no servidor de produção!');

    // Registro automático no histórico de deploys (deploy_history.json)
    try {
      const historyFile = path.resolve(projectRoot, 'deploy_history.json');
      let history = [];
      if (fs.existsSync(historyFile)) {
        history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
      }

      // Detecção de versão a partir do index.html ou changelog
      let detectedVersion = 'v4.9.4';
      try {
        const indexHtml = fs.readFileSync(path.resolve(projectRoot, 'index.html'), 'utf8');
        const match = indexHtml.match(/app\.js\?v=([0-9\.]+)/);
        if (match) detectedVersion = `v${match[1]}`;
      } catch (e) {}

      const customTitle = process.argv[2] || 'Deploy automático via FTP';
      const customDesc = process.argv[3] || 'Deploy e sincronização de arquivos para ambiente de produção.';

      history.push({
        deployNumber: history.length + 1,
        version: process.env.DEPLOY_VERSION || detectedVersion,
        title: customTitle,
        description: customDesc,
        taskId: process.env.TASK_ID || `cli-${Date.now()}`,
        timestamp: new Date().toISOString(),
        timestampBr: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
        status: 'SUCCESS',
        filesCount: uploadedFilesLog.length,
        files: uploadedFilesLog
      });

      fs.writeFileSync(historyFile, JSON.stringify(history, null, 2), 'utf8');
      console.log(`📝 Registro de deploy salvo automaticamente em ${historyFile} com ${uploadedFilesLog.length} arquivos.`);
    } catch (histErr) {
      console.warn('⚠️ Não foi possível salvar registro no histórico:', histErr.message);
    }

  } catch (err) {
    console.error('❌ Erro durante o deploy via FTP:', err.message || 'Falha na conexão');
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
