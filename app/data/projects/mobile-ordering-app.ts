import { createConversationHelpers, outputId, type ProjectSeed } from "~/data/project-seed";
import { dayAt, daysFromNow, minutesAgo } from "~/data/time";

// Tech project for PT Central Perk Indonesia: rebuilding the coffee ordering app.

const WORKSPACE_ID = "mobile-ordering-app";
const { channel, dm, agentChat } = createConversationHelpers(WORKSPACE_ID, "mo");

const ALL = ["rizal", "sari", "dewi", "budi", "arif", "tari"];

export const MOBILE_ORDERING_APP: ProjectSeed = {
  workspace: {
    id: WORKSPACE_ID,
    name: "Mobile ordering app 2.0",
    initials: "MO",
    color: "teal",
    description: "Rebuild ordering, pickup and loyalty in the Central Perk app.",
    timeline: "Sprint 4 of 6 · Launch 15 Dec 2026",
    members: [
      { personId: "rizal", role: "admin" },
      { personId: "sari", role: "admin" },
      { personId: "dewi", role: "member" },
      { personId: "budi", role: "member" },
      { personId: "arif", role: "member" },
      { personId: "tari", role: "member" }
    ],
    agentIds: ["airene", "design-agent", "dev-agent", "qa-agent"],
    invites: [
      {
        id: "inv-mo-1",
        email: "yoga.pratama@centralperk.co.id",
        role: "member",
        invitedBy: "sari",
        invitedAt: dayAt(2, "10:00")
      }
    ]
  },

  conversations: [
    channel(
      "general",
      { name: "General", emoji: "📣", description: "Announcements and sprint updates" },
      ALL,
      { ids: ["airene"], addedBy: "sari" },
      dayAt(40, "09:00")
    ),
    channel(
      "product-design",
      { name: "Product design", emoji: "🎨", description: "Checkout, pickup and loyalty UX" },
      ["rizal", "sari", "dewi", "budi"],
      { ids: ["design-agent", "airene"], addedBy: "dewi" },
      dayAt(38, "10:00")
    ),
    channel(
      "mobile-dev",
      { name: "Mobile dev", emoji: "📱", description: "iOS and Android builds" },
      ["rizal", "budi", "arif", "tari"],
      { ids: ["dev-agent"], addedBy: "budi" },
      dayAt(38, "10:30")
    ),
    channel(
      "backend-api",
      { name: "Backend API", emoji: "🛠️", description: "APIs, infrastructure and data" },
      ["sari", "arif"],
      { ids: ["dev-agent"], addedBy: "arif" },
      dayAt(36, "11:00")
    ),
    channel(
      "qa-release",
      { name: "QA and release", emoji: "🧪", description: "Beta builds, test plans and releases" },
      ["rizal", "sari", "budi", "tari"],
      { ids: ["qa-agent"], addedBy: "tari" },
      dayAt(30, "13:00")
    ),
    dm("sari", dayAt(20, "09:00")),
    dm("budi", dayAt(18, "09:00")),
    agentChat("standup", "airene", "Today's standup notes", minutesAgo(200)),
    agentChat("teardown", "airene", "Competitor app teardown", dayAt(9, "11:00")),
    agentChat("empty-states", "design-agent", "Empty state for rewards", dayAt(3, "14:02")),
    agentChat("store-picker", "design-agent", "Store picker: map or list", dayAt(6, "10:30")),
    agentChat("onboarding-copy", "design-agent", "Onboarding copy review", dayAt(12, "09:15")),
    agentChat("payment-retry", "dev-agent", "Retry logic for payments", dayAt(2, "15:40")),
    agentChat("flaky-login", "qa-agent", "Flaky login test", dayAt(4, "16:20"))
  ],

  threads: {
    "mo-general": [
      {
        from: "sari",
        at: dayAt(6, "09:10"),
        text: "Sprint 3 demo is tomorrow at 10. Budi and Dewi, can you show the store picker and saved cards?"
      },
      {
        from: "budi",
        at: dayAt(6, "09:18"),
        text: "Yes. I'll demo on a real phone, the simulator hides the map lag."
      },
      {
        from: "dewi",
        at: dayAt(6, "09:25"),
        text: "I'll cover saved cards and the new empty states."
      },
      {
        from: "sari",
        at: dayAt(5, "11:30"),
        text: "Thanks for the demo, everyone. The ops team loved the store picker."
      },
      {
        from: "rizal",
        at: dayAt(5, "11:42"),
        text: "Nice work. Ops asked if each store could show its live prep time. Sari, can we add that to the backlog?"
      },
      {
        from: "sari",
        at: dayAt(5, "11:50"),
        text: "Added. It fits with the checkout work in sprint 4."
      },
      {
        from: "sari",
        at: dayAt(2, "09:00"),
        text: "Morning all. Sprint 4 goals are up: checkout v2, rewards API v2 and the beta.3 build. Steering review is on Friday."
      },
      { from: "sari", at: dayAt(2, "09:02"), text: "The board is attached: Sprint 4 board.pdf" },
      {
        from: "arif",
        at: dayAt(2, "09:06"),
        text: "Rewards API v2 is mine. I'm starting with the balance endpoint."
      },
      {
        from: "tari",
        at: dayAt(2, "09:10"),
        text: "Heads-up: I need a build with checkout v2 by Wednesday to start regression on Thursday."
      },
      { from: "budi", at: dayAt(2, "09:14"), text: "Doable. I'll cut beta.3 Tuesday night." },
      {
        from: "sari",
        at: dayAt(2, "10:02"),
        text: "I've invited Yoga from the ops team so he can follow launch prep."
      },
      {
        from: "dewi",
        at: dayAt(1, "11:40"),
        text: "App Store screenshots are ready for review: App Store screenshots.zip"
      },
      {
        from: "sari",
        at: dayAt(1, "11:45"),
        text: "@Rizal Candra can you approve the screenshots this week? Apple review takes a few days."
      },
      {
        from: "rizal",
        at: dayAt(1, "11:52"),
        text: "Will do. The dark mode set looks great, Dewi."
      },
      {
        from: "sari",
        at: dayAt(1, "16:30"),
        text: "@Airene can you put together a sprint 3 summary for Friday?"
      },
      { from: "airene", at: dayAt(1, "16:31"), output: "sprint-summary", for: "sari" },
      {
        from: "rizal",
        at: dayAt(1, "16:45"),
        text: "Thanks, this works as the agenda. Let's keep the meeting to 30 minutes."
      },
      { from: "sari", at: dayAt(1, "16:50"), text: "Agreed. I'll send the invite." },
      {
        from: "sari",
        at: minutesAgo(20),
        text: "@Airene add this week's progress to the summary so it's ready for Friday."
      },
      { from: "airene", at: minutesAgo(19), output: "sprint-summary", for: "sari" }
    ],
    "mo-product-design": [
      {
        from: "dewi",
        at: dayAt(4, "10:00"),
        text: "Started on checkout v2. First question: do we keep tipping in the flow? Only 3% of orders use it."
      },
      {
        from: "sari",
        at: dayAt(4, "10:12"),
        text: "Move it to the receipt screen. Fewer steps before pay is the whole point of v2."
      },
      { from: "budi", at: dayAt(4, "10:20"), text: "Fine by me, it's one component either way." },
      {
        from: "dewi",
        at: dayAt(3, "15:30"),
        text: "@Design agent what do other coffee apps do with tipping after checkout?"
      },
      {
        from: "design-agent",
        at: dayAt(3, "15:31"),
        text: 'Most put it on the receipt as a one-tap "Add a tip" with three preset amounts. Asking before payment lowers conversion, so I\'d keep it out of checkout.'
      },
      {
        from: "dewi",
        at: dayAt(2, "15:20"),
        text: "Wireframes for the new flow are up: Checkout v2 wireframes.fig. Pickup time is still the weak spot."
      },
      {
        from: "budi",
        at: dayAt(2, "15:34"),
        text: "Left comments in Figma. The time picker needs store opening hours, and the app doesn't get those yet."
      },
      {
        from: "sari",
        at: dayAt(2, "15:40"),
        text: "I'll ask Arif to add them to the store payload in rewards v2."
      },
      {
        from: "sari",
        at: dayAt(1, "10:12"),
        text: "Checkout drop-off is 38% at the pickup-time step. Can we simplify it before sprint review?"
      },
      {
        from: "dewi",
        at: dayAt(1, "10:15"),
        text: "Most people pick the first slot anyway. I'd make ASAP the default."
      },
      {
        from: "dewi",
        at: dayAt(1, "10:16"),
        text: "@Design agent can you turn that into a spec we can test?"
      },
      { from: "design-agent", at: dayAt(1, "10:17"), output: "checkout-flow-spec", for: "dewi" },
      {
        from: "budi",
        at: dayAt(1, "10:41"),
        text: "ASAP as the default works for us. The store API already returns prep time."
      },
      {
        from: "sari",
        at: dayAt(1, "10:55"),
        text: "What happens when a store is about to close? I don't want people ordering ASAP five minutes before closing."
      },
      {
        from: "dewi",
        at: dayAt(1, "11:02"),
        text: "@Design agent add a rule for stores that are about to close, and a way to test it."
      },
      { from: "design-agent", at: dayAt(1, "11:03"), output: "checkout-flow-spec", for: "dewi" },
      {
        from: "sari",
        at: dayAt(1, "11:20"),
        text: "Perfect. Let's start the test on 10% of orders."
      },
      { from: "budi", at: dayAt(1, "11:25"), text: "I'll put it behind a remote config flag." },
      {
        from: "sari",
        at: minutesAgo(95),
        text: "@Rizal Candra can you review the spec before Friday? I'd like to lock it at the steering meeting."
      }
    ],
    "mo-mobile-dev": [
      {
        from: "budi",
        at: dayAt(3, "09:30"),
        text: "Android builds take 14 minutes now. Any objections to turning on the Gradle build cache in CI?"
      },
      {
        from: "arif",
        at: dayAt(3, "09:41"),
        text: "Go for it. Cache the iOS pods too, they download on every run."
      },
      {
        from: "budi",
        at: dayAt(3, "11:05"),
        text: "Done. Android is down to 6 minutes, iOS to 9."
      },
      {
        from: "tari",
        at: dayAt(2, "14:10"),
        text: "Is the store picker map meant to jump when you scroll the list? Seeing it on a Pixel 6."
      },
      { from: "budi", at: dayAt(2, "14:22"), text: "Known issue. The fix is in beta.3." },
      {
        from: "budi",
        at: dayAt(2, "16:00"),
        text: "@Dev agent what's the cleanest way to keep the menu usable offline?"
      },
      {
        from: "dev-agent",
        at: dayAt(2, "16:01"),
        text: "Cache each store's menu for 24 hours with an ETag. Show the cached menu on launch and refresh in the background, but only take payment once the fresh prices are in."
      },
      {
        from: "budi",
        at: dayAt(1, "09:20"),
        text: "The loyalty screen crashes on Android 12 when the balance is 0."
      },
      { from: "tari", at: dayAt(1, "09:24"), text: "Same on Android 13. iOS is fine." },
      {
        from: "arif",
        at: dayAt(1, "09:32"),
        text: "The backend returns null instead of 0 there. Fixing it now."
      },
      {
        from: "budi",
        at: dayAt(1, "09:40"),
        text: "@Dev agent draft the contract for the new rewards endpoint so we agree on nulls."
      },
      { from: "dev-agent", at: dayAt(1, "09:41"), output: "rewards-api-contract", for: "budi" },
      {
        from: "arif",
        at: dayAt(1, "10:02"),
        text: "Matches what I'm building. I'll link it in the PR."
      },
      {
        from: "budi",
        at: dayAt(1, "10:10"),
        text: "I'll add a guard on the app side too, so a null never takes the screen down again."
      },
      {
        from: "arif",
        at: minutesAgo(60),
        text: "@Dev agent we also need paging for points history and a rule for partial points."
      },
      { from: "dev-agent", at: minutesAgo(59), output: "rewards-api-contract", for: "arif" },
      { from: "arif", at: minutesAgo(25), text: "The null-balance fix is merged and on staging." },
      { from: "budi", at: minutesAgo(18), text: "Verified on Android 12 and 13. Thanks, Arif!" }
    ],
    "mo-backend-api": [
      {
        from: "arif",
        at: dayAt(5, "10:00"),
        text: "Moving the promo engine into its own service this sprint. Same API, new deployment."
      },
      {
        from: "sari",
        at: dayAt(5, "10:20"),
        text: "Any risk for the Holiday Blend launch? Marketing wants promos live on 1 Nov."
      },
      {
        from: "arif",
        at: dayAt(5, "10:26"),
        text: "No, it'll be done two weeks before. I'll keep the old path as a fallback until then."
      },
      {
        from: "arif",
        at: dayAt(3, "16:00"),
        text: "@Dev agent how should I index the promo rules query? It filters by store and time window."
      },
      {
        from: "dev-agent",
        at: dayAt(3, "16:01"),
        text: "Add a composite index on (store_id, starts_at, ends_at) and cache active promos per store for 60 seconds. Most requests then never touch the table."
      },
      {
        from: "arif",
        at: dayAt(1, "14:00"),
        text: "Order service p95 latency went from 320 ms to 540 ms after the promo launch."
      },
      { from: "sari", at: dayAt(1, "14:06"), text: "Is it the promo rules query?" },
      {
        from: "arif",
        at: dayAt(1, "14:20"),
        text: "Yes. Adding the index and caching active promos for 60 seconds."
      },
      {
        from: "arif",
        at: dayAt(1, "17:05"),
        text: "Back to 300 ms. I'll keep an eye on it tonight."
      },
      {
        from: "sari",
        at: dayAt(1, "17:10"),
        text: "Great save. Can you add an alert at 450 ms so we hear about it before customers do?"
      },
      { from: "arif", at: minutesAgo(130), text: "The alert is in. It pages me and posts here." },
      {
        from: "sari",
        at: minutesAgo(125),
        text: "One more: Budi needs store opening hours in the store payload for the new time picker."
      },
      {
        from: "arif",
        at: minutesAgo(110),
        text: "Added opening_hours to /stores in rewards v2. It ships with the null fix."
      }
    ],
    "mo-qa-release": [
      {
        from: "tari",
        at: dayAt(6, "13:00"),
        text: "Beta.2 regression is done: two P1s, both fixed. Signing off."
      },
      {
        from: "sari",
        at: dayAt(6, "13:15"),
        text: "Thanks, Tari! Beta.2 goes to the store team tomorrow."
      },
      {
        from: "tari",
        at: dayAt(4, "10:00"),
        text: "Proposal: from beta.3 on, every regression run includes an accessibility pass."
      },
      {
        from: "rizal",
        at: dayAt(4, "10:12"),
        text: "Yes, please. We had two screen reader complaints last month."
      },
      { at: dayAt(1, "10:55"), text: "Tari Anggraini added QA agent" },
      {
        from: "tari",
        at: dayAt(1, "11:00"),
        text: "Beta.3 is on TestFlight and the Play internal track."
      },
      { from: "tari", at: dayAt(1, "11:02"), text: "Release notes: Beta.3 release notes.pdf" },
      {
        from: "budi",
        at: dayAt(1, "11:04"),
        text: "Checkout v2 is in it. The null-balance fix follows in the next build."
      },
      {
        from: "sari",
        at: dayAt(1, "11:20"),
        text: "Who's testing on low-end Android? Most orders in Bandung come from older phones."
      },
      {
        from: "tari",
        at: dayAt(1, "11:31"),
        text: "We have a Redmi 9A in the lab. I'll add it to the device list."
      },
      {
        from: "tari",
        at: minutesAgo(60),
        text: "Regression starts Thursday and I need a plan by Wednesday. Can someone kick it off with QA agent?"
      }
    ],
    "mo-dm-sari": [
      {
        from: "sari",
        at: dayAt(6, "08:50"),
        text: "Morning! Did ops share their feedback on the store picker?"
      },
      {
        from: "rizal",
        at: dayAt(6, "09:05"),
        text: "Yes. They like it, but want live prep time on each store. I told them it's on the backlog."
      },
      { from: "sari", at: dayAt(6, "09:06"), text: "Good. I'll pair it with checkout v2." },
      {
        from: "sari",
        at: dayAt(1, "17:05"),
        text: "Do you have 15 minutes before Friday's steering meeting?"
      },
      { from: "rizal", at: dayAt(1, "17:20"), text: "Sure, Thursday at 4?" },
      { from: "sari", at: dayAt(1, "17:21"), text: "Works. I'll bring the sprint summary." },
      {
        from: "sari",
        at: minutesAgo(90),
        text: "Also, the checkout spec is in Product design if you want a head start."
      }
    ],
    "mo-dm-budi": [
      {
        from: "budi",
        at: dayAt(4, "19:30"),
        text: "Sorry for the late ping. Can the store picker fix wait for beta.3 instead of a hotfix? It's a small visual glitch."
      },
      { from: "rizal", at: dayAt(4, "19:42"), text: "Yes, beta.3 is fine. Not worth a hotfix." },
      { from: "budi", at: dayAt(4, "19:43"), text: "Thanks!" },
      {
        from: "budi",
        at: minutesAgo(120),
        text: "Beta.3 is on TestFlight. Can you try the new store picker on your phone today?"
      }
    ],
    "mo-chat-standup": [
      {
        from: "rizal",
        at: minutesAgo(200),
        text: "Summarize today's standup: Budi fixed the Android crash, Arif is on rewards v2, Tari starts regression Thursday."
      },
      {
        from: "airene",
        at: minutesAgo(199),
        text: "Standup today: the Android 12 crash is fixed (Budi), rewards API v2 is in progress (Arif), and regression starts Thursday (Tari). No blockers raised."
      },
      { from: "rizal", at: minutesAgo(196), text: "Anything I should follow up on?" },
      {
        from: "airene",
        at: minutesAgo(195),
        text: "Two things: Tari needs a regression plan by Wednesday, and the App Store screenshots are waiting for your approval."
      }
    ],
    "mo-chat-teardown": [
      {
        from: "rizal",
        at: dayAt(9, "11:00"),
        text: "What do competitor apps do for pickup times?"
      },
      {
        from: "airene",
        at: dayAt(9, "11:01"),
        text: "Most default to ASAP and show live prep time. Two of the five let you schedule up to 7 days ahead. None ask for a time before showing the cart."
      },
      { from: "rizal", at: dayAt(9, "11:05"), text: "Which one handles loyalty best?" },
      {
        from: "airene",
        at: dayAt(9, "11:06"),
        text: "The strongest one shows the points next to each drink on the menu, so people see what they'll earn before they pay. Worth trying in rewards v2."
      }
    ],
    "mo-chat-empty-states": [
      {
        from: "rizal",
        at: dayAt(3, "14:02"),
        text: "What should the rewards screen show when someone has 0 points?"
      },
      {
        from: "design-agent",
        at: dayAt(3, "14:03"),
        text: 'Show what 0 means in real terms: "Earn 10 points with every drink. 100 points gets you a free one." Add an Order button and skip the illustration so the screen stays light.'
      },
      {
        from: "rizal",
        at: dayAt(3, "14:06"),
        text: "And when someone has points but can't redeem anything yet?"
      },
      {
        from: "design-agent",
        at: dayAt(3, "14:07"),
        text: 'Show progress instead of a lock: "40 points to a free drink" with a bar. People order more when the goal is visible.'
      }
    ],
    "mo-chat-store-picker": [
      { from: "rizal", at: dayAt(6, "10:30"), text: "Map or list for the store picker?" },
      {
        from: "design-agent",
        at: dayAt(6, "10:31"),
        text: "List first, with the map as a toggle. 80% of orders go to the last or nearest store, so a sorted list gets people there in one tap."
      },
      { from: "rizal", at: dayAt(6, "10:34"), text: "What should each row in the list show?" },
      {
        from: "design-agent",
        at: dayAt(6, "10:35"),
        text: "Name, distance, live prep time and whether it's open. Keep the address for the detail view; people rarely choose by it."
      }
    ],
    "mo-chat-onboarding-copy": [
      {
        from: "rizal",
        at: dayAt(12, "09:15"),
        text: "Can you review our onboarding copy? Three screens, about 40 words each."
      },
      {
        from: "design-agent",
        at: dayAt(12, "09:16"),
        text: "The second screen repeats the first. Merge them and lead with the free drink offer on screen one."
      },
      {
        from: "rizal",
        at: dayAt(12, "09:20"),
        text: "Write the headline for the new first screen."
      },
      {
        from: "design-agent",
        at: dayAt(12, "09:21"),
        text: '"Your first drink is on us." It says why to sign up before asking for anything.'
      }
    ],
    "mo-chat-payment-retry": [
      {
        from: "rizal",
        at: dayAt(2, "15:40"),
        text: "How should payment retries work when the network drops?"
      },
      {
        from: "dev-agent",
        at: dayAt(2, "15:41"),
        text: "Use one idempotency key per order and retry up to 3 times with backoff (1s, 3s, 9s). After that, keep the order pending and let the person retry from the cart."
      },
      { from: "rizal", at: dayAt(2, "15:45"), text: "What does the person see while we retry?" },
      {
        from: "dev-agent",
        at: dayAt(2, "15:46"),
        text: 'Keep the pay button loading with "Confirming payment…". After the third try, say "We couldn\'t confirm your payment. You haven\'t been charged." and offer Retry.'
      }
    ],
    "mo-chat-flaky-login": [
      {
        from: "rizal",
        at: dayAt(4, "16:20"),
        text: "The login test fails about 1 run in 10. Any ideas?"
      },
      {
        from: "qa-agent",
        at: dayAt(4, "16:21"),
        text: "It waits on a fixed 2-second timer for the OTP screen. Wait for the screen element instead, and stub the OTP service in CI."
      },
      { from: "rizal", at: dayAt(4, "16:25"), text: "How long should the wait be?" },
      {
        from: "qa-agent",
        at: dayAt(4, "16:26"),
        text: "Up to 10 seconds, checking every 200 ms. It passes as soon as the screen shows, so fast runs stay fast."
      }
    ]
  },

  unread: {
    "mo-product-design": 1,
    "mo-mobile-dev": 2,
    "mo-qa-release": 1,
    "mo-dm-sari": 1,
    "mo-dm-budi": 1
  },

  files: [
    {
      id: "file-mo-1",
      workspaceId: WORKSPACE_ID,
      name: "Checkout v2 wireframes.fig",
      type: "design",
      size: "18.4 MB",
      threadId: "mo-product-design",
      uploadedBy: "dewi",
      uploadedAt: dayAt(2, "15:20")
    },
    {
      id: "file-mo-2",
      workspaceId: WORKSPACE_ID,
      name: "App Store screenshots.zip",
      type: "zip",
      size: "42 MB",
      threadId: "mo-general",
      uploadedBy: "dewi",
      uploadedAt: dayAt(1, "11:40")
    },
    {
      id: "file-mo-3",
      workspaceId: WORKSPACE_ID,
      name: "Sprint 4 board.pdf",
      type: "pdf",
      size: "1.2 MB",
      threadId: "mo-general",
      uploadedBy: "sari",
      uploadedAt: dayAt(2, "09:02")
    },
    {
      id: "file-mo-4",
      workspaceId: WORKSPACE_ID,
      name: "Beta.3 release notes.pdf",
      type: "pdf",
      size: "320 KB",
      threadId: "mo-qa-release",
      uploadedBy: "tari",
      uploadedAt: dayAt(1, "11:02")
    }
  ],

  todos: [
    {
      id: "todo-mo-1",
      workspaceId: WORKSPACE_ID,
      title: "Review the checkout flow spec",
      done: false,
      assigneeId: "rizal",
      createdBy: { kind: "person", id: "sari" },
      source: { threadId: "mo-product-design" },
      due: daysFromNow(3),
      createdAt: minutesAgo(95)
    },
    {
      id: "todo-mo-2",
      workspaceId: WORKSPACE_ID,
      title: "Try the new store picker on TestFlight",
      done: false,
      assigneeId: "rizal",
      createdBy: { kind: "person", id: "budi" },
      source: { threadId: "mo-dm-budi" },
      due: daysFromNow(0),
      createdAt: minutesAgo(120)
    },
    {
      id: "todo-mo-3",
      workspaceId: WORKSPACE_ID,
      title: "Approve App Store screenshots",
      done: false,
      assigneeId: "rizal",
      createdBy: { kind: "person", id: "sari" },
      source: { threadId: "mo-general" },
      due: daysFromNow(5),
      createdAt: dayAt(1, "11:45")
    },
    {
      id: "todo-mo-4",
      workspaceId: WORKSPACE_ID,
      title: "Update the sprint 4 board",
      done: false,
      assigneeId: "sari",
      createdBy: { kind: "agent", id: "airene" },
      source: { threadId: "mo-general" },
      createdAt: dayAt(1, "16:31")
    },
    {
      id: "todo-mo-5",
      workspaceId: WORKSPACE_ID,
      title: "Fix the null loyalty balance",
      done: true,
      doneBy: "arif",
      doneAt: minutesAgo(25),
      assigneeId: "arif",
      createdBy: { kind: "person", id: "budi" },
      source: { threadId: "mo-mobile-dev" },
      createdAt: dayAt(1, "09:22")
    }
  ],

  activity: [
    {
      id: "act-mo-1",
      workspaceId: WORKSPACE_ID,
      kind: "mention",
      actor: { kind: "person", id: "sari" },
      text: "mentioned you",
      excerpt:
        "Can you review the spec before Friday? I'd like to lock it at the steering meeting.",
      threadId: "mo-product-design",
      createdAt: minutesAgo(95),
      read: false
    },
    {
      id: "act-mo-2",
      workspaceId: WORKSPACE_ID,
      kind: "todo",
      actor: { kind: "person", id: "budi" },
      text: "assigned you a todo",
      excerpt: "Try the new store picker on TestFlight",
      threadId: "mo-dm-budi",
      createdAt: minutesAgo(120),
      read: false
    },
    {
      id: "act-mo-3",
      workspaceId: WORKSPACE_ID,
      kind: "output",
      actor: { kind: "agent", id: "dev-agent" },
      text: "finished an output",
      excerpt: "Rewards API contract · v1",
      threadId: "mo-mobile-dev",
      outputId: outputId("mo-mobile-dev", "rewards-api-contract"),
      createdAt: dayAt(1, "09:41"),
      read: false
    },
    {
      id: "act-mo-4",
      workspaceId: WORKSPACE_ID,
      kind: "output",
      actor: { kind: "agent", id: "design-agent" },
      text: "finished an output",
      excerpt: "Checkout flow spec · v1",
      threadId: "mo-product-design",
      outputId: outputId("mo-product-design", "checkout-flow-spec"),
      createdAt: dayAt(1, "10:17"),
      read: true
    },
    {
      id: "act-mo-5",
      workspaceId: WORKSPACE_ID,
      kind: "invite",
      actor: { kind: "person", id: "sari" },
      text: "invited someone to the project",
      excerpt: "yoga.pratama@centralperk.co.id",
      createdAt: dayAt(2, "10:00"),
      read: true
    }
  ]
};
