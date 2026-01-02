/**
 * Task executor for the scheduler
 */
import { Task, TaskState } from "./types";
// Task is used in StateManager methods but not directly in this file
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Task as UnusedTask } from "./types";
import { StateManager } from "./state-manager";
import { TaskQueue, QueueItem } from "./queue";

export interface ExecutionResult {
  success: boolean;
  error?: string;
  output?: string;
}

export interface ExecutorOptions {
  maxConcurrentTasks?: number;
  failureRate?: number; // For testing purposes, default to 0
}

export class Executor {
  private stateManager: StateManager;
  private maxConcurrentTasks: number;
  private failureRate: number;
  private runningTasks: Set<string> = new Set();
  private taskQueue: TaskQueue;

  constructor(stateManager: StateManager, options: ExecutorOptions = {}) {
    this.stateManager = stateManager;
    this.maxConcurrentTasks = options.maxConcurrentTasks ?? 5;
    this.failureRate = options.failureRate ?? 0; // Default to 0 for predictable tests
    this.taskQueue = new TaskQueue();
  }

  async executeTask(taskId: string): Promise<ExecutionResult> {
    try {
      // In a real implementation, this would call the appropriate tool adapter
      // For now, we'll simulate execution with a timeout
      const task = this.stateManager.getTask(taskId);
      if (!task) {
        return { success: false, error: `Task ${taskId} not found` };
      }

      // Update task state to running
      this.stateManager.updateTaskState(taskId, TaskState.Running);

      // Simulate task execution
      await new Promise((resolve) => setTimeout(resolve, 100));

      // For simulation purposes, let's say some tasks fail based on failureRate
      const shouldFail = Math.random() < this.failureRate;
      if (shouldFail) {
        return {
          success: false,
          error: `Simulated failure for task ${taskId}`,
        };
      }

      return { success: true, output: `Task ${taskId} completed successfully` };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async executeReadyTasks(): Promise<void> {
    // Get all ready tasks (pending tasks with satisfied dependencies)
    const readyTasks = this.stateManager.getReadyTasks();

    // Add ready tasks to the queue with appropriate priority
    for (const task of readyTasks) {
      // Only add to queue if not already running
      if (!this.runningTasks.has(task.id)) {
        // Priority could be based on various factors like task importance, deadline, etc.
        // For now, using a simple priority based on task characteristics
        const priority = this.calculateTaskPriority(task);

        // Check if task is already in queue to avoid duplicates
        if (!this.isTaskInQueue(task.id)) {
          const queueItem: QueueItem = {
            taskId: task.id,
            priority,
            timestamp: new Date(),
          };
          this.taskQueue.enqueue(queueItem);
        }
      }
    }

    // Execute tasks up to the concurrency limit
    const availableSlots = this.maxConcurrentTasks - this.runningTasks.size;
    const tasksToExecute: Task[] = [];

    // Dequeue tasks up to available slots
    for (let i = 0; i < availableSlots; i++) {
      const queueItem = this.taskQueue.dequeue();
      if (queueItem) {
        const task = this.stateManager.getTask(queueItem.taskId);
        if (task && !this.runningTasks.has(task.id)) {
          tasksToExecute.push(task);
          this.runningTasks.add(task.id);
        }
      } else {
        break; // No more tasks in queue
      }
    }

    // Execute tasks concurrently
    const executionPromises = tasksToExecute.map(async (task) => {
      try {
        const result = await this.executeTask(task.id);

        if (result.success) {
          this.stateManager.updateTaskState(task.id, TaskState.Succeeded);
        } else {
          // Check if we can retry
          if (task.retryCount < task.maxRetries) {
            this.stateManager.incrementRetryCount(task.id);
            this.stateManager.updateTaskState(task.id, TaskState.Pending);
          } else {
            this.stateManager.updateTaskState(
              task.id,
              TaskState.Failed,
              result.error,
            );
          }
        }
      } finally {
        // Remove from running set
        this.runningTasks.delete(task.id);
      }
    });

    // Wait for all executions to complete
    await Promise.all(executionPromises);
  }

  private calculateTaskPriority(_task: Task): number {
    // Simple priority calculation - could be enhanced based on various factors
    // Higher numbers mean higher priority
    const priority = 1;

    // Could add logic here based on task urgency, dependencies, etc.
    // For now, just return a default priority
    return priority;
  }

  private isTaskInQueue(taskId: string): boolean {
    // Check if a task is already in the queue
    return this.taskQueue.getAll().some((item) => item.taskId === taskId);
  }

  isExecuting(): boolean {
    return this.runningTasks.size > 0;
  }

  getRunningTaskCount(): number {
    return this.runningTasks.size;
  }

  getMaxConcurrentTasks(): number {
    return this.maxConcurrentTasks;
  }
}
