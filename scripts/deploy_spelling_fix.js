require('./ftp_config');
const ftp = require('basic-ftp');
const path = require('path');
const https = require('https');

const ftpConfig = {
  host: 'ftp.vocepodetudo.com',
  user: 'vocepodetudo.com',
  password: process.env.FTP_PASSWORD || '',
  secure: false
};

function triggerSync() {
  return new Promise((resolve, reject) => {
    console.log('🔄 Disparando sincronização no MySQL via api/blog.php?force_sync=1...');
    https.get('https://vocepodetudo.com/api/blog.php?force_sync=1', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`📡 Resposta da sincronização (HTTP ${res.statusCode}):`, data.substring(0, 300));
        resolve({ statusCode: res.statusCode, data });
      });
    }).on('error', (err) => {
      console.error('❌ Erro na requisição HTTP:', err);
      reject(err);
    });
  });
}

async function deploySpellingFix() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  client.ftp.timeout = 60000;

  console.log('🚀 Iniciando deploy da correção ortográfica e acentuação no Blog...');
  try {
    await client.access(ftpConfig);
    console.log('✅ FTP conectado com sucesso!');

    const files = [
      { local: 'api/cache_blog.json', remote: 'public_html/api/cache_blog.json' },
      { local: 'api/seed_blog.json', remote: 'public_html/api/seed_blog.json' }
    ];

    for (const f of files) {
      console.log(`📤 Enviando ${f.local} -> ${f.remote}...`);
      await client.uploadFrom(path.join(__dirname, '..', f.local), f.remote);
      console.log(`✅ ${f.local} enviado com sucesso!`);
    }

    console.log('\n🎉 Arquivos JSON atualizados com sucesso no servidor de produção!');

    // Chamar force_sync para sincronizar os dados no MySQL
    await triggerSync();

    console.log('✅ Deploy e sincronização remota concluídos!');
  } catch (err) {
    console.error('❌ Falha no deploy:', err);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploySpellingFix();
