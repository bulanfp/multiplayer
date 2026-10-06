<template>
  <MpModal id="add-members-modal" :is-open="isOpen" size="md" @close="handleClose">
    <MpModalContent>
      <MpModalHeader>
        {{ title }}
        <MpModalCloseButton />
      </MpModalHeader>
      <MpModalBody>
        <SearchInput
          id="add-members-search"
          v-model="query"
          :placeholder="canAddPeople ? 'Search people or agents' : 'Search agents'"
        />

        <section v-if="canAddPeople" :class="css({ mt: '4' })">
          <MpText size="label-small" weight="semiBold" color="text.secondary" :class="labelClass">
            People
          </MpText>
          <MpFlex direction="column" gap="3">
            <MpCheckbox
              v-for="personId in peopleOptions"
              :id="`add-person-${personId}`"
              :key="personId"
              v-model="selectedPeople"
              :value="personId"
              :is-disabled="conversation.memberIds.includes(personId)"
            >
              <MpFlex alignItems="center" gap="2">
                <MemberAvatar :actor="{ kind: 'person', id: personId }" size="sm" />
                <MpText>{{ getPerson(personId)?.name }}</MpText>
                <MpText color="text.secondary">
                  {{
                    conversation.memberIds.includes(personId)
                      ? "In group"
                      : getPerson(personId)?.title
                  }}
                </MpText>
              </MpFlex>
            </MpCheckbox>
          </MpFlex>
        </section>

        <section :class="css({ mt: '5' })">
          <MpText size="label-small" weight="semiBold" color="text.secondary" :class="labelClass">
            Agents
          </MpText>
          <MpFlex direction="column" gap="3">
            <MpCheckbox
              v-for="agentId in agentOptions"
              :id="`add-agent-${agentId}`"
              :key="agentId"
              v-model="selectedAgents"
              :value="agentId"
              :is-disabled="conversation.agentIds.includes(agentId)"
            >
              <MpFlex alignItems="center" gap="2">
                <MemberAvatar :actor="{ kind: 'agent', id: agentId }" size="sm" />
                <MpText>{{ getAgent(agentId)?.name }}</MpText>
                <MpText color="text.secondary">
                  {{
                    conversation.agentIds.includes(agentId)
                      ? "Already here"
                      : getAgent(agentId)?.role
                  }}
                </MpText>
              </MpFlex>
            </MpCheckbox>
          </MpFlex>
        </section>

        <MpText
          v-if="!peopleOptions.length && !agentOptions.length"
          color="text.secondary"
          :class="css({ mt: '4' })"
        >
          No one in {{ workspace.name }} matches “{{ query.trim() }}”.
        </MpText>
        <MpText size="body-small" color="text.secondary" :class="css({ mt: '5' })">
          Only people and agents in {{ workspace.name }} show up here. Invite new people from the
          project menu.
        </MpText>
      </MpModalBody>
      <MpModalFooter>
        <MpButtonGroup>
          <MpButton variant="secondary" @click="handleClose">Cancel</MpButton>
          <MpButton :is-disabled="!selectionCount" @click="submit">
            {{ selectionCount ? `Add (${selectionCount})` : "Add" }}
          </MpButton>
        </MpButtonGroup>
      </MpModalFooter>
    </MpModalContent>
    <MpModalOverlay />
  </MpModal>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import {
  css,
  toast,
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
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import { getAgent } from "~/data/agents";
import { getPerson } from "~/data/people";
import type { Conversation, Workspace } from "~/data/types";

interface AddMembersModalProps {
  isOpen: boolean;
  conversation: Conversation;
  workspace: Workspace;
}

const props = defineProps<AddMembersModalProps>();
const emit = defineEmits<{ close: [] }>();

const { addMembers, conversationTitle } = useWorkspaceStore();

const query = ref("");
const selectedPeople = ref<string[]>([]);
const selectedAgents = ref<string[]>([]);

// DMs stay between two people; only agents can join them.
const canAddPeople = computed(() => props.conversation.kind === "channel");
const title = computed(() => `Add to ${conversationTitle(props.conversation)}`);
const selectionCount = computed(() => selectedPeople.value.length + selectedAgents.value.length);

function matches(name: string | undefined): boolean {
  const needle = query.value.trim().toLowerCase();
  return !needle || Boolean(name?.toLowerCase().includes(needle));
}

const peopleOptions = computed(() =>
  props.workspace.members
    .map((member) => member.personId)
    .filter((id) => matches(getPerson(id)?.name))
);
const agentOptions = computed(() =>
  props.workspace.agentIds.filter((id) => matches(getAgent(id)?.name))
);

function handleClose() {
  query.value = "";
  selectedPeople.value = [];
  selectedAgents.value = [];
  emit("close");
}

function submit() {
  const count = selectionCount.value;
  addMembers(props.conversation, selectedPeople.value, selectedAgents.value);
  toast.notify({
    title: `Added ${count} to ${conversationTitle(props.conversation)}`,
    variant: "success"
  });
  handleClose();
}

const labelClass = css({
  display: "block",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  mb: "2"
});
</script>
