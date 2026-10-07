<template>
  <PreviewPane :label="output ? `${output.title} canvas` : 'Canvas'">
    <!-- Claude-style canvas: read-only and versioned; PreviewPane holds the width and resizing -->
    <template v-if="output && current">
      <header :class="headerClass">
        <MpFlex direction="column" gap="1" minWidth="0" flex="1">
          <MpText size="h3" is-truncated>{{ output.title }}</MpText>
          <MpText size="label-small" color="text.secondary">
            {{ output.kind }} · Updated by {{ getAgent(current.agentId)?.name ?? "an agent" }},
            {{ formatTimestamp(current.createdAt) }}
            <template v-if="sourceLabel">· {{ sourceLabel }}</template>
          </MpText>
        </MpFlex>

        <MpFlex alignItems="center" gap="1" flexShrink="0">
          <SelectPopover
            v-if="output.versions.length > 1"
            id="canvas-version"
            label="Version"
            size="sm"
            placement="bottom-end"
            :model-value="version"
            :options="versionOptions"
            @update:model-value="emit('update:version', $event)"
          />
          <MpText v-else size="label-small" color="text.secondary" :class="css({ px: '2' })">
            v1
          </MpText>
          <MpButton
            is-rounded
            variant="ghost"
            size="sm"
            left-icon="copy"
            aria-label="Copy"
            @click="copy"
          />
          <MpButton
            is-rounded
            variant="ghost"
            size="sm"
            left-icon="close"
            aria-label="Close canvas"
            @click="emit('close')"
          />
        </MpFlex>
      </header>

      <div :class="bodyClass">
        <OutputBlocks :blocks="current.blocks" />
        <MpText size="body-small" color="text.secondary" :class="css({ mt: '8' })">
          Want changes? Ask {{ getAgent(current.agentId)?.name ?? "the agent" }} in the chat and it
          will make a new version.
        </MpText>
      </div>
    </template>
  </PreviewPane>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { css, MpButton, MpFlex, MpText } from "@mekari/pixel3";
import PreviewPane from "~/components/layout/PreviewPane.vue";
import SelectPopover from "~/components/shared/SelectPopover.vue";
import OutputBlocks from "~/components/thread/OutputBlocks.vue";
import { useChatStore } from "~/composables/useChatStore";
import { getAgent } from "~/data/agents";
import { formatDateTime, formatTimestamp } from "~/utils/format";
import { copyOutput } from "~/utils/outputs";

interface OutputCanvasProps {
  outputId: string;
  /** 1-based version on screen */
  version: number;
  /** Where the output came from, shown in the Library, e.g. "from ✍️ Holiday Blend copy" */
  sourceLabel?: string;
}

const props = defineProps<OutputCanvasProps>();
const emit = defineEmits<{ close: []; "update:version": [version: number] }>();

const { getOutput } = useChatStore();

const output = computed(() => getOutput(props.outputId));
const current = computed(
  () => output.value?.versions[props.version - 1] ?? output.value?.versions.at(-1)
);

// Newest first, as version histories read, with when each one was made.
const versionOptions = computed(() => {
  const versions = output.value?.versions ?? [];
  return versions.map((entry, index) => {
    const made = formatDateTime(entry.createdAt);
    return {
      value: index + 1,
      label: `v${index + 1}`,
      description: index === versions.length - 1 ? `Latest · ${made}` : made
    };
  });
});

function copy() {
  if (output.value) copyOutput(output.value, props.version);
}

const headerClass = css({
  display: "flex",
  alignItems: "flex-start",
  gap: "3",
  px: "6",
  py: "4",
  borderBottomWidth: "1px",
  borderColor: "border.default"
});

const bodyClass = css({ flex: "1", minH: "0", overflowY: "auto", px: "6", py: "5" });
</script>
