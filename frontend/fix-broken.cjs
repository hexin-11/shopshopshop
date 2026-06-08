const fs = require('fs');
let txt = fs.readFileSync('src/components/AgentDock.tsx.broken', 'utf8');

const replacement = `              )}
              {vcStage === "storyboard" ? (
                <StoryboardAdjustView
                  project={vcProject}
                  onUpdateBeat={(id, desc) =>
                    setVcProject((prev) =>
                      prev ? { ...prev, storyBeats: prev.storyBeats.map((b) => (b.id === id ? { ...b, description: desc } : b)) } : null,
                    )
                  }
                  onDeleteBeat={handleDeleteBeat}
                  onRegenerateBeat={handleRegenerateBeat}`;

txt = txt.replace('              )}\r\n                  onRegenerateBeat={handleRegenerateBeat}', replacement);
txt = txt.replace('              )}\n                  onRegenerateBeat={handleRegenerateBeat}', replacement);

fs.writeFileSync('src/components/AgentDock.tsx', txt);
console.log('Restored AgentDock.tsx from .broken and fixed syntax error!');
