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
    <header className="flex items-center justify-between px-4 py-2">
      <span>TaskManager</span>
      <div className="flex gap-2">
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImport}
        />
        <button onClick={() => fileInputRef.current?.click()}>Import</button>
        <button onClick={taskManager.exportState}>Export</button>
      </div>
    </header>
  );
};

export default Header;
