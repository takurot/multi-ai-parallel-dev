/**
 * Tests for scheduler types
 */
import { describe, it, expect } from "vitest";
import { TaskState, Task, RunState, QueueItem } from "./types";

describe("Scheduler Types", () => {
  it("should define TaskState enum correctly", () => {
    expect(TaskState.Pending).toBe("pending");
    expect(TaskState.Running).toBe("running");
    expect(TaskState.Succeeded).toBe("succeeded");
    expect(TaskState.Failed).toBe("failed");
    expect(TaskState.Blocked).toBe("blocked");
    expect(TaskState.WaitingReview).toBe("waiting-review");
    expect(TaskState.WaitingHuman).toBe("waiting-human");
  });

  it("should define Task interface correctly", () => {
    const task: Task = {
      id: "test-task",
      title: "Test Task",
      repo: "./app",
      tool: "codex-cli",
      dependsOn: ["dependency-1"],
      state: TaskState.Pending,
      retryCount: 0,
      maxRetries: 3,
    };

    expect(task.id).toBe("test-task");
    expect(task.title).toBe("Test Task");
    expect(task.repo).toBe("./app");
    expect(task.tool).toBe("codex-cli");
    expect(task.dependsOn).toEqual(["dependency-1"]);
    expect(task.state).toBe(TaskState.Pending);
    expect(task.retryCount).toBe(0);
    expect(task.maxRetries).toBe(3);
  });

  it("should define RunState interface correctly", () => {
    const runState: RunState = {
      id: "run-123",
      tasks: [],
      startTime: new Date(),
      status: "running",
    };

    expect(runState.id).toBe("run-123");
    expect(runState.tasks).toEqual([]);
    expect(runState.status).toBe("running");
  });

  it("should define QueueItem interface correctly", () => {
    const queueItem: QueueItem = {
      taskId: "task-123",
      priority: 1,
      timestamp: new Date(),
    };

    expect(queueItem.taskId).toBe("task-123");
    expect(queueItem.priority).toBe(1);
    expect(queueItem.timestamp).toBeInstanceOf(Date);
  });
});
