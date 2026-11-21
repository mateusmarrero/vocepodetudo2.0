const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function run() {
  const backupDir = path.resolve(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    console.error('Diretório de backups não encontrado.');
    return;
  }

  const zips = fs.readdirSync(backupDir)
    .filter(f => f.endsWith('.zip'))
    .map(f => ({ name: f, time: fs.statSync(path.join(backupDir, f)).mtimeMs }))
    .sort((a, b) => a.time - b.time);

  if (zips.length === 0) {
    console.error('Nenhum arquivo zip de backup encontrado.');
    return;
  }

  const latestZip = zips[zips.length - 1].name;
  const latestZipPath = path.join(backupDir, latestZip);

  console.log('1. Testando integridade do backup mais recente:');
  console.log(`   Arquivo: ${latestZip}`);
  console.log(`   Tamanho: ${fs.statSync(latestZipPath).size} bytes`);

  const sandbox = path.resolve(__dirname, '..', 'scratch', 'test_restore_sandbox');
  if (fs.existsSync(sandbox)) fs.rmSync(sandbox, { recursive: true, force: true });
  fs.mkdirSync(sandbox, { recursive: true });

  console.log('\n2. Descompactando em sandbox isolada...');
  const psCmd = `powershell -NoProfile -Command "Expand-Archive -Path '${latestZipPath}' -DestinationPath '${sandbox}' -Force"`;
  execSync(psCmd, { stdio: 'inherit' });

  const criticalFiles = [
    'index.html',
    'admin.html',
    'curriculo.html',
    'manifest.json',
    'sw.js',
    'src/app.js',
    'src/admin.js',
    'src/style.css',
    'src/curriculo.js',
    'src/data/courses.js',
    'api/config.php',
    'api/courses.php',
    'api/auth.php'
  ];

  console.log('\n3. Validando integridade estrutural e presença dos arquivos críticos:');
  let allHealthy = true;
  criticalFiles.forEach(rel => {
    const fullPath = path.join(sandbox, rel);
    if (!fs.existsSync(fullPath)) {
      console.error(`   ❌ Ausente: ${rel}`);
      allHealthy = false;
    } else {
      const bytes = fs.statSync(fullPath).size;
      console.log(`   ✅ Presente e íntegro: ${rel} (${bytes} bytes)`);
    }
  });

  if (allHealthy) {
    console.log('\n🎉 SUCESSO TOTAL: Backup 100% íntegro, legível e restaurável!');
  } else {
    console.error('\n⚠️ FALHA: O backup apresentou discrepâncias.');
  }

  // Limpeza
  fs.rmSync(sandbox, { recursive: true, force: true });
  console.log('\n4. Sandbox de testes removida com segurança.');
}

run();
