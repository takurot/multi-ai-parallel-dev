import { describe, it, expect } from "vitest";
import { topologicalSort, getParallelTasks } from "./topological-sort.js";
import { Dag } from "./types.js";

describe("Topological Sort", () => {
  const dag: Dag = {
    nodes: new Map([
      ["A", { id: "A", dependencies: [], dependents: ["B", "C"] }],
      ["B", { id: "B", dependencies: ["A"], dependents: ["D"] }],
      ["C", { id: "C", dependencies: ["A"], dependents: ["D"] }],
      ["D", { id: "D", dependencies: ["B", "C"], dependents: [] }],
    ]),
  };

  it("should sort tasks in a valid topological order", () => {
    const sorted = topologicalSort(dag);
    const aIndex = sorted.indexOf("A");
    const bIndex = sorted.indexOf("B");
    const cIndex = sorted.indexOf("C");
    const dIndex = sorted.indexOf("D");

    expect(aIndex).toBeLessThan(bIndex);
    expect(aIndex).toBeLessThan(cIndex);
    expect(bIndex).toBeLessThan(dIndex);
    expect(cIndex).toBeLessThan(dIndex);
  });

  it("should return parallel tasks", () => {
    expect(getParallelTasks(dag, new Set())).toEqual(["A"]);
    expect(getParallelTasks(dag, new Set(["A"]))).toEqual(["B", "C"]);
    expect(getParallelTasks(dag, new Set(["A", "B"]))).toEqual(["C"]);
    expect(getParallelTasks(dag, new Set(["A", "B", "C"]))).toEqual(["D"]);
    expect(getParallelTasks(dag, new Set(["A", "B", "C", "D"]))).toEqual([]);
  });
});
