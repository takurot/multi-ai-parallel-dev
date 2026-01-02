export interface DiffFile {
  file: string;
  insertions: number;
  deletions: number;
  content?: string;
}

export class DiffParser {
  /**
   * Parse a raw git diff into a more structured format if needed.
   * For now, we mainly rely on simple-git's diffSummary, but we can extend this.
   */
  static parseRawDiff(raw: string): string {
    return raw;
  }

  /**
   * Format diff for LLM consumption.
   */
  static formatForLLM(diff: string): string {
    if (!diff) return "No changes.";
    return `\`\`\`diff\n${diff}\n\`\`\``;
  }
}
