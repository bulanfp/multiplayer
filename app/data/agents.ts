import { reactive } from "vue";
import type { Agent } from "~/data/types";

// 3D icons in public/images/agents/ come from design's HD set, cropped to the shape and
// saved at 256px. Each agent has its own; the unused ones are there for custom agents.
function icon(name: string): string {
  return `/images/agents/${name}.png`;
}

/** The general assistant: top of the chat list, and in every group. */
export const AIRENE_ID = "airene";

// The marketing team's agents. Reactive so agents added while the app runs show up everywhere.
export const AGENTS: Agent[] = reactive([
  {
    id: AIRENE_ID,
    name: "Airene",
    role: "Assistant",
    description:
      "Catches you up, drafts briefs and plans, and brings in the right agent when a job needs one.",
    icon: icon("airene"),
    initials: "AI",
    color: "violet"
  },
  {
    id: "copywriter",
    name: "Copywriter",
    role: "Copy",
    description: "Writes taglines, captions and in-app copy in your brand voice.",
    icon: icon("bunny-pink"),
    initials: "CW",
    color: "orange"
  },
  {
    id: "design-agent",
    name: "Design agent",
    role: "Design",
    description: "Turns a brief into moodboards, key visual directions and layout notes.",
    icon: icon("cloud-purple"),
    initials: "DA",
    color: "fuchsia"
  },
  {
    id: "social-planner",
    name: "Social media planner",
    role: "Social",
    description: "Plans content calendars and posting schedules for Instagram and TikTok.",
    icon: icon("box-blue"),
    initials: "SM",
    color: "blue"
  },
  {
    id: "campaign-analyst",
    name: "Campaign analyst",
    role: "Analytics",
    description: "Reports on campaign performance and says what to fix next.",
    icon: icon("peaks-teal"),
    initials: "CA",
    color: "green"
  },
  {
    id: "media-buyer",
    name: "Media buyer",
    role: "Paid ads",
    description: "Plans and tunes paid campaigns on Meta, TikTok and Google.",
    icon: icon("step-green"),
    initials: "MB",
    color: "indigo"
  },
  {
    id: "influencer-scout",
    name: "Influencer scout",
    role: "Creators",
    description: "Finds creators who fit the brand, checks their audience and drafts outreach.",
    icon: icon("ball-yellow"),
    initials: "IS",
    color: "teal"
  },
  {
    id: "crm-marketer",
    name: "CRM marketer",
    role: "Email and push",
    description: "Writes email, push and in-app messages for Central Perk Rewards members.",
    icon: icon("arch-orange"),
    initials: "CM",
    color: "orange"
  },
  {
    id: "market-researcher",
    name: "Market researcher",
    role: "Research",
    description: "Tracks competitors, trends and what customers say about the brand online.",
    icon: icon("star-navy"),
    initials: "MR",
    color: "indigo"
  },
  {
    id: "community-manager",
    name: "Community manager",
    role: "Community",
    description:
      "Drafts replies to comments and DMs in the brand voice, and flags anything urgent.",
    icon: icon("peaks-red"),
    initials: "CO",
    color: "violet"
  }
]);

export function getAgent(id: string): Agent | undefined {
  return AGENTS.find((agent) => agent.id === id);
}
