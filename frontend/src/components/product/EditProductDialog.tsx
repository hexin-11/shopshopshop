import { useEffect, useState } from "react";
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

const buildDefaultDetails = (name: string) =>
  `这是 ${name} 的内部参考信息。可以补充基础尺寸、适用人群、核心卖点、使用场景、禁用表达和生成脚本时需要注意的素材要求。`;

export function EditProductDialog({ initialData, onSave }: EditProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData.name,
    brand: initialData.brand,
    category: initialData.category,
    details: initialData.details || buildDefaultDetails(initialData.name),
  });

  useEffect(() => {
    setFormData({
      name: initialData.name,
      brand: initialData.brand,
      category: initialData.category,
      details: initialData.details || buildDefaultDetails(initialData.name),
    });
  }, [initialData]);

  const handleSave = () => {
    onSave(formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-md bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-600 transition-colors hover:bg-neutral-200">
          <Edit2 size={12} />
          编辑信息
        </button>
      </DialogTrigger>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[760px]">
        <DialogHeader className="border-b border-neutral-100 px-7 py-6">
          <DialogTitle className="text-xl font-black text-neutral-900">编辑商品信息</DialogTitle>
          <p className="mt-2 text-sm text-neutral-500">
            这些资料会作为 Agent 生成脚本、分镜和视频提示词时的商品依据。
          </p>
        </DialogHeader>

        <div className="grid gap-6 px-7 py-6">
          <section className="rounded-2xl border border-neutral-100 bg-neutral-50/70 p-5">
            <h3 className="text-sm font-black text-neutral-800">基础信息</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="grid gap-2 text-sm font-bold text-neutral-700">
                商品名称
                <input
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium outline-none transition-colors focus:border-blue-400"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-neutral-700">
                品牌
                <input
                  value={formData.brand}
                  onChange={(event) => setFormData({ ...formData, brand: event.target.value })}
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium outline-none transition-colors focus:border-blue-400"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-neutral-700">
                品类
                <input
                  value={formData.category}
                  onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium outline-none transition-colors focus:border-blue-400"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-100 bg-white p-5">
            <h3 className="text-sm font-black text-neutral-800">商品资料</h3>
            <p className="mt-1 text-xs font-medium text-neutral-400">
              建议填写卖点、适用人群、使用场景、素材限制和口播注意事项。
            </p>
            <textarea
              value={formData.details}
              onChange={(event) => setFormData({ ...formData, details: event.target.value })}
              rows={7}
              className="mt-4 w-full resize-none rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-7 text-neutral-700 outline-none transition-colors focus:border-blue-400 focus:bg-white"
              placeholder="请输入商品卖点、适用人群、使用场景、素材限制等信息"
            />
          </section>
        </div>

        <div className="flex justify-end gap-3 border-t border-neutral-100 px-7 py-5">
          <button type="button" onClick={() => setOpen(false)} className="btn-ghost px-5">
            取消
          </button>
          <button type="button" onClick={handleSave} className="btn-primary px-5">
            保存修改
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
