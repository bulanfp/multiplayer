<template>
  <span
    :class="avatarClass"
    :data-color="workspace.color"
    :data-size="size"
    :data-emoji="Boolean(workspace.emoji) || undefined"
    aria-hidden="true"
  >
    {{ workspace.emoji || workspace.initials }}
  </span>
</template>

<script setup lang="ts">
import { css } from "@mekari/pixel3";
import type { Workspace } from "~/data/types";

interface ProjectAvatarProps {
  workspace: Pick<Workspace, "initials" | "color" | "emoji">;
  /** sm 28px in lists · md 40px in the rail */
  size?: "sm" | "md";
}

withDefaults(defineProps<ProjectAvatarProps>(), { size: "md" });

const avatarClass = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: "0",
  color: "text.inverse.static",
  fontWeight: "semiBold",
  lineHeight: "1",
  "&[data-size=sm]": { w: "7", h: "7", rounded: "md", fontSize: "xs" },
  "&[data-size=md]": { w: "10", h: "10", rounded: "lg", fontSize: "md" },
  "&[data-color=teal]": { bg: "background.brand.bold" },
  "&[data-color=amber]": { bg: "orange.600" },
  "&[data-color=violet]": { bg: "violet.700" },
  "&[data-color=sky]": { bg: "blue.600" },
  // An emoji sits on a light tint of the project colour so it stays readable.
  "&[data-emoji][data-size=sm]": { fontSize: "lg" },
  "&[data-emoji][data-size=md]": { fontSize: "xl" },
  "&[data-emoji][data-color=teal]": { bg: "teal.200" },
  "&[data-emoji][data-color=amber]": { bg: "orange.200" },
  "&[data-emoji][data-color=violet]": { bg: "violet.200" },
  "&[data-emoji][data-color=sky]": { bg: "blue.200" }
});
</script>
