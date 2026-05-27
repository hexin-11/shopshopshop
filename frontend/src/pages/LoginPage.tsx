import { Film } from "lucide-react";

export default function LoginPage({ navigate }: { navigate: (r: "dashboard" | "register") => void }) {
  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-slate-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-600"><Film /></div>
          <div><div className="text-xl font-bold">ShopClip AI</div><div className="text-sm text-slate-300">电商短视频生成系统</div></div>
        </div>
        <div className="max-w-lg">
          <h1 className="text-4xl font-semibold leading-tight">从商品素材到带货短视频，一站式完成脚本、分镜、剪辑和导出。</h1>
          <p className="mt-5 text-slate-300">为 TikTok Shop、Instagram Reels、YouTube Shorts 等平台准备可发布的视频内容。</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm text-slate-300">
          <span>脚本生成</span><span>协作剪辑</span><span>多平台导出</span>
        </div>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-semibold text-slate-900">登录 ShopClip AI</h2>
          <p className="mt-2 text-slate-500">继续管理你的商品视频项目</p>
          <div className="mt-8 space-y-4">
            <label className="block"><span className="label">邮箱</span><input className="input mt-1" placeholder="name@company.com" /></label>
            <label className="block"><span className="label">密码</span><input className="input mt-1" type="password" placeholder="请输入密码" /></label>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600"><input type="checkbox" className="rounded" />记住我</label>
              <button className="text-brand-600">忘记密码</button>
            </div>
            <button onClick={() => navigate("dashboard")} className="btn-primary w-full">登录</button>
            <button className="btn-secondary w-full">使用 Google 登录</button>
            <button onClick={() => navigate("register")} className="w-full text-sm text-slate-600">还没有账号？<span className="font-medium text-brand-600"> 前往注册</span></button>
          </div>
        </div>
      </section>
    </div>
  );
}
