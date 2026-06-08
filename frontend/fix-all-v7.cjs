const fs = require('fs');

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

// C. Remove agent-add-tile from the normal search pill
code = code.replace(/<button type="button" className="agent-add-tile" aria-label="附加文件" onClick=\{\(\) => fileInputRef\.current\?\.click\(\)\}>\s*<Plus size=\{28\} \/>\s*<\/button>/, '');

// D. Modify VCInputBoxProps interface
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

// E. Replace VCInputBox component entirely
const vcStart = code.indexOf('function VCInputBox({');
const vcEnd = code.indexOf('// ── StoryboardAdjustView', vcStart);

if (vcStart !== -1 && vcEnd !== -1) {
  const newVCInputBox = `function VCInputBox({ form, onFormChange, onSubmit, loading, fileInputRef, expanded, setExpanded, onSkillClick, skillMenuOpen, quickActions, runAction }: VCInputBoxProps) {
  const [showProductList, setShowProductList] = useState(false);
  const selectedProduct = catalog.find((p) => p.id === form.productId);
  const set = (key: keyof VCFormData, value: string) => onFormChange({ ...form, [key]: value });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (expanded && setExpanded) {
        const pill = document.querySelector('.vc-input-pill-container');
        if (pill && !pill.contains(e.target as Node)) {
          setExpanded(false);
          setShowProductList(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expanded, setExpanded]);

  return (
    <div className={\`vc-input-pill-container \${expanded ? "vc-input-expanded" : ""}\`} style={{position: 'relative', width: '100%', maxWidth: '900px', margin: '0 auto'}}>
      
      {/* 1. THE PILL FORM */}
      <form className="agent-search-pill" onSubmit={(e) => { e.preventDefault(); onSubmit(); }} style={{margin: 0, width: '100%'}}>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          onFocus={() => setExpanded?.(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); }
          }}
          placeholder="描述你想制作的视频..."
          rows={expanded ? 3 : 2}
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="agent-hidden-file"
          onChange={(e) => {
            if (e.target.files) {
              onFormChange({
                ...form,
                references: [...form.references, ...Array.from(e.target.files).map((f) => f.name)],
              });
            }
          }}
        />
        
        {/* Row 2 Buttons */}
        <button type="button" className="agent-attach-button" aria-label="附加文件" onClick={() => fileInputRef.current?.click()}>
          <Paperclip size={20} />
        </button>
        <button type="button" className="agent-skill-button" aria-label="使用技能" onClick={onSkillClick}>
          <Wrench size={19} />使用技能
        </button>
        <button type="button" className="agent-send-inline" disabled={loading || !form.description.trim()} onClick={(e) => { e.stopPropagation(); onSubmit(); }}>
          {loading ? <Loader2 size={16} className="vc-spin" /> : <Send size={18} />}
        </button>
        
        {/* SKILLS DROPDOWN */}
        {skillMenuOpen && quickActions && runAction && (
          <div className="agent-skill-menu" style={{bottom: '60px'}}>
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
      </form>

      {/* 2. THE EXPAND PANEL (Positioned beautifully below the pill) */}
      {expanded && (
        <div className="vc-input-expand-panel vc-panel-open" style={{
          position: 'absolute', top: '100%', left: 0, right: 0, 
          marginTop: '8px', zIndex: 100,
          background: '#fff', borderRadius: '16px', 
          boxShadow: '0 12px 32px rgba(0,0,0,0.08)', padding: '16px',
          border: '1px solid rgba(216,226,236,0.85)'
        }}>
          {/* Product Selector */}
          <div className="vc-expand-row">
            <span className="vc-expand-label">选择商品</span>
            <div className="vc-product-selector" style={{ flex: 1, minWidth: 0 }}>
              <button
                type="button"
                className="vc-product-btn-inline"
                onClick={() => setShowProductList((v) => !v)}
              >
                {selectedProduct ? (
                  <>
                    {selectedProduct.mainImage && (
                      <img src={selectedProduct.mainImage} alt={selectedProduct.name} style={{ width: 24, height: 24, borderRadius: 6, objectFit: "cover" }} />
                    )}
                    <span style={{fontWeight: 500}}>{selectedProduct.name}</span>
                  </>
                ) : (
                  <span style={{ color: "rgba(23,23,25,0.4)" }}>无商品</span>
                )}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, marginLeft: "auto" }}><path d="m6 9 6 6 6-6" /></svg>
              </button>
              {showProductList && (
                <div className="vc-product-list" style={{boxShadow: '0 8px 24px rgba(0,0,0,0.1)', border: '1px solid #eee'}}>
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
                </div>
              )}
            </div>
          </div>

          {/* References */}
          {form.references.length > 0 && (
            <div className="vc-expand-row" style={{ paddingTop: 0 }}>
              <span className="vc-expand-label" />
              {form.references.map((ref, i) => (
                <div key={i} className="vc-ref-thumb" style={{background: '#f1f5f9', borderRadius: '8px', padding: '4px 8px'}}>
                  <ImagePlus size={14} style={{ opacity: 0.6 }} />
                  <span style={{fontSize: 13}}>{ref}</span>
                  <button type="button" onClick={() => onFormChange({ ...form, references: form.references.filter((_, j) => j !== i) })}><X size={13} /></button>
                </div>
              ))}
            </div>
          )}

          <div className="vc-expand-divider" style={{margin: '12px 0'}} />

          {/* Type & Style */}
          <div className="vc-expand-row">
            <span className="vc-expand-label">类型与风格</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <div className="vc-pill-row">
                {VIDEO_TYPES.map((t) => (
                  <button key={t.id} type="button" className={\`vc-pill \${form.videoType === t.id ? "active" : ""}\`} onClick={() => set("videoType", t.id)}>
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="vc-pill-row">
                {STYLE_PRESETS.map((s) => (
                  <button key={s.id} type="button" className={\`vc-pill \${form.style === s.id && !form.customStyle ? "active" : ""}\`} onClick={() => { onFormChange({ ...form, style: s.id, customStyle: "" }); }}>
                    {s.label}
                  </button>
                ))}
                <input className={\`vc-pill vc-pill-input \${form.customStyle ? "active" : ""}\`} placeholder="自定义风格..." value={form.customStyle} onChange={(e) => onFormChange({ ...form, customStyle: e.target.value, style: "custom" })} />
              </div>
            </div>
          </div>

          <div className="vc-expand-divider" style={{margin: '12px 0'}} />

          {/* Parameters */}
          <div className="vc-expand-row">
            <span className="vc-expand-label">参数设置</span>
            <div className="vc-pill-row" style={{flex: 1}}>
              <div className="vc-dropdown-wrapper">
                <select className="vc-custom-select" value={form.aspectRatio} onChange={(e) => set("aspectRatio", e.target.value)}>
                  {ASPECT_RATIOS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6" /></svg>
              </div>
              
              <div className="vc-dropdown-wrapper">
                <select className="vc-custom-select" value={form.duration} onChange={(e) => set("duration", e.target.value)}>
                  {DURATIONS_MAP.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                </select>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6" /></svg>
              </div>

              <div className="vc-dropdown-wrapper">
                <select className="vc-custom-select" value={form.resolution} onChange={(e) => set("resolution", e.target.value)}>
                  {RESOLUTIONS_MAP.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6" /></svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

`;
  code = code.substring(0, vcStart) + newVCInputBox + code.substring(vcEnd);
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
    const newCanvasStr = `<form className="agent-search-pill" style={{marginTop: 'auto', marginBottom: 20, width: '100%'}} onSubmit={(e) => { e.preventDefault(); submitCanvasInput(); }}>
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
console.log('fix-all-v7 completed.');
