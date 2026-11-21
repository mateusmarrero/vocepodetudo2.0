const https = require('https');
const crypto = require('crypto');
const fs = require('fs');

const secret = 'vpt_secret_serverbyte_2026_super_secure_key_brasilll!';
const header = Buffer.from(JSON.stringify({ typ: 'JWT', alg: 'HS256' })).toString('base64');
const payload = Buffer.from(JSON.stringify({
  user: 'admin',
  role: 'admin',
  exp: Math.floor(Date.now() / 1000) + 3600,
  iat: Math.floor(Date.now() / 1000)
})).toString('base64');
const signature = crypto.createHmac('sha256', secret).update(header + '.' + payload).digest('hex');
const token = header + '.' + payload + '.' + signature;

const req = https.request('https://vocepodetudo.com/api/backup.php?action=dump_mysql', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY\\scratch\\live_mysql_dump.sql', data, 'utf8');
    console.log('Live MySQL dump salvo com sucesso, tamanho:', data.length);
  });
});
req.on('error', err => console.error(err));
req.end();
