import { describe, it, expect } from "vitest";
import { getMermaidGraph } from "./visualizer.js";
import { Dag } from "./types.js";

describe("DAG Visualizer", () => {
  it("should generate a valid Mermaid graph string", () => {
    const dag: Dag = {
      nodes: new Map([
        ["A", { id: "A", dependencies: [], dependents: ["B"] }],
        ["B", { id: "B", dependencies: ["A"], dependents: [] }],
      ]),
    };
    const mermaid = getMermaidGraph(dag);
    expect(mermaid).toContain("graph TD");
    expect(mermaid).toContain("A --> B");
  });

  it("should handle multiple dependencies", () => {
    const dag: Dag = {
      nodes: new Map([
        ["A", { id: "A", dependencies: [], dependents: ["C"] }],
        ["B", { id: "B", dependencies: [], dependents: ["C"] }],
        ["C", { id: "C", dependencies: ["A", "B"], dependents: [] }],
      ]),
    };
    const mermaid = getMermaidGraph(dag);
    expect(mermaid).toContain("A --> C");
    expect(mermaid).toContain("B --> C");
  });

  it("should handle isolated nodes", () => {
    const dag: Dag = {
      nodes: new Map([["A", { id: "A", dependencies: [], dependents: [] }]]),
    };
    const mermaid = getMermaidGraph(dag);
    expect(mermaid).toContain("A");
    expect(mermaid).not.toContain("-->");
  });
});
