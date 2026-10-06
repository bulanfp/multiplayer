<template>
  <button
    type="button"
    :class="rowClass"
    :data-active="isActive || undefined"
    :aria-current="isActive ? 'true' : undefined"
    @click="emit('select')"
  >
    <span :class="bulletClass" aria-hidden="true" />
    <MpText is-truncated>{{ title }}</MpText>
  </button>
</template>

<script setup lang="ts">
import { css, MpText } from "@mekari/pixel3";

interface ChatHistoryItemProps {
  /** Chat title */
  title: string;
  /** Currently open chat */
  isActive?: boolean;
}

defineProps<ChatHistoryItemProps>();
const emit = defineEmits<{ select: [] }>();

const rowClass = css({
  display: "flex",
  alignItems: "center",
  gap: "1",
  w: "full",
  h: "34px",
  px: "2",
  rounded: "md",
  textAlign: "left",
  cursor: "pointer",
  // Hover only on inactive rows so the selected background holds.
  "&:not([data-active]):hover": { bg: "background.neutral.hovered" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused", outlineOffset: "-2px" },
  "&[data-active]": { bg: "background.neutral.subtle.selected" }
});

// 8px ring centred in a 16px slot.
const bulletClass = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: "0",
  w: "4",
  h: "4",
  _before: {
    content: '""',
    w: "2",
    h: "2",
    rounded: "full",
    borderWidth: "1px",
    borderColor: "border.default"
  }
});
</script>
