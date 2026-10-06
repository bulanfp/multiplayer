<template>
  <MpModal id="create-channel-modal" :is-open="isOpen" size="md" @close="handleClose">
    <MpModalContent>
      <MpModalHeader>
        Create a group
        <MpModalCloseButton />
      </MpModalHeader>
      <MpModalBody>
        <form id="create-channel-form" @submit.prevent="submit">
          <MpFlex direction="column" gap="5">
            <MpFormControl id="group-name" is-required :is-invalid="Boolean(nameError)">
              <MpFormLabel>Name</MpFormLabel>
              <MpFlex alignItems="center" gap="3">
                <EmojiPickerTile id="group-emoji-picker" v-model="emoji" :options="GROUP_EMOJI" />
                <div :class="css({ flex: '1', minW: '0' })">
                  <MpInput
                    id="group-name-input"
                    v-model="name"
                    placeholder="Research"
                    :maxlength="GROUP_NAME_MAX_LENGTH"
                    @update:model-value="nameError = ''"
                  />
                </div>
              </MpFlex>
              <MpFormErrorMessage>{{ nameError }}</MpFormErrorMessage>
              <MpFormHelpText
                >Everyone in {{ workspace.name }} can find and join it.</MpFormHelpText
              >
            </MpFormControl>

            <MpFormControl id="group-description">
              <MpFormLabel>Description</MpFormLabel>
              <MpTextarea v-model="description" placeholder="What's this group for?" />
            </MpFormControl>

            <MpFormControl id="group-agents">
              <MpFormLabel>Agents</MpFormLabel>
              <MpFlex direction="column" gap="3" :class="css({ mt: '1' })">
                <MpCheckbox
                  v-for="agentId in workspace.agentIds"
                  :id="`group-agent-${agentId}`"
                  :key="agentId"
                  v-model="agentIds"
                  :value="agentId"
                >
                  <MpFlex alignItems="center" gap="2">
                    <MemberAvatar :actor="{ kind: 'agent', id: agentId }" size="sm" />
                    <MpText>{{ getAgent(agentId)?.name }}</MpText>
                    <MpText color="text.secondary">{{ getAgent(agentId)?.role }}</MpText>
                  </MpFlex>
                </MpCheckbox>
              </MpFlex>
              <MpFormHelpText>Agents reply when someone @mentions them.</MpFormHelpText>
            </MpFormControl>
          </MpFlex>
          <button type="submit" hidden />
        </form>
      </MpModalBody>
      <MpModalFooter>
        <MpButtonGroup>
          <MpButton variant="secondary" @click="handleClose">Cancel</MpButton>
          <MpButton @click="submit">Create group</MpButton>
        </MpButtonGroup>
      </MpModalFooter>
    </MpModalContent>
    <MpModalOverlay />
  </MpModal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  css,
  toast,
  MpButton,
  MpButtonGroup,
  MpCheckbox,
  MpFlex,
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
  MpModalOverlay,
  MpText,
  MpTextarea
} from "@mekari/pixel3";
import EmojiPickerTile from "~/components/shared/EmojiPickerTile.vue";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import { getAgent } from "~/data/agents";
import type { Workspace } from "~/data/types";
import { GROUP_EMOJI, GROUP_NAME_MAX_LENGTH } from "~/utils/group-name";
import { conversationPath } from "~/utils/paths";

interface CreateChannelModalProps {
  isOpen: boolean;
  workspace: Workspace;
}

const props = defineProps<CreateChannelModalProps>();
const emit = defineEmits<{ close: [] }>();

const { channelsIn, createChannel } = useWorkspaceStore();

const DEFAULT_EMOJI = GROUP_EMOJI[0]!;

const name = ref("");
/** Empty until picked; the group falls back to the default icon. */
const emoji = ref<string>();
const description = ref("");
const agentIds = ref<string[]>([]);
const nameError = ref("");

function reset() {
  name.value = "";
  emoji.value = undefined;
  description.value = "";
  agentIds.value = [];
  nameError.value = "";
}

function handleClose() {
  reset();
  emit("close");
}

function submit() {
  const groupName = name.value.trim().replace(/\s+/g, " ");
  if (!groupName) {
    nameError.value = "Enter a group name.";
    return;
  }
  const taken = channelsIn(props.workspace.id).some(
    (group) => group.name.toLowerCase() === groupName.toLowerCase()
  );
  if (taken) {
    nameError.value = `${groupName} already exists. Try another name.`;
    return;
  }

  const channel = createChannel(props.workspace.id, {
    name: groupName,
    emoji: emoji.value ?? DEFAULT_EMOJI,
    description: description.value.trim(),
    agentIds: agentIds.value
  });
  toast.notify({ title: `Created ${channel.name}`, variant: "success" });
  handleClose();
  navigateTo(conversationPath(props.workspace.id, channel.slug));
}
</script>
