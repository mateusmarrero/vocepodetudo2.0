const https = require('https');
const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..');
const keystorePath = path.join(baseDir, 'android_build', 'extracted', 'signing.keystore');
const rawKeystore = fs.readFileSync(keystorePath);

const baseOptions = {
  additionalTrustedOrigins: [],
  appVersion: "4.48.0",
  appVersionCode: 2,
  backgroundColor: "#f8fafc",
  display: "standalone",
  enableSiteSettingsShortcut: true,
  enableNotifications: true,
  includeSourceCode: true,
  fallbackType: "customtabs",
  features: {
    locationDelegation: { enabled: true },
    playBilling: { enabled: false }
  },
  host: "https://vocepodetudo.com",
  iconUrl: "https://vocepodetudo.com/assets/icon-512.png",
  maskableIconUrl: "https://vocepodetudo.com/assets/icon-512.png",
  launcherName: "Você Pode Tudo",
  name: "Você Pode Tudo — Cursos Gratuitos e Currículo",
  navigationColor: "#009639",
  navigationColorDark: "#002776",
  navigationDividerColor: "#009639",
  navigationDividerColorDark: "#002776",
  orientation: "default",
  packageId: "com.vocepodetudo.app",
  pwaUrl: "https://vocepodetudo.com",
  shortcuts: [],
  splashScreenFadeOutDuration: 300,
  startUrl: "/",
  themeColor: "#009639",
  themeColorDark: "#002776",
  webManifestUrl: "https://vocepodetudo.com/manifest.json"
};

async function testWithFullOptions(name, signingConfig) {
  const postData = { ...baseOptions, ...signingConfig };
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
        resolve(res.statusCode === 200 ? JSON.parse(data) : null);
      });
    });
    req.on('error', e => {
      console.log(`[${name}] Erro:`, e.message);
      resolve(null);
    });
    req.write(body);
    req.end();
  });
}

async function run() {
  console.log('Testando formato 1: signingMode: "new"');
  const resNew = await testWithFullOptions('signingMode-new', {
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

  if (resNew) {
    console.log('✅ Formato signingMode: "new" aceito com sucesso! Job ID:', resNew.id);
  }
}

run();
