const http = require('http');
const { spawn } = require('child_process');
const os = require('os');

async function testLive() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--no-sandbox',
    '--disable-gpu',
    '--user-data-dir=' + os.tmpdir() + '/edge-live-test-' + Date.now()
  ]);

  await new Promise(r => setTimeout(r, 2000));

  http.get('http://127.0.0.1:9223/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
      const tabs = JSON.parse(data);
      const wsUrl = tabs[0].webSocketDebuggerUrl;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        let id = 1;
        const send = (method, params = {}) => {
          ws.send(JSON.stringify({ id: id++, method, params }));
        };

        send('Console.enable');
        send('Runtime.enable');
        send('Page.enable');
        send('Page.navigate', { url: 'https://vocepodetudo.com/' });

        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 999,
            method: 'Runtime.evaluate',
            params: {
              expression: `
                JSON.stringify({
                  hasBtn: document.querySelectorAll('.toggle-course-details-btn').length,
                  totalCards: document.querySelectorAll('.course-card').length,
                  hasGetDetails: typeof window.getCourseExpandedDetails,
                  firstBtnText: document.querySelector('.toggle-course-details-btn')?.innerText
                })
              `,
              returnByValue: true
            }
          }));
        }, 7000);
      };

      ws.onmessage = (event) => {
        const parsed = JSON.parse(event.data);
        if (parsed.method === 'Runtime.consoleAPICalled') {
          console.log('[BROWSER CONSOLE]', parsed.params.type, parsed.params.args.map(a => a.value || a.description).join(' '));
        }
        if (parsed.method === 'Runtime.exceptionThrown') {
          console.error('[BROWSER EXCEPTION]', parsed.params.exceptionDetails);
        }
        if (parsed.id === 999 && parsed.result && parsed.result.result) {
          console.log('EVAL RESULT:', parsed.result.result.value);
          edge.kill();
          process.exit(0);
        }
      };
    });
  });
}
testLive().catch(console.error);
