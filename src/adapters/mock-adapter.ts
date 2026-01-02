import { BaseAdapter } from "./base-adapter.js";
import {
  TaskContext,
  ExecutionResult,
  ReviewResult,
  CostEstimate,
} from "./types.js";

/**
 * Configuration for MockAdapter behavior
 */
export interface MockAdapterConfig {
  /** Whether execute() should succeed */
  shouldSucceed?: boolean;
  /** Delay in ms before returning results */
  delayMs?: number;
  /** Custom output to return */
  customOutput?: string;
  /** Whether the adapter is available */
  isAvailable?: boolean;
  /** Whether review should approve */
  shouldApprove?: boolean;
}

/**
 * Mock adapter for testing purposes.
 * Simulates tool execution without making actual API calls.
 */
export class MockAdapter extends BaseAdapter {
  private config: MockAdapterConfig;
  private executionCount: number = 0;
  private reviewCount: number = 0;

  constructor(name: string = "mock-adapter", config: MockAdapterConfig = {}) {
    super(name);
    this.config = {
      shouldSucceed: true,
      delayMs: 0,
      customOutput: "Mock execution completed successfully",
      isAvailable: true,
      shouldApprove: true,
      ...config,
    };
  }

  async isAvailable(): Promise<boolean> {
    return this.config.isAvailable ?? true;
  }

  async execute(context: TaskContext): Promise<ExecutionResult> {
    this.executionCount++;

    if (this.config.delayMs && this.config.delayMs > 0) {
      await this.delay(this.config.delayMs);
    }

    const startTime = Date.now();

    if (this.config.shouldSucceed) {
      return this.createSuccessResult(
        this.config.customOutput ?? `Executed task: ${context.task.id}`,
        [`${context.worktreePath}/mock-output.ts`],
        100, // mock input tokens
        50, // mock output tokens
        Date.now() - startTime + (this.config.delayMs ?? 0),
      );
    } else {
      return this.createErrorResult(
        "Mock execution failed",
        100,
        0,
        Date.now() - startTime + (this.config.delayMs ?? 0),
      );
    }
  }

  async review(context: TaskContext, diff: string): Promise<ReviewResult> {
    this.reviewCount++;
    void context;

    if (this.config.delayMs && this.config.delayMs > 0) {
      await this.delay(this.config.delayMs);
    }

    const startTime = Date.now();

    return {
      approved: this.config.shouldApprove ?? true,
      summary: this.config.shouldApprove
        ? "Code looks good"
        : "Code needs improvements",
      comments: this.config.shouldApprove
        ? []
        : [
            {
              file: "mock-file.ts",
              line: 1,
              severity: "warning",
              message: "Mock review comment",
              suggestion: "Consider improving this code",
            },
          ],
      inputTokens: diff.length,
      outputTokens: 50,
      durationMs: Date.now() - startTime + (this.config.delayMs ?? 0),
    };
  }

  async estimateCost(context: TaskContext): Promise<CostEstimate> {
    // Rough estimate based on task title length
    const estimatedInputTokens = (context.task.title?.length ?? 50) * 10;
    const estimatedOutputTokens = estimatedInputTokens * 2;

    return {
      estimatedInputTokens,
      estimatedOutputTokens,
      estimatedCostUsd: (estimatedInputTokens + estimatedOutputTokens) * 0.0001,
      modelId: this.getName(),
    };
  }

  /**
   * Get the number of times execute() was called
   */
  getExecutionCount(): number {
    return this.executionCount;
  }

  /**
   * Get the number of times review() was called
   */
  getReviewCount(): number {
    return this.reviewCount;
  }

  /**
   * Reset counters
   */
  resetCounters(): void {
    this.executionCount = 0;
    this.reviewCount = 0;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MockAdapterConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
