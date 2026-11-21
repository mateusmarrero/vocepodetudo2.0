// Teste de Integridade e Completude das Ementas e Detalhes dos Cursos
// Portal Você Pode Tudo

const assert = require('assert');
const coursesModule = require('../src/data/courses.js');
const { getCourseExpandedDetails, getCourseExpandedDetailsHtml } = require('../src/data/course_details.js');

const courses = coursesModule.localCourses || coursesModule.courses;
console.log(`Iniciando teste de ementas expandidas em ${courses.length} cursos catalogados...`);

let tested = 0;
courses.forEach((course) => {
  assert(course && course.id, 'Curso inválido');
  const details = getCourseExpandedDetails(course);
  
  // 1. Verificação de existência
  assert(details, `Falha ao gerar detalhes para o curso ${course.id}`);

  // 2. Módulos & Ementa (3 a 5 módulos)
  assert(Array.isArray(details.syllabus), `Syllabus deve ser array no curso ${course.id}`);
  assert(details.syllabus.length >= 3 && details.syllabus.length <= 5, 
    `Curso ${course.id} deve ter entre 3 e 5 módulos (atual: ${details.syllabus.length})`);
  details.syllabus.forEach(mod => {
    assert(mod.number && mod.title && mod.description, `Módulo incompleto no curso ${course.id}`);
  });
  assert(Array.isArray(details.learningOutcomes) && details.learningOutcomes.length >= 3,
    `Competências de saída insuficientes no curso ${course.id}`);

  // 3. Pré-requisitos & Público-Alvo
  assert(details.prerequisites && details.prerequisites.recommendedEducation, `Falta escolaridade no curso ${course.id}`);
  assert(details.prerequisites.targetAudience, `Falta público-alvo no curso ${course.id}`);
  assert(Array.isArray(details.prerequisites.equipment) && details.prerequisites.equipment.length >= 2, 
    `Falta lista de equipamentos no curso ${course.id}`);

  // 4. Metodologia de Ensino & Avaliação
  assert(details.methodology && details.methodology.modality, `Falta modalidade no curso ${course.id}`);
  assert(details.methodology.passingScorePercent === 60 || details.methodology.passingScorePercent === 70, 
    `Nota de corte inesperada (${details.methodology.passingScorePercent}) no curso ${course.id}`);

  // 5. Certificação Gratuita
  assert(details.certification && details.certification.howToIssue, `Falta emissão no curso ${course.id}`);
  assert(details.certification.authenticityCode, `Falta código de autenticidade no curso ${course.id}`);
  assert(details.certification.legalValidity, `Falta validade legal no curso ${course.id}`);
  assert(details.certification.complementaryHours, `Falta horas complementares no curso ${course.id}`);

  // 6. Como destacar no Currículo
  assert(details.resumeTips && details.resumeTips.formattedEntry, `Falta formato de currículo no curso ${course.id}`);
  assert(Array.isArray(details.resumeTips.atsKeywords) && details.resumeTips.atsKeywords.length >= 3,
    `Falta keywords ATS no curso ${course.id}`);
  assert(details.resumeTips.interviewPitch, `Falta pitch de entrevista no curso ${course.id}`);

  // 7. Renderização HTML
  const html = getCourseExpandedDetailsHtml(course);
  assert(typeof html === 'string' && html.length > 200, `HTML gerado inválido para ${course.id}`);

  tested++;
});

console.log(`[SUCESSO] ${tested} cursos validados com 100% de conformidade nos 5 eixos de informação!`);
