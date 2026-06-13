import React from "react";

const COLUMNS = [
  { id: "todo", label: "To Do" },
  { id: "inprogress", label: "In Progress" },
  { id: "done", label: "Done" },
];

const barColors = {
  todo: "bg-blue-400",
  inprogress: "bg-amber-400",
  done: "bg-green-500",
};

export default function ProgressChart({ tasks }) {
  const total = tasks.length;

  const counts = {
    todo: tasks.filter((t) => t.column === "todo").length,
    inprogress: tasks.filter((t) => t.column === "inprogress").length,
    done: tasks.filter((t) => t.column === "done").length,
  };

  const donePercent = total > 0 ? Math.round((counts.done / total) * 100) : 0;
  const maxCount = Math.max(...Object.values(counts), 1);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4" data-testid="progress-chart">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-semibold text-gray-800">Progress Overview</h3>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>Total: <strong className="text-gray-700">{total}</strong></span>
          <span>Done: <strong className="text-green-600">{donePercent}%</strong></span>
        </div>
      </div>

      <div className="flex items-end gap-3 h-20 mb-4" data-testid="bar-chart">
        {COLUMNS.map((col) => {
          const count = counts[col.id];
          const heightPct = (count / maxCount) * 100;
          return (
            <div key={col.id} className="flex flex-col items-center gap-1.5 flex-1">
              <span className="text-xs font-semibold text-gray-700" data-testid={`count-${col.id}`}>
                {count}
              </span>
              <div className="w-full bg-gray-100 border border-gray-200 rounded h-14 flex items-end overflow-hidden">
                <div
                  className={`w-full rounded transition-all duration-500 ease-out ${barColors[col.id]}`}
                  style={{ height: `${Math.max(heightPct, count > 0 ? 8 : 0)}%` }}
                  data-testid={`bar-${col.id}`}
                />
              </div>
              <span className="text-[10px] text-gray-400 whitespace-nowrap">{col.label}</span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Completion rate</span>
          <span className="text-green-600 font-semibold">{donePercent}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${donePercent}%` }}
            data-testid="completion-bar"
          />
        </div>
      </div>
    </div>
  );
}
