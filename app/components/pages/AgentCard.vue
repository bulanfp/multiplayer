<template>
  <article :class="cardClass">
    <div :class="topClass">
      <img v-if="agent.icon" :src="agent.icon" alt="" :class="iconClass" />
      <MemberAvatar v-else :actor="{ kind: 'agent', id: agent.id }" size="lg" />
    </div>

    <NuxtLink :to="to" :class="nameLinkClass">
      <MpText as="span" size="h3">{{ agent.name }}</MpText>
    </NuxtLink>
    <MpText color="text.secondary" is-truncated line-clamp="3">{{ agent.description }}</MpText>

    <!-- Pinned to the bottom of the cell, so these line up across a row -->
    <div :class="footerClass">
      <MpText size="label-small" color="text.secondary">
        {{ lastActiveAt ? `Used ${formatAgo(lastActiveAt)}` : "Not used yet" }}
      </MpText>
      <MpButton
        is-rounded
        variant="secondary"
        size="sm"
        :aria-label="`Message ${agent.name}`"
        :class="messageButtonClass"
        @click="emit('message')"
      >
        Message
      </MpButton>
    </div>
  </article>
</template>

<script setup lang="ts">
import { css, MpButton, MpText } from "@mekari/pixel3";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import type { Agent } from "~/data/types";
import { formatAgo } from "~/utils/format";

interface AgentCardProps {
  agent: Agent;
  /** The agent's detail page */
  to: string;
  /** Its latest message anywhere, if any */
  lastActiveAt?: string;
}

defineProps<AgentCardProps>();
const emit = defineEmits<{ message: [] }>();

// One cell of the grid: lines on the right and bottom, the whole cell opens the agent.
const cardClass = css({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gap: "2",
  h: "full",
  p: "6",
  borderRightWidth: "1px",
  borderBottomWidth: "1px",
  borderColor: "border.default",
  transition: "background-color .15s ease",
  _hover: { bg: "background.neutral.hovered" },
  "&:has(a:focus-visible)": {
    outline: "2px solid",
    outlineColor: "border.focused",
    outlineOffset: "-2px"
  }
});

const topClass = css({ display: "flex", alignItems: "flex-start", mb: "2" });

const iconClass = css({ w: "64px", h: "64px", objectFit: "contain" });

const footerClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "3",
  mt: "auto",
  pt: "2"
});

// Above the card-wide link so the click starts a chat instead of opening the agent's page.
const messageButtonClass = css({ position: "relative", zIndex: "1" });

const nameLinkClass = css({
  color: "text.default",
  textDecoration: "none",
  _focusVisible: { outline: "none" },
  _after: { content: '""', position: "absolute", inset: "0" }
});
</script>
