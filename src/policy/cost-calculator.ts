/**
 * Cost calculation utilities
 */
import { ModelProfile, CostEstimate } from "./types";

export function calculateCost(
  model: ModelProfile,
  inputTokens: number,
  outputTokens: number,
): CostEstimate {
  const inputCost = (inputTokens / 1000) * model.costPer1kInputTokens;
  const outputCost = (outputTokens / 1000) * model.costPer1kOutputTokens;
  const totalCost = inputCost + outputCost;

  return {
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost,
  };
}
