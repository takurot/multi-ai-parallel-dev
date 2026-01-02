import { z } from "zod";

export const ConfigSchema = z.object({
  version: z.string().default("1.0"),
  parallelism: z
    .object({
      maxConcurrentTasks: z.number().default(5),
      maxConcurrentPerRepo: z.number().default(2),
    })
    .default({}),
  budget: z
    .object({
      monthlyLimitUsd: z.number().default(100),
      dailyTokenLimit: z.number().default(500000),
      warnAtPercent: z.number().default(80),
    })
    .default({}),
  git: z
    .object({
      defaultBranch: z.string().default("main"),
      branchPrefix: z.string().default("feature/ai-"),
      autoCleanupWorktrees: z.boolean().default(true),
    })
    .default({}),
  logging: z
    .object({
      level: z.enum(["debug", "info", "warn", "error"]).default("info"),
      format: z.enum(["json", "text"]).default("text"),
      outputDir: z.string().default(".orchestrator/logs"),
    })
    .default({}),
});

export type Config = z.infer<typeof ConfigSchema>;

export const CredentialsSchema = z.object({
  version: z.string().default("1.0"),
  providers: z.record(
    z.object({
      apiKey: z.string().optional(),
      token: z.string().optional(),
    }),
  ),
});

export type Credentials = z.infer<typeof CredentialsSchema>;
