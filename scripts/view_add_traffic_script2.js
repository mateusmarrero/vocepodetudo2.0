const fs = require('fs');

if (fs.existsSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/scripts/add_traffic_chart.js')) {
  console.log(fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/scripts/add_traffic_chart.js', 'utf8').slice(2000, 4500));
}
