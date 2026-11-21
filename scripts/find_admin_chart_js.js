const fs = require('fs');

const adminJs = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/src/admin.js', 'utf8');
const lines = adminJs.split('\n');
lines.forEach((l, i) => {
  if (l.includes('traffic-realtime-chart') || l.includes('trafficChart') || l.includes('switchTrafficPeriod')) {
    console.log((i+1) + ': ' + l.trim());
  }
});
