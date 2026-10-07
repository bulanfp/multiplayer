<template>
  <div :class="barClass">
    <MpFlex direction="column" gap="0.5" minWidth="0">
      <MpText weight="semiBold">You're viewing {{ channelName }}</MpText>
      <MpText size="body-small" color="text.secondary">
        Join to send messages and bring in this group's agents.
      </MpText>
    </MpFlex>
    <MpButton is-rounded @click="emit('join')">Join group</MpButton>
  </div>
</template>

<script setup lang="ts">
import { css, MpButton, MpFlex, MpText } from "@mekari/pixel3";

defineProps<{ channelName: string }>();
const emit = defineEmits<{ join: [] }>();

const barClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "4",
  px: "4",
  py: "3",
  rounded: "lg",
  bg: "background.neutral.subtle",
  borderWidth: "1px",
  borderColor: "border.default"
});
</script>
