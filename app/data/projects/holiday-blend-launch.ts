import { createConversationHelpers, outputId, type ProjectSeed } from "~/data/project-seed";
import { dayAt, daysFromNow, minutesAgo } from "~/data/time";

// Marketing project for PT Central Perk Indonesia: launching a limited seasonal blend.

const WORKSPACE_ID = "holiday-blend-launch";
const { channel, dm, agentChat } = createConversationHelpers(WORKSPACE_ID, "hb");

const ALL = ["rizal", "maya", "kevin", "nadia", "dewi", "fajar"];

export const HOLIDAY_BLEND_LAUNCH: ProjectSeed = {
  workspace: {
    id: WORKSPACE_ID,
    name: "Holiday Blend launch",
    initials: "HB",
    emoji: "🚀",
    color: "sky",
    description: "Launch the limited Holiday Blend across 40 stores, social and the app.",
    timeline: "Teaser live · Launch 1 Nov 2026",
    members: [
      { personId: "rizal", role: "admin" },
      { personId: "maya", role: "admin" },
      { personId: "kevin", role: "member" },
      { personId: "nadia", role: "member" },
      { personId: "dewi", role: "member" },
      { personId: "fajar", role: "member" }
    ],
    agentIds: ["airene", "copywriter", "design-agent", "social-planner", "campaign-analyst"],
    invites: [
      {
        id: "inv-hb-1",
        email: "hello@pixelandbean.id",
        role: "member",
        invitedBy: "maya",
        invitedAt: dayAt(1, "13:00")
      }
    ]
  },

  conversations: [
    channel(
      "general",
      { name: "General", emoji: "📣", description: "Campaign announcements" },
      ALL,
      { ids: ["airene"], addedBy: "maya" },
      dayAt(21, "09:00")
    ),
    channel(
      "creative",
      { name: "Creative", emoji: "🎨", description: "Key visual, posters and in-store" },
      ["rizal", "maya", "dewi", "kevin"],
      { ids: ["design-agent"], addedBy: "dewi" },
      dayAt(20, "10:00")
    ),
    channel(
      "copywriting",
      { name: "Copywriting", emoji: "✍️", description: "Taglines, captions and in-app copy" },
      ["rizal", "maya", "kevin"],
      { ids: ["copywriter"], addedBy: "maya" },
      dayAt(20, "10:30")
    ),
    channel(
      "social-media",
      { name: "Social media", emoji: "📸", description: "Instagram, TikTok and KOLs" },
      ["rizal", "maya", "kevin", "nadia"],
      { ids: ["social-planner"], addedBy: "nadia" },
      dayAt(19, "11:00")
    ),
    channel(
      "performance",
      { name: "Performance", emoji: "📈", description: "Paid media and results" },
      ["rizal", "maya", "fajar"],
      { ids: ["campaign-analyst"], addedBy: "fajar" },
      dayAt(19, "11:30")
    ),
    channel(
      "store-events",
      { name: "Store events", emoji: "🏪", description: "Pop-ups and launch day in stores" },
      ["maya", "kevin", "dewi"],
      { ids: [], addedBy: "maya" },
      dayAt(15, "09:30")
    ),
    dm("maya", dayAt(14, "09:00")),
    agentChat("kickoff", "airene", "Open questions from kickoff", dayAt(9, "11:00")),
    agentChat("sleeve-copy", "copywriter", "Cup sleeve copy", dayAt(2, "10:10")),
    agentChat("benchmarks", "campaign-analyst", "Benchmarks for coffee launches", dayAt(5, "14:00"))
  ],

  threads: {
    "hb-general": [
      {
        from: "maya",
        at: dayAt(9, "10:00"),
        text: "Kickoff recap: the Holiday Blend launches 1 Nov in 40 stores and the app. The teaser runs until then."
      },
      {
        from: "maya",
        at: dayAt(9, "10:02"),
        text: "@Airene turn the kickoff notes into a one-page brief, please."
      },
      { from: "airene", at: dayAt(9, "10:03"), output: "campaign-brief", for: "maya" },
      {
        from: "kevin",
        at: dayAt(9, "10:30"),
        text: 'Love "worth the trip" in the brief. Can we use it on store signage too?'
      },
      {
        from: "maya",
        at: dayAt(9, "10:41"),
        text: "Maybe. Let's see the Copywriter's options before we lock any lines."
      },
      {
        from: "nadia",
        at: dayAt(7, "09:00"),
        text: "The teaser is live on Instagram and TikTok. First reel is the cup reveal."
      },
      { from: "rizal", at: dayAt(7, "09:20"), text: "Looks great. Is the app banner live too?" },
      {
        from: "fajar",
        at: dayAt(7, "09:35"),
        text: "Tomorrow morning. The waitlist page needed one more fix."
      },
      {
        from: "maya",
        at: dayAt(3, "10:20"),
        text: "Sharing Brand guidelines 2026.pdf for anyone making assets. Section 4 covers the seasonal colours."
      },
      {
        from: "fajar",
        at: dayAt(2, "09:15"),
        text: "The budget split looks right. Setting up the paid social campaigns today."
      },
      {
        from: "rizal",
        at: dayAt(2, "09:40"),
        text: "Great. Let's keep the app banner in sync with the paid campaigns."
      },
      {
        from: "rizal",
        at: dayAt(2, "09:45"),
        text: "@Maya Putri can you brief the store managers before launch day? They'll get the most questions."
      },
      {
        from: "maya",
        at: dayAt(2, "09:52"),
        text: "On it. I'll run a call with the area managers next week."
      },
      {
        from: "maya",
        at: dayAt(1, "13:00"),
        text: "I've invited Pixel & Bean, the studio doing Thursday's shoot, so they can follow the creative channel."
      },
      {
        from: "maya",
        at: minutesAgo(40),
        text: "@Airene update the brief with the teaser results."
      },
      { from: "airene", at: minutesAgo(39), output: "campaign-brief", for: "maya" }
    ],
    "hb-creative": [
      {
        from: "dewi",
        at: dayAt(6, "14:00"),
        text: "Collecting references for the Holiday Blend visuals. Leaning warm and homey, not Christmas-y."
      },
      {
        from: "maya",
        at: dayAt(6, "14:12"),
        text: "Agree. Plenty of our customers don't celebrate Christmas, so let's keep it about the season and the coffee."
      },
      {
        from: "kevin",
        at: dayAt(6, "14:20"),
        text: "I can borrow props from the Senopati store: wooden trays, the copper kettle, cinnamon sticks."
      },
      {
        from: "dewi",
        at: dayAt(1, "13:00"),
        text: "Starting the A2 store poster. I'd like options before Thursday's shoot."
      },
      {
        from: "dewi",
        at: dayAt(1, "13:02"),
        text: "@Design agent moodboard directions for the poster, please."
      },
      {
        from: "design-agent",
        at: dayAt(1, "13:03"),
        text: "On it, @Dewi Lestari. Should I stick to the brand palette or explore seasonal colours?",
        choice: {
          outputKey: "poster-moodboard",
          options: [
            { label: "Brand palette only", description: "Cream, cinnamon and our green" },
            { label: "Explore seasonal colours", description: "Try red, gold and terracotta too" }
          ],
          picked: { index: 1, by: "dewi" }
        }
      },
      { from: "dewi", at: dayAt(1, "13:04"), text: "Explore seasonal colours" },
      {
        from: "design-agent",
        at: dayAt(1, "13:05"),
        output: "poster-moodboard",
        for: "dewi",
        prefix: "Going with “Explore seasonal colours”. "
      },
      { from: "maya", at: dayAt(1, "13:30"), text: "A for stores and C for social works for me." },
      {
        from: "kevin",
        at: dayAt(1, "13:42"),
        text: "I can shoot both on Thursday if we prep the props on Wednesday."
      },
      {
        from: "dewi",
        at: dayAt(1, "14:05"),
        text: "@Design agent refine direction A with layout notes for the A2 size."
      },
      { from: "design-agent", at: dayAt(1, "14:06"), output: "poster-moodboard", for: "dewi" },
      {
        from: "dewi",
        at: dayAt(1, "16:10"),
        text: "First pass of the key visual: Holiday Blend key visual.png"
      },
      {
        from: "maya",
        at: dayAt(1, "16:25"),
        text: "The steam is lovely. Can the cup sit a bit higher so the price doesn't crowd it?"
      },
      {
        from: "dewi",
        at: dayAt(1, "17:30"),
        text: "Done, and the A2 layout is ready: Store poster A2.pdf"
      },
      {
        from: "maya",
        at: dayAt(1, "17:35"),
        text: "@Dewi Lestari can you send proofs to the printer today? They need a week for 40 stores."
      },
      {
        from: "dewi",
        at: minutesAgo(95),
        text: "Proofs are with the printer. Final files go as soon as the tagline is approved."
      },
      { from: "kevin", at: minutesAgo(70), text: "Props are sorted for Thursday's shoot." }
    ],
    "hb-copywriting": [
      {
        from: "maya",
        at: dayAt(5, "11:00"),
        text: 'Voice check for everything we write: warm, a little playful, never pushy. No "BUY NOW".'
      },
      {
        from: "kevin",
        at: dayAt(5, "11:08"),
        text: "Noted. Should captions be in English, Bahasa Indonesia or both?"
      },
      {
        from: "maya",
        at: dayAt(5, "11:15"),
        text: "Bahasa first on social, English in the app. Keep both short."
      },
      {
        from: "kevin",
        at: dayAt(2, "10:20"),
        text: "@Copywriter three short captions for the teaser reel, please."
      },
      {
        from: "copywriter",
        at: dayAt(2, "10:21"),
        text: '1. "Something warm is coming." 2. "Save a seat by the window." 3. "Cold mornings, meet your match." The second works best over the cup reveal.'
      },
      {
        from: "maya",
        at: dayAt(2, "10:40"),
        text: "The second one is lovely. Use it for Friday's reel."
      },
      {
        from: "maya",
        at: minutesAgo(140),
        text: 'We need a tagline that says limited and warm, not just "new flavor".'
      },
      {
        from: "kevin",
        at: minutesAgo(132),
        text: "@Copywriter give us tagline options for the Holiday Blend."
      },
      { from: "copywriter", at: minutesAgo(131), output: "holiday-taglines", for: "kevin" },
      {
        from: "kevin",
        at: minutesAgo(120),
        text: '"Only here until the year ends" feels limited without shouting.'
      },
      { from: "maya", at: minutesAgo(100), text: "Option 2 is close. Can we get it shorter?" }
    ],
    "hb-social-media": [
      {
        from: "nadia",
        at: dayAt(7, "16:00"),
        text: "Day one of the teaser: 180K views on the reel. Most comments ask about the price."
      },
      {
        from: "maya",
        at: dayAt(7, "16:10"),
        text: 'Let\'s hold the price until week 3. Reply with "Coming 1 Nov" for now.'
      },
      {
        from: "kevin",
        at: dayAt(4, "11:00"),
        text: "Shortlisted 8 KOLs for launch. Mostly coffee and lifestyle, 50K to 300K followers."
      },
      {
        from: "maya",
        at: dayAt(4, "11:15"),
        text: "Good range. Skip anyone who did a competitor launch in the last 3 months."
      },
      {
        from: "nadia",
        at: dayAt(1, "15:00"),
        text: "@Social media planner draft the November calendar for Instagram and TikTok."
      },
      { from: "social-planner", at: dayAt(1, "15:01"), output: "content-calendar", for: "nadia" },
      { from: "kevin", at: dayAt(1, "15:20"), text: "I'll reach out to the KOLs today." },
      { from: "nadia", at: dayAt(1, "15:24"), text: "Thanks! I'll storyboard the launch reel." },
      {
        from: "kevin",
        at: dayAt(1, "16:00"),
        text: "Shortlist with rates and audience splits: KOL shortlist.pdf"
      },
      { from: "maya", at: dayAt(1, "16:20"), text: "Rates look fair. Go with the top five." },
      { from: "kevin", at: minutesAgo(150), text: "Three of the five confirmed for week 2." },
      {
        from: "nadia",
        at: minutesAgo(145),
        text: "Nice. I'll send them the brief and the shot list today."
      }
    ],
    "hb-performance": [
      {
        from: "fajar",
        at: dayAt(8, "10:00"),
        text: "Paid teaser setup: Meta and TikTok at 60/40, optimising for waitlist sign-ups."
      },
      {
        from: "maya",
        at: dayAt(8, "10:15"),
        text: "Can we cap frequency at 3 a week? People got tired of the last campaign's ads."
      },
      { from: "fajar", at: dayAt(8, "10:22"), text: "Done, capped at 3." },
      {
        from: "fajar",
        at: dayAt(4, "09:30"),
        text: "@Campaign analyst what's a realistic click-through rate for a coffee teaser?"
      },
      {
        from: "campaign-analyst",
        at: dayAt(4, "09:31"),
        text: "For F&B teasers in Indonesia: 1.2–1.6% on Instagram and 0.8–1.2% on TikTok. Under 1% overall usually means the link comes too late in the reel or story."
      },
      { from: "fajar", at: minutesAgo(80), text: "Teaser week 1 numbers are in." },
      {
        from: "fajar",
        at: minutesAgo(79),
        text: "@Campaign analyst summarize week 1 for Maya."
      },
      { from: "campaign-analyst", at: minutesAgo(78), output: "teaser-report", for: "fajar" },
      {
        from: "fajar",
        at: minutesAgo(76),
        text: "@Rizal Candra can you review the report before Maya's Friday update?"
      },
      {
        from: "maya",
        at: minutesAgo(50),
        text: "Clicks are low. Let's move the waitlist link to the first frame."
      },
      { from: "fajar", at: minutesAgo(45), text: "Changing it now on all active ads." },
      {
        from: "fajar",
        at: minutesAgo(30),
        text: "@Campaign analyst can you break the report down by channel for Maya?"
      },
      {
        from: "campaign-analyst",
        at: minutesAgo(29),
        text: "Sure, @Fajar Nugroho. How much detail does Maya need?",
        choice: {
          outputKey: "teaser-report",
          options: [
            { label: "Headline numbers", description: "Reach and engagement per channel" },
            { label: "Full breakdown", description: "Every metric for each channel" }
          ]
        }
      }
    ],
    "hb-store-events": [
      {
        from: "maya",
        at: dayAt(6, "09:30"),
        text: "We'll run three pop-ups for launch weekend. Looking at Senopati, Kemang and Dago."
      },
      {
        from: "kevin",
        at: dayAt(6, "09:45"),
        text: "Dago has the best weekend foot traffic. Parking in Kemang is tricky."
      },
      {
        from: "dewi",
        at: dayAt(6, "10:02"),
        text: "I can adapt the poster into a backdrop once we have the sizes."
      },
      {
        from: "maya",
        at: dayAt(2, "11:00"),
        text: "Pop-up locations are confirmed: Senopati, Kemang and Dago."
      },
      { from: "kevin", at: dayAt(2, "11:12"), text: "I'll share the setup checklist by Friday." },
      {
        from: "dewi",
        at: dayAt(2, "11:20"),
        text: "Backdrop sizes too, please, when you have them."
      },
      {
        from: "kevin",
        at: dayAt(1, "10:00"),
        text: "Senopati 2 × 2.4 m, Kemang 3 × 2.4 m, Dago 2 × 2.4 m."
      },
      { from: "dewi", at: dayAt(1, "10:30"), text: "Thanks, on it." }
    ],
    "hb-dm-maya": [
      {
        from: "maya",
        at: dayAt(6, "17:00"),
        text: "Quick one: can you join the creative review on Thursday at 2?"
      },
      { from: "rizal", at: dayAt(6, "17:05"), text: "Yes, add me." },
      {
        from: "maya",
        at: dayAt(3, "12:00"),
        text: "Budget update: we're 8% under on paid social so far."
      },
      {
        from: "rizal",
        at: dayAt(3, "12:10"),
        text: "Good. Keep it as a buffer for launch week."
      },
      {
        from: "maya",
        at: dayAt(1, "18:00"),
        text: "Can you approve the tagline by Wednesday? Printing needs five working days."
      },
      {
        from: "rizal",
        at: dayAt(1, "18:10"),
        text: "Yes, I'll look at the shorter options tomorrow."
      },
      {
        from: "maya",
        at: minutesAgo(35),
        text: 'The options are in Copywriting. I\'m leaning towards "Only here until the year ends."'
      }
    ],
    "hb-chat-kickoff": [
      { from: "rizal", at: dayAt(9, "11:00"), text: "List the open questions from kickoff." },
      {
        from: "airene",
        at: dayAt(9, "11:01"),
        text: "Three open questions: the final price per cup, whether delivery apps get the blend at launch, and who signs off on KOL contracts."
      },
      { from: "rizal", at: dayAt(9, "11:04"), text: "Who usually signs off on KOL contracts?" },
      {
        from: "airene",
        at: dayAt(9, "11:05"),
        text: "In past campaigns it was Maya, with legal reviewing anything over IDR 50 million. Worth confirming with her before Kevin sends offers."
      },
      {
        from: "rizal",
        at: dayAt(9, "11:08"),
        text: "Draft a message to Maya about the delivery apps."
      },
      {
        from: "airene",
        at: dayAt(9, "11:09"),
        text: '"Hi Maya, one from kickoff: should GrabFood and GoFood get the Holiday Blend on 1 Nov, or a week later so stores can handle the in-store rush first?"'
      }
    ],
    "hb-chat-sleeve-copy": [
      {
        from: "rizal",
        at: dayAt(2, "10:10"),
        text: "Write cup sleeve copy for the Holiday Blend, 12 words max."
      },
      {
        from: "copywriter",
        at: dayAt(2, "10:11"),
        text: '"Roasted for cold mornings. Gone after December." Seven words, and it fits the back panel of the sleeve.'
      },
      { from: "rizal", at: dayAt(2, "10:14"), text: "Make it more playful." },
      {
        from: "copywriter",
        at: dayAt(2, "10:15"),
        text: '"Warning: may cause cozy." Four words, with room left for the barcode.'
      },
      {
        from: "rizal",
        at: dayAt(2, "10:18"),
        text: "Go back to the first one, but mention the cinnamon."
      },
      {
        from: "copywriter",
        at: dayAt(2, "10:19"),
        text: '"Roasted with cinnamon for cold mornings. Gone after December." Nine words.'
      }
    ],
    "hb-chat-benchmarks": [
      {
        from: "rizal",
        at: dayAt(5, "14:00"),
        text: "What's a good engagement rate for a coffee launch?"
      },
      {
        from: "campaign-analyst",
        at: dayAt(5, "14:01"),
        text: "For Indonesian F&B brands on Instagram, 2.5–4% is solid for a launch. Above 5% usually means a giveaway is inflating it."
      },
      { from: "rizal", at: dayAt(5, "14:03"), text: "And on TikTok?" },
      {
        from: "campaign-analyst",
        at: dayAt(5, "14:04"),
        text: "Lower for F&B: 1.5–3% is healthy. Watch completion rate instead; above 30% on a 15-second reel is strong."
      },
      {
        from: "rizal",
        at: dayAt(5, "14:06"),
        text: "What cost per waitlist sign-up should we aim for?"
      },
      {
        from: "campaign-analyst",
        at: dayAt(5, "14:07"),
        text: "IDR 3,000–6,000 is typical in Jakarta. Above IDR 8,000 usually means the offer isn't clear in the first second."
      }
    ]
  },

  unread: {
    "hb-creative": 1,
    "hb-copywriting": 2,
    "hb-performance": 4,
    "hb-dm-maya": 1
  },

  files: [
    {
      id: "file-hb-1",
      workspaceId: WORKSPACE_ID,
      name: "Holiday Blend key visual.png",
      type: "image",
      size: "6.8 MB",
      threadId: "hb-creative",
      uploadedBy: "dewi",
      uploadedAt: dayAt(1, "16:10")
    },
    {
      id: "file-hb-2",
      workspaceId: WORKSPACE_ID,
      name: "Store poster A2.pdf",
      type: "pdf",
      size: "24 MB",
      threadId: "hb-creative",
      uploadedBy: "dewi",
      uploadedAt: dayAt(1, "17:30")
    },
    {
      id: "file-hb-3",
      workspaceId: WORKSPACE_ID,
      name: "Brand guidelines 2026.pdf",
      type: "pdf",
      size: "9.1 MB",
      threadId: "hb-general",
      uploadedBy: "maya",
      uploadedAt: dayAt(3, "10:20")
    },
    {
      id: "file-hb-4",
      workspaceId: WORKSPACE_ID,
      name: "KOL shortlist.pdf",
      type: "pdf",
      size: "410 KB",
      threadId: "hb-social-media",
      uploadedBy: "kevin",
      uploadedAt: dayAt(1, "16:00")
    }
  ],

  todos: [
    {
      id: "todo-hb-1",
      workspaceId: WORKSPACE_ID,
      title: "Approve the Holiday Blend tagline",
      done: false,
      assigneeId: "rizal",
      createdBy: { kind: "person", id: "maya" },
      source: { threadId: "hb-dm-maya" },
      due: daysFromNow(2),
      createdAt: dayAt(1, "18:00")
    },
    {
      id: "todo-hb-2",
      workspaceId: WORKSPACE_ID,
      title: "Review the teaser week 1 report",
      done: false,
      assigneeId: "rizal",
      createdBy: { kind: "person", id: "fajar" },
      source: { threadId: "hb-performance" },
      due: daysFromNow(1),
      createdAt: minutesAgo(76)
    },
    {
      id: "todo-hb-3",
      workspaceId: WORKSPACE_ID,
      title: "Book the KOL shoot for week 2",
      done: false,
      assigneeId: "kevin",
      createdBy: { kind: "agent", id: "social-planner" },
      source: { threadId: "hb-social-media" },
      createdAt: dayAt(1, "15:01")
    },
    {
      id: "todo-hb-4",
      workspaceId: WORKSPACE_ID,
      title: "Shoot the launch reel",
      done: false,
      assigneeId: "nadia",
      createdBy: { kind: "agent", id: "social-planner" },
      source: { threadId: "hb-social-media" },
      createdAt: dayAt(1, "15:01")
    },
    {
      id: "todo-hb-5",
      workspaceId: WORKSPACE_ID,
      title: "Brief store managers on launch day",
      done: false,
      assigneeId: "maya",
      createdBy: { kind: "person", id: "rizal" },
      source: { threadId: "hb-general" },
      due: daysFromNow(10),
      createdAt: dayAt(2, "09:45")
    },
    {
      id: "todo-hb-6",
      workspaceId: WORKSPACE_ID,
      title: "Send poster proofs to the printer",
      done: true,
      doneBy: "dewi",
      doneAt: minutesAgo(95),
      assigneeId: "dewi",
      createdBy: { kind: "person", id: "maya" },
      source: { threadId: "hb-creative" },
      createdAt: dayAt(1, "17:35")
    }
  ],

  activity: [
    {
      id: "act-hb-1",
      workspaceId: WORKSPACE_ID,
      kind: "output",
      actor: { kind: "agent", id: "campaign-analyst" },
      text: "finished an output",
      excerpt: "Teaser week 1 report · v1",
      threadId: "hb-performance",
      outputId: outputId("hb-performance", "teaser-report"),
      createdAt: minutesAgo(78),
      read: false
    },
    {
      id: "act-hb-2",
      workspaceId: WORKSPACE_ID,
      kind: "todo",
      actor: { kind: "person", id: "fajar" },
      text: "assigned you a todo",
      excerpt: "Review the teaser week 1 report",
      threadId: "hb-performance",
      createdAt: minutesAgo(76),
      read: false
    },
    {
      id: "act-hb-3",
      workspaceId: WORKSPACE_ID,
      kind: "output",
      actor: { kind: "agent", id: "copywriter" },
      text: "finished an output",
      excerpt: "Holiday Blend taglines · v1",
      threadId: "hb-copywriting",
      outputId: outputId("hb-copywriting", "holiday-taglines"),
      createdAt: minutesAgo(131),
      read: true
    },
    {
      id: "act-hb-4",
      workspaceId: WORKSPACE_ID,
      kind: "todo",
      actor: { kind: "person", id: "maya" },
      text: "assigned you a todo",
      excerpt: "Approve the Holiday Blend tagline",
      threadId: "hb-dm-maya",
      createdAt: dayAt(1, "18:00"),
      read: true
    },
    {
      id: "act-hb-5",
      workspaceId: WORKSPACE_ID,
      kind: "invite",
      actor: { kind: "person", id: "maya" },
      text: "invited someone to the project",
      excerpt: "hello@pixelandbean.id",
      createdAt: dayAt(1, "13:00"),
      read: true
    }
  ]
};
