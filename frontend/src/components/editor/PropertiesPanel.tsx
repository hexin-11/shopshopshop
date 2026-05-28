import { SlidersHorizontal, Image as ImageIcon } from "lucide-react";

export default function PropertiesPanel() {
  return (
    <div className="w-[280px] shrink-0 border-l border-[#E5E7EB] bg-white flex flex-col">
      {/* 顶部 Tab */}
      <div className="flex h-12 border-b border-[#E5E7EB]">
        <button className="flex-1 flex items-center justify-center gap-1.5 border-b-2 border-[#171719] text-[13px] font-bold text-[#171719]">
          <ImageIcon size={14} />
          视觉
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 text-[13px] font-medium text-[#171719]/50 hover:text-[#171719] transition-colors">
          <SlidersHorizontal size={14} />
          动画
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Transform Section */}
        <div className="space-y-4">
          <h3 className="text-[12px] font-bold text-[#171719] tracking-wider uppercase">基础变形</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#171719]/60">缩放 (Scale)</span>
              <div className="flex items-center gap-2">
                <input type="range" className="w-20 accent-[#171719]" defaultValue={100} />
                <input type="text" className="w-12 rounded border border-[#E5E7EB] px-1.5 py-1 text-right text-[12px] text-[#171719] outline-none focus:border-[#488DF0]" defaultValue="100%" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#171719]/60">不透明度</span>
              <div className="flex items-center gap-2">
                <input type="range" className="w-20 accent-[#171719]" defaultValue={100} />
                <input type="text" className="w-12 rounded border border-[#E5E7EB] px-1.5 py-1 text-right text-[12px] text-[#171719] outline-none focus:border-[#488DF0]" defaultValue="100%" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="space-y-1.5">
                <span className="text-[11px] text-[#171719]/40">X 坐标</span>
                <input type="text" className="w-full rounded border border-[#E5E7EB] px-2 py-1.5 text-[12px] text-[#171719] outline-none focus:border-[#488DF0]" defaultValue="0.0" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] text-[#171719]/40">Y 坐标</span>
                <input type="text" className="w-full rounded border border-[#E5E7EB] px-2 py-1.5 text-[12px] text-[#171719] outline-none focus:border-[#488DF0]" defaultValue="0.0" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <span className="text-[11px] text-[#171719]/40">旋转</span>
                <input type="text" className="w-full rounded border border-[#E5E7EB] px-2 py-1.5 text-[12px] text-[#171719] outline-none focus:border-[#488DF0]" defaultValue="0°" />
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-[#E5E7EB] w-full" />

        {/* Blending Section */}
        <div className="space-y-4">
          <h3 className="text-[12px] font-bold text-[#171719] tracking-wider uppercase">混合模式</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#171719]/60">模式</span>
              <select className="rounded border border-[#E5E7EB] px-2 py-1 text-[12px] text-[#171719] outline-none focus:border-[#488DF0] bg-white w-28">
                <option>正常 (Normal)</option>
                <option>正片叠底 (Multiply)</option>
                <option>滤色 (Screen)</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="h-px bg-[#E5E7EB] w-full" />
        
        {/* Advanced Video */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[12px] font-bold text-[#171719] tracking-wider uppercase">背景模糊</h3>
            <div className="relative inline-block w-8 h-4 rounded-full bg-[#171719] cursor-pointer">
               <div className="absolute right-0.5 top-0.5 w-3 h-3 rounded-full bg-white transition-transform" />
            </div>
          </div>
          
          <div className="space-y-3">
             <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#171719]/60">模糊强度</span>
              <input type="range" className="w-24 accent-[#171719]" defaultValue={40} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
