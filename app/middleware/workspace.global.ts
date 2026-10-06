import { useWorkspaceStore } from "~/composables/useWorkspaceStore";

// Unknown projects go back home; known ones become the "last visited" project.
export default defineNuxtRouteMiddleware((to) => {
  const workspaceId = to.path.match(/^\/w\/([^/]+)/)?.[1];
  if (!workspaceId) return;

  const { getWorkspace, rememberWorkspace } = useWorkspaceStore();
  if (!getWorkspace(workspaceId)) return navigateTo("/", { replace: true });
  rememberWorkspace(workspaceId);
});
