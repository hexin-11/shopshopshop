const fs = require('fs');

const path = 'src/components/AgentDock.tsx';
let tsx = fs.readFileSync(path, 'utf-8');

const brokenPart = `                  onReorderBeats={(newBeats) => 
                    setVcProject((prev) => prev ? { ...prev, storyBeats: newBeats } : null)
                  }
                />
                  onAddRef={() => {
                    const name = window.prompt("输入参考图描述");
                    if (name) {
                      setVcProject((prev) =>
                        prev
                          ? {
                              ...prev,
                              visualRefs: [
                                ...prev.visualRefs,
                                { id: \`r\${Date.now()}\`, type: "custom", label: name, url: \`https://picsum.photos/seed/\${Date.now()}/300/300\` },
                              ],
                            }
                          : null,
                      );
                    }
                  }}
                />
              )}`;

const fixedPart = `                  onReorderBeats={(newBeats) => 
                    setVcProject((prev) => prev ? { ...prev, storyBeats: newBeats } : null)
                  }
                />
              ) : vcStage === "generating" ? (
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '24px'}}>
                  <div className="vc-spin" style={{width: '64px', height: '64px', border: '4px solid #f1f5f9', borderTopColor: '#3b82f6', borderRadius: '50%'}}></div>
                  <h3 style={{fontSize: '20px', fontWeight: 600, color: '#0f172a'}}>正在合成视频资产...</h3>
                  <p style={{color: '#64748b'}}>预计需要 30-45 秒，您可以留在本页或稍后回来查看</p>
                  <div style={{width: '60%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden'}}>
                    <div style={{width: '60%', height: '100%', background: '#3b82f6', borderRadius: '4px', transition: 'width 2s linear', animation: 'progressAnim 4s linear forwards'}}></div>
                  </div>
                </div>
              ) : vcStage === "preview" ? (
                <div style={{display: 'flex', flexDirection: 'column', height: '100%', padding: '24px', background: '#f8fafc', overflowY: 'auto'}}>
                  <h2 style={{fontSize: '24px', fontWeight: 600, color: '#0f172a', marginBottom: '24px'}}>✨ 视频生成完成！</h2>
                  <div style={{flex: 1, background: '#000', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', minHeight: '400px'}}>
                    <video src="https://www.w3schools.com/html/mov_bbb.mp4" controls style={{width: '100%', height: '100%', objectFit: 'contain'}}></video>
                  </div>
                  <div style={{display: 'flex', gap: '16px', marginTop: '24px', justifyContent: 'flex-end'}}>
                    <button onClick={() => { window.dispatchEvent(new CustomEvent("tikframe:openProjectWorkspace", { detail: { projectId: "new-project" } })); returnToPreviousPage(); }} style={{padding: '14px 24px', borderRadius: '12px', background: '#fff', border: '1px solid #cbd5e1', fontWeight: 600, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}>
                      进入高级剪辑
                    </button>
                    <button onClick={() => { alert('正在加入渲染队列...'); returnToPreviousPage(); }} style={{padding: '14px 24px', borderRadius: '12px', background: '#0f172a', border: 'none', fontWeight: 600, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}>
                      直接导出成片
                    </button>
                  </div>
                </div>
              ) : (
                <ProjectCanvasView
                  project={vcProject}
                  stage={vcStage}
                  editingBeatId={editingBeatId}
                  onEditBeat={setEditingBeatId}
                  onUpdateProject={(data) => setVcProject(prev => prev ? { ...prev, ...data } : null)}
                  onUpdateBeat={(id, desc) =>
                    setVcProject((prev) =>
                      prev ? { ...prev, storyBeats: prev.storyBeats.map((b) => (b.id === id ? { ...b, description: desc } : b)) } : null,
                    )
                  }
                  onRegenerateBeat={handleRegenerateBeat}
                  onAddRef={() => {
                    const name = window.prompt("输入参考图描述");
                    if (name) {
                      setVcProject((prev) =>
                        prev
                          ? {
                              ...prev,
                              visualRefs: [
                                ...prev.visualRefs,
                                { id: \`r\${Date.now()}\`, type: "custom", label: name, url: \`https://picsum.photos/seed/\${Date.now()}/300/300\` },
                              ],
                            }
                          : null,
                      );
                    }
                  }}
                />
              )}`;

tsx = tsx.replace(brokenPart, fixedPart);
fs.writeFileSync(path, tsx);
console.log('Fixed exactly!');
