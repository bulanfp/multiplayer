// Shared shapes for the Multiplayer mock data and stores.

export type ActorKind = "person" | "agent";

export interface Actor {
  kind: ActorKind;
  id: string;
}

/** Fallback colours for initials avatars (Pixel MpAvatar variant colours). */
export type PersonColor = "sky" | "teal" | "violet" | "amber" | "rose" | "stone" | "lime" | "pink";

export interface Person {
  id: string;
  name: string;
  title: string;
  color: PersonColor;
  /** Round memoji in public/images/avatars */
  avatar?: string;
}

/** Placeholder colours for agents that don't have a 3D icon yet. */
export type AgentColor = "violet" | "fuchsia" | "indigo" | "teal" | "orange" | "blue" | "green";

export interface Agent {
  id: string;
  name: string;
  /** Short label shown next to the name, e.g. "Design" */
  role: string;
  description: string;
  /** 3D icon; agents without one fall back to an initials tile */
  icon?: string;
  /** How a custom agent should behave; set when someone creates one */
  instructions?: string;
  initials: string;
  color: AgentColor;
}

export type WorkspaceRole = "admin" | "member";
export type ProjectColor = "teal" | "amber" | "violet" | "sky";

export interface Invite {
  id: string;
  email: string;
  role: WorkspaceRole;
  invitedBy: string;
  invitedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  initials: string;
  /** Shown instead of the initials when set */
  emoji?: string;
  color: ProjectColor;
  description: string;
  timeline: string;
  members: { personId: string; role: WorkspaceRole }[];
  agentIds: string[];
  invites: Invite[];
}

/** "channel" is shown as a group in the UI. */
export type ConversationKind = "channel" | "dm" | "agent";

export interface Conversation {
  /** Globally unique; also the thread id for messages */
  id: string;
  workspaceId: string;
  kind: ConversationKind;
  /** Used in the URL: the group's short name, "dm-<personId>", or the id for agent chats */
  slug: string;
  /** Group name as people read it ("Product design"), or the agent chat title */
  name: string;
  /** A group's icon, shown where Slack would show "#" */
  emoji?: string;
  description?: string;
  memberIds: string[];
  agentIds: string[];
  /** Who added each agent, for the members panel */
  agentAddedBy: Record<string, string>;
  createdAt: string;
}

export interface Mention {
  kind: ActorKind;
  id: string;
  start: number;
  end: number;
}

export interface MessageOption {
  id: string;
  label: string;
  description?: string;
}

/** An agent asking you to pick before it writes anything. */
export interface MessageChoice {
  options: MessageOption[];
  /** Output template the agent writes once someone picks */
  outputKey: string;
  pickedId?: string;
  /** Person who picked */
  pickedBy?: string;
}

export interface Message {
  id: string;
  threadId: string;
  kind: "message" | "system";
  sender: Actor;
  text: string;
  mentions: Mention[];
  output?: { outputId: string; version: number };
  choice?: MessageChoice;
  createdAt: string;
}

export type OutputBlock =
  { type: "heading" | "paragraph"; text: string } | { type: "list"; items: string[] };

export interface OutputVersion {
  agentId: string;
  createdAt: string;
  blocks: OutputBlock[];
}

export interface Output {
  id: string;
  workspaceId: string;
  threadId: string;
  templateKey: string;
  title: string;
  /** Label such as "Spec" or "Report" */
  kind: string;
  versions: OutputVersion[];
}

export type LibraryFileType = "pdf" | "image" | "zip" | "design";

export interface LibraryFile {
  id: string;
  workspaceId: string;
  name: string;
  type: LibraryFileType;
  size: string;
  threadId: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Todo {
  id: string;
  workspaceId: string;
  title: string;
  done: boolean;
  /** Person who checked it off, and when */
  doneBy?: string;
  doneAt?: string;
  assigneeId: string;
  createdBy: Actor;
  source?: { threadId: string };
  due?: string;
  createdAt: string;
}

export type ActivityKind = "mention" | "output" | "invite" | "todo";

export interface ActivityItem {
  id: string;
  workspaceId: string;
  kind: ActivityKind;
  actor: Actor;
  /** Sentence after the actor's name, e.g. "mentioned you" */
  text: string;
  excerpt?: string;
  threadId?: string;
  outputId?: string;
  createdAt: string;
  read: boolean;
}

/** A recency group in an agent's chat history list. */
export interface ChatHistoryGroup {
  label: string;
  chats: { id: string; title: string }[];
}
