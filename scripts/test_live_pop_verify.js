const http = require('http');
const { spawn } = require('child_process');
const os = require('os');

async function testLivePop() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9270',
    '--no-sandbox',
    '--disable-gpu',
    '--user-data-dir=' + os.tmpdir() + '/edge-live-pop-' + Date.now()
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const res = await fetch('http://127.0.0.1:9270/json/list');
  const json = await res.json();
  const ws = new WebSocket(json[0].webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  function send(method, params = {}) {
    return new Promise(res => {
      const curId = id++;
      const handler = (e) => {
        const d = JSON.parse(e.data);
        if (d.id === curId) {
          ws.removeEventListener('message', handler);
          res(d.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: 'https://vocepodetudo.com/' });
  await new Promise(r => setTimeout(r, 5000));

  const r = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const cards = document.querySelectorAll('.course-card:not(.course-ad-card)');
        cards[0].querySelector('.toggle-course-details-btn').click();
        
        const h0 = cards[0].getBoundingClientRect().height;
        const h1 = cards[1].getBoundingClientRect().height;
        const z0 = window.getComputedStyle(cards[0]).zIndex;
        
        // Clicar no card 1
        cards[1].querySelector('.toggle-course-details-btn').click();
        const card0Closed = !cards[0].classList.contains('is-expanded');
        const card1Open = cards[1].classList.contains('is-expanded');

        return JSON.stringify({
          h0,
          h1,
          neighborNotStretched: h1 < h0,
          z0,
          card0ClosedOnCard1Click: card0Closed,
          card1Open: card1Open
        });
      })()
    `,
    returnByValue: true
  });

  console.log('LIVE VERIFICATION RESULT:', JSON.parse(r.result.value));
  edge.kill();
  process.exit(0);
}
testLivePop().catch(console.error);
