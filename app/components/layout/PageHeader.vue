<template>
  <div :class="headerClass">
    <div :class="titleBlockClass">
      <!-- Where this page sits, e.g. "Agents" above an agent's name -->
      <MpText v-if="parent" size="label-small">
        <NuxtLink :to="parent.to" :class="parentLinkClass">{{ parent.label }}</NuxtLink>
      </MpText>
      <div :class="titleGroupClass">
        <span v-if="$slots.leading" :class="leadingClass">
          <slot name="leading" />
        </span>
        <!-- A page can make its title interactive, e.g. a group's name opens Rename -->
        <slot name="title">
          <MpText as="h1" size="h1" is-truncated :class="css({ flexShrink: '0', maxW: 'full' })">
            {{ title }}
          </MpText>
        </slot>
        <MpText v-if="subtitle" color="text.secondary" is-truncated :class="css({ minW: '0' })">
          {{ subtitle }}
        </MpText>
      </div>
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
  /** Link back to the page this one belongs to */
  parent?: { label: string; to: string };
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

const titleBlockClass = css({ display: "flex", flexDirection: "column", gap: "0.5", minW: "0" });

// Enterprise links are green: text.selected, since Pixel's text.link stays blue there.
const parentLinkClass = css({
  color: "text.selected",
  textDecoration: "none",
  _hover: { textDecoration: "underline" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused", rounded: "sm" }
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
