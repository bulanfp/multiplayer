<template>
  <!-- A connector's logo on a soft tile, the same 32px as avatars in the rows beside it -->
  <span v-if="connector" :class="tileClass" aria-hidden="true">
    <MpIcon v-if="connector.icon" :name="connector.icon" size="20px" />
    <img v-else-if="connector.image" :src="connector.image" alt="" :class="imageClass" />
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { css, MpIcon } from "@mekari/pixel3";
import { getConnector } from "~/data/connectors";
import type { ConnectorId } from "~/data/types";

interface ConnectorLogoProps {
  connectorId: ConnectorId;
}

const props = defineProps<ConnectorLogoProps>();

const connector = computed(() => getConnector(props.connectorId));

const tileClass = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: "0",
  w: "8",
  h: "8",
  rounded: "md",
  bg: "background.neutral.subtle"
});

const imageClass = css({ w: "20px", h: "20px" });
</script>
