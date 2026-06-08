const fs = require('fs');

const path = 'src/components/AgentDock.tsx';
let lines = fs.readFileSync(path, 'utf-8').split('\n');

let startIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('</form>') && lines[i+1].includes(')}')) {
    if (lines[i+2].includes('onRegenerateBeat={handleRegenerateBeat}')) {
      startIdx = i;
      break;
    }
  }
}

if (startIdx !== -1) {
  let endIdx = startIdx;
  while (!lines[endIdx].includes('/>') && endIdx < lines.length) {
    endIdx++;
  }
  
  const insert = `                </form>
              )}
            </div>

            {/* Right column: canvas document or storyboard */}
            <div className="agent-canvas-right">
              {vcStage === "storyboard" ? (
                <StoryboardAdjustView
                  project={vcProject}
                  onUpdateProject={(data) => setVcProject(prev => prev ? { ...prev, ...data } : null)}
                  onUpdateBeat={(id, desc) =>
                    setVcProject((prev) =>
                      prev ? { ...prev, storyBeats: prev.storyBeats.map((b) => (b.id === id ? { ...b, description: desc } : b)) } : null,
                    )
                  }
                  onDeleteBeat={handleDeleteBeat}
                  onRegenerateBeat={handleRegenerateBeat}
                  onConfirm={handleConfirmStoryboard}
                  onBack={() => setVcStage("canvas")}
                  onReorderBeats={(newBeats) => 
                    setVcProject((prev) => prev ? { ...prev, storyBeats: newBeats } : null)
                  }
                />`.split('\n');
                
  lines.splice(startIdx, endIdx - startIdx + 1, ...insert);
  fs.writeFileSync(path, lines.join('\n'));
  console.log('Fixed AgentDock.tsx exactly!');
} else {
  console.log('Could not find the target lines');
}
