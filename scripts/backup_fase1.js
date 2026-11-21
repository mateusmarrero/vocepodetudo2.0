const fs = require('fs');
const path = require('path');

const baseDir = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY';
const backupDir = path.join(baseDir, 'backups/pre_scheduled_fix_20261114');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const filesToBackup = [
  'artigo.php',
  'database.sql',
  'sitemap.xml',
  'rss.xml',
  '.htaccess',
  'api/blog.php',
  'api/rss.php',
  'api/config.php',
  'api/cache_blog.json',
  'api/seed_blog.json',
  'src/blog.js'
];

const backupManifest = {};

filesToBackup.forEach(relPath => {
  const src = path.join(baseDir, relPath);
  const dest = path.join(backupDir, relPath.replace(/\//g, '_'));
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    const stat = fs.statSync(src);
    backupManifest[relPath] = {
      backupFile: dest,
      bytes: stat.size,
      mtime: stat.mtime.toISOString()
    };
    console.log(`Backed up ${relPath} (${stat.size} bytes) -> ${dest}`);
  } else {
    console.warn(`File not found: ${src}`);
  }
});

fs.writeFileSync(path.join(backupDir, 'manifest.json'), JSON.stringify(backupManifest, null, 2), 'utf8');
console.log('FASE 1 Backup completed successfully!');
