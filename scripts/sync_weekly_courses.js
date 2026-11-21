const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

/**
 * Script de Curadoria Semanal com Human-in-the-Loop
 * Em conformidade com a auditoria de segurança pós-publicação:
 * NÃO publica diretamente em produção. Salva rascunhos em curadoria_pendente/
 * para revisão e aprovação humana antes de qualquer deploy.
 */
function stageCoursesForReview(coursesToStage) {
  console.log('🔄 Executando curadoria semanal em modo seguro (Staging)...');

  const pendingDir = path.join(projectRoot, 'curadoria_pendente');
  if (!fs.existsSync(pendingDir)) {
    fs.mkdirSync(pendingDir, { recursive: true });
  }

  const pendingFile = path.join(pendingDir, 'cursos_pendentes.json');
  let currentPending = [];
  if (fs.existsSync(pendingFile)) {
    try {
      currentPending = JSON.parse(fs.readFileSync(pendingFile, 'utf8'));
    } catch (e) {
      currentPending = [];
    }
  }

  let addedCount = 0;
  for (const c of coursesToStage) {
    const exists = currentPending.some(p => p.id === c.id || p.url === c.url);
    if (!exists) {
      currentPending.push({ ...c, status: 'pendente_aprovacao_humana', curatedAt: new Date().toISOString() });
      addedCount++;
      console.log(`📝 Curso colocado em fila de aprovação: ${c.title} (${c.provider})`);
    } else {
      console.log(`ℹ️ Curso já aguardando revisão: ${c.title}`);
    }
  }

  fs.writeFileSync(pendingFile, JSON.stringify(currentPending, null, 2), 'utf8');
  console.log(`\n✅ Staging concluído: ${addedCount} novos cursos enviados para curadoria_pendente/cursos_pendentes.json`);
  console.log('🛡️ Deploy automático desativado por governança de segurança. Revise e aprove antes de publicar.');
}

// Exporta função para uso pelo agente ou execução direta
if (require.main === module) {
  const pendingFile = path.join(projectRoot, 'curadoria_pendente', 'cursos_pendentes.json');
  if (fs.existsSync(pendingFile)) {
    const courses = JSON.parse(fs.readFileSync(pendingFile, 'utf8'));
    console.log(`Total de cursos aguardando aprovação humana: ${courses.length}`);
  }
}

module.exports = { stageCoursesForReview };
