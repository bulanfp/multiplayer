<template>
  <li :class="rowClass" :data-done="todo.done || undefined">
    <MpCheckbox
      :id="`todo-${todo.id}`"
      :is-checked="todo.done"
      :aria-label="todo.done ? `Mark “${todo.title}” as open` : `Mark “${todo.title}” as done`"
      @change="emit('toggle')"
    />
    <MpFlex direction="column" gap="0.5" flex="1" minWidth="0">
      <MpText :class="titleClass">{{ todo.title }}</MpText>
      <MpText size="label-small" color="text.secondary">
        <template v-if="sourceLabel && sourcePath">
          From <NuxtLink :to="sourcePath" :class="linkClass">{{ sourceLabel }}</NuxtLink> ·
        </template>
        <template v-if="todo.done && todo.doneBy && todo.doneAt">
          Done by {{ getPerson(todo.doneBy)?.name }}, {{ formatDate(todo.doneAt) }}
        </template>
        <template v-else>
          Created by {{ actorName(todo.createdBy) }}, {{ formatDate(todo.createdAt) }}
        </template>
      </MpText>
    </MpFlex>
    <MpText
      v-if="todo.due && !todo.done"
      size="label-small"
      :color="due?.isOverdue ? 'text.danger' : 'text.secondary'"
      :class="css({ flexShrink: '0' })"
    >
      {{ due?.label }}
    </MpText>
    <MpFlex alignItems="center" gap="2" width="160px" flexShrink="0">
      <MemberAvatar :actor="{ kind: 'person', id: todo.assigneeId }" size="sm" />
      <MpText size="body-small" is-truncated>{{ getPerson(todo.assigneeId)?.name }}</MpText>
    </MpFlex>
  </li>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { css, MpCheckbox, MpFlex, MpText } from "@mekari/pixel3";
import MemberAvatar from "~/components/shared/MemberAvatar.vue";
import { getPerson } from "~/data/people";
import type { Todo } from "~/data/types";
import { actorName } from "~/utils/directory";
import { formatDate, formatDue } from "~/utils/format";

interface TodoRowProps {
  todo: Todo;
  /** "#qa-release" or a DM name */
  sourceLabel?: string;
  sourcePath?: string;
}

const props = defineProps<TodoRowProps>();
const emit = defineEmits<{ toggle: [] }>();

const due = computed(() => (props.todo.due ? formatDue(props.todo.due) : undefined));

const rowClass = css({
  display: "flex",
  alignItems: "center",
  gap: "4",
  py: "3",
  borderBottomWidth: "1px",
  borderColor: "border.default"
});

const titleClass = css({
  "[data-done] &": { textDecoration: "line-through", color: "text.secondary" }
});

// Enterprise links are green: text.selected, since Pixel's text.link stays blue there.
const linkClass = css({
  color: "text.selected",
  textDecoration: "none",
  _hover: { textDecoration: "underline" }
});
</script>
