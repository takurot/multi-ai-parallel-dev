import { describe, it, expect } from "vitest";
import { buildDag } from "./builder.js";
import { Task } from "../tasks/types.js";
import { OrchestratorError, ErrorCode } from "../errors/index.js";

describe("DAG Builder", () => {
  it("should build a valid DAG from tasks", () => {
    const tasks: Task[] = [
      { id: "A", title: "Task A", dependsOn: [], execution: {}, review: {} },
      { id: "B", title: "Task B", dependsOn: ["A"], execution: {}, review: {} },
    ];
    const dag = buildDag(tasks);
    expect(dag.nodes.has("A")).toBe(true);
    expect(dag.nodes.has("B")).toBe(true);
    expect(dag.nodes.get("B")?.dependencies).toContain("A");
    expect(dag.nodes.get("A")?.dependents).toContain("B");
  });

  it("should throw error if dependency is missing", () => {
    const tasks: Task[] = [
      { id: "B", title: "Task B", dependsOn: ["A"], execution: {}, review: {} },
    ];
    expect(() => buildDag(tasks)).toThrow(/Task dependency not found/);
    try {
      buildDag(tasks);
    } catch (e: unknown) {
      const orchestratorError = e as OrchestratorError;
      expect(orchestratorError.code).toBe(ErrorCode.TASK_DEPENDENCY_NOT_FOUND);
    }
  });

  it("should throw error if cycle is detected", () => {
    const tasks: Task[] = [
      { id: "A", title: "Task A", dependsOn: ["B"], execution: {}, review: {} },
      { id: "B", title: "Task B", dependsOn: ["A"], execution: {}, review: {} },
    ];
    expect(() => buildDag(tasks)).toThrow(/Cycle detected/);
    try {
      buildDag(tasks);
    } catch (e: unknown) {
      const orchestratorError = e as OrchestratorError;
      expect(orchestratorError.code).toBe(ErrorCode.DAG_CYCLE_DETECTED);
    }
  });
});
