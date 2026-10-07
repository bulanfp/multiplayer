<template>
  <!-- A sidebar row for a group. On hover or keyboard focus, its emoji turns into a pin
       button; the button sits beside the link, not inside it. A click leaves focus on the link,
       so only :focus-visible counts, or an opened row would keep it. -->
  <div class="group" :class="rootClass">
    <SideMenuItem
      :to="conversationPath(conversation.workspaceId, conversation.slug)"
      :label="label"
      :badge="unreadCount(conversation.id)"
    >
      <template #leading>
        <span :class="leadingClass" data-pin-swap>
          <span :class="emojiClass" aria-hidden="true">{{ conversation.emoji }}</span>
        </span>
      </template>
    </SideMenuItem>

    <MpTooltip :id="`pin-tooltip-${conversation.id}`" :label="pinLabel" use-portal>
      <button
        type="button"
        :class="pinClass"
        :aria-label="`${pinLabel} ${label}`"
        :aria-pressed="isPinned"
        @click="togglePin(conversation)"
      >
        <MpIcon :name="isPinned ? 'unpin' : 'pin'" size="sm" color="icon.default" />
      </button>
    </MpTooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { css, MpIcon, MpTooltip } from "@mekari/pixel3";
import SideMenuItem from "~/components/layout/SideMenuItem.vue";
import { useChatStore } from "~/composables/useChatStore";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import type { Conversation } from "~/data/types";
import { conversationPath } from "~/utils/paths";

interface ConversationMenuItemProps {
  conversation: Conversation;
}

const props = defineProps<ConversationMenuItemProps>();

const { conversationTitle, togglePin } = useWorkspaceStore();
const { unreadCount } = useChatStore();

const label = computed(() => conversationTitle(props.conversation));

const isPinned = computed(() => Boolean(props.conversation.pinnedAt));
const pinLabel = computed(() => (isPinned.value ? "Unpin" : "Pin"));

// The row keeps its hover wash while the pointer is on the pin button beside the link.
const rootClass = css({
  position: "relative",
  "&:hover > a:not([data-active])": { bg: "background.neutral.subtle.hovered" },
  "&:hover [data-pin-swap], &:has(:focus-visible) [data-pin-swap]": { opacity: "0" }
});

// The same 24px column as icons, group emoji and avatars.
const leadingClass = css({
  display: "inline-flex",
  justifyContent: "center",
  w: "6",
  flexShrink: "0",
  transition: "opacity .15s ease",
  _motionReduce: { transition: "none" }
});

// As big as the agents' 24px avatars above, so the two lists read as one.
const emojiClass = css({ color: "text.secondary", fontSize: "xl", lineHeight: "1" });

// Over the leading column: 8px in (the row's padding), centred on the 32px row.
const pinClass = css({
  position: "absolute",
  top: "4px",
  left: "2",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  w: "6",
  h: "6",
  rounded: "full",
  cursor: "pointer",
  opacity: "0",
  pointerEvents: "none",
  transition: "opacity .15s ease, background-color .15s ease",
  ".group:hover &, .group:has(:focus-visible) &": { opacity: "1", pointerEvents: "auto" },
  _hover: { bg: "background.neutral.subtle.pressed" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused" },
  _motionReduce: { transition: "none" }
});
</script>
