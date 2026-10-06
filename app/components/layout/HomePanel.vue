<template>
  <div v-if="workspace" :class="panelClass">
    <div :class="headerClass">
      <ProjectInfoMenu :workspace="workspace" />
    </div>

    <!-- ═════ Groups ═════ -->
    <SidebarSection id="chats-groups" label="Groups">
      <template #actions>
        <MpTooltip id="browse-groups-tooltip" label="Browse groups" use-portal>
          <MpButton
            variant="ghost"
            size="sm"
            left-icon="search"
            aria-label="Browse groups"
            @click="navigateTo(`${workspacePath(workspace.id)}/groups`)"
          />
        </MpTooltip>
        <MpTooltip id="create-group-tooltip" label="Create group" use-portal>
          <MpButton
            variant="ghost"
            size="sm"
            left-icon="add"
            aria-label="Create group"
            @click="open('create-channel')"
          />
        </MpTooltip>
      </template>
      <template #default="{ isOpen }">
        <ul :class="listClass">
          <li
            v-for="group in groups"
            :key="group.id"
            :class="rowClass"
            :data-hidden="isTucked(group, isOpen) || undefined"
            :inert="isTucked(group, isOpen)"
          >
            <div :class="rowInnerClass">
              <div :class="rowSpacingClass">
                <SideMenuItem
                  :to="conversationPath(workspace.id, group.slug)"
                  :prefix="group.emoji"
                  :label="group.name"
                  :badge="unreadCount(group.id)"
                />
              </div>
            </div>
          </li>
        </ul>
      </template>
    </SidebarSection>

    <!-- ═════ Direct messages: people and agents ═════ -->
    <SidebarSection id="chats-direct" label="Direct messages">
      <template #actions>
        <MpTooltip id="new-message-tooltip" label="New message" use-portal>
          <MpButton
            variant="ghost"
            size="sm"
            left-icon="add"
            aria-label="New message"
            @click="open('new-message')"
          />
        </MpTooltip>
      </template>
      <template #default="{ isOpen }">
        <ul :class="listClass">
          <li
            v-for="dm in directMessages"
            :key="dm.id"
            :class="rowClass"
            :data-hidden="isTucked(dm, isOpen) || undefined"
            :inert="isTucked(dm, isOpen)"
          >
            <div :class="rowInnerClass">
              <div :class="rowSpacingClass">
                <SideMenuItem
                  :to="conversationPath(workspace.id, dm.slug)"
                  :label="dmLabel(dm)"
                  :badge="unreadCount(dm.id)"
                >
                  <template #leading>
                    <span :class="dmAvatarClass">
                      <MemberAvatar :actor="dmActor(dm)" size="xs" />
                    </span>
                  </template>
                </SideMenuItem>
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
import { css, MpButton, MpTooltip } from "@mekari/pixel3";
import ProjectInfoMenu from "~/components/layout/ProjectInfoMenu.vue";
import SideMenuItem from "~/components/layout/SideMenuItem.vue";
import SidebarSection from "~/components/layout/SidebarSection.vue";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import { useAppModals } from "~/composables/useAppModals";
import { useChatStore } from "~/composables/useChatStore";
import { useCurrentWorkspace } from "~/composables/useCurrentWorkspace";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import { getAgent } from "~/data/agents";
import { CURRENT_USER_ID } from "~/data/people";
import type { Actor, Conversation } from "~/data/types";
import { conversationPath, workspacePath } from "~/utils/paths";

const route = useRoute();
const { workspace } = useCurrentWorkspace();
const { joinedChannelsIn, dmsIn, agentDmsIn, conversationTitle } = useWorkspaceStore();
const { unreadCount, lastMessageAt } = useChatStore();
const { open } = useAppModals();

const groups = computed(() => (workspace.value ? joinedChannelsIn(workspace.value.id) : []));

// People and agents together, most recent conversation first.
const directMessages = computed(() => {
  if (!workspace.value) return [];
  const lastActivity = (dm: Conversation) => lastMessageAt(dm.id) ?? dm.createdAt;
  return [...dmsIn(workspace.value.id), ...agentDmsIn(workspace.value.id)].sort((a, b) =>
    lastActivity(b).localeCompare(lastActivity(a))
  );
});

/** Folded away while the section is collapsed; the open chat and unread ones stay, like Slack. */
function isTucked(item: Conversation, isOpen: boolean): boolean {
  if (isOpen || !workspace.value) return false;
  const isOpenChat = route.path === conversationPath(workspace.value.id, item.slug);
  return unreadCount(item.id) === 0 && !isOpenChat;
}

function dmActor(dm: Conversation): Actor {
  if (dm.kind === "agent") return { kind: "agent", id: dm.agentIds[0] ?? "" };
  return {
    kind: "person",
    id: dm.memberIds.find((id) => id !== CURRENT_USER_ID) ?? CURRENT_USER_ID
  };
}

function dmLabel(dm: Conversation): string {
  return dm.kind === "agent"
    ? (getAgent(dm.agentIds[0] ?? "")?.name ?? conversationTitle(dm))
    : conversationTitle(dm);
}

const panelClass = css({ display: "flex", flexDirection: "column", gap: "4", px: "1.5", pb: "6" });

// Same height as the page header so the project name lines up with the page title.
const headerClass = css({
  display: "flex",
  alignItems: "center",
  h: "72px",
  flexShrink: "0",
  mb: "-2"
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

// Centres the 20px avatar in the same 24px column as icons and group emoji.
const dmAvatarClass = css({
  display: "inline-flex",
  justifyContent: "center",
  w: "6",
  flexShrink: "0"
});
</script>
