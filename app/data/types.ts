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
  /** Who made a custom agent, and when; built-in agents come from Mekari */
  createdBy?: string;
  createdAt?: string;
  initials: string;
  color: AgentColor;
}

/** What using a skill touches: it reads data, changes records, or reaches outside the company. */
export type SkillEffect = "read" | "write" | "external";

export interface AgentSkill {
  name: string;
  description: string;
  effect: SkillEffect;
  /** "ask": the agent checks with you before it uses the skill */
  approval: "ask" | "auto";
}

/** How an agent is set up, shown on its profile. */
export interface AgentProfile {
  instruction: string;
  model: string;
  tasks: { title: string; description: string }[];
  /** Live data the agent reads */
  sources: string[];
  /** Documents it has been given */
  knowledge: string[];
  skills: { group: string; items: AgentSkill[] }[];
  connections: { name: string; isConnected: boolean }[];
}

export type WorkspaceRole = "admin" | "member";

/** The company's one shared space. There are no projects: every group and agent lives here. */
export interface Workspace {
  id: string;
  name: string;
  members: { personId: string; role: WorkspaceRole }[];
  /** Agents anyone here can chat with or add to a group */
  agentIds: string[];
}

/** Apps a group or an agent chat can be connected to, so its agents can read and post there. */
export type ConnectorId = "figma" | "google-docs" | "google-chat";

/** A connector added to a conversation, and what it's linked to there. */
export interface ConversationConnector {
  id: ConnectorId;
  /** Person who connected it, and when */
  addedBy: string;
  addedAt: string;
  /** Figma files, Google Docs or Google Chat spaces it's linked to here */
  items: string[];
}

/**
 * "channel" is a group in the UI: people and agents, with Airene always among them.
 * "agent" is one of your private chats with an agent; you can have many with each agent.
 */
export type ConversationKind = "channel" | "agent";

export interface Conversation {
  /** Globally unique; also the thread id for messages */
  id: string;
  workspaceId: string;
  kind: ConversationKind;
  /** Used in the URL: the group's short name, or an agent chat's own id */
  slug: string;
  /** Group name as people read it ("Creative"), or an agent chat's title */
  name: string;
  /** A group's icon, shown where Slack would show "#" */
  emoji?: string;
  description?: string;
  memberIds: string[];
  agentIds: string[];
  /** Who added each agent, for the members panel */
  agentAddedBy: Record<string, string>;
  createdAt: string;
  /** When you pinned a group; pinned groups lead the sidebar's groups, oldest pin first */
  pinnedAt?: string;
  /**
   * A group started from New chat by picking people and agents, without a name: it's titled
   * after its members and shows their faces instead of an emoji until someone names it.
   */
  isUnnamed?: boolean;
  /** Apps this group or agent chat is connected to */
  connectors?: ConversationConnector[];
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
  /** Library files attached when it was sent */
  fileIds?: string[];
  /** An agent saying hello after it was added to a group; its avatar hops in once */
  intro?: boolean;
  /** Another agent brought this one in to help: the asking agent's id */
  consultedBy?: string;
  createdAt: string;
}

/** A file picked in the message box, before it's sent. */
export interface AttachmentDraft {
  id: string;
  name: string;
  type: LibraryFileType;
  size: string;
  /** Object URL for PDFs and images, so the Library can preview them */
  previewUrl?: string;
}

/** What the message box hands over when you send. */
export interface MessageDraft {
  text: string;
  mentions: Mention[];
  attachments: AttachmentDraft[];
  /** An output shared from one of your agent chats; it goes with the message as its card */
  output?: { outputId: string; version: number };
}

export type OutputBlock =
  { type: "heading" | "paragraph"; text: string } | { type: "list"; items: string[] };

export interface OutputVersion {
  agentId: string;
  createdAt: string;
  blocks: OutputBlock[];
}

/** What an artifact is, as it opens in the canvas: a doc, a sheet, slides or an HTML page. */
export type OutputFormat = "doc" | "sheet" | "slides" | "html";

export interface Output {
  id: string;
  workspaceId: string;
  threadId: string;
  templateKey: string;
  title: string;
  /** Label such as "Spec" or "Report" */
  kind: string;
  /** Doc unless the template says otherwise */
  format?: OutputFormat;
  versions: OutputVersion[];
  /** Groups an output from your private agent chat was shared to; until then only you see it */
  sharedThreadIds?: string[];
}

export type LibraryFileType =
  "pdf" | "image" | "zip" | "design" | "document" | "spreadsheet" | "video";

export interface LibraryFile {
  id: string;
  workspaceId: string;
  name: string;
  type: LibraryFileType;
  size: string;
  threadId: string;
  uploadedBy: string;
  uploadedAt: string;
  /** Mock renders of a seeded PDF's pages or image, in public/files/ */
  previewPages?: string[];
  /** A PDF or image attached in this session previews as itself (object URL) */
  previewUrl?: string;
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

export type ActivityKind = "mention" | "output" | "todo";

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
