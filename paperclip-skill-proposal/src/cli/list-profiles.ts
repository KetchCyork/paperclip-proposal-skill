/** list-profiles — show available template profiles. */
import "dotenv/config";
import { loadConfig } from "../config.js";
import { listProfiles } from "../profiles.js";

async function main() {
  const cfg = loadConfig();
  const profiles = await listProfiles(cfg.profilesDir);
  if (!profiles.length) { console.log(`No profiles in ${cfg.profilesDir}. Ingest one with: npm run ingest-template`); return; }
  for (const p of profiles) {
    console.log(`- ${p.id}: ${p.name}\n    ${p.description.slice(0, 140)}`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
