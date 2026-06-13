import React from "react";

const priorityStyles = {
  high: "bg-red-50 text-red-600 border border-red-200",
  medium: "bg-amber-50 text-amber-600 border border-amber-200",
  low: "bg-green-50 text-green-600 border border-green-200",
};

const categoryStyles = {
  bug: "bg-red-50 text-red-500 border border-red-200",
  feature: "bg-blue-50 text-blue-600 border border-blue-200",
  enhancement: "bg-orange-50 text-orange-500 border border-orange-200",
};

export default function TaskCard({ task, onEdit, onDelete, onDragStart, onDragEnd }) {
  return (
    <div
      className="bg-white border border-gray-200 rounded-xl p-3 cursor-grab group transition-all hover:border-gray-300 hover:shadow-sm hover:-translate-y-px active:cursor-grabbing"
      draggable
      onDragStart={() => onDragStart(task.id)}
      onDragEnd={onDragEnd}
      data-testid={`task-card-${task.id}`}
      data-task-id={task.id}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-[13px] font-medium text-gray-800 leading-snug break-words flex-1">
          {task.title}
        </p>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 text-xs transition-all"
            aria-label="Edit task"
            data-testid={`edit-task-${task.id}`}
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 text-xs transition-all"
            aria-label="Delete task"
            data-testid={`delete-task-${task.id}`}
          >
            🗑
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-gray-400 mb-2 leading-snug break-words line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${priorityStyles[task.priority] || priorityStyles.medium}`}>
          {task.priority}
        </span>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${categoryStyles[task.category] || categoryStyles.feature}`}>
          {task.category}
        </span>
      </div>

      {task.attachments?.length > 0 && (
        <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden" data-testid={`attachment-${task.id}`}>
          {task.attachments[0].type?.startsWith("image/") ? (
            <img src={task.attachments[0].url} alt="attachment" className="w-full max-h-24 object-cover" />
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 text-xs text-gray-400">
              <span>📎</span>
              <span className="truncate">{task.attachments[0].name}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
