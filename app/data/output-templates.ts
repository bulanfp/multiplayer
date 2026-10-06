import type { OutputBlock } from "~/data/types";

// Scripted agent outputs. Each template lists its versions in order: the first time an
// agent produces it in a conversation you get versions[0], asking again gives versions[1].
// `{sender}` in a reply becomes an @mention of whoever asked.

export interface OutputTemplateVersion {
  reply: string;
  blocks: OutputBlock[];
  /** Todos the agent adds when it posts this version */
  todos?: { title: string; assigneeId: string }[];
}

export interface OutputTemplate {
  key: string;
  title: string;
  kind: string;
  versions: OutputTemplateVersion[];
}

const TEMPLATES: OutputTemplate[] = [
  // ─── Mobile ordering app 2.0 ───────────────────────────────────────────────
  {
    key: "checkout-flow-spec",
    title: "Checkout flow spec",
    kind: "Spec",
    versions: [
      {
        reply:
          "Here's a spec for the pickup step, {sender}. ASAP becomes the default and the time picker moves behind a link.",
        blocks: [
          { type: "heading", text: "Problem" },
          {
            type: "paragraph",
            text: "38% of people drop off at the pickup-time step. Most of them pick the first available slot anyway."
          },
          { type: "heading", text: "Proposed flow" },
          {
            type: "list",
            items: [
              'Default to ASAP with the store\'s live prep time, e.g. "Ready in 8–12 min"',
              'Show "Schedule for later" as a secondary link',
              "Remember the last store and pickup preference",
              "Keep the order summary pinned above the pay button"
            ]
          },
          { type: "heading", text: "Edge cases" },
          {
            type: "list",
            items: [
              "Store closes within 30 minutes: disable ASAP and say why",
              "Prep time over 25 minutes: suggest the nearest store with a shorter wait",
              "Connection drops: keep the cart and retry when back online"
            ]
          },
          { type: "heading", text: "Success metric" },
          { type: "paragraph", text: "Pickup-step drop-off under 20% within two weeks of release." }
        ]
      },
      {
        reply: "Updated, {sender}. I added the store-closing rule and an A/B test plan.",
        blocks: [
          { type: "heading", text: "Problem" },
          {
            type: "paragraph",
            text: "38% of people drop off at the pickup-time step. Most of them pick the first available slot anyway."
          },
          { type: "heading", text: "Proposed flow" },
          {
            type: "list",
            items: [
              'Default to ASAP with the store\'s live prep time, e.g. "Ready in 8–12 min"',
              'Show "Schedule for later" as a secondary link',
              "Remember the last store and pickup preference",
              "Keep the order summary pinned above the pay button"
            ]
          },
          { type: "heading", text: "Store closing rule" },
          {
            type: "paragraph",
            text: "Stop ASAP orders 20 minutes before closing. Scheduled orders stay open until 45 minutes before closing."
          },
          { type: "heading", text: "Experiment" },
          {
            type: "list",
            items: [
              "50/50 split for 14 days on Android and iOS",
              "Primary metric: checkout completion",
              "Guardrail: order cancellations within 10 minutes"
            ]
          }
        ]
      }
    ]
  },
  {
    key: "rewards-api-contract",
    title: "Rewards API contract",
    kind: "API contract",
    versions: [
      {
        reply: "Drafted the rewards endpoint, {sender}. Balance is always a number, never null.",
        blocks: [
          { type: "heading", text: "GET /v2/rewards/balance" },
          {
            type: "paragraph",
            text: "Returns the member's points and tier. Requires a member token."
          },
          { type: "heading", text: "Response 200" },
          {
            type: "list",
            items: [
              "points: integer, 0 when the member has no points",
              'tier: "green", "gold" or "reserve"',
              "expiringPoints: integer, points expiring in the next 30 days",
              "updatedAt: ISO 8601 timestamp"
            ]
          },
          { type: "heading", text: "Errors" },
          {
            type: "list",
            items: [
              "401 when the token is missing or expired",
              "404 when the member account was deleted"
            ]
          },
          { type: "heading", text: "Notes" },
          {
            type: "paragraph",
            text: "Clients should treat a missing field as a bug, not as zero. Cache the response for 60 seconds."
          }
        ]
      },
      {
        reply: "Added history pagination and the rounding rule for partial points, {sender}.",
        blocks: [
          { type: "heading", text: "GET /v2/rewards/balance" },
          {
            type: "list",
            items: [
              "points: integer, 0 when the member has no points",
              'tier: "green", "gold" or "reserve"',
              "expiringPoints: integer, points expiring in the next 30 days"
            ]
          },
          { type: "heading", text: "GET /v2/rewards/history" },
          {
            type: "list",
            items: [
              "Cursor-based pagination, 20 items per page",
              "Each item: orderId, points, reason, createdAt",
              "Points are rounded down to whole numbers"
            ]
          },
          { type: "heading", text: "Errors" },
          {
            type: "list",
            items: ["401 when the token is missing or expired", "429 above 30 requests a minute"]
          }
        ]
      }
    ]
  },
  {
    key: "regression-test-plan",
    title: "Regression test plan",
    kind: "Test plan",
    versions: [
      {
        reply:
          "Here's the regression plan for beta.3, {sender}. I added two todos for the riskiest areas.",
        blocks: [
          { type: "heading", text: "Scope" },
          {
            type: "paragraph",
            text: "Checkout v2, rewards balance and order history on iOS 17+ and Android 11+."
          },
          { type: "heading", text: "Critical paths" },
          {
            type: "list",
            items: [
              "Order with ASAP pickup and pay with a saved card",
              "Schedule a pickup for later today",
              "Redeem points at checkout",
              "Reorder from history"
            ]
          },
          { type: "heading", text: "Devices" },
          {
            type: "list",
            items: [
              "iPhone 13 and iPhone 15 Pro",
              "Samsung A54 and Pixel 7",
              "A low-end Android phone with 3 GB RAM"
            ]
          },
          { type: "heading", text: "Exit criteria" },
          {
            type: "list",
            items: ["No open P0 or P1 bugs", "Crash-free sessions above 99.5% in the beta"]
          }
        ],
        todos: [
          { title: "Test pickup time edge cases", assigneeId: "tari" },
          { title: "Verify points rounding on Android", assigneeId: "budi" }
        ]
      },
      {
        reply: "Added an accessibility pass and the release checklist, {sender}.",
        blocks: [
          { type: "heading", text: "Scope" },
          {
            type: "paragraph",
            text: "Checkout v2, rewards balance and order history on iOS 17+ and Android 11+."
          },
          { type: "heading", text: "Critical paths" },
          {
            type: "list",
            items: [
              "Order with ASAP pickup and pay with a saved card",
              "Schedule a pickup for later today",
              "Redeem points at checkout",
              "Reorder from history"
            ]
          },
          { type: "heading", text: "Accessibility" },
          {
            type: "list",
            items: [
              "VoiceOver and TalkBack through checkout",
              "Dynamic type at 200% on the cart and pay screens"
            ]
          },
          { type: "heading", text: "Release checklist" },
          {
            type: "list",
            items: [
              "Feature flags set for a 10% rollout",
              "Release notes approved by product",
              "Support team briefed on checkout changes"
            ]
          }
        ]
      }
    ]
  },
  {
    key: "sprint-summary",
    title: "Sprint 3 summary",
    kind: "Summary",
    versions: [
      {
        reply: "Here's the sprint 3 summary for Friday's steering meeting, {sender}.",
        blocks: [
          { type: "heading", text: "Shipped" },
          {
            type: "list",
            items: ["New store picker", "Saved cards", "Rewards balance, behind a feature flag"]
          },
          { type: "heading", text: "Slipped" },
          { type: "list", items: ["Order history filters, moved to sprint 4"] },
          { type: "heading", text: "Risks" },
          {
            type: "list",
            items: ["Null balance crash on Android 12", "Checkout drop-off still at 38%"]
          },
          { type: "heading", text: "Sprint 4 focus" },
          { type: "paragraph", text: "Checkout v2, rewards API v2 and the beta.3 build." }
        ]
      },
      {
        reply: "Updated with this week's progress, {sender}.",
        blocks: [
          { type: "heading", text: "Shipped" },
          {
            type: "list",
            items: ["New store picker", "Saved cards", "Rewards balance, behind a feature flag"]
          },
          { type: "heading", text: "This week" },
          {
            type: "list",
            items: [
              "Null balance fix merged",
              "Checkout spec ready for review",
              "Beta.3 build on TestFlight"
            ]
          },
          { type: "heading", text: "Next" },
          { type: "paragraph", text: "Regression testing starts Thursday." }
        ]
      }
    ]
  },

  // ─── Holiday Blend launch ──────────────────────────────────────────────────
  {
    key: "campaign-brief",
    title: "Holiday Blend campaign brief",
    kind: "Brief",
    versions: [
      {
        reply: "Here's a one-page brief everyone can work from, {sender}.",
        blocks: [
          { type: "heading", text: "Goal" },
          {
            type: "paragraph",
            text: "Sell 60,000 Holiday Blend cups across 40 stores and the app between 1 Nov and 31 Dec."
          },
          { type: "heading", text: "Audience" },
          {
            type: "paragraph",
            text: "Office workers aged 22–35 in Jakarta and Bandung who already buy coffee three or more times a week."
          },
          { type: "heading", text: "Message" },
          { type: "paragraph", text: "Limited, warm and worth the trip." },
          { type: "heading", text: "Channels" },
          {
            type: "list",
            items: [
              "Instagram and TikTok",
              "In-store posters and cup sleeves",
              "App push notifications and home banner"
            ]
          },
          { type: "heading", text: "Budget" },
          { type: "paragraph", text: "IDR 450 million, 60% on paid social." }
        ]
      },
      {
        reply: "Updated the brief with the teaser results, {sender}.",
        blocks: [
          { type: "heading", text: "Goal" },
          {
            type: "paragraph",
            text: "Sell 60,000 Holiday Blend cups across 40 stores and the app between 1 Nov and 31 Dec."
          },
          { type: "heading", text: "What the teaser told us" },
          {
            type: "list",
            items: [
              "Reels with the cup reveal outperform static posts 3 to 1",
              "Waitlist sign-ups come mostly from Jakarta South"
            ]
          },
          { type: "heading", text: "Changes" },
          {
            type: "list",
            items: ["Shift 10% of the budget from static to reels", "Add two Jakarta South pop-ups"]
          }
        ]
      }
    ]
  },
  {
    key: "holiday-taglines",
    title: "Holiday Blend taglines",
    kind: "Copy",
    versions: [
      {
        reply: "Five tagline options for you, {sender}, from cozy to urgent.",
        blocks: [
          { type: "heading", text: "Taglines" },
          {
            type: "list",
            items: [
              "Warm hands, slow mornings.",
              "Only here until the year ends.",
              "Your favorite season, in a cup.",
              "The Holiday Blend is back for a little while.",
              "Sip it before it's gone."
            ]
          },
          { type: "heading", text: "Recommendation" },
          {
            type: "paragraph",
            text: 'Lead with "Only here until the year ends." It says limited without sounding like a sale.'
          }
        ]
      },
      {
        reply: "Shorter and warmer, as asked, {sender}.",
        blocks: [
          { type: "heading", text: "Taglines" },
          {
            type: "list",
            items: [
              "Warm cups. Short season.",
              "Here till New Year.",
              "Cozy, for now.",
              "Back for the holidays.",
              "Gone after December."
            ]
          },
          { type: "heading", text: "Recommendation" },
          {
            type: "paragraph",
            text: '"Warm cups. Short season." works on the A2 poster and in a 6-second story.'
          }
        ]
      }
    ]
  },
  {
    key: "poster-moodboard",
    title: "Poster moodboard directions",
    kind: "Moodboard",
    versions: [
      {
        reply: "Three directions for the A2 store poster, {sender}.",
        blocks: [
          { type: "heading", text: "Direction A: Cozy kitchen" },
          {
            type: "paragraph",
            text: "Warm wood, steam and hands around the cup. Cream and cinnamon palette."
          },
          { type: "heading", text: "Direction B: Festive street" },
          {
            type: "paragraph",
            text: "Night market lights, soft bokeh, red and gold accents. More energy, less calm."
          },
          { type: "heading", text: "Direction C: Minimal gift" },
          {
            type: "paragraph",
            text: "The cup as a wrapped gift on flat terracotta. Works best for social crops."
          },
          { type: "heading", text: "Recommendation" },
          {
            type: "paragraph",
            text: "A for stores, C for social. Both can come from one photoshoot."
          }
        ]
      },
      {
        reply: "Refined direction A with layout notes, {sender}.",
        blocks: [
          { type: "heading", text: "Direction A: Cozy kitchen" },
          {
            type: "paragraph",
            text: "Warm wood, steam and hands around the cup. Cream and cinnamon palette."
          },
          { type: "heading", text: "Layout notes" },
          {
            type: "list",
            items: [
              "Cup on the right third, slightly above center",
              "Tagline top left at 120 pt",
              "Price and QR code bottom right, white on cinnamon"
            ]
          },
          { type: "heading", text: "Shoot list" },
          {
            type: "list",
            items: ["Hero cup with steam", "Hands wrapping the cup", "Beans and cinnamon close-up"]
          }
        ]
      }
    ]
  },
  {
    key: "content-calendar",
    title: "November content calendar",
    kind: "Calendar",
    versions: [
      {
        reply:
          "Here's the November calendar for Instagram and TikTok, {sender}. I added todos for the two shoots.",
        blocks: [
          { type: "heading", text: "Week 1: launch" },
          {
            type: "list",
            items: [
              "Mon: launch reel, 15 seconds, Instagram and TikTok",
              "Wed: barista tasting notes carousel",
              'Fri: reposts of "first sip" stories'
            ]
          },
          { type: "heading", text: "Week 2" },
          {
            type: "list",
            items: ["Mon: behind-the-roast reel", "Thu: KOL collab live at the Senopati store"]
          },
          { type: "heading", text: "Weeks 3 and 4" },
          {
            type: "list",
            items: ["Gift bundle push", 'Countdown stories: "2 weeks left"']
          },
          { type: "heading", text: "Posting times" },
          { type: "paragraph", text: "Weekdays at 07:00 and 19:00 WIB, weekends at 10:00." }
        ],
        todos: [
          { title: "Book the KOL shoot for week 2", assigneeId: "kevin" },
          { title: "Shoot the launch reel", assigneeId: "nadia" }
        ]
      },
      {
        reply: "Added TikTok hooks and the budget split per week, {sender}.",
        blocks: [
          { type: "heading", text: "TikTok hooks" },
          {
            type: "list",
            items: [
              '"POV: the Holiday Blend is back"',
              "Barista blind taste test",
              '"Rating every holiday drink in Jakarta"'
            ]
          },
          { type: "heading", text: "Budget per week" },
          {
            type: "list",
            items: ["Week 1: 40%", "Week 2: 25%", "Weeks 3 and 4: 35%, mostly retargeting"]
          }
        ]
      }
    ]
  },
  {
    key: "teaser-report",
    title: "Teaser week 1 report",
    kind: "Report",
    versions: [
      {
        reply: "Teaser week 1 is in, {sender}. Reach is ahead of plan, clicks are behind.",
        blocks: [
          { type: "heading", text: "Highlights" },
          {
            type: "list",
            items: [
              "Reach 1.2M against a plan of 900K",
              "Engagement rate 4.1%",
              "Waitlist sign-ups 3,840",
              "Click-through rate 0.9% against a plan of 1.4%"
            ]
          },
          { type: "heading", text: "What worked" },
          {
            type: "paragraph",
            text: "Short reels with the cup reveal, and stories with the countdown sticker."
          },
          { type: "heading", text: "Fix next week" },
          {
            type: "list",
            items: [
              "Put the waitlist link in the first frame",
              "Cut static posts and double the reel budget"
            ]
          }
        ]
      },
      {
        reply: "Added the channel breakdown, {sender}.",
        blocks: [
          { type: "heading", text: "By channel" },
          {
            type: "list",
            items: [
              "Instagram: 720K reach, 4.6% engagement",
              "TikTok: 410K reach, 3.8% engagement",
              "App banner: 70K views, 2.1% click-through"
            ]
          },
          { type: "heading", text: "Cost" },
          {
            type: "list",
            items: ["IDR 38M spent of 45M planned", "Cost per waitlist sign-up IDR 9,900"]
          }
        ]
      }
    ]
  }
];

export const OUTPUT_TEMPLATES: Record<string, OutputTemplate> = Object.fromEntries(
  TEMPLATES.map((template) => [template.key, template])
);
