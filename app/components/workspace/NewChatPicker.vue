<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Multiplayer — New chat
  Source: confirmed plan; Google Chat's New chat menu as the reference
  Token mode: Pixel 2.4, enterprise product theme
  Patterns used: filter (search over a picker list)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Who you pick decides what you start: one agent on its own is a private chat with it;
  anything more (people, or several agents) is a group. Airene joins every group, so a group
  is never only people: picking anyone locks her in. The same people and agents again open
  their unnamed group instead of a copy, and Start reads "Open group".
-->
<template>
  <div :class="rootClass">
    <!-- ═════ Who you picked, as tags; typing filters the lists ═════ -->
    <div :class="fieldClass" @keydown.enter="handleEnter">
      <MpInputTag
        :id="INPUT_TAG_ID"
        placeholder="Add agents or people"
        :data="tags"
        :max-row="3"
        :is-show-suggestions="false"
        :is-enable-create-new-tag="false"
        @change="handleTagsChange"
        @input="query = $event"
        @blur="query = ''"
      />
    </div>

    <div :class="scrollClass">
      <!-- ═════ Other ways to start, until you type ═════ -->
      <MpPopoverList v-if="!needle" :class="actionsClass">
        <MpPopoverListItem @click="createGroup">
          <MpFlex alignItems="center" gap="3">
            <MpIcon name="people" size="sm" />
            <MpText>Create group</MpText>
          </MpFlex>
        </MpPopoverListItem>
        <MpPopoverListItem @click="browseAgents">
          <MpFlex alignItems="center" gap="3">
            <MpIcon name="airene-outline" size="sm" />
            <MpText>Browse agents</MpText>
          </MpFlex>
        </MpPopoverListItem>
      </MpPopoverList>

      <!-- ═════ Your agents (as in the sidebar), people, then the other agents ═════ -->
      <section
        v-for="section in sections"
        :key="section.id"
        :aria-labelledby="`new-chat-${section.id}-label`"
      >
        <MpText
          :id="`new-chat-${section.id}-label`"
          size="label-small"
          weight="semiBold"
          color="text.secondary"
          :class="sectionLabelClass"
        >
          {{ section.label }}
        </MpText>
        <ul :class="listClass">
          <li
            v-for="row in section.rows"
            :key="row.key"
            :class="rowClass"
            @mousedown.prevent
            @click="handleRowClick(row, $event)"
          >
            <!-- Airene is locked in once it's a group. Pixel draws a disabled box's tick from
                 is-checked, so every row is controlled through it. -->
            <MpCheckbox
              :id="`new-chat-pick-${row.actor.kind}-${row.actor.id}`"
              :is-checked="isChecked(row)"
              :is-disabled="isLocked(row)"
              @change="setPicked(row, $event)"
            >
              <MpFlex alignItems="center" gap="3">
                <MemberAvatar :actor="row.actor" />
                <MpFlex direction="column" flex="1" minWidth="0">
                  <MpText weight="semiBold" is-truncated>{{ row.name }}</MpText>
                  <MpText size="label-small" color="text.secondary" is-truncated>
                    {{ row.detail }}
                  </MpText>
                </MpFlex>
              </MpFlex>
            </MpCheckbox>
          </li>
        </ul>
      </section>

      <MpText v-if="!sections.length" color="text.secondary" :class="emptyClass">
        No agent or person matches “{{ query.trim() }}”.
      </MpText>
    </div>

    <!-- ═════ Start ═════ -->
    <div :class="footerClass">
      <MpButton is-rounded :is-disabled="!picks.length" @click="start">{{ startLabel }}</MpButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import {
  css,
  MpButton,
  MpCheckbox,
  MpFlex,
  MpIcon,
  MpInputTag,
  MpPopoverList,
  MpPopoverListItem,
  MpText,
  type DataInterface
} from "@mekari/pixel3";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import type { GroupPicks } from "~/composables/useAppModals";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import { AIRENE_ID, getAgent } from "~/data/agents";
import { CURRENT_USER_ID, getPerson } from "~/data/people";
import type { Actor, Workspace } from "~/data/types";
import { conversationPath, newAgentChatRoute, newGroupRoute, sectionPath } from "~/utils/paths";

interface NewChatPickerProps {
  workspace: Workspace;
}

interface PickerRow {
  /** "agent:copywriter" or "person:maya" */
  key: string;
  actor: Actor;
  name: string;
  /** An agent's role or a person's job title */
  detail: string;
}

const props = defineProps<NewChatPickerProps>();
const emit = defineEmits<{ done: []; createGroup: [picks: GroupPicks] }>();

const { findUnnamedGroup, chatAgentsIn } = useWorkspaceStore();

const INPUT_TAG_ID = "new-chat-picks";
/** MpInputTag gives its text field this id. */
const INPUT_ID = `input-${INPUT_TAG_ID}`;
const AIRENE_KEY = `agent:${AIRENE_ID}`;

/** Picked rows' keys, in the order you picked them. */
const picks = ref<string[]>([]);
const query = ref("");
const needle = computed(() => query.value.trim().toLowerCase());

const agentRows = computed<PickerRow[]>(() =>
  props.workspace.agentIds.flatMap((id) => {
    const agent = getAgent(id);
    return agent
      ? [
          {
            key: `agent:${id}`,
            actor: { kind: "agent" as const, id },
            name: agent.name,
            detail: agent.role
          }
        ]
      : [];
  })
);

/** Everyone at the company but you. */
const personRows = computed<PickerRow[]>(() =>
  props.workspace.members.flatMap(({ personId: id }) => {
    const person = getPerson(id);
    return person && id !== CURRENT_USER_ID
      ? [
          {
            key: `person:${id}`,
            actor: { kind: "person" as const, id },
            name: person.name,
            detail: person.title
          }
        ]
      : [];
  })
);

const rowsByKey = computed(
  () => new Map([...agentRows.value, ...personRows.value].map((row) => [row.key, row]))
);

function matches(row: PickerRow): boolean {
  return (
    !needle.value ||
    row.name.toLowerCase().includes(needle.value) ||
    row.detail.toLowerCase().includes(needle.value)
  );
}

/** Airene and the agents you chat with, as in the sidebar; the rest come after the people. */
const yourAgentIds = computed(
  () => new Set([AIRENE_ID, ...chatAgentsIn(props.workspace.id).map((agent) => agent.id)])
);

// People sit between your agents and the rest, so both show without scrolling.
const sections = computed(() =>
  [
    {
      id: "agents",
      label: "Agents",
      rows: agentRows.value.filter((row) => yourAgentIds.value.has(row.actor.id))
    },
    { id: "people", label: "People", rows: personRows.value },
    {
      id: "more-agents",
      label: "More agents",
      rows: agentRows.value.filter((row) => !yourAgentIds.value.has(row.actor.id))
    }
  ]
    .map((section) => ({ ...section, rows: section.rows.filter(matches) }))
    .filter((section) => section.rows.length)
);

const agentIds = computed(() =>
  picks.value.filter((key) => key.startsWith("agent:")).map((key) => key.slice("agent:".length))
);
const personIds = computed(() =>
  picks.value.filter((key) => key.startsWith("person:")).map((key) => key.slice("person:".length))
);

/** One agent on its own is a private chat; people, or more than one agent, make a group. */
const isGroup = computed(() => personIds.value.length > 0 || agentIds.value.length > 1);

/** Your unnamed group with exactly these members, which Start opens instead of a copy. */
const existingGroup = computed(() =>
  isGroup.value ? findUnnamedGroup(props.workspace.id, personIds.value, agentIds.value) : undefined
);

function isLocked(row: PickerRow): boolean {
  return row.key === AIRENE_KEY && isGroup.value;
}

function isChecked(row: PickerRow): boolean {
  return picks.value.includes(row.key) || isLocked(row);
}

/** Airene leads a group's tags, locked; the rest follow in the order you picked them. */
const tags = computed<DataInterface[]>(() => {
  const keys = isGroup.value
    ? [AIRENE_KEY, ...picks.value.filter((key) => key !== AIRENE_KEY)]
    : picks.value;
  return keys.map((key) => ({
    id: `new-chat-tag-${key.replace(":", "-")}`,
    text: rowsByKey.value.get(key)?.name ?? key,
    value: key,
    isInvalid: false,
    isReadOnly: key === AIRENE_KEY && isGroup.value
  }));
});

const startLabel = computed(() => (existingGroup.value ? "Open group" : "Start chat"));

function setPicked(row: PickerRow, isPicked: boolean) {
  if (isLocked(row)) return;
  const others = picks.value.filter((key) => key !== row.key);
  picks.value = isPicked ? [...others, row.key] : others;
  if (isPicked) clearQuery();
}

/**
 * A pointer pick toggles the row here and cancels the label's own click, so focus stays in
 * the field and you can keep typing. Space on a focused box still toggles it natively.
 */
function handleRowClick(row: PickerRow, event: MouseEvent) {
  if (event.detail === 0) return;
  event.preventDefault();
  if (!isLocked(row)) setPicked(row, !isChecked(row));
}

/** Removing a tag (its ×, Backspace or clear all) unpicks it; Airene's locked tag stays. */
function handleTagsChange(data: DataInterface[]) {
  const kept = new Set(data.map((tag) => String(tag.value)));
  picks.value = picks.value.filter((key) => kept.has(key));
}

/** Empties the field after a pick, through its own input event so the tags field agrees. */
function clearQuery() {
  if (!query.value) return;
  const input = document.getElementById(INPUT_ID);
  if (input instanceof HTMLInputElement) {
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }
  query.value = "";
}

/** Enter picks the first match while you type, and starts the chat once you've picked. */
function handleEnter(event: KeyboardEvent) {
  if (event.isComposing) return;
  if (needle.value) {
    const first = sections.value.flatMap((section) => section.rows).find((row) => !isChecked(row));
    if (first) setPicked(first, true);
    return;
  }
  if (picks.value.length) start();
}

function start() {
  const workspaceId = props.workspace.id;
  if (!picks.value.length) return;
  if (!isGroup.value) navigateTo(newAgentChatRoute(workspaceId, agentIds.value[0] ?? AIRENE_ID));
  else if (existingGroup.value) navigateTo(conversationPath(workspaceId, existingGroup.value.slug));
  else navigateTo(newGroupRoute(workspaceId, personIds.value, agentIds.value));
  emit("done");
}

function createGroup() {
  emit("createGroup", { personIds: personIds.value, agentIds: agentIds.value });
}

function browseAgents() {
  navigateTo(sectionPath(props.workspace.id, "agents"));
  emit("done");
}

// Ready to type as soon as it opens.
onMounted(() => nextTick(() => document.getElementById(INPUT_ID)?.focus()));

// A fixed height, so the footer never moves under the pointer when the lists or tags change.
const rootClass = css({
  display: "flex",
  flexDirection: "column",
  w: "360px",
  h: "min(560px, calc(100vh - 120px))"
});

const fieldClass = css({ flexShrink: "0", px: "3", pt: "3", pb: "2" });

const scrollClass = css({ flex: "1", minH: "0", overflowY: "auto", px: "1.5", pb: "2" });

// Pixel's list pads 12px above and 8px below; 4px keeps it in step with the rows.
const actionsClass = css({
  py: "1",
  mb: "1",
  borderBottomWidth: "1px",
  borderColor: "border.default",
  "& > button": { rounded: "md" }
});

const sectionLabelClass = css({ px: "2", pt: "3", pb: "1" });

const listClass = css({ display: "flex", flexDirection: "column", gap: "0.5" });

// The whole row is the checkbox label. MpCheckbox hands its class to the hidden input, so
// the label is stretched from here (as in Create a group).
const rowClass = css({
  rounded: "md",
  _hover: { bg: "background.neutral.hovered" },
  "& > label": { w: "full", px: "2", py: "1.5" },
  "& .mp-checkbox__label": { flex: "1", minW: "0" }
});

const emptyClass = css({ px: "2", py: "4" });

const footerClass = css({
  display: "flex",
  justifyContent: "flex-end",
  flexShrink: "0",
  px: "3",
  py: "3",
  borderTopWidth: "1px",
  borderColor: "border.default"
});
</script>
