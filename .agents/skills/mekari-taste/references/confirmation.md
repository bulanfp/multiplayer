# Confirmation

> **Pixel MCP validation gate** — Before generating code from this reference, validate every Pixel component via `get-component("<name>")` on the Pixel MCP.
>
> - **MCP is the source of truth for:** prop names, slot names, event names, and component availability.
> - **This file is the source of truth for:** which prop values to use, CSS overrides, layout placement, and known workarounds for Pixel bugs or product-level decisions.
> - If MCP shows a renamed prop or removed slot → trust MCP, update the plan accordingly.
> - If MCP behavior differs from a rule or code example in this file → follow this file; it encodes a Mekari product decision, not a stale reference.

Asking the user "are you sure?" before an action with consequences. Used for destructive, irreversible, or financially significant actions.

> **Note: this reference is a starting draft.** If you have specific confirmation patterns from existing Mekari products (Expense reject confirm, Talenta offboard confirm, Qontak archive confirm), enrich this file with the concrete copy and action labels. Treat the rules below as the minimum bar.

## When to use this pattern

Yes for:

- **Destructive**: delete, permanently archive, cancel a transaction, terminate an employee.
- **Irreversible**: submit a payroll batch, send out invoices, publish to customers.
- **Financially significant**: approve a payment ≥ threshold, top up balance, change subscription plan.
- **Affects other people**: reassign a deal, change role, remove access.

No (do not show a confirm) for:

- Standard form submissions with normal undo paths.
- Filter changes, sort changes, navigation.
- Anything the user can trivially undo from the same screen.

Friction is a tool. Use it precisely.

## Variants

| Stakes                                   | Variant                                 |
| ---------------------------------------- | --------------------------------------- |
| Moderate (most "Are you sure?")          | Modal dialog                            |
| Low (a small action, but reversible-ish) | Inline confirm in a dropdown or popover |
| Very high stakes                         | Type-to-confirm modal                   |
| Quick destructive in a list              | Undo toast (no upfront confirm)         |

## Variant A: Modal dialog (default)

```
┌─────────────────────────────────────────────┐
│  Reject this request?                  ×    │
│                                             │
│  This will return the request to the        │
│  employee with a note. They can revise      │
│  and resubmit.                              │
│                                             │
│                       [Cancel]  [Reject]    │
└─────────────────────────────────────────────┘
```

### Pixel component

Use `MpModal` from `@mekari/pixel3`. Never build a custom overlay or `<Teleport>` div.

```vue
<template>
  <MpModal :is-open="isOpen" size="md" @close="onClose">
    <MpModalContent :class="css({ marginTop: '80px' })">
      <MpModalHeader>
        Delete this team?
        <MpModalCloseButton />
      </MpModalHeader>
      <MpModalBody>
        <!-- body copy + optional error banner -->
      </MpModalBody>
      <MpModalFooter>
        <MpButtonGroup>
          <MpButton variant="ghost" @click="onClose">Cancel</MpButton>
          <MpButton variant="danger" @click="onConfirm">Delete</MpButton>
        </MpButtonGroup>
      </MpModalFooter>
    </MpModalContent>
    <MpModalOverlay />
  </MpModal>
</template>

<script setup lang="ts">
import {
  css,
  MpModal,
  MpModalContent,
  MpModalHeader,
  MpModalBody,
  MpModalFooter,
  MpModalOverlay,
  MpModalCloseButton,
  MpButton,
  MpButtonGroup
} from "@mekari/pixel3";
</script>
```

### Anatomy

- Backdrop: handled by `MpModalOverlay`. Use `is-close-on-overlay-click` for non-destructive; omit it for destructive so the user must explicitly cancel.
- Size: `md`. Never hand-code a width.
- **Vertical position: `y=80px` from the top of the viewport.** Do not use `is-centered` — apply `marginTop: '80px'` on `MpModalContent` directly. Top-anchored at 80px keeps it in the user's natural reading area and avoids jumping when content height changes.
- Padding: handled by `MpModalHeader`, `MpModalBody`, `MpModalFooter` — do not add extra padding.

### Header

- Title `Heading/H3` 16 Semibold, `Color/Text/default`.
- Title is a **question or a clear statement of consequence** — not "Confirm" or "Are you sure?".
  - ✅ "Reject this request?"
  - ✅ "Delete this transaction?"
  - ✅ "Remove access for Agung Setiawarman?"
  - ❌ "Confirm action"
  - ❌ "Are you sure?"
- Close `×` icon top-right.

### Body

- `Label/Regular` 14, `Color/Text/default`.
- Describe **what will happen** in plain language, including:
  1. What changes.
  2. Who is affected.
  3. Whether it's reversible and how.
- Examples:
  - ✅ "This will return the request to the employee with a note. They can revise and resubmit."
  - ✅ "Agung will lose access to all expense data immediately. This can be restored within 30 days."
  - ❌ "This action cannot be undone." (vague — what action, undone how?)

### Footer

- Right-aligned cluster: Cancel + primary action button.
- **Gap between action buttons: `pxl-space-sm` 12.** Always use the token — do not hardcode 12px.
- **Cancel**: always `variant="ghost"`. Never secondary, never textLink, never outline.
- **Primary action**: solid button. Variant depends on action type:
  - Destructive (delete, reject, remove): `variant="danger"`. Label is the verb: "Delete", "Reject", "Remove access".
  - Non-destructive (submit, approve, publish): `variant="primary"` (brand blue).
  - Never use generic "OK" or "Confirm" — always the specific verb.

### Focus

- Focus lands on **Cancel** by default, not the primary action. Hitting Enter accidentally shouldn't destroy data.
- Escape closes the modal (= Cancel).

## Variant B: Inline confirm

For low-stakes actions inside dropdowns or popovers, where opening a full modal is overkill.

```
[⋮ menu]
├─ View detail
├─ Edit
└─ Remove
       ↓ inline expand
       Remove this item?
       [Cancel]  [Remove]
```

- The action expands inline within the menu, showing a small prompt with Cancel + verb buttons.
- Use this only when the consequence is small and the affordance is already a "list of actions" context.

## Variant C: Type-to-confirm modal

For very high stakes (deleting a workspace, permanently removing all employee data, cancelling a paid subscription).

```
┌─────────────────────────────────────────────┐
│  Delete workspace "Central Perk Indonesia"? │
│                                             │
│  All 247 employees, 1.832 transactions, and │
│  all related data will be permanently       │
│  deleted. This cannot be undone.            │
│                                             │
│  Type "Central Perk Indonesia" to confirm:  │
│  [_______________________________________]  │
│                                             │
│              [Cancel]  [Delete workspace]   │
└─────────────────────────────────────────────┘
```

- Same modal anatomy as variant A.
- Add a text input below the body. The user must type the exact name (or a confirmation phrase) before the primary button enables.
- Primary button disabled until input matches; enabled = `Color/Background/danger-bold` style.
- Don't accept partial matches or case-insensitive. Exact match. (Yes, it's friction. That's the point.)

## Variant D: Undo toast (no upfront confirm)

For quick destructive actions where the user is likely correct (archiving notifications, removing chips, deleting a draft).

- Perform the action immediately.
- Show a toast bottom-right: "1 item archived. Undo" (Undo as text link).
- Toast persists ~7 seconds, then dismisses.
- Undo restores the state.

Don't combine variants — either confirm upfront or let undo handle it, not both.

## Copy patterns

| Action             | Title                          | Body opener                               |
| ------------------ | ------------------------------ | ----------------------------------------- |
| Delete             | "Delete this [entity]?"        | "This permanently removes…"               |
| Reject             | "Reject this [entity]?"        | "This will return…" or "This notifies…"   |
| Archive            | "Archive this [entity]?"       | "Archived items can be restored from…"    |
| Remove access      | "Remove access for [Name]?"    | "[Name] will lose access to…"             |
| Cancel transaction | "Cancel this transaction?"     | "The pending amount will be returned to…" |
| Submit payroll     | "Submit payroll for [period]?" | "This locks the period and notifies…"     |

## Loading and error states during confirmation

- After the user clicks the primary action, the button shows a spinner and disables; Cancel becomes the only way out (or close the modal if the action allows interrupting).
- If the action fails, keep the modal open and show an inline error banner at the top of the modal body: "Couldn't reject the request. [specific reason]." Provide a retry path (clicking the primary action again).
- On success, close the modal and trigger the success toast from the parent screen.

## Edge cases the PRD probably forgot

- **What if the entity changed while the modal was open?** (Someone else already rejected it.) Default: server returns conflict error, modal shows inline error "This request has already been processed by [actor]." with Close as the only action.
- **Mobile**: full-screen sheet from bottom instead of centered modal. Same anatomy.
- **Confirm fatigue**: if the user does this action 50 times a day, they'll click through without reading. Consider an "always remove this confirm" checkbox stored in user preferences — but only for low-stakes actions, never for type-to-confirm.
- **Keyboard accessibility**: tab order Cancel → primary. Esc cancels. Trap focus inside modal while open.

## Output contract for this pattern

When you ship a confirmation:

- Variant chosen with reasoning.
- Title copy (specific question, not generic).
- Body copy explaining what happens, who's affected, reversibility.
- Primary button verb-specific label and color (destructive red vs neutral blue).
- Default focus target (Cancel for destructive).
- Error and loading behavior during the action.
