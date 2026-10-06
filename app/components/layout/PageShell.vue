<template>
  <div :class="outerClass">
    <div :class="innerClass">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { css } from "@mekari/pixel3";

// Rounded light canvas next to the rail; holds the submenu and the page.
// The gutter keeps the dark frame visible on the right and bottom.
const outerClass = css({ display: "flex", flex: "1", minW: "0", minH: "0", pr: "2", pb: "2" });

const innerClass = css({
  display: "flex",
  flex: "1",
  minW: "0",
  bg: "background.neutral.subtle",
  rounded: "10px",
  overflow: "hidden"
});
</script>
