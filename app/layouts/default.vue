<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Multiplayer — App shell
  Source: Figma Cowork (gcfrWrVf5KFk0paqqM9WaN / 4363:2582) + Mekari ERP + Slack/Discord references
  Token mode: Pixel 2.4, enterprise product theme
  Patterns used: layout-shell (dual rail)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  A dark green header (logo, search, profile) over a rounded light canvas. As in Mekari ERP,
  the icon rail sits inside the canvas and switches sections; Chats adds a submenu panel (your
  agent chats and groups), other sections are full width. There are no projects: everyone
  works in one shared space.

  Agent icons in public/images/agents/ are design's HD 3D set, one per agent.
-->
<template>
  <div :class="rootClass">
    <!-- ═════ Header ═════ -->
    <AppHeader />

    <!-- ═════ Layout shell: rail, submenu and page on one canvas ═════ -->
    <PageShell>
      <AppRail />

      <PageLeftSidebar v-if="hasSubmenu">
        <HomePanel />
      </PageLeftSidebar>

      <PageMain>
        <slot />
      </PageMain>
    </PageShell>

    <AppModals />
  </div>
</template>

<script setup lang="ts">
import { css } from "@mekari/pixel3";
import AppHeader from "~/components/layout/AppHeader.vue";
import AppModals from "~/components/layout/AppModals.vue";
import AppRail from "~/components/layout/AppRail.vue";
import HomePanel from "~/components/layout/HomePanel.vue";
import PageLeftSidebar from "~/components/layout/PageLeftSidebar.vue";
import PageMain from "~/components/layout/PageMain.vue";
import PageShell from "~/components/layout/PageShell.vue";
import { useCurrentWorkspace } from "~/composables/useCurrentWorkspace";

const { hasSubmenu } = useCurrentWorkspace();

const rootClass = css({
  display: "flex",
  flexDirection: "column",
  h: "100vh",
  overflow: "hidden",
  bg: "background.surface.bold"
});
</script>
