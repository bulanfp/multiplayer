<template>
  <MpPopover :id="id" v-slot="{ onClosePopover }" placement="bottom-start" :is-keep-alive="false">
    <MpPopoverTrigger>
      <button
        type="button"
        :class="tileClass"
        :aria-label="model ? `Icon ${model}. Change icon` : 'Choose an icon'"
      >
        <span v-if="model" :class="emojiClass" aria-hidden="true">{{ model }}</span>
        <MpIcon v-else name="emoji" size="md" color="icon.default" />
        <span :class="plusClass" aria-hidden="true">
          <MpIcon name="add" size="12px" color="icon.inverse.static" />
        </span>
      </button>
    </MpPopoverTrigger>

    <!-- Not portaled: the picker has to stay inside a modal's focus trap for keyboards -->
    <MpPopoverContent :class="pickerClass">
      <MpText size="label-small" weight="semiBold" color="text.secondary" :class="titleClass">
        Choose an icon
      </MpText>
      <div :class="gridClass">
        <button
          v-for="option in options"
          :key="option"
          type="button"
          :class="optionClass"
          :aria-label="option"
          :aria-pressed="option === model"
          @click="pick(option, onClosePopover)"
        >
          {{ option }}
        </button>
      </div>
    </MpPopoverContent>
  </MpPopover>
</template>

<script setup lang="ts">
import { css, MpIcon, MpPopover, MpPopoverContent, MpPopoverTrigger, MpText } from "@mekari/pixel3";

interface EmojiPickerTileProps {
  /** Unique popover id */
  id: string;
  /** Emoji people can pick from */
  options: string[];
}

defineProps<EmojiPickerTileProps>();

/** The chosen emoji; empty shows a smiley placeholder. */
const model = defineModel<string>();

function pick(option: string, close: () => void) {
  model.value = option;
  close();
}

// Same height as a Pixel input so it sits flush next to the name field.
const tileClass = css({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: "0",
  w: "10",
  h: "10",
  rounded: "md",
  bg: "background.neutral.subtle",
  borderWidth: "1px",
  borderColor: "border.default",
  cursor: "pointer",
  transition: "background-color .15s ease",
  _hover: { bg: "background.neutral.subtle.hovered" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused", outlineOffset: "2px" }
});

const emojiClass = css({ fontSize: "xl", lineHeight: "1" });

// The small "+" says the tile opens a picker.
const plusClass = css({
  position: "absolute",
  right: "-2",
  bottom: "-2",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  w: "5",
  h: "5",
  rounded: "full",
  bg: "background.brand.bold",
  borderWidth: "2px",
  borderColor: "background.neutral"
});

const pickerClass = css({ p: "2", w: "max-content" });

const titleClass = css({ display: "block", px: "1", pb: "2" });

const gridClass = css({ display: "grid", gridTemplateColumns: "repeat(8, 32px)", gap: "0.5" });

const optionClass = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  w: "8",
  h: "8",
  rounded: "md",
  fontSize: "lg",
  lineHeight: "1",
  cursor: "pointer",
  _hover: { bg: "background.neutral.hovered" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused" },
  "&[aria-pressed=true]": {
    bg: "background.brand",
    boxShadow: "inset 0 0 0 1px token(colors.border.selected)"
  }
});
</script>
