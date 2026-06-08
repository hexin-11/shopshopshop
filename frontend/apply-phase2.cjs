const fs = require('fs');

let tsx = fs.readFileSync('src/components/AgentDock.tsx', 'utf-8');

// 1. Add fields to VideoProjectData
tsx = tsx.replace(
  /visualRefs: VisualRef\[\];\s*\}/,
  `visualRefs: VisualRef[];\n    avatar?: string;\n    ttsVoice?: string;\n  }`
);

// 2. Add onUpdateProject to StoryboardAdjustViewProps
tsx = tsx.replace(
  /onReorderBeats: \(newBeats: VideoProjectData\["storyBeats"\]\) => void;\s*\}/,
  `onReorderBeats: (newBeats: VideoProjectData["storyBeats"]) => void;\n  onUpdateProject: (data: Partial<VideoProjectData>) => void;\n}`
);

// 3. Update StoryboardAdjustView declaration
tsx = tsx.replace(
  /function StoryboardAdjustView\(\{ project, onUpdateBeat, onDeleteBeat, onRegenerateBeat, onConfirm, onBack, onReorderBeats \}: StoryboardAdjustViewProps\) \{/,
  `function StoryboardAdjustView({ project, onUpdateBeat, onDeleteBeat, onRegenerateBeat, onConfirm, onBack, onReorderBeats, onUpdateProject }: StoryboardAdjustViewProps) {`
);

// 4. In StoryboardAdjustView, render interactive chips instead of static spans.
const oldChips = `{/* Settings chips */}
        <div className="vc-canvas-chips-row">
          <span className="vc-canvas-chip">{project.aspectRatio}</span>
          <span className="vc-canvas-chip">~{project.duration}s</span>
          <span className="vc-canvas-chip">{project.resolution}</span>
          <span className="vc-canvas-chip">
            {STYLE_PRESETS.find((s) => s.id === project.style)?.label || project.style}
          </span>
        </div>`;

const newChips = `{/* Editable Settings chips */}
        <div className="vc-canvas-chips-row">
          <div className="vc-dropdown-wrapper">
            <select className="vc-custom-select" value={project.aspectRatio} onChange={e => onUpdateProject({aspectRatio: e.target.value})}>
              <option value="16:9">16:9 横屏</option>
              <option value="9:16">9:16 竖屏</option>
              <option value="1:1">1:1 方块</option>
            </select>
          </div>
          <div className="vc-dropdown-wrapper">
            <select className="vc-custom-select" value={project.duration} onChange={e => onUpdateProject({duration: e.target.value})}>
              <option value="15">~15s</option>
              <option value="30">~30s</option>
              <option value="60">~60s</option>
            </select>
          </div>
          <div className="vc-dropdown-wrapper">
            <select className="vc-custom-select" value={project.resolution} onChange={e => onUpdateProject({resolution: e.target.value})}>
              <option value="1080p">1080p</option>
              <option value="4k">4K</option>
            </select>
          </div>
          <div className="vc-dropdown-wrapper">
            <select className="vc-custom-select" value={project.style} onChange={e => onUpdateProject({style: e.target.value})}>
              {STYLE_PRESETS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div className="vc-dropdown-wrapper">
            <select className="vc-custom-select" value={project.videoType} onChange={e => onUpdateProject({videoType: e.target.value})}>
              {VIDEO_TYPES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </div>`;
tsx = tsx.replace(oldChips, newChips);

// 5. Replace "Summary" -> "内容梗概" and enrich the details.
const oldSummary = `{/* Summary */}
        <div className="vc-canvas-section">
          <div className="vc-canvas-section-label">Summary</div>
          <p className="vc-canvas-summary">{project.summary}</p>
        </div>`;

const newSummary = `{/* 视频梗概 */}
        <div className="vc-canvas-section">
          <div className="vc-canvas-section-label">内容梗概</div>
          <div className="vc-canvas-summary" style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            <p style={{margin: 0}}>{project.summary}</p>
            <div style={{display: 'flex', gap: '16px', fontSize: '13px', color: '#64748b', marginTop: '4px'}}>
              <span><strong>核心卖点：</strong>突出功能与性价比</span>
              <span><strong>目标受众：</strong>年轻消费群体</span>
              <span><strong>视觉基调：</strong>{STYLE_PRESETS.find(s => s.id === project.style)?.label || project.style}</span>
            </div>
          </div>
        </div>

        {/* 动态增删选项：主播与配音配置 (如果类型是 influencer) */}
        {project.videoType === 'influencer' && (
          <div className="vc-canvas-section" style={{background: 'rgba(248, 250, 252, 0.8)', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
            <div className="vc-canvas-section-label">主播与配音配置</div>
            <div style={{display: 'flex', gap: '24px', marginTop: '12px'}}>
              <div style={{flex: 1}}>
                <label style={{fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px'}}>数字人形象</label>
                <div className="vc-dropdown-wrapper" style={{width: '100%'}}>
                  <select className="vc-custom-select" style={{width: '100%'}} value={project.avatar || 'avatar_1'} onChange={e => onUpdateProject({avatar: e.target.value})}>
                    <option value="avatar_1">👩🏻 亚洲年轻女性 - 休闲装</option>
                    <option value="avatar_2">👨🏻 亚洲成熟男性 - 商务装</option>
                    <option value="avatar_3">👩🏼 欧美年轻女性 - 潮牌</option>
                    <option value="upload">+ 自定义上传形象...</option>
                  </select>
                </div>
              </div>
              <div style={{flex: 1}}>
                <label style={{fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px'}}>配音音色 (TTS)</label>
                <div className="vc-dropdown-wrapper" style={{width: '100%'}}>
                  <select className="vc-custom-select" style={{width: '100%'}} value={project.ttsVoice || 'voice_1'} onChange={e => onUpdateProject({ttsVoice: e.target.value})}>
                    <option value="voice_1">🎙️ 活力带货女声</option>
                    <option value="voice_2">🎙️ 磁性成熟男声</option>
                    <option value="voice_3">🎙️ 软萌萝莉音</option>
                    <option value="voice_clone">+ 提取/克隆声音...</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}`;
tsx = tsx.replace(oldSummary, newSummary);

// 6. Replace "Visual References" -> "视觉资产参考"
const oldRefs = `{/* Refs */}
        <div className="vc-canvas-section">
          <div className="vc-canvas-section-label">Visual References</div>`;
const newRefs = `{/* Refs */}
        <div className="vc-canvas-section">
          <div className="vc-canvas-section-label">视觉资产参考</div>`;
tsx = tsx.replace(oldRefs, newRefs);

// 7. Pass onUpdateProject down from AgentDock main state
const dockCallerRegex = /<StoryboardAdjustView\s+project=\{project\}\s+onUpdateBeat=\{updateStoryBeat\}\s+onDeleteBeat=\{deleteStoryBeat\}\s+onRegenerateBeat=\{regenerateStoryBeat\}\s+onReorderBeats=\{\(newBeats\) =>\s+setProject\(\(prev\) => prev \? \{ \.\.\.prev, storyBeats: newBeats \} : null\)\s+\}\s+onConfirm=\{\(\) => \{[\s\S]*?\}\}\s+onBack=\{\(\) => \{/;

const newDockCaller = `<StoryboardAdjustView
                  project={project}
                  onUpdateProject={(data) => setProject((prev) => prev ? { ...prev, ...data } : null)}
                  onUpdateBeat={updateStoryBeat}
                  onDeleteBeat={deleteStoryBeat}
                  onRegenerateBeat={regenerateStoryBeat}
                  onReorderBeats={(newBeats) =>
                    setProject((prev) => (prev ? { ...prev, storyBeats: newBeats } : null))
                  }
                  onConfirm={() => {`;

tsx = tsx.replace(dockCallerRegex, newDockCaller);

fs.writeFileSync('src/components/AgentDock.tsx', tsx);
console.log('Phase 2 applied.');
