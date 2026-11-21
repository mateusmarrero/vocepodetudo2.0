const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '..', 'src', 'app.js');
let appJs = fs.readFileSync(appJsPath, 'utf8');

const isCRLF = appJs.includes('\r\n');
if (isCRLF) appJs = appJs.replace(/\r\n/g, '\n');

const targetApp = `try {
      const ads = grid.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status])');
      ads.forEach(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      });
    } catch (_) {}`;

const replacementApp = `try {
      if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        const ads = grid.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status])');
        ads.forEach(ad => {
          ad.setAttribute('data-adsbygoogle-status', 'pending');
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        });
      }
    } catch (_) {}`;

if (appJs.includes(targetApp)) {
  appJs = appJs.replace(targetApp, replacementApp);
  if (isCRLF) appJs = appJs.replace(/\n/g, '\r\n');
  fs.writeFileSync(appJsPath, appJs, 'utf8');
  console.log('✅ src/app.js blindado contra TagError do AdSense');
} else {
  console.log('targetApp não bateu');
}
