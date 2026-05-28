import { Search, Plus } from "lucide-react";

export default function AssetsPanel() {
  return (
    <div className="flex w-[280px] shrink-0 flex-col border-r border-[#E5E7EB] bg-[#F8F9FA]">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3 bg-white">
        <h2 className="text-[14px] font-bold text-[#171719]">项目媒体</h2>
        <button className="rounded-md p-1 text-[#171719]/60 hover:bg-[#F4F4F5] hover:text-[#171719]">
          <Plus size={16} />
        </button>
      </div>
      
      <div className="p-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#171719]/40" />
          <input 
            type="text" 
            placeholder="搜索素材..." 
            className="w-full rounded-md border border-[#E5E7EB] bg-white py-1.5 pl-8 pr-3 text-[13px] text-[#171719] placeholder:text-[#171719]/40 outline-none focus:border-[#488DF0] transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 pt-0">
        <div className="grid grid-cols-2 gap-2">
          {/* Mock Assets */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="group relative aspect-video overflow-hidden rounded-md border border-[#E5E7EB] bg-white cursor-pointer hover:border-[#488DF0] transition-colors shadow-sm">
              <div className="absolute inset-0 bg-[#E5E7EB]/50 flex items-center justify-center">
                <span className="text-[11px] font-medium text-[#171719]/40">视频 {i}</span>
              </div>
              <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5 text-[9px] font-medium text-white">
                00:05
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
