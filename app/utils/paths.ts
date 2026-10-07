import type { RailSection } from "~/data/navigation";
import type { Conversation } from "~/data/types";

export function workspacePath(workspaceId: string): string {
  return `/w/${workspaceId}`;
}

/** A group. */
export function conversationPath(workspaceId: string, slug: string): string {
  return `/w/${workspaceId}/c/${slug}`;
}

/** The page for a group you're about to start; no group can take this slug. */
export const NEW_GROUP_SLUG = "new";

/**
 * A group with these people and agents, started from New chat. It's only saved when you
 * send the first message; Airene joins it whether or not she's listed.
 */
export function newGroupRoute(workspaceId: string, personIds: string[], agentIds: string[]) {
  const query: Record<string, string> = {};
  if (personIds.length) query.people = personIds.join(",");
  if (agentIds.length) query.agents = agentIds.join(",");
  return { path: conversationPath(workspaceId, NEW_GROUP_SLUG), query };
}

/** An agent's chat page: one of your chats with it, or a new one when there's no slug. */
export function agentChatPath(workspaceId: string, agentId: string, slug?: string): string {
  const base = `/w/${workspaceId}/chat/${agentId}`;
  return slug ? `${base}/${slug}` : base;
}

/**
 * A new chat with an agent, started on purpose (New chat, Message): its chat list shows a
 * "New chat" row for it until you send. Opening the agent from the sidebar doesn't.
 */
export function newAgentChatRoute(workspaceId: string, agentId: string) {
  return { path: agentChatPath(workspaceId, agentId), query: { new: "1" } };
}

/** Where a conversation opens: groups under /c, agent chats under their agent's page. */
export function threadPath(
  workspaceId: string,
  conversation: Pick<Conversation, "kind" | "slug" | "agentIds">
): string {
  return conversation.kind === "agent"
    ? agentChatPath(workspaceId, conversation.agentIds[0] ?? "", conversation.slug)
    : conversationPath(workspaceId, conversation.slug);
}

export function agentPath(workspaceId: string, agentId: string): string {
  return `/w/${workspaceId}/agents/${agentId}`;
}

export function sectionPath(workspaceId: string, section: RailSection): string {
  return section === "home" ? workspacePath(workspaceId) : `/w/${workspaceId}/${section}`;
}
