const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const adminHtml = fs.readFileSync(path.join(ROOT, 'admin.html'), 'utf8');

const secAnnouncement = adminHtml.indexOf('id="section-announcement"');
console.log(adminHtml.slice(secAnnouncement, secAnnouncement + 1200));
