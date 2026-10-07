<template>
  <MpModal
    id="create-channel-modal"
    :is-open="isOpen"
    size="md"
    scroll-behavior="auto"
    @close="handleClose"
  >
    <MpModalContent>
      <MpModalHeader>
        Create a group
        <MpModalCloseButton is-rounded aria-label="Close" />
      </MpModalHeader>
      <MpModalBody>
        <form id="create-channel-form" @submit.prevent="submit">
          <MpFlex direction="column" gap="5">
            <MpFormControl id="group-name" is-required :is-invalid="Boolean(nameError)">
              <MpFormLabel>Name</MpFormLabel>
              <div :class="nameRowClass">
                <EmojiPickerTile id="group-emoji-picker" v-model="emoji" :options="GROUP_EMOJI" />
                <MpInput
                  id="group-name-input"
                  v-model="name"
                  placeholder="Research"
                  :maxlength="GROUP_NAME_MAX_LENGTH"
                  @update:model-value="nameError = ''"
                />
                <!-- In the input's column, so the messages line up under it rather than the tile -->
                <div :class="css({ gridColumnStart: '2' })">
                  <MpFormErrorMessage>{{ nameError }}</MpFormErrorMessage>
                </div>
              </div>
            </MpFormControl>

            <MpFormControl id="group-description">
              <MpFormLabel>Description</MpFormLabel>
              <MpTextarea v-model="description" placeholder="What's this group for?" />
            </MpFormControl>

            <MpFormControl id="group-people">
              <MpFormLabel>People</MpFormLabel>
              <!-- Same rows as AddMembersModal -->
              <ul :class="memberListClass" aria-labelledby="group-people-label">
                <li v-for="person in people" :key="person.id" :class="memberRowClass">
                  <!-- You're in every group you create, so you're ticked and locked -->
                  <MpCheckbox
                    :id="`group-person-${person.id}`"
                    v-model="personIds"
                    :value="person.id"
                    :is-checked="person.id === CURRENT_USER_ID"
                    :is-disabled="person.id === CURRENT_USER_ID"
                  >
                    <MpFlex alignItems="center" gap="3">
                      <MemberAvatar :actor="{ kind: 'person', id: person.id }" />
                      <MpFlex direction="column" flex="1" minWidth="0">
                        <MpText weight="semiBold" is-truncated>
                          {{ person.id === CURRENT_USER_ID ? `${person.name} (you)` : person.name }}
                        </MpText>
                        <MpText size="label-small" color="text.secondary" is-truncated>
                          {{ person.title }}
                        </MpText>
                      </MpFlex>
                    </MpFlex>
                  </MpCheckbox>
                </li>
              </ul>
            </MpFormControl>

            <MpFormControl id="group-agents">
              <MpFormLabel>Agents</MpFormLabel>
              <ul :class="memberListClass" aria-labelledby="group-agents-label">
                <li v-for="agent in agents" :key="agent.id" :class="memberRowClass">
                  <!-- Airene is in every group, so she's ticked and can't be taken out. Pixel
                       draws a disabled box's tick from is-checked, not from v-model. -->
                  <MpCheckbox
                    :id="`group-agent-${agent.id}`"
                    v-model="agentIds"
                    :value="agent.id"
                    :is-checked="agent.id === AIRENE_ID"
                    :is-disabled="agent.id === AIRENE_ID"
                  >
                    <MpFlex alignItems="center" gap="3">
                      <MemberAvatar :actor="{ kind: 'agent', id: agent.id }" />
                      <MpFlex direction="column" flex="1" minWidth="0">
                        <MpText weight="semiBold" is-truncated>{{ agent.name }}</MpText>
                        <MpText size="label-small" color="text.secondary" is-truncated>
                          {{ agent.role }}
                        </MpText>
                      </MpFlex>
                      <MpBadge
                        v-if="agent.id === AIRENE_ID"
                        for="tableStatus"
                        type="announcement"
                        size="sm"
                        :class="css({ flexShrink: '0' })"
                      >
                        Always in
                      </MpBadge>
                    </MpFlex>
                  </MpCheckbox>
                </li>
              </ul>
            </MpFormControl>
          </MpFlex>
          <button type="submit" hidden />
        </form>
      </MpModalBody>
      <MpModalFooter>
        <MpButtonGroup>
          <MpButton is-rounded variant="ghost" @click="handleClose">Cancel</MpButton>
          <MpButton is-rounded @click="submit">Create group</MpButton>
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
  MpBadge,
  MpButton,
  MpButtonGroup,
  MpCheckbox,
  MpFlex,
  MpFormControl,
  MpFormErrorMessage,
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
import { AIRENE_ID, getAgent } from "~/data/agents";
import { CURRENT_USER_ID, getPerson } from "~/data/people";
import type { Agent, Person, Workspace } from "~/data/types";
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
// You and Airene start ticked, and your boxes are locked.
const personIds = ref<string[]>([CURRENT_USER_ID]);
const agentIds = ref<string[]>([AIRENE_ID]);
const nameError = ref("");

/** Everyone at the company, you first. */
const people = computed(() =>
  props.workspace.members
    .map((member) => getPerson(member.personId))
    .filter((person): person is Person => person !== undefined)
    .sort((a, b) => Number(b.id === CURRENT_USER_ID) - Number(a.id === CURRENT_USER_ID))
);

const agents = computed(() =>
  props.workspace.agentIds
    .map((id) => getAgent(id))
    .filter((agent): agent is Agent => agent !== undefined)
);

function reset() {
  name.value = "";
  emoji.value = undefined;
  description.value = "";
  personIds.value = [CURRENT_USER_ID];
  agentIds.value = [AIRENE_ID];
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
    personIds: personIds.value,
    agentIds: agentIds.value
  });
  toast.notify({ title: `Created ${channel.name}`, variant: "success" });
  handleClose();
  navigateTo(conversationPath(props.workspace.id, channel.slug));
}

// Emoji tile and name input side by side; the error text takes a second row.
const nameRowClass = css({
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr)",
  columnGap: "3",
  alignItems: "center"
});

// Rows are inset for their hover wash; the list bleeds out by the same amount so the
// checkboxes line up with the labels and inputs above.
const memberListClass = css({ display: "flex", flexDirection: "column", gap: "0.5", mx: "-2" });

// The whole row is the checkbox label. MpCheckbox hands its class to the hidden input,
// so the label is stretched from here.
const memberRowClass = css({
  rounded: "md",
  _hover: { bg: "background.neutral.hovered" },
  "& > label": { w: "full", px: "2", py: "2" },
  "& .mp-checkbox__label": { flex: "1", minW: "0" }
});
</script>
