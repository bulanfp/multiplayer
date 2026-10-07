<template>
  <div ref="rootRef" :class="rootClass">
    <MpPopover
      :id="id"
      v-slot="{ isOpen, onClosePopover }"
      :placement="placement"
      is-adaptive-width
      is-close-on-select
      :is-keep-alive="false"
      @open="focusSelected"
    >
      <MpPopoverTrigger>
        <div :class="anchorClass">
          <button
            :id="id"
            ref="triggerRef"
            type="button"
            :class="triggerClass"
            :data-size="size"
            aria-haspopup="listbox"
            :aria-expanded="isOpen.value"
            :aria-controls="isOpen.value ? listboxId : undefined"
            :aria-label="`${label}: ${selected?.label ?? placeholder}`"
            @keydown="openWithArrows($event, isOpen.value)"
          >
            <MpText
              as="span"
              :size="size === 'sm' ? 'label-small' : 'label'"
              :color="selected ? 'text.default' : 'text.placeholder'"
              is-truncated
              :class="css({ flex: '1', minW: '0' })"
            >
              {{ selected?.label ?? placeholder }}
            </MpText>
            <MpIcon
              name="chevrons-down"
              size="sm"
              color="icon.default"
              :class="css({ flexShrink: '0' })"
            />
          </button>
        </div>
      </MpPopoverTrigger>

      <!-- Not portaled, so the list stays inside a modal's focus trap -->
      <MpPopoverContent :class="contentClass">
        <MpPopoverList
          :id="listboxId"
          role="listbox"
          :aria-label="label"
          :class="listClass"
          @keydown="onListKeydown($event, onClosePopover)"
        >
          <MpPopoverListItem
            v-for="option in options"
            :key="option.value"
            role="option"
            type="button"
            tabindex="-1"
            :aria-selected="option.value === model"
            :is-active="option.value === model"
            :class="optionClass"
            @click="select(option.value)"
          >
            <span :class="optionRowClass">
              <span :class="optionTextClass">
                <MpText as="span" :weight="hasDescriptions ? 'semiBold' : 'regular'">
                  {{ option.label }}
                </MpText>
                <MpText
                  v-if="option.description"
                  as="span"
                  size="label-small"
                  color="text.secondary"
                >
                  {{ option.description }}
                </MpText>
              </span>
              <MpIcon
                v-if="option.value === model"
                name="check"
                size="sm"
                color="icon.brand"
                :class="css({ flexShrink: '0' })"
              />
            </span>
          </MpPopoverListItem>
        </MpPopoverList>
      </MpPopoverContent>
    </MpPopover>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number">
import { computed, nextTick, ref } from "vue";
import {
  css,
  MpIcon,
  MpPopover,
  MpPopoverContent,
  MpPopoverList,
  MpPopoverListItem,
  MpPopoverTrigger,
  MpText
} from "@mekari/pixel3";

interface SelectPopoverProps {
  /** Id of the field; the popover and list ids derive from it */
  id: string;
  /** What the field picks, read out with the current choice, e.g. "Version" */
  label: string;
  /** Choices; the description is a second, quieter line under the label */
  options: { value: T; label: string; description?: string }[];
  /** Shown when no option matches the value */
  placeholder?: string;
  /** Same heights as Pixel's MpSelect: sm 30px, md 38px */
  size?: "sm" | "md";
  /** Which edge of the field the list lines up with */
  placement?: "bottom-start" | "bottom-end";
}

const props = withDefaults(defineProps<SelectPopoverProps>(), {
  placeholder: "Select",
  size: "md",
  placement: "bottom-start"
});

const model = defineModel<T>({ required: true });

const rootRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);

const listboxId = computed(() => `${props.id}-listbox`);
const selected = computed(() => props.options.find((option) => option.value === model.value));
const hasDescriptions = computed(() => props.options.some((option) => option.description));

function optionElements(): HTMLElement[] {
  return Array.from(rootRef.value?.querySelectorAll<HTMLElement>('[role="option"]') ?? []);
}

/** Opening moves focus to the chosen option, as a native select does. */
async function focusSelected() {
  await nextTick();
  const options = optionElements();
  const current = options.find((option) => option.getAttribute("aria-selected") === "true");
  const target = current ?? options[0];
  // preventScroll keeps the page still; the list itself still scrolls to the option.
  target?.focus({ preventScroll: true });
  target?.scrollIntoView({ block: "nearest" });
}

/** ↓ and ↑ on the field open the list too. */
function openWithArrows(event: KeyboardEvent, isOpen: boolean) {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
  event.preventDefault();
  if (isOpen) focusSelected();
  else triggerRef.value?.click();
}

// Arrows, Home and End move between options. Escape and Tab close the list and hand focus
// back to the field, so Tab carries on to whatever comes after it.
function onListKeydown(event: KeyboardEvent, close: () => void) {
  const options = optionElements();
  const index = options.indexOf(document.activeElement as HTMLElement);
  const last = options.length - 1;
  const moves: Record<string, number> = {
    ArrowDown: Math.min(index + 1, last),
    ArrowUp: Math.max(index - 1, 0),
    Home: 0,
    End: last
  };
  const next = moves[event.key];
  if (next !== undefined) {
    event.preventDefault();
    options[next]?.focus();
    return;
  }
  if (event.key === "Escape") {
    // Handled here so a modal underneath doesn't close with it.
    event.preventDefault();
    event.stopPropagation();
  } else if (event.key !== "Tab") {
    return;
  }
  triggerRef.value?.focus();
  close();
}

// The popover closes itself on select (is-close-on-select); focus goes back to the field.
function select(value: T) {
  model.value = value;
  triggerRef.value?.focus();
}

// Positioned so the list's min-width (is-adaptive-width sets 100%) is the field's width.
const rootClass = css({ position: "relative", display: "inline-flex", minW: "0", maxW: "full" });

// MpPopoverTrigger puts Pixel's id and toggle on this wrapper, so the button keeps `id`.
const anchorClass = css({ display: "flex", flex: "1", minW: "0" });

// Pixel's MpSelect field: same heights, border, fill and focus ring. The ring stays on
// while the list is open.
const triggerClass = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  flex: "1",
  minW: "0",
  h: "38px",
  px: "3",
  bg: "background.neutral",
  borderWidth: "1px",
  borderColor: "border.form",
  rounded: "md",
  outline: "none",
  textAlign: "left",
  cursor: "pointer",
  transition: "background-color .15s, border-color .15s, box-shadow .15s",
  _hover: { bg: "background.neutral.hovered" },
  _focus: { borderColor: "border.focused", boxShadow: "focus" },
  "&[aria-expanded=true]": { borderColor: "border.focused", boxShadow: "focus" },
  "&[data-size=sm]": { h: "30px", rounded: "sm" },
  _motionReduce: { transition: "none" }
});

// Long lists scroll inside the popover, as in Pixel's autocomplete.
const contentClass = css({ maxH: "300px", overflowY: "auto" });

// Pixel's list pads 12px above and 8px below; 4px keeps the menu compact.
const listClass = css({ py: "1" });

// Pixel's list items drop the outline; keyboard focus gets an inset ring instead.
const optionClass = css({
  _focusVisible: { outline: "2px solid", outlineColor: "border.focused", outlineOffset: "-2px" }
});

const optionRowClass = css({ display: "flex", alignItems: "center", gap: "3", w: "full" });

const optionTextClass = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.5",
  flex: "1",
  minW: "0"
});
</script>
