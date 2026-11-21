const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const baseDir = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY';
const backupDir = path.join(baseDir, 'backups/pre_scheduled_fix_20261114');

const cache = JSON.parse(fs.readFileSync(path.join(baseDir, 'api/cache_blog.json'), 'utf8'));

const snapshot = cache.map(p => {
  const contentHash = crypto.createHash('sha256').update(p.content || '').digest('hex');
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    created_at: p.created_at,
    is_published: p.is_published,
    author: p.author,
    read_time_minutes: p.read_time_minutes,
    tags: p.tags,
    content_sha256: contentHash,
    content_length: (p.content || '').length
  };
}).sort((a,b) => a.id - b.id);

fs.writeFileSync(path.join(backupDir, 'snapshot_144_records.json'), JSON.stringify(snapshot, null, 2), 'utf8');
console.log(`Snapshot of 144 records saved with SHA-256 hashes! Total: ${snapshot.length}`);
