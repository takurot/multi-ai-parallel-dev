import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GitManager } from '../manager';
import { SimpleGit, simpleGit } from 'simple-git';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('GitManager', () => {
    let tempDir: string;
    let gitManager: GitManager;
    let git: SimpleGit;

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'git-manager-test-'));
        git = simpleGit(tempDir);
        await git.init();
        // Create a dummy file and commit it to have a 'main' branch
        await fs.writeFile(path.join(tempDir, 'README.md'), '# Test Repo');
        await git.add('README.md');
        await git.commit('Initial commit');
        await git.branch(['-M', 'main']);

        gitManager = new GitManager({ baseDir: tempDir });
    });

    afterEach(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    it('should initialize correctly', () => {
        expect(gitManager).toBeDefined();
    });

    it('should create a new branch', async () => {
        await gitManager.createBranch('feature/test');
        const branches = await git.branch();
        expect(branches.all).toContain('feature/test');
    });

    it('should list branches', async () => {
        await git.checkoutLocalBranch('feature/a');
        await git.checkout('main');
        await git.checkoutLocalBranch('feature/b');

        const branches = await gitManager.listBranches();
        const branchNames = branches.map((b: any) => b.name);
        expect(branchNames).toContain('main');
        expect(branchNames).toContain('feature/a');
        expect(branchNames).toContain('feature/b');
    });

    it('should delete a branch', async () => {
        await git.checkoutLocalBranch('feature/to-delete');
        await git.checkout('main');
        await gitManager.deleteBranch('feature/to-delete');
        const branches = await git.branch();
        expect(branches.all).not.toContain('feature/to-delete');
    });

    it('should commit changes', async () => {
        await fs.writeFile(path.join(tempDir, 'test.txt'), 'content');
        await gitManager.commit('feat: add test.txt', ['test.txt']);
        const log = await git.log();
        expect(log.latest?.message).toBe('feat: add test.txt');
    });

    it('should get diff from a specific commit/branch', async () => {
        // Create a new branch and change a file
        await git.checkoutLocalBranch('feature/diff-test');
        await fs.writeFile(path.join(tempDir, 'README.md'), '# Updated Repo');
        await git.add('README.md');
        await git.commit('Update README');

        const diffResult = await gitManager.getDiff('main', 'feature/diff-test');
        expect(diffResult.files).toContain('README.md');
        expect(diffResult.diff).toContain('+# Updated Repo');
    });

    it('should rebase successfully', async () => {
        // Create feature branch
        await gitManager.createBranch('feature/rebase-ok');
        await fs.writeFile(path.join(tempDir, 'feature.txt'), 'feature content');
        await gitManager.commit('feat: add feature.txt', ['feature.txt']);

        // Go back to main and add a commit
        await gitManager.checkout('main');
        await fs.writeFile(path.join(tempDir, 'main.txt'), 'main content');
        await gitManager.commit('feat: add main.txt', ['main.txt']);

        // Rebase feature onto main
        await gitManager.checkout('feature/rebase-ok');
        const result = await gitManager.rebase('main');
        expect(result.success).toBe(true);

        const exists = await fs.access(path.join(tempDir, 'main.txt')).then(() => true).catch(() => false);
        expect(exists).toBe(true);
    });

    it('should detect conflicts during rebase', async () => {
        // Create feature branch
        await gitManager.createBranch('feature/conflict');
        await fs.writeFile(path.join(tempDir, 'conflict.txt'), 'feature content');
        await gitManager.commit('feat: change conflict.txt', ['conflict.txt']);

        // Go back to main and add a conflicting commit
        await gitManager.checkout('main');
        await fs.writeFile(path.join(tempDir, 'conflict.txt'), 'main content');
        await gitManager.commit('feat: conflict change', ['conflict.txt']);

        // Rebase feature onto main - should fail due to conflict
        await gitManager.checkout('feature/conflict');
        const result = await gitManager.rebase('main');
        expect(result.success).toBe(false);
        expect(result.conflicts).toContain('conflict.txt');

        // Abort the rebase to clean up
        await git.raw(['rebase', '--abort']);
    });
});
