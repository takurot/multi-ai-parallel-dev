import { describe, it, expect } from "vitest";
import { DiffParser } from "../diff";

describe("DiffParser", () => {
  it("should format diff for LLM consumption", () => {
    const diff = "--- a/file\n+++ b/file\n+ added line";
    const formatted = DiffParser.formatForLLM(diff);
    expect(formatted).toContain("```diff");
    expect(formatted).toContain(diff);
  });

  it('should return "No changes." for empty diff', () => {
    expect(DiffParser.formatForLLM("")).toBe("No changes.");
  });
});
