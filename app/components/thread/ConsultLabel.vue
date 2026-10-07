<template>
  <!-- Above messages one agent got from others: "Messages from 🟣 Copywriter and 🟢 Analyst".
       The spaces are real text, so it reads as a sentence; the flex gap sets the spacing. -->
  <p :class="labelClass">
    <MpText as="span" size="body-small" color="text.secondary">Messages from</MpText>
    {{ " " }}
    <template v-for="(agentId, index) in agentIds" :key="agentId">
      <template v-if="index > 0 && index === agentIds.length - 1">
        {{ " " }}
        <MpText as="span" size="body-small" color="text.secondary">and</MpText>
      </template>
      <template v-if="index > 0">{{ " " }}</template>
      <span :class="nameClass">
        <MemberAvatar :actor="{ kind: 'agent', id: agentId }" size="xs" />
        <!-- "A, B and C": the comma sits on the name before it -->
        <MpText as="span" size="body-small">
          {{ getAgent(agentId)?.name ?? agentId }}{{ index < agentIds.length - 2 ? "," : "" }}
        </MpText>
      </span>
    </template>
  </p>
</template>

<script setup lang="ts">
import { css, MpText } from "@mekari/pixel3";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import { getAgent } from "~/data/agents";

interface ConsultLabelProps {
  /** The agents that answered, in order */
  agentIds: string[];
}

defineProps<ConsultLabelProps>();

// Centred like the day dividers, as in the reference: a quiet line naming who joined in.
const labelClass = css({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  columnGap: "1.5",
  rowGap: "1"
});

const nameClass = css({ display: "inline-flex", alignItems: "center", gap: "1" });
</script>
