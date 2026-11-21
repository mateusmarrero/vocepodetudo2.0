const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const vagasHtml = fs.readFileSync(path.join(dir, 'vagas.html'), 'utf8');

const lines = vagasHtml.split('\n');
lines.slice(390, 425).forEach((l, i) => console.log((390+i+1) + ': ' + l));
