const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const COURSES_JS_PATH = path.join(ROOT_DIR, 'src', 'data', 'courses.js');
const SEED_JSON_PATH = path.join(ROOT_DIR, 'api', 'seed_courses.json');
const CACHE_JSON_PATH = path.join(ROOT_DIR, 'api', 'cache_courses.json');
const NEW_COURSES_PATH = path.join(ROOT_DIR, 'scripts', 'temp_novos_cursos.json');

console.log('=== Iniciando Integração dos Novos Cursos de Estética ===');

// 1. Carregar novos cursos
if (!fs.existsSync(NEW_COURSES_PATH)) {
  console.error('Arquivo temp_novos_cursos.json não encontrado!');
  process.exit(1);
}

const newCourses = JSON.parse(fs.readFileSync(NEW_COURSES_PATH, 'utf8'));
console.log(`Novos cursos carregados: ${newCourses.length}`);

// 2. Carregar e verificar courses.js atual
const initialCoursesModule = require(COURSES_JS_PATH);
const initialLocalCourses = initialCoursesModule.localCourses;
console.log(`Catálogo atual em courses.js: ${initialLocalCourses.length} cursos`);

if (initialLocalCourses.length !== 192) {
  console.error(`Erro: esperava-se 192 cursos existentes, mas foram encontrados ${initialLocalCourses.length}!`);
  process.exit(1);
}

// Verificar se há colisão de IDs
const existingIds = new Set(initialLocalCourses.map(c => c.id));
for (const course of newCourses) {
  if (existingIds.has(course.id)) {
    console.error(`Erro de colisão de ID: o ID "${course.id}" já existe no catálogo!`);
    process.exit(1);
  }
}
console.log('Zero colisões de IDs detectadas.');

// 3. Atualizar src/data/courses.js
let coursesJsContent = fs.readFileSync(COURSES_JS_PATH, 'utf8');

// Localizar o final do array localCourses
// Procuramos pelo fechamento do array antes de 'if (typeof window'
const windowExportMarker = "if (typeof window !== 'undefined')";
const markerIndex = coursesJsContent.indexOf(windowExportMarker);
if (markerIndex === -1) {
  console.error('Marcador "if (typeof window" não encontrado em courses.js!');
  process.exit(1);
}

const beforeMarker = coursesJsContent.slice(0, markerIndex);
const afterMarker = coursesJsContent.slice(markerIndex);

// No beforeMarker, encontrar o último '];'
const lastClosingBracketIndex = beforeMarker.lastIndexOf('];');
if (lastClosingBracketIndex === -1) {
  console.error('Fechamento "];" não encontrado antes do marcador em courses.js!');
  process.exit(1);
}

const beforeClosing = beforeMarker.slice(0, lastClosingBracketIndex).trimEnd();
const formattedNewCourses = newCourses.map(c => {
  const lines = JSON.stringify(c, null, 2).split('\n');
  return lines.map(line => '  ' + line).join('\n');
}).join(',\n');

// Montar o novo conteúdo preservando rigorosamente o que havia antes
const updatedCoursesJs = beforeClosing + ',\n' + formattedNewCourses + '\n];\n\n' + afterMarker;

fs.writeFileSync(COURSES_JS_PATH, updatedCoursesJs, 'utf8');
console.log('src/data/courses.js atualizado com sucesso.');

// 4. Atualizar api/seed_courses.json
const seedRaw = fs.readFileSync(SEED_JSON_PATH, 'utf8');
const seedArray = JSON.parse(seedRaw);
console.log(`Catálogo atual em seed_courses.json: ${seedArray.length} cursos`);

if (seedArray.length !== 192) {
  console.error(`Aviso/Erro: seed_courses.json possui ${seedArray.length} cursos`);
}

const updatedSeedArray = [...seedArray, ...newCourses];
fs.writeFileSync(SEED_JSON_PATH, JSON.stringify(updatedSeedArray, null, 2) + '\n', 'utf8');
console.log(`api/seed_courses.json atualizado com ${updatedSeedArray.length} cursos.`);

// 5. Atualizar api/cache_courses.json
const cacheRaw = fs.readFileSync(CACHE_JSON_PATH, 'utf8');
const cacheArray = JSON.parse(cacheRaw);
console.log(`Catálogo atual em cache_courses.json: ${cacheArray.length} cursos`);

const updatedCacheArray = [...cacheArray, ...newCourses];
fs.writeFileSync(CACHE_JSON_PATH, JSON.stringify(updatedCacheArray, null, 2) + '\n', 'utf8');
console.log(`api/cache_courses.json atualizado com ${updatedCacheArray.length} cursos.`);

// 6. Limpar cache do require e validar o novo courses.js
delete require.cache[require.resolve(COURSES_JS_PATH)];
const reloadedCoursesModule = require(COURSES_JS_PATH);
const reloadedLocalCourses = reloadedCoursesModule.localCourses;

console.log(`\n=== Validação Pós-Integração ===`);
console.log(`Total de cursos exportados em courses.js: ${reloadedLocalCourses.length}`);

if (reloadedLocalCourses.length !== 200) {
  console.error(`ERRO: esperava-se 200 cursos, mas foram obtidos ${reloadedLocalCourses.length}!`);
  process.exit(1);
}

// Checar preservação integral dos 192 primeiros cursos
for (let i = 0; i < 192; i++) {
  const orig = JSON.stringify(initialLocalCourses[i]);
  const curr = JSON.stringify(reloadedLocalCourses[i]);
  if (orig !== curr) {
    console.error(`ERRO: O curso no índice ${i} (${initialLocalCourses[i].id}) foi alterado!`);
    process.exit(1);
  }
}
console.log('✅ Preservação integral: Todos os 192 cursos originais permanecem 100% idênticos e inalterados.');

// Checar adição correta dos 8 novos cursos
for (let i = 0; i < 8; i++) {
  const expected = JSON.stringify(newCourses[i]);
  const actual = JSON.stringify(reloadedLocalCourses[192 + i]);
  if (expected !== actual) {
    console.error(`ERRO: Mismatch no novo curso ${i} (${newCourses[i].id})!`);
    process.exit(1);
  }
}
console.log('✅ Inclusão precisa: Os 8 novos cursos foram anexados perfeitamente nos índices 192 a 199.');

// Checar unicidade de todos os IDs
const allIds = reloadedLocalCourses.map(c => c.id);
const uniqueIds = new Set(allIds);
if (uniqueIds.size !== allIds.length) {
  console.error(`ERRO: Existem IDs duplicados no catálogo! Total: ${allIds.length}, Únicos: ${uniqueIds.size}`);
  process.exit(1);
}
console.log(`✅ Unicidade de IDs: Todos os ${uniqueIds.size} IDs são estritamente únicos.`);

console.log('\n=== Integração Concluída com Sucesso ===');
