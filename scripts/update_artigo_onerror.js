const fs = require('fs');

let c = fs.readFileSync('artigo.php', 'utf8');
const oldStr = 'class="w-full h-auto max-h-[460px] object-cover"';
const newStr = 'onerror="this.onerror=null; this.src=\'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&auto=format&fit=crop&q=85\';" class="w-full h-auto max-h-[460px] object-cover"';

if (c.includes(oldStr)) {
  c = c.replace(oldStr, newStr);
  fs.writeFileSync('artigo.php', c, 'utf8');
  console.log('✅ artigo.php updated successfully with onerror fallback');
} else {
  console.log('⚠️ oldStr not found in artigo.php');
}
