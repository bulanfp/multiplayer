<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { usePixelTheme } from "@mekari/pixel3";
import { PRODUCT_NAME } from "~/data/constants";

const { setNextTheme, setDarkMode, setProductTheme } = usePixelTheme();

setNextTheme(true); // Enable Design Token 2.4
setProductTheme("enterprise"); // Enable Enterprise product theme (requires Token 2.4)
setDarkMode(false); // Enable Dark Mode

useHead({
  titleTemplate: (title) => (title ? `${title} · ${PRODUCT_NAME}` : PRODUCT_NAME)
});
</script>

<style>
/* Pixel colours secondary and text-link buttons with text.link, which stays dark blue (#165082)
   in the enterprise theme. Mekari's enterprise designs draw secondary buttons as a neutral
   outline (dark label, bold grey border) and text links in the enterprise green. Pixel's styles
   sit in cascade layers, so these unlayered rules win in every state. Disabled buttons keep
   Pixel's styles, and a focused secondary button keeps its focus border. */
[data-product-theme="enterprise"]
  .mp-button--variant_secondary:not(
    :disabled,
    [disabled],
    [aria-disabled="true"],
    [data-disabled]
  ) {
  color: var(--mp-colors-text-default);
}

[data-product-theme="enterprise"]
  .mp-button--variant_secondary:not(
    :disabled,
    [disabled],
    [aria-disabled="true"],
    [data-disabled],
    :focus-visible,
    [data-focus-visible]
  ) {
  border-color: var(--mp-colors-border-bold);
}

[data-product-theme="enterprise"]
  .mp-button--variant_textLink:not(:disabled, [disabled], [aria-disabled="true"], [data-disabled]) {
  color: var(--mp-colors-text-selected);
}
</style>
