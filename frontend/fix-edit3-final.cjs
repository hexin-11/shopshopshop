const fs = require('fs');
let txt = fs.readFileSync('src/components/AgentDock.tsx', 'utf8');

txt = txt.replace('}   Edit3,\n} from "lucide-react";', '} from "lucide-react";');
txt = txt.replace('  Zap,\n} from "lucide-react";', '  Zap,\n  Edit3,\n} from "lucide-react";');

fs.writeFileSync('src/components/AgentDock.tsx', txt);
console.log('Fixed Edit3 syntax for good!');
