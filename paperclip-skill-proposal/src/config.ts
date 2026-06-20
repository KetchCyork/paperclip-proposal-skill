/**
 * Proposal skill config
 * ---------------------
 * Builds per-template "profiles", picks one for an opportunity, and drafts in
 * your firm's voice using the memory brain for retrieval.
 */
import { homedir } from "node:os";
import { join } from "node:path";

function env(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export interface ProposalConfig {
  firmName: string;
  // Memory brain (agent-memory-mesh) HTTP endpoint, for retrieving past content + style.
  memoryUrl: string;
  memoryApiKey: string;
  // Model: chat for analysis/drafting; embeddings (always Ollama, to match the brain).
  provider: "ollama" | "openrouter";
  chatModel: string;
  embedModel: string;
  ollamaUrl: string;
  openrouterKey: string;
  // Storage.
  profilesDir: string;   // template profiles live here
  outputDir: string;     // generated drafts land here
}

export function loadConfig(): ProposalConfig {
  const base = join(homedir(), ".paperclip-proposal");
  const provider = (env("PROPOSAL_PROVIDER", "ollama") as "ollama" | "openrouter");
  return {
    firmName: env("FIRM_NAME", "the firm"),
    memoryUrl: env("MEMORY_URL", "http://127.0.0.1:8377"),
    memoryApiKey: env("MEMORY_API_KEY", ""),
    provider,
    chatModel: env("PROPOSAL_CHAT_MODEL", provider === "ollama" ? "llama3.1" : "anthropic/claude-sonnet-4-6"),
    embedModel: env("EMBED_MODEL", "nomic-embed-text"),
    ollamaUrl: env("OLLAMA_URL", "http://localhost:11434"),
    openrouterKey: env("OPENROUTER_API_KEY", ""),
    profilesDir: env("PROPOSAL_PROFILES_DIR", join(base, "profiles")),
    outputDir: env("PROPOSAL_OUTPUT_DIR", join(base, "drafts")),
  };
}
