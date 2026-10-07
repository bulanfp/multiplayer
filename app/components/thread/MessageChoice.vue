<template>
  <!-- The agent asks before it writes: pick one option -->
  <div :class="choiceClass" role="group" :aria-label="`Options from ${agentName}`">
    <button
      v-for="option in choice.options"
      :key="option.id"
      type="button"
      class="group"
      :class="optionClass"
      :data-picked="option.id === choice.pickedId || undefined"
      :disabled="Boolean(choice.pickedId) || !canAnswer"
      :aria-pressed="option.id === choice.pickedId"
      @click="emit('pick', option.id)"
    >
      <span :class="optionTextClass">
        <MpText weight="semiBold">{{ option.label }}</MpText>
        <MpText v-if="option.description" size="label-small" color="text.secondary">
          {{ option.description }}
        </MpText>
      </span>
      <MpIcon v-if="option.id === choice.pickedId" name="check" size="sm" color="icon.brand" />
      <MpIcon
        v-else-if="!choice.pickedId && canAnswer"
        name="chevrons-right"
        size="sm"
        color="icon.default"
        :class="optionChevronClass"
      />
    </button>
    <MpText v-if="choice.pickedBy" size="label-small" color="text.secondary">
      Chosen by {{ getPerson(choice.pickedBy)?.name ?? "someone" }}
    </MpText>
    <MpText v-else-if="canAnswer" size="label-small" color="text.secondary">
      Pick one and {{ agentName }} will get started.
    </MpText>
  </div>
</template>

<script setup lang="ts">
import { css, MpIcon, MpText } from "@mekari/pixel3";
import { getPerson } from "~/data/people";
import type { MessageChoice } from "~/data/types";

interface MessageChoiceProps {
  choice: MessageChoice;
  /** Who's asking, e.g. "QA agent" */
  agentName: string;
  /** False where you can't post, e.g. a group you haven't joined */
  canAnswer?: boolean;
}

defineProps<MessageChoiceProps>();
const emit = defineEmits<{ pick: [optionId: string] }>();

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
