<template>
  <div v-if="workspace" :class="pageClass">
    <PageHeader title="Activity">
      <template #actions>
        <MpButton
          is-rounded
          variant="secondary"
          :is-disabled="!unreadCountFor(workspace.id)"
          @click="markAllRead(workspace.id)"
        >
          Mark all as read
        </MpButton>
      </template>
    </PageHeader>

    <PageContent>
      <MpTabs id="activity-tabs" v-model="tab" is-manual :has-margin-bottom="false">
        <MpTabList>
          <MpTab v-for="option in TABS" :key="option.label">{{ option.label }}</MpTab>
        </MpTabList>
      </MpTabs>

      <div v-if="items.length" :class="css({ mt: '2' })">
        <ActivityRow
          v-for="item in items"
          :key="item.id"
          :item="item"
          :location="locationFor(item.threadId)"
          @open="openItem(item)"
        />
      </div>
      <MpFlex v-else direction="column" gap="1" paddingY="10" alignItems="center">
        <MpText weight="semiBold">Nothing here yet</MpText>
        <MpText color="text.secondary"> Mentions, agent outputs and todos show up here. </MpText>
      </MpFlex>
    </PageContent>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { css, MpButton, MpFlex, MpTab, MpTabList, MpTabs, MpText } from "@mekari/pixel3";
import PageContent from "~/components/layout/PageContent.vue";
import PageHeader from "~/components/layout/PageHeader.vue";
import ActivityRow from "~/components/pages/ActivityRow.vue";
import { useActivityStore } from "~/composables/useActivityStore";
import { useCurrentWorkspace } from "~/composables/useCurrentWorkspace";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import type { ActivityItem, ActivityKind } from "~/data/types";
import { threadPath } from "~/utils/paths";

const TABS: { label: string; kind?: ActivityKind }[] = [
  { label: "All" },
  { label: "Mentions", kind: "mention" },
  { label: "Outputs", kind: "output" },
  { label: "Todos", kind: "todo" }
];

const { workspace } = useCurrentWorkspace();
const { feedFor, unreadCountFor, markRead, markAllRead } = useActivityStore();
const { getConversationById, conversationTitle, conversationLabel, agentOf } = useWorkspaceStore();

const tab = ref(0);

const items = computed(() => {
  if (!workspace.value) return [];
  const kind = TABS[tab.value]?.kind;
  return feedFor(workspace.value.id).filter((item) => !kind || item.kind === kind);
});

useHead({ title: "Activity" });

function locationFor(threadId?: string): string | undefined {
  const conversation = threadId ? getConversationById(threadId) : undefined;
  if (!conversation) return undefined;
  if (conversation.kind === "agent") {
    return `your chat with ${agentOf(conversation)?.name ?? "an agent"}, “${conversationTitle(conversation)}”`;
  }
  return conversationLabel(conversation);
}

function openItem(item: ActivityItem) {
  markRead(item.id);
  const conversation = item.threadId ? getConversationById(item.threadId) : undefined;
  if (!workspace.value || !conversation) return;
  navigateTo({
    path: threadPath(workspace.value.id, conversation),
    query: item.outputId ? { output: item.outputId } : undefined
  });
}

const pageClass = css({ display: "flex", flexDirection: "column", flex: "1", minH: "0" });
</script>
