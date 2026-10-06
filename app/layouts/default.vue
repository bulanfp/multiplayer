<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Multiplayer — App shell
  Source: Figma Cowork (gcfrWrVf5KFk0paqqM9WaN / 4363:2582) + Slack/Discord references
  Token mode: Pixel 2.4, enterprise product theme
  Patterns used: layout-shell (dual rail)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Header and icon rail share the dark green frame. The rail switches projects (top icon)
  and sections; Home and Agents add a submenu panel, other sections are full width.

  OPEN ITEMS for product/design follow-up:
    - Agent icons in public/images/agents/ are cut from a screenshot; swap for @3x exports
    - blob-pink, blocks-blue and cloud-teal are recoloured copies until design draws more
-->
<template>
  <div :class="rootClass">
    <!-- ═════ Header ═════ -->
    <AppHeader />

    <div :class="bodyClass">
      <!-- ═════ Rail ═════ -->
      <AppRail />

      <!-- ═════ Layout shell ═════ -->
      <PageShell>
        <PageLeftSidebar v-if="hasSubmenu">
          <HomePanel v-if="section === 'home'" />
          <AgentsPanel v-else />
        </PageLeftSidebar>

        <PageMain>
          <slot />
        </PageMain>
      </PageShell>
    </div>

    <AppModals />
  </div>
</template>

<script setup lang="ts">
import { css } from "@mekari/pixel3";
import AgentsPanel from "~/components/layout/AgentsPanel.vue";
import AppHeader from "~/components/layout/AppHeader.vue";
import AppModals from "~/components/layout/AppModals.vue";
import AppRail from "~/components/layout/AppRail.vue";
import HomePanel from "~/components/layout/HomePanel.vue";
import PageLeftSidebar from "~/components/layout/PageLeftSidebar.vue";
import PageMain from "~/components/layout/PageMain.vue";
import PageShell from "~/components/layout/PageShell.vue";
import { useCurrentWorkspace } from "~/composables/useCurrentWorkspace";

const { section, hasSubmenu } = useCurrentWorkspace();

const rootClass = css({
  display: "flex",
  flexDirection: "column",
  h: "100vh",
  overflow: "hidden",
  bg: "background.surface.bold"
});

const bodyClass = css({ display: "flex", flex: "1", minH: "0" });
</script>
