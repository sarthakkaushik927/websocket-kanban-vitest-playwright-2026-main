import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import TaskModal from "../../components/TaskModal";

describe("TaskModal", () => {
  const onClose = vi.fn();
  const onSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the create form by default", () => {
    render(<TaskModal onClose={onClose} onSubmit={onSubmit} defaultColumn="todo" />);
    expect(screen.getByText("New task")).toBeInTheDocument();
    expect(screen.getByTestId("task-title-input")).toBeInTheDocument();
  });

  it("renders edit form when initialData is provided", () => {
    const task = {
      id: "t1",
      title: "Existing task",
      description: "Some desc",
      column: "todo",
      priority: "high",
      category: "bug",
      attachments: [],
    };
    render(<TaskModal onClose={onClose} onSubmit={onSubmit} initialData={task} defaultColumn="todo" />);
    expect(screen.getByText("Edit task")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Existing task")).toBeInTheDocument();
  });

  it("calls onClose when cancel is clicked", () => {
    render(<TaskModal onClose={onClose} onSubmit={onSubmit} defaultColumn="todo" />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not submit if title is empty", () => {
    render(<TaskModal onClose={onClose} onSubmit={onSubmit} defaultColumn="todo" />);
    fireEvent.click(screen.getByTestId("modal-submit-btn"));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits with correct data when title is filled", async () => {
    render(<TaskModal onClose={onClose} onSubmit={onSubmit} defaultColumn="todo" />);
    fireEvent.change(screen.getByTestId("task-title-input"), { target: { value: "New bug fix" } });
    fireEvent.change(screen.getByTestId("task-priority-select"), { target: { value: "high" } });
    fireEvent.change(screen.getByTestId("task-category-select"), { target: { value: "bug" } });
    fireEvent.click(screen.getByTestId("modal-submit-btn"));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New bug fix",
          priority: "high",
          category: "bug",
        })
      );
    });
  });

  it("shows file error for unsupported file type", async () => {
    render(<TaskModal onClose={onClose} onSubmit={onSubmit} defaultColumn="todo" />);
    const input = screen.getByTestId("file-input");
    const file = new File(["content"], "test.exe", { type: "application/octet-stream" });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByTestId("file-error")).toBeInTheDocument();
    });
  });
});
