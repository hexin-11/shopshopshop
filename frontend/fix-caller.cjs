const fs = require('fs');
let tsx = fs.readFileSync('src/components/AgentDock.tsx', 'utf-8');

const brokenTarget = `                </form>
              )}
                  onRegenerateBeat={handleRegenerateBeat}`;

const fixedCode = `                </form>
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
                  onRegenerateBeat={handleRegenerateBeat}`;

if (tsx.includes(brokenTarget)) {
  tsx = tsx.replace(brokenTarget, fixedCode);
  fs.writeFileSync('src/components/AgentDock.tsx', tsx);
  console.log('Fixed broken caller properly!');
} else {
  console.log('Target not found!');
}
