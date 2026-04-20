import { useRef } from "react";
import { useTaskManager } from "../../hooks/useTaskManager";
import { handleAppError } from "../../utils/error";

const Header = () => {
  const taskManager = useTaskManager();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const shouldImport = window.confirm(
      "インポートすると現在のデータは上書きされます。続行しますか？",
    );
    if (!shouldImport) {
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        taskManager.importState(json);
      } catch (error: unknown) {
        handleAppError(
          error,
          "ファイルの読み込みに失敗しました。正しいファイルを選択してください。",
        );
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleClearState = () => {
    const shouldClear = window.confirm(
      "保存済みデータを削除して初期状態に戻します。よろしいですか？",
    );
    if (!shouldClear) return;
    taskManager.clearState();
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
            onClick={handleClearState}
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 shadow-sm transition hover:bg-rose-100"
          >
            Clear
          </button>
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
