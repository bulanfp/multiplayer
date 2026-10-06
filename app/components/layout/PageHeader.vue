<template>
  <div :class="headerClass">
    <div :class="titleGroupClass">
      <span v-if="$slots.leading" :class="leadingClass">
        <slot name="leading" />
      </span>
      <MpText as="h1" size="h1" is-truncated :class="css({ flexShrink: '0', maxW: 'full' })">
        {{ title }}
      </MpText>
      <MpText v-if="subtitle" color="text.secondary" is-truncated :class="css({ minW: '0' })">
        {{ subtitle }}
      </MpText>
    </div>

    <div :class="actionsClass">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { css, MpText } from "@mekari/pixel3";

interface PageHeaderProps {
  /** Page title (h1) */
  title: string;
  /** Quiet text after the title, e.g. a group description */
  subtitle?: string;
}

defineProps<PageHeaderProps>();

const headerClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "4",
  flexShrink: "0",
  h: "72px",
  // Design keeps the action ~20px from the edge but the title 24px in.
  pl: "6",
  pr: "5"
});

const titleGroupClass = css({
  display: "flex",
  alignItems: "baseline",
  gap: "3",
  minW: "0"
});

// An avatar or icon before the title (e.g. who a direct message is with), centred on it.
const leadingClass = css({
  display: "inline-flex",
  alignSelf: "center",
  flexShrink: "0",
  mr: "-1"
});

const actionsClass = css({ display: "flex", alignItems: "center", gap: "2", flexShrink: "0" });
</script>
