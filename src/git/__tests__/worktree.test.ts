import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GitWorktreeManager } from '../worktree';
import { SimpleGit, simpleGit } from 'simple-git';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('GitWorktreeManager', () => {
    let tempDir: string;
    let worktreeDir: string;
    let worktreeManager: GitWorktreeManager;
    let git: SimpleGit;

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'git-worktree-test-base-'));
        worktreeDir = path.join(os.tmpdir(), `git-worktree-test-wt-${Date.now()}`);

        git = simpleGit(tempDir);
        await git.init();
        await fs.writeFile(path.join(tempDir, 'README.md'), '# Test Repo');
        await git.add('README.md');
        await git.commit('Initial commit');
        await git.branch(['-M', 'main']);

        worktreeManager = new GitWorktreeManager(tempDir);
    });

    afterEach(async () => {
        try {
            await worktreeManager.remove(worktreeDir, true);
        } catch (e) {
            // Ignored
        }
        await fs.rm(tempDir, { recursive: true, force: true });
        await fs.rm(worktreeDir, { recursive: true, force: true }).catch(() => { });
    });

    it('should create a worktree', async () => {
        await worktreeManager.add('feature/wt-test', worktreeDir);
        const exists = await fs.access(path.join(worktreeDir, '.git')).then(() => true).catch(() => false);
        expect(exists).toBe(true);

        const wtGit = simpleGit(worktreeDir);
        const branch = await wtGit.branch();
        expect(branch.current).toBe('feature/wt-test');
    });

    it('should list worktrees', async () => {
        await worktreeManager.add('feature/wt-list', worktreeDir);
        const list = await worktreeManager.list();
        const paths = list.map(wt => wt.path);
        // Note: simple-git might return absolute paths, need to be careful with OS differences
        expect(paths.some(p => p.includes(path.basename(worktreeDir)))).toBe(true);
    });

    it('should remove a worktree', async () => {
        await worktreeManager.add('feature/wt-remove', worktreeDir);
        await worktreeManager.remove(worktreeDir);
        const exists = await fs.access(worktreeDir).then(() => true).catch(() => false);
        expect(exists).toBe(false);
    });
});
