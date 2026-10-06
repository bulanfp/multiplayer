<template>
  <NuxtLink
    :to="to"
    class="group"
    :class="itemClass"
    :aria-current="isActive ? 'page' : undefined"
    :aria-label="badge ? `${label}, ${badge} unread` : label"
  >
    <span :class="iconBoxClass" :data-active="isActive || undefined">
      <MpIcon
        :name="icon"
        size="md"
        :variant="isActive ? 'fill' : 'outline'"
        :color="isActive ? 'icon.inverse.static' : 'icon.inverse'"
      />
      <span v-if="badge" :class="badgeClass" aria-hidden="true">{{
        badge > 9 ? "9+" : badge
      }}</span>
    </span>
    <MpText size="label-small" color="text.inverse" :weight="isActive ? 'semiBold' : 'regular'">
      {{ label }}
    </MpText>
  </NuxtLink>
</template>

<script setup lang="ts">
import { css, MpIcon, MpText, type IconName } from "@mekari/pixel3";

interface RailItemProps {
  label: string;
  icon: IconName;
  to: string;
  isActive?: boolean;
  /** Unread count shown on the icon */
  badge?: number;
}

defineProps<RailItemProps>();

const itemClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1",
  w: "16",
  py: "1",
  rounded: "lg",
  textDecoration: "none",
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "background.header.menu.selected",
    outlineOffset: "0"
  }
});

// A light wash on the dark frame (Slack-style): faint on hover, stronger when selected.
const iconBoxClass = css({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  w: "9",
  h: "9",
  rounded: "lg",
  transition: "background-color .15s ease",
  _groupHover: { bg: "dark.200a" },
  "&[data-active]": { bg: "dark.400a !important" }
});

const badgeClass = css({
  position: "absolute",
  top: "-1",
  right: "-1.5",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minW: "18px",
  h: "18px",
  px: "1",
  rounded: "full",
  bg: "background.danger.bold",
  color: "text.inverse.static",
  fontSize: "xs",
  fontWeight: "semiBold",
  borderWidth: "2px",
  borderColor: "background.surface.bold"
});
</script>
