const fs = require('fs');
let tsx = fs.readFileSync('src/components/AgentDock.tsx', 'utf-8');

const brokenPart = `                  </form>
                )}
                  onRegenerateBeat={handleRegenerateBeat}
                  onConfirm={handleConfirmStoryboard}
                  onBack={() => setVcStage("canvas")}
                  onReorderBeats={(newBeats) => 
                    setVcProject((prev) => prev ? { ...prev, storyBeats: newBeats } : null)
                  }
                />`;

const fixedPart = `                  </form>
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
                  />`;

tsx = tsx.replace(brokenPart, fixedPart);
fs.writeFileSync('src/components/AgentDock.tsx', tsx);
console.log('Fixed correctly');
