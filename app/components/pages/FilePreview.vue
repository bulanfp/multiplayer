<template>
  <PreviewPane :label="file ? `${file.name} preview` : 'Preview'">
    <template v-if="file">
      <header :class="headerClass">
        <span :class="iconTileClass">
          <MpIcon :name="FILE_TYPES[file.type].icon" size="md" color="icon.default" />
        </span>
        <MpFlex direction="column" gap="1" minWidth="0" flex="1">
          <MpText size="h3" is-truncated>{{ file.name }}</MpText>
          <MpText size="label-small" color="text.secondary">
            {{ FILE_TYPES[file.type].label }} · {{ file.size }}
            <template v-if="pageCount > 1">· {{ pageCount }} pages</template>
            · {{ getPerson(file.uploadedBy)?.name ?? "Someone" }},
            {{ formatTimestamp(file.uploadedAt) }}
            <template v-if="source">
              · in <NuxtLink :to="source.to" :class="linkClass">{{ source.label }}</NuxtLink>
            </template>
          </MpText>
        </MpFlex>
        <MpButton
          is-rounded
          variant="ghost"
          size="sm"
          left-icon="close"
          aria-label="Close preview"
          @click="emit('close')"
        />
      </header>

      <!-- ═════ Preview ═════ -->
      <div ref="bodyRef" :class="bodyClass" :data-kind="kind">
        <!-- Attached in this session: the browser shows the real file -->
        <iframe
          v-if="kind === 'pdf-file'"
          :src="file.previewUrl"
          :title="file.name"
          :class="frameClass"
        />
        <img
          v-else-if="kind === 'image-file'"
          :src="file.previewUrl"
          :alt="file.name"
          :class="imageClass"
        />

        <!-- Seeded files: mock renders of the pages -->
        <template v-else-if="kind === 'pages'">
          <img
            v-for="(page, index) in file.previewPages"
            :key="page"
            :src="page"
            :alt="pageCount > 1 ? `${file.name}, page ${index + 1} of ${pageCount}` : file.name"
            :class="file.type === 'image' ? imageClass : pageClass"
          />
        </template>

        <div v-else :class="emptyClass">
          <span :class="iconTileClass">
            <MpIcon :name="FILE_TYPES[file.type].icon" size="md" color="icon.default" />
          </span>
          <MpText weight="semiBold">No preview for this file</MpText>
          <MpText color="text.secondary">
            Only PDFs and images open here. Open this one from the message it was shared in.
          </MpText>
          <NuxtLink v-if="source" :to="source.to" :class="linkClass">
            Go to {{ source.label }}
          </NuxtLink>
        </div>
      </div>
    </template>
  </PreviewPane>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { css, MpButton, MpFlex, MpIcon, MpText } from "@mekari/pixel3";
import PreviewPane from "~/components/layout/PreviewPane.vue";
import { useChatStore } from "~/composables/useChatStore";
import { getPerson } from "~/data/people";
import { FILE_TYPES } from "~/utils/files";
import { formatTimestamp } from "~/utils/format";

interface FilePreviewProps {
  fileId: string;
  /** The conversation it was shared in, linked from the header */
  source?: { label: string; to: string };
}

const props = defineProps<FilePreviewProps>();
const emit = defineEmits<{ close: [] }>();

const { getFile } = useChatStore();

const file = computed(() => getFile(props.fileId));

// The Library swaps files in place, so a new file starts from its first page.
const bodyRef = ref<HTMLElement | null>(null);
watch(
  () => props.fileId,
  () => bodyRef.value?.scrollTo({ top: 0 })
);

const pageCount = computed(() => file.value?.previewPages?.length ?? 0);

/** What the body shows: the real attached file, mock pages, or nothing to preview. */
const kind = computed(() => {
  if (!file.value) return "none";
  if (file.value.previewUrl) return file.value.type === "pdf" ? "pdf-file" : "image-file";
  return pageCount.value ? "pages" : "none";
});

const headerClass = css({
  display: "flex",
  alignItems: "flex-start",
  gap: "3",
  px: "6",
  py: "4",
  borderBottomWidth: "1px",
  borderColor: "border.default"
});

const iconTileClass = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: "0",
  w: "10",
  h: "10",
  rounded: "md",
  bg: "background.neutral.subtle"
});

// Pages sit on a quiet backdrop, like a PDF viewer.
const bodyClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "4",
  flex: "1",
  minH: "0",
  overflowY: "auto",
  p: "5",
  bg: "background.neutral.subtle",
  "&[data-kind=pdf-file]": { p: "0" },
  "&[data-kind=none]": { justifyContent: "center", bg: "background.neutral" }
});

const pageClass = css({
  w: "full",
  h: "auto",
  bg: "background.neutral",
  borderWidth: "1px",
  borderColor: "border.default",
  rounded: "sm",
  boxShadow: "0 1px 3px 0 token(colors.neutral.200a)"
});

const imageClass = css({ maxW: "full", h: "auto", rounded: "md" });

const frameClass = css({ w: "full", h: "full", flex: "1", borderWidth: "0" });

const emptyClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2",
  maxW: "320px",
  textAlign: "center"
});

// Enterprise links are green: text.selected, since Pixel's text.link stays blue there.
const linkClass = css({
  color: "text.selected",
  textDecoration: "none",
  _hover: { textDecoration: "underline" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused", rounded: "sm" }
});
</script>
