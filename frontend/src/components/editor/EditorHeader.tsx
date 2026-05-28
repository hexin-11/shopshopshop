import { ArrowLeft, Redo2, Undo2, Play, Download } from "lucide-react";

export default function EditorHeader({ navigate, projectName }: { navigate: (r: any) => void; projectName: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white px-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("projects")}
          className="rounded-md p-1.5 text-[#171719]/60 hover:bg-[#F4F4F5] hover:text-[#171719] transition-colors"
          title="返回项目"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="h-4 w-px bg-[#E5E7EB]" />
        <h1 className="text-[15px] font-bold text-[#171719]">{projectName}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button className="rounded-md p-1.5 text-[#171719]/40 hover:bg-[#F4F4F5] hover:text-[#171719] transition-colors" title="撤销">
          <Undo2 size={16} />
        </button>
        <button className="rounded-md p-1.5 text-[#171719]/40 hover:bg-[#F4F4F5] hover:text-[#171719] transition-colors" title="重做">
          <Redo2 size={16} />
        </button>
        <div className="mx-2 h-4 w-px bg-[#E5E7EB]" />
        <button className="btn-secondary py-1.5 px-3 text-[13px] h-8 font-medium border-[#E5E7EB] bg-white shadow-sm">
          保存草稿
        </button>
        <button className="btn-primary py-1.5 px-4 text-[13px] h-8 font-medium gap-1.5 shadow-sm">
          <Download size={14} />
          导出视频
        </button>
      </div>
    </header>
  );
}
