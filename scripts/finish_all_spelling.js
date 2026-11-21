const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

// 1. Ajustes em index.html
let indexHtml = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
indexHtml = indexHtml.replace(/profissionalizacao/g, 'profissionalização');
indexHtml = indexHtml.replace(/instituicao/g, 'instituição');
fs.writeFileSync(path.join(projectRoot, 'index.html'), indexHtml, 'utf8');

// 2. Ajustes em curriculo.html
let cvHtml = fs.readFileSync(path.join(projectRoot, 'curriculo.html'), 'utf8');
// apenas em textos (sem mexer em cv- ou classes)
cvHtml = cvHtml.replace(/([>"\s])curriculo([<"\s,.])/gi, (m, p1, p2) => p1 + 'currículo' + p2);
fs.writeFileSync(path.join(projectRoot, 'curriculo.html'), cvHtml, 'utf8');

// 3. Ajustes em cursos-gratis-administracao.html e programacao.html
['cursos-gratis-administracao.html', 'cursos-gratis-programacao.html'].forEach(f => {
  const fp = path.join(projectRoot, f);
  if (fs.existsSync(fp)) {
    let c = fs.readFileSync(fp, 'utf8');
    c = c.replace(/([>"\s])administracao([<"\s,.])/gi, (m, p1, p2) => p1 + 'administração' + p2);
    c = c.replace(/([>"\s])programacao([<"\s,.])/gi, (m, p1, p2) => p1 + 'programação' + p2);
    fs.writeFileSync(fp, c, 'utf8');
  }
});

// 4. Ajustes em src/data/courses.js
const coursesPath = path.join(projectRoot, 'src', 'data', 'courses.js');
let coursesContent = fs.readFileSync(coursesPath, 'utf8');
const wordsMap = {
  'computacao': 'computação',
  'educacao': 'educação',
  'duracao': 'duração',
  'introducao': 'introdução',
  'comunicacao': 'comunicação',
  'programacao': 'programação',
  'conteudo': 'conteúdo',
  'curriculo': 'currículo',
  'atencao': 'atenção',
  'producao': 'produção',
  'criacao': 'criação',
  'distribuicao': 'distribuição',
  'alimentacao': 'alimentação',
  'administracao': 'administração',
  'animacao': 'animação',
  'irrigacao': 'irrigação',
  'informacao': 'informação',
  'infeccao': 'infecção',
  'recepcao': 'recepção'
};

Object.keys(wordsMap).forEach(w => {
  const target = wordsMap[w];
  // substituir quando for valor de tag ou texto: 'palavra' ou "palavra"
  const reg = new RegExp(`(['"])${w}(['"])`, 'gi');
  coursesContent = coursesContent.replace(reg, `$1${target}$2`);
});
fs.writeFileSync(coursesPath, coursesContent, 'utf8');

// 5. Ajustes em seed_blog.json e seed_jobs.json
['seed_blog.json', 'cache_blog.json'].forEach(bf => {
  const bp = path.join(projectRoot, 'api', bf);
  if (fs.existsSync(bp)) {
    let bc = fs.readFileSync(bp, 'utf8');
    Object.keys(wordsMap).forEach(w => {
      const target = wordsMap[w];
      const reg = new RegExp(`(['"])${w}(['"])`, 'gi');
      bc = bc.replace(reg, `$1${target}$2`);
    });
    bc = bc.replace(/"voce"/gi, '"você"');
    bc = bc.replace(/"inscricao"/gi, '"inscrição"');
    bc = bc.replace(/"fundacao"/gi, '"fundação"');
    fs.writeFileSync(bp, bc, 'utf8');
  }
});

['seed_jobs.json', 'cache_jobs.json'].forEach(jf => {
  const jp = path.join(projectRoot, 'api', jf);
  if (fs.existsSync(jp)) {
    let jc = fs.readFileSync(jp, 'utf8');
    jc = jc.replace(/"administracao"/gi, '"administração"');
    jc = jc.replace(/"informacao"/gi, '"informação"');
    jc = jc.replace(/"tecnico"/gi, '"técnico"');
    fs.writeFileSync(jp, jc, 'utf8');
  }
});

console.log('✅ Correções ortográficas finas aplicadas com sucesso.');
