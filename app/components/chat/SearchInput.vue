<template>
  <MpInputGroup :id="`${id}-group`">
    <MpInputLeftAddon :id="`${id}-addon`">
      <MpIcon name="search" size="sm" color="icon.default" />
    </MpInputLeftAddon>
    <MpInput :id="id" v-model="model" :placeholder="placeholder" :class="inputClass" />
  </MpInputGroup>
</template>

<script setup lang="ts">
import { css, MpIcon, MpInput, MpInputGroup, MpInputLeftAddon } from "@mekari/pixel3";

interface SearchInputProps {
  /** Input id; the group and addon ids derive from it */
  id: string;
  /** Placeholder text */
  placeholder?: string;
}

withDefaults(defineProps<SearchInputProps>(), { placeholder: "Search" });

const model = defineModel<string>({ default: "" });

// Pixel pads 46px for the addon; the design sits the placeholder closer to the icon.
const inputClass = css({
  rounded: "full",
  pl: "10 !important",
  _placeholder: { color: "text.placeholder" }
});
</script>
