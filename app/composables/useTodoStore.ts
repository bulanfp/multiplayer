import { reactive } from "vue";
import { CURRENT_USER_ID } from "~/data/people";
import { SEED } from "~/data/seed";
import type { Todo } from "~/data/types";
import { createId } from "~/utils/ids";

const state = reactive({ items: structuredClone(SEED.todos) as Todo[] });

function todosFor(workspaceId: string): Todo[] {
  return state.items
    .filter((todo) => todo.workspaceId === workspaceId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function addTodo(todo: Omit<Todo, "id" | "done" | "createdAt">): Todo {
  const created: Todo = {
    ...todo,
    id: createId("todo"),
    done: false,
    createdAt: new Date().toISOString()
  };
  state.items.push(created);
  return created;
}

function toggleTodo(id: string): void {
  const todo = state.items.find((item) => item.id === id);
  if (!todo) return;
  todo.done = !todo.done;
  todo.doneBy = todo.done ? CURRENT_USER_ID : undefined;
  todo.doneAt = todo.done ? new Date().toISOString() : undefined;
}

export function useTodoStore() {
  return { todosFor, addTodo, toggleTodo };
}
