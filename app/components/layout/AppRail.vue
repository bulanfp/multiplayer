<template>
  <nav v-if="workspaceId" :class="railClass" aria-label="Sections">
    <ProjectSwitcher />
    <div :class="itemsClass">
      <RailItem
        v-for="item in RAIL_ITEMS"
        :key="item.section"
        :to="sectionPath(workspaceId, item.section)"
        :label="item.label"
        :icon="item.icon"
        :is-active="section === item.section"
        :badge="item.section === 'home' ? chatUnreadCount(workspaceId) : 0"
      />
    </div>
  </nav>
</template>

<script setup lang="ts">
import { css } from "@mekari/pixel3";
import ProjectSwitcher from "~/components/layout/ProjectSwitcher.vue";
import RailItem from "~/components/layout/RailItem.vue";
import { useCurrentWorkspace } from "~/composables/useCurrentWorkspace";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import { RAIL_ITEMS } from "~/data/navigation";
import { sectionPath } from "~/utils/paths";

const { workspaceId, section } = useCurrentWorkspace();
const { chatUnreadCount } = useWorkspaceStore();

// Same dark green as the header, so the two read as one L-shaped frame (Slack-style).
const railClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "4",
  flexShrink: "0",
  w: "72px",
  pt: "2",
  bg: "background.surface.bold"
});

const itemsClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "3"
});
</script>
