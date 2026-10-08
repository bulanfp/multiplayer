<template>
  <div :class="rootClass">
    <!-- ═════ Who's here: faces and a count; opens Members ═════ -->
    <button
      type="button"
      :class="[pillClass, membersButtonClass]"
      :data-active="openView === 'members' || undefined"
      :aria-label="`${total} members. ${openView === 'members' ? 'Hide' : 'Show'} member list`"
      :aria-pressed="openView === 'members'"
      @click="emit('toggle', 'members')"
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

    <!-- ═════ Files: a page and a count, as in Claude Cowork. It opens a menu first, like Claude
         Code's view menu: Artifacts & files, or Connectors, each in its own panel ═════ -->
    <MpPopover
      :id="`files-menu-${conversation.id}`"
      v-slot="{ onClosePopover }"
      placement="bottom-end"
      use-portal
      :is-keep-alive="false"
    >
      <MpPopoverTrigger>
        <button
          type="button"
          :class="[pillClass, filesButtonClass]"
          :data-active="openView === 'files' || openView === 'connectors' || undefined"
          :aria-label="`${fileCount} ${fileCount === 1 ? 'file' : 'files'}. Files, artifacts and connectors`"
        >
          <MpIcon name="doc" size="md" color="icon.default" />
          <MpText color="text.secondary">{{ fileCount }}</MpText>
        </button>
      </MpPopoverTrigger>
      <MpPopoverContent :class="menuClass">
        <MpPopoverList :class="menuListClass">
          <MpPopoverListItem
            v-for="item in menu"
            :key="item.view"
            :is-active="openView === item.view"
            @click="choose(item.view, onClosePopover)"
          >
            <span :class="menuItemClass">
              <MpIcon :name="item.icon" size="sm" />
              <MpText :class="css({ flex: '1' })">{{ item.label }}</MpText>
              <MpText color="text.secondary">{{ item.count }}</MpText>
            </span>
          </MpPopoverListItem>
        </MpPopoverList>
      </MpPopoverContent>
    </MpPopover>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  css,
  MpIcon,
  MpPopover,
  MpPopoverContent,
  MpPopoverList,
  MpPopoverListItem,
  MpPopoverTrigger,
  MpText,
  type IconName
} from "@mekari/pixel3";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import {
  useConversationDetails,
  type ConversationPanelView
} from "~/composables/useConversationDetails";
import type { Actor, Conversation } from "~/data/types";

interface ConversationHeaderActionsProps {
  /** A group or an agent chat */
  conversation: Conversation;
  /** The side panel that's open, if it's one of these */
  openView?: ConversationPanelView | null;
}

const props = defineProps<ConversationHeaderActionsProps>();
const emit = defineEmits<{ toggle: [view: ConversationPanelView] }>();

const { agentsIn, filesIn } = useConversationDetails();

const agentIds = computed(() => agentsIn(props.conversation));
const total = computed(() => props.conversation.memberIds.length + agentIds.value.length);
const fileCount = computed(() => filesIn(props.conversation).length);

const menu = computed<
  { view: ConversationPanelView; label: string; icon: IconName; count: number }[]
>(() => [
  { view: "files", label: "Artifacts & files", icon: "folder-close", count: fileCount.value },
  {
    view: "connectors",
    label: "Connectors",
    icon: "connected_apps",
    count: props.conversation.connectors?.length ?? 0
  }
]);

function choose(view: ConversationPanelView, close: () => void) {
  close();
  emit("toggle", view);
}

// People first, then agents, so the stack shows who's in the room at a glance.
const previewActors = computed<Actor[]>(() => [
  ...props.conversation.memberIds.slice(0, 3).map((id) => ({ kind: "person" as const, id })),
  ...agentIds.value.slice(0, 2).map((id) => ({ kind: "agent" as const, id }))
]);

const rootClass = css({ display: "flex", alignItems: "center", gap: "2" });

// Both header buttons are pills of the same height: an icon or faces, then a quiet count.
const pillClass = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "2",
  h: "9",
  rounded: "full",
  borderWidth: "1px",
  borderColor: "border.default",
  bg: "background.neutral",
  cursor: "pointer",
  _hover: { bg: "background.neutral.hovered" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused", outlineOffset: "2px" },
  "&[data-active]": { borderColor: "border.selected", bg: "background.brand" }
});

const membersButtonClass = css({ pl: "1.5", pr: "10px" });

const filesButtonClass = css({ gap: "1.5", pl: "2.5", pr: "3" });

const menuClass = css({ w: "240px" });

// Pixel's list pads 12px above and 8px below; 4px on both keeps the menu compact and even.
const menuListClass = css({ py: "1" });

const menuItemClass = css({ display: "flex", alignItems: "center", gap: "3", w: "full" });

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
