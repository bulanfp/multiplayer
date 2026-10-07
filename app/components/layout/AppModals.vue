<template>
  <CreateChannelModal
    v-if="workspace"
    :is-open="openModal === 'create-channel'"
    :workspace="workspace"
    :picks="groupPicks"
    @close="close"
  />
</template>

<script setup lang="ts">
import CreateChannelModal from "~/components/workspace/CreateChannelModal.vue";
import { useAppModals } from "~/composables/useAppModals";
import { useCurrentWorkspace } from "~/composables/useCurrentWorkspace";

// Workspace-level modals, opened from the Chats menu and pages via useAppModals().
const { openModal, groupPicks, close } = useAppModals();
const { workspace } = useCurrentWorkspace();
</script>
