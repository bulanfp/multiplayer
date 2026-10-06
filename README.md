# Multiplayer

Multiplayer is a prototype of project workspaces where people and AI agents work in the same conversations. Built with Nuxt 4 and the Pixel 3 design system.

- **Workspace = project.** Invite-only; hover or click the icon at the top of the rail to switch projects (the red number next to a project is its unread messages). A project's icon is its initials or an emoji (Holiday Blend uses 🚀; pick one when you create a project).
- **Chats** (first item in the rail) lists **Groups** and **Direct messages**; both sections collapse. Groups are workstreams any project member can join, each with an emoji instead of Slack's "#" (browse them with the search icon next to Groups). Direct messages hold your chats with people and with agents.
- **Agents** reply only when you @mention them (in a 1:1 agent chat, every message goes to the agent). Replies are scripted. Some agents ask a question with options before they write (try QA agent; Holiday Blend's Performance group has one waiting for an answer). **Create agent** makes your own; it joins the shared catalog.
- **Outputs** show up as cards in the chat and open in a read-only, versioned preview next to it. Drag the preview's left edge to resize it (double-click resets). Ask again and you get v2.
- **Library** is a working mock page. **Activity** and **Todos** work too but are hidden from the rail for now (open `/w/<project>/activity` or `/w/<project>/todos`); unread messages show as a badge on **Chats** instead.

The mock data is two projects for PT Central Perk Indonesia, a coffee chain. You are Rizal Candra, Head of Digital:

- **Mobile ordering app 2.0** (tech): 📣 General, 🎨 Product design, 📱 Mobile dev, 🛠️ Backend API (not joined yet), 🧪 QA and release
- **Holiday Blend launch** (marketing): 📣 General, 🎨 Creative, ✍️ Copywriting, 📸 Social media, 📈 Performance, 🏪 Store events (not joined yet)

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

1. Open the app. It lands on General in Mobile ordering app 2.0.
2. Go to QA and release, type `@QA`, press Enter to pick QA agent, then ask for a regression plan and press Enter. Instead of writing straight away, QA agent asks which devices to cover and offers three options. Pick one: your choice posts as your reply, and QA agent writes the "Regression test plan". Click it to see it in the preview, then ask again to get v2.
3. Open **Library** in the rail: the new output is listed, and its preview opens next to the table.
4. Click the project icon (MO) at the top of the rail and switch to Holiday Blend launch. In Copywriting, ask `@Copywriter` for taglines.
5. Open **Agents** and pick an agent for a 1:1 chat. No @ needed there.
6. Click **Create agent**, give it a name, an icon and what it does. It opens in a 1:1 chat, and you can add it to a group from the member list (click the faces in the group's header).

Each agent produces its output when the message contains one of these words. Anything else gets the same output as a default.

| Project              | Agent                | Output                       | Keywords                                             |
| -------------------- | -------------------- | ---------------------------- | ---------------------------------------------------- |
| Mobile ordering app  | Airene               | Sprint 3 summary             | summary, summarize, sprint, recap                    |
| Mobile ordering app  | Design agent         | Checkout flow spec           | checkout, pickup, flow, spec, ux                     |
| Mobile ordering app  | Dev agent            | Rewards API contract         | api, contract, endpoint, rewards, backend            |
| Mobile ordering app  | QA agent             | Regression test plan         | test, regression, qa, release, checklist, plan       |
| Holiday Blend launch | Airene               | Holiday Blend campaign brief | brief, summary, summarize, kickoff                   |
| Holiday Blend launch | Copywriter           | Holiday Blend taglines       | tagline, copy, headline, shorter, slogan             |
| Holiday Blend launch | Design agent         | Poster moodboard directions  | poster, moodboard, visual, direction, layout         |
| Holiday Blend launch | Social media planner | November content calendar    | calendar, content, instagram, tiktok, post, schedule |
| Holiday Blend launch | Campaign analyst     | Teaser week 1 report         | report, numbers, performance, results, week, channel |

"Thanks" or "great job" gets a short reply without an output.

## Project structure

```
app/
├── layouts/default.vue              # Header, icon rail, submenu (Chats, Agents), page area
├── middleware/workspace.global.ts   # Unknown project → /, remembers the last project
├── pages/
│   ├── index.vue                    # Redirects to the last project's General group
│   ├── w/[workspaceId]/
│   │   ├── c/[conversationId].vue   # Group, DM or agent chat: thread, output preview, members
│   │   ├── groups.vue               # Browse and join groups
│   │   ├── activity.vue             # Mentions, outputs, todos, invites
│   │   ├── library.vue              # Outputs and files; outputs open in the canvas
│   │   ├── todos.vue                # Assigned to me / All, Done (hidden from the rail)
│   │   └── agents/                  # Agent catalog and 1:1 agent chat
│   └── [...slug].vue                # Placeholder for pages without a design yet (e.g. settings)
├── components/
│   ├── layout/                      # Shell: AppRail, ProjectSwitcher, ProjectInfoMenu, HomePanel, AgentsPanel, PageHeader, …
│   ├── thread/                      # ThreadView, MessageComposer (@mentions), OutputCard, OutputCanvas, members
│   ├── workspace/                   # Modals: create group, create agent, new message, invite people, create project
│   ├── pages/                       # Rows and modals for Activity, Todos and Agents
│   ├── chat/                        # Agent chat history, search input
│   └── shared/MemberAvatar.vue      # People and agents
├── composables/                     # In-memory stores (workspace, chat, activity, todos) and current project
├── data/
│   ├── projects/                    # All mock content, one file per project
│   ├── agent-scripts.ts             # Keywords → which output an agent produces
│   ├── output-templates.ts          # Output content, one entry per version
│   ├── people.ts, agents.ts         # Directory; the current user is `rizal`
│   └── seed.ts                      # Combines the projects into the initial state
└── utils/                           # Mentions, reply picking, formatting, paths
public/images/agents/                # Agent icons (temporary; replace with Figma exports)
public/images/avatars/               # People avatars (memoji); unused ones are spares
```

## Editing the mock content

- **Conversations, files, todos and activity** live in `app/data/projects/<project>.ts`. Times are relative (`dayAt(1, "09:30")`, `minutesAgo(20)`, `daysFromNow(3)`), so the mock always looks recent.
- **Agent replies:** keywords go in `app/data/agent-scripts.ts`, the output content in `app/data/output-templates.ts`. In a reply, `{sender}` becomes an @mention of whoever asked and `{title}` the output title. A version can list `todos`; they're added when the agent posts that version.
- **A new agent:** add it to `app/data/agents.ts` and to a project's `agentIds`. Agents without an `icon` get an initials avatar.
- **People avatars:** set `avatar` in `app/data/people.ts` to one of `public/images/avatars/avatar-01.webp` … `avatar-17.webp`.

## Not in the prototype yet

- A backend: all state resets on reload.
- Real agent responses: replies are matched by keyword.
- Permissions: everyone can create groups and agents, add agents and invite people.
- Project settings (placeholder page).
- Final agent icons: the current ones are cut from a screenshot, and three are recoloured copies.

## Deployment

Deploy via Cloudflare Pages (git-connected). Push to `main` triggers auto-deploy.
