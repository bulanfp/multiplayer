import { reactive } from "vue";
import { SEED } from "~/data/seed";
import type { ActivityItem } from "~/data/types";
import { createId } from "~/utils/ids";

// Module-level state: the app is a client-only SPA, so a singleton is safe, and agent
// reply timers can update it without a component context.
const state = reactive({ items: structuredClone(SEED.activity) as ActivityItem[] });

function feedFor(workspaceId: string): ActivityItem[] {
  return state.items
    .filter((item) => item.workspaceId === workspaceId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function unreadCountFor(workspaceId: string): number {
  return state.items.filter((item) => item.workspaceId === workspaceId && !item.read).length;
}

function addActivity(
  item: Omit<ActivityItem, "id" | "read" | "createdAt">,
  { read = false }: { read?: boolean } = {}
): void {
  state.items.push({
    ...item,
    id: createId("act"),
    read,
    createdAt: new Date().toISOString()
  });
}

function markRead(id: string): void {
  const item = state.items.find((entry) => entry.id === id);
  if (item) item.read = true;
}

function markAllRead(workspaceId: string): void {
  state.items.forEach((item) => {
    if (item.workspaceId === workspaceId) item.read = true;
  });
}

export function useActivityStore() {
  return { feedFor, unreadCountFor, addActivity, markRead, markAllRead };
}
