<!--
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mekari Multiplayer — Create agent
  Source: chat description ("add create agent option, that's what it can do")
  Token mode: Pixel 2.4, enterprise product theme
  Patterns used: form-view (modal)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  STATES INCLUDED:
    - Name and "What it does" required; duplicate names rejected
    - Icon picked from the 3D set; instructions optional
    - "Add to <project>" on by default; on create, opens a 1:1 chat with the new agent

  OPEN ITEMS for product/design follow-up:
    - Knowledge sources, tools and permissions for custom agents
    - Custom agents reply with a generic first message until scripted
-->
<template>
  <MpModal id="create-agent-modal" :is-open="isOpen" size="md" @close="handleClose">
    <MpModalContent>
      <MpModalHeader>
        Create an agent
        <MpModalCloseButton />
      </MpModalHeader>
      <MpModalBody>
        <form id="create-agent-form" @submit.prevent="submit">
          <MpFlex direction="column" gap="5">
            <MpFormControl id="agent-name" is-required :is-invalid="Boolean(nameError)">
              <MpFormLabel>Name</MpFormLabel>
              <MpInput
                id="agent-name-input"
                v-model="name"
                placeholder="Store ops helper"
                :maxlength="40"
                @update:model-value="nameError = ''"
              />
              <MpFormErrorMessage>{{ nameError }}</MpFormErrorMessage>
            </MpFormControl>

            <MpFormControl id="agent-icon">
              <MpFormLabel>Icon</MpFormLabel>
              <div role="radiogroup" aria-label="Agent icon" :class="iconRowClass">
                <button
                  v-for="option in AGENT_ICON_CHOICES"
                  :key="option.icon"
                  type="button"
                  role="radio"
                  :aria-checked="icon === option.icon"
                  :aria-label="option.label"
                  :class="iconOptionClass"
                  @click="icon = option.icon"
                >
                  <img :src="option.icon" alt="" :class="iconImageClass" />
                </button>
              </div>
            </MpFormControl>

            <MpFormControl
              id="agent-description"
              is-required
              :is-invalid="Boolean(descriptionError)"
            >
              <MpFormLabel>What it does</MpFormLabel>
              <MpInput
                id="agent-description-input"
                v-model="description"
                placeholder="Answers store managers' questions about launch day"
                :maxlength="100"
                @update:model-value="descriptionError = ''"
              />
              <MpFormErrorMessage>{{ descriptionError }}</MpFormErrorMessage>
            </MpFormControl>

            <MpFormControl id="agent-instructions">
              <MpFormLabel>Instructions</MpFormLabel>
              <MpTextarea
                v-model="instructions"
                placeholder="Keep answers under 50 words. Link the launch checklist when it helps."
              />
              <MpFormHelpText>The agent follows these every time it replies.</MpFormHelpText>
            </MpFormControl>

            <MpCheckbox
              id="agent-add-to-project"
              :is-checked="addToProject"
              @change="addToProject = $event"
            >
              Add to {{ workspace.name }}
            </MpCheckbox>
          </MpFlex>
          <button type="submit" hidden />
        </form>
      </MpModalBody>
      <MpModalFooter>
        <MpButtonGroup>
          <MpButton variant="secondary" @click="handleClose">Cancel</MpButton>
          <MpButton @click="submit">Create agent</MpButton>
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
  MpTextarea
} from "@mekari/pixel3";
import { useAgentStore } from "~/composables/useAgentStore";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import { AGENT_ICON_CHOICES } from "~/data/agents";
import type { Workspace } from "~/data/types";
import { agentPath, workspacePath } from "~/utils/paths";

interface CreateAgentModalProps {
  isOpen: boolean;
  workspace: Workspace;
}

const props = defineProps<CreateAgentModalProps>();
const emit = defineEmits<{ close: [] }>();

const { createAgent, isNameTaken } = useAgentStore();
const { addAgentToWorkspace } = useWorkspaceStore();

const DEFAULT_ICON = AGENT_ICON_CHOICES[0]!.icon;

const name = ref("");
const description = ref("");
const instructions = ref("");
const icon = ref(DEFAULT_ICON);
const addToProject = ref(true);
const nameError = ref("");
const descriptionError = ref("");

function handleClose() {
  name.value = "";
  description.value = "";
  instructions.value = "";
  icon.value = DEFAULT_ICON;
  addToProject.value = true;
  nameError.value = "";
  descriptionError.value = "";
  emit("close");
}

function submit() {
  if (!name.value.trim()) nameError.value = "Give the agent a name.";
  else if (isNameTaken(name.value)) nameError.value = "An agent with this name already exists.";
  if (!description.value.trim()) descriptionError.value = "Say what the agent does.";
  if (nameError.value || descriptionError.value) return;

  const agent = createAgent({
    name: name.value,
    description: description.value,
    instructions: instructions.value,
    icon: icon.value
  });
  const workspaceId = props.workspace.id;
  const shouldAdd = addToProject.value;
  if (shouldAdd) addAgentToWorkspace(workspaceId, agent.id);
  toast.notify({ title: `Created ${agent.name}`, variant: "success" });
  handleClose();
  // Straight into a 1:1 chat so the new agent can be tried right away.
  navigateTo(shouldAdd ? agentPath(workspaceId, agent.id) : `${workspacePath(workspaceId)}/agents`);
}

const iconRowClass = css({ display: "flex", flexWrap: "wrap", gap: "2" });

// Works like a radio: the chosen icon gets the brand ring.
const iconOptionClass = css({
  display: "inline-flex",
  p: "1",
  rounded: "lg",
  borderWidth: "2px",
  borderColor: "transparent",
  cursor: "pointer",
  _hover: { bg: "background.neutral.hovered" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused" },
  "&[aria-checked=true]": { borderColor: "border.selected" }
});

const iconImageClass = css({ w: "9", h: "9", objectFit: "contain" });
</script>
