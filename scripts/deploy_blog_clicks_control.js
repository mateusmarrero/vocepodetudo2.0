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
  { local: 'api/blog.php', remote: 'public_html/api/blog.php' },
  { local: 'admin.html', remote: 'public_html/admin.html' },
  { local: 'src/admin.js', remote: 'public_html/src/admin.js' }
];

async function deploy() {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  console.log('🚀 Iniciando deploy do Controle de Cliques do Blog...');
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
