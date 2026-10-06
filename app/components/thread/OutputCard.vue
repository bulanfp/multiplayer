<template>
  <button
    type="button"
    class="group"
    :class="cardClass"
    :data-active="isActive || undefined"
    :aria-label="`${isActive ? 'Showing' : 'Open'} ${output.title}, version ${version}`"
    @click="emit('open')"
  >
    <span :class="iconClass">
      <MpIcon name="doc" size="md" color="icon.brand" />
    </span>
    <span :class="textClass">
      <MpText weight="semiBold" is-truncated>{{ output.title }}</MpText>
      <MpText size="label-small" color="text.secondary">{{ output.kind }} · v{{ version }}</MpText>
    </span>
    <!-- The highlighted card already says it's open, so only closed cards show the chevron -->
    <MpIcon
      v-if="!isActive"
      name="chevrons-right"
      size="md"
      color="icon.default"
      :class="chevronClass"
    />
  </button>
</template>

<script setup lang="ts">
import { css, MpIcon, MpText } from "@mekari/pixel3";
import type { Output } from "~/data/types";

interface OutputCardProps {
  output: Output;
  /** 1-based version this message produced */
  version: number;
  /** This version is showing in the canvas */
  isActive?: boolean;
}

defineProps<OutputCardProps>();
const emit = defineEmits<{ open: [] }>();

// The one card in the thread: outputs are the shared work, so they get a highlight object.
const cardClass = css({
  display: "flex",
  alignItems: "center",
  gap: "3",
  w: "360px",
  maxW: "full",
  mt: "2",
  p: "3",
  rounded: "lg",
  borderWidth: "1px",
  borderColor: "border.default",
  bg: "background.neutral",
  textAlign: "left",
  cursor: "pointer",
  transition: "border-color .15s",
  _hover: { borderColor: "border.selected" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused", outlineOffset: "2px" },
  "&[data-active]": { borderColor: "border.selected", bg: "background.brand" }
});

const iconClass = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: "0",
  w: "10",
  h: "10",
  rounded: "md",
  bg: "background.brand"
});

const textClass = css({ display: "flex", flexDirection: "column", flex: "1", minW: "0" });

// Shows on hover (or keyboard focus) so resting cards stay quiet.
const chevronClass = css({
  flexShrink: "0",
  ml: "auto",
  opacity: "0",
  transition: "opacity .15s ease",
  _groupHover: { opacity: "1" },
  _groupFocusVisible: { opacity: "1" }
});
</script>
