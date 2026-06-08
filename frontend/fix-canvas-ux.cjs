const fs = require('fs');
let txt = fs.readFileSync('src/components/AgentDock.tsx', 'utf8');

// 1. Add onUpdateProject to ProjectCanvasViewProps
txt = txt.replace(
  'onAddRef: () => void;\n  }',
  'onAddRef: () => void;\n    onUpdateProject?: (data: Partial<VideoProjectData>) => void;\n  }'
);

// 2. Add onUpdateProject to ProjectCanvasView params
txt = txt.replace(
  'function ProjectCanvasView({ project, stage, editingBeatId, onEditBeat, onUpdateBeat, onRegenerateBeat, onAddRef }: ProjectCanvasViewProps) {',
  'function ProjectCanvasView({ project, stage, editingBeatId, onEditBeat, onUpdateBeat, onRegenerateBeat, onAddRef, onUpdateProject }: ProjectCanvasViewProps) {'
);

// 3. Update the ProjectCanvasView rendering
const canvasSectionToReplace = `        {/* Summary */}
        <div className="vc-canvas-section">
          <div className="vc-canvas-section-label">Summary</div>
          <p className="vc-canvas-summary">{project.summary}</p>
        </div>
  
        {/* Settings chips */}
        <div className="vc-canvas-chips-row">
          <span className="vc-canvas-chip">{project.aspectRatio}</span>
          <span className="vc-canvas-chip">~{project.duration}s</span>
          <span className="vc-canvas-chip">{project.resolution}</span>
          <span className="vc-canvas-chip">
            {STYLE_PRESETS.find((s) => s.id === project.style)?.label || project.style}
          </span>
          <span className="vc-canvas-chip">
            {VIDEO_TYPES.find((t) => t.id === project.videoType)?.label || project.videoType}
          </span>
        </div>
  
        {/* Visual References */}
        <div className="vc-canvas-section">
          <div className="vc-canvas-section-label">Visual References</div>`;

const newCanvasSection = `        {/* Summary */}
        <div className="vc-canvas-section">
          <div className="vc-canvas-section-label">需求摘要</div>
          <p className="vc-canvas-summary">{project.summary}</p>
        </div>
  
        {/* Settings chips as selects */}
        <div className="vc-canvas-chips-row" style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
          <select className="vc-canvas-chip" style={{cursor: 'pointer', appearance: 'auto', border: '1px solid #eee'}} value={project.aspectRatio} onChange={e => onUpdateProject?.({aspectRatio: e.target.value as any})}>
            <option value="16:9">16:9 (横屏)</option>
            <option value="9:16">9:16 (竖屏)</option>
            <option value="1:1">1:1 (方形)</option>
          </select>
          <select className="vc-canvas-chip" style={{cursor: 'pointer', appearance: 'auto', border: '1px solid #eee'}} value={project.duration} onChange={e => onUpdateProject?.({duration: e.target.value})}>
            <option value="15">~15s</option>
            <option value="30">~30s</option>
            <option value="60">~60s</option>
          </select>
          <select className="vc-canvas-chip" style={{cursor: 'pointer', appearance: 'auto', border: '1px solid #eee'}} value={project.resolution} onChange={e => onUpdateProject?.({resolution: e.target.value as any})}>
            <option value="1080p">1080p</option>
            <option value="720p">720p</option>
            <option value="4k">4K</option>
          </select>
          <select className="vc-canvas-chip" style={{cursor: 'pointer', appearance: 'auto', border: '1px solid #eee'}} value={project.style} onChange={e => onUpdateProject?.({style: e.target.value})}>
            <option value="realistic">写实风格</option>
            <option value="anime">二次元</option>
            <option value="3d">3D 动画</option>
            <option value="minimalist">极简主义</option>
          </select>
          <select className="vc-canvas-chip" style={{cursor: 'pointer', appearance: 'auto', border: '1px solid #eee'}} value={project.videoType} onChange={e => onUpdateProject?.({videoType: e.target.value})}>
            <option value="product">商品混剪</option>
            <option value="story">剧情短片</option>
            <option value="vlog">Vlog记录</option>
            <option value="tutorial">口播解说</option>
          </select>
        </div>
  
        {/* Visual References */}
        <div className="vc-canvas-section">
          <div className="vc-canvas-section-label">视觉参考</div>`;

txt = txt.replace(canvasSectionToReplace, newCanvasSection);

// 4. Update the Canvas Chat Box Action logic
const canvasChatBoxOld = `{skillMenuOpen && (
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
                    )}`;

const canvasChatBoxNew = `{skillMenuOpen && (
                      <div className="agent-skill-menu" style={{bottom: '60px', left: 0, right: 'auto'}}>
                        {quickActions.map((action) => {
                          const Icon = action.icon;
                          return (
                            <button key={action.label} type="button" onClick={() => {
                              setVcCanvasInput(action.prompt);
                              setSkillMenuOpen(false);
                            }}>
                              <Icon size={17} />
                              <span>{action.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}`;

txt = txt.replace(canvasChatBoxOld, canvasChatBoxNew);

// 5. Add onUpdateProject to the ProjectCanvasView invocation
txt = txt.replace(
  'onAddRef={() => {',
  'onUpdateProject={(data) => setVcProject(prev => prev ? {...prev, ...data} : null)}\n                  onAddRef={() => {'
);

fs.writeFileSync('src/components/AgentDock.tsx', txt);
console.log('Fixed Canvas UX inside AgentDock!');

