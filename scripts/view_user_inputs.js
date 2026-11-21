const fs = require('fs');

const transcriptPath = 'C:/Users/usuario/.gemini/antigravity/brain/fb4d587b-7761-4998-b197-12547ebe42b0/.system_generated/logs/transcript.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').trim().split('\n');
const userInputs = [];
lines.forEach(l => {
  try {
    const obj = JSON.parse(l);
    if (obj.type === 'USER_INPUT') {
      userInputs.push({ step: obj.step_index, content: (obj.content || '').slice(0, 100), media: obj.media });
    }
  } catch (e) {}
});

console.log('Last 8 user inputs:');
console.log(userInputs.slice(-8));
