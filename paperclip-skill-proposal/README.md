# paperclip-skill-proposal

Draft client proposals from **your own templates**, in **your firm's voice**.

You have different templates per project type (S/4HANA implementation, advisory,
EWM, SuccessFactors, ...). Ingest each one once to build a reusable **template
profile**. Then, given an opportunity, the skill **auto-selects** the best-fit
template and drafts a complete proposal — following that template's structure,
written in your voice (learned from past proposals in the memory brain), with
unknowns marked `[TBD]` and nothing fabricated.

## Workflow

```bash
cp .env.example .env          # FIRM_NAME, MEMORY_URL, model provider
npm install

# 1) Ingest each template once (per project type)
npm run ingest-template -- "S4HANA-Template.docx" --id s4hana-impl --name "S/4HANA Implementation"
npm run ingest-template -- "Advisory-Template.docx" --id advisory --name "Advisory Assessment"

# 2) See what you've got
npm run list-profiles

# 3) Draft for an opportunity — template auto-selected (override with --profile)
npm run draft -- --opportunity "Acme wants a phased S/4HANA migration with EWM, 18 months"
npm run draft -- --opportunity @brief.txt --profile s4hana-impl
```

Drafts are written to `PROPOSAL_OUTPUT_DIR` for your review.

## How it works

- **Template profile** = sections + placeholders + tone + a description, derived
  from your template document (docx/pdf/txt/md) by a model, stored as JSON + a
  readable `.md` mirror.
- **Selection** compares the opportunity to each profile's description by embedding
  similarity (deterministic, cheap; override anytime with `--profile`).
- **Drafting** pulls your firm's style profile and relevant past proposals from the
  memory brain (`agent-memory-mesh`), then writes the proposal following the chosen
  template's structure.

## Guardrails

Follow the template structure; write in-voice; use past proposals only as reference;
never copy client-specific facts or fabricate numbers/names/dates/prices; mark
unknowns `[TBD]`; produce a draft for human review (never sends or submits).

## Uses

- The **memory brain** (`agent-memory-mesh`) over HTTP for style + references.
- A model via **Ollama** (local/private, default) or **OpenRouter**.
- Registers as a skill (`src/skill/`) in the skills system, and can be invoked from
  the mesh runner.

## What's verified

Compiles cleanly (incl. mammoth/unpdf). Unit tests cover cosine similarity, the
opportunity→template selection (picks the right template), and profile save/load/
list. Live drafting needs your Ollama/OpenRouter + the running memory brain.

## Make it yours

Ships without git history so your first commit is yours:

```bash
git init && git add -A && git commit -m "Initial commit: proposal drafting skill"
git remote add origin git@github.com:<you>/paperclip-skill-proposal.git
git push -u origin main
```

## License
MIT (recommended).
