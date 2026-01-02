import { simpleGit, SimpleGit } from "simple-git";
import { GitBranchInfo, GitManagerOptions, RebaseResult } from "./types.js";

export class GitManager {
  private git: SimpleGit;
  private options: GitManagerOptions;

  constructor(options: GitManagerOptions) {
    this.options = options;
    this.git = simpleGit(options.baseDir);
  }

  /**
   * Create a new branch and switch to it.
   */
  async createBranch(branchName: string): Promise<void> {
    await this.git.checkoutLocalBranch(branchName);
  }

  /**
   * List all local branches.
   */
  async listBranches(): Promise<GitBranchInfo[]> {
    const branchResult = await this.git.branch();
    return Object.values(branchResult.branches).map((b) => ({
      name: b.name,
      current: b.current,
      commit: b.commit,
    }));
  }

  /**
   * Delete a branch.
   */
  async deleteBranch(branchName: string, force = false): Promise<void> {
    const args = ["-d"];
    if (force) {
      args[0] = "-D";
    }
    await this.git.branch([...args, branchName]);
  }

  /**
   * Switch to an existing branch.
   */
  async checkout(branchName: string): Promise<void> {
    await this.git.checkout(branchName);
  }

  /**
   * Add files and commit.
   */
  async commit(message: string, files: string[] = ["."]): Promise<void> {
    await this.git.add(files);
    await this.git.commit(message);
  }

  /**
   * Get diff between two branches or commits.
   */
  async getDiff(
    from: string,
    to: string,
  ): Promise<{ files: string[]; diff: string }> {
    const diffText = await this.git.diff([`${from}..${to}`]);
    const summary = await this.git.diffSummary([`${from}..${to}`]);
    return {
      files: summary.files.map((f) => f.file),
      diff: diffText,
    };
  }

  /**
   * Rebase current branch onto another branch.
   */
  async rebase(onto: string): Promise<RebaseResult> {
    try {
      await this.git.rebase([onto]);
      return { success: true };
    } catch (error) {
      if (error instanceof Error && error.message.includes("CONFLICT")) {
        const status = await this.git.status();
        return {
          success: false,
          conflicts: status.conflicted,
          error: error.message,
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
