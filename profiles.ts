/**
 * Template profiles
 * -----------------
 * A *template profile* captures one of your proposal templates (by project type):
 * its section structure, placeholders, tone, and a description used to match it to
 * an opportunity. You ingest a template once; the profile is reused for drafting.
 */
import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import type { Model } from "./model.js";

export interface ProfileSection {
  heading: string;
  purpose: string;   // one line: what this section is for
  guidance: string;  // what to write here
}

export interface TemplateProfile {
  id: string;
  name: string;
  /** One paragraph describing the kind of project/opportunity this template fits. */
  description: string;
  sections: ProfileSection[];
  /** Placeholders found in the template, e.g. "[Client Name]", "{{timeline}}". */
  variables: string[];
  tone: string;
  /** Embedding of `description`, for fast opportunity matching. */
  descriptionEmbedding?: number[];
  sourceTemplate?: string;
  created: string;
}

const ANALYSIS_PROMPT = `You are analyzing a proposal TEMPLATE document. Return STRICT JSON only
(no markdown, no commentary) with this exact shape:
{
  "description": "one paragraph: what kind of project/opportunity this template is for",
  "tone": "short description of the writing tone",
  "variables": ["placeholders found, e.g. [Client Name], {{date}}"],
  "sections": [ { "heading": "...", "purpose": "one line", "guidance": "what to write here" } ]
}
Base everything on the template provided. Do not invent sections that aren't implied by it.`;

function parseJsonLoose(s: string): any {
  const cleaned = s.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Model did not return JSON.");
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function buildProfileFromTemplate(
  templateText: string,
  meta: { id: string; name: string; sourceTemplate?: string },
  model: Model
): Promise<TemplateProfile> {
  const raw = await model.chat([
    { role: "system", content: ANALYSIS_PROMPT },
    { role: "user", content: `Template:\n\n${templateText.slice(0, 24000)}` },
  ]);
  const parsed = parseJsonLoose(raw);
  const profile: TemplateProfile = {
    id: meta.id,
    name: meta.name,
    description: String(parsed.description ?? meta.name),
    sections: Array.isArray(parsed.sections) ? parsed.sections : [],
    variables: Array.isArray(parsed.variables) ? parsed.variables.map(String) : [],
    tone: String(parsed.tone ?? ""),
    sourceTemplate: meta.sourceTemplate,
    created: new Date().toISOString(),
  };
  profile.descriptionEmbedding = await model.embed(`${profile.name}. ${profile.description}`);
  return profile;
}

export async function saveProfile(dir: string, p: TemplateProfile): Promise<void> {
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, `${p.id}.json`), JSON.stringify(p, null, 2), "utf8");
  // Human-readable mirror.
  const md =
    `# ${p.name}\n\n${p.description}\n\n**Tone:** ${p.tone}\n\n` +
    `**Variables:** ${p.variables.join(", ") || "(none detected)"}\n\n## Sections\n` +
    p.sections.map((s) => `### ${s.heading}\n${s.purpose}\n\n${s.guidance}`).join("\n\n");
  await writeFile(join(dir, `${p.id}.md`), md, "utf8");
}

export async function loadProfile(dir: string, id: string): Promise<TemplateProfile> {
  return JSON.parse(await readFile(join(dir, `${id}.json`), "utf8"));
}

export async function listProfiles(dir: string): Promise<TemplateProfile[]> {
  let names: string[];
  try { names = await readdir(dir); } catch { return []; }
  const out: TemplateProfile[] = [];
  for (const n of names) {
    if (n.endsWith(".json")) {
      try { out.push(JSON.parse(await readFile(join(dir, n), "utf8"))); } catch { /* skip */ }
    }
  }
  return out;
}
