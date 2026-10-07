<template>
  <div :class="splitClass">
    <section :class="mainClass" :aria-label="chat?.name ?? `New chat with ${agent.name}`">
      <!-- ═════ Which chat this is, and that it's yours alone ═════ -->
      <header v-if="chat" :class="chatHeaderClass">
        <MpText weight="semiBold" is-truncated>{{ chat.name }}</MpText>
        <MpTooltip :id="`private-${chat.id}`" label="Only you can see this chat" use-portal>
          <span :class="privateClass" tabindex="0" aria-label="Only you can see this chat">
            <MpIcon name="security" size="sm" color="icon.default" />
          </span>
        </MpTooltip>
      </header>

      <!-- ═════ The chat ═════ -->
      <template v-if="messages.length || typing.length">
        <div
          ref="scrollRef"
          :class="scrollClass"
          role="log"
          :aria-label="`Chat with ${agent.name}`"
        >
          <div :class="threadClass">
            <template v-for="item in items" :key="itemKey(item)">
              <!-- Another agent's part, in full, under who it came from -->
              <div v-if="isConsultRun(item)" :class="consultClass">
                <ConsultLabel :agent-ids="item.agentIds" />
                <div :class="consultBodyClass">
                  <AgentChatMessage
                    v-for="message in item.messages"
                    :key="message.id"
                    :message="message"
                    :active-output="activeOutput"
                    @open-output="openOutput"
                    @pick="pick"
                  />
                </div>
              </div>
              <AgentChatMessage
                v-else
                :message="item"
                :active-output="activeOutput"
                @open-output="openOutput"
                @pick="pick"
              />
            </template>
            <AgentChatMessage
              v-for="agentId in typing"
              :key="`typing-${agentId}`"
              :typing-agent-id="agentId"
            />
            <MpButton
              v-if="typing.length && chat"
              is-rounded
              variant="secondary"
              :class="stopClass"
              @click="stopReplies(chat.id)"
            >
              <span :class="stopSquareClass" aria-hidden="true" />
              Stop generating
            </MpButton>
          </div>
        </div>

        <div :class="footerClass">
          <div :class="columnClass">
            <MessageComposer
              :id="`composer-${agent.id}`"
              :key="chat?.id ?? agent.id"
              variant="airene"
              :mentionables="mentionables"
              :placeholder="placeholder"
              @send="send"
            />
            <MpText size="label-small" color="text.secondary" :class="disclaimerClass">
              AI can make mistakes. Verify important information.
            </MpText>
          </div>
        </div>
      </template>

      <!-- ═════ Nothing yet: the agent says hello above the message box ═════ -->
      <div v-else :class="homeClass">
        <div :class="columnClass">
          <div :class="greetingClass">
            <AgentMascot :key="agent.id" :agent-id="agent.id" />
            <MpText as="h2" size="h2">Hi, I'm {{ agent.name }}.</MpText>
            <MpText color="text.secondary">{{ greetingText }}</MpText>
          </div>
          <MessageComposer
            :id="`composer-${agent.id}`"
            :key="agent.id"
            variant="airene"
            :mentionables="mentionables"
            :placeholder="placeholder"
            @send="send"
          />
          <MpText size="label-small" color="text.secondary" :class="disclaimerClass">
            AI can make mistakes. Verify important information.
          </MpText>
        </div>
      </div>
    </section>

    <!-- ═════ Canvas: an output from this chat ═════ -->
    <SidePanelTransition>
      <OutputCanvas
        v-if="activeOutput"
        :key="`output-${activeOutput.id}`"
        :output-id="activeOutput.id"
        :version="activeOutput.version"
        :source-label="`from your chat with ${agent.name}`"
        @close="activeOutput = null"
        @update:version="activeOutput = { id: activeOutput.id, version: $event }"
      />
    </SidePanelTransition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { css, MpButton, MpIcon, MpText, MpTooltip } from "@mekari/pixel3";
import AgentChatMessage from "~/components/agent-chat/AgentChatMessage.vue";
import SidePanelTransition from "~/components/layout/SidePanelTransition.vue";
import AgentMascot from "~/components/shared/AgentMascot.vue";
import ConsultLabel from "~/components/thread/ConsultLabel.vue";
import MessageComposer from "~/components/thread/MessageComposer.vue";
import OutputCanvas from "~/components/thread/OutputCanvas.vue";
import { useChatStore, type SendContext } from "~/composables/useChatStore";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import { AIRENE_ID } from "~/data/agents";
import type { Agent, Conversation, Message, MessageDraft, Workspace } from "~/data/types";
import { groupConsults, isConsultRun, type ConsultRun } from "~/utils/consults";
import { toMentionables } from "~/utils/directory";
import { agentChatPath } from "~/utils/paths";

interface AgentChatViewProps {
  workspace: Workspace;
  agent: Agent;
  /** The chat on screen; leave out for a new one, saved when you send the first message */
  chat?: Conversation;
}

const props = defineProps<AgentChatViewProps>();

/** Within this many pixels of the end counts as reading the newest messages. */
const STICK_THRESHOLD = 80;

const route = useRoute();
const { createAgentChat } = useWorkspaceStore();
const {
  messagesFor,
  typingIn,
  sendMessage,
  pickOption,
  setActiveThread,
  leaveThread,
  getOutput,
  stopReplies
} = useChatStore();

const scrollRef = ref<HTMLElement | null>(null);
const activeOutput = ref<{ id: string; version: number } | null>(null);

const messages = computed(() => (props.chat ? messagesFor(props.chat.id) : []));
const typing = computed(() => (props.chat ? typingIn(props.chat.id) : []));
const items = computed(() => groupConsults(messages.value));

// Any other agent can be brought in with @: this one checks with it before answering.
const mentionables = computed(() =>
  toMentionables(
    [],
    props.workspace.agentIds.filter((id) => id !== props.agent.id)
  )
);

const placeholder = computed(() => `Message ${props.agent.name}`);

// Airene says what it can do, so the scripted prototype is easy to try; agents describe themselves.
const greetingText = computed(() =>
  props.agent.id === AIRENE_ID
    ? "Ask me to catch you up, plan launch week or find a file. I'll bring in other agents when they can help, or mention one with @. This chat is private to you."
    : `${props.agent.description} Mention another agent with @ and I'll check with them first. This chat is private to you.`
);

function itemKey(item: Message | ConsultRun): string {
  return isConsultRun(item) ? `consult-${item.messages[0]!.id}` : item.id;
}

/** The chat this view marked as being read, so leaving only clears its own. */
let viewingThreadId: string | undefined;

// Opening ?output=<id>&v=<n> (from the Library or Activity) shows that output.
watch(
  () => [props.chat?.id, route.query.output, route.query.v] as const,
  ([id, outputId, version]) => {
    if (viewingThreadId && viewingThreadId !== id) leaveThread(viewingThreadId);
    viewingThreadId = id;
    setActiveThread(id ?? null);
    const output = typeof outputId === "string" ? getOutput(outputId) : undefined;
    activeOutput.value = output
      ? { id: output.id, version: Number(version) || output.versions.length }
      : null;
    nextTick(() => scrollToEnd(true));
  },
  { immediate: true }
);

onBeforeUnmount(() => leaveThread(viewingThreadId));

// New messages and "Writing…" scroll into view when you're already at the end.
watch(
  () => [messages.value.length, typing.value.length],
  () => {
    const element = scrollRef.value;
    const isAtEnd =
      !element || element.scrollHeight - element.scrollTop - element.clientHeight < STICK_THRESHOLD;
    if (isAtEnd) nextTick(() => scrollToEnd(false));
  }
);

function scrollToEnd(isInstant: boolean) {
  const element = scrollRef.value;
  if (element)
    element.scrollTo({ top: element.scrollHeight, behavior: isInstant ? "auto" : "smooth" });
}

function contextFor(chat: Conversation): SendContext {
  return {
    workspaceId: chat.workspaceId,
    threadId: chat.id,
    agentIds: chat.agentIds,
    replyAgentId: props.agent.id
  };
}

/** The first message saves a new chat, titled from what you wrote, and opens it. */
function send(draft: MessageDraft) {
  if (props.chat) {
    sendMessage(contextFor(props.chat), draft);
    return;
  }
  const chat = createAgentChat(props.workspace.id, props.agent.id, draft);
  setActiveThread(chat.id);
  viewingThreadId = chat.id;
  sendMessage(contextFor(chat), draft);
  navigateTo(agentChatPath(props.workspace.id, props.agent.id, chat.slug));
}

function pick(messageId: string, optionId: string) {
  if (props.chat) pickOption(contextFor(props.chat), messageId, optionId);
}

function openOutput(outputId: string, version: number) {
  activeOutput.value = { id: outputId, version };
}

// Ready to type as soon as the chat opens.
onMounted(() =>
  nextTick(() => document.getElementById(`composer-${props.agent.id}-input`)?.focus())
);

// Takes all the room beside the chat list.
const splitClass = css({ display: "flex", flex: "1", minW: "0", h: "full", overflow: "hidden" });

const mainClass = css({
  display: "flex",
  flexDirection: "column",
  flex: "1",
  minW: "0",
  h: "full"
});

// No border under it: the chat's title floats above the messages, as in Mekari's Airene chat.
const chatHeaderClass = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  w: "full",
  maxW: "1088px",
  mx: "auto",
  px: "6",
  pt: "4",
  pb: "2"
});

const privateClass = css({
  display: "inline-flex",
  flexShrink: "0",
  rounded: "full",
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused", outlineOffset: "2px" }
});

const scrollClass = css({ flex: "1", minH: "0", overflowY: "auto", px: "6", pt: "4", pb: "6" });

// Wide enough to fill a laptop screen, centred on bigger ones.
const columnClass = css({
  display: "flex",
  flexDirection: "column",
  gap: "4",
  w: "full",
  maxW: "1040px",
  mx: "auto"
});

// More room between turns than inside one, so each question and answer reads as a pair.
const threadClass = css({
  display: "flex",
  flexDirection: "column",
  gap: "8",
  w: "full",
  maxW: "1040px",
  mx: "auto"
});

const consultClass = css({ display: "flex", flexDirection: "column", gap: "4" });

// The other agents' answers sit on a thin rule, so they read as a side conversation.
const consultBodyClass = css({
  display: "flex",
  flexDirection: "column",
  gap: "6",
  pl: "4",
  borderLeftWidth: "2px",
  borderColor: "border.default"
});

// "Stop generating" sits under the reply that's being written.
const stopClass = css({ alignSelf: "center" });

const stopSquareClass = css({
  display: "inline-block",
  w: "10px",
  h: "10px",
  rounded: "2px",
  bg: "text.default",
  mr: "1"
});

const footerClass = css({ px: "6", pt: "2", pb: "5" });

const disclaimerClass = css({ mt: "-2", textAlign: "center" });

// The greeting sits on top of the message box at the bottom, so the box doesn't move once
// you send the first message (same 20px from the bottom as in a chat).
const homeClass = css({
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  flex: "1",
  minH: "0",
  overflowY: "auto",
  px: "6",
  pt: "6",
  pb: "5"
});

const greetingClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "3",
  mb: "4"
});
</script>
