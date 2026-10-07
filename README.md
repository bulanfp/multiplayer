# Multiplayer

Prototype built with Nuxt 4 and the Pixel 3 design system. There is no backend: everything lives in memory and resets on reload.

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

## Project structure

```
app/
├── layouts/default.vue              # Header, icon rail, Chats submenu, page area
├── middleware/workspace.global.ts   # Unknown workspace → /
├── pages/
│   ├── index.vue                    # Redirects to Airene's chats
│   ├── w/[workspaceId]/
│   │   ├── chat/[agentId]/[[chatId]].vue # An agent's chats: list, a chat or a new one, Share
│   │   ├── c/[conversationId].vue   # A group: thread, preview, members, rename
│   │   ├── c/new.vue                # A group from New chat, saved on the first message
│   │   ├── activity.vue             # Mentions, outputs, todos (hidden from the rail)
│   │   ├── library.vue              # Outputs and files; filters, search, and a preview panel
│   │   ├── todos.vue                # Assigned to me / All, Done (hidden from the rail)
│   │   └── agents/                  # Agents grid and agent detail (tabs)
│   └── [...slug].vue                # Placeholder for pages without a design yet (e.g. settings)
├── components/
│   ├── layout/                      # Shell: AppHeader (search, profile), AppRail, HomePanel (Agents and Groups), PageHeader, …
│   ├── agent-chat/                  # An agent's chat list, the chat view, its messages, Share
│   ├── thread/                      # Group ThreadView, MessageComposer (@mentions), OutputCard, OutputCanvas, ConsultLabel, members
│   ├── workspace/                   # New chat picker and the Create a group modal
│   ├── pages/                       # Rows and cards for Activity, Todos and Agents
│   ├── table/                       # EnterpriseTable, from Pixel's enterprise data table block
│   ├── chat/                        # Search input
│   └── shared/                      # MemberAvatar (people and agents), GroupFaces (an unnamed group's icon), AgentMascot (an agent's icon that moves)
├── composables/                     # In-memory stores (workspace, chat, activity, todos, your status) and the current workspace
├── data/
│   ├── central-perk.ts              # All mock content: groups, agent chats, files, todos
│   ├── seed-helpers.ts              # Helpers for writing it: channel(), unnamedGroup(), agentChat(), thread entries
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

## Deployment

Deploy via Cloudflare Pages (git-connected). Push to `main` triggers auto-deploy.
