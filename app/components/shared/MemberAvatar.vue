<template>
  <img
    v-if="agent?.icon"
    :src="agent.icon"
    :alt="agent.name"
    :class="agentIconClass"
    :data-size="size"
  />
  <span
    v-else-if="agent"
    role="img"
    :aria-label="agent.name"
    :class="agentTileClass"
    :data-size="size"
    :data-color="agent.color"
  >
    {{ agent.initials }}
  </span>
  <MpAvatar
    v-else-if="person"
    :name="person.name"
    :src="person.avatar"
    :size="size === 'lg' ? 'lg' : 'md'"
    :variant-color="person.color"
    :class="personClass"
    :data-size="size"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { css, MpAvatar } from "@mekari/pixel3";
import { getAgent } from "~/data/agents";
import { getPerson } from "~/data/people";
import type { Actor } from "~/data/types";

interface MemberAvatarProps {
  /** Person or agent to show */
  actor: Actor;
  /** xs 20px · sm 24px · md 32px · lg 36px */
  size?: "xs" | "sm" | "md" | "lg";
}

const props = withDefaults(defineProps<MemberAvatarProps>(), { size: "md" });

const agent = computed(() => (props.actor.kind === "agent" ? getAgent(props.actor.id) : undefined));
const person = computed(() =>
  props.actor.kind === "person" ? getPerson(props.actor.id) : undefined
);

const SIZES = {
  "&[data-size=xs]": { w: "20px", h: "20px", fontSize: "9px" },
  "&[data-size=sm]": { w: "6", h: "6", fontSize: "10px" },
  "&[data-size=md]": { w: "8", h: "8", fontSize: "xs" },
  "&[data-size=lg]": { w: "9", h: "9", fontSize: "sm" }
};

const agentIconClass = css({ flexShrink: "0", objectFit: "contain", ...SIZES });

// Agents are squares so they read differently from people at a glance.
const agentTileClass = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: "0",
  rounded: "md",
  color: "text.inverse.static",
  fontWeight: "semiBold",
  lineHeight: "1",
  ...SIZES,
  "&[data-color=violet]": { bg: "violet.700" },
  "&[data-color=fuchsia]": { bg: "fuchsia.600" },
  "&[data-color=indigo]": { bg: "indigo.700" },
  "&[data-color=teal]": { bg: "teal.700" },
  "&[data-color=orange]": { bg: "orange.600" },
  "&[data-color=blue]": { bg: "blue.600" },
  "&[data-color=green]": { bg: "green.700" }
});

// MpAvatar's own md is 24px, so md is pinned to 32px to match agents.
const personClass = css({
  flexShrink: "0",
  "&[data-size=xs]": { w: "20px !important", h: "20px !important", fontSize: "9px !important" },
  "&[data-size=sm]": { w: "6 !important", h: "6 !important", fontSize: "10px !important" },
  "&[data-size=md]": { w: "8 !important", h: "8 !important", fontSize: "xs !important" }
});
</script>
