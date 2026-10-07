import { createConversationHelpers, outputId, type WorkspaceSeed } from "~/data/seed-helpers";
import { dayAt, daysFromNow, minutesAgo } from "~/data/time";

// Mock content: PT Central Perk Indonesia's marketing team launching the limited Holiday Blend.
// One shared space, no projects. Groups are workstreams (Airene is in every one); a few are
// unnamed, started from New chat by picking people. Agent chats are your own private threads,
// several per agent, and an agent can bring others in to help.

const WORKSPACE_ID = "central-perk";
const { channel, unnamedGroup, agentChat } = createConversationHelpers(WORKSPACE_ID, "cp");

const TEAM = ["rizal", "maya", "kevin", "nadia", "dewi", "fajar"];

export const CENTRAL_PERK: WorkspaceSeed = {
  workspace: {
    id: WORKSPACE_ID,
    name: "Central Perk Indonesia",
    members: [
      { personId: "rizal", role: "admin" },
      { personId: "maya", role: "admin" },
      { personId: "kevin", role: "member" },
      { personId: "nadia", role: "member" },
      { personId: "dewi", role: "member" },
      { personId: "fajar", role: "member" }
    ],
    agentIds: [
      "airene",
      "copywriter",
      "design-agent",
      "social-planner",
      "campaign-analyst",
      "media-buyer",
      "influencer-scout",
      "crm-marketer",
      "market-researcher",
      "community-manager"
    ]
  },

  conversations: [
    // ─── Groups ─────────────────────────────────────────────────────────────
    // There are no projects, so each group's name says which campaign it's for.
    channel(
      "holiday-blend",
      {
        name: "Holiday Blend launch",
        emoji: "🚀",
        description: "The seasonal blend in 40 stores, on social and in the app from 1 Nov"
      },
      TEAM,
      { ids: [], addedBy: "maya" },
      dayAt(21, "09:00")
    ),
    channel(
      "holiday-blend-visuals",
      {
        name: "Holiday Blend visuals",
        emoji: "🎨",
        description: "Key visual, posters and in-store for the Holiday Blend"
      },
      ["rizal", "maya", "dewi", "kevin"],
      { ids: ["design-agent"], addedBy: "dewi" },
      dayAt(20, "10:00")
    ),
    channel(
      "holiday-blend-copy",
      {
        name: "Holiday Blend copy",
        emoji: "✍️",
        description: "Taglines, captions and in-app copy for the Holiday Blend"
      },
      ["rizal", "maya", "kevin"],
      { ids: ["copywriter"], addedBy: "maya" },
      dayAt(20, "10:30")
    ),
    channel(
      "holiday-blend-social",
      {
        name: "Holiday Blend social",
        emoji: "📸",
        description: "Instagram, TikTok and creators for the Holiday Blend"
      },
      ["rizal", "maya", "kevin", "nadia"],
      { ids: ["social-planner", "influencer-scout"], addedBy: "nadia" },
      dayAt(19, "11:00")
    ),
    channel(
      "holiday-blend-ads",
      {
        name: "Holiday Blend ads",
        emoji: "📈",
        description: "Paid media and results for the Holiday Blend"
      },
      ["rizal", "maya", "fajar"],
      { ids: ["campaign-analyst", "media-buyer"], addedBy: "fajar" },
      dayAt(19, "11:30")
    ),
    channel(
      "rewards-member-emails",
      {
        name: "Rewards member emails",
        emoji: "💌",
        description: "Email, push and in-app messages for Central Perk Rewards members"
      },
      ["rizal", "maya", "fajar"],
      { ids: ["crm-marketer"], addedBy: "maya" },
      dayAt(12, "14:00")
    ),
    channel(
      "ramadan-2027",
      {
        name: "Ramadan 2027 planning",
        emoji: "🌙",
        description: "Early planning for next year's Ramadan campaign"
      },
      ["rizal", "maya", "nadia"],
      { ids: ["market-researcher"], addedBy: "maya" },
      dayAt(4, "14:50")
    ),
    // Rizal isn't in this one: search finds it, and it opens with a Join button.
    channel(
      "holiday-blend-pop-ups",
      {
        name: "Holiday Blend pop-ups",
        emoji: "🏪",
        description: "Launch weekend pop-ups in Senopati, Kemang and Dago"
      },
      ["maya", "kevin", "dewi"],
      { ids: [], addedBy: "maya" },
      dayAt(15, "09:30")
    ),
    // Started from New chat without a name, so they're titled after who's in them. Picking
    // just Maya in New chat opens the first one instead of starting another.
    unnamedGroup(
      "group-creator-offers",
      ["maya", "rizal"],
      { ids: [], addedBy: "maya" },
      dayAt(1, "15:40")
    ),
    unnamedGroup(
      "group-carousel-shoot",
      ["nadia", "rizal", "kevin"],
      { ids: ["social-planner"], addedBy: "nadia" },
      dayAt(2, "09:10")
    ),

    // ─── Your agent chats: private threads, several per agent ───────────────
    agentChat("kickoff-questions", "Kickoff open questions", "airene", dayAt(9, "11:00")),
    agentChat("launch-week", "Plan launch week", "airene", minutesAgo(26)),
    agentChat("cup-sleeve-copy", "Cup sleeve copy", "copywriter", dayAt(2, "10:10")),
    agentChat(
      "best-teaser-caption",
      "Which teaser caption did best?",
      "copywriter",
      dayAt(1, "09:30")
    ),
    agentChat(
      "engagement-benchmarks",
      "Engagement benchmarks",
      "campaign-analyst",
      dayAt(5, "14:00")
    ),
    agentChat(
      "competitor-holidays",
      "Competitor holiday plans",
      "market-researcher",
      dayAt(3, "16:00")
    )
  ],

  threads: {
    "cp-holiday-blend": [
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
        at: minutesAgo(40),
        text: "@Airene update the brief with the teaser results."
      },
      { from: "airene", at: minutesAgo(39), output: "campaign-brief", for: "maya" }
    ],
    "cp-holiday-blend-visuals": [
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
    "cp-holiday-blend-copy": [
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
        from: "rizal",
        at: dayAt(2, "10:25"),
        text: "From my chat with Copywriter: the cup sleeve line, with the cinnamon. @Maya Putri good to print?",
        shared: { threadId: "cp-chat-cup-sleeve-copy", output: "cup-sleeve-copy", version: 3 }
      },
      {
        from: "maya",
        at: dayAt(2, "10:40"),
        text: "The sleeve line is perfect, send it. And the second caption is lovely: use it for Friday's reel."
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
      { from: "maya", at: minutesAgo(100), text: "Option 2 is close. Can we get it shorter?" },
      {
        from: "maya",
        at: minutesAgo(36),
        text: "@Rizal Candra can you approve the tagline by Wednesday? Printing needs five working days."
      },
      {
        from: "maya",
        at: minutesAgo(35),
        text: 'I\'m leaning towards "Only here until the year ends."'
      }
    ],
    "cp-holiday-blend-social": [
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
        text: "@Influencer scout find coffee and lifestyle creators in Jakarta and Bandung, 50K to 300K followers. Nobody who did a competitor launch in the last 3 months."
      },
      {
        from: "influencer-scout",
        at: dayAt(4, "11:01"),
        output: "creator-shortlist",
        for: "kevin"
      },
      {
        from: "maya",
        at: dayAt(4, "11:15"),
        text: "Good range. Kevin, can you reach out to the top five?"
      },
      {
        from: "nadia",
        at: dayAt(1, "15:00"),
        text: "@Social media planner draft the November calendar for Instagram and TikTok."
      },
      { from: "social-planner", at: dayAt(1, "15:01"), output: "content-calendar", for: "nadia" },
      { from: "kevin", at: dayAt(1, "15:20"), text: "I'll reach out to the creators today." },
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
    "cp-holiday-blend-ads": [
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
      // The analyst brings in the media buyer to explain a jump in cost.
      {
        from: "fajar",
        at: minutesAgo(70),
        text: "@Campaign analyst TikTok cost per sign-up jumped since Tuesday. What happened?"
      },
      {
        from: "campaign-analyst",
        at: minutesAgo(69),
        text: "Let me check with @Media buyer."
      },
      {
        from: "media-buyer",
        consultedBy: "campaign-analyst",
        at: minutesAgo(68),
        text: "@Campaign analyst two things. TikTok CPMs are up 22% ahead of the 10.10 sales, and Tuesday's new creatives dropped the waitlist link from the first frame."
      },
      {
        from: "campaign-analyst",
        at: minutesAgo(67),
        text: "Thanks, @Media buyer. @Fajar Nugroho, most of the jump is the 10.10 auction: CPMs are up 22%. The missing link explains the rest. Put the link back in the first frame and move 15% of the TikTok budget to Instagram until 11 Oct."
      },
      {
        from: "maya",
        at: minutesAgo(50),
        text: "Clicks are low anyway. Let's move the waitlist link to the first frame everywhere."
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
    "cp-rewards-member-emails": [
      {
        from: "maya",
        at: dayAt(3, "13:00"),
        text: "Rewards members should hear about the Holiday Blend first. Can we email them a day early?"
      },
      {
        from: "fajar",
        at: dayAt(3, "13:10"),
        text: "Yes, and a push on launch morning. The member list is 182K."
      },
      {
        from: "rizal",
        at: dayAt(3, "13:20"),
        text: "@CRM marketer draft the early-access email and the launch push."
      },
      { from: "crm-marketer", at: dayAt(3, "13:21"), output: "member-early-access", for: "rizal" },
      {
        from: "maya",
        at: dayAt(3, "14:00"),
        text: "Love the subject line. Let's send on 31 Oct at 10:00."
      },
      { from: "fajar", at: dayAt(3, "14:12"), text: "Scheduled. The push goes 1 Nov at 07:00." }
    ],
    "cp-ramadan-2027": [
      {
        from: "maya",
        at: dayAt(4, "15:00"),
        text: "Kicking off Ramadan 2027 early this year. The budget review is in December, so let's have a direction by then."
      },
      {
        from: "nadia",
        at: dayAt(4, "15:10"),
        text: "Last Ramadan our best posts were the sahur reels. The iftar giveaways got reach but hardly any store visits."
      },
      {
        from: "rizal",
        at: dayAt(4, "15:20"),
        text: "@Market researcher what did other coffee chains do for Ramadan this year?"
      },
      {
        from: "market-researcher",
        at: dayAt(4, "15:21"),
        text: "Three patterns, @Rizal Candra: sahur bundles delivered before 03:00, takjil boxes for offices at iftar, and Lebaran gift cards. Kopi Senja's sahur bundle got the most coverage. Nobody launched a seasonal drink."
      },
      {
        from: "maya",
        at: dayAt(4, "15:40"),
        text: "So a Ramadan drink could be our angle. Let's pick this up after the Holiday Blend launch."
      }
    ],
    "cp-holiday-blend-pop-ups": [
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

    // ─── Unnamed groups ─────────────────────────────────────────────────────
    "cp-group-creator-offers": [
      { at: dayAt(1, "15:40"), text: "Maya Putri started this group with Rizal Candra and Airene" },
      {
        from: "maya",
        at: dayAt(1, "15:40"),
        text: "The creator offers come to IDR 64 million, so legal has to review them before Kevin sends anything."
      },
      {
        from: "rizal",
        at: dayAt(1, "15:46"),
        text: "@Airene can you list the offers for legal?"
      },
      {
        from: "airene",
        at: dayAt(1, "15:47"),
        text: "Here they are, @Rizal Candra: Ngopi di Kota IDR 24 million, Rina Roams IDR 22 million and Sarapan Sore IDR 18 million, all for week 2. The other two creators haven't sent rates yet."
      },
      { from: "maya", at: dayAt(1, "15:52"), text: "Perfect, sending it to legal now." }
    ],
    "cp-group-carousel-shoot": [
      {
        at: dayAt(2, "09:10"),
        text: "Nadia Rahma started this group with Rizal Candra, Kevin Tan, Airene and Social media planner"
      },
      {
        from: "nadia",
        at: dayAt(2, "09:10"),
        text: "The barista carousel shoot moved to Thursday 09:00 at the Senopati store."
      },
      {
        from: "kevin",
        at: dayAt(2, "09:18"),
        text: "@Social media planner does the carousel still go out on Wednesday?"
      },
      {
        from: "social-planner",
        at: dayAt(2, "09:19"),
        text: "Not anymore, @Kevin Tan. I'll move it to Friday at 12:00 and bring the creator posts forward to Thursday."
      },
      { from: "rizal", at: dayAt(2, "09:30"), text: "Works for me. Thanks, both." }
    ],

    // ─── Your agent chats ───────────────────────────────────────────────────
    "cp-chat-kickoff-questions": [
      { from: "rizal", at: dayAt(9, "11:00"), text: "List the open questions from kickoff." },
      { from: "airene", at: dayAt(9, "11:01"), output: "kickoff-questions" },
      { from: "rizal", at: dayAt(9, "11:04"), text: "Who usually signs off on KOL contracts?" },
      {
        from: "airene",
        at: dayAt(9, "11:05"),
        text: "In past campaigns it was Maya, with legal reviewing anything over IDR 50 million. Worth confirming with her before Kevin sends offers."
      }
    ],
    // Airene brings in three agents and folds their answers into one plan.
    "cp-chat-launch-week": [
      {
        from: "rizal",
        at: minutesAgo(26),
        text: "Plan launch week for the Holiday Blend: what goes out each day?"
      },
      {
        from: "airene",
        at: minutesAgo(25),
        text: "Let me check with @Copywriter, @Social media planner and @Campaign analyst."
      },
      {
        from: "copywriter",
        consultedBy: "airene",
        at: minutesAgo(24),
        text: "@Airene lead with “Warm cups. Short season.” on the poster and the launch reel. For stories, “Only here until the year ends.” Maya has seen both."
      },
      {
        from: "social-planner",
        consultedBy: "airene",
        at: minutesAgo(24),
        text: "@Airene the launch reel goes out Monday at 07:00 and the barista carousel on Wednesday. Three creator posts land Thursday to Saturday, and stories run daily at 19:00."
      },
      {
        from: "campaign-analyst",
        consultedBy: "airene",
        at: minutesAgo(23),
        text: "@Airene put 40% of the week's paid budget on Monday and Tuesday: that's when the teaser got its cheapest sign-ups. Keep the waitlist link in the first frame."
      },
      {
        from: "airene",
        at: minutesAgo(22),
        output: "launch-week-plan",
        prefix: "Thanks, @Copywriter, @Social media planner and @Campaign analyst. "
      }
    ],
    "cp-chat-cup-sleeve-copy": [
      {
        from: "rizal",
        at: dayAt(2, "10:10"),
        text: "Write cup sleeve copy for the Holiday Blend, 12 words max."
      },
      { from: "copywriter", at: dayAt(2, "10:11"), output: "cup-sleeve-copy" },
      { from: "rizal", at: dayAt(2, "10:14"), text: "Make it more playful." },
      { from: "copywriter", at: dayAt(2, "10:15"), output: "cup-sleeve-copy" },
      {
        from: "rizal",
        at: dayAt(2, "10:18"),
        text: "Go back to the first one, but mention the cinnamon."
      },
      { from: "copywriter", at: dayAt(2, "10:19"), output: "cup-sleeve-copy" }
    ],
    // Copywriter asks the analyst which caption worked before writing more.
    "cp-chat-best-teaser-caption": [
      {
        from: "rizal",
        at: dayAt(1, "09:30"),
        text: "Which teaser caption did best? Ask @Campaign analyst."
      },
      { from: "copywriter", at: dayAt(1, "09:31"), text: "Let me check with @Campaign analyst." },
      {
        from: "campaign-analyst",
        consultedBy: "copywriter",
        at: dayAt(1, "09:32"),
        text: "@Copywriter “Save a seat by the window.” had a 5.2% engagement rate, almost double the other two. Saves were high too, which usually means people plan to visit."
      },
      {
        from: "copywriter",
        at: dayAt(1, "09:33"),
        text: "Thanks, @Campaign analyst. So invitations beat announcements: I'll write the launch captions as invitations to come in, not news about a new drink. Say the word and I'll draft three."
      }
    ],
    "cp-chat-engagement-benchmarks": [
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
      },
      { from: "rizal", at: dayAt(5, "14:10"), text: "Put these into launch targets I can share." },
      { from: "campaign-analyst", at: dayAt(5, "14:11"), output: "launch-kpi-targets" },
      {
        from: "campaign-analyst",
        at: minutesAgo(15),
        text: "Heads-up: waitlist sign-ups passed 5,000 this morning, a week ahead of plan. Most came from the cup reveal reel."
      }
    ],
    "cp-chat-competitor-holidays": [
      {
        from: "rizal",
        at: dayAt(3, "16:00"),
        text: "What are other coffee chains doing for the holidays this year?"
      },
      { from: "market-researcher", at: dayAt(3, "16:01"), output: "competitor-holiday-scan" },
      { from: "rizal", at: dayAt(3, "16:05"), text: "Is anyone else doing cinnamon?" },
      {
        from: "market-researcher",
        at: dayAt(3, "16:06"),
        text: "Two of the five: Kopi Senja's Cinnamon Aren and Ruang Seduh's Spiced Latte. Both launch mid-November, so we'd be first by two weeks."
      }
    ]
  },

  unread: {
    "cp-holiday-blend-copy": 2,
    "cp-holiday-blend-ads": 3,
    "cp-holiday-blend-social": 1,
    "cp-chat-engagement-benchmarks": 1
  },

  files: [
    {
      id: "file-cp-1",
      workspaceId: WORKSPACE_ID,
      name: "Holiday Blend key visual.png",
      type: "image",
      size: "6.8 MB",
      threadId: "cp-holiday-blend-visuals",
      uploadedBy: "dewi",
      uploadedAt: dayAt(1, "16:10"),
      previewPages: ["/files/hb-key-visual.svg"]
    },
    {
      id: "file-cp-2",
      workspaceId: WORKSPACE_ID,
      name: "Store poster A2.pdf",
      type: "pdf",
      size: "24 MB",
      threadId: "cp-holiday-blend-visuals",
      uploadedBy: "dewi",
      uploadedAt: dayAt(1, "17:30"),
      previewPages: ["/files/hb-store-poster-a2.svg"]
    },
    {
      id: "file-cp-3",
      workspaceId: WORKSPACE_ID,
      name: "Brand guidelines 2026.pdf",
      type: "pdf",
      size: "9.1 MB",
      threadId: "cp-holiday-blend",
      uploadedBy: "maya",
      uploadedAt: dayAt(3, "10:20"),
      previewPages: [
        "/files/hb-brand-guidelines-1.svg",
        "/files/hb-brand-guidelines-2.svg",
        "/files/hb-brand-guidelines-3.svg"
      ]
    },
    {
      id: "file-cp-4",
      workspaceId: WORKSPACE_ID,
      name: "KOL shortlist.pdf",
      type: "pdf",
      size: "410 KB",
      threadId: "cp-holiday-blend-social",
      uploadedBy: "kevin",
      uploadedAt: dayAt(1, "16:00"),
      previewPages: ["/files/hb-kol-shortlist.svg"]
    }
  ],

  todos: [
    {
      id: "todo-cp-1",
      workspaceId: WORKSPACE_ID,
      title: "Approve the Holiday Blend tagline",
      done: false,
      assigneeId: "rizal",
      createdBy: { kind: "person", id: "maya" },
      source: { threadId: "cp-holiday-blend-copy" },
      due: daysFromNow(2),
      createdAt: minutesAgo(36)
    },
    {
      id: "todo-cp-2",
      workspaceId: WORKSPACE_ID,
      title: "Review the teaser week 1 report",
      done: false,
      assigneeId: "rizal",
      createdBy: { kind: "person", id: "fajar" },
      source: { threadId: "cp-holiday-blend-ads" },
      due: daysFromNow(1),
      createdAt: minutesAgo(76)
    },
    {
      id: "todo-cp-3",
      workspaceId: WORKSPACE_ID,
      title: "Book the creator shoot for week 2",
      done: false,
      assigneeId: "kevin",
      createdBy: { kind: "agent", id: "social-planner" },
      source: { threadId: "cp-holiday-blend-social" },
      createdAt: dayAt(1, "15:01")
    },
    {
      id: "todo-cp-4",
      workspaceId: WORKSPACE_ID,
      title: "Shoot the launch reel",
      done: false,
      assigneeId: "nadia",
      createdBy: { kind: "agent", id: "social-planner" },
      source: { threadId: "cp-holiday-blend-social" },
      createdAt: dayAt(1, "15:01")
    },
    {
      id: "todo-cp-5",
      workspaceId: WORKSPACE_ID,
      title: "Brief store managers on launch day",
      done: false,
      assigneeId: "maya",
      createdBy: { kind: "person", id: "rizal" },
      source: { threadId: "cp-holiday-blend" },
      due: daysFromNow(10),
      createdAt: dayAt(2, "09:45")
    },
    {
      id: "todo-cp-6",
      workspaceId: WORKSPACE_ID,
      title: "Send poster proofs to the printer",
      done: true,
      doneBy: "dewi",
      doneAt: minutesAgo(95),
      assigneeId: "dewi",
      createdBy: { kind: "person", id: "maya" },
      source: { threadId: "cp-holiday-blend-visuals" },
      createdAt: dayAt(1, "17:35")
    }
  ],

  activity: [
    {
      id: "act-cp-1",
      workspaceId: WORKSPACE_ID,
      kind: "output",
      actor: { kind: "agent", id: "campaign-analyst" },
      text: "finished an output",
      excerpt: "Teaser week 1 report · v1",
      threadId: "cp-holiday-blend-ads",
      outputId: outputId("cp-holiday-blend-ads", "teaser-report"),
      createdAt: minutesAgo(78),
      read: false
    },
    {
      id: "act-cp-2",
      workspaceId: WORKSPACE_ID,
      kind: "todo",
      actor: { kind: "person", id: "fajar" },
      text: "assigned you a todo",
      excerpt: "Review the teaser week 1 report",
      threadId: "cp-holiday-blend-ads",
      createdAt: minutesAgo(76),
      read: false
    },
    {
      id: "act-cp-3",
      workspaceId: WORKSPACE_ID,
      kind: "output",
      actor: { kind: "agent", id: "copywriter" },
      text: "finished an output",
      excerpt: "Holiday Blend taglines · v1",
      threadId: "cp-holiday-blend-copy",
      outputId: outputId("cp-holiday-blend-copy", "holiday-taglines"),
      createdAt: minutesAgo(131),
      read: true
    },
    {
      id: "act-cp-4",
      workspaceId: WORKSPACE_ID,
      kind: "todo",
      actor: { kind: "person", id: "maya" },
      text: "assigned you a todo",
      excerpt: "Approve the Holiday Blend tagline",
      threadId: "cp-holiday-blend-copy",
      createdAt: minutesAgo(36),
      read: true
    }
  ]
};
