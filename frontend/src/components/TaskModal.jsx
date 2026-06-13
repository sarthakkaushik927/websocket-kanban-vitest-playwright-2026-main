import React, { useState, useRef } from "react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];

export default function TaskModal({ onClose, onSubmit, initialData, defaultColumn }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [column, setColumn] = useState(initialData?.column || defaultColumn || "todo");
  const [priority, setPriority] = useState(initialData?.priority || "medium");
  const [category, setCategory] = useState(initialData?.category || "feature");
  const [attachment, setAttachment] = useState(initialData?.attachments?.[0] || null);
  const [fileError, setFileError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const isEditing = !!initialData;

  function handleFile(file) {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError("Only images (JPG, PNG, GIF, WEBP) and PDFs are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File must be under 5MB.");
      return;
    }
    setFileError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      setAttachment({ name: file.name, type: file.type, url: e.target.result });
    };
    reader.readAsDataURL(file);
  }

  function handleFileDrop(e) {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files[0]);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      ...(initialData || {}),
      title: title.trim(),
      description: description.trim(),
      column,
      priority,
      category,
      attachments: attachment ? [attachment] : [],
    });
    onClose();
  }

  const inputClass = "bg-white border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 placeholder-gray-300 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all w-full";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-testid="modal-backdrop"
    >
      <div className="w-full max-w-[460px] bg-white border border-gray-200 rounded-2xl shadow-xl animate-slide-up overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-semibold text-gray-900">
            {isEditing ? "Edit task" : "New task"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-lg transition-all text-sm"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-5 py-4 flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500">Title <span className="text-red-400">*</span></label>
              <input
                id="task-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className={inputClass}
                autoFocus
                required
                data-testid="task-title-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500">Description</label>
              <textarea
                id="task-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add some details..."
                rows={3}
                className={`${inputClass} resize-none`}
                data-testid="task-description-input"
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: "Column", value: column, onChange: setColumn, testId: "task-column-select", options: [["todo", "To Do"], ["inprogress", "In Progress"], ["done", "Done"]] },
                { label: "Priority", value: priority, onChange: setPriority, testId: "task-priority-select", options: [["low", "Low"], ["medium", "Medium"], ["high", "High"]] },
                { label: "Category", value: category, onChange: setCategory, testId: "task-category-select", options: [["feature", "Feature"], ["bug", "Bug"], ["enhancement", "Enhancement"]] },
              ].map(({ label, value, onChange, testId, options }) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500">{label}</label>
                  <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-xs text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
                    data-testid={testId}
                  >
                    {options.map(([val, lbl]) => (
                      <option key={val} value={val}>{lbl}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500">Attachment</label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                  dragActive ? "border-indigo-400 bg-indigo-50" : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                data-testid="file-drop-zone"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                  data-testid="file-input"
                />
                <p className="text-xs text-gray-400">
                  <span className="text-indigo-500 font-medium">Click to upload</span> or drag & drop
                </p>
                <p className="text-[11px] text-gray-300 mt-0.5">Images, PDF — max 5MB</p>
              </div>

              {fileError && (
                <p className="text-xs text-red-500" data-testid="file-error">{fileError}</p>
              )}

              {attachment && (
                <div className="border border-gray-200 rounded-lg overflow-hidden" data-testid="file-preview">
                  {attachment.type?.startsWith("image/") && (
                    <img src={attachment.url} alt="preview" className="w-full max-h-28 object-cover" />
                  )}
                  <div className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 text-xs text-gray-400">
                    <span>📎</span>
                    <span className="truncate">{attachment.name}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setAttachment(null); }}
                      className="ml-auto text-gray-300 hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 px-5 pb-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-[13px] font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
              data-testid="modal-submit-btn"
            >
              {isEditing ? "Save changes" : "Add task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
