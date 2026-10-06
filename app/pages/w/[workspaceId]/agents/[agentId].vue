<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Multiplayer — Agent chat
  Source: Figma Cowork (gcfrWrVf5KFk0paqqM9WaN / 4363:2582), from a screenshot
  Token mode: Pixel 2.4, enterprise product theme
  Patterns used: layout-shell
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  STATES INCLUDED:
    - Chat history grouped Recent / This week / Older, searchable; New chat starts a fresh one
    - Every message goes to the agent (no @ needed); scripted reply with output card + canvas
    - First message renames a "New chat" after what was asked
    - Agent not in this project: prompt to add it; unknown agent: not found
-->
<template>
  <div :class="pageClass">
    <template v-if="workspace && agent && isInProject">
      <PageHeader :title="agent.name" :subtitle="agent.role">
        <template #actions>
          <MpButton left-icon="add" is-rounded @click="startNewChat">New chat</MpButton>
        </template>
      </PageHeader>

      <PageContent :padded="false">
        <div :class="splitClass">
          <ChatHistoryPanel
            :groups="groups"
            :active-chat-id="activeChat?.id ?? null"
            @select="selectChat"
            @new-chat="startNewChat"
          />

          <ThreadView
            v-if="activeChat"
            :thread-id="activeChat.id"
            :label="`Chat with ${agent.name}`"
            :mentionables="[]"
            :placeholder="`Ask ${agent.name} anything`"
            :active-output="panel ? { id: panel.outputId, version: panel.version } : null"
            @send="send"
            @open-output="(outputId, version) => (panel = { outputId, version })"
            @pick="pick"
          >
            <template #intro>
              <MpFlex
                direction="column"
                alignItems="flex-start"
                gap="2"
                paddingX="6"
                paddingBottom="2"
              >
                <MemberAvatar :actor="{ kind: 'agent', id: agent.id }" size="lg" />
                <MpText size="h2">{{ agent.name }}</MpText>
                <MpText color="text.secondary">{{ agent.description }}</MpText>
              </MpFlex>
            </template>
          </ThreadView>

          <SidePanelTransition>
            <OutputCanvas
              v-if="panel"
              :output-id="panel.outputId"
              :version="panel.version"
              @close="panel = null"
              @update:version="panel = { outputId: panel.outputId, version: $event }"
            />
          </SidePanelTransition>
        </div>
      </PageContent>
    </template>

    <template v-else-if="workspace && agent">
      <PageHeader :title="agent.name" />
      <PageContent>
        <MpFlex direction="column" alignItems="flex-start" gap="3">
          <MpText color="text.secondary">
            {{ agent.name }} isn't in {{ workspace.name }} yet. Add it to chat here and mention it
            in groups.
          </MpText>
          <MpButton left-icon="add" @click="addAgentToWorkspace(workspace.id, agent.id)">
            Add to project
          </MpButton>
        </MpFlex>
      </PageContent>
    </template>

    <template v-else>
      <PageHeader title="Agent not found" />
      <PageContent>
        <MpText color="text.secondary">This agent doesn't exist or was removed.</MpText>
      </PageContent>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { css, MpButton, MpFlex, MpText } from "@mekari/pixel3";
import ChatHistoryPanel from "~/components/chat/ChatHistoryPanel.vue";
import PageContent from "~/components/layout/PageContent.vue";
import PageHeader from "~/components/layout/PageHeader.vue";
import SidePanelTransition from "~/components/layout/SidePanelTransition.vue";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import OutputCanvas from "~/components/thread/OutputCanvas.vue";
import ThreadView from "~/components/thread/ThreadView.vue";
import { useChatStore } from "~/composables/useChatStore";
import { useCurrentWorkspace } from "~/composables/useCurrentWorkspace";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import { getAgent } from "~/data/agents";
import type { ChatHistoryGroup, Conversation, Mention } from "~/data/types";

const TITLE_LENGTH = 40;
const WEEK_MS = 7 * 86_400_000;

const route = useRoute();
const router = useRouter();
const { workspace } = useCurrentWorkspace();
const { agentChatsIn, createAgentChat, renameConversation, addAgentToWorkspace } =
  useWorkspaceStore();
const { sendMessage, pickOption, setActiveThread, leaveThread, lastMessageAt, messagesFor } =
  useChatStore();

const panel = ref<{ outputId: string; version: number } | null>(null);

const agent = computed(() => getAgent(String(route.params.agentId)));
const isInProject = computed(() =>
  Boolean(agent.value && workspace.value?.agentIds.includes(agent.value.id))
);

function lastActivity(chat: Conversation): string {
  return lastMessageAt(chat.id) ?? chat.createdAt;
}

const chats = computed(() =>
  workspace.value && agent.value
    ? [...agentChatsIn(workspace.value.id, agent.value.id)].sort((a, b) =>
        lastActivity(b).localeCompare(lastActivity(a))
      )
    : []
);

const activeChat = computed(
  () => chats.value.find((chat) => chat.id === route.query.chat) ?? chats.value[0]
);

const groups = computed<ChatHistoryGroup[]>(() => {
  const now = Date.now();
  const buckets: Record<string, ChatHistoryGroup> = {
    recent: { label: "Recent", chats: [] },
    week: { label: "This week", chats: [] },
    older: { label: "Older", chats: [] }
  };
  chats.value.forEach((chat) => {
    const age = now - Date.parse(lastActivity(chat));
    const bucket = age < 86_400_000 ? "recent" : age < WEEK_MS ? "week" : "older";
    buckets[bucket]!.chats.push({ id: chat.id, title: chat.name });
  });
  return Object.values(buckets).filter((group) => group.chats.length);
});

// Every visit lands on a chat: the most recent one, or a fresh one if there are none.
watch(
  () => [workspace.value?.id, agent.value?.id, isInProject.value] as const,
  ([workspaceId, agentId, inProject]) => {
    if (workspaceId && agentId && inProject && !chats.value.length) {
      createAgentChat(workspaceId, agentId);
    }
  },
  { immediate: true }
);

/** The chat this page marked as being read, so leaving only clears its own. */
let viewingThreadId: string | undefined;

watch(
  () => activeChat.value?.id,
  (id) => {
    viewingThreadId = id;
    setActiveThread(id ?? null);
    panel.value = null;
  },
  { immediate: true }
);

onBeforeUnmount(() => leaveThread(viewingThreadId));

useHead({ title: () => agent.value?.name ?? "Agent not found" });

function selectChat(chatId: string) {
  router.replace({ query: { chat: chatId } });
}

function startNewChat() {
  if (!workspace.value || !agent.value) return;
  // Reuse an empty "New chat" instead of piling them up.
  const empty = chats.value.find((chat) => !messagesFor(chat.id).length);
  const chat = empty ?? createAgentChat(workspace.value.id, agent.value.id);
  selectChat(chat.id);
}

function send(payload: { text: string; mentions: Mention[] }) {
  const chat = activeChat.value;
  if (!workspace.value || !agent.value || !chat) return;
  if (!messagesFor(chat.id).length) {
    const title = payload.text.replace(/\s+/g, " ");
    renameConversation(
      chat,
      title.length > TITLE_LENGTH ? `${title.slice(0, TITLE_LENGTH)}…` : title
    );
  }
  sendMessage(
    {
      workspaceId: workspace.value.id,
      threadId: chat.id,
      agentIds: [agent.value.id],
      replyAgentId: agent.value.id
    },
    payload.text,
    payload.mentions
  );
}

function pick(messageId: string, optionId: string) {
  const chat = activeChat.value;
  if (!workspace.value || !agent.value || !chat) return;
  pickOption(
    {
      workspaceId: workspace.value.id,
      threadId: chat.id,
      agentIds: [agent.value.id],
      replyAgentId: agent.value.id
    },
    messageId,
    optionId
  );
}

const pageClass = css({ display: "flex", flexDirection: "column", flex: "1", minH: "0" });

const splitClass = css({ display: "flex", h: "full", overflow: "hidden" });
</script>
