const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const baseDir = path.resolve(__dirname, '..');

const options = {
  additionalTrustedOrigins: [],
  appVersion: "4.48.0",
  appVersionCode: 2,
  backgroundColor: "#f8fafc",
  display: "standalone",
  enableSiteSettingsShortcut: true,
  enableNotifications: false,
  includeSourceCode: true,
  fallbackType: "customtabs",
  features: {
    locationDelegation: { enabled: true },
    playBilling: { enabled: false }
  },
  host: "https://vocepodetudo.com",
  iconUrl: "https://raw.githubusercontent.com/mateusmarrero/vocepodetudo2.0/main/assets/icon-512.png",
  maskableIconUrl: "https://raw.githubusercontent.com/mateusmarrero/vocepodetudo2.0/main/assets/icon-512.png",
  launcherName: "Você Pode Tudo",
  name: "Você Pode Tudo — Cursos Gratuitos e Currículo",
  navigationColor: "#009639",
  navigationColorDark: "#002776",
  navigationDividerColor: "#009639",
  navigationDividerColorDark: "#002776",
  orientation: "default",
  packageId: "com.vocepodetudo.app",
  pwaUrl: "https://vocepodetudo.com",
  shortcuts: [
    {
      name: "Catálogo de Cursos",
      short_name: "Cursos",
      url: "/#catalogo",
      icons: [{ sizes: "192x192", src: "https://raw.githubusercontent.com/mateusmarrero/vocepodetudo2.0/main/assets/icon-192.png" }]
    },
    {
      name: "Criar Currículo",
      short_name: "Currículo",
      url: "/curriculo.html",
      icons: [{ sizes: "192x192", src: "https://raw.githubusercontent.com/mateusmarrero/vocepodetudo2.0/main/assets/icon-192.png" }]
    }
  ],
  signingMode: "new",
  signing: {
    file: null,
    alias: "vocepodetudo",
    fullName: "Voce Pode Tudo",
    organization: "Voce Pode Tudo",
    organizationalUnit: "Educacao e Tecnologia",
    countryCode: "BR",
    keyPassword: "VcpdtdAppSecure2026!",
    storePassword: "VcpdtdAppSecure2026!"
  },
  splashScreenFadeOutDuration: 300,
  startUrl: "/",
  themeColor: "#009639",
  themeColorDark: "#002776",
  webManifestUrl: "https://raw.githubusercontent.com/mateusmarrero/vocepodetudo2.0/main/manifest.json"
};

function requestPost(endpoint, postData) {
  return new Promise((resolve, reject) => {
    const postBody = JSON.stringify(postData);
    const req = https.request({
      hostname: 'pwabuilder-cloudapk.azurewebsites.net',
      path: endpoint,
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(postBody),
        'platform-identifier': 'ServerUI',
        'platform-identifier-version': '1.0.0'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch(e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(postBody);
    req.end();
  });
}

function requestGetJson(pathWithQuery, token) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'pwabuilder-cloudapk.azurewebsites.net',
      path: pathWithQuery,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch(e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function downloadBinary(pathWithQuery, token, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    const req = https.request({
      hostname: 'pwabuilder-cloudapk.azurewebsites.net',
      path: pathWithQuery,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    }, res => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        res.pipe(file);
        file.on('finish', () => {
          file.close(() => resolve(outputPath));
        });
      } else {
        let errData = '';
        res.on('data', d => errData += d);
        res.on('end', () => reject(new Error(`Download failed HTTP ${res.statusCode}: ${errData}`)));
      }
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('🚀 Compilando APK e AAB Atualizados (v4.48.0 / Code 2)...');
  console.log('📦 PWA URL:', options.pwaUrl);
  console.log('📦 Package ID:', options.packageId);

  console.log('\nEnfileirando job no PWABuilder CloudAPK service...');
  const enqueueResult = await requestPost('/enqueuePackageJob', options);
  console.log('✅ Job enfileirado com sucesso!');

  const { id: jobId, accessToken } = enqueueResult;
  console.log(`Job ID: ${jobId}`);

  let completed = false;
  let attempts = 0;
  const maxAttempts = 60; // até 3-4 minutos

  while (!completed && attempts < maxAttempts) {
    attempts++;
    await new Promise(r => setTimeout(r, 4000));

    try {
      const job = await requestGetJson(`/getPackageJob?id=${encodeURIComponent(jobId)}`, accessToken);
      console.log(`[Tentativa ${attempts}] Status: ${job.status}`);

      if (job.logs && Array.isArray(job.logs) && job.logs.length > 0) {
        const lastLog = job.logs[job.logs.length - 1];
        console.log(`   Log: ${lastLog}`);
      }

      if (job.status === 'Completed') {
        completed = true;
        console.log('\n🎉 Compilação do APK e AAB concluída com SUCESSO!');
        
        const outputDir = path.resolve(__dirname, '..', 'android_build');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const zipPath = path.join(outputDir, 'VocePodeTudo_Android_Bundle.zip');
        console.log(`Baixando pacote atualizado para: ${zipPath}...`);
        await downloadBinary(`/downloadPackageZip?id=${encodeURIComponent(jobId)}`, accessToken, zipPath);
        
        const stat = fs.statSync(zipPath);
        console.log(`✅ Download concluído! Tamanho do ZIP: ${(stat.size / (1024 * 1024)).toFixed(2)} MB`);

        // Descompactar usando PowerShell Expand-Archive
        const extDir = path.join(outputDir, 'extracted');
        console.log(`Extraindo arquivos para: ${extDir}...`);
        execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${extDir}' -Force"`, { stdio: 'inherit' });

        console.log('\nArquivos extraídos:');
        const extractedFiles = fs.readdirSync(extDir);
        console.log(extractedFiles);

        // Atualizar assetlinks.json na pasta .well-known se foi gerado
        const newAssetlinksPath = path.join(extDir, 'assetlinks.json');
        if (fs.existsSync(newAssetlinksPath)) {
          const wellKnownDir = path.join(baseDir, '.well-known');
          fs.copyFileSync(newAssetlinksPath, path.join(wellKnownDir, 'assetlinks.json'));
          console.log('✅ .well-known/assetlinks.json atualizado com as novas chaves!');
        }

        // Copiar APK para a raiz como vocepodetudo.apk
        const apkFile = extractedFiles.find(f => f.endsWith('.apk'));
        if (apkFile) {
          const srcApk = path.join(extDir, apkFile);
          const destApk = path.join(baseDir, 'vocepodetudo.apk');
          fs.copyFileSync(srcApk, destApk);
          const apkStat = fs.statSync(destApk);
          console.log(`✅ APK copiado para a raiz: ${destApk} (${(apkStat.size / (1024 * 1024)).toFixed(2)} MB)`);
        }

        return;
      } else if (job.status === 'Failed') {
        throw new Error(`Falha no build do pacote Android: ${JSON.stringify(job.logs || job)}`);
      }
    } catch (e) {
      if (e.message.includes('Falha no build')) throw e;
      console.warn('Aviso no polling:', e.message);
    }
  }

  if (!completed) {
    throw new Error('Tempo limite de compilação excedido.');
  }
}

main().catch(err => {
  console.error('\n❌ Erro durante compilação do APK:', err);
  process.exit(1);
});
