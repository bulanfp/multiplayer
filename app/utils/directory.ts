import { getAgent } from "~/data/agents";
import { getPerson } from "~/data/people";
import type { Actor } from "~/data/types";
import type { Mentionable } from "~/utils/mentions";

export function actorName(actor: Actor): string {
  if (actor.kind === "agent") return getAgent(actor.id)?.name ?? "Unknown agent";
  return getPerson(actor.id)?.name ?? "Someone";
}

export function toMentionables(personIds: string[], agentIds: string[]): Mentionable[] {
  const people = personIds.flatMap((id) => {
    const person = getPerson(id);
    return person
      ? [{ kind: "person" as const, id, name: person.name, description: person.title }]
      : [];
  });
  const agents = agentIds.flatMap((id) => {
    const agent = getAgent(id);
    return agent ? [{ kind: "agent" as const, id, name: agent.name, description: agent.role }] : [];
  });
  return [...agents, ...people];
}
