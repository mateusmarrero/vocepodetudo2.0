require('./ftp_config');
const ftp = require('basic-ftp');
const path = require('path');

const ftpConfig = {
  host: 'ftp.vocepodetudo.com',
  user: 'vocepodetudo.com',
  password: process.env.FTP_PASSWORD || '',
  secure: false
};

async function uploadFiles() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  client.ftp.timeout = 60000;

  console.log('🚀 Conectando ao FTP para upload de cache_blog.json e seed_blog.json (174 artigos)...');
  try {
    await client.access(ftpConfig);
    console.log('✅ FTP conectado!');
    await client.cd('public_html/api');

    console.log('📤 Enviando api/cache_blog.json...');
    await client.uploadFrom('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/cache_blog.json', 'cache_blog.json');
    console.log('✅ cache_blog.json enviado com sucesso!');

    console.log('📤 Enviando api/seed_blog.json...');
    await client.uploadFrom('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/seed_blog.json', 'seed_blog.json');
    console.log('✅ seed_blog.json enviado com sucesso!');

    console.log('🎉 Upload concluído com sucesso!');
  } catch (err) {
    console.error('❌ Erro no upload FTP:', err);
    process.exit(1);
  } finally {
    client.close();
  }
}

uploadFiles();
