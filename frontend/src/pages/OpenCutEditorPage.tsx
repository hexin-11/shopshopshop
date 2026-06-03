const goBack = () => {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  window.location.href = "/projects";
};

export default function Editor() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-white">
      <button
        type="button"
        onClick={goBack}
        className="fixed left-4 top-4 z-[2147483647] inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 text-sm font-semibold text-slate-700 shadow-[0_10px_28px_rgba(15,23,42,0.16)] backdrop-blur transition hover:border-cyan-300 hover:text-cyan-700"
      >
        <span aria-hidden="true">←</span>
        返回
      </button>
      <iframe
        src="/twick-studio/index.html"
        title="Twick 剪辑工作室"
        className="h-full w-full border-0"
        allow="cross-origin-isolated; fullscreen; clipboard-read; clipboard-write"
      />
    </div>
  );
}
