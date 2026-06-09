import { FormEvent, useState } from "react";
import { Lock, Mail, Sparkles } from "lucide-react";

interface LoginPageProps {
  navigate: (r: "dashboard") => void;
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("hexin@tikframe.ai");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-[#F7FAFF] text-[#171719]">
      <div className="grid min-h-screen lg:grid-cols-[1.04fr_0.96fr]">
        <section className="relative hidden overflow-hidden bg-[#EAF4FF] p-12 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(70,132,238,0.26),transparent_32%),radial-gradient(circle_at_80%_70%,rgba(22,163,184,0.20),transparent_30%)]" />
          <div className="relative flex items-center gap-3">
            <img src="/logo.png" className="h-12 w-12 rounded-xl object-cover shadow-[0_18px_40px_rgba(70,132,238,0.25)]" alt="Logo" />
            <div>
              <div className="text-xl font-black tracking-tight">TikFrame AI</div>
              <div className="text-sm font-medium text-[#171719]/55">电商短视频创作工作台</div>
            </div>
          </div>

          <div className="relative max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-semibold text-[#2660C9] shadow-sm">
              <Sparkles size={16} />
              脚本、素材、剪辑和 Agent 协作都在这里
            </div>
            <h1 className="text-[48px] font-black leading-[1.08] tracking-tight text-[#171719]">
              登录后继续管理你的商品视频项目
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-[#171719]/62">
              为 TikTok Shop、Instagram Reels、YouTube Shorts 准备可发布的带货短视频，从素材到导出保持一个完整流程。
            </p>
          </div>

          <div className="relative grid grid-cols-3 gap-3">
            {["脚本生成", "协作剪辑", "多平台导出"].map((item) => (
              <div key={item} className="rounded-xl border border-white/80 bg-white/72 px-4 py-3 text-sm font-bold text-[#171719]/70 shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[440px]">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <img src="/logo.png" className="h-11 w-11 rounded-xl object-cover" alt="Logo" />
              <div className="text-xl font-black tracking-tight">TikFrame AI</div>
            </div>

            <div className="rounded-[28px] border border-[#DDE8F5] bg-white p-8 shadow-[0_30px_90px_rgba(15,23,42,0.08)]">
              <h2 className="text-[30px] font-black tracking-tight text-[#171719]">欢迎回来</h2>
              <p className="mt-2 text-[15px] text-[#171719]/56">登录后进入完整前端工作台。</p>

              <form className="mt-8 space-y-5" onSubmit={submit}>
                <label className="block">
                  <span className="label">账户</span>
                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#DDE8F5] bg-[#F8FBFF] px-4 py-3 focus-within:border-[#4684EE]">
                    <Mail size={18} className="text-[#171719]/40" />
                    <input
                      autoComplete="email"
                      className="w-full bg-transparent text-[15px] font-medium outline-none placeholder:text-[#171719]/35"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="name@company.com"
                      type="email"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="label">密码</span>
                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#DDE8F5] bg-[#F8FBFF] px-4 py-3 focus-within:border-[#4684EE]">
                    <Lock size={18} className="text-[#171719]/40" />
                    <input
                      autoComplete="current-password"
                      className="w-full bg-transparent text-[15px] font-medium outline-none placeholder:text-[#171719]/35"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="请输入密码"
                      type="password"
                    />
                  </div>
                </label>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 font-medium text-[#171719]/62">
                    <input
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                      className="rounded border-[#DDE8F5]"
                      type="checkbox"
                    />
                    记住我
                  </label>
                  <button type="button" className="font-semibold text-[#4684EE]">
                    忘记密码
                  </button>
                </div>

                <button className="btn-primary w-full rounded-xl py-3.5 text-[16px]" type="submit">
                  登录
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
