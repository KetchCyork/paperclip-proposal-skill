/**
 * Memory client — calls the agent-memory-mesh HTTP API to retrieve relevant past
 * proposal content and the firm's style profile.
 */
import type { ProposalConfig } from "./config.js";

export interface MemoryHit { notePath: string; text: string; }

export async function searchMemory(
  cfg: ProposalConfig, query: string, k = 8, filter?: string
): Promise<MemoryHit[]> {
  const res = await fetch(`${cfg.memoryUrl.replace(/\/$/, "")}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(cfg.memoryApiKey ? { "X-Api-Key": cfg.memoryApiKey } : {}) },
    body: JSON.stringify({ query, k, filter }),
  });
  if (!res.ok) throw new Error(`Memory search ${res.status}: ${await res.text()}`);
  const data: any = await res.json();
  return (data.hits ?? []).map((h: any) => ({ notePath: h.chunk?.notePath ?? "", text: h.chunk?.text ?? "" }));
}
