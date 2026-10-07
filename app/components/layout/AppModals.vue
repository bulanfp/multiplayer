<template>
  <template v-if="workspace">
    <CreateChannelModal
      :is-open="openModal === 'create-channel'"
      :workspace="workspace"
      @close="close"
    />
    <NewChatModal :is-open="openModal === 'new-chat'" :workspace="workspace" @close="close" />
  </template>
</template>

<script setup lang="ts">
import CreateChannelModal from "~/components/workspace/CreateChannelModal.vue";
import NewChatModal from "~/components/workspace/NewChatModal.vue";
import { useAppModals } from "~/composables/useAppModals";
import { useCurrentWorkspace } from "~/composables/useCurrentWorkspace";

// Workspace-level modals, opened from the Chats menu and pages via useAppModals().
const { openModal, close } = useAppModals();
const { workspace } = useCurrentWorkspace();
</script>
