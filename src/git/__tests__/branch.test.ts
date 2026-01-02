import { describe, it, expect } from 'vitest';
import { BranchManager } from '../branch';

describe('BranchManager', () => {
    it('should generate a branch name with default prefix', () => {
        const manager = new BranchManager();
        expect(manager.generateName('PR-04')).toBe('feature/ai-pr-04');
    });

    it('should generate a branch name with custom prefix', () => {
        const manager = new BranchManager({ prefix: 'fix/' });
        expect(manager.generateName('bug-fix')).toBe('fix/bug-fix');
    });

    it('should sanitize input string', () => {
        const manager = new BranchManager();
        expect(manager.generateName('Task #123: complex_title! ')).toBe('feature/ai-task-123-complex-title');
    });

    it('should correctly identify AI branches', () => {
        const manager = new BranchManager();
        expect(manager.isAIBranch('feature/ai-test')).toBe(true);
        expect(manager.isAIBranch('main')).toBe(false);
        expect(manager.isAIBranch('feature/other')).toBe(false);
    });
});
