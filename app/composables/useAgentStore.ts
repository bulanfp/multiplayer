import { AGENTS } from "~/data/agents";
import type { Agent } from "~/data/types";
import { createId } from "~/utils/ids";

export interface NewAgent {
  name: string;
  description: string;
  instructions: string;
  icon: string;
}

/** "Store ops helper" → "SO" */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials =
    words.length > 1 ? words[0]!.charAt(0) + words[1]!.charAt(0) : (words[0] ?? "").slice(0, 2);
  return initials.toUpperCase();
}

function isNameTaken(name: string): boolean {
  const needle = name.trim().toLowerCase();
  return AGENTS.some((agent) => agent.name.toLowerCase() === needle);
}

// Custom agents join the shared catalog, so any project can add them. They have no
// script yet, so they answer with the generic first-reply until someone writes one.
function createAgent(input: NewAgent): Agent {
  const agent: Agent = {
    id: createId("agent"),
    name: input.name.trim(),
    role: "Custom",
    description: input.description.trim(),
    instructions: input.instructions.trim() || undefined,
    icon: input.icon,
    initials: initialsOf(input.name),
    color: "violet"
  };
  AGENTS.push(agent);
  return agent;
}

export function useAgentStore() {
  return { createAgent, isNameTaken };
}
