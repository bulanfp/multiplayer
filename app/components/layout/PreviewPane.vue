<template>
  <div
    ref="paneRef"
    :class="paneClass"
    :style="{ width: `${width}px`, '--panel-offset': `${width}px` }"
  >
    <!-- ═════ Resize handle: drag, arrow keys, or double-click to reset ═════ -->
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize preview"
      :aria-valuenow="width"
      :aria-valuemin="PREVIEW_WIDTH.min"
      :aria-valuemax="PREVIEW_WIDTH.max"
      tabindex="0"
      class="group"
      :class="handleClass"
      :data-dragging="isDragging || undefined"
      @pointerdown="startResize"
      @keydown="resizeWithKeys"
      @dblclick="setWidth(PREVIEW_WIDTH.default)"
    >
      <span :class="gripClass" />
    </div>

    <aside :class="cardClass" :aria-label="label">
      <slot />
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { css } from "@mekari/pixel3";
import { PREVIEW_WIDTH, usePreviewWidth } from "~/composables/usePreviewWidth";

interface PreviewPaneProps {
  /** Names the panel for screen readers, e.g. "Store poster A2.pdf preview" */
  label: string;
}

defineProps<PreviewPaneProps>();

/** The page next to the preview never gets narrower than this. */
const MIN_NEIGHBOUR = 360;
const KEY_STEP = 32;

const { width, setWidth } = usePreviewWidth();
const paneRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);

/** Widest the preview can be without squeezing the pane to its left. */
function maxWidth(): number {
  const pane = paneRef.value;
  const neighbour = pane?.previousElementSibling;
  if (!pane || !neighbour) return PREVIEW_WIDTH.max;
  return (
    pane.getBoundingClientRect().right - neighbour.getBoundingClientRect().left - MIN_NEIGHBOUR
  );
}

function startResize(event: PointerEvent) {
  const pane = paneRef.value;
  if (!pane || event.button !== 0) return;
  event.preventDefault();
  const handle = event.currentTarget as HTMLElement;
  const right = pane.getBoundingClientRect().right;
  const limit = maxWidth();
  handle.setPointerCapture(event.pointerId);
  isDragging.value = true;
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";

  function onMove(move: PointerEvent) {
    setWidth(Math.min(limit, right - move.clientX), false);
  }
  function onEnd() {
    isDragging.value = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    setWidth(width.value);
    handle.removeEventListener("pointermove", onMove);
    handle.removeEventListener("pointerup", onEnd);
    handle.removeEventListener("pointercancel", onEnd);
  }
  handle.addEventListener("pointermove", onMove);
  handle.addEventListener("pointerup", onEnd);
  handle.addEventListener("pointercancel", onEnd);
}

// The preview sits on the right, so ← makes it wider and → narrower.
function resizeWithKeys(event: KeyboardEvent) {
  const step = event.shiftKey ? KEY_STEP * 3 : KEY_STEP;
  if (event.key === "ArrowLeft") setWidth(Math.min(maxWidth(), width.value + step));
  else if (event.key === "ArrowRight") setWidth(width.value - step);
  else return;
  event.preventDefault();
}

// The pane holds the width and the resize handle; the card floats inside it.
const paneClass = css({
  position: "relative",
  display: "flex",
  flexShrink: "0",
  minW: "360px",
  maxW: "calc(100% - 360px)",
  p: "2"
});

// Sits in the gap left of the card, reaching a little into the page so it's easy to grab.
// The grip hints that the edge moves; it darkens on hover and drag.
const handleClass = css({
  position: "absolute",
  top: "0",
  bottom: "0",
  left: "-1",
  zIndex: "1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  w: "3",
  cursor: "col-resize",
  touchAction: "none",
  outline: "none"
});

const gripClass = css({
  w: "1",
  h: "8",
  rounded: "full",
  bg: "border.default",
  transition: "background-color .15s, height .15s",
  _groupHover: { bg: "border.bold", h: "12" },
  _groupFocusVisible: { bg: "border.focused", h: "12" },
  "[data-dragging] &": { bg: "border.focused", h: "12" }
});

// Claude-style panel: floating as its own card next to the page.
const cardClass = css({
  display: "flex",
  flexDirection: "column",
  flex: "1",
  minW: "0",
  bg: "background.neutral",
  borderWidth: "1px",
  borderColor: "border.default",
  rounded: "xl",
  boxShadow: "0 1px 3px 0 token(colors.neutral.200a)",
  overflow: "hidden"
});
</script>
