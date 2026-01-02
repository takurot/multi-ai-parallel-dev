export interface BranchNamingOptions {
    prefix?: string;
    sanitize?: boolean;
}

export class BranchManager {
    private prefix: string;

    constructor(options: BranchNamingOptions = {}) {
        this.prefix = options.prefix || 'feature/ai-';
    }

    /**
     * Generate a branch name from a task ID or title.
     */
    generateName(id: string): string {
        const sanitizedId = id
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        return `${this.prefix}${sanitizedId}`;
    }

    /**
     * Check if a branch name follows our naming convention.
     */
    isAIBranch(branchName: string): boolean {
        return branchName.startsWith(this.prefix);
    }
}
