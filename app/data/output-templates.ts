import type { OutputBlock, OutputFormat } from "~/data/types";

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
  /** How it opens in the canvas; a doc when left out */
  format?: OutputFormat;
  versions: OutputTemplateVersion[];
}

const TEMPLATES: OutputTemplate[] = [
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
          { title: "Book the creator shoot for week 2", assigneeId: "kevin" },
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
    format: "doc",
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
  },
  // ─── From your agent chats ─────────────────────────────────────────────────
  {
    key: "cup-sleeve-copy",
    title: "Cup sleeve copy",
    kind: "Copy",
    versions: [
      {
        reply: "Three options, all 12 words or fewer.",
        blocks: [
          { type: "heading", text: "Options" },
          {
            type: "list",
            items: [
              '"Roasted for cold mornings. Gone after December." (7 words)',
              '"Your December ritual, in a cup." (6 words)',
              '"Spiced, smooth and only here till the year ends." (9 words)'
            ]
          },
          {
            type: "paragraph",
            text: "Option 1 fits the back panel of the sleeve with room left for the barcode."
          }
        ]
      },
      {
        reply: "More playful: v2 has three lighter takes.",
        blocks: [
          { type: "heading", text: "Options" },
          {
            type: "list",
            items: [
              '"Warning: may cause cozy." (4 words)',
              '"A hug in a cup. Limited edition." (7 words)',
              '"Sip happens. Make it a Holiday Blend." (7 words)'
            ]
          }
        ]
      },
      {
        reply: "Back to the first one, now with the cinnamon.",
        blocks: [
          { type: "heading", text: "Final line" },
          {
            type: "paragraph",
            text: '"Roasted with cinnamon for cold mornings. Gone after December." (9 words)'
          },
          { type: "heading", text: "Placement" },
          {
            type: "list",
            items: [
              "Back panel, above the barcode",
              "Cinnamon in the brand orange; the rest in coffee brown"
            ]
          }
        ]
      }
    ]
  },
  {
    key: "launch-kpi-targets",
    title: "Launch KPI targets",
    kind: "Targets",
    versions: [
      {
        reply: "Here are the launch targets, based on the benchmarks above.",
        blocks: [
          { type: "heading", text: "Instagram" },
          {
            type: "list",
            items: [
              "Engagement rate: 3% (healthy range 2.5–4%)",
              "Treat anything above 5% as inflated by giveaways"
            ]
          },
          { type: "heading", text: "TikTok" },
          {
            type: "list",
            items: [
              "Engagement rate: 2% (healthy range 1.5–3%)",
              "Completion rate on 15-second reels: 30% or more"
            ]
          },
          { type: "heading", text: "Waitlist" },
          {
            type: "list",
            items: [
              "Cost per sign-up: IDR 5,000 (typical in Jakarta: IDR 3,000–6,000)",
              "Above IDR 8,000: rework the first second of the ad"
            ]
          }
        ]
      }
    ]
  },
  {
    key: "kickoff-questions",
    title: "Kickoff open questions",
    kind: "Notes",
    versions: [
      {
        reply: "Three questions are still open from kickoff, with who can answer each.",
        blocks: [
          { type: "heading", text: "Open questions" },
          {
            type: "list",
            items: [
              "Final price per cup: Maya, with finance",
              "Do delivery apps get the blend at launch? Maya",
              "Who signs off on KOL contracts? Maya; legal reviews anything over IDR 50 million"
            ]
          },
          { type: "heading", text: "Next step" },
          {
            type: "paragraph",
            text: "Settle the delivery-app timing before Friday's store briefing."
          }
        ]
      }
    ]
  },
  {
    key: "launch-week-plan",
    title: "Launch week plan",
    kind: "Plan",
    versions: [
      {
        reply: "Here's launch week, day by day, with who owns each piece.",
        blocks: [
          { type: "heading", text: "Monday 1 Nov: launch" },
          {
            type: "list",
            items: [
              "07:00 launch reel on Instagram and TikTok: “Warm cups. Short season.” (Nadia)",
              "07:00 Rewards push to 182K members (CRM marketer)",
              "Store posters up before opening (Dewi, with the store managers)"
            ]
          },
          { type: "heading", text: "Wednesday" },
          { type: "list", items: ["Barista tasting notes carousel (Nadia)"] },
          { type: "heading", text: "Thursday to Saturday" },
          {
            type: "list",
            items: [
              "Three creator posts, one a day (Kevin)",
              "Pop-ups in Senopati, Kemang and Dago on Saturday (Maya)"
            ]
          },
          { type: "heading", text: "Every day" },
          {
            type: "list",
            items: [
              "Stories at 19:00 with “Only here until the year ends.”",
              "Waitlist link in the first frame of every ad"
            ]
          },
          { type: "heading", text: "Paid budget" },
          {
            type: "paragraph",
            text: "40% of the week's budget on Monday and Tuesday, when the teaser got its cheapest sign-ups (Fajar)."
          }
        ]
      },
      {
        reply: "Moved the creator posts up to Tuesday so they ride on the launch reel.",
        blocks: [
          { type: "heading", text: "What changed" },
          {
            type: "list",
            items: [
              "Creator posts: Tuesday to Thursday, one a day",
              "Barista carousel moves to Friday",
              "Pop-ups stay on Saturday"
            ]
          },
          { type: "heading", text: "Why" },
          {
            type: "paragraph",
            text: "Creator posts the day after a launch reel reached 30% more people in the teaser."
          }
        ]
      }
    ]
  },
  {
    key: "creator-shortlist",
    title: "Creator shortlist",
    kind: "Shortlist",
    versions: [
      {
        reply:
          "Eight creators who fit, {sender}. None of them worked with another coffee brand in the last 3 months.",
        blocks: [
          { type: "heading", text: "Top five" },
          {
            type: "list",
            items: [
              "Ngopi di Kota: 280K followers, Jakarta, coffee reviews",
              "Sarapan Sore: 190K, Bandung, food and cafés",
              "Rina Roams: 140K, Jakarta, lifestyle",
              "Kopi dan Kamu: 95K, Jakarta, home brewing",
              "Bandung Bites: 70K, Bandung, food"
            ]
          },
          { type: "heading", text: "Also good" },
          {
            type: "list",
            items: [
              "Pagi Hari Vlog: 120K, Jakarta",
              "Kafe Hopping ID: 85K, Jakarta and Bandung",
              "Senja Stories: 60K, Bandung"
            ]
          },
          { type: "heading", text: "Rates" },
          {
            type: "paragraph",
            text: "IDR 4–12 million per reel. The top five come to IDR 38 million."
          }
        ]
      },
      {
        reply: "Added audience splits and an outreach draft, {sender}.",
        blocks: [
          { type: "heading", text: "Audience" },
          {
            type: "list",
            items: [
              "Ngopi di Kota: 68% aged 18–34, 74% Jakarta",
              "Sarapan Sore: 61% aged 18–34, 70% Bandung",
              "Rina Roams: 72% aged 18–34, 58% Jakarta"
            ]
          },
          { type: "heading", text: "Outreach draft" },
          {
            type: "paragraph",
            text: "Hi! We're launching the Holiday Blend on 1 Nov and would love you to try it first. One reel in week 2, filmed at the store of your choice. Rates and the brief are attached."
          }
        ]
      }
    ]
  },
  {
    key: "member-early-access",
    title: "Rewards early-access email",
    kind: "Email",
    versions: [
      {
        reply: "Here's the early-access email and the launch push, {sender}.",
        blocks: [
          { type: "heading", text: "Subject" },
          { type: "paragraph", text: "You're first: the Holiday Blend is back tomorrow" },
          { type: "heading", text: "Preview text" },
          { type: "paragraph", text: "Rewards members get it a day early, with double points." },
          { type: "heading", text: "Body" },
          {
            type: "paragraph",
            text: "It's back, and you're the first to know. From 31 Oct, Rewards members can order the Holiday Blend in the app a day before everyone else, with double points on every cup until 7 Nov."
          },
          { type: "heading", text: "Launch push, 1 Nov at 07:00" },
          {
            type: "paragraph",
            text: "Cold morning? The Holiday Blend is here. Only until the year ends."
          }
        ]
      },
      {
        reply: "Three shorter subject lines to test, {sender}.",
        blocks: [
          { type: "heading", text: "Subject lines" },
          {
            type: "list",
            items: [
              "A day early, just for you",
              "Your Holiday Blend is ready",
              "Double points, one day early"
            ]
          },
          { type: "heading", text: "Test" },
          {
            type: "paragraph",
            text: "Send each to 5% of members at 10:00, then the best one to everyone at 13:00."
          }
        ]
      }
    ]
  },
  {
    key: "competitor-holiday-scan",
    title: "Competitor holiday scan",
    kind: "Research",
    versions: [
      {
        reply: "Here's what five coffee chains are doing for the holidays.",
        blocks: [
          { type: "heading", text: "What they're doing" },
          {
            type: "list",
            items: [
              "Kopi Senja: Cinnamon Aren latte from mid-November, bundled with a tumbler",
              "Ruang Seduh: Spiced Latte, app-only for its first week",
              "Pagi Coffee: gift cards with 10% extra, no seasonal drink",
              "Kopi Kala: Christmas-themed cups in Jakarta malls",
              "Brew Lab: buy one, get one free on Fridays in December"
            ]
          },
          { type: "heading", text: "Gaps we can own" },
          {
            type: "list",
            items: [
              "Nobody launches before mid-November, so we'd be first by two weeks",
              "Only one other chain avoids Christmas themes; our season-first look stands out"
            ]
          },
          { type: "heading", text: "Watch" },
          {
            type: "paragraph",
            text: "Brew Lab's Friday deal could pull price-sensitive customers in December."
          }
        ]
      },
      {
        reply: "Added what people are saying online about each launch.",
        blocks: [
          { type: "heading", text: "Online chatter, last 30 days" },
          {
            type: "list",
            items: [
              "Kopi Senja: excited about the tumbler, mixed on the price",
              "Ruang Seduh: complaints that app-only leaves out walk-ins",
              "Kopi Kala: the cups get shared a lot, the drinks barely mentioned"
            ]
          },
          { type: "heading", text: "For us" },
          {
            type: "paragraph",
            text: "Keep the Holiday Blend in stores and the app from day one, and make the cup sleeve worth a photo."
          }
        ]
      }
    ]
  },
  {
    key: "paid-media-plan",
    title: "Launch month paid plan",
    kind: "Plan",
    format: "sheet",
    versions: [
      {
        reply: "Here's the paid plan for launch month, {sender}.",
        blocks: [
          { type: "heading", text: "Budget" },
          {
            type: "paragraph",
            text: "IDR 270 million across November: 60% Meta, 30% TikTok, 10% Google."
          },
          { type: "heading", text: "Phases" },
          {
            type: "list",
            items: [
              "Week 1: reach, with the launch reel and the key visual",
              "Week 2: boost the creator posts",
              "Weeks 3 and 4: retarget people who watched half a reel or more"
            ]
          },
          { type: "heading", text: "Guardrails" },
          {
            type: "list",
            items: [
              "Frequency cap of 3 a week",
              "Pause any ad above IDR 8,000 per sign-up for 2 days"
            ]
          }
        ]
      },
      {
        reply: "Moved 15% from TikTok to Instagram until the 10.10 sales are over, {sender}.",
        blocks: [
          { type: "heading", text: "Budget, until 11 Oct" },
          { type: "paragraph", text: "75% Meta, 15% TikTok, 10% Google." },
          { type: "heading", text: "Then" },
          {
            type: "paragraph",
            text: "Back to 60/30/10 once TikTok CPMs drop below IDR 25,000."
          }
        ]
      }
    ]
  },
  {
    key: "comment-replies",
    title: "Comment reply drafts",
    kind: "Replies",
    versions: [
      {
        reply: "Here are replies for the comments we get most, {sender}.",
        blocks: [
          { type: "heading", text: "“How much is it?”" },
          {
            type: "paragraph",
            text: "It's coming on 1 Nov and we'll share the price that week. Want a reminder? Join the waitlist in the app."
          },
          { type: "heading", text: "“Can I order it for delivery?”" },
          {
            type: "paragraph",
            text: "Yes, from 8 Nov. The first week is in stores and the app only, so the baristas can get it just right."
          },
          { type: "heading", text: "“Is it sweet?”" },
          {
            type: "paragraph",
            text: "Lightly sweet, with cinnamon and a hint of palm sugar. Ask for less sugar and the barista will adjust it."
          },
          { type: "heading", text: "Flag to the team" },
          {
            type: "paragraph",
            text: "Two comments mention a cold drink at the Dago store. I've passed them to the store manager."
          }
        ]
      },
      {
        reply: "Added Bahasa Indonesia versions, {sender}.",
        blocks: [
          { type: "heading", text: "“Harganya berapa?”" },
          {
            type: "paragraph",
            text: "Hadir 1 Nov, harganya kami umumkan minggu itu. Mau diingatkan? Gabung waitlist di aplikasi."
          },
          { type: "heading", text: "“Bisa pesan antar?”" },
          {
            type: "paragraph",
            text: "Bisa, mulai 8 Nov. Minggu pertama khusus di toko dan aplikasi dulu, ya."
          }
        ]
      }
    ]
  },
  // ─── Holiday Blend ads: the cost jump ──────────────────────────────────────
  {
    key: "cost-per-signup",
    title: "Cost per sign-up by channel",
    kind: "Breakdown",
    format: "sheet",
    versions: [
      {
        reply: "Here's cost per sign-up by channel for 1–7 Oct, {sender}.",
        blocks: [
          { type: "heading", text: "Cost per sign-up, 1–7 Oct" },
          {
            type: "list",
            items: [
              "Instagram: IDR 3,900 (1,240 sign-ups)",
              "TikTok: IDR 6,800 (610 sign-ups), up from IDR 4,100 on Monday",
              "Overall: IDR 4,850 (1,850 sign-ups)"
            ]
          },
          { type: "heading", text: "Notes" },
          {
            type: "paragraph",
            text: "TikTok's jump starts Tuesday, when the new creatives went live without the waitlist link in the first frame."
          }
        ]
      }
    ]
  },
  {
    key: "cpm-comparison",
    title: "TikTok vs Instagram CPM",
    kind: "Chart",
    format: "html",
    versions: [
      {
        reply: "And an interactive chart of CPMs by day, {sender}. Hover a day to compare.",
        blocks: [
          { type: "heading", text: "TikTok vs Instagram CPM, 1–7 Oct" },
          {
            type: "list",
            items: [
              "Mon: TikTok IDR 38,000 · Instagram IDR 41,000",
              "Tue: TikTok IDR 44,000 · Instagram IDR 41,500",
              "Wed: TikTok IDR 46,500 · Instagram IDR 42,000",
              "Thu: TikTok IDR 47,000 · Instagram IDR 42,500",
              "Fri: TikTok IDR 46,800 · Instagram IDR 42,200"
            ]
          },
          {
            type: "paragraph",
            text: "TikTok CPMs climb 22% from Monday as brands bid for the 10.10 sales. Instagram stays flat."
          }
        ]
      }
    ]
  },
  {
    key: "budget-shift",
    title: "Budget shift proposal",
    kind: "Proposal",
    format: "slides",
    versions: [
      {
        reply: "Four slides for Rizal on moving the budget, {sender}.",
        blocks: [
          { type: "heading", text: "Slide 1 · The ask" },
          {
            type: "paragraph",
            text: "Move 15% of TikTok's budget (IDR 9 million) to Instagram until 11 Oct."
          },
          { type: "heading", text: "Slide 2 · Why" },
          {
            type: "list",
            items: [
              "TikTok CPMs are up 22% ahead of the 10.10 sales",
              "Instagram's cost per sign-up is 43% lower this week"
            ]
          },
          { type: "heading", text: "Slide 3 · What TikTok keeps" },
          {
            type: "paragraph",
            text: "Creator posts and the launch reel, with the waitlist link in the first frame."
          },
          { type: "heading", text: "Slide 4 · When we switch back" },
          { type: "paragraph", text: "12 Oct, once auction prices settle after the sales." }
        ]
      }
    ]
  }
];

export const OUTPUT_TEMPLATES: Record<string, OutputTemplate> = Object.fromEntries(
  TEMPLATES.map((template) => [template.key, template])
);
