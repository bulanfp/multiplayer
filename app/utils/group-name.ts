import { AIRENE_ID, getAgent } from "~/data/agents";
import { CURRENT_USER_ID, getPerson } from "~/data/people";
import type { Actor } from "~/data/types";

export const GROUP_NAME_MAX_LENGTH = 40;

/** Icons offered when creating a group; the first is used when none is picked. */
export const GROUP_EMOJI = [
  "💬",
  "📣",
  "🎨",
  "📱",
  "🧪",
  "🛠️",
  "📈",
  "✍️",
  "📸",
  "🏪",
  "☕",
  "🚀",
  "🎯",
  "💡",
  "📦",
  "📅",
  "🗂️",
  "🔒",
  "🌐",
  "🧠",
  "🤝",
  "🎉",
  "🔥",
  "⭐",
  "🏁",
  "🧩",
  "🎬",
  "🎧",
  "📚",
  "🛒",
  "💳",
  "🚚",
  "🏷️",
  "📊",
  "🧾",
  "🗺️",
  "🎁",
  "🌱",
  "⚙️",
  "🐞"
];

/** "Product design" → "product-design", for the group's URL. */
export function toSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "group"
  );
}

/**
 * Who an unnamed group is named after: its people, then its agents, leaving you out. Airene
 * is in every group, so she's only named when it has no other agent.
 */
export function unnamedGroupMembers(personIds: string[], agentIds: string[]): Actor[] {
  const people = personIds.filter((id) => id !== CURRENT_USER_ID);
  const agents = agentIds.filter((id) => id !== AIRENE_ID);
  return [
    ...people.map((id) => ({ kind: "person" as const, id })),
    ...(agents.length ? agents : [AIRENE_ID]).map((id) => ({ kind: "agent" as const, id }))
  ];
}

/** "Maya, Airene" or "Maya, Kevin, Copywriter": people by first name, then agents. */
export function unnamedGroupTitle(personIds: string[], agentIds: string[]): string {
  return unnamedGroupMembers(personIds, agentIds)
    .map((actor) =>
      actor.kind === "person"
        ? (getPerson(actor.id)?.name.split(" ")[0] ?? actor.id)
        : (getAgent(actor.id)?.name ?? actor.id)
    )
    .join(", ");
}

/** The two faces an unnamed group shows: a person and an agent when it has both. */
export function unnamedGroupFaces(personIds: string[], agentIds: string[]): Actor[] {
  const members = unnamedGroupMembers(personIds, agentIds);
  const person = members.find((actor) => actor.kind === "person");
  const agent = members.find((actor) => actor.kind === "agent");
  return person && agent ? [person, agent] : members.slice(0, 2);
}
