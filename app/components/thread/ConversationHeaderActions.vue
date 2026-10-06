<template>
  <button
    type="button"
    :class="membersButtonClass"
    :data-active="isMembersOpen || undefined"
    :aria-label="`${total} members. ${isMembersOpen ? 'Hide' : 'Show'} member list`"
    :aria-pressed="isMembersOpen"
    @click="emit('toggleMembers')"
  >
    <span :class="stackClass">
      <MemberAvatar
        v-for="actor in previewActors"
        :key="`${actor.kind}-${actor.id}`"
        :actor="actor"
        size="sm"
      />
    </span>
    <MpText color="text.secondary">{{ total }}</MpText>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { css, MpText } from "@mekari/pixel3";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import type { Actor, Conversation } from "~/data/types";

interface ConversationHeaderActionsProps {
  conversation: Conversation;
  isMembersOpen?: boolean;
}

const props = defineProps<ConversationHeaderActionsProps>();
const emit = defineEmits<{ toggleMembers: [] }>();

const total = computed(
  () => props.conversation.memberIds.length + props.conversation.agentIds.length
);

// People first, then agents, so the stack shows who's in the room at a glance.
const previewActors = computed<Actor[]>(() => [
  ...props.conversation.memberIds.slice(0, 3).map((id) => ({ kind: "person" as const, id })),
  ...props.conversation.agentIds.slice(0, 2).map((id) => ({ kind: "agent" as const, id }))
]);

// A pill: faces on the left, a quiet count on the right.
const membersButtonClass = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "2",
  h: "9",
  pl: "1.5",
  pr: "10px",
  rounded: "full",
  borderWidth: "1px",
  borderColor: "border.default",
  bg: "background.neutral",
  cursor: "pointer",
  _hover: { bg: "background.neutral.hovered" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused", outlineOffset: "2px" },
  "&[data-active]": { borderColor: "border.selected", bg: "background.brand" }
});

const stackClass = css({
  display: "inline-flex",
  "& > *": { boxShadow: "0 0 0 2px token(colors.background.neutral)" },
  "& > *:not(:first-child)": { ml: "-1.5" }
});
</script>
