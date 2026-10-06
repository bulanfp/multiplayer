<template>
  <button
    type="button"
    :class="rowClass"
    :data-unread="!item.read || undefined"
    @click="emit('open')"
  >
    <span :class="dotClass" :aria-label="item.read ? undefined : 'Unread'" />
    <MemberAvatar :actor="item.actor" />
    <span :class="bodyClass">
      <MpText>
        <strong>{{ actorName(item.actor) }}</strong> {{ item.text }}
        <template v-if="location"> in {{ location }}</template>
      </MpText>
      <MpFlex v-if="item.excerpt" alignItems="center" gap="1.5" minWidth="0">
        <MpIcon v-if="item.kind === 'output'" name="doc" size="sm" color="icon.brand" />
        <MpIcon v-else-if="item.kind === 'todo'" name="task-todo" size="sm" />
        <MpText size="body-small" color="text.secondary" is-truncated>{{ item.excerpt }}</MpText>
      </MpFlex>
    </span>
    <MpText size="label-small" color="text.secondary" :class="css({ flexShrink: '0' })">
      {{ formatShortTimestamp(item.createdAt) }}
    </MpText>
  </button>
</template>

<script setup lang="ts">
import { css, MpFlex, MpIcon, MpText } from "@mekari/pixel3";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import type { ActivityItem } from "~/data/types";
import { actorName } from "~/utils/directory";
import { formatShortTimestamp } from "~/utils/format";

interface ActivityRowProps {
  item: ActivityItem;
  /** "#qa-release" or a DM name */
  location?: string;
}

defineProps<ActivityRowProps>();
const emit = defineEmits<{ open: [] }>();

const rowClass = css({
  display: "flex",
  alignItems: "flex-start",
  gap: "3",
  w: "full",
  px: "3",
  py: "3",
  textAlign: "left",
  cursor: "pointer",
  borderBottomWidth: "1px",
  borderColor: "border.default",
  _hover: { bg: "background.neutral.hovered" },
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused", outlineOffset: "-2px" },
  "&[data-unread]": { bg: "background.brand", _hover: { bg: "background.brand.hovered" } }
});

const dotClass = css({
  flexShrink: "0",
  w: "2",
  h: "2",
  mt: "3",
  rounded: "full",
  "[data-unread] &": { bg: "background.brand.bold" }
});

const bodyClass = css({ display: "flex", flexDirection: "column", gap: "1", flex: "1", minW: "0" });
</script>
