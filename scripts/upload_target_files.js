require('./ftp_config');
const ftp = require('basic-ftp');
const path = require('path');

const projectRoot = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY';

const ftpConfig = {
  host: 'ftp.vocepodetudo.com',
  user: 'vocepodetudo.com',
  password: process.env.FTP_PASSWORD || '',
  secure: false
};

async function uploadTargetFiles() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  client.ftp.timeout = 40000;

  try {
    console.log('Conectando ao FTP...');
    await client.access(ftpConfig);
    await client.cd('public_html');

    const files = [
      'index.html',
      'admin.html',
      'src/app.js',
      'src/admin.js'
    ];

    for (const f of files) {
      const local = path.resolve(projectRoot, f);
      console.log(`Enviando ${f}...`);
      await client.uploadFrom(local, f);
      console.log(`✅ ${f} enviado com sucesso!`);
    }
    console.log('🎉 Upload finalizado!');
  } catch (e) {
    console.error('Erro no upload:', e);
  } finally {
    client.close();
  }
}

uploadTargetFiles();
