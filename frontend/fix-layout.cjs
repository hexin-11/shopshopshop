const fs = require('fs');

// 1. Fix AgentDock.tsx Canvas Input Form
let code = fs.readFileSync('src/components/AgentDock.tsx', 'utf-8');

const canvasFormStartIdx = code.indexOf('<form\n                  className="vc-canvas-input-form"');
if (canvasFormStartIdx !== -1) {
  const canvasFormEndIdx = code.indexOf('</form>', canvasFormStartIdx) + '</form>'.length;
  
  const newCanvasStr = `<form className="agent-search-pill" style={{marginTop: 'auto', marginBottom: 20}} onSubmit={(e) => { e.preventDefault(); submitCanvasInput(); }}>
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
                  <button type="button" className="agent-skill-button" aria-label="使用技能" onClick={() => setSkillMenuOpen(v => !v)}>
                    <Wrench size={19} />使用技能
                  </button>
                  <button type="submit" disabled={agentLoading || !vcCanvasInput.trim()} className="agent-send-inline">
                    <Send size={18} />
                  </button>
                </form>`;

  code = code.substring(0, canvasFormStartIdx) + newCanvasStr + code.substring(canvasFormEndIdx);
  console.log("Replaced canvas form successfully.");
} else {
  console.log("Could not find canvas form.");
}

fs.writeFileSync('src/components/AgentDock.tsx', code);


// 2. Fix index.css Canvas Layout and Pill Grid
let css = fs.readFileSync('src/index.css', 'utf-8');

// Fix the pill grid columns
css = css.replace(/grid-template-columns: 42px auto minmax\(0, 1fr\) 42px;/g, 'grid-template-columns: 42px max-content minmax(0, 1fr) 42px;');

// Also align the skill button to the left edge of its cell if needed
if (!css.includes('margin-left: -8px')) {
  // Try to pull it slightly left as requested
  css = css.replace(/\.agent-search-pill \.agent-skill-button \{/g, '.agent-search-pill .agent-skill-button {\n  margin-left: -4px;');
}

// Fix Canvas Sidebar Width (column 2)
// Search for `.agent-canvas-sessions-col` and change width
if (css.includes('.agent-canvas-sessions-col {') && css.includes('width: 260px;')) {
  css = css.replace(/width: 260px;/g, 'width: 360px;');
  console.log("Fixed canvas sessions column width.");
}

// Fix Canvas Doc max-width
if (css.includes('.vc-canvas-doc {') && css.includes('max-width: 720px;')) {
  css = css.replace(/max-width: 720px;/g, 'max-width: 960px;');
  console.log("Fixed canvas doc max-width.");
}

fs.writeFileSync('src/index.css', css);
