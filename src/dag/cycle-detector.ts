import { Dag } from "./types.js";
import { TaskId } from "../tasks/types.js";

export function detectCycle(dag: Dag): TaskId[] | null {
  const visited = new Set<TaskId>();
  const recStack = new Set<TaskId>();
  const path: TaskId[] = [];

  for (const taskId of dag.nodes.keys()) {
    const cycle = isCyclicUtil(taskId, dag, visited, recStack, path);
    if (cycle) return cycle;
  }

  return null;
}

function isCyclicUtil(
  v: TaskId,
  dag: Dag,
  visited: Set<TaskId>,
  recStack: Set<TaskId>,
  path: TaskId[],
): TaskId[] | null {
  if (!visited.has(v)) {
    visited.add(v);
    recStack.add(v);
    path.push(v);

    const node = dag.nodes.get(v);
    if (node) {
      for (const neighbor of node.dependencies) {
        if (!visited.has(neighbor)) {
          const cycle = isCyclicUtil(neighbor, dag, visited, recStack, path);
          if (cycle) return cycle;
        } else if (recStack.has(neighbor)) {
          // Cycle found
          const cycleStart = path.indexOf(neighbor);
          return path.slice(cycleStart);
        }
      }
    }
  }

  recStack.delete(v);
  path.pop();
  return null;
}
