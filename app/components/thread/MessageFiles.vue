<template>
  <!-- Files attached to a message; they're also listed in the Library -->
  <ul v-if="files.length" :class="filesClass" aria-label="Attachments">
    <li v-for="file in files" :key="file.id" :class="fileClass">
      <span :class="fileIconClass">
        <MpIcon :name="FILE_TYPES[file.type].icon" size="md" color="icon.default" />
      </span>
      <span :class="fileTextClass">
        <MpText weight="semiBold" is-truncated>{{ file.name }}</MpText>
        <MpText size="label-small" color="text.secondary">
          {{ FILE_TYPES[file.type].label }} · {{ file.size }}
        </MpText>
      </span>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { css, MpIcon, MpText } from "@mekari/pixel3";
import { useChatStore } from "~/composables/useChatStore";
import type { LibraryFile } from "~/data/types";
import { FILE_TYPES } from "~/utils/files";

interface MessageFilesProps {
  fileIds?: string[];
}

const props = defineProps<MessageFilesProps>();

const { getFile } = useChatStore();

const files = computed(() =>
  (props.fileIds ?? [])
    .map((id) => getFile(id))
    .filter((file): file is LibraryFile => Boolean(file))
);

const filesClass = css({ display: "flex", flexWrap: "wrap", gap: "2", mt: "2" });

// Quieter than an output card: a file you can't open here, so no hover or chevron.
const fileClass = css({
  display: "flex",
  alignItems: "center",
  gap: "3",
  w: "280px",
  maxW: "full",
  p: "3",
  rounded: "lg",
  borderWidth: "1px",
  borderColor: "border.default",
  bg: "background.neutral"
});

const fileIconClass = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: "0",
  w: "10",
  h: "10",
  rounded: "md",
  bg: "background.neutral.subtle"
});

const fileTextClass = css({ display: "flex", flexDirection: "column", flex: "1", minW: "0" });
</script>
