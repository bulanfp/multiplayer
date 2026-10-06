<template>
  <div :class="[contentClass, padded && paddedClass]" :data-has-submenu="hasSubmenu || undefined">
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

const { hasSubmenu } = useCurrentWorkspace();

// Corner rounds where the page meets the submenu, as in the Pixel enterprise layout.
const contentClass = css({
  flex: "1",
  minH: "0",
  overflowY: "auto",
  bg: "background.neutral",
  "&[data-has-submenu]": { roundedTopLeft: "xl" }
});

const paddedClass = css({ p: "6" });
</script>
