const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const files = ['politica-privacidade.html', 'termos-de-uso.html'];

files.forEach(file => {
  const filePath = path.join(ROOT_DIR, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const targetScript = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9421145457118515" crossorigin="anonymous"></script>';
    if (content.includes(targetScript)) {
      content = content.replace(targetScript, '<!-- AdSense explicitamente desativado em página jurídica (conformidade Google) -->');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ AdSense removido de ${file}`);
    } else {
      console.log(`ℹ️ AdSense já ausente em ${file}`);
    }
  }
});
