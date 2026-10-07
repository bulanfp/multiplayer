<template>
  <NuxtLink
    :to="to"
    class="group"
    :class="itemClass"
    :aria-current="isActive ? 'page' : undefined"
    :aria-label="badge ? `${label}, ${badge} unread` : label"
    :data-active="isActive || undefined"
  >
    <!-- Discord-style marker on the canvas's left edge: grows a little on hover, tall when active -->
    <span :class="indicatorClass" aria-hidden="true" />
    <!-- As in Mekari ERP: a gray square behind the icon on hover, and when selected the
         square stays and the icon fills in brand green -->
    <span :class="iconBoxClass">
      <MpIcon
        :name="isActive && activeIcon ? activeIcon : icon"
        size="md"
        :variant="isActive ? 'fill' : 'outline'"
        :color="isActive ? 'icon.brand' : 'icon.default'"
        :class="iconClass"
      />
      <span v-if="badge" :class="badgeClass" aria-hidden="true">{{
        badge > 9 ? "9+" : badge
      }}</span>
    </span>
    <MpText
      size="label-small"
      :color="isActive ? 'text.default' : 'text.secondary'"
      :weight="isActive ? 'semiBold' : 'regular'"
    >
      {{ label }}
    </MpText>
  </NuxtLink>
</template>

<script setup lang="ts">
import { css, MpIcon, MpText, type IconName } from "@mekari/pixel3";

interface RailItemProps {
  label: string;
  icon: IconName;
  /** Shown instead of the fill variant when the icon has none (Airene's mark) */
  activeIcon?: IconName;
  to: string;
  isActive?: boolean;
  /** Unread count shown on the icon */
  badge?: number;
}

defineProps<RailItemProps>();

const itemClass = css({
  position: "relative",
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
    outlineColor: "border.focused",
    outlineOffset: "0"
  }
});

// The item is inset 4px in the rail, so -4px puts the marker on the canvas's edge, centred on
// the icon. Brand green, like the active icon; white would vanish on the light canvas.
const indicatorClass = css({
  position: "absolute",
  left: "-4px",
  top: "22px",
  w: "4px",
  h: "0",
  roundedRight: "full",
  bg: "background.brand.bold",
  transform: "translateY(-50%)",
  transition: "height .2s ease",
  "a:not([data-active]):hover > &": { h: "12px" },
  "[data-active] > &": { h: "28px" },
  _motionReduce: { transition: "none" }
});

const iconBoxClass = css({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  w: "9",
  h: "9",
  rounded: "lg",
  transition: "background-color .15s ease",
  _groupHover: { bg: "background.neutral.subtle.hovered" },
  "[data-active] > &": { bg: "background.neutral.subtle.selected" },
  _motionReduce: { transition: "none" }
});

// Pixel keeps its brand icons (Airene) in their own gray; paint them like the other icons.
const iconClass = css({
  "& path[stroke]:not([stroke=none])": { stroke: "currentColor" },
  "& path[fill]:not([fill=none])": { fill: "currentColor" }
});

// Ringed in the canvas colour, so it reads as cut out of the icon's square.
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
  borderColor: "background.neutral.subtle"
});
</script>
