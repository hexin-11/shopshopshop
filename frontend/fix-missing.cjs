const fs = require('fs');
const path = 'src/components/AgentDock.tsx';
let txt = fs.readFileSync(path, 'utf8');

const missingFuncs = `
  const handleDeleteBeat = (beatId: string) => {
    setVcProject((prev) =>
      prev ? { ...prev, storyBeats: prev.storyBeats.filter((b) => b.id !== beatId) } : null,
    );
  };

  const handleConfirmStoryboard = () => {
    window.dispatchEvent(new CustomEvent("tikframe:openProjectWorkspace", { detail: { projectId: "new-project" } }));
    returnToPreviousPage();
  };

  const submitCanvasInput = async () => {`;

txt = txt.replace('const submitCanvasInput = async () => {', missingFuncs);

// And import Edit3
if (!txt.includes('Edit3,')) {
  txt = txt.replace('Edit2,', 'Edit2, Edit3,');
  if (!txt.includes('Edit3,')) {
      txt = txt.replace('import {', 'import { Edit3,');
  }
}

fs.writeFileSync(path, txt);
console.log('Fixed missing functions and imports!');
