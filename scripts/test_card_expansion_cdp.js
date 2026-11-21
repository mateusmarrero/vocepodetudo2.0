const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  let targetPath = path.join(ROOT, reqPath);
  if (!fs.existsSync(targetPath) && fs.existsSync(targetPath + '.html')) {
    targetPath = targetPath + '.html';
  }
  const filePath = targetPath;
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const TEST_PORT = 8099;

server.listen(TEST_PORT, '127.0.0.1', async () => {
  console.log(`--- Iniciando Teste Automatizado de Expansão de Cards (CDP) na porta ${TEST_PORT} ---`);
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  
  try {
    await runCdpTest(edgePath, `http://127.0.0.1:${TEST_PORT}/`);
    console.log('\n🎉 Todos os testes de expansão de cards passaram com 100% de sucesso!');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Falha no teste de expansão:', err);
    server.close();
    process.exit(1);
  }
});

async function runCdpTest(edgePath, targetUrl) {
  return new Promise(async (resolve, reject) => {
    const debugPort = 9255;
    const proc = spawn(edgePath, [
      '--headless=new',
      `--remote-debugging-port=${debugPort}`,
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--user-data-dir=' + path.join(ROOT, 'scratch', 'edge_test_user_data_' + Date.now()),
      targetUrl
    ]);

    let ws = null;
    let timedOut = false;
    const timeoutHandle = setTimeout(() => {
      timedOut = true;
      try { proc.kill(); } catch (_) {}
      reject(new Error('Timeout de 20s atingido no teste de expansão de cards'));
    }, 20000);

    // Aguardar Edge abrir a porta de debug
    let pageInfo = null;
    for (let i = 0; i < 25; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const json = await fetchJson(`http://127.0.0.1:${debugPort}/json/list`);
        if (json && json.length > 0) {
          pageInfo = json.find(p => p.type === 'page') || json[0];
          break;
        }
      } catch (_) {}
    }

    if (!pageInfo || !pageInfo.webSocketDebuggerUrl) {
      clearTimeout(timeoutHandle);
      try { proc.kill(); } catch (_) {}
      return reject(new Error('Não foi possível conectar ao WebSocket CDP do Edge'));
    }

    const wsUrl = pageInfo.webSocketDebuggerUrl;
    const client = new WebSocket(wsUrl);

    let id = 1;
    const callbacks = {};

    client.onopen = async () => {
      // Habilitar Runtime, Console e Navegação
      await send('Page.enable');
      await send('Runtime.enable');
      await send('Console.enable');
      await send('Page.navigate', { url: targetUrl });
      await new Promise(r => setTimeout(r, 1500));

      // Aguardar renderização inicial dos cursos
      await evalExpr(`new Promise(resolve => {
        if (document.querySelectorAll('.course-card:not(.course-ad-card)').length > 0) return resolve(true);
        const interval = setInterval(() => {
          if (document.querySelectorAll('.course-card:not(.course-ad-card)').length > 0) {
            clearInterval(interval);
            resolve(true);
          }
        }, 100);
        setTimeout(() => { clearInterval(interval); resolve(false); }, 7000);
      })`);

      // Teste 1: Verificar se os cards possuem o botão de expansão
      const test1 = await evalExpr(`(() => {
        const cards = document.querySelectorAll('.course-card:not(.course-ad-card)');
        if (cards.length === 0) return { ok: false, error: 'Nenhum card de curso encontrado' };
        const firstCard = cards[0];
        const toggleBtn = firstCard.querySelector('.toggle-course-details-btn');
        if (!toggleBtn) return { ok: false, error: 'Botão .toggle-course-details-btn não encontrado no primeiro card' };
        const hasAria = toggleBtn.getAttribute('aria-expanded') === 'false';
        const hasControls = !!toggleBtn.getAttribute('aria-controls');
        const label = toggleBtn.querySelector('.toggle-btn-label')?.textContent?.trim();
        return {
          ok: true,
          count: cards.length,
          hasAria,
          hasControls,
          label
        };
      })()`);

      console.log('Teste 1 - Presença de botões de expansão e acessibilidade inicial:', test1);
      if (!test1.ok || !test1.hasAria || !test1.hasControls) {
        throw new Error('Falha no Teste 1: ' + JSON.stringify(test1));
      }

      // Teste 2: Clicar no botão de expansão e validar expansão
      const test2 = await evalExpr(`(() => {
        const firstCard = document.querySelector('.course-card:not(.course-ad-card)');
        const toggleBtn = firstCard.querySelector('.toggle-course-details-btn');
        toggleBtn.click();
        
        const isExpanded = firstCard.classList.contains('is-expanded');
        const ariaExp = toggleBtn.getAttribute('aria-expanded') === 'true';
        const details = firstCard.querySelector('.course-expanded-details');
        const isOpen = details && details.classList.contains('is-open');
        const ariaHidden = details && details.getAttribute('aria-hidden') === 'false';
        const labelAfter = toggleBtn.querySelector('.toggle-btn-label')?.textContent?.trim();

        // Validar as 4 seções
        const hasSyllabus = !!details.querySelector('.course-expanded-content');
        const hasOutcomes = !!details.querySelector('.fa-award, [data-lucide="award"], .space-y-1');
        const hasPrereqs = !!details.querySelector('[data-lucide="users"]');
        const hasMethodology = !!details.querySelector('[data-lucide="clipboard-check"]');
        const hasCert = !!details.querySelector('[data-lucide="file-badge"]');
        const hasEnrollBtn = !!details.querySelector('.course-expanded-actions .course-access-link');
        const hasCollapseBtn = !!details.querySelector('.collapse-course-details-btn');

        return {
          ok: isExpanded && ariaExp && isOpen && ariaHidden,
          isExpanded,
          ariaExp,
          isOpen,
          ariaHidden,
          labelAfter,
          sections: {
            hasSyllabus,
            hasOutcomes,
            hasPrereqs,
            hasMethodology,
            hasCert,
            hasEnrollBtn,
            hasCollapseBtn
          }
        };
      })()`);

      console.log('Teste 2 - Expansão após clique no botão e validação das seções:', test2);
      if (!test2.ok || !test2.sections.hasSyllabus || !test2.sections.hasEnrollBtn || !test2.sections.hasCollapseBtn) {
        throw new Error('Falha no Teste 2: ' + JSON.stringify(test2));
      }

      // Teste 3: Clicar no botão "Recolher" (.collapse-course-details-btn)
      const test3 = await evalExpr(`(() => {
        const firstCard = document.querySelector('.course-card:not(.course-ad-card)');
        const collapseBtn = firstCard.querySelector('.collapse-course-details-btn');
        collapseBtn.click();

        const isExpanded = firstCard.classList.contains('is-expanded');
        const toggleBtn = firstCard.querySelector('.toggle-course-details-btn');
        const ariaExp = toggleBtn.getAttribute('aria-expanded') === 'false';
        const details = firstCard.querySelector('.course-expanded-details');
        const isClosed = !details.classList.contains('is-open');
        const ariaHidden = details.getAttribute('aria-hidden') === 'true';

        return {
          ok: !isExpanded && ariaExp && isClosed && ariaHidden,
          isExpanded,
          ariaExp,
          isClosed,
          ariaHidden
        };
      })()`);

      console.log('Teste 3 - Recolhimento via botão Recolher:', test3);
      if (!test3.ok) {
        throw new Error('Falha no Teste 3: ' + JSON.stringify(test3));
      }

      // Teste 4: Clicar no corpo do card para expandir
      const test4 = await evalExpr(`(() => {
        const firstCard = document.querySelector('.course-card:not(.course-ad-card)');
        const cardTitle = firstCard.querySelector('h3');
        cardTitle.click();

        const isExpanded = firstCard.classList.contains('is-expanded');
        const toggleBtn = firstCard.querySelector('.toggle-course-details-btn');
        const ariaExp = toggleBtn.getAttribute('aria-expanded') === 'true';

        return {
          ok: isExpanded && ariaExp,
          isExpanded,
          ariaExp
        };
      })()`);

      console.log('Teste 4 - Expansão via clique no corpo do card:', test4);
      if (!test4.ok) {
        throw new Error('Falha no Teste 4: ' + JSON.stringify(test4));
      }

      // Teste 5: Clicar no botão de favoritar não deve fechar o card
      const test5 = await evalExpr(`(() => {
        const firstCard = document.querySelector('.course-card:not(.course-ad-card)');
        const favBtn = firstCard.querySelector('.fav-btn');
        favBtn.click();

        // Card deve permanecer expandido
        const isExpanded = firstCard.classList.contains('is-expanded');
        return {
          ok: isExpanded,
          isExpanded
        };
      })()`);

      console.log('Teste 5 - Preservação do estado expandido após favoritar:', test5);
      if (!test5.ok) {
        throw new Error('Falha no Teste 5: ' + JSON.stringify(test5));
      }

      // Teste 6: Navegação por Teclado (Enter no Card recolhe/expande)
      const test6 = await evalExpr(`(() => {
        const firstCard = document.querySelector('.course-card:not(.course-ad-card)');
        
        // Pressionar Enter no card para recolher
        firstCard.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        const isCollapsedAfterEnter = !firstCard.classList.contains('is-expanded');

        // Pressionar Espaço no card para reabrir
        firstCard.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
        const isExpandedAfterSpace = firstCard.classList.contains('is-expanded');

        return {
          ok: isCollapsedAfterEnter && isExpandedAfterSpace,
          isCollapsedAfterEnter,
          isExpandedAfterSpace
        };
      })()`);

      console.log('Teste 6 - Acessibilidade por Teclado (Enter e Espaço):', test6);
      if (!test6.ok) {
        throw new Error('Falha no Teste 6: ' + JSON.stringify(test6));
      }

      // Concluir com sucesso
      clearTimeout(timeoutHandle);
      try { client.close(); } catch (_) {}
      try { proc.kill(); } catch (_) {}
      resolve();
    };

    client.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && callbacks[msg.id]) {
        callbacks[msg.id](msg);
        delete callbacks[msg.id];
      }
    };

    client.onerror = (err) => {
      clearTimeout(timeoutHandle);
      try { proc.kill(); } catch (_) {}
      reject(err);
    };

    function send(method, params = {}) {
      return new Promise((res) => {
        const msgId = id++;
        callbacks[msgId] = (response) => res(response.result);
        client.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    async function evalExpr(expression) {
      const result = await send('Runtime.evaluate', {
        expression: expression,
        returnByValue: true,
        awaitPromise: true
      });
      return result?.result?.value;
    }
  });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

