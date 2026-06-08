const fs = require('fs');
let txt = fs.readFileSync('src/components/AgentDock.tsx', 'utf8');

const target = `                  onReorderBeats={(newBeats) => 
                    setVcProject((prev) => prev ? { ...prev, storyBeats: newBeats } : null)
                  }
                />`;

const replacement = `                  onReorderBeats={(newBeats) => 
                    setVcProject((prev) => prev ? { ...prev, storyBeats: newBeats } : null)
                  }
                  onUpdateProject={setVcProject}
                />`;

txt = txt.replace(target, replacement);

fs.writeFileSync('src/components/AgentDock.tsx', txt);
console.log('Added onUpdateProject prop securely!');
