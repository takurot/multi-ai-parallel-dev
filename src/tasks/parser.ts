import yaml from "js-yaml";
import { TasksFileSchema } from "./schema.js";
import { TasksFile } from "./types.js";
import { ZodError } from "zod";

export class TaskParseError extends Error {
  constructor(
    message: string,
    public parseErrors?: ZodError,
  ) {
    super(message);
    this.name = "TaskParseError";
  }
}

export function parseTasksFile(content: string): TasksFile {
  let parsed: unknown;
  try {
    parsed = yaml.load(content);
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    throw new TaskParseError(`Failed to parse YAML: ${errorMsg}`);
  }

  const result = TasksFileSchema.safeParse(parsed);

  if (!result.success) {
    // Format Zod error messages to be more readable
    const formattedError = result.error;
    throw new TaskParseError("Validation failed", formattedError);
  }

  const data = result.data;

  // Apply defaults from root to tasks
  const tasks = data.tasks.map((task) => ({
    ...task,
    repo: task.repo ?? data.defaultRepo,
    tool: task.tool ?? data.defaultTool,
    mergePolicy: task.mergePolicy ?? data.defaultMergePolicy,
  }));

  return {
    ...data,
    tasks,
  };
}
