<template>
  <!-- v-text on every segment so template whitespace never leaks into pre-wrap text -->
  <MpText as="p" :class="textClass">
    <span
      v-for="(segment, index) in segments"
      :key="index"
      :class="segment.type === 'mention' ? mentionClass : undefined"
      :data-kind="segment.type === 'mention' ? segment.mention.kind : undefined"
      :data-self="
        segment.type === 'mention' && segment.mention.id === CURRENT_USER_ID ? true : undefined
      "
      v-text="segment.text"
    />
  </MpText>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { css, MpText } from "@mekari/pixel3";
import { CURRENT_USER_ID } from "~/data/people";
import type { Mention } from "~/data/types";
import { toSegments } from "~/utils/mentions";

interface MessageTextProps {
  text: string;
  mentions: Mention[];
}

const props = defineProps<MessageTextProps>();

const segments = computed(() => toSegments(props.text, props.mentions));

const textClass = css({ whiteSpace: "pre-wrap", overflowWrap: "anywhere" });

// Agents read violet, people blue, and mentions of you are highlighted like Slack.
const mentionClass = css({
  px: "0.5",
  rounded: "sm",
  fontWeight: "semiBold",
  "&[data-kind=agent]": { bg: "background.highlight", color: "text.highlight" },
  "&[data-kind=person]": { bg: "background.information", color: "text.information" },
  "&[data-self]": { bg: "background.warning", color: "text.default" }
});
</script>
