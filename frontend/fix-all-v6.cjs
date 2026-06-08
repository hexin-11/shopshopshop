const fs = require('fs');

// ── 1. Fix CSS grid and positioning ──
let css = fs.readFileSync('src/index.css', 'utf-8');

// Fix agent-search-pill grid columns
css = css.replace(/grid-template-columns: 42px max-content minmax\(0, 1fr\) 42px;/g, 'grid-template-columns: 42px max-content minmax(0, 1fr) 42px;'); // It's already there from earlier fix-layout, but make sure
if (!css.includes('grid-template-columns: 42px max-content minmax(0, 1fr) 42px;')) {
  css = css.replace(/grid-template-columns: 42px auto minmax\(0, 1fr\) 42px;/g, 'grid-template-columns: 42px max-content minmax(0, 1fr) 42px;');
}

// Fix attach button position (was 4, move to 1)
css = css.replace(/\.agent-search-pill \.agent-attach-button \{\s*grid-column: 4;\s*grid-row: 2;\s*\}/, 
  '.agent-search-pill .agent-attach-button {\n  grid-column: 1;\n  grid-row: 2;\n}');

// Fix send button position (was 5, move to 4)
css = css.replace(/\.agent-search-pill \.agent-send-inline \{\s*grid-column: 5;\s*width: 42px;/, 
  '.agent-search-pill .agent-send-inline {\n  grid-column: 4;\n  width: 42px;');

// Also in the media query:
css = css.replace(/\.agent-search-pill \.agent-attach-button \{\s*grid-column: 4;\s*grid-row: 2;\s*\}/g, 
  '.agent-search-pill .agent-attach-button {\n    grid-column: 1;\n    grid-row: 2;\n  }');
css = css.replace(/\.agent-search-pill \.agent-send-inline \{\s*grid-column: 5;\s*grid-row: 2;/g, 
  '.agent-search-pill .agent-send-inline {\n    grid-column: 4;\n    grid-row: 2;');

fs.writeFileSync('src/index.css', css);


// ── 2. Fix AgentDock.tsx ──
let code = fs.readFileSync('src/components/AgentDock.tsx.bak', 'utf-8');

// A. Rename Library to 资产库
code = code.replace(/<strong>资料库<\/strong>/g, '<strong>资产库</strong>');
code = code.replace(/aria-label="资料库"/g, 'aria-label="资产库"');

// B. Fix addLibraryItem
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

// C. Remove agent-add-tile from the original normal mode search pill
code = code.replace(/<button type="button" className="agent-add-tile" aria-label="附加文件" onClick=\{\(\) => fileInputRef\.current\?\.click\(\)\}>\s*<Plus size=\{28\} \/>\s*<\/button>/, '');

// D. Modify VCInputBoxProps interface to include what we need
code = code.replace(/interface VCInputBoxProps \{[\s\S]*?\}/, `interface VCInputBoxProps {
  form: VCFormData;
  onFormChange: (f: VCFormData) => void;
  onSubmit: () => void;
  loading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  expanded: boolean;
  setExpanded: (val: boolean) => void;
  onSkillClick: () => void;
  skillMenuOpen: boolean;
  quickActions: any[];
  runAction: (a: any) => void;
}`);

// E. Patch VCInputBox
// Instead of replacing the whole thing and losing the beautiful expand panel UI, we inject the mousedown listener and swap the form buttons!
const vcStart = code.indexOf('function VCInputBox({');
const vcEnd = code.indexOf('// ── StoryboardAdjustView', vcStart);

if (vcStart !== -1 && vcEnd !== -1) {
  let vcBoxCode = code.substring(vcStart, vcEnd);

  // 1. Update params
  vcBoxCode = vcBoxCode.replace(/function VCInputBox\(\{ form, onFormChange, onSubmit, loading, fileInputRef, expanded, onExpand \}: VCInputBoxProps\) \{/, 
    'function VCInputBox({ form, onFormChange, onSubmit, loading, fileInputRef, expanded, setExpanded, onSkillClick, skillMenuOpen, quickActions, runAction }: VCInputBoxProps) {');

  // 2. Inject useEffect for click outside
  vcBoxCode = vcBoxCode.replace('const set = (key: keyof VCFormData, value: string) => onFormChange({ ...form, [key]: value });', 
    `const set = (key: keyof VCFormData, value: string) => onFormChange({ ...form, [key]: value });\n\n  useEffect(() => {\n    const handleClickOutside = (e: MouseEvent) => {\n      if (expanded && setExpanded) {\n        const pill = document.querySelector('.vc-input-pill-container');\n        if (pill && !pill.contains(e.target as Node)) {\n          setExpanded(false);\n        }\n      }\n    };\n    document.addEventListener('mousedown', handleClickOutside);\n    return () => document.removeEventListener('mousedown', handleClickOutside);\n  }, [expanded, setExpanded]);`);

  // 3. Replace <textarea> onFocus
  vcBoxCode = vcBoxCode.replace(/onFocus=\{onExpand\}/, 'onFocus={() => setExpanded?.(true)}');

  // 4. Update the buttons INSIDE the form
  // Find the exact form block to replace its buttons
  const formEndIdx = vcBoxCode.indexOf('</form>');
  const attachBtnIdx = vcBoxCode.indexOf('<button type="button" className="agent-attach-button"');
  if (attachBtnIdx !== -1 && attachBtnIdx < formEndIdx) {
    const newButtons = `<button type="button" className="agent-attach-button" aria-label="附加文件" onClick={() => fileInputRef.current?.click()}>
          <Paperclip size={20} />
        </button>
        <button type="button" className="agent-skill-button" aria-label="使用技能" onClick={onSkillClick}>
          <Wrench size={19} />使用技能
        </button>
        <button type="button" className="agent-send-inline" disabled={loading || !form.description.trim()} onClick={(e) => { e.stopPropagation(); onSubmit(); }}>
          {loading ? <Loader2 size={16} className="vc-spin" /> : <Send size={18} />}
        </button>
        
        {skillMenuOpen && quickActions && runAction && (
          <div className="agent-skill-menu">
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
        )}`;
    // We just replace everything from attachBtnIdx up to </form>
    vcBoxCode = vcBoxCode.substring(0, attachBtnIdx) + newButtons + '\n      ' + vcBoxCode.substring(formEndIdx);
  }

  code = code.substring(0, vcStart) + vcBoxCode + code.substring(vcEnd);
}

// F. Update the VCInputBox caller
code = code.replace(/onExpand=\{\(\) => setVcInputExpanded\(true\)\}/, `setExpanded={setVcInputExpanded}
                  onSkillClick={() => setSkillMenuOpen(v => !v)}
                  skillMenuOpen={skillMenuOpen}
                  quickActions={quickActions}
                  runAction={runAction}`);

// G. Replace Canvas Mode input EXACTLY
const canvasClassIdx = code.indexOf('className="vc-canvas-input-form"');
if (canvasClassIdx !== -1) {
  const formStart = code.lastIndexOf('<form', canvasClassIdx);
  const formEnd = code.indexOf('</form>', canvasClassIdx) + 7;
  
  if (formStart !== -1 && formEnd !== -1) {
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
    code = code.substring(0, formStart) + newCanvasStr + code.substring(formEnd);
  }
}

fs.writeFileSync('src/components/AgentDock.tsx', code);
console.log('fix-all-v6 completed.');
