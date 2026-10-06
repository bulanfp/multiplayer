// How each agent answers an @mention, per project. The first intent whose keyword appears
// in the message wins; otherwise the agent's default is used. Intents either produce an
// output (from output-templates.ts) or a short text reply. An intent with `ask` first
// replies with a question and options; the output comes once someone picks one.

export interface AgentAsk {
  /** "{sender}" becomes an @mention of whoever asked */
  question: string;
  options: { label: string; description?: string }[];
}

export interface AgentIntent {
  keywords: string[];
  outputKey?: string;
  reply?: string;
  /** Only match short messages, so "thanks, now make it shorter" still gets a new version */
  maxWords?: number;
  /** Ask this before the first version of the output in a conversation */
  ask?: AgentAsk;
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

const QA_DEVICES: AgentAsk = {
  question: "Happy to, {sender}. Which devices should the plan cover first?",
  options: [
    { label: "iPhone and flagship Android", description: "Fastest to run; covers most orders" },
    { label: "Include low-end Android", description: "Adds the Redmi 9A from the lab" },
    { label: "Every supported device", description: "Full matrix; takes about two days" }
  ]
};

export const AGENT_SCRIPTS: Record<string, Record<string, AgentScript>> = {
  "mobile-ordering-app": {
    airene: {
      intents: [
        THANKS,
        { keywords: ["summary", "summarize", "sprint", "recap"], outputKey: "sprint-summary" }
      ],
      default: { keywords: [], outputKey: "sprint-summary" }
    },
    "design-agent": {
      intents: [
        THANKS,
        { keywords: ["checkout", "pickup", "flow", "spec", "ux"], outputKey: "checkout-flow-spec" }
      ],
      default: { keywords: [], outputKey: "checkout-flow-spec" }
    },
    "dev-agent": {
      intents: [
        THANKS,
        {
          keywords: ["api", "contract", "endpoint", "rewards", "backend"],
          outputKey: "rewards-api-contract"
        }
      ],
      default: { keywords: [], outputKey: "rewards-api-contract" }
    },
    "qa-agent": {
      intents: [
        THANKS,
        {
          keywords: ["test", "regression", "qa", "release", "checklist", "plan"],
          outputKey: "regression-test-plan",
          ask: QA_DEVICES
        }
      ],
      default: { keywords: [], outputKey: "regression-test-plan", ask: QA_DEVICES }
    }
  },
  "holiday-blend-launch": {
    airene: {
      intents: [
        THANKS,
        { keywords: ["brief", "summary", "summarize", "kickoff"], outputKey: "campaign-brief" }
      ],
      default: { keywords: [], outputKey: "campaign-brief" }
    },
    copywriter: {
      intents: [
        THANKS,
        {
          keywords: ["tagline", "copy", "headline", "shorter", "slogan"],
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
          keywords: ["report", "numbers", "performance", "results", "week", "channel"],
          outputKey: "teaser-report"
        }
      ],
      default: { keywords: [], outputKey: "teaser-report" }
    }
  }
};

/** For agents added to a project they have no script for. */
export const FALLBACK_REPLY =
  "Hi {sender}, I'm new to this project. Tell me what you need and I'll draft it here.";

/** When every scripted version of an output already exists in the conversation. */
export const LATEST_VERSION_REPLY =
  "{sender}, {title} is already at its latest version. Tell me what to change and I'll start a fresh draft.";
