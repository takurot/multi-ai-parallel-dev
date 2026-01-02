/**
 * Model selection logic
 */
import { ModelProfile, TaskAttributes } from "./types";

export function selectModel(
  models: ModelProfile[],
  task: TaskAttributes,
): ModelProfile | undefined {
  if (models.length === 0) {
    return undefined;
  }

  // Sort models by tier to ensure we consider escalation order
  const sortedModels = [...models].sort((a, b) => a.tier - b.tier);

  // First, filter models based on cost tier preference
  let filteredModels: ModelProfile[];

  // Use if/else instead of switch to avoid lexical declaration issues
  if (task.costTier === "low") {
    // For low cost tier, prefer lower tier models
    const minTier = Math.min(...sortedModels.map((m) => m.tier));
    filteredModels = sortedModels.filter((model) => model.tier === minTier);
  } else if (task.costTier === "high") {
    // For high cost tier, prefer higher tier models
    const maxTier = Math.max(...sortedModels.map((m) => m.tier));
    filteredModels = sortedModels.filter((model) => model.tier === maxTier);
  } else {
    // 'medium' or default
    // For medium cost tier, prefer middle tier models
    const allTiers = sortedModels.map((m) => m.tier);
    const allMinTier = Math.min(...allTiers);
    const allMaxTier = Math.max(...allTiers);

    if (allMinTier === allMaxTier) {
      // If all models have the same tier, use all of them
      filteredModels = sortedModels;
    } else {
      // Find the middle tier from unique tiers
      const uniqueTiers = [...new Set(allTiers)].sort((a, b) => a - b);

      let middleTier: number;
      if (uniqueTiers.length % 2 === 0) {
        // For even number of tiers, select the lower middle value to balance the "medium" selection
        const lowerMidIndex = Math.floor(uniqueTiers.length / 2) - 1;
        middleTier = uniqueTiers[lowerMidIndex];
      } else {
        // For odd number of tiers, select the true middle value
        const midIndex = Math.floor(uniqueTiers.length / 2);
        middleTier = uniqueTiers[midIndex];
      }

      filteredModels = sortedModels.filter(
        (model) => model.tier === middleTier,
      );

      // If no exact middle tier, pick closest to the calculated middle
      if (filteredModels.length === 0) {
        const targetTier = Math.round((allMinTier + allMaxTier) / 2);
        const closestModel = sortedModels.reduce((closest, current) => {
          const currentDiff = Math.abs(current.tier - targetTier);
          const closestDiff = Math.abs(closest.tier - targetTier);
          return currentDiff < closestDiff ? current : closest;
        });
        filteredModels = [closestModel];
      }
    }
  }

  // Among the filtered models, try to match the complexity hint
  const complexityMatches = filteredModels.filter((model) =>
    model.defaultUse.includes(task.complexityHint),
  );

  if (complexityMatches.length > 0) {
    // If there are complexity matches, return the first one (or any)
    return complexityMatches[0];
  }

  // If no complexity matches, return the first model in the filtered list
  return filteredModels.length > 0 ? filteredModels[0] : sortedModels[0];
}
