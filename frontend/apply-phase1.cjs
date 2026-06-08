const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf-8');
let tsx = fs.readFileSync('src/components/AgentDock.tsx', 'utf-8');

// ─── 1. CSS UPDATES ───

// A. Improve .agent-skill-menu to be beautiful glassmorphism
const oldSkillMenu = `.agent-skill-menu {
  position: absolute;
  bottom: 100%;
  right: 0;
  width: 240px;
  background: white;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 8px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  z-index: 100;
  margin-bottom: 8px;
}`;

const newSkillMenu = `.agent-skill-menu {
  position: absolute;
  bottom: calc(100% + 12px);
  right: 0;
  width: 280px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0,0,0,0.02);
  border-radius: 20px;
  padding: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  z-index: 100;
  transform-origin: bottom right;
  animation: skillMenuEnter 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes skillMenuEnter {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.agent-skill-menu button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  border: none;
  background: transparent;
  border-radius: 12px;
  cursor: pointer;
  color: #475569;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.agent-skill-menu button:hover {
  background: rgba(241, 245, 249, 0.8);
  color: #0f172a;
  transform: translateY(-2px);
}

.agent-skill-menu button svg {
  color: #3b82f6;
  opacity: 0.8;
  margin-bottom: 2px;
}
`;

if (css.includes('.agent-skill-menu {')) {
  // Regex to replace the whole block.
  css = css.replace(/\.agent-skill-menu\s*\{[\s\S]*?z-index: 100;\s*margin-bottom: 8px;\s*\}/, newSkillMenu);
  // Also clean up any lingering button styles inside menu
  css = css.replace(/\.agent-skill-menu button\s*\{[\s\S]*?\}\s*\.agent-skill-menu button:hover\s*\{[\s\S]*?\}/, '');
} else {
  css += '\n' + newSkillMenu;
}

// B. Canvas columns layout adjustment (wider left sidebar)
css = css.replace(/grid-template-columns: minmax\(220px, 0\.72fr\) minmax\(240px, 1fr\);/g, 'grid-template-columns: 420px minmax(240px, 1fr);');
css = css.replace(/\.agent-canvas-sessions-col \{ width: 100%; height: 40vh; border-right: 0; border-bottom: 1px solid rgba\(226,232,240,0\.78\); \}/, '');
// And make sure .agent-canvas-sessions-col padding accommodates the chat
css = css.replace(/\.agent-canvas-sessions-col \{\s*display: flex;\s*flex-direction: column;/, '.agent-canvas-sessions-col {\n  display: flex;\n  flex-direction: column;\n  padding: 24px 20px;\n');


fs.writeFileSync('src/index.css', css);

// ─── 2. TSX UPDATES ───

// A. Fix skillMenuOpen handleClickOutside in AgentDock.tsx
tsx = tsx.replace(
  /const handleClickOutside = \(e: MouseEvent\) => \{[\s\S]*?if \(expanded && setExpanded\) \{[\s\S]*?const pill = document\.querySelector\('\.vc-input-pill-container'\);[\s\S]*?if \(pill && !pill\.contains\(e\.target as Node\)\) \{[\s\S]*?setExpanded\(false\);[\s\S]*?setShowProductList\(false\);[\s\S]*?\}[\s\S]*?\}[\s\S]*?\};/,
  `const handleClickOutside = (e: MouseEvent) => {
      const pill = document.querySelector('.vc-input-pill-container');
      if (pill && !pill.contains(e.target as Node)) {
        if (expanded && setExpanded) {
          setExpanded(false);
          setShowProductList(false);
        }
      }
      
      const skillMenu = document.querySelector('.agent-skill-menu');
      const skillBtn = document.querySelector('.agent-skill-button');
      if (skillMenuOpen && onSkillClick && skillMenu && !skillMenu.contains(e.target as Node) && skillBtn && !skillBtn.contains(e.target as Node)) {
        onSkillClick(); // toggles it off
      }
    };`
);

// B. Expand VCInputBoxProps to pass onSkillClick
// Wait, onSkillClick is already passed.
// But we need to make sure the outer state handles it.

// C. Add Product Modal State in VCInputBox
tsx = tsx.replace(/const selectedProduct = catalog\.find\(\(p\) => p\.id === form\.productId\);/,
  `const selectedProduct = catalog.find((p) => p.id === form.productId);
  const [showAddProduct, setShowAddProduct] = useState(false);`);

// D. Add the "Add New Product" button in the list
tsx = tsx.replace(/<div className="vc-product-list">[\s\S]*?\{\[\.\.\.catalog\]\.map\(\(p\) => \([\s\S]*?\}\)[\s\S]*?<\/div>/,
  `<div className="vc-product-list" style={{boxShadow: '0 8px 24px rgba(0,0,0,0.1)', border: '1px solid #eee', paddingBottom: 0}}>
                  {[...catalog].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={form.productId === p.id ? "active" : ""}
                      onClick={() => { set("productId", p.id); setShowProductList(false); }}
                    >
                      {p.mainImage && <img src={p.mainImage} alt={p.name} style={{width: 32, height: 32, borderRadius: 6}} />}
                      <span style={{ flex: 1 }}>{p.name}</span>
                      {form.productId === p.id && <Check size={16} />}
                    </button>
                  ))}
                  <div style={{borderTop: '1px solid #eee', marginTop: 4}}>
                    <button type="button" onClick={() => setShowAddProduct(true)} style={{justifyContent: 'center', color: '#3b82f6', fontWeight: 500, padding: '10px'}}>
                      <Plus size={16} /> 录入新商品
                    </button>
                  </div>
                </div>`);

// E. Add the Add Product Modal render at the end of VCInputBox
tsx = tsx.replace(/<\/form>\s*<\/div>\s*\);\s*\}/,
  `      </form>
      
      {showAddProduct && (
        <div style={{position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center'}} onClick={() => setShowAddProduct(false)}>
          <div style={{background: '#fff', padding: 24, borderRadius: 20, width: 480, boxShadow: '0 20px 40px rgba(0,0,0,0.2)'}} onClick={e => e.stopPropagation()}>
            <h3 style={{fontSize: 18, fontWeight: 600, marginBottom: 16}}>录入新商品</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
              <input placeholder="商品名称" style={{padding: '10px 14px', borderRadius: 10, border: '1px solid #ddd', outline: 'none'}} />
              <input placeholder="商品卖点/描述" style={{padding: '10px 14px', borderRadius: 10, border: '1px solid #ddd', outline: 'none'}} />
              <button style={{padding: '12px', background: '#f1f5f9', border: '1px dashed #ccc', borderRadius: 10, color: '#666'}}>+ 上传商品主图</button>
            </div>
            <div style={{display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end'}}>
              <button onClick={() => setShowAddProduct(false)} style={{padding: '8px 16px', borderRadius: 8, background: '#f1f5f9'}}>取消</button>
              <button onClick={() => setShowAddProduct(false)} style={{padding: '8px 16px', borderRadius: 8, background: '#0f172a', color: '#fff'}}>保存录入</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`);

// F. Canvas Mode Chat Input Sync (Attach & Skills & Loader)
// The canvas mode form uses className="agent-search-pill"
// We need to inject the full logic into the canvas form
const canvasFormRegex = /<form className="agent-search-pill" style=\{\{marginTop: 'auto', marginBottom: 20, width: '100%'\}\} onSubmit=\{\(e\) => \{ e\.preventDefault\(\); submitCanvasInput\(\); \}\}>[\s\S]*?<\/form>/;
const newCanvasForm = `<form className="agent-search-pill" style={{marginTop: 'auto', marginBottom: 20, width: '100%', overflow: 'visible'}} onSubmit={(e) => { e.preventDefault(); submitCanvasInput(); }}>
                  <textarea
                    value={vcCanvasInput}
                    onChange={(e) => setVcCanvasInput(e.target.value)}
                    placeholder="告诉 Agent 调整..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitCanvasInput(); }
                    }}
                    rows={2}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="agent-hidden-file"
                  />
                  <button type="button" className="agent-attach-button" aria-label="附加文件" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip size={20} />
                  </button>
                  <button type="button" className="agent-skill-button" aria-label="使用技能" onClick={() => setSkillMenuOpen(v => !v)}>
                    <Wrench size={19} />使用技能
                  </button>
                  <button type="submit" disabled={agentLoading || !vcCanvasInput.trim()} className="agent-send-inline">
                    {agentLoading ? <Loader2 size={16} className="vc-spin" /> : <Send size={18} />}
                  </button>

                  {skillMenuOpen && (
                    <div className="agent-skill-menu" style={{bottom: '60px', left: 0, right: 'auto'}}>
                      {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <button key={action.label} type="button" onClick={() => runAction(action)}>
                            <Icon size={17} />
                            <span>{action.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </form>`;
tsx = tsx.replace(canvasFormRegex, newCanvasForm);

fs.writeFileSync('src/components/AgentDock.tsx', tsx);
console.log('Phase 1 applied.');
