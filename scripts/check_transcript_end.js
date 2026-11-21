const fs = require('fs');

const transcriptPath = 'C:/Users/usuario/.gemini/antigravity/brain/fb4d587b-7761-4998-b197-12547ebe42b0/.system_generated/logs/transcript.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').trim().split('\n');
console.log('Total steps:', lines.length);
const lastSteps = lines.slice(-15);
lastSteps.forEach(l => {
  const o = JSON.parse(l);
  console.log('Step:', o.step_index, 'type:', o.type, 'source:', o.source, 'content:', (o.content || '').slice(0, 80));
});
