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
    - One side panel at a time: the output canvas (versions, copy, close), a file preview,
      Members (the faces in the header), or Files or Connectors (the header's ⋮ menu). An
      output or file opened from Files goes back to it when closed
    - Group name: hovering it shows a chevron; clicking it renames the group (members only)
    - Not a member yet: Join bar instead of the composer
    - Unnamed group (started from New chat): its members' faces and names as the title, and
      "Name this group" in the intro
    - Unknown group: in-shell not-found message
-->
<template>
  <div :class="pageClass">
    <!-- ═════ A group ═════ -->
    <template v-if="workspace && group">
      <!-- Title only: the description shows in the intro at the top of the thread -->
      <PageHeader :title="label">
        <template v-if="group.isUnnamed" #leading>
          <GroupFaces :person-ids="group.memberIds" :agent-ids="group.agentIds" size="lg" />
        </template>
        <template #title>
          <MpText as="h1" size="h1" :class="titleClass">
            <button
              v-if="isMember(group)"
              type="button"
              class="group"
              :class="titleButtonClass"
              :aria-label="`${label}. ${group.isUnnamed ? 'Name this group' : 'Rename group'}`"
              @click="isRenameOpen = true"
            >
              <span :class="titleTextClass">{{ label }}</span>
              <MpIcon name="chevrons-down" size="sm" color="icon.default" :class="chevronClass" />
            </button>
            <template v-else>{{ label }}</template>
          </MpText>
        </template>
        <template #actions>
          <ConversationHeaderActions
            :conversation="group"
            :open-view="openView"
            @toggle="togglePanel"
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
              <div v-if="group.isUnnamed" :class="introClass">
                <MpText size="h2">{{ title }}</MpText>
                <MpText color="text.secondary">
                  A group with {{ memberList }}. Mention an agent with @ and it will reply here.
                </MpText>
                <MpButton
                  v-if="isMember(group)"
                  is-rounded
                  variant="textLink"
                  :class="nameLinkClass"
                  @click="isRenameOpen = true"
                >
                  Name this group
                </MpButton>
              </div>
              <div v-else :class="introClass">
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
              @close="closePreview"
              @update:version="setOutputVersion"
            />
            <FilePreview
              v-else-if="panel?.kind === 'file'"
              :key="`file-${panel.fileId}`"
              :file-id="panel.fileId"
              @close="closePreview"
            />
            <ConversationSidePanel
              v-else-if="panel?.kind === 'view'"
              :key="panel.view"
              :conversation="group"
              :view="panel.view"
              @close="panel = null"
              @add="isAddOpen = true"
              @open-output="(outputId, version) => openOutput(outputId, version, true)"
              @open-file="openFile"
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
      <RenameGroupModal
        :is-open="isRenameOpen"
        :conversation="group"
        @close="isRenameOpen = false"
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
import { css, toast, MpButton, MpIcon, MpText } from "@mekari/pixel3";
import PageContent from "~/components/layout/PageContent.vue";
import PageHeader from "~/components/layout/PageHeader.vue";
import SidePanelTransition from "~/components/layout/SidePanelTransition.vue";
import FilePreview from "~/components/pages/FilePreview.vue";
import GroupFaces from "~/components/shared/GroupFaces.vue";
import AddMembersModal from "~/components/thread/AddMembersModal.vue";
import ConversationHeaderActions from "~/components/thread/ConversationHeaderActions.vue";
import ConversationSidePanel from "~/components/thread/ConversationSidePanel.vue";
import JoinChannelBar from "~/components/thread/JoinChannelBar.vue";
import OutputCanvas from "~/components/thread/OutputCanvas.vue";
import RenameGroupModal from "~/components/thread/RenameGroupModal.vue";
import ThreadView from "~/components/thread/ThreadView.vue";
import { useChatStore } from "~/composables/useChatStore";
import type { ConversationPanelView } from "~/composables/useConversationDetails";
import { useCurrentWorkspace } from "~/composables/useCurrentWorkspace";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import { AIRENE_ID, getAgent } from "~/data/agents";
import { CURRENT_USER_ID, getPerson } from "~/data/people";
import type { MessageDraft } from "~/data/types";
import { toMentionables } from "~/utils/directory";
import { formatList } from "~/utils/format";

/** `fromFiles`: opened from the Files panel, which comes back when it's closed. */
type Panel =
  | { kind: "view"; view: ConversationPanelView }
  | { kind: "output"; outputId: string; version: number; fromFiles?: boolean }
  | { kind: "file"; fileId: string; fromFiles?: boolean };

const route = useRoute();
const { workspace } = useCurrentWorkspace();
const { getConversation, isMember, joinChannel, conversationTitle, conversationLabel } =
  useWorkspaceStore();
const { sendMessage, pickOption, setActiveThread, leaveThread, getOutput } = useChatStore();

const panel = ref<Panel | null>(null);
const isAddOpen = ref(false);
const isRenameOpen = ref(false);

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

/** Everyone in an unnamed group but you, full names, Airene last: "Maya Putri and Airene". */
const memberList = computed(() => {
  if (!group.value) return "";
  const agentIds = [...group.value.agentIds].sort(
    (a, b) => Number(a === AIRENE_ID) - Number(b === AIRENE_ID)
  );
  return formatList([
    ...group.value.memberIds
      .filter((id) => id !== CURRENT_USER_ID)
      .map((id) => getPerson(id)?.name ?? id),
    ...agentIds.map((id) => getAgent(id)?.name ?? id)
  ]);
});

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

/** Members, Files or Connectors, when one of them is the open panel. */
const openView = computed(() => (panel.value?.kind === "view" ? panel.value.view : null));

function togglePanel(view: ConversationPanelView) {
  panel.value = openView.value === view ? null : { kind: "view", view };
}

function openOutput(outputId: string, version: number, fromFiles = false) {
  panel.value = { kind: "output", outputId, version, fromFiles };
}

function openFile(fileId: string) {
  panel.value = { kind: "file", fileId, fromFiles: true };
}

function closePreview() {
  const fromFiles = panel.value?.kind !== "view" && panel.value?.fromFiles;
  panel.value = fromFiles ? { kind: "view", view: "files" } : null;
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

// Nudged 8px left so the name lines up with the page while its button has room for the wash.
// An offset rather than a negative margin, which would make the header measure it too narrow.
const titleClass = css({ position: "relative", left: "-8px", minW: "0", maxW: "full" });

// The name is a button for members: hovering shows a soft wash and a chevron, like a menu.
const titleButtonClass = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "1.5",
  maxW: "full",
  px: "2",
  rounded: "md",
  font: "inherit",
  color: "inherit",
  cursor: "pointer",
  transition: "background-color .15s ease",
  _hover: { bg: "background.neutral.subtle.hovered" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused" }
});

const titleTextClass = css({ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });

const chevronClass = css({
  flexShrink: "0",
  opacity: "0",
  transition: "opacity .15s ease",
  _groupHover: { opacity: "1" },
  ".group:focus-visible &": { opacity: "1" },
  _motionReduce: { transition: "none" }
});

// A text link under the intro, so it sits at the start of the line like the text above.
const nameLinkClass = css({ alignSelf: "flex-start" });
</script>
