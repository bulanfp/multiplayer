<template>
  <NuxtLink
    :to="to"
    :class="itemClass"
    :data-active="isActive || undefined"
    :data-leading="leading"
    :aria-current="isActive ? 'page' : undefined"
  >
    <slot name="leading">
      <span v-if="prefix" :class="prefixClass" aria-hidden="true">{{ prefix }}</span>
      <MpIcon v-else-if="icon" :name="icon" size="md" color="icon.default" />
    </slot>
    <MpText
      weight="regular"
      :color="isMuted ? 'text.secondary' : 'text.default'"
      is-truncated
      :class="css({ flex: '1', minW: '0' })"
    >
      {{ label }}
    </MpText>
    <UnreadCount v-if="badge" :count="badge" />
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { css, MpIcon, MpText, type IconName } from "@mekari/pixel3";
import UnreadCount from "~/components/shared/UnreadCount.vue";

interface SideMenuItemProps {
  /** Item text */
  label: string;
  /** Route path; the item is active on an exact path match */
  to: string;
  /** Pixel icon in the leading slot */
  icon?: IconName;
  /** Text in the leading slot instead of an icon, e.g. a group's emoji */
  prefix?: string;
  /** Unread count, shown as a badge; the label stays regular */
  badge?: number;
  /** Quieter label for utility rows */
  isMuted?: boolean;
  /** Size of custom leading content: "lg" for 32px agent avatars */
  leading?: "md" | "lg";
  /** Also active on pages under `to`, e.g. an agent and each of its chats */
  isPrefixMatch?: boolean;
}

const props = withDefaults(defineProps<SideMenuItemProps>(), { leading: "md" });

const route = useRoute();
const isActive = computed(
  () => route.path === props.to || (props.isPrefixMatch && route.path.startsWith(`${props.to}/`))
);

const itemClass = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  h: "8",
  px: "2",
  rounded: "md",
  color: "text.default",
  textDecoration: "none",
  // Hover only on inactive rows so the selected background holds.
  "&:not([data-active]):hover": { bg: "background.neutral.subtle.hovered" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused", outlineOffset: "-2px" },
  "&[data-active]": { bg: "background.neutral.subtle.selected" },
  // 32px agent avatars use a tighter gap so labels line up with the design.
  "&[data-leading=lg]": { gap: "1.5", h: "36px" }
});

const prefixClass = css({
  display: "inline-flex",
  justifyContent: "center",
  w: "6",
  flexShrink: "0",
  color: "text.secondary",
  fontSize: "lg"
});
</script>
