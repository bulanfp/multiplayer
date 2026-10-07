<template>
  <MpModal
    id="add-members-modal"
    :is-open="isOpen"
    size="md"
    scroll-behavior="auto"
    @close="handleClose"
  >
    <MpModalContent>
      <MpModalHeader>
        {{ title }}
        <MpModalCloseButton is-rounded aria-label="Close" />
      </MpModalHeader>
      <MpModalBody>
        <SearchInput
          id="add-members-search"
          v-model="query"
          placeholder="Search people or agents"
        />

        <section v-for="section in sections" :key="section.kind" :class="css({ mt: '4' })">
          <SectionLabel :id="`add-members-${section.kind}`" :class="labelClass">
            {{ section.label }}
          </SectionLabel>
          <ul :class="listClass" :aria-labelledby="`add-members-${section.kind}`">
            <li
              v-for="option in section.options"
              :key="option.actor.id"
              :class="rowClass"
              :data-member="option.isMember || undefined"
            >
              <!-- Already in: ticked and locked. A checkbox in a v-model group ignores
                   is-checked, so these stand on their own. -->
              <MpCheckbox
                v-if="option.isMember"
                :id="`add-${option.actor.kind}-${option.actor.id}`"
                is-checked
                is-disabled
              >
                <MpFlex alignItems="center" gap="3">
                  <MemberAvatar :actor="option.actor" />
                  <MpFlex direction="column" flex="1" minWidth="0">
                    <MpText weight="semiBold" is-truncated>{{ option.name }}</MpText>
                    <MpText size="label-small" color="text.secondary" is-truncated>
                      {{ option.detail }}
                    </MpText>
                  </MpFlex>
                  <MpBadge
                    for="tableStatus"
                    type="announcement"
                    size="sm"
                    :class="css({ flexShrink: '0' })"
                  >
                    In group
                  </MpBadge>
                </MpFlex>
              </MpCheckbox>
              <MpCheckbox
                v-else
                :id="`add-${option.actor.kind}-${option.actor.id}`"
                v-model="selected[section.kind]"
                :value="option.actor.id"
              >
                <MpFlex alignItems="center" gap="3">
                  <MemberAvatar :actor="option.actor" />
                  <MpFlex direction="column" flex="1" minWidth="0">
                    <MpText weight="semiBold" is-truncated>{{ option.name }}</MpText>
                    <MpText size="label-small" color="text.secondary" is-truncated>
                      {{ option.detail }}
                    </MpText>
                  </MpFlex>
                </MpFlex>
              </MpCheckbox>
            </li>
          </ul>
        </section>

        <MpText v-if="!sections.length" color="text.secondary" :class="css({ mt: '4' })">
          No one in {{ workspace.name }} matches “{{ query.trim() }}”.
        </MpText>
      </MpModalBody>
      <MpModalFooter>
        <MpButtonGroup>
          <MpButton is-rounded variant="ghost" @click="handleClose">Cancel</MpButton>
          <MpButton is-rounded :is-disabled="!selectionCount" @click="submit">
            {{ selectionCount ? `Add (${selectionCount})` : "Add" }}
          </MpButton>
        </MpButtonGroup>
      </MpModalFooter>
    </MpModalContent>
    <MpModalOverlay />
  </MpModal>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import {
  css,
  toast,
  MpBadge,
  MpButton,
  MpButtonGroup,
  MpCheckbox,
  MpFlex,
  MpModal,
  MpModalBody,
  MpModalCloseButton,
  MpModalContent,
  MpModalFooter,
  MpModalHeader,
  MpModalOverlay,
  MpText
} from "@mekari/pixel3";
import SearchInput from "~/components/chat/SearchInput.vue";
import SectionLabel from "~/components/layout/SectionLabel.vue";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import { getAgent } from "~/data/agents";
import { CURRENT_USER_ID, getPerson } from "~/data/people";
import type { Actor, ActorKind, Agent, Conversation, Person, Workspace } from "~/data/types";

interface AddMembersModalProps {
  isOpen: boolean;
  conversation: Conversation;
  workspace: Workspace;
}

/** One row in the list: someone at the company, or an agent, who could join this group. */
interface MemberOption {
  actor: Actor;
  /** The current user reads "Rizal Candra (you)" */
  name: string;
  /** Job title for people, role for agents */
  detail: string;
  /** Already in: shown checked and locked, with a status badge */
  isMember: boolean;
}

const props = defineProps<AddMembersModalProps>();
const emit = defineEmits<{ close: [] }>();

const { addMembers, conversationTitle } = useWorkspaceStore();

const query = ref("");
const selected = reactive<Record<ActorKind, string[]>>({ person: [], agent: [] });

const title = computed(() => `Add to ${conversationTitle(props.conversation)}`);
const selectionCount = computed(() => selected.person.length + selected.agent.length);

function matches(name: string): boolean {
  const needle = query.value.trim().toLowerCase();
  return !needle || name.toLowerCase().includes(needle);
}

const peopleOptions = computed(() =>
  props.workspace.members
    .map((member) => getPerson(member.personId))
    .filter((person): person is Person => person !== undefined && matches(person.name))
    .map((person): MemberOption => ({
      actor: { kind: "person", id: person.id },
      name: person.id === CURRENT_USER_ID ? `${person.name} (you)` : person.name,
      detail: person.title,
      isMember: props.conversation.memberIds.includes(person.id)
    }))
);

const agentOptions = computed(() =>
  props.workspace.agentIds
    .map((id) => getAgent(id))
    .filter((agent): agent is Agent => agent !== undefined && matches(agent.name))
    .map((agent): MemberOption => ({
      actor: { kind: "agent", id: agent.id },
      name: agent.name,
      detail: agent.role,
      isMember: props.conversation.agentIds.includes(agent.id)
    }))
);

// A section drops out when the search leaves it empty.
const sections = computed(() =>
  [
    { kind: "person" as const, label: "People", options: peopleOptions.value },
    { kind: "agent" as const, label: "Agents", options: agentOptions.value }
  ].filter((section) => section.options.length)
);

function handleClose() {
  query.value = "";
  selected.person = [];
  selected.agent = [];
  emit("close");
}

function submit() {
  const count = selectionCount.value;
  addMembers(props.conversation, selected.person, selected.agent);
  toast.notify({
    title: `Added ${count} to ${conversationTitle(props.conversation)}`,
    variant: "success"
  });
  handleClose();
}

// SectionLabel is inset like the rows, so it already lines up with the checkboxes.
const labelClass = css({ mb: "1" });

const listClass = css({ display: "flex", flexDirection: "column", gap: "0.5" });

// The whole row is the checkbox label. MpCheckbox hands its class to the hidden input,
// so the label is stretched from here.
const rowClass = css({
  rounded: "md",
  "&:not([data-member])": { _hover: { bg: "background.neutral.hovered" } },
  "& > label": { w: "full", px: "2", py: "2" },
  "& .mp-checkbox__label": { flex: "1", minW: "0" }
});
</script>
