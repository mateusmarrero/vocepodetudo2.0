const fs = require('fs');

// 1. newsletter.php
const newsPath = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/newsletter.php';
let news = fs.readFileSync(newsPath, 'utf8');
const oldNews = `fputcsv($output, [
                $row['id'] ?? '',
                $row['email'] ?? '',
                $row['name'] ?? '',
                $row['source_page'] ?? '',
                ($row['is_active'] ?? 1) ? 'Ativo' : 'Inativo',
                $row['created_at'] ?? ''
            ], ';');`;
const newNews = `fputcsv($output, array_map('sanitizeCsvField', [
                $row['id'] ?? '',
                $row['email'] ?? '',
                $row['name'] ?? '',
                $row['source_page'] ?? '',
                ($row['is_active'] ?? 1) ? 'Ativo' : 'Inativo',
                $row['created_at'] ?? ''
            ]), ';');`;
if (news.includes(oldNews)) {
    news = news.replace(oldNews, newNews);
    fs.writeFileSync(newsPath, news, 'utf8');
    console.log('✅ api/newsletter.php protegido contra CSV Injection!');
}

// 2. audit_logs.php
const auditPath = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/audit_logs.php';
let audit = fs.readFileSync(auditPath, 'utf8');
const oldAudit = `fputcsv($output, [
            $r['id'] ?? '',
            $r['created_at'] ?? '',
            $r['admin_username'] ?? '',
            $r['action'] ?? '',
            $r['details'] ?? '',
            $r['ip_address'] ?? ''
        ]);`;
const newAudit = `fputcsv($output, array_map('sanitizeCsvField', [
            $r['id'] ?? '',
            $r['created_at'] ?? '',
            $r['admin_username'] ?? '',
            $r['action'] ?? '',
            $r['details'] ?? '',
            $r['ip_address'] ?? ''
        ]));`;
if (audit.includes(oldAudit)) {
    audit = audit.replace(oldAudit, newAudit);
    fs.writeFileSync(auditPath, audit, 'utf8');
    console.log('✅ api/audit_logs.php protegido contra CSV Injection!');
}

// 3. blog.php
const blogPath = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/blog.php';
let blog = fs.readFileSync(blogPath, 'utf8');
const oldBlog = `fputcsv($output, $row, $delimiter);`;
const newBlog = `fputcsv($output, array_map('sanitizeCsvField', $row), $delimiter);`;
if (blog.includes(oldBlog)) {
    blog = blog.replace(oldBlog, newBlog);
    fs.writeFileSync(blogPath, blog, 'utf8');
    console.log('✅ api/blog.php protegido contra CSV Injection!');
}
