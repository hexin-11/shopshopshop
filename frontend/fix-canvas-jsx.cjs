const fs = require('fs');
let txt = fs.readFileSync('src/components/AgentDock.tsx', 'utf8');

txt = txt.replace(
  /                  <\/form>\s*\}\)\s*\{vcStage === "storyboard" \? \(/,
  '                  </form>\n                )}\n              </div>\n              <div className="agent-canvas-right">\n                {vcStage === "storyboard" ? ('
);

fs.writeFileSync('src/components/AgentDock.tsx', txt);
console.log('Fixed JSX wrapping for canvas view!');
