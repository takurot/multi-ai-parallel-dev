/**
 * Tests for model profile parser
 */
import { describe, it, expect } from "vitest";
import { parseModelProfiles } from "./model-profile";

describe("Model Profile Parser", () => {
  it("should parse valid model profiles from YAML", () => {
    const yamlContent = `
version: "1.0"
models:
  - id: "openai-gpt4o-mini"
    provider: "openai"
    model: "gpt-4o-mini"
    costPer1kInputTokens: 0.00015
    costPer1kOutputTokens: 0.0006
    maxTokensPerCall: 128000
    qualityTags: ["fast", "cheap", "ok-code"]
    defaultUse: ["tests", "refactor", "docs"]
    tier: 1
  - id: "openai-gpt4o"
    provider: "openai"
    model: "gpt-4o"
    costPer1kInputTokens: 0.0025
    costPer1kOutputTokens: 0.01
    maxTokensPerCall: 128000
    qualityTags: ["high-quality-code"]
    defaultUse: ["public-api", "core-domain"]
    tier: 2
`;

    const profiles = parseModelProfiles(yamlContent);

    expect(profiles).toHaveLength(2);

    const firstProfile = profiles[0];
    expect(firstProfile.id).toBe("openai-gpt4o-mini");
    expect(firstProfile.provider).toBe("openai");
    expect(firstProfile.model).toBe("gpt-4o-mini");
    expect(firstProfile.costPer1kInputTokens).toBe(0.00015);
    expect(firstProfile.costPer1kOutputTokens).toBe(0.0006);
    expect(firstProfile.maxTokensPerCall).toBe(128000);
    expect(firstProfile.qualityTags).toEqual(["fast", "cheap", "ok-code"]);
    expect(firstProfile.defaultUse).toEqual(["tests", "refactor", "docs"]);
    expect(firstProfile.tier).toBe(1);

    const secondProfile = profiles[1];
    expect(secondProfile.id).toBe("openai-gpt4o");
    expect(secondProfile.tier).toBe(2);
  });

  it("should throw error for invalid YAML", () => {
    const invalidYaml = `
version: "1.0"
models:
  - invalid: structure
`;

    expect(() => parseModelProfiles(invalidYaml)).toThrow();
  });

  it("should throw error for missing required fields", () => {
    const incompleteYaml = `
version: "1.0"
models:
  - id: "test-model"
    # missing required fields
`;

    expect(() => parseModelProfiles(incompleteYaml)).toThrow();
  });

  it("should return empty array for empty models list", () => {
    const emptyYaml = `
version: "1.0"
models: []
`;

    const profiles = parseModelProfiles(emptyYaml);
    expect(profiles).toEqual([]);
  });
});
