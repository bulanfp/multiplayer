<template>
  <MpModal id="create-project-modal" :is-open="isOpen" size="md" @close="handleClose">
    <MpModalContent>
      <MpModalHeader>
        Create a project
        <MpModalCloseButton />
      </MpModalHeader>
      <MpModalBody>
        <form id="create-project-form" @submit.prevent="submit">
          <MpFlex direction="column" gap="5">
            <MpFormControl id="project-name" is-required :is-invalid="Boolean(nameError)">
              <MpFormLabel>Project name</MpFormLabel>
              <MpInput
                id="project-name-input"
                v-model="name"
                placeholder="Loyalty program refresh"
                :maxlength="60"
                @update:model-value="nameError = ''"
              />
              <MpFormErrorMessage>{{ nameError }}</MpFormErrorMessage>
            </MpFormControl>
            <MpFormControl id="project-icon">
              <MpFormLabel>Icon</MpFormLabel>
              <div role="radiogroup" aria-label="Project icon" :class="iconRowClass">
                <button
                  v-for="option in ICON_OPTIONS"
                  :key="option.label"
                  type="button"
                  role="radio"
                  :aria-checked="emoji === option.emoji"
                  :aria-label="option.label"
                  :class="iconOptionClass"
                  @click="emoji = option.emoji"
                >
                  <ProjectAvatar
                    :workspace="{ initials: previewInitials, emoji: option.emoji, color: 'violet' }"
                    size="sm"
                  />
                </button>
              </div>
            </MpFormControl>
            <MpFormControl id="project-description">
              <MpFormLabel>Description</MpFormLabel>
              <MpTextarea v-model="description" placeholder="What is this project about?" />
              <MpFormHelpText>
                You'll start with a General group and Airene. Invite people afterwards.
              </MpFormHelpText>
            </MpFormControl>
          </MpFlex>
          <button type="submit" hidden />
        </form>
      </MpModalBody>
      <MpModalFooter>
        <MpButtonGroup>
          <MpButton variant="secondary" @click="handleClose">Cancel</MpButton>
          <MpButton @click="submit">Create project</MpButton>
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
import ProjectAvatar from "~/components/layout/ProjectAvatar.vue";
import { projectInitials, useWorkspaceStore } from "~/composables/useWorkspaceStore";

// Initials by default; an emoji makes the project easier to spot in the rail.
const ICON_OPTIONS: { label: string; emoji?: string }[] = [
  { label: "Initials" },
  { label: "Coffee", emoji: "☕" },
  { label: "Phone", emoji: "📱" },
  { label: "Rocket", emoji: "🚀" },
  { label: "Megaphone", emoji: "📣" },
  { label: "Gift", emoji: "🎁" },
  { label: "Target", emoji: "🎯" }
];

defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{ close: [] }>();

const { createProject, homePath } = useWorkspaceStore();

const name = ref("");
const description = ref("");
const emoji = ref<string>();
const nameError = ref("");

const previewInitials = computed(() => projectInitials(name.value) || "Aa");

function handleClose() {
  name.value = "";
  description.value = "";
  emoji.value = undefined;
  nameError.value = "";
  emit("close");
}

function submit() {
  if (!name.value.trim()) {
    nameError.value = "Enter a project name.";
    return;
  }
  const workspace = createProject({
    name: name.value,
    description: description.value,
    emoji: emoji.value
  });
  toast.notify({ title: `Created ${workspace.name}`, variant: "success" });
  handleClose();
  navigateTo(homePath(workspace.id));
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
</script>
