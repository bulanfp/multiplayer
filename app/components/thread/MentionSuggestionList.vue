<template>
  <div :id="id" :class="listClass" role="listbox" aria-label="People and agents">
    <MpText size="label-small" color="text.secondary" :class="css({ px: '3', pt: '2', pb: '1' })">
      Mention people and agents
    </MpText>
    <div
      v-for="(item, index) in items"
      :id="`${id}-option-${index}`"
      :key="`${item.kind}-${item.id}`"
      role="option"
      :aria-selected="index === activeIndex"
      :class="optionClass"
      :data-active="index === activeIndex || undefined"
      @mousedown.prevent="emit('select', item)"
      @mouseenter="emit('hover', index)"
    >
      <MemberAvatar :actor="{ kind: item.kind, id: item.id }" size="sm" />
      <MpText weight="semiBold" :class="css({ flexShrink: '0' })">{{ item.name }}</MpText>
      <MpText size="label-small" color="text.secondary" is-truncated>
        {{ item.kind === "agent" ? `Agent · ${item.description}` : item.description }}
      </MpText>
    </div>
  </div>
</template>

<script setup lang="ts">
import { css, MpText } from "@mekari/pixel3";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import type { Mentionable } from "~/utils/mentions";

interface MentionSuggestionListProps {
  id: string;
  items: Mentionable[];
  activeIndex: number;
}

defineProps<MentionSuggestionListProps>();
const emit = defineEmits<{ select: [item: Mentionable]; hover: [index: number] }>();

const listClass = css({
  w: "360px",
  maxW: "full",
  pb: "1",
  bg: "background.neutral",
  rounded: "lg",
  borderWidth: "1px",
  borderColor: "border.default",
  shadow: "md"
});

const optionClass = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  px: "3",
  py: "2",
  cursor: "pointer",
  "&[data-active]": { bg: "background.neutral.subtle.selected" }
});
</script>
