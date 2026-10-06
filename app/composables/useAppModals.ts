import { readonly, ref } from "vue";

export type AppModal =
  "create-channel" | "new-message" | "invite" | "create-project" | "create-agent";

// Project-level modals are opened from several places (rail, submenu, pages) but
// rendered once in the layout.
const openModal = ref<AppModal | null>(null);

export function useAppModals() {
  function open(modal: AppModal) {
    openModal.value = modal;
  }

  function close() {
    openModal.value = null;
  }

  return { openModal: readonly(openModal), open, close };
}
