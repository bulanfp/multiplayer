import { readonly, ref } from "vue";

export type Presence = "online" | "offline";

// The signed-in user's status, shown as a dot on their avatar in the rail. Module-level
// like the other stores, so it holds across pages; a reload sets it back to online.
const presence = ref<Presence>("online");

export function usePresenceStore() {
  function setPresence(value: Presence): void {
    presence.value = value;
  }

  return { presence: readonly(presence), setPresence };
}
