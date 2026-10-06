import { CURRENT_USER_ID } from "~/data/people";
import type { ActivityItem, Conversation, LibraryFile, Todo, Workspace } from "~/data/types";

// Shapes and helpers for writing a project's mock content in one readable file.

export interface ThreadEntry {
  at: string;
  /** Person or agent id. Omit for system messages. */
  from?: string;
  text?: string;
  /** Agent posts this output template; a repeat in the same thread posts the next version */
  output?: string;
  /** Who asked, used for {sender} in the agent's reply */
  for?: string;
  /** Text in front of an output reply, e.g. acknowledging a picked option */
  prefix?: string;
  /** The agent asks with options instead of writing yet; `picked` if someone answered */
  choice?: {
    outputKey: string;
    options: { label: string; description?: string }[];
    picked?: { index: number; by: string };
  };
}

export interface ProjectSeed {
  workspace: Workspace;
  conversations: Conversation[];
  threads: Record<string, ThreadEntry[]>;
  unread: Record<string, number>;
  files: LibraryFile[];
  todos: Todo[];
  activity: ActivityItem[];
}

/** Deterministic id so seeds can reference an output before it's built. */
export function outputId(threadId: string, templateKey: string): string {
  return `out-${threadId}-${templateKey}`;
}

export function createConversationHelpers(workspaceId: string, prefix: string) {
  /** A group; `slug` is its URL and id suffix, e.g. "product-design". */
  function channel(
    slug: string,
    group: { name: string; emoji: string; description: string },
    memberIds: string[],
    agents: { ids: string[]; addedBy: string },
    createdAt: string
  ): Conversation {
    return {
      id: `${prefix}-${slug}`,
      workspaceId,
      kind: "channel",
      slug,
      name: group.name,
      emoji: group.emoji,
      description: group.description,
      memberIds,
      agentIds: agents.ids,
      agentAddedBy: Object.fromEntries(agents.ids.map((id) => [id, agents.addedBy])),
      createdAt
    };
  }

  function dm(personId: string, createdAt: string): Conversation {
    return {
      id: `${prefix}-dm-${personId}`,
      workspaceId,
      kind: "dm",
      slug: `dm-${personId}`,
      name: "",
      memberIds: [CURRENT_USER_ID, personId],
      agentIds: [],
      agentAddedBy: {},
      createdAt
    };
  }

  function agentChat(key: string, agentId: string, title: string, createdAt: string): Conversation {
    const id = `${prefix}-chat-${key}`;
    return {
      id,
      workspaceId,
      kind: "agent",
      slug: id,
      name: title,
      memberIds: [CURRENT_USER_ID],
      agentIds: [agentId],
      agentAddedBy: { [agentId]: CURRENT_USER_ID },
      createdAt
    };
  }

  return { channel, dm, agentChat };
}
