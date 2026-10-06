import type { RailSection } from "~/data/navigation";

export function workspacePath(workspaceId: string): string {
  return `/w/${workspaceId}`;
}

export function conversationPath(workspaceId: string, slug: string): string {
  return `/w/${workspaceId}/c/${slug}`;
}

export function agentPath(workspaceId: string, agentId: string): string {
  return `/w/${workspaceId}/agents/${agentId}`;
}

export function sectionPath(workspaceId: string, section: RailSection): string {
  return section === "home" ? workspacePath(workspaceId) : `/w/${workspaceId}/${section}`;
}
