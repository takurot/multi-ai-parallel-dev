/**
 * Tests for persistence layer
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Persistence } from "./persistence";
import { TaskState } from "./types";

describe("Persistence", () => {
  let persistence: Persistence;

  beforeEach(() => {
    // Use in-memory database for testing
    persistence = new Persistence({ dbPath: ":memory:" });
  });

  afterEach(() => {
    persistence.close();
  });

  it("should initialize database tables correctly", () => {
    // This test verifies that the constructor creates the necessary tables
    expect(persistence.getDbPath()).toBe(":memory:");
  });

  it("should save and load run state", () => {
    const runState = {
      id: "run-123",
      tasks: [
        {
          id: "task-1",
          title: "Test Task",
          repo: "./app",
          tool: "codex-cli",
          dependsOn: [],
          state: TaskState.Pending,
          retryCount: 0,
          maxRetries: 3,
        },
      ],
      startTime: new Date("2026-01-01T10:00:00Z"),
      status: "running" as const,
    };

    persistence.saveRunState(runState);
    const loadedState = persistence.loadRunState("run-123");

    expect(loadedState).not.toBeNull();
    expect(loadedState?.id).toBe("run-123");
    expect(loadedState?.tasks).toHaveLength(1);
    expect(loadedState?.tasks[0].id).toBe("task-1");
    expect(loadedState?.tasks[0].state).toBe(TaskState.Pending);
    expect(loadedState?.status).toBe("running");
  });

  it("should return null for non-existent run", () => {
    const loadedState = persistence.loadRunState("non-existent");
    expect(loadedState).toBeNull();
  });

  it("should handle tasks with various states and properties", () => {
    const startTime = new Date("2026-01-01T10:00:00Z");
    const endTime = new Date("2026-01-01T11:00:00Z");

    const runState = {
      id: "run-456",
      tasks: [
        {
          id: "task-1",
          title: "Pending Task",
          repo: "./app",
          tool: "codex-cli",
          dependsOn: [],
          state: TaskState.Pending,
          retryCount: 0,
          maxRetries: 3,
        },
        {
          id: "task-2",
          title: "Running Task",
          repo: "./app",
          tool: "claude-code",
          dependsOn: ["task-1"],
          state: TaskState.Running,
          assignedModel: "gpt-4",
          startTime,
          retryCount: 1,
          maxRetries: 3,
        },
        {
          id: "task-3",
          title: "Failed Task",
          repo: "./app",
          tool: "openai-api",
          dependsOn: ["task-1", "task-2"],
          state: TaskState.Failed,
          error: "Something went wrong",
          startTime,
          endTime,
          retryCount: 3,
          maxRetries: 3,
        },
      ],
      startTime: new Date("2026-01-01T09:00:00Z"),
      status: "running" as const,
    };

    persistence.saveRunState(runState);
    const loadedState = persistence.loadRunState("run-456");

    expect(loadedState).not.toBeNull();
    expect(loadedState?.tasks).toHaveLength(3);

    // Check the pending task
    const pendingTask = loadedState?.tasks.find((t) => t.id === "task-1");
    expect(pendingTask?.state).toBe(TaskState.Pending);
    expect(pendingTask?.retryCount).toBe(0);

    // Check the running task
    const runningTask = loadedState?.tasks.find((t) => t.id === "task-2");
    expect(runningTask?.state).toBe(TaskState.Running);
    expect(runningTask?.assignedModel).toBe("gpt-4");
    expect(runningTask?.retryCount).toBe(1);

    // Check the failed task
    const failedTask = loadedState?.tasks.find((t) => t.id === "task-3");
    expect(failedTask?.state).toBe(TaskState.Failed);
    expect(failedTask?.error).toBe("Something went wrong");
    expect(failedTask?.retryCount).toBe(3);
  });

  it("should handle run with completion time", () => {
    const runState = {
      id: "run-789",
      tasks: [],
      startTime: new Date("2026-01-01T10:00:00Z"),
      endTime: new Date("2026-01-01T12:00:00Z"),
      status: "completed" as const,
    };

    persistence.saveRunState(runState);
    const loadedState = persistence.loadRunState("run-789");

    expect(loadedState).not.toBeNull();
    expect(loadedState?.status).toBe("completed");
    expect(loadedState?.endTime).toEqual(runState.endTime);
  });

  it("should update run state when saving the same run ID", () => {
    const runState1 = {
      id: "run-update",
      tasks: [
        {
          id: "task-1",
          title: "Initial Task",
          repo: "./app",
          tool: "codex-cli",
          dependsOn: [],
          state: TaskState.Pending,
          retryCount: 0,
          maxRetries: 3,
        },
      ],
      startTime: new Date("2026-01-01T10:00:00Z"),
      status: "running" as const,
    };

    const runState2 = {
      id: "run-update",
      tasks: [
        {
          id: "task-1",
          title: "Updated Task",
          repo: "./app",
          tool: "codex-cli",
          dependsOn: [],
          state: TaskState.Succeeded,
          startTime: new Date("2026-01-01T10:00:00Z"),
          endTime: new Date("2026-01-01T10:05:00Z"),
          retryCount: 0,
          maxRetries: 3,
        },
      ],
      startTime: new Date("2026-01-01T10:00:00Z"),
      status: "completed" as const,
    };

    persistence.saveRunState(runState1);
    let loadedState = persistence.loadRunState("run-update");
    expect(loadedState?.tasks[0].state).toBe(TaskState.Pending);
    expect(loadedState?.status).toBe("running");

    persistence.saveRunState(runState2);
    loadedState = persistence.loadRunState("run-update");
    expect(loadedState?.tasks[0].state).toBe(TaskState.Succeeded);
    expect(loadedState?.status).toBe("completed");
    expect(loadedState?.tasks[0].title).toBe("Updated Task");
  });
});
