const fs = require('fs');
const path = 'src/components/AgentDock.tsx';
let txt = fs.readFileSync(path, 'utf8');

txt = txt.replace(
  /<p\s+className="vc-beat-desc-text"\s+onClick=\{\(\) => onEditBeat\(beat\.id\)\}\s+title="点击编辑"\s*>\s*\{beat\.description\}\s*<\/p>/m,
  `<p
                      className="vc-beat-desc-text"
                      onClick={() => onEditBeat(beat.id)}
                      title="点击编辑"
                      style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'text'}}
                    >
                      <span style={{flex: 1}}>{beat.description}</span>
                      <span style={{color: '#94a3b8'}}><Edit3 size={14} /></span>
                    </p>`
);

fs.writeFileSync(path, txt);
console.log('Fixed beat edit UI!');
