const fs = require('fs');

let code = fs.readFileSync('src/components/AgentDock.tsx', 'utf-8');

// Replace VCInputBox completely
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
      
      <form className="agent-search-pill" onSubmit={(e) => { e.preventDefault(); onSubmit(); }} style={{margin: 0, width: '100%', overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'}}>
        
        {/* ROW 1 */}
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
        
        {/* ROW 2 */}
        <button type="button" className="agent-attach-button" aria-label="附加文件" onClick={() => fileInputRef.current?.click()}>
          <Paperclip size={20} />
        </button>
        <button type="button" className="agent-skill-button" aria-label="使用技能" onClick={onSkillClick}>
          <Wrench size={19} />使用技能
        </button>
        <button type="button" className="agent-send-inline" disabled={loading || !form.description.trim()} onClick={(e) => { e.stopPropagation(); onSubmit(); }}>
          {loading ? <Loader2 size={16} className="vc-spin" /> : <Send size={18} />}
        </button>
        
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

        {/* ROW 3: EXPAND PANEL (KEPT MOUNTED FOR ANIMATION) */}
        <div className={\`vc-input-expand-panel \${expanded ? "vc-panel-open" : "vc-panel-closed"}\`} style={{
          gridColumn: '1 / -1', gridRow: 3,
          paddingTop: expanded ? '12px' : '0', 
          marginTop: expanded ? '12px' : '0',
          borderTop: expanded ? '1px solid #e2e8f0' : 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          
          <div className="vc-expand-row">
            <span className="vc-expand-label">商品</span>
            <div className="vc-product-selector" style={{ flex: 1, minWidth: 0 }}>
              <button
                type="button"
                className="vc-product-btn-inline"
                onClick={() => setShowProductList((v) => !v)}
              >
                {selectedProduct ? (
                  <>
                    {selectedProduct.mainImage && (
                      <img src={selectedProduct.mainImage} alt={selectedProduct.name} style={{ width: 20, height: 20, borderRadius: 5, objectFit: "cover" }} />
                    )}
                    <span>{selectedProduct.name}</span>
                  </>
                ) : (
                  <span style={{ color: "rgba(23,23,25,0.38)" }}>选择商品...</span>
                )}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4, marginLeft: "auto", flexShrink: 0 }}><path d="m6 9 6 6 6-6" /></svg>
              </button>
              {showProductList && (
                <div className="vc-product-list">
                  {[...catalog].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={form.productId === p.id ? "active" : ""}
                      onClick={() => { set("productId", p.id); setShowProductList(false); }}
                    >
                      {p.mainImage && <img src={p.mainImage} alt={p.name} />}
                      <span style={{ flex: 1 }}>{p.name}</span>
                      {form.productId === p.id && <Check size={13} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {form.references.length > 0 && (
            <div className="vc-expand-row" style={{ paddingTop: 0 }}>
              <span className="vc-expand-label" />
              {form.references.map((ref, i) => (
                <div key={i} className="vc-ref-thumb">
                  <ImagePlus size={12} style={{ flexShrink: 0 }} />
                  <span>{ref}</span>
                  <button type="button" onClick={() => onFormChange({ ...form, references: form.references.filter((_, j) => j !== i) })}><X size={11} /></button>
                </div>
              ))}
            </div>
          )}

          <div className="vc-expand-divider" />

          <div className="vc-expand-row">
            <span className="vc-expand-label">类型</span>
            <div className="vc-pill-row" style={{ flex: 1 }}>
              {VIDEO_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={\`vc-pill \${form.videoType === t.id ? "active" : ""}\`}
                  onClick={() => set("videoType", t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="vc-expand-row">
            <span className="vc-expand-label">风格</span>
            <div className="vc-pill-row" style={{ flex: 1 }}>
              {STYLE_PRESETS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={\`vc-pill \${form.style === s.id && !form.customStyle ? "active" : ""}\`}
                  onClick={() => { onFormChange({ ...form, style: s.id, customStyle: "" }); }}
                >
                  {s.label}
                </button>
              ))}
              <input
                className={\`vc-pill vc-pill-input \${form.customStyle ? "active" : ""}\`}
                placeholder="自定义..."
                value={form.customStyle}
                onChange={(e) => onFormChange({ ...form, customStyle: e.target.value, style: "custom" })}
              />
            </div>
          </div>

          <div className="vc-expand-divider" />

          <div className="vc-expand-row">
            <span className="vc-expand-label">参数</span>
            <div className="vc-chip-row" style={{flex:1}}>
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
      </form>
    </div>
  );
}

`;
  code = code.substring(0, vcStart) + newVCInputBox + code.substring(vcEnd);
  fs.writeFileSync('src/components/AgentDock.tsx', code);
  console.log('VCInputBox replaced perfectly.');
}
