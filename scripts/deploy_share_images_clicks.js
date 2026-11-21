require('./ftp_config');
const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');

const projectRoot = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';

const ftpConfig = {
  host: 'ftp.vocepodetudo.com',
  user: 'vocepodetudo.com',
  password: process.env.FTP_PASSWORD || '',
  secure: false
};

const filesToDeploy = [
  { local: 'artigo.php', remote: 'public_html/artigo.php' },
  { local: '.htaccess', remote: 'public_html/.htaccess' },
  { local: 'blog.html', remote: 'public_html/blog.html' },
  { local: 'index.html', remote: 'public_html/index.html' },
  { local: 'src/blog.js', remote: 'public_html/src/blog.js' },
  { local: 'src/app.js', remote: 'public_html/src/app.js' },
  { local: 'api/cache_blog.json', remote: 'public_html/api/cache_blog.json' },
  { local: 'api/seed_blog.json', remote: 'public_html/api/seed_blog.json' },
  { local: 'api/rss.php', remote: 'public_html/api/rss.php' }
];

async function deploy() {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  console.log('🚀 Iniciando deploy: Imagem em Compartilhamentos e Contagem de Cliques nos Artigos...');
  try {
    await client.access(ftpConfig);
    console.log('✅ Conexão FTP estabelecida com sucesso!');

    for (const item of filesToDeploy) {
      const localPath = path.join(projectRoot, item.local);
      if (!fs.existsSync(localPath)) {
        throw new Error(`Arquivo local não encontrado: ${localPath}`);
      }
      const stats = fs.statSync(localPath);
      console.log(`📤 Enviando: ${item.local} (${stats.size} bytes) -> ${item.remote}`);
      await client.uploadFrom(localPath, item.remote);
      console.log(`   ✅ Sucesso: ${item.remote}`);
    }

    console.log('\n🎉 Deploy concluído com 100% de sucesso!');
  } catch (err) {
    console.error('❌ Erro durante o deploy:', err);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
