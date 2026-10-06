import { reactive } from "vue";

const STORAGE_KEY = "multiplayer.collapsed-sections";

function readStored(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

// Which sidebar sections are collapsed, remembered in this browser between visits.
const collapsed = reactive(new Set<string>(readStored()));

export function useSidebarSections() {
  function isOpen(id: string): boolean {
    return !collapsed.has(id);
  }

  function toggle(id: string): void {
    if (collapsed.has(id)) collapsed.delete(id);
    else collapsed.add(id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...collapsed]));
    } catch {
      // Storage can be blocked (private mode); the section still toggles for this visit.
    }
  }

  return { isOpen, toggle };
}
