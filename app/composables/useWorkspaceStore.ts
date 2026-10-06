import { reactive } from "vue";
import { getAgent } from "~/data/agents";
import { CURRENT_USER_ID, getPerson } from "~/data/people";
import { SEED } from "~/data/seed";
import type { Conversation, Invite, Workspace, WorkspaceRole } from "~/data/types";
import { useChatStore } from "~/composables/useChatStore";
import { toSlug } from "~/utils/group-name";
import { createId } from "~/utils/ids";
import { conversationPath, workspacePath } from "~/utils/paths";

const state = reactive({
  workspaces: structuredClone(SEED.workspaces) as Workspace[],
  conversations: structuredClone(SEED.conversations) as Conversation[],
  lastWorkspaceId: SEED.workspaces[0]?.id ?? ""
});

const { postSystemMessage, lastMessageAt, unreadCount } = useChatStore();

const ME = getPerson(CURRENT_USER_ID)?.name ?? "You";

function listNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

// ─── Getters ────────────────────────────────────────────────────────────────

function myWorkspaces(): Workspace[] {
  return state.workspaces.filter((workspace) =>
    workspace.members.some((member) => member.personId === CURRENT_USER_ID)
  );
}

function getWorkspace(id: string): Workspace | undefined {
  return state.workspaces.find((workspace) => workspace.id === id);
}

function getConversation(workspaceId: string, slug: string): Conversation | undefined {
  return state.conversations.find(
    (conversation) => conversation.workspaceId === workspaceId && conversation.slug === slug
  );
}

function getConversationById(id: string): Conversation | undefined {
  return state.conversations.find((conversation) => conversation.id === id);
}

function isMember(conversation: Conversation): boolean {
  return conversation.memberIds.includes(CURRENT_USER_ID);
}

function channelsIn(workspaceId: string): Conversation[] {
  return state.conversations
    .filter((item) => item.workspaceId === workspaceId && item.kind === "channel")
    .sort((a, b) => a.name.localeCompare(b.name));
}

function joinedChannelsIn(workspaceId: string): Conversation[] {
  return channelsIn(workspaceId).filter(isMember);
}

function dmsIn(workspaceId: string): Conversation[] {
  return state.conversations.filter(
    (item) => item.workspaceId === workspaceId && item.kind === "dm" && isMember(item)
  );
}

/**
 * Your newest chat with each agent, so agents sit in Direct messages next to people.
 * Empty "New chat"s are skipped.
 */
function agentDmsIn(workspaceId: string): Conversation[] {
  const latest = new Map<string, { chat: Conversation; at: string }>();
  for (const chat of state.conversations) {
    if (chat.workspaceId !== workspaceId || chat.kind !== "agent") continue;
    const at = lastMessageAt(chat.id);
    const agentId = chat.agentIds[0];
    if (!at || !agentId) continue;
    const current = latest.get(agentId);
    if (!current || at > current.at) latest.set(agentId, { chat, at });
  }
  return [...latest.values()].map((item) => item.chat);
}

/** Unread messages across your groups and direct messages, for the Chats badge. */
function chatUnreadCount(workspaceId: string): number {
  return [
    ...joinedChannelsIn(workspaceId),
    ...dmsIn(workspaceId),
    ...agentDmsIn(workspaceId)
  ].reduce((total, conversation) => total + unreadCount(conversation.id), 0);
}

function agentChatsIn(workspaceId: string, agentId: string): Conversation[] {
  return state.conversations.filter(
    (item) =>
      item.workspaceId === workspaceId && item.kind === "agent" && item.agentIds.includes(agentId)
  );
}

/** Where "Home" lands for a project: General, another joined group, or the group browser. */
function homePath(workspaceId: string): string {
  const first =
    joinedChannelsIn(workspaceId).find((item) => item.slug === "general") ??
    joinedChannelsIn(workspaceId)[0];
  return first ? conversationPath(workspaceId, first.slug) : `${workspacePath(workspaceId)}/groups`;
}

/** "QA and release", "Sari Wijaya", or an agent chat title. */
function conversationTitle(conversation: Conversation): string {
  if (conversation.kind === "channel") return conversation.name;
  if (conversation.kind === "dm") {
    const otherId = conversation.memberIds.find((id) => id !== CURRENT_USER_ID);
    return (otherId && getPerson(otherId)?.name) || ME;
  }
  return conversation.name;
}

/** The title with a group's emoji in front, for lists and headers: "🧪 QA and release". */
function conversationLabel(conversation: Conversation): string {
  const title = conversationTitle(conversation);
  return conversation.kind === "channel" && conversation.emoji
    ? `${conversation.emoji} ${title}`
    : title;
}

/** URL-safe and unique within the project: "research", then "research-2". */
function uniqueSlug(workspaceId: string, name: string): string {
  const base = toSlug(name);
  const taken = new Set(channelsIn(workspaceId).map((item) => item.slug));
  let slug = base;
  for (let n = 2; taken.has(slug); n += 1) slug = `${base}-${n}`;
  return slug;
}

// ─── Actions ────────────────────────────────────────────────────────────────

function rememberWorkspace(id: string): void {
  state.lastWorkspaceId = id;
}

function joinChannel(conversation: Conversation): void {
  if (isMember(conversation)) return;
  conversation.memberIds.push(CURRENT_USER_ID);
  postSystemMessage(conversation.id, `${ME} joined`);
}

function createChannel(
  workspaceId: string,
  input: { name: string; emoji: string; description: string; agentIds: string[] }
): Conversation {
  const conversation: Conversation = {
    id: createId(`${workspaceId}-channel`),
    workspaceId,
    kind: "channel",
    slug: uniqueSlug(workspaceId, input.name),
    name: input.name.trim(),
    emoji: input.emoji,
    description: input.description,
    memberIds: [CURRENT_USER_ID],
    agentIds: [...input.agentIds],
    agentAddedBy: Object.fromEntries(input.agentIds.map((id) => [id, CURRENT_USER_ID])),
    createdAt: new Date().toISOString()
  };
  state.conversations.push(conversation);
  postSystemMessage(conversation.id, `${ME} created this group`);
  if (input.agentIds.length) {
    const agentNames = input.agentIds.map((id) => getAgent(id)?.name ?? id);
    postSystemMessage(conversation.id, `${ME} added ${listNames(agentNames)}`);
  }
  return conversation;
}

function addMembers(conversation: Conversation, personIds: string[], agentIds: string[]): void {
  const newPeople = personIds.filter((id) => !conversation.memberIds.includes(id));
  const newAgents = agentIds.filter((id) => !conversation.agentIds.includes(id));
  if (!newPeople.length && !newAgents.length) return;

  conversation.memberIds.push(...newPeople);
  conversation.agentIds.push(...newAgents);
  newAgents.forEach((id) => (conversation.agentAddedBy[id] = CURRENT_USER_ID));

  const names = [
    ...newPeople.map((id) => getPerson(id)?.name ?? id),
    ...newAgents.map((id) => getAgent(id)?.name ?? id)
  ];
  postSystemMessage(conversation.id, `${ME} added ${listNames(names)}`);
}

function openDm(workspaceId: string, personId: string): Conversation {
  const existing = getConversation(workspaceId, `dm-${personId}`);
  if (existing) return existing;
  const conversation: Conversation = {
    id: createId(`${workspaceId}-dm`),
    workspaceId,
    kind: "dm",
    slug: `dm-${personId}`,
    name: "",
    memberIds: [CURRENT_USER_ID, personId],
    agentIds: [],
    agentAddedBy: {},
    createdAt: new Date().toISOString()
  };
  state.conversations.push(conversation);
  return conversation;
}

function createAgentChat(workspaceId: string, agentId: string): Conversation {
  const id = createId(`${workspaceId}-chat`);
  const conversation: Conversation = {
    id,
    workspaceId,
    kind: "agent",
    slug: id,
    name: "New chat",
    memberIds: [CURRENT_USER_ID],
    agentIds: [agentId],
    agentAddedBy: { [agentId]: CURRENT_USER_ID },
    createdAt: new Date().toISOString()
  };
  state.conversations.push(conversation);
  return conversation;
}

function renameConversation(conversation: Conversation, name: string): void {
  conversation.name = name;
}

function addAgentToWorkspace(workspaceId: string, agentId: string): void {
  const workspace = getWorkspace(workspaceId);
  if (workspace && !workspace.agentIds.includes(agentId)) workspace.agentIds.push(agentId);
}

function inviteToWorkspace(workspaceId: string, emails: string[], role: WorkspaceRole): void {
  const workspace = getWorkspace(workspaceId);
  if (!workspace) return;
  const invitedAt = new Date().toISOString();
  emails.forEach((email) => {
    const invite: Invite = {
      id: createId("inv"),
      email,
      role,
      invitedBy: CURRENT_USER_ID,
      invitedAt
    };
    workspace.invites.unshift(invite);
  });
}

function revokeInvite(workspaceId: string, inviteId: string): void {
  const workspace = getWorkspace(workspaceId);
  if (workspace) workspace.invites = workspace.invites.filter((invite) => invite.id !== inviteId);
}

/** "Loyalty program refresh" → "LP" */
export function projectInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials =
    words.length > 1 ? words[0]!.charAt(0) + words[1]!.charAt(0) : (words[0] ?? "").slice(0, 2);
  return initials.toUpperCase();
}

function createProject(input: { name: string; description: string; emoji?: string }): Workspace {
  const workspace: Workspace = {
    id: createId("project"),
    name: input.name.trim(),
    initials: projectInitials(input.name),
    emoji: input.emoji,
    color: "violet",
    description: input.description.trim(),
    timeline: "Just started",
    members: [{ personId: CURRENT_USER_ID, role: "admin" }],
    agentIds: ["airene"],
    invites: []
  };
  state.workspaces.push(workspace);
  createChannel(workspace.id, {
    name: "General",
    emoji: "📣",
    description: "Announcements and updates",
    agentIds: ["airene"]
  });
  return workspace;
}

export function useWorkspaceStore() {
  return {
    state,
    myWorkspaces,
    getWorkspace,
    getConversation,
    getConversationById,
    isMember,
    channelsIn,
    agentDmsIn,
    chatUnreadCount,
    joinedChannelsIn,
    dmsIn,
    agentChatsIn,
    homePath,
    conversationTitle,
    conversationLabel,
    rememberWorkspace,
    joinChannel,
    createChannel,
    addMembers,
    openDm,
    createAgentChat,
    renameConversation,
    addAgentToWorkspace,
    inviteToWorkspace,
    revokeInvite,
    createProject
  };
}
