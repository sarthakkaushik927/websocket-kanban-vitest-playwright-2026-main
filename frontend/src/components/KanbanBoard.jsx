import React, { useState } from "react";
import { useSocket } from "../hooks/useSocket";
import { useToast } from "../hooks/useToast";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import ProgressChart from "./ProgressChart";

const COLUMNS = [
  { id: "todo", label: "To Do", dot: "bg-blue-400", chip: "bg-blue-50 text-blue-600 border border-blue-200" },
  { id: "inprogress", label: "In Progress", dot: "bg-amber-400", chip: "bg-amber-50 text-amber-600 border border-amber-200" },
  { id: "done", label: "Done", dot: "bg-green-500", chip: "bg-green-50 text-green-600 border border-green-200" },
];

let draggedId = null;

export default function KanbanBoard() {
  const { connected, tasks, loading, createTask, updateTask, moveTask, deleteTask } = useSocket();
  const { toasts, addToast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [modalColumn, setModalColumn] = useState("todo");
  const [overColumn, setOverColumn] = useState(null);

  function openNew(column) {
    setEditingTask(null);
    setModalColumn(column || "todo");
    setShowModal(true);
  }

  function openEdit(task) {
    setEditingTask(task);
    setModalColumn(task.column);
    setShowModal(true);
  }

  function handleSubmit(data) {
    if (editingTask) {
      updateTask({ ...editingTask, ...data });
      addToast("Task updated", "success");
    } else {
      createTask(data);
      addToast("Task created", "success");
    }
    setShowModal(false);
  }

  function handleDelete(taskId) {
    deleteTask(taskId);
    addToast("Task deleted", "info");
  }

  function handleDrop(columnId) {
    if (!draggedId) return;
    const task = tasks.find((t) => t.id === draggedId);
    if (task && task.column !== columnId) {
      moveTask(draggedId, columnId);
      const col = COLUMNS.find((c) => c.id === columnId);
      addToast(`Moved to ${col?.label}`, "info");
    }
    draggedId = null;
    setOverColumn(null);
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 gap-3">
        <div className="w-7 h-7 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin-fast" />
        <p className="text-sm text-gray-400">Connecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" data-testid="kanban-board">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="5" width="4" height="9" rx="1" fill="white" fillOpacity="0.85"/>
              <rect x="6" y="2" width="4" height="12" rx="1" fill="white"/>
              <rect x="11" y="7" width="4" height="7" rx="1" fill="white" fillOpacity="0.65"/>
            </svg>
          </div>
          <span className="text-[15px] font-semibold text-gray-900 tracking-tight">KanbanFlow</span>
        </div>

        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200"
            data-testid="connection-status"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-500 animate-blink" : "bg-red-400"}`} />
            {connected ? "Live" : "Offline"}
          </div>
          <button
            onClick={() => openNew("todo")}
            className="px-3.5 py-1.5 text-[13px] font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            data-testid="add-task-btn"
          >
            + New task
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 py-5 flex flex-col gap-5">
        <ProgressChart tasks={tasks} />

        <div className="flex items-center gap-2">
          {COLUMNS.map((col) => (
            <span key={col.id} className={`text-xs font-medium px-2.5 py-1 rounded-full ${col.chip}`}>
              {col.label}: {tasks.filter((t) => t.column === col.id).length}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 flex-1" data-testid="board-columns">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.column === col.id);
            const isOver = overColumn === col.id;

            return (
              <div
                key={col.id}
                className={`bg-white border rounded-2xl flex flex-col min-h-96 transition-all ${
                  isOver ? "border-indigo-400 bg-indigo-50/40 shadow-sm" : "border-gray-200"
                }`}
                onDragOver={(e) => { e.preventDefault(); setOverColumn(col.id); }}
                onDrop={() => handleDrop(col.id)}
                onDragLeave={() => setOverColumn(null)}
                data-testid={`column-${col.id}`}
                data-column={col.id}
              >
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span className="text-[13px] font-semibold text-gray-800">{col.label}</span>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    {colTasks.length}
                  </span>
                </div>

                <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto scrollbar-thin">
                  {colTasks.length === 0 && !isOver && (
                    <div className="flex flex-col items-center justify-center gap-1.5 py-10 text-gray-300">
                      <span className="text-2xl">📋</span>
                      <span className="text-xs">No tasks</span>
                    </div>
                  )}

                  {colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      onDragStart={() => { draggedId = task.id; }}
                      onDragEnd={() => { draggedId = null; setOverColumn(null); }}
                    />
                  ))}

                  {isOver && (
                    <div className="border-2 border-dashed border-indigo-300 rounded-xl h-14 flex items-center justify-center text-xs text-indigo-400">
                      Drop here
                    </div>
                  )}
                </div>

                <div className="p-3 border-t border-gray-100">
                  <button
                    onClick={() => openNew(col.id)}
                    className="w-full py-2 text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                    data-testid={`add-task-${col.id}`}
                  >
                    + Add task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {showModal && (
        <TaskModal
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          initialData={editingTask}
          defaultColumn={modalColumn}
        />
      )}

      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] text-gray-700 bg-white border shadow-lg animate-toast-in max-w-xs ${
              toast.type === "success" ? "border-l-2 border-l-green-500 border-gray-200"
              : toast.type === "error" ? "border-l-2 border-l-red-400 border-gray-200"
              : "border-l-2 border-l-indigo-400 border-gray-200"
            }`}
          >
            {toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "ℹ️"}
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
