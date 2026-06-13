import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import KanbanBoard from "../../components/KanbanBoard";

const mockSocket = {
  on: vi.fn(),
  emit: vi.fn(),
  off: vi.fn(),
  disconnect: vi.fn(),
  connected: true,
};

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => mockSocket),
}));

function getSocketHandler(event) {
  const calls = mockSocket.on.mock.calls;
  const match = calls.find(([e]) => e === event);
  return match ? match[1] : null;
}

describe("WebSocket integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket.on.mockImplementation((event, cb) => {
      if (event === "connect") setTimeout(() => cb(), 0);
      if (event === "sync:tasks") {
        setTimeout(() => {
          cb([
            {
              id: "t1",
              title: "Initial task",
              description: "",
              column: "todo",
              priority: "medium",
              category: "feature",
              attachments: [],
            },
          ]);
        }, 0);
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders tasks received from sync:tasks event", async () => {
    render(<KanbanBoard />);
    await waitFor(() => {
      expect(screen.getByText("Initial task")).toBeInTheDocument();
    });
  });

  it("emits task:create when a task is submitted", async () => {
    render(<KanbanBoard />);
    await waitFor(() => screen.getByTestId("add-task-btn"));

    fireEvent.click(screen.getByTestId("add-task-btn"));
    await waitFor(() => screen.getByTestId("task-title-input"));

    fireEvent.change(screen.getByTestId("task-title-input"), {
      target: { value: "New WS task" },
    });
    fireEvent.click(screen.getByTestId("modal-submit-btn"));

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith(
        "task:create",
        expect.objectContaining({ title: "New WS task" })
      );
    });
  });

  it("updates task list when task:created event fires", async () => {
    render(<KanbanBoard />);
    await waitFor(() => screen.getByText("Initial task"));

    const createdHandler = getSocketHandler("task:created");
    expect(createdHandler).not.toBeNull();

    act(() => {
      createdHandler({
        id: "t2",
        title: "Created via socket",
        description: "",
        column: "inprogress",
        priority: "low",
        category: "feature",
        attachments: [],
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Created via socket")).toBeInTheDocument();
    });
  });

  it("removes task when task:deleted event fires", async () => {
    render(<KanbanBoard />);
    await waitFor(() => screen.getByText("Initial task"));

    const deletedHandler = getSocketHandler("task:deleted");
    act(() => {
      deletedHandler("t1");
    });

    await waitFor(() => {
      expect(screen.queryByText("Initial task")).not.toBeInTheDocument();
    });
  });

  it("moves task when task:moved event fires", async () => {
    render(<KanbanBoard />);
    await waitFor(() => screen.getByText("Initial task"));

    const todoColumn = screen.getByTestId("column-todo");
    expect(todoColumn).toContainElement(screen.getByText("Initial task"));

    const movedHandler = getSocketHandler("task:moved");
    act(() => {
      movedHandler({ taskId: "t1", column: "done" });
    });

    await waitFor(() => {
      const doneColumn = screen.getByTestId("column-done");
      expect(doneColumn).toContainElement(screen.getByText("Initial task"));
    });
  });

  it("emits task:delete when delete button is clicked", async () => {
    render(<KanbanBoard />);
    await waitFor(() => screen.getByText("Initial task"));

    const card = screen.getByTestId("task-card-t1");
    fireEvent.mouseEnter(card);

    const deleteBtn = screen.getByTestId("delete-task-t1");
    fireEvent.click(deleteBtn);

    expect(mockSocket.emit).toHaveBeenCalledWith("task:delete", "t1");
  });
});
