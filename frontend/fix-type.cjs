const fs = require('fs');
let txt = fs.readFileSync('src/components/AgentDock.tsx', 'utf8');

txt = txt.replace(
  'onUpdateProject={setVcProject}',
  'onUpdateProject={(data) => setVcProject((prev) => prev ? { ...prev, ...data } : null)}'
);

fs.writeFileSync('src/components/AgentDock.tsx', txt);
console.log('Fixed onUpdateProject type mismatch!');
