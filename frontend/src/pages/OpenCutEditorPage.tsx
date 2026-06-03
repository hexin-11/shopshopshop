export default function Editor() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-white">
      <iframe
        src="/twick-studio/index.html"
        title="Twick 剪辑工作室"
        className="h-full w-full border-0"
        allow="cross-origin-isolated; fullscreen; clipboard-read; clipboard-write"
      />
    </div>
  );
}
