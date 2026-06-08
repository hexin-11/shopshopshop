const fs = require('fs');

const path = 'src/components/AgentDock.tsx';
let tsx = fs.readFileSync(path, 'utf-8');

// 1. Modify handleConfirmStoryboard
const oldHandleConfirm = `  const handleConfirmStoryboard = () => {
    // Dispatch event for app to navigate to fine edit (OpenCut Editor)
    window.dispatchEvent(new CustomEvent("tikframe:openProjectWorkspace", { detail: { projectId: "new-project" } }));
    returnToPreviousPage();
  };`;

const newHandleConfirm = `  const handleConfirmStoryboard = () => {
    setVcStage("generating");
    // Simulate generation process
    setTimeout(() => {
      setVcStage("preview");
    }, 4000); // 4 seconds simulated generation
  };
  
  const handleJumpToEditor = () => {
    window.dispatchEvent(new CustomEvent("tikframe:openProjectWorkspace", { detail: { projectId: "new-project" } }));
    returnToPreviousPage();
  };
  
  const handleDirectRender = () => {
    alert('正在加入渲染队列...');
    returnToPreviousPage();
  };`;
tsx = tsx.replace(oldHandleConfirm, newHandleConfirm);

// 2. Add Generating and Preview views into the agent-canvas-right column
const rightColStart = `              {/* Right column: canvas document or storyboard */}
              <div className="agent-canvas-right">
                {vcStage === "storyboard" ? (`;

const rightColNew = `              {/* Right column: canvas document or storyboard */}
              <div className="agent-canvas-right">
                {vcStage === "generating" ? (
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
                      {/* Fake Player */}
                      <video src="https://www.w3schools.com/html/mov_bbb.mp4" controls style={{width: '100%', height: '100%', objectFit: 'contain'}}></video>
                    </div>

                    <div style={{display: 'flex', gap: '16px', marginTop: '24px', justifyContent: 'flex-end'}}>
                      <button onClick={handleJumpToEditor} style={{padding: '14px 24px', borderRadius: '12px', background: '#fff', border: '1px solid #cbd5e1', fontWeight: 600, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <Wrench size={18} /> 进入高级剪辑
                      </button>
                      <button onClick={handleDirectRender} style={{padding: '14px 24px', borderRadius: '12px', background: '#0f172a', border: 'none', fontWeight: 600, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <Send size={18} /> 直接导出成片
                      </button>
                    </div>
                  </div>
                ) : vcStage === "storyboard" ? (`;
                
tsx = tsx.replace(rightColStart, rightColNew);

// Add the keyframes for progressAnim in index.css if not exists
let css = fs.readFileSync('src/index.css', 'utf-8');
if (!css.includes('@keyframes progressAnim')) {
  css += `
@keyframes progressAnim {
  0% { width: 0%; }
  50% { width: 60%; }
  90% { width: 85%; }
  100% { width: 100%; }
}
`;
  fs.writeFileSync('src/index.css', css);
}

fs.writeFileSync(path, tsx);
console.log('Phase 3 applied.');
