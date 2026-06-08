const fs = require('fs');
let txt = fs.readFileSync('src/components/AgentDock.tsx', 'utf8');

txt = txt.replace(
  /onReorderBeats=\{\(newBeats\) =>\s*setVcProject\(\(prev\) => prev \? \{ \.\.\.prev, storyBeats: newBeats \} : null\)\s*\}/,
  'onReorderBeats={(newBeats) => setVcProject((prev) => prev ? { ...prev, storyBeats: newBeats } : null)}\n                  onUpdateProject={setVcProject}'
);

fs.writeFileSync('src/components/AgentDock.tsx', txt);
console.log('Regex replace done!');
