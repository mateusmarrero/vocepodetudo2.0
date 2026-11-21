const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');

if (fs.existsSync(envPath)) {
  try {
    if (typeof process.loadEnvFile === 'function') {
      process.loadEnvFile(envPath);
    } else {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const key = trimmed.slice(0, idx).trim();
          const val = trimmed.slice(idx + 1).trim();
          if (key && !(key in process.env)) {
            process.env[key] = val;
          }
        }
      });
    }
  } catch (e) {
    // Ignore error
  }
}

function getFtpConfig() {
  const password = process.env.FTP_PASSWORD;
  if (!password) {
    console.warn('\n⚠️ AVISO: FTP_PASSWORD não definida no arquivo .env nem no ambiente de execução.');
  }
  return {
    host: process.env.FTP_HOST || 'ftp.vocepodetudo.com',
    user: process.env.FTP_USER || 'vocepodetudo.com',
    password: password || '',
    secure: false
  };
}

module.exports = { getFtpConfig, projectRoot };
