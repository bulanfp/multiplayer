// How each agent answers. The first intent whose keyword appears in the message wins;
// otherwise the agent's default is used. Intents either produce an output (from
// output-templates.ts) or a short text reply. An intent with `ask` first replies with a
// question and options; the output comes once someone picks one. An intent with `consult`
// has the agent check with other agents first: each answers in the conversation, then the
// agent replies with what it learned.

export interface AgentAsk {
  /** "{sender}" becomes an @mention of whoever asked */
  question: string;
  options: { label: string; description?: string }[];
}

/** Another agent this one checks with, and what that agent says back. */
export interface AgentConsult {
  agentId: string;
  /** "{sender}" becomes an @mention of the agent that asked */
  reply?: string;
  /** Or it writes this output; with neither, it answers the message as it normally would */
  outputKey?: string;
}

export interface AgentIntent {
  keywords: string[];
  outputKey?: string;
  reply?: string;
  /** Only match short messages, so "thanks, now make it shorter" still gets a new version */
  maxWords?: number;
  /** Ask this before the first version of the output in a conversation */
  ask?: AgentAsk;
  /** Check with these agents before answering */
  consult?: AgentConsult[];
}

export interface AgentScript {
  intents: AgentIntent[];
  default: AgentIntent;
}

const THANKS: AgentIntent = {
  keywords: ["thanks", "thank you", "great job", "nice one"],
  reply: "Anytime, {sender}. Mention me when you want another pass.",
  maxWords: 6
};

// Airene is the general assistant: it catches you up, finds things, brings in the right
// agents, and only writes an output when you ask for a brief or a plan.
const CATCH_UP: string[] = [
  "catch me up",
  "catch up",
  "missed",
  "unread",
  "what's new",
  "whats new"
];
const FIND: string[] = ["find", "where is", "where's", "which file"];

export const AGENT_SCRIPTS: Record<string, AgentScript> = {
  airene: {
    intents: [
      THANKS,
      {
        keywords: CATCH_UP,
        reply:
          "Here's what you missed:\n• Holiday Blend copy: Maya is leaning towards “Only here until the year ends” and needs your approval by Wednesday.\n• Holiday Blend ads: TikTok costs jumped with the 10.10 sales; Fajar is moving budget to Instagram.\n• Holiday Blend social: three of the five creators confirmed for week 2."
      },
      {
        keywords: ["launch week", "plan the launch", "launch plan", "day by day", "each day"],
        outputKey: "launch-week-plan",
        consult: [
          {
            agentId: "copywriter",
            reply:
              "{sender} lead with “Warm cups. Short season.” on the poster and the launch reel, and “Only here until the year ends.” in stories."
          },
          {
            agentId: "social-planner",
            reply:
              "{sender} launch reel Monday at 07:00, barista carousel Wednesday, creator posts Thursday to Saturday, stories daily at 19:00."
          },
          {
            agentId: "campaign-analyst",
            reply:
              "{sender} front-load the paid budget: 40% on Monday and Tuesday, when the teaser got its cheapest sign-ups."
          }
        ]
      },
      { keywords: ["brief", "summary", "summarize", "kickoff"], outputKey: "campaign-brief" },
      {
        keywords: FIND,
        reply:
          "Holiday Blend key visual.png is in Holiday Blend visuals: Dewi shared it yesterday. You can preview it in the Library."
      }
    ],
    default: {
      keywords: [],
      reply:
        "I can catch you up, write the campaign brief, plan launch week or find a file. For specialist work I'll bring in an agent, or you can mention one: Copywriter for lines, Campaign analyst for numbers, Media buyer for ads."
    }
  },
  copywriter: {
    intents: [
      THANKS,
      {
        keywords: ["did best", "worked best", "performed", "which caption", "tested"],
        reply:
          "So invitations beat announcements: I'll write the launch captions as invitations to come in. Want three?",
        consult: [
          {
            agentId: "campaign-analyst",
            reply:
              "{sender} “Save a seat by the window.” had a 5.2% engagement rate, almost double the other two."
          }
        ]
      },
      { keywords: ["sleeve", "cup"], outputKey: "cup-sleeve-copy" },
      {
        keywords: ["tagline", "copy", "headline", "shorter", "slogan", "caption"],
        outputKey: "holiday-taglines"
      }
    ],
    default: { keywords: [], outputKey: "holiday-taglines" }
  },
  "design-agent": {
    intents: [
      THANKS,
      {
        keywords: ["poster", "moodboard", "visual", "direction", "layout"],
        outputKey: "poster-moodboard"
      }
    ],
    default: { keywords: [], outputKey: "poster-moodboard" }
  },
  "social-planner": {
    intents: [
      THANKS,
      {
        keywords: ["creator", "kol", "influencer"],
        outputKey: "content-calendar",
        consult: [
          {
            agentId: "influencer-scout",
            reply:
              "{sender} three creators are confirmed for week 2: Ngopi di Kota, Sarapan Sore and Rina Roams. Two more are waiting on rates."
          }
        ]
      },
      {
        keywords: ["calendar", "content", "instagram", "tiktok", "post", "schedule"],
        outputKey: "content-calendar"
      }
    ],
    default: { keywords: [], outputKey: "content-calendar" }
  },
  "campaign-analyst": {
    intents: [
      THANKS,
      {
        keywords: ["cpm", "cost per", "expensive", "jumped", "why"],
        reply:
          "Most of it is the 10.10 auction: CPMs are up 22%. Move 15% of the TikTok budget to Instagram until 11 Oct and keep the link in the first frame.",
        consult: [
          {
            agentId: "media-buyer",
            reply:
              "{sender} TikTok CPMs are up 22% ahead of the 10.10 sales, and the new creatives dropped the waitlist link from the first frame."
          }
        ]
      },
      {
        keywords: ["report", "numbers", "performance", "results", "week", "channel"],
        outputKey: "teaser-report"
      },
      { keywords: ["target", "kpi", "benchmark"], outputKey: "launch-kpi-targets" }
    ],
    default: { keywords: [], outputKey: "teaser-report" }
  },
  "media-buyer": {
    intents: [
      THANKS,
      { keywords: ["plan", "budget", "split", "spend", "ads"], outputKey: "paid-media-plan" }
    ],
    default: { keywords: [], outputKey: "paid-media-plan" }
  },
  "influencer-scout": {
    intents: [
      THANKS,
      { keywords: ["creator", "kol", "influencer", "shortlist"], outputKey: "creator-shortlist" }
    ],
    default: { keywords: [], outputKey: "creator-shortlist" }
  },
  "crm-marketer": {
    intents: [
      THANKS,
      { keywords: ["email", "push", "member", "rewards"], outputKey: "member-early-access" }
    ],
    default: { keywords: [], outputKey: "member-early-access" }
  },
  "market-researcher": {
    intents: [
      THANKS,
      {
        keywords: ["competitor", "competition", "other chains", "holiday", "trend"],
        outputKey: "competitor-holiday-scan"
      }
    ],
    default: { keywords: [], outputKey: "competitor-holiday-scan" }
  },
  "community-manager": {
    intents: [
      THANKS,
      { keywords: ["comment", "reply", "dm", "question"], outputKey: "comment-replies" }
    ],
    default: { keywords: [], outputKey: "comment-replies" }
  }
};

/** For agents without a script, such as ones people create. */
export const FALLBACK_REPLY =
  "Hi {sender}, I'm new here. Tell me what you need and I'll draft it in this conversation.";

/** When every scripted version of an output already exists in the conversation. */
export const LATEST_VERSION_REPLY =
  "{sender}, {title} is already at its latest version. Tell me what to change and I'll start a fresh draft.";
