import { Scissors, Copy, Trash2, ZoomIn, ZoomOut, Eye, Lock } from "lucide-react";

export default function TimelinePanel() {
  return (
    <div className="h-[280px] shrink-0 border-t border-[#E5E7EB] bg-white flex flex-col">
      {/* 顶部工具栏 */}
      <div className="flex h-10 items-center justify-between border-b border-[#E5E7EB] px-4 bg-[#F8F9FA]">
        <div className="flex items-center gap-1">
          <button className="rounded p-1.5 text-[#171719]/50 hover:bg-[#E5E7EB] hover:text-[#171719] transition-colors" title="分割 (Ctrl+K)">
            <Scissors size={14} />
          </button>
          <button className="rounded p-1.5 text-[#171719]/50 hover:bg-[#E5E7EB] hover:text-[#171719] transition-colors" title="复制 (Ctrl+C)">
            <Copy size={14} />
          </button>
          <button className="rounded p-1.5 text-[#171719]/50 hover:bg-[#E5E7EB] hover:text-[#171719] transition-colors" title="删除 (Del)">
            <Trash2 size={14} />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ZoomOut size={14} className="text-[#171719]/40" />
            <div className="w-24 h-1.5 rounded-full bg-[#E5E7EB]">
              <div className="w-1/3 h-full rounded-full bg-[#171719]/30" />
            </div>
            <ZoomIn size={14} className="text-[#171719]/40" />
          </div>
        </div>
      </div>

      {/* 时间轴主体区域 (模拟轨道) */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧轨道表头 */}
        <div className="w-[180px] shrink-0 border-r border-[#E5E7EB] bg-[#F8F9FA] flex flex-col">
          <div className="h-6 border-b border-[#E5E7EB]" /> {/* 占位对齐刻度尺 */}
          
          <div className="flex h-16 items-center justify-between border-b border-[#E5E7EB] px-3">
            <span className="text-[12px] font-medium text-[#171719]/70">主视频轨 V1</span>
            <div className="flex gap-1.5 text-[#171719]/40">
              <Eye size={14} className="hover:text-[#171719] cursor-pointer" />
              <Lock size={14} className="hover:text-[#171719] cursor-pointer" />
            </div>
          </div>
          
          <div className="flex h-12 items-center justify-between border-b border-[#E5E7EB] px-3">
            <span className="text-[12px] font-medium text-[#171719]/70">字幕轨 T1</span>
            <div className="flex gap-1.5 text-[#171719]/40">
              <Eye size={14} className="hover:text-[#171719] cursor-pointer" />
              <Lock size={14} className="hover:text-[#171719] cursor-pointer" />
            </div>
          </div>
          
          <div className="flex h-16 items-center justify-between border-b border-[#E5E7EB] px-3">
            <span className="text-[12px] font-medium text-[#171719]/70">音频轨 A1</span>
            <div className="flex gap-1.5 text-[#171719]/40">
              <Eye size={14} className="hover:text-[#171719] cursor-pointer" />
              <Lock size={14} className="hover:text-[#171719] cursor-pointer" />
            </div>
          </div>
        </div>

        {/* 右侧轨道内容区 */}
        <div className="flex-1 overflow-x-auto relative bg-[#F8F9FA]">
          {/* 刻度尺 */}
          <div className="h-6 w-[200%] border-b border-[#E5E7EB] bg-white relative">
            <div className="absolute top-0 bottom-0 left-0 flex items-end text-[10px] text-[#171719]/40">
              <span className="absolute left-[0px] pb-1">00:00</span>
              <span className="absolute left-[100px] pb-1">00:05</span>
              <span className="absolute left-[200px] pb-1">00:10</span>
              <span className="absolute left-[300px] pb-1">00:15</span>
              <span className="absolute left-[400px] pb-1">00:20</span>
            </div>
          </div>

          {/* 播放头 (Playhead) */}
          <div className="absolute top-0 bottom-0 left-[150px] w-px bg-[#488DF0] z-20 pointer-events-none">
            <div className="absolute -top-1 -left-[5px] w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#488DF0]" />
          </div>

          {/* 视频片段 */}
          <div className="h-16 border-b border-[#E5E7EB] relative pt-2 pb-2">
            <div className="absolute left-[20px] w-[180px] h-[48px] rounded-md bg-[#488DF0]/20 border border-[#488DF0]/40 flex items-center px-2 cursor-pointer shadow-sm hover:border-[#488DF0]">
              <span className="text-[11px] font-medium text-[#488DF0]">视频素材_01.mp4</span>
            </div>
            <div className="absolute left-[210px] w-[150px] h-[48px] rounded-md bg-white border border-[#488DF0] flex items-center px-2 cursor-pointer shadow-[0_0_0_1px_#488DF0] z-10">
              <span className="text-[11px] font-medium text-[#488DF0]">商品展示片段.mp4</span>
            </div>
          </div>
          
          {/* 字幕片段 */}
          <div className="h-12 border-b border-[#E5E7EB] relative pt-2 pb-2">
            <div className="absolute left-[20px] w-[80px] h-[32px] rounded-md bg-[#F2994A]/20 border border-[#F2994A]/40 flex items-center px-2 cursor-pointer hover:border-[#F2994A]">
              <span className="text-[11px] font-medium text-[#F2994A] truncate">字幕 1</span>
            </div>
            <div className="absolute left-[210px] w-[120px] h-[32px] rounded-md bg-[#F2994A]/20 border border-[#F2994A]/40 flex items-center px-2 cursor-pointer hover:border-[#F2994A]">
              <span className="text-[11px] font-medium text-[#F2994A] truncate">沉浸音效，全天在线</span>
            </div>
          </div>
          
          {/* 音频片段 */}
          <div className="h-16 border-b border-[#E5E7EB] relative pt-2 pb-2">
            <div className="absolute left-[0px] w-[400px] h-[48px] rounded-md bg-[#27AE60]/10 border border-[#27AE60]/30 flex flex-col justify-center px-2 cursor-pointer hover:border-[#27AE60]">
               <span className="text-[10px] font-medium text-[#27AE60] mb-1">BGM_Ambient_Chill.mp3</span>
               <div className="flex items-end gap-0.5 h-3 opacity-50">
                  {/* 波形 mock */}
                  {[...Array(40)].map((_, i) => (
                    <div key={i} className="w-[3px] bg-[#27AE60]" style={{ height: `${Math.max(20, Math.random() * 100)}%` }} />
                  ))}
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
