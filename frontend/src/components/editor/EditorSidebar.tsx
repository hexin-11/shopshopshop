import { FolderOpen, Music, Type, Sparkles, LayoutTemplate, Settings } from "lucide-react";

export default function EditorSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (t: string) => void }) {
  const tabs = [
    { id: "media", icon: FolderOpen, label: "媒体" },
    { id: "audio", icon: Music, label: "音频" },
    { id: "text", icon: Type, label: "文字" },
    { id: "stickers", icon: Sparkles, label: "贴纸" },
    { id: "templates", icon: LayoutTemplate, label: "模板" },
  ];

  return (
    <aside className="flex w-[68px] shrink-0 flex-col items-center border-r border-[#E5E7EB] bg-white py-4 gap-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center gap-1.5 w-12 h-12 rounded-lg transition-colors ${
              isActive 
                ? "bg-[#F4F4F5] text-[#488DF0]" 
                : "text-[#171719]/50 hover:bg-[#F4F4F5] hover:text-[#171719]"
            }`}
          >
            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
      
      <div className="mt-auto flex flex-col items-center gap-2">
        <button className="flex flex-col items-center justify-center gap-1.5 w-12 h-12 rounded-lg text-[#171719]/50 hover:bg-[#F4F4F5] hover:text-[#171719] transition-colors">
          <Settings size={18} />
          <span className="text-[10px] font-medium">设置</span>
        </button>
      </div>
    </aside>
  );
}
