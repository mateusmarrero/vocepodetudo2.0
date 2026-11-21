require('./ftp_config');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ftp = require('basic-ftp');

const projectRoot = path.resolve(__dirname, '..');
const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
const backupName = `backup_vocepodetudo_pre_modularizacao_${timestamp}.zip`;
const localBackupDir = path.resolve(projectRoot, 'backups');
if (!fs.existsSync(localBackupDir)) {
  fs.mkdirSync(localBackupDir, { recursive: true });
}
const localZipPath = path.resolve(localBackupDir, backupName);

function createLocalZip() {
  console.log(`📦 Criando backup local: ${localZipPath}...`);
  const itemsToInclude = [
    'index.html',
    'admin.html',
    'curriculo.html',
    '.htaccess',
    'manifest.json',
    'sw.js',
    'robots.txt',
    'sitemap.xml',
    'security.txt',
    'ads.txt',
    'package.json',
    'package-lock.json',
    'CHANGELOG.md',
    'README.md',
    'PROJECT_RULES.md',
    'deploy_history.json',
    'src',
    'api',
    'assets',
    'scripts',
    '.well-known'
  ].map(item => `'${path.resolve(projectRoot, item)}'`).join(',');

  const psCmd = `powershell -NoProfile -Command "Compress-Archive -Path ${itemsToInclude} -DestinationPath '${localZipPath}' -Force"`;
  execSync(psCmd, { stdio: 'inherit' });
  const size = fs.statSync(localZipPath).size;
  console.log(`✅ Backup local criado com sucesso! Tamanho: ${size} bytes.`);
  return localZipPath;
}

async function uploadToFtp() {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  client.ftp.timeout = 60000;

  try {
    console.log('📡 Conectando ao servidor FTP para envio do backup...');
    await client.access({
      host: 'ftp.vocepodetudo.com',
      user: 'vocepodetudo.com',
      password: process.env.FTP_PASSWORD || '',
      secure: false
    });

    await client.ensureDir('backups');
    console.log(`📤 Enviando ${backupName} (${fs.statSync(localZipPath).size} bytes) para /backups no FTP...`);
    await client.uploadFrom(localZipPath, backupName);
    console.log('🎉 BACKUP CONCLUÍDO E PROTEGIDO COM SUCESSO NO FTP!');

    const list = await client.list();
    console.log('Conteúdo da pasta de backups no servidor FTP:');
    list.forEach(item => {
      console.log(` - ${item.name} (${item.size} bytes)`);
    });
  } finally {
    client.close();
  }
}

async function main() {
  await createLocalZip();
  await uploadToFtp();
  console.log(`\n✅ Backup concluído localmente e no FTP: ${backupName}`);
}

main().catch(err => {
  console.error('❌ Erro no processo de backup:', err);
  process.exit(1);
});
