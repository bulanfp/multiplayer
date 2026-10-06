<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { usePixelTheme } from "@mekari/pixel3";

const { setNextTheme, setDarkMode } = usePixelTheme();

setNextTheme(true); // Enable Design Token 2.4
setDarkMode(false); // Enable Dark Mode
</script>
