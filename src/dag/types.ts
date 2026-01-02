import { TaskId } from "../tasks/types.js";

export interface DagNode {
  id: TaskId;
  dependencies: TaskId[];
  dependents: TaskId[];
}

export interface Dag {
  nodes: Map<TaskId, DagNode>;
}

export interface CycleError {
  cycle: TaskId[];
}
