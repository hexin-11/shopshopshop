const fs = require('fs');
let code = fs.readFileSync('src/components/AgentDock.tsx', 'utf-8');

// The original string we want to replace
const canvasInputStr = `<form
                  className="vc-canvas-input-form"
                  onSubmit={(e) => { e.preventDefault(); submitCanvasInput(); }}
                >
                  <textarea
                    value={vcCanvasInput}
                    onChange={(e) => setVcCanvasInput(e.target.value)}
                    placeholder="告诉 Agent 调整..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitCanvasInput(); }
                    }}
                    rows={2}
                  />
                  <button type="submit" disabled={agentLoading || !vcCanvasInput.trim()}>
                    <Send size={15} />
                  </button>
                </form>`;

const newCanvasInputStr = `<form className="agent-search-pill" style={{marginTop: 'auto', marginBottom: 20}} onSubmit={(e) => { e.preventDefault(); submitCanvasInput(); }}>
                  <textarea
                    value={vcCanvasInput}
                    onChange={(e) => setVcCanvasInput(e.target.value)}
                    placeholder="告诉 Agent 调整..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitCanvasInput(); }
                    }}
                    rows={2}
                  />
                  <button type="button" className="agent-attach-button" aria-label="附加文件">
                    <Paperclip size={20} />
                  </button>
                  <button type="button" className="agent-skill-button" aria-label="使用技能">
                    <Wrench size={19} />使用技能
                  </button>
                  <button type="submit" disabled={agentLoading || !vcCanvasInput.trim()} className="agent-send-inline">
                    <Send size={18} />
                  </button>
                </form>`;

if (code.includes(canvasInputStr)) {
  code = code.replace(canvasInputStr, newCanvasInputStr);
  console.log("Canvas input replaced successfully");
} else {
  console.log("Could not find canvas input str");
}

fs.writeFileSync('src/components/AgentDock.tsx', code);
