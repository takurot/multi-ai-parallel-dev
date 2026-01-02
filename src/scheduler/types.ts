/**
 * Scheduler types
 */

export enum TaskState {
  Pending = "pending",
  Running = "running",
  Succeeded = "succeeded",
  Failed = "failed",
  Blocked = "blocked",
  WaitingReview = "waiting-review",
  WaitingHuman = "waiting-human",
}

export interface Task {
  id: string;
  title: string;
  repo: string;
  tool: string;
  dependsOn: string[];
  state: TaskState;
  assignedModel?: string;
  startTime?: Date;
  endTime?: Date;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

export interface RunState {
  id: string;
  tasks: Task[];
  startTime: Date;
  endTime?: Date;
  status: "running" | "completed" | "failed" | "cancelled";
}

export interface QueueItem {
  taskId: string;
  priority: number;
  timestamp: Date;
}
