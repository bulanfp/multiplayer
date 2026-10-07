<template>
  <div v-if="workspace" :class="panelClass">
    <!-- ═════ Header: Chats, and + for New chat: pick agents or people ═════ -->
    <div :class="headerClass">
      <SectionLabel>Chats</SectionLabel>
      <!-- Not kept alive, so the picker starts empty every time it opens -->
      <MpPopover
        id="new-chat-menu"
        v-slot="{ onClosePopover }"
        placement="bottom-start"
        use-portal
        :is-keep-alive="false"
      >
        <MpPopoverTrigger>
          <MpButton variant="ghost" size="sm" left-icon="add" aria-label="New chat" />
        </MpPopoverTrigger>
        <MpPopoverContent>
          <NewChatPicker
            :workspace="workspace"
            @done="onClosePopover"
            @create-group="openCreateGroup($event, onClosePopover)"
          />
        </MpPopoverContent>
      </MpPopover>
    </div>

    <!-- ═════ Pinned: groups you pinned, oldest pin first ═════ -->
    <SidebarSection v-if="pinned.length" id="chats-pinned" label="Pinned">
      <template #default="{ isOpen }">
        <ul :class="listClass">
          <li
            v-for="group in pinned"
            :key="group.id"
            :class="rowClass"
            :data-hidden="isGroupTucked(group, isOpen) || undefined"
            :inert="isGroupTucked(group, isOpen)"
          >
            <div :class="rowInnerClass">
              <div :class="rowSpacingClass">
                <ConversationMenuItem :conversation="group" />
              </div>
            </div>
          </li>
        </ul>
      </template>
    </SidebarSection>

    <!-- ═════ Agents: Airene first, then the ones you chat with; each opens its chats ═════ -->
    <SidebarSection id="chats-agents" label="Agents">
      <template #default="{ isOpen }">
        <ul :class="listClass">
          <li
            v-for="agent in agents"
            :key="agent.id"
            :class="rowClass"
            :data-hidden="isAgentTucked(agent.id, isOpen) || undefined"
            :inert="isAgentTucked(agent.id, isOpen)"
          >
            <div :class="rowInnerClass">
              <div :class="rowSpacingClass">
                <AgentMenuItem :workspace-id="workspace.id" :agent-id="agent.id" />
              </div>
            </div>
          </li>
        </ul>
      </template>
    </SidebarSection>

    <!-- ═════ Groups you're in ═════ -->
    <SidebarSection id="chats-groups" label="Groups">
      <template #default="{ isOpen }">
        <ul :class="listClass">
          <li
            v-for="group in groups"
            :key="group.id"
            :class="rowClass"
            :data-hidden="isGroupTucked(group, isOpen) || undefined"
            :inert="isGroupTucked(group, isOpen)"
          >
            <div :class="rowInnerClass">
              <div :class="rowSpacingClass">
                <ConversationMenuItem :conversation="group" />
              </div>
            </div>
          </li>
        </ul>
      </template>
    </SidebarSection>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { css, MpButton, MpPopover, MpPopoverContent, MpPopoverTrigger } from "@mekari/pixel3";
import AgentMenuItem from "~/components/layout/AgentMenuItem.vue";
import ConversationMenuItem from "~/components/layout/ConversationMenuItem.vue";
import SectionLabel from "~/components/layout/SectionLabel.vue";
import SidebarSection from "~/components/layout/SidebarSection.vue";
import NewChatPicker from "~/components/workspace/NewChatPicker.vue";
import { useAppModals, type GroupPicks } from "~/composables/useAppModals";
import { useChatStore } from "~/composables/useChatStore";
import { useCurrentWorkspace } from "~/composables/useCurrentWorkspace";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import { AIRENE_ID, getAgent } from "~/data/agents";
import type { Agent, Conversation } from "~/data/types";
import { agentChatPath, conversationPath } from "~/utils/paths";

const route = useRoute();
const { workspace } = useCurrentWorkspace();
const { chatAgentsIn, agentUnreadCount, joinedChannelsIn } = useWorkspaceStore();
const { unreadCount } = useChatStore();
const { open } = useAppModals();

// Airene is always there, even before your first chat with her.
const agents = computed<Agent[]>(() => {
  const airene = getAgent(AIRENE_ID);
  return [
    ...(airene ? [airene] : []),
    ...(workspace.value ? chatAgentsIn(workspace.value.id) : [])
  ];
});

const pinned = computed(() =>
  workspace.value
    ? joinedChannelsIn(workspace.value.id)
        .filter((group) => group.pinnedAt)
        .sort((a, b) => a.pinnedAt!.localeCompare(b.pinnedAt!))
    : []
);

// Pinned groups move up to Pinned, so they aren't listed twice.
const groups = computed(() =>
  workspace.value ? joinedChannelsIn(workspace.value.id).filter((group) => !group.pinnedAt) : []
);

/** Folded away while the section is collapsed; the open chat and unread ones stay, like Slack. */
function isGroupTucked(group: Conversation, isOpen: boolean): boolean {
  if (isOpen || !workspace.value) return false;
  const isOpenChat = route.path === conversationPath(workspace.value.id, group.slug);
  return unreadCount(group.id) === 0 && !isOpenChat;
}

function isAgentTucked(agentId: string, isOpen: boolean): boolean {
  if (isOpen || !workspace.value) return false;
  const base = agentChatPath(workspace.value.id, agentId);
  const isOpenChat = route.path === base || route.path.startsWith(`${base}/`);
  return agentUnreadCount(workspace.value.id, agentId) === 0 && !isOpenChat;
}

/** Create a group, with the people and agents already picked in New chat ticked. */
function openCreateGroup(picks: GroupPicks, close: () => void) {
  close();
  open("create-channel", picks);
}

const panelClass = css({ display: "flex", flexDirection: "column", gap: "4", px: "1.5", pb: "6" });

// Same height as the page header so "Chats" lines up with the page title, then pulled in so
// the Agents section starts close below it.
const headerClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "2",
  h: "72px",
  flexShrink: "0",
  mb: "-6"
});

const listClass = css({ display: "flex", flexDirection: "column", mt: "1" });

// Rows fold to zero height and fade instead of popping out (grid rows animate smoothly).
const rowClass = css({
  display: "grid",
  gridTemplateRows: "1fr",
  transition: "grid-template-rows .2s ease, opacity .2s ease",
  "&[data-hidden]": { gridTemplateRows: "0fr", opacity: "0" },
  _motionReduce: { transition: "none" }
});

const rowInnerClass = css({ minH: "0", overflow: "hidden" });

// The 2px between rows sits inside the clipped part so it folds away with the row.
const rowSpacingClass = css({ pb: "0.5" });
</script>
