import { useTaskFormModal } from "../../hooks/useTaskFormModal";
import TaskFormModal from "../TaskFormModal/TaskFormModal";
import TaskNode from "./TaskNode";

const TaskTree = () => {
  const {
    taskRoots,
    isModalOpen,
    modalMode,
    initialValue,
    openCreateModal,
    openEditModal,
    closeModal,
    submitTaskForm,
  } = useTaskFormModal();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900 md:text-lg">
            タスク一覧
          </h2>
        </div>
        <button
          onClick={() => openCreateModal(null)}
          className="shrink-0 whitespace-nowrap rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500"
        >
          + タスクを追加
        </button>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-2 md:p-4">
        {taskRoots.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
            タスクがまだありません。右上の「タスクを追加」から作成してください。
          </p>
        ) : (
          <ul className="space-y-2">
            {taskRoots.map((rootTask) => (
              <li key={rootTask.id}>
                <TaskNode
                  id={rootTask.id}
                  onEditTask={openEditModal}
                  onAddChildTask={openCreateModal}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
      {isModalOpen && (
        <TaskFormModal
          mode={modalMode}
          initialValue={initialValue}
          onSubmit={submitTaskForm}
          onClose={closeModal}
        />
      )}
    </section>
  );
};

export default TaskTree;
