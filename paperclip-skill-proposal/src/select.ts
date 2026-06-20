/**
 * Profile selection
 * -----------------
 * Pick the template profile that best fits an opportunity, by comparing the
 * opportunity text to each profile's description embedding. Deterministic and
 * cheap (no extra model call), and the user can always override.
 */
import type { TemplateProfile } from "./profiles.js";
import type { Model } from "./model.js";

export function cosine(a: number[], b: number[]): number {
  if (!a.length || a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export interface Ranked { profile: TemplateProfile; score: number; }

/** Rank profiles by similarity to the opportunity (best first). */
export async function rankProfiles(
  opportunity: string, profiles: TemplateProfile[], model: Model
): Promise<Ranked[]> {
  const oppVec = await model.embed(opportunity);
  return profiles
    .map((profile) => ({
      profile,
      score: profile.descriptionEmbedding ? cosine(oppVec, profile.descriptionEmbedding) : 0,
    }))
    .sort((a, b) => b.score - a.score);
}
