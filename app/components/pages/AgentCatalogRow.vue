<template>
  <li :class="rowClass">
    <MemberAvatar :actor="{ kind: 'agent', id: agent.id }" size="lg" />
    <MpFlex direction="column" gap="0.5" flex="1" minWidth="0">
      <MpText weight="semiBold">{{ agent.name }}</MpText>
      <MpText size="body-small" color="text.secondary">
        {{ agent.role }} · {{ agent.description }}
      </MpText>
    </MpFlex>
    <slot />
  </li>
</template>

<script setup lang="ts">
import { css, MpFlex, MpText } from "@mekari/pixel3";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import type { Agent } from "~/data/types";

defineProps<{ agent: Agent }>();

const rowClass = css({
  display: "flex",
  alignItems: "center",
  gap: "4",
  py: "4",
  borderBottomWidth: "1px",
  borderColor: "border.default"
});
</script>
