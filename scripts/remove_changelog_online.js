require('./ftp_config');
const ftp = require('basic-ftp');

const ftpConfig = {
  host: 'ftp.vocepodetudo.com',
  user: 'vocepodetudo.com',
  password: process.env.FTP_PASSWORD || '',
  secure: false
};

async function removeTxtFromOnline() {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  client.ftp.timeout = 30000;

  try {
    await client.access(ftpConfig);
    await client.cd('public_html');
    console.log('🗑️ Removendo arquivos de changelog do servidor online...');

    try {
      await client.remove('CHANGELOG_COMPLETO_VOCEPODETUDO.txt');
      console.log('✅ CHANGELOG_COMPLETO_VOCEPODETUDO.txt removido do servidor!');
    } catch (e) {
      console.log('Aviso ao remover CHANGELOG_COMPLETO_VOCEPODETUDO.txt:', e.message);
    }

    try {
      await client.remove('changelog.txt');
      console.log('✅ changelog.txt removido do servidor!');
    } catch (e) {
      console.log('Aviso ao remover changelog.txt:', e.message);
    }

    console.log('🎉 Limpeza concluída! Nenhum changelog está mais online.');
  } catch (err) {
    console.error('Erro ao conectar via FTP:', err.message);
  } finally {
    client.close();
  }
}

removeTxtFromOnline();
