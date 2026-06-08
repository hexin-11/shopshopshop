const fs = require('fs');
const path = 'src/index.css';
let css = fs.readFileSync(path, 'utf8');

css = css.replace(
  /\.agent-home\.agent-canvas-mode\s*\{[\s\S]*?transition: padding-left 280ms cubic-bezier\(0\.4, 0, 0\.2, 1\);\s*\}/,
  `.agent-home.agent-canvas-mode {
  display: grid !important;
  grid-template-columns: 480px minmax(0, 1fr) !important;
  padding: 0 0 0 240px !important;
  align-items: stretch !important;
  gap: 0 !important;
  overflow: hidden;
  transition: padding-left 280ms cubic-bezier(0.4, 0, 0.2, 1);
}`
);

fs.writeFileSync(path, css);
console.log('Fixed CSS layout for canvas mode!');
