const fs = require('fs');

const sql = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/database.sql', 'utf8');
const blocks = sql.split(/CREATE TABLE/i);
for (let i = 1; i < blocks.length; i++) {
  const block = 'CREATE TABLE' + blocks[i].split(';')[0];
  console.log('====================================');
  console.log(block.trim());
}
