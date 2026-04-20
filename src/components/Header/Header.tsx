import { useRef } from "react";
import { useTaskManager } from "../../hooks/useTaskManager";

const Header = () => {
  const taskManager = useTaskManager();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        taskManager.importState(json);
      } catch {
        alert(
          "ファイルの読み込みに失敗しました。正しいファイルを選択してください。",
        );
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 md:px-6">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">
            Task Manager
          </h1>
        </div>
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImport}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Import
          </button>
          <button
            onClick={taskManager.exportState}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700"
          >
            Export
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
