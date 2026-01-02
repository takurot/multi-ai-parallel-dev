import { z } from "zod";
import {
  TaskSchema,
  TasksFileSchema,
  TaskExecutionSchema,
  TaskValidationSchema,
  TaskReviewSchema,
} from "./schema.js";

export type TaskExecution = z.infer<typeof TaskExecutionSchema>;
export type TaskValidation = z.infer<typeof TaskValidationSchema>;
export type TaskReview = z.infer<typeof TaskReviewSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type TasksFile = z.infer<typeof TasksFileSchema>;

// Additional types that might be useful
export type TaskId = string;
export type MergePolicy = "pr-only" | "auto-merge";
export type CostTier = "low" | "medium" | "high";
export type ReviewStrictness = "lenient" | "normal" | "strict";
