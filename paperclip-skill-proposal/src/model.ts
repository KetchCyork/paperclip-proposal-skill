/**
 * Model client — chat (analysis + drafting) and embeddings (for matching).
 * Embeddings always go through Ollama so they share the brain's vector space.
 * Plain fetch; no SDKs.
 */
import type { ProposalConfig } from "./config.js";

export interface Msg { role: "system" | "user" | "assistant"; content: string; }

export class Model {
  constructor(private cfg: ProposalConfig) {}

  async chat(messages: Msg[]): Promise<string> {
    if (this.cfg.provider === "ollama") {
      const res = await fetch(`${this.cfg.ollamaUrl.replace(/\/$/, "")}/api/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: this.cfg.chatModel, messages, stream: false }),
      });
      if (!res.ok) throw new Error(`Ollama chat ${res.status}: ${await res.text()}`);
      return (await res.json() as any).message?.content ?? "";
    }
    if (!this.cfg.openrouterKey) throw new Error("OPENROUTER_API_KEY required for provider=openrouter.");
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.cfg.openrouterKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.cfg.chatModel, messages }),
    });
    if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
    return (await res.json() as any).choices?.[0]?.message?.content ?? "";
  }

  async embed(text: string): Promise<number[]> {
    const res = await fetch(`${this.cfg.ollamaUrl.replace(/\/$/, "")}/api/embeddings`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.cfg.embedModel, prompt: text }),
    });
    if (!res.ok) throw new Error(`Ollama embeddings ${res.status}: ${await res.text()}`);
    const d: any = await res.json();
    if (!Array.isArray(d.embedding)) throw new Error("No embedding returned.");
    return d.embedding;
  }
}
