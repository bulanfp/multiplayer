<template>
  <!-- An agent in the sidebar. It opens the agent's page: your chats with it, and a new one. -->
  <SideMenuItem
    v-if="agent"
    :to="agentChatPath(workspaceId, agent.id)"
    :label="agent.name"
    :badge="agentUnreadCount(workspaceId, agent.id)"
    is-prefix-match
  >
    <template #leading>
      <span :class="avatarClass">
        <MemberAvatar :actor="{ kind: 'agent', id: agent.id }" size="sm" />
      </span>
    </template>
  </SideMenuItem>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { css } from "@mekari/pixel3";
import SideMenuItem from "~/components/layout/SideMenuItem.vue";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import { getAgent } from "~/data/agents";
import { agentChatPath } from "~/utils/paths";

interface AgentMenuItemProps {
  workspaceId: string;
  agentId: string;
}

const props = defineProps<AgentMenuItemProps>();

const { agentUnreadCount } = useWorkspaceStore();

const agent = computed(() => getAgent(props.agentId));

// The 24px avatar fills the same column as group emoji.
const avatarClass = css({
  display: "inline-flex",
  justifyContent: "center",
  w: "6",
  flexShrink: "0"
});
</script>
