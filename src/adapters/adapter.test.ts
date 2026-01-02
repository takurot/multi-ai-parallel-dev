import { describe, it, expect, beforeEach } from "vitest";
import { AdapterRegistry } from "./registry.js";
import { MockAdapter } from "./mock-adapter.js";
import type { Task } from "../tasks/types.js";
import type { TaskContext } from "./types.js";

describe("AdapterRegistry", () => {
  let registry: AdapterRegistry;
  let mockAdapter: MockAdapter;

  beforeEach(() => {
    registry = new AdapterRegistry();
    mockAdapter = new MockAdapter("test-adapter");
  });

  describe("register", () => {
    it("should register an adapter", () => {
      registry.register(mockAdapter);
      expect(registry.has("test-adapter")).toBe(true);
    });

    it("should throw when registering duplicate adapter", () => {
      registry.register(mockAdapter);
      expect(() => registry.register(mockAdapter)).toThrowError(
        /already registered/,
      );
    });
  });

  describe("get", () => {
    it("should return registered adapter", () => {
      registry.register(mockAdapter);
      const adapter = registry.get("test-adapter");
      expect(adapter).toBe(mockAdapter);
    });

    it("should throw when adapter not found", () => {
      expect(() => registry.get("non-existent")).toThrowError(/not registered/);
    });
  });

  describe("has", () => {
    it("should return true for registered adapter", () => {
      registry.register(mockAdapter);
      expect(registry.has("test-adapter")).toBe(true);
    });

    it("should return false for unregistered adapter", () => {
      expect(registry.has("test-adapter")).toBe(false);
    });
  });

  describe("list", () => {
    it("should return empty array when no adapters", () => {
      expect(registry.list()).toEqual([]);
    });

    it("should return all registered adapter names", () => {
      registry.register(mockAdapter);
      registry.register(new MockAdapter("second-adapter"));
      expect(registry.list()).toEqual(["test-adapter", "second-adapter"]);
    });
  });

  describe("getAll", () => {
    it("should return all registered adapters", () => {
      const adapter2 = new MockAdapter("second-adapter");
      registry.register(mockAdapter);
      registry.register(adapter2);
      const adapters = registry.getAll();
      expect(adapters).toHaveLength(2);
      expect(adapters).toContain(mockAdapter);
      expect(adapters).toContain(adapter2);
    });
  });

  describe("unregister", () => {
    it("should remove registered adapter", () => {
      registry.register(mockAdapter);
      expect(registry.unregister("test-adapter")).toBe(true);
      expect(registry.has("test-adapter")).toBe(false);
    });

    it("should return false when adapter not found", () => {
      expect(registry.unregister("non-existent")).toBe(false);
    });
  });

  describe("clear", () => {
    it("should remove all adapters", () => {
      registry.register(mockAdapter);
      registry.register(new MockAdapter("second-adapter"));
      registry.clear();
      expect(registry.list()).toEqual([]);
    });
  });
});

describe("MockAdapter", () => {
  let adapter: MockAdapter;
  let context: TaskContext;

  beforeEach(() => {
    adapter = new MockAdapter("mock");
    context = createMockContext();
  });

  describe("getName", () => {
    it("should return the adapter name", () => {
      expect(adapter.getName()).toBe("mock");
    });
  });

  describe("isAvailable", () => {
    it("should return true by default", async () => {
      expect(await adapter.isAvailable()).toBe(true);
    });

    it("should respect config", async () => {
      adapter.updateConfig({ isAvailable: false });
      expect(await adapter.isAvailable()).toBe(false);
    });
  });

  describe("execute", () => {
    it("should return success result by default", async () => {
      const result = await adapter.execute(context);
      expect(result.success).toBe(true);
      expect(result.output).toBe("Mock execution completed successfully");
      expect(result.modifiedFiles).toHaveLength(1);
    });

    it("should return failure when configured", async () => {
      adapter.updateConfig({ shouldSucceed: false });
      const result = await adapter.execute(context);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should track execution count", async () => {
      await adapter.execute(context);
      await adapter.execute(context);
      expect(adapter.getExecutionCount()).toBe(2);
    });

    it("should return custom output when configured", async () => {
      adapter.updateConfig({ customOutput: "Custom result" });
      const result = await adapter.execute(context);
      expect(result.output).toBe("Custom result");
    });
  });

  describe("review", () => {
    it("should return approval by default", async () => {
      const result = await adapter.review(context, "diff content");
      expect(result.approved).toBe(true);
      expect(result.comments).toHaveLength(0);
    });

    it("should return rejection with comments when configured", async () => {
      adapter.updateConfig({ shouldApprove: false });
      const result = await adapter.review(context, "diff content");
      expect(result.approved).toBe(false);
      expect(result.comments).toHaveLength(1);
      expect(result.comments[0].severity).toBe("warning");
    });

    it("should track review count", async () => {
      await adapter.review(context, "diff");
      await adapter.review(context, "diff");
      expect(adapter.getReviewCount()).toBe(2);
    });
  });

  describe("estimateCost", () => {
    it("should return cost estimate", async () => {
      const estimate = await adapter.estimateCost(context);
      expect(estimate.estimatedInputTokens).toBeGreaterThan(0);
      expect(estimate.estimatedOutputTokens).toBeGreaterThan(0);
      expect(estimate.estimatedCostUsd).toBeGreaterThan(0);
      expect(estimate.modelId).toBe("mock");
    });
  });

  describe("resetCounters", () => {
    it("should reset execution and review counts", async () => {
      await adapter.execute(context);
      await adapter.review(context, "diff");
      adapter.resetCounters();
      expect(adapter.getExecutionCount()).toBe(0);
      expect(adapter.getReviewCount()).toBe(0);
    });
  });
});

// Helper function to create mock context
function createMockContext(): TaskContext {
  const task: Task = {
    id: "test-task",
    title: "Test Task",
    dependsOn: [],
  };

  return {
    task,
    worktreePath: "/tmp/worktree",
    dependencyResults: new Map(),
    contextFiles: [],
    retryAttempt: 0,
  };
}
