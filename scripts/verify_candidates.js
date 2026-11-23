const https = require('https');

const candidateUrls = [
  'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop&q=80', // Calendar / Agenda
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80', // Smartphone / App / Scanner
  'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&auto=format&fit=crop&q=80', // Checklist / Todoist
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=80', // Notion / Desk / Workspace
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80', // Laptop / Study / Microsoft To Do
  'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&auto=format&fit=crop&q=80', // Sticky notes / Trello
  'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&auto=format&fit=crop&q=80', // Cornell Notes / Notebook
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80', // Books / Anki / Flashcards
  'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80', // Mind map / Wireframe
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80', // Obsidian / Code / Data
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80', // Concursos / Exam study
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80', // Students group
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80', // Team collaboration
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80', // Interview candidate
  'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=800&auto=format&fit=crop&q=80', // Professional interview
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80', // Cybersecurity / Fake jobs
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80', // Children & digital education
  'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=800&auto=format&fit=crop&q=80', // E-commerce / Sales
  'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&auto=format&fit=crop&q=80'  // Accessibility & tech
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD', timeout: 8000 }, (res) => {
      resolve({ url, status: res.statusCode });
    });
    req.on('error', (err) => resolve({ url, status: 'ERROR', error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ url, status: 'TIMEOUT' }); });
    req.end();
  });
}

(async () => {
  const results = await Promise.all(candidateUrls.map(checkUrl));
  const bad = results.filter(r => r.status !== 200 && r.status !== 301 && r.status !== 302);
  console.log('Bad candidate URLs:', bad.length);
  results.forEach(r => console.log(`[${r.status}] ${r.url.substring(28, 65)}`));
})();
