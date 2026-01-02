export interface GitBranchInfo {
    name: string;
    current: boolean;
    commit: string;
}

export interface GitDiffResult {
    files: string[];
    diff: string;
}

export interface GitWorktreeInfo {
    path: string;
    head: string;
    branch: string;
}

export interface GitManagerOptions {
    baseDir: string;
    defaultBranch?: string;
}

export interface RebaseResult {
    success: boolean;
    conflicts?: string[];
    error?: string;
}
