/**
 * Model profile parser
 */
import { ModelProfile } from "./types";
import * as yaml from "js-yaml";

interface RawModelProfile {
  id: unknown;
  provider: unknown;
  model: unknown;
  costPer1kInputTokens: unknown;
  costPer1kOutputTokens: unknown;
  maxTokensPerCall: unknown;
  qualityTags: unknown;
  defaultUse: unknown;
  tier: unknown;
}

export function parseModelProfiles(yamlContent: string): ModelProfile[] {
  try {
    const parsed = yaml.load(yamlContent) as { models?: RawModelProfile[] };

    if (!parsed || !parsed.models || !Array.isArray(parsed.models)) {
      throw new Error(
        "Invalid YAML structure: missing or invalid models array",
      );
    }

    const profiles: ModelProfile[] = [];

    for (const model of parsed.models) {
      // Validate required fields
      if (!model.id || typeof model.id !== "string") {
        throw new Error("Missing or invalid model id");
      }
      if (!model.provider || typeof model.provider !== "string") {
        throw new Error("Missing or invalid model provider");
      }
      if (!model.model || typeof model.model !== "string") {
        throw new Error("Missing or invalid model name");
      }
      if (typeof model.costPer1kInputTokens !== "number") {
        throw new Error("Missing or invalid costPer1kInputTokens");
      }
      if (typeof model.costPer1kOutputTokens !== "number") {
        throw new Error("Missing or invalid costPer1kOutputTokens");
      }
      if (typeof model.maxTokensPerCall !== "number") {
        throw new Error("Missing or invalid maxTokensPerCall");
      }
      if (!Array.isArray(model.qualityTags)) {
        throw new Error("Missing or invalid qualityTags array");
      }
      if (!Array.isArray(model.defaultUse)) {
        throw new Error("Missing or invalid defaultUse array");
      }
      if (typeof model.tier !== "number") {
        throw new Error("Missing or invalid tier");
      }

      const profile: ModelProfile = {
        id: model.id,
        provider: model.provider,
        model: model.model,
        costPer1kInputTokens: model.costPer1kInputTokens,
        costPer1kOutputTokens: model.costPer1kOutputTokens,
        maxTokensPerCall: model.maxTokensPerCall,
        qualityTags: model.qualityTags as string[],
        defaultUse: model.defaultUse as string[],
        tier: model.tier,
      };

      profiles.push(profile);
    }

    return profiles;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse model profiles: ${errorMessage}`);
  }
}
