import { Task } from "../tasks/types.js";

/**
 * Result of a tool execution
 */
export interface ExecutionResult {
  /** Whether the execution was successful */
  success: boolean;
  /** Output content from the tool (generated code, response, etc.) */
  output: string;
  /** Error message if execution failed */
  error?: string;
  /** Number of input tokens used */
  inputTokens: number;
  /** Number of output tokens generated */
  outputTokens: number;
  /** Files that were created or modified */
  modifiedFiles: string[];
  /** Execution duration in milliseconds */
  durationMs: number;
}

/**
 * Severity level for review comments
 */
export type ReviewSeverity = "error" | "warning" | "info" | "suggestion";

/**
 * A single review comment
 */
export interface ReviewComment {
  /** File path relative to worktree */
  file: string;
  /** Line number (optional) */
  line?: number;
  /** Severity of the issue */
  severity: ReviewSeverity;
  /** Description of the issue */
  message: string;
  /** Suggested fix (optional) */
  suggestion?: string;
}

/**
 * Result of a code review
 */
export interface ReviewResult {
  /** Whether the review approved the changes */
  approved: boolean;
  /** Overall summary of the review */
  summary: string;
  /** List of review comments */
  comments: ReviewComment[];
  /** Number of input tokens used */
  inputTokens: number;
  /** Number of output tokens generated */
  outputTokens: number;
  /** Review duration in milliseconds */
  durationMs: number;
}

/**
 * Cost estimate for an operation
 */
export interface CostEstimate {
  /** Estimated number of input tokens */
  estimatedInputTokens: number;
  /** Estimated number of output tokens */
  estimatedOutputTokens: number;
  /** Estimated cost in USD */
  estimatedCostUsd: number;
  /** Model ID used for the estimate */
  modelId: string;
}

/**
 * Context passed to tool adapters
 */
export interface TaskContext {
  /** The task being executed */
  task: Task;
  /** Path to the worktree directory */
  worktreePath: string;
  /** Results from dependency tasks (if any) */
  dependencyResults: Map<string, ExecutionResult>;
  /** Additional context files */
  contextFiles: string[];
  /** Prompt additions (e.g., error logs from previous attempts) */
  additionalPrompt?: string;
  /** Retry attempt number (0 = first attempt) */
  retryAttempt: number;
}
