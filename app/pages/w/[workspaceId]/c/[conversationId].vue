<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Multiplayer — A group
  Source: confirmed plan (no Figma for this screen); Slack and Mekari Airene chat as references
  Token mode: Pixel 2.4, enterprise product theme
  Patterns used: layout-shell
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  STATES INCLUDED:
    - Group: thread with day dividers and grouped messages, your own on the right; system
      messages for membership changes; an intro with the group's description
    - @mention list (agents first), "<agent> is writing…", scripted reply with output card
    - Output canvas (versions, copy, close) and members panel, one at a time
    - Not a member yet: Join bar instead of the composer
    - Unknown group: in-shell not-found message
-->
<template>
  <div :class="pageClass">
    <!-- ═════ A group ═════ -->
    <template v-if="workspace && group">
      <PageHeader :title="label" :subtitle="group.description">
        <template #actions>
          <ConversationHeaderActions
            :conversation="group"
            :is-members-open="panel?.kind === 'members'"
            @toggle-members="toggleMembers"
          />
        </template>
      </PageHeader>

      <PageContent :padded="false">
        <div :class="workspaceClass">
          <ThreadView
            :thread-id="group.id"
            :label="`Messages in ${title}`"
            :mentionables="mentionables"
            :placeholder="`Message ${title}`"
            :can-post="isMember(group)"
            :active-output="
              panel?.kind === 'output' ? { id: panel.outputId, version: panel.version } : null
            "
            @send="send"
            @open-output="openOutput"
            @pick="pick"
          >
            <!-- What the group is for, and how to bring an agent in -->
            <template #intro>
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
              @update:version="setOutputVersion"
            />
            <ConversationMembersPanel
              v-else-if="panel?.kind === 'members'"
              key="members"
              :conversation="group"
              @close="panel = null"
              @add="isAddOpen = true"
            />
          </SidePanelTransition>
        </div>
      </PageContent>

      <AddMembersModal
        :is-open="isAddOpen"
        :conversation="group"
        :workspace="workspace"
        @close="isAddOpen = false"
      />
    </template>

    <template v-else>
      <PageHeader title="Group not found" />
      <PageContent>
        <MpText color="text.secondary">
          This group doesn't exist anymore, or the link is wrong. Pick one from the sidebar.
        </MpText>
      </PageContent>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { css, toast, MpText } from "@mekari/pixel3";
import PageContent from "~/components/layout/PageContent.vue";
import PageHeader from "~/components/layout/PageHeader.vue";
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
import { CURRENT_USER_ID } from "~/data/people";
import type { MessageDraft } from "~/data/types";
import { toMentionables } from "~/utils/directory";

type Panel = { kind: "members" } | { kind: "output"; outputId: string; version: number };

const route = useRoute();
const { workspace } = useCurrentWorkspace();
const { getConversation, isMember, joinChannel, conversationTitle, conversationLabel } =
  useWorkspaceStore();
const { sendMessage, pickOption, setActiveThread, leaveThread, getOutput } = useChatStore();

const panel = ref<Panel | null>(null);
const isAddOpen = ref(false);

const group = computed(() =>
  workspace.value
    ? getConversation(workspace.value.id, String(route.params.conversationId))
    : undefined
);

const title = computed(() => (group.value ? conversationTitle(group.value) : ""));
/** With the group's emoji, for the header and intro. */
const label = computed(() => (group.value ? conversationLabel(group.value) : ""));

const mentionables = computed(() =>
  group.value
    ? toMentionables(
        group.value.memberIds.filter((id) => id !== CURRENT_USER_ID),
        group.value.agentIds
      )
    : []
);

/** The group intro: what it's for and how to bring an agent in. Airene is always here. */
const introText = computed(() => {
  const purpose = group.value?.description || "This is the start of the group";
  return `${purpose}. Mention an agent with @ and it will reply here; Airene is always in.`;
});

/** The group this page marked as being read, so leaving only clears its own. */
let viewingThreadId: string | undefined;

// Opening ?output=<id>&v=<n> (from the Library or Activity) shows that output in the canvas.
watch(
  () => [group.value?.id, route.query.output, route.query.v] as const,
  ([id, outputId, version]) => {
    if (viewingThreadId && viewingThreadId !== id) leaveThread(viewingThreadId);
    viewingThreadId = id;
    if (!id) return;
    setActiveThread(id);
    const output = typeof outputId === "string" ? getOutput(outputId) : undefined;
    panel.value = output
      ? { kind: "output", outputId: output.id, version: Number(version) || output.versions.length }
      : null;
  },
  { immediate: true }
);

onBeforeUnmount(() => leaveThread(viewingThreadId));

useHead({ title: () => title.value || "Group not found" });

function toggleMembers() {
  panel.value = panel.value?.kind === "members" ? null : { kind: "members" };
}

function openOutput(outputId: string, version: number) {
  panel.value = { kind: "output", outputId, version };
}

function setOutputVersion(version: number) {
  if (panel.value?.kind === "output") panel.value = { ...panel.value, version };
}

function send(draft: MessageDraft) {
  if (!workspace.value || !group.value) return;
  sendMessage(
    { workspaceId: workspace.value.id, threadId: group.value.id, agentIds: group.value.agentIds },
    draft
  );
}

function pick(messageId: string, optionId: string) {
  if (!workspace.value || !group.value) return;
  pickOption(
    { workspaceId: workspace.value.id, threadId: group.value.id, agentIds: group.value.agentIds },
    messageId,
    optionId
  );
}

function join() {
  if (!group.value) return;
  joinChannel(group.value);
  toast.notify({ title: `Joined ${title.value}`, variant: "success" });
}

const pageClass = css({ display: "flex", flexDirection: "column", flex: "1", minH: "0" });

const workspaceClass = css({ display: "flex", h: "full", overflow: "hidden" });

const introClass = css({ display: "flex", flexDirection: "column", gap: "1", px: "6", pb: "2" });
</script>
