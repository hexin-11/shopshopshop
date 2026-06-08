const fs = require('fs');
let lines = fs.readFileSync('src/components/AgentDock.tsx', 'utf-8').split('\n');

// 1. Replace VCInputBox
let startIdx = lines.findIndex(l => l.includes('function VCInputBox({ form, onFormChange, onSubmit, loading, fileInputRef, expanded, onExpand }: VCInputBoxProps) {'));
let endIdx = lines.findIndex((l, i) => i > startIdx && l.includes('// ── StoryboardAdjustView'));

if (startIdx !== -1 && endIdx !== -1) {
  const newVCInputBox = `function VCInputBox({ form, onFormChange, onSubmit, loading, fileInputRef, expanded, onExpand }: VCInputBoxProps) {
  const [showProductList, setShowProductList] = useState(false);
  const selectedProduct = catalog.find((p) => p.id === form.productId);
  const set = (key: keyof VCFormData, value: string) => onFormChange({ ...form, [key]: value });

  return (
    <div className={\`\${expanded ? "vc-input-expanded" : ""}\`}>
      <form className="agent-search-pill" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          onFocus={onExpand}
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
        <button type="button" className="agent-skill-button" aria-label="使用技能" onClick={onExpand}>
          <Wrench size={19} />使用技能
        </button>
        <button type="button" className="agent-send-inline" disabled={loading || !form.description.trim()} onClick={(e) => { e.stopPropagation(); onSubmit(); }}>
          {loading ? <Loader2 size={16} className="vc-spin" /> : <Send size={18} />}
        </button>
      </form>

      {/* Expandable options panel */}
      <div className={\`vc-input-expand-panel \${expanded ? "vc-panel-open" : "vc-panel-closed"}\`} style={{ marginTop: 12 }}>
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
          <button type="button" className="btn-primary" onClick={(e) => { e.stopPropagation(); onSubmit(); }} disabled={loading || !form.description.trim()} style={{ marginLeft: "auto", padding: "8px 18px" }}>
            {loading ? <Loader2 size={16} className="vc-spin" /> : "生成大纲 →"}
          </button>
        </div>
      </div>
    </div>
  );
}

`;
  lines.splice(startIdx, endIdx - startIdx, newVCInputBox);
  console.log("VCInputBox replaced.");
} else {
  console.log("VCInputBox bounds not found.", startIdx, endIdx);
}

// 2. Replace Canvas Mode input
let canvasStart = lines.findIndex(l => l.includes('className="vc-canvas-input-form"'));
if (canvasStart !== -1) {
  // move up one line to get <form
  let formStart = canvasStart - 1;
  let formEnd = lines.findIndex((l, i) => i > formStart && l.includes('</form>'));
  if (formEnd !== -1) {
    const newCanvasInput = `                <form className="agent-search-pill" style={{marginTop: 'auto', marginBottom: 20}} onSubmit={(e) => { e.preventDefault(); submitCanvasInput(); }}>
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
    lines.splice(formStart, formEnd - formStart + 1, newCanvasInput);
    console.log("Canvas form replaced.");
  }
} else {
  console.log("Canvas form not found.");
}

let newCode = lines.join('\n');

// 3. Remove agent-add-tile from the original agent-search-pill
newCode = newCode.replace(/<button type="button" className="agent-add-tile" aria-label="附加文件" onClick=\{\(\) => fileInputRef\.current\?\.click\(\)\}>\s*<Plus size=\{28\} \/>\s*<\/button>/, '');

// 4. Rename Library to 资产库
newCode = newCode.replace(/<strong>资料库<\/strong>/g, '<strong>资产库</strong>');
newCode = newCode.replace(/aria-label="资料库"/g, 'aria-label="资产库"');

// 5. Fix addLibraryItem
const libItemLogic = newCode.indexOf('const addLibraryItem =');
if (libItemLogic !== -1) {
  const libItemEnd = newCode.indexOf('const submitInput =', libItemLogic);
  newCode = newCode.substring(0, libItemLogic) + 
  `const addLibraryItem = (item: LibraryItem) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? { ...c, references: Array.from(new Set([...c.references, item.title])) }
          : c
      )
    );
  };
  ` + newCode.substring(libItemEnd);
}

fs.writeFileSync('src/components/AgentDock.tsx', newCode);
console.log('Script completed successfully.');
