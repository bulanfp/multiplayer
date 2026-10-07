<template>
  <!-- As in Mekari's Airene chat: your messages are bubbles on the right with your photo -->
  <div v-if="message && !agentId" :class="mineClass">
    <div :class="mineBodyClass">
      <div v-if="message.text" :class="bubbleClass">
        <MessageText :text="message.text" :mentions="message.mentions" />
      </div>
      <MessageFiles :file-ids="message.fileIds" />
    </div>
    <MemberAvatar :actor="message.sender" />
  </div>

  <!-- An agent's reply is plain text under its name; while it's writing, a spinner -->
  <div v-else :class="replyClass">
    <div :class="replyHeaderClass">
      <MemberAvatar :actor="{ kind: 'agent', id: agentId ?? 'airene' }" size="xs" />
      <MpText size="label-small" weight="semiBold">{{ agentName }}</MpText>
    </div>
    <div v-if="!message" :class="writingClass" role="status">
      <MpSpinner size="sm" color="icon.default" />
      <MpText color="text.secondary">Writing…</MpText>
    </div>
    <template v-else>
      <MessageText :text="message.text" :mentions="message.mentions" :class="replyTextClass" />
      <MessageFiles :file-ids="message.fileIds" />
      <MessageChoice
        v-if="message.choice"
        :choice="message.choice"
        :agent-name="agentName"
        can-answer
        @pick="emit('pick', message.id, $event)"
      />
      <template v-if="output && message.output">
        <OutputCard
          :output="output"
          :version="message.output.version"
          :is-active="
            activeOutput?.id === output.id && activeOutput.version === message.output.version
          "
          @open="emit('openOutput', output.id, message.output.version)"
        />
        <ShareOutputMenu
          :workspace-id="output.workspaceId"
          :output-id="output.id"
          :version="message.output.version"
        />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { css, MpSpinner, MpText } from "@mekari/pixel3";
import ShareOutputMenu from "~/components/agent-chat/ShareOutputMenu.vue";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import MessageChoice from "~/components/thread/MessageChoice.vue";
import MessageFiles from "~/components/thread/MessageFiles.vue";
import MessageText from "~/components/thread/MessageText.vue";
import OutputCard from "~/components/thread/OutputCard.vue";
import { useChatStore } from "~/composables/useChatStore";
import { getAgent } from "~/data/agents";
import type { Message } from "~/data/types";

interface AgentChatMessageProps {
  /** Leave out, with `typingAgentId`, for an agent that's still writing */
  message?: Message;
  typingAgentId?: string;
  /** Output and version open in the canvas */
  activeOutput?: { id: string; version: number } | null;
}

const props = defineProps<AgentChatMessageProps>();
const emit = defineEmits<{
  openOutput: [outputId: string, version: number];
  pick: [messageId: string, optionId: string];
}>();

const { getOutput } = useChatStore();

/** The agent answering or writing; undefined for your own messages. */
const agentId = computed(() =>
  props.message
    ? props.message.sender.kind === "agent"
      ? props.message.sender.id
      : undefined
    : props.typingAgentId
);
const agentName = computed(() => getAgent(agentId.value ?? "")?.name ?? "Airene");
const output = computed(() =>
  props.message?.output ? getOutput(props.message.output.outputId) : undefined
);

const mineClass = css({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "flex-end",
  gap: "3",
  pl: "10"
});

const mineBodyClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  minW: "0"
});

// The top corner next to your photo is pointed, as in Mekari Airene's chat. Your bubbles take
// the brand tint here and in groups.
const bubbleClass = css({
  px: "4",
  py: "2.5",
  rounded: "16px",
  roundedTopRight: "0",
  bg: "background.brand",
  maxW: "min(600px, 100%)"
});

const replyClass = css({ display: "flex", flexDirection: "column", gap: "1.5", minW: "0" });

const replyHeaderClass = css({ display: "flex", alignItems: "center", gap: "2" });

// Replies aren't bubbles, but they wrap at a comfortable reading width all the same.
const replyTextClass = css({ maxW: "680px" });

const writingClass = css({ display: "flex", alignItems: "center", gap: "2" });
</script>
