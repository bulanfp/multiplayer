import type { Agent } from "~/data/types";

// Mock cost for an agent's last 28 days. Seeded from the agent's id so the chart is the
// same on every visit; agents made in this session haven't cost anything yet.

export const USAGE_DAYS = 28;

export interface UsageDay {
  date: string;
  /** Rupiah */
  cost: number;
}

export interface AgentUsage {
  days: UsageDay[];
  total: number;
  average: number;
}

function hash(text: string): number {
  let value = 2166136261;
  for (const char of text) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return value >>> 0;
}

/** Small deterministic random numbers in [0, 1). */
function random(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let next = Math.imul(state ^ (state >>> 15), state | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

export function agentUsage(agent: Agent): AgentUsage {
  const seed = hash(agent.id);
  const next = random(seed);
  const base = agent.createdBy ? 0 : agent.id === "airene" ? 42_000 : 16_000 + (seed % 14) * 1_000;
  // One busy day per agent, like a long report or a big batch of CVs.
  const busyDay = 4 + (seed % 18);
  const today = new Date();

  const days = Array.from({ length: USAGE_DAYS }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (USAGE_DAYS - 1 - index));
    const factor = index === busyDay ? 6 + next() * 3 : 0.25 + next() * 1.3;
    return { date: date.toISOString(), cost: Math.round(base * factor) };
  });

  const total = days.reduce((sum, day) => sum + day.cost, 0);
  return { days, total, average: Math.round(total / USAGE_DAYS) };
}
