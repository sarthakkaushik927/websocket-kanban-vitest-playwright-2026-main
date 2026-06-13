import { test, expect } from "@playwright/test";

test.describe("Kanban Board", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[data-testid="kanban-board"]', { timeout: 10000 });
  });

  test("page loads and shows the board", async ({ page }) => {
    await expect(page.locator('[data-testid="kanban-board"]')).toBeVisible();
    await expect(page.locator('[data-testid="column-todo"]')).toBeVisible();
    await expect(page.locator('[data-testid="column-inprogress"]')).toBeVisible();
    await expect(page.locator('[data-testid="column-done"]')).toBeVisible();
  });

  test("user can create a task", async ({ page }) => {
    await page.click('[data-testid="add-task-btn"]');
    await page.waitForSelector('[data-testid="task-title-input"]');

    await page.fill('[data-testid="task-title-input"]', "E2E test task");
    await page.fill('[data-testid="task-description-input"]', "Created by playwright");
    await page.selectOption('[data-testid="task-priority-select"]', "high");
    await page.selectOption('[data-testid="task-category-select"]', "bug");
    await page.click('[data-testid="modal-submit-btn"]');

    await expect(page.getByText("E2E test task")).toBeVisible();
  });

  test("user can delete a task", async ({ page }) => {
    await page.click('[data-testid="add-task-btn"]');
    await page.waitForSelector('[data-testid="task-title-input"]');
    await page.fill('[data-testid="task-title-input"]', "Task to delete");
    await page.click('[data-testid="modal-submit-btn"]');
    await page.waitForSelector('[data-testid^="task-card-"]');

    const card = page.locator('[data-testid^="task-card-"]').filter({ hasText: "Task to delete" });
    await card.hover();
    const deleteBtn = card.locator('[data-testid^="delete-task-"]');
    await deleteBtn.click();

    await expect(page.getByText("Task to delete")).not.toBeVisible();
  });

  test("user can edit a task", async ({ page }) => {
    await page.click('[data-testid="add-task-btn"]');
    await page.waitForSelector('[data-testid="task-title-input"]');
    await page.fill('[data-testid="task-title-input"]', "Original title");
    await page.click('[data-testid="modal-submit-btn"]');

    const card = page.locator('[data-testid^="task-card-"]').filter({ hasText: "Original title" });
    await card.hover();
    await card.locator('[data-testid^="edit-task-"]').click();

    await page.waitForSelector('[data-testid="task-title-input"]');
    await page.fill('[data-testid="task-title-input"]', "Updated title");
    await page.click('[data-testid="modal-submit-btn"]');

    await expect(page.getByText("Updated title")).toBeVisible();
    await expect(page.getByText("Original title")).not.toBeVisible();
  });

  test("modal closes when cancel is clicked", async ({ page }) => {
    await page.click('[data-testid="add-task-btn"]');
    await page.waitForSelector('[data-testid="modal-backdrop"]');
    await page.click('text=Cancel');
    await expect(page.locator('[data-testid="modal-backdrop"]')).not.toBeVisible();
  });

  test("progress chart updates when task is added", async ({ page }) => {
    const todoBefore = await page.locator('[data-testid="count-todo"]').textContent();

    await page.click('[data-testid="add-task-todo"]');
    await page.waitForSelector('[data-testid="task-title-input"]');
    await page.fill('[data-testid="task-title-input"]', "Chart test task");
    await page.click('[data-testid="modal-submit-btn"]');

    const todoAfter = await page.locator('[data-testid="count-todo"]').textContent();
    expect(Number(todoAfter)).toBeGreaterThan(Number(todoBefore));
  });
});

test.describe("Dropdown selects", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[data-testid="kanban-board"]');
    await page.click('[data-testid="add-task-btn"]');
    await page.waitForSelector('[data-testid="modal-backdrop"]');
  });

  test("user can select a priority level", async ({ page }) => {
    await page.selectOption('[data-testid="task-priority-select"]', "high");
    await expect(page.locator('[data-testid="task-priority-select"]')).toHaveValue("high");
  });

  test("user can change task category", async ({ page }) => {
    await page.selectOption('[data-testid="task-category-select"]', "bug");
    await expect(page.locator('[data-testid="task-category-select"]')).toHaveValue("bug");

    await page.selectOption('[data-testid="task-category-select"]', "enhancement");
    await expect(page.locator('[data-testid="task-category-select"]')).toHaveValue("enhancement");
  });

  test("task shows correct priority badge after creation", async ({ page }) => {
    await page.fill('[data-testid="task-title-input"]', "Priority badge test");
    await page.selectOption('[data-testid="task-priority-select"]', "high");
    await page.click('[data-testid="modal-submit-btn"]');

    const card = page.locator('[data-testid^="task-card-"]').filter({ hasText: "Priority badge test" });
    await expect(card.locator('text=HIGH')).toBeVisible();
  });
});

test.describe("File upload", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[data-testid="kanban-board"]');
    await page.click('[data-testid="add-task-btn"]');
    await page.waitForSelector('[data-testid="modal-backdrop"]');
  });

  test("user can upload an image file", async ({ page }) => {
    const fileInput = page.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles({
      name: "screenshot.png",
      mimeType: "image/png",
      buffer: Buffer.from("fake-png-content"),
    });
    await expect(page.locator('[data-testid="file-preview"]')).toBeVisible();
  });

  test("invalid file type shows error message", async ({ page }) => {
    const fileInput = page.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles({
      name: "malware.exe",
      mimeType: "application/octet-stream",
      buffer: Buffer.from("bad file"),
    });
    await expect(page.locator('[data-testid="file-error"]')).toBeVisible();
  });

  test("uploaded image shows in task card after saving", async ({ page }) => {
    await page.fill('[data-testid="task-title-input"]', "Task with image");
    const fileInput = page.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles({
      name: "photo.png",
      mimeType: "image/png",
      buffer: Buffer.from("fake-png"),
    });
    await page.waitForSelector('[data-testid="file-preview"]');
    await page.click('[data-testid="modal-submit-btn"]');

    const card = page.locator('[data-testid^="task-card-"]').filter({ hasText: "Task with image" });
    await expect(card.locator('[data-testid^="attachment-"]')).toBeVisible();
  });
});

test.describe("Progress graph", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[data-testid="kanban-board"]');
  });

  test("graph is visible on load", async ({ page }) => {
    await expect(page.locator('[data-testid="progress-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="bar-chart"]')).toBeVisible();
  });

  test("completion bar starts at 0% with no done tasks", async ({ page }) => {
    const bar = page.locator('[data-testid="completion-bar"]');
    const style = await bar.getAttribute("style");
    expect(style).toContain("0%");
  });

  test("task count updates in graph after adding a task", async ({ page }) => {
    const before = await page.locator('[data-testid="count-todo"]').textContent();
    await page.click('[data-testid="add-task-todo"]');
    await page.fill('[data-testid="task-title-input"]', "Graph update task");
    await page.click('[data-testid="modal-submit-btn"]');

    const after = await page.locator('[data-testid="count-todo"]').textContent();
    expect(Number(after)).toBeGreaterThan(Number(before));
  });
});
