require('./ftp_config');
const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');

async function uploadBackup() {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  client.ftp.timeout = 60000;

  try {
    await client.access({
      host: 'ftp.vocepodetudo.com',
      user: 'vocepodetudo.com',
      password: process.env.FTP_PASSWORD || '',
      secure: false
    });
    console.log('✅ FTP Conectado! Diretório inicial:', await client.pwd());
    const rootList = await client.list();
    console.log('Pastas encontradas na raiz FTP:');
    for (const item of rootList) {
      console.log(` - ${item.name} (${item.isDirectory ? 'DIR' : 'FILE'})`);
    }

    // StackCP FTP users typically start in root which has /public_html
    // Let's create a dedicated backups folder at the root (outside public_html) if possible
    let targetDir = 'backups';
    try {
      await client.ensureDir('backups');
      console.log('📁 Pasta /backups criada/acessada na raiz do servidor FTP (fora do public_html).');
    } catch (e) {
      console.warn('⚠️ Não foi possível criar na raiz, usando public_html/backups:', e.message);
      await client.cd('/public_html');
      await client.ensureDir('backups');
      targetDir = 'public_html/backups';
    }

    const localZip = path.resolve(__dirname, '../backups/backup_vocepodetudo_pre_tudo_20261029_110819.zip');
    const remoteZipName = 'backup_vocepodetudo_pre_tudo_20261029_110819.zip';

    if (!fs.existsSync(localZip)) {
      throw new Error(`Arquivo local não encontrado: ${localZip}`);
    }

    console.log(`📤 Enviando ${localZip} (${fs.statSync(localZip).size} bytes) para o FTP...`);
    await client.uploadFrom(localZip, remoteZipName);
    console.log('🎉 BACKUP ENVIADO COM SUCESSO PARA O SERVIDOR FTP!');

    const listBackup = await client.list();
    console.log('Conteúdo da pasta de backups no FTP:');
    for (const item of listBackup) {
      console.log(` - ${item.name} (${item.size} bytes)`);
    }
  } catch (err) {
    console.error('❌ Erro no FTP:', err);
  } finally {
    client.close();
  }
}

uploadBackup();
