const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

async function testClickAndCapture() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9224',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1280,900',
    '--user-data-dir=' + os.tmpdir() + '/edge-capture-' + Date.now()
  ]);

  await new Promise(r => setTimeout(r, 2000));

  http.get('http://127.0.0.1:9224/json', (res) => {
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

        // Wait for page load and click the button
        setTimeout(() => {
          send('Runtime.evaluate', {
            expression: `
              const btn = document.querySelector('.toggle-course-details-btn');
              if (btn) {
                btn.click();
                'CLICKED';
              } else {
                'NOT_FOUND';
              }
            `,
            returnByValue: true
          });
        }, 5000);

        // Check if expanded and capture screenshot
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 888,
            method: 'Runtime.evaluate',
            params: {
              expression: `
                JSON.stringify({
                  firstCardIsExpanded: document.querySelector('.course-card')?.classList.contains('is-expanded'),
                  hasInnerContent: !!document.querySelector('.course-expanded-content'),
                  firstCardText: document.querySelector('.course-card')?.innerText.slice(0, 300)
                })
              `,
              returnByValue: true
            }
          }));
        }, 6500);

        // Capture screenshot
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 999,
            method: 'Page.captureScreenshot',
            params: { format: 'png' }
          }));
        }, 7500);
      };

      ws.onmessage = (event) => {
        const parsed = JSON.parse(event.data);
        if (parsed.id === 888 && parsed.result && parsed.result.result) {
          console.log('EXPANSION RESULT:', parsed.result.result.value);
        }
        if (parsed.id === 999 && parsed.result && parsed.result.data) {
          const imgBuffer = Buffer.from(parsed.result.data, 'base64');
          const dest = 'C:\\Users\\usuario\\.gemini\\antigravity\\brain\\fb4d587b-7761-4998-b197-12547ebe42b0\\card_expanded_production.png';
          fs.writeFileSync(dest, imgBuffer);
          console.log('✅ Screenshot salvo com sucesso em:', dest);
          edge.kill();
          process.exit(0);
        }
      };
    });
  });
}
testClickAndCapture().catch(console.error);
