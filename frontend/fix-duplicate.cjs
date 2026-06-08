const fs = require('fs');
const path = 'src/components/AgentDock.tsx';
let lines = fs.readFileSync(path, 'utf-8').split('\n');

// The lines 578 to 617 (1-indexed) map to array indices 577 to 616.
// Wait, looking at the view_file output:
// 578: function StoryboardAdjustView({ project, onUpdateBeat, onDeleteBeat, onRegenerateBeat, onConfirm, onBack, onReorderBeats, onUpdateProject }: StoryboardAdjustViewProps) {
// ...
// 616: }
// 617: 
// 618: function StoryboardAdjustView({ project, onUpdateBeat, onDeleteBeat, onRegenerateBeat, onConfirm, onBack, onReorderBeats, onUpdateProject }: StoryboardAdjustViewProps) {

// I will just slice out from 578 down to the line before the second function StoryboardAdjustView.

let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('function StoryboardAdjustView')) {
    startIdx = i;
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].includes('function StoryboardAdjustView')) {
        endIdx = j - 1;
        break;
      }
    }
    break;
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  lines.splice(startIdx, endIdx - startIdx + 1);
  fs.writeFileSync(path, lines.join('\n'));
  console.log('Fixed duplicate function exactly!');
} else {
  console.log('Could not find duplicate.');
}
