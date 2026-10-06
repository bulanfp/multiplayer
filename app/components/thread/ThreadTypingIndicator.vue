<template>
  <div :class="rowClass" role="status">
    <MpFlex gap="1">
      <MemberAvatar v-for="id in agentIds" :key="id" :actor="{ kind: 'agent', id }" size="sm" />
    </MpFlex>
    <MpText size="body-small" color="text.secondary">{{ label }}</MpText>
    <span class="typing-dots" aria-hidden="true"><span /><span /><span /></span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { css, MpFlex, MpText } from "@mekari/pixel3";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import { getAgent } from "~/data/agents";

const props = defineProps<{ agentIds: string[] }>();

const label = computed(() => {
  const names = props.agentIds.map((id) => getAgent(id)?.name ?? "An agent");
  if (names.length === 1) return `${names[0]} is writing`;
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)} are writing`;
});

const rowClass = css({ display: "flex", alignItems: "center", gap: "2", px: "6", py: "2" });
</script>

<style scoped>
.typing-dots {
  display: inline-flex;
  gap: 3px;
}

.typing-dots span {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: currentColor;
  color: var(--mp-colors-icon-default, #536062);
  animation: typing-bounce 1.2s ease-in-out infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.15s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes typing-bounce {
  0%,
  60%,
  100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-3px);
  }
}
</style>
