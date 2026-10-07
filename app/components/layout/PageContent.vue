<template>
  <div :class="[contentClass, padded && paddedClass]" :data-inset="workspaceId || undefined">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { css } from "@mekari/pixel3";
import { useCurrentWorkspace } from "~/composables/useCurrentWorkspace";

interface PageContentProps {
  /** Inner padding; turn off for edge-to-edge panels */
  padded?: boolean;
}

withDefaults(defineProps<PageContentProps>(), { padded: true });

const { workspaceId } = useCurrentWorkspace();

// Corner rounds where the page meets the rail or the submenu, as in the Pixel enterprise
// layout. Without a project there's no rail, and the page starts at the canvas's edge.
const contentClass = css({
  flex: "1",
  minH: "0",
  overflowY: "auto",
  bg: "background.neutral",
  "&[data-inset]": { roundedTopLeft: "xl" }
});

const paddedClass = css({ p: "6" });
</script>
