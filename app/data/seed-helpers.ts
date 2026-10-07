import { AIRENE_ID } from "~/data/agents";
import { CURRENT_USER_ID } from "~/data/people";
import type { ActivityItem, Conversation, LibraryFile, Todo, Workspace } from "~/data/types";

// Shapes and helpers for writing the mock content in one readable file.

export interface ThreadEntry {
  at: string;
  /** Person or agent id. Omit for system messages. */
  from?: string;
  text?: string;
  /** Agent posts this output template; a repeat in the same thread posts the next version */
  output?: string;
  /** Who asked, used for {sender} in the agent's reply */
  for?: string;
  /** Text in front of an output reply, e.g. thanking the agents it checked with; @mentions work */
  prefix?: string;
  /** Another agent brought this one in: the asking agent's id */
  consultedBy?: string;
  /** Posts an output from one of your agent chats into this group */
  shared?: { threadId: string; output: string; version?: number };
  /** The agent asks with options instead of writing yet; `picked` if someone answered */
  choice?: {
    outputKey: string;
    options: { label: string; description?: string }[];
    picked?: { index: number; by: string };
  };
}

export interface WorkspaceSeed {
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
  /** A group; `slug` is its URL and id suffix, e.g. "social-media". Airene is always in it. */
  function channel(
    slug: string,
    group: { name: string; emoji: string; description: string },
    memberIds: string[],
    agents: { ids: string[]; addedBy: string },
    createdAt: string
  ): Conversation {
    const agentIds = [AIRENE_ID, ...agents.ids.filter((id) => id !== AIRENE_ID)];
    return {
      id: `${prefix}-${slug}`,
      workspaceId,
      kind: "channel",
      slug,
      name: group.name,
      emoji: group.emoji,
      description: group.description,
      memberIds,
      agentIds,
      agentAddedBy: Object.fromEntries(agentIds.map((id) => [id, agents.addedBy])),
      createdAt
    };
  }

  /**
   * One of your private chats with an agent, titled like a thread. You can have many with
   * the same agent; they're listed on that agent's chat page.
   */
  function agentChat(
    slug: string,
    title: string,
    agentId: string,
    createdAt: string
  ): Conversation {
    return {
      id: `${prefix}-chat-${slug}`,
      workspaceId,
      kind: "agent",
      slug,
      name: title,
      memberIds: [CURRENT_USER_ID],
      agentIds: [agentId],
      agentAddedBy: { [agentId]: CURRENT_USER_ID },
      createdAt
    };
  }

  return { channel, agentChat };
}
