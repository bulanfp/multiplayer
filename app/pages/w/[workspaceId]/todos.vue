<template>
  <div v-if="workspace" :class="pageClass">
    <PageHeader title="Todos">
      <template #actions>
        <MpButton is-rounded left-icon="add" @click="isAddOpen = true">Add todo</MpButton>
      </template>
    </PageHeader>

    <PageContent>
      <MpTabs id="todo-tabs" v-model="tab" is-manual :has-margin-bottom="false">
        <MpTabList>
          <MpTab>Assigned to me ({{ openCount(true) }})</MpTab>
          <MpTab>All ({{ openCount(false) }})</MpTab>
        </MpTabList>
      </MpTabs>

      <!-- ═════ Open ═════ -->
      <ul v-if="openTodos.length" :class="css({ mt: '2' })">
        <TodoRow
          v-for="todo in openTodos"
          :key="todo.id"
          :todo="todo"
          :source-label="sourceLabel(todo.source?.threadId)"
          :source-path="sourcePath(todo.source?.threadId)"
          @toggle="toggleTodo(todo.id)"
        />
      </ul>
      <MpFlex v-else direction="column" alignItems="center" gap="1" paddingY="10">
        <MpText weight="semiBold">You're all caught up</MpText>
        <MpText color="text.secondary">
          Todos from your groups show up here, including the ones agents add.
        </MpText>
      </MpFlex>

      <!-- ═════ Done ═════ -->
      <template v-if="doneTodos.length">
        <MpButton
          is-rounded
          variant="ghost"
          size="sm"
          :right-icon="isDoneOpen ? 'chevrons-up' : 'chevrons-down'"
          :class="css({ mt: '6' })"
          :aria-expanded="isDoneOpen"
          @click="isDoneOpen = !isDoneOpen"
        >
          Done ({{ doneTodos.length }})
        </MpButton>
        <ul v-if="isDoneOpen">
          <TodoRow
            v-for="todo in doneTodos"
            :key="todo.id"
            :todo="todo"
            :source-label="sourceLabel(todo.source?.threadId)"
            :source-path="sourcePath(todo.source?.threadId)"
            @toggle="toggleTodo(todo.id)"
          />
        </ul>
      </template>
    </PageContent>

    <AddTodoModal :is-open="isAddOpen" :workspace="workspace" @close="isAddOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { css, MpButton, MpFlex, MpTab, MpTabList, MpTabs, MpText } from "@mekari/pixel3";
import PageContent from "~/components/layout/PageContent.vue";
import PageHeader from "~/components/layout/PageHeader.vue";
import AddTodoModal from "~/components/pages/AddTodoModal.vue";
import TodoRow from "~/components/pages/TodoRow.vue";
import { useCurrentWorkspace } from "~/composables/useCurrentWorkspace";
import { useTodoStore } from "~/composables/useTodoStore";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import { CURRENT_USER_ID } from "~/data/people";
import { threadPath } from "~/utils/paths";

const { workspace } = useCurrentWorkspace();
const { todosFor, toggleTodo } = useTodoStore();
const { getConversationById, conversationLabel } = useWorkspaceStore();

const tab = ref(0);
const isAddOpen = ref(false);
const isDoneOpen = ref(false);

const visibleTodos = computed(() => {
  if (!workspace.value) return [];
  const todos = todosFor(workspace.value.id);
  return tab.value === 0 ? todos.filter((todo) => todo.assigneeId === CURRENT_USER_ID) : todos;
});

// Soonest due first; todos without a due date go last.
const openTodos = computed(() =>
  visibleTodos.value
    .filter((todo) => !todo.done)
    .sort((a, b) => (a.due ?? "9999").localeCompare(b.due ?? "9999"))
);
// Most recently checked off first.
const doneTodos = computed(() =>
  visibleTodos.value
    .filter((todo) => todo.done)
    .sort((a, b) => (b.doneAt ?? "").localeCompare(a.doneAt ?? ""))
);

useHead({ title: "Todos" });

function openCount(mineOnly: boolean): number {
  if (!workspace.value) return 0;
  return todosFor(workspace.value.id).filter(
    (todo) => !todo.done && (!mineOnly || todo.assigneeId === CURRENT_USER_ID)
  ).length;
}

function sourceLabel(threadId?: string): string | undefined {
  const conversation = threadId ? getConversationById(threadId) : undefined;
  return conversation ? conversationLabel(conversation) : undefined;
}

function sourcePath(threadId?: string): string | undefined {
  const conversation = threadId ? getConversationById(threadId) : undefined;
  return conversation && workspace.value ? threadPath(workspace.value.id, conversation) : undefined;
}

const pageClass = css({ display: "flex", flexDirection: "column", flex: "1", minH: "0" });
</script>
