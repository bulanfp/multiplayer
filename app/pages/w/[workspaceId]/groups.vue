<template>
  <div v-if="workspace" :class="pageClass">
    <PageHeader title="Groups" :subtitle="`${channels.length} in ${workspace.name}`">
      <template #actions>
        <MpButton left-icon="add" @click="open('create-channel')">Create group</MpButton>
      </template>
    </PageHeader>

    <PageContent>
      <div :class="css({ maxW: '360px' })">
        <SearchInput id="browse-groups-search" v-model="query" placeholder="Search groups" />
      </div>

      <ul v-if="filtered.length" :class="css({ mt: '4' })">
        <li v-for="channel in filtered" :key="channel.id" :class="rowClass">
          <NuxtLink :to="conversationPath(workspace.id, channel.slug)" :class="linkClass">
            <MpText weight="semiBold">{{ conversationLabel(channel) }}</MpText>
            <MpText size="body-small" color="text.secondary">
              {{ channel.description || "No description" }} · {{ channel.memberIds.length }}
              {{ channel.memberIds.length === 1 ? "person" : "people" }} ·
              {{ channel.agentIds.length }} {{ channel.agentIds.length === 1 ? "agent" : "agents" }}
            </MpText>
          </NuxtLink>
          <MpBadge v-if="isMember(channel)" for="tableStatus" type="completed">Joined</MpBadge>
          <MpButton v-else variant="secondary" size="sm" @click="join(channel)">Join</MpButton>
        </li>
      </ul>

      <MpFlex v-else direction="column" alignItems="flex-start" gap="2" marginTop="6">
        <MpText weight="semiBold">No groups match “{{ query.trim() }}”</MpText>
        <MpText color="text.secondary">
          Check the spelling, or create the group your team needs.
        </MpText>
        <MpButton variant="textLink" @click="open('create-channel')">Create group</MpButton>
      </MpFlex>
    </PageContent>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { css, toast, MpBadge, MpButton, MpFlex, MpText } from "@mekari/pixel3";
import SearchInput from "~/components/chat/SearchInput.vue";
import PageContent from "~/components/layout/PageContent.vue";
import PageHeader from "~/components/layout/PageHeader.vue";
import { useAppModals } from "~/composables/useAppModals";
import { useCurrentWorkspace } from "~/composables/useCurrentWorkspace";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import type { Conversation } from "~/data/types";
import { conversationPath } from "~/utils/paths";

const { workspace } = useCurrentWorkspace();
const { channelsIn, isMember, joinChannel, conversationLabel } = useWorkspaceStore();
const { open } = useAppModals();

const query = ref("");

const channels = computed(() => (workspace.value ? channelsIn(workspace.value.id) : []));

const filtered = computed(() => {
  const needle = query.value.trim().toLowerCase();
  if (!needle) return channels.value;
  return channels.value.filter(
    (channel) =>
      channel.name.toLowerCase().includes(needle) ||
      channel.description?.toLowerCase().includes(needle)
  );
});

useHead({ title: "Groups" });

function join(channel: Conversation) {
  if (!workspace.value) return;
  joinChannel(channel);
  toast.notify({ title: `Joined ${channel.name}`, variant: "success" });
  navigateTo(conversationPath(workspace.value.id, channel.slug));
}

const pageClass = css({ display: "flex", flexDirection: "column", flex: "1", minH: "0" });

// Rows, not cards: a flat bordered list that scans quickly.
const rowClass = css({
  display: "flex",
  alignItems: "center",
  gap: "4",
  py: "3",
  borderBottomWidth: "1px",
  borderColor: "border.default"
});

const linkClass = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.5",
  flex: "1",
  minW: "0",
  textDecoration: "none",
  color: "text.default",
  rounded: "md",
  _hover: { "& p:first-child": { color: "text.link" } },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused", outlineOffset: "2px" }
});
</script>
