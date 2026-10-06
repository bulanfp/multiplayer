<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Multiplayer — Group, direct message and agent chat
  Source: confirmed plan (no Figma for this screen); Slack/Discord as reference
  Token mode: Pixel 2.4, enterprise product theme
  Patterns used: layout-shell
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  STATES INCLUDED:
    - Thread with day dividers and grouped messages; system messages for membership changes
    - Groups open with an intro and show their description; direct messages show only the avatar and name
    - @mention list (agents first), "<agent> is writing…", scripted reply with output card
    - Output canvas (versions, copy, close) and members panel, one at a time
    - Not a member yet: Join bar instead of the composer
    - Unknown group: in-shell not-found message
-->
<template>
  <div :class="pageClass">
    <template v-if="workspace && conversation">
      <!-- ═════ Page header ═════ -->
      <PageHeader :title="label" :subtitle="subtitle">
        <template v-if="headerActor" #leading>
          <MemberAvatar :actor="headerActor" />
        </template>
        <template #actions>
          <!-- An agent chat opened from Direct messages; its other chats live on the agent page -->
          <MpButton
            v-if="agent"
            variant="secondary"
            @click="
              navigateTo({
                path: agentPath(workspace.id, agent.id),
                query: { chat: conversation.id }
              })
            "
          >
            All chats
          </MpButton>
          <ConversationHeaderActions
            v-else
            :conversation="conversation"
            :is-members-open="panel?.kind === 'members'"
            @toggle-members="toggleMembers"
          />
        </template>
      </PageHeader>

      <!-- ═════ Conversation ═════ -->
      <PageContent :padded="false">
        <div :class="workspaceClass">
          <ThreadView
            :thread-id="conversation.id"
            :label="`Messages in ${title}`"
            :mentionables="mentionables"
            :placeholder="placeholder"
            :can-post="isMember(conversation)"
            :active-output="
              panel?.kind === 'output' ? { id: panel.outputId, version: panel.version } : null
            "
            @send="send"
            @open-output="openOutput"
            @pick="pick"
          >
            <!-- Groups only: a direct message already says who it's with in the header -->
            <template v-if="conversation.kind === 'channel'" #intro>
              <div :class="introClass">
                <MpText size="h2">Welcome to {{ label }}</MpText>
                <MpText color="text.secondary">{{ introText }}</MpText>
              </div>
            </template>
            <template #blocked>
              <JoinChannelBar :channel-name="label" @join="join" />
            </template>
          </ThreadView>

          <SidePanelTransition>
            <OutputCanvas
              v-if="panel?.kind === 'output'"
              :key="`output-${panel.outputId}`"
              :output-id="panel.outputId"
              :version="panel.version"
              @close="panel = null"
              @update:version="
                panel = { kind: 'output', outputId: panel.outputId, version: $event }
              "
            />
            <ConversationMembersPanel
              v-else-if="panel?.kind === 'members'"
              key="members"
              :conversation="conversation"
              @close="panel = null"
              @add="isAddOpen = true"
            />
          </SidePanelTransition>
        </div>
      </PageContent>

      <AddMembersModal
        :is-open="isAddOpen"
        :conversation="conversation"
        :workspace="workspace"
        @close="isAddOpen = false"
      />
    </template>

    <template v-else>
      <PageHeader title="Conversation not found" />
      <PageContent>
        <MpText color="text.secondary">
          This group doesn't exist anymore or the link is wrong. Pick one from the sidebar.
        </MpText>
      </PageContent>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { css, toast, MpButton, MpText } from "@mekari/pixel3";
import PageContent from "~/components/layout/PageContent.vue";
import PageHeader from "~/components/layout/PageHeader.vue";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import SidePanelTransition from "~/components/layout/SidePanelTransition.vue";
import AddMembersModal from "~/components/thread/AddMembersModal.vue";
import ConversationHeaderActions from "~/components/thread/ConversationHeaderActions.vue";
import ConversationMembersPanel from "~/components/thread/ConversationMembersPanel.vue";
import JoinChannelBar from "~/components/thread/JoinChannelBar.vue";
import OutputCanvas from "~/components/thread/OutputCanvas.vue";
import ThreadView from "~/components/thread/ThreadView.vue";
import { useChatStore } from "~/composables/useChatStore";
import { useCurrentWorkspace } from "~/composables/useCurrentWorkspace";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import { getAgent } from "~/data/agents";
import { CURRENT_USER_ID } from "~/data/people";
import type { Actor, Mention } from "~/data/types";
import { toMentionables } from "~/utils/directory";
import { agentPath } from "~/utils/paths";

type Panel = { kind: "members" } | { kind: "output"; outputId: string; version: number };

const route = useRoute();
const { workspace } = useCurrentWorkspace();
const { getConversation, isMember, joinChannel, conversationTitle, conversationLabel } =
  useWorkspaceStore();
const { sendMessage, pickOption, setActiveThread, leaveThread, getOutput } = useChatStore();

const panel = ref<Panel | null>(null);
const isAddOpen = ref(false);

const conversation = computed(() =>
  workspace.value
    ? getConversation(workspace.value.id, String(route.params.conversationId))
    : undefined
);

/** Set when this is a 1:1 chat with an agent, opened from Direct messages. */
const agent = computed(() =>
  conversation.value?.kind === "agent" ? getAgent(conversation.value.agentIds[0] ?? "") : undefined
);

const title = computed(() => {
  if (agent.value) return agent.value.name;
  return conversation.value ? conversationTitle(conversation.value) : "";
});
/** With the group's emoji, for the header and intro. */
const label = computed(() => {
  if (agent.value) return agent.value.name;
  return conversation.value ? conversationLabel(conversation.value) : "";
});
/** Who a direct message is with: their photo, or the agent's icon. Groups have none. */
const headerActor = computed<Actor | undefined>(() => {
  if (agent.value) return { kind: "agent", id: agent.value.id };
  if (conversation.value?.kind !== "dm") return undefined;
  const otherId = conversation.value.memberIds.find((id) => id !== CURRENT_USER_ID);
  return otherId ? { kind: "person", id: otherId } : undefined;
});

/** Only groups have one: their description. */
const subtitle = computed(() =>
  conversation.value?.kind === "channel" ? conversation.value.description : undefined
);

// Agent chats need no @: every message goes to the agent.
const mentionables = computed(() =>
  conversation.value && !agent.value
    ? toMentionables(
        conversation.value.memberIds.filter((id) => id !== CURRENT_USER_ID),
        conversation.value.agentIds
      )
    : []
);

// Short so it fits a narrow chat; the group intro explains @mentions.
const placeholder = computed(() => `Message ${title.value}`);

/** The group intro: what it's for and how to bring an agent in. */
const introText = computed(() => {
  if (!conversation.value) return "";
  const purpose = conversation.value.description || "This is the start of the group";
  return conversation.value.agentIds.length
    ? `${purpose}. Mention an agent with @ and it will reply here.`
    : `${purpose}. Add an agent from the member list, then mention it with @.`;
});

/** The thread this page marked as being read, so leaving only clears its own. */
let viewingThreadId: string | undefined;

// Opening ?output=<id>&v=<n> (from Activity) shows that output in the canvas.
watch(
  () => [conversation.value?.id, route.query.output, route.query.v] as const,
  ([id, outputId, version]) => {
    viewingThreadId = id;
    setActiveThread(id ?? null);
    const output = typeof outputId === "string" ? getOutput(outputId) : undefined;
    panel.value = output
      ? { kind: "output", outputId: output.id, version: Number(version) || output.versions.length }
      : null;
  },
  { immediate: true }
);

onBeforeUnmount(() => leaveThread(viewingThreadId));

useHead({ title });

function toggleMembers() {
  panel.value = panel.value?.kind === "members" ? null : { kind: "members" };
}

function openOutput(outputId: string, version: number) {
  panel.value = { kind: "output", outputId, version };
}

function send(payload: { text: string; mentions: Mention[] }) {
  if (!workspace.value || !conversation.value) return;
  sendMessage(
    {
      workspaceId: workspace.value.id,
      threadId: conversation.value.id,
      agentIds: conversation.value.agentIds,
      replyAgentId: agent.value?.id
    },
    payload.text,
    payload.mentions
  );
}

function pick(messageId: string, optionId: string) {
  if (!workspace.value || !conversation.value) return;
  pickOption(
    {
      workspaceId: workspace.value.id,
      threadId: conversation.value.id,
      agentIds: conversation.value.agentIds,
      replyAgentId: agent.value?.id
    },
    messageId,
    optionId
  );
}

function join() {
  if (!conversation.value) return;
  joinChannel(conversation.value);
  toast.notify({ title: `Joined ${title.value}`, variant: "success" });
}

const pageClass = css({ display: "flex", flexDirection: "column", flex: "1", minH: "0" });

const workspaceClass = css({ display: "flex", h: "full", overflow: "hidden" });

const introClass = css({ display: "flex", flexDirection: "column", gap: "1", px: "6", pb: "2" });
</script>
