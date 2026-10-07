import { useWorkspaceStore } from "~/composables/useWorkspaceStore";

// An unknown workspace in the URL goes back home.
export default defineNuxtRouteMiddleware((to) => {
  const workspaceId = to.path.match(/^\/w\/([^/]+)/)?.[1];
  if (!workspaceId) return;

  const { getWorkspace } = useWorkspaceStore();
  if (!getWorkspace(workspaceId)) return navigateTo("/", { replace: true });
});
