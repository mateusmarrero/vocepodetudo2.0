require('./ftp_config');
const ftp = require('basic-ftp');
const path = require('path');

const ftpConfig = {
  host: 'ftp.vocepodetudo.com',
  user: 'vocepodetudo.com',
  password: process.env.FTP_PASSWORD || '',
  secure: false
};

async function deployFix() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  client.ftp.timeout = 60000;

  console.log('🚀 Iniciando deploy da correção de \\n perdidos...');
  try {
    await client.access(ftpConfig);
    console.log('✅ FTP conectado!');

    const files = [
      { local: 'api/cache_blog.json', remote: 'public_html/api/cache_blog.json' },
      { local: 'api/seed_blog.json', remote: 'public_html/api/seed_blog.json' },
      { local: 'artigo.php', remote: 'public_html/artigo.php' },
      { local: 'blog.html', remote: 'public_html/blog.html' },
      { local: 'src/blog.js', remote: 'public_html/src/blog.js' }
    ];

    for (const f of files) {
      console.log(`📤 Enviando ${f.local} -> ${f.remote}...`);
      await client.uploadFrom(path.join(__dirname, '..', f.local), f.remote);
      console.log(`✅ ${f.local} enviado com sucesso!`);
    }

    console.log('\n🎉 Todos os 5 arquivos foram enviados com sucesso via FTP!');
  } catch (err) {
    console.error('❌ Erro no upload FTP:', err);
    process.exit(1);
  } finally {
    client.close();
  }
}

deployFix();
