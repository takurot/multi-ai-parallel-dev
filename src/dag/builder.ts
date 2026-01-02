import { Dag, DagNode } from "./types.js";
import { Task, TaskId } from "../tasks/types.js";
import { detectCycle } from "./cycle-detector.js";
import { OrchestratorError, ErrorCode } from "../errors/index.js";

export function buildDag(tasks: Task[]): Dag {
  const nodes = new Map<TaskId, DagNode>();

  // Initialize nodes
  for (const task of tasks) {
    nodes.set(task.id, {
      id: task.id,
      dependencies: task.dependsOn || [],
      dependents: [],
    });
  }

  // Validate dependencies and populate dependents
  for (const node of nodes.values()) {
    for (const depId of node.dependencies) {
      const depNode = nodes.get(depId);
      if (!depNode) {
        throw new OrchestratorError(
          ErrorCode.TASK_DEPENDENCY_NOT_FOUND,
          `Task dependency not found: "${depId}" for task "${node.id}"`,
          { depId, taskId: node.id },
        );
      }
      depNode.dependents.push(node.id);
    }
  }

  const dag: Dag = { nodes };

  // Cycle detection
  const cycle = detectCycle(dag);
  if (cycle) {
    throw new OrchestratorError(
      ErrorCode.DAG_CYCLE_DETECTED,
      `Cycle detected in task dependencies: ${cycle.join(" -> ")}`,
      { cycle },
    );
  }

  return dag;
}
