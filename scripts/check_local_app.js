const fs = require('fs');

const appContent = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/src/app.js', 'utf8');
console.log('Local length:', appContent.length);
console.log('Local has renderHomeTrafficRealtimeChart:', appContent.includes('renderHomeTrafficRealtimeChart'));
