/**
 * Tests for state manager
 */
import { describe, it, expect } from "vitest";
import { StateManager } from "./state-manager";
import { TaskState } from "./types";

describe("StateManager", () => {
  it("should initialize with correct run state", () => {
    const stateManager = new StateManager("run-123");
    const runState = stateManager.getRunState();

    expect(runState.id).toBe("run-123");
    expect(runState.tasks).toEqual([]);
    expect(runState.status).toBe("running");
    expect(runState.startTime).toBeInstanceOf(Date);
  });

  it("should add tasks correctly", () => {
    const stateManager = new StateManager("run-123");

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
    const retrievedTask = stateManager.getTask("task-1");

    expect(retrievedTask).toEqual(task);
  });

  it("should update task state correctly", () => {
    const stateManager = new StateManager("run-123");

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
    const updateResult = stateManager.updateTaskState(
      "task-1",
      TaskState.Running,
    );

    expect(updateResult).toBe(true);
    const updatedTask = stateManager.getTask("task-1");
    expect(updatedTask?.state).toBe(TaskState.Running);
    expect(updatedTask?.startTime).toBeInstanceOf(Date);
  });

  it("should return false when updating non-existent task", () => {
    const stateManager = new StateManager("run-123");
    const updateResult = stateManager.updateTaskState(
      "non-existent",
      TaskState.Running,
    );

    expect(updateResult).toBe(false);
  });

  it("should increment retry count", () => {
    const stateManager = new StateManager("run-123");

    const task = {
      id: "task-1",
      title: "Test Task",
      repo: "./app",
      tool: "codex-cli",
      dependsOn: [],
      state: TaskState.Pending,
      retryCount: 1,
      maxRetries: 3,
    };

    stateManager.addTask(task);
    const incrementResult = stateManager.incrementRetryCount("task-1");

    expect(incrementResult).toBe(true);
    const updatedTask = stateManager.getTask("task-1");
    expect(updatedTask?.retryCount).toBe(2);
  });

  it("should return false when incrementing retry count beyond max", () => {
    const stateManager = new StateManager("run-123");

    const task = {
      id: "task-1",
      title: "Test Task",
      repo: "./app",
      tool: "codex-cli",
      dependsOn: [],
      state: TaskState.Pending,
      retryCount: 3,
      maxRetries: 3,
    };

    stateManager.addTask(task);
    const incrementResult = stateManager.incrementRetryCount("task-1");

    expect(incrementResult).toBe(false);
  });

  it("should get tasks by state", () => {
    const stateManager = new StateManager("run-123");

    const task1 = {
      id: "task-1",
      title: "Test Task 1",
      repo: "./app",
      tool: "codex-cli",
      dependsOn: [],
      state: TaskState.Pending,
      retryCount: 0,
      maxRetries: 3,
    };

    const task2 = {
      id: "task-2",
      title: "Test Task 2",
      repo: "./app",
      tool: "codex-cli",
      dependsOn: [],
      state: TaskState.Running,
      retryCount: 0,
      maxRetries: 3,
    };

    stateManager.addTask(task1);
    stateManager.addTask(task2);

    const pendingTasks = stateManager.getTasksByState(TaskState.Pending);
    expect(pendingTasks).toHaveLength(1);
    expect(pendingTasks[0].id).toBe("task-1");

    const runningTasks = stateManager.getTasksByState(TaskState.Running);
    expect(runningTasks).toHaveLength(1);
    expect(runningTasks[0].id).toBe("task-2");
  });

  it("should get ready tasks based on dependencies", () => {
    const stateManager = new StateManager("run-123");

    // Task with no dependencies should be ready
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

    // Task with dependency that is not completed should not be ready
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

    // Task with dependency that is completed should be ready
    const task3 = {
      id: "task-3",
      title: "Task 3",
      repo: "./app",
      tool: "codex-cli",
      dependsOn: ["task-1"],
      state: TaskState.Pending,
      retryCount: 0,
      maxRetries: 3,
    };

    stateManager.addTask(task1);
    stateManager.addTask(task2);
    stateManager.addTask(task3);

    // Initially, only task1 should be ready (no dependencies)
    let readyTasks = stateManager.getReadyTasks();
    expect(readyTasks).toHaveLength(1);
    expect(readyTasks[0].id).toBe("task-1");

    // Update task1 to succeeded state
    stateManager.updateTaskState("task-1", TaskState.Succeeded);

    // Now task3 should also be ready since its dependency is satisfied
    readyTasks = stateManager.getReadyTasks();
    expect(readyTasks).toHaveLength(2);
    expect(readyTasks.map((t) => t.id)).toContain("task-2");
    expect(readyTasks.map((t) => t.id)).toContain("task-3");
  });

  it("should update run status correctly", () => {
    const stateManager = new StateManager("run-123");

    stateManager.setRunStatus("completed");
    const runState = stateManager.getRunState();

    expect(runState.status).toBe("completed");
    expect(runState.endTime).toBeInstanceOf(Date);
  });
});
