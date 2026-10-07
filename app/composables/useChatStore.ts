import { reactive } from "vue";
import { agentIntro } from "~/data/agent-intros";
import type { AgentConsult } from "~/data/agent-scripts";
import { getAgent } from "~/data/agents";
import { CURRENT_USER_ID, getPerson } from "~/data/people";
import { SEED } from "~/data/seed";
import type { LibraryFile, Message, MessageDraft, Output } from "~/data/types";
import { useActivityStore } from "~/composables/useActivityStore";
import { useTodoStore } from "~/composables/useTodoStore";
import {
  pickAgentReply,
  pickConsultReply,
  pickOutputReply,
  type PickedReply
} from "~/utils/agent-replies";
import { createId } from "~/utils/ids";
import {
  fillReply,
  joinRich,
  mentionList,
  withoutMentions,
  type Mentionable,
  type RichText
} from "~/utils/mentions";

const REPLY_DELAY_MS = 1500;
const EXTRA_AGENT_DELAY_MS = 900;

const state = reactive({
  messages: structuredClone(SEED.messages) as Message[],
  outputs: structuredClone(SEED.outputs) as Output[],
  files: structuredClone(SEED.files) as LibraryFile[],
  unread: { ...SEED.unread } as Record<string, number>,
  /** Agent ids currently "writing" per thread */
  typing: {} as Record<string, string[]>,
  /** Outputs shared from an agent chat, waiting in a group's message box until you send */
  shareDrafts: new Map<string, { outputId: string; version: number }>(),
  /** The conversation on screen; replies elsewhere count as unread */
  activeThreadId: null as string | null
});

// Timers live outside reactive state so they never leak into the UI or survive a reload.
const pendingReplies = new Map<string, ReturnType<typeof setTimeout>>();
// Hellos still waiting, keyed like pendingReplies, so an early @mention can post its agent's
// hello first instead of being dropped.
const pendingIntros = new Map<string, () => void>();

const { addActivity } = useActivityStore();
const { addTodo } = useTodoStore();

/** What the store needs to know about the conversation a message is sent in. */
export interface SendContext {
  workspaceId: string;
  threadId: string;
  /** Agents that are members and may answer */
  agentIds: string[];
  /**
   * An agent chat's agent: it answers every message, and checks with any other agent you
   * @mention first. Groups have none: agents there answer when @mentioned.
   */
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

function getFile(id: string): LibraryFile | undefined {
  return state.files.find((file) => file.id === id);
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

function outputsIn(threadId: string): Output[] {
  return state.outputs.filter((output) => output.threadId === threadId);
}

function versionCountIn(threadId: string, templateKey: string): number {
  return (
    outputsIn(threadId).find((output) => output.templateKey === templateKey)?.versions.length ?? 0
  );
}

function agentMentionable(agentId: string): Mentionable {
  return { kind: "agent", id: agentId, name: getAgent(agentId)?.name ?? agentId };
}

/**
 * Who a reply @mentions: the person who asked in a group. In an agent chat the asker is the
 * only reader, so the reply doesn't mention them.
 */
function askerFor(context: SendContext, personId: string): Mentionable | undefined {
  const person = context.replyAgentId ? undefined : getPerson(personId);
  return person ? { kind: "person", id: person.id, name: person.name } : undefined;
}

/** Adds an agent's message; it counts as unread unless you're looking at the conversation. */
function pushAgentMessage(context: SendContext, message: Message): void {
  state.messages.push(message);
  if (state.activeThreadId !== context.threadId) {
    state.unread[context.threadId] = unreadCount(context.threadId) + 1;
  }
}

/**
 * Posts an agent's reply: a question with options, an output (new or next version), or
 * plain text. `prefix` leads the text, e.g. thanking the agents it checked with.
 * `consultedBy` marks a reply written because another agent asked.
 */
function deliverReply(
  context: SendContext,
  agentId: string,
  picked: PickedReply,
  asker: Mentionable | undefined,
  { prefix = "", consultedBy }: { prefix?: string | RichText; consultedBy?: string } = {}
): void {
  const outputsHere = outputsIn(context.threadId);
  // Anything that lands in the thread you're looking at is already seen.
  const isViewing = state.activeThreadId === context.threadId;
  const content = joinRich(prefix, fillReply(picked.reply, asker, picked.title));
  const now = new Date().toISOString();
  const message: Message = {
    id: createId("msg"),
    threadId: context.threadId,
    kind: "message",
    sender: { kind: "agent", id: agentId },
    text: content.text,
    mentions: content.mentions,
    consultedBy,
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

  pushAgentMessage(context, message);
}

/**
 * Shows "<agent> is writing…", then runs `reply` after the agent's turn delay. `step` keeps
 * an agent's part in someone else's consult apart from its own reply in the same thread.
 */
function scheduleReply(
  context: SendContext,
  agentId: string,
  order: number,
  reply: () => void,
  step?: string
) {
  const key = step ? `${context.threadId}:${agentId}:${step}` : `${context.threadId}:${agentId}`;
  // @mentioned before its hello landed: it says hello now, then answers as usual.
  const intro = step ? undefined : pendingIntros.get(key);
  if (intro) {
    clearTimeout(pendingReplies.get(key));
    pendingReplies.delete(key);
    intro();
  }
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
 * An agent answers a message. If its script, or you in an agent chat, brings in other agents,
 * it says who it's checking with, each of them answers in turn (in full, marked as
 * consulted), and then it replies with what it learned.
 */
function respond(
  context: SendContext,
  agentId: string,
  trigger: Message,
  mentioned: string[],
  order: number
): void {
  const text = withoutMentions(trigger.text, trigger.mentions);
  const versionCount = (templateKey: string) => versionCountIn(context.threadId, templateKey);
  const asker = askerFor(context, trigger.sender.id);
  const picked = pickAgentReply(agentId, text, versionCount);

  const scripted = picked.consult ?? [];
  const helpers: AgentConsult[] = [
    ...scripted,
    ...mentioned
      .filter((id) => !scripted.some((consult) => consult.agentId === id))
      .map((id) => ({ agentId: id }))
  ].filter((consult) => consult.agentId !== agentId && getAgent(consult.agentId));

  if (!helpers.length) {
    scheduleReply(context, agentId, order, () => deliverReply(context, agentId, picked, asker));
    return;
  }

  const names = mentionList(helpers.map((helper) => agentMentionable(helper.agentId)));
  scheduleReply(context, agentId, order, () => {
    deliverReply(context, agentId, { reply: "" }, undefined, {
      prefix: joinRich("Let me check with ", names, ".")
    });
    helpers.forEach((helper, index) =>
      scheduleReply(
        context,
        helper.agentId,
        index,
        () => {
          deliverReply(
            context,
            helper.agentId,
            pickConsultReply(helper, text, versionCount),
            agentMentionable(agentId),
            { consultedBy: agentId }
          );
          if (index < helpers.length - 1) return;
          // Everyone has answered: the agent replies, starting from what they said.
          scheduleReply(
            context,
            agentId,
            0,
            () =>
              deliverReply(
                context,
                agentId,
                { ...pickAgentReply(agentId, text, versionCount), consult: undefined },
                asker,
                { prefix: joinRich("Thanks, ", names, ". ") }
              ),
            "consult"
          );
        },
        `consult-${agentId}`
      )
    );
  });
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
      askerFor(context, CURRENT_USER_ID),
      { prefix: `Going with “${option.label}”. ` }
    )
  );
}

/** An agent's hello, @mentioning whoever added it. Unread like any reply if you've moved on. */
function postIntro(context: SendContext, agentId: string, addedBy: string): void {
  const adder = getPerson(addedBy);
  const filled = fillReply(
    agentIntro(agentId),
    adder ? { kind: "person", id: adder.id, name: adder.name } : undefined,
    ""
  );
  pushAgentMessage(context, {
    id: createId("msg"),
    threadId: context.threadId,
    kind: "message",
    sender: { kind: "agent", id: agentId },
    text: filled.text,
    mentions: filled.mentions,
    intro: true,
    createdAt: new Date().toISOString()
  });
}

/**
 * Agents just added to a group say hello one after another, each "writing…" first like a
 * reply, so the group sees who joined and what to @mention them for.
 */
function introduceAgents(context: SendContext, agentIds: string[], addedBy: string): void {
  agentIds.forEach((agentId, order) => {
    const key = `${context.threadId}:${agentId}`;
    const wasBusy = pendingReplies.has(key);
    const post = () => {
      pendingIntros.delete(key);
      postIntro(context, agentId, addedBy);
    };
    scheduleReply(context, agentId, order, post);
    if (!wasBusy && pendingReplies.has(key)) pendingIntros.set(key, post);
  });
}

function sendMessage(context: SendContext, draft: MessageDraft): void {
  const { text, mentions, attachments } = draft;
  const now = new Date().toISOString();
  // Attachments are kept as Library files, so they show up under Files too.
  const fileIds = attachments.map((attachment) => {
    const file: LibraryFile = {
      id: createId("file"),
      workspaceId: context.workspaceId,
      name: attachment.name,
      type: attachment.type,
      size: attachment.size,
      threadId: context.threadId,
      uploadedBy: CURRENT_USER_ID,
      uploadedAt: now,
      previewUrl: attachment.previewUrl
    };
    state.files.push(file);
    return file.id;
  });
  const message: Message = {
    id: createId("msg"),
    threadId: context.threadId,
    kind: "message",
    sender: { kind: "person", id: CURRENT_USER_ID },
    text,
    mentions,
    output: draft.output,
    fileIds: fileIds.length ? fileIds : undefined,
    createdAt: now
  };
  state.messages.push(message);

  // A shared output now lives here too, so the Library lists it from this conversation.
  const shared = draft.output && getOutput(draft.output.outputId);
  if (shared && shared.threadId !== context.threadId) {
    shared.sharedThreadIds = [...new Set([...(shared.sharedThreadIds ?? []), context.threadId])];
  }
  state.shareDrafts.delete(context.threadId);

  const mentionedAgents = [
    ...new Set(mentions.filter((mention) => mention.kind === "agent").map((mention) => mention.id))
  ];
  // An agent chat's agent answers everything, checking with anyone you mention first.
  // In a group, each agent you mention answers.
  if (context.replyAgentId) {
    respond(context, context.replyAgentId, message, mentionedAgents, 0);
    return;
  }
  mentionedAgents
    .filter((agentId) => context.agentIds.includes(agentId))
    .forEach((agentId, order) => respond(context, agentId, message, [], order));
}

/**
 * Shares an output from one of your agent chats: it waits in the group's message box,
 * quoted, so you can say what it's for before you send it.
 */
function startShare(threadId: string, outputId: string, version: number): void {
  state.shareDrafts.set(threadId, { outputId, version });
}

function shareDraftFor(threadId: string): { outputId: string; version: number } | undefined {
  return state.shareDrafts.get(threadId);
}

function clearShareDraft(threadId: string): void {
  state.shareDrafts.delete(threadId);
}

/** "Stop generating": drops the replies still being written in a conversation. */
function stopReplies(threadId: string): void {
  pendingReplies.forEach((timer, key) => {
    if (!key.startsWith(`${threadId}:`)) return;
    clearTimeout(timer);
    pendingReplies.delete(key);
    pendingIntros.delete(key);
  });
  state.typing[threadId] = [];
}

function cancelPendingReplies(): void {
  pendingReplies.forEach((timer) => clearTimeout(timer));
  pendingReplies.clear();
  pendingIntros.clear();
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
    getFile,
    unreadCount,
    typingIn,
    setActiveThread,
    leaveThread,
    postSystemMessage,
    introduceAgents,
    sendMessage,
    pickOption,
    startShare,
    shareDraftFor,
    clearShareDraft,
    stopReplies,
    cancelPendingReplies
  };
}
