/**
 * ingest-template — turn a template document into a reusable profile.
 *   npm run ingest-template -- "/path/S4HANA-Template.docx" --id s4hana-impl --name "S/4HANA Implementation"
 */
import "dotenv/config";
import { loadConfig } from "../config.js";
import { Model } from "../model.js";
import { extractDocText } from "../extract.js";
import { buildProfileFromTemplate, saveProfile } from "../profiles.js";

function flag(n: string) { const i = process.argv.indexOf(`--${n}`); return i !== -1 ? process.argv[i + 1] : undefined; }

async function main() {
  const file = process.argv[2];
  const id = flag("id"); const name = flag("name");
  if (!file || file.startsWith("--") || !id || !name)
    throw new Error('Usage: ingest-template -- "<file>" --id <id> --name "<name>"');
  const cfg = loadConfig();
  const model = new Model(cfg);
  console.log(`Analyzing template ${file} ...`);
  const text = await extractDocText(file);
  const profile = await buildProfileFromTemplate(text, { id, name, sourceTemplate: file }, model);
  await saveProfile(cfg.profilesDir, profile);
  console.log(`Saved profile "${name}" (${id}) with ${profile.sections.length} sections to ${cfg.profilesDir}`);
  console.log(`Description: ${profile.description}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
