<template>
  <template v-if="workspace">
    <CreateChannelModal
      :is-open="openModal === 'create-channel'"
      :workspace="workspace"
      @close="close"
    />
    <NewMessageModal :is-open="openModal === 'new-message'" :workspace="workspace" @close="close" />
    <InviteWorkspaceModal :is-open="openModal === 'invite'" :workspace="workspace" @close="close" />
    <CreateAgentModal
      :is-open="openModal === 'create-agent'"
      :workspace="workspace"
      @close="close"
    />
  </template>
  <CreateProjectModal :is-open="openModal === 'create-project'" @close="close" />
</template>

<script setup lang="ts">
import CreateAgentModal from "~/components/workspace/CreateAgentModal.vue";
import CreateChannelModal from "~/components/workspace/CreateChannelModal.vue";
import CreateProjectModal from "~/components/workspace/CreateProjectModal.vue";
import InviteWorkspaceModal from "~/components/workspace/InviteWorkspaceModal.vue";
import NewMessageModal from "~/components/workspace/NewMessageModal.vue";
import { useAppModals } from "~/composables/useAppModals";
import { useCurrentWorkspace } from "~/composables/useCurrentWorkspace";

// Project-level modals, opened from the rail, submenu and pages via useAppModals().
const { openModal, close } = useAppModals();
const { workspace } = useCurrentWorkspace();
</script>
