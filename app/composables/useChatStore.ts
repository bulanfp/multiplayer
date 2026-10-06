import { reactive } from "vue";
import { getAgent } from "~/data/agents";
import { CURRENT_USER_ID, getPerson } from "~/data/people";
import { SEED } from "~/data/seed";
import type { LibraryFile, Mention, Message, Output } from "~/data/types";
import { useActivityStore } from "~/composables/useActivityStore";
import { useTodoStore } from "~/composables/useTodoStore";
import { pickAgentReply, pickOutputReply, type PickedReply } from "~/utils/agent-replies";
import { createId } from "~/utils/ids";
import { fillReply, type Mentionable } from "~/utils/mentions";

const REPLY_DELAY_MS = 1500;
const EXTRA_AGENT_DELAY_MS = 900;

const state = reactive({
  messages: structuredClone(SEED.messages) as Message[],
  outputs: structuredClone(SEED.outputs) as Output[],
  files: structuredClone(SEED.files) as LibraryFile[],
  unread: { ...SEED.unread } as Record<string, number>,
  /** Agent ids currently "writing" per thread */
  typing: {} as Record<string, string[]>,
  /** The conversation on screen; replies elsewhere count as unread */
  activeThreadId: null as string | null
});

// Timers live outside reactive state so they never leak into the UI or survive a reload.
const pendingReplies = new Map<string, ReturnType<typeof setTimeout>>();

const { addActivity } = useActivityStore();
const { addTodo } = useTodoStore();

/** What the store needs to know about the conversation a message is sent in. */
export interface SendContext {
  workspaceId: string;
  threadId: string;
  /** Agents that are members and may answer */
  agentIds: string[];
  /** Agent chats answer every message, no mention needed */
  replyAgentId?: string;
}

function messagesFor(threadId: string): Message[] {
  return state.messages
    .filter((message) => message.threadId === threadId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function lastMessageAt(threadId: string): string | undefined {
  return messagesFor(threadId).at(-1)?.createdAt;
}

function getOutput(id: string): Output | undefined {
  return state.outputs.find((output) => output.id === id);
}

function outputsFor(workspaceId: string): Output[] {
  return state.outputs.filter((output) => output.workspaceId === workspaceId);
}

function filesFor(workspaceId: string): LibraryFile[] {
  return state.files.filter((file) => file.workspaceId === workspaceId);
}

function unreadCount(threadId: string): number {
  return state.unread[threadId] ?? 0;
}

function typingIn(threadId: string): string[] {
  return state.typing[threadId] ?? [];
}

function setActiveThread(threadId: string | null): void {
  state.activeThreadId = threadId;
  if (threadId) state.unread[threadId] = 0;
}

/**
 * Called when a page leaves. Only clears the thread it set: when you move between
 * conversations the next page can mount before the last one unmounts.
 */
function leaveThread(threadId: string | undefined): void {
  if (threadId && state.activeThreadId === threadId) state.activeThreadId = null;
}

function postSystemMessage(threadId: string, text: string): void {
  state.messages.push({
    id: createId("msg"),
    threadId,
    kind: "system",
    sender: { kind: "person", id: "" },
    text,
    mentions: [],
    createdAt: new Date().toISOString()
  });
}

function setTyping(threadId: string, agentId: string, isTyping: boolean): void {
  const current = state.typing[threadId] ?? [];
  state.typing[threadId] = isTyping
    ? [...current.filter((id) => id !== agentId), agentId]
    : current.filter((id) => id !== agentId);
}

function stripMentions(text: string, mentions: Mention[]): string {
  return [...mentions]
    .sort((a, b) => b.start - a.start)
    .reduce((result, mention) => result.slice(0, mention.start) + result.slice(mention.end), text);
}

function outputsIn(threadId: string): Output[] {
  return state.outputs.filter((output) => output.threadId === threadId);
}

function versionCountIn(threadId: string, templateKey: string): number {
  return (
    outputsIn(threadId).find((output) => output.templateKey === templateKey)?.versions.length ?? 0
  );
}

function postAgentReply(context: SendContext, agentId: string, trigger: Message): void {
  const picked = pickAgentReply(
    context.workspaceId,
    agentId,
    stripMentions(trigger.text, trigger.mentions),
    (templateKey) => versionCountIn(context.threadId, templateKey)
  );
  deliverReply(context, agentId, picked, trigger.sender.id);
}

/**
 * Posts an agent's reply: a question with options, an output (new or next version), or
 * plain text. `prefix` leads the text, e.g. acknowledging the option someone picked.
 */
function deliverReply(
  context: SendContext,
  agentId: string,
  picked: PickedReply,
  askerId: string,
  prefix = ""
): void {
  const outputsHere = outputsIn(context.threadId);

  // In a 1:1 agent chat the asker is the only reader, so the reply doesn't @mention them.
  const asker = context.replyAgentId ? undefined : getPerson(askerId);
  const sender: Mentionable | undefined = asker
    ? { kind: "person", id: asker.id, name: asker.name }
    : undefined;
  // Anything that lands in the thread you're looking at is already seen.
  const isViewing = state.activeThreadId === context.threadId;
  const filled = fillReply(picked.reply, sender, picked.title);
  const now = new Date().toISOString();
  const message: Message = {
    id: createId("msg"),
    threadId: context.threadId,
    kind: "message",
    sender: { kind: "agent", id: agentId },
    text: prefix + filled.text,
    mentions: filled.mentions.map((mention) => ({
      ...mention,
      start: mention.start + prefix.length,
      end: mention.end + prefix.length
    })),
    createdAt: now
  };

  if (picked.ask) {
    message.choice = {
      outputKey: picked.ask.outputKey,
      options: picked.ask.options.map((option, index) => ({
        id: `${message.id}-option-${index}`,
        ...option
      }))
    };
  }

  if (picked.output) {
    const { templateKey, title, kind, version } = picked.output;
    let output = outputsHere.find((item) => item.templateKey === templateKey);
    if (!output) {
      output = {
        id: createId("out"),
        workspaceId: context.workspaceId,
        threadId: context.threadId,
        templateKey,
        title,
        kind,
        versions: []
      };
      state.outputs.push(output);
    }
    output.versions.push({ agentId, createdAt: now, blocks: version.blocks });
    message.output = { outputId: output.id, version: output.versions.length };

    addActivity(
      {
        workspaceId: context.workspaceId,
        kind: "output",
        actor: { kind: "agent", id: agentId },
        text: "finished an output",
        excerpt: `${title} · v${output.versions.length}`,
        threadId: context.threadId,
        outputId: output.id
      },
      { read: isViewing }
    );

    version.todos?.forEach((todo) => {
      addTodo({
        workspaceId: context.workspaceId,
        title: todo.title,
        assigneeId: todo.assigneeId,
        createdBy: { kind: "agent", id: agentId },
        source: { threadId: context.threadId }
      });
      if (todo.assigneeId === CURRENT_USER_ID) {
        addActivity(
          {
            workspaceId: context.workspaceId,
            kind: "todo",
            actor: { kind: "agent", id: agentId },
            text: "assigned you a todo",
            excerpt: todo.title,
            threadId: context.threadId
          },
          { read: isViewing }
        );
      }
    });
  }

  state.messages.push(message);
  if (!isViewing) {
    state.unread[context.threadId] = unreadCount(context.threadId) + 1;
  }
}

/** Shows "<agent> is writing…", then runs `reply` after the agent's turn delay. */
function scheduleReply(context: SendContext, agentId: string, order: number, reply: () => void) {
  const key = `${context.threadId}:${agentId}`;
  if (pendingReplies.has(key) || !getAgent(agentId)) return;

  setTyping(context.threadId, agentId, true);
  const timer = setTimeout(
    () => {
      pendingReplies.delete(key);
      setTyping(context.threadId, agentId, false);
      reply();
    },
    REPLY_DELAY_MS + order * EXTRA_AGENT_DELAY_MS
  );
  pendingReplies.set(key, timer);
}

/**
 * Answers an agent's question: your pick shows up as your reply, then the agent writes the
 * output it was asking about.
 */
function pickOption(context: SendContext, messageId: string, optionId: string): void {
  const question = state.messages.find((message) => message.id === messageId);
  const choice = question?.choice;
  const option = choice?.options.find((item) => item.id === optionId);
  if (!question || !choice || !option || choice.pickedId) return;

  choice.pickedId = option.id;
  choice.pickedBy = CURRENT_USER_ID;
  state.messages.push({
    id: createId("msg"),
    threadId: context.threadId,
    kind: "message",
    sender: { kind: "person", id: CURRENT_USER_ID },
    text: option.label,
    mentions: [],
    createdAt: new Date().toISOString()
  });

  const agentId = question.sender.id;
  scheduleReply(context, agentId, 0, () =>
    deliverReply(
      context,
      agentId,
      pickOutputReply(choice.outputKey, versionCountIn(context.threadId, choice.outputKey)),
      CURRENT_USER_ID,
      `Going with “${option.label}”. `
    )
  );
}

function sendMessage(context: SendContext, text: string, mentions: Mention[]): void {
  const message: Message = {
    id: createId("msg"),
    threadId: context.threadId,
    kind: "message",
    sender: { kind: "person", id: CURRENT_USER_ID },
    text,
    mentions,
    createdAt: new Date().toISOString()
  };
  state.messages.push(message);

  const mentionedAgents = mentions
    .filter((mention) => mention.kind === "agent" && context.agentIds.includes(mention.id))
    .map((mention) => mention.id);
  const responders = context.replyAgentId ? [context.replyAgentId] : [...new Set(mentionedAgents)];
  responders.forEach((agentId, order) =>
    scheduleReply(context, agentId, order, () => postAgentReply(context, agentId, message))
  );
}

function cancelPendingReplies(): void {
  pendingReplies.forEach((timer) => clearTimeout(timer));
  pendingReplies.clear();
  state.typing = {};
}

if (import.meta.hot) import.meta.hot.dispose(cancelPendingReplies);

export function useChatStore() {
  return {
    messagesFor,
    lastMessageAt,
    getOutput,
    outputsFor,
    filesFor,
    unreadCount,
    typingIn,
    setActiveThread,
    leaveThread,
    postSystemMessage,
    sendMessage,
    pickOption,
    cancelPendingReplies
  };
}
