import { describe, it, expect } from "vitest";
import { Dag } from "./types.js";
import { detectCycle } from "./cycle-detector.js";

describe("Cycle Detector", () => {
  it("should return null for acyclic graph", () => {
    const dag: Dag = {
      nodes: new Map([
        ["A", { id: "A", dependencies: [], dependents: ["B"] }],
        ["B", { id: "B", dependencies: ["A"], dependents: [] }],
      ]),
    };
    expect(detectCycle(dag)).toBeNull();
  });

  it("should detect a simple cycle", () => {
    const dag: Dag = {
      nodes: new Map([
        ["A", { id: "A", dependencies: ["B"], dependents: ["B"] }],
        ["B", { id: "B", dependencies: ["A"], dependents: ["A"] }],
      ]),
    };
    const cycle = detectCycle(dag);
    expect(cycle).not.toBeNull();
    expect(cycle).toContain("A");
    expect(cycle).toContain("B");
  });

  it("should detect a self-loop", () => {
    const dag: Dag = {
      nodes: new Map([
        ["A", { id: "A", dependencies: ["A"], dependents: ["A"] }],
      ]),
    };
    const cycle = detectCycle(dag);
    expect(cycle).toEqual(["A"]);
  });

  it("should detect a complex cycle", () => {
    const dag: Dag = {
      nodes: new Map([
        ["A", { id: "A", dependencies: ["C"], dependents: ["B"] }],
        ["B", { id: "B", dependencies: ["A"], dependents: ["C"] }],
        ["C", { id: "C", dependencies: ["B"], dependents: ["A"] }],
      ]),
    };
    const cycle = detectCycle(dag);
    expect(cycle).not.toBeNull();
    expect(cycle).toHaveLength(3);
  });
});
