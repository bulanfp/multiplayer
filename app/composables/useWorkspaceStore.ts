import { reactive } from "vue";
import { AIRENE_ID, getAgent } from "~/data/agents";
import { getConnector } from "~/data/connectors";
import { CURRENT_USER_ID, getPerson } from "~/data/people";
import { SEED } from "~/data/seed";
import type { Agent, ConnectorId, Conversation, MessageDraft, Workspace } from "~/data/types";
import { useChatStore } from "~/composables/useChatStore";
import { formatList } from "~/utils/format";
import { toSlug, unnamedGroupTitle } from "~/utils/group-name";
import { createId } from "~/utils/ids";
import { withoutMentions } from "~/utils/mentions";
import { agentChatPath, NEW_GROUP_SLUG } from "~/utils/paths";

const state = reactive({
  workspaces: structuredClone(SEED.workspaces) as Workspace[],
  conversations: structuredClone(SEED.conversations) as Conversation[]
});

const { postSystemMessage, introduceAgents, unreadCount, lastMessageAt } = useChatStore();

const ME = getPerson(CURRENT_USER_ID)?.name ?? "You";

/** Full names for system messages: people first, then agents. */
function memberNames(personIds: string[], agentIds: string[]): string[] {
  return [
    ...personIds.map((id) => getPerson(id)?.name ?? id),
    ...agentIds.map((id) => getAgent(id)?.name ?? id)
  ];
}

// ─── Getters ────────────────────────────────────────────────────────────────

/** The company's one space; there are no projects to pick from. */
function defaultWorkspace(): Workspace | undefined {
  return state.workspaces[0];
}

function getWorkspace(id: string): Workspace | undefined {
  return state.workspaces.find((workspace) => workspace.id === id);
}

/** A group by its URL slug. */
function getConversation(workspaceId: string, slug: string): Conversation | undefined {
  return state.conversations.find(
    (conversation) =>
      conversation.workspaceId === workspaceId &&
      conversation.kind === "channel" &&
      conversation.slug === slug
  );
}

/** One of your chats with an agent, by its URL slug. */
function getAgentChat(
  workspaceId: string,
  agentId: string,
  slug: string
): Conversation | undefined {
  return state.conversations.find(
    (conversation) =>
      conversation.workspaceId === workspaceId &&
      conversation.kind === "agent" &&
      conversation.agentIds[0] === agentId &&
      conversation.slug === slug
  );
}

function getConversationById(id: string): Conversation | undefined {
  return state.conversations.find((conversation) => conversation.id === id);
}

function isMember(conversation: Conversation): boolean {
  return conversation.memberIds.includes(CURRENT_USER_ID);
}

/** Every group, by name, including unnamed groups you're not in. */
function allChannelsIn(workspaceId: string): Conversation[] {
  return state.conversations
    .filter((item) => item.workspaceId === workspaceId && item.kind === "channel")
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** The groups you can see, by name: named ones (anyone can join) and unnamed ones you're in. */
function channelsIn(workspaceId: string): Conversation[] {
  return allChannelsIn(workspaceId).filter((group) => !group.isUnnamed || isMember(group));
}

function joinedChannelsIn(workspaceId: string): Conversation[] {
  return channelsIn(workspaceId).filter(isMember);
}

function lastActivity(conversation: Conversation): string {
  return lastMessageAt(conversation.id) ?? conversation.createdAt;
}

/** All your private chats with agents, newest activity first. */
function agentChatsIn(workspaceId: string): Conversation[] {
  return state.conversations
    .filter((item) => item.workspaceId === workspaceId && item.kind === "agent" && isMember(item))
    .sort((a, b) => lastActivity(b).localeCompare(lastActivity(a)));
}

/** Your chats with one agent, newest activity first. */
function chatsWith(workspaceId: string, agentId: string): Conversation[] {
  return agentChatsIn(workspaceId).filter((chat) => chat.agentIds[0] === agentId);
}

/**
 * The agents in the sidebar under Airene: the ones you have chats with, the one you talked
 * to most recently first. Each shows once, however many chats you have with it.
 */
function chatAgentsIn(workspaceId: string): Agent[] {
  const ids = agentChatsIn(workspaceId)
    .map((chat) => chat.agentIds[0] ?? "")
    .filter((id, index, all) => id !== AIRENE_ID && all.indexOf(id) === index);
  return ids.map((id) => getAgent(id)).filter((agent): agent is Agent => Boolean(agent));
}

/** Unread replies across your chats with one agent, for its row in the sidebar. */
function agentUnreadCount(workspaceId: string, agentId: string): number {
  return chatsWith(workspaceId, agentId).reduce((total, chat) => total + unreadCount(chat.id), 0);
}

/** Who an agent chat is with. */
function agentOf(conversation: Conversation): Agent | undefined {
  return conversation.kind === "agent" ? getAgent(conversation.agentIds[0] ?? "") : undefined;
}

/** Unread messages across your agent chats and groups, for the Chats badge. */
function chatUnreadCount(workspaceId: string): number {
  return [...agentChatsIn(workspaceId), ...joinedChannelsIn(workspaceId)].reduce(
    (total, conversation) => total + unreadCount(conversation.id),
    0
  );
}

/** Where the app opens: Airene, at the top of the sidebar. */
function homePath(workspaceId: string): string {
  return agentChatPath(workspaceId, AIRENE_ID);
}

/** "Creative", an unnamed group's members ("Maya, Airene"), or an agent chat's title. */
function conversationTitle(conversation: Conversation): string {
  return conversation.name;
}

/** The title with a group's emoji in front, for lists and headers: "🎨 Creative". */
function conversationLabel(conversation: Conversation): string {
  return conversation.kind === "channel" && conversation.emoji
    ? `${conversation.emoji} ${conversation.name}`
    : conversation.name;
}

/** URL-safe and unique among groups: "research", then "research-2". */
function uniqueSlug(workspaceId: string, name: string): string {
  const base = toSlug(name);
  // "new" is the page for starting a group, so a group named "New" gets "new-2".
  const taken = new Set([NEW_GROUP_SLUG, ...allChannelsIn(workspaceId).map((item) => item.slug)]);
  let slug = base;
  for (let n = 2; taken.has(slug); n += 1) slug = `${base}-${n}`;
  return slug;
}

const CHAT_TITLE_LENGTH = 48;

/** A chat's title from its first message: the text without @mentions, cut at a word. */
function chatTitle(first: Pick<MessageDraft, "text" | "mentions">): string {
  const plain = withoutMentions(first.text, first.mentions).replace(/\s+/g, " ").trim();
  if (!plain) return "New chat";
  if (plain.length <= CHAT_TITLE_LENGTH) return plain;
  const cut = plain.slice(0, CHAT_TITLE_LENGTH);
  return `${cut.slice(0, cut.lastIndexOf(" ")) || cut}…`;
}

// ─── Actions ────────────────────────────────────────────────────────────────

function joinChannel(conversation: Conversation): void {
  if (isMember(conversation)) return;
  conversation.memberIds.push(CURRENT_USER_ID);
  postSystemMessage(conversation.id, `${ME} joined`);
}

/** A new group with you, the people you picked, Airene (always) and any agents you picked. */
function createChannel(
  workspaceId: string,
  input: {
    name: string;
    emoji: string;
    description: string;
    personIds: string[];
    agentIds: string[];
  }
): Conversation {
  const personIds = input.personIds.filter((id) => id !== CURRENT_USER_ID);
  const agentIds = [AIRENE_ID, ...input.agentIds.filter((id) => id !== AIRENE_ID)];
  const conversation: Conversation = {
    id: createId(`${workspaceId}-channel`),
    workspaceId,
    kind: "channel",
    slug: uniqueSlug(workspaceId, input.name),
    name: input.name.trim(),
    emoji: input.emoji,
    description: input.description,
    memberIds: [CURRENT_USER_ID, ...personIds],
    agentIds,
    agentAddedBy: Object.fromEntries(agentIds.map((id) => [id, CURRENT_USER_ID])),
    createdAt: new Date().toISOString()
  };
  state.conversations.push(conversation);
  postSystemMessage(conversation.id, `${ME} created this group`);
  // People first, then agents: "Rizal Candra added Maya Putri, Airene and Copywriter"
  postSystemMessage(conversation.id, `${ME} added ${formatList(memberNames(personIds, agentIds))}`);
  introduceAgents({ workspaceId, threadId: conversation.id, agentIds }, agentIds, CURRENT_USER_ID);
  return conversation;
}

/** The same people and agents, ignoring order; you and Airene are in every group. */
function hasMembers(conversation: Conversation, personIds: string[], agentIds: string[]) {
  const people = new Set([CURRENT_USER_ID, ...personIds]);
  const agents = new Set([AIRENE_ID, ...agentIds]);
  return (
    conversation.memberIds.length === people.size &&
    conversation.memberIds.every((id) => people.has(id)) &&
    conversation.agentIds.length === agents.size &&
    conversation.agentIds.every((id) => agents.has(id))
  );
}

/**
 * Your unnamed group with exactly these people and agents, if you have one. New chat opens it
 * instead of starting a copy, so each group shows once in the sidebar.
 */
function findUnnamedGroup(
  workspaceId: string,
  personIds: string[],
  agentIds: string[]
): Conversation | undefined {
  return joinedChannelsIn(workspaceId).find(
    (group) => group.isUnnamed && hasMembers(group, personIds, agentIds)
  );
}

/**
 * A group started from New chat: you, the people and agents you picked, and Airene. It has
 * no name, so it's titled after its members until someone names it.
 */
function createUnnamedGroup(
  workspaceId: string,
  input: { personIds: string[]; agentIds: string[] }
): Conversation {
  const personIds = [...new Set(input.personIds)].filter((id) => id !== CURRENT_USER_ID);
  const agentIds = [...new Set([AIRENE_ID, ...input.agentIds])];
  const conversation: Conversation = {
    id: createId(`${workspaceId}-channel`),
    workspaceId,
    kind: "channel",
    slug: createId("group"),
    name: unnamedGroupTitle(personIds, agentIds),
    description: "",
    memberIds: [CURRENT_USER_ID, ...personIds],
    agentIds,
    agentAddedBy: Object.fromEntries(agentIds.map((id) => [id, CURRENT_USER_ID])),
    createdAt: new Date().toISOString(),
    isUnnamed: true
  };
  state.conversations.push(conversation);
  // One line instead of "created" and "added": the first message follows straight away.
  postSystemMessage(
    conversation.id,
    `${ME} started this group with ${formatList(memberNames(personIds, agentIds))}`
  );
  return conversation;
}

/** Names an unnamed group, which then shows its emoji instead of faces, or renames a group. */
function renameGroup(conversation: Conversation, input: { name: string; emoji: string }): void {
  const name = input.name.trim().replace(/\s+/g, " ");
  const wasUnnamed = Boolean(conversation.isUnnamed);
  const isRenamed = wasUnnamed || name !== conversation.name;
  conversation.name = name;
  conversation.emoji = input.emoji;
  conversation.isUnnamed = undefined;
  if (!isRenamed) return;
  postSystemMessage(
    conversation.id,
    wasUnnamed ? `${ME} named the group ${name}` : `${ME} renamed the group to ${name}`
  );
}

function addMembers(conversation: Conversation, personIds: string[], agentIds: string[]): void {
  const newPeople = personIds.filter((id) => !conversation.memberIds.includes(id));
  const newAgents = agentIds.filter((id) => !conversation.agentIds.includes(id));
  if (!newPeople.length && !newAgents.length) return;

  conversation.memberIds.push(...newPeople);
  conversation.agentIds.push(...newAgents);
  newAgents.forEach((id) => (conversation.agentAddedBy[id] = CURRENT_USER_ID));
  // An unnamed group is titled after its members, so its title grows with them.
  if (conversation.isUnnamed) {
    conversation.name = unnamedGroupTitle(conversation.memberIds, conversation.agentIds);
  }

  postSystemMessage(
    conversation.id,
    `${ME} added ${formatList(memberNames(newPeople, newAgents))}`
  );
  // New agents say hello; people don't get a scripted line.
  if (newAgents.length) {
    introduceAgents(
      {
        workspaceId: conversation.workspaceId,
        threadId: conversation.id,
        agentIds: conversation.agentIds
      },
      newAgents,
      CURRENT_USER_ID
    );
  }
}

/** A new private chat with an agent, titled from your first message. */
function createAgentChat(
  workspaceId: string,
  agentId: string,
  firstMessage: Pick<MessageDraft, "text" | "mentions">
): Conversation {
  const conversation: Conversation = {
    id: createId(`${workspaceId}-chat`),
    workspaceId,
    kind: "agent",
    slug: createId("chat"),
    name: chatTitle(firstMessage),
    memberIds: [CURRENT_USER_ID],
    agentIds: [agentId],
    agentAddedBy: { [agentId]: CURRENT_USER_ID },
    createdAt: new Date().toISOString()
  };
  state.conversations.push(conversation);
  return conversation;
}

/** Connects a group to an app, so its agents can use it there. Nothing is linked yet. */
function addConnector(conversation: Conversation, connectorId: ConnectorId): void {
  if (conversation.connectors?.some((item) => item.id === connectorId)) return;
  conversation.connectors = [
    ...(conversation.connectors ?? []),
    { id: connectorId, addedBy: CURRENT_USER_ID, addedAt: new Date().toISOString(), items: [] }
  ];
  postSystemMessage(conversation.id, `${ME} connected ${getConnector(connectorId)?.name}`);
}

function removeConnector(conversation: Conversation, connectorId: ConnectorId): void {
  if (!conversation.connectors?.some((item) => item.id === connectorId)) return;
  conversation.connectors = conversation.connectors.filter((item) => item.id !== connectorId);
  postSystemMessage(conversation.id, `${ME} disconnected ${getConnector(connectorId)?.name}`);
}

/** Pins a group to the top of the sidebar's groups, or unpins it. */
function togglePin(conversation: Conversation) {
  conversation.pinnedAt = conversation.pinnedAt ? undefined : new Date().toISOString();
}

export function useWorkspaceStore() {
  return {
    state,
    defaultWorkspace,
    getWorkspace,
    getConversation,
    getAgentChat,
    getConversationById,
    isMember,
    channelsIn,
    joinedChannelsIn,
    agentChatsIn,
    chatsWith,
    chatAgentsIn,
    agentUnreadCount,
    agentOf,
    chatUnreadCount,
    homePath,
    conversationTitle,
    conversationLabel,
    findUnnamedGroup,
    joinChannel,
    createChannel,
    createUnnamedGroup,
    renameGroup,
    addMembers,
    addConnector,
    removeConnector,
    createAgentChat,
    togglePin
  };
}
