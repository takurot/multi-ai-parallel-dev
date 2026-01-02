import { z } from 'zod';
export declare const ConfigSchema: z.ZodObject<{
    version: z.ZodDefault<z.ZodString>;
    parallelism: z.ZodDefault<z.ZodObject<{
        maxConcurrentTasks: z.ZodDefault<z.ZodNumber>;
        maxConcurrentPerRepo: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        maxConcurrentTasks: number;
        maxConcurrentPerRepo: number;
    }, {
        maxConcurrentTasks?: number | undefined;
        maxConcurrentPerRepo?: number | undefined;
    }>>;
    budget: z.ZodDefault<z.ZodObject<{
        monthlyLimitUsd: z.ZodDefault<z.ZodNumber>;
        dailyTokenLimit: z.ZodDefault<z.ZodNumber>;
        warnAtPercent: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        monthlyLimitUsd: number;
        dailyTokenLimit: number;
        warnAtPercent: number;
    }, {
        monthlyLimitUsd?: number | undefined;
        dailyTokenLimit?: number | undefined;
        warnAtPercent?: number | undefined;
    }>>;
    git: z.ZodDefault<z.ZodObject<{
        defaultBranch: z.ZodDefault<z.ZodString>;
        branchPrefix: z.ZodDefault<z.ZodString>;
        autoCleanupWorktrees: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        defaultBranch: string;
        branchPrefix: string;
        autoCleanupWorktrees: boolean;
    }, {
        defaultBranch?: string | undefined;
        branchPrefix?: string | undefined;
        autoCleanupWorktrees?: boolean | undefined;
    }>>;
    logging: z.ZodDefault<z.ZodObject<{
        level: z.ZodDefault<z.ZodEnum<["debug", "info", "warn", "error"]>>;
        format: z.ZodDefault<z.ZodEnum<["json", "text"]>>;
        outputDir: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        level: "debug" | "info" | "warn" | "error";
        format: "json" | "text";
        outputDir: string;
    }, {
        level?: "debug" | "info" | "warn" | "error" | undefined;
        format?: "json" | "text" | undefined;
        outputDir?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    version: string;
    parallelism: {
        maxConcurrentTasks: number;
        maxConcurrentPerRepo: number;
    };
    budget: {
        monthlyLimitUsd: number;
        dailyTokenLimit: number;
        warnAtPercent: number;
    };
    git: {
        defaultBranch: string;
        branchPrefix: string;
        autoCleanupWorktrees: boolean;
    };
    logging: {
        level: "debug" | "info" | "warn" | "error";
        format: "json" | "text";
        outputDir: string;
    };
}, {
    version?: string | undefined;
    parallelism?: {
        maxConcurrentTasks?: number | undefined;
        maxConcurrentPerRepo?: number | undefined;
    } | undefined;
    budget?: {
        monthlyLimitUsd?: number | undefined;
        dailyTokenLimit?: number | undefined;
        warnAtPercent?: number | undefined;
    } | undefined;
    git?: {
        defaultBranch?: string | undefined;
        branchPrefix?: string | undefined;
        autoCleanupWorktrees?: boolean | undefined;
    } | undefined;
    logging?: {
        level?: "debug" | "info" | "warn" | "error" | undefined;
        format?: "json" | "text" | undefined;
        outputDir?: string | undefined;
    } | undefined;
}>;
export type Config = z.infer<typeof ConfigSchema>;
export declare const CredentialsSchema: z.ZodObject<{
    version: z.ZodDefault<z.ZodString>;
    providers: z.ZodRecord<z.ZodString, z.ZodObject<{
        apiKey: z.ZodOptional<z.ZodString>;
        token: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        apiKey?: string | undefined;
        token?: string | undefined;
    }, {
        apiKey?: string | undefined;
        token?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    version: string;
    providers: Record<string, {
        apiKey?: string | undefined;
        token?: string | undefined;
    }>;
}, {
    providers: Record<string, {
        apiKey?: string | undefined;
        token?: string | undefined;
    }>;
    version?: string | undefined;
}>;
export type Credentials = z.infer<typeof CredentialsSchema>;
