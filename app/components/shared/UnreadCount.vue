<template>
  <span
    :class="countClass"
    :aria-label="`${count} unread ${count === 1 ? 'message' : 'messages'}`"
    :title="`${count} unread ${count === 1 ? 'message' : 'messages'}`"
  >
    {{ count > 99 ? "99+" : count }}
  </span>
</template>

<script setup lang="ts">
import { css } from "@mekari/pixel3";

defineProps<{ count: number }>();

// The one unread style: a red circle for one digit that stretches into a pill for 10+.
const countClass = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: "0",
  minW: "18px",
  h: "18px",
  px: "1",
  rounded: "full",
  bg: "background.danger.bold",
  color: "text.inverse.static",
  fontSize: "xs",
  fontWeight: "semiBold",
  lineHeight: "1"
});
</script>
