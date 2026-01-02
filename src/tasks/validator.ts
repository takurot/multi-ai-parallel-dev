import { TasksFile } from "./types.js";

export interface ValidationError {
  code: string;
  message: string;
  path?: (string | number)[];
}

export function validateTasksSemantics(file: TasksFile): ValidationError[] {
  const errors: ValidationError[] = [];
  const taskIds = new Set<string>();

  // Check for duplicate IDs
  file.tasks.forEach((task, index) => {
    if (taskIds.has(task.id)) {
      errors.push({
        code: "DUPLICATE_TASK_ID",
        message: `Duplicate task ID found: "${task.id}"`,
        path: ["tasks", index, "id"],
      });
    } else {
      taskIds.add(task.id);
    }
  });

  return errors;
}
