import { z } from "zod";

export const TaskExecutionSchema = z.object({
  maxRetries: z.number().default(1),
  escalateOnRetry: z.boolean().default(false),
  timeoutMinutes: z.number().default(30),
});

export const TaskValidationSchema = z.object({
  enabled: z.boolean().default(true),
  cmd: z.string(),
  lintCmd: z.string().optional(),
  stopOnFailure: z.boolean().default(false),
  maxValidationRetries: z.number().default(2),
});

export const TaskReviewSchema = z.object({
  enabled: z.boolean().default(true),
  reviewerTool: z.string().optional(),
  strictness: z.enum(["lenient", "normal", "strict"]).default("normal"),
  humanGate: z.boolean().default(false),
  autoFix: z.boolean().default(false),
});

export const TaskSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  repo: z.string().optional(),
  tool: z.string().optional(),
  dependsOn: z.array(z.string()).default([]),
  mergePolicy: z.enum(["pr-only", "auto-merge"]).optional(), // Optional because it can inherit from default
  costTier: z.enum(["low", "medium", "high"]).optional(),
  complexityHint: z.string().optional(),
  execution: TaskExecutionSchema.default({}),
  validation: TaskValidationSchema.optional(),
  review: TaskReviewSchema.default({}),
});

export const TasksFileSchema = z.object({
  version: z.string().default("1.0"),
  project: z.string(),
  defaultRepo: z.string().optional(),
  defaultTool: z.string().optional(),
  defaultMergePolicy: z.enum(["pr-only", "auto-merge"]).default("pr-only"),
  tasks: z.array(TaskSchema),
});
