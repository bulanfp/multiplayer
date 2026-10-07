<template>
  <!-- The header's search pill from Pixel's enterprise layout; ⌘K or Ctrl+K opens it too. -->
  <div>
    <button
      type="button"
      :class="buttonClass"
      aria-haspopup="dialog"
      :aria-keyshortcuts="IS_MAC ? 'Meta+K' : 'Control+K'"
      @click="isOpen = true"
    >
      <span :class="contentClass">
        <MpIcon name="search" color="icon.inverse" />
        <MpText color="text.inverse">Search or jump to...</MpText>
      </span>
      <MpBadge for="tableStatus" :class="badgeClass">{{ IS_MAC ? "⌘K" : "Ctrl K" }}</MpBadge>
    </button>

    <UniversalSearch :is-open="isOpen" @close="isOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { css, MpBadge, MpIcon, MpText } from "@mekari/pixel3";
import UniversalSearch from "~/components/layout/UniversalSearch.vue";

const IS_MAC = /Mac|iPhone|iPad/.test(navigator.userAgent);

const isOpen = ref(false);

function handleShortcut(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    isOpen.value = !isOpen.value;
  }
}

onMounted(() => window.addEventListener("keydown", handleShortcut));
onBeforeUnmount(() => window.removeEventListener("keydown", handleShortcut));

const buttonClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  w: "400px",
  px: "3",
  py: "2",
  rounded: "full",
  cursor: "pointer",
  bg: "background.header.menu.hovered",
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "background.header.menu.selected",
    outlineOffset: "2px"
  }
});

// Same values as Pixel's QuickSearch: the content dimmed like a placeholder.
const contentClass = css({ display: "flex", alignItems: "center", gap: "2", opacity: "0.5" });

const badgeClass = css({
  bg: "nav.parent !important",
  color: "text.inverse !important",
  opacity: "0.5"
});
</script>
