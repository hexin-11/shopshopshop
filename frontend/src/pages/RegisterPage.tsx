import { Film } from "lucide-react";

export default function RegisterPage({ navigate }: { navigate: (r: "login" | "dashboard") => void }) {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <button onClick={() => navigate("login")} className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white"><Film size={20} /></div>
          <span className="text-lg font-bold text-slate-900">ShopClip AI</span>
        </button>
        <div className="grid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft lg:grid-cols-[0.85fr_1.15fr]">
          <div className="bg-slate-900 p-10 text-white">
            <h1 className="text-3xl font-semibold">创建视频创作团队</h1>
            <p className="mt-4 text-slate-300">统一管理商品素材、脚本版本、剪辑任务和团队协作，让短视频生产流程更清楚。</p>
          </div>
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-slate-900">创建账号</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label><span className="label">用户名</span><input className="input mt-1" placeholder="请输入用户名" /></label>
              <label><span className="label">邮箱</span><input className="input mt-1" placeholder="name@company.com" /></label>
              <label><span className="label">密码</span><input className="input mt-1" type="password" /></label>
              <label><span className="label">确认密码</span><input className="input mt-1" type="password" /></label>
              <label className="md:col-span-2"><span className="label">公司 / 店铺名称</span><input className="input mt-1" placeholder="例如：Havit Official Store" /></label>
              <label className="md:col-span-2"><span className="label">角色选择</span><select className="input mt-1"><option>商家</option><option>运营</option><option>设计师</option><option>开发者</option></select></label>
            </div>
            <div className="mt-6 space-y-3">
              <button onClick={() => navigate("dashboard")} className="btn-primary w-full">创建账号</button>
              <button className="btn-secondary w-full">使用 Google 注册</button>
              <button onClick={() => navigate("login")} className="w-full text-sm text-slate-600">已有账号，<span className="font-medium text-brand-600">去登录</span></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
