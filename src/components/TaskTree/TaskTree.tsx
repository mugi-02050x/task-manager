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
    <>
      <div className="flex justify-end">
        <button onClick={() => openCreateModal(null)}>タスクを追加</button>
      </div>
      <div>
        <ul>
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
      </div>
      {isModalOpen && (
        <TaskFormModal
          mode={modalMode}
          initialValue={initialValue}
          onSubmit={submitTaskForm}
          onClose={closeModal}
        />
      )}
    </>
  );
};

export default TaskTree;
