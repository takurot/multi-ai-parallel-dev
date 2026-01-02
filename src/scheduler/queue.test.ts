/**
 * Tests for task queue
 */
import { describe, it, expect } from "vitest";
import { TaskQueue } from "./queue";
import { QueueItem } from "./types";

describe("TaskQueue", () => {
  it("should initialize as empty", () => {
    const queue = new TaskQueue();
    expect(queue.isEmpty()).toBe(true);
    expect(queue.size()).toBe(0);
  });

  it("should enqueue and dequeue items", () => {
    const queue = new TaskQueue();
    const item: QueueItem = {
      taskId: "task-1",
      priority: 1,
      timestamp: new Date(),
    };

    queue.enqueue(item);
    expect(queue.isEmpty()).toBe(false);
    expect(queue.size()).toBe(1);

    const dequeuedItem = queue.dequeue();
    expect(dequeuedItem).toEqual(item);
    expect(queue.isEmpty()).toBe(true);
    expect(queue.size()).toBe(0);
  });

  it("should handle priority correctly", () => {
    const queue = new TaskQueue();

    const item1: QueueItem = {
      taskId: "task-1",
      priority: 1,
      timestamp: new Date(2026, 0, 1, 10, 0, 0), // Later time
    };

    const item2: QueueItem = {
      taskId: "task-2",
      priority: 2,
      timestamp: new Date(2026, 0, 1, 9, 0, 0), // Earlier time but higher priority
    };

    const item3: QueueItem = {
      taskId: "task-3",
      priority: 1,
      timestamp: new Date(2026, 0, 1, 8, 0, 0), // Earliest time but same priority as item1
    };

    queue.enqueue(item1);
    queue.enqueue(item2);
    queue.enqueue(item3);

    // Higher priority item should be first
    const first = queue.dequeue();
    expect(first?.taskId).toBe("task-2");

    // Same priority, earlier timestamp should be first
    const second = queue.dequeue();
    expect(second?.taskId).toBe("task-3");

    const third = queue.dequeue();
    expect(third?.taskId).toBe("task-1");
  });

  it("should peek at the first item without removing it", () => {
    const queue = new TaskQueue();
    const item: QueueItem = {
      taskId: "task-1",
      priority: 1,
      timestamp: new Date(),
    };

    queue.enqueue(item);
    const peekedItem = queue.peek();
    expect(peekedItem).toEqual(item);
    expect(queue.size()).toBe(1); // Size should remain the same
  });

  it("should return undefined when peeking an empty queue", () => {
    const queue = new TaskQueue();
    const peekedItem = queue.peek();
    expect(peekedItem).toBeUndefined();
  });

  it("should return undefined when dequeuing an empty queue", () => {
    const queue = new TaskQueue();
    const dequeuedItem = queue.dequeue();
    expect(dequeuedItem).toBeUndefined();
  });

  it("should remove items by task ID", () => {
    const queue = new TaskQueue();

    const item1: QueueItem = {
      taskId: "task-1",
      priority: 1,
      timestamp: new Date(),
    };

    const item2: QueueItem = {
      taskId: "task-2",
      priority: 2,
      timestamp: new Date(),
    };

    queue.enqueue(item1);
    queue.enqueue(item2);

    expect(queue.size()).toBe(2);

    const removed = queue.removeByTaskId("task-1");
    expect(removed).toBe(true);
    expect(queue.size()).toBe(1);

    // Verify task-2 is still in the queue
    const remainingItem = queue.peek();
    expect(remainingItem?.taskId).toBe("task-2");
  });

  it("should return false when trying to remove non-existent task ID", () => {
    const queue = new TaskQueue();
    const removed = queue.removeByTaskId("non-existent");
    expect(removed).toBe(false);
  });

  it("should return all items", () => {
    const queue = new TaskQueue();

    const item1: QueueItem = {
      taskId: "task-1",
      priority: 1,
      timestamp: new Date(),
    };

    const item2: QueueItem = {
      taskId: "task-2",
      priority: 2,
      timestamp: new Date(),
    };

    queue.enqueue(item1);
    queue.enqueue(item2);

    const allItems = queue.getAll();
    expect(allItems).toHaveLength(2);
    expect(allItems).toContainEqual(item1);
    expect(allItems).toContainEqual(item2);
  });

  it("should clear the queue", () => {
    const queue = new TaskQueue();

    const item: QueueItem = {
      taskId: "task-1",
      priority: 1,
      timestamp: new Date(),
    };

    queue.enqueue(item);
    expect(queue.size()).toBe(1);

    queue.clear();
    expect(queue.isEmpty()).toBe(true);
    expect(queue.size()).toBe(0);
  });
});
