<template>
  <MpModal id="add-todo-modal" :is-open="isOpen" size="md" @close="handleClose">
    <MpModalContent>
      <MpModalHeader>
        Add a todo
        <MpModalCloseButton />
      </MpModalHeader>
      <MpModalBody>
        <form id="add-todo-form" @submit.prevent="submit">
          <MpFlex direction="column" gap="5">
            <MpFormControl id="todo-title" is-required :is-invalid="Boolean(titleError)">
              <MpFormLabel>Todo</MpFormLabel>
              <MpInput
                id="todo-title-input"
                v-model="title"
                placeholder="Review the launch checklist"
                @update:model-value="titleError = ''"
              />
              <MpFormErrorMessage>{{ titleError }}</MpFormErrorMessage>
            </MpFormControl>
            <MpFlex gap="4">
              <MpFormControl id="todo-assignee" :class="css({ flex: '1' })">
                <MpFormLabel>Assignee</MpFormLabel>
                <MpSelect id="todo-assignee-select" v-model="assigneeId">
                  <option
                    v-for="member in workspace.members"
                    :key="member.personId"
                    :value="member.personId"
                  >
                    {{ getPerson(member.personId)?.name
                    }}{{ member.personId === CURRENT_USER_ID ? " (you)" : "" }}
                  </option>
                </MpSelect>
              </MpFormControl>
              <MpFormControl id="todo-due" :class="css({ flex: '1' })">
                <MpFormLabel>Due</MpFormLabel>
                <MpSelect id="todo-due-select" v-model="dueInDays">
                  <option v-for="option in DUE_OPTIONS" :key="option.label" :value="option.days">
                    {{ option.label }}
                  </option>
                </MpSelect>
              </MpFormControl>
            </MpFlex>
          </MpFlex>
          <button type="submit" hidden />
        </form>
      </MpModalBody>
      <MpModalFooter>
        <MpButtonGroup>
          <MpButton variant="secondary" @click="handleClose">Cancel</MpButton>
          <MpButton @click="submit">Add todo</MpButton>
        </MpButtonGroup>
      </MpModalFooter>
    </MpModalContent>
    <MpModalOverlay />
  </MpModal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  css,
  toast,
  MpButton,
  MpButtonGroup,
  MpFlex,
  MpFormControl,
  MpFormErrorMessage,
  MpFormLabel,
  MpInput,
  MpModal,
  MpModalBody,
  MpModalCloseButton,
  MpModalContent,
  MpModalFooter,
  MpModalHeader,
  MpModalOverlay,
  MpSelect
} from "@mekari/pixel3";
import { useTodoStore } from "~/composables/useTodoStore";
import { daysFromNow } from "~/data/time";
import { CURRENT_USER_ID, getPerson } from "~/data/people";
import type { Workspace } from "~/data/types";

interface AddTodoModalProps {
  isOpen: boolean;
  workspace: Workspace;
}

const props = defineProps<AddTodoModalProps>();
const emit = defineEmits<{ close: [] }>();

const DUE_OPTIONS = [
  { label: "No due date", days: -1 },
  { label: "Today", days: 0 },
  { label: "Tomorrow", days: 1 },
  { label: "In 3 days", days: 3 },
  { label: "Next week", days: 7 }
];

const { addTodo } = useTodoStore();

const title = ref("");
const assigneeId = ref(CURRENT_USER_ID);
const dueInDays = ref(-1);
const titleError = ref("");

function handleClose() {
  title.value = "";
  assigneeId.value = CURRENT_USER_ID;
  dueInDays.value = -1;
  titleError.value = "";
  emit("close");
}

function submit() {
  if (!title.value.trim()) {
    titleError.value = "Describe what needs to happen.";
    return;
  }
  const days = Number(dueInDays.value);
  addTodo({
    workspaceId: props.workspace.id,
    title: title.value.trim(),
    assigneeId: assigneeId.value,
    createdBy: { kind: "person", id: CURRENT_USER_ID },
    due: days >= 0 ? daysFromNow(days) : undefined
  });
  toast.notify({ title: "Todo added", variant: "success" });
  handleClose();
}
</script>
