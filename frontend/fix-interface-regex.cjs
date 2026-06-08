const fs = require('fs');
let txt = fs.readFileSync('src/components/AgentDock.tsx', 'utf8');

txt = txt.replace(
  /onAddRef: \(\) => void;\s*\}/,
  'onAddRef: () => void;\n  onUpdateProject?: (data: Partial<VideoProjectData>) => void;\n}'
);

fs.writeFileSync('src/components/AgentDock.tsx', txt);
console.log('Fixed onUpdateProject using regex!');
