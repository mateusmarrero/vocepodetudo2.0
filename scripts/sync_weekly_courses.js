const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');

// Novos cursos validados para adição ao portal
const newCoursesToAdd = [
  {
    id: 'evg-seguranca-informacao-todos',
    title: 'Segurança da Informação para Todos',
    provider: 'Escola Virtual de Governo (EV.G / RNP)',
    providerTag: 'Gov.br / EV.G',
    providerColor: 'bg-blue-50 text-[#002776] border-blue-200 font-black',
    category: 'tecnologia',
    description: 'Privacidade, proteção de dados pessoais, identificação de malwares, navegação segura e diretrizes de cibersegurança do Governo Federal.',
    url: 'https://www.escolavirtual.gov.br/curso/307',
    workloadHours: 24,
    hasFreeCertificate: true,
    certificateNote: 'Certificado Oficial Enap / Gov.br',
    level: 'Iniciante',
    tags: ['Gov.br', 'Cibersegurança', 'Certificado Oficial'],
    featured: true,
    rating: 4.9,
    reviewsCount: 3420,
    isActive: true
  },
  {
    id: 'evg-ia-generativa-microsoft',
    title: 'Inteligência Artificial Generativa',
    provider: 'Escola Virtual de Governo (EV.G / Microsoft)',
    providerTag: 'Microsoft / Enap',
    providerColor: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-black',
    category: 'tecnologia',
    description: 'Conceitos essenciais de IA generativa, modelos de linguagem natural, criação de imagens e aplicação prática com certificação oficial Enap.',
    url: 'https://www.escolavirtual.gov.br/curso/1094',
    workloadHours: 2,
    hasFreeCertificate: true,
    certificateNote: 'Certificado Oficial Enap / Microsoft',
    level: 'Iniciante',
    tags: ['Inteligência Artificial', 'Microsoft', 'Certificado Oficial'],
    featured: true,
    rating: 4.9,
    reviewsCount: 5180,
    isActive: true
  }
];

function runSync() {
  console.log('🔄 Executando curadoria e adição de cursos...');

  // 1. Atualizar api/cache_courses.json
  const cachePath = path.join(projectRoot, 'api', 'cache_courses.json');
  let cacheCourses = [];
  if (fs.existsSync(cachePath)) {
    cacheCourses = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  }

  let addedCount = 0;
  for (const newCourse of newCoursesToAdd) {
    const exists = cacheCourses.some(c => c.id === newCourse.id || c.title.toLowerCase() === newCourse.title.toLowerCase());
    if (!exists) {
      cacheCourses.unshift(newCourse);
      addedCount++;
      console.log(`✅ Adicionado ao cache: ${newCourse.title}`);
    } else {
      console.log(`ℹ️ Já existente no cache: ${newCourse.title}`);
    }
  }

  fs.writeFileSync(cachePath, JSON.stringify(cacheCourses, null, 2), 'utf8');

  // 2. Atualizar api/seed_courses.json
  const seedPath = path.join(projectRoot, 'api', 'seed_courses.json');
  if (fs.existsSync(seedPath)) {
    let seedCourses = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
    for (const newCourse of newCoursesToAdd) {
      const exists = seedCourses.some(c => c.id === newCourse.id || c.title.toLowerCase() === newCourse.title.toLowerCase());
      if (!exists) {
        seedCourses.unshift(newCourse);
      }
    }
    fs.writeFileSync(seedPath, JSON.stringify(seedCourses, null, 2), 'utf8');
  }

  // 3. Atualizar src/data/courses.js
  const coursesJsPath = path.join(projectRoot, 'src', 'data', 'courses.js');
  if (fs.existsSync(coursesJsPath)) {
    let coursesJs = fs.readFileSync(coursesJsPath, 'utf8');
    for (const newCourse of newCoursesToAdd) {
      if (!coursesJs.includes(newCourse.id)) {
        const insertTarget = 'const initialCourses = [';
        const formatted = JSON.stringify(newCourse, null, 4).split('\n').map(l => '  ' + l).join('\n') + ',';
        coursesJs = coursesJs.replace(insertTarget, `${insertTarget}\n${formatted}`);
      }
    }
    fs.writeFileSync(coursesJsPath, coursesJs, 'utf8');
  }

  // 4. Atualizar contadores em index.html
  const totalCount = cacheCourses.length;
  const freeCertCount = cacheCourses.filter(c => c.hasFreeCertificate).length;
  console.log(`📊 Total de cursos no catálogo: ${totalCount} (Com certificado gratuito: ${freeCertCount})`);

  const indexPath = path.join(projectRoot, 'index.html');
  if (fs.existsSync(indexPath)) {
    let indexHtml = fs.readFileSync(indexPath, 'utf8');
    indexHtml = indexHtml.replace(/id="stat-total-courses">[^<]+</, `id="stat-total-courses">${totalCount}+<`);
    indexHtml = indexHtml.replace(/id="stat-free-certs">[^<]+</, `id="stat-free-certs">${freeCertCount} Cursos<`);
    fs.writeFileSync(indexPath, indexHtml, 'utf8');
  }

  console.log(`🎉 Curadoria concluída com sucesso! ${addedCount} novos cursos adicionados.`);
}

runSync();
