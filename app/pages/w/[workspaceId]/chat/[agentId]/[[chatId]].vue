<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Multiplayer — An agent's chats
  Source: user's design (agent page with its chat list, like Airene's), Mekari Airene chat
  Token mode: Pixel 2.4, enterprise product theme
  Patterns used: layout-shell
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  STATES INCLUDED:
    - Your chats with the agent on the left (Recent, This week, Older), with search; a filled
      dot marks a chat with replies you haven't read. After New chat, a "New chat" row leads
      Recent until you send
    - New chat (/chat/<agentId>): the agent's greeting above the message box; sending saves the
      chat, titled from what you wrote
    - A chat (/chat/<agentId>/<chat>): Airene-style chat, private to you. Other agents you
      @mention are consulted: their answers show in full under "Messages from …"
    - Unknown agent or chat: not found, with a way back
-->
<template>
  <div v-if="workspace && agent" :class="pageClass">
    <!-- ═════ Page header ═════ -->
    <PageHeader :title="agent.name">
      <template #actions>
        <MpButton is-rounded left-icon="add" @click="newChat">New chat</MpButton>
      </template>
    </PageHeader>

    <PageContent :padded="false">
      <div :class="splitClass">
        <AgentChatList
          :workspace-id="workspace.id"
          :agent-id="agent.id"
          :chats="chats"
          :is-new-chat="isNewChat"
          :active-slug="chat?.slug"
          @new="focusComposer"
        />

        <AgentChatView
          v-if="!slug || chat"
          :key="chat?.id ?? `new-${agent.id}`"
          :workspace="workspace"
          :agent="agent"
          :chat="chat"
        />

        <!-- ═════ Not found ═════ -->
        <div v-else :class="missingClass">
          <MpText size="h3">This chat doesn't exist</MpText>
          <MpText color="text.secondary">
            It may be from before a reload: chats reset in this prototype.
          </MpText>
          <MpButton
            is-rounded
            variant="textLink"
            :class="css({ alignSelf: 'flex-start' })"
            @click="newChat"
          >
            Start a new chat
          </MpButton>
        </div>
      </div>
    </PageContent>
  </div>

  <div v-else :class="pageClass">
    <PageHeader title="Agent not found" />
    <PageContent>
      <MpText color="text.secondary">This agent doesn't exist or was removed.</MpText>
    </PageContent>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick } from "vue";
import { css, MpButton, MpText } from "@mekari/pixel3";
import AgentChatList from "~/components/agent-chat/AgentChatList.vue";
import AgentChatView from "~/components/agent-chat/AgentChatView.vue";
import PageContent from "~/components/layout/PageContent.vue";
import PageHeader from "~/components/layout/PageHeader.vue";
import { useCurrentWorkspace } from "~/composables/useCurrentWorkspace";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import { getAgent } from "~/data/agents";
import { newAgentChatRoute } from "~/utils/paths";

const route = useRoute();
const { workspace } = useCurrentWorkspace();
const { chatsWith, getAgentChat } = useWorkspaceStore();

const agent = computed(() => {
  const found = getAgent(String(route.params.agentId));
  return found && workspace.value?.agentIds.includes(found.id) ? found : undefined;
});

const slug = computed(() => {
  const value = route.params.chatId;
  return typeof value === "string" && value ? value : undefined;
});

/** Started with New chat (or Message), rather than just opening the agent. */
const isNewChat = computed(() => !slug.value && route.query.new !== undefined);

const chats = computed(() =>
  workspace.value && agent.value ? chatsWith(workspace.value.id, agent.value.id) : []
);

const chat = computed(() =>
  workspace.value && agent.value && slug.value
    ? getAgentChat(workspace.value.id, agent.value.id, slug.value)
    : undefined
);

useHead({ title: () => chat.value?.name ?? agent.value?.name ?? "Agent not found" });

/** Puts the cursor in the message box of a new chat. */
function focusComposer() {
  nextTick(() => document.getElementById(`composer-${agent.value?.id}-input`)?.focus());
}

async function newChat() {
  if (!workspace.value || !agent.value) return;
  await navigateTo(newAgentChatRoute(workspace.value.id, agent.value.id));
  focusComposer();
}

const pageClass = css({ display: "flex", flexDirection: "column", flex: "1", minH: "0" });

const splitClass = css({ display: "flex", h: "full", overflow: "hidden" });

const missingClass = css({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: "2",
  flex: "1",
  px: "10"
});
</script>
