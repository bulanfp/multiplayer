<template>
  <!-- Holds the fixed copy of the header; hidden until the real header scrolls away -->
  <div :class="rootClass" :data-visible="isVisible || undefined">
    <div :class="fixedClass" :style="{ top: topOffset }">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { css } from "@mekari/pixel3";

interface TableStickyContainerProps {
  isVisible: boolean;
  /** Distance from the top of the viewport, e.g. "120px" */
  topOffset: string;
}

defineProps<TableStickyContainerProps>();

const rootClass = css({
  position: "absolute",
  "&:not([data-visible])": { visibility: "hidden", pointerEvents: "none" }
});

const fixedClass = css({
  position: "fixed",
  zIndex: "sticky",
  bg: "background.surface",
  boxShadow: "0 2px token(colors.border.default)"
});
</script>
