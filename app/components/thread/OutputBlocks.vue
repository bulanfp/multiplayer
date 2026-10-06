<template>
  <div :class="rootClass">
    <template v-for="(block, index) in blocks" :key="index">
      <MpText v-if="block.type === 'heading'" as="h3" size="h3" :class="headingClass">
        {{ block.text }}
      </MpText>
      <MpText v-else-if="block.type === 'paragraph'" as="p" :class="paragraphClass">
        {{ block.text }}
      </MpText>
      <ul v-else :class="listClass">
        <li v-for="item in block.items" :key="item">
          <MpText as="span">{{ item }}</MpText>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
import { css, MpText } from "@mekari/pixel3";
import type { OutputBlock } from "~/data/types";

defineProps<{ blocks: OutputBlock[] }>();

const rootClass = css({ display: "flex", flexDirection: "column" });

const headingClass = css({ mt: "6", mb: "2", _first: { mt: "0" } });

const paragraphClass = css({ lineHeight: "xl" });

const listClass = css({
  display: "flex",
  flexDirection: "column",
  gap: "1.5",
  pl: "5",
  listStyleType: "disc",
  "& li::marker": { color: "text.secondary" }
});
</script>
