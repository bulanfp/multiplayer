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

    <div :class="boxClass">
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
          v-if="mentionables.length"
          variant="ghost"
          size="sm"
          left-icon="text-editor-mention"
          aria-label="Mention someone"
          @click="startMention"
        />
        <MpText size="label-small" color="text.secondary" :class="css({ flex: '1' })">
          Enter to send · Shift + Enter for a new line
        </MpText>
        <!-- Loud only when there is something to send -->
        <MpButton
          :variant="canSend ? 'primary' : 'ghost'"
          size="sm"
          left-icon="sent"
          aria-label="Send"
          @click="send"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { css, MpButton, MpText, MpTextarea } from "@mekari/pixel3";
import MentionSuggestionList from "~/components/thread/MentionSuggestionList.vue";
import type { Mention } from "~/data/types";
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
}

const props = defineProps<MessageComposerProps>();
const emit = defineEmits<{ send: [payload: { text: string; mentions: Mention[] }] }>();

const MAX_HEIGHT = 160;

const text = ref("");
const caret = ref(0);
const isFocused = ref(false);
const isComposing = ref(false);
const activeIndex = ref(0);
/** Start index of an "@" the user dismissed with Esc */
const dismissedAt = ref<number | null>(null);

const inputId = computed(() => `${props.id}-input`);
const listId = computed(() => `${props.id}-mentions`);
const canSend = computed(() => text.value.trim().length > 0);
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

function send() {
  const value = text.value.trim();
  if (!value) return;
  emit("send", { text: value, mentions: parseMentions(value, props.mentionables) });
  text.value = "";
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
  _focusWithin: { borderColor: "border.focused", boxShadow: "focus" }
});

// The box above draws the border and focus ring, so the textarea itself stays bare.
// It starts three lines tall (20px each plus padding) and grows from there.
const textareaClass = css({
  borderWidth: "0 !important",
  boxShadow: "none !important",
  bg: "transparent !important",
  px: "0 !important",
  py: "1 !important",
  minH: "68px !important",
  maxH: "160px",
  overflowY: "auto",
  _focus: { boxShadow: "none !important" }
});

const toolbarClass = css({ display: "flex", alignItems: "center", gap: "2" });
</script>
