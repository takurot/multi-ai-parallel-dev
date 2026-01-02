import {
  TaskContext,
  ExecutionResult,
  ReviewResult,
  CostEstimate,
} from "./types.js";

/**
 * Interface that all tool adapters must implement.
 * Tool adapters wrap external AI tools (Codex CLI, Claude Code, OpenAI API, etc.)
 * to provide a unified interface for the orchestrator.
 */
export interface ToolAdapter {
  /**
   * Get the unique name of this adapter (e.g., "codex-cli", "claude-api")
   */
  getName(): string;

  /**
   * Check if this adapter is available and properly configured.
   * This should verify API keys, CLI availability, etc.
   */
  isAvailable(): Promise<boolean>;

  /**
   * Execute a task using this tool.
   * @param context - The task context including task definition and worktree path
   * @returns The execution result including success status and output
   */
  execute(context: TaskContext): Promise<ExecutionResult>;

  /**
   * Review code changes using this tool.
   * @param context - The task context
   * @param diff - The git diff to review
   * @returns The review result including approval status and comments
   */
  review(context: TaskContext, diff: string): Promise<ReviewResult>;

  /**
   * Estimate the cost of executing a task.
   * @param context - The task context
   * @returns Cost estimate in tokens and USD
   */
  estimateCost(context: TaskContext): Promise<CostEstimate>;
}
