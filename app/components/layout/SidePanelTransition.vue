<template>
  <Transition name="side-panel" mode="out-in">
    <slot />
  </Transition>
</template>

<!--
  Side panels (output preview, members) slide in from the right like a drawer: a negative
  right margin equal to the panel's footprint (--panel-offset, set by each panel) parks it
  just past the edge, and easing it to its normal margin slides it in while the
  conversation narrows alongside. The panel keeps its width, so nothing inside reflows.
  Global on purpose: transition classes land on the slotted panel, which scoped styles miss.
  Each panel must render one element at its root, with no comment before it: the dev server
  keeps comments, which makes the root a fragment, and out-in mode then waits forever for it
  to leave, so the next panel never opens.
-->
<style>
/* An even ease in and out (no fast start), so the slide feels unhurried. */
.side-panel-enter-active {
  transition:
    margin-right 0.6s cubic-bezier(0.45, 0, 0.2, 1),
    opacity 0.5s ease;
}

.side-panel-leave-active {
  transition:
    margin-right 0.5s cubic-bezier(0.45, 0, 0.2, 1),
    opacity 0.4s ease;
}

.side-panel-enter-from,
.side-panel-leave-to {
  margin-right: calc(-1 * var(--panel-offset, 0px));
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .side-panel-enter-active,
  .side-panel-leave-active {
    transition: none;
  }
}
</style>
