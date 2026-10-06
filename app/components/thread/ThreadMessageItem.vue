<template>
  <div v-if="message.kind === 'system'" :class="systemClass">
    <MpText size="body-small" color="text.secondary">{{ message.text }}</MpText>
    <MpText size="label-small" color="text.secondary">· {{ formatTime(message.createdAt) }}</MpText>
  </div>

  <article v-else class="group" :class="rowClass" :data-continuation="isContinuation || undefined">
    <div :class="gutterClass">
      <MemberAvatar v-if="!isContinuation" :actor="message.sender" />
      <MpText v-else size="label-small" color="text.secondary" :class="hoverTimeClass">
        {{ formatTime(message.createdAt) }}
      </MpText>
    </div>

    <div :class="bodyClass">
      <div v-if="!isContinuation" :class="metaClass">
        <MpText weight="semiBold">{{ actorName(message.sender) }}</MpText>
        <MpBadge v-if="isAgent" for="tableStatus" type="information" size="sm"> Agent </MpBadge>
        <MpText as="time" size="label-small" color="text.secondary" :datetime="message.createdAt">
          {{ formatTime(message.createdAt) }}
        </MpText>
      </div>
      <MessageText :text="message.text" :mentions="message.mentions" />

      <!-- ═════ The agent asks before it writes: pick one option ═════ -->
      <div
        v-if="message.choice"
        :class="choiceClass"
        role="group"
        :aria-label="`Options from ${actorName(message.sender)}`"
      >
        <button
          v-for="option in message.choice.options"
          :key="option.id"
          type="button"
          class="group"
          :class="optionClass"
          :data-picked="option.id === message.choice.pickedId || undefined"
          :disabled="Boolean(message.choice.pickedId) || !canAnswer"
          :aria-pressed="option.id === message.choice.pickedId"
          @click="emit('pick', message.id, option.id)"
        >
          <span :class="optionTextClass">
            <MpText weight="semiBold">{{ option.label }}</MpText>
            <MpText v-if="option.description" size="label-small" color="text.secondary">
              {{ option.description }}
            </MpText>
          </span>
          <MpIcon
            v-if="option.id === message.choice.pickedId"
            name="check"
            size="sm"
            color="icon.brand"
          />
          <MpIcon
            v-else-if="!message.choice.pickedId && canAnswer"
            name="chevrons-right"
            size="sm"
            color="icon.default"
            :class="optionChevronClass"
          />
        </button>
        <MpText v-if="message.choice.pickedBy" size="label-small" color="text.secondary">
          Chosen by {{ getPerson(message.choice.pickedBy)?.name ?? "someone" }}
        </MpText>
        <MpText v-else-if="canAnswer" size="label-small" color="text.secondary">
          Pick one and {{ actorName(message.sender) }} will get started.
        </MpText>
      </div>

      <OutputCard
        v-if="output && message.output"
        :output="output"
        :version="message.output.version"
        :is-active="
          activeOutput?.id === output.id && activeOutput.version === message.output.version
        "
        @open="emit('openOutput', output.id, message.output.version)"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { css, MpBadge, MpIcon, MpText } from "@mekari/pixel3";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import MessageText from "~/components/thread/MessageText.vue";
import OutputCard from "~/components/thread/OutputCard.vue";
import { useChatStore } from "~/composables/useChatStore";
import { getPerson } from "~/data/people";
import type { Message } from "~/data/types";
import { actorName } from "~/utils/directory";
import { formatTime } from "~/utils/format";

interface ThreadMessageItemProps {
  message: Message;
  /** Same sender as the previous message, a few minutes apart: hide avatar and name */
  isContinuation?: boolean;
  /** Output and version currently open in the canvas */
  activeOutput?: { id: string; version: number } | null;
  /** You can post here, so you can also answer an agent's options */
  canAnswer?: boolean;
}

const props = defineProps<ThreadMessageItemProps>();
const emit = defineEmits<{
  openOutput: [outputId: string, version: number];
  pick: [messageId: string, optionId: string];
}>();

const { getOutput } = useChatStore();

const isAgent = computed(() => props.message.sender.kind === "agent");

const output = computed(() =>
  props.message.output ? getOutput(props.message.output.outputId) : undefined
);

const rowClass = css({
  display: "flex",
  gap: "3",
  px: "6",
  pt: "4",
  pb: "1",
  _hover: { bg: "background.neutral.hovered" },
  "&[data-continuation]": { pt: "0.5" }
});

const gutterClass = css({
  display: "flex",
  justifyContent: "center",
  flexShrink: "0",
  w: "8",
  pt: "0.5"
});

// Continuations show their time only on hover, like Slack.
const hoverTimeClass = css({ opacity: "0", _groupHover: { opacity: "1" }, fontSize: "10px" });

const bodyClass = css({ display: "flex", flexDirection: "column", flex: "1", minW: "0" });

const metaClass = css({ display: "flex", alignItems: "center", gap: "2" });

const systemClass = css({ display: "flex", alignItems: "center", gap: "2", px: "6", py: "2" });

const choiceClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "1.5",
  mt: "2",
  maxW: "420px"
});

// Options read as quiet cards; the picked one keeps the brand ring, the rest step back.
const optionClass = css({
  display: "flex",
  alignItems: "center",
  gap: "3",
  w: "full",
  px: "3",
  py: "2",
  textAlign: "left",
  rounded: "lg",
  borderWidth: "1px",
  borderColor: "border.default",
  bg: "background.neutral",
  cursor: "pointer",
  transition: "background-color .15s ease, border-color .15s ease",
  "&:not([disabled]):hover": { bg: "background.neutral.hovered", borderColor: "border.bold" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused" },
  _disabled: { cursor: "default" },
  "&[disabled]:not([data-picked])": { opacity: "0.55" },
  "&[data-picked]": { borderColor: "border.selected", bg: "background.brand" }
});

// Like output cards, the chevron only shows on hover or keyboard focus.
const optionChevronClass = css({
  flexShrink: "0",
  opacity: "0",
  transition: "opacity .15s ease",
  _groupHover: { opacity: "1" },
  _groupFocusVisible: { opacity: "1" }
});

const optionTextClass = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.5",
  flex: "1",
  minW: "0"
});
</script>
