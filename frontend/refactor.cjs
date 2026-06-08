const fs = require('fs');
let code = fs.readFileSync('src/components/AgentDock.tsx', 'utf-8');

// 1. Remove videoCreationMode
code = code.replace(/const \[videoCreationMode, setVideoCreationMode\] = useState\(false\);\n/, '');

// 2. Remove the auto-collapse effect condition dependency
code = code.replace(/if \(videoCreationMode && vcStage !== "setup"\)/g, 'if (vcStage !== "setup")');
code = code.replace(/\[videoCreationMode, vcStage\]/g, '[vcStage]');

// 3. Update tikframe:openVideoCreation event handler
code = code.replace(/setVideoCreationMode\(true\);\n/g, '');

// 4. Update handleOpenVideoCreation
code = code.replace(/setVideoCreationMode\(true\);\n/g, '');

// 5. Update isCanvasMode logic
code = code.replace(/const isCanvasMode = videoCreationMode &&/g, 'const isCanvasMode =');

// 6. Delete the entire SETUP MODE section (agent-vc-home-mode)
const vcHomeStart = code.indexOf('{/* ── SETUP MODE: expanding chat input ─────────────────────────────── */}');
const vcHomeEnd = code.indexOf('{/* ── CANVAS / GENERATING / STORYBOARD MODE: 3-column ─────────────── */}');
if (vcHomeStart !== -1 && vcHomeEnd !== -1) {
  code = code.substring(0, vcHomeStart) + code.substring(vcHomeEnd);
}

// 7. Remove !videoCreationMode check
code = code.replace(/\{!videoCreationMode && \(/g, '{true && (');

// 8. Add VC form options into agent-search-pill
const searchPillStart = code.indexOf('<form\n              className="agent-search-pill"');
if (searchPillStart !== -1) {
  const insertBeforePill = `
            {vcInputExpanded && (
              <div className="agent-creation-panel" style={{ width: 'min(900px, 100%)', margin: '0 auto 12px', background: 'rgba(255,255,255,0.95)', border: '1px solid #E5E7EB', borderRadius: 16, padding: '16px 20px', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#171719' }}>商品</span>
                  <select className="vc-chip" value={vcForm.productId} onChange={e => setVcForm({...vcForm, productId: e.target.value})} style={{ minWidth: 150 }}>
                    <option value="">未选择商品...</option>
                    {catalog.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#171719', marginLeft: 8 }}>类型</span>
                  <select className="vc-chip" value={vcForm.videoType} onChange={e => setVcForm({...vcForm, videoType: e.target.value as any})}>
                    {VIDEO_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#171719', marginLeft: 8 }}>风格</span>
                  <select className="vc-chip" value={vcForm.style} onChange={e => setVcForm({...vcForm, style: e.target.value})}>
                    {STYLE_PRESETS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#171719', marginLeft: 8 }}>时长</span>
                  <select className="vc-chip" value={vcForm.duration} onChange={e => setVcForm({...vcForm, duration: e.target.value})}>
                    <option value="6">6秒</option>
                    <option value="15">15秒</option>
                    <option value="30">30秒</option>
                  </select>
                  <button type="button" className="btn-primary" onClick={() => { handleVCFormSubmit(); setVcInputExpanded(false); }} style={{ marginLeft: 'auto', padding: '6px 16px', height: 34 }}>生成大纲</button>
                </div>
              </div>
            )}
`;
  code = code.slice(0, searchPillStart) + insertBeforePill + code.slice(searchPillStart);
}

// 9. Replace submitInput to check vcForm
code = code.replace(/const submitInput = async \(\) => \{/g, 
  'const submitInput = async () => {\n    if (vcInputExpanded && vcForm.productId) { handleVCFormSubmit(); setVcInputExpanded(false); return; }');

// 10. Change the logic for addLibraryItem so it doesn't send a fake message
const libItemLogic = code.indexOf('const addLibraryItem =');
if (libItemLogic !== -1) {
  const libItemEnd = code.indexOf('const submitInput =', libItemLogic);
  code = code.substring(0, libItemLogic) + 
  `const addLibraryItem = (item: LibraryItem) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? { ...c, references: Array.from(new Set([...c.references, item.title])) }
          : c
      )
    );
  };
  ` + code.substring(libItemEnd);
}

// 11. Make the chat box centered when empty
code = code.replace(/<form\n              className="agent-search-pill"/g, '<form className={`agent-search-pill ${isEmptyConversation ? "agent-search-pill-centered" : ""}`}');

// 12. Add the toggle button for creation panel
code = code.replace(/<button type="button" className="agent-skill-button" aria-label="使用技能"/g, 
  '<button type="button" className="agent-skill-button" style={{marginRight: 8, color: vcInputExpanded ? "#4684EE" : "", background: vcInputExpanded ? "#F0F5FF" : ""}} onClick={() => setVcInputExpanded(!vcInputExpanded)}><Zap size={16}/>创作面板</button>\n              <button type="button" className="agent-skill-button" aria-label="使用技能"');

// Fix Library label
code = code.replace(/<strong>资料库<\/strong>/g, '<strong>资产库</strong>');
code = code.replace(/aria-label="资料库"/g, 'aria-label="资产库"');

fs.writeFileSync('src/components/AgentDock.tsx', code);
console.log('AgentDock updated!');
