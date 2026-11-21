require('./ftp_config');
const ftp = require('basic-ftp');
const path = require('path');

const projectRoot = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';

const ftpConfig = {
  host: 'ftp.vocepodetudo.com',
  user: 'vocepodetudo.com',
  password: process.env.FTP_PASSWORD || '',
  secure: false
};

const targetFiles = [
  'api/config.php',
  'artigo.php',
  'api/blog.php',
  'sitemap.php',
  'sitemap.xml',
  'api/rss.php',
  'rss.xml',
  '.htaccess',
  'index.html'
];

async function deployEmergencyFix() {
  console.log('Iniciando deploy dos arquivos da correção emergencial de agendamento...');
  const client = new ftp.Client();
  client.ftp.verbose = true;
  client.ftp.timeout = 30000;

  try {
    await client.access(ftpConfig);
    console.log('Conexão FTP estabelecida com sucesso.');

    for (const relPath of targetFiles) {
      const localPath = path.join(projectRoot, relPath);
      const remotePath = `/public_html/${relPath.replace(/\\/g, '/')}`;
      console.log(`Enviando: ${localPath} -> ${remotePath}`);
      await client.uploadFrom(localPath, remotePath);
      console.log(`✅ Upload concluído: ${relPath}`);
    }

    console.log('\n🎉 Deploy emergencial concluído com sucesso!');
  } catch (err) {
    console.error('❌ Falha no deploy via FTP:', err);
  } finally {
    client.close();
  }
}

// Executar apenas se chamado diretamente com flag --confirm
if (process.argv.includes('--confirm')) {
  deployEmergencyFix();
} else {
  console.log('⚠️ DEPLOY RETIDO: Para executar, execute: node scripts/deploy_emergency_scheduled_fix.js --confirm');
}
