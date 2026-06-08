const fs = require('fs');
const path = 'src/components/AgentDock.tsx';
let txt = fs.readFileSync(path, 'utf8');

if (!txt.includes('Edit3,')) {
  txt = txt.replace('from "lucide-react";', '  Edit3,\n} from "lucide-react";');
}

fs.writeFileSync(path, txt);
console.log('Fixed Edit3 import for good!');
