---
name: pixel
description: Build Mekari Pixel 3 UI in Vue 3/Nuxt from Figma or text. Use when implementing components, validating props, applying design tokens, or checking token mode (2.1 vs 2.4).
license: Proprietary
compatibility: Requires a Vue 3/Nuxt project with @mekari/pixel3 installed.
metadata:
  author: ahmad.zakiy@mekari.com
  version: "2026.6.8"
  source: https://ai.mekari.design/skills/pixel
---

# Pixel Design System

Build Pixel 3 UI with a low-noise workflow: verify setup, map the UI, validate props, apply token-safe styling, and ship runnable Vue/Nuxt code.

## Golden Rules

1. Import UI from `@mekari/pixel3`.
2. Use Pixel primitives before raw HTML equivalents.
3. Wrap validated fields in `MpFormControl`.
4. Verify component's props with Pixel MCP `get-component` before guessing.
5. Verify icon name with Pixel MCP `get-icon-name` before guessing.
6. Use CSS Props for `MpFlex`, `MpScrollbar`, `MpSkeleton`, and `Pixel.*`, use `css()` only when CSS Props are unavailable.
7. Prefer design tokens over raw color, spacing, or typography values.
8. Preserve the project's active token mode instead of mixing 2.1 and 2.4 ad hoc.

## Examples

### Text request → Component output

**Input:** "Create a form with email and password fields and a submit button"
**Expected:** MpFormControl wrapping MpInput components, MpButton with variant="primary", proper imports from @mekari/pixel3, tokens used for spacing.

### Figma → Code

**Input:** Figma node of a data table with pagination
**Expected:** Get node ID → call get_design_context → map to MpTable + MpPagination → validate props via get-component → output runnable SFC.

## When this loads

This skill can be invoked directly by a user, or loaded as a sub-skill by `implement-to-pixel` at the code generation step. When loaded by `implement-to-pixel`, the request analysis and pattern identification are already done — skip step 2 and start from step 3 using the plan passed from the orchestrator.

## Workflow

### 1. Verify Setup

Read [references/setup.md](references/setup.md) if package setup, plugin registration, or token mode is unclear.

### 2. Analyze the Request

- For Figma work: extract the node ID, then use Figma MCP `get_design_context` and `get_screenshot`.
- For text requests: break the UI into sections, states, interactions, and responsive behavior.
- Produce a short component plan before coding.
- **If loaded by `implement-to-pixel`**: skip this step — the plan is already provided. Proceed directly to step 3.

### 3. Map UI to Pixel Components

Read [references/components.md](references/components.md), then validate any uncertain component with Pixel MCP `get-component`.

### 4. Apply Styling Safely

- Read [references/design-tokens.md](references/design-tokens.md) when choosing color, spacing, or typography.
- Read [references/styling.md](references/styling.md) when deciding between CSS Props and `css()`.

### 5. Produce Final Code

Read [references/code-structure.md](references/code-structure.md) before writing the final Vue/Nuxt component.

## MCP Usage

### Pixel MCP

- `get-docs` - Pixel setup, enable theme, design tokens, and implementation guides
- `get-component` - Component props, slots, events, and usage examples
- `get-icon-name` - Valid icon names for MpIcon
- `get-block` - Reusable page sections (data tables, sidebars, inbox lists) — copy into an existing project
- `get-template` - Full runnable project starters with layout, routing, state, and i18n wired up

Available prompts:

- `implement-figma-to-pixel` - Generate an implementation guide for converting Figma designs to Pixel 3 components
- `create-design-to-pixel` - Generate Vue component code from a natural-language UI description

Use `get-docs` first when setup or token mode is unclear, then `get-component` for component APIs, `get-block` when adding a UI section to an existing project, and `get-template` when scaffolding a new project from scratch.

### Figma MCP

- `get_design_context` for structure, assets, and code hints
- `get_screenshot` for visual verification
- `get_metadata` only for large-node navigation

## Output Contract

Always produce:

1. Complete runnable Vue/Nuxt code
2. Required imports
3. Components used
4. Token and styling decisions
5. Assumptions, gaps, or unresolved API questions

## QA Checklist

- Setup and token mode confirmed or explicitly called out
- Props verified against Pixel docs where uncertainty existed
- Layout and spacing match the intended hierarchy
- Hover, disabled, error, and loading states handled where relevant
- No stray inline styles or unnecessary raw values

## Reference Loading Guide

- Read `setup.md` before coding if project readiness is uncertain.
- Read `components.md` when mapping UI or resolving prop issues.
- Read `design-tokens.md` when selecting tokens or spacing scale.
- Read `styling.md` when adding layout or custom visual rules.
- Read `code-structure.md` immediately before final code generation.

## Installation & Updates

This skill is managed by the `pixel-hub` CLI. To install or update:

```bash
# Install (from your project root)
npx @mekari/pixel-hub skills install --skill pixel --agent claude-code --yes

# Update to latest
npx @mekari/pixel-hub skills update --skill pixel --yes
```

The CLI writes files to `.agents/skills/pixel/` and symlinks `.claude/skills/pixel/` for Claude Code.
Lock file: `.pixel-hub/skill-lock.json` — commit this so teammates can restore with `skills install --yes`.
