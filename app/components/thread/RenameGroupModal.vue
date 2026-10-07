<template>
  <MpModal
    id="rename-group-modal"
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
        <form id="rename-group-form" @submit.prevent="submit">
          <MpFormControl id="rename-group-name" is-required :is-invalid="Boolean(nameError)">
            <MpFormLabel>Name</MpFormLabel>
            <!-- Same row as Create a group: the emoji tile, then the name -->
            <div :class="nameRowClass">
              <EmojiPickerTile
                id="rename-group-emoji-picker"
                v-model="emoji"
                :options="GROUP_EMOJI"
              />
              <MpInput
                v-model="name"
                placeholder="Holiday Blend shoot"
                :maxlength="GROUP_NAME_MAX_LENGTH"
                @update:model-value="nameError = ''"
              />
              <div :class="css({ gridColumnStart: '2' })">
                <MpFormErrorMessage>{{ nameError }}</MpFormErrorMessage>
                <MpFormHelpText v-if="conversation.isUnnamed && !nameError">
                  Until you name it, it's called {{ conversation.name }}.
                </MpFormHelpText>
              </div>
            </div>
          </MpFormControl>
          <button type="submit" hidden />
        </form>
      </MpModalBody>
      <MpModalFooter>
        <MpButtonGroup>
          <MpButton is-rounded variant="ghost" @click="handleClose">Cancel</MpButton>
          <MpButton is-rounded @click="submit">Save</MpButton>
        </MpButtonGroup>
      </MpModalFooter>
    </MpModalContent>
    <MpModalOverlay />
  </MpModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  css,
  toast,
  MpButton,
  MpButtonGroup,
  MpFormControl,
  MpFormErrorMessage,
  MpFormHelpText,
  MpFormLabel,
  MpInput,
  MpModal,
  MpModalBody,
  MpModalCloseButton,
  MpModalContent,
  MpModalFooter,
  MpModalHeader,
  MpModalOverlay
} from "@mekari/pixel3";
import EmojiPickerTile from "~/components/shared/EmojiPickerTile.vue";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import type { Conversation } from "~/data/types";
import { GROUP_EMOJI, GROUP_NAME_MAX_LENGTH } from "~/utils/group-name";

interface RenameGroupModalProps {
  isOpen: boolean;
  /** The group to name or rename */
  conversation: Conversation;
}

const props = defineProps<RenameGroupModalProps>();
const emit = defineEmits<{ close: [] }>();

const { channelsIn, renameGroup } = useWorkspaceStore();

const DEFAULT_EMOJI = GROUP_EMOJI[0]!;

const name = ref("");
/** Empty until picked; an unnamed group gets the default icon when it's named. */
const emoji = ref<string>();
const nameError = ref("");

const title = computed(() => (props.conversation.isUnnamed ? "Name this group" : "Rename group"));

// Opens on the group's name and emoji; an unnamed group starts blank.
watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) return;
    name.value = props.conversation.isUnnamed ? "" : props.conversation.name;
    emoji.value = props.conversation.emoji;
    nameError.value = "";
  },
  { immediate: true }
);

function handleClose() {
  emit("close");
}

function submit() {
  const groupName = name.value.trim().replace(/\s+/g, " ");
  if (!groupName) {
    nameError.value = "Enter a group name.";
    return;
  }
  const taken = channelsIn(props.conversation.workspaceId).some(
    (group) =>
      group.id !== props.conversation.id && group.name.toLowerCase() === groupName.toLowerCase()
  );
  if (taken) {
    nameError.value = `${groupName} already exists. Try another name.`;
    return;
  }

  const wasUnnamed = Boolean(props.conversation.isUnnamed);
  const groupEmoji = emoji.value ?? DEFAULT_EMOJI;
  if (
    !wasUnnamed &&
    groupName === props.conversation.name &&
    groupEmoji === props.conversation.emoji
  ) {
    handleClose();
    return;
  }
  renameGroup(props.conversation, { name: groupName, emoji: groupEmoji });
  toast.notify({
    title: wasUnnamed ? `Named ${groupName}` : `Renamed to ${groupName}`,
    variant: "success"
  });
  handleClose();
}

// Emoji tile and name input side by side; the messages take a second row under the input.
const nameRowClass = css({
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr)",
  columnGap: "3",
  alignItems: "center"
});
</script>
