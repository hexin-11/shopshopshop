const fs = require('fs');
const path = 'src/components/AgentDock.tsx';
let txt = fs.readFileSync(path, 'utf8');

txt = txt.replace(
  /if \(expanded && setExpanded\) \{\s*setExpanded\(false\);\s*setShowProductList\(false\);\s*\}\s*\}\s*;\s*document\.addEventListener/m,
  `if (expanded && setExpanded) {
          setExpanded(false);
          setShowProductList(false);
        }
      }
    };
    document.addEventListener`
);

fs.writeFileSync(path, txt);
console.log('Fixed syntax error!');
