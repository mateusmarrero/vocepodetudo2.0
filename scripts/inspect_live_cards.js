const { spawn } = require('child_process');
const http = require('http');

const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
  '--headless=new',
  '--remote-debugging-port=9223',
  'https://vocepodetudo.com/'
]);

setTimeout(() => {
  http.get('http://127.0.0.1:9223/json', res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      try {
        const targets = JSON.parse(body);
        const p = targets.find(t => t.type === 'page');
        if (p && p.webSocketDebuggerUrl) {
          const ws = new WebSocket(p.webSocketDebuggerUrl);
          ws.onopen = () => {
            ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
            setTimeout(() => {
              ws.send(JSON.stringify({
                id: 2,
                method: 'Runtime.evaluate',
                params: {
                  expression: `(() => {
                    const cards = document.querySelectorAll(".course-card");
                    const imgs = document.querySelectorAll(".course-card img");
                    return {
                      totalCards: cards.length,
                      totalImgs: imgs.length,
                      firstImgSrc: imgs[0] ? imgs[0].src : null,
                      firstImgNaturalWidth: imgs[0] ? imgs[0].naturalWidth : null,
                      firstImgDisplay: imgs[0] ? imgs[0].style.display : null,
                      firstCardHtml: cards[0] ? cards[0].outerHTML.substring(0, 500) : null
                    };
                  })()`,
                  returnByValue: true
                }
              }));
            }, 3500);
          };
          ws.onmessage = e => {
            const data = JSON.parse(e.data);
            if (data.id === 2) {
              console.log('DOM Evaluation Result:', JSON.stringify(data.result.result.value, null, 2));
              ws.close();
              edge.kill();
              process.exit(0);
            }
          };
        }
      } catch (err) {
        console.error(err);
        edge.kill();
        process.exit(1);
      }
    });
  });
}, 2000);
