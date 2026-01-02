/**
 * State manager for the scheduler
 */
import { Task, RunState, TaskState } from "./types";

export class StateManager {
  private runState: RunState;

  constructor(runId: string) {
    this.runState = {
      id: runId,
      tasks: [],
      startTime: new Date(),
      status: "running",
    };
  }

  addTask(task: Task): void {
    this.runState.tasks.push(task);
  }

  getTask(taskId: string): Task | undefined {
    return this.runState.tasks.find((task) => task.id === taskId);
  }

  updateTaskState(
    taskId: string,
    newState: TaskState,
    error?: string,
  ): boolean {
    const taskIndex = this.runState.tasks.findIndex(
      (task) => task.id === taskId,
    );
    if (taskIndex === -1) {
      return false;
    }

    this.runState.tasks[taskIndex] = {
      ...this.runState.tasks[taskIndex],
      state: newState,
      error,
      ...(newState === TaskState.Running && {
        startTime: new Date(),
        endTime: undefined, // Reset endTime when transitioning to Running
      }),
      ...([TaskState.Succeeded, TaskState.Failed].includes(newState) && {
        endTime: new Date(),
      }),
      // When transitioning from Failed/Running back to Pending, clear endTime and error
      ...(newState === TaskState.Pending && {
        endTime: undefined,
        error: error || undefined, // Keep provided error or clear it
      }),
    };

    return true;
  }

  incrementRetryCount(taskId: string): boolean {
    const taskIndex = this.runState.tasks.findIndex(
      (task) => task.id === taskId,
    );
    if (taskIndex === -1) {
      return false;
    }

    const task = this.runState.tasks[taskIndex];
    if (task.retryCount >= task.maxRetries) {
      return false; // Cannot retry anymore
    }

    this.runState.tasks[taskIndex] = {
      ...task,
      retryCount: task.retryCount + 1,
    };

    return true;
  }

  getTasksByState(state: TaskState): Task[] {
    return this.runState.tasks.filter((task) => task.state === state);
  }

  getPendingTasks(): Task[] {
    return this.getTasksByState(TaskState.Pending);
  }

  getReadyTasks(): Task[] {
    return this.runState.tasks.filter((task) => {
      if (task.state !== TaskState.Pending) {
        return false;
      }

      // Check if all dependencies are completed
      return task.dependsOn.every((depId) => {
        const depTask = this.getTask(depId);
        return depTask && [TaskState.Succeeded].includes(depTask.state);
      });
    });
  }

  setRunStatus(status: "running" | "completed" | "failed" | "cancelled"): void {
    this.runState.status = status;
    if (["completed", "failed", "cancelled"].includes(status)) {
      this.runState.endTime = new Date();
    }
  }

  getRunState(): RunState {
    return { ...this.runState };
  }

  getAllTasks(): Task[] {
    return [...this.runState.tasks];
  }
}
