<template>
  <div :class="wrapperClass">
    <MentionSuggestionList
      v-if="isListOpen"
      :id="listId"
      :items="suggestions"
      :active-index="activeIndex"
      :class="listPositionClass"
      @select="insertMention"
      @hover="activeIndex = $event"
    />

    <div :class="boxClass" :data-variant="variant">
      <!-- ═════ An output shared from Airene, quoted until you send it with your note ═════ -->
      <div v-if="quotedOutput && quote" :class="quoteClass">
        <span :class="quoteIconClass">
          <MpIcon name="doc" size="sm" color="icon.brand" />
        </span>
        <span :class="quoteTextClass">
          <MpText size="label-small" weight="semiBold" is-truncated>
            {{ quotedOutput.title }}
          </MpText>
          <MpText size="label-small" color="text.secondary" is-truncated>
            {{ quotedOutput.kind }} · v{{ quote.version }} · from {{ quoteAuthor }}
          </MpText>
        </span>
        <button
          type="button"
          :class="removeClass"
          :aria-label="`Remove ${quotedOutput.title}`"
          @click="emit('removeQuote')"
        >
          <MpIcon name="close" size="sm" color="icon.default" />
        </button>
      </div>

      <!-- ═════ Files waiting to be sent ═════ -->
      <ul v-if="attachments.length" :class="attachmentsClass" aria-label="Attachments">
        <li v-for="attachment in attachments" :key="attachment.id" :class="attachmentClass">
          <MpIcon :name="FILE_TYPES[attachment.type].icon" size="sm" color="icon.default" />
          <MpText size="label-small" weight="semiBold" is-truncated :class="css({ minW: '0' })">
            {{ attachment.name }}
          </MpText>
          <MpText size="label-small" color="text.secondary" :class="css({ flexShrink: '0' })">
            {{ attachment.size }}
          </MpText>
          <button
            type="button"
            :class="removeClass"
            :aria-label="`Remove ${attachment.name}`"
            @click="removeAttachment(attachment.id)"
          >
            <MpIcon name="close" size="sm" color="icon.default" />
          </button>
        </li>
      </ul>
      <MpTextarea
        :id="inputId"
        v-model="text"
        :placeholder="placeholder"
        :aria-label="placeholder"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="isListOpen"
        :aria-controls="isListOpen ? listId : undefined"
        :aria-activedescendant="isListOpen ? `${listId}-option-${activeIndex}` : undefined"
        rows="1"
        :class="textareaClass"
        :style="{ resize: 'none' }"
        @keydown="handleKeydown"
        @keyup="updateCaret"
        @click="updateCaret"
        @focus="handleFocus"
        @blur="isFocused = false"
        @compositionstart="isComposing = true"
        @compositionend="isComposing = false"
        @update:model-value="handleInput"
      />
      <div :class="toolbarClass">
        <MpButton
          is-rounded
          variant="ghost"
          size="sm"
          left-icon="attachment"
          aria-label="Attach files"
          @click="pickFiles"
        />
        <MpButton
          v-if="mentionables.length"
          is-rounded
          variant="ghost"
          size="sm"
          left-icon="text-editor-mention"
          aria-label="Mention someone"
          @click="startMention"
        />
        <!-- Loud only when there is something to send; Airene's is a round arrow, like Mekari's -->
        <MpButton
          v-if="variant === 'airene'"
          is-rounded
          :is-disabled="!canSend"
          left-icon="arrows-up"
          aria-label="Send"
          :class="css({ ml: 'auto' })"
          @click="send"
        />
        <MpButton
          v-else
          is-rounded
          :variant="canSend ? 'primary' : 'ghost'"
          size="sm"
          left-icon="sent"
          aria-label="Send"
          :class="css({ ml: 'auto' })"
          @click="send"
        />
      </div>
      <input ref="fileInput" type="file" multiple hidden @change="addFiles" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { css, MpButton, MpIcon, MpText, MpTextarea } from "@mekari/pixel3";
import MentionSuggestionList from "~/components/thread/MentionSuggestionList.vue";
import { useChatStore } from "~/composables/useChatStore";
import { getAgent } from "~/data/agents";
import type { AttachmentDraft, MessageDraft } from "~/data/types";
import { FILE_TYPES, toAttachmentDraft } from "~/utils/files";
import {
  filterMentionables,
  findMentionTrigger,
  parseMentions,
  type Mentionable
} from "~/utils/mentions";

interface MessageComposerProps {
  /** Unique per conversation; used for the textarea and list ids */
  id: string;
  /** People and agents in the conversation */
  mentionables: Mentionable[];
  placeholder: string;
  /** "airene": the larger, rounder box from Mekari's Airene chat */
  variant?: "default" | "airene";
  /** An output shared from Airene, quoted in the box; it goes with the next message */
  quote?: { outputId: string; version: number } | null;
}

const props = withDefaults(defineProps<MessageComposerProps>(), {
  variant: "default",
  quote: null
});
const emit = defineEmits<{ send: [draft: MessageDraft]; removeQuote: [] }>();

const { getOutput } = useChatStore();

const MAX_HEIGHT = 160;

const text = ref("");
const caret = ref(0);
const isFocused = ref(false);
const isComposing = ref(false);
const activeIndex = ref(0);
const attachments = ref<AttachmentDraft[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
/** Start index of an "@" the user dismissed with Esc */
const dismissedAt = ref<number | null>(null);

const inputId = computed(() => `${props.id}-input`);
const listId = computed(() => `${props.id}-mentions`);
const quotedOutput = computed(() => (props.quote ? getOutput(props.quote.outputId) : undefined));
/** The agent that wrote the quoted version. */
const quoteAuthor = computed(() => {
  const agentId = quotedOutput.value?.versions[(props.quote?.version ?? 1) - 1]?.agentId;
  return (agentId && getAgent(agentId)?.name) || "Airene";
});
const canSend = computed(
  () => text.value.trim().length > 0 || attachments.value.length > 0 || Boolean(quotedOutput.value)
);
const trigger = computed(() => findMentionTrigger(text.value, caret.value));
const suggestions = computed(() =>
  trigger.value ? filterMentionables(props.mentionables, trigger.value.query) : []
);
const isListOpen = computed(
  () =>
    isFocused.value &&
    Boolean(trigger.value) &&
    suggestions.value.length > 0 &&
    trigger.value?.start !== dismissedAt.value
);

watch(
  () => trigger.value?.query,
  () => (activeIndex.value = 0)
);

watch(trigger, (value) => {
  if (!value) dismissedAt.value = null;
});

// Arriving with something to share: the cursor is ready for the note that goes with it.
watch(
  () => props.quote,
  (quote) => {
    if (quote) placeCaret(text.value.length);
  },
  { immediate: true }
);

function textarea(): HTMLTextAreaElement | null {
  return document.getElementById(inputId.value) as HTMLTextAreaElement | null;
}

function autogrow() {
  const element = textarea();
  if (!element) return;
  element.style.height = "auto";
  element.style.height = `${Math.min(element.scrollHeight, MAX_HEIGHT)}px`;
}

function updateCaret() {
  caret.value = textarea()?.selectionStart ?? text.value.length;
}

function handleFocus() {
  isFocused.value = true;
  updateCaret();
}

function handleInput() {
  nextTick(() => {
    updateCaret();
    autogrow();
  });
}

function placeCaret(position: number) {
  nextTick(() => {
    const element = textarea();
    element?.focus();
    element?.setSelectionRange(position, position);
    caret.value = position;
    autogrow();
  });
}

function insertMention(item: Mentionable) {
  const current = trigger.value;
  if (!current) return;
  const before = text.value.slice(0, current.start);
  const after = text.value.slice(caret.value).replace(/^ /, "");
  const token = `@${item.name} `;
  text.value = before + token + after;
  // The finished mention would match itself again; keep the list closed for this "@".
  dismissedAt.value = current.start;
  placeCaret(before.length + token.length);
}

function startMention() {
  const position = textarea()?.selectionStart ?? text.value.length;
  const before = text.value.slice(0, position);
  const spacer = before && !/\s$/.test(before) ? " " : "";
  text.value = `${before}${spacer}@${text.value.slice(position)}`;
  placeCaret(before.length + spacer.length + 1);
}

function pickFiles() {
  fileInput.value?.click();
}

function addFiles(event: Event) {
  const input = event.target as HTMLInputElement;
  attachments.value.push(...[...(input.files ?? [])].map(toAttachmentDraft));
  // Clearing the input lets the same file be picked again after it's removed.
  input.value = "";
  textarea()?.focus();
}

function removeAttachment(id: string) {
  const removed = attachments.value.find((attachment) => attachment.id === id);
  if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
  attachments.value = attachments.value.filter((attachment) => attachment.id !== id);
}

function send() {
  if (!canSend.value) return;
  const value = text.value.trim();
  emit("send", {
    text: value,
    mentions: parseMentions(value, props.mentionables),
    attachments: attachments.value,
    output: quotedOutput.value && props.quote ? { ...props.quote } : undefined
  });
  text.value = "";
  attachments.value = [];
  placeCaret(0);
}

function handleKeydown(event: KeyboardEvent) {
  if (event.isComposing || isComposing.value) return;

  if (isListOpen.value) {
    const count = suggestions.value.length;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      activeIndex.value = (activeIndex.value + 1) % count;
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      activeIndex.value = (activeIndex.value - 1 + count) % count;
      return;
    }
    if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      const item = suggestions.value[activeIndex.value];
      if (item) insertMention(item);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      dismissedAt.value = trigger.value?.start ?? null;
      return;
    }
  }

  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    send();
  }
}

const wrapperClass = css({ position: "relative" });

const listPositionClass = css({
  position: "absolute",
  bottom: "100%",
  left: "0",
  mb: "2",
  zIndex: "popover"
});

const boxClass = css({
  display: "flex",
  flexDirection: "column",
  gap: "1",
  px: "3",
  pt: "2",
  pb: "2",
  bg: "background.neutral",
  rounded: "lg",
  borderWidth: "1px",
  borderColor: "border.form",
  transition: "border-color .15s, box-shadow .15s",
  _focusWithin: { borderColor: "border.focused", boxShadow: "focus" },
  "&[data-variant=airene]": {
    gap: "2",
    px: "4",
    pt: "3",
    pb: "3",
    rounded: "16px",
    boxShadow: "0 1px 4px 0 token(colors.neutral.200a)",
    _focusWithin: { boxShadow: "focus" }
  }
});

// The box above draws the border and focus ring, so the textarea itself stays bare.
// It starts two lines tall (20px each plus padding) and grows from there.
const textareaClass = css({
  borderWidth: "0 !important",
  boxShadow: "none !important",
  bg: "transparent !important",
  px: "0 !important",
  py: "1 !important",
  minH: "48px !important",
  maxH: "160px",
  overflowY: "auto",
  _focus: { boxShadow: "none !important" }
});

const toolbarClass = css({ display: "flex", alignItems: "center", gap: "1" });

// A quote: the bar on the left says it's someone else's work, the card says what it is.
const quoteClass = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  maxW: "360px",
  mt: "1",
  py: "1.5",
  pl: "2",
  pr: "1",
  rounded: "md",
  borderLeftWidth: "3px",
  borderLeftColor: "border.selected",
  bg: "background.neutral.subtle"
});

// The output card's brand-tinted doc icon, at the quote's size.
const quoteIconClass = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: "0",
  w: "8",
  h: "8",
  rounded: "md",
  bg: "background.brand"
});

const quoteTextClass = css({ display: "flex", flexDirection: "column", flex: "1", minW: "0" });

const attachmentsClass = css({ display: "flex", flexWrap: "wrap", gap: "2", pt: "1" });

// A file waiting to be sent: what it is, how big, and a way to take it back out.
const attachmentClass = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "1.5",
  maxW: "280px",
  h: "8",
  pl: "2",
  pr: "1",
  rounded: "md",
  borderWidth: "1px",
  borderColor: "border.default",
  bg: "background.neutral.subtle"
});

const removeClass = css({
  display: "inline-flex",
  flexShrink: "0",
  p: "1",
  rounded: "full",
  cursor: "pointer",
  _hover: { bg: "background.neutral.subtle.hovered" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused" }
});
</script>
