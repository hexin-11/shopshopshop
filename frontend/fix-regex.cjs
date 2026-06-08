const fs = require('fs');
let code = fs.readFileSync('src/components/AgentDock.tsx', 'utf-8');

const regex = /<form[\s\S]*?className=\"vc-canvas-input-form\"[\s\S]*?<\/form>/;
if (regex.test(code)) {
  const newCanvasStr = `<form className="agent-search-pill" style={{marginTop: 'auto', marginBottom: 20}} onSubmit={(e) => { e.preventDefault(); submitCanvasInput(); }}>
                  <textarea
                    value={vcCanvasInput}
                    onChange={(e) => setVcCanvasInput(e.target.value)}
                    placeholder="告诉 Agent 调整..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitCanvasInput(); }
                    }}
                    rows={2}
                  />
                  <button type="button" className="agent-attach-button" aria-label="附加文件">
                    <Paperclip size={20} />
                  </button>
                  <button type="button" className="agent-skill-button" aria-label="使用技能" onClick={() => setSkillMenuOpen(v => !v)}>
                    <Wrench size={19} />使用技能
                  </button>
                  <button type="submit" disabled={agentLoading || !vcCanvasInput.trim()} className="agent-send-inline">
                    <Send size={18} />
                  </button>
                </form>`;
  code = code.replace(regex, newCanvasStr);
  fs.writeFileSync('src/components/AgentDock.tsx', code);
  console.log('Replaced canvas form via regex!');
} else {
  console.log('Regex still failed to find canvas form.');
}
