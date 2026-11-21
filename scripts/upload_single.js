const ftp = require('basic-ftp');
const fs = require('fs');

async function uploadFile(localPath, remotePath) {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  client.ftp.timeout = 30000;

  try {
    await client.access({
      host: 'access-1002.stackcp.com',
      user: 'vocepodetudo.com',
      password: process.env.FTP_PASSWORD || 'x19Wp9fR6QZ1k',
      secure: false,
      port: 21
    });

    console.log('Connected to FTP');
    await client.cd('public_html');
    console.log('Changed to public_html');

    console.log(`Uploading ${localPath} -> ${remotePath}...`);
    await client.uploadFrom(localPath, remotePath);
    console.log('Upload complete!');

    const list = await client.list();
    const swItem = list.find(item => item.name === 'sw.js');
    console.log('Remote sw.js details:', swItem ? { name: swItem.name, size: swItem.size, date: swItem.date } : 'Not found');

  } catch (err) {
    console.error('FTP Error:', err);
  } finally {
    client.close();
  }
}

uploadFile('sw.js', 'sw.js');
