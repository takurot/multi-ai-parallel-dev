/**
 * Task queue implementation
 */
import { QueueItem } from "./types";

export class TaskQueue {
  private items: QueueItem[] = [];

  enqueue(item: QueueItem): void {
    // Insert item based on priority (higher priority first)
    // If priorities are equal, use timestamp (FIFO - earlier timestamp first)
    const index = this.items.findIndex(
      (queueItem) =>
        queueItem.priority < item.priority ||
        (queueItem.priority === item.priority &&
          queueItem.timestamp > item.timestamp),
    );

    if (index === -1) {
      // If no item with lower priority found, add to the end
      this.items.push(item);
    } else {
      // Insert at the found position
      this.items.splice(index, 0, item);
    }
  }

  dequeue(): QueueItem | undefined {
    return this.items.shift();
  }

  peek(): QueueItem | undefined {
    return this.items[0];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  removeByTaskId(taskId: string): boolean {
    const index = this.items.findIndex((item) => item.taskId === taskId);
    if (index !== -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }

  getAll(): QueueItem[] {
    return [...this.items];
  }

  clear(): void {
    this.items = [];
  }
}
