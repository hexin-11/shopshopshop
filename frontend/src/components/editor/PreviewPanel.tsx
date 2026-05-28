import { Play, Pause, SkipBack, SkipForward, Maximize, Frame } from "lucide-react";

export default function PreviewPanel() {
  return (
    <div className="flex flex-1 flex-col bg-[#F4F4F5] overflow-hidden relative">
      {/* 顶部比例和分辨率切换 */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button className="flex items-center gap-1.5 rounded-md bg-white/90 backdrop-blur border border-[#E5E7EB] px-2.5 py-1.5 text-[12px] font-medium text-[#171719] shadow-sm hover:bg-white transition-colors">
          <Frame size={14} className="text-[#171719]/60" />
          9:16
        </button>
        <button className="flex items-center gap-1.5 rounded-md bg-white/90 backdrop-blur border border-[#E5E7EB] px-2.5 py-1.5 text-[12px] font-medium text-[#171719] shadow-sm hover:bg-white transition-colors">
          1080p
        </button>
      </div>

      {/* 播放器画布居中 */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="aspect-[9/16] h-full max-h-[100%] rounded-lg bg-black shadow-2xl relative overflow-hidden ring-1 ring-[#E5E7EB]">
          {/* 视频模拟内容 */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col justify-end p-6">
             <div className="text-center mb-10">
               <h2 className="text-3xl font-bold text-white mb-2 shadow-black drop-shadow-md">沉浸音效，全天在线</h2>
               <p className="text-lg text-white/80 drop-shadow-md">降噪头戴式耳机系列</p>
             </div>
          </div>
        </div>
      </div>

      {/* 底部控制条 */}
      <div className="h-12 shrink-0 border-t border-[#E5E7EB] bg-white flex items-center justify-between px-4">
        <div className="flex items-center gap-4 text-[#171719]/50">
          <span className="text-[13px] font-medium font-mono text-[#171719]">00:03:14</span>
          <span className="text-[12px]">/ 00:15:00</span>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-1.5 rounded-full hover:bg-[#F4F4F5] text-[#171719]/70 transition-colors">
            <SkipBack size={16} />
          </button>
          <button className="p-2 rounded-full bg-[#171719] text-white hover:bg-[#171719]/80 shadow-sm transition-colors">
            <Play size={18} className="ml-0.5" />
          </button>
          <button className="p-1.5 rounded-full hover:bg-[#F4F4F5] text-[#171719]/70 transition-colors">
            <SkipForward size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-md p-1.5 text-[12px] font-medium text-[#171719]/60 hover:bg-[#F4F4F5] hover:text-[#171719] transition-colors">
            33%
          </button>
          <button className="rounded-md p-1.5 text-[#171719]/60 hover:bg-[#F4F4F5] hover:text-[#171719] transition-colors">
            <Maximize size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
