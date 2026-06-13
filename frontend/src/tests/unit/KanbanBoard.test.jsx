import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import KanbanBoard from "../../components/KanbanBoard";

vi.mock("../../hooks/useSocket", () => ({
  useSocket: () => ({
    connected: true,
    tasks: [
      {
        id: "task-1",
        title: "Fix login bug",
        description: "Users get logged out randomly",
        column: "todo",
        priority: "high",
        category: "bug",
        attachments: [],
      },
      {
        id: "task-2",
        title: "Add dark mode",
        description: "",
        column: "inprogress",
        priority: "medium",
        category: "feature",
        attachments: [],
      },
      {
        id: "task-3",
        title: "Write docs",
        description: "Document the API endpoints",
        column: "done",
        priority: "low",
        category: "enhancement",
        attachments: [],
      },
    ],
    loading: false,
    createTask: vi.fn(),
    updateTask: vi.fn(),
    moveTask: vi.fn(),
    deleteTask: vi.fn(),
  }),
}));

describe("KanbanBoard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the board header", () => {
    render(<KanbanBoard />);
    expect(screen.getByText("KanbanFlow")).toBeInTheDocument();
  });

  it("shows all three columns", () => {
    render(<KanbanBoard />);
    expect(screen.getByTestId("column-todo")).toBeInTheDocument();
    expect(screen.getByTestId("column-inprogress")).toBeInTheDocument();
    expect(screen.getByTestId("column-done")).toBeInTheDocument();
  });

  it("renders tasks in correct columns", () => {
    render(<KanbanBoard />);
    expect(screen.getByText("Fix login bug")).toBeInTheDocument();
    expect(screen.getByText("Add dark mode")).toBeInTheDocument();
    expect(screen.getByText("Write docs")).toBeInTheDocument();
  });

  it("shows connected status when socket is connected", () => {
    render(<KanbanBoard />);
    expect(screen.getByTestId("connection-status")).toHaveTextContent("Live");
  });

  it("opens create modal when new task button is clicked", async () => {
    render(<KanbanBoard />);
    fireEvent.click(screen.getByTestId("add-task-btn"));
    await waitFor(() => {
      expect(screen.getByText("New task")).toBeInTheDocument();
    });
  });

  it("opens create modal from column add button", async () => {
    render(<KanbanBoard />);
    fireEvent.click(screen.getByTestId("add-task-todo"));
    await waitFor(() => {
      expect(screen.getByTestId("modal-backdrop")).toBeInTheDocument();
    });
  });

  it("closes modal when cancel is clicked", async () => {
    render(<KanbanBoard />);
    fireEvent.click(screen.getByTestId("add-task-btn"));
    await waitFor(() => expect(screen.getByTestId("modal-backdrop")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Cancel"));
    await waitFor(() => {
      expect(screen.queryByTestId("modal-backdrop")).not.toBeInTheDocument();
    });
  });

  it("renders progress chart", () => {
    render(<KanbanBoard />);
    expect(screen.getByTestId("progress-chart")).toBeInTheDocument();
  });

  it("shows correct task count per column", () => {
    render(<KanbanBoard />);
    expect(screen.getByTestId("count-todo")).toHaveTextContent("1");
    expect(screen.getByTestId("count-inprogress")).toHaveTextContent("1");
    expect(screen.getByTestId("count-done")).toHaveTextContent("1");
  });
});
