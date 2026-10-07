import { getAgent } from "~/data/agents";

/**
 * What an agent says when it's added to a group. "{sender}" becomes an @mention of whoever
 * added it. Agents without a line here introduce themselves from their description.
 */
const INTROS: Record<string, string> = {
  airene:
    "Hi everyone 👋 Thanks for having me, {sender}! I'm Airene: I summarize threads, draft briefs and plans, and bring in other agents when a job needs them. @mention me anytime.",
  "design-agent":
    "Hello hello 👋 Design agent here, thanks {sender}! Hand me a brief and I'll turn it into moodboards, key visual directions and layout notes. @mention me when something needs a look.",
  copywriter:
    "Hello, wordsmiths 👋 Copywriter at your service, thanks {sender}! Taglines, captions and in-app copy, all in your brand voice. @mention me when you need the right words.",
  "social-planner":
    "Hi everyone 👋 Social media planner here, thanks {sender}! I plan content calendars and posting schedules. @mention me and I'll map out the week.",
  "campaign-analyst":
    "Hey team 👋 Campaign analyst, at your service. Thanks {sender}! I read the numbers and tell you what to fix next. @mention me for a report.",
  "media-buyer":
    "Hi all 👋 Media buyer here, thanks {sender}! I plan and tune paid ads on Meta, TikTok and Google, and I watch every rupiah. @mention me before you boost anything.",
  "influencer-scout":
    "Hey everyone 👋 Influencer scout, thanks {sender}! I find creators who fit the brand and draft the outreach. @mention me when you need a shortlist.",
  "crm-marketer":
    "Hi team 👋 CRM marketer here, thanks {sender}! I write emails, pushes and in-app messages for Rewards members. @mention me when members should hear first.",
  "market-researcher":
    "Hello 👋 Market researcher here, thanks {sender}! I keep an eye on competitors, trends and what people say about us online. @mention me for a scan.",
  "community-manager":
    "Hi everyone 👋 Community manager here, thanks {sender}! I draft replies to comments and DMs in our voice and flag anything urgent. @mention me when the comments pile up."
};

export function agentIntro(agentId: string): string {
  const line = INTROS[agentId];
  if (line) return line;
  const agent = getAgent(agentId);
  // Descriptions read like "Screens applicants…", so they follow "In short:" in lower case.
  const about = agent?.description
    ? ` In short: ${agent.description.charAt(0).toLowerCase()}${agent.description.slice(1)}`
    : "";
  return `Hi everyone 👋 ${agent?.name ?? "Your new agent"} here, thanks for adding me, {sender}!${about} @mention me when you need me.`;
}
