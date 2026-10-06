# Project: Multiplayer

Nuxt 4 SPA built with the Pixel 3 design system.

## Stack

- **Framework**: Nuxt 4, Vue 3, TypeScript
- **Design system**: `@mekari/pixel3` (token 2.4, Enterprise theme via `setProductTheme("enterprise")` in `app/app.vue`)
- **Deployment**: Cloudflare Pages

## Pixel 3

**MANDATORY**: Before writing or editing any component, always call the Pixel skill & MCP first. Never guess props, tokens, or patterns.

## Architecture

Multiplayer (product name; earlier drafts called it Envoy): project workspaces where people and AI agents share groups, DMs and outputs. See `README.md` for the product overview, mock data and demo script.

- **Routes** live under `/w/[workspaceId]` (`c/[conversationId]`, `groups`, `activity`, `library`, `todos`, `agents`, `agents/[agentId]`). `/` and `/w/[workspaceId]` redirect to the project's #general. Activity and Todos are hidden from the rail (`RAIL_ITEMS` in `app/data/navigation.ts`) but their pages still work; the Chats badge counts unread messages (`chatUnreadCount`).
- **Shell:** dark header and icon rail, then a rounded light canvas with an 8px dark gutter on the right and bottom. Chats (the `home` section in code) and Agents add a fixed 256px submenu; there is no collapse. Sidebar sections collapse via `SidebarSection` (state in `useSidebarSections`).
- **State** is module-level `reactive` stores in `app/composables/use*Store.ts` (workspace, chat, activity, todos), seeded from `app/data/seed.ts`. The app is a client-only SPA (`ssr: false`), so singletons are safe and agent-reply timers can write to state without a component. No Pinia. A reload resets everything.
- **Mock content** is in `app/data/projects/*.ts`; agent keywords in `app/data/agent-scripts.ts`; output content and versions in `app/data/output-templates.ts`. Use the relative time helpers in `app/data/time.ts`.
- **Groups:** the UI says "group", but the code still calls them channels (`kind: "channel"`, `channelsIn`, `CreateChannelModal`). Groups have a human name, an emoji and a URL slug; there is no "#".
- **Messages** are rendered as text and mention segments (`app/utils/mentions.ts`). Never use `v-html`.

## Conventions

- Components are registered by filename only (`pathPrefix: false`), so every `.vue` filename must be unique. Import Pixel components from `@mekari/pixel3` and app files from `~/...` explicitly.
- `css()` takes static values only. Express variants with `data-*` attributes (`"&[data-active]": {...}`); put keyframes in `<style scoped>`.
- Pixel's PostCSS step only re-runs when a file Vite already watches changes. The `pixelCssOnNewFiles` plugin in `nuxt.config.ts` reloads Pixel's stylesheet when a file is added under `app/`; keep it.
- Motion stays subtle: unhurried (about 0.5–0.6s with an even ease in and out) and never a zoom. Side panels slide in from the right like a drawer (0.6s in, 0.5s out) while the conversation narrows alongside. The rail has no hover micro-interaction beyond its background wash. Always add a `_motionReduce` / `prefers-reduced-motion` fallback (see `SidePanelTransition`, the sidebar row fold).
- Run `pnpm lint` and `pnpm format:check` before handing off.

## Testing in a background browser tab

Pixel modals and popovers animate with animejs, which pauses while `document.hidden` is true. In a hidden or background tab a modal can look stuck open after it closed. That's the test environment, not an app bug.
