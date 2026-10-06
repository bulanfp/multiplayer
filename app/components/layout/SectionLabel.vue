<template>
  <MpText :as="as" size="label-small" weight="semiBold" color="text.secondary" :class="labelClass">
    <slot />
  </MpText>
</template>

<script setup lang="ts">
import { css, MpText } from "@mekari/pixel3";

interface SectionLabelProps {
  /** "span" when the label sits inside a button, e.g. a collapsible section header */
  as?: "h2" | "span";
}

withDefaults(defineProps<SectionLabelProps>(), { as: "h2" });

// Pixel's overline size is 10px; the design's section labels are 12px with wide tracking.
const labelClass = css({
  px: "2",
  textTransform: "uppercase",
  letterSpacing: "0.2em",
  whiteSpace: "nowrap"
});
</script>
