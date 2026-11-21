const fs = require('fs');

const transcriptPath = 'C:/Users/usuario/.gemini/antigravity/brain/fb4d587b-7761-4998-b197-12547ebe42b0/.system_generated/logs/transcript.jsonl';
if (fs.existsSync(transcriptPath)) {
  const lines = fs.readFileSync(transcriptPath, 'utf8').trim().split('\n');
  console.log('Total steps in transcript:', lines.length);
  // print last 5 steps
  lines.slice(-5).forEach(l => {
    try {
      const obj = JSON.parse(l);
      console.log('Step:', obj.step_index, 'Source:', obj.source, 'Type:', obj.type, 'Content preview:', (obj.content || '').slice(0, 150));
    } catch (e) {}
  });
}
