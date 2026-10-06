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
