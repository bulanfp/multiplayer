import { computed } from "vue";
import type { RailSection } from "~/data/navigation";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";

const SECTION_BY_SEGMENT: Record<string, RailSection> = {
  c: "home",
  chat: "home",
  activity: "activity",
  library: "library",
  todos: "todos",
  agents: "agents"
};

/** Sections whose submenu panel sits next to the page. */
const SECTIONS_WITH_SUBMENU: RailSection[] = ["home"];

// Parsed from the path because catch-all pages have no workspaceId param.
export function useCurrentWorkspace() {
  const route = useRoute();
  const { getWorkspace } = useWorkspaceStore();

  const workspaceId = computed(() => route.path.match(/^\/w\/([^/]+)/)?.[1] ?? null);
  const workspace = computed(() =>
    workspaceId.value ? getWorkspace(workspaceId.value) : undefined
  );
  const section = computed<RailSection | null>(() => {
    const segment = route.path.split("/")[3];
    return segment ? (SECTION_BY_SEGMENT[segment] ?? null) : null;
  });
  const hasSubmenu = computed(() =>
    section.value ? SECTIONS_WITH_SUBMENU.includes(section.value) : false
  );

  return { workspaceId, workspace, section, hasSubmenu };
}
