<template>
  <!-- An unnamed group's icon, where a named group shows its emoji: two of its members, one
       up and left, the other down and right over it -->
  <span :class="rootClass" :data-size="size" aria-hidden="true">
    <span
      v-for="(actor, index) in faces"
      :key="`${actor.kind}-${actor.id}`"
      :class="faceClass"
      :data-kind="actor.kind"
      :data-size="size"
      :data-second="index === 1 || undefined"
      :data-alone="faces.length === 1 || undefined"
    >
      <MemberAvatar :actor="actor" :size="faceSize" />
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { css } from "@mekari/pixel3";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import { unnamedGroupFaces } from "~/utils/group-name";

interface GroupFacesProps {
  /** The group's people; you're left out */
  personIds: string[];
  agentIds: string[];
  /** sm fills the 24px slot of a group's emoji in lists; lg is 36px, for the page header */
  size?: "sm" | "lg";
}

const props = withDefaults(defineProps<GroupFacesProps>(), { size: "sm" });

const faces = computed(() => unnamedGroupFaces(props.personIds, props.agentIds));

// A pair is two-thirds the slot each; a lone face fills it.
const faceSize = computed(() => {
  if (faces.value.length === 1) return props.size === "lg" ? "lg" : "sm";
  return props.size === "lg" ? "sm" : "xxs";
});

const rootClass = css({
  position: "relative",
  display: "inline-block",
  flexShrink: "0",
  w: "6",
  h: "6",
  "&[data-size=lg]": { w: "9", h: "9" }
});

// Circles with a ring in the canvas colour, so the pair reads as two. People fill theirs; an
// agent's 3D icon sits inset on Pixel's soft AI background, as in the members button.
const faceClass = css({
  position: "absolute",
  top: "0",
  left: "0",
  display: "inline-flex",
  rounded: "full",
  overflow: "hidden",
  boxShadow: "0 0 0 1.5px token(colors.background.neutral.subtle)",
  "&[data-second]": { top: "auto", left: "auto", right: "0", bottom: "0" },
  "&[data-alone]": { boxShadow: "none" },
  "&[data-kind=agent]": { bg: "background.airene" },
  "&[data-kind=agent] > img": { p: "1px" },
  "&[data-kind=agent][data-size=lg] > img": { p: "3px" }
});
</script>
