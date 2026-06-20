/**
 * Draft a proposal
 * ----------------
 * Combines the selected template profile (structure), the firm's style (from the
 * memory brain), and relevant past content (also from the brain) into a complete
 * draft. Guardrails are in the prompt: follow the structure, write in-voice, never
 * fabricate client facts/numbers, and mark unknowns as [TBD].
 */
import type { ProposalConfig } from "./config.js";
import type { Model } from "./model.js";
import type { TemplateProfile } from "./profiles.js";
import { searchMemory } from "./memory-client.js";

export interface DraftInput { profile: TemplateProfile; opportunity: string; }

const SYSTEM = (firm: string) =>
  `You are drafting a client proposal for ${firm}. Write in the firm's established voice (see STYLE).
Follow the TEMPLATE STRUCTURE exactly, in order, using each section's guidance. Use RELEVANT PAST
CONTENT only as a reference for phrasing and approach — do NOT copy client-specific facts from it, and
do NOT fabricate numbers, names, dates, prices, or commitments. Where a needed detail is unknown,
insert a clear [TBD: what's needed] marker instead of guessing. Output a complete proposal in Markdown.`;

export async function draftProposal(
  cfg: ProposalConfig, input: DraftInput, model: Model
): Promise<string> {
  const { profile, opportunity } = input;

  // Pull references + style from the memory brain (best-effort).
  const refs = await searchMemory(cfg, opportunity, 8, "type = 'proposal'").catch(() => []);
  const styleHits = await searchMemory(cfg, "proposals style voice tone structure", 4, "type = 'profile'").catch(() => []);
  const style = styleHits.map((h) => h.text).join("\n\n");
  const refsText = refs.map((h) => `# ${h.notePath}\n${h.text}`).join("\n\n---\n\n").slice(0, 16000);

  const structure = profile.sections
    .map((s, i) => `${i + 1}. ${s.heading} — ${s.purpose}\n   guidance: ${s.guidance}`)
    .join("\n");

  const user =
    `OPPORTUNITY:\n${opportunity}\n\n` +
    `TEMPLATE STRUCTURE (${profile.name}):\n${structure}\n\n` +
    `PLACEHOLDERS TO FILL OR MARK [TBD]: ${profile.variables.join(", ") || "(none)"}\n\n` +
    `STYLE:\n${style || "(no style profile on file — use a clear, professional B2B voice)"}\n\n` +
    `RELEVANT PAST CONTENT (reference only):\n${refsText || "(none retrieved)"}\n\n` +
    `Write the full proposal now.`;

  return model.chat([
    { role: "system", content: SYSTEM(cfg.firmName) },
    { role: "user", content: user },
  ]);
}
