const fs = require('fs');
const path = 'src/components/AgentDock.tsx';
let txt = fs.readFileSync(path, 'utf8');

txt = txt.replace(
  'className={`agent-canvas-container ${sidebarCollapsed ? "collapsed" : ""}`}',
  'className={`agent-home agent-canvas-mode ${sidebarCollapsed ? "collapsed" : ""}`}'
);

fs.writeFileSync(path, txt);
