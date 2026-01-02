import { Dag } from "./types.js";
import { TaskId } from "../tasks/types.js";

export function topologicalSort(dag: Dag): TaskId[] {
  const result: TaskId[] = [];
  const inDegree = new Map<TaskId, number>();
  const queue: TaskId[] = [];

  // Initialize in-degree
  for (const node of dag.nodes.values()) {
    inDegree.set(node.id, node.dependencies.length);
    if (node.dependencies.length === 0) {
      queue.push(node.id);
    }
  }

  while (queue.length > 0) {
    const u = queue.shift()!;
    result.push(u);

    const node = dag.nodes.get(u);
    if (node) {
      for (const v of node.dependents) {
        const degree = (inDegree.get(v) || 0) - 1;
        inDegree.set(v, degree);
        if (degree === 0) {
          queue.push(v);
        }
      }
    }
  }

  return result;
}

export function getParallelTasks(
  dag: Dag,
  completedTasks: Set<TaskId>,
): TaskId[] {
  const ready: TaskId[] = [];

  for (const node of dag.nodes.values()) {
    if (completedTasks.has(node.id)) continue;

    const allDepsMet = node.dependencies.every((dep) =>
      completedTasks.has(dep),
    );
    if (allDepsMet) {
      ready.push(node.id);
    }
  }

  return ready;
}
