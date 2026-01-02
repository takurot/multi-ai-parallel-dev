import { describe, it, expect } from "vitest";
import { parseTasksFile } from "./parser";
import { validateTasksSemantics } from "./validator";

describe("Task Parser & Validator", () => {
  const validYaml = `
version: "1.0"
project: "test-project"
defaultRepo: "./"
defaultTool: "codex"
tasks:
  - id: "task-1"
    title: "Task 1"
    execution:
      maxRetries: 3
  - id: "task-2"
    title: "Task 2"
    dependsOn: ["task-1"]
`;

  it("should parse valid YAML correctly", () => {
    const result = parseTasksFile(validYaml);
    expect(result.project).toBe("test-project");
    expect(result.tasks).toHaveLength(2);
    expect(result.tasks[0].id).toBe("task-1");
    expect(result.tasks[0].repo).toBe("./"); // Inherited default
    expect(result.tasks[0].tool).toBe("codex"); // Inherited default
    expect(result.tasks[0].execution.maxRetries).toBe(3);
    expect(result.tasks[1].dependsOn).toEqual(["task-1"]);
  });

  it("should throw error on invalid YAML syntax", () => {
    const invalidYaml = `
version: "1.0"
tasks:
  - id: "task-1"
    title: "Task 1"
   bad indentation
`;
    expect(() => parseTasksFile(invalidYaml)).toThrow("Failed to parse YAML");
  });

  it("should throw validation error on schema mismatch", () => {
    const schemaInvalidYaml = `
version: "1.0"
project: "test-project"
tasks:
  - id: 123 
    title: "Task 1"
`;
    // id should be string
    expect(() => parseTasksFile(schemaInvalidYaml)).toThrow(
      /Validation failed/,
    );
  });

  it("should correcty apply defaults", () => {
    const partialYaml = `
version: "1.0"
project: "defaults-test"
defaultMergePolicy: "auto-merge"
tasks:
  - id: "task-1"
    title: "Task 1"
    # repo/tool/mergePolicy missing
`;
    const result = parseTasksFile(partialYaml);
    expect(result.tasks[0].mergePolicy).toBe("auto-merge");
  });

  it("should detect duplicate task IDs", () => {
    const duplicateYaml = `
version: "1.0"
project: "test-project"
tasks:
  - id: "task-1"
    title: "Task 1"
  - id: "task-1"
    title: "Task 1 Duplicate"
`;
    const parsed = parseTasksFile(duplicateYaml);
    const errors = validateTasksSemantics(parsed);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("DUPLICATE_TASK_ID");
  });
});
