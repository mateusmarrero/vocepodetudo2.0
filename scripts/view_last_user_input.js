const fs = require('fs');

const transcriptPath = 'C:/Users/usuario/.gemini/antigravity/brain/fb4d587b-7761-4998-b197-12547ebe42b0/.system_generated/logs/transcript.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').trim().split('\n');
const last = JSON.parse(lines[lines.length - 1]);
console.log('Last step:', last.step_index, 'source:', last.source, 'type:', last.type);
for (let i = lines.length - 1; i >= 0; i--) {
  const obj = JSON.parse(lines[i]);
  if (obj.type === 'USER_INPUT') {
    console.log('Last USER_INPUT step:', obj.step_index);
    console.log('Content:', obj.content);
    console.log('Media:', JSON.stringify(obj.media));
    break;
  }
}
