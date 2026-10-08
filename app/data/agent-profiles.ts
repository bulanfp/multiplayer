import type { AgentProfile } from "~/data/types";

// How each built-in agent is set up, for its profile page. Agents people create start
// with their own instructions and nothing else (see agentProfile in utils/agents.ts).

const FOLLOW_UP_TASKS = {
  name: "Create follow-up tasks",
  description: "Turn a recommendation into a tracked task with an owner.",
  effect: "write",
  approval: "ask"
} as const;

const SEND_EMAIL = {
  name: "Send email",
  description: "Compose and send an email on your behalf.",
  effect: "external",
  approval: "ask"
} as const;

export const AGENT_PROFILES: Record<string, AgentProfile> = {
  airene: {
    instruction:
      "Central Perk's all-round assistant. Keep answers short, say which conversation or file you used, and bring in a specialist agent when a job needs one.",
    model: "Gemini Pro",
    tasks: [
      {
        title: "Catch-ups",
        description: "What happened in your groups while you were away, and what needs you."
      },
      {
        title: "Briefs and plans",
        description: "Campaign briefs and launch plans, with input from the other agents."
      },
      {
        title: "Finding things",
        description: "Files and artifacts shared in your groups, from the Library."
      }
    ],
    sources: ["Your groups", "Library"],
    knowledge: ["Mekari Airene playbook.pdf", "Brand guidelines 2026.pdf"],
    skills: [
      {
        group: "Workspace",
        items: [
          {
            name: "Read conversations",
            description: "Read the groups it's in and your chats with it.",
            effect: "read",
            approval: "auto"
          },
          {
            name: "Search the Library",
            description: "Find artifacts and files shared in your groups.",
            effect: "read",
            approval: "auto"
          },
          {
            name: "Consult other agents",
            description: "Ask another agent for input and show you its answer.",
            effect: "read",
            approval: "auto"
          }
        ]
      },
      { group: "General", items: [FOLLOW_UP_TASKS] }
    ],
    connections: [
      { name: "Google Calendar", isConnected: true },
      { name: "Google Drive", isConnected: true }
    ]
  },

  copywriter: {
    instruction:
      "Write in Central Perk's voice: warm, short and a little playful. No exclamation marks, no clichés, and always count the words.",
    model: "Gemini Flash",
    tasks: [
      { title: "Taglines", description: "Short campaign lines, with options and why each works." },
      { title: "Captions", description: "Social captions sized for each channel." },
      {
        title: "In-app copy",
        description: "Buttons, empty states and notifications that fit the screen."
      }
    ],
    sources: ["Brand guidelines"],
    knowledge: ["Brand guidelines 2026.pdf", "Tone of voice.pdf"],
    skills: [
      {
        group: "Content",
        items: [
          {
            name: "Read campaign briefs",
            description: "Use the brief shared in the conversation as the source.",
            effect: "read",
            approval: "auto"
          }
        ]
      },
      { group: "General", items: [FOLLOW_UP_TASKS, SEND_EMAIL] }
    ],
    connections: [
      { name: "Google Drive", isConnected: true },
      { name: "Gmail", isConnected: false }
    ]
  },

  "design-agent": {
    instruction:
      "A brand designer for Central Perk. Start from the brief, stay inside the brand guidelines unless asked, and explain why each direction works.",
    model: "Gemini Flash",
    tasks: [
      { title: "Moodboards", description: "Visual directions with references and why each works." },
      {
        title: "Key visual directions",
        description: "Hero images and layouts for posters, social and the app."
      },
      { title: "Layout notes", description: "Sizes, type and placement for each format." }
    ],
    sources: ["Figma", "Brand guidelines"],
    knowledge: ["Brand guidelines 2026.pdf", "Holiday Blend campaign brief.pdf"],
    skills: [
      {
        group: "Design",
        items: [
          {
            name: "Read Figma files",
            description: "Open the files and frames linked in a conversation.",
            effect: "read",
            approval: "auto"
          },
          {
            name: "Comment in Figma",
            description: "Leave review notes on the frames it looked at.",
            effect: "write",
            approval: "ask"
          }
        ]
      },
      { group: "General", items: [FOLLOW_UP_TASKS] }
    ],
    connections: [
      { name: "Figma", isConnected: true },
      { name: "Google Drive", isConnected: false }
    ]
  },

  "social-planner": {
    instruction:
      "Plan posts around launch moments. Mix formats, keep a steady rhythm, and give each post an owner and a date.",
    model: "Gemini Flash",
    tasks: [
      { title: "Content calendars", description: "Posts by week and channel, each with an owner." },
      {
        title: "Posting schedules",
        description: "The best times per channel, from last month's results."
      },
      {
        title: "KOL shortlists",
        description: "Creators who fit the brand, with reach and past rates."
      }
    ],
    sources: ["Instagram", "TikTok"],
    knowledge: ["Holiday Blend campaign brief.pdf"],
    skills: [
      {
        group: "Social",
        items: [
          {
            name: "Read channel insights",
            description: "Reach, saves and completion rate per post.",
            effect: "read",
            approval: "auto"
          },
          {
            name: "Schedule posts",
            description: "Queue an approved post on the channel.",
            effect: "external",
            approval: "ask"
          }
        ]
      },
      { group: "General", items: [FOLLOW_UP_TASKS] }
    ],
    connections: [
      { name: "Instagram", isConnected: true },
      { name: "TikTok", isConnected: true },
      { name: "Meta Business Suite", isConnected: false }
    ]
  },

  "campaign-analyst": {
    instruction:
      "Report what changed, why, and what to do next. Lead with the number that matters and put the rest in a table.",
    model: "Gemini Flash",
    tasks: [
      {
        title: "Weekly performance reports",
        description: "Reach, sign-ups and cost per result against the plan."
      },
      {
        title: "Spend recommendations",
        description: "Where to move budget, with the expected effect."
      },
      { title: "Benchmarks", description: "How a result compares with similar F&B launches." }
    ],
    sources: ["Meta Ads", "Google Analytics"],
    knowledge: [],
    skills: [
      {
        group: "Analytics",
        items: [
          {
            name: "Read ad accounts",
            description: "Spend, reach and results per campaign.",
            effect: "read",
            approval: "auto"
          },
          {
            name: "Export reports",
            description: "Save a report to the project's Library.",
            effect: "write",
            approval: "ask"
          }
        ]
      },
      { group: "General", items: [SEND_EMAIL] }
    ],
    connections: [
      { name: "Meta Ads", isConnected: true },
      { name: "Google Analytics", isConnected: true },
      { name: "Google Ads", isConnected: false }
    ]
  },

  "media-buyer": {
    instruction:
      "Plan paid media against the campaign goal. Lead with cost per result, cap frequency, and say what you'd pause before spending more.",
    model: "Gemini Flash",
    tasks: [
      { title: "Paid media plans", description: "Budget split by channel and week, with goals." },
      {
        title: "Budget moves",
        description: "Where to shift spend when costs change, and for how long."
      },
      { title: "Ad checks", description: "Ads that break the rules: links, sizes, frequency." }
    ],
    sources: ["Meta Ads", "TikTok Ads", "Google Ads"],
    knowledge: ["Holiday Blend campaign brief.pdf"],
    skills: [
      {
        group: "Ads",
        items: [
          {
            name: "Read ad accounts",
            description: "Spend, reach, CPM and results per campaign.",
            effect: "read",
            approval: "auto"
          },
          {
            name: "Change budgets",
            description: "Move budget between campaigns in an ad account.",
            effect: "external",
            approval: "ask"
          }
        ]
      },
      { group: "General", items: [FOLLOW_UP_TASKS] }
    ],
    connections: [
      { name: "Meta Ads", isConnected: true },
      { name: "TikTok Ads", isConnected: true },
      { name: "Google Ads", isConnected: false }
    ]
  },

  "influencer-scout": {
    instruction:
      "Find creators whose audience matches ours. Skip anyone who worked with a competitor in the last 3 months, and show reach, audience and rate for each.",
    model: "Gemini Flash",
    tasks: [
      { title: "Creator shortlists", description: "Who fits, with reach, audience and rates." },
      { title: "Outreach drafts", description: "A first message to each creator, in our voice." },
      { title: "Post tracking", description: "Which creators posted, and how the posts did." }
    ],
    sources: ["Instagram", "TikTok"],
    knowledge: ["KOL shortlist.pdf", "Brand guidelines 2026.pdf"],
    skills: [
      {
        group: "Creators",
        items: [
          {
            name: "Read creator profiles",
            description: "Public reach, audience and past brand work.",
            effect: "read",
            approval: "auto"
          },
          {
            name: "Send outreach",
            description: "Message a creator from the brand account.",
            effect: "external",
            approval: "ask"
          }
        ]
      },
      { group: "General", items: [FOLLOW_UP_TASKS, SEND_EMAIL] }
    ],
    connections: [
      { name: "Instagram", isConnected: true },
      { name: "TikTok", isConnected: true },
      { name: "Gmail", isConnected: false }
    ]
  },

  "crm-marketer": {
    instruction:
      "Write for Rewards members: they know us, so be warm and get to the point. Every message needs one clear action and a send time.",
    model: "Gemini Flash",
    tasks: [
      { title: "Member emails", description: "Subject, preview text and body, ready to test." },
      { title: "Push and in-app", description: "Short messages timed to launch moments." },
      { title: "Tests", description: "Which subject line or time to test, and on how many." }
    ],
    sources: ["Central Perk Rewards", "Mekari Qontak"],
    knowledge: ["Brand guidelines 2026.pdf", "Tone of voice.pdf"],
    skills: [
      {
        group: "Members",
        items: [
          {
            name: "Read member segments",
            description: "Member counts and activity by segment.",
            effect: "read",
            approval: "auto"
          },
          {
            name: "Schedule a send",
            description: "Queue an approved email or push for members.",
            effect: "external",
            approval: "ask"
          }
        ]
      },
      { group: "General", items: [FOLLOW_UP_TASKS] }
    ],
    connections: [
      { name: "Mekari Qontak", isConnected: true },
      { name: "Firebase", isConnected: true }
    ]
  },

  "market-researcher": {
    instruction:
      "Report what competitors and customers are doing, with sources and dates. Say what it means for us in one line at the end.",
    model: "Gemini Pro",
    tasks: [
      { title: "Competitor scans", description: "Launches, prices and promotions by chain." },
      { title: "Trend reports", description: "What's growing in coffee and food in Indonesia." },
      { title: "Social listening", description: "What people say about us and others online." }
    ],
    sources: ["Web search", "Instagram", "TikTok"],
    knowledge: [],
    skills: [
      {
        group: "Research",
        items: [
          {
            name: "Search the web",
            description: "News, menus and public posts from the last 90 days.",
            effect: "read",
            approval: "auto"
          }
        ]
      },
      { group: "General", items: [FOLLOW_UP_TASKS] }
    ],
    connections: [
      { name: "Google Search", isConnected: true },
      { name: "Brandwatch", isConnected: false }
    ]
  },

  "community-manager": {
    instruction:
      "Reply like a friendly barista: short, warm and helpful. Never argue, never promise dates you don't know, and flag complaints to the team.",
    model: "Gemini Flash",
    tasks: [
      { title: "Reply drafts", description: "Answers to common comments and DMs." },
      {
        title: "Escalations",
        description: "Complaints and urgent issues, sent to the right person."
      },
      { title: "Weekly themes", description: "What people asked about most this week." }
    ],
    sources: ["Instagram", "TikTok"],
    knowledge: ["Tone of voice.pdf", "Store FAQ.pdf"],
    skills: [
      {
        group: "Community",
        items: [
          {
            name: "Read comments and DMs",
            description: "New comments and messages on the brand accounts.",
            effect: "read",
            approval: "auto"
          },
          {
            name: "Post replies",
            description: "Reply from the brand account.",
            effect: "external",
            approval: "ask"
          }
        ]
      },
      { group: "General", items: [FOLLOW_UP_TASKS] }
    ],
    connections: [
      { name: "Instagram", isConnected: true },
      { name: "TikTok", isConnected: false }
    ]
  }
};
