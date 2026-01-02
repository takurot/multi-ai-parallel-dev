import { Dag } from "./types.js";

export function getMermaidGraph(dag: Dag): string {
  const lines: string[] = ["graph TD"];

  for (const node of dag.nodes.values()) {
    for (const depId of node.dependencies) {
      lines.push(`    ${depId} --> ${node.id}`);
    }
    // Handle nodes with no dependencies to ensure they are shown
    if (node.dependencies.length === 0 && node.dependents.length === 0) {
      lines.push(`    ${node.id}`);
    }
  }

  return lines.join("\n");
}
