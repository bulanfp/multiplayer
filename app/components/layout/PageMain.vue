<template>
  <main :class="mainClass">
    <slot />
  </main>
</template>

<script setup lang="ts">
import { css } from "@mekari/pixel3";

const mainClass = css({
  display: "flex",
  flexDirection: "column",
  flex: "1",
  minW: "0",
  minH: "0"
});
</script>
