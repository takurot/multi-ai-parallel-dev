import { simpleGit, SimpleGit } from 'simple-git';
import { GitWorktreeInfo } from './types.js';

export class GitWorktreeManager {
    private git: SimpleGit;
    private baseDir: string;

    constructor(baseDir: string) {
        this.baseDir = baseDir;
        this.git = simpleGit(baseDir);
    }

    /**
     * Add a new worktree.
     */
    async add(branch: string, path: string): Promise<void> {
        const branches = await this.git.branchLocal();
        const exists = branches.all.includes(branch);

        if (exists) {
            await this.git.raw(['worktree', 'add', path, branch]);
        } else {
            await this.git.raw(['worktree', 'add', '-b', branch, path]);
        }
    }

    /**
     * List all worktrees.
     */
    async list(): Promise<GitWorktreeInfo[]> {
        const raw = await this.git.raw(['worktree', 'list', '--porcelain']);
        const lines = raw.split('\n');
        const worktrees: GitWorktreeInfo[] = [];
        let current: Partial<GitWorktreeInfo> = {};

        for (const line of lines) {
            if (line.startsWith('worktree ')) {
                if (current.path) worktrees.push(current as GitWorktreeInfo);
                current = { path: line.substring(9) };
            } else if (line.startsWith('HEAD ')) {
                current.head = line.substring(5);
            } else if (line.startsWith('branch ')) {
                current.branch = line.substring(7);
            }
        }
        if (current.path) worktrees.push(current as GitWorktreeInfo);

        return worktrees;
    }

    /**
     * Remove a worktree.
     */
    async remove(path: string, force = false): Promise<void> {
        const args = ['worktree', 'remove', path];
        if (force) {
            args.push('--force');
        }
        await this.git.raw(args);
    }

    /**
     * Prune stale worktree information.
     */
    async prune(): Promise<void> {
        await this.git.raw(['worktree', 'prune']);
    }
}
