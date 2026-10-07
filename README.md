# Multiplayer

Multiplayer is a prototype of one shared space where a company's people and AI agents work together. Built with Nuxt 4 and the Pixel 3 design system.

- **One space, no projects.** Everyone at the company works in the same place. There are no direct messages between people: you talk to agents, alone or in groups.
- **Chats** (first item in the rail) has two sections that collapse: **Agents** and **Groups**. The **+** at the top starts a chat with an agent or creates a group, where you pick the people and agents to add (you and Airene are always in). Hover a group and click the pin that replaces its emoji to pin it to a **Pinned** section.
- **Agents**: Airene, the general assistant, is always first; the agents you've chatted with follow. Clicking an agent opens its page, like Airene's: your chats with it on the left (Recent, This week, Older; a green dot means a reply you haven't read) and the chat on the right. **New chat** starts another one, listed as "New chat" until you send. A new chat greets you with the agent's 3D icon, brought to life: Airene hovers above her shadow, pops up and twirls round (as in Mekari Airene), dances and blinks while her sparkle twinkles; the other agents breathe, hop with a twist, lean and look left and right, blink and wiggle. Chats with agents are private to you. Outputs made there stay out of the Library until you click **Share** and pick a group: it opens with the output quoted in the message box, so you can add a note before you send it.
- **Agents consult agents.** An agent can bring others in: it says "Let me check with …", their answers show in full under "Messages from …", and then it replies with what it learned. In a chat with an agent, @mention another agent to have it consulted. Try "plan launch week" with Airene: she checks with Copywriter, Social media planner and Campaign analyst before writing the plan.
- **Groups** are workstreams where people and agents work together, each with an emoji instead of Slack's "#". Airene is in every group, and you can add more agents. Agents in a group reply when you @mention them. Messages are bubbles in three colours: yours (light green) on the right, people's (grey) and agents' (Pixel's light AI violet) on the left. Name each group for the campaign it's part of (Holiday Blend copy, Ramadan 2027 planning), as groups from different projects share one list. Replies are scripted; some agents ask a question with options before they write (Holiday Blend ads has one waiting for an answer).
- **Agents** in the rail is a grid of every agent, each with a **Message** button; filter by the ones you chat with, or search. **Create agent** is a placeholder for now. An agent's profile has Overview, Knowledge, Skills, Connections, Visibility and Usage tabs (the cost chart is mock data).
- **Outputs** show up as cards in the chat and open in a read-only, versioned preview next to it. Drag the preview's left edge to resize it (double-click resets). Ask again and you get v2.
- **Library** lists the outputs and files in your groups in Pixel's enterprise data table, with tabs for all, outputs and files, a Type filter and search. Files you attach with the paperclip in the message box show on the message and land in the Library too (the prototype keeps their name, type and size; PDFs and images can also be previewed until you reload). **Activity** and **Todos** work too but are hidden from the rail for now (open `/w/central-perk/activity` or `/w/central-perk/todos`); unread messages show as a badge on **Chats** instead.
- **Search** sits in the header, as in Pixel's enterprise layout: click it or press ⌘K (Ctrl+K) to jump to a group, an agent, one of your chats or a Library item. Arrow keys move through the results and Enter opens one. Your profile at the top right has an online or offline dot; switch it from the profile menu.

The mock data is the marketing team of PT Central Perk Indonesia, a coffee chain, launching the limited Holiday Blend. You are Rizal Candra, Head of Marketing:

- **Groups**, named for the campaign they belong to, since groups from different projects share one list: 🚀 Holiday Blend launch, 🎨 Holiday Blend visuals, ✍️ Holiday Blend copy, 📸 Holiday Blend social, 📈 Holiday Blend ads, 💌 Rewards member emails, 🌙 Ramadan 2027 planning (a second campaign), and 🏪 Holiday Blend pop-ups (not joined; find it with search)
- **Your agent chats:** Airene (Plan launch week, Kickoff open questions), Copywriter (Cup sleeve copy, Which teaser caption did best?), Campaign analyst (Engagement benchmarks), Market researcher (Competitor holiday plans)
- **Agents:** Airene, Copywriter, Design agent, Social media planner, Campaign analyst, Media buyer, Influencer scout, CRM marketer, Market researcher and Community manager

There is no backend. Everything you do lives in memory, and reloading the page resets it.

## Stack

- **Framework**: Nuxt 4, Vue 3, TypeScript
- **Design system**: `@mekari/pixel3` (token mode 2.4, Enterprise theme)
- **Deployment**: Cloudflare Pages

## Prerequisites

- Node.js v22+
- pnpm v9+

## Getting Started

### 1. Clone

```bash
git clone https://github.com/bulanfp/multiplayer.git
cd multiplayer
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Run dev server

```bash
pnpm dev
```

Opens at `http://localhost:3000`.

> Pixel builds its styles in a PostCSS step. `nuxt.config.ts` has a small Vite plugin that reloads Pixel's stylesheet whenever a file is added under `app/`, so new components get their styles without restarting `pnpm dev`. If styles ever look stale, restart the dev server and hard-reload the page.

## Scripts

| Command         | Description                      |
| --------------- | -------------------------------- |
| `pnpm dev`      | Start dev server                 |
| `pnpm build`    | Build for production             |
| `pnpm generate` | Generate static site             |
| `pnpm preview`  | Preview production build locally |
| `pnpm lint`     | Lint with ESLint                 |
| `pnpm lint:fix` | Auto-fix lint issues             |
| `pnpm format`   | Format with Prettier             |

## Try it

1. Open the app. It lands on Airene's page, with a new chat ready.
2. Open **Plan launch week** in Airene's list: Airene checked with three agents, and their answers sit under "Messages from …" before her plan. Click the plan to see it in the preview.
3. Back on **New chat**, type "Plan launch week day by day" and press Enter. The chat is saved and titled from what you wrote; Airene says who she's checking with, each agent answers, and then she writes the plan.
4. Open **Copywriter** in the sidebar and start a new chat: ask for shorter taglines and @mention `@Media buyer`. Copywriter checks with Media buyer first, then answers.
5. Open the 📈 **Holiday Blend ads** group: Campaign analyst asked Media buyer why costs jumped. Pick an option in the last message and Campaign analyst writes the breakdown. Your own messages in groups show on the right (see 🚀 Holiday Blend launch).
6. In the Copywriter chat **Cup sleeve copy**, click **Share** under v3 and pick a group: it opens with the copy quoted in the message box. Send it, and it's listed in the **Library**.
7. Click **+** at the top of Chats and pick **Create group**: Airene is already ticked and can't be taken out.

Each agent produces its output when the message contains one of these words. Anything else gets the agent's default output, except Airene: she says what she can do. Airene also catches you up ("catch me up", "what's new") and finds files ("find", "where is").

| Agent                | Output                       | Keywords                                              | Checks with first                                  |
| -------------------- | ---------------------------- | ----------------------------------------------------- | -------------------------------------------------- |
| Airene               | Launch week plan             | launch week, plan the launch, launch plan, day by day | Copywriter, Social media planner, Campaign analyst |
| Airene               | Holiday Blend campaign brief | brief, summary, summarize, kickoff                    |                                                    |
| Copywriter           | Cup sleeve copy              | sleeve, cup                                           |                                                    |
| Copywriter           | Holiday Blend taglines       | tagline, copy, headline, shorter, slogan, caption     |                                                    |
| Copywriter           | (a reply)                    | did best, worked best, performed, which caption       | Campaign analyst                                   |
| Design agent         | Poster moodboard directions  | poster, moodboard, visual, direction, layout          |                                                    |
| Social media planner | November content calendar    | calendar, content, instagram, tiktok, post, schedule  |                                                    |
| Social media planner | November content calendar    | creator, kol, influencer                              | Influencer scout                                   |
| Campaign analyst     | Teaser week 1 report         | report, numbers, performance, results, week, channel  |                                                    |
| Campaign analyst     | (a reply)                    | cpm, cost per, expensive, jumped, why                 | Media buyer                                        |
| Media buyer          | Launch month paid plan       | plan, budget, split, spend, ads                       |                                                    |
| Influencer scout     | Creator shortlist            | creator, kol, influencer, shortlist                   |                                                    |
| CRM marketer         | Rewards early-access email   | email, push, member, rewards                          |                                                    |
| Market researcher    | Competitor holiday scan      | competitor, competition, other chains, holiday, trend |                                                    |
| Community manager    | Comment reply drafts         | comment, reply, dm, question                          |                                                    |

"Thanks" or "great job" gets a short reply without an output.

## Project structure

```
app/
├── layouts/default.vue              # Header, icon rail, Chats submenu, page area
├── middleware/workspace.global.ts   # Unknown workspace → /
├── pages/
│   ├── index.vue                    # Redirects to Airene's chats
│   ├── w/[workspaceId]/
│   │   ├── chat/[agentId]/[[chatId]].vue # An agent's chats: list, a chat or a new one, Share
│   │   ├── c/[conversationId].vue   # A group: thread, preview, members
│   │   ├── activity.vue             # Mentions, outputs, todos (hidden from the rail)
│   │   ├── library.vue              # Outputs and files; filters, search, and a preview panel
│   │   ├── todos.vue                # Assigned to me / All, Done (hidden from the rail)
│   │   └── agents/                  # Agents grid and agent detail (tabs)
│   └── [...slug].vue                # Placeholder for pages without a design yet (e.g. settings)
├── components/
│   ├── layout/                      # Shell: AppHeader (search, profile), AppRail, HomePanel (Agents and Groups), PageHeader, …
│   ├── agent-chat/                  # An agent's chat list, the chat view, its messages, Share
│   ├── thread/                      # Group ThreadView, MessageComposer (@mentions), OutputCard, OutputCanvas, ConsultLabel, members
│   ├── workspace/                   # Modals: create group, chat with an agent
│   ├── pages/                       # Rows and cards for Activity, Todos and Agents
│   ├── table/                       # EnterpriseTable, from Pixel's enterprise data table block
│   ├── chat/                        # Search input
│   └── shared/                      # MemberAvatar (people and agents), AgentMascot (an agent's icon that moves)
├── composables/                     # In-memory stores (workspace, chat, activity, todos, your status) and the current workspace
├── data/
│   ├── central-perk.ts              # All mock content: groups, agent chats, files, todos
│   ├── seed-helpers.ts              # Helpers for writing it: channel(), agentChat(), thread entries
│   ├── agent-scripts.ts             # Keywords → which output an agent produces, and who it consults
│   ├── output-templates.ts          # Output content, one entry per version
│   ├── people.ts, agents.ts         # Directory; the current user is `rizal`
│   └── seed.ts                      # Turns the mock content into the initial state
└── utils/                           # Mentions, reply picking, consult groups, formatting, paths
public/images/agents/                # Agent icons: design's HD 3D set at 256px; spares for custom agents
public/images/agents/parts/          # Each icon split into body, eyes and any loose part (Airene's sparkle), for AgentMascot
public/images/avatars/               # People avatars (memoji); unused ones are spares
scripts/split-agent-eyes.py          # Makes images/agents/parts/ and app/data/agent-mascots.ts
```

## Editing the mock content

- **Groups, agent chats, files, todos and activity** live in `app/data/central-perk.ts`. Times are relative (`dayAt(1, "09:30")`, `minutesAgo(20)`, `daysFromNow(3)`), so the mock always looks recent. A thread entry with `consultedBy` is an agent answering another agent's question.
- **Agent replies:** keywords go in `app/data/agent-scripts.ts`, the output content in `app/data/output-templates.ts`. In a reply, `{sender}` becomes an @mention of whoever asked and `{title}` the output title. A version can list `todos`; they're added when the agent posts that version. An intent's `consult` lists the agents it checks with first, and what each one says.
- **A new agent:** add it to `app/data/agents.ts`, to the workspace's `agentIds` in `app/data/central-perk.ts`, and give it a script in `app/data/agent-scripts.ts`. Agents without an `icon` get an initials avatar.
- **A new or changed agent icon:** run `python3 scripts/split-agent-eyes.py` (needs Pillow: `pip install pillow`). It paints over the icon's eyes to make a body, saves the eyes (and any loose part, like Airene's sparkle) as their own layers and records where they sit, so the agent's mascot can move on a new chat's greeting. An icon that hasn't been split shows there as a still picture.
- **People avatars:** set `avatar` in `app/data/people.ts` to one of `public/images/avatars/avatar-01.webp` … `avatar-17.webp`.

## Not in the prototype yet

- A backend: all state resets on reload.
- Real agent responses: replies are matched by keyword, and consults are scripted.
- Inviting people to the company, and permissions: everyone can create groups and add people and agents.
- Renaming or deleting agent chats.
- Final agent icons: the current ones are cut from a screenshot, and three are recoloured copies. Run `scripts/split-agent-eyes.py` again when they land.

## Deployment

Deploy via Cloudflare Pages (git-connected). Push to `main` triggers auto-deploy.
