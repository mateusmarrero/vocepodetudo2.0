const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';

const allFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html') || f.endsWith('.js'));
const srcFiles = fs.readdirSync(path.join(dir, 'src')).map(f => 'src/' + f);

[...allFiles, ...srcFiles].forEach(relPath => {
  const fullPath = path.join(dir, relPath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    const c = fs.readFileSync(fullPath, 'utf8');
    const jobsMatches = (c.match(/#jobs-section/g) || []).length;
    const blogMatches = (c.match(/#blog-section/g) || []).length;
    if (jobsMatches > 0 || blogMatches > 0) {
      console.log(`${relPath}: ${jobsMatches} #jobs-section, ${blogMatches} #blog-section`);
    }
  }
});
