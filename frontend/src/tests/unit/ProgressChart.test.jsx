import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import ProgressChart from "../../components/ProgressChart";

describe("ProgressChart", () => {
  it("renders with no tasks", () => {
    render(<ProgressChart tasks={[]} />);
    expect(screen.getByTestId("progress-chart")).toBeInTheDocument();
    expect(screen.getByTestId("count-todo")).toHaveTextContent("0");
    expect(screen.getByTestId("count-inprogress")).toHaveTextContent("0");
    expect(screen.getByTestId("count-done")).toHaveTextContent("0");
  });

  it("shows correct counts per column", () => {
    const tasks = [
      { id: "1", column: "todo" },
      { id: "2", column: "todo" },
      { id: "3", column: "inprogress" },
      { id: "4", column: "done" },
    ];
    render(<ProgressChart tasks={tasks} />);
    expect(screen.getByTestId("count-todo")).toHaveTextContent("2");
    expect(screen.getByTestId("count-inprogress")).toHaveTextContent("1");
    expect(screen.getByTestId("count-done")).toHaveTextContent("1");
  });

  it("shows 0% completion when nothing is done", () => {
    const tasks = [
      { id: "1", column: "todo" },
      { id: "2", column: "inprogress" },
    ];
    render(<ProgressChart tasks={tasks} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("shows 100% completion when all tasks are done", () => {
    const tasks = [
      { id: "1", column: "done" },
      { id: "2", column: "done" },
    ];
    render(<ProgressChart tasks={tasks} />);
    expect(screen.getAllByText("100%")).toHaveLength(2);
  });

  it("renders bar chart elements", () => {
    render(<ProgressChart tasks={[]} />);
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("bar-todo")).toBeInTheDocument();
    expect(screen.getByTestId("bar-inprogress")).toBeInTheDocument();
    expect(screen.getByTestId("bar-done")).toBeInTheDocument();
  });

  it("completion bar reflects done percentage", () => {
    const tasks = [
      { id: "1", column: "done" },
      { id: "2", column: "todo" },
    ];
    render(<ProgressChart tasks={tasks} />);
    const bar = screen.getByTestId("completion-bar");
    expect(bar.style.width).toBe("50%");
  });
});
