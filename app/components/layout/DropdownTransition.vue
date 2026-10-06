<template>
  <div
    class="group"
    :class="wrapperClass"
    @mouseenter="isOpen = true"
    @mouseleave="isOpen = false"
    @focusin="isOpen = true"
    @focusout="handleFocusOut"
  >
    <slot name="trigger" :is-open="isOpen" />

    <Transition name="dropdown">
      <div v-show="isOpen" :class="panelClass" :style="{ [align]: 0, minWidth }">
        <div :class="contentClass">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { css } from "@mekari/pixel3";

// Hover dropdown from the Pixel enterprise layout; also opens on keyboard focus.
interface DropdownTransitionProps {
  /** Which edge of the trigger the panel anchors to */
  align?: "left" | "right";
  /** Minimum width of the panel */
  minWidth?: string;
}

withDefaults(defineProps<DropdownTransitionProps>(), {
  align: "left",
  minWidth: "200px"
});

const isOpen = ref(false);

function handleFocusOut(event: FocusEvent) {
  const wrapper = event.currentTarget as HTMLElement;
  if (!wrapper.contains(event.relatedTarget as Node | null)) isOpen.value = false;
}

const wrapperClass = css({ position: "relative", display: "inline-block" });

const panelClass = css({
  position: "absolute",
  top: "100%",
  pt: "1",
  zIndex: "popover"
});

const contentClass = css({
  bg: "background.neutral",
  rounded: "md",
  shadow: "lg",
  borderWidth: "1px",
  borderColor: "border.default",
  overflow: "hidden"
});
</script>

<style scoped>
.dropdown-enter-active {
  transition:
    opacity 0.2s ease-out,
    transform 0.2s ease-out;
}

.dropdown-leave-active {
  transition:
    opacity 0.1s ease-in,
    transform 0.1s ease-in;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
