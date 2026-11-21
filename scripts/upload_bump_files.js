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

async function uploadBumpFiles() {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  client.ftp.timeout = 40000;

  try {
    await client.access(ftpConfig);
    await client.cd('public_html');

    const files = ['index.html', 'admin.html', 'sw.js'];
    for (const f of files) {
      const local = path.resolve(projectRoot, f);
      await client.uploadFrom(local, f);
      console.log(`✅ ${f} enviado!`);
    }
  } finally {
    client.close();
  }
}

uploadBumpFiles();
