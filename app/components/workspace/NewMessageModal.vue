<template>
  <MpModal id="new-message-modal" :is-open="isOpen" size="sm" @close="handleClose">
    <MpModalContent>
      <MpModalHeader>
        New message
        <MpModalCloseButton />
      </MpModalHeader>
      <MpModalBody>
        <SearchInput id="new-message-search" v-model="query" placeholder="Search people" />
        <ul :class="css({ display: 'flex', flexDirection: 'column', gap: '0.5', mt: '3' })">
          <li v-for="person in people" :key="person.id">
            <button type="button" :class="rowClass" @click="openConversation(person.id)">
              <MemberAvatar :actor="{ kind: 'person', id: person.id }" />
              <MpFlex direction="column" alignItems="flex-start" minWidth="0">
                <MpText weight="semiBold" is-truncated>{{ person.name }}</MpText>
                <MpText size="label-small" color="text.secondary">{{ person.title }}</MpText>
              </MpFlex>
            </button>
          </li>
        </ul>
        <MpText v-if="!people.length" color="text.secondary" :class="css({ py: '4' })">
          No one in {{ workspace.name }} matches “{{ query.trim() }}”.
        </MpText>
      </MpModalBody>
    </MpModalContent>
    <MpModalOverlay />
  </MpModal>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import {
  css,
  MpFlex,
  MpModal,
  MpModalBody,
  MpModalCloseButton,
  MpModalContent,
  MpModalHeader,
  MpModalOverlay,
  MpText
} from "@mekari/pixel3";
import SearchInput from "~/components/chat/SearchInput.vue";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import { CURRENT_USER_ID, getPerson } from "~/data/people";
import type { Person, Workspace } from "~/data/types";
import { conversationPath } from "~/utils/paths";

interface NewMessageModalProps {
  isOpen: boolean;
  workspace: Workspace;
}

const props = defineProps<NewMessageModalProps>();
const emit = defineEmits<{ close: [] }>();

const { openDm } = useWorkspaceStore();

const query = ref("");

const people = computed(() => {
  const needle = query.value.trim().toLowerCase();
  return props.workspace.members
    .map((member) => getPerson(member.personId))
    .filter((person): person is Person => Boolean(person) && person!.id !== CURRENT_USER_ID)
    .filter((person) => !needle || person.name.toLowerCase().includes(needle));
});

function handleClose() {
  query.value = "";
  emit("close");
}

function openConversation(personId: string) {
  const dm = openDm(props.workspace.id, personId);
  handleClose();
  navigateTo(conversationPath(props.workspace.id, dm.slug));
}

const rowClass = css({
  display: "flex",
  alignItems: "center",
  gap: "3",
  w: "full",
  px: "2",
  py: "2",
  rounded: "md",
  textAlign: "left",
  cursor: "pointer",
  _hover: { bg: "background.neutral.hovered" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused", outlineOffset: "-2px" }
});
</script>
