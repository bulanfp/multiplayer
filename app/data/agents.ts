import { reactive } from "vue";
import type { Agent } from "~/data/types";

// 3D icons in public/images/agents/ are cut from the design screenshot (the Figma
// file wasn't accessible); swap them for @3x exports. blob-pink, blocks-blue and
// cloud-teal are recoloured copies so no two agents in one project look alike.
function icon(name: string): string {
  return `/images/agents/${name}.png`;
}

// Reactive so agents people create (useAgentStore) show up everywhere straight away.
export const AGENTS: Agent[] = reactive([
  {
    id: "airene",
    name: "Airene",
    role: "Assistant",
    description: "Summarizes threads, drafts briefs and answers questions about the project.",
    icon: icon("airene"),
    initials: "AI",
    color: "violet"
  },
  {
    id: "design-agent",
    name: "Design agent",
    role: "Design",
    description: "Turns ideas into flows, specs and moodboards.",
    icon: icon("cloud-purple"),
    initials: "DA",
    color: "fuchsia"
  },
  {
    id: "dev-agent",
    name: "Dev agent",
    role: "Engineering",
    description: "Drafts API contracts, technical specs and code review notes.",
    icon: icon("blocks-green"),
    initials: "DV",
    color: "indigo"
  },
  {
    id: "qa-agent",
    name: "QA agent",
    role: "Quality",
    description: "Writes test plans, regression checklists and release checks.",
    icon: icon("blob-yellow"),
    initials: "QA",
    color: "teal"
  },
  {
    id: "copywriter",
    name: "Copywriter",
    role: "Copy",
    description: "Writes taglines, captions and in-app copy in your brand voice.",
    icon: icon("blob-pink"),
    initials: "CW",
    color: "orange"
  },
  {
    id: "social-planner",
    name: "Social media planner",
    role: "Social",
    description: "Plans content calendars and posting schedules.",
    icon: icon("blocks-blue"),
    initials: "SM",
    color: "blue"
  },
  {
    id: "campaign-analyst",
    name: "Campaign analyst",
    role: "Analytics",
    description: "Reports on campaign performance and suggests what to fix next.",
    icon: icon("cloud-teal"),
    initials: "CA",
    color: "green"
  },
  {
    id: "applicant-screener",
    name: "Applicant Screener",
    role: "Recruiting",
    description: "Screens applicants against your job requirements.",
    icon: icon("blocks-green"),
    initials: "AS",
    color: "green"
  },
  {
    id: "b2b-prospect-hunter",
    name: "B2B Prospect Hunter",
    role: "Sales",
    description: "Finds and qualifies B2B leads for your sales team.",
    icon: icon("blob-yellow"),
    initials: "BP",
    color: "orange"
  },
  {
    id: "referral-reporter",
    name: "Referral Reporter",
    role: "Growth",
    description: "Tracks referral programs and reports who is bringing in customers.",
    icon: icon("cloud-purple"),
    initials: "RR",
    color: "violet"
  }
]);

/** Icons to pick from when creating an agent; Airene's sparkle stays hers. */
export const AGENT_ICON_CHOICES: { label: string; icon: string }[] = [
  { label: "Purple cloud", icon: icon("cloud-purple") },
  { label: "Green blocks", icon: icon("blocks-green") },
  { label: "Yellow blob", icon: icon("blob-yellow") },
  { label: "Pink blob", icon: icon("blob-pink") },
  { label: "Blue blocks", icon: icon("blocks-blue") },
  { label: "Teal cloud", icon: icon("cloud-teal") }
];

export function getAgent(id: string): Agent | undefined {
  return AGENTS.find((agent) => agent.id === id);
}
