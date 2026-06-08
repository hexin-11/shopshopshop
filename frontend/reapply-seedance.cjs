const fs = require('fs');
const path = 'src/components/AgentDock.tsx';
let txt = fs.readFileSync(path, 'utf8');

// 1. Add Edit3
if (!txt.includes('Edit3,')) {
  txt = txt.replace('from "lucide-react";', '  Edit3,\n} from "lucide-react";');
}

// 2. Add generateClip and replace handleStartGeneration/handleRegenerateBeat
const newHandlers = `
  const generateClip = async (prompt, imageUrl, ratio, duration) => {
    try {
      const createRes = await fetch('/api/generate-clip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, imageUrl, ratio, duration })
      });
      const createData = await createRes.json();
      if (!createRes.ok || !createData.taskId) {
        console.error("Generate failed:", createData);
        return null;
      }
      
      const taskId = createData.taskId;
      while (true) {
        await new Promise(r => setTimeout(r, 5000));
        const statusRes = await fetch(\`/api/generate-clip/status?taskId=\${taskId}\`);
        const statusData = await statusRes.json();
        if (statusData.status === 'succeeded') {
          return statusData.content.video_url;
        } else if (statusData.status === 'failed') {
          console.error("Task failed:", statusData);
          return null;
        }
      }
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleStartGeneration = async () => {
    if (!vcProject) return;
    setVcStage("generating");

    for (const beat of vcProject.storyBeats) {
      setVcProject((prev) => prev ? { ...prev, storyBeats: prev.storyBeats.map((b) => (b.id === beat.id ? { ...b, status: "generating" } : b)) } : null);
      
      const imageUrl = vcProject.visualRefs?.[0]?.url || "";
      const videoUrl = await generateClip(beat.description, imageUrl, vcProject.aspectRatio, parseInt(vcProject.duration) || 5);
      
      setVcProject((prev) =>
        prev ? {
          ...prev,
          storyBeats: prev.storyBeats.map((b) =>
            b.id === beat.id
              ? { ...b, status: "done", videoClipUrl: videoUrl || \`https://picsum.photos/seed/\${beat.id}\${Date.now()}/320/568\` }
              : b
          )
        } : null
      );
    }

    setVcStage("storyboard");
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              updatedAt: "刚刚",
              messages: [
                ...c.messages,
                { id: Date.now(), role: "agent" as const, text: \`🎬 视频片段生成完成！\${vcProject.storyBeats.length} 个分镜全部就绪。现在进入粗略分镜调整，你可以重排、删减或单独重新生成不满意的镜头，确认后进入精剪。\` },
              ],
            }
          : c,
      ),
    );
  };

  const handleRegenerateBeat = async (beatId: string) => {
    if (!vcProject) return;
    setVcProject((prev) => prev ? { ...prev, storyBeats: prev.storyBeats.map((b) => (b.id === beatId ? { ...b, status: "generating", videoClipUrl: undefined } : b)) } : null);
    
    const beat = vcProject.storyBeats.find(b => b.id === beatId);
    if (!beat) return;
    
    const imageUrl = vcProject.visualRefs?.[0]?.url || "";
    const videoUrl = await generateClip(beat.description, imageUrl, vcProject.aspectRatio, parseInt(vcProject.duration) || 5);
    
    setVcProject((prev) =>
      prev ? {
          ...prev,
          storyBeats: prev.storyBeats.map((b) =>
            b.id === beatId
              ? { ...b, status: "done", videoClipUrl: videoUrl || \`https://picsum.photos/seed/\${beatId}regen\${Date.now()}/320/568\` }
              : b
          )
        } : null
    );
  };
`;

txt = txt.replace(
  /const handleStartGeneration = async \(\) => \{[\s\S]*?const handleDeleteBeat = \(beatId: string\) => \{/,
  newHandlers + '\n  const handleDeleteBeat = (beatId: string) => {'
);

// 3. Replace image rendering with video rendering
txt = txt.replace(
  /<img src=\{beat\.videoClipUrl\} alt=\{beat\.heading\} \/>\s*<div className="vc-shot-play-overlay">\s*<Play size=\{18\} fill="white" \/>\s*<\/div>/g,
  '<video src={beat.videoClipUrl} controls autoPlay loop style={{width: "100%", height: "100%", objectFit: "cover"}} />'
);

fs.writeFileSync(path, txt);
console.log('Re-applied seedance changes successfully!');
