require('./ftp_config');
const ftp = require('basic-ftp');

const ftpConfig = {
  host: 'ftp.vocepodetudo.com',
  user: 'vocepodetudo.com',
  password: process.env.FTP_PASSWORD || '',
  secure: false
};

async function checkFtp() {
  const client = new ftp.Client();
  try {
    await client.access(ftpConfig);
    await client.cd('public_html/src');
    const list = await client.list();
    const appFile = list.find(f => f.name === 'app.js');
    console.log('FTP public_html/src/app.js details:', appFile);
  } finally {
    client.close();
  }
}

checkFtp();
