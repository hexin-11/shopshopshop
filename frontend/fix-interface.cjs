const fs = require('fs');
let txt = fs.readFileSync('src/components/AgentDock.tsx', 'utf8');

txt = txt.replace(
  'onRegenerateBeat: (id: string) => void;\n  onAddRef: () => void;\n}',
  'onRegenerateBeat: (id: string) => void;\n  onAddRef: () => void;\n  onUpdateProject?: (data: Partial<VideoProjectData>) => void;\n}'
);

txt = txt.replace(
  'onRegenerateBeat: (id: string) => void;\r\n  onAddRef: () => void;\r\n}',
  'onRegenerateBeat: (id: string) => void;\r\n  onAddRef: () => void;\r\n  onUpdateProject?: (data: Partial<VideoProjectData>) => void;\r\n}'
);

fs.writeFileSync('src/components/AgentDock.tsx', txt);
console.log('Fixed onUpdateProject prop securely!');
