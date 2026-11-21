require('./ftp_config');
const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');

const projectRoot = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const backupDir = path.join(projectRoot, 'backups', 'live_pre_deploy_20261114_2321');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

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

async function runDeploy() {
  console.log('================================================================');
  console.log(' DEPLOY EMERGENCIAL — PORTAL VOCÊ PODE TUDO (PRODUÇÃO) ');
  console.log('================================================================\n');

  const client = new ftp.Client();
  client.ftp.verbose = true;
  client.ftp.timeout = 30000;

  try {
    console.log('[1/4] Conectando ao servidor FTP StackCP...');
    await client.access(ftpConfig);
    console.log('✅ Conexão estabelecida com sucesso.\n');

    console.log('[2/4] Executando BACKUP IMEDIATO dos arquivos atuais em produção...');
    for (const relPath of targetFiles) {
      const remotePath = `/public_html/${relPath.replace(/\\/g, '/')}`;
      const localBackupPath = path.join(backupDir, relPath.replace(/\//g, '_'));
      try {
        await client.downloadTo(localBackupPath, remotePath);
        console.log(`  💾 Backup salvo: ${remotePath} -> ${localBackupPath}`);
      } catch (e) {
        console.log(`  ℹ️ Arquivo ainda não existe em produção (novo): ${remotePath}`);
      }
    }

    console.log('\n[3/4] Enviando arquivos atualizados para /public_html/...');
    for (const relPath of targetFiles) {
      const localPath = path.join(projectRoot, relPath);
      const remotePath = `/public_html/${relPath.replace(/\\/g, '/')}`;
      if (!fs.existsSync(localPath)) {
        throw new Error(`Arquivo local não encontrado: ${localPath}`);
      }
      console.log(`  🚀 Enviando: ${relPath} -> ${remotePath}`);
      await client.uploadFrom(localPath, remotePath);
      console.log(`  ✅ Upload concluído: ${relPath}`);
    }

    console.log('\n[4/4] Upload concluído com sucesso total!');
  } catch (err) {
    console.error('\n❌ ERRO DURANTE O DEPLOY:', err);
    process.exit(1);
  } finally {
    client.close();
  }
}

runDeploy();
