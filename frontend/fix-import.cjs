const fs = require('fs');
const path = 'src/components/AgentDock.tsx';
let txt = fs.readFileSync(path, 'utf8');

txt = txt.replace('import { Edit3, type ReactNode', 'import { type ReactNode');
if (!txt.includes('Edit3,')) {
  txt = txt.replace('Edit2,', 'Edit2, Edit3,');
}

fs.writeFileSync(path, txt);
console.log('Fixed imports!');
