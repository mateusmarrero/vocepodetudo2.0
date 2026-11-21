const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

const scripts = [...index.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
scripts.forEach((s, idx) => {
  const srcMatch = s[0].match(/src=["']([^"']+)["']/i);
  if (srcMatch) {
    console.log(`Script ${idx + 1}: SRC = ${srcMatch[1]}`);
  } else {
    console.log(`Script ${idx + 1}: INLINE (${s[1].trim().slice(0, 80)}...)`);
  }
});
