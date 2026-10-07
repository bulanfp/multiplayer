<template>
  <nav v-if="workspaceId" :class="railClass" aria-label="Sections">
    <div :class="itemsClass">
      <RailItem
        v-for="item in RAIL_ITEMS"
        :key="item.section"
        :to="sectionPath(workspaceId, item.section)"
        :label="item.label"
        :icon="item.icon"
        :active-icon="item.activeIcon"
        :is-active="section === item.section"
        :badge="item.section === 'home' ? chatUnreadCount(workspaceId) : 0"
      />
    </div>
  </nav>
</template>

<script setup lang="ts">
import { css } from "@mekari/pixel3";
import RailItem from "~/components/layout/RailItem.vue";
import { useCurrentWorkspace } from "~/composables/useCurrentWorkspace";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import { RAIL_ITEMS } from "~/data/navigation";
import { sectionPath } from "~/utils/paths";

const { workspaceId, section } = useCurrentWorkspace();
const { chatUnreadCount } = useWorkspaceStore();

// Inside the light canvas, as in Mekari ERP: it shares the canvas's colour, so the rail, the
// Chats submenu and the page read as one surface under the dark header.
const railClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "4",
  flexShrink: "0",
  w: "72px",
  pt: "4"
});

const itemsClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "3"
});
</script>
