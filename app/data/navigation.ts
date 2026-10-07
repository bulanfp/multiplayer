import type { IconName } from "@mekari/pixel3";

export type RailSection = "home" | "activity" | "library" | "todos" | "agents";

export interface RailItem {
  section: RailSection;
  label: string;
  icon: IconName;
  /** For icons Pixel has no fill variant of, like Airene's mark */
  activeIcon?: IconName;
}

// Activity and Todos are hidden for now; their pages still work at /w/[workspaceId]/activity
// and /w/[workspaceId]/todos. Unread messages show on Chats instead.
export const RAIL_ITEMS: RailItem[] = [
  { section: "home", label: "Chats", icon: "chat" },
  { section: "library", label: "Library", icon: "folder-close" },
  { section: "agents", label: "Agents", icon: "airene-outline", activeIcon: "airene-black" }
];
