import { useState, useEffect } from "react";
import { Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EditProductDialogProps {
  initialData: {
    name: string;
    brand: string;
    category: string;
    details?: string;
  };
  onSave: (data: { name: string; brand: string; category: string; details: string }) => void;
}

export function EditProductDialog({ initialData, onSave }: EditProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData.name,
    brand: initialData.brand,
    category: initialData.category,
    details: initialData.details || `这是 ${initialData.name} 的内部参考详情。包含了基础尺寸、适用人群、主要卖点等信息，供 AI 脚本生成器参考。`,
  });

  // Sync state if initialData changes externally
  useEffect(() => {
    setFormData({
      name: initialData.name,
      brand: initialData.brand,
      category: initialData.category,
      details: initialData.details || `这是 ${initialData.name} 的内部参考详情。包含了基础尺寸、适用人群、主要卖点等信息，供 AI 脚本生成器参考。`,
    });
  }, [initialData]);

  const handleSave = () => {
    onSave(formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-500 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors">
          <Edit2 size={12} /> 编辑信息
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="border-b border-neutral-100 pb-4">
          <DialogTitle>编辑商品信息</DialogTitle>
        </DialogHeader>
        <div className="grid gap-5 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right text-sm font-bold text-neutral-700">
              商品名称
            </label>
            <input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="col-span-3 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="brand" className="text-right text-sm font-bold text-neutral-700">
              所属品牌
            </label>
            <input
              id="brand"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="col-span-3 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="category" className="text-right text-sm font-bold text-neutral-700">
              主营品类
            </label>
            <input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="col-span-3 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <label htmlFor="details" className="text-right text-sm font-bold text-neutral-700 pt-2">
              商品详情
            </label>
            <textarea
              id="details"
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              rows={4}
              className="col-span-3 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
              placeholder="请输入包含基础尺寸、适用人群、主要卖点等内部参考信息..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-2 border-t border-neutral-100 pt-4">
          <button onClick={() => setOpen(false)} className="btn-ghost px-5">取消</button>
          <button onClick={handleSave} className="btn-primary px-5">保存修改</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
