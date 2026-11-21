const https = require('https');
const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..');
const keystorePath = path.join(baseDir, 'android_build', 'extracted', 'signing.keystore');
const rawKeystore = fs.readFileSync(keystorePath);

async function testFormat(name, signingConfig) {
  const postData = {
    appVersion: "4.48.0",
    appVersionCode: 2,
    host: "https://vocepodetudo.com",
    packageId: "com.vocepodetudo.app",
    name: "Você Pode Tudo",
    launcherName: "Você Pode Tudo",
    webManifestUrl: "https://vocepodetudo.com/manifest.json",
    ...signingConfig
  };

  const body = JSON.stringify(postData);
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'pwabuilder-cloudapk.azurewebsites.net',
      path: '/enqueuePackageJob',
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(body),
        'platform-identifier': 'ServerUI',
        'platform-identifier-version': '1.0.0'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`[${name}] Status: ${res.statusCode} | Resposta: ${data.slice(0, 150)}`);
        resolve(res.statusCode === 200);
      });
    });
    req.on('error', e => {
      console.log(`[${name}] Erro de rede:`, e.message);
      resolve(false);
    });
    req.write(body);
    req.end();
  });
}

async function run() {
  // Teste 1: data URI
  await testFormat('data-uri', {
    signingMode: 'mine',
    signing: {
      file: `data:application/octet-stream;base64,${rawKeystore.toString('base64')}`,
      alias: 'vocepodetudo',
      keyPassword: '0RkiUY7bTLBf',
      storePassword: '0RkiUY7bTLBf'
    }
  });

  // Teste 2: objeto { name, content }
  await testFormat('object-content', {
    signingMode: 'mine',
    signing: {
      file: {
        name: 'signing.keystore',
        content: rawKeystore.toString('base64')
      },
      alias: 'vocepodetudo',
      keyPassword: '0RkiUY7bTLBf',
      storePassword: '0RkiUY7bTLBf'
    }
  });

  // Teste 3: signingMode new com senhas do projeto
  await testFormat('mode-new', {
    signingMode: 'new',
    signing: {
      file: null,
      alias: 'vocepodetudo',
      fullName: 'Voce Pode Tudo',
      organization: 'Voce Pode Tudo',
      organizationalUnit: 'Educacao e Tecnologia',
      countryCode: 'BR',
      keyPassword: 'VcpdtdAppSecure2026!',
      storePassword: 'VcpdtdAppSecure2026!'
    }
  });
}

run();
