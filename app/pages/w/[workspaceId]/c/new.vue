<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Multiplayer — A group you're starting
  Source: confirmed plan; Google Chat's group conversations as the reference
  Token mode: Pixel 2.4, enterprise product theme
  Patterns used: layout-shell, empty-state
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  New chat opens this page for anything more than one agent: ?people=maya&agents=copywriter.
  Like a new agent chat, nothing is saved until you send: the first message creates the
  unnamed group (you, the people and agents picked, and Airene) and moves to its page.

  STATES INCLUDED:
    - Draft: the members' faces, who's in it, and a message box with @mentions
    - The same members as one of your unnamed groups: opens that group instead
    - One agent and no people: its new chat; nobody picked: Airene's chats
-->
<template>
  <div :class="pageClass">
    <template v-if="workspace && draft">
      <PageHeader :title="title">
        <template #leading>
          <GroupFaces :person-ids="draft.personIds" :agent-ids="draft.agentIds" size="lg" />
        </template>
      </PageHeader>

      <PageContent :padded="false">
        <ThreadView
          :thread-id="DRAFT_THREAD_ID"
          :label="`Messages in ${title}`"
          :mentionables="mentionables"
          :placeholder="`Message ${title}`"
          @send="send"
        >
          <!-- ═════ Empty state: who's in it, and when it's saved ═════ -->
          <template #empty>
            <div :class="emptyClass">
              <span :class="stackClass">
                <span
                  v-for="actor in faces"
                  :key="`${actor.kind}-${actor.id}`"
                  :class="faceClass"
                  :data-kind="actor.kind"
                >
                  <MemberAvatar :actor="actor" size="lg" />
                </span>
              </span>
              <MpText size="h2">New group with {{ memberList }}</MpText>
              <MpText color="text.secondary">
                It's saved when you send the first message, and only the people in it can see it.
                Mention an agent with @ and it will reply here.
              </MpText>
            </div>
          </template>
        </ThreadView>
      </PageContent>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { css, MpText } from "@mekari/pixel3";
import type { LocationQueryValue } from "vue-router";
import PageContent from "~/components/layout/PageContent.vue";
import PageHeader from "~/components/layout/PageHeader.vue";
import GroupFaces from "~/components/shared/GroupFaces.vue";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import ThreadView from "~/components/thread/ThreadView.vue";
import { useChatStore } from "~/composables/useChatStore";
import { useCurrentWorkspace } from "~/composables/useCurrentWorkspace";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import { AIRENE_ID, getAgent } from "~/data/agents";
import { CURRENT_USER_ID, getPerson } from "~/data/people";
import type { Actor, MessageDraft } from "~/data/types";
import { toMentionables } from "~/utils/directory";
import { formatList } from "~/utils/format";
import { unnamedGroupTitle } from "~/utils/group-name";
import { conversationPath, newAgentChatRoute } from "~/utils/paths";

/** The message box needs a thread id before the group exists. */
const DRAFT_THREAD_ID = "new-group";

const route = useRoute();
const { workspace } = useCurrentWorkspace();
const { findUnnamedGroup, createUnnamedGroup, homePath } = useWorkspaceStore();
const { sendMessage, setActiveThread } = useChatStore();

function listParam(value: LocationQueryValue | LocationQueryValue[] | undefined): string[] {
  const text = Array.isArray(value) ? value.join(",") : (value ?? "");
  return [...new Set(text.split(",").filter(Boolean))];
}

/** Who was picked, keeping only real people (not you) and the company's agents. */
const picked = computed(() => {
  const space = workspace.value;
  if (!space) return { personIds: [], agentIds: [] };
  const people = new Set(space.members.map((member) => member.personId));
  return {
    personIds: listParam(route.query.people).filter(
      (id) => id !== CURRENT_USER_ID && people.has(id)
    ),
    agentIds: listParam(route.query.agents).filter((id) => space.agentIds.includes(id))
  };
});

/** As in New chat: people, or more than one agent, make a group, and Airene is in it. */
const draft = computed(() => {
  const { personIds, agentIds } = picked.value;
  if (!personIds.length && agentIds.length < 2) return undefined;
  return { personIds, agentIds: [AIRENE_ID, ...agentIds.filter((id) => id !== AIRENE_ID)] };
});

const title = computed(() =>
  draft.value ? unnamedGroupTitle(draft.value.personIds, draft.value.agentIds) : ""
);

/** You first, then the people, then the agents, Airene last. */
const faces = computed<Actor[]>(() => {
  if (!draft.value) return [];
  const agentIds = draft.value.agentIds.filter((id) => id !== AIRENE_ID);
  return [
    { kind: "person", id: CURRENT_USER_ID },
    ...draft.value.personIds.map((id) => ({ kind: "person" as const, id })),
    ...[...agentIds, AIRENE_ID].map((id) => ({ kind: "agent" as const, id }))
  ];
});

/** "Maya Putri, Copywriter and Airene" */
const memberList = computed(() =>
  formatList(
    faces.value
      .filter((actor) => actor.id !== CURRENT_USER_ID)
      .map((actor) =>
        actor.kind === "person"
          ? (getPerson(actor.id)?.name ?? actor.id)
          : (getAgent(actor.id)?.name ?? actor.id)
      )
  )
);

const mentionables = computed(() =>
  draft.value ? toMentionables(draft.value.personIds, draft.value.agentIds) : []
);

/** Set once the first message creates the group, so the redirects below stand down. */
let isStarted = false;

// Nothing to start here: the same members' group, one agent's new chat, or home.
watch(
  [workspace, draft, picked],
  () => {
    const space = workspace.value;
    if (!space || isStarted) return;
    if (!draft.value) {
      const [agentId] = picked.value.agentIds;
      navigateTo(agentId ? newAgentChatRoute(space.id, agentId) : homePath(space.id), {
        replace: true
      });
      return;
    }
    const existing = findUnnamedGroup(space.id, draft.value.personIds, draft.value.agentIds);
    if (existing) navigateTo(conversationPath(space.id, existing.slug), { replace: true });
  },
  { immediate: true }
);

useHead({ title: "New group" });

function send(message: MessageDraft) {
  const space = workspace.value;
  if (!space || !draft.value) return;
  isStarted = true;
  const group = createUnnamedGroup(space.id, draft.value);
  setActiveThread(group.id);
  sendMessage({ workspaceId: space.id, threadId: group.id, agentIds: group.agentIds }, message);
  navigateTo(conversationPath(space.id, group.slug), { replace: true });
}

const pageClass = css({ display: "flex", flexDirection: "column", flex: "1", minH: "0" });

const emptyClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2",
  maxW: "480px",
  mx: "auto",
  px: "6",
  textAlign: "center"
});

const stackClass = css({
  display: "inline-flex",
  mb: "2",
  "& > *:not(:first-child)": { ml: "-2" }
});

// Round faces with a white ring, as in the members button; agents sit on Pixel's AI tint.
const faceClass = css({
  display: "inline-flex",
  flexShrink: "0",
  rounded: "full",
  overflow: "hidden",
  boxShadow: "0 0 0 2px token(colors.background.neutral)",
  "&[data-kind=agent]": { bg: "background.airene" },
  "&[data-kind=agent] > img": { p: "4px" }
});
</script>
