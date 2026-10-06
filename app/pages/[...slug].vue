<template>
  <div :class="pageClass">
    <PageHeader :title="title" />
    <PageContent>
      <MpText color="text.secondary">{{ title }} isn’t designed yet.</MpText>
    </PageContent>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { css, MpText } from "@mekari/pixel3";
import PageContent from "~/components/layout/PageContent.vue";
import PageHeader from "~/components/layout/PageHeader.vue";

// Placeholder for nav destinations that have no design yet (Library, Agents, …).
const route = useRoute();

const title = computed(() => {
  const segments = ([] as string[]).concat(route.params.slug ?? []);
  const last = segments.filter(Boolean).at(-1) ?? "Page";
  return last.replace(/-/g, " ").replace(/^\w/, (char) => char.toUpperCase());
});

useHead({ title });

const pageClass = css({ display: "flex", flexDirection: "column", flex: "1", minH: "0" });
</script>
