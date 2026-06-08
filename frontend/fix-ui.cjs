const fs = require('fs');
let code = fs.readFileSync('src/components/AgentDock.tsx', 'utf-8');

// 1. We need to pass setVcInputExpanded to VCInputBox
code = code.replace(/onExpand=\{\(\) => setVcInputExpanded\(true\)\}/g, 'expanded={vcInputExpanded} setExpanded={setVcInputExpanded} onSkillClick={() => setSkillMenuOpen(v => !v)} skillMenuOpen={skillMenuOpen} quickActions={quickActions} runAction={runAction}');

// Add the types to VCInputBoxProps
code = code.replace(/interface VCInputBoxProps \{[\s\S]*?\}/, `interface VCInputBoxProps {
  form: VCFormData;
  onFormChange: (f: VCFormData) => void;
  onSubmit: () => void;
  loading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  expanded: boolean;
  setExpanded?: (val: boolean) => void;
  onSkillClick?: () => void;
  skillMenuOpen?: boolean;
  quickActions?: any[];
  runAction?: (a: any) => void;
}`);

// 2. Rewrite VCInputBox
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
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expanded, setExpanded]);

  return (
    <div className={\`vc-input-pill-container \${expanded ? "vc-input-expanded" : ""}\`}>
      <form className="agent-search-pill" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          onFocus={() => setExpanded?.(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); }
          }}
          placeholder="描述你的视频..."
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
        )}

        {/* Expandable options panel INSIDE the form grid */}
        <div className={\`vc-input-expand-panel \${expanded ? "vc-panel-open" : "vc-panel-closed"}\`} style={{ gridColumn: '1 / -1', gridRow: 3, marginTop: 12, borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
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
                  <button
                    type="button"
                    onClick={() => onFormChange({ ...form, references: form.references.filter((_, j) => j !== i) })}
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="vc-expand-divider" />

          <div className="vc-expand-row">
            <span className="vc-expand-label">参数</span>
            <div className="vc-chip-row" style={{flex:1}}>
              <select className="vc-chip" value={form.videoType} onChange={(e) => set("videoType", e.target.value)}>
                {VIDEO_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <select className="vc-chip" value={form.style} onChange={(e) => set("style", e.target.value)}>
                {STYLE_PRESETS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <select className="vc-chip" value={form.aspectRatio} onChange={(e) => set("aspectRatio", e.target.value)}>
                {ASPECT_RATIOS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
              <select className="vc-chip" value={form.duration} onChange={(e) => set("duration", e.target.value)}>
                {DURATIONS_MAP.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

`;
  code = code.substring(0, vcStart) + newVCInputBox + code.substring(vcEnd);
  console.log("VCInputBox updated.");
}

fs.writeFileSync('src/components/AgentDock.tsx', code);
