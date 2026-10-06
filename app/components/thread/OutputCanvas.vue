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

    <aside :class="canvasClass" :aria-label="output ? `${output.title} canvas` : 'Canvas'">
      <template v-if="output && current">
        <header :class="headerClass">
          <MpFlex direction="column" gap="1" minWidth="0" flex="1">
            <MpText size="h3" is-truncated>{{ output.title }}</MpText>
            <MpText size="label-small" color="text.secondary">
              {{ output.kind }} · Updated by {{ getAgent(current.agentId)?.name ?? "an agent" }},
              {{ formatTimestamp(current.createdAt) }}
              <template v-if="sourceLabel">· {{ sourceLabel }}</template>
            </MpText>
          </MpFlex>

          <MpFlex alignItems="center" gap="1" flexShrink="0">
            <MpSelect
              v-if="output.versions.length > 1"
              id="canvas-version"
              size="sm"
              aria-label="Version"
              :model-value="version"
              :class="css({ w: '80px' })"
              @update:model-value="emit('update:version', Number($event))"
            >
              <option v-for="(_, index) in output.versions" :key="index" :value="index + 1">
                v{{ index + 1 }}
              </option>
            </MpSelect>
            <MpText v-else size="label-small" color="text.secondary" :class="css({ px: '2' })">
              v1
            </MpText>
            <MpButton variant="ghost" size="sm" left-icon="copy" aria-label="Copy" @click="copy" />
            <MpButton
              variant="ghost"
              size="sm"
              left-icon="close"
              aria-label="Close canvas"
              @click="emit('close')"
            />
          </MpFlex>
        </header>

        <div :class="bodyClass">
          <OutputBlocks :blocks="current.blocks" />
          <MpText size="body-small" color="text.secondary" :class="css({ mt: '8' })">
            Want changes? Ask {{ getAgent(current.agentId)?.name ?? "the agent" }} in the chat and
            it will make a new version.
          </MpText>
        </div>
      </template>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { css, MpButton, MpFlex, MpSelect, MpText } from "@mekari/pixel3";
import OutputBlocks from "~/components/thread/OutputBlocks.vue";
import { useChatStore } from "~/composables/useChatStore";
import { PREVIEW_WIDTH, usePreviewWidth } from "~/composables/usePreviewWidth";
import { getAgent } from "~/data/agents";
import { formatTimestamp } from "~/utils/format";
import { copyOutput } from "~/utils/outputs";

interface OutputCanvasProps {
  outputId: string;
  /** 1-based version on screen */
  version: number;
  /** Where the output came from, shown in the Library, e.g. "#copywriting" */
  sourceLabel?: string;
}

const props = defineProps<OutputCanvasProps>();
const emit = defineEmits<{ close: []; "update:version": [version: number] }>();

const { getOutput } = useChatStore();

const output = computed(() => getOutput(props.outputId));
const current = computed(
  () => output.value?.versions[props.version - 1] ?? output.value?.versions.at(-1)
);

/** The conversation next to the preview never gets narrower than this. */
const MIN_CONVERSATION = 360;
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
    pane.getBoundingClientRect().right - neighbour.getBoundingClientRect().left - MIN_CONVERSATION
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

function copy() {
  if (output.value) copyOutput(output.value, props.version);
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

// Sits in the gap left of the card, reaching a little into the conversation so it's
// easy to grab. The grip hints that the edge moves; it darkens on hover and drag.
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

// Claude-style canvas: read-only, versioned, floating as its own card next to the conversation.
const canvasClass = css({
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

const headerClass = css({
  display: "flex",
  alignItems: "flex-start",
  gap: "3",
  px: "6",
  py: "4",
  borderBottomWidth: "1px",
  borderColor: "border.default"
});

const bodyClass = css({ flex: "1", minH: "0", overflowY: "auto", px: "6", py: "5" });
</script>
