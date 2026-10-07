import { computed, readonly, ref } from "vue";

export type AppModal = "create-channel";

/** People and agents picked in New chat, ticked when Create a group opens from there. */
export interface GroupPicks {
  personIds: string[];
  agentIds: string[];
}

// Modals opened from several places (the Chats menu, pages) but rendered once in the layout.
const openModal = ref<AppModal | null>(null);
const groupPicks = ref<GroupPicks | null>(null);

export function useAppModals() {
  function open(modal: AppModal, picks?: GroupPicks) {
    groupPicks.value = picks ?? null;
    openModal.value = modal;
  }

  function close() {
    openModal.value = null;
    groupPicks.value = null;
  }

  return {
    openModal: readonly(openModal),
    groupPicks: computed(() => groupPicks.value),
    open,
    close
  };
}
