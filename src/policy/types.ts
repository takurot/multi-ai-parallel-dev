/**
 * Model profile and cost policy types
 */

export interface ModelProfile {
  id: string;
  provider: string;
  model: string;
  costPer1kInputTokens: number; // USD per 1k input tokens
  costPer1kOutputTokens: number; // USD per 1k output tokens
  maxTokensPerCall: number;
  qualityTags: string[];
  defaultUse: string[];
  tier: number; // For escalation order
}

export interface CostPolicy {
  monthlyLimitUsd?: number;
  dailyTokenLimit?: number;
  warnAtPercent?: number;
}

export interface TaskAttributes {
  costTier: "low" | "medium" | "high";
  complexityHint: string;
}

export interface CostEstimate {
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

export interface BudgetState {
  monthlyCostSpent: number; // USD spent in the current month
  dailyTokenSpent: number; // tokens consumed in the current day
  monthlyCostLimit: number; // USD limit per month
  dailyTokenLimit: number; // token limit per day
}
