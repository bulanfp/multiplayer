<template>
  <div v-if="workspace" :class="panelClass">
    <div :class="headerClass">
      <MpText size="h3" :class="css({ px: '2' })">Agents</MpText>
    </div>

    <SectionLabel id="agents-in-project">In this project</SectionLabel>
    <ul :class="listClass" aria-labelledby="agents-in-project">
      <li v-for="agentId in workspace.agentIds" :key="agentId">
        <SideMenuItem
          :to="agentPath(workspace.id, agentId)"
          :label="getAgent(agentId)?.name ?? agentId"
          leading="lg"
        >
          <template #leading>
            <MemberAvatar :actor="{ kind: 'agent', id: agentId }" />
          </template>
        </SideMenuItem>
      </li>
    </ul>

    <MpDivider :class="css({ my: '2' })" />
    <button type="button" :class="actionClass" @click="open('create-agent')">
      <MpIcon name="add" size="md" color="icon.default" />
      <MpText>Create agent</MpText>
    </button>
    <SideMenuItem
      :to="`${workspacePath(workspace.id)}/agents`"
      icon="categories"
      label="Browse agents"
    />
  </div>
</template>

<script setup lang="ts">
import { css, MpDivider, MpIcon, MpText } from "@mekari/pixel3";
import SectionLabel from "~/components/layout/SectionLabel.vue";
import SideMenuItem from "~/components/layout/SideMenuItem.vue";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import { useAppModals } from "~/composables/useAppModals";
import { useCurrentWorkspace } from "~/composables/useCurrentWorkspace";
import { getAgent } from "~/data/agents";
import { agentPath, workspacePath } from "~/utils/paths";

const { workspace } = useCurrentWorkspace();
const { open } = useAppModals();

const panelClass = css({ display: "flex", flexDirection: "column", px: "1.5", pb: "6" });

const headerClass = css({
  display: "flex",
  alignItems: "center",
  h: "72px",
  flexShrink: "0"
});

const listClass = css({ display: "flex", flexDirection: "column", gap: "0.5", mt: "2" });

// Same shape as a menu row, but it opens the Create agent modal instead of navigating.
const actionClass = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  w: "full",
  h: "36px",
  px: "2",
  rounded: "md",
  textAlign: "left",
  cursor: "pointer",
  _hover: { bg: "background.neutral.subtle.hovered" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused", outlineOffset: "-2px" }
});
</script>
