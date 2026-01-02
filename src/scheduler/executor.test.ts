/**
 * Tests for executor
 */
import { describe, it, expect } from "vitest";
import { Executor } from "./executor";
import { StateManager } from "./state-manager";
import { TaskState } from "./types";

describe("Executor", () => {
  it("should initialize with correct parameters", () => {
    const stateManager = new StateManager("run-123");
    const executor = new Executor(stateManager, { maxConcurrentTasks: 3 });

    expect(executor.getMaxConcurrentTasks()).toBe(3);
    expect(executor.getRunningTaskCount()).toBe(0);
    expect(executor.isExecuting()).toBe(false);
  });

  it("should execute a single task successfully", async () => {
    const stateManager = new StateManager("run-123");
    const executor = new Executor(stateManager, { failureRate: 0 }); // Ensure no failures

    const task = {
      id: "task-1",
      title: "Test Task",
      repo: "./app",
      tool: "codex-cli",
      dependsOn: [],
      state: TaskState.Pending,
      retryCount: 0,
      maxRetries: 3,
    };

    stateManager.addTask(task);

    const result = await executor.executeTask("task-1");
    expect(result.success).toBe(true);
    expect(result.output).toContain("completed successfully");
  });

  it("should fail when executing non-existent task", async () => {
    const stateManager = new StateManager("run-123");
    const executor = new Executor(stateManager, { failureRate: 0 });

    const result = await executor.executeTask("non-existent");
    expect(result.success).toBe(false);
    expect(result.error).toContain("not found");
  });

  it("should update task state during execution", async () => {
    const stateManager = new StateManager("run-123");
    const executor = new Executor(stateManager, { failureRate: 0 });

    const task = {
      id: "task-1",
      title: "Test Task",
      repo: "./app",
      tool: "codex-cli",
      dependsOn: [],
      state: TaskState.Pending,
      retryCount: 0,
      maxRetries: 3,
    };

    stateManager.addTask(task);

    // Initially task should be pending
    expect(stateManager.getTask("task-1")?.state).toBe(TaskState.Pending);

    // Execute the task
    await executor.executeTask("task-1");

    // After calling executeTask directly, task should be running
    // The state update to Succeeded happens in executeReadyTasks when the execution is successful
    expect(stateManager.getTask("task-1")?.state).toBe(TaskState.Running);
  });

  it("should handle task failure and retries", async () => {
    const stateManager = new StateManager("run-123");
    const executor = new Executor(stateManager, { failureRate: 1.0 }); // Force failures

    const task = {
      id: "task-1",
      title: "Test Task",
      repo: "./app",
      tool: "codex-cli",
      dependsOn: [],
      state: TaskState.Pending,
      retryCount: 0,
      maxRetries: 3,
    };

    stateManager.addTask(task);

    // Execute the task (it should fail due to high failure rate)
    const result = await executor.executeTask("task-1");
    expect(result.success).toBe(false);
  });

  it("should execute ready tasks respecting dependencies", async () => {
    const stateManager = new StateManager("run-123");
    const executor = new Executor(stateManager, {
      maxConcurrentTasks: 1,
      failureRate: 0,
    }); // Only 1 concurrent task

    // Task 1 has no dependencies
    const task1 = {
      id: "task-1",
      title: "Task 1",
      repo: "./app",
      tool: "codex-cli",
      dependsOn: [],
      state: TaskState.Pending,
      retryCount: 0,
      maxRetries: 3,
    };

    // Task 2 depends on task 1
    const task2 = {
      id: "task-2",
      title: "Task 2",
      repo: "./app",
      tool: "codex-cli",
      dependsOn: ["task-1"],
      state: TaskState.Pending,
      retryCount: 0,
      maxRetries: 3,
    };

    stateManager.addTask(task1);
    stateManager.addTask(task2);

    // Initially, only task1 should be ready to execute
    const readyTasks = stateManager.getReadyTasks();
    expect(readyTasks).toHaveLength(1);
    expect(readyTasks[0].id).toBe("task-1");

    // Execute ready tasks
    await executor.executeReadyTasks();

    // Wait a bit for async execution to complete
    await new Promise((resolve) => setTimeout(resolve, 200));

    // After execution, task1 should be succeeded
    expect(stateManager.getTask("task-1")?.state).toBe(TaskState.Succeeded);

    // Task2 should still be pending since we only executed once
    expect(stateManager.getTask("task-2")?.state).toBe(TaskState.Pending);

    // Now task2 should be ready since its dependency is satisfied
    const readyTasksAfter = stateManager.getReadyTasks();
    expect(readyTasksAfter).toHaveLength(1);
    expect(readyTasksAfter[0].id).toBe("task-2");
  });

  it("should respect max concurrent tasks limit", async () => {
    const stateManager = new StateManager("run-123");
    const executor = new Executor(stateManager, {
      maxConcurrentTasks: 2,
      failureRate: 0,
    }); // Max 2 concurrent tasks

    // Add 5 tasks with no dependencies
    for (let i = 1; i <= 5; i++) {
      const task = {
        id: `task-${i}`,
        title: `Task ${i}`,
        repo: "./app",
        tool: "codex-cli",
        dependsOn: [],
        state: TaskState.Pending,
        retryCount: 0,
        maxRetries: 3,
      };
      stateManager.addTask(task);
    }

    // Execute ready tasks
    await executor.executeReadyTasks();

    // Check that the executor is not executing more than the max
    expect(executor.getRunningTaskCount()).toBeLessThanOrEqual(2);
  });
});
