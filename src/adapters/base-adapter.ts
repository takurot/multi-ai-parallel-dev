import { ToolAdapter } from "./interface.js";
import {
  TaskContext,
  ExecutionResult,
  ReviewResult,
  CostEstimate,
} from "./types.js";

/**
 * Abstract base class for tool adapters.
 * Provides common functionality and default implementations.
 */
export abstract class BaseAdapter implements ToolAdapter {
  protected readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }

  /**
   * Check if this adapter is available. Override in subclasses.
   */
  abstract isAvailable(): Promise<boolean>;

  /**
   * Execute a task. Override in subclasses.
   */
  abstract execute(context: TaskContext): Promise<ExecutionResult>;

  /**
   * Review code changes. Override in subclasses.
   * Default implementation returns approval without comments.
   */
  async review(context: TaskContext, diff: string): Promise<ReviewResult> {
    // Default implementation - subclasses should override
    void context;
    void diff;
    return {
      approved: true,
      summary: "No review performed",
      comments: [],
      inputTokens: 0,
      outputTokens: 0,
      durationMs: 0,
    };
  }

  /**
   * Estimate cost. Override in subclasses.
   * Default implementation returns zero estimates.
   */
  async estimateCost(context: TaskContext): Promise<CostEstimate> {
    void context;
    return {
      estimatedInputTokens: 0,
      estimatedOutputTokens: 0,
      estimatedCostUsd: 0,
      modelId: this.name,
    };
  }

  /**
   * Helper method to create a successful execution result
   */
  protected createSuccessResult(
    output: string,
    modifiedFiles: string[],
    inputTokens: number,
    outputTokens: number,
    durationMs: number,
  ): ExecutionResult {
    return {
      success: true,
      output,
      modifiedFiles,
      inputTokens,
      outputTokens,
      durationMs,
    };
  }

  /**
   * Helper method to create a failed execution result
   */
  protected createErrorResult(
    error: string,
    inputTokens: number = 0,
    outputTokens: number = 0,
    durationMs: number = 0,
  ): ExecutionResult {
    return {
      success: false,
      output: "",
      error,
      modifiedFiles: [],
      inputTokens,
      outputTokens,
      durationMs,
    };
  }
}
