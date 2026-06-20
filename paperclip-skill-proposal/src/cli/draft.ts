/**
 * draft — draft a proposal for an opportunity.
 *   npm run draft -- --opportunity "Acme wants a phased S/4HANA migration..." [--profile s4hana-impl]
 *   npm run draft -- --opportunity @brief.txt
 * If no --profile is given, the best-matching template is selected automatically.
 */
import "dotenv/config";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { loadConfig } from "../config.js";
import { Model } from "../model.js";
import { listProfiles, loadProfile } from "../profiles.js";
import { rankProfiles } from "../select.js";
import { draftProposal } from "../draft.js";

function flag(n: string) { const i = process.argv.indexOf(`--${n}`); return i !== -1 ? process.argv[i + 1] : undefined; }

async function main() {
  const cfg = loadConfig();
  const model = new Model(cfg);

  let opp = flag("opportunity");
  if (!opp) throw new Error('Usage: draft -- --opportunity "<brief>" [--profile <id>]');
  if (opp.startsWith("@")) opp = await readFile(opp.slice(1), "utf8");

  const chosenId = flag("profile");
  let profile;
  if (chosenId) {
    profile = await loadProfile(cfg.profilesDir, chosenId);
    console.log(`Using profile: ${profile.name} (${profile.id})`);
  } else {
    const profiles = await listProfiles(cfg.profilesDir);
    if (!profiles.length) throw new Error("No template profiles. Run ingest-template first.");
    const ranked = await rankProfiles(opp, profiles, model);
    profile = ranked[0].profile;
    console.log(`Auto-selected: ${profile.name} (${profile.id}) — match ${(ranked[0].score * 100).toFixed(0)}%`);
    if (ranked[1]) console.log(`  runner-up: ${ranked[1].profile.name} (${(ranked[1].score * 100).toFixed(0)}%)  [override with --profile]`);
  }

  console.log("Drafting ...");
  const md = await draftProposal(cfg, { profile, opportunity: opp }, model);
  await mkdir(cfg.outputDir, { recursive: true });
  const out = join(cfg.outputDir, `${Date.now()}-${profile.id}.md`);
  await writeFile(out, md, "utf8");
  console.log(`\nDraft written to ${out}\nReview it — unknowns are marked [TBD]. Nothing was sent anywhere.`);
}
main().catch((e) => { console.error(e); process.exit(1); });
