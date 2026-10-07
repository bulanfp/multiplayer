import { AGENT_PROFILES } from "~/data/agent-profiles";
import type { Agent, AgentProfile, SkillEffect } from "~/data/types";

type BadgeType = "information" | "announcement" | "warning";

export const SKILL_EFFECTS: Record<SkillEffect, { label: string; badge: BadgeType }> = {
  read: { label: "Read-only", badge: "announcement" },
  write: { label: "Changes records", badge: "information" },
  external: { label: "Sends externally", badge: "warning" }
};

/** A custom agent only has the instructions it was created with. */
export function agentProfile(agent: Agent): AgentProfile {
  return (
    AGENT_PROFILES[agent.id] ?? {
      instruction: agent.instructions ?? "",
      model: "Gemini Flash",
      tasks: [],
      sources: [],
      knowledge: [],
      skills: [],
      connections: []
    }
  );
}
