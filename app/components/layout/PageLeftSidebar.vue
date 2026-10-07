<template>
  <aside :class="sidebarClass">
    <slot />
  </aside>
</template>

<script setup lang="ts">
import { css } from "@mekari/pixel3";

// Fits the longest project name in the panel header without truncating.
const sidebarClass = css({ w: "240px", flexShrink: "0", overflowY: "auto" });
</script>
