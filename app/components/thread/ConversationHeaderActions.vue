<template>
  <div :class="rootClass">
    <!-- Members can name an unnamed group, or rename any group -->
    <MpTooltip
      v-if="isMember(conversation)"
      id="rename-group-tooltip"
      :label="renameLabel"
      use-portal
    >
      <MpButton
        is-rounded
        variant="ghost"
        left-icon="edit"
        :aria-label="renameLabel"
        @click="emit('rename')"
      />
    </MpTooltip>

    <button
      type="button"
      :class="membersButtonClass"
      :data-active="isMembersOpen || undefined"
      :aria-label="`${total} members. ${isMembersOpen ? 'Hide' : 'Show'} member list`"
      :aria-pressed="isMembersOpen"
      @click="emit('toggleMembers')"
    >
      <span :class="stackClass">
        <span
          v-for="actor in previewActors"
          :key="`${actor.kind}-${actor.id}`"
          :class="faceClass"
          :data-kind="actor.kind"
        >
          <MemberAvatar :actor="actor" size="sm" />
        </span>
      </span>
      <MpText color="text.secondary">{{ total }}</MpText>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { css, MpButton, MpText, MpTooltip } from "@mekari/pixel3";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import type { Actor, Conversation } from "~/data/types";

interface ConversationHeaderActionsProps {
  conversation: Conversation;
  isMembersOpen?: boolean;
}

const props = defineProps<ConversationHeaderActionsProps>();
const emit = defineEmits<{ toggleMembers: []; rename: [] }>();

const { isMember } = useWorkspaceStore();

const renameLabel = computed(() =>
  props.conversation.isUnnamed ? "Name this group" : "Rename group"
);

const total = computed(
  () => props.conversation.memberIds.length + props.conversation.agentIds.length
);

// People first, then agents, so the stack shows who's in the room at a glance.
const previewActors = computed<Actor[]>(() => [
  ...props.conversation.memberIds.slice(0, 3).map((id) => ({ kind: "person" as const, id })),
  ...props.conversation.agentIds.slice(0, 2).map((id) => ({ kind: "agent" as const, id }))
]);

const rootClass = css({ display: "flex", alignItems: "center", gap: "2" });

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

// Every face is a 24px circle, so each gets the same round white ring. People fill theirs;
// an agent's 3D icon has a transparent square around it, so it sits inset on Pixel's soft
// AI background instead.
const faceClass = css({
  display: "inline-flex",
  flexShrink: "0",
  w: "6",
  h: "6",
  rounded: "full",
  overflow: "hidden",
  "&[data-kind=agent]": { bg: "background.airene" },
  "&[data-kind=agent] > img": { p: "3px" }
});
</script>
