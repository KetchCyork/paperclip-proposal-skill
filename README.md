# Paperclip Proposal Skill

This repository implements a proposal drafting skill for the Agent OS / Paperclip mesh ecosystem.

It lets your agent ingest firm proposal templates, build reusable profile metadata, and draft client proposals in your firm’s voice using the best-fit template.

## What this repo does

- Ingests proposal templates and learns structure, sections, placeholders, and tone.
- Stores template profiles so proposals can be auto-selected by opportunity context.
- Drafts complete proposal drafts using the selected template and your memory brain.
- Keeps all drafts local and human-reviewable before any submission.

## Capabilities

- Template ingestion from documents (`docx`, `pdf`, `md`, `txt`).
- Profile listing and selection by opportunity similarity.
- Draft generation with placeholders marked `[TBD]` for missing details.
- Firm-style and past-proposal awareness via the shared memory brain.

## Install

```bash
cd "Paperclip proposal skill"
cp .env.example .env
npm install
```

## Usage

```bash
# Ingest templates once per proposal type
npm run ingest-template -- "S4HANA-Template.docx" --id s4hana-impl --name "S/4HANA Implementation"
npm run ingest-template -- "Advisory-Template.docx" --id advisory --name "Advisory Assessment"

# List available profiles
npm run list-profiles

# Draft a proposal for an opportunity
npm run draft -- --opportunity "Acme wants a phased S/4HANA migration with EWM, 18 months"

# Draft with an explicit profile
npm run draft -- --opportunity @brief.txt --profile s4hana-impl
```

Draft output is written to `PROPOSAL_OUTPUT_DIR` for review.

## How it works

- Reads each template and derives a reusable profile.
- Matches opportunity text to the best profile using embeddings.
- Uses the memory brain to infuse firm voice and relevant past proposal context.
- Generates a draft in template structure while avoiding fabrication.

## Notes

- This skill is designed for human-reviewed proposal drafting.
- It should be connected to the shared memory brain and a supported model provider.
- Use the existing `README-proposal.md` file for detailed workflow examples and implementation notes.

## License

MIT
